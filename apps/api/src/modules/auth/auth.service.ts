import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { AuthDto } from './dto/register.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { AVATAR_UPLOAD_DIR } from '../../common/multer/constants';
import { randomUUID, randomBytes, createHash } from 'crypto';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from '../email/email.service';
import { normalizeMongolianPhone } from '../../common/utils/phone';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private emailService: EmailService,
  ) {}

  /**
   * Try to send a transactional email but never surface a failure to the
   * caller. Auth flows (register, forgot-password, resend) treat email as
   * best-effort: the user must be able to complete the action even if
   * SMTP is down.
   */
  private async sendBestEffort(
    label: string,
    fn: () => Promise<void>,
  ): Promise<void> {
    try {
      await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      this.logger.error(`[${label}] email send failed: ${msg}`);
    }
  }

  /** Sign the standard Tusch access token used by all auth flows. */
  private signAccessToken(user: {
    id: string;
    email: string | null;
    adminRole: string;
  }) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email ?? undefined,
      adminRole: user.adminRole,
    });
  }

  private buildEmailVerificationToken() {
    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return { rawToken, hashedToken, expiration };
  }

  async register(dto: AuthDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const { rawToken, hashedToken, expiration } =
      this.buildEmailVerificationToken();
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        accountType: dto.accountType,
        emailVerified: false,
        emailVerifyToken: hashedToken,
        emailVerifyTokenExp: expiration,
        acceptedTermsAt: new Date(),
      },
    });

    await this.sendBestEffort('register/verify-email', () =>
      this.emailService.sendEmailVerification(
        user.email!,
        rawToken,
        user.firstName,
      ),
    );

    const response: { token?: string } = {};
    if (process.env.NODE_ENV !== 'production') {
      response.token = rawToken;
    }

    return { ...this.sanitizeUser(user), ...response };
  }

  async login(body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');
    if (user.deletedAt) {
      throw new UnauthorizedException('Бүртгэл устгагдсан байна');
    }

    const passwordValid = await bcrypt.compare(body.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      adminRole: user.adminRole,
    });

    return {
      ...this.sanitizeUser(user),
      accessToken,
    };
  }

  async oauthLogin(body: OAuthLoginDto) {
    const placeholderPassword = await bcrypt.hash(randomUUID(), 10);

    const user = await this.prisma.user.upsert({
      where: { email: body.email },
      update: {
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        avatarUrl: body.avatarUrl,
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
      create: {
        email: body.email,
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        avatarUrl: body.avatarUrl,
        password: placeholderPassword,
        // phone is now optional + UNIQUE; writing '' here would collide on
        // the second OAuth signup (every user would share phone='').
        phone: null,
        accountType: 'client',
        emailVerified: true,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      adminRole: user.adminRole,
    });

    return {
      ...this.sanitizeUser(user),
      accessToken,
    };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string | null;
      accountType?: string;
      email?: string;
    },
    previousAvatarUrl?: string | null,
  ) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    if (previousAvatarUrl?.startsWith('/uploads/avatars/')) {
      const name = previousAvatarUrl.split('/').pop();
      if (name) {
        unlink(join(AVATAR_UPLOAD_DIR, name)).catch(() => undefined);
      }
    }

    return this.sanitizeUser(updated);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return this.sanitizeUser(updated);
  }

  async deleteUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });

    const result = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (user?.avatarUrl?.startsWith('/uploads/avatars/')) {
      const name = user.avatarUrl.split('/').pop();
      if (name) {
        unlink(join(AVATAR_UPLOAD_DIR, name)).catch(() => undefined);
      }
    }

    return result;
  }

  async deleteProfileAvatar(userId: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });
    return this.sanitizeUser(updated);
  }

  async forgotPassword(email: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // If user doesn't exist, just return success without doing anything
    if (!user) {
      return { success: true };
    }

    // Generate cryptographically secure random token (64 hex characters)
    const rawToken = randomBytes(32).toString('hex');

    // Hash token with SHA-256 before storing (never store raw token)
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');

    // Set expiration to 1 hour from now
    const expiration = new Date(Date.now() + 60 * 60 * 1000);

    // Update user with hashed token and expiration
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExp: expiration,
      },
    });

    await this.sendBestEffort('forgot-password', () =>
      this.emailService.sendPasswordReset(
        user.email!,
        rawToken,
        user.firstName,
      ),
    );

    // The dev-only raw token in the response stays for local testing,
    // but production never sees it.
    const response: { success: boolean; token?: string } = { success: true };
    if (process.env.NODE_ENV !== 'production') {
      response.token = rawToken;
    }

    return response;
  }

  async resetPassword(token: string, newPassword: string) {
    // Hash the incoming token to match against database
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // Find user with matching token that hasn't expired
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExp: {
          gt: new Date(), // Token expiration must be greater than now
        },
      },
    });

    // If no user found or token expired, throw error
    if (!user) {
      throw new UnauthorizedException('Токен буруу эсвэл хугацаа дууссан');
    }

    // Hash the new password with bcrypt (10 salt rounds, same as registration)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user: set new password and clear reset token fields
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return this.sanitizeUser(updated);
  }

  async verifyEmail(rawToken: string) {
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: hashedToken,
        emailVerifyTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Токен хүчингүй эсвэл хугацаа дууссан байна',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
    });

    return { message: 'Имэйл амжилттай баталгаажлаа' };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!user.email) {
      throw new BadRequestException('Имэйл хаяг бүртгэгдээгүй байна');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Имэйл аль хэдийн баталгаажсан байна');
    }

    const { rawToken, hashedToken, expiration } =
      this.buildEmailVerificationToken();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: hashedToken,
        emailVerifyTokenExp: expiration,
      },
    });

    await this.sendBestEffort('resend-verification', () =>
      this.emailService.sendEmailVerification(
        user.email!,
        rawToken,
        user.firstName,
      ),
    );

    const response: { message: string; token?: string } = {
      message: 'Баталгаажуулах холбоос дахин илгээгдлээ',
    };
    if (process.env.NODE_ENV !== 'production') {
      response.token = rawToken;
    }
    return response;
  }

  /**
   * Log in (or auto-register on first sight) a user via a Firebase phone
   * ID token. Returns the same shape as `login()`/`oauthLogin()` so the
   * controller can drop it into the `accessToken` cookie identically.
   */
  async loginOrRegisterWithPhone(body: { idToken: string; phone: string }) {
    if (!this.firebaseService.isEnabled()) {
      throw new ServiceUnavailableException('Phone auth is not configured');
    }

    const normalized = normalizeMongolianPhone(body.phone);
    if (!normalized) {
      throw new BadRequestException('Invalid phone number');
    }

    const decoded = await this.firebaseService.verifyIdToken(body.idToken);
    if (!decoded) {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }

    if (decoded.phone_number !== normalized) {
      throw new BadRequestException(
        'Phone number does not match the Firebase token',
      );
    }

    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });
    let created = false;

    if (!user) {
      const byPhone = await this.prisma.user.findUnique({
        where: { phone: normalized },
      });

      if (byPhone) {
        // Phone is known but never had a firebaseUid attached (e.g. legacy
        // user that registered with phone via the old email/password path).
        // Link it on first phone login.
        user = await this.prisma.user.update({
          where: { id: byPhone.id },
          data: {
            firebaseUid: decoded.uid,
            phoneVerified: true,
            phoneVerifiedAt: new Date(),
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            phone: normalized,
            phoneVerified: true,
            phoneVerifiedAt: new Date(),
            firebaseUid: decoded.uid,
            firstName: '',
            lastName: '',
            accountType: 'client',
          },
        });
        created = true;
      }
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Бүртгэл устгагдсан байна');
    }

    const accessToken = await this.signAccessToken(user);

    return {
      ...this.sanitizeUser(user),
      accessToken,
      created,
    };
  }

  /**
   * Attach a Firebase-verified phone to the user identified by `userId`.
   * Caller (controller) is responsible for proving the userId via JWT —
   * this method does NOT trust any phone-derived identity.
   */
  async linkPhoneToExistingUser(
    userId: string,
    body: { idToken: string; phone: string },
  ) {
    if (!this.firebaseService.isEnabled()) {
      throw new ServiceUnavailableException('Phone auth is not configured');
    }

    const normalized = normalizeMongolianPhone(body.phone);
    if (!normalized) {
      throw new BadRequestException('Invalid phone number');
    }

    const decoded = await this.firebaseService.verifyIdToken(body.idToken);
    if (!decoded) {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }

    if (decoded.phone_number !== normalized) {
      throw new BadRequestException(
        'Phone number does not match the Firebase token',
      );
    }

    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me) {
      throw new UnauthorizedException('Unauthorized');
    }

    const collision = await this.prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [{ phone: normalized }, { firebaseUid: decoded.uid }],
          },
        ],
      },
      select: { id: true },
    });
    if (collision) {
      throw new ConflictException(
        'Phone or Firebase identity is already linked to another account',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: normalized,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        firebaseUid: decoded.uid,
      },
    });

    return this.sanitizeUser(updated);
  }

  /**
   * Remove the phone factor from the user identified by `userId`. Refuses
   * if the user would be left with no way to authenticate.
   */
  async unlinkPhoneFromUser(
    userId: string,
    body: { password?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasEmailPassword = !!user.email && !!user.password;
    if (!hasEmailPassword) {
      throw new BadRequestException(
        'Cannot unlink phone — it is the only auth method on this account',
      );
    }

    if (body.password) {
      const ok = await bcrypt.compare(body.password, user.password!);
      if (!ok) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    const previousUid = user.firebaseUid;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: null,
        phoneVerified: false,
        phoneVerifiedAt: null,
        firebaseUid: null,
      },
    });

    if (previousUid) {
      // Fire-and-forget — Firebase failures should not break the API call.
      void this.firebaseService.deleteFirebaseUser(previousUid);
    }

    return { success: true };
  }

  sanitizeUser(user: any) {
    const {
      password: _password,
      resetToken: _resetToken,
      resetTokenExp: _resetTokenExp,
      emailVerifyToken: _emailVerifyToken,
      emailVerifyTokenExp: _emailVerifyTokenExp,
      firebaseUid: _firebaseUid,
      ...rest
    } = user;
    void _password;
    void _resetToken;
    void _resetTokenExp;
    void _emailVerifyToken;
    void _emailVerifyTokenExp;
    void _firebaseUid;
    return rest;
  }
}

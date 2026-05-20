import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKeyRaw = this.config.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKeyRaw) {
      this.logger.log(
        'Firebase credentials not set — phone auth is disabled.',
      );
      return;
    }

    // Private keys copied from a JSON file (or set in CI as a single env
    // var) contain literal "\n" sequences instead of real newlines.
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    try {
      this.app =
        admin.apps.find((a) => a?.name === 'tusch') ??
        admin.initializeApp(
          {
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          },
          'tusch',
        );
      this.logger.log('Firebase Admin initialized.');
    } catch (err) {
      this.logger.error('Firebase Admin failed to initialize', err as Error);
      this.app = null;
    }
  }

  isEnabled(): boolean {
    return this.app !== null;
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken | null> {
    if (!this.app) return null;
    try {
      return await this.app.auth().verifyIdToken(idToken);
    } catch (err) {
      this.logger.warn(
        `verifyIdToken failed: ${(err as Error).message ?? 'unknown error'}`,
      );
      return null;
    }
  }

  async getUserByPhone(phone: string): Promise<UserRecord | null> {
    if (!this.app) return null;
    try {
      return await this.app.auth().getUserByPhoneNumber(phone);
    } catch {
      return null;
    }
  }

  async deleteFirebaseUser(uid: string): Promise<void> {
    if (!this.app) return;
    try {
      await this.app.auth().deleteUser(uid);
    } catch (err) {
      this.logger.warn(
        `deleteFirebaseUser(${uid}) failed: ${(err as Error).message ?? 'unknown error'}`,
      );
    }
  }
}

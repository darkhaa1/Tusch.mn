import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * Partial patch for User.emailNotifications. Every key is optional;
 * unknown keys are dropped by the merge helper in @repo/shared.
 */
export class UpdateEmailPreferencesDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() newMessage?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() newOffer?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() offerAccepted?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() offerRejected?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() offerCompleted?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() newReview?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() listingFlagged?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() weeklyDigest?: boolean;
}

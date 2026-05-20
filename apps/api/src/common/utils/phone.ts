// Re-export the shared MN phone utilities so both apps consume the same
// source of truth. See packages/shared/src/phone.ts.
export {
  formatMongolianPhoneDisplay,
  isValidMongolianPhone,
  maskMongolianPhone,
  normalizeMongolianPhone,
} from '@repo/shared';

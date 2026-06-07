/**
 * Secure projection utilities for API endpoints.
 * Ensures PII (Personally Identifiable Information) and sensitive internal data
 * never reach the client in list APIs.
 */

// Define the fields that are allowed to be sent to the client in lists.
export const ALLOWED_USER_FIELDS = [
  '_id', 'fullName', 'mobile', 'email', 'role', 'status', 
  'district', 'block', 'village', 'designation', 'createdAt', 
  'paymentCompleted', 'subscriptionPaid', 'depositPaid', 'verificationStatus',
  'vendorCode', 'subVendorCode', 'employeeId', 'vendorType',
  'parentVendorId', 'profileImage', 'assignmentStatus', 'documents'
];

/**
 * Sanitizes a user document or list of user documents to prevent PII leakage.
 * Modifies the documents to strip URLs but adds `hasUrl` boolean.
 * Drops completely: aadhaarNumber, panNumber, bankDetails, password, otp, etc.
 */
export function sanitizeUserListForClient(users: any[], includePII = false) {
  if (!Array.isArray(users)) return [];

  return users.map(user => {
    // Clone to avoid mutating original mongoose documents if they are lean, but we assume they are JS objects here
    const sanitized: any = {};
    
    const fieldsToKeep = includePII 
      ? [...ALLOWED_USER_FIELDS, 'aadhaarNumber', 'panNumber', 'bankDetails']
      : ALLOWED_USER_FIELDS;

    // Copy only allowed fields
    fieldsToKeep.forEach(field => {
      if (user[field] !== undefined) {
        sanitized[field] = user[field];
      }
    });

    // Special handling for documents to keep status but remove URLs if includePII is false
    if (sanitized.documents && typeof sanitized.documents === 'object') {
      const secureDocs: any = {};
      
      for (const [docKey, docValue] of Object.entries(sanitized.documents)) {
        if (docValue && typeof docValue === 'object') {
          const v = docValue as any;
          if (includePII) {
            secureDocs[docKey] = v;
          } else {
            secureDocs[docKey] = {
              hasUrl: !!v.url, // Keep the boolean presence flag
              status: v.status,
              rejectionReason: v.rejectionReason,
              isLocked: v.isLocked,
              exceptionRequested: v.exceptionRequested,
              exceptionReason: v.exceptionReason
            };
            // Explicitly NOT copying `url` or `key`
          }
        }
      }
      sanitized.documents = secureDocs;
    }

    // Include other non-sensitive aggregated fields if they exist
    if (user.vendorAgreementDetails) sanitized.vendorAgreementDetails = user.vendorAgreementDetails;
    if (user.offerLetterDetails) sanitized.offerLetterDetails = user.offerLetterDetails;

    return sanitized;
  });
}

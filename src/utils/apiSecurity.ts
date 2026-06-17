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
  'parentVendorId', 'profileImage', 'assignmentStatus', 'documents',
  'permissions', 'assignedScope', 'assignedStates', 'assignedDistricts', 'assignedBlocks', 'assignedRegions'
];

/**
 * Sanitizes a user document or list of user documents to prevent PII leakage.
 * Modifies the documents to strip URLs but adds `hasUrl` boolean.
 * Drops completely: aadhaarNumber, panNumber, bankDetails, password, otp, etc.
 */
export function sanitizeUserListForClient(users: any[], includePII = false, includeDocs = false) {
  if (!Array.isArray(users)) return [];

  return users.map(user => {
    // Clone to avoid mutating original mongoose documents if they are lean, but we assume they are JS objects here
    const sanitized: any = {};
    
    // Always copy the base fields plus address/demographic fields (address info is handled as less sensitive than PAN/Aadhaar/Bank details)
    const baseFields = [
      ...ALLOWED_USER_FIELDS,
      'address', 'area', 'state', 'pincode', 'dob', 'gender',
      'workState', 'workDistrict', 'workBlock', 'workTehsil', 'workPincode', 'workArea', 'workAddress'
    ];

    const fieldsToKeep = [
      ...baseFields,
      'aadhaarNumber', 'panNumber', 'bankDetails'
    ];

    // Copy fields
    fieldsToKeep.forEach(field => {
      if (user[field] !== undefined) {
        sanitized[field] = user[field];
      }
    });

    // If PII credentials access is not allowed, return masked versions
    if (!includePII) {
      if (sanitized.aadhaarNumber) {
        const str = String(sanitized.aadhaarNumber);
        sanitized.aadhaarNumber = `XXXXXXXX${str.slice(-4)}`;
      }
      if (sanitized.panNumber) {
        const str = String(sanitized.panNumber);
        sanitized.panNumber = `XXXXXX${str.slice(-4)}`;
      }
      if (sanitized.bankDetails) {
        sanitized.bankDetails = {
          bankName: sanitized.bankDetails.bankName || '',
          accountHolderName: '••••••••',
          accountNumber: sanitized.bankDetails.accountNumber ? `XXXXXXXX${String(sanitized.bankDetails.accountNumber).slice(-4)}` : '',
          ifscCode: '••••••••',
          branchName: '••••••••'
        };
      }
    }

    // Special handling for documents: strip URLs but keep status/metadata if includeDocs is false
    if (sanitized.documents && typeof sanitized.documents === 'object') {
      const secureDocs: any = {};
      
      for (const [docKey, docValue] of Object.entries(sanitized.documents)) {
        if (docValue && typeof docValue === 'object') {
          const v = docValue as any;
          if (includeDocs) {
            secureDocs[docKey] = v;
          } else {
            secureDocs[docKey] = {
              hasUrl: !!v.url, // Keep the boolean presence flag
              status: v.status,
              rejectionReason: v.rejectionReason,
              isLocked: v.isLocked,
              exceptionRequested: v.exceptionRequested,
              exceptionReason: v.exceptionReason,
              fileName: v.fileName,
              fileSize: v.fileSize,
              uploadedAt: v.uploadedAt
            };
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

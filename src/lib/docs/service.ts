/**
 * Shared Backend Document Service
 * Handles folder generation, required docs logic, and status synchronization.
 */

export const REQUIRED_DOCS_BY_ROLE: Record<string, string[]> = {
  vendor: ['ngoCertificate', 'panCard', 'aadhaarCard', 'bankPassbook'],
  sub_vendor: ['panCard', 'aadhaarCard', 'bankPassbook'],
  employee: ['panCard', 'aadhaarCardFront', 'aadhaarCardBack', 'bankPassbook', 'resume', 'passportPhoto']
};

export const REQUIRED_DOCS_BY_VENDOR_TYPE: Record<string, string[]> = {
  individual: ['aadhaarCard', 'panCard', 'passportPhoto', 'bankPassbook'],
  company: ['companyRegCertificate', 'gstCertificate', 'companyPanCard', 'directorAadhaarCard', 'directorPanCard', 'bankPassbook', 'companyLogo'],
  ngo_trust: ['ngoCertificate', 'ngoPanCard', 'aadhaarCard', 'panCard', 'bankPassbook', 'ngoLogo']
};

export function getRequiredDocs(role: string, vendorType?: string, designation?: string): string[] {
  if (role === 'vendor' || role === 'sub_vendor') {
    const type = vendorType || 'individual';
    return REQUIRED_DOCS_BY_VENDOR_TYPE[type] || REQUIRED_DOCS_BY_VENDOR_TYPE.individual;
  }
  
  let docs = [...(REQUIRED_DOCS_BY_ROLE[role] || [])];
  
  if (role === 'employee' && designation) {
    if (designation === 'Block Employee') {
      docs.push('certificate12th');
    } else if (designation === 'District Coordinator') {
      docs.push('graduationCertificate');
    }
  }
  
  return docs;
}

/**
 * Get required documents dynamically adjusting for legacy single aadhaarCard upload compatibility.
 */
export function getRequiredDocsForUser(role: string, userDocuments: any, vendorType?: string, designation?: string): string[] {
  let docs = getRequiredDocs(role, vendorType, designation);
  
  const aadhaarKeysToSplit = ['aadhaarCard', 'directorAadhaarCard'];
  
  aadhaarKeysToSplit.forEach(aadhaarKey => {
    const frontKey = `${aadhaarKey}Front`;
    const backKey = `${aadhaarKey}Back`;
    
    const hasAadhaarInDocs = docs.includes(aadhaarKey);
    const hasAadhaarFrontInDocs = docs.includes(frontKey) || docs.includes(backKey);
    
    if (hasAadhaarInDocs || hasAadhaarFrontInDocs) {
      const hasSingleAadhaarUploaded = !!(userDocuments?.[aadhaarKey]?.url);
      if (hasSingleAadhaarUploaded) {
        // Keep single Aadhaar, filter out front and back
        docs = docs.filter(d => d !== frontKey && d !== backKey);
        if (!docs.includes(aadhaarKey)) {
          const companionIndex = docs.indexOf('panCard') !== -1 ? docs.indexOf('panCard') : docs.indexOf('companyPanCard');
          if (companionIndex !== -1) {
            docs.splice(companionIndex + 1, 0, aadhaarKey);
          } else {
            docs.push(aadhaarKey);
          }
        }
      } else {
        // Use front and back, filter out single
        docs = docs.filter(d => d !== aadhaarKey);
        if (!docs.includes(frontKey)) {
          const companionIndex = docs.indexOf('panCard') !== -1 ? docs.indexOf('panCard') : docs.indexOf('companyPanCard');
          if (companionIndex !== -1) {
            docs.splice(companionIndex + 1, 0, frontKey, backKey);
          } else {
            docs.push(frontKey, backKey);
          }
        }
      }
    }
  });
  
  return docs;
}

/**
 * Generates the Cloudinary folder path for a user
 */
export function getDocumentFolderPath(user: any): string {
  if (!user) return 'sakhihub/misc';
  
  // Safe role name mapping
  let role = 'user';
  if (user.role === 'vendor') role = 'vendor';
  else if (user.role === 'sub_vendor') role = 'sub-vendor';
  else if (user.role === 'employee') role = 'employee';
  
  // Safe identifier extraction
  let emailStr = '';
  if (typeof user.email === 'string') emailStr = user.email;
  
  let idStr = '';
  if (user._id && typeof user._id.toString === 'function') idStr = user._id.toString();
  else if (typeof user.id === 'string') idStr = user.id;

  const identifier = emailStr ? emailStr.replace(/[@.]/g, '_') : (idStr || 'unknown_user');
  
  // Structure: sakhihub / role / identifier / documents
  return `sakhihub/${role}/${identifier}/documents`;
}

/**
 * Checks if all required documents for a role are approved
 */
export function areAllDocsApproved(user: any): boolean {
  const required = getRequiredDocsForUser(user.role, user.documents, user.vendorType, user.designation);
  if (required.length === 0) return false;
  return required.every(type => user.documents?.[type]?.status === 'approved' || user.documents?.[type]?.status === 'exception_approved');
}

/**
 * Determines the overall user status based on individual document statuses
 */
export function determineUserStatus(user: any): string {
  const required = getRequiredDocsForUser(user.role, user.documents, user.vendorType, user.designation);
  if (!user.documents) return user.status;

  const statuses = required.map(t => user.documents?.[t]?.status);
  
  const hasRejected = statuses.includes('rejected');
  const hasReupload = statuses.includes('reupload_required');
  const allApproved = areAllDocsApproved(user);
  
  if (allApproved) return 'approved'; 
  if (hasRejected || hasReupload) return 'reupload_required';
  
  const allUploaded = required.every(t => user.documents?.[t]?.url || ['exception_requested', 'exception_responded', 'exception_approved', 'on_hold'].includes(user.documents?.[t]?.status));
  if (allUploaded) return 'documents_uploaded';
  
  return user.status; 
}

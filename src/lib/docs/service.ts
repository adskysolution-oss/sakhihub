/**
 * Shared Backend Document Service
 * Handles folder generation, required docs logic, and status synchronization.
 */

export const REQUIRED_DOCS_BY_ROLE: Record<string, string[]> = {
  vendor: ['ngoCertificate', 'panCard', 'aadhaarCard', 'bankPassbook'],
  sub_vendor: ['panCard', 'aadhaarCard', 'bankPassbook'],
  employee: ['panCard', 'aadhaarCard', 'bankPassbook']
};

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
  const required = REQUIRED_DOCS_BY_ROLE[user.role] || [];
  if (required.length === 0) return false;
  
  return required.every(type => user.documents?.[type]?.status === 'approved');
}

/**
 * Determines the overall user status based on individual document statuses
 */
export function determineUserStatus(user: any): string {
  const required = REQUIRED_DOCS_BY_ROLE[user.role] || [];
  if (!user.documents) return user.status;

  const statuses = required.map(t => user.documents?.[t]?.status);
  
  const hasRejected = statuses.includes('rejected');
  const hasReupload = statuses.includes('reupload_required');
  const allApproved = areAllDocsApproved(user);
  
  if (allApproved) return 'approved'; 
  if (hasRejected || hasReupload) return 'reupload_required';
  
  const allUploaded = required.every(t => user.documents?.[t]?.url);
  if (allUploaded) return 'documents_uploaded';
  
  return user.status; 
}

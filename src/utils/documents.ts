import { 
  FileCheck, CreditCard, UserCheck, Landmark,
  FileText, Clock, ShieldCheck, AlertCircle, MessageSquare
} from 'lucide-react';

/**
 * Required documents based on user role
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
 * Document labels and icons mapping
 */
export const DOC_CONFIG: Record<string, { label: string; icon: any; desc: string }> = {
  ngoCertificate: { 
    label: 'NGO Registration Certificate', 
    icon: FileCheck, 
    desc: 'Registration certificate issued by government' 
  },
  panCard: { 
    label: 'PAN Card', 
    icon: CreditCard, 
    desc: 'Organizational or Proprietor PAN card' 
  },
  aadhaarCard: { 
    label: 'Aadhaar Card', 
    icon: UserCheck, 
    desc: 'Aadhaar card of the authorized person' 
  },
  aadhaarCardFront: { 
    label: 'Aadhaar Card (Front)', 
    icon: UserCheck, 
    desc: 'Front side of Aadhaar card' 
  },
  aadhaarCardBack: { 
    label: 'Aadhaar Card (Back)', 
    icon: UserCheck, 
    desc: 'Back side of Aadhaar card' 
  },
  bankPassbook: { 
    label: 'Bank Document', 
    icon: Landmark, 
    desc: 'Cancelled cheque or first page of passbook' 
  },
  passportPhoto: {
    label: 'Passport Size Photo',
    icon: UserCheck,
    desc: 'Recent passport size photograph'
  },
  companyRegCertificate: {
    label: 'Company Registration Certificate',
    icon: FileCheck,
    desc: 'Incorporation certificate or MSME registration'
  },
  gstCertificate: {
    label: 'GST Certificate',
    icon: FileCheck,
    desc: 'GSTIN registration document'
  },
  companyPanCard: {
    label: 'Company PAN Card',
    icon: CreditCard,
    desc: 'Permanent Account Number of the business'
  },
  directorAadhaarCard: { 
    label: 'Director Aadhaar Card', 
    icon: UserCheck, 
    desc: 'Aadhaar card of the managing director' 
  },
  directorAadhaarCardFront: { 
    label: 'Director Aadhaar Card (Front)', 
    icon: UserCheck, 
    desc: 'Front side of Director Aadhaar card' 
  },
  directorAadhaarCardBack: { 
    label: 'Director Aadhaar Card (Back)', 
    icon: UserCheck, 
    desc: 'Back side of Director Aadhaar card' 
  },
  directorPanCard: {
    label: 'Director PAN Card',
    icon: CreditCard,
    desc: 'PAN card of the managing director'
  },
  companyLogo: {
    label: 'Company Logo',
    icon: FileText,
    desc: 'Official logo image of the company'
  },
  ngoPanCard: {
    label: 'NGO PAN Card',
    icon: CreditCard,
    desc: 'Permanent Account Number of the NGO/Trust'
  },
  certificate12A: {
    label: '12A Certificate (Optional)',
    icon: FileCheck,
    desc: '12A registration certificate for tax exemption'
  },
  certificate80G: {
    label: '80G Certificate (Optional)',
    icon: FileCheck,
    desc: '80G registration certificate for donor deduction'
  },
  ngoLogo: {
    label: 'NGO Logo',
    icon: FileText,
    desc: 'Official logo image of the NGO/Trust'
  },
  resume: {
    label: 'Resume Upload',
    icon: FileText,
    desc: 'Updated resume or curriculum vitae'
  },
  certificate12th: {
    label: '12th Pass Certificate',
    icon: FileCheck,
    desc: 'Highest secondary education certificate'
  },
  graduationCertificate: {
    label: 'Graduation Certificate',
    icon: FileCheck,
    desc: 'Degree or provisional graduation certificate'
  }
};

/**
 * Status mapping for document statuses
 */
export const DOCUMENT_STATUS_MAP: Record<string, { label: string; className: string; icon: any }> = {
  approved: { label: 'Approved', className: 'bg-green-100 text-green-600', icon: ShieldCheck },
  exception_approved: { label: 'Exception Approved', className: 'bg-green-100 text-green-600', icon: ShieldCheck },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-600', icon: AlertCircle },
  reupload_required: { label: 'Re-upload Required', className: 'bg-red-100 text-red-600', icon: AlertCircle },
  under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-600', icon: Clock },
  documents_uploaded: { label: 'Submitted', className: 'bg-primary/10 text-primary', icon: FileText },
  uploaded: { label: 'Uploaded', className: 'bg-primary/10 text-primary', icon: FileText },
  exception_requested: { label: 'Exception Requested', className: 'bg-amber-100 text-amber-600', icon: AlertCircle },
  exception_responded: { label: 'Exception Reply Sent', className: 'bg-blue-100 text-blue-600', icon: MessageSquare },
  on_hold: { label: 'On Hold', className: 'bg-amber-100 text-amber-600', icon: Clock },
  pending: { label: 'Pending Upload', className: 'bg-gray-100 text-gray-400', icon: Clock }
};

/**
 * Returns the unified Document Viewer URL for viewing PDFs and Images securely.
 */
export function getDocumentViewUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '') return '';
  return `/document-viewer?url=${encodeURIComponent(url)}`;
}

/**
 * Check if a document entry has valid uploaded file data.
 */
export function isDocumentUploaded(docInfo: any): boolean {
  return !!(docInfo && typeof docInfo.url === 'string' && docInfo.url.trim() !== '');
}

/**
 * Format file size in MB
 */
export function formatFileSize(size?: string | number): string {
  if (!size) return 'Unknown size';
  if (typeof size === 'number') return (size / (1024 * 1024)).toFixed(2) + ' MB';
  return size;
}

/**
 * Get compliance summary for a user's documents
 */
export function getDocComplianceSummary(userDocuments: any, role: string, vendorType?: string, designation?: string) {
  const required = getRequiredDocsForUser(role, userDocuments, vendorType, designation);
  let uploaded = 0;
  let approved = 0;
  let rejected = 0;

  required.forEach(type => {
    const doc = userDocuments?.[type];
    if (isDocumentUploaded(doc)) uploaded++;
    if (doc?.status === 'approved' || doc?.status === 'exception_approved') approved++;
    if (doc?.status === 'rejected' || doc?.status === 'reupload_required') rejected++;
  });

  return {
    total: required.length,
    uploaded,
    approved,
    rejected,
    isFullyApproved: approved === required.length && required.length > 0
  };
}

import { 
  FileCheck, CreditCard, UserCheck, Landmark,
  FileText, Clock, ShieldCheck, AlertCircle
} from 'lucide-react';

/**
 * Required documents based on user role
 */
export const REQUIRED_DOCS_BY_ROLE: Record<string, string[]> = {
  vendor: ['ngoCertificate', 'panCard', 'aadhaarCard', 'bankPassbook'],
  sub_vendor: ['panCard', 'aadhaarCard', 'bankPassbook'],
  employee: ['panCard', 'aadhaarCard', 'bankPassbook', 'resume', 'passportPhoto']
};

export const REQUIRED_DOCS_BY_VENDOR_TYPE: Record<string, string[]> = {
  individual: ['aadhaarCard', 'panCard', 'passportPhoto', 'bankPassbook'],
  company: ['companyRegCertificate', 'gstCertificate', 'companyPanCard', 'directorAadhaarCard', 'directorPanCard', 'bankPassbook', 'companyLogo'],
  ngo_trust: ['ngoCertificate', 'ngoPanCard', 'aadhaarCard', 'panCard', 'bankPassbook', 'ngoLogo']
};

export function getRequiredDocs(role: string, vendorType?: string): string[] {
  if (role === 'vendor' || role === 'sub_vendor') {
    const type = vendorType || 'individual';
    return REQUIRED_DOCS_BY_VENDOR_TYPE[type] || REQUIRED_DOCS_BY_VENDOR_TYPE.individual;
  }
  return REQUIRED_DOCS_BY_ROLE[role] || [];
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
  }
};

/**
 * Status mapping for document statuses
 */
export const DOCUMENT_STATUS_MAP: Record<string, { label: string; className: string; icon: any }> = {
  approved: { label: 'Approved', className: 'bg-green-100 text-green-600', icon: ShieldCheck },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-600', icon: AlertCircle },
  reupload_required: { label: 'Re-upload Required', className: 'bg-red-100 text-red-600', icon: AlertCircle },
  under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-600', icon: Clock },
  documents_uploaded: { label: 'Submitted', className: 'bg-primary/10 text-primary', icon: FileText },
  uploaded: { label: 'Uploaded', className: 'bg-primary/10 text-primary', icon: FileText },
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
export function getDocComplianceSummary(userDocuments: any, role: string, vendorType?: string) {
  const required = getRequiredDocs(role, vendorType);
  let uploaded = 0;
  let approved = 0;
  let rejected = 0;

  required.forEach(type => {
    const doc = userDocuments?.[type];
    if (isDocumentUploaded(doc)) uploaded++;
    if (doc?.status === 'approved') approved++;
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

/**
 * Static Staff Designations and required documents configurations
 */

export const STAFF_DESIGNATIONS = [
  'HR Recruiter Cum Trainer',
  'HR Recruiter',
  'Trainer',
  'Senior Trainer',
  'Training Coordinator'
] as const;

export type StaffDesignationType = typeof STAFF_DESIGNATIONS[number];

export const STAFF_REQUIRED_DOCS: Record<StaffDesignationType, string[]> = {
  'HR Recruiter': [
    'panCard',
    'aadhaarCardFront',
    'aadhaarCardBack',
    'bankPassbook',
    'resume',
    'passportPhoto'
  ],
  'HR Recruiter Cum Trainer': [
    'panCard',
    'aadhaarCardFront',
    'aadhaarCardBack',
    'bankPassbook',
    'resume',
    'passportPhoto',
    'graduationCertificate',
    'experienceCertificate'
  ],
  'Trainer': [
    'aadhaarCardFront',
    'aadhaarCardBack',
    'passportPhoto',
    'graduationCertificate',
    'experienceCertificate'
  ],
  'Senior Trainer': [
    'aadhaarCardFront',
    'aadhaarCardBack',
    'passportPhoto',
    'graduationCertificate',
    'experienceCertificate'
  ],
  'Training Coordinator': [
    'aadhaarCardFront',
    'aadhaarCardBack',
    'passportPhoto',
    'graduationCertificate',
    'experienceCertificate'
  ]
};

import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import User from '@/models/User';
import Document from '@/models/Document';
import VendorAgreement from '@/models/VendorAgreement';
import VendorMOU from '@/models/VendorMOU';
import VendorCertificate from '@/models/VendorCertificate';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import EmployeeCertificate from '@/models/EmployeeCertificate';
import { uploadBuffer } from '@/lib/storage';
import { 
  REQUIRED_DOCS_BY_ROLE, 
  getDocumentFolderPath,
  getRequiredDocs,
  getRequiredDocsForUser
} from '@/lib/docs/service';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const fileName = formData.get('fileName') as string;
    const fileSize = formData.get('fileSize') as string;
    const mimeType = formData.get('mimeType') as string;

    // Extra metadata for verification
    const aadhaarNumber = formData.get('aadhaarNumber') as string;
    const panNumber = formData.get('panNumber') as string;
    const accountHolderName = formData.get('accountHolderName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const ifscCode = formData.get('ifscCode') as string;
    const bankName = formData.get('bankName') as string;
    const branchName = formData.get('branchName') as string;

    if (!file || !type) {
      return errorResponse('Missing required fields', 400);
    }

    const documentId = formData.get('documentId') as string;

    await dbConnect();
    const user = await User.findById((session as any).id);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (!documentId) {
      const allowedTypes = getRequiredDocsForUser(user.role, user.documents, user.vendorType, user.designation);
      if (!allowedTypes.includes(type)) {
        return errorResponse('Invalid document type for this role', 400);
      }
      
      // Prevent modification of approved/locked documents
      if (user.documents && (user.documents as any)[type]?.status === 'approved') {
        return errorResponse('Document is approved and locked. Only an admin can unlock it.', 403);
      }
    } else {
      // Validate document existence and lock status
      const doc = await Document.findById(documentId);
      if (doc) {
        if (doc.userId.toString() !== user._id.toString()) {
          return errorResponse('Document not found', 404);
        }
        if (doc.isLocked) {
          return errorResponse('Document is locked and cannot be modified', 403);
        }
      } else {
        // Try VendorAgreement
        const agreement = await VendorAgreement.findById(documentId);
        if (agreement) {
          if (agreement.vendorId.toString() !== user._id.toString()) {
            return errorResponse('Document not found', 404);
          }
          // Allow upload for old agreements generated with isLocked:true before the fix
          const isActuallyLocked = (agreement.status === 'generated' && !agreement.uploadedDocumentUrl) ? false : agreement.isLocked;
          if (isActuallyLocked) {
            return errorResponse('Document is locked and cannot be modified', 403);
          }
        } else {
          // Try VendorMOU
          const mou = await VendorMOU.findById(documentId);
          if (mou) {
            if (mou.vendorId.toString() !== user._id.toString()) {
              return errorResponse('Document not found', 404);
            }
            if (mou.isLocked) {
              return errorResponse('Document is locked and cannot be modified', 403);
            }
          } else {
            // Try EmployeeOfferLetter
            const offerLetter = await EmployeeOfferLetter.findById(documentId);
            if (offerLetter) {
              if (offerLetter.employeeId.toString() !== user._id.toString()) {
                return errorResponse('Document not found', 404);
              }
              if ((offerLetter as any).isLocked) {
                return errorResponse('Document is locked and cannot be modified', 403);
              }
            } else {
              return errorResponse('Document not found', 404);
            }
          }
        }
      }
    }

    // --- Verification & Duplicate Check Logic ---
    const primaryAadhaarTypes = ['aadhaarCard', 'aadhaarCardFront', 'aadhaarCardBack'];
    const primaryPanTypes = ['panCard', 'companyPanCard', 'ngoPanCard'];

    if (primaryAadhaarTypes.includes(type)) {
      if (!aadhaarNumber) return errorResponse('Aadhaar number is required', 400);
      const existing = await User.findOne({ aadhaarNumber, _id: { $ne: user._id } });
      if (existing) return errorResponse('Aadhaar already added', 400);
    } else if (primaryPanTypes.includes(type)) {
      if (!panNumber) return errorResponse('PAN number is required', 400);
      const existing = await User.findOne({ panNumber, _id: { $ne: user._id } });
      if (existing) return errorResponse('PAN already added', 400);
    } else if (type === 'bankPassbook') {
      if (!accountHolderName || !accountNumber || !ifscCode) return errorResponse('Incomplete bank details', 400);
      const existing = await User.findOne({ 'bankDetails.accountNumber': accountNumber, _id: { $ne: user._id } });
      if (existing) return errorResponse('Bank account already added', 400);
    }
    // ---------------------------------------------

    // Safely generate folder path: sakhihub/[role]s/[email_slug]
    const folder = getDocumentFolderPath(user) || `sakhihub/${user.role}s/${user._id}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    // Structure publicId as: documentType_timestamp (Do not append .pdf here, format will handle it)
    const publicId = `${type}_${Date.now()}`;

    const uploadResult = await uploadBuffer(
      buffer,
      file.type,
      folder,
      {
        uploadedBy: user._id,
        uploadedFor: type,
        originalName: fileName || file.name
      }
    );

    if (!uploadResult || !uploadResult.url) {
      return errorResponse('Upload failed', 500);
    }

    let secureUrl = uploadResult.url;
    if (isPDF && !secureUrl.toLowerCase().endsWith('.pdf')) {
      secureUrl = secureUrl + '.pdf';
    }

    if (documentId) {
      // First try Document
      const doc = await Document.findById(documentId);
      if (doc) {
        doc.uploadedDocumentUrl = secureUrl;
        doc.status = 'uploaded';
        await doc.save();
        return successResponse({
          message: 'Signed document uploaded successfully',
          document: doc
        });
      }

      // Try VendorAgreement
      const agreement = await VendorAgreement.findById(documentId);
      if (agreement) {
        agreement.uploadedDocumentUrl = secureUrl;
        agreement.status = 'uploaded';
        await agreement.save();
        return successResponse({
          message: 'Signed document uploaded successfully',
          document: agreement
        });
      }

      // Try VendorMOU
      const mou = await VendorMOU.findById(documentId);
      if (mou) {
        mou.uploadedDocumentUrl = secureUrl;
        mou.status = 'uploaded';
        await mou.save();
        return successResponse({
          message: 'Signed document uploaded successfully',
          document: mou
        });
      }

      // Try EmployeeOfferLetter
      const offerLetter = await EmployeeOfferLetter.findById(documentId);
      if (offerLetter) {
        (offerLetter as any).uploadedDocumentUrl = secureUrl;
        offerLetter.status = 'uploaded';
        await offerLetter.save();
        return successResponse({
          message: 'Signed offer letter uploaded successfully',
          document: offerLetter
        });
      }
    }

    // Initialize documents object if it doesn't exist
    if (!user.documents) {
      user.documents = {};
    }

    const docData: any = {
      url: secureUrl,
      publicId: uploadResult.publicId,
      fileName: fileName || file.name || `${type}.pdf`,
      fileSize: fileSize || `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: mimeType || file.type || 'application/pdf',
      status: 'uploaded',
      uploadedAt: new Date(),
      userId: user._id.toString()
    };

    if (user.role === 'vendor' || user.role === 'sub_vendor') {
      docData.vendorId = user._id.toString();
    } else if (user.role === 'employee') {
      docData.employeeId = user._id.toString();
    }

    user.set(`documents.${type}`, docData);

    // Save extra data to User model
    if (primaryAadhaarTypes.includes(type) && aadhaarNumber) {
      user.aadhaarNumber = aadhaarNumber;
    } else if (primaryPanTypes.includes(type) && panNumber) {
      user.panNumber = panNumber;
    } else if (type === 'bankPassbook' && accountHolderName && accountNumber) {
      user.bankDetails = {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        branchName
      };
    }

    // Update global status if needed (from pending to documents_uploaded)
    const requiredDocs = getRequiredDocsForUser(user.role, user.documents, user.vendorType, user.designation);
    const uploadedDocs = Object.keys(user.documents).filter(key => !!(user.documents as any)[key]?.url);
    
    if (user.status === 'pending' && requiredDocs.every(doc => uploadedDocs.includes(doc))) {
      user.status = 'documents_uploaded';
    }

    user.markModified('documents');
    await user.save();

    // Sync to Document collection in MongoDB
    let docModelType: 'ngo_reg' | 'pan' | 'aadhaar' | 'bank_passbook' | 'security_receipt' | 'other' = 'other';
    if (type.toLowerCase().includes('aadhaar')) {
      docModelType = 'aadhaar';
    } else if (type.toLowerCase().includes('pan')) {
      docModelType = 'pan';
    } else if (type === 'bankPassbook') {
      docModelType = 'bank_passbook';
    } else if (type === 'ngoCertificate') {
      docModelType = 'ngo_reg';
    }

    await Document.findOneAndUpdate(
      { userId: user._id, documentType: type },
      {
        userId: user._id,
        employeeId: user.role === 'employee' ? user._id : undefined,
        vendorId: (user.role === 'vendor' || user.role === 'sub_vendor') ? user._id : undefined,
        role: user.role,
        type: docModelType,
        documentType: type,
        title: type,
        fileUrl: secureUrl,
        uploadedDocumentUrl: secureUrl,
        publicId: uploadResult.publicId,
        fileName: fileName || file.name || `${type}.pdf`,
        fileSize: fileSize || `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        mimeType: mimeType || file.type || 'application/pdf',
        status: 'uploaded',
        uploadStatus: 'uploaded',
        verificationStatus: 'uploaded',
        isLocked: false,
        isApproved: false,
        uploadedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return successResponse({
      message: 'Document uploaded successfully',
      document: user.get(`documents.${type}`),
      status: user.status
    });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}


export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const user = await User.findById((session as any).id);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    let digitalCertificates: any[] = [];

    // Migrate generic certificates fetching to role-based specific schema fetching
    if (user.role === 'vendor' || user.role === 'sub_vendor') {
      const agreements = await VendorAgreement.find({ vendorId: user._id }).lean();
      const mous = await VendorMOU.find({ vendorId: user._id }).lean();
      const certs = await VendorCertificate.find({ vendorId: user._id }).lean();

      digitalCertificates = [
        ...agreements.map(a => {
          // Backward compat: old agreements were generated with isLocked:true before the fix.
          // If status is still 'generated' and no signed copy exists, force unlock so vendor can upload.
          const effectiveLocked = (a.status === 'generated' && !a.uploadedDocumentUrl) ? false : a.isLocked;
          return {
            _id: a._id,
            type: 'auth_letter', // Mapping to frontend expectation
            title: 'Vendor Agreement',
            fileUrl: a.fileUrl || `/api/vendor/agreement/${a.agreementId}/preview`,
            uploadedDocumentUrl: a.uploadedDocumentUrl,
            status: a.status,
            isLocked: effectiveLocked,
            adminRemarks: a.adminRemarks,
            agreementId: a.agreementId,
            createdAt: a.createdAt,
            visibleToVendor: true
          };
        }),
        ...mous.map(m => ({
          _id: m._id,
          type: 'ngo_mou',
          title: 'NGO MOU',
          fileUrl: m.fileUrl,
          uploadedDocumentUrl: m.uploadedDocumentUrl,
          status: m.status,
          isLocked: m.isLocked,
          adminRemarks: m.adminRemarks,
          createdAt: m.createdAt,
          visibleToVendor: true
        })),
        ...certs.map(c => ({
          _id: c._id,
          type: c.certificateType,
          title: c.title,
          fileUrl: c.fileUrl,
          createdAt: c.createdAt,
          visibleToVendor: true
        }))
      ];
    } else if (user.role === 'employee') {
      const offerLetters = await EmployeeOfferLetter.find({ employeeId: user._id }).lean();
      const certs = await EmployeeCertificate.find({ employeeId: user._id }).lean();

      digitalCertificates = [
        ...offerLetters.map(o => ({
          _id: o._id,
          type: 'employee_offer_letter', // Mapping to frontend expectation
          title: 'Employee Offer Letter',
          fileUrl: o.pdfUrl,
          uploadedDocumentUrl: (o as any).uploadedDocumentUrl,
          status: o.status,
          isLocked: (o as any).isLocked || false,
          adminRemarks: (o as any).adminRemarks,
          agreementId: o.offerLetterId, // Frontend maps this in the UI
          createdAt: o.createdAt,
          visibleToEmployee: true
        })),
        ...certs.map(c => ({
          _id: c._id,
          type: c.certificateType,
          title: c.title,
          fileUrl: c.fileUrl,
          createdAt: c.createdAt,
          visibleToEmployee: true
        }))
      ];
    }

    return successResponse({
      documents: user.documents || {},
      digitalCertificates,
      status: user.status,
      vendorType: user.vendorType,
      designation: user.designation
    });

  } catch (error: any) {
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

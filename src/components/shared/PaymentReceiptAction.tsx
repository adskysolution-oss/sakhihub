'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Download, X } from 'lucide-react';
import { getDocumentViewUrl } from '@/utils/documents';
import PaymentSlip from '@/components/shared/PaymentSlip';
import axios from 'axios';

interface PaymentReceiptActionProps {
  receiptUrl?: string;          // If an original file proof is uploaded (Cloudinary/S3 URL)
  dynamicReceiptId?: string;    // If a member registration dynamic receipt exists (Membership ID)
  paymentTransaction?: any;     // If a dynamic subscription/deposit transaction exists (PaymentTransaction object)
  allowPreview?: boolean;
  allowDownload?: boolean;
  
  // Optional props for controlled usage (e.g. if another component opens it)
  isOpen?: boolean;
  onClose?: () => void;
}

export default function PaymentReceiptAction({
  receiptUrl,
  dynamicReceiptId,
  paymentTransaction,
  allowPreview = true,
  allowDownload = true,
  isOpen,
  onClose
}: PaymentReceiptActionProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [slipData, setSlipData] = useState<any>(null);

  const activeShow = isOpen !== undefined ? isOpen : showModal;
  const activeClose = onClose !== undefined ? onClose : () => setShowModal(false);

  const isDeposit = paymentTransaction?.type === 'Security Deposit' || paymentTransaction?.type === 'deposit';
  const type = dynamicReceiptId ? 'membership' : (isDeposit ? 'deposit' : 'subscription');

  useEffect(() => {
    if (!activeShow) return;

    const fetchAndMapData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (paymentTransaction) {
          const isDep = paymentTransaction.type === 'Security Deposit' || paymentTransaction.type === 'deposit';
          const tType = isDep ? 'deposit' : 'subscription';
          const userObj = paymentTransaction.user || paymentTransaction.userId;
          const transactionDate = paymentTransaction.date || paymentTransaction.paidAt || paymentTransaction.createdAt || paymentTransaction.paymentDate || new Date();
          
          setSlipData({
            receiptNumber: paymentTransaction.referenceId || paymentTransaction.cashfreeOrderId || paymentTransaction.receiptNumber || 'N/A',
            transactionId: paymentTransaction.transactionId || paymentTransaction.cashfreePaymentId || paymentTransaction.referenceId || paymentTransaction.cashfreeOrderId || 'N/A',
            paymentDate: transactionDate,
            paymentTime: paymentTransaction.paidAt || paymentTransaction.paymentDate || paymentTransaction.date
              ? new Date(paymentTransaction.paidAt || paymentTransaction.paymentDate || paymentTransaction.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
              : new Date(paymentTransaction.createdAt || transactionDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            paymentMode: paymentTransaction.paymentMethod || paymentTransaction.paymentMode || paymentTransaction.method || 'ONLINE',
            amount: paymentTransaction.amount,
            fullName: userObj?.fullName || paymentTransaction.fullName || 'N/A',
            mobileNumber: userObj?.mobile || paymentTransaction.mobileNumber || 'N/A',
            villageArea: userObj?.block || userObj?.district || paymentTransaction.villageArea || 'N/A',
            role: userObj?.role === 'vendor' ? 'Vendor' : userObj?.role === 'sub_vendor' ? 'Sub-Vendor' : userObj?.role === 'employee' ? 'Employee' : 'Member',
            planType: tType === 'subscription' 
              ? (userObj?.role === 'vendor' ? 'Premium Vendor Access' : userObj?.role === 'sub_vendor' ? 'Sub-Vendor Account' : 'Employee Access') 
              : undefined,
            planDuration: tType === 'subscription' ? 'Monthly Partner' : undefined,
            depositPurpose: tType === 'deposit' ? 'Refundable Onboarding Security Deposit' : undefined,
            approvalStatus: 'Approved',
            feeCollectedBy: 'System Auto-Verify',
            verifiedBy: 'Cashfree API Verification',
            verificationHash: paymentTransaction._id || paymentTransaction.id ? `SH-PAY-${(paymentTransaction._id || paymentTransaction.id).toString().substring(0,8).toUpperCase()}` : undefined
          });
        } else if (dynamicReceiptId) {
          const res = await axios.get(`/api/member/receipt/${dynamicReceiptId}`);
          if (res.data.success) {
            const data = res.data.data;
            const membership = data.membership;
            const profile = data.profile;
            const fieldRecord = data.fieldRecord;
            const membershipFee = data.membershipFee ?? 100;
            const payDate = membership ? new Date(membership.paymentDate) : new Date();
            const paymentTimeStr = membership?.paymentTime || payDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            setSlipData({
              receiptNumber: membership?.receiptNumber || 'N/A',
              transactionId: membership?.cashfreeOrderId || membership?.transactionId || 'N/A',
              paymentDate: payDate,
              paymentTime: paymentTimeStr,
              paymentMode: membership?.paymentMode || 'ONLINE',
              amount: membership?.amount || membershipFee,
              fullName: profile?.fullName || 'N/A',
              mobileNumber: profile?.mobile || 'N/A',
              villageArea: fieldRecord?.village || fieldRecord?.groupId?.village || 'N/A',
              assignedGroup: fieldRecord?.groupId?.groupName || 'Individual / Pending Allocation',
              role: 'Member',
              referredBy: fieldRecord?.assignedEmployeeId ? {
                name: fieldRecord.assignedEmployeeId.fullName,
                role: 'Employee'
              } : fieldRecord?.createdBy ? {
                name: fieldRecord.createdBy.fullName,
                role: 'Regional Coordinator'
              } : undefined,
              feeCollectedBy: membership?.employeeId?.fullName || 'System Admin',
              verifiedBy: 'SakhiHub Auto-Verify API',
              verificationHash: membership?._id ? `SH-MEM-${membership._id.toString().substring(0,8).toUpperCase()}` : undefined
            });
          } else {
            throw new Error(res.data.error || 'Failed to load receipt details.');
          }
        }
      } catch (err: any) {
        console.error("Error loading receipt", err);
        setError(err.message || 'Failed to load receipt.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndMapData();
  }, [activeShow, paymentTransaction, dynamicReceiptId]);

  // If it's an uploaded file receipt (original proof)
  if (receiptUrl) {
    return (
      <div className="flex items-center gap-2">
        {allowPreview && (
          <a
            href={getDocumentViewUrl(receiptUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-secondary w-9 h-9 rounded-xl transition-all shadow-sm shrink-0"
            title="Preview uploaded proof"
          >
            <Eye size={14} />
          </a>
        )}
        {allowDownload && (
          <a
            href={`/api/file/preview?url=${encodeURIComponent(receiptUrl)}`}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white w-9 h-9 rounded-xl transition-all shadow-sm shrink-0"
            title="Download original file"
          >
            <Download size={14} />
          </a>
        )}
      </div>
    );
  }

  const renderModal = () => {
    if (!activeShow || !mounted) return null;

    const modalContent = (
      <div className="print-modal-container fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0 print:overflow-visible animate-fadeIn">
        <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl p-6 md:p-10 my-8 overflow-y-auto max-h-[90vh] print:max-h-none print:my-0 print:p-0 print:shadow-none print:border-none print:absolute print:left-0 print:right-0 print:mx-auto print:overflow-visible">
          {/* Close Button - Hidden on Print */}
          <button
            onClick={activeClose}
            className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors print:hidden"
            title="Close Receipt"
          >
            <X size={20} />
          </button>
          
          <div className="pt-4 print:pt-0">
            {loading && (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Retrieving Payment Slip...</p>
              </div>
            )}
            
            {error && (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-bold text-center">{error}</p>
              </div>
            )}
            
            {!loading && !error && slipData && (
              <PaymentSlip type={type} data={slipData} />
            )}
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  // If controlled externally
  if (isOpen !== undefined) {
    return renderModal();
  }

  // Dynamic preview trigger buttons
  return (
    <>
      <div className="flex items-center gap-2">
        {allowPreview && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-secondary w-9 h-9 rounded-xl transition-all shadow-sm shrink-0"
            title="Preview receipt slip"
          >
            <Eye size={14} />
          </button>
        )}
        {allowDownload && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white w-9 h-9 rounded-xl transition-all shadow-sm shrink-0"
            title="Download receipt slip as PDF"
          >
            <Download size={14} />
          </button>
        )}
      </div>
      {renderModal()}
    </>
  );
}

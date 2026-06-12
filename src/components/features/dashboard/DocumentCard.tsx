'use client';

import React from 'react';
import { 
  ShieldCheck, FileText, Upload, ChevronRight, 
  Clock, AlertCircle
} from 'lucide-react';
import { 
  DOC_CONFIG, 
  DOCUMENT_STATUS_MAP, 
  getDocumentViewUrl, 
  isDocumentUploaded,
  formatFileSize 
} from '@/utils/documents';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface DocumentCardProps {
  type: string;
  docInfo?: any;
  uploading: boolean;
  onUpload: (file: File) => void;
  onExceptionRequest?: (type: string, reason: string) => void;
  onExceptionReply?: (type: string, reply: string) => void;
  readOnly?: boolean;
}

export default function DocumentCard({ 
  type, 
  docInfo, 
  uploading, 
  onUpload,
  onExceptionRequest,
  onExceptionReply,
  readOnly = false 
}: DocumentCardProps) {
  const { t } = useLanguage();
  const [showExceptionModal, setShowExceptionModal] = React.useState(false);
  const [exceptionReason, setExceptionReason] = React.useState('');
  const [showReplyModal, setShowReplyModal] = React.useState(false);
  const [exceptionReply, setExceptionReply] = React.useState('');
  const config = DOC_CONFIG[type];
  if (!config) return null;

  const isUploaded = isDocumentUploaded(docInfo);
  const viewUrl = getDocumentViewUrl(docInfo?.url);
  const status = docInfo?.status || 'pending';
  const statusMeta = DOCUMENT_STATUS_MAP[status] || DOCUMENT_STATUS_MAP.pending;
  const DocIcon = config.icon;

  const statusTranslations: Record<string, string> = {
    approved: t('status.approved', 'Approved'),
    exception_approved: t('onboarding.exceptionApproved', 'Exception Approved'),
    rejected: t('status.rejected', 'Rejected'),
    reupload_required: t('status.reupload_required', 'Re-upload Required'),
    under_review: t('status.under_review', 'Under Review'),
    documents_uploaded: t('status.documents_uploaded', 'Submitted'),
    uploaded: t('onboarding.uploaded', 'Uploaded'),
    exception_requested: t('onboarding.exceptionRequested', 'Exception Requested'),
    exception_responded: t('onboarding.exceptionReplySent', 'Exception Reply Sent'),
    on_hold: t('status.on_hold', 'On Hold'),
    pending: t('status.pending', 'Pending Upload')
  };

  return (
    <div className={`p-6 rounded-[32px] border-2 transition-all relative overflow-hidden group ${
      status === 'approved' || status === 'exception_approved' ? 'border-green-100 bg-green-50/30' :
      status === 'rejected' ? 'border-red-100 bg-red-50/30' :
      status === 'exception_requested' || status === 'on_hold' || status === 'exception_responded' ? 'border-amber-100 bg-amber-50/30' :
      isUploaded ? 'border-primary/20 bg-primary/5' : 'border-gray-100 bg-white hover:border-primary/20'
    }`}>
      {(status === 'approved' || status === 'exception_approved') && (
        <div className="absolute top-4 right-4 text-green-500">
          <ShieldCheck size={24} />
        </div>
      )}
      
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${
        status === 'approved' || status === 'exception_approved' ? 'bg-green-500 text-white' :
        status === 'rejected' ? 'bg-red-500 text-white' :
        isUploaded ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'
      }`}>
        <DocIcon size={24} />
      </div>

      <h3 className="text-lg font-black text-secondary mb-1">{t(`onboarding.${type}_label`, config.label)}</h3>
      <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <FileText size={12} /> PDF, JPG, PNG, WEBP
      </p>
      <p className="text-xs text-gray-400 font-bold leading-relaxed mb-4">{t(`onboarding.${type}_desc`, config.desc)}</p>
      
      {['exception_requested', 'on_hold', 'exception_responded', 'exception_approved'].includes(status) && (
        <div className={`mb-4 p-3 rounded-2xl border flex items-start gap-2 ${status === 'exception_approved' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
          {status === 'exception_approved' ? (
            <ShieldCheck size={14} className="text-green-500 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1 inline-block ${status === 'exception_approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {status === 'on_hold' ? t('status.on_hold', 'On Hold') : status === 'exception_responded' ? t('onboarding.exceptionReplySent', 'Exception Reply Sent') : status === 'exception_approved' ? t('onboarding.exceptionApproved', 'Exception Approved') : t('onboarding.exceptionRequested', 'Exception Requested')}
             </span>
             {docInfo?.exceptionReason && (
                <p className={`text-[10px] font-bold italic mt-1 ${status === 'exception_approved' ? 'text-green-800' : 'text-amber-800'}`}>{t('onboarding.userLabel', 'User')}: {docInfo.exceptionReason}</p>
             )}
             {docInfo?.exceptionAdminRemarks && (
                <p className={`text-[10px] font-bold mt-1 ${status === 'exception_approved' ? 'text-green-800' : 'text-red-700'}`}>{t('onboarding.adminLabel', 'Admin')}: {docInfo.exceptionAdminRemarks}</p>
             )}
             {status === 'on_hold' && onExceptionReply && !readOnly && (
                <button 
                  onClick={() => setShowReplyModal(true)}
                  className="mt-2 text-[9px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
                >
                  {t('onboarding.replyToAdmin', 'Reply to Admin')} <ChevronRight size={10} />
                </button>
             )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {isUploaded ? (
          <div className="flex flex-col gap-3 bg-white/70 p-3 rounded-2xl border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">
                    {t('onboarding.uploaded', 'Uploaded')}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusMeta.className}`}>
                    {statusTranslations[status] || statusMeta.label}
                  </span>
                </div>
                <p className="text-sm font-black text-secondary truncate">{docInfo.fileName || t(`onboarding.${type}_label`, config.label)}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{formatFileSize(docInfo.fileSize)}</p>
                {docInfo.uploadedAt && (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {t('onboarding.uploadedAt', 'Uploaded {{date}}', { date: new Date(docInfo.uploadedAt).toLocaleString() })}
                  </p>
                )}
              </div>
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-2xl text-primary border border-gray-100 shadow-sm hover:bg-primary hover:text-white transition-all shrink-0"
                title="Open uploaded document"
              >
                <ChevronRight size={14} />
              </a>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                {t('onboarding.previewOpen', 'Preview / Open')} <ChevronRight size={14} />
              </a>
              {docInfo.publicId && (
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate max-w-[180px]">
                  {t('members.idLabel', 'ID')}: {docInfo.publicId}
                </span>
              )}
            </div>
          </div>
        ) : null}

        {!readOnly && status !== 'approved' && (
          <label className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest cursor-pointer transition-all ${
            uploading ? 'bg-gray-100 text-gray-400 cursor-wait' :
            isUploaded ? 'bg-white border-2 border-gray-100 text-gray-400 hover:border-primary/20 hover:text-primary' : 
            status === 'exception_approved' ? 'bg-white border-2 border-green-100 text-green-600 hover:bg-green-50' :
            'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
          }`}>
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>{t('common.uploading', 'Uploading...')}</span>
              </div>
            ) : (
              <><Upload size={16} /> {isUploaded ? t('onboarding.reupload', 'Re-upload') : status === 'exception_approved' ? t('onboarding.uploadDoc', 'Upload Document') : t('onboarding.chooseFile', 'Choose File')}</>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png,.webp" 
              disabled={uploading || status === 'approved'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = '';
              }} 
            />
          </label>
        )}
        
        {onExceptionRequest && !readOnly && !isUploaded && status !== 'exception_requested' && status !== 'on_hold' && status !== 'exception_approved' && status !== 'exception_responded' && (
          <button 
            onClick={() => setShowExceptionModal(true)}
            className="w-full text-xs font-black text-gray-400 hover:text-amber-600 hover:underline uppercase tracking-widest text-center mt-1"
          >
            {t('onboarding.dontHaveDoc', "Don't have this document?")}
          </button>
        )}
      </div>

      {(docInfo?.reviewedAt || (docInfo?.remarks && ['rejected', 'reupload_required'].includes(status))) && (
        <div className="flex flex-col gap-3 pt-4 border-t border-black/5 mt-4 w-full">
          {docInfo?.reviewedAt && (
            <div className="w-full text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 pl-1">
              <Clock size={10} /> {t('onboarding.reviewedAt', 'Reviewed: {{date}}', { date: new Date(docInfo.reviewedAt).toLocaleString() })}
            </div>
          )}

          {['rejected', 'reupload_required'].includes(status) && docInfo?.remarks && (
            <div className="w-full p-4 bg-white/50 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">
                  {status === 'reupload_required' ? t('onboarding.reuploadInstructions', 'Re-upload Instructions') : t('onboarding.rejectionReason', 'Reason for Rejection')}
                </p>
                <p className="text-[10px] text-red-500 font-bold leading-relaxed">{docInfo.remarks}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {showExceptionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative border border-gray-100">
            <h3 className="text-lg font-black text-secondary mb-2">{t('onboarding.requestException', 'Request Exception')}</h3>
            <p className="text-xs text-gray-400 font-bold mb-6">{t('onboarding.requestExceptionDesc', "If you don't have this document, please explain why. An admin will review your request.")}</p>
            <textarea 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white mb-6 resize-none h-24"
              placeholder={t('onboarding.exceptionPlaceholder', 'E.g., Not applicable for my business...')}
              value={exceptionReason}
              onChange={(e) => setExceptionReason(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => { setShowExceptionModal(false); setExceptionReason(''); }}
                className="flex-1 py-3 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button 
                onClick={() => {
                  if (exceptionReason.trim().length < 5) return toast.error(t('onboarding.errProvideReason', 'Please provide a valid reason'));
                  onExceptionRequest?.(type, exceptionReason.trim());
                  setShowExceptionModal(false);
                  setExceptionReason('');
                }}
                className="flex-1 bg-amber-500 text-white py-3 font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 rounded-xl transition-all shadow-lg shadow-amber-500/30"
              >
                {t('onboarding.submitRequest', 'Submit Request')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative border border-gray-100">
            <h3 className="text-lg font-black text-secondary mb-2">{t('onboarding.replyToAdmin', 'Reply to Admin')}</h3>
            <p className="text-xs text-gray-400 font-bold mb-6">{t('onboarding.replyToAdminDesc', "Provide your response to the admin's hold remarks.")}</p>
            <textarea 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white mb-6 resize-none h-24"
              placeholder={t('onboarding.replyPlaceholder', 'Your reply...')}
              value={exceptionReply}
              onChange={(e) => setExceptionReply(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => { setShowReplyModal(false); setExceptionReply(''); }}
                className="flex-1 py-3 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button 
                onClick={() => {
                  if (exceptionReply.trim().length < 2) return toast.error(t('onboarding.errProvideReply', 'Please provide a valid reply'));
                  onExceptionReply?.(type, exceptionReply.trim());
                  setShowReplyModal(false);
                  setExceptionReply('');
                }}
                className="flex-1 bg-amber-500 text-white py-3 font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 rounded-xl transition-all shadow-lg shadow-amber-500/30"
              >
                {t('onboarding.submitReply', 'Submit Reply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

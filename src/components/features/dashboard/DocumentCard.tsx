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

interface DocumentCardProps {
  type: string;
  docInfo?: any;
  uploading: boolean;
  onUpload: (file: File) => void;
  readOnly?: boolean;
}

export default function DocumentCard({ 
  type, 
  docInfo, 
  uploading, 
  onUpload,
  readOnly = false 
}: DocumentCardProps) {
  const config = DOC_CONFIG[type];
  if (!config) return null;

  const isUploaded = isDocumentUploaded(docInfo);
  const viewUrl = getDocumentViewUrl(docInfo?.url);
  const status = docInfo?.status || 'pending';
  const statusMeta = DOCUMENT_STATUS_MAP[status] || DOCUMENT_STATUS_MAP.pending;
  const DocIcon = config.icon;

  return (
    <div className={`p-8 rounded-[40px] border-2 transition-all relative overflow-hidden group ${
      status === 'approved' ? 'border-green-100 bg-green-50/30' :
      status === 'rejected' ? 'border-red-100 bg-red-50/30' :
      isUploaded ? 'border-primary/20 bg-primary/5' : 'border-gray-100 bg-white hover:border-primary/20'
    }`}>
      {status === 'approved' && (
        <div className="absolute top-4 right-4 text-green-500">
          <ShieldCheck size={24} />
        </div>
      )}
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
        status === 'approved' ? 'bg-green-500 text-white' :
        status === 'rejected' ? 'bg-red-500 text-white' :
        isUploaded ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'
      }`}>
        <DocIcon size={28} />
      </div>

      <h3 className="text-xl font-black text-secondary mb-2">{config.label}</h3>
      <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <FileText size={12} /> PDF, JPG, PNG, WEBP
      </p>
      <p className="text-xs text-gray-400 font-bold leading-relaxed mb-6">{config.desc}</p>

      <div className="flex flex-col gap-4">
        {isUploaded ? (
          <div className="flex flex-col gap-4 bg-white/70 p-4 rounded-3xl border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">
                    Uploaded
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                </div>
                <p className="text-sm font-black text-secondary truncate">{docInfo.fileName || config.label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{formatFileSize(docInfo.fileSize)}</p>
                {docInfo.uploadedAt && (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Uploaded {new Date(docInfo.uploadedAt).toLocaleString()}
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
                <ChevronRight size={16} />
              </a>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                Preview / Open <ChevronRight size={14} />
              </a>
              {docInfo.publicId && (
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate max-w-[180px]">
                  ID: {docInfo.publicId}
                </span>
              )}
            </div>
          </div>
        ) : null}

        {!readOnly && (
          <label className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest cursor-pointer transition-all ${
            uploading ? 'bg-gray-100 text-gray-400 cursor-wait' :
            isUploaded ? 'bg-white border-2 border-gray-100 text-gray-400 hover:border-primary/20 hover:text-primary' : 
            'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
          }`}>
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <><Upload size={16} /> {isUploaded ? 'Re-upload' : 'Choose File'}</>
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
      </div>

      {(docInfo?.reviewedAt || (docInfo?.remarks && ['rejected', 'reupload_required'].includes(status))) && (
        <div className="flex flex-col gap-3 pt-4 border-t border-black/5 mt-4 w-full">
          {docInfo?.reviewedAt && (
            <div className="w-full text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 pl-1">
              <Clock size={10} /> Reviewed: {new Date(docInfo.reviewedAt).toLocaleString()}
            </div>
          )}

          {['rejected', 'reupload_required'].includes(status) && docInfo?.remarks && (
            <div className="w-full p-4 bg-white/50 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">
                  {status === 'reupload_required' ? 'Re-upload Instructions' : 'Reason for Rejection'}
                </p>
                <p className="text-[10px] text-red-500 font-bold leading-relaxed">{docInfo.remarks}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

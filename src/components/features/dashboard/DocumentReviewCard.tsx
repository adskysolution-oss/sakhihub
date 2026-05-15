'use client';

import React, { useState } from 'react';
import { 
  FileText, ExternalLink, ShieldCheck, 
  XCircle, RotateCcw, MessageSquare, Clock, AlertCircle
} from 'lucide-react';
import { 
  DOC_CONFIG, 
  DOCUMENT_STATUS_MAP, 
  getDocumentViewUrl, 
  isDocumentUploaded 
} from '@/utils/documents';

interface DocumentReviewCardProps {
  type: string;
  docInfo?: any;
  onStatusUpdate: (type: string, status: string, remarks?: string) => Promise<void>;
}

export default function DocumentReviewCard({ 
  type, 
  docInfo, 
  onStatusUpdate 
}: DocumentReviewCardProps) {
  const [remarks, setRemarks] = useState(docInfo?.remarks || '');
  const [loading, setLoading] = useState<string | null>(null);
  const [validationError, setValidationError] = useState(false);
  
  const config = DOC_CONFIG[type];
  if (!config) return null;

  const isUploaded = isDocumentUploaded(docInfo);
  const viewUrl = getDocumentViewUrl(docInfo?.url);
  const status = docInfo?.status || 'missing';
  const statusMeta = DOCUMENT_STATUS_MAP[status] || DOCUMENT_STATUS_MAP.pending;
  const DocIcon = config.icon;

  const handleAction = async (newStatus: string) => {
    if (loading) return;
    
    // Validate remarks for negative statuses
    if (['rejected', 'reupload_required'].includes(newStatus)) {
      if (!remarks.trim()) {
        setValidationError(true);
        // Focus the textarea for better UX
        const el = document.getElementById(`remarks-${type}`);
        el?.focus();
        return;
      }
    }

    setValidationError(false);
    setLoading(newStatus);
    try {
      await onStatusUpdate(type, newStatus, remarks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`p-6 rounded-[32px] border-2 transition-all ${
      status === 'approved' ? 'border-green-100 bg-green-50/20' :
      status === 'rejected' ? 'border-red-100 bg-red-50/20' :
      isUploaded ? 'border-primary/10 bg-white shadow-sm' : 'border-gray-50 bg-gray-50/50'
    }`}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Doc Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isUploaded ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-200 text-gray-400'
            }`}>
              <DocIcon size={24} />
            </div>
            <div className="min-w-0">
              <h5 className="font-black text-secondary flex items-center gap-2">
                {config.label}
                {status === 'approved' && <ShieldCheck size={16} className="text-green-500" />}
              </h5>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
                {isUploaded && (
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {docInfo.fileSize} • {docInfo.fileName}
                  </span>
                )}
              </div>
              {docInfo?.uploadedAt && (
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                  <Clock size={10} /> Uploaded: {new Date(docInfo.uploadedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {isUploaded && (
            <div className="mt-6 flex gap-3">
              <a 
                href={viewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-secondary text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-secondary-light transition-all shadow-lg shadow-secondary/10"
              >
                <ExternalLink size={14} /> View Document
              </a>
            </div>
          )}
        </div>

        {/* Right: Review Actions */}
        <div className="flex-1 flex flex-col gap-4">
          {isUploaded ? (
            <>
              <div className="relative">
                <div className={`absolute top-3 left-4 ${validationError ? 'text-red-500' : 'text-gray-400'}`}>
                  <MessageSquare size={14} />
                </div>
                <textarea
                  id={`remarks-${type}`}
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if (e.target.value.trim()) setValidationError(false);
                  }}
                  placeholder="Review remarks (required for rejection)..."
                  className={`w-full bg-gray-50 border rounded-2xl py-3 pl-10 pr-4 text-xs font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 transition-all min-h-[80px] resize-none ${
                    validationError 
                      ? 'border-red-200 focus:ring-red-500/10 bg-red-50/30' 
                      : 'border-gray-100 focus:ring-primary/10'
                  }`}
                />
                {validationError && (
                  <div className="flex items-center gap-1 mt-1.5 px-1 text-red-500 animate-pulse">
                    <AlertCircle size={10} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Reason is mandatory for rejection/re-upload</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction('approved')}
                  disabled={!!loading}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    status === 'approved' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {loading === 'approved' ? '...' : <><ShieldCheck size={14} /> Approve</>}
                </button>
                <button
                  onClick={() => handleAction('reupload_required')}
                  disabled={!!loading}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    status === 'reupload_required' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  {loading === 'reupload_required' ? '...' : <><RotateCcw size={14} /> Re-upload</>}
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={!!loading}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    status === 'rejected' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {loading === 'rejected' ? '...' : <><XCircle size={14} /> Reject</>}
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8">
              <FileText size={32} className="text-gray-200 mb-2" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">Awaiting Document Upload</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

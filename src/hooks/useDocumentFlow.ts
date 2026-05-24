'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface UseDocumentFlowProps {
  onSuccess?: () => Promise<void>;
  uploadUrl?: string;
}

export function useDocumentFlow({ 
  onSuccess, 
  uploadUrl = '/api/vendor/documents' 
}: UseDocumentFlowProps = {}) {
  const [uploading, setUploading] = useState<string | null>(null);

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

  const uploadDocument = async (file: File, type: string, extraData?: Record<string, string>) => {
    if (uploading === type) return;

    // Strict Format Validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.success("Invalid format. Only PDF, JPG, PNG, and WEBP files are accepted.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size should be less than 10MB");
      return;
    }

    setUploading(type);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('fileName', file.name);
      formData.append('fileSize', `${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      formData.append('mimeType', file.type);

      if (extraData) {
        Object.entries(extraData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      const res = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        if (onSuccess) await onSuccess();
        return true;
      } else {
        throw new Error(res.data.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
      return false;
    } finally {
      setUploading(null);
    }
  };

  const handleExceptionRequest = async (type: string, reason: string) => {
    try {
      const res = await axios.post('/api/vendor/documents/exception', { type, exceptionReason: reason });
      if (res.data.success) {
        toast.success("Exception requested successfully");
        if (onSuccess) await onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit exception request");
    }
  };

  const handleExceptionReply = async (type: string, reply: string) => {
    try {
      const res = await axios.post('/api/vendor/documents/exception/reply', { type, reply });
      if (res.data.success) {
        toast.success("Reply submitted successfully");
        if (onSuccess) await onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit reply");
    }
  };

  return {
    uploading,
    uploadDocument,
    handleExceptionRequest,
    handleExceptionReply,
  };
}

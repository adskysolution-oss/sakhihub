'use client';

import { useState } from 'react';
import axios from 'axios';

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

  const uploadDocument = async (file: File, type: string) => {
    if (uploading === type) return;

    // Strict Format Validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid format. Only PDF, JPG, PNG, and WEBP files are accepted.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert("File size should be less than 10MB");
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
      alert(msg);
      return false;
    } finally {
      setUploading(null);
    }
  };

  return {
    uploading,
    uploadDocument,
  };
}

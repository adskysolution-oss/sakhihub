'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, FileText, Download } from 'lucide-react';

function DocumentViewerContent() {
  const searchParams = useSearchParams();
  const docUrl = searchParams.get('url');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docUrl) {
      setError('No document URL provided.');
      setLoading(false);
      return;
    }

    if (!docUrl.includes('res.cloudinary.com')) {
      setError('Invalid document source.');
      setLoading(false);
      return;
    }

    // Preload image if it's an image format to remove loader smoothly
    const isImage = docUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    if (isImage) {
      const img = new Image();
      img.onload = () => setLoading(false);
      img.onerror = () => {
        setError('Failed to load image. The file might be corrupted or inaccessible.');
        setLoading(false);
      };
      img.src = docUrl;
    } else {
      // For PDFs or other types, we just let the iframe handle it
      // Add a slight delay to remove loader since iframe doesn't reliably trigger onload for PDFs across all browsers
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [docUrl]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Preview Failed</h2>
          <p className="text-gray-500 font-bold mb-8">{error}</p>
          <button 
            onClick={() => window.close()}
            className="w-full bg-gray-900 text-white font-black py-4 rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-widest text-xs"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const isImage = docUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between z-50 sticky top-0">
        <div className="flex items-center gap-3 text-white">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="font-black tracking-widest uppercase text-sm">SakhiHub Document Viewer</h1>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href={docUrl as string} 
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-primary transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
          >
            <Download className="w-4 h-4" /> Download Original
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 to-gray-900">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm z-40">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse">Loading Document...</p>
          </div>
        )}

        {docUrl && (
          <div className="w-full h-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden relative flex items-center justify-center">
            {isImage ? (
              // Image Viewer
              <div className="w-full h-[80vh] overflow-auto flex items-center justify-center p-4 bg-gray-100">
                <img 
                  src={docUrl} 
                  alt="Document Preview" 
                  className="max-w-full max-h-full object-contain drop-shadow-lg"
                />
              </div>
            ) : (
              // PDF Viewer using iframe
              <iframe 
                src={`${docUrl}#toolbar=0&navpanes=0`} 
                title="Document Preview"
                className="w-full h-[85vh] border-0 bg-gray-100"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setError('Failed to load PDF. The file might be corrupted.');
                  setLoading(false);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DocumentViewer() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <DocumentViewerContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onUploadSuccess: (fileUrl: string, fileName: string) => void;
  acceptedTypes?: string;
  label?: string;
  helperText?: string;
}

export function FileUploader({
  onUploadSuccess,
  acceptedTypes = 'image/jpeg,image/png,image/webp,application/pdf',
  label = 'Lampiran Rekam Medis / Hasil Laboratorium',
  helperText = 'Format JPG, PNG, atau PDF (Maks. 10MB). File otomatis diunggah ke Cloudflare R2.',
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah berkas.');
      }

      setSuccessInfo({ name: file.name, url: data.fileUrl });
      onUploadSuccess(data.fileUrl, file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan unggah';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isUploading
            ? 'border-blue-400 bg-blue-50/50'
            : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-blue-800">Mengunggah ke Cloudflare R2...</p>
            <p className="text-xs text-slate-500">Mohon tunggu sebentar</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-11 w-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Klik atau tarik berkas ke area ini
              </p>
              <p className="text-xs text-slate-500 mt-1">{helperText}</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200">
              Cloudflare R2 Object Storage
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successInfo && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2 overflow-hidden">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">{successInfo.name}</span>
          </div>
          <a
            href={successInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 underline font-bold hover:text-teal-900 shrink-0 ml-2"
          >
            Lihat Berkas
          </a>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { FileUploader } from '@/components/ui/file-uploader';
import { User, ShieldCheck, Phone, MapPin, Heart, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientProfilePage() {
  const { user, updateCurrentUserProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nik, setNik] = useState(user?.nik || '');
  const [gender, setGender] = useState<'L' | 'P'>(user?.gender || 'L');
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bloodType, setBloodType] = useState(user?.blood_type || 'O+');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast.error('Nama dan Nomor HP wajib diisi.');
      return;
    }

    updateCurrentUserProfile({
      full_name: fullName,
      phone,
      nik,
      gender,
      birth_date: birthDate,
      address,
      blood_type: bloodType,
      allergies,
      avatar_url: avatarUrl,
    });

    toast.success('Data profil pasien berhasil diperbarui!');
  };

  return (
    <DashboardLayout requiredRole="pasien">
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Diri & Rekam Medis Pasien
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pastikan data kependudukan dan catatan riwayat kesehatan Anda selalu akurat untuk mempermudah pelayanan klinik.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Avatar & Header Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-teal-100 border-4 border-white shadow-md shrink-0 flex items-center justify-center font-bold text-teal-800 text-2xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                fullName.charAt(0) || 'P'
              )}
            </div>

            <div className="text-center sm:text-left flex-1 space-y-1">
              <h2 className="text-lg font-bold text-slate-900">{fullName || 'Pasien Klinik'}</h2>
              <p className="text-xs text-slate-500 font-mono">Email: {user?.email || '-'}</p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 border border-teal-200">
                <ShieldCheck className="h-3.5 w-3.5" /> Pasien Terverifikasi
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Lengkap (KTP) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                NIK (16 Digit) *
              </label>
              <input
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nomor Telepon / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-teal-600"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Golongan Darah
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-teal-600"
              >
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Riwayat Alergi Obat / Makanan
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Contoh: Amoksisilin, Seafood, Kacang..."
              className="w-full rounded-xl border border-rose-200 bg-rose-50/30 px-3 py-2 text-xs text-rose-900 focus:outline-rose-600"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              *Informasi ini sangat penting agar dokter tidak memberikan obat yang berbahaya bagi Anda.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Alamat Domisili
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
            />
          </div>

          {/* Cloudflare R2 Upload for Profile Photo / Medical ID */}
          <div className="pt-2 border-t border-slate-100">
            <FileUploader
              label="Unggah Foto Profil Baru (Cloudflare R2)"
              helperText="Pilih foto wajah yang jelas (JPG, PNG). Disimpan di Cloudflare R2."
              onUploadSuccess={(url) => {
                setAvatarUrl(url);
                toast.success('Foto profil berhasil diunggah!');
              }}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 text-xs shadow-md transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan Data</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}


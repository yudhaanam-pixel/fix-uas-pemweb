'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ClinicService } from '@/lib/clinic-service';
import { Profile, UserRole } from '@/types/database';
import { Users, Shield, Plus, Edit2, UserCheck, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, []);

  const refreshData = () => {
    setProfiles(ClinicService.getProfiles());
  };

  const handleRoleChange = (userId: string, newRole: UserRole, name: string) => {
    ClinicService.updateProfile(userId, { role: newRole });
    toast.success(`Hak akses pengguna ${name} diubah menjadi ${newRole.toUpperCase()}`);
    refreshData();
  };

  const filteredUsers = profiles.filter((p) => {
    const matchRole = selectedRoleFilter === 'all' || p.role === selectedRoleFilter;
    const matchSearch =
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.nik && p.nik.includes(searchQuery));
    return matchRole && matchSearch;
  });

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'petugas':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'dokter':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pasien':
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Pengguna & Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola otoritas dan peran pengguna: Administrator, Petugas Front Office, Dokter Spesialis, dan Pasien.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pengguna, email, atau NIK..."
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-teal-600 max-w-sm"
          />

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-teal-600"
          >
            <option value="all">Semua Peran</option>
            <option value="admin">Administrator</option>
            <option value="petugas">Front Office (Petugas)</option>
            <option value="dokter">Dokter</option>
            <option value="pasien">Pasien</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-5 py-3.5">Nama & Profil</th>
                <th className="px-5 py-3.5">Kontak & NIK</th>
                <th className="px-5 py-3.5">Peran Saat Ini</th>
                <th className="px-5 py-3.5 text-right">Ubah Hak Akses (RBAC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.full_name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          u.full_name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.full_name}</p>
                        <p className="text-slate-400 text-[11px] font-mono">{u.email || '-'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-slate-700 font-mono">{u.phone || '-'}</p>
                    <p className="text-slate-400 text-[11px] font-mono">NIK: {u.nik || '-'}</p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole, u.full_name)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-teal-600"
                    >
                      <option value="admin">Jadikan Admin</option>
                      <option value="petugas">Jadikan Petugas FO</option>
                      <option value="dokter">Jadikan Dokter</option>
                      <option value="pasien">Jadikan Pasien</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { ClinicService } from '@/lib/clinic-service';
import { useAuth } from '@/lib/auth-context';
import { formatRupiah, getDayName, formatDateIndo } from '@/lib/utils';
import { Department, Doctor, Schedule } from '@/types/database';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Tv,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Filter states for schedules
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedDayFilter, setSelectedDayFilter] = useState<number>(1); // Default Senin
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDeptId, setBookingDeptId] = useState('');
  const [bookingDoctorId, setBookingDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [todayDateStr, setTodayDateStr] = useState('');
  const [todayDisplayStr, setTodayDisplayStr] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientNik, setPatientNik] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [complaint, setComplaint] = useState('');
  const [bookedResult, setBookedResult] = useState<{
    queueCode: string;
    queueNumber: number;
    doctorName: string;
    room: string;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    const isoDate = now.toISOString().split('T')[0];
    setTodayDateStr(isoDate);
    setBookingDate(isoDate);
    setTodayDisplayStr(
      now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
    );

    const loadData = () => {
      setDepartments(ClinicService.getDepartments().filter((d) => d.is_active));
      setDoctors(ClinicService.getDoctors().filter((d) => d.is_active));
      setSchedules(ClinicService.getSchedules().filter((s) => s.is_active));
    };

    loadData();
    window.addEventListener('clinic_data_updated', loadData);
    return () => window.removeEventListener('clinic_data_updated', loadData);
  }, []);

  // Autofill user info if logged in as patient
  useEffect(() => {
    if (user) {
      setPatientName(user.full_name || '');
      setPatientNik(user.nik || '');
      setPatientPhone(user.phone || '');
    }
  }, [user]);

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchDay = selectedDayFilter === 0 || s.day_of_week === selectedDayFilter;
    const matchDept =
      selectedDeptFilter === 'all' || s.doctor?.department_id === selectedDeptFilter;
    const matchQuery =
      searchQuery.trim() === '' ||
      s.doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.doctor?.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDay && matchDept && matchQuery;
  });

  const availableDoctorsForDept = bookingDeptId
    ? doctors.filter((d) => d.department_id === bookingDeptId)
    : doctors;

  // Quota preview for selected doctor and date in booking modal
  const selectedQuota = bookingDoctorId && bookingDate
    ? ClinicService.checkDoctorQuota(bookingDoctorId, bookingDate)
    : null;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctorId || !patientName || !bookingDate) {
      toast.error('Harap lengkapi semua kolom yang bertanda bintang (*)');
      return;
    }

    const res = ClinicService.bookAppointment({
      patient_id: user?.id || null,
      patient_name: patientName,
      patient_nik: patientNik,
      patient_phone: patientPhone,
      doctor_id: bookingDoctorId,
      appointment_date: bookingDate,
      complaint: complaint || 'Pemeriksaan rutin',
    });

    if (res.success && res.appointment) {
      setBookedResult({
        queueCode: res.appointment.queue_code,
        queueNumber: res.appointment.queue_number,
        doctorName: res.appointment.doctor?.title || 'Dokter',
        room: res.appointment.doctor?.room_number || 'Ruang Periksa',
      });
      toast.success('Pendaftaran janji temu berhasil!');
    } else {
      toast.error(res.error || 'Gagal melakukan pendaftaran.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-950 to-slate-900 text-white py-16 lg:py-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 -z-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-400/30 px-3.5 py-1.5 text-xs font-semibold text-teal-300">
                <Sparkles className="h-4 w-4 text-teal-300 animate-spin" />
                <span>SIM-Klinik Terakreditasi Paripurna Kemenkes RI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Pelayanan Kesehatan Prima,{' '}
                <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-100 bg-clip-text text-transparent">
                  Nyaman & Terintegrasi
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Nikmati kemudahan pendaftaran poliklinik secara online, pantauan antrean real-time dari ponsel Anda, serta rekam medis terpadu dengan dokter spesialis berpengalaman.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    setBookedResult(null);
                    setBookingModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3.5 text-sm shadow-lg shadow-teal-500/30 hover:scale-105 transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Buat Janji Temu / Daftar Poli</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/antrean"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-5 py-3.5 text-sm backdrop-blur-sm transition-all"
                >
                  <Tv className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <span>Pantau Antrean Live (TV Lobby)</span>
                </Link>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
                <div>
                  <p className="text-2xl font-black text-teal-400">6+</p>
                  <p className="text-xs text-slate-400">Poliklinik Lengkap</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">100%</p>
                  <p className="text-xs text-slate-400">Rekam Medis Digital</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-teal-300">Live</p>
                  <p className="text-xs text-slate-400">Antrean Real-time</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-300">24/7</p>
                  <p className="text-xs text-slate-400">Layanan Darurat IGD</p>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Doctor Card & Live Status Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-2xl text-slate-100 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-sm tracking-wide">Pelayanan Hari Ini Aktif</span>
                  </div>
                  <span className="text-xs font-mono bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-full border border-teal-400/30">
                    {todayDisplayStr || 'Aktif'}
                  </span>
                </div>

                {/* Quick Antrean Banner */}
                <div className="bg-gradient-to-br from-teal-900/80 to-slate-900/90 rounded-2xl p-4 border border-teal-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-teal-300 font-semibold uppercase">Sedang Diperiksa</p>
                      <p className="text-3xl font-black text-white font-mono mt-0.5">UMU-002</p>
                      <p className="text-xs text-slate-300 mt-1">Poli Umum • Ruang 101</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Berikutnya:</p>
                      <p className="text-lg font-bold text-emerald-400 font-mono">UMU-003</p>
                      <Link
                        href="/antrean"
                        className="text-[11px] text-teal-300 underline font-semibold mt-1 inline-block"
                      >
                        Buka Layar Penuh →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Doctor highlight preview */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    Dokter Praktik Unggulan:
                  </p>
                  <div className="space-y-2">
                    {doctors.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                      >
                        <img
                          src={doc.photo_url || ''}
                          alt={doc.name}
                          className="h-10 w-10 rounded-full object-cover border border-teal-400/40 shrink-0"
                        />
                        <div className="overflow-hidden flex-1">
                          <p className="text-sm font-bold text-white truncate">{doc.title}</p>
                          <p className="text-xs text-teal-200 truncate">{doc.specialization}</p>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                          {doc.room_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEUNGGULAN KLINIK */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Standar Pelayanan Medis Modern & Terpercaya
            </p>
            <p className="text-slate-600 text-sm mt-3">
              Klinik Sehat Utama memadukan keahlian tenaga medis berpengalaman dengan teknologi sistem informasi kesehatan terkini demi kenyamanan pasien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Akreditasi Paripurna</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tersertifikasi resmi oleh Kementerian Kesehatan RI dengan kepatuhan standar mutu dan keselamatan pasien tertinggi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Antrean Cepat Real-time</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Daftar janji temu dari rumah dan pantau giliran Anda melalui monitor live tanpa perlu menunggu berjam-jam di ruang tunggu.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Rekam Medis Digital (RME)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pencatatan riwayat diagnosis, vital signs, resep obat, dan dokumen lab tersimpan rapi dan aman di cloud.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Pelayanan Ramah & Holistik</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fasilitas ramah anak, ramah lansia, apotek terintegrasi, dan ruang tunggu ber-AC yang nyaman untuk keluarga Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LAYANAN & POLIKLINIK */}
      <section id="layanan" className="py-16 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">
                Layanan Kesehatan Kami
              </h2>
              <p className="text-3xl font-extrabold text-slate-900">
                Daftar Poliklinik & Spesialisasi
              </p>
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              Pilih poliklinik yang sesuai dengan kebutuhan medis Anda untuk berkonsultasi dengan dokter ahli kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const deptDocs = doctors.filter((d) => d.department_id === dept.id);
              const minFee = deptDocs.length > 0 ? Math.min(...deptDocs.map((d) => d.consultation_fee)) : 50000;

              return (
                <div
                  key={dept.id}
                  className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                        KODE: {dept.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {deptDocs.length} Dokter Praktik
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{dept.name}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {dept.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Biaya Konsultasi Mulai:</p>
                      <p className="text-base font-bold text-teal-700">{formatRupiah(minFee)}</p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setBookingDeptId(dept.id);
                        setBookingDoctorId(deptDocs[0]?.id || '');
                        setBookedResult(null);
                        setBookingModalOpen(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-semibold py-2.5 px-4 text-xs transition-all"
                    >
                      <span>Daftar ke Poli Ini</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* JADWAL DOKTER & KUOTA */}
      <section id="jadwal" className="py-16 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">
              Jadwal Praktik Dokter
            </h2>
            <p className="text-3xl font-extrabold text-slate-900">
              Informasi Waktu Pelayanan & Kuota
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Setiap sesi memiliki batas kuota harian untuk menjaga kualitas waktu pemeriksaan medis.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-8 space-y-4">
            {/* Day Selector */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Pilih Hari Praktik:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 0, label: 'Semua Hari' },
                  { id: 1, label: 'Senin' },
                  { id: 2, label: 'Selasa' },
                  { id: 3, label: 'Rabu' },
                  { id: 4, label: 'Kamis' },
                  { id: 5, label: 'Jumat' },
                  { id: 6, label: 'Sabtu' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDayFilter(d.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedDayFilter === d.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Department & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Filter Poliklinik:
                </label>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-teal-600"
                >
                  <option value="all">Semua Poliklinik</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cari Nama Dokter / Spesialisasi:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Contoh: dr. Budi, Spesialis Anak..."
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-teal-600"
                  />
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Schedules Table / Cards */}
          {filteredSchedules.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
              <Calendar className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Tidak ada jadwal ditemukan</p>
              <p className="text-xs text-slate-500 mt-1">
                Silakan coba ganti pilihan hari atau poli lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((sch) => {
                const doc = sch.doctor;
                return (
                  <div
                    key={sch.id}
                    className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 border border-teal-200">
                          {getDayName(sch.day_of_week)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 font-mono">
                          {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)} WIB
                        </span>
                      </div>

                      {/* Doctor info */}
                      <div className="flex items-start gap-3 my-3">
                        <img
                          src={doc?.photo_url || ''}
                          alt={doc?.name || 'Dokter'}
                          className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm text-slate-900 leading-snug">{doc?.title}</p>
                          <p className="text-xs text-teal-700 font-medium mt-0.5">{doc?.specialization}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            SIP: {doc?.sip_number}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-2">
                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-bold">Ruangan</p>
                          <p className="font-semibold text-slate-800">{doc?.room_number}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-bold">Kuota Harian</p>
                          <p className="font-semibold text-emerald-700">{sch.quota_per_day} Pasien</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Tarif Konsultasi</p>
                        <p className="text-xs font-bold text-slate-800">{formatRupiah(doc?.consultation_fee || 50000)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setBookingDeptId(doc?.department_id || '');
                          setBookingDoctorId(doc?.id || '');
                          setBookedResult(null);
                          setBookingModalOpen(true);
                        }}
                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 text-xs shadow-xs transition-colors"
                      >
                        Pilih & Daftar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* LOKASI & KONTAK */}
      <section id="kontak" className="py-16 bg-slate-50 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1">
                  Lokasi & Akses
                </h2>
                <p className="text-3xl font-extrabold text-slate-900">
                  Kunjungi Klinik Kami
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Lokasi strategis di pusat kota dengan akses mudah, area parkir luas, dan fasilitas ramah disabilitas.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                  <MapPin className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-slate-900">Alamat Lengkap</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Jl. Graha Medika Prima No. 88, Tebet, Jakarta Selatan 12870
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                  <Phone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-slate-900">Hotline Resepsionis & Ambulans</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Telp: (021) 555-0199 | WhatsApp: 0812-3456-7890
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                  <Clock className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-slate-900">Jam Layanan</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Senin - Sabtu: 08:00 - 21:00 WIB • IGD 24 Jam Buka Setiap Hari
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Preview Card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl overflow-hidden border border-slate-300 shadow-md bg-white p-2">
                <div className="h-80 w-full rounded-2xl bg-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/10 to-emerald-500/10 pointer-events-none" />
                  <MapPin className="h-12 w-12 text-teal-600 animate-bounce mb-2" />
                  <h3 className="font-bold text-base text-slate-900">Peta Navigasi Klinik Sehat Utama</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Jl. Graha Medika Prima No. 88 (500 meter dari Stasiun Tebet)
                  </p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
                  >
                    Buka Petunjuk Arah di Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BOOKING MODAL */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {bookedResult ? (
              /* Success E-Ticket Preview */
              <div className="text-center py-4 space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">Pendaftaran Berhasil!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan simpan nomor antrean Anda di bawah ini
                  </p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-300 p-5 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Nomor Antrean Anda
                  </p>
                  <p className="text-4xl font-black text-teal-900 font-mono">
                    {bookedResult.queueCode}
                  </p>
                  <div className="pt-2 text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Dokter:</strong> {bookedResult.doctorName}
                    </p>
                    <p>
                      <strong>Lokasi:</strong> {bookedResult.room}
                    </p>
                    <p>
                      <strong>Tanggal:</strong> {formatDateIndo(bookingDate)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Tunjukkan nomor antrean ini kepada petugas resepsionis saat tiba di klinik untuk proses check-in.
                </p>

                <div className="flex gap-2 justify-center pt-2">
                  <Link
                    href="/dashboard/pasien"
                    className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-700"
                  >
                    Buka Dashboard Pasien
                  </Link>
                  <button
                    onClick={() => {
                      setBookedResult(null);
                      setBookingModalOpen(false);
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Form Pendaftaran Janji Temu Pasien
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih poli, dokter, dan tentukan tanggal kunjungan Anda.
                  </p>
                </div>

                {/* Pilih Poli */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pilih Poliklinik *
                  </label>
                  <select
                    value={bookingDeptId}
                    onChange={(e) => {
                      setBookingDeptId(e.target.value);
                      const docs = doctors.filter((d) => d.department_id === e.target.value);
                      setBookingDoctorId(docs[0]?.id || '');
                    }}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-teal-600"
                  >
                    <option value="">-- Pilih Poliklinik --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pilih Dokter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pilih Dokter Spesialis *
                  </label>
                  <select
                    value={bookingDoctorId}
                    onChange={(e) => setBookingDoctorId(e.target.value)}
                    required
                    disabled={!bookingDeptId}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-teal-600 disabled:bg-slate-100"
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {availableDoctorsForDept.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title} ({doc.room_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal Kunjungan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Kunjungan *
                  </label>
                  <input
                    type="date"
                    min={todayDateStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-teal-600"
                  />
                </div>

                {/* Quota Indicator */}
                {selectedQuota && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                      selectedQuota.isFull
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <span>Status Kuota Dokter Tanggal Ini:</span>
                    <strong className="font-bold">
                      {selectedQuota.isFull
                        ? `Penuh (${selectedQuota.booked}/${selectedQuota.quota})`
                        : `Tersisa ${selectedQuota.remaining} dari ${selectedQuota.quota} Kuota`}
                    </strong>
                  </div>
                )}

                {/* Data Pasien */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Data Identitas Pasien
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Lengkap Pasien *
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nama sesuai KTP"
                      required
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        NIK (16 Digit)
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={patientNik}
                        onChange={(e) => setPatientNik(e.target.value)}
                        placeholder="3201..."
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nomor HP / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="0812..."
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Keluhan Awal
                    </label>
                    <textarea
                      rows={2}
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      placeholder="Contoh: Demam sejak kemarin, sakit tenggorokan..."
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={selectedQuota?.isFull}
                    className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold py-3 text-xs shadow-md transition-all"
                  >
                    {selectedQuota?.isFull ? 'Kuota Penuh - Pilih Tanggal Lain' : 'Konfirmasi Pendaftaran & Dapatkan Nomor Antrean'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

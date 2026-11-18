'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { ClinicService } from '@/lib/clinic-service';
import { useAuth, getRoleDashboardUrl } from '@/lib/auth-context';
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
  Star,
  Award,
  Building2,
  FileText,
  ChevronRight,
  ChevronLeft,
  Bed,
  Microscope,
  Pill,
  Ambulance,
  Eye,
  Smile,
  Baby,
  UserCheck,
  Ticket,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const { user, role } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Filter states for doctors & schedules
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedDayFilter, setSelectedDayFilter] = useState<number>(0); // 0 = Semua Hari
  const [searchDoctorQuery, setSearchDoctorQuery] = useState<string>('');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDeptId, setBookingDeptId] = useState('');
  const [bookingDoctorId, setBookingDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientNik, setPatientNik] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [complaint, setComplaint] = useState('');
  const [bookedResult, setBookedResult] = useState<{
    queueCode: string;
    queueNumber: number;
    doctorName: string;
    departmentName: string;
    room: string;
    date: string;
    patientName: string;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    const isoDate = now.toISOString().split('T')[0];
    setBookingDate(isoDate);

    const loadData = () => {
      setDepartments(ClinicService.getDepartments().filter((d) => d.is_active));
      setDoctors(ClinicService.getDoctors().filter((d) => d.is_active));
      setSchedules(ClinicService.getSchedules().filter((s) => s.is_active));
    };

    loadData();
    window.addEventListener('clinic_data_updated', loadData);
    return () => window.removeEventListener('clinic_data_updated', loadData);
  }, []);

  // Autofill if logged in
  useEffect(() => {
    if (user) {
      setPatientName(user.full_name || '');
      setPatientNik(user.nik || '');
      setPatientPhone(user.phone || '');
    }
  }, [user]);

  // Open booking modal for specific doctor
  const openBookingForDoctor = (doctor: Doctor) => {
    setBookingDeptId(doctor.department_id);
    setBookingDoctorId(doctor.id);
    setBookedResult(null);
    setBookingModalOpen(true);
  };

  const openGeneralBooking = () => {
    setBookedResult(null);
    if (departments.length > 0 && !bookingDeptId) {
      setBookingDeptId(departments[0].id);
    }
    setBookingModalOpen(true);
  };

  // Doctors available for selected department in booking modal
  const doctorsInBookingDept = bookingDeptId
    ? doctors.filter((d) => d.department_id === bookingDeptId)
    : doctors;

  // Selected doctor quota check
  const selectedQuota =
    bookingDoctorId && bookingDate
      ? ClinicService.checkDoctorQuota(bookingDoctorId, bookingDate)
      : null;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctorId || !patientName || !bookingDate) {
      toast.error('Harap lengkapi poliklinik, dokter, nama, dan tanggal kunjungan.');
      return;
    }

    if (patientNik && patientNik.length !== 16) {
      toast.error('NIK harus 16 digit angka.');
      return;
    }

    const res = ClinicService.bookAppointment({
      patient_id: user?.id || null,
      patient_name: patientName,
      patient_nik: patientNik,
      patient_phone: patientPhone,
      doctor_id: bookingDoctorId,
      appointment_date: bookingDate,
      complaint: complaint || 'Pemeriksaan rutin / konsultasi medis',
    });

    if (res.success && res.appointment) {
      const doc = doctors.find((d) => d.id === bookingDoctorId);
      setBookedResult({
        queueCode: res.appointment.queue_code,
        queueNumber: res.appointment.queue_number,
        doctorName: doc?.title || doc?.name || 'Dokter Spesialis',
        departmentName: doc?.department?.name || 'Poliklinik',
        room: doc?.room_number || 'Ruang Periksa',
        date: bookingDate,
        patientName: patientName,
      });
      toast.success('Pendaftaran kunjungan poliklinik berhasil!');
    } else {
      toast.error(res.error || 'Gagal melakukan pendaftaran kunjungan.');
    }
  };

  // Filtered doctors for Doctors & Schedules Section
  const filteredDoctors = doctors.filter((doc) => {
    const matchDept =
      selectedDeptFilter === 'all' || doc.department_id === selectedDeptFilter;
    const matchQuery =
      searchDoctorQuery.trim() === '' ||
      doc.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchDoctorQuery.toLowerCase());

    if (selectedDayFilter === 0) {
      return matchDept && matchQuery;
    }

    // Check if doctor has schedule on selected day
    const docSchedules = schedules.filter(
      (s) => s.doctor_id === doc.id && s.day_of_week === selectedDayFilter
    );
    return matchDept && matchQuery && docSchedules.length > 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Dynamic Navbar */}
      <Navbar onOpenBooking={openGeneralBooking} />

      {/* ==================================================================== */}
      {/* 1. HERO SECTION (2 Columns: Title, CTA left; High-res Medical Photo right) */}
      {/* ==================================================================== */}
      <section
        id="beranda"
        className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-blue-50/30 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-blue-50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 border border-blue-200/60 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-xs">
                <Heart className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                <span>Kesehatan Anda, Prioritas Kami</span>
              </div>

              {/* Big Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Pelayanan Terbaik untuk{' '}
                <span className="text-blue-600 underline decoration-blue-200 decoration-wavy decoration-2">
                  Kesehatan
                </span>{' '}
                Anda dan Keluarga
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Kami hadir dengan layanan medis berkualitas, dokter berpengalaman, dan fasilitas modern
                untuk memberikan perawatan terbaik dengan sistem registrasi & antrean digital terintegrasi.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#layanan"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-4 text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Lihat Layanan</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <button
                  onClick={openGeneralBooking}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-white hover:bg-blue-50 text-blue-700 font-bold px-7 py-4 text-sm sm:text-base shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Buat Janji Temu</span>
                </button>
              </div>

              {/* Micro assurance */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Pendaftaran Online 24 Jam
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Nomor Antrean Real-Time
                </span>
              </div>
            </div>

            {/* Right Illustration Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background blur ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-3xl blur-2xl -z-10" />

                {/* Hero Photo Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=900&auto=format&fit=crop&q=80"
                    alt="Pelayanan Dokter Ramah dan Profesional"
                    className="w-full h-[400px] sm:h-[460px] object-cover object-top hover:scale-105 transition-transform duration-500"
                  />

                  {/* Brand Tag Top Right */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-blue-100">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                      RUMAH SAKIT ANAVERSE
                    </span>
                  </div>

                  {/* Floating Doctor Info Card Bottom */}
                  <div className="absolute bottom-4 inset-x-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-blue-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Konsultasi Dokter Ahli</p>
                        <p className="text-[11px] text-slate-500">6 Poliklinik Spesialis Siap Melayani</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                      Buka Hari Ini
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. STATS BAR (4 White Rounded Cards) */}
      {/* ==================================================================== */}
      <section className="relative -mt-8 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-blue-900/5 border border-blue-100/80 flex items-center gap-4 hover:border-blue-300 transition-all">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">15+</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">Dokter Spesialis</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-blue-900/5 border border-blue-100/80 flex items-center gap-4 hover:border-blue-300 transition-all">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Heart className="h-6 w-6 fill-blue-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">25.000+</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">Pasien Terlayani</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-blue-900/5 border border-blue-100/80 flex items-center gap-4 hover:border-blue-300 transition-all">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">6+ Layanan</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">Poli & Rawat Medis</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-blue-900/5 border border-blue-100/80 flex items-center gap-4 hover:border-blue-300 transition-all">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">98%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">Kepuasan Pasien</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. SECTION TENTANG KAMI & INFO OPERASIONAL */}
      {/* ==================================================================== */}
      <section id="tentang" className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Clinic / Hospital Building Photo */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=900&auto=format&fit=crop&q=80"
                  alt="Gedung Rumah Sakit Anaverse"
                  className="w-full h-[380px] sm:h-[450px] object-cover hover:scale-105 transition-transform duration-500"
                />

                {/* Building Badge */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-blue-100 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Ambulance className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Armada Ambulans & IGD 24 Jam</p>
                    <p className="text-[11px] text-slate-500">Siaga Penuh Cepat Tanggap Darurat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info, Alamat, Jam Operasional, & 4 Poin Keunggulan */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-700">
                <span>Tentang Kami</span>
                <HelpCircle className="h-3 w-3" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Rumah Sakit & Klinik Anaverse <br className="hidden sm:inline" />
                Untuk Hidup yang Lebih Sehat
              </h2>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Rumah Sakit Anaverse berkomitmen memberikan pelayanan kesehatan profesional dengan standar
                akreditasi Kemenkes RI, teknologi medis terkini, dokter spesialis berdedikasi, dan lingkungan
                yang ramah serta nyaman bagi kesembuhan setiap pasien.
              </p>

              {/* Box Alamat Lokasi & Jam Operasional */}
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase">Alamat Lokasi Klinik:</p>
                    <p className="text-sm text-slate-700">
                      Jl. Graha Medika Prima No. 88, Kebayoran Baru, Jakarta Selatan 12870
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-blue-200/60">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase">Jam Operasional Pelayanan:</p>
                    <p className="text-sm text-slate-700">
                      <strong>IGD & Ambulans:</strong> 24 Jam Nonstop | <strong>Poli Rawat Jalan:</strong> Senin - Sabtu (08:00 - 21:00 WIB)
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Poin Keunggulan (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Pelayanan 24 Jam</p>
                    <p className="text-[11px] text-slate-500">Siap melayani kebutuhan darurat</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Tenaga Medis Profesional</p>
                    <p className="text-[11px] text-slate-500">Dokter spesialis bersertifikasi SIP</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Fasilitas Modern</p>
                    <p className="text-[11px] text-slate-500">Peralatan medis canggih & akurat</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Perawatan Berkualitas</p>
                    <p className="text-[11px] text-slate-500">Standar higienis paripurna</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. SECTION LAYANAN KAMI (Grid of Cards with realistic photos & icons) */}
      {/* ==================================================================== */}
      <section id="layanan" className="py-20 bg-slate-50/70 border-y border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                Layanan Unggulan
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Layanan Medis Kami
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-xl">
                Menyediakan rangkaian pelayanan kesehatan primer hingga rujukan spesialis terpadu
                untuk memenuhi kebutuhan kesehatan Anda.
              </p>
            </div>
            <a
              href="#jadwal"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 hover:gap-2 transition-all"
            >
              <span>Lihat Semua Layanan & Jadwal</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Grid 6 Layanan (Matching Visual Mockup) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {/* 1. Poli Spesialis */}
            <div
              onClick={() => {
                setSelectedDeptFilter('all');
                document.getElementById('jadwal')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all cursor-pointer flex flex-col"
            >
              <div className="h-32 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80"
                  alt="Poli Spesialis"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center relative flex-1 flex flex-col justify-between">
                <div className="h-10 w-10 mx-auto -mt-9 rounded-xl bg-white shadow-md text-blue-600 flex items-center justify-center border border-blue-100 relative z-10">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Poli Spesialis
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Dokter ahli beragam spesialisasi</p>
              </div>
            </div>

            {/* 2. Rawat Inap */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all cursor-pointer flex flex-col">
              <div className="h-32 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=500&auto=format&fit=crop&q=80"
                  alt="Rawat Inap"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center relative flex-1 flex flex-col justify-between">
                <div className="h-10 w-10 mx-auto -mt-9 rounded-xl bg-white shadow-md text-blue-600 flex items-center justify-center border border-blue-100 relative z-10">
                  <Bed className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Rawat Inap
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Kamar nyaman & perawat siaga 24 jam</p>
              </div>
            </div>

            {/* 3. IGD 24 Jam */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all cursor-pointer flex flex-col">
              <div className="h-32 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80"
                  alt="IGD 24 Jam"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  24 JAM
                </span>
              </div>
              <div className="p-4 text-center relative flex-1 flex flex-col justify-between">
                <div className="h-10 w-10 mx-auto -mt-9 rounded-xl bg-white shadow-md text-rose-600 flex items-center justify-center border border-rose-100 relative z-10">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  IGD 24 Jam
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Gawat darurat respon cepat</p>
              </div>
            </div>

            {/* 4. Radiologi */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all cursor-pointer flex flex-col">
              <div className="h-32 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80"
                  alt="Radiologi"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center relative flex-1 flex flex-col justify-between">
                <div className="h-10 w-10 mx-auto -mt-9 rounded-xl bg-white shadow-md text-blue-600 flex items-center justify-center border border-blue-100 relative z-10">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Radiologi
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Rontgen digital & USG resolusi tinggi</p>
              </div>
            </div>

            {/* 5. Laboratorium */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all cursor-pointer flex flex-col">
              <div className="h-32 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500&auto=format&fit=crop&q=80"
                  alt="Laboratorium"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center relative flex-1 flex flex-col justify-between">
                <div className="h-10 w-10 mx-auto -mt-9 rounded-xl bg-white shadow-md text-blue-600 flex items-center justify-center border border-blue-100 relative z-10">
                  <Microscope className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Laboratorium
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Pemeriksaan darah, urine & kimia</p>
              </div>
            </div>

            {/* 6. Farmasi */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 transition-all cursor-pointer flex flex-col">
              <div className="h-32 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1586015555751-63c2c9545ec0?w=500&auto=format&fit=crop&q=80"
                  alt="Farmasi"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center relative flex-1 flex flex-col justify-between">
                <div className="h-10 w-10 mx-auto -mt-9 rounded-xl bg-white shadow-md text-blue-600 flex items-center justify-center border border-blue-100 relative z-10">
                  <Pill className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Farmasi
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Apotek obat paten & racikan resmi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. SECTION DOKTER & JADWAL PRAKTIK (Carousel/Grid, Kuota, & Direct CTA) */}
      {/* ==================================================================== */}
      <section id="dokter" className="py-20 lg:py-28 bg-white">
        <div id="jadwal" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
                Dokter Kami
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Dokter Spesialis Berpengalaman
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                Tim dokter kami siap memberikan perawatan medis terbaik untuk Anda dan keluarga.
                Lihat jadwal praktik, status kuota, dan daftar langsung secara online.
              </p>
            </div>
          </div>

          {/* Interactive Filters: Department Pill Filters & Day Picker */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8 space-y-4">
            {/* Department Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Poli:</span>
              <button
                onClick={() => setSelectedDeptFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${selectedDeptFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                Semua Poliklinik ({doctors.length})
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptFilter(dept.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${selectedDeptFilter === dept.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>

            {/* Day of Week Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 uppercase mr-1">Hari:</span>
                {[
                  { val: 0, label: 'Semua Hari' },
                  { val: 1, label: 'Senin' },
                  { val: 2, label: 'Selasa' },
                  { val: 3, label: 'Rabu' },
                  { val: 4, label: 'Kamis' },
                  { val: 5, label: 'Jumat' },
                  { val: 6, label: 'Sabtu' },
                ].map((d) => (
                  <button
                    key={d.val}
                    onClick={() => setSelectedDayFilter(d.val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${selectedDayFilter === d.val
                        ? 'bg-blue-700 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari dokter atau spesialis..."
                  value={searchDoctorQuery}
                  onChange={(e) => setSearchDoctorQuery(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Grid of Doctor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => {
              // Find doctor schedules
              const docSchedules = schedules.filter((s) => s.doctor_id === doc.id);
              const todayIso = new Date().toISOString().split('T')[0];
              const quotaToday = ClinicService.checkDoctorQuota(doc.id, todayIso);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 flex flex-col justify-between transition-all group"
                >
                  <div>
                    {/* Doctor Photo */}
                    <div className="h-64 sm:h-72 overflow-hidden bg-slate-100 relative">
                      <img
                        src={doc.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80'}
                        alt={doc.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Rating pill top right */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-slate-100 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-slate-800">4.9</span>
                      </div>
                      {/* Department pill bottom left */}
                      <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                        {doc.department?.name || 'Poli Spesialis'}
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {doc.title || doc.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600">
                        {doc.specialization}
                      </p>

                      {/* Schedule Summary */}
                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {docSchedules.length > 0
                              ? docSchedules
                                .slice(0, 2)
                                .map((s) => `${getDayName(s.day_of_week)} (${s.start_time.slice(0, 5)})`)
                                .join(', ')
                              : 'Senin - Jumat (08:00 - 14:00)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-slate-500">Ruang: {doc.room_number}</span>
                          <span
                            className={`font-bold ${quotaToday.isFull
                                ? 'text-rose-600'
                                : quotaToday.remaining <= 5
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}
                          >
                            {quotaToday.isFull
                              ? 'Kuota Penuh'
                              : `Sisa Kuota: ${quotaToday.remaining}/${quotaToday.quota}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => openBookingForDoctor(doc)}
                      className="w-full rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold py-2.5 text-xs transition-all flex items-center justify-center gap-2 border border-blue-200 hover:border-transparent cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Daftar Kunjungan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. SECTION FASILITAS MODERN (High-contrast medical facility showcase) */}
      {/* ==================================================================== */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block mb-2">
              Fasilitas Terkini
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Fasilitas Modern untuk Perawatan Terbaik
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Lingkungan nyaman dan peralatan canggih berstandar internasional untuk mendukung kesembuhan optimal.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Facility 1 */}
            <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 relative group">
              <div className="h-36 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80"
                  alt="Ruang ICU"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-bold text-white">Ruang ICU</p>
                <p className="text-[10px] text-slate-400">Monitoring intensif</p>
              </div>
            </div>

            {/* Facility 2 */}
            <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 relative group">
              <div className="h-36 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=500&auto=format&fit=crop&q=80"
                  alt="Kamar VIP"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-bold text-white">Kamar VIP</p>
                <p className="text-[10px] text-slate-400">Privasi & kenyamanan</p>
              </div>
            </div>

            {/* Facility 3 */}
            <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 relative group">
              <div className="h-36 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80"
                  alt="Ruang Operasi"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-bold text-white">Ruang Operasi</p>
                <p className="text-[10px] text-slate-400">Steril laminar air flow</p>
              </div>
            </div>

            {/* Facility 4 */}
            <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 relative group">
              <div className="h-36 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500&auto=format&fit=crop&q=80"
                  alt="Laboratorium"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-bold text-white">Laboratorium</p>
                <p className="text-[10px] text-slate-400">Hasil cepat & terpercaya</p>
              </div>
            </div>

            {/* Facility 5 */}
            <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 relative group col-span-2 md:col-span-1">
              <div className="h-36 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=500&auto=format&fit=crop&q=80"
                  alt="Ambulans 24 Jam"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-bold text-white">Ambulans 24 Jam</p>
                <p className="text-[10px] text-slate-400">Siaga antar-jemput</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. SECTION BERITA & TIPS KESEHATAN (4 Cards matching mockup) */}
      {/* ==================================================================== */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                Edukasi & Informasi
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Berita & Tips Kesehatan
              </h2>
            </div>
            <span className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
              Lihat Semua Berita →
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Article 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="h-44 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=500&auto=format&fit=crop&q=80"
                    alt="Tips Jantung"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    Kesehatan Jantung
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    Tips Menjaga Kesehatan Jantung Setiap Hari dengan Pola Hidup Seimbang
                  </h3>
                </div>
              </div>
              <p className="px-4 pb-4 text-[11px] text-slate-400">18 Mei 2026</p>
            </div>

            {/* Article 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="h-44 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=80"
                    alt="Imunisasi Anak"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    Anak
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    Pentingnya Imunisasi untuk Anak Sejak Dini untuk Cegah Penyakit Berbahaya
                  </h3>
                </div>
              </div>
              <p className="px-4 pb-4 text-[11px] text-slate-400">18 Mei 2026</p>
            </div>

            {/* Article 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="h-44 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop&q=80"
                    alt="Makanan Sehat"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    Gaya Hidup
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    Makanan Sehat untuk Gaya Hidup Seimbang dan Menjaga Imunitas Tubuh
                  </h3>
                </div>
              </div>
              <p className="px-4 pb-4 text-[11px] text-slate-400">16 Mei 2026</p>
            </div>

            {/* Article 4 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="h-44 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=500&auto=format&fit=crop&q=80"
                    alt="Perawatan Lansia"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    Lansia
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    Perawatan Terbaik untuk Orang Tersayang: Menjaga Kualitas Hidup Lansia
                  </h3>
                </div>
              </div>
              <p className="px-4 pb-4 text-[11px] text-slate-400">14 Mei 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. FOOTER & EMERGENCY BANNER */}
      {/* ==================================================================== */}
      <Footer onOpenBooking={openGeneralBooking} />

      {/* ==================================================================== */}
      {/* 9. INTERACTIVE APPOINTMENT BOOKING MODAL */}
      {/* ==================================================================== */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-blue-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Pendaftaran Kunjungan Online</h3>
                  <p className="text-xs text-blue-100">Ambil nomor antrean poliklinik secara instan</p>
                </div>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {bookedResult ? (
                /* TIKET ANTREAN BERHASIL */
                <div className="text-center space-y-5">
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900">Pendaftaran Berhasil!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Silakan tunjukkan nomor antrean ini kepada petugas loket saat tiba di klinik.
                    </p>
                  </div>

                  {/* Tiket Fisik Digital */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                          NOMOR ANTREAN ANDA
                        </span>
                        <p className="text-3xl font-black text-blue-700 tracking-tight">
                          {bookedResult.queueCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Antrean Ke:</span>
                        <span className="text-2xl font-bold text-slate-800">
                          #{bookedResult.queueNumber}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Poliklinik:</span>
                        <span className="font-bold text-slate-800">{bookedResult.departmentName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Dokter:</span>
                        <span className="font-bold text-slate-800">{bookedResult.doctorName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Tanggal:</span>
                        <span className="font-bold text-slate-800">{formatDateIndo(bookedResult.date)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Ruang:</span>
                        <span className="font-bold text-slate-800">{bookedResult.room}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Pasien: <strong>{bookedResult.patientName}</strong></span>
                      <span className="text-blue-600 font-semibold">Status: Menunggu</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Link
                      href="/antrean"
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs text-center shadow-md transition-colors"
                    >
                      Pantau di Layar Antrean TV
                    </Link>
                    {user && (
                      <Link
                        href={getRoleDashboardUrl(user.role)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 text-xs text-center transition-colors"
                      >
                        Buka Dashboard Pasien
                      </Link>
                    )}
                    <button
                      onClick={() => setBookingModalOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 text-xs"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM PENDAFTARAN KUNJUNGAN */
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Poli */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Pilih Poliklinik *
                    </label>
                    <select
                      value={bookingDeptId}
                      onChange={(e) => {
                        setBookingDeptId(e.target.value);
                        setBookingDoctorId('');
                      }}
                      required
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Pilih Poliklinik --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dokter */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Pilih Dokter Spesialis *
                    </label>
                    <select
                      value={bookingDoctorId}
                      onChange={(e) => setBookingDoctorId(e.target.value)}
                      required
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Pilih Dokter --</option>
                      {doctorsInBookingDept.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.title || doc.name} - {doc.specialization} ({doc.room_number})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tanggal & Kuota Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Tanggal Kunjungan *
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Status Kuota Harian
                      </label>
                      <div className="h-10 rounded-xl bg-blue-50/80 border border-blue-200 px-3 flex items-center justify-between text-xs">
                        <span className="text-slate-600">Sisa Kuota:</span>
                        {selectedQuota ? (
                          <span
                            className={`font-bold ${selectedQuota.isFull
                                ? 'text-rose-600'
                                : 'text-blue-700'
                              }`}
                          >
                            {selectedQuota.isFull
                              ? 'PENUH'
                              : `${selectedQuota.remaining} / ${selectedQuota.quota}`}
                          </span>
                        ) : (
                          <span className="text-slate-400">Pilih dokter</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data Pasien */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nama Lengkap Pasien *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama sesuai KTP..."
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        NIK (16 Digit)
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="3201010000000000"
                        value={patientNik}
                        onChange={(e) => setPatientNik(e.target.value.replace(/\D/g, ''))}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Nomor HP / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="081234567890"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Keluhan / Alasan Kunjungan
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Demam sejak kemarin, batuk pilek, konsultasi rutin..."
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingModalOpen(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={selectedQuota?.isFull}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Konfirmasi & Dapatkan Antrean
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

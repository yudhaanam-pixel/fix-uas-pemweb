'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClinicService } from '@/lib/clinic-service';
import { Appointment, Doctor, Department } from '@/types/database';
import {
  Activity,
  ArrowLeft,
  Bell,
  Clock,
  Maximize2,
  Minimize2,
  Tv,
  Volume2,
} from 'lucide-react';

export default function QueueDisplayPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    const refreshQueues = () => {
      const today = new Date().toISOString().split('T')[0];
      const allAppts = ClinicService.getAppointments();
      const todayAppts = allAppts.filter((a) => a.appointment_date === today);
      setAppointments(todayAppts);
      setDoctors(ClinicService.getDoctors());
      setDepartments(ClinicService.getDepartments());
    };

    refreshQueues();
    const queueInterval = setInterval(refreshQueues, 3000);
    window.addEventListener('clinic_data_updated', refreshQueues);

    return () => {
      clearInterval(clockInterval);
      clearInterval(queueInterval);
      window.removeEventListener('clinic_data_updated', refreshQueues);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Play audio chime test for waiting room
  const playChime = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        'Nomor antrean U M U 0 0 2, silakan menuju Ruang Periksa 101'
      );
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/70 via-slate-50 to-white text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shadow-blue-600/20 shrink-0">
              <Activity className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
                <span>RUMAH SAKIT & KLINIK ANAVERSE</span>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                  MONITOR ANTREAN PASIEN
                </span>
              </h1>
              <p className="text-xs text-slate-600">
                Pusat Informasi & Pemanggilan Pasien Poliklinik Rawat Jalan
              </p>
            </div>
          </div>
        </div>

        {/* Clock & Fullscreen Control */}
        <div className="flex items-center gap-4 sm:gap-6 ml-auto">
          <div className="text-right">
            <p className="text-xs text-blue-600 font-medium">{currentDate}</p>
            <p className="text-2xl font-bold font-mono tracking-wider text-slate-900">
              {currentTime}{' '}
              <span className="text-xs font-sans font-semibold text-slate-500">WIB</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={playChime}
              title="Uji Suara Pemanggilan"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              title="Layar Penuh (Full Screen)"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/80 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Queue Counters Grid */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const deptDocs = doctors.filter((d) => d.department_id === dept.id);
            const deptDocIds = deptDocs.map((d) => d.id);

            // Active appointment in examination for this department
            const activeCalling = appointments.find(
              (a) => deptDocIds.includes(a.doctor_id) && a.status === 'diperiksa'
            );

            // Next queue waiting or checked in
            const nextQueue = appointments
              .filter(
                (a) =>
                  deptDocIds.includes(a.doctor_id) &&
                  (a.status === 'check_in' || a.status === 'menunggu')
              )
              .sort((a, b) => a.queue_number - b.queue_number)[0];

            const currentDoctor = activeCalling?.doctor || deptDocs[0];

            return (
              <div
                key={dept.id}
                className={`rounded-2xl bg-white border p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
                  activeCalling
                    ? 'border-blue-300 border-t-4 border-t-blue-600 shadow-md shadow-blue-900/5'
                    : 'border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                {/* Counter Header */}
                <div>
                  <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 gap-2">
                    <div>
                      <span className="inline-block text-xs font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                        {dept.code}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-1.5">{dept.name}</h2>
                    </div>
                    <span className="text-xs font-medium text-slate-500 shrink-0 pt-0.5">
                      {currentDoctor?.room_number || 'Ruang 101'}
                    </span>
                  </div>

                  {/* Calling Number Display */}
                  <div
                    className={`my-5 text-center py-6 px-4 rounded-xl border ${
                      activeCalling
                        ? 'bg-blue-50/80 border-blue-100'
                        : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                        activeCalling ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    >
                      {activeCalling ? 'SEDANG DIPERIKSA / DIPANGGIL' : 'MENUNGGU PASIEN BERIKUTNYA'}
                    </p>
                    <p
                      className={`text-5xl lg:text-6xl font-extrabold font-mono tracking-tight ${
                        activeCalling ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      {activeCalling ? activeCalling.queue_code : '--'}
                    </p>
                    {activeCalling && (
                      <p className="text-sm font-semibold text-slate-800 mt-2 truncate">
                        {activeCalling.patient_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer of the Counter */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase font-semibold">
                      Dokter Bertugas:
                    </p>
                    <p className="font-semibold text-slate-800 truncate max-w-[170px] mt-0.5">
                      {currentDoctor?.title || 'Dokter Spesialis'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400 uppercase font-semibold">
                      Antrean Berikutnya:
                    </p>
                    <p
                      className={`font-mono text-sm mt-0.5 ${
                        nextQueue
                          ? 'font-bold text-blue-600'
                          : 'font-medium text-slate-400'
                      }`}
                    >
                      {nextQueue ? nextQueue.queue_code : 'Kosong'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Running Announcement Ticker */}
      <footer className="border-t border-slate-200 bg-white py-3 px-4 sm:px-6 flex items-center gap-4 text-xs shadow-[0_-1px_3px_0_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider shrink-0 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
          <Bell className="h-3.5 w-3.5 text-blue-600 animate-bounce" />
          <span>Informasi Pasien</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <p className="inline-block text-slate-600 font-medium animate-marquee">
            📢 Pasien yang telah mendaftar online dimohon melakukan konfirmasi Check-in pada Meja Resepsionis / Front Office setibanya di klinik • Harap menyiapkan identitas diri (KTP/BPJS) • Mohon selalu memperhatikan nomor antrean pada layar ini • Layanan Farmasi dan Apotek buka 24 Jam • Terima kasih telah mempercayakan kesehatan keluarga Anda kepada Klinik Sehat Utama.
          </p>
        </div>
      </footer>
    </div>
  );
}


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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Activity className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>KLINIK SEHAT UTAMA</span>
                <span className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-mono uppercase">
                  MONITOR ANTREAN PASIEN
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Pusat Informasi & Pemanggilan Pasien Poliklinik Rawat Jalan
              </p>
            </div>
          </div>
        </div>

        {/* Clock & Fullscreen Control */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-teal-400 font-semibold">{currentDate}</p>
            <p className="text-2xl font-black font-mono tracking-wider text-white">
              {currentTime} <span className="text-xs font-sans text-slate-400">WIB</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={playChime}
              title="Uji Suara Pemanggilan"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700 transition-colors"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              title="Layar Penuh (Full Screen)"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
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
                className="rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-teal-500/50 transition-all"
              >
                {/* Active Indicator Top Light */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    activeCalling
                      ? 'bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                />

                {/* Counter Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded-md">
                        {dept.code}
                      </span>
                      <h2 className="text-lg font-black text-white mt-1">{dept.name}</h2>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {currentDoctor?.room_number || 'Ruang 101'}
                    </span>
                  </div>

                  {/* Calling Number Display */}
                  <div className="my-6 text-center py-6 px-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/90 shadow-inner">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      {activeCalling ? 'SEDANG DIPERIKSA / DIPANGGIL' : 'MENUNGGU PASIEN BERIKUTNYA'}
                    </p>
                    <p
                      className={`text-5xl lg:text-6xl font-black font-mono tracking-tight ${
                        activeCalling
                          ? 'text-emerald-400 animate-pulse'
                          : 'text-slate-600'
                      }`}
                    >
                      {activeCalling ? activeCalling.queue_code : '--'}
                    </p>
                    {activeCalling && (
                      <p className="text-xs font-semibold text-slate-300 mt-2 truncate">
                        {activeCalling.patient_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer of the Counter */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Dokter Bertugas:</p>
                    <p className="font-semibold text-slate-200 truncate max-w-[150px]">
                      {currentDoctor?.title || 'Dokter Spesialis'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Antrean Berikutnya:</p>
                    <p className="font-mono font-bold text-teal-400 text-sm">
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
      <footer className="border-t border-slate-800 bg-slate-900 py-3 px-6 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-teal-400 font-bold uppercase tracking-wider shrink-0 bg-teal-950/70 border border-teal-800/80 px-2.5 py-1 rounded-md">
          <Bell className="h-3.5 w-3.5 animate-bounce" />
          <span>Informasi Pasien</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <p className="inline-block text-slate-300 font-medium animate-marquee">
            📢 Pasien yang telah mendaftar online dimohon melakukan konfirmasi Check-in pada Meja Resepsionis / Front Office setibanya di klinik • Harap menyiapkan identitas diri (KTP/BPJS) • Mohon selalu memperhatikan nomor antrean pada layar ini • Layanan Farmasi dan Apotek buka 24 Jam • Terima kasih telah mempercayakan kesehatan keluarga Anda kepada Klinik Sehat Utama.
          </p>
        </div>
      </footer>
    </div>
  );
}


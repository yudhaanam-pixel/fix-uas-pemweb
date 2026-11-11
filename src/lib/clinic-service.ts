'use client';

import {
  Department,
  Doctor,
  Schedule,
  Appointment,
  MedicalRecord,
  Profile,
  AppointmentStatus,
  ClinicStats,
} from '@/types/database';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_SCHEDULES,
  INITIAL_APPOINTMENTS,
  INITIAL_MEDICAL_RECORDS,
  DEMO_PROFILES,
} from '@/lib/mock-data';

const STORAGE_KEYS = {
  DEPARTMENTS: 'sim_klinik_departments',
  DOCTORS: 'sim_klinik_doctors',
  SCHEDULES: 'sim_klinik_schedules',
  APPOINTMENTS: 'sim_klinik_appointments',
  MEDICAL_RECORDS: 'sim_klinik_medical_records',
  PROFILES: 'sim_klinik_profiles',
};

function getStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error('Error reading localStorage', e);
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
    // Dispatch custom event so other components listening on same tab update instantly
    window.dispatchEvent(new Event('clinic_data_updated'));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

export const ClinicService = {
  // --- MASTER DATA: DEPARTMENTS ---
  getDepartments(): Department[] {
    return getStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  addDepartment(dept: Omit<Department, 'id'>): Department {
    const departments = this.getDepartments();
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    departments.push(newDept);
    setStorage(STORAGE_KEYS.DEPARTMENTS, departments);
    return newDept;
  },

  updateDepartment(id: string, updates: Partial<Department>): Department | null {
    const departments = this.getDepartments();
    const index = departments.findIndex((d) => d.id === id);
    if (index === -1) return null;
    departments[index] = { ...departments[index], ...updates };
    setStorage(STORAGE_KEYS.DEPARTMENTS, departments);
    return departments[index];
  },

  deleteDepartment(id: string): boolean {
    const departments = this.getDepartments();
    const filtered = departments.filter((d) => d.id !== id);
    setStorage(STORAGE_KEYS.DEPARTMENTS, filtered);
    return true;
  },

  // --- MASTER DATA: DOCTORS ---
  getDoctors(): Doctor[] {
    const docs = getStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const depts = this.getDepartments();
    return docs.map((doc) => ({
      ...doc,
      department: depts.find((d) => d.id === doc.department_id),
    }));
  },

  getDoctorById(id: string): Doctor | undefined {
    return this.getDoctors().find((d) => d.id === id);
  },

  addDoctor(doctor: Omit<Doctor, 'id'>): Doctor {
    const doctors = getStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const newDoc: Doctor = {
      ...doctor,
      id: `doc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    doctors.push(newDoc);
    setStorage(STORAGE_KEYS.DOCTORS, doctors);
    return newDoc;
  },

  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const doctors = getStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const index = doctors.findIndex((d) => d.id === id);
    if (index === -1) return null;
    doctors[index] = { ...doctors[index], ...updates };
    setStorage(STORAGE_KEYS.DOCTORS, doctors);
    return doctors[index];
  },

  deleteDoctor(id: string): boolean {
    const doctors = getStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const filtered = doctors.filter((d) => d.id !== id);
    setStorage(STORAGE_KEYS.DOCTORS, filtered);
    return true;
  },

  // --- MASTER DATA: SCHEDULES ---
  getSchedules(): Schedule[] {
    const schedules = getStorage<Schedule[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    const doctors = this.getDoctors();
    return schedules.map((sch) => ({
      ...sch,
      doctor: doctors.find((d) => d.id === sch.doctor_id),
    }));
  },

  getSchedulesByDoctor(doctorId: string): Schedule[] {
    return this.getSchedules().filter((s) => s.doctor_id === doctorId && s.is_active);
  },

  addSchedule(schedule: Omit<Schedule, 'id'>): Schedule {
    const schedules = getStorage<Schedule[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    const newSch: Schedule = {
      ...schedule,
      id: `sch-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    schedules.push(newSch);
    setStorage(STORAGE_KEYS.SCHEDULES, schedules);
    return newSch;
  },

  updateSchedule(id: string, updates: Partial<Schedule>): Schedule | null {
    const schedules = getStorage<Schedule[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
    const index = schedules.findIndex((s) => s.id === id);
    if (index === -1) return null;
    schedules[index] = { ...schedules[index], ...updates };
    setStorage(STORAGE_KEYS.SCHEDULES, schedules);
    return schedules[index];
  },

  // --- KUOTA & BOOKING APPOINTMENTS ---
  checkDoctorQuota(
    doctorId: string,
    dateStr: string
  ): { booked: number; quota: number; isFull: boolean; remaining: number } {
    const schedules = this.getSchedulesByDoctor(doctorId);
    const dateObj = new Date(dateStr);
    // JS: 0=Minggu, 1=Senin, ..., 6=Sabtu. Convert to 1=Senin..7=Minggu
    let dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;

    const matchedSchedule = schedules.find((s) => s.day_of_week === dayOfWeek) || schedules[0];
    const quota = matchedSchedule ? matchedSchedule.quota_per_day : 30;

    const appointments = this.getAppointments().filter(
      (a) => a.doctor_id === doctorId && a.appointment_date === dateStr && a.status !== 'batal'
    );

    const booked = appointments.length;
    const isFull = booked >= quota;
    const remaining = Math.max(0, quota - booked);

    return { booked, quota, isFull, remaining };
  },

  getAppointments(): Appointment[] {
    const list = getStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const doctors = this.getDoctors();
    const profiles = this.getProfiles();
    const records = this.getMedicalRecords();

    return list.map((a) => ({
      ...a,
      doctor: doctors.find((d) => d.id === a.doctor_id),
      patient: a.patient_id ? profiles.find((p) => p.id === a.patient_id) : undefined,
      medical_record: records.find((m) => m.appointment_id === a.id),
    }));
  },

  bookAppointment(params: {
    patient_id?: string | null;
    patient_name: string;
    patient_nik?: string;
    patient_phone?: string;
    doctor_id: string;
    appointment_date: string;
    complaint?: string;
    is_walk_in?: boolean;
  }): { success: boolean; appointment?: Appointment; error?: string } {
    const quotaCheck = this.checkDoctorQuota(params.doctor_id, params.appointment_date);
    if (quotaCheck.isFull) {
      return {
        success: false,
        error: `Kuota dokter pada tanggal tersebut sudah penuh (${quotaCheck.booked}/${quotaCheck.quota}). Silakan pilih tanggal atau dokter lain.`,
      };
    }

    const doctor = this.getDoctorById(params.doctor_id);
    const deptCode = doctor?.department?.code || 'POL';
    const queueNumber = quotaCheck.booked + 1;
    const queueCode = `${deptCode}-${String(queueNumber).padStart(3, '0')}`;

    const rawList = getStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patient_id: params.patient_id || null,
      patient_name: params.patient_name,
      patient_nik: params.patient_nik || null,
      patient_phone: params.patient_phone || null,
      doctor_id: params.doctor_id,
      appointment_date: params.appointment_date,
      queue_number: queueNumber,
      queue_code: queueCode,
      status: params.is_walk_in ? 'check_in' : 'menunggu',
      complaint: params.complaint || 'Pemeriksaan rutin / keluhan umum',
      is_walk_in: Boolean(params.is_walk_in),
      check_in_time: params.is_walk_in ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };

    rawList.push(newAppointment);
    setStorage(STORAGE_KEYS.APPOINTMENTS, rawList);

    return {
      success: true,
      appointment: {
        ...newAppointment,
        doctor,
      },
    };
  },

  updateAppointmentStatus(id: string, status: AppointmentStatus): Appointment | null {
    const rawList = getStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const index = rawList.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updates: Partial<Appointment> = { status, updated_at: new Date().toISOString() };
    const nowIso = new Date().toISOString();

    if (status === 'check_in' && !rawList[index].check_in_time) {
      updates.check_in_time = nowIso;
    } else if (status === 'diperiksa' && !rawList[index].called_time) {
      updates.called_time = nowIso;
    } else if (status === 'selesai' && !rawList[index].completed_time) {
      updates.completed_time = nowIso;
    }

    rawList[index] = { ...rawList[index], ...updates };
    setStorage(STORAGE_KEYS.APPOINTMENTS, rawList);
    return rawList[index];
  },

  // --- REKAM MEDIS (MEDICAL RECORDS) ---
  getMedicalRecords(): MedicalRecord[] {
    return getStorage<MedicalRecord[]>(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
  },

  getMedicalRecordsByPatient(patientId: string): MedicalRecord[] {
    const records = this.getMedicalRecords();
    const doctors = this.getDoctors();
    return records
      .filter((r) => r.patient_id === patientId)
      .map((r) => ({
        ...r,
        doctor: doctors.find((d) => d.id === r.doctor_id),
      }));
  },

  saveMedicalRecord(recordData: Omit<MedicalRecord, 'id' | 'created_at'>): MedicalRecord {
    const records = getStorage<MedicalRecord[]>(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    const existingIndex = records.findIndex((r) => r.appointment_id === recordData.appointment_id);

    let savedRecord: MedicalRecord;
    const nowIso = new Date().toISOString();

    if (existingIndex !== -1) {
      savedRecord = {
        ...records[existingIndex],
        ...recordData,
        updated_at: nowIso,
      };
      records[existingIndex] = savedRecord;
    } else {
      savedRecord = {
        ...recordData,
        id: `med-${Date.now()}`,
        created_at: nowIso,
        updated_at: nowIso,
      };
      records.push(savedRecord);
    }

    setStorage(STORAGE_KEYS.MEDICAL_RECORDS, records);

    // Also automatically update appointment status to 'selesai'
    this.updateAppointmentStatus(recordData.appointment_id, 'selesai');

    return savedRecord;
  },

  // --- PROFILES & USER MANAGEMENT ---
  getProfiles(): Profile[] {
    return getStorage<Profile[]>(STORAGE_KEYS.PROFILES, DEMO_PROFILES);
  },

  getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  },

  updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === id);
    if (index === -1) return null;
    profiles[index] = { ...profiles[index], ...updates, updated_at: new Date().toISOString() };
    setStorage(STORAGE_KEYS.PROFILES, profiles);
    return profiles[index];
  },

  // --- STATS & REPORTING ---
  getClinicStats(): ClinicStats {
    const today = new Date().toISOString().split('T')[0];
    const appointments = this.getAppointments().filter((a) => a.appointment_date === today);
    const doctors = this.getDoctors().filter((d) => d.is_active);
    const depts = this.getDepartments().filter((d) => d.is_active);

    return {
      totalPatientsToday: appointments.length,
      waitingCount: appointments.filter((a) => a.status === 'menunggu').length,
      checkedInCount: appointments.filter((a) => a.status === 'check_in').length,
      inExaminationCount: appointments.filter((a) => a.status === 'diperiksa').length,
      completedCount: appointments.filter((a) => a.status === 'selesai').length,
      activeDoctorsCount: doctors.length,
      totalDepartmentsCount: depts.length,
    };
  },

  resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.DOCTORS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.MEDICAL_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    window.dispatchEvent(new Event('clinic_data_updated'));
  },
};


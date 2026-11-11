export type UserRole = 'admin' | 'petugas' | 'dokter' | 'pasien';

export type AppointmentStatus = 'menunggu' | 'check_in' | 'diperiksa' | 'selesai' | 'batal';

export type GenderType = 'L' | 'P';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  nik?: string | null;
  gender?: GenderType | null;
  birth_date?: string | null;
  address?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  icon?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface Doctor {
  id: string;
  user_id?: string | null;
  department_id: string;
  name: string;
  title: string;
  sip_number: string;
  specialization: string;
  bio?: string | null;
  room_number: string;
  consultation_fee: number;
  photo_url?: string | null;
  is_active: boolean;
  created_at?: string;
  // Joins
  department?: Department;
}

export interface Schedule {
  id: string;
  doctor_id: string;
  day_of_week: number; // 1 = Senin, 7 = Minggu
  start_time: string;
  end_time: string;
  quota_per_day: number;
  is_active: boolean;
  created_at?: string;
  // Joins
  doctor?: Doctor;
}

export interface Appointment {
  id: string;
  patient_id?: string | null;
  patient_name: string;
  patient_nik?: string | null;
  patient_phone?: string | null;
  doctor_id: string;
  schedule_id?: string | null;
  appointment_date: string;
  queue_number: number;
  queue_code: string;
  status: AppointmentStatus;
  complaint?: string | null;
  is_walk_in: boolean;
  check_in_time?: string | null;
  called_time?: string | null;
  completed_time?: string | null;
  created_at: string;
  updated_at?: string;
  // Joins
  doctor?: Doctor;
  patient?: Profile;
  medical_record?: MedicalRecord;
}

export interface MedicalRecord {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  // Vital Signs
  systolic?: number | null;
  diastolic?: number | null;
  heart_rate?: number | null;
  respiratory_rate?: number | null;
  temperature?: number | null;
  weight?: number | null;
  height?: number | null;
  // SOAP
  anamnesis: string;
  physical_examination?: string | null;
  diagnosis_icd10?: string | null;
  diagnosis_description: string;
  therapy_plan?: string | null;
  prescription_text?: string | null;
  attachment_urls: string[];
  doctor_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joins
  doctor?: Doctor;
  patient?: Profile;
  appointment?: Appointment;
}

export interface ClinicStats {
  totalPatientsToday: number;
  waitingCount: number;
  checkedInCount: number;
  inExaminationCount: number;
  completedCount: number;
  activeDoctorsCount: number;
  totalDepartmentsCount: number;
}


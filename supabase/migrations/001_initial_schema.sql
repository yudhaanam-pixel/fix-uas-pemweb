-- ====================================================================
-- SISTEM INFORMASI MANAJEMEN KLINIK KESEHATAN (SIM-KLINIK)
-- PostgreSQL Migration for Supabase
-- ====================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'petugas', 'dokter', 'pasien');
CREATE TYPE appointment_status AS ENUM ('menunggu', 'check_in', 'diperiksa', 'selesai', 'batal');
CREATE TYPE gender_type AS ENUM ('L', 'P');

-- 2. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'pasien',
    phone TEXT,
    nik VARCHAR(16),
    gender gender_type,
    birth_date DATE,
    address TEXT,
    blood_type VARCHAR(5),
    allergies TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. POLIKLINIK / DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DOKTER / DOCTORS
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    sip_number TEXT NOT NULL,
    specialization TEXT NOT NULL,
    bio TEXT,
    room_number VARCHAR(20) NOT NULL,
    consultation_fee NUMERIC(12, 2) NOT NULL DEFAULT 50000,
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. JADWAL PRAKTIK / SCHEDULES
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1: Senin, 7: Minggu
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    quota_per_day INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PENDAFTARAN & ANTREAN / APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_nik VARCHAR(16),
    patient_phone TEXT,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    queue_number INT NOT NULL,
    queue_code VARCHAR(20) NOT NULL,
    status appointment_status NOT NULL DEFAULT 'menunggu',
    complaint TEXT,
    is_walk_in BOOLEAN NOT NULL DEFAULT false,
    check_in_time TIMESTAMPTZ,
    called_time TIMESTAMPTZ,
    completed_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_doctor_date_queue UNIQUE (doctor_id, appointment_date, queue_number)
);

-- 7. REKAM MEDIS / MEDICAL RECORDS
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    
    -- Tanda-Tanda Vital (Vital Signs)
    systolic INT,
    diastolic INT,
    heart_rate INT,
    respiratory_rate INT,
    temperature NUMERIC(4, 1),
    weight NUMERIC(5, 2),
    height NUMERIC(5, 2),
    
    -- SOAP
    anamnesis TEXT NOT NULL, -- Subjective
    physical_examination TEXT, -- Objective
    diagnosis_icd10 VARCHAR(20), -- Assessment code
    diagnosis_description TEXT NOT NULL, -- Assessment text
    therapy_plan TEXT, -- Plan
    prescription_text TEXT, -- Resep obat & dosis
    
    -- Cloudflare R2 Attachments
    attachment_urls TEXT[] DEFAULT '{}',
    doctor_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_appointments_date_doctor ON public.appointments(appointment_date, doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctors_department ON public.doctors(department_id);

-- TRIGGER FUNCTION: AUTO UPDATE UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTION: GET NEXT QUEUE NUMBER AND CHECK QUOTA
CREATE OR REPLACE FUNCTION get_next_queue_and_validate(
    p_doctor_id UUID,
    p_date DATE,
    p_schedule_id UUID
)
RETURNS TABLE (next_queue INT, dept_code VARCHAR, current_quota INT) AS $$
DECLARE
    v_count INT;
    v_quota INT;
    v_code VARCHAR;
BEGIN
    -- Dapatkan kuota dari jadwal
    SELECT quota_per_day INTO v_quota
    FROM public.schedules
    WHERE id = p_schedule_id;

    IF v_quota IS NULL THEN
        v_quota := 30; -- Default kuota jika tidak terjadwal spesifik
    END IF;

    -- Hitung pendaftaran aktif pada tanggal tersebut
    SELECT COUNT(*) INTO v_count
    FROM public.appointments
    WHERE doctor_id = p_doctor_id AND appointment_date = p_date AND status != 'batal';

    IF v_count >= v_quota THEN
        RAISE EXCEPTION 'Kuota dokter untuk tanggal ini sudah penuh (% dari %)', v_count, v_quota;
    END IF;

    -- Ambil kode poli
    SELECT d.code INTO v_code
    FROM public.doctors doc
    JOIN public.departments d ON doc.department_id = d.id
    WHERE doc.id = p_doctor_id;

    RETURN QUERY SELECT (v_count + 1)::INT, COALESCE(v_code, 'POL')::VARCHAR, v_quota;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: AUTOMATIC PROFILE CREATION ON USER SIGNUP IN SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'pasien'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- POLICIES:
-- 1. Departments, Doctors, Schedules: Public read-only, Admin can edit
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admin manage departments" ON public.departments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Admin manage doctors" ON public.doctors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Public read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Admin manage schedules" ON public.schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 2. Profiles
CREATE POLICY "Read own profile or staff can read all" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'petugas', 'dokter'))
);
CREATE POLICY "Update own profile or admin can update" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 3. Appointments
CREATE POLICY "Patient can see own appointments" ON public.appointments FOR SELECT USING (
  auth.uid() = patient_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'petugas', 'dokter'))
);
CREATE POLICY "Patient can book appointment" ON public.appointments FOR INSERT WITH CHECK (
  auth.uid() = patient_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'petugas'))
);
CREATE POLICY "Staff can update appointment" ON public.appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'petugas', 'dokter'))
);

-- 4. Medical Records
CREATE POLICY "Patient can view own medical records" ON public.medical_records FOR SELECT USING (
  auth.uid() = patient_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'petugas', 'dokter'))
);
CREATE POLICY "Doctor or admin can insert medical records" ON public.medical_records FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'dokter'))
);
CREATE POLICY "Doctor or admin can update medical records" ON public.medical_records FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'dokter'))
);


-- ====================================================================
-- SEED DATA UNTUK SISTEM INFORMASI MANAJEMEN KLINIK (SIM-KLINIK)
-- ====================================================================

-- 1. SEED DEPARTMENTS (POLIKLINIK)
INSERT INTO public.departments (id, name, code, description, icon, is_active) VALUES
('11111111-1111-1111-1111-111111111101', 'Poli Umum', 'UMU', 'Pelayanan kesehatan primer, diagnosis umum, dan pemeriksaan kesehatan rutin.', 'Stethoscope', true),
('11111111-1111-1111-1111-111111111102', 'Poli Gigi & Mulut', 'GIG', 'Perawatan karies, pembersihan karang gigi (scaling), tambal gigi, dan bedah mulut ringan.', 'Smile', true),
('11111111-1111-1111-1111-111111111103', 'Poli Anak (Pediatri)', 'ANK', 'Tumbuh kembang anak, imunisasi lengkap, dan penanganan penyakit bayi hingga remaja.', 'Baby', true),
('11111111-1111-1111-1111-111111111104', 'Poli Penyakit Dalam', 'INT', 'Penanganan penyakit organ dalam: diabetes, hipertensi, gangguan lambung, dan ginjal.', 'Activity', true),
('11111111-1111-1111-1111-111111111105', 'Poli Mata', 'MAT', 'Pemeriksaan refraksi mata, glaukoma, katarak, dan gangguan penglihatan.', 'Eye', true),
('11111111-1111-1111-1111-111111111106', 'Poli KIA & Kandungan', 'KIA', 'Pemeriksaan kehamilan (USG), pasca persalinan, program KB, dan kesehatan reproduksi.', 'Heart', true)
ON CONFLICT (code) DO NOTHING;

-- 2. SEED DOCTORS
INSERT INTO public.doctors (id, department_id, name, title, sip_number, specialization, bio, room_number, consultation_fee, photo_url, is_active) VALUES
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'dr. Budi Santoso', 'dr. Budi Santoso, Sp.KKLP', 'SIP/440/1029/DINKES/2021', 'Dokter Umum & Kedokteran Keluarga', 'Berpengalaman 10+ tahun dalam pelayanan medis primer keluarga dan kedaruratan umum.', 'Ruang 101', 50000, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80', true),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'drg. Annisa Nurul', 'drg. Annisa Nurul, Sp.KG', 'SIP/440/0842/DINKES/2022', 'Dokter Gigi Spesialis Konservasi Gigi', 'Fokus pada estetika gigi, perawatan saluran akar, dan restorasi senyum yang nyaman.', 'Ruang 102', 80000, 'https://images.unsplash.com/photo-1594824813515-783262fb2c86?w=400&q=80', true),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'dr. Hendra Wijaya', 'dr. Hendra Wijaya, Sp.A', 'SIP/440/1203/DINKES/2019', 'Spesialis Anak', 'Ramah terhadap anak, ahli dalam evaluasi tumbuh kembang dan penanganan infeksi anak.', 'Ruang 103', 100000, 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80', true),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'dr. Siti Rahmawati', 'dr. Siti Rahmawati, Sp.PD', 'SIP/440/0911/DINKES/2020', 'Spesialis Penyakit Dalam', 'Spesialis dalam manajemen metabolik, diabetes, hipertensi, dan autoimun.', 'Ruang 104', 120000, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', true),
('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 'dr. Farhan Malik', 'dr. Farhan Malik, Sp.M', 'SIP/440/1325/DINKES/2021', 'Spesialis Mata', 'Ahli dalam pemeriksaan retina, koreksi refraksi modern, dan bedah katarak.', 'Ruang 105', 95000, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80', true),
('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111106', 'dr. Ratna Dewi', 'dr. Ratna Dewi, Sp.OG', 'SIP/440/1442/DINKES/2018', 'Spesialis Obstetri & Ginekologi', 'Menemani ibu dari perencanaan kehamilan, USG 4D janin, hingga masa nifas.', 'Ruang 106', 130000, 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED SCHEDULES (MINIMAL 5 JADWAL PRAKTIK)
INSERT INTO public.schedules (id, doctor_id, day_of_week, start_time, end_time, quota_per_day, is_active) VALUES
-- 1. dr. Budi Santoso (Poli Umum) : Senin
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 1, '08:00:00', '14:00:00', 35, true),
-- 2. dr. Budi Santoso (Poli Umum) : Selasa
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 2, '08:00:00', '14:00:00', 35, true),
-- 3. drg. Annisa Nurul (Poli Gigi) : Senin
('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222202', 1, '09:00:00', '15:00:00', 20, true),
-- 4. dr. Hendra Wijaya (Poli Anak) : Selasa
('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222203', 2, '08:30:00', '13:30:00', 25, true),
-- 5. dr. Siti Rahmawati (Poli Penyakit Dalam) : Senin
('33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222204', 1, '10:00:00', '16:00:00', 25, true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED USERS / PROFILES (MINIMAL 5 DATA PASIEN + ADMIN, PETUGAS, DOKTER)
-- Catatan: Jika menggunakan auth.users di Supabase, buat akun via Supabase Auth atau query auth.users
DO $$
BEGIN
  -- Insert dummy auth users jika schema mengaktifkan FK ke auth.users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
    VALUES 
    ('44444444-4444-4444-4444-444444444401', '00000000-0000-0000-0000-000000000000', 'admin@kliniksehat.id', '$2a$10$wT8BvO4Y4lP.9hG0sFfKq.kLqBZZfN82YmZrqs7e9U31/1Z5sXzT.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Drs. Supriyanto, M.Kes","role":"admin"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('44444444-4444-4444-4444-444444444402', '00000000-0000-0000-0000-000000000000', 'petugas@kliniksehat.id', '$2a$10$wT8BvO4Y4lP.9hG0sFfKq.kLqBZZfN82YmZrqs7e9U31/1Z5sXzT.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dewi Lestari, A.Md.RMIK","role":"petugas"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('44444444-4444-4444-4444-444444444403', '00000000-0000-0000-0000-000000000000', 'dokter.budi@kliniksehat.id', '$2a$10$wT8BvO4Y4lP.9hG0sFfKq.kLqBZZfN82YmZrqs7e9U31/1Z5sXzT.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"dr. Budi Santoso, Sp.KKLP","role":"dokter"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    -- 5 Pasien
    ('44444444-4444-4444-4444-444444444404', '00000000-0000-0000-0000-000000000000', 'pasien@kliniksehat.id', '$2a$10$wT8BvO4Y4lP.9hG0sFfKq.kLqBZZfN82YmZrqs7e9U31/1Z5sXzT.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rian Hidayat Kusuma","role":"pasien"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('44444444-4444-4444-4444-444444444405', '00000000-0000-0000-0000-000000000000', 'ratnawati@gmail.com', '$2a$10$wT8BvO4Y4lP.9hG0sFfKq.kLqBZZfN82YmZrqs7e9U31/1Z5sXzT.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ibu Hj. Ratnawati","role":"pasien"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('44444444-4444-4444-4444-444444444406', '00000000-0000-0000-0000-000000000000', 'kevin.alamsyah@gmail.com', '$2a$10$wT8BvO4Y4lP.9hG0sFfKq.kLqBZZfN82YmZrqs7e9U31/1Z5sXzT.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ananda Kevin Alamsyah","role":"pasien"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('44444444-4444-4444-4444-444444444407', '00000000-0000-0000-0000-000000000000', 'subagio.hartono@yahoo.com', '$2a$10$wT8BvO4Y4lP.9hG0sFfKq.kLqBZZfN82YmZrqs7e9U31/1Z5sXzT.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bapak Subagio Hartono","role":"pasien"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('44444444-4444-4444-4444-444444444408', '00000000-0000-0000-0000-000000000000', 'nadia.salsabila@gmail.com', '$2a$10$wT8BvO4Y4lP.9hG0sFfKq.kLqBZZfN82YmZrqs7e9U31/1Z5sXzT.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nadia Salsabila","role":"pasien"}', NOW(), NOW(), 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

INSERT INTO public.profiles (id, email, full_name, role, phone, nik, gender, birth_date, address, blood_type, allergies, avatar_url) VALUES
('44444444-4444-4444-4444-444444444401', 'admin@kliniksehat.id', 'Drs. Supriyanto, M.Kes (Administrator)', 'admin', '081234567800', '3201010101800001', 'L', '1980-05-15', 'Jl. Graha Medika No. 10, Jakarta Selatan', 'O+', 'Tidak ada', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'),
('44444444-4444-4444-4444-444444444402', 'petugas@kliniksehat.id', 'Dewi Lestari, A.Md.RMIK (Front Office)', 'petugas', '081234567801', '3201010202950002', 'P', '1995-08-20', 'Jl. Merpati Indah No. 4, Jakarta Timur', 'B+', 'Tidak ada', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80'),
('44444444-4444-4444-4444-444444444403', 'dokter.budi@kliniksehat.id', 'dr. Budi Santoso, Sp.KKLP', 'dokter', '081234567802', '3201010303850003', 'L', '1985-11-12', 'Komplek Permata Medika Blok C-12', 'A+', 'Tidak ada', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80'),
-- 5 Data Pasien
('44444444-4444-4444-4444-444444444404', 'pasien@kliniksehat.id', 'Rian Hidayat Kusuma', 'pasien', '081298765432', '3201011504980004', 'L', '1998-04-15', 'Jl. Tebet Barat Raya No. 45, Jakarta Selatan', 'O+', 'Amoksisilin, Udang', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'),
('44444444-4444-4444-4444-444444444405', 'ratnawati@gmail.com', 'Ibu Hj. Ratnawati', 'pasien', '081377889900', '3201012209700008', 'P', '1970-09-22', 'Jl. Kemang Raya No. 18, Jakarta Selatan', 'A+', 'Tidak ada', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&q=80'),
('44444444-4444-4444-4444-444444444406', 'kevin.alamsyah@gmail.com', 'Ananda Kevin Alamsyah', 'pasien', '081912345678', '3201011210150009', 'L', '2015-10-12', 'Jl. Kebon Jeruk No. 24, Jakarta Barat', 'B+', 'Seafood, Telur', 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=200&q=80'),
('44444444-4444-4444-4444-444444444407', 'subagio.hartono@yahoo.com', 'Bapak Subagio Hartono', 'pasien', '085712348877', '3201010301620005', 'L', '1962-01-03', 'Jl. Cempaka Putih Tengah No. 8, Jakarta Pusat', 'AB+', 'Tidak ada', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'),
('44444444-4444-4444-4444-444444444408', 'nadia.salsabila@gmail.com', 'Nadia Salsabila', 'pasien', '081299881122', '3201012908010006', 'P', '2001-08-29', 'Jl. Margonda Raya No. 102, Depok', 'O+', 'Debu, Dingin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  nik = EXCLUDED.nik;

-- 5. SEED APPOINTMENTS (MINIMAL 5 KUNJUNGAN: Menunggu, Diproses/Check-in, Diperiksa, Selesai)
INSERT INTO public.appointments (
  id, patient_id, patient_name, patient_nik, patient_phone, 
  doctor_id, schedule_id, appointment_date, queue_number, queue_code, 
  status, complaint, is_walk_in, check_in_time, called_time, completed_time
) VALUES
-- 1. Status Selesai (dengan rekam medis terisi)
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444404', 'Rian Hidayat Kusuma', '3201011504980004', '081298765432', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', CURRENT_DATE, 1, 'UMU-001', 'selesai', 'Demam tinggi selama 3 hari disertai flu dan batuk berdahak.', false, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes', NOW() - INTERVAL '1 hour 30 minutes'),

-- 2. Status Diperiksa (sedang ditangani di ruang dokter)
('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444405', 'Ibu Hj. Ratnawati', '3201012209700008', '081377889900', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', CURRENT_DATE, 2, 'UMU-002', 'diperiksa', 'Kontrol tensi rutin dan mengeluh kepala terasa pusing berputar.', true, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '10 minutes', NULL),

-- 3. Status Check-in / Diproses (pasien sudah hadir di klinik, siap dipanggil dokter)
('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444406', 'Ananda Kevin Alamsyah', '3201011210150009', '081912345678', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', CURRENT_DATE, 3, 'UMU-003', 'check_in', 'Sakit perut sebelah kanan bawah sejak kemarin malam.', false, NOW() - INTERVAL '30 minutes', NULL, NULL),

-- 4. Status Menunggu (belum tiba / belum check-in)
('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444407', 'Bapak Subagio Hartono', '3201010301620005', '085712348877', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', CURRENT_DATE, 4, 'UMU-004', 'menunggu', 'Nyeri pada persendian lutut saat berjalan.', false, NULL, NULL, NULL),

-- 5. Status Selesai (Poli Gigi - dengan rekam medis lengkap)
('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444408', 'Nadia Salsabila', '3201012908010006', '081299881122', '22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333306', CURRENT_DATE, 1, 'GIG-001', 'selesai', 'Gigi geraham belakang ngilu saat minum dingin dan ada lubang.', false, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 45 minutes', NOW() - INTERVAL '2 hours 15 minutes')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED REKAM MEDIS & TINDAKAN DOKTER (UNTUK KUNJUNGAN SELESAI)
INSERT INTO public.medical_records (
  id, appointment_id, patient_id, doctor_id,
  systolic, diastolic, heart_rate, respiratory_rate, temperature, weight, height,
  anamnesis, physical_examination, diagnosis_icd10, diagnosis_description,
  therapy_plan, prescription_text, doctor_notes, attachment_urls
) VALUES
-- Rekam Medis Kunjungan 1 (ISPA & Faringitis Akut)
(
  '66666666-6666-6666-6666-666666666601',
  '55555555-5555-5555-5555-555555555501',
  '44444444-4444-4444-4444-444444444404',
  '22222222-2222-2222-2222-222222222201',
  120, 80, 82, 18, 38.2, 68.5, 172.0,
  'Pasien datang dengan keluhan demam tinggi sejak 3 hari yang lalu. Disertai batuk berdahak kekuningan, pilek, nyeri tenggorokan, dan badan lemas. Riwayat alergi obat amoksisilin.',
  'Keadaan umum tampak sakit sedang, compos mentis. Faring hiperemis (+), tonsil T1-T1 tidak hiperemis. Paru: vesikuler normal, ronkhi (-), wheezing (-). Jantung dalam batas normal.',
  'J06.9',
  'Infeksi Saluran Pernapasan Akut (ISPA) dengan Faringitis Akut',
  'Tindakan: Edukasi pola istirahat cukup minimal 3 hari, hidrasi air hangat minimal 2.5 L/hari, hindari gorengan/pedas. Kontrol bila demam berlanjut > 3 hari.',
  '1. Paracetamol 500mg tab - 3x1 tab sesudah makan (bila demam/nyeri)
2. Cefixime 100mg kapsul - 2x1 kapsul sesudah makan (selama 5 hari - habiskan)
3. Acetylcysteine 200mg kapsul - 3x1 kapsul sesudah makan (pengencer dahak)
4. Vitamin C 500mg - 1x1 tab sesudah makan',
  'Perhatikan alergi penisilin/amoksisilin. Terapi antibiotik diberikan golongan sefalosporin generasi ke-3.',
  ARRAY['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80']
),
-- Rekam Medis Kunjungan 5 (Poli Gigi - Pulpitis Reversibel & Restorasi Komposit)
(
  '66666666-6666-6666-6666-666666666602',
  '55555555-5555-5555-5555-555555555505',
  '44444444-4444-4444-4444-444444444408',
  '22222222-2222-2222-2222-222222222202',
  115, 75, 76, 16, 36.5, 52.0, 160.0,
  'Pasien mengeluh gigi geraham bawah kanan berlubang dan ngilu bila terkena minuman/makanan dingin sejak 1 minggu terakhir.',
  'Ekstraoral simetris normal. Intraoral: Kavitas pada oklusal gigi 46 profunda mencapai dentin, sondasi (+), perkusi (-), palpasi (-), mobilitas normal.',
  'K04.0',
  'Pulpitis Reversibel pada gigi 46 akibat Karies Dentis Media',
  'Tindakan: Preparasi kavitas minimal invasif, aplikasi pelindung pulpa RMGI liner, penambalan permanen restorasi resin komposit nanofill. Edukasi sikat gigi 2x sehari dan dental flossing.',
  '1. Asam Mefenamat 500mg tab - 3x1 tab sesudah makan (bila terasa nyeri)
2. Obat Kumur Chlorhexidine 0.2% - 2x sehari setelah sikat gigi',
  'Penambalan komposit gigi 46 selesai dengan oklusi baik tanpa sangkutan. Kontrol 6 bulan lagi untuk scaling berkala.',
  ARRAY['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80']
)
ON CONFLICT (id) DO NOTHING;

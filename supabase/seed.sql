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

-- 3. SEED SCHEDULES (SENIN - SABTU)
INSERT INTO public.schedules (id, doctor_id, day_of_week, start_time, end_time, quota_per_day, is_active) VALUES
-- dr. Budi Santoso (Poli Umum) : Senin - Jumat
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 1, '08:00:00', '14:00:00', 35, true),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 2, '08:00:00', '14:00:00', 35, true),
('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 3, '08:00:00', '14:00:00', 35, true),
('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222201', 4, '08:00:00', '14:00:00', 35, true),
('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222201', 5, '08:00:00', '14:00:00', 35, true),
-- drg. Annisa Nurul (Poli Gigi) : Senin, Rabu, Jumat
('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222202', 1, '09:00:00', '15:00:00', 20, true),
('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222202', 3, '09:00:00', '15:00:00', 20, true),
('33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222202', 5, '09:00:00', '15:00:00', 20, true),
-- dr. Hendra Wijaya (Poli Anak) : Selasa, Kamis, Sabtu
('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222203', 2, '08:30:00', '13:30:00', 25, true),
('33333333-3333-3333-3333-333333333310', '22222222-2222-2222-2222-222222222203', 4, '08:30:00', '13:30:00', 25, true),
('33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222203', 6, '08:30:00', '12:30:00', 20, true),
-- dr. Siti Rahmawati (Poli Penyakit Dalam) : Senin, Selasa, Kamis
('33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222204', 1, '10:00:00', '16:00:00', 25, true),
('33333333-3333-3333-3333-333333333313', '22222222-2222-2222-2222-222222222204', 2, '10:00:00', '16:00:00', 25, true),
('33333333-3333-3333-3333-333333333314', '22222222-2222-2222-2222-222222222204', 4, '10:00:00', '16:00:00', 25, true)
ON CONFLICT (id) DO NOTHING;


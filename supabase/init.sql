-- CareLink QR - Complete Database Initialization
-- Run this in Supabase SQL Editor to set up the entire system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'family')),
  patient_ids UUID[] DEFAULT '{}',
  token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  status TEXT NOT NULL CHECK (status IN ('Stable', 'Critical', 'Surgery', 'Recovering', 'Discharge')),
  location TEXT NOT NULL,
  department TEXT,
  room TEXT,
  consent_enabled BOOLEAN DEFAULT false,
  admission_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'done')) DEFAULT 'open',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  audience TEXT NOT NULL CHECK (audience IN ('staff', 'family')),
  text TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENCOUNTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  start TIMESTAMPTZ DEFAULT now(),
  "end" TIMESTAMPTZ,
  assignee TEXT,
  assignee_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VITALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  temperature DECIMAL(4,1),
  oxygen_level INTEGER,
  respiratory_rate INTEGER,
  recorded_by UUID REFERENCES users(id),
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- QR CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);

CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_consent ON patients(consent_enabled);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);

CREATE INDEX IF NOT EXISTS idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_notes_patient_id ON notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_notes_audience ON notes(audience);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_patient_id ON activity_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_patient_id ON qr_codes(patient_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT DEMO USERS
-- ============================================
INSERT INTO users (id, email, password, role, patient_ids) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@carelink.demo', 'admin', 'admin', '{}'),
  ('550e8400-e29b-41d4-a716-446655440001', 'staff@carelink.demo', 'staff', '{}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'nurse@carelink.demo', 'staff', '{}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'family@carelink.demo', 'family', '{"550e8400-e29b-41d4-a716-446655440100"}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'family2@carelink.demo', 'family', '{"550e8400-e29b-41d4-a716-446655440101"}')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- INSERT DEMO PATIENTS
-- ============================================
INSERT INTO patients (id, name, age, status, location, department, room, consent_enabled, admission_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440100', 'John Mitchell', 68, 'Stable', 'Room 302, Cardiac Unit', 'Cardiology', '302', true, '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440101', 'Sarah Chen', 45, 'Surgery', 'Room 405, Orthopedics', 'Orthopedics', '405', true, '2024-01-18'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Robert Wilson', 72, 'Critical', 'ICU-12, Intensive Care', 'ICU', 'ICU-12', false, '2024-01-16'),
  ('550e8400-e29b-41d4-a716-446655440103', 'Maria Rodriguez', 34, 'Recovering', 'Room 208, Maternity', 'Maternity', '208', true, '2024-01-19'),
  ('550e8400-e29b-41d4-a716-446655440104', 'David Kim', 56, 'Discharge', 'Room 115, General Medicine', 'General Medicine', '115', true, '2024-01-14'),
  ('550e8400-e29b-41d4-a716-446655440105', 'Emma Thompson', 28, 'Stable', 'Room 312, Pediatrics', 'Pediatrics', '312', true, '2024-01-20'),
  ('550e8400-e29b-41d4-a716-446655440106', 'Michael Brown', 61, 'Recovering', 'Room 225, Oncology', 'Oncology', '225', true, '2024-01-17')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT DEMO TASKS
-- ============================================
INSERT INTO tasks (patient_id, title, status, priority) VALUES
  ('550e8400-e29b-41d4-a716-446655440100', 'Morning vitals & medication', 'open', 'high'),
  ('550e8400-e29b-41d4-a716-446655440100', 'Family update call', 'open', 'normal'),
  ('550e8400-e29b-41d4-a716-446655440100', 'Discharge teaching', 'done', 'normal'),
  ('550e8400-e29b-41d4-a716-446655440100', 'Check IV line', 'open', 'high'),
  ('550e8400-e29b-41d4-a716-446655440101', 'Pre-surgery prep', 'done', 'urgent'),
  ('550e8400-e29b-41d4-a716-446655440101', 'Post-op monitoring', 'open', 'urgent'),
  ('550e8400-e29b-41d4-a716-446655440101', 'Pain assessment', 'open', 'high'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Hourly vitals check', 'open', 'urgent'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Ventilator check', 'open', 'urgent'),
  ('550e8400-e29b-41d4-a716-446655440103', 'Newborn check', 'open', 'normal'),
  ('550e8400-e29b-41d4-a716-446655440104', 'Final discharge paperwork', 'open', 'normal'),
  ('550e8400-e29b-41d4-a716-446655440105', 'Pediatric assessment', 'done', 'normal'),
  ('550e8400-e29b-41d4-a716-446655440106', 'Chemo prep', 'open', 'high');

-- ============================================
-- INSERT DEMO NOTES
-- ============================================
INSERT INTO notes (patient_id, author, author_id, audience, text, is_important) VALUES
  ('550e8400-e29b-41d4-a716-446655440100', 'Nurse A', '550e8400-e29b-41d4-a716-446655440002', 'staff', 'Patient comfortable. Pain 2/10. BP stable at 120/80.', false),
  ('550e8400-e29b-41d4-a716-446655440100', 'Dr. Lee', '550e8400-e29b-41d4-a716-446655440001', 'family', 'Patient is stable and cleared for family portal updates. Recovery progressing well.', false),
  ('550e8400-e29b-41d4-a716-446655440100', 'Nurse B', '550e8400-e29b-41d4-a716-446655440002', 'staff', 'Medication administered at 08:00. No adverse reactions observed.', true),
  ('550e8400-e29b-41d4-a716-446655440101', 'Dr. Smith', '550e8400-e29b-41d4-a716-446655440001', 'family', 'Surgery completed successfully. Patient is in recovery room and doing well.', true),
  ('550e8400-e29b-41d4-a716-446655440101', 'Nurse C', '550e8400-e29b-41d4-a716-446655440002', 'staff', 'Post-op vitals stable. Patient responsive and oriented.', false),
  ('550e8400-e29b-41d4-a716-446655440102', 'Dr. Johnson', '550e8400-e29b-41d4-a716-446655440001', 'staff', 'Critical condition. Close monitoring required. Family has been notified.', true),
  ('550e8400-e29b-41d4-a716-446655440103', 'Nurse D', '550e8400-e29b-41d4-a716-446655440002', 'family', 'Mother and baby are both healthy. Breastfeeding initiated successfully.', false),
  ('550e8400-e29b-41d4-a716-446655440104', 'Case Manager', '550e8400-e29b-41d4-a716-446655440001', 'family', 'Discharge papers ready. Follow-up appointment scheduled for next week.', false),
  ('550e8400-e29b-41d4-a716-446655440105', 'Dr. Williams', '550e8400-e29b-41d4-a716-446655440001', 'family', 'Child is recovering well. Can be discharged tomorrow morning.', false),
  ('550e8400-e29b-41d4-a716-446655440106', 'Oncology Team', '550e8400-e29b-41d4-a716-446655440001', 'staff', 'Patient showing good response to treatment. Continue current regimen.', false);

-- ============================================
-- INSERT DEMO ENCOUNTERS
-- ============================================
INSERT INTO encounters (patient_id, type, status, assignee, notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440100', 'Inpatient', 'in-progress', 'Dr. Lee', 'Cardiac monitoring active'),
  ('550e8400-e29b-41d4-a716-446655440101', 'Surgery', 'completed', 'Dr. Smith', 'Hip replacement successful'),
  ('550e8400-e29b-41d4-a716-446655440101', 'Recovery', 'in-progress', 'Nurse C', 'Post-op care ongoing'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Emergency', 'in-progress', 'Dr. Johnson', 'ICU admission for respiratory distress'),
  ('550e8400-e29b-41d4-a716-446655440103', 'Maternity', 'in-progress', 'Nurse D', 'Normal delivery, mother recovering'),
  ('550e8400-e29b-41d4-a716-446655440104', 'Outpatient', 'completed', 'Case Manager', 'Final review completed');

-- ============================================
-- INSERT DEMO VITALS
-- ============================================
INSERT INTO vitals (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_level, respiratory_rate) VALUES
  ('550e8400-e29b-41d4-a716-446655440100', 72, 120, 80, 98.6, 98, 16),
  ('550e8400-e29b-41d4-a716-446655440101', 68, 118, 78, 98.4, 99, 14),
  ('550e8400-e29b-41d4-a716-446655440102', 95, 140, 90, 99.8, 88, 24),
  ('550e8400-e29b-41d4-a716-446655440103', 78, 110, 70, 99.2, 100, 18),
  ('550e8400-e29b-41d4-a716-446655440105', 88, 100, 65, 99.0, 100, 20);

-- ============================================
-- INSERT DEMO QR CODES
-- ============================================
INSERT INTO qr_codes (patient_id, code, expires_at, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440100', 'qr-john-mitchell-001', now() + interval '30 days', true),
  ('550e8400-e29b-41d4-a716-446655440101', 'qr-sarah-chen-001', now() + interval '30 days', true),
  ('550e8400-e29b-41d4-a716-446655440102', 'qr-robert-wilson-001', now() + interval '30 days', false),
  ('550e8400-e29b-41d4-a716-446655440103', 'qr-maria-rodriguez-001', now() + interval '30 days', true),
  ('550e8400-e29b-41d4-a716-446655440104', 'qr-david-kim-001', now() + interval '30 days', true);

-- ============================================
-- INSERT DEMO NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, patient_id, title, message, type, is_read) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440100', 'Vitals Updated', 'Patient John Mitchell vitals are now stable.', 'success', false),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440100', 'New Note', 'Dr. Lee added a new update for John Mitchell.', 'info', false),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440101', 'Surgery Complete', 'Sarah Chen surgery completed successfully.', 'success', false),
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440102', 'Critical Alert', 'Robert Wilson condition changed to critical.', 'error', false),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440103', 'New Family Member', 'Maria Rodriguez family access approved.', 'info', true);

-- ============================================
-- CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Note: Create specific policies based on your auth setup
-- For now, using permissive policies for development
CREATE POLICY "Allow all" ON users FOR ALL USING (true);
CREATE POLICY "Allow all" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all" ON encounters FOR ALL USING (true);
CREATE POLICY "Allow all" ON vitals FOR ALL USING (true);
CREATE POLICY "Allow all" ON activity_logs FOR ALL USING (true);
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify everything is set up correctly
/*
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Notes', COUNT(*) FROM notes
UNION ALL
SELECT 'Encounters', COUNT(*) FROM encounters
UNION ALL
SELECT 'Vitals', COUNT(*) FROM vitals
UNION ALL
SELECT 'QR Codes', COUNT(*) FROM qr_codes
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;
*/

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
SELECT 'CareLink QR Database Initialization Complete!' as status;

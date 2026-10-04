-- =========================================================
-- OshudhSathi (ওষুধসাথী) PostgreSQL / Neon Database Schema
-- Compatible with Neon Serverless Postgres
-- =========================================================

-- ─── Compatibility View & Functions ──────────────────────
CREATE OR REPLACE VIEW dual AS SELECT 1 AS dummy;

CREATE OR REPLACE FUNCTION curdate() RETURNS date AS $$
  SELECT CURRENT_DATE;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION date_sub(ts timestamp, iv interval) RETURNS timestamp AS $$
  SELECT ts - iv;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION date_sub(ts timestamptz, iv interval) RETURNS timestamptz AS $$
  SELECT ts - iv;
$$ LANGUAGE sql IMMUTABLE;

-- ─── Users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE NULL,
  gender VARCHAR(20) NULL,
  blood_group VARCHAR(10) NULL,
  allergies TEXT NULL,
  chronic_conditions TEXT NULL,
  emergency_contact_name VARCHAR(100) NULL,
  emergency_contact_phone VARCHAR(15) NULL,
  profile_image_url VARCHAR(500) NULL,
  fcm_token VARCHAR(500) NULL,
  language VARCHAR(10) DEFAULT 'bn',
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);

-- ─── Admins ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── OTP Codes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_code ON otp_codes (phone, code, is_used);

-- ─── Medicines (Master Data) ─────────────────────────────
CREATE TABLE IF NOT EXISTS medicines (
  id SERIAL PRIMARY KEY,
  brand_name VARCHAR(200) NOT NULL,
  brand_name_bn VARCHAR(200) NULL,
  generic_name VARCHAR(200) NOT NULL,
  generic_name_bn VARCHAR(200) NULL,
  manufacturer VARCHAR(200) NULL,
  dosage_form VARCHAR(50) NULL,
  strength VARCHAR(100) NULL,
  unit_price NUMERIC(10,2) NULL,
  pack_size INT NULL,
  is_otc SMALLINT DEFAULT 0,
  category VARCHAR(100) NULL,
  indications TEXT NULL,
  indications_bn TEXT NULL,
  composition TEXT NULL,
  composition_bn TEXT NULL,
  side_effects TEXT NULL,
  instructions TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT idx_unique_med UNIQUE (brand_name, strength, dosage_form, manufacturer)
);

CREATE INDEX IF NOT EXISTS idx_med_brand ON medicines (brand_name);
CREATE INDEX IF NOT EXISTS idx_med_generic ON medicines (generic_name);
CREATE INDEX IF NOT EXISTS idx_med_category ON medicines (category);

-- ─── Drug Interactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS drug_interactions (
  id SERIAL PRIMARY KEY,
  medicine_a_generic VARCHAR(200) NOT NULL,
  medicine_b_generic VARCHAR(200) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  description_bn TEXT NULL,
  source VARCHAR(100) NULL
);

CREATE INDEX IF NOT EXISTS idx_med_a ON drug_interactions (medicine_a_generic);
CREATE INDEX IF NOT EXISTS idx_med_b ON drug_interactions (medicine_b_generic);

-- ─── User Medicines ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_medicines (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medicine_id INT NULL REFERENCES medicines(id) ON DELETE SET NULL,
  custom_name VARCHAR(200) NULL,
  dosage VARCHAR(100) NULL,
  frequency VARCHAR(50) NOT NULL,
  times JSONB NOT NULL,
  meal_instruction VARCHAR(50) DEFAULT 'any',
  start_date DATE NOT NULL,
  end_date DATE NULL,
  total_quantity INT NULL,
  remaining_quantity INT NULL,
  refill_alert_days INT DEFAULT 3,
  notes TEXT NULL,
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_med_user ON user_medicines (user_id);
CREATE INDEX IF NOT EXISTS idx_user_med_active ON user_medicines (user_id, is_active);

-- ─── Dose Logs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dose_logs (
  id BIGSERIAL PRIMARY KEY,
  user_medicine_id INT NOT NULL REFERENCES user_medicines(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  taken_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dose_user_date ON dose_logs (user_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_dose_status ON dose_logs (user_id, status, scheduled_time);

-- ─── Health Logs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  value_1 NUMERIC(10,2) NOT NULL,
  value_2 NUMERIC(10,2) NULL,
  unit VARCHAR(20) NULL,
  meal_context VARCHAR(50) NULL,
  notes TEXT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_user_type ON health_logs (user_id, type, recorded_at);

-- ─── Prescriptions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_name VARCHAR(200) NULL,
  hospital_name VARCHAR(200) NULL,
  diagnosis TEXT NULL,
  visit_date DATE NOT NULL,
  next_visit_date DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions (user_id);

-- ─── Prescription Images ─────────────────────────────────
CREATE TABLE IF NOT EXISTS prescription_images (
  id SERIAL PRIMARY KEY,
  prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  image_path VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Family Links ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_links (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewer_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
  invite_code VARCHAR(50) UNIQUE NULL,
  relationship VARCHAR(50) NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Doctor Appointments ─────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_appointments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_name VARCHAR(200) NOT NULL,
  hospital_name VARCHAR(200) NULL,
  phone VARCHAR(15) NULL,
  appointment_date TIMESTAMP NOT NULL,
  reminder_days INT DEFAULT 7,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON doctor_appointments (user_id, appointment_date);

-- ─── Default Admin ───────────────────────────────────────
-- Password: admin123
INSERT INTO admins (email, password_hash, name, role)
VALUES ('admin@oshudhsathi.com', '$2a$12$LJ3x5Mj5vQ5z5z5z5z5z5O5z5z5z5z5z5z5z5z5z5z5z5z5z5z5', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- ─── Default Sample Medicines ────────────────────────────
INSERT INTO medicines (brand_name, brand_name_bn, generic_name, manufacturer, dosage_form, strength, unit_price, category, instructions)
VALUES
  ('Napa', 'নাপা', 'Paracetamol', 'Beximco Pharmaceuticals', 'tablet', '500mg', 1.50, 'analgesic', 'খাওয়ার পরে বা আগে যেকোনো সময় খাওয়া যায়'),
  ('Napa Extra', 'নাপা এক্সট্রা', 'Paracetamol + Caffeine', 'Beximco Pharmaceuticals', 'tablet', '500mg + 65mg', 3.00, 'analgesic', 'খাওয়ার পরে খাবেন'),
  ('Seclo', 'সেক্লো', 'Omeprazole', 'Incepta Pharmaceuticals', 'capsule', '20mg', 3.00, 'antacid', 'খালি পেটে সকালে খাবেন'),
  ('Losectil', 'লসেক্টিল', 'Omeprazole', 'Square Pharmaceuticals', 'capsule', '20mg', 8.00, 'antacid', 'খালি পেটে সকালে খাবেন'),
  ('Comet', 'কমেট', 'Metformin HCl', 'Aristopharma', 'tablet', '500mg', 3.50, 'antidiabetic', 'ভরা পেটে খাবেন'),
  ('Diafor', 'ডায়াফর', 'Metformin HCl', 'Healthcare Pharmaceuticals', 'tablet', '500mg', 2.50, 'antidiabetic', 'ভরা পেটে খাবেন'),
  ('Amlodipine', 'অ্যামলোডিপিন', 'Amlodipine', 'Square Pharmaceuticals', 'tablet', '5mg', 4.00, 'antihypertensive', 'প্রতিদিন একই সময়ে খাবেন'),
  ('Novasc', 'নোভাস্ক', 'Amlodipine', 'Novartis', 'tablet', '5mg', 12.00, 'antihypertensive', 'প্রতিদিন একই সময়ে খাবেন'),
  ('Sergel', 'সারজেল', 'Esomeprazole', 'Square Pharmaceuticals', 'capsule', '20mg', 10.00, 'antacid', 'খালি পেটে সকালে খাবেন'),
  ('Monas', 'মোনাস', 'Montelukast', 'Square Pharmaceuticals', 'tablet', '10mg', 12.00, 'antiallergic', 'রাতে ঘুমানোর আগে খাবেন')
ON CONFLICT (brand_name, strength, dosage_form, manufacturer) DO NOTHING;

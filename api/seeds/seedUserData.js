const { pool } = require('../config/database');

async function seedUserData() {
  try {
    console.log('🌱 Seeding rich user data (Medicines, Dose logs, Health logs, Appointments)...');

    // 1. Get user 1
    const [users] = await pool.execute("SELECT id FROM users WHERE phone = '01619504428' LIMIT 1");
    if (users.length === 0) {
      console.log('⚠️ User 01619504428 not found.');
      process.exit(1);
    }
    const userId = users[0].id;

    // 2. Fetch sample medicines
    const [napa] = await pool.execute("SELECT id, brand_name, dosage_form, strength FROM medicines WHERE brand_name ILIKE 'Napa Extra%' LIMIT 1");
    const [seclo] = await pool.execute("SELECT id, brand_name, dosage_form, strength FROM medicines WHERE brand_name ILIKE 'Seclo%' LIMIT 1");
    const [comet] = await pool.execute("SELECT id, brand_name, dosage_form, strength FROM medicines WHERE brand_name ILIKE 'Comet%' OR brand_name ILIKE '%Metformin%' LIMIT 1");

    const med1Id = napa[0]?.id || null;
    const med2Id = seclo[0]?.id || null;
    const med3Id = comet[0]?.id || null;

    const today = new Date().toISOString().split('T')[0];

    // Clean existing user medicines for clean re-seed
    await pool.execute('DELETE FROM user_medicines WHERE user_id = ?', [userId]);

    // 3. Insert User Medicines
    const [um1] = await pool.execute(
      `INSERT INTO user_medicines 
       (user_id, medicine_id, custom_name, dosage, frequency, times, meal_instruction, start_date, total_quantity, remaining_quantity, refill_alert_days, notes)
       VALUES (?, ?, ?, '1 টি ট্যাবলেট', 'twice_daily', ?, 'after_meal', ?, 30, 24, 5, 'জ্বর ও ব্যথায় প্রযোজ্য')`,
      [userId, med1Id, 'Napa Extra 500mg', JSON.stringify(['08:00', '20:00']), today]
    );

    const [um2] = await pool.execute(
      `INSERT INTO user_medicines 
       (user_id, medicine_id, custom_name, dosage, frequency, times, meal_instruction, start_date, total_quantity, remaining_quantity, refill_alert_days, notes)
       VALUES (?, ?, ?, '1 টি ক্যাপসুল', 'once_daily', ?, 'before_meal', ?, 30, 8, 5, 'সকালে খালি পেটে খাবেন')`,
      [userId, med2Id, 'Seclo 20mg', JSON.stringify(['07:30']), today]
    );

    const [um3] = await pool.execute(
      `INSERT INTO user_medicines 
       (user_id, medicine_id, custom_name, dosage, frequency, times, meal_instruction, start_date, total_quantity, remaining_quantity, refill_alert_days, notes)
       VALUES (?, ?, ?, '1 টি ট্যাবলেট', 'twice_daily', ?, 'after_meal', ?, 60, 45, 7, 'ভরা পেটে খাবেন')`,
      [userId, med3Id, 'Comet 500mg', JSON.stringify(['08:30', '20:30']), today]
    );

    console.log('✅ User medicines added: Napa Extra, Seclo, Comet');

    // 4. Insert Dose Logs for Today
    await pool.execute(
      `INSERT INTO dose_logs (user_medicine_id, user_id, scheduled_time, status, taken_at)
       VALUES 
       (?, ?, ?::timestamp, 'taken', (NOW() - INTERVAL '4 hours')),
       (?, ?, ?::timestamp, 'pending', NULL),
       (?, ?, ?::timestamp, 'taken', (NOW() - INTERVAL '5 hours')),
       (?, ?, ?::timestamp, 'taken', (NOW() - INTERVAL '3 hours')),
       (?, ?, ?::timestamp, 'pending', NULL)`,
      [
        um1.insertId, userId, `${today} 08:00:00`,
        um1.insertId, userId, `${today} 20:00:00`,
        um2.insertId, userId, `${today} 07:30:00`,
        um3.insertId, userId, `${today} 08:30:00`,
        um3.insertId, userId, `${today} 20:30:00`
      ]
    );
    console.log('✅ Dose logs created for today (3 taken, 2 pending)');

    // 5. Health Logs
    await pool.execute('DELETE FROM health_logs WHERE user_id = ?', [userId]);
    await pool.execute(
      `INSERT INTO health_logs (user_id, type, value_1, value_2, unit, meal_context, notes)
       VALUES 
       (?, 'blood_pressure', 120, 80, 'mmHg', NULL, 'স্বাভাবিক রক্তচাপ'),
       (?, 'blood_pressure', 125, 82, 'mmHg', NULL, 'হাঁটার পর রেকর্ড করা হয়েছে'),
       (?, 'blood_sugar', 6.2, NULL, 'mmol/L', 'fasting', 'সকালে খালি পেটে শর্করার পরিমাপ'),
       (?, 'weight', 68.5, NULL, 'kg', NULL, 'নিয়মিত ওজন ট্র্যাকিং')`,
      [userId, userId, userId, userId]
    );
    console.log('✅ Health logs seeded (BP, Blood Sugar, Weight)');

    // 6. Doctor Appointment
    await pool.execute('DELETE FROM doctor_appointments WHERE user_id = ?', [userId]);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await pool.execute(
      `INSERT INTO doctor_appointments (user_id, doctor_name, hospital_name, phone, appointment_date, reminder_days, notes)
       VALUES (?, 'ডা. এম এ রউফ (মেডিসিন বিশেষজ্ঞ)', 'ঢাকা মেডিকেল কলেজ হাসপাতাল', '01700000000', ?::timestamp, 2, 'রুটিন চেকআপ ও প্রেসক্রিপশন রিভিউ')`,
      [userId, `${nextWeek} 10:30:00`]
    );
    console.log('✅ Doctor appointment created');

    // 7. Prescription
    await pool.execute('DELETE FROM prescriptions WHERE user_id = ?', [userId]);
    await pool.execute(
      `INSERT INTO prescriptions (user_id, doctor_name, hospital_name, diagnosis, visit_date, next_visit_date, notes)
       VALUES (?, 'ডা. এম এ রউফ', 'স্কয়ার হাসপাতাল', 'উচ্চ রক্তচাপ ও প্রাথমিক ডায়াবেটিস', ?, ?, 'নিয়মিত ওষুধ খাওয়া এবং লবণ কম খাওয়ার পরামর্শ')`,
      [userId, today, nextWeek]
    );
    console.log('✅ Prescription record created');

    console.log('\n🎉 Complete user sample dataset successfully seeded into Neon!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ User data seed error:', error);
    process.exit(1);
  }
}

seedUserData();

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { HealthLog, UserMedicine } from '../models';

interface ReportData {
  userName: string;
  userPhone: string;
  bpLogs: HealthLog[];
  sugarLogs: HealthLog[];
  weightLogs: HealthLog[];
  pulseLogs: HealthLog[];
  medicines: UserMedicine[];
}

export class PdfService {
  static async generateAndShareReport(data: ReportData): Promise<string> {
    const today = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>OshudhSathi Health Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 20px; }
          .title { color: #047857; font-size: 24px; font-weight: bold; margin: 0; }
          .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; }
          .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
          .section-title { color: #047857; font-size: 16px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #047857; color: white; text-align: left; padding: 8px; font-size: 13px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px; font-size: 12px; }
          .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">💊 ঔষধসাথী — রোগী স্বাস্থ্য রিপোর্ট</h1>
          <div class="subtitle">OshudhSathi Digital Healthcare Report • তারিখ: ${today}</div>
        </div>

        <div class="patient-box">
          <strong>রোগীর নাম:</strong> ${data.userName || 'ব্যবহারকারী'}<br/>
          <strong>ফোন নম্বর:</strong> ${data.userPhone || 'N/A'}<br/>
          <strong>রিপোর্ট জেনারেট:</strong> ${new Date().toLocaleString()}
        </div>

        <div class="section-title">১. বর্তমান নিয়মিত ওষুধসমূহ (Active Medicines)</div>
        <table>
          <thead>
            <tr><th>ওষুধের নাম</th><th>ডোজ</th><th>নিয়ম</th><th>গ্রহণের সময়</th></tr>
          </thead>
          <tbody>
            ${
              data.medicines.length === 0
                ? '<tr><td colspan="4">কোনো সক্রিয় ওষুধ নেই</td></tr>'
                : data.medicines
                    .map(
                      (m) => `
              <tr>
                <td><strong>${m.brand_name || m.custom_name}</strong></td>
                <td>${m.dosage || '১টি'}</td>
                <td>${m.meal_instruction === 'before_meal' ? 'খাওয়ার আগে' : 'খাওয়ার পরে'}</td>
                <td>${m.times ? m.times.join(', ') : '08:00 AM'}</td>
              </tr>
            `
                    )
                    .join('')
            }
          </tbody>
        </table>

        <div class="section-title">২. রক্তচাপ লগ (Blood Pressure Logs)</div>
        <table>
          <thead><tr><th>তারিখ ও সময়</th><th>সিস্টোলিক / ডায়াস্টোলিক</th><th>স্ট্যাটাস / নোট</th></tr></thead>
          <tbody>
            ${
              data.bpLogs.length === 0
                ? '<tr><td colspan="3">কোনো রক্তচাপ রেকর্ড পাওয়া যায়নি</td></tr>'
                : data.bpLogs
                    .map(
                      (b) => `
              <tr>
                <td>${new Date(b.recorded_at).toLocaleDateString()}</td>
                <td><strong>${b.value_1}/${b.value_2 || 80}</strong> mmHg</td>
                <td>${b.notes || (b.value_1 > 130 ? 'উচ্চ রক্তচাপ' : 'স্বাভাবিক')}</td>
              </tr>
            `
                    )
                    .join('')
            }
          </tbody>
        </table>

        <div class="section-title">৩. ব্লাড সুগার লগ (Blood Sugar Logs)</div>
        <table>
          <thead><tr><th>তারিখ ও সময়</th><th>সুগার লেভেল</th><th>কন্ডিশন</th></tr></thead>
          <tbody>
            ${
              data.sugarLogs.length === 0
                ? '<tr><td colspan="3">কোনো সুগার রেকর্ড পাওয়া যায়নি</td></tr>'
                : data.sugarLogs
                    .map(
                      (s) => `
              <tr>
                <td>${new Date(s.recorded_at).toLocaleDateString()}</td>
                <td><strong>${s.value_1}</strong> mmol/L</td>
                <td>${s.meal_context === 'fasting' ? 'খালি পেটে (Fasting)' : 'খাওয়ার পর (Post-meal)'}</td>
              </tr>
            `
                    )
                    .join('')
            }
          </tbody>
        </table>

        <div class="footer">
          এই রিপোর্টটি ঔষধসাথী স্বাস্থ্য সেবা প্ল্যাটফর্ম থেকে স্বয়ংক্রিয়ভাবে তৈরি। যেকোনো স্বাস্থ্য পরামর্শের জন্য আপনার চিকিৎসকের পরামর্শ নিন।
        </div>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'ডাক্তার রিপোর্ট শেয়ার করুন',
      });
    }

    return uri;
  }
}

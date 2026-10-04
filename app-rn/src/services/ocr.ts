export interface OcrResult {
  doctorName?: string;
  hospitalName?: string;
  visitDate?: string;
  diagnosisNotes?: string;
  detectedMedicines: string[];
  fullText: string;
}

export class OcrService {
  static parseRawText(rawText: string): OcrResult {
    if (!rawText || !rawText.trim()) {
      return { detectedMedicines: [], fullText: '' };
    }

    let doctorName: string | undefined;
    let hospitalName: string | undefined;
    let visitDate: string | undefined;
    let diagnosisNotes: string | undefined;
    const detectedMedicines: string[] = [];

    const lines = rawText.split('\n');

    const matchAny = (src: string, keys: string[]) => keys.some((k) => src.includes(k));

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const lower = trimmed.toLowerCase();

      // 1. Doctor Name
      if (
        !doctorName &&
        matchAny(lower, [
          'dr.',
          'dr ',
          'doctor',
          'prof.',
          'prof ',
          'mbbs',
          'fcps',
          'md,',
          'ms,',
          'frcs',
          'surgeon',
          'specialist',
          'consultant',
          'ডাঃ',
          'ডাক্তার',
          'অধ্যাপক',
        ])
      ) {
        doctorName = trimmed;
      }

      // 2. Hospital / Chamber
      if (
        !hospitalName &&
        matchAny(lower, [
          'hospital',
          'clinic',
          'medical',
          'chamber',
          'diagnostic',
          'center',
          'centre',
          'institute',
          'nursing',
          'polyclinic',
          'হাসপাতাল',
          'চেম্বার',
          'মেডিকেল',
          'ডায়াগনস্টিক',
        ])
      ) {
        hospitalName = trimmed;
      }

      // 3. Date
      if (!visitDate) {
        const match = trimmed.match(
          /(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/
        );
        if (match) {
          visitDate = match[0];
        }
      }

      // 4. Medicines
      if (
        matchAny(lower, [
          'rx',
          'tab ',
          'cap ',
          'syr ',
          'susp',
          'inj ',
          'drop',
          'ointment',
          'cream',
          'gel ',
          '1+0+1',
          '1+1+1',
          '1+0+0',
          '0+0+1',
          '0+1+0',
        ])
      ) {
        detectedMedicines.push(trimmed);
      }

      // 5. Diagnosis
      if (
        !diagnosisNotes &&
        matchAny(lower, [
          'diag',
          'problem',
          'complaint',
          'finding',
          'fever',
          'diabetes',
          'hypertension',
          'asthma',
          'gastric',
          'ulcer',
          'infection',
          'allergy',
          'রোগ',
          'সমস্যা',
          'জ্বর',
        ])
      ) {
        diagnosisNotes = trimmed;
      }
    }

    return {
      doctorName,
      hospitalName,
      visitDate,
      diagnosisNotes,
      detectedMedicines,
      fullText: rawText,
    };
  }
}

import { Medicine } from '../models/Medicine';

export const BD_MANUFACTURERS: string[] = [
  'Square Pharmaceuticals Ltd.',
  'Beximco Pharmaceuticals Ltd.',
  'Incepta Pharmaceuticals Ltd.',
  'Renata Limited',
  'Acme Laboratories Ltd.',
  'Aristopharma Ltd.',
  'Opsonin Pharma Ltd.',
  'Popular Pharmaceuticals Ltd.',
  'ACI Limited',
  'Drug International Ltd.',
  'Eskayef Pharmaceuticals Ltd.',
  'Healthcare Pharmaceuticals Ltd.',
  'General Pharmaceuticals Ltd.',
  'Beacon Pharmaceuticals Ltd.',
  'Orion Pharma Ltd.',
  'Ibn Sina Pharmaceutical Industry Ltd.',
  'Delta Pharma Ltd.',
  'Radiant Pharmaceuticals Ltd.',
  'Nuvista Pharma Ltd.',
  'Ziska Pharmaceuticals Ltd.',
];

interface GenericMoleculeDef {
  generic: string;
  generic_bn: string;
  category: string;
  forms: string[];
  strengths: string[];
  basePrice: number;
  indications: string;
  composition: string;
  brandPrefixes: Record<string, string>;
}

export const GENERIC_MOLECULES: GenericMoleculeDef[] = [
  {
    generic: 'Paracetamol',
    generic_bn: 'প্যারাসিটামল',
    category: 'analgesic',
    forms: ['Tablet', 'Syrup', 'Suppository'],
    strengths: ['500 mg', '665 mg', '120 mg/5ml'],
    basePrice: 1.5,
    indications: 'জ্বর, তীব্র মাথাব্যথা, শরীর ব্যথা ও মৌসুমী সর্দিকাশি উপশমে সেবনযোগ্য।',
    composition: 'প্রতিটি মোডে রয়েছে পারাসিটামল বিপি উপাদান।',
    brandPrefixes: {
      Square: 'Ace',
      Beximco: 'Napa',
      Acme: 'Fast',
      Incepta: 'Pyrex',
      Renata: 'Renova',
      Aristopharma: 'Reset',
      Opsonin: 'Tamol',
      Popular: 'Fevex',
      Eskayef: 'Xpa',
      Healthcare: 'H-Para',
    },
  },
  {
    generic: 'Omeprazole',
    generic_bn: 'ওমিপ্রাজল',
    category: 'antacid',
    forms: ['Capsule', 'Injection'],
    strengths: ['20 mg', '40 mg'],
    basePrice: 5.5,
    indications: 'গ্যাস্ট্রিক আলসার, বুক জ্বালাপোড়া, পেট ফাঁপা ও এসিডিটির স্থায়ী চিকিৎসা।',
    composition: 'প্রতি ক্যাপসুলে রয়েছে ওমেপ্রাজল বিপি উপাদান।',
    brandPrefixes: {
      Square: 'Seclo',
      Eskayef: 'Losectil',
      Beximco: 'Omecon',
      Incepta: 'Proceptin',
      Renata: 'Lokit',
      Acme: 'Ometid',
      Aristopharma: 'Gastrodex',
      Healthcare: 'Omez',
    },
  },
  {
    generic: 'Esomeprazole',
    generic_bn: 'ইসোমিপ্রাজল',
    category: 'antacid',
    forms: ['Capsule', 'Tablet'],
    strengths: ['20 mg', '40 mg'],
    basePrice: 7.5,
    indications: 'ক্রনিক গ্যাস্ট্রিক, খাদ্যনালীর ক্ষত ও তীব্র বুক জ্বালাপোড়ার সমাধান।',
    composition: 'প্রতি ক্যাপসুলে রয়েছে ইসোমিপ্রাজল ম্যাগনেসিয়াম উপাদান।',
    brandPrefixes: {
      Healthcare: 'Sergel',
      Renata: 'Maxpro',
      Beximco: 'Nexum',
      Incepta: 'Esonix',
      Square: 'Opton',
      ACI: 'Esokit',
      Popular: 'Esomax',
    },
  },
  {
    generic: 'Pantoprazole',
    generic_bn: 'প্যান্টোপ্রাজল',
    category: 'antacid',
    forms: ['Tablet', 'Injection'],
    strengths: ['20 mg', '40 mg'],
    basePrice: 6.0,
    indications: 'দীর্ঘমেয়াদী পেপটিক আলসার, গ্যাস্ট্রিক এসিডিটি ও পেট মোচড়ানো।',
    composition: 'প্রতি ট্যাবলেটে রয়েছে প্যান্টোপ্রাজল উপাদান।',
    brandPrefixes: {
      Incepta: 'Pantonic',
      Square: 'Panto',
      Beximco: 'Pantocid',
      Renata: 'Pantobex',
    },
  },
  {
    generic: 'Metformin HCl',
    generic_bn: 'মেটফরমিন এইচসিএল',
    category: 'antidiabetic',
    forms: ['Tablet'],
    strengths: ['500 mg', '850 mg', '1000 mg'],
    basePrice: 4.0,
    indications: 'টাইপ-২ ডায়াবেটিসে রক্তে শর্করা বা সুগারের মাত্রা স্বাভাবিক রাখতে প্রধান ওষুধ।',
    composition: 'প্রতি ট্যাবলেটে রয়েছে মেটফরমিন হাইড্রোক্লোরাইড উপাদান।',
    brandPrefixes: {
      Square: 'Comet',
      Incepta: 'Gluconor',
      Healthcare: 'Diafor',
      Beximco: 'Metfo',
      Renata: 'Informet',
      ACI: 'Metform',
    },
  },
  {
    generic: 'Amlodipine',
    generic_bn: 'অ্যামলোডিপিন',
    category: 'antihypertensive',
    forms: ['Tablet'],
    strengths: ['5 mg', '10 mg'],
    basePrice: 4.5,
    indications: 'উচ্চ রক্তচাপ (হাই প্রেশার) এবং বুকে ব্যথার (এনজিনা) চিকিৎসায় প্রদেয়।',
    composition: 'প্রতি ট্যাবলেটে রয়েছে অ্যামলোডিপিন বেসিলেট উপাদান।',
    brandPrefixes: {
      Square: 'Amlodipine Square',
      Beximco: 'Camlodin',
      Acme: 'Lodipin',
      Incepta: 'Amlocal',
      Renata: 'Amlovas',
      Eskayef: 'Amlocard',
    },
  },
  {
    generic: 'Montelukast',
    generic_bn: 'মন্টেলুকাস্ট',
    category: 'respiratory',
    forms: ['Tablet', 'Chewable Tablet'],
    strengths: ['10 mg', '5 mg', '4 mg'],
    basePrice: 15.0,
    indications: 'অ্যাজমা, হাঁপানি, শ্বাসকষ্ট ও অ্যালার্জিক সর্দির চিকিৎসায় অত্যন্ত কার্যকর।',
    composition: 'প্রতি ট্যাবলেটে রয়েছে মন্টেলুকাস্ট সোডিয়াম উপাদান।',
    brandPrefixes: {
      Acme: 'Monas',
      Incepta: 'Odmon',
      Square: 'Montene',
      Beximco: 'Lumona',
      Healthcare: 'Monteflo',
    },
  },
  {
    generic: 'Fexofenadine HCl',
    generic_bn: 'ফেক্সোফেনাডিন এইচসিএল',
    category: 'respiratory',
    forms: ['Tablet', 'Syrup'],
    strengths: ['120 mg', '180 mg', '60 mg'],
    basePrice: 8.5,
    indications: 'হাঁচি, অ্যালার্জিক সর্দি, চোখ দিয়ে পানি পড়া ও চর্ম অ্যালার্জির সমাধান।',
    composition: 'প্রতি ট্যাবলেটে রয়েছে ফেক্সোফেনাডিন হাইড্রোক্লোরাইড উপাদান।',
    brandPrefixes: {
      Square: 'Fexo',
      Beximco: 'Fexodin',
      Incepta: 'Fexofast',
      Renata: 'Fexoral',
    },
  },
  {
    generic: 'Azithromycin',
    generic_bn: 'অ্যাজিথ্রোমাইসিন',
    category: 'antibiotic',
    forms: ['Tablet', 'Capsule', 'Suspension'],
    strengths: ['500 mg', '250 mg'],
    basePrice: 33.0,
    indications: 'শ্বাসনালীর সংক্রমণ, টনসিল, টাইফয়েড ও ব্যাকটেরিয়াল ইনফেকশন নিরসন।',
    composition: 'প্রতি ডাউজে রয়েছে অ্যাজিথ্রোমাইসিন ডাইহাইড্রেট উপাদান।',
    brandPrefixes: {
      Square: 'Zimax',
      Beximco: 'Azithcin',
      Incepta: 'Trimycin',
      Renata: 'Azith',
      Opsonin: 'Azithro',
    },
  },
  {
    generic: 'Losartan Potassium',
    generic_bn: 'লোসারটান পটাশিয়াম',
    category: 'antihypertensive',
    forms: ['Tablet'],
    strengths: ['50 mg', '25 mg', '100 mg'],
    basePrice: 8.0,
    indications: 'উচ্চ রক্তচাপ নিয়ন্ত্রণ, কিডনি সুরক্ষা ও হার্ট সুস্থ রাখা।',
    composition: 'প্রতি ট্যাবলেটে রয়েছে লোসারটান পটাশিয়াম ইউএসপি উপাদান।',
    brandPrefixes: {
      Square: 'Osartil',
      Beximco: 'Enasym',
      Incepta: 'Angilock',
      Renata: 'Losar',
    },
  },
  {
    generic: 'Vitamin C (Ascorbic Acid)',
    generic_bn: 'ভিটামিন সি',
    category: 'vitamin',
    forms: ['Chewable Tablet'],
    strengths: ['250 mg', '500 mg'],
    basePrice: 2.0,
    indications: 'রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি, মাড়ির ক্ষত ও স্কিন টোন উজ্জ্বল করা।',
    composition: 'প্রতিটি চিবিয়ে খাওয়ার ট্যাবলেটে রয়েছে ভিটামিন সি উপাদান।',
    brandPrefixes: {
      Square: 'Ceevit',
      Beximco: 'Ascor C',
      Acme: 'Vitam C',
      Incepta: 'C-Vitan',
    },
  },
  {
    generic: 'Calcium + Vitamin D3',
    generic_bn: 'ক্যালসিয়াম + ভিটামিন ডি৩',
    category: 'supplement',
    forms: ['Tablet'],
    strengths: ['500 mg + 200 IU'],
    basePrice: 7.0,
    indications: 'হাড়ের ক্ষয় রোধ, ক্যালসিয়াম ঘাটতি পূরণ ও হাড় মজবুত করতে।',
    composition: 'প্রতি ট্যাবলেটে আছে ক্যালসিয়াম কার্বনেট ও ভিটামিন ডি৩।',
    brandPrefixes: {
      Square: 'Calbo D',
      Beximco: 'Calcin D',
      Incepta: 'Cal D',
      Healthcare: 'Ostocal D',
    },
  },
  {
    generic: 'Domperidone',
    generic_bn: 'ডম্পেরিডন',
    category: 'gastrointestinal',
    forms: ['Tablet', 'Suspension'],
    strengths: ['10 mg'],
    basePrice: 3.0,
    indications: 'বমি বমি ভাব, পেট ফাঁপা, বধহজম ও খাবারের পর অস্বস্তি।',
    composition: 'প্রতি ট্যাবলেটে রয়েছে ডম্পেরিডন মেলিয়েট উপাদান।',
    brandPrefixes: {
      Square: 'Omidon',
      Beximco: 'Motigut',
      Incepta: 'Deflux',
      Renata: 'Domin',
    },
  },
];

let cachedMasterCatalog: Medicine[] | null = null;

function generateMasterCatalog(): Medicine[] {
  if (cachedMasterCatalog) return cachedMasterCatalog;

  const masterList: Medicine[] = [];
  let idCounter = 1000;

  for (const molecule of GENERIC_MOLECULES) {
    const {
      generic,
      generic_bn,
      category,
      forms,
      strengths,
      basePrice,
      indications,
      composition,
      brandPrefixes,
    } = molecule;

    for (const mfg of BD_MANUFACTURERS) {
      const companyKey = mfg.split(' ')[0];
      const brandBaseName = brandPrefixes[companyKey] ?? `${companyKey}-${generic}`;
      const brandBnName = `${brandBaseName} (${generic_bn})`;

      for (const form of forms) {
        for (const str of strengths) {
          idCounter++;
          const unitPrice = parseFloat((basePrice + (idCounter % 5) * 0.25).toFixed(2));
          masterList.push({
            id: idCounter,
            brand_name: `${brandBaseName} ${str}`.trim(),
            brand_name_bn: brandBnName,
            generic_name: generic,
            generic_name_bn: generic_bn,
            manufacturer: mfg,
            dosage_form: form,
            strength: str,
            unit_price: unitPrice,
            category,
            indications_bn: indications,
            composition_bn: composition,
          });
        }
      }
    }
  }

  cachedMasterCatalog = masterList;
  return masterList;
}

export class OfflineMedicineDataset {
  static getAll(): Medicine[] {
    return generateMasterCatalog();
  }

  static search(query: string): Medicine[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const master = generateMasterCatalog();

    return master
      .filter((m) => {
        const brand = m.brand_name.toLowerCase();
        const brandBn = (m.brand_name_bn || '').toLowerCase();
        const generic = m.generic_name.toLowerCase();
        const genericBn = (m.generic_name_bn || '').toLowerCase();
        const mfg = (m.manufacturer || '').toLowerCase();

        return (
          brand.includes(q) ||
          brandBn.includes(q) ||
          generic.includes(q) ||
          genericBn.includes(q) ||
          mfg.includes(q)
        );
      })
      .slice(0, 40);
  }

  static getAlternatives(medicineId: number): Medicine[] {
    const master = generateMasterCatalog();
    const target = master.find((m) => m.id === medicineId) || master[0];
    const targetGeneric = target.generic_name.toLowerCase().split('+')[0].trim();

    return master
      .filter((m) => {
        const gen = m.generic_name.toLowerCase();
        return gen.includes(targetGeneric) && m.id !== target.id;
      })
      .slice(0, 20);
  }
}

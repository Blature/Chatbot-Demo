const XLSX = require('xlsx');
const path = require('path');

// Sample chemical products data with detailed information
const products = [
  { 
    'Row': 1, 
    'Product Code': 'CH001', 
    'Product Name': 'اسید سولفوریک 98%', 
    'Unit': 'لیتر',
    'Price': 45000,
    'Category': 'اسیدهای معدنی',
    'Manufacturer': 'شرکت شیمی پارس',
    'Purity': '98%',
    'Description': 'اسید سولفوریک درجه یک صنعتی، مناسب برای تولید کودهای شیمیایی و صنایع نساجی',
    'Storage Conditions': 'مکان خشک و سرد، دور از مواد آلی',
    'CAS Number': '7664-93-9',
    'Available': true
  },
  { 
    'Row': 2, 
    'Product Code': 'CH002', 
    'Product Name': 'سود سوزآور (هیدروکسید سدیم)', 
    'Unit': 'کیلوگرم',
    'Price': 32000,
    'Category': 'بازهای قوی',
    'Manufacturer': 'پتروشیمی شیراز',
    'Purity': '99%',
    'Description': 'سود سوزآور خالص، کاربرد در صنایع صابون‌سازی و تصفیه آب',
    'Storage Conditions': 'ظرف دربسته، دور از رطوبت',
    'CAS Number': '1310-73-2',
    'Available': true
  },
  { 
    'Row': 3, 
    'Product Code': 'CH003', 
    'Product Name': 'اسید کلریدریک 37%', 
    'Unit': 'لیتر',
    'Price': 28000,
    'Category': 'اسیدهای معدنی',
    'Manufacturer': 'شیمی البرز',
    'Purity': '37%',
    'Description': 'اسید هیدروکلریک تجاری، مناسب برای تنظیم pH و تمیزکاری فلزات',
    'Storage Conditions': 'مکان تهویه‌شده، دور از فلزات',
    'CAS Number': '7647-01-0',
    'Available': true
  },
  { 
    'Row': 4, 
    'Product Code': 'CH004', 
    'Product Name': 'آمونیاک محلول 25%', 
    'Unit': 'لیتر',
    'Price': 35000,
    'Category': 'بازهای ضعیف',
    'Manufacturer': 'کارخانه کود قم',
    'Purity': '25%',
    'Description': 'محلول آمونیاک آبی، استفاده در تولید کود و مواد شوینده',
    'Storage Conditions': 'دمای پایین، ظرف محکم',
    'CAS Number': '1336-21-6',
    'Available': true
  },
  { 
    'Row': 5, 
    'Product Code': 'CH005', 
    'Product Name': 'اتانول 96%', 
    'Unit': 'لیتر',
    'Price': 55000,
    'Category': 'الکل‌ها',
    'Manufacturer': 'شرکت الکل اصفهان',
    'Purity': '96%',
    'Description': 'اتیل الکل خالص، مناسب برای صنایع دارویی و آرایشی',
    'Storage Conditions': 'دور از حرارت و جرقه',
    'CAS Number': '64-17-5',
    'Available': true
  },
  { 
    'Row': 6, 
    'Product Code': 'CH006', 
    'Product Name': 'متانول تکنیکال', 
    'Unit': 'لیتر',
    'Price': 38000,
    'Category': 'الکل‌ها',
    'Manufacturer': 'پتروشیمی زاگرس',
    'Purity': '99.5%',
    'Description': 'متیل الکل صنعتی، کاربرد در تولید فرمالدهید و حلال صنعتی',
    'Storage Conditions': 'مکان خنک و تاریک',
    'CAS Number': '67-56-1',
    'Available': true
  },
  { 
    'Row': 7, 
    'Product Code': 'CH007', 
    'Product Name': 'استون خالص', 
    'Unit': 'لیتر',
    'Price': 42000,
    'Category': 'حلال‌های آلی',
    'Manufacturer': 'شیمی کاوه',
    'Purity': '99.9%',
    'Description': 'استون درجه یک، حلال قوی برای رنگ‌ها و چسب‌ها',
    'Storage Conditions': 'دور از منابع احتراق',
    'CAS Number': '67-64-1',
    'Available': true
  },
  { 
    'Row': 8, 
    'Product Code': 'CH008', 
    'Product Name': 'بنزن صنعتی', 
    'Unit': 'لیتر',
    'Price': 65000,
    'Category': 'هیدروکربن‌های آروماتیک',
    'Manufacturer': 'پتروشیمی تبریز',
    'Purity': '99%',
    'Description': 'بنزن تکنیکال، ماده اولیه تولید استایرن و فنل',
    'Storage Conditions': 'مخزن مقاوم به انفجار',
    'CAS Number': '71-43-2',
    'Available': false
  },
  { 
    'Row': 9, 
    'Product Code': 'CH009', 
    'Product Name': 'تولوئن خالص', 
    'Unit': 'لیتر',
    'Price': 48000,
    'Category': 'هیدروکربن‌های آروماتیک',
    'Manufacturer': 'پتروشیمی آبادان',
    'Purity': '99.5%',
    'Description': 'تولوئن درجه یک، حلال رنگ و لعاب',
    'Storage Conditions': 'تهویه مناسب، دور از حرارت',
    'CAS Number': '108-88-3',
    'Available': true
  },
  { 
    'Row': 10, 
    'Product Code': 'CH010', 
    'Product Name': 'زایلن مخلوط', 
    'Unit': 'لیتر',
    'Price': 45000,
    'Category': 'هیدروکربن‌های آروماتیک',
    'Manufacturer': 'نفت جی',
    'Purity': '98%',
    'Description': 'مخلوط ایزومرهای زایلن، حلال صنعتی',
    'Storage Conditions': 'مکان سرد و تاریک',
    'CAS Number': '1330-20-7',
    'Available': true
  },
  { 
    'Row': 11, 
    'Product Code': 'CH011', 
    'Product Name': 'فرمالدهید 37%', 
    'Unit': 'لیتر',
    'Price': 36000,
    'Category': 'آلدهیدها',
    'Manufacturer': 'شیمی فارس',
    'Purity': '37%',
    'Description': 'فرمالین محلول آبی، نگهدارنده و ماده اولیه رزین',
    'Storage Conditions': 'دمای اتاق، دور از نور',
    'CAS Number': '50-00-0',
    'Available': true
  },
  { 
    'Row': 12, 
    'Product Code': 'CH012', 
    'Product Name': 'اسید استیک گلاسیال', 
    'Unit': 'لیتر',
    'Price': 52000,
    'Category': 'اسیدهای آلی',
    'Manufacturer': 'شیمی آریا',
    'Purity': '99.8%',
    'Description': 'اسید استیک خالص، بدون آب، مناسب سنتزهای آلی',
    'Storage Conditions': 'ظرف شیشه‌ای، دور از فلز',
    'CAS Number': '64-19-7',
    'Available': true
  },
  { 
    'Row': 13, 
    'Product Code': 'CH013', 
    'Product Name': 'پتاسیم هیدروکسید', 
    'Unit': 'کیلوگرم',
    'Price': 58000,
    'Category': 'بازهای قوی',
    'Manufacturer': 'کیمیا تک',
    'Purity': '85%',
    'Description': 'پتاس سوزآور، کاربرد در تولید صابون مایع و کود',
    'Storage Conditions': 'ظرف پلاستیکی، دور از رطوبت',
    'CAS Number': '1310-58-3',
    'Available': true
  },
  { 
    'Row': 14, 
    'Product Code': 'CH014', 
    'Product Name': 'کلرید کلسیم', 
    'Unit': 'کیلوگرم',
    'Price': 25000,
    'Category': 'نمک‌های معدنی',
    'Manufacturer': 'نمک دریاچه ارومیه',
    'Purity': '94%',
    'Description': 'کلرید کلسیم خشک‌کن، کاربرد در ذوب یخ و خشک‌کردن گازها',
    'Storage Conditions': 'مکان خشک، ظرف دربسته',
    'CAS Number': '10043-52-4',
    'Available': true
  },
  { 
    'Row': 15, 
    'Product Code': 'CH015', 
    'Product Name': 'سولفات مس', 
    'Unit': 'کیلوگرم',
    'Price': 78000,
    'Category': 'نمک‌های فلزی',
    'Manufacturer': 'مجتمع مس شهربابک',
    'Purity': '98%',
    'Description': 'سولفات مس آبدار، کاربرد در کشاورزی و گالوانیزاسیون',
    'Storage Conditions': 'مکان خشک، دور از فلزات فعال',
    'CAS Number': '7758-98-7',
    'Available': true
  },
  { 
    'Row': 16, 
    'Product Code': 'CH016', 
    'Product Name': 'نیترات نقره', 
    'Unit': 'گرم',
    'Price': 2500000,
    'Category': 'نمک‌های نقره',
    'Manufacturer': 'کانی پارس',
    'Purity': '99.9%',
    'Description': 'نیترات نقره خالص، کاربرد در عکاسی و آنالیز شیمیایی',
    'Storage Conditions': 'ظرف تیره، دور از مواد آلی',
    'CAS Number': '7761-88-8',
    'Available': true
  },
  { 
    'Row': 17, 
    'Product Code': 'CH017', 
    'Product Name': 'کربنات سدیم', 
    'Unit': 'کیلوگرم',
    'Price': 18000,
    'Category': 'نمک‌های قلیایی',
    'Manufacturer': 'شرکت جوشقان',
    'Purity': '99.2%',
    'Description': 'سودا آش سبک، کاربرد در صنایع شیشه و شوینده',
    'Storage Conditions': 'مکان خشک، ظرف پلاستیکی',
    'CAS Number': '497-19-8',
    'Available': true
  },
  { 
    'Row': 18, 
    'Product Code': 'CH018', 
    'Product Name': 'بیکربنات سدیم', 
    'Unit': 'کیلوگرم',
    'Price': 22000,
    'Category': 'نمک‌های قلیایی',
    'Manufacturer': 'شیمی سپاهان',
    'Purity': '99%',
    'Description': 'جوش شیرین خوراکی، کاربرد در صنایع غذایی و دارویی',
    'Storage Conditions': 'مکان خشک و سرد',
    'CAS Number': '144-55-8',
    'Available': true
  },
  { 
    'Row': 19, 
    'Product Code': 'CH019', 
    'Product Name': 'اسید فسفریک 85%', 
    'Unit': 'لیتر',
    'Price': 46000,
    'Category': 'اسیدهای معدنی',
    'Manufacturer': 'فسفات خاور',
    'Purity': '85%',
    'Description': 'اسید فسفریک غلیظ، کاربرد در کود و صنایع غذایی',
    'Storage Conditions': 'ظرف پلاستیکی، دمای اتاق',
    'CAS Number': '7664-38-2',
    'Available': true
  },
  { 
    'Row': 20, 
    'Product Code': 'CH020', 
    'Product Name': 'اسید نیتریک 68%', 
    'Unit': 'لیتر',
    'Price': 85000,
    'Category': 'اسیدهای معدنی',
    'Manufacturer': 'شیمی رازی',
    'Purity': '68%',
    'Description': 'اسید نیتریک قرمز، اکسیدکننده قوی برای سنتز نیترات‌ها',
    'Storage Conditions': 'ظرف شیشه‌ای تیره، محل تهویه‌شده',
    'CAS Number': '7697-37-2',
    'Available': true
  }
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(products);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Products');

// Write file
const outputPath = path.join(__dirname, '..', 'data', 'products.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Sample Excel file created at: ${outputPath}`);
console.log(`Total products: ${products.length}`);
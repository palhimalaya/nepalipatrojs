/**
 * Represents a Nepali date in the Bikram Sambat calendar
 */
export interface NepaliDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Month names in Nepali language (Devanagari script)
 */
export enum NepaliMonth {
  Baisakh = 1,
  Jestha = 2,
  Ashadh = 3,
  Shrawan = 4,
  Bhadra = 5,
  Ashwin = 6,
  Kartik = 7,
  Mangsir = 8,
  Poush = 9,
  Magh = 10,
  Falgun = 11,
  Chaitra = 12
}

/**
 * Month names in Nepali language (Devanagari script)
 */
export enum NepaliMonthNepali {
  बैशाख = 1,
  जेष्ठ = 2,
  आषाढ = 3,
  श्रावण = 4,
  भाद्र = 5,
  आश्विन = 6,
  कार्तिक = 7,
  मंसिर = 8,
  पौष = 9,
  माघ = 10,
  फाल्गुन = 11,
  चैत्र = 12
}

/**
 * Days of the week in Nepali language (English transliteration)
 */
export enum NepaliWeekDay {
  Aitabar = 1,
  Sombar = 2,
  Mangalbar = 3,
  Budhabar = 4,
  Bihibar = 5,
  Sukrabar = 6,
  Sanibar = 7
}

/**
 * Days of the week in Nepali language (Devanagari script)
 */
export enum NepaliWeekDayNepali {
  आइतबार = 1,
  सोमबार = 2,
  मंगलबार = 3,
  बुधबार = 4,
  बिहिबार = 5,
  शुक्रबार = 6,
  शनिबार = 7
}

/**
 * Configuration options for date conversion and formatting
 */
export interface NepaliPatroOptions {
  language?: 'en' | 'np';
  format?: string;
  returnType?: 'string' | 'object';
}


/**
 * Options for the Nepali DatePicker UI component
 */
export interface NepaliDatePickerOptions {
  format?: string;
  theme?: "light" | "dark";
  language?: "en" | "np";
};

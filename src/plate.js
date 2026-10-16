export const plateLetters = Object.freeze({
  A: 'ا',
  B: 'ب',
  J: 'ح',
  D: 'د',
  R: 'ر',
  S: 'س',
  X: 'ص',
  T: 'ط',
  E: 'ع',
  G: 'ق',
  K: 'ك',
  L: 'ل',
  Z: 'م',
  N: 'ن',
  H: 'هـ',
  U: 'و',
  V: 'ى',
})
const arabicToLatin = Object.fromEntries(
  Object.entries(plateLetters).map(([latin, arabic]) => [arabic.replaceAll('ـ', ''), latin]),
)

export function toWesternDigits(value) {
  return String(value).replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

export function toArabicDigits(value) {
  return toWesternDigits(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
}

export function normalizePlate(plate = {}) {
  return {
    letters: String(plate.letters ?? '')
      .replace(/\s/g, '')
      .toUpperCase(),
    digits: toWesternDigits(plate.digits ?? '').trim(),
  }
}

export function plateKey(plate) {
  const { letters, digits } = normalizePlate(plate)
  return `${letters}:${digits}`
}

export function arabicLetters(letters) {
  return [...normalizePlate({ letters }).letters].map((letter) => plateLetters[letter] ?? '—')
}

// Isolate plate matching from free-text search; preserve zeroes and normalize Arabic forms.
export function plateSearchText(value) {
  return [...toWesternDigits(value).replace(/[\s:\-ـ]/g, '')]
    .map((character) => arabicToLatin[character] ?? character)
    .join('')
    .toLowerCase()
}

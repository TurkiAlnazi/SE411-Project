export const plateLetters = 'ABJDRSXTEGKLZNHUV'

export function normalizePlate(plate = {}) {
  return {
    letters: String(plate.letters ?? '')
      .replace(/\s/g, '')
      .toUpperCase(),
    digits: String(plate.digits ?? '').trim(),
  }
}

export function plateKey(plate) {
  const { letters, digits } = normalizePlate(plate)
  return `${letters}:${digits}`
}

export function plateSearchText(value) {
  return String(value)
    .replace(/[\s:-]/g, '')
    .toLowerCase()
}

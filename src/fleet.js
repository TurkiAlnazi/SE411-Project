import {
  normalizePlate,
  plateKey,
  plateLetters,
  plateSearchText,
  toWesternDigits,
} from './plate.js'

export const statuses = ['Available', 'In Use', 'Maintenance']
export const minimumYear = 1900
export const maximumYear = () => new Date().getFullYear() + 1

// All plates, employee names and assignments are fictional demonstration data.
export const initialCars = [
  {
    id: 'car-1',
    plate: { letters: 'ABJ', digits: '1234' },
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    status: 'In Use',
    employee: 'Rami Alnour',
    notes: '',
  },
  {
    id: 'car-2',
    plate: { letters: 'DRS', digits: '5678' },
    make: 'Hyundai',
    model: 'Sonata',
    year: 2023,
    status: 'Available',
    employee: '',
    notes: '',
  },
  {
    id: 'car-3',
    plate: { letters: 'GKH', digits: '9012' },
    make: 'Ford',
    model: 'Explorer',
    year: 2025,
    status: 'Maintenance',
    employee: '',
    notes: '',
  },
  {
    id: 'car-4',
    plate: { letters: 'NTA', digits: '0421' },
    make: 'Toyota',
    model: 'Corolla',
    year: 2025,
    status: 'Available',
    employee: '',
    notes: '',
  },
  {
    id: 'car-5',
    plate: { letters: 'BLD', digits: '2846' },
    make: 'Nissan',
    model: 'Altima',
    year: 2024,
    status: 'In Use',
    employee: 'Lina Alward',
    notes: '',
  },
  {
    id: 'car-6',
    plate: { letters: 'RVE', digits: '7350' },
    make: 'Kia',
    model: 'K5',
    year: 2025,
    status: 'Available',
    employee: '',
    notes: '',
  },
]

export function emptyCar() {
  return {
    plate: { letters: '', digits: '' },
    make: '',
    model: '',
    year: String(new Date().getFullYear()),
    status: 'Available',
    employee: '',
    notes: '',
  }
}

export function validateCar(car, cars = [], editingId = null) {
  const errors = {}
  const plate = normalizePlate(car.plate)
  if (
    plate.letters.length !== 3 ||
    ![...plate.letters].every((letter) => Object.hasOwn(plateLetters, letter))
  )
    errors.letters = 'errorLetters'
  if (!/^[0-9]{1,4}$/.test(plate.digits)) errors.digits = 'errorDigits'
  for (const field of ['make', 'model']) {
    if (!car[field]?.trim()) errors[field] = 'errorRequired'
    else if (car[field].trim().length > 60) errors[field] = 'errorLength'
  }
  const yearText = toWesternDigits(String(car.year)).trim()
  const year = Number(yearText)
  if (
    !/^\d{4}$/.test(yearText) ||
    !Number.isInteger(year) ||
    year < minimumYear ||
    year > maximumYear()
  )
    errors.year = 'errorYear'
  if (!statuses.includes(car.status)) errors.status = 'errorStatus'
  if (car.status === 'In Use' && !car.employee?.trim()) errors.employee = 'errorEmployee'
  else if ((car.employee?.trim().length ?? 0) > 80) errors.employee = 'errorLength'
  if ((car.notes?.trim().length ?? 0) > 500) errors.notes = 'errorNotesLength'
  if (
    !errors.letters &&
    !errors.digits &&
    cars.some((item) => item.id !== editingId && plateKey(item.plate) === plateKey(plate))
  )
    errors.letters = 'errorDuplicate'
  return errors
}

export class VehicleValidationError extends Error {
  constructor(errors) {
    super('Vehicle validation failed')
    this.name = 'VehicleValidationError'
    this.errors = errors
  }
}

// Immutable collection operations: a future service can use these without coupling to UI.
export function saveCar(cars, car, editingId = null) {
  const errors = validateCar(car, cars, editingId)
  if (editingId && !cars.some((item) => item.id === editingId)) errors.form = 'errorMissing'
  if (Object.keys(errors).length) throw new VehicleValidationError(errors)
  const record = {
    id: editingId ?? crypto.randomUUID(),
    plate: normalizePlate(car.plate),
    make: car.make.trim(),
    model: car.model.trim(),
    year: Number(toWesternDigits(String(car.year)).trim()),
    status: car.status,
    employee: (car.employee ?? '').trim(),
    notes: (car.notes ?? '').trim(),
  }
  return editingId ? cars.map((item) => (item.id === editingId ? record : item)) : [...cars, record]
}

export function deleteCar(cars, id) {
  return cars.filter((car) => car.id !== id)
}

export function searchCars(cars, query, status = 'All') {
  const text = toWesternDigits(query.trim()).toLocaleLowerCase()
  const plateText = plateSearchText(text)
  return cars.filter((car) => {
    const plateForms = [plateKey(car.plate), `${car.plate.digits}:${car.plate.letters}`]
    const matchesText =
      !text ||
      [car.make, car.model, car.year, car.employee, car.notes].some((value) =>
        String(value).toLocaleLowerCase().includes(text),
      ) ||
      (plateText && plateForms.some((value) => plateSearchText(value).includes(plateText)))
    return matchesText && (status === 'All' || car.status === status)
  })
}

export function sortCars(cars, sort = 'newest', language = 'en') {
  const result = [...cars]
  if (sort === 'newest') return result.reverse()
  if (sort === 'year') return result.sort((a, b) => b.year - a.year)
  return result.sort((a, b) =>
    `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`, language),
  )
}

export function fleetCounts(cars) {
  return Object.fromEntries([
    ['total', cars.length],
    ...statuses.map((status) => [status, cars.filter((car) => car.status === status).length]),
  ])
}

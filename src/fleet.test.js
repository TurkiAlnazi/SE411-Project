import { describe, expect, it } from 'vitest'
import {
  deleteCar,
  emptyCar,
  fleetCounts,
  initialCars,
  maximumYear,
  saveCar,
  searchCars,
  sortCars,
  validateCar,
  VehicleValidationError,
} from './fleet.js'
import { normalizePlate, plateKey, plateLetters } from './plate.js'

const sample = (overrides = {}) => ({
  ...emptyCar(),
  plate: { letters: 'ABJ', digits: '0012' },
  make: 'Toyota',
  model: 'Camry',
  year: 2024,
  ...overrides,
})

describe('immutable vehicle operations', () => {
  it('adds a normalized record with a unique ID and trims text', () => {
    const input = sample({ make: ' Toyota ', employee: ' Rami Alnour ', notes: ' Test ' })
    const existing = Object.freeze([])
    const first = saveCar(existing, input)
    const second = saveCar(first, sample({ plate: { letters: 'DRS', digits: '12' } }))
    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({
      make: 'Toyota',
      employee: 'Rami Alnour',
      notes: 'Test',
      year: 2024,
    })
    expect(second[0].id).not.toBe(second[1].id)
    expect(existing).toEqual([])
    expect(input.make).toBe(' Toyota ')
    expect(first[0].plate).not.toBe(input.plate)
  })
  it('edits its own plate, preserves ID, and leaves old objects unchanged', () => {
    const cars = saveCar([], sample())
    const edited = saveCar(cars, { ...cars[0], model: 'Corolla' }, cars[0].id)
    expect(edited).toHaveLength(1)
    expect(edited[0].id).toBe(cars[0].id)
    expect(edited[0].model).toBe('Corolla')
    expect(cars[0].model).toBe('Camry')
  })
  it('rejects edits to another car’s plate and missing records', () => {
    expect(
      validateCar(
        { ...initialCars[1], plate: initialCars[0].plate },
        initialCars,
        initialCars[1].id,
      ).letters,
    ).toBe('errorDuplicate')
    expect(() => saveCar([], sample(), 'missing')).toThrow(VehicleValidationError)
  })
  it('deletes only the chosen record and derives updated counts', () => {
    const next = deleteCar(initialCars, 'car-1')
    expect(next).toHaveLength(initialCars.length - 1)
    expect(initialCars).toHaveLength(6)
    expect(fleetCounts(next)).toEqual({ total: 5, Available: 3, 'In Use': 1, Maintenance: 1 })
    expect(fleetCounts([])).toEqual({ total: 0, Available: 0, 'In Use': 0, Maintenance: 0 })
  })
})

describe('structured Saudi-style plates', () => {
  it.each([...plateLetters])('accepts supported letter %s', (letter) => {
    expect(validateCar(sample({ plate: { letters: letter.repeat(3), digits: '1' } }))).toEqual({})
  })
  it.each(['ABC', 'CDE', 'FFF', 'III', 'MOP', 'QWY', '123', 'AB', 'ABJJ'])(
    'rejects unsupported/invalid letters %s',
    (letters) => {
      expect(validateCar(sample({ plate: { letters, digits: '12' } })).letters).toBe('errorLetters')
    },
  )
  it.each(['', '12345', '12a', '-1', '1.2', '1 2'])('rejects invalid digits %s', (digits) => {
    expect(validateCar(sample({ plate: { letters: 'ABJ', digits } })).digits).toBe('errorDigits')
  })
  it('normalizes casing and whitespace for duplicate checks', () => {
    const cars = saveCar([], sample())
    const variant = sample({ plate: { letters: ' a b j ', digits: ' 0012 ' } })
    expect(plateKey(variant.plate)).toBe('ABJ:0012')
    expect(validateCar(variant, cars).letters).toBe('errorDuplicate')
    expect(() => saveCar(cars, variant)).toThrow(VehicleValidationError)
  })
  it('preserves leading zeros in the plate and its duplicate key', () => {
    expect(normalizePlate({ letters: 'abj', digits: '0012' })).toEqual({
      letters: 'ABJ',
      digits: '0012',
    })
    expect(plateKey({ letters: 'ABJ', digits: '0012' })).not.toBe(
      plateKey({ letters: 'ABJ', digits: '12' }),
    )
  })
  it('keeps every sample plate valid and unique', () => {
    for (const car of initialCars) expect(validateCar(car, initialCars, car.id)).toEqual({})
    expect(new Set(initialCars.map((car) => plateKey(car.plate))).size).toBe(initialCars.length)
  })
})

describe('validation', () => {
  it.each(['make', 'model'])('rejects whitespace-only %s', (field) => {
    expect(validateCar(sample({ [field]: '   ' }))[field]).toBe('errorRequired')
  })
  it.each(['', '1899', '2024.5', '2e3', 'abcd', maximumYear() + 1])(
    'rejects invalid year %s',
    (year) => {
      expect(validateCar(sample({ year })).year).toBe('errorYear')
    },
  )
  it('accepts both year bounds and a four-digit string', () => {
    for (const year of [1900, maximumYear(), '2024'])
      expect(validateCar(sample({ year }))).toEqual({})
  })
  it('requires an employee only for In Use', () => {
    expect(validateCar(sample({ status: 'In Use', employee: ' ' })).employee).toBe('errorEmployee')
    expect(validateCar(sample({ status: 'In Use', employee: 'Lina Alward' }))).toEqual({})
    expect(validateCar(sample({ status: 'Maintenance' }))).toEqual({})
    expect(validateCar(sample({ status: 'Invalid' })).status).toBe('errorStatus')
  })
  it('bounds text fields and optional notes', () => {
    expect(
      validateCar(
        sample({ make: 'a'.repeat(61), employee: 'a'.repeat(81), notes: 'a'.repeat(501) }),
      ),
    ).toMatchObject({ make: 'errorLength', employee: 'errorLength', notes: 'errorNotesLength' })
  })
})

describe('search, filtering and sorting', () => {
  it.each(['abj', '1234', 'ABJ 1234', 'A B J 1234', 'ABJ:1234', '1234 ABJ', 'CAMRY', 'Rami'])(
    'finds the correct vehicle for %s',
    (query) => {
      expect(searchCars(initialCars, query).map((car) => car.id)).toEqual(['car-1'])
    },
  )
  it('matches spaced letters, plate zeros, years and notes', () => {
    expect(searchCars(initialCars, 'G K H')[0].id).toBe('car-3')
    expect(searchCars(initialCars, '0421')[0].id).toBe('car-4')
    expect(searchCars(initialCars, '2023')[0].id).toBe('car-2')
    expect(searchCars([{ ...initialCars[0], notes: 'Spare key' }], 'spare')).toHaveLength(1)
  })
  it('combines status with search and handles empty results', () => {
    expect(searchCars(initialCars, 'Toyota', 'Available').map((car) => car.id)).toEqual(['car-4'])
    expect(searchCars(initialCars, 'Camry', 'Maintenance')).toEqual([])
    expect(searchCars(initialCars, '   ')).toHaveLength(6)
    expect(searchCars([], '')).toEqual([])
  })
  it('sorts without changing the source order', () => {
    expect(sortCars(initialCars, 'newest')[0].id).toBe('car-6')
    expect(sortCars(initialCars, 'name')[0].make).toBe('Ford')
    expect(sortCars(initialCars, 'year')[0].year).toBe(2025)
    expect(initialCars[0].id).toBe('car-1')
  })
})

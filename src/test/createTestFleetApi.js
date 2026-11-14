import { FleetApiError } from '../api.js'
import { deleteCar, fleetCounts, initialCars, saveCar, searchCars, sortCars } from '../fleet.js'

// An isolated stand-in for component tests. Browser tests use the real Java API.
export function createTestFleetApi() {
  let cars = [...initialCars]
  return {
    async summary() {
      return { counts: fleetCounts(cars), recent: sortCars(cars).slice(0, 4) }
    },
    async list({ page, size, query, status, sort }) {
      const matches = sortCars(searchCars(cars, query, status), sort)
      return {
        page,
        size,
        totalElements: matches.length,
        totalPages: Math.ceil(matches.length / size),
        content: matches.slice(page * size, (page + 1) * size),
      }
    },
    async find(id) {
      const car = cars.find((item) => item.id === id)
      if (!car) throw new FleetApiError('errorMissing', {}, 404)
      return car
    },
    async save(form, id) {
      try {
        cars = saveCar(cars, form, id)
        return id ? cars.find((car) => car.id === id) : cars.at(-1)
      } catch (error) {
        throw new FleetApiError('errorValidation', error.errors, 400)
      }
    },
    async remove(id) {
      cars = deleteCar(cars, id)
    },
  }
}

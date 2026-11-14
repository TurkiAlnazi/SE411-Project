import { normalizePlate } from './plate.js'

export class FleetApiError extends Error {
  constructor(code, fields = {}, status = 0) {
    super(code)
    this.name = 'FleetApiError'
    this.code = code
    this.fields = fields
    this.status = status
  }
}

async function request(path = '', { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch('/api/cars' + path, {
      method,
      signal,
      cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new FleetApiError('errorConnection')
  }

  if (response.status === 204) return
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload) {
    throw new FleetApiError(payload?.code ?? 'errorConnection', payload?.fields, response.status)
  }
  return payload
}

function vehiclePayload(draft) {
  const { plate, make, model, year, status, employee, notes } = draft
  return {
    plate: normalizePlate(plate),
    make: make.trim(),
    model: model.trim(),
    year: String(year).trim(),
    status,
    employee: employee.trim(),
    notes: notes.trim(),
  }
}

export const fleetApi = {
  summary: (signal) => request('/summary', { signal }),
  list: ({ page, size, query, status, sort }, signal) =>
    request('?' + new URLSearchParams({ page, size, q: query.trim(), status, sort }), { signal }),
  async find(id) {
    const expectedId = id.trim()
    const car = await request('/' + encodeURIComponent(expectedId))
    // A reserved subroute such as /summary returns a different kind of JSON.
    if (car?.id !== expectedId) throw new FleetApiError('errorMissing', {}, 404)
    return car
  },
  save: (draft, id) =>
    request(id ? '/' + encodeURIComponent(id) : '', {
      method: id ? 'PUT' : 'POST',
      body: vehiclePayload(draft),
    }),
  remove: (id) => request('/' + encodeURIComponent(id), { method: 'DELETE' }),
}

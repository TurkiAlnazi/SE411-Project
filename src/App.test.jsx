import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { SaudiPlate } from './components.jsx'
import { label } from './labels.js'
import { FleetApiError } from './api.js'
import { createTestFleetApi } from './test/createTestFleetApi.js'

function renderApp(api = createTestFleetApi()) {
  return render(<App api={api} />)
}

async function addExample(user) {
  await user.click(screen.getByRole('button', { name: 'Add vehicle' }))
  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText(/Plate letters/), 'abk')
  await user.type(dialog.getByLabelText(/Plate digits/), '0077')
  await user.type(dialog.getByLabelText(/^Make/), 'Lexus')
  await user.type(dialog.getByLabelText(/^Model \*/), 'ES')
  await user.type(dialog.getByLabelText(/^Notes/), '<script>literal text</script>')
  await user.click(dialog.getByRole('button', { name: 'Add vehicle' }))
}

describe('Fleetline user interactions', () => {
  it('adds, views, edits, cancels deletion and deletes a vehicle through the UI', async () => {
    const user = userEvent.setup()
    renderApp()
    await addExample(user)
    expect(await screen.findByText('Lexus ES was added to the fleet.')).toBeInTheDocument()
    expect(
      within(await screen.findByRole('region', { name: 'Total cars' })).getByText('07'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    const view = (await screen.findAllByRole('button', { name: 'View Lexus ES · ABK 0077' }))[0]
    await user.click(view)
    let dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('<script>literal text</script>')).toBeInTheDocument()
    expect(dialog.getByText('0077')).toBeInTheDocument()
    await user.click(dialog.getByRole('button', { name: 'Edit vehicle' }))
    dialog = within(screen.getByRole('dialog'))
    await user.selectOptions(dialog.getByLabelText(/^Status/), 'In Use')
    await user.type(dialog.getByLabelText(/^Assigned employee/), 'Mazen Alward')
    await user.click(dialog.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Lexus ES was updated.')).toBeInTheDocument()
    expect(await screen.findByText('Mazen Alward')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete Lexus ES · ABK 0077' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Lexus ES (ABK 0077)')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }))
    expect(await screen.findByText('Mazen Alward')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete Lexus ES · ABK 0077' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete vehicle' }),
    )
    expect(screen.queryByText('Mazen Alward')).not.toBeInTheDocument()
    expect(screen.getByText('Lexus ES was deleted.')).toBeInTheDocument()
    expect(await screen.findByText('Showing 3 of 6 cars')).toBeInTheDocument()
  })

  it('retains filters and sort after an incomplete form is canceled', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    await user.type(screen.getByLabelText('Search vehicles'), 'Toyota')
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Available')
    await user.selectOptions(screen.getByLabelText('Sort vehicles'), 'year')
    expect(await screen.findByText('Showing 1 of 6 cars')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add vehicle' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText(/Plate letters/), 'ABK')
    await user.type(dialog.getByLabelText(/^Make/), 'Draft')
    await user.click(dialog.getByRole('button', { name: 'Add vehicle' }))
    expect(dialog.getByRole('alert')).toHaveTextContent('Please check the highlighted fields.')
    expect(
      dialog.getByText('Enter one to four digits. Leading zeros are kept.'),
    ).toBeInTheDocument()
    expect(dialog.getByLabelText(/^Make/)).toHaveValue('Draft')
    await user.click(dialog.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByLabelText('Search vehicles')).toHaveValue('Toyota')
    expect(screen.getByLabelText('Filter by status')).toHaveValue('Available')
    expect(screen.getByLabelText('Sort vehicles')).toHaveValue('year')
    expect(await screen.findByText('Showing 1 of 6 cars')).toBeInTheDocument()
  })

  it('shows duplicate validation and keeps an existing record unchanged when edit is canceled', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    await user.click(await screen.findByRole('button', { name: 'Edit Kia K5 · RVE 7350' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.clear(dialog.getByLabelText(/Plate letters/))
    await user.type(dialog.getByLabelText(/Plate letters/), ' abj ')
    await user.clear(dialog.getByLabelText(/Plate digits/))
    await user.type(dialog.getByLabelText(/Plate digits/), '1234')
    await user.click(dialog.getByRole('button', { name: 'Save changes' }))
    expect(
      await dialog.findByText('This plate is already registered in your fleet.'),
    ).toBeInTheDocument()
    expect(dialog.getByLabelText(/Plate letters/)).toHaveFocus()
    await user.click(dialog.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Edit Kia K5 · RVE 7350' })).toBeInTheDocument()
  })

  it('searches plates, filters, clears empty results, and sorts the visible rows', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    await user.type(screen.getByLabelText('Search vehicles'), 'A B J 1234')
    expect(await screen.findByText('Toyota Camry')).toBeInTheDocument()
    expect(screen.queryByText('Kia K5')).not.toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Maintenance')
    expect(await screen.findByText('No cars match your search.')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0])
    expect(screen.getByLabelText('Search vehicles')).toHaveValue('')
    expect(screen.getByLabelText('Filter by status')).toHaveValue('All')
    await user.selectOptions(screen.getByLabelText('Sort vehicles'), 'name')
    const rows = within(await screen.findByRole('table')).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Ford Explorer')
  })

  it('restores focus on dialog cancellation and renders only the supplied team', async () => {
    const user = userEvent.setup()
    renderApp()
    const add = screen.getByRole('button', { name: 'Add vehicle' })
    await user.click(add)
    expect(within(screen.getByRole('dialog')).getByLabelText(/Plate letters/)).toHaveFocus()
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(add).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'About the project' }))
    expect(screen.getByText('Turki Alanazi')).toBeInTheDocument()
    expect(screen.getByText('222211513')).toBeInTheDocument()
    expect(screen.getByText('Mohammed Alhindi')).toBeInTheDocument()
    expect(screen.getByText('221110784')).toBeInTheDocument()
    expect(screen.getByText('Faisal Alghubaini')).toBeInTheDocument()
    expect(screen.getByText('219211021')).toBeInTheDocument()
    expect(screen.queryByText(/ADD MEMBER/)).not.toBeInTheDocument()
  })

  it('handles deleting the entire fleet with zero counts and actionable empty states', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    for (let index = 0; index < 6; index += 1) {
      await user.click((await screen.findAllByRole('button', { name: /^Delete / }))[0])
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete vehicle' }),
      )
    }
    expect(await screen.findByText('Your fleet starts here.')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 0 cars')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Dashboard' }))
    expect(
      within(await screen.findByRole('region', { name: 'Total cars' })).getByText('00'),
    ).toBeInTheDocument()
    expect(screen.getByText('No cars available right now')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add vehicle' })).toHaveLength(2)
  })

  it('loads saved vehicles from the same server after the UI remounts', async () => {
    const user = userEvent.setup()
    const api = createTestFleetApi()
    const { unmount } = renderApp(api)
    await addExample(user)
    expect(await screen.findByText('Lexus ES was added to the fleet.')).toBeInTheDocument()
    unmount()
    renderApp(api)
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    expect(await screen.findByText('Lexus ES')).toBeInTheDocument()
    expect(await screen.findByText('Showing 3 of 7 cars')).toBeInTheDocument()
  })

  it('requests the next page and opens a car by exact ID independently of the page', async () => {
    const user = userEvent.setup()
    const api = createTestFleetApi()
    const list = vi.spyOn(api, 'list')
    const find = vi.spyOn(api, 'find')
    renderApp(api)
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Kia K5')).toBeInTheDocument()
    expect(screen.queryByText('Toyota Camry')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument()
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, size: 3 }),
      expect.anything(),
    )
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    await user.type(screen.getByLabelText('Record ID'), 'car-4')
    await user.click(screen.getByRole('button', { name: 'Find by ID' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Toyota Corolla')
    expect(find).toHaveBeenCalledWith('car-4')
  })

  it('shows missing-ID and connection errors and can retry the list', async () => {
    const user = userEvent.setup()
    const api = createTestFleetApi()
    vi.spyOn(api, 'list').mockRejectedValueOnce(new FleetApiError('errorConnection'))
    renderApp(api)
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the fleet server')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Record ID'), 'missing-car')
    await user.click(screen.getByRole('button', { name: 'Find by ID' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This vehicle is no longer in the fleet',
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

it('shows the plate number with its leading zeros and the country code', () => {
  render(<SaudiPlate plate={{ letters: 'ABH', digits: '0012' }} t={label} />)
  const plate = screen.getByRole('img', { name: /A B H, 0012/ })
  expect(plate).toHaveAttribute('dir', 'ltr')
  expect(plate).toHaveTextContent('0012')
  expect(plate).toHaveTextContent('KSA')
})

it('keeps the preview at three letter positions for an invalid long draft', () => {
  render(<SaudiPlate plate={{ letters: 'ABJH', digits: '0012' }} t={label} />)
  expect(screen.getByRole('img').querySelector('.plate-letters')).toHaveTextContent('ABJ')
  expect(screen.getByRole('img').querySelector('.plate-letters')).not.toHaveTextContent('H')
})

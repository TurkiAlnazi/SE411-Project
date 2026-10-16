import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { SaudiPlate } from './components.jsx'
import { translate } from './i18n.js'

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
    render(<App />)
    await addExample(user)
    expect(screen.getByText('Lexus ES was added to the fleet.')).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Total cars' })).getByText('07'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    const view = screen.getAllByRole('button', { name: 'View Lexus ES · ABK 0077' })[0]
    await user.click(view)
    let dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('<script>literal text</script>')).toBeInTheDocument()
    expect(dialog.getByText('0077')).toBeInTheDocument()
    await user.click(dialog.getByRole('button', { name: 'Edit vehicle' }))
    dialog = within(screen.getByRole('dialog'))
    await user.selectOptions(dialog.getByLabelText(/^Status/), 'In Use')
    await user.type(dialog.getByLabelText(/^Assigned employee/), 'Mazen Alward')
    await user.click(dialog.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByText('Lexus ES was updated.')).toBeInTheDocument()
    expect(screen.getByText('Mazen Alward')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete Lexus ES · ABK 0077' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Lexus ES (ABK 0077)')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Mazen Alward')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete Lexus ES · ABK 0077' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete vehicle' }),
    )
    expect(screen.queryByText('Mazen Alward')).not.toBeInTheDocument()
    expect(screen.getByText('Lexus ES was deleted.')).toBeInTheDocument()
    expect(screen.getByText('Showing 6 of 6 cars')).toBeInTheDocument()
  })

  it('retains filters, sort and unsaved input when language switches, and translates errors', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    await user.type(screen.getByLabelText('Search vehicles'), 'Toyota')
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Available')
    await user.selectOptions(screen.getByLabelText('Sort vehicles'), 'year')
    expect(screen.getByText('Showing 1 of 6 cars')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add vehicle' }))
    let dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText(/Plate letters/), 'ABK')
    await user.type(dialog.getByLabelText(/^Make/), 'Draft')
    await user.click(dialog.getByRole('button', { name: 'العربية' }))
    dialog = within(screen.getByRole('dialog'))
    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(dialog.getByLabelText(/حروف اللوحة/)).toHaveValue('ABK')
    expect(dialog.getByLabelText(/الشركة المصنعة/)).toHaveValue('Draft')
    await user.click(dialog.getByRole('button', { name: 'إضافة سيارة' }))
    expect(dialog.getByRole('alert')).toHaveTextContent('يرجى مراجعة الحقول المحددة.')
    expect(
      dialog.getByText('أدخل من رقم إلى أربعة أرقام. تُحفظ الأصفار في البداية.'),
    ).toBeInTheDocument()
    await user.click(dialog.getByRole('button', { name: 'إلغاء' }))
    expect(screen.getByLabelText('البحث عن السيارات')).toHaveValue('Toyota')
    expect(screen.getByLabelText('تصفية حسب الحالة')).toHaveValue('Available')
    expect(screen.getByLabelText('ترتيب السيارات')).toHaveValue('year')
    expect(screen.getByText('عرض ١ من أصل ٦ سيارة')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })

  it('shows duplicate validation and keeps an existing record unchanged when edit is canceled', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    await user.click(screen.getByRole('button', { name: 'Edit Kia K5 · RVE 7350' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.clear(dialog.getByLabelText(/Plate letters/))
    await user.type(dialog.getByLabelText(/Plate letters/), ' abj ')
    await user.clear(dialog.getByLabelText(/Plate digits/))
    await user.type(dialog.getByLabelText(/Plate digits/), '1234')
    await user.click(dialog.getByRole('button', { name: 'Save changes' }))
    expect(dialog.getByText('This plate is already registered in your fleet.')).toBeInTheDocument()
    expect(dialog.getByLabelText(/Plate letters/)).toHaveFocus()
    await user.click(dialog.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Edit Kia K5 · RVE 7350' })).toBeInTheDocument()
  })

  it('searches Arabic plates, filters, clears empty results, and sorts the visible rows', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    await user.type(screen.getByLabelText('Search vehicles'), 'ا ب ح ١٢٣٤')
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
    expect(screen.queryByText('Kia K5')).not.toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Maintenance')
    expect(screen.getByText('No cars match your search.')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0])
    expect(screen.getByLabelText('Search vehicles')).toHaveValue('')
    expect(screen.getByLabelText('Filter by status')).toHaveValue('All')
    await user.selectOptions(screen.getByLabelText('Sort vehicles'), 'name')
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Ford Explorer')
  })

  it('restores focus on dialog cancellation and renders only the supplied team', async () => {
    const user = userEvent.setup()
    render(<App />)
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
    await user.click(screen.getByRole('button', { name: 'العربية' }))
    expect(screen.getByText('تركي العنزي')).toBeInTheDocument()
    expect(screen.getByText('محمد الهندي')).toBeInTheDocument()
    expect(screen.getByText('فيصل الغبيني')).toBeInTheDocument()
  })

  it('handles deleting the entire fleet with zero counts and actionable empty states', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Vehicles/ }))
    for (let index = 0; index < 6; index += 1) {
      await user.click(screen.getAllByRole('button', { name: /^Delete / })[0])
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete vehicle' }),
      )
    }
    expect(screen.getByText('Your fleet starts here.')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 0 cars')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Dashboard' }))
    expect(
      within(screen.getByRole('region', { name: 'Total cars' })).getByText('00'),
    ).toBeInTheDocument()
    expect(screen.getByText('No cars available right now')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add vehicle' })).toHaveLength(2)
  })

  it('persists only language, resets cars on remount and retranslates feedback', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await addExample(user)
    await user.click(screen.getByRole('button', { name: 'العربية' }))
    expect(screen.getByText('أُضيفت Lexus ES إلى الأسطول.')).toBeInTheDocument()
    expect(localStorage.getItem('fleetline-language')).toBe('ar')
    expect(localStorage.length).toBe(1)
    unmount()
    render(<App />)
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    await user.click(screen.getByRole('button', { name: /^السيارات/ }))
    expect(screen.queryByText('Lexus ES')).not.toBeInTheDocument()
    expect(screen.getByText('عرض ٦ من أصل ٦ سيارة')).toBeInTheDocument()
  })

  it('still renders and switches language when local storage is unavailable', async () => {
    const user = userEvent.setup()
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'العربية' }))
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    get.mockRestore()
    set.mockRestore()
  })
})

it('keeps plate direction fixed while deriving both scripts from one data source', () => {
  const t = (key, values) => translate('ar', key, values)
  render(<SaudiPlate plate={{ letters: 'ABH', digits: '0012' }} t={t} />)
  const plate = screen.getByRole('img', { name: /A B H/ })
  expect(plate).toHaveAttribute('dir', 'ltr')
  expect(plate).toHaveTextContent('٠٠١٢')
  expect(plate).toHaveTextContent('0012')
  expect(plate).toHaveTextContent('هـ')
})

it('keeps both preview rows at three letters for an invalid long draft', () => {
  const t = (key, values) => translate('en', key, values)
  render(<SaudiPlate plate={{ letters: 'ABJH', digits: '0012' }} t={t} />)
  const plate = screen.getByRole('img')
  expect(plate.querySelector('.plate-letters.plate-latin')).toHaveTextContent('ABJ')
  expect(plate.querySelector('.plate-letters.plate-arabic')).toHaveTextContent('ابح')
  expect(plate).not.toHaveTextContent('هـ')
})

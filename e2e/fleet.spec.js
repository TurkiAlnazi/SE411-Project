import { expect, test } from '@playwright/test'

test('desktop CRUD, cancellation, validation and saved edits after refresh', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your fleet, in focus.')
  await expect(page.getByRole('region', { name: 'Total cars' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/dashboard-en.png', fullPage: true })
  await page.getByRole('button', { name: /^Vehicles/ }).click()
  await page.getByRole('button', { name: 'Add vehicle', exact: true }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByLabel(/Plate letters/).fill('ABK')
  await dialog.getByLabel(/Plate digits/).fill('0077')
  await dialog.getByLabel(/^Make/).fill('Lexus')
  await dialog.getByLabel(/^Model \*/).fill('ES')
  await dialog.getByLabel(/^Status/).selectOption('In Use')
  await dialog.getByRole('button', { name: 'Add vehicle', exact: true }).click()
  await expect(dialog.getByText('Assign an employee to a car that is in use.')).toBeVisible()
  await dialog.getByLabel(/^Assigned employee/).fill('Mazen Alward')
  await dialog.getByLabel(/^Notes/).fill('<script>plain text</script>')
  await dialog.getByRole('button', { name: 'Add vehicle', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByText('Showing 3 of 7 cars')).toBeVisible()
  await page.getByRole('button', { name: 'View Lexus ES · ABK 0077' }).first().click()
  dialog = page.getByRole('dialog')
  await expect(dialog.getByText('<script>plain text</script>')).toBeVisible()
  await dialog.getByRole('button', { name: 'Edit vehicle', exact: true }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Model \*/).fill('ES 350')
  await dialog.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Lexus ES 350 was updated.')).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByRole('button', { name: /^Vehicles/ }).click()
  await expect(page.getByText('Lexus ES 350', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Delete Lexus ES 350 · ABK 0077' }).click()
  dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Lexus ES 350 (ABK 0077)')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByText('Mazen Alward')).toBeVisible()
  await page.getByRole('button', { name: 'Delete Lexus ES 350 · ABK 0077' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete vehicle', exact: true })
    .click()
  await expect(page.getByText('Showing 3 of 6 cars')).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByRole('button', { name: /^Vehicles/ }).click()
  await expect(page.getByText('Showing 3 of 6 cars')).toBeVisible()
  expect(errors).toEqual([])
})

test('the directory requests distinct server pages and finds a vehicle by exact ID', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^Vehicles/ }).click()
  await expect(page.getByText('Page 1 of 2')).toBeVisible()
  await expect(page.getByText('Kia K5', { exact: true })).toBeVisible()
  await expect(page.getByText('Toyota Camry', { exact: true })).toHaveCount(0)

  const secondPage = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return url.pathname === '/api/cars' && url.searchParams.get('page') === '1'
  })
  await page.getByRole('button', { name: 'Next' }).click()
  const response = await secondPage
  expect(response.status()).toBe(200)
  expect(await response.json()).toMatchObject({ page: 1, size: 3, totalElements: 6, totalPages: 2 })
  await expect(page.getByText('Page 2 of 2')).toBeVisible()
  await expect(page.getByText('Toyota Camry', { exact: true })).toBeVisible()
  await expect(page.getByText('Kia K5', { exact: true })).toHaveCount(0)

  await page.getByLabel('Record ID').fill('car-4')
  const lookup = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/cars/car-4',
  )
  await page.getByRole('button', { name: 'Find by ID' }).click()
  expect((await lookup).status()).toBe(200)
  await expect(page.getByRole('dialog')).toContainText('Toyota Corolla')
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.getByLabel('Record ID').fill('missing-car')
  await page.getByRole('button', { name: 'Find by ID' }).click()
  await expect(page.getByRole('alert')).toHaveText('This vehicle is no longer in the fleet.')
  await page.getByLabel('Record ID').fill('summary')
  await page.getByRole('button', { name: 'Find by ID' }).click()
  await expect(page.getByRole('alert')).toHaveText('This vehicle is no longer in the fleet.')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Previous' }).click()
  await expect(page.getByText('Page 1 of 2')).toBeVisible()
})

test('native dialog traps keyboard focus, closes with Escape, and restores focus', async ({
  page,
}) => {
  await page.goto('/')
  const add = page.getByRole('button', { name: 'Add vehicle', exact: true })
  await add.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel(/Plate letters/)).toBeFocused()
  await dialog.getByRole('button', { name: 'Add vehicle', exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Add vehicle', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(add).toBeFocused()
})

test('mobile plate layout, search, filtering and duplicate validation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: /^Vehicles/ }).click()
  await page.getByLabel('Search vehicles').fill('A B J 1234')
  await expect(page.getByText('Showing 1 of 6 cars')).toBeVisible()
  await page.getByLabel('Filter by status').selectOption('Maintenance')
  await expect(page.getByText('No cars match your search.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters', exact: true }).last().click()
  await expect(page.getByText('Showing 3 of 6 cars')).toBeVisible()
  await page.screenshot({ path: 'artifacts/vehicles-mobile.png', fullPage: true })
  const plate = page.locator('.saudi-plate').first()
  await expect(plate).toContainText('KSA')
  const geometry = await plate.evaluate((element) => {
    const main = element.querySelector('.plate-main').getBoundingClientRect()
    const side = element.querySelector('.plate-country').getBoundingClientRect()
    return {
      direction: getComputedStyle(element).direction,
      sideOnRight: side.x >= main.right - 1,
    }
  })
  expect(geometry).toEqual({ direction: 'ltr', sideOnRight: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.getByRole('button', { name: 'Add vehicle', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/Plate letters/).fill('NTA')
  await dialog.getByLabel(/Plate digits/).fill('0421')
  await dialog.getByLabel(/^Make/).fill('Toyota')
  await dialog.getByLabel(/^Model \*/).fill('Corolla')
  await dialog.getByRole('button', { name: 'Add vehicle', exact: true }).click()
  await expect(dialog.getByText('This plate is already registered in your fleet.')).toBeVisible()
  await expect(dialog.getByLabel(/^Model \*/)).toHaveValue('Corolla')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
})

test('the English screens fit narrow, tablet and desktop widths', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const [menu, heading] of [
      [/^Dashboard/, 'Your fleet, in focus.'],
      [/^Vehicles/, 'Vehicle directory'],
      [/^About the project/, 'The project team'],
    ]) {
      await page.getByRole('button', { name: menu }).click()
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true)
    }
  }
  for (const name of ['Turki Alanazi', 'Mohammed Alhindi', 'Faisal Alghubaini']) {
    await expect(page.getByRole('heading', { name })).toBeVisible()
  }
  await expect(page.getByText('219211021', { exact: true })).toBeVisible()
  await page.screenshot({ path: 'artifacts/about-desktop.png', fullPage: true })
})

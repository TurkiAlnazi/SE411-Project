import { expect, test } from '@playwright/test'

test('desktop CRUD, cancellation, validation, translated feedback and refresh behavior', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your fleet, in focus.')
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
  await expect(page.getByText('Showing 7 of 7 cars')).toBeVisible()
  await page.getByRole('button', { name: 'View Lexus ES · ABK 0077' }).first().click()
  dialog = page.getByRole('dialog')
  await expect(dialog.getByText('<script>plain text</script>')).toBeVisible()
  await dialog.getByRole('button', { name: 'Edit vehicle', exact: true }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByLabel(/^Model \*/).fill('ES 350')
  await dialog.getByRole('button', { name: 'العربية' }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(dialog.getByLabel(/^الطراز/)).toHaveValue('ES 350')
  await dialog.getByRole('button', { name: 'حفظ التغييرات' }).click()
  await expect(page.getByText('حُدّثت بيانات Lexus ES 350.')).toBeVisible()
  await page.getByRole('button', { name: 'حذف Lexus ES 350 · ABK 0077' }).click()
  dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Lexus ES 350 (ABK 0077)')
  await dialog.getByRole('button', { name: 'إلغاء' }).click()
  await expect(page.getByText('Mazen Alward')).toBeVisible()
  await page.getByRole('button', { name: 'حذف Lexus ES 350 · ABK 0077' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'حذف السيارة', exact: true }).click()
  await expect(page.getByText('عرض ٦ من أصل ٦ سيارة')).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await page.getByRole('button', { name: /^السيارات/ }).click()
  await expect(page.getByText('عرض ٦ من أصل ٦ سيارة')).toBeVisible()
  expect(errors).toEqual([])
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
  await expect(dialog.getByRole('button', { name: 'English' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Add vehicle', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(add).toBeFocused()
})

test('mobile Arabic cards, plate geometry, search, filters and draft language switching', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'العربية' }).click()
  await page.screenshot({ path: 'artifacts/dashboard-ar-mobile.png', fullPage: true })
  await page.getByRole('button', { name: /^السيارات/ }).click()
  await page.getByLabel('البحث عن السيارات').fill('ا ب ح ١٢٣٤')
  await expect(page.getByText('عرض ١ من أصل ٦ سيارة')).toBeVisible()
  await page.getByLabel('تصفية حسب الحالة').selectOption('Maintenance')
  await expect(page.getByText('لا توجد سيارات تطابق بحثك.')).toBeVisible()
  await page.getByRole('button', { name: 'مسح عوامل البحث', exact: true }).last().click()
  await expect(page.getByText('عرض ٦ من أصل ٦ سيارة')).toBeVisible()
  await page.screenshot({ path: 'artifacts/vehicles-ar-mobile.png', fullPage: true })
  const geometry = await page
    .locator('.saudi-plate')
    .first()
    .evaluate((element) => {
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
  await page.getByRole('button', { name: 'إضافة سيارة', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel(/حروف اللوحة/).fill('NTA')
  await dialog.getByLabel(/أرقام اللوحة/).fill('0421')
  await dialog.getByLabel(/^الشركة المصنعة/).fill('Toyota')
  await dialog.getByLabel(/^الطراز/).fill('Draft')
  await dialog.getByRole('button', { name: 'English' }).click()
  await expect(dialog.getByLabel(/^Model \*/)).toHaveValue('Draft')
  await dialog.getByRole('button', { name: 'Add vehicle', exact: true }).click()
  await expect(dialog.getByText('This plate is already registered in your fleet.')).toBeVisible()
  await page.screenshot({ path: 'artifacts/vehicle-form-mobile.png', fullPage: true })
  await dialog.getByRole('button', { name: 'Cancel' }).click()
})

test('tablet and narrow layouts stay within the viewport in both directions', async ({ page }) => {
  await page.goto('/')
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const language of ['English', 'العربية']) {
      await page.getByRole('button', { name: language, exact: true }).click()
      for (const pageName of language === 'English'
        ? [/^Dashboard/, /^Vehicles/, /^About the project/]
        : [/^لوحة التحكم/, /^السيارات/, /^عن المشروع/]) {
        await page.getByRole('button', { name: pageName }).click()
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true)
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.getByRole('button', { name: /^لوحة التحكم/ }).click()
  await page.screenshot({ path: 'artifacts/dashboard-ar.png', fullPage: true })
  await page.getByRole('button', { name: /^عن المشروع/ }).click()
  await expect(page.getByText('تركي العنزي', { exact: true })).toBeVisible()
  await expect(page.getByText('محمد الهندي', { exact: true })).toBeVisible()
  await expect(page.getByText('فيصل الغبيني', { exact: true })).toBeVisible()
  await expect(page.getByText('219211021', { exact: true })).toBeVisible()
})

import { useState } from 'react'
import { Dialog, Icon, SaudiPlate, StatusBadge } from './components.jsx'
import { emptyCar, maximumYear, minimumYear, statuses, validateCar } from './fleet.js'
import { formatNumber } from './i18n.js'

export function VehicleForm({ car, cars, onSave, ...dialogProps }) {
  const { t, language, onClose } = dialogProps
  const [form, setForm] = useState(() => (car ? { ...car, plate: { ...car.plate } } : emptyCar()))
  const [errors, setErrors] = useState({})
  const errorMessage = (key) =>
    t(key, { min: formatNumber(minimumYear, language), max: formatNumber(maximumYear(), language) })
  function update(event) {
    const { name, value } = event.target
    setForm((current) =>
      ['letters', 'digits'].includes(name)
        ? { ...current, plate: { ...current.plate, [name]: value } }
        : { ...current, [name]: value },
    )
  }
  function submit(event) {
    event.preventDefault()
    const nextErrors = validateCar(form, cars, car?.id)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    onSave(form, car?.id)
  }
  function field(name, options = {}) {
    const errorId = errors[name] ? `${name}-error` : undefined
    const hintId =
      name === 'letters' ? 'letters-hint' : name === 'employee' ? 'employee-hint' : undefined
    return (
      <div className={`field ${options.wide ? 'field-wide' : ''}`}>
        <label htmlFor={name}>
          {t(name)}
          {options.required ? (
            <span aria-hidden="true"> *</span>
          ) : options.optional ? (
            <span className="optional"> ({t('optional')})</span>
          ) : null}
        </label>
        <input
          id={name}
          name={name}
          value={['letters', 'digits'].includes(name) ? form.plate[name] : form[name]}
          onChange={update}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          required={options.required}
          data-initial-focus={name === 'letters' ? '' : undefined}
          {...options.input}
        />
        {name === 'letters' && <small id="letters-hint">{t('supportedLetters')}</small>}
        {name === 'employee' && <small id="employee-hint">{t('employeeHint')}</small>}
        {errorId && (
          <span className="field-error" id={errorId}>
            {errorMessage(errors[name])}
          </span>
        )}
      </div>
    )
  }
  return (
    <Dialog {...dialogProps} title={t(car ? 'editVehicle' : 'addVehicle')}>
      <p className="modal-subtitle">
        {t('formSubtitle')} <span>{t('requiredHint')}</span>
      </p>
      <form onSubmit={submit} noValidate>
        {Object.keys(errors).length > 0 && (
          <div className="error-summary" role="alert">
            <Icon name="info" />
            <span>{t('errorHeading')}</span>
          </div>
        )}
        <div className="form-grid">
          {field('letters', {
            required: true,
            input: {
              dir: 'ltr',
              maxLength: 12,
              autoComplete: 'off',
              autoCapitalize: 'characters',
              spellCheck: false,
              placeholder: t('lettersPlaceholder'),
            },
          })}
          {field('digits', {
            required: true,
            input: {
              dir: 'ltr',
              inputMode: 'numeric',
              maxLength: 4,
              autoComplete: 'off',
              placeholder: t('digitsPlaceholder'),
            },
          })}
          <div className="plate-preview field-wide">
            <span>{t('platePreview')}</span>
            <SaudiPlate plate={form.plate} t={t} large />
            <small>{t('demoPlate')}</small>
          </div>
          {field('make', {
            required: true,
            input: { maxLength: 60, placeholder: t('makePlaceholder'), dir: 'auto' },
          })}
          {field('model', {
            required: true,
            input: { maxLength: 60, placeholder: t('modelPlaceholder'), dir: 'auto' },
          })}
          {field('year', {
            required: true,
            input: { inputMode: 'numeric', maxLength: 4, dir: 'ltr' },
          })}
          <div className="field">
            <label htmlFor="status">
              {t('status')} <span aria-hidden="true">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={update}
              required
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? 'status-error' : undefined}
            >
              {statuses.map((status) => (
                <option value={status} key={status}>
                  {t(status)}
                </option>
              ))}
            </select>
            {errors.status && (
              <span id="status-error" className="field-error">
                {errorMessage(errors.status)}
              </span>
            )}
          </div>
          {field('employee', {
            wide: true,
            required: form.status === 'In Use',
            optional: form.status !== 'In Use',
            input: { maxLength: 80, placeholder: t('employeePlaceholder'), dir: 'auto' },
          })}
          <div className="field field-wide">
            <label htmlFor="notes">
              {t('notes')} <span className="optional">({t('optional')})</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={update}
              maxLength={500}
              rows={3}
              placeholder={t('notesPlaceholder')}
              dir="auto"
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? 'notes-error' : undefined}
            />
            {errors.notes && (
              <span id="notes-error" className="field-error">
                {errorMessage(errors.notes)}
              </span>
            )}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="primary">
            <Icon name={car ? 'check' : 'plus'} />
            {t(car ? 'saveChanges' : 'addVehicle')}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

export function VehicleDetails({ car, onEdit, ...dialogProps }) {
  const { t, language } = dialogProps
  return (
    <Dialog {...dialogProps} title={t('detailsTitle')}>
      <div className="details-hero">
        <span className="car-tile large">
          <Icon name="car" />
        </span>
        <div>
          <h3>
            <bdi>
              {car.make} {car.model}
            </bdi>
          </h3>
          <StatusBadge status={car.status} t={t} />
        </div>
      </div>
      <div className="plate-preview">
        <SaudiPlate plate={car.plate} t={t} large />
        <small>{t('demoPlate')}</small>
      </div>
      <dl className="details-grid">
        {[
          ['make', car.make],
          ['model', car.model],
          ['year', formatNumber(car.year, language)],
          ['employee', car.employee || t('unassigned')],
          ['notes', car.notes || t('noNotes')],
          ['recordId', car.id],
        ].map(([label, value]) => (
          <div className={['notes', 'recordId'].includes(label) ? 'field-wide' : ''} key={label}>
            <dt>{t(label)}</dt>
            <dd>
              <bdi>{value}</bdi>
            </dd>
          </div>
        ))}
      </dl>
      <div className="form-actions">
        <button className="primary" onClick={() => onEdit(car)}>
          <Icon name="edit" />
          {t('editVehicle')}
        </button>
      </div>
    </Dialog>
  )
}

export function DeleteConfirmation({ car, onDelete, ...dialogProps }) {
  const { t, onClose } = dialogProps
  return (
    <Dialog {...dialogProps} className="delete-dialog" title={t('deleteTitle')}>
      <p className="delete-description">
        {t('deleteBody', {
          car: `${car.make} ${car.model} (${car.plate.letters} ${car.plate.digits})`,
        })}
      </p>
      <div className="plate-preview">
        <SaudiPlate plate={car.plate} t={t} />
      </div>
      <div className="form-actions">
        <button className="secondary" data-initial-focus="" onClick={onClose}>
          {t('cancel')}
        </button>
        <button className="danger" onClick={() => onDelete(car)}>
          <Icon name="trash" />
          {t('deleteConfirm')}
        </button>
      </div>
    </Dialog>
  )
}

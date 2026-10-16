import { useEffect, useRef } from 'react'
import { arabicLetters, normalizePlate, plateLetters, toArabicDigits } from './plate.js'

const paths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  car: (
    <>
      <path d="m5 7 2-4h10l2 4 2 3v8H3v-8l2-3Zm0 0h14M3 12h18M6 18v3m12-3v3M6 15h2m8 0h2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10v.1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="m9 5 7 7-7 7M3 12h13" />,
  check: <path d="m5 12 4 4L19 6" />,
  key: (
    <>
      <circle cx="8" cy="8" r="5" />
      <path d="m12 12 9 9m-4-4 3-3m-6 0 3-3M7 7h.1" />
    </>
  ),
  tool: <path d="M14 6a6 6 0 0 0-8 8l-4 5 3 3 5-5a6 6 0 0 0 8-8l-4 4-3-3 4-4Z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  edit: (
    <>
      <path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14v6Z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4m10-4v4M3 11h18m-14 4h2m3 0h2" />
    </>
  ),
  road: (
    <>
      <path d="m6 3-4 18M18 3l4 18M12 3v4m0 4v3m0 4v3" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
}

export function Icon({ name, className = '', ...props }) {
  return (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] ?? paths.car}
    </svg>
  )
}

export function LanguageSwitch({ language, onChange, t }) {
  return (
    <div className="language-switch" role="group" aria-label={t('language')}>
      <button
        type="button"
        lang="en"
        aria-pressed={language === 'en'}
        onClick={() => onChange('en')}
      >
        English
      </button>
      <span aria-hidden="true" />
      <button
        type="button"
        lang="ar"
        aria-pressed={language === 'ar'}
        onClick={() => onChange('ar')}
      >
        العربية
      </button>
    </div>
  )
}

export function SaudiPlate({ plate, t, large = false }) {
  const { letters, digits } = normalizePlate(plate)
  const latin = [...letters.padEnd(3, '—')]
    .slice(0, 3)
    .map((letter) => (Object.hasOwn(plateLetters, letter) ? letter : '—'))
  const arabic = arabicLetters(latin.join(''))
  return (
    <div
      className={`saudi-plate ${large ? 'plate-large' : ''}`}
      dir="ltr"
      role="img"
      aria-label={t('plateLabel', { letters: latin.join(' '), digits: digits || '—' })}
    >
      <div className="plate-main" aria-hidden="true">
        <div className="plate-digits plate-arabic" lang="ar" dir="ltr">
          {toArabicDigits(digits) || '—'}
        </div>
        <div className="plate-letters plate-arabic" lang="ar">
          {arabic.map((letter, index) => (
            <span dir="rtl" key={index}>
              {letter}
            </span>
          ))}
        </div>
        <div className="plate-digits plate-latin">{digits || '—'}</div>
        <div className="plate-letters plate-latin">
          {latin.map((letter, index) => (
            <span key={index}>{letter}</span>
          ))}
        </div>
      </div>
      <div className="plate-country" aria-hidden="true">
        <span className="plate-country-mark" />
        <span lang="ar" dir="rtl">
          السعودية
        </span>
        <strong>KSA</strong>
      </div>
    </div>
  )
}

export function StatusBadge({ status, t }) {
  return (
    <span className={`status-badge ${status.toLowerCase().replaceAll(' ', '-')}`}>
      <span className="status-dot" />
      {t(status)}
    </span>
  )
}

export function Dialog({ title, children, onClose, language, setLanguage, t, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    const first = dialog.querySelector('[data-initial-focus]')
    first?.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
      else document.getElementById('add-vehicle')?.focus()
    }
  }, [])
  function trapFocus(event) {
    if (event.key !== 'Tab') return
    const controls = [
      ...ref.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
      ),
    ].filter((element) => !element.hidden)
    const first = controls[0]
    const last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby="dialog-title"
      onKeyDown={trapFocus}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="modal-top">
        <LanguageSwitch language={language} onChange={setLanguage} t={t} />
        <button type="button" className="icon-button" onClick={onClose} aria-label={t('close')}>
          <Icon name="close" />
        </button>
      </div>
      <h2 id="dialog-title">{title}</h2>
      {children}
    </dialog>
  )
}

export function EmptyState({ hasCars, t, onAdd, onReset }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={hasCars ? 'search' : 'car'} />
      </span>
      <h3>{t(hasCars ? 'noResults' : 'emptyFleet')}</h3>
      <p>{t(hasCars ? 'noResultsBody' : 'emptyFleetBody')}</p>
      <button className={hasCars ? 'secondary' : 'primary'} onClick={hasCars ? onReset : onAdd}>
        {t(hasCars ? 'resetFilters' : 'addVehicle')}
      </button>
    </div>
  )
}

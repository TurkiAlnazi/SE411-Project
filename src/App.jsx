import { useEffect, useState } from 'react'
import { EmptyState, Icon, LanguageSwitch } from './components.jsx'
import VehicleList from './VehicleList.jsx'
import { DeleteConfirmation, VehicleDetails, VehicleForm } from './VehicleDialogs.jsx'
import {
  deleteCar,
  fleetCounts,
  initialCars,
  saveCar,
  searchCars,
  sortCars,
  statuses,
} from './fleet.js'
import { formatNumber, initialLanguage, localeFor, translate } from './i18n.js'
import './App.css'

const statusIcons = { Available: 'check', 'In Use': 'key', Maintenance: 'tool' }

export default function App() {
  const [language, setLanguage] = useState(initialLanguage)
  const [page, setPage] = useState('dashboard')
  const [cars, setCars] = useState(() =>
    initialCars.map((car) => ({ ...car, plate: { ...car.plate } })),
  )
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('newest')
  const [dialog, setDialog] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const t = (key, values) => translate(language, key, values)
  const number = (value) => formatNumber(value, language)
  const counts = fleetCounts(cars)
  const results = sortCars(searchCars(cars, query, status), sort, language)

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.title = `${translate(language, 'brand')} | ${translate(language, page)}`
    try {
      localStorage.setItem('fleetline-language', language)
    } catch {
      /* The app also works when storage is blocked. */
    }
  }, [language, page])

  const openAdd = () => setDialog({ type: 'form', car: null })
  const openView = (car) => setDialog({ type: 'details', car })
  const openEdit = (car) => setDialog({ type: 'form', car })
  const openDelete = (car) => setDialog({ type: 'delete', car })
  const resetFilters = () => {
    setQuery('')
    setStatus('All')
  }
  function handleSave(form, id) {
    setCars(saveCar(cars, form, id))
    setFeedback({ key: id ? 'updated' : 'added', car: `${form.make.trim()} ${form.model.trim()}` })
    setDialog(null)
  }
  function handleDelete(car) {
    setCars((current) => deleteCar(current, car.id))
    setFeedback({ key: 'deleted', car: `${car.make} ${car.model}` })
    setDialog(null)
  }
  const listProps = { t, language, onView: openView, onEdit: openEdit, onDelete: openDelete }
  const dialogProps = { t, language, setLanguage, onClose: () => setDialog(null) }

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        {t('skip')}
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="road" />
          </span>
          <div>
            <span className="brand-name">
              {t('brand')}
              <span className="brand-dot">.</span>
            </span>
            <span className="brand-sub">{t('brandSub')}</span>
          </div>
        </div>
        <p className="menu-label">{t('menu')}</p>
        <nav aria-label={t('navigation')}>
          {['dashboard', 'vehicles', 'about'].map((item) => (
            <button
              key={item}
              className={page === item ? 'nav-active' : ''}
              aria-current={page === item ? 'page' : undefined}
              onClick={() => setPage(item)}
            >
              <Icon name={item === 'vehicles' ? 'car' : item === 'about' ? 'info' : 'dashboard'} />
              <span>{t(item)}</span>
              {item === 'vehicles' && <span className="nav-count">{number(cars.length)}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Icon name="road" />
            <h2>{t('sidebarTitle')}</h2>
            <p>{t('sidebarBody')}</p>
          </div>
          <div className="sidebar-footer">
            <span className="phase-dot" />
            {t('phase')}
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>{t('workspace')}</span>
            <span aria-hidden="true">/</span>
            <strong>{t(page)}</strong>
          </div>
          <LanguageSwitch language={language} onChange={setLanguage} t={t} />
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                <span />
                {t(`${page}Eyebrow`)}
              </p>
              <h1>{t(`${page}Title`)}</h1>
              <p className="page-subtitle">{t(`${page}Subtitle`)}</p>
            </div>
            {page !== 'about' && (
              <button id="add-vehicle" className="primary" onClick={openAdd}>
                <Icon name="plus" />
                {t('addVehicle')}
              </button>
            )}
          </div>
          <div className="feedback-region" role="status" aria-live="polite" aria-atomic="true">
            {feedback && (
              <div className="success-message">
                <Icon name="check" />
                <span>{t(feedback.key, { car: feedback.car })}</span>
                <button
                  className="icon-button"
                  aria-label={t('dismiss')}
                  onClick={() => setFeedback(null)}
                >
                  <Icon name="close" />
                </button>
              </div>
            )}
          </div>
          {page === 'dashboard' && (
            <>
              <div className="dashboard-meta">
                <span className="demo-tag">
                  <span />
                  {t('demo')}
                </span>
                <span className="date-label">
                  <Icon name="calendar" />
                  {new Intl.DateTimeFormat(localeFor(language), {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date())}
                </span>
              </div>
              <div className="stats">
                {['total', ...statuses].map((item, index) => (
                  <section
                    className={`stat-card stat-${index}`}
                    key={item}
                    aria-label={t(item === 'total' ? 'totalCars' : item)}
                  >
                    <div className="stat-top">
                      <span>{t(item === 'total' ? 'totalCars' : item)}</span>
                      <span className="stat-icon">
                        <Icon name={item === 'total' ? 'car' : statusIcons[item]} />
                      </span>
                    </div>
                    <strong>{number(counts[item]).padStart(language === 'ar' ? 1 : 2, '0')}</strong>
                    <p>
                      {t(['totalHint', 'availableHint', 'inUseHint', 'maintenanceHint'][index])}
                    </p>
                  </section>
                ))}
              </div>
              <section className="fleet-overview panel" aria-labelledby="overview-heading">
                <div className="overview-copy">
                  <p className="eyebrow">{t('overview')}</p>
                  <h2 id="overview-heading">
                    {t(counts.Available ? 'availableSummary' : 'availableSummaryEmpty', {
                      count: number(counts.Available),
                    })}
                  </h2>
                  <p>{t('overviewBody')}</p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setStatus('Available')
                      setQuery('')
                      setPage('vehicles')
                    }}
                  >
                    {t('Available')}
                    <Icon name="arrow" className="directional" />
                  </button>
                </div>
                <div className="status-distribution">
                  <div className="distribution-heading">
                    <h3>{t('overview')}</h3>
                    <span>
                      {number(cars.length)} · {t('totalCars')}
                    </span>
                  </div>
                  <div
                    className="distribution-bar"
                    role="img"
                    aria-label={`${t('fleetComposition')}: ${statuses.map((item) => `${t(item)} ${number(counts[item])}`).join('، ')}`}
                  >
                    {statuses.map((item) => (
                      <span
                        key={item}
                        className={item.toLowerCase().replaceAll(' ', '-')}
                        style={{
                          width: `${cars.length ? (counts[item] / cars.length) * 100 : 0}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="distribution-legend">
                    {statuses.map((item) => (
                      <div key={item}>
                        <span className={`legend-dot ${item.toLowerCase().replaceAll(' ', '-')}`} />
                        <span>{t(item)}</span>
                        <strong>{number(counts[item])}</strong>
                        <span className="share">
                          {t('share', {
                            percent: number(
                              cars.length ? Math.round((counts[item] / cars.length) * 100) : 0,
                            ),
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>{t('recent')}</h2>
                    <p>{t('recentSubtitle')}</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => {
                      resetFilters()
                      setPage('vehicles')
                    }}
                  >
                    {t('viewAll')}
                    <Icon name="arrow" className="directional" />
                  </button>
                </div>
                {cars.length ? (
                  <VehicleList {...listProps} cars={sortCars(cars).slice(0, 4)} compact />
                ) : (
                  <EmptyState t={t} onAdd={openAdd} />
                )}
                <div className="table-footer">
                  {t('recentCount', { count: number(Math.min(cars.length, 4)) })}
                </div>
              </section>
            </>
          )}
          {page === 'vehicles' && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>{t('directory')}</h2>
                  <p>{t('directorySubtitle')}</p>
                </div>
                <span className="record-count">{number(cars.length)}</span>
              </div>
              <div className="toolbar">
                <div className="search-field">
                  <Icon name="search" />
                  <label className="sr-only" htmlFor="search">
                    {t('search')}
                  </label>
                  <input
                    id="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('searchPlaceholder')}
                  />
                  {query && (
                    <button
                      className="icon-button"
                      aria-label={t('clearSearch')}
                      onClick={() => setQuery('')}
                    >
                      <Icon name="close" />
                    </button>
                  )}
                </div>
                <div className="filter-field">
                  <label className="sr-only" htmlFor="filter-status">
                    {t('filterStatus')}
                  </label>
                  <select
                    id="filter-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="All">{t('allStatuses')}</option>
                    {statuses.map((item) => (
                      <option value={item} key={item}>
                        {t(item)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sort-field">
                  <label className="sr-only" htmlFor="sort">
                    {t('sort')}
                  </label>
                  <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}>
                    {['newest', 'name', 'yearSort'].map((item, index) => (
                      <option key={item} value={['newest', 'name', 'year'][index]}>
                        {t(item)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {results.length ? (
                <VehicleList {...listProps} cars={results} />
              ) : (
                <EmptyState
                  hasCars={cars.length > 0}
                  t={t}
                  onAdd={openAdd}
                  onReset={resetFilters}
                />
              )}
              <div className="table-footer" role="status">
                {t('resultCount', { shown: number(results.length), total: number(cars.length) })}
                {(query || status !== 'All') && (
                  <button className="text-button" onClick={resetFilters}>
                    {t('resetFilters')}
                  </button>
                )}
              </div>
            </section>
          )}
          {page === 'about' && <About t={t} number={number} />}
          <footer className="page-footer">
            <p>
              <Icon name="info" />
              {t('memoryNote')}
            </p>
            <span>{t('footer')}</span>
          </footer>
        </main>
      </div>
      {dialog?.type === 'form' && (
        <VehicleForm
          key={`form-${dialog.car?.id ?? 'new'}`}
          {...dialogProps}
          car={dialog.car}
          cars={cars}
          onSave={handleSave}
        />
      )}
      {dialog?.type === 'details' && (
        <VehicleDetails
          key={`details-${dialog.car.id}`}
          {...dialogProps}
          car={dialog.car}
          onEdit={openEdit}
        />
      )}
      {dialog?.type === 'delete' && (
        <DeleteConfirmation
          key={`delete-${dialog.car.id}`}
          {...dialogProps}
          car={dialog.car}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

function About({ t, number }) {
  return (
    <div className="about-page">
      <section className="panel purpose-panel">
        <span className="purpose-icon">
          <Icon name="road" />
        </span>
        <h2>{t('purposeTitle')}</h2>
        <p>{t('purposeBody')}</p>
        <dl className="project-facts">
          {[
            ['course', 'courseCode'],
            ['phaseLabel', 'phaseValue'],
            ['scope', 'scopeValue'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{t(label)}</dt>
              <dd>{t(value)}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="team-section">
        <div className="section-heading">
          <h2>{t('teamTitle')}</h2>
          <p>{t('teamSubtitle')}</p>
        </div>
        <div className="team-grid">
          {[
            { key: 'turki', id: '222211513', initials: 'TA' },
            { key: 'mohammed', id: '221110784', initials: 'MA' },
            { key: 'faisal', id: '219211021', initials: 'FA' },
          ].map((member, index) => (
            <article className="panel team-card" key={member.id}>
              <div className="team-card-top">
                <span className="avatar" aria-hidden="true">
                  {member.initials}
                </span>
                <span className="member-number">{number(index + 1)}</span>
              </div>
              <h3>{t(member.key)}</h3>
              <p>
                {t('studentId')} <bdi>{member.id}</bdi>
              </p>
            </article>
          ))}
        </div>
      </section>
      <div className="about-notes">
        <section className="panel about-note">
          <Icon name="shield" />
          <div>
            <h2>{t('demoTitle')}</h2>
            <p>{t('demoBody')}</p>
          </div>
        </section>
        <section className="panel about-note">
          <Icon name="info" />
          <div>
            <h2>{t('aiTitle')}</h2>
            <p>{t('aiBody')}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

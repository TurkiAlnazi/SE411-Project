import { useCallback, useEffect, useState } from 'react'
import { EmptyState, Icon } from './components.jsx'
import VehicleList from './VehicleList.jsx'
import { DeleteConfirmation, VehicleDetails, VehicleForm } from './VehicleDialogs.jsx'
import { statuses } from './fleet.js'
import { fleetApi } from './api.js'
import { useFleetResource } from './useFleetResource.js'
import { formatNumber as number, label as t } from './labels.js'
import './App.css'

const statusIcons = { Available: 'check', 'In Use': 'key', Maintenance: 'tool' }

const pageSize = 3

export default function App({ api = fleetApi }) {
  const [page, setPage] = useState('dashboard')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('newest')
  const [pageIndex, setPageIndex] = useState(0)
  const [revision, setRevision] = useState(0)
  const [dialog, setDialog] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // One result for dashboard counts; a separate server request for each directory page.
  const requestSummary = useCallback((signal) => api.summary(signal), [api])
  const requestPage = useCallback(
    async (signal) => {
      const options = { page: pageIndex, size: pageSize, query, status, sort }
      const response = await api.list(options, signal)
      const lastPage = Math.max(0, response.totalPages - 1)
      // A delete or an edit can remove the last result on the current page.
      return pageIndex > lastPage ? api.list({ ...options, page: lastPage }, signal) : response
    },
    [api, pageIndex, query, status, sort],
  )
  const summary = useFleetResource(requestSummary, revision)
  const directory = useFleetResource(requestPage, revision, page === 'vehicles')
  const counts = summary.data?.counts
  const total = counts?.total
  const results = directory.data?.content ?? []
  const totalPages = directory.data?.totalPages ?? 0
  const activePage = directory.data?.page ?? pageIndex
  const refresh = () => setRevision((current) => current + 1)

  useEffect(() => {
    document.title = `${t('brand')} | ${t(page)}`
  }, [page])

  const openAdd = () => setDialog({ type: 'form', car: null })
  const openView = (car) => setDialog({ type: 'details', car })
  const openEdit = (car) => setDialog({ type: 'form', car })
  const openDelete = (car) => setDialog({ type: 'delete', car })
  function resetFilters() {
    setQuery('')
    setStatus('All')
    setPageIndex(0)
  }
  async function handleSave(form, id) {
    const car = await api.save(form, id)
    if (!id) {
      resetFilters()
      setSort('newest')
    }
    setFeedback({ key: id ? 'updated' : 'added', car: `${car.make} ${car.model}` })
    setDialog(null)
    refresh()
  }
  async function handleDelete(car) {
    await api.remove(car.id)
    setFeedback({ key: 'deleted', car: `${car.make} ${car.model}` })
    setDialog(null)
    refresh()
  }
  const listProps = { t, onView: openView, onEdit: openEdit, onDelete: openDelete }
  const dialogProps = { t, onClose: () => setDialog(null) }

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
              {item === 'vehicles' && total !== undefined && (
                <span className="nav-count">{number(total)}</span>
              )}
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
          {page === 'dashboard' && !summary.data && (
            <LoadStatus error={summary.error} t={t} onRetry={refresh} />
          )}
          {page === 'dashboard' && summary.data && (
            <>
              <div className="dashboard-meta">
                <span className="demo-tag">
                  <span />
                  {t('demo')}
                </span>
                <span className="date-label">
                  <Icon name="calendar" />
                  {new Intl.DateTimeFormat('en-GB', {
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
                    <strong>{number(counts[item]).padStart(2, '0')}</strong>
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
                      setPageIndex(0)
                      setPage('vehicles')
                    }}
                  >
                    {t('Available')}
                    <Icon name="arrow" />
                  </button>
                </div>
                <div className="status-distribution">
                  <div className="distribution-heading">
                    <h3>{t('overview')}</h3>
                    <span>
                      {number(total)} · {t('totalCars')}
                    </span>
                  </div>
                  <div
                    className="distribution-bar"
                    role="img"
                    aria-label={`${t('fleetComposition')}: ${statuses.map((item) => `${t(item)} ${number(counts[item])}`).join(', ')}`}
                  >
                    {statuses.map((item) => (
                      <span
                        key={item}
                        className={item.toLowerCase().replaceAll(' ', '-')}
                        style={{
                          width: `${total ? (counts[item] / total) * 100 : 0}%`,
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
                            percent: number(total ? Math.round((counts[item] / total) * 100) : 0),
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
                    <Icon name="arrow" />
                  </button>
                </div>
                {summary.data.recent.length ? (
                  <VehicleList {...listProps} cars={summary.data.recent} compact />
                ) : (
                  <EmptyState t={t} onAdd={openAdd} />
                )}
                <div className="table-footer">
                  {t('recentCount', { count: number(summary.data.recent.length) })}
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
                {total !== undefined && <span className="record-count">{number(total)}</span>}
              </div>
              <IdLookup t={t} find={api.find} onFound={openView} />
              <div className="toolbar">
                <div className="search-field">
                  <Icon name="search" />
                  <label className="sr-only" htmlFor="search">
                    {t('search')}
                  </label>
                  <input
                    id="search"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setPageIndex(0)
                    }}
                    maxLength={160}
                    placeholder={t('searchPlaceholder')}
                  />
                  {query && (
                    <button
                      className="icon-button"
                      aria-label={t('clearSearch')}
                      onClick={() => {
                        setQuery('')
                        setPageIndex(0)
                      }}
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
                    onChange={(event) => {
                      setStatus(event.target.value)
                      setPageIndex(0)
                    }}
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
                  <select
                    id="sort"
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value)
                      setPageIndex(0)
                    }}
                  >
                    {['newest', 'name', 'yearSort'].map((item, index) => (
                      <option key={item} value={['newest', 'name', 'year'][index]}>
                        {t(item)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {!directory.data ? (
                <LoadStatus error={directory.error} t={t} onRetry={refresh} />
              ) : results.length ? (
                <VehicleList {...listProps} cars={results} />
              ) : (
                <EmptyState
                  hasCars={Boolean(total || query || status !== 'All' || totalPages)}
                  t={t}
                  onAdd={openAdd}
                  onReset={resetFilters}
                />
              )}
              {directory.data && (
                <div className="table-footer">
                  <span role="status">
                    {t('resultCount', {
                      shown: number(results.length),
                      total: number(total ?? directory.data.totalElements),
                    })}
                  </span>
                  {(query || status !== 'All') && (
                    <button className="text-button" onClick={resetFilters}>
                      {t('resetFilters')}
                    </button>
                  )}
                </div>
              )}
              {(totalPages > 1 || (!directory.data && pageIndex > 0)) && (
                <nav className="pagination" aria-label={t('pagination')}>
                  <button
                    type="button"
                    className="secondary"
                    disabled={activePage === 0 || !directory.data}
                    onClick={() => setPageIndex(activePage - 1)}
                  >
                    {t('previousPage')}
                  </button>
                  <span aria-live="polite">
                    {totalPages
                      ? t('pageOf', { page: number(activePage + 1), total: number(totalPages) })
                      : t('loadingCars')}
                  </span>
                  <button
                    type="button"
                    className="secondary"
                    disabled={activePage + 1 >= totalPages || !directory.data}
                    onClick={() => setPageIndex(activePage + 1)}
                  >
                    {t('nextPage')}
                  </button>
                </nav>
              )}
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

function LoadStatus({ error, t, onRetry }) {
  return (
    <div className="request-status">
      {error ? (
        <>
          <p role="alert">{t(error)}</p>
          <button type="button" className="secondary" onClick={onRetry}>
            {t('retry')}
          </button>
        </>
      ) : (
        <p role="status">{t('loadingCars')}</p>
      )}
    </div>
  )
}

function IdLookup({ t, find, onFound }) {
  const [id, setId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    if (!id.trim()) {
      setError('errorRequired')
      return
    }
    setBusy(true)
    setError(null)
    try {
      onFound(await find(id.trim()))
    } catch (failure) {
      setError(failure.code ?? 'errorConnection')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="id-lookup" onSubmit={submit}>
      <label htmlFor="find-id">{t('recordId')}</label>
      <input
        id="find-id"
        dir="ltr"
        value={id}
        maxLength={80}
        disabled={busy}
        aria-describedby={error ? 'find-id-error' : undefined}
        aria-invalid={Boolean(error)}
        placeholder="car-4"
        onChange={(event) => {
          setId(event.target.value)
          setError(null)
        }}
      />
      <button className="secondary" type="submit" disabled={busy}>
        {t(busy ? 'loadingCars' : 'findById')}
      </button>
      {error && (
        <p id="find-id-error" role="alert">
          {t(error)}
        </p>
      )}
    </form>
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
      <section className="panel about-note">
        <Icon name="shield" />
        <div>
          <h2>{t('demoTitle')}</h2>
          <p>{t('demoBody')}</p>
        </div>
      </section>
    </div>
  )
}

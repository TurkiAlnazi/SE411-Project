import { Icon, SaudiPlate, StatusBadge } from './components.jsx'
import { formatNumber } from './i18n.js'

export default function VehicleList({
  cars,
  t,
  language,
  onView,
  onEdit,
  onDelete,
  compact = false,
}) {
  return (
    <div className="vehicle-table-wrap">
      <table className={`vehicle-table ${compact ? 'compact' : ''}`} role="table">
        <caption className="sr-only">{t(compact ? 'recent' : 'directory')}</caption>
        <thead role="rowgroup">
          <tr role="row">
            {['vehicle', 'licensePlate', 'status', 'assignedTo', 'actions'].map((key) => (
              <th scope="col" role="columnheader" key={key}>
                {t(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {cars.map((car) => {
            const name = `${car.make} ${car.model}`
            const identity = `${name} · ${car.plate.letters} ${car.plate.digits}`
            return (
              <tr key={car.id} role="row">
                <td role="cell" className="vehicle-cell">
                  <div className="vehicle-identity">
                    <span className="car-tile">
                      <Icon name="car" />
                    </span>
                    <div>
                      <button
                        className="vehicle-name"
                        aria-label={t('viewCar', { car: identity })}
                        onClick={() => onView(car)}
                      >
                        <bdi>{name}</bdi>
                      </button>
                      <span className="vehicle-year">
                        {t('year')} · {formatNumber(car.year, language)}
                      </span>
                    </div>
                  </div>
                </td>
                <td role="cell" className="plate-cell">
                  <SaudiPlate plate={car.plate} t={t} />
                </td>
                <td role="cell" data-label={t('status')}>
                  <StatusBadge status={car.status} t={t} />
                </td>
                <td role="cell" data-label={t('assignedTo')}>
                  <span className={car.employee ? 'employee-name' : 'muted'}>
                    <bdi>{car.employee || t('unassigned')}</bdi>
                  </span>
                </td>
                <td role="cell" className="action-cell">
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      onClick={() => onView(car)}
                      aria-label={t('viewCar', { car: identity })}
                      title={t('viewDetails')}
                    >
                      <Icon name="eye" />
                    </button>
                    {!compact && (
                      <>
                        <button
                          className="icon-button"
                          onClick={() => onEdit(car)}
                          aria-label={t('editCar', { car: identity })}
                          title={t('edit')}
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          className="icon-button delete-button"
                          onClick={() => onDelete(car)}
                          aria-label={t('deleteCar', { car: identity })}
                          title={t('delete')}
                        >
                          <Icon name="trash" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

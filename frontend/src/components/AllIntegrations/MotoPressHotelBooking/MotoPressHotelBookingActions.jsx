import { create } from 'mutative'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { UTILITIES_BY_ACTION } from './staticData'

export default function MotoPressHotelBookingActions({
  motoPressHotelBookingConf,
  setMotoPressHotelBookingConf
}) {
  const toggleCheckbox = name => {
    setMotoPressHotelBookingConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (draftConf.utilities[name] === 'true') {
          delete draftConf.utilities[name]
        } else {
          draftConf.utilities[name] = 'true'
        }
      })
    )
  }

  const { mainAction, utilities } = motoPressHotelBookingConf

  return (
    <div className="pos-rel d-flx flx-wrp">
      {(UTILITIES_BY_ACTION[mainAction] || []).map(({ key, title, subTitle }) => (
        <TableCheckBox
          key={key}
          checked={utilities?.[key] === 'true'}
          onChange={() => toggleCheckbox(key)}
          className="wdt-200 mt-4 mr-2"
          value={key}
          title={title}
          subTitle={subTitle}
        />
      ))}
    </div>
  )
}

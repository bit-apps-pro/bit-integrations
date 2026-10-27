import { create } from 'mutative'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { utilitiesByAction } from './staticData'

const valueName = key => `selected_${key}`

export default function QuickBooksActions({ quickBooksConf, setQuickBooksConf }) {
  const utilities = utilitiesByAction[quickBooksConf?.mainAction] || []

  const toggleUtility = (key, value) => {
    setQuickBooksConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (draftConf.utilities[valueName(key)] === value) {
          delete draftConf.utilities[valueName(key)]
        } else {
          draftConf.utilities[valueName(key)] = value
        }
      })
    )
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {utilities.map(({ key, subTitle, title, value }) => (
        <TableCheckBox
          key={key}
          id={`quick-books-${key}`}
          checked={quickBooksConf?.utilities?.[valueName(key)] === value}
          onChange={() => toggleUtility(key, value)}
          className="wdt-200 mt-4 mr-2"
          value={key}
          title={title}
          subTitle={subTitle}
        />
      ))}
    </div>
  )
}

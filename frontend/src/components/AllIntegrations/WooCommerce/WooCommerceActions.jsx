import { create } from 'mutative'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { moduleUtilities } from './staticData'

export default function WooCommerceActions({ wcConf, setWcConf }) {
  const toggleUtility = key =>
    setWcConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) draftConf.utilities = {}
        if (draftConf.utilities[key]) {
          delete draftConf.utilities[key]
        } else {
          draftConf.utilities[key] = true
        }
      })
    )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {moduleUtilities[wcConf.module].map(utility => (
        <TableCheckBox
          key={`${wcConf.module}-${utility.key}`}
          checked={!!wcConf?.utilities?.[utility.key]}
          onChange={() => toggleUtility(utility.key)}
          className="wdt-200 mt-4 mr-2"
          value={utility.key}
          title={utility.title}
          subTitle={utility.subTitle}
        />
      ))}
    </div>
  )
}

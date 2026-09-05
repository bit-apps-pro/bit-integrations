import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

export default function GoogleSheetActions({ sheetConf, setSheetConf }) {
  const setAction = (val, name) => {
    setSheetConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      <TableCheckBox
        checked={sheetConf?.utilities?.selected_first_row_headers || false}
        onChange={e => setAction(e.target.checked, 'selected_first_row_headers')}
        className="wdt-200 mt-4 mr-2"
        value="first_row_headers"
        title={__('Keep Header Row', 'bit-integrations')}
        subTitle={__('Leave the first row untouched', 'bit-integrations')}
      />
    </div>
  )
}

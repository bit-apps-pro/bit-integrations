import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

export default function WpTableBuilderActions({ wpTableBuilderConf, setWpTableBuilderConf }) {
  const forceDelete = wpTableBuilderConf?.utilities?.forceDelete || false

  const toggleForceDelete = () => {
    setWpTableBuilderConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities.forceDelete = !forceDelete
      })
    )
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      <TableCheckBox
        checked={forceDelete}
        onChange={toggleForceDelete}
        className="wdt-200 mt-4 mr-2"
        value="forceDelete"
        title={__('Delete Permanently', 'bit-integrations')}
        subTitle={__('Skip the trash — cannot be undone', 'bit-integrations')}
      />
    </div>
  )
}

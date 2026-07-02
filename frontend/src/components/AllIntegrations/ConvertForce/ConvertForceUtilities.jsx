import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

export default function ConvertForceUtilities({ convertForceConf, setConvertForceConf }) {
  const actionHandler = (e) => {
    const newConf = { ...convertForceConf }
    if (e.target.checked) {
      newConf.utilities.forceDelete = true
    } else {
      delete newConf.utilities.forceDelete
    }
    setConvertForceConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={convertForceConf.utilities?.forceDelete || false}
        onChange={actionHandler}
        className="mt-4 mr-2"
        value="forceDelete"
        title={__('Force Delete', 'bit-integrations')}
        subTitle={__('Permanently delete the campaign instead of moving to trash.', 'bit-integrations')}
      />
    </div>
  )
}

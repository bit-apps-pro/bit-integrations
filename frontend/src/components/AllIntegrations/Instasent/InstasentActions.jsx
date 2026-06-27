import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

export default function InstasentActions({ instasentConf, setInstasentConf }) {
  const actionHandler = (e, type) => {
    const newConf = { ...instasentConf, actions: { ...instasentConf.actions } }
    if (e.target.checked) {
      newConf.actions[type] = true
    } else {
      delete newConf.actions[type]
    }

    setInstasentConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={instasentConf.actions?.allowUnicode || false}
        onChange={e => actionHandler(e, 'allowUnicode')}
        className="wdt-200 mt-4 mr-2"
        value="allow_unicode"
        title={__('Allow Unicode', 'bit-integrations')}
        subTitle={__(
          'Enable Unicode support for SMS messages (e.g. emojis, special characters)',
          'bit-integrations'
        )}
      />
    </div>
  )
}

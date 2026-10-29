import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'

export default function SystemeIOActions({ systemeIOConf, setSystemeIOConf }) {
  const { isPro } = useRecoilValue($appConfigState)

  const actionHandler = (e, type) => {
    setSystemeIOConf(prevConf => {
      const actions = { ...(prevConf.actions || {}) }

      if (e.target.checked) {
        actions[type] = true
      } else {
        delete actions[type]
      }

      return { ...prevConf, actions }
    })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={systemeIOConf.actions?.update || false}
        onChange={e => actionHandler(e, 'update')}
        className="wdt-200 mt-4 mr-2"
        value="update_contact"
        isInfo={!isPro}
        title={<ProFeatureTitle title={__('Update Contact', 'bit-integrations')} />}
        subTitle={__(
          'Update the fields of a contact that already exists with the same email.',
          'bit-integrations'
        )}
      />
      <TableCheckBox
        checked={systemeIOConf.actions?.updateTags || false}
        onChange={e => actionHandler(e, 'updateTags')}
        className="wdt-200 mt-4 mr-2"
        value="update_tags"
        isInfo={!isPro}
        title={<ProFeatureTitle title={__('Update Tags', 'bit-integrations')} />}
        subTitle={__(
          'Add the selected tag to a contact that already exists with the same email.',
          'bit-integrations'
        )}
      />
    </div>
  )
}

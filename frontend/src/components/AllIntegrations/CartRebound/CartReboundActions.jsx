import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { settingToggles } from './staticData'

export default function CartReboundActions({ cartReboundConf, setCartReboundConf }) {
  const toggleUtility = (name, value = 'true') => {
    setCartReboundConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (draftConf.utilities[name] === value) {
          delete draftConf.utilities[name]
        } else {
          draftConf.utilities[name] = value
        }
      })
    )
  }

  const { mainAction, utilities } = cartReboundConf
  const isTemplateAction = ['create_template', 'update_template'].includes(mainAction)

  return (
    <div className="pos-rel d-flx flx-wrp">
      {isTemplateAction && (
        <TableCheckBox
          checked={utilities?.selected_make_default === 'true'}
          onChange={() => toggleUtility('selected_make_default')}
          className="wdt-200 mt-4 mr-2"
          value="selected_make_default"
          title={__('Make Default', 'bit-integrations')}
          subTitle={__('Use this template for new recovery emails', 'bit-integrations')}
        />
      )}

      {mainAction === 'update_settings' &&
        settingToggles.map(({ key, onTitle, offTitle, onSubTitle, offSubTitle }) => (
          <div key={key} className="d-flx flx-wrp">
            <TableCheckBox
              checked={utilities?.[`selected_${key}`] === 'true'}
              onChange={() => toggleUtility(`selected_${key}`, 'true')}
              className="wdt-200 mt-4 mr-2"
              value={`selected_${key}_on`}
              title={onTitle}
              subTitle={onSubTitle}
            />
            <TableCheckBox
              checked={utilities?.[`selected_${key}`] === 'false'}
              onChange={() => toggleUtility(`selected_${key}`, 'false')}
              className="wdt-200 mt-4 mr-2"
              value={`selected_${key}_off`}
              title={offTitle}
              subTitle={offSubTitle}
            />
          </div>
        ))}
    </div>
  )
}

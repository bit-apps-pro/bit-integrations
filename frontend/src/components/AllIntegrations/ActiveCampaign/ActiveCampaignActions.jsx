/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

export default function ActiveCampaignActions({ activeCampaingConf, setActiveCampaingConf }) {
  const actionHandler = (e, type) => {
    const newConf = { ...activeCampaingConf }
    if (e.target.checked) {
      newConf.actions[type] = true
      if (type === 'tagUpdate') delete newConf.actions.tagAppend
      if (type === 'tagAppend') delete newConf.actions.tagUpdate
      if (type === 'tagUpdate' || type === 'tagAppend') newConf.actions.update = true
    } else {
      delete newConf.actions[type]
      if (type === 'update') {
        delete newConf.actions.tagUpdate
        delete newConf.actions.tagAppend
      }
    }

    setActiveCampaingConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={activeCampaingConf.actions?.update || false}
        onChange={e => actionHandler(e, 'update')}
        className="wdt-200 mt-4 mr-2"
        value="user_share"
        title={__('Update ActiveCampaign', 'bit-integrations')}
        subTitle={__('Update Responses with ActiveCampaign existing email?', 'bit-integrations')}
      />
      <TableCheckBox
        checked={activeCampaingConf.actions?.tagUpdate || false}
        onChange={e => actionHandler(e, 'tagUpdate')}
        className="wdt-200 mt-4 mr-2"
        value="user_share"
        title={__('Update ActiveCampaign Tags', 'bit-integrations')}
        subTitle={__('Replace existing contact tags with the selected tags?', 'bit-integrations')}
      />
      <TableCheckBox
        checked={activeCampaingConf.actions?.tagAppend || false}
        onChange={e => actionHandler(e, 'tagAppend')}
        className="wdt-200 mt-4 mr-2"
        value="user_share"
        title={__('Append ActiveCampaign Tags', 'bit-integrations')}
        subTitle={__('Add the selected tags alongside existing contact tags?', 'bit-integrations')}
      />
    </div>
  )
}

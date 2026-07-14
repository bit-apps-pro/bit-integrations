import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { campaignStatusOptions } from './staticData'

const STATUS_ACTIONS = ['createCampaign', 'updateCampaign', 'updateCampaignStatus']

export default function ConvertForceUtilities({ convertForceConf, setConvertForceConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })
  const isStatusAction = STATUS_ACTIONS.includes(convertForceConf?.mainAction)
  const isStatusRequired = convertForceConf?.mainAction === 'updateCampaignStatus'

  const setStatus = status =>
    setConvertForceConf(prevConf => {
      const utilities = { ...(prevConf.utilities || {}) }

      if (status) {
        utilities.status = status
      } else {
        delete utilities.status
      }

      return { ...prevConf, utilities }
    })

  const openStatusMdl = () => setActionMdl({ show: 'status' })

  const closeActionMdl = () => setActionMdl({ show: false })

  const handleForceDelete = e =>
    setConvertForceConf(prevConf => {
      const utilities = { ...(prevConf.utilities || {}) }

      if (e.target.checked) {
        utilities.forceDelete = true
      } else {
        delete utilities.forceDelete
      }

      return { ...prevConf, utilities }
    })

  return (
    <div className="pos-rel d-flx flx-wrp">
      {isStatusAction && (
        <>
          <div className="pos-rel d-flx flx-col">
            <TableCheckBox
              checked={Boolean(convertForceConf?.utilities?.status)}
              onChange={openStatusMdl}
              className="wdt-200 mt-4 mr-2"
              value="status"
              title={__('Campaign Status', 'bit-integrations')}
              subTitle={__('Select a status for the campaign.', 'bit-integrations')}
            />
            {isStatusRequired && (
              <small style={{ marginLeft: 30, marginTop: 10, color: 'red' }}>
                {__('This Required', 'bit-integrations')}
              </small>
            )}
          </div>

          <ConfirmModal
            className="custom-conf-mdl"
            mainMdlCls="o-v"
            btnClass="purple"
            btnTxt={__('Ok', 'bit-integrations')}
            show={actionMdl.show === 'status'}
            close={closeActionMdl}
            action={closeActionMdl}
            title={__('Campaign Status', 'bit-integrations')}>
            <div className="btcd-hr mt-2 mb-2" />
            <div className="mt-2">{__('Select Campaign Status', 'bit-integrations')}</div>
            <div className="flx flx-between mt-2">
              <MultiSelect
                key={`${convertForceConf.mainAction}-status`}
                className="msl-wrp-options"
                defaultValue={convertForceConf?.utilities?.status ?? null}
                options={campaignStatusOptions}
                onChange={setStatus}
                singleSelect
              />
            </div>
          </ConfirmModal>
        </>
      )}

      {convertForceConf?.mainAction === 'deleteCampaign' && (
        <TableCheckBox
          checked={convertForceConf.utilities?.forceDelete || false}
          onChange={handleForceDelete}
          className="wdt-200 mt-4 mr-2"
          value="forceDelete"
          title={__('Force Delete', 'bit-integrations')}
          subTitle={__(
            'Permanently delete the campaign instead of moving to trash.',
            'bit-integrations'
          )}
        />
      )}
    </div>
  )
}

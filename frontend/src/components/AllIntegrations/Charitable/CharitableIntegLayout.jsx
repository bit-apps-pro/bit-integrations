import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import CharitableActions from './CharitableActions'
import {
  generateMappedField,
  refreshCharitableCampaigns,
  refreshCharitableDonationStatuses
} from './CharitableCommonFunc'
import CharitableFieldMap from './CharitableFieldMap'
import {
  CampaignFields,
  CampaignIdField,
  CampaignUpdateFields,
  DonationFields,
  DonationIdField,
  DonationNoteFields,
  DonorFields,
  DonorUpdateFields,
  hasUtilities,
  modules,
  needsCampaign,
  needsDonationStatus,
  UserFields,
  UserIdField,
  UserUpdateFields
} from './staticData'

const fieldsByAction = {
  create_donation: DonationFields,
  update_donation_status: DonationIdField,
  add_donation_note: DonationNoteFields,
  delete_donation: DonationIdField,
  create_campaign: CampaignFields,
  update_campaign: CampaignUpdateFields,
  delete_campaign: CampaignIdField,
  create_donor: DonorFields,
  update_donor: DonorUpdateFields,
  create_user_profile: UserFields,
  update_user_profile: UserUpdateFields,
  mark_user_verified: UserIdField
}

export default function CharitableIntegLayout({
  formFields,
  charitableConf,
  setCharitableConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setCharitableConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.charitableFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.charitableFields)
        draftConf.utilities = {}
      })
    )

    if (needsCampaign.includes(value)) {
      refreshCharitableCampaigns(setCharitableConf, setIsLoading)
    }

    if (needsDonationStatus.includes(value)) {
      refreshCharitableDonationStatuses(setCharitableConf, setIsLoading)
    }
  }

  const setConfValue = (key, value) => {
    setCharitableConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={charitableConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsCampaign.includes(charitableConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Campaign:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedCampaign"
              defaultValue={charitableConf?.selectedCampaign ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(charitableConf?.allCampaigns || []).map(campaign => ({
                label: campaign.campaign_name,
                value: campaign.campaign_id?.toString()
              }))}
              onChange={val => setConfValue('selectedCampaign', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshCharitableCampaigns(setCharitableConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Campaigns', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsDonationStatus.includes(charitableConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Donation Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedDonationStatus"
              defaultValue={charitableConf?.selectedDonationStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(charitableConf?.allDonationStatuses || []).map(status => ({
                label: status.label,
                value: status.value
              }))}
              onChange={val => setConfValue('selectedDonationStatus', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshCharitableDonationStatuses(setCharitableConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Statuses', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}

      {charitableConf?.mainAction && charitableConf.charitableFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Charitable Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {charitableConf?.field_map?.map((itm, i) => (
            <CharitableFieldMap
              key={`charitable-m-${i + 9}`}
              i={i}
              field={itm}
              charitableConf={charitableConf}
              formFields={formFields}
              setCharitableConf={setCharitableConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(charitableConf.field_map.length, charitableConf, setCharitableConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {charitableConf?.mainAction && hasUtilities.includes(charitableConf.mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <CharitableActions charitableConf={charitableConf} setCharitableConf={setCharitableConf} />
        </div>
      )}
    </>
  )
}

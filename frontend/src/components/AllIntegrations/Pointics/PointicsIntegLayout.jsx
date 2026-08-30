import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import PointicsActions from './PointicsActions'
import {
  generateMappedField,
  refreshPointicsChannels,
  refreshPointicsRewards
} from './PointicsCommonFunc'
import PointicsFieldMap from './PointicsFieldMap'
import {
  AwardChannelFields,
  hasUtilities,
  MemberIdFields,
  modules,
  needsChannel,
  needsReward,
  PointsAdjustFields,
  RedeemRewardFields,
  RedemptionIdFields,
  ReferralIdFields,
  ReferralInviteFields,
  ReferralPurchaseFields,
  ReferralRegistrationFields
} from './staticData'

export default function PointicsIntegLayout({
  formFields,
  pointicsConf,
  setPointicsConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setPointicsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'adjust_points':
            draftConf.pointicsFields = PointsAdjustFields
            break
          case 'award_channel_points':
            draftConf.pointicsFields = AwardChannelFields
            break
          case 'redeem_reward':
            draftConf.pointicsFields = RedeemRewardFields
            break
          case 'apply_redemption':
          case 'cancel_redemption':
            draftConf.pointicsFields = RedemptionIdFields
            break
          case 'recompute_member_tier':
            draftConf.pointicsFields = MemberIdFields
            break
          case 'send_referral_invite':
            draftConf.pointicsFields = ReferralInviteFields
            break
          case 'cancel_referral_invite':
            draftConf.pointicsFields = ReferralIdFields
            break
          case 'complete_referral_registration':
            draftConf.pointicsFields = ReferralRegistrationFields
            break
          case 'complete_referral_purchase':
            draftConf.pointicsFields = ReferralPurchaseFields
            break
          default:
            draftConf.pointicsFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.pointicsFields)
      })
    )

    if (needsChannel.includes(value)) {
      refreshPointicsChannels(setPointicsConf, setIsLoading)
    }

    if (needsReward.includes(value)) {
      refreshPointicsRewards(setPointicsConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={pointicsConf?.mainAction ?? null}
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

      {needsChannel.includes(pointicsConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Channel:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedChannel"
              defaultValue={pointicsConf?.selectedChannel ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                pointicsConf?.allChannels &&
                Array.isArray(pointicsConf.allChannels) &&
                pointicsConf.allChannels.map(channel => ({
                  label: channel.channel_name,
                  value: channel.channel_id?.toString()
                }))
              }
              onChange={val =>
                setPointicsConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.selectedChannel = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshPointicsChannels(setPointicsConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Channels', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsReward.includes(pointicsConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Reward:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedReward"
              defaultValue={pointicsConf?.selectedReward ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                pointicsConf?.allRewards &&
                Array.isArray(pointicsConf.allRewards) &&
                pointicsConf.allRewards.map(reward => ({
                  label: reward.reward_name,
                  value: reward.reward_id?.toString()
                }))
              }
              onChange={val =>
                setPointicsConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.selectedReward = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshPointicsRewards(setPointicsConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Rewards', 'bit-integrations')}'` }}
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

      {pointicsConf?.mainAction && pointicsConf.pointicsFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Pointics Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {pointicsConf?.field_map?.map((itm, i) => (
            <PointicsFieldMap
              key={`pointics-m-${i + 9}`}
              i={i}
              field={itm}
              pointicsConf={pointicsConf}
              formFields={formFields}
              setPointicsConf={setPointicsConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(pointicsConf.field_map.length, pointicsConf, setPointicsConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      )}

      {hasUtilities.includes(pointicsConf?.mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <PointicsActions
            pointicsConf={pointicsConf}
            setPointicsConf={setPointicsConf}
            formFields={formFields}
            setSnackbar={setSnackbar}
          />
        </div>
      )}
    </>
  )
}

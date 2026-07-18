import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField, refreshBadgeOSAchievements } from './BadgeOSCommonFunc'
import BadgeOSFieldMap from './BadgeOSFieldMap'
import { AwardAchievementFields, modules, needsAchievement } from './staticData'

export default function BadgeOSIntegLayout({
  formID,
  formFields,
  badgeOSConf,
  setBadgeOSConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setBadgeOSConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'award_achievement_to_user':
            draftConf.badgeOSFields = AwardAchievementFields
            break
          default:
            draftConf.badgeOSFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.badgeOSFields)
      })
    )

    if (needsAchievement.includes(value)) {
      refreshBadgeOSAchievements(setBadgeOSConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={badgeOSConf?.mainAction ?? null}
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

      {needsAchievement.includes(badgeOSConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Achievement:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedAchievement"
              defaultValue={badgeOSConf?.selectedAchievement ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                badgeOSConf?.allAchievements &&
                Array.isArray(badgeOSConf.allAchievements) &&
                badgeOSConf.allAchievements.map(achievement => ({
                  label: `${achievement.achievement_name} (${achievement.achievement_type})`,
                  value: achievement?.achievement_id?.toString()
                }))
              }
              onChange={val =>
                setBadgeOSConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.selectedAchievement = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshBadgeOSAchievements(setBadgeOSConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Achievements', 'bit-integrations')}'` }}
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

      {badgeOSConf?.mainAction && badgeOSConf.badgeOSFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('BadgeOS Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {badgeOSConf?.field_map?.map((itm, i) => (
            <BadgeOSFieldMap
              key={`badgeos-m-${i + 9}`}
              i={i}
              field={itm}
              badgeOSConf={badgeOSConf}
              formFields={formFields}
              setBadgeOSConf={setBadgeOSConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(badgeOSConf.field_map.length, badgeOSConf, setBadgeOSConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}

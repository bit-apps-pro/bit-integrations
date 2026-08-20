import { useEffect, useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import ProfilePressActions from './ProfilePressActions'
import { generateMappedField, listsForAction, refreshProfilePressPlans } from './ProfilePressCommonFunc'
import ProfilePressFieldMap from './ProfilePressFieldMap'
import {
  AddNewOrderFields,
  AddOrUpdateCustomerFields,
  hasUtilities,
  modules,
  needsPlan
} from './staticData'

const fieldsByAction = {
  add_new_order: AddNewOrderFields,
  add_or_update_customer: AddOrUpdateCustomerFields
}

export default function ProfilePressIntegLayout({
  formID,
  formFields,
  profilePressConf,
  setProfilePressConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const [lists, setLists] = useState({})

  const mainAction = profilePressConf?.mainAction

  useEffect(() => {
    if (listsForAction(mainAction).length > 0) {
      refreshProfilePressPlans(setLists, setIsLoading)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainAction])

  const setField = (key, val) =>
    setProfilePressConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )

  const handleMainAction = value => {
    setProfilePressConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.profilePressFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.profilePressFields)
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
          defaultValue={mainAction ?? null}
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

      {needsPlan.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Plan:', 'bit-integrations')}</b>
            <MultiSelect
              key={`selectedPlan-${lists?.plans?.length ?? 0}`}
              title="selectedPlan"
              defaultValue={profilePressConf?.selectedPlan ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                Array.isArray(lists?.plans)
                  ? lists.plans.map(plan => ({
                      label: plan.label,
                      value: plan.value?.toString()
                    }))
                  : []
              }
              onChange={val => setField('selectedPlan', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshProfilePressPlans(setLists, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Plans', 'bit-integrations')}'` }}
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

      {mainAction && profilePressConf.profilePressFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('ProfilePress Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {profilePressConf?.field_map?.map((itm, i) => (
            <ProfilePressFieldMap
              key={`profilepress-m-${i + 9}`}
              i={i}
              field={itm}
              profilePressConf={profilePressConf}
              formFields={formFields}
              setProfilePressConf={setProfilePressConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(profilePressConf.field_map.length, profilePressConf, setProfilePressConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction === 'add_new_order' && (
        <Note
          note={__(
            'Customer ID is the ProfilePress customer id, not the WordPress user id. Leave Amount unmapped to charge the plan price.',
            'bit-integrations'
          )}
        />
      )}

      {mainAction === 'add_or_update_customer' && (
        <Note
          note={__(
            'An existing user is matched by email first, then by username, and updated in place. Unmapped fields are left untouched.',
            'bit-integrations'
          )}
        />
      )}

      {hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <ProfilePressActions
            profilePressConf={profilePressConf}
            setProfilePressConf={setProfilePressConf}
          />
        </div>
      )}
    </>
  )
}

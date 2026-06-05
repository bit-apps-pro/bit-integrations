import { create } from 'mutative'
import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  generateMappedField,
  refreshContactGroups,
  refreshLifeStages
} from './WpErpCommonFunc'
import WpErpFieldMap from './WpErpFieldMap'
import {
  CompanyFields,
  CompanyUpdateFields,
  ContactFields,
  ContactGroupFields,
  ContactUpdateFields,
  DepartmentFields,
  DesignationFields,
  ExpenseFields,
  GroupSubscriberFields,
  HolidayFields,
  modules,
  NoteFields,
  PaymentFields,
  TaskFields
} from './staticData'

const FIELDS_BY_ACTION = {
  createContact: ContactFields,
  updateContact: ContactUpdateFields,
  createCompany: CompanyFields,
  updateCompany: CompanyUpdateFields,
  createContactGroup: ContactGroupFields,
  addContactToGroup: GroupSubscriberFields,
  removeContactFromGroup: GroupSubscriberFields,
  addNote: NoteFields,
  createTask: TaskFields,
  createDepartment: DepartmentFields,
  createDesignation: DesignationFields,
  createHoliday: HolidayFields,
  createExpense: ExpenseFields,
  createPayment: PaymentFields
}

const CRM_GROUP_ACTIONS = ['createContact', 'updateContact', 'addContactToGroup', 'removeContactFromGroup']
const LIFE_STAGE_ACTIONS = ['createContact', 'updateContact']

export default function WpErpIntegLayout({
  formFields,
  wpErpConf,
  setWpErpConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setWpErpConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.wpErpFields = FIELDS_BY_ACTION[value] || []
        draftConf.field_map = generateMappedField(draftConf.wpErpFields)
      })
    )

    if (CRM_GROUP_ACTIONS.includes(value)) refreshContactGroups(setWpErpConf, setIsLoading)
    if (LIFE_STAGE_ACTIONS.includes(value)) refreshLifeStages(setWpErpConf, setIsLoading)
  }

  useEffect(() => {
    if (wpErpConf?.mainAction && !wpErpConf?.wpErpFields) {
      setWpErpConf(prev =>
        create(prev, draft => {
          draft.wpErpFields = FIELDS_BY_ACTION[prev.mainAction] || []
        })
      )
    }
  }, [wpErpConf?.mainAction])

  const setUtility = (key, val) =>
    setWpErpConf(prev =>
      create(prev, draft => {
        draft.utilities = { ...(draft.utilities || {}), [key]: val }
      })
    )

  const groupedOptions = modules.map(action => ({
    label: checkIsPro(isPro, action.is_pro)
      ? `${action.group}: ${action.label}`
      : getProLabel(`${action.group}: ${action.label}`),
    value: action.name,
    disabled: !checkIsPro(isPro, action.is_pro)
  }))

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={wpErpConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={groupedOptions}
          singleSelect
          closeOnSelect
        />
      </div>

      {LIFE_STAGE_ACTIONS.includes(wpErpConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Life Stage:', 'bit-integrations')}</b>
            <MultiSelect
              title="lifeStage"
              defaultValue={wpErpConf?.utilities?.lifeStage ?? null}
              className="btcd-paper-drpdwn w-5"
              options={wpErpConf?.allLifeStages || []}
              onChange={val => setUtility('lifeStage', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshLifeStages(setWpErpConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Life Stages', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {CRM_GROUP_ACTIONS.includes(wpErpConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Contact Groups:', 'bit-integrations')}</b>
            <MultiSelect
              title="groupId"
              defaultValue={wpErpConf?.utilities?.groupId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(wpErpConf?.allContactGroups || []).map(group => ({ label: group?.label, value: group?.value?.toString() }))}
              onChange={val => setUtility('groupId', val)}
            />
            <button
              onClick={() => refreshContactGroups(setWpErpConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Groups', 'bit-integrations')}'` }}
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

      {wpErpConf?.mainAction && wpErpConf?.wpErpFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WP ERP Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wpErpConf?.field_map?.map((itm, i) => (
            <WpErpFieldMap
              key={`wperp-fm-${i + 9}`}
              i={i}
              field={itm}
              wpErpConf={wpErpConf}
              formFields={formFields}
              setWpErpConf={setWpErpConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(wpErpConf.field_map.length, wpErpConf, setWpErpConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
          <br />
        </div>
      )}
    </>
  )
}

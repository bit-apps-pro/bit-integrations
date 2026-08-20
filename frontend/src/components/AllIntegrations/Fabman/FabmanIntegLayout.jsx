/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { __ } from '../../../Utils/i18nwrap'
import FabmanFieldMap from './FabmanFieldMap'
import { addFieldMap } from './IntegrationHelpers'
import { fetchFabmanWorkspaces, generateMappedField } from './FabmanCommonFunc'
import Loader from '../../Loaders/Loader'
import { useMemo, useRef } from 'react'
import Note from '../../Utilities/Note'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'

const fabmanActionsList = [
  { label: __('Create Member', 'bit-integrations'), value: 'create_member', is_pro: false },
  { label: __('Update Member', 'bit-integrations'), value: 'update_member', is_pro: true },
  { label: __('Delete Member', 'bit-integrations'), value: 'delete_member', is_pro: true },
  { label: __('Create Spaces', 'bit-integrations'), value: 'create_spaces', is_pro: true },
  { label: __('Update Spaces', 'bit-integrations'), value: 'update_spaces', is_pro: true }
]

const getActiveStaticFields = conf => {
  if (conf.actionName === 'create_spaces' || conf.actionName === 'update_spaces') {
    const fields = Array.isArray(conf.spacesStaticFields)
      ? conf.spacesStaticFields.map(f => ({ ...f }))
      : []
    const isCreate = conf.actionName === 'create_spaces'
    const nameIdx = fields.findIndex(f => String(f.key) === 'name')

    if (nameIdx > -1) fields[nameIdx].required = true

    const tzIdx = fields.findIndex(f => String(f.key) === 'timezone')

    if (tzIdx > -1) fields[tzIdx].required = isCreate
    return fields
  }

  if (conf.actionName === 'update_member' || conf.actionName === 'delete_member') {
    const fields = Array.isArray(conf.memberStaticFields)
      ? conf.memberStaticFields.map(f => ({ ...f }))
      : []
    const emailIdx = fields.findIndex(f => String(f.key) === 'emailAddress')

    if (emailIdx > -1) fields[emailIdx].required = true

    const firstNameIdx = fields.findIndex(f => String(f.key) === 'firstName')

    if (firstNameIdx > -1) fields[firstNameIdx].required = false
    return fields
  }

  return conf.memberStaticFields
}

const updateFieldMapForRequiredFields = (fabmanConf, setFabmanConf) => {
  const staticFields = getActiveStaticFields(fabmanConf) || []
  const requiredFields = staticFields.filter(f => !!f.required)

  if (!Array.isArray(fabmanConf.field_map)) return

  let changed = false
  const newFieldMap = [...fabmanConf.field_map]

  for (let i = 0; i < requiredFields.length; i += 1) {
    if (!newFieldMap[i]) {
      newFieldMap[i] = { formField: '', fabmanFormField: requiredFields[i].key }
      changed = true
    } else if (newFieldMap[i].fabmanFormField !== requiredFields[i].key) {
      newFieldMap[i] = { ...newFieldMap[i], fabmanFormField: requiredFields[i].key }
      changed = true
    }
  }

  if (changed) {
    const newConf = { ...fabmanConf, field_map: newFieldMap }
    setFabmanConf(newConf)
  }
}

export default function FabmanIntegLayout({
  formFields,
  fabmanConf,
  setFabmanConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleActionChange = e => {
    const newConf = { ...fabmanConf }
    const value = e.target.value
    newConf.actionName = value

    if (value === 'create_spaces' || value === 'update_spaces') {
      delete newConf.selectedMember
      delete newConf.selectedLockVersion
    }

    newConf.field_map = [{ formField: '', fabmanFormField: '' }]

    setFabmanConf(newConf)
    updateFieldMapForRequiredFields(newConf, setFabmanConf)
  }

  const handleWorkspaceChange = e => {
    const newConf = { ...fabmanConf }
    newConf.selectedWorkspace = e.target.value

    const selectedWorkspace = (fabmanConf?.workspaces || []).find(
      w => String(w.id) === String(e.target.value)
    )

    if (selectedWorkspace && typeof selectedWorkspace.lockVersion !== 'undefined') {
      newConf.selectedLockVersion = selectedWorkspace.lockVersion
    }

    setFabmanConf(newConf)
  }

  const handleMemberChange = e => {
    const newConf = { ...fabmanConf }
    const selectedValue = e.target.value

    if (selectedValue) {
      const [memberId, lockVersion] = selectedValue.split('|')
      newConf.selectedMember = memberId
      newConf.selectedLockVersion = lockVersion
    } else {
      delete newConf.selectedMember
      delete newConf.selectedLockVersion
    }

    setFabmanConf(newConf)
  }

  const handleRefreshWorkspaces = () => {
    fetchFabmanWorkspaces(fabmanConf, setFabmanConf, loading, setLoading, 'refresh')
  }

  const activeStaticFields = useMemo(() => getActiveStaticFields(fabmanConf), [fabmanConf])

  return (
    <div>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <select
          onChange={handleActionChange}
          name="actionName"
          value={fabmanConf?.actionName}
          className="btcd-paper-inp w-5">
          <option value="">{__('Select Action', 'bit-integrations')}</option>
          {fabmanActionsList.map(({ label, value, is_pro }) => (
            <option key={value} value={value} disabled={is_pro && !isPro}>
              {label}
              {is_pro && !isPro ? ` (${__('Pro', 'bit-integrations')})` : ''}
            </option>
          ))}
        </select>
      </div>
      <br />
      {fabmanConf.actionName &&
        fabmanConf.actionName !== 'delete_member' &&
        fabmanConf.actionName !== 'create_spaces' && (
          <>
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Workspace:', 'bit-integrations')}</b>
              <select
                onChange={handleWorkspaceChange}
                name="selectedWorkspace"
                value={fabmanConf?.selectedWorkspace || ''}
                className="btcd-paper-inp w-5"
                disabled={loading.workspaces}>
                <option value="">{__('Select Workspace', 'bit-integrations')}</option>
                {fabmanConf?.workspaces?.map(workspace => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRefreshWorkspaces}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Workspaces', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.workspaces}>
                &#x21BB;
              </button>
            </div>
            {loading.workspaces && (
              <Loader
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 50,
                  transform: 'scale(0.7)'
                }}
              />
            )}
            <br />
            <Note note={fabmanWorkspaceNote} />
          </>
        )}

      {fabmanConf.actionName === 'delete_member' && (
        <>
          <Note note={fabmanDeleteMemberNote} />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Fabman Fields', 'bit-integrations')}</b>
            </div>
          </div>
          <FabmanFieldMap
            i={0}
            field={fabmanConf.field_map[0] || { formField: '', fabmanFormField: 'emailAddress' }}
            fabmanConf={{
              ...fabmanConf,
              staticFields: [
                { key: 'emailAddress', label: __('Email Address', 'bit-integrations'), required: true }
              ]
            }}
            formFields={formFields}
            setFabmanConf={setFabmanConf}
            setSnackbar={setSnackbar}
          />
        </>
      )}

      {fabmanConf.actionName &&
        fabmanConf.actionName !== 'delete_member' &&
        (fabmanConf.actionName === 'create_member' ||
          fabmanConf.actionName === 'update_member' ||
          (fabmanConf.actionName === 'create_spaces' && fabmanConf.selectedWorkspace) ||
          (fabmanConf.actionName === 'update_spaces' && fabmanConf.selectedWorkspace)) && (
          <>
            {fabmanConf.actionName === 'create_spaces' && <Note note={fabmanTimezoneNote} />}
            <div className="mt-5">
              <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
            </div>
            <br />
            <div className="btcd-hr mt-1" />
            <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
              <div className="txt-dp">
                <b>{__('Form Fields', 'bit-integrations')}</b>
              </div>
              <div className="txt-dp">
                <b>{__('Fabman Fields', 'bit-integrations')}</b>
              </div>
            </div>
            {fabmanConf?.field_map.map((itm, i) => (
              <FabmanFieldMap
                key={`rp-m-${i + 9}`}
                i={i}
                field={itm}
                fabmanConf={{ ...fabmanConf, staticFields: activeStaticFields }}
                formFields={formFields}
                setFabmanConf={setFabmanConf}
                setSnackbar={setSnackbar}
              />
            ))}
            <div>
              <div className="txt-center btcbi-field-map-button mt-2">
                <button
                  onClick={() =>
                    addFieldMap(fabmanConf.field_map.length, fabmanConf, setFabmanConf, false)
                  }
                  className="icn-btn sh-sm"
                  type="button">
                  +
                </button>
              </div>
              <br />
              <br />
              <div className="mt-4">
                <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
              </div>
              <div className="btcd-hr mt-1" />
            </div>
          </>
        )}
    </div>
  )
}

const fabmanWorkspaceNote = `<h4>${__(
  'Please select workspace for Create Member, Update Member, and Update Spaces.',
  'bit-integrations'
)}</h4>`

const fabmanTimezoneNote = `<h4>${__(
  'For Create Spaces, Timezone must be like Asia/Dhaka (IANA timezone format).',
  'bit-integrations'
)}</h4>`

const fabmanDeleteMemberNote = `<h4>${__(
  'For Delete Member, datetime format must be YYYY-MM-DD.',
  'bit-integrations'
)}</h4>`

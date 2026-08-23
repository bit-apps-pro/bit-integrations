/* eslint-disable no-unused-vars */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import {
  getAllTeams,
  getAllSpaces,
  getAllFolders,
  getAllLists,
  getCustomFields
} from './ClickupCommonFunc'
import ClickupFieldMap from './ClickupFieldMap'
import { addFieldMap } from './IntegrationHelpers'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import ClickupActions from './ClickupActions'

export default function ClickupIntegLayout({
  formFields,
  handleInput,
  clickupConf,
  setClickupConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const handleActionInput = e => {
    const newConf = { ...clickupConf }
    newConf.field_map = [{ formField: '', clickupFormField: '' }]
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value

      if (e.target.value === 'task' && (newConf.selectedTeam != '' || newConf.selectedTeam != null)) {
        getAllTeams(newConf, setClickupConf, setLoading)
      }
    } else {
      delete newConf[name]
    }
    setClickupConf({ ...newConf })
  }

  const setChanges = (val, name) => {
    const newConf = { ...clickupConf }
    newConf[name] = val

    if (name === 'selectedList' && val !== '' && clickupConf.actionName === 'task') {
      getCustomFields(newConf, setClickupConf, setLoading)
    } else if (name === 'selectedFolder' && val !== '' && clickupConf.actionName === 'task') {
      getAllLists(newConf, setClickupConf, setLoading)
    } else if (name === 'selectedSpace' && val !== '' && clickupConf.actionName === 'task') {
      getAllFolders(newConf, setClickupConf, setLoading)
    } else if (name === 'selectedTeam' && val !== '' && clickupConf.actionName === 'task') {
      getAllSpaces(newConf, setClickupConf, setLoading)
    }

    setClickupConf({ ...newConf })
  }
  return (
    <>
      <br />

      <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
      <select
        onChange={handleActionInput}
        name="actionName"
        value={clickupConf.actionName}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select an action', 'bit-integrations')}</option>
        <option value="task">{__('Create Task', 'bit-integrations')}</option>
      </select>

      {clickupConf.actionName === 'task' && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Team:', 'bit-integrations')}</b>

            <MultiSelect
              options={clickupConf?.Teams?.map(Team => ({ label: Team.name, value: Team.id }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={clickupConf?.selectedTeam}
              onChange={val => setChanges(val, 'selectedTeam')}
              disabled={loading.Teams}
              singleSelect
            />
            <button
              onClick={() => getAllTeams(clickupConf, setClickupConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh teams', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.Teams}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {clickupConf.actionName === 'task' && clickupConf.selectedTeam && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Space:', 'bit-integrations')}</b>
            <MultiSelect
              options={clickupConf?.Spaces?.map(Space => ({
                label: Space.name,
                value: Space.id
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={clickupConf?.selectedSpace}
              onChange={val => setChanges(val, 'selectedSpace')}
              disabled={loading.Spaces}
              singleSelect
            />
            <button
              onClick={() => getAllSpaces(clickupConf, setClickupConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh spaces', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.Spaces}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {clickupConf.actionName === 'task' && clickupConf.selectedSpace && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Folder:', 'bit-integrations')}</b>
            <MultiSelect
              options={clickupConf?.Folders?.map(Folder => ({
                label: Folder.name,
                value: Folder.id
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={clickupConf?.selectedFolder}
              onChange={val => setChanges(val, 'selectedFolder')}
              disabled={loading.Folders}
              singleSelect
            />
            <button
              onClick={() => getAllFolders(clickupConf, setClickupConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh folders', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.Folders}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {clickupConf.actionName === 'task' && clickupConf.selectedFolder && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select List:', 'bit-integrations')}</b>

            <MultiSelect
              options={clickupConf?.Lists?.map(List => ({ label: List.name, value: List.id }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={clickupConf?.selectedList}
              onChange={val => setChanges(val, 'selectedList')}
              disabled={loading.Lists}
              singleSelect
            />
            <button
              onClick={() => getAllLists(clickupConf, setClickupConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Lists', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.Lists}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {(loading.Teams || loading.Spaces || loading.Folders || loading.Lists || loading.customFields) && (
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

      {clickupConf.actionName === 'task' && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
            <button
              onClick={() => getCustomFields(clickupConf, setClickupConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh fields', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.Lists}>
              &#x21BB;
            </button>
          </div>

          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Clickup Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {clickupConf?.field_map.map((itm, i) => (
            <ClickupFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              clickupConf={clickupConf}
              formFields={formFields}
              setClickupConf={setClickupConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(clickupConf.field_map.length, clickupConf, setClickupConf, false)
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
          <ClickupActions
            clickupConf={clickupConf}
            setClickupConf={setClickupConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  )
}

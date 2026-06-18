import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from './IntegrationHelpers'
import {
  ACTIONS_WITH_DATASOURCE,
  ACTIONS_WITH_PROJECT,
  instasentRefreshFields,
  refreshDatasources
} from './InstasentCommonFunc'
import InstasentFieldMap from './InstasentFieldMap'

const actionOptions = [
  {
    value: 'send_sms',
    label: __('Send SMS', 'bit-integrations'),
    isPro: true
  },
  {
    value: 'create_lookup',
    label: __('Create Lookup', 'bit-integrations'),
    isPro: true
  },
  {
    value: 'create_datasource',
    label: __('Create Datasource', 'bit-integrations'),
    isPro: true
  },
  {
    value: 'create_or_update_contact',
    label: __('Create or Update Contact', 'bit-integrations'),
    isPro: true
  },
  {
    value: 'delete_contact',
    label: __('Delete Contact', 'bit-integrations'),
    isPro: true
  },
  {
    value: 'create_contact_event',
    label: __('Create Contact Event', 'bit-integrations'),
    isPro: true
  }
]

export default function InstasentIntegLayout({
  formFields,
  handleInput,
  instasentConf,
  setInstasentConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    const updatedConf = create(instasentConf, draftConf => {
      draftConf.action = value
    })

    setInstasentConf(updatedConf)

    if (value !== '') {
      instasentRefreshFields(updatedConf, setInstasentConf, loading, setLoading)
    }
  }

  const setDatasource = value => {
    setInstasentConf(prev =>
      create(prev, draftConf => {
        draftConf.datasourceId = value
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="action"
          defaultValue={instasentConf?.action || ''}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={actionOptions.map(action => ({
            label: checkIsPro(isPro, action.isPro) ? action.label : getProLabel(action.label),
            value: action.value,
            disabled: !checkIsPro(isPro, action.isPro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>
      <br />

      {ACTIONS_WITH_PROJECT.includes(instasentConf?.action) && (
        <div className="flx">
          <b className="wdt-200 d-in-b">{__('Project Id:', 'bit-integrations')}</b>
          <input
            className="btcd-paper-inp w-5"
            type="text"
            name="projectId"
            value={instasentConf?.projectId || ''}
            onChange={handleInput}
            placeholder={__('Project Id...', 'bit-integrations')}
          />
        </div>
      )}

      {ACTIONS_WITH_DATASOURCE.includes(instasentConf?.action) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Data Source:', 'bit-integrations')}</b>
            <MultiSelect
              title="datasourceId"
              defaultValue={instasentConf?.datasourceId || ''}
              className="w-5 d-in-b"
              onChange={val => setDatasource(val)}
              options={(instasentConf?.default?.datasources || []).map(ds => ({
                label: ds.name || ds.id,
                value: String(ds.id)
              }))}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshDatasources(instasentConf, setInstasentConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Data Sources', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.datasource}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {loading.field && (
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

      {instasentConf?.action && !loading?.field && (
        <>
          <div className="mt-5">
            <b className="wdt-100">
              {__('Field Map', 'bit-integrations')}
              <button
                onClick={() =>
                  instasentRefreshFields(instasentConf, setInstasentConf, loading, setLoading)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': '"Refresh Fields"' }}
                type="button"
                disabled={loading.field}>
                &#x21BB;
              </button>
            </b>
          </div>
          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Instasent Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {instasentConf?.field_map.map((itm, i) => (
            <InstasentFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              instasentConf={instasentConf}
              formFields={formFields}
              setInstasentConf={setInstasentConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(instasentConf.field_map.length, instasentConf, setInstasentConf, false)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
          <br />
        </>
      )}
    </>
  )
}

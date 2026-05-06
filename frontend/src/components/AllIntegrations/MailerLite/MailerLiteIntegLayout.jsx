import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from './IntegrationHelpers'
import MailerLiteActions from './MailerLiteActions'
import { getAllGroups, mailerliteRefreshFields } from './MailerLiteCommonFunc'
import MailerLiteFieldMap from './MailerLiteFieldMap'

const actionOptions = [
  {
    value: 'add_subscriber',
    label: __('Add Subscriber', 'bit-integrations'),
    isPro: false,
    isV2Only: false
  },
  {
    value: 'delete_subscriber',
    label: __('Delete subscriber', 'bit-integrations'),
    isPro: true,
    isV2Only: true
  },
  {
    value: 'forget_subscriber',
    label: __('Forget subscriber', 'bit-integrations'),
    isPro: true,
    isV2Only: true
  },
  {
    value: 'unassign_subscriber_from_group',
    label: __('Unassign subscriber from a group', 'bit-integrations'),
    isPro: true,
    isV2Only: true
  }
]

export default function MailerLiteIntegLayout({
  formFields,
  handleInput,
  mailerLiteConf,
  setMailerLiteConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    const updatedConf = create(mailerLiteConf, draftConf => {
      draftConf.action = value
    })

    setMailerLiteConf(updatedConf)

    if (value !== '') {
      mailerliteRefreshFields(updatedConf, setMailerLiteConf, loading, setLoading)
    }

    if (value === 'unassign_subscriber_from_group') {
      getAllGroups(updatedConf, setMailerLiteConf, loading, setLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="action"
          defaultValue={mailerLiteConf?.action || ''}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={actionOptions.map(action => ({
            label: checkIsPro(isPro, action.isPro) ? action.label : getProLabel(action.label),
            value: action.value,
            disabled:
              !checkIsPro(isPro, action.isPro) || (action.isV2Only && mailerLiteConf.version === 'v1')
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {mailerLiteConf?.action === 'unassign_subscriber_from_group' && (
        <div className="mt-4">
          <b className="wdt-200 d-in-b">{__('Select Group:', 'bit-integrations')}</b>
          <select
            className="btcd-paper-inp w-5"
            name="selected_group_id"
            value={mailerLiteConf?.selected_group_id || ''}
            onChange={handleInput}>
            <option value="">{__('Select a group', 'bit-integrations')}</option>
            {mailerLiteConf?.groups?.map(group => (
              <option key={group.group_id} value={group.group_id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => getAllGroups(mailerLiteConf, setMailerLiteConf, loading, setLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh Groups', 'bit-integrations')}'` }}
            type="button"
            disabled={loading.group}>
            &#x21BB;
          </button>
        </div>
      )}

      {(loading.field || loading.group) && (
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

      {mailerLiteConf?.action && !loading?.field && (
        <>
          <div className="mt-5">
            <b className="wdt-100">
              {__('Field Map', 'bit-integrations')}
              <button
                onClick={() =>
                  mailerliteRefreshFields(mailerLiteConf, setMailerLiteConf, loading, setLoading)
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
              <b>{__('MailerLite Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {mailerLiteConf?.field_map.map((itm, i) => (
            <MailerLiteFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              mailerLiteConf={mailerLiteConf}
              formFields={formFields}
              setMailerLiteConf={setMailerLiteConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(mailerLiteConf.field_map.length, mailerLiteConf, setMailerLiteConf, false)
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

      {mailerLiteConf?.action && mailerLiteConf?.action !== 'add_subscriber' && <Note note={note} />}

      {mailerLiteConf?.action && mailerLiteConf?.action === 'add_subscriber' && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <MailerLiteActions
            mailerLiteConf={mailerLiteConf}
            setMailerLiteConf={setMailerLiteConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </>
      )}
    </>
  )
}

const note = `
    <p>${__(
  'This action requires a MailerLite New account. It isn’t supported with Classic accounts.',
  'bit-integrations'
)}</p>
  `

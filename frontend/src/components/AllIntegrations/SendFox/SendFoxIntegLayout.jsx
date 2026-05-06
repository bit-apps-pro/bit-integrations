import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  fetchAllList,
  generateListMappedField,
  generateMappedField,
  generateunsubscribeMappedField
} from './SendFoxCommonFunc'
import SendFoxFieldMap from './SendFoxFieldMap'
import SendFoxListFieldMap from './SendFoxListFieldMap'
import SendFoxUnsubscribeFieldMap from './SendFoxUnsubscribeFieldMap'

export default function SendFoxIntegLayout({
  formFields,
  handleInput,
  sendFoxConf,
  setSendFoxConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const organizedList = (sendFoxConf?.default?.allLists || []).map(({ id, name }) => ({
    label: name,
    value: `${id}`
  }))

  const onListHandler = val => {
    const newConf = { ...sendFoxConf }
    if (val) {
      newConf.listId = val
    } else {
      newConf.listId = ''
    }
    setSendFoxConf({ ...newConf })
  }

  const setMainAction = value => {
    setSendFoxConf(prev =>
      create(prev, draft => {
        draft.mainAction = value

        switch (value) {
          case '1':
            draft.field_map_list = generateListMappedField(sendFoxConf)
            break
          case '2':
            draft.field_map = generateMappedField(sendFoxConf)
            break
          case '3':
            draft.field_map_unsubscribe = generateunsubscribeMappedField(sendFoxConf)
            break
          default:
            draft.field_map = [{ formField: '', sendFoxFormField: '' }]
            draft.field_map_list = [{ formField: '', sendFoxListFormField: '' }]
            draft.field_map_unsubscribe = [{ formField: '', sendFoxUnsubscribeFormField: '' }]
        }
      })
    )
  }

  return (
    <>
      <br />
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={e => setMainAction(e.target.value)}
        name="mainAction"
        value={sendFoxConf.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {allActions.map(({ key, label }) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <br />
      <br />
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

      {sendFoxConf.mainAction === '1' && (
        <>
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('SendFox List Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {sendFoxConf?.field_map_list.map((itm, i) => (
            <SendFoxListFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              sendFoxConf={sendFoxConf}
              formFields={formFields}
              setSendFoxConf={setSendFoxConf}
              setSnackbar={setSnackbar}
            />
          ))}
          {/* <div className="txt-center btcbi-field-map-button mt-2"><button onClick={() => addFieldMap(sendFoxConf.field_map.length, sendFoxConf, setSendFoxConf, false)} className="icn-btn sh-sm" type="button">+</button></div> */}
        </>
      )}

      {/* create Conatact */}
      {sendFoxConf.mainAction === '2' && (
        <>
          <div className="d-flx">
            <b className="wdt-200 d-in-b mt-3 mt-i-3">{__('All List:', 'bit-integrations')}</b>
            <MultiSelect
              options={organizedList}
              className="btcd-paper-drpdwn w-5"
              defaultValue={sendFoxConf.listId}
              onChange={val => onListHandler(val)}
              customValue
            />
            <button
              onClick={() => fetchAllList(sendFoxConf, setSendFoxConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh SendFox List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />

          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('SendFox Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {sendFoxConf?.listId &&
            sendFoxConf?.field_map.map((itm, i) => (
              <SendFoxFieldMap
                key={`rp-m-${i + 9}`}
                i={i}
                field={itm}
                sendFoxConf={sendFoxConf}
                formFields={formFields}
                setSendFoxConf={setSendFoxConf}
                setSnackbar={setSnackbar}
              />
            ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(sendFoxConf.field_map.length, sendFoxConf, setSendFoxConf, false)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}

      {/* unsubscribe */}

      {sendFoxConf.mainAction === '3' && (
        <>
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('SendFox Unsubscribe Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {sendFoxConf?.field_map_unsubscribe.map((itm, i) => (
            <SendFoxUnsubscribeFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              sendFoxConf={sendFoxConf}
              formFields={formFields}
              setSendFoxConf={setSendFoxConf}
              setSnackbar={setSnackbar}
            />
          ))}
          {/* <div className="txt-center btcbi-field-map-button mt-2"><button onClick={() => addFieldMap(sendFoxConf.field_map.length, sendFoxConf, setSendFoxConf, false)} className="icn-btn sh-sm" type="button">+</button></div> */}
        </>
      )}

      <br />
    </>
  )
}

const allActions = [
  { key: '1', label: __('Create List', 'bit-integrations') },
  { key: '2', label: __('Create Contact', 'bit-integrations') },
  { key: '3', label: __('Unsubscribe Contact', 'bit-integrations') }
]

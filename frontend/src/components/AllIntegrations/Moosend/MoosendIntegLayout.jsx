/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
/* eslint-disable no-console */
import { useRecoilValue } from 'recoil'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import LoaderSm from '../../Loaders/LoaderSm'
import { addFieldMap } from '../GlobalIntegrationHelper'
import { generateMappedField, getAllLists } from './MoosendCommonFunc'
import MoosendFieldMap from './MoosendFieldMap'
import { $appConfigState } from '../../../GlobalStates'
import Note from '../../Utilities/Note'

function MoosendIntegLayout({ moosendConf, setMoosendConf, formFields, loading, setLoading }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const moosendMethod = [
    { key: '1', name: __('Subscribe', 'bit-integrations') },
    { key: '0', name: __('Unsubscribe', 'bit-integrations') },
    { key: '2', name: __('Unsubscribe from list', 'bit-integrations') }
  ]
  const handleList = e => {
    let tmp
    const newConf = { ...moosendConf }
    const { name, value } = e.target

    if (value !== '') {
      newConf[name] = value
    } else {
      delete newConf[name]
    }

    switch (name) {
      case 'listId':
        if (value !== '') {
          if (!newConf.basicFields) {
            newConf.basicFields = newConf.moosendFields
          }

          const moosendFields = isPro ? getCustomFields(newConf, value) : [...newConf.basicFields]

          newConf.moosendFields = moosendFields
          newConf.field_map = generateMappedField(newConf)
        }

        break
      case 'method':
        newConf.listId = ''
        newConf.moosendFields = newConf?.basicFields || newConf.moosendFields || []
        newConf.field_map = generateMappedField(newConf)

        break
    }
    setMoosendConf({ ...newConf })
  }

  const note = `<h4>${__('Custom Field Available in Pro (v2.3.1)', 'bit-integrations')}</h4>
  <p>${__(
    'With the release of version 2.3.1, Pro users can now take advantage of the custom field feature.',
    'bit-integrations'
  )}</p>`

  return (
    <div className="mt-2">
      {!loading.page && (
        <div className="flx mt-2">
          <b className="wdt-200 d-in-b ">{__('Method:')}</b>
          <select
            onChange={handleList}
            name="method"
            value={moosendConf?.method}
            className="btcd-paper-inp w-5 mx-0">
            <option value="">{__('Select Method')}</option>
            {moosendMethod.map(method => (
              <option key={method.key} value={method.key}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {moosendConf.method && moosendConf.method !== '0' && (
        <div className="flx mt-2">
          <b className="wdt-200 d-in-b ">{__('List:')}</b>
          <select
            onChange={handleList}
            name="listId"
            value={moosendConf?.listId}
            className="btcd-paper-inp w-5 mx-0">
            <option value="">{__('Select List')}</option>
            {moosendConf?.default?.lists &&
              moosendConf.default.lists.map(list => (
                <option key={list.ID} value={list.ID}>
                  {list.Name}
                </option>
              ))}
          </select>
          <button
            onClick={() => getAllLists(moosendConf, setMoosendConf, loading, setLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': '"Refresh list"' }}
            type="button"
            disabled={loading.list}>
            &#x21BB;
          </button>
          {loading.list && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </div>
      )}

      {moosendConf?.method && (
        <div className="mt-5">
          <b className="wdt-100">{__('Field Map')}</b>

          <div className="btcd-hr mt-2 mb-4" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Moosend Fields')}</b>
            </div>
          </div>
          {moosendConf?.field_map.map((itm, i) => (
            <MoosendFieldMap
              key={`ko-m-${i + 8}`}
              i={i}
              field={itm}
              formFields={formFields}
              moosendConf={moosendConf}
              setMoosendConf={setMoosendConf}
            />
          ))}
          {moosendConf?.method === '1' && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(moosendConf.field_map.length, moosendConf, setMoosendConf, false)
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
        </div>
      )}

      {!isPro && <Note note={note} />}

      {loading.page && (
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
    </div>
  )
}

export default MoosendIntegLayout

const getCustomFields = (newConf, listId) => {
  const list = newConf.default.lists.find(list => list.ID === listId)
  const customFields =
    list?.CustomFieldsDefinition?.map(field => ({
      key: `custom_field_${field.ID}`,
      label: field.Name,
      required: field.IsRequired
    })) || []

  return [...newConf.basicFields, ...customFields]
}

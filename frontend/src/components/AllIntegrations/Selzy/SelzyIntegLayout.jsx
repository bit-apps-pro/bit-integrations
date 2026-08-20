/* eslint-disable no-unused-vars */
/* eslint-disable default-case */
/* eslint-disable no-console */
import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import LoaderSm from '../../Loaders/LoaderSm'
import { addFieldMap } from '../GlobalIntegrationHelper'
import SelzyActions from './SelzyActions'

import { getAllCustomFields, getAllLists, getAllTags } from './SelzyCommonFunc'
import SelzyFieldMap from './SelzyFieldMap'

function SelzyIntegLayout({ selzyConf, setSelzyConf, formFields, loading, setLoading }) {
  const [methodList, setMethodList] = useState([
    { key: '1', label: __('Subscribe', 'bit-integrations') },
    { key: '2', label: __('unsubscribe', 'bit-integrations') }
  ])
  const handleList = (val, name) => {
    const newConf = { ...selzyConf }
    switch (name) {
      case 'listIds':
        newConf[name] = val
        break
      case 'tags':
        newConf[name] = val
        break
    }
    setSelzyConf(newConf)
  }
  const handleActionList = e => {
    const newConf = { ...selzyConf }
    const { name, value } = e.target
    if (value !== '') {
      newConf[name] = value
    }
    switch (value) {
      case '':
        delete newConf[name]
        newConf.listIds = ''
        newConf.tags = ''
        break
      case '2':
        newConf.tags = ''
        newConf.field_map = [{ formField: '', selzyFormField: '' }]
        break
    }

    setSelzyConf({ ...newConf })
  }

  return (
    <div className="mt-2">
      {loading.page === false && (
        <>
          <b className="wdt-200 d-in-b ">{__('Actions:')}</b>
          <select
            onChange={handleActionList}
            name="method"
            value={selzyConf?.method}
            className="btcd-paper-inp w-5 mx-0">
            <option value="">{__('Select Actions')}</option>
            {methodList &&
              methodList.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        </>
      )}
      {selzyConf.method && (
        <>
          <div className="flx mt-2">
            <b className="wdt-200 d-in-b mx-0">{__('List:')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={selzyConf?.listIds}
              options={
                selzyConf?.default?.lists &&
                selzyConf?.default.lists.map(item => ({ label: item.title, value: item.id }))
              }
              onChange={value => handleList(value, 'listIds')}
              multiSelect
              closeOnSelect={false}
            />
            <button
              onClick={() => getAllLists(selzyConf, setSelzyConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh list"' }}
              type="button"
              disabled={loading.list}>
              &#x21BB;
            </button>
            {loading.list && <LoaderSm size="20" clr="#022217" className="ml-2" />}
          </div>

          {selzyConf.method === '1' && (
            <div className="flx mt-2">
              <b className="wdt-200 d-in-b">{__('Tags:')}</b>
              <MultiSelect
                className="w-5"
                defaultValue={selzyConf?.tags}
                options={
                  selzyConf?.default?.tags &&
                  selzyConf?.default.tags.map(item => ({ label: item.name, value: item.name }))
                }
                onChange={value => handleList(value, 'tags')}
                multiSelect
                closeOnSelect={false}
              />
              <button
                onClick={() => getAllTags(selzyConf, setSelzyConf, loading, setLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': '"Refresh Tag"' }}
                type="button"
                disabled={loading.tag}>
                &#x21BB;
              </button>
              {loading.tag && <LoaderSm size="20" clr="#022217" className="ml-2" />}
            </div>
          )}
        </>
      )}
      {loading.customFields && (
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
      {selzyConf?.listIds && selzyConf.method && (
        <div className="mt-5">
          <b className="wdt-100">
            {__('Field Map')}
            {selzyConf.method === '1' && (
              <button
                onClick={() => getAllCustomFields(selzyConf, setSelzyConf, loading, setLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.customFields}>
                &#x21BB;
              </button>
            )}
          </b>

          <div className="btcd-hr mt-2 mb-4" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Selzy Fields')}</b>
            </div>
          </div>
          {selzyConf?.field_map.map((itm, i) => (
            <SelzyFieldMap
              key={`ko-m-${i + 8}`}
              i={i}
              field={itm}
              formFields={formFields}
              selzyConf={selzyConf}
              setSelzyConf={setSelzyConf}
            />
          ))}
          {selzyConf?.method === '1' && (
            <>
              <div className="txt-center btcbi-field-map-button mt-2">
                <button
                  onClick={() => addFieldMap(selzyConf.field_map.length, selzyConf, setSelzyConf, false)}
                  className="icn-btn sh-sm"
                  type="button">
                  +
                </button>
              </div>

              <div className="mt-4">
                <b className="wdt-100">{__('Actions')}</b>
              </div>
              <div className="btcd-hr mt-1" />
              <SelzyActions selzyConf={selzyConf} setSelzyConf={setSelzyConf} />
            </>
          )}
        </div>
      )}


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

export default SelzyIntegLayout

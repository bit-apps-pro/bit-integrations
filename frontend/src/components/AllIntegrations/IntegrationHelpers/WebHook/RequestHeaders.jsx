import React, { useEffect } from 'react'
import CloseIcn from '../../../../Icons/CloseIcn'
import TrashIcn from '../../../../Icons/TrashIcn'
import { __ } from '../../../../Utils/i18nwrap'
import Button from '../../../Utilities/Button'
import FlowFormFieldsOptions from '../FlowFormFieldsOptions'
import SmartTagOptions from '../SmartTagOptions'

function RequestHeaders({ webHooks, setWebHooks, isInfo, setTab }) {
  useEffect(() => {
    setTab(3)
  }, [])

  const handleHeader = (e, index) => {
    const tmpConf = { ...webHooks }
    tmpConf.headers[index] = { ...tmpConf.headers[index], [e.target.name]: e.target.value }
    setWebHooks(tmpConf)
  }

  const setFromField = (val, index) => {
    const tmpConf = { ...webHooks }
    tmpConf.headers[index] = { ...tmpConf.headers[index], value: val }
    setWebHooks(tmpConf)
  }
  const addParam = () => {
    const tmpConf = { ...webHooks }
    if (!tmpConf.headers) {
      tmpConf.headers = []
    }
    tmpConf.headers.push({})
    setWebHooks(tmpConf)
  }
  const delParam = id => {
    const tmpConf = { ...webHooks }
    tmpConf.headers.splice(id, 1)
    setWebHooks(tmpConf)
  }
  return (
    <div className="mt-2">
      <div className="f-m">{__('Add Request Headers: (optional)', 'bit-integrations')}</div>
      <div className="btcd-param-t-wrp mt-1">
        <div className="btcd-param-t">
          <div className="tr">
            <div className="td">{__('Key', 'bit-integrations')}</div>
            <div className="td">{__('Value', 'bit-integrations')}</div>
          </div>
          {webHooks.headers?.map((itm, childindx) => (
            <div className="tr" key={`fu-1${childindx * 3}`}>
              <div className="td">
                <input
                  className="btcd-paper-inp p-i-sm"
                  onChange={e => handleHeader(e, childindx)}
                  name="key"
                  type="text"
                  value={itm.key}
                  disabled={isInfo}
                />
              </div>
              <div className="td">
                <input
                  className="btcd-paper-inp p-i-sm"
                  onChange={e => handleHeader(e, childindx)}
                  name="value"
                  type="text"
                  value={itm.value}
                  disabled={isInfo}
                />
              </div>
              {!isInfo && (
                <div className="flx p-atn">
                  <Button onClick={() => delParam(childindx)} icn>
                    <TrashIcn size={16} />
                  </Button>
                  <select
                    className="btcd-paper-inp mr-2"
                    name="formField"
                    value={itm.value || ''}
                    onChange={ev => setFromField(ev.target.value, childindx)}>
                    <option value="">{__('Select Field', 'bit-integrations')}</option>
                    <FlowFormFieldsOptions />
                    <SmartTagOptions />
                  </select>
                </div>
              )}
            </div>
          ))}
          {!isInfo && (
            <Button onClick={() => addParam(webHooks, setWebHooks)} className="add-pram" icn>
              <CloseIcn size="14" className="icn-rotate-45" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestHeaders

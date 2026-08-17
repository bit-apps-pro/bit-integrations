import { create } from 'mutative'
import { useEffect, useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { $formFields } from '../../../../GlobalStates'
import CloseIcn from '../../../../Icons/CloseIcn'
import { __ } from '../../../../Utils/i18nwrap'
import Button from '../../../Utilities/Button'
import TableCheckBox from '../../../Utilities/TableCheckBox'
import JsonEditor from '../../../Utilities/jsonEditor/JsonEditor'
import PayLoadFieldMap from './PayLoadFieldMap'

function Body({ webHooks, setWebHooks, isInfo, setTab }) {
  const formFields = useRecoilValue($formFields)
  const formattedFormFields = useMemo(
    () => formFields?.map(field => ({ key: field.name, value: `\${${field.name}}` })),
    [formFields]
  )

  useEffect(() => {
    const tmpConf = { ...webHooks }
    if (!tmpConf.body) {
      tmpConf.body = { type: '', data: [] }
      tmpConf.body['raw'] = `{ 
        // write here your custom field map 
      }`
      setWebHooks(tmpConf)
    }
    setTab(4)
  }, [])

  const addParam = () => {
    const tmpConf = { ...webHooks }
    if (!tmpConf.body.data || !Array.isArray(tmpConf.body.data)) {
      tmpConf.body.data = []
    }
    tmpConf.body.data.push({})
    setWebHooks(tmpConf)
  }

  const handleContentType = e => {
    const tmpConf = { ...webHooks }
    tmpConf.body.type = e.target.value

    if (e.target.value !== 'raw') {
      tmpConf.body.data = tmpConf?.body?.send_all_data ? formattedFormFields : []
    }
    setWebHooks(tmpConf)
  }

  const actionHandler = e => {
    const newConf = { ...webHooks }
    if (e.target.checked) {
      newConf.body.send_all_data = true
      newConf.body.data = formattedFormFields
    } else {
      delete newConf?.body?.data
      delete newConf?.body?.send_all_data
    }
    setWebHooks({ ...newConf })
  }
  const setJsonCustomBody = data => {
    setWebHooks(prevConf =>
      create(prevConf, draftConf => {
        draftConf.body.raw = data
      })
    )
  }

  return (
    <div className="mt-2">
      {formattedFormFields?.length < 100 && (
        <TableCheckBox
          isInfo={isInfo}
          checked={webHooks?.body?.send_all_data || false}
          onChange={actionHandler}
          className="wdt-200 mt-4 mr-2 mb-2"
          value="Send All Data"
          title={__('Send All Data', 'bit-integrations')}
        />
      )}
      <div className="f-m mt-1 mb-2">{__('Add Request Payload', 'bit-integrations')}</div>
      <select
        name="method"
        onChange={handleContentType}
        defaultValue={webHooks?.body?.type}
        className="btcd-paper-inp w-6"
        disabled={isInfo}>
        <option>-- {__('Select Content-Type', 'bit-integrations')} --</option>
        <option value="application/json">application/json</option>
        <option value="multipart/form-data">multipart/form-data</option>
        <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
        <option value="raw">raw (JSON)</option>
      </select>
      {webHooks?.body?.type === 'raw' ? (
        <JsonEditor
          data={webHooks?.body?.raw || webHooks.body?.data}
          onChange={setJsonCustomBody}
          formFields={formFields}
        />
      ) : (
        <div className="btcd-param-t-wrp mt-1">
          <div className="btcd-param-t">
            <div className="tr">
              <div className="td">{__('Key', 'bit-integrations')}</div>
              <div className="td">{__('Value', 'bit-integrations')}</div>
            </div>
            {Array.isArray(webHooks.body?.data) &&
              webHooks.body?.data?.map((itm, childindx) => (
                <PayLoadFieldMap
                  key={`fu-1${childindx * 3}`}
                  childindx={childindx}
                  itm={itm}
                  isInfo={isInfo}
                  webHooks={webHooks}
                  setWebHooks={setWebHooks}
                />
              ))}
            {!isInfo && (
              <Button onClick={() => addParam(webHooks, setWebHooks)} className="add-pram" icn>
                <CloseIcn size="14" className="icn-rotate-45" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Body

import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../../Utils/i18nwrap'
import CloseIcn from '../../../../Icons/CloseIcn'
import TrashIcn from '../../../../Icons/TrashIcn'
import Button from '../../../Utilities/Button'

function Params({ formFields, webHooks, setWebHooks, isInfo, setTab }) {
  useEffect(() => {
    setTab(1)
  }, [])
  const getUrlParams = url => url?.match(/(\?|&)([^=]+)=([^&]+|)/gi)
  const handleParam = (typ, val, pram) => {
    const tmpConf = { ...webHooks }
    if (val !== '') {
      if (typ === 'key') {
        tmpConf.url = tmpConf.url.replace(pram, `${pram.charAt(0)}${val}=${pram.split('=')[1]}`)
      } else {
        tmpConf.url = tmpConf.url.replace(pram, `${pram.split('=')[0]}=${val}`)
      }
    } else if (pram.match(/\?/g) === null) {
      tmpConf.url = tmpConf.url.replace(pram, '')
    } else {
      tmpConf.url = tmpConf.url.replace(`${pram}&`, '?')
    }
    setWebHooks(tmpConf)
  }

  const setFromField = (val, param) => {
    const tmpConf = { ...webHooks }
    const a = param.split('=')
    a[1] = val
    tmpConf.url = tmpConf.url.replace(param, a.join('='))
    setWebHooks(tmpConf)
  }
  const addParam = () => {
    const tmpConf = { ...webHooks }
    if (tmpConf.url.match(/\?/g) !== null) {
      tmpConf.url += '&key=value'
    } else {
      tmpConf.url += '?key=value'
    }
    setWebHooks(tmpConf)
  }
  const delParam = param => {
    const tmpConf = { ...webHooks }
    tmpConf.url = tmpConf.url.replace(param, '')
    setWebHooks(tmpConf)
  }
  return (
    <div className="mt-2">
      <div className="f-m">{__('Url Query Parameters: (optional)', 'bit-integrations')}</div>
      <div className="btcd-param-t-wrp mt-1">
        <div className="btcd-param-t">
          <div className="tr">
            <div className="td">{__('Key', 'bit-integrations')}</div>
            <div className="td">{__('Value', 'bit-integrations')}</div>
          </div>
          {getUrlParams(webHooks.url) !== null &&
            getUrlParams(webHooks.url)?.map((itm, childindx) => (
              <div className="tr" key={`fu-1${childindx * 3}`}>
                <div className="td">
                  <input
                    className="btcd-paper-inp p-i-sm"
                    onChange={e => handleParam('key', e.target.value, itm, webHooks, setWebHooks)}
                    type="text"
                    value={itm.split('=')[0].substr(1)}
                    disabled={isInfo}
                  />
                </div>
                <div className="td">
                  <input
                    className="btcd-paper-inp p-i-sm"
                    onChange={e => handleParam('val', e.target.value, itm, webHooks, setWebHooks)}
                    type="text"
                    value={itm.split('=')[1]}
                    disabled={isInfo}
                  />
                </div>
                {!isInfo && (
                  <div className="flx p-atn">
                    <Button onClick={() => delParam(itm, webHooks, setWebHooks)} icn>
                      <TrashIcn size={16} />
                    </Button>
                    <MultiSelect
                      options={formFields.map(f => ({ label: f.label, value: `\${${f.name}}` }))}
                      className="btcd-paper-drpdwn wdt-200 ml-2"
                      singleSelect
                      onChange={val => setFromField(val, itm, webHooks, setWebHooks)}
                      defaultValue={itm.split('=')[1]}
                    />
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

export default Params

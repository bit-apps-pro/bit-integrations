import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from './IntegrationHelpers'
import SendyActions from './SendyActions'
import { generateMappedField, getAllBrand, getAllList } from './SendyCommonFunc'
import SendyFieldMap from './SendyFieldMap'
import { getAction, hasUtilities, modules, needsCampaignLists, needsList } from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function SendyIntegLayout({
  formFields,
  sendyConf,
  setSendyConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const { isPro } = useRecoilValue($appConfigState)
  const action = getAction(sendyConf)

  const handleMainAction = value => {
    if (!value) return

    const nextConf = create(sendyConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = [{ formField: '', sendyField: '' }]
      delete draftConf.utilities
    })

    nextConf.field_map = generateMappedField(nextConf)
    setSendyConf(nextConf)
  }

  const handleChange = e => {
    const newConf = { ...sendyConf }
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }
    if (name === 'brand_id') {
      getAllList(newConf, setSendyConf, setIsLoading, setSnackbar)
    }
    setSendyConf({ ...newConf })
  }

  const setCampaignLists = value =>
    setSendyConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.list_ids = value ? value.split(',').filter(Boolean) : []
      })
    )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={action}
          className="btcd-paper-drpdwn w-5"
          onChange={handleMainAction}
          options={modules.map(module => ({
            disabled: !checkIsPro(isPro, module.is_pro),
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name
          }))}
          singleSelect
          closeOnSelect
        />
      </div>
      <br />

      <b className="wdt-200 d-in-b">{__('Brand:', 'bit-integrations')}</b>
      <select
        onChange={handleChange}
        name="brand_id"
        value={sendyConf.brand_id}
        className="btcd-paper-inp w-5">
        <option value="test">{__('Select Brand', 'bit-integrations')}</option>
        {sendyConf?.default?.brandList &&
          sendyConf.default.brandList.map(({ brandId, brandName }) => (
            <option key={brandId} value={brandId}>
              {brandName}
            </option>
          ))}
      </select>
      <button
        onClick={() => getAllBrand(sendyConf, setSendyConf, setIsLoading, setSnackbar)}
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': `'${__('Fetch All List', 'bit-integrations')}'` }}
        type="button"
        disabled={isLoading}>
        &#x21BB;
      </button>
      <br />
      <br />

      {sendyConf?.brand_id && needsList.includes(action) && (
        <>
          <b className="wdt-200 d-in-b">{__('List:', 'bit-integrations')}</b>
          <select
            onChange={handleChange}
            name="list_id"
            value={sendyConf.list_id}
            className="btcd-paper-inp w-5">
            <option value="test">{__('Select List', 'bit-integrations')}</option>
            {sendyConf?.default?.lists &&
              sendyConf.default.lists.map(({ listId, listName }) => (
                <option key={listId} value={listId}>
                  {listName}
                </option>
              ))}
          </select>
          <button
            onClick={() => getAllList(sendyConf, setSendyConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch All List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </>
      )}

      {sendyConf?.brand_id && needsCampaignLists.includes(action) && (
        <div className="flx">
          <b className="wdt-200 d-in-b">{__('Lists:', 'bit-integrations')}</b>
          <MultiSelect
            title="list_ids"
            defaultValue={sendyConf?.list_ids?.join(',') ?? null}
            className="btcd-paper-drpdwn w-5"
            options={(sendyConf?.default?.lists || []).map(({ listId, listName }) => ({
              label: listName,
              value: String(listId)
            }))}
            onChange={setCampaignLists}
          />
          <button
            onClick={() => getAllList(sendyConf, setSendyConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch All List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {sendyConf?.brand_id && needsCampaignLists.includes(action) && (
        <small className="d-blk mt-2 ml-1">
          {__(
            'To send the campaign, select a list or map segment IDs. A draft does not need a list.',
            'bit-integrations'
          )}
        </small>
      )}
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
          <b>{__('Sendy Fields', 'bit-integrations')}</b>
        </div>
      </div>

      {sendyConf?.field_map.map((itm, i) => (
        <SendyFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          sendyConf={sendyConf}
          formFields={formFields}
          setSendyConf={setSendyConf}
          setSnackbar={setSnackbar}
        />
      ))}
      <div className="txt-center btcbi-field-map-button mt-2">
        <button
          onClick={() => addFieldMap(sendyConf.field_map.length, sendyConf, setSendyConf, false)}
          className="icn-btn sh-sm"
          type="button">
          +
        </button>
      </div>
      <br />

      {hasUtilities.includes(action) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <SendyActions action={action} sendyConf={sendyConf} setSendyConf={setSendyConf} />
        </div>
      )}
      <br />
    </>
  )
}

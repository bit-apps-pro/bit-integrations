import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
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

  const setField = (name, value) =>
    setSendyConf(prevConf =>
      create(prevConf, draftConf => {
        if (value) {
          draftConf[name] = value
        } else {
          delete draftConf[name]
        }
      })
    )

  const handleBrand = value => {
    if (value === sendyConf?.brand_id) return

    const nextConf = create(sendyConf, draftConf => {
      if (value) {
        draftConf.brand_id = value
      } else {
        delete draftConf.brand_id
      }
      delete draftConf.list_id
      draftConf.list_ids = []
      if (draftConf.default) draftConf.default.lists = []
      if (draftConf.utilities) delete draftConf.utilities.selected_exclude_list_ids
    })

    setSendyConf(nextConf)
    if (value) getAllList(nextConf, setSendyConf, setIsLoading, setSnackbar)
  }

  const listOptions = (sendyConf?.default?.lists || []).map(({ listId, listName }) => ({
    label: listName,
    value: String(listId)
  }))

  const refreshButton = (onClick, tooltip) => (
    <button
      onClick={onClick}
      className="icn-btn sh-sm ml-2 mr-2 tooltip"
      style={{ '--tooltip-txt': `'${tooltip}'` }}
      type="button"
      disabled={isLoading}>
      &#x21BB;
    </button>
  )

  const refreshLists = () => getAllList(sendyConf, setSendyConf, setIsLoading, setSnackbar)

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

      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Brand:', 'bit-integrations')}</b>
        <MultiSelect
          title="brand_id"
          defaultValue={sendyConf?.brand_id ?? null}
          className="btcd-paper-drpdwn w-5"
          options={(sendyConf?.default?.brandList || []).map(({ brandId, brandName }) => ({
            label: brandName,
            value: String(brandId)
          }))}
          onChange={handleBrand}
          singleSelect
          closeOnSelect
        />
        {refreshButton(
          () => getAllBrand(sendyConf, setSendyConf, setIsLoading, setSnackbar),
          __('Refresh Brands', 'bit-integrations')
        )}
      </div>

      {sendyConf?.brand_id && needsList.includes(action) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('List:', 'bit-integrations')}</b>
          <MultiSelect
            title="list_id"
            defaultValue={sendyConf?.list_id ?? null}
            className="btcd-paper-drpdwn w-5"
            options={listOptions}
            onChange={value => setField('list_id', value)}
            singleSelect
            closeOnSelect
          />
          {refreshButton(refreshLists, __('Refresh Lists', 'bit-integrations'))}
        </div>
      )}

      {sendyConf?.brand_id && needsCampaignLists.includes(action) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Lists:', 'bit-integrations')}</b>
          <MultiSelect
            title="list_ids"
            defaultValue={sendyConf?.list_ids?.join(',') ?? null}
            className="btcd-paper-drpdwn w-5"
            options={listOptions}
            onChange={setCampaignLists}
          />
          {refreshButton(refreshLists, __('Refresh Lists', 'bit-integrations'))}
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

      {isLoading && (
        <Loader
          style={{
            alignItems: 'center',
            display: 'flex',
            height: 100,
            justifyContent: 'center',
            transform: 'scale(0.7)'
          }}
        />
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

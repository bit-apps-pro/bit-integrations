import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import ClickWhaleActions from './ClickWhaleActions'
import { generateMappedField } from './ClickWhaleCommonFunc'
import ClickWhaleFieldMap from './ClickWhaleFieldMap'
import {
  CreateLinkFields,
  DeleteLinkFields,
  hasUtilities,
  modules,
  UpdateLinkFields
} from './staticData'

const fieldsByAction = {
  create_link: CreateLinkFields,
  update_link: UpdateLinkFields,
  delete_link: DeleteLinkFields
}

export default function ClickWhaleIntegLayout({
  formID,
  formFields,
  clickWhaleConf,
  setClickWhaleConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const mainAction = clickWhaleConf?.mainAction

  const handleMainAction = value => {
    setClickWhaleConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.clickWhaleFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.clickWhaleFields)
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {mainAction && clickWhaleConf.clickWhaleFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('ClickWhale Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {clickWhaleConf?.field_map?.map((itm, i) => (
            <ClickWhaleFieldMap
              key={`clickwhale-m-${i + 9}`}
              i={i}
              field={itm}
              clickWhaleConf={clickWhaleConf}
              formFields={formFields}
              setClickWhaleConf={setClickWhaleConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(clickWhaleConf.field_map.length, clickWhaleConf, setClickWhaleConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction === 'create_link' && (
        <Note
          note={__(
            'Leave Slug unmapped to derive it from the Title. The link is created under the currently logged-in user.',
            'bit-integrations'
          )}
        />
      )}

      {mainAction === 'update_link' && (
        <Note
          note={__(
            'Only mapped fields are changed — anything left unmapped keeps its stored value.',
            'bit-integrations'
          )}
        />
      )}

      {hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <ClickWhaleActions clickWhaleConf={clickWhaleConf} setClickWhaleConf={setClickWhaleConf} />
        </div>
      )}
    </>
  )
}

import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import B2BKingFieldMap from './B2BKingFieldMap'
import { generateMappedField, refreshB2BKingGroups } from './B2BKingCommonFunc'
import {
  ApproveCustomerFields,
  EnableB2BForUserFields,
  modules,
  UpdateCustomerGroupFields
} from './staticData'

export default function B2BKingIntegLayout({
  formFields,
  b2bKingConf,
  setB2BKingConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setB2BKingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'update_customer_group':
            draftConf.b2bKingFields = UpdateCustomerGroupFields
            break
          case 'approve_customer':
            draftConf.b2bKingFields = ApproveCustomerFields
            break
          case 'enable_b2b_for_user':
            draftConf.b2bKingFields = EnableB2BForUserFields
            break
          default:
            draftConf.b2bKingFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.b2bKingFields)

        if (draftConf.utilities) {
          draftConf.utilities.selected_group = ''
        }
      })
    )

    if (value === 'update_customer_group') {
      refreshB2BKingGroups(setB2BKingConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={b2bKingConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: checkIsPro(isPro, action.is_pro) ? false : true
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {b2bKingConf?.mainAction === 'update_customer_group' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Group:', 'bit-integrations')}</b>
            <MultiSelect
              title="selected_group"
              defaultValue={b2bKingConf?.utilities?.selected_group ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(Array.isArray(b2bKingConf?.allGroups) ? b2bKingConf.allGroups : []).map(group => ({
                label: group.label,
                value: String(group.value)
              }))}
              onChange={val =>
                setB2BKingConf(prevConf =>
                  create(prevConf, draftConf => {
                    if (!draftConf.utilities) draftConf.utilities = {}
                    draftConf.utilities.selected_group = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshB2BKingGroups(setB2BKingConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Groups', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

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

      {b2bKingConf?.mainAction && b2bKingConf.b2bKingFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('B2BKing Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {b2bKingConf?.field_map?.map((itm, i) => (
            <B2BKingFieldMap
              key={`b2bking-m-${i + 9}`}
              i={i}
              field={itm}
              b2bKingConf={b2bKingConf}
              formFields={formFields}
              setB2BKingConf={setB2BKingConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(b2bKingConf.field_map.length, b2bKingConf, setB2BKingConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}

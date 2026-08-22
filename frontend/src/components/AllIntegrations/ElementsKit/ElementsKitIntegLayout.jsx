import { create } from 'mutative'
import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import ElementsKitActions from './ElementsKitActions'
import { generateMappedField, refreshElementsKitContents } from './ElementsKitCommonFunc'
import ElementsKitFieldMap from './ElementsKitFieldMap'
import {
  activationOptions,
  ContentCreateFields,
  ContentIdField,
  ContentUpdateFields,
  hasUtilities,
  modules,
  needsActivation,
  needsParentContent,
  needsTemplateType,
  TemplateCreateFields,
  TemplateIdField,
  TemplateUpdateFields,
  templateTypeOptions,
  WidgetCreateFields,
  WidgetIdField,
  WidgetUpdateFields
} from './staticData'

export default function ElementsKitIntegLayout({
  formID,
  formFields,
  elementsKitConf,
  setElementsKitConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  // On edit the action is already chosen, so handleMainAction never runs and the parent
  // list would stay empty until the user pressed refresh.
  useEffect(() => {
    if (needsParentContent.includes(elementsKitConf?.mainAction) && !elementsKitConf?.allContents) {
      refreshElementsKitContents(setElementsKitConf, setIsLoading)
    }
  }, [elementsKitConf?.mainAction])

  const setField = (key, value) =>
    setElementsKitConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )

  const handleMainAction = value => {
    setElementsKitConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'create_template':
            draftConf.elementsKitFields = TemplateCreateFields
            break
          case 'update_template':
            draftConf.elementsKitFields = TemplateUpdateFields
            break
          case 'update_template_activation':
          case 'delete_template':
            draftConf.elementsKitFields = TemplateIdField
            break
          case 'create_widget':
            draftConf.elementsKitFields = WidgetCreateFields
            break
          case 'update_widget':
            draftConf.elementsKitFields = WidgetUpdateFields
            break
          case 'delete_widget':
            draftConf.elementsKitFields = WidgetIdField
            break
          case 'create_content':
            draftConf.elementsKitFields = ContentCreateFields
            break
          case 'update_content':
            draftConf.elementsKitFields = ContentUpdateFields
            break
          case 'delete_content':
            draftConf.elementsKitFields = ContentIdField
            break
          default:
            draftConf.elementsKitFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.elementsKitFields)
      })
    )

    if (needsParentContent.includes(value)) {
      refreshElementsKitContents(setElementsKitConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={elementsKitConf?.mainAction ?? null}
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

      {needsTemplateType.includes(elementsKitConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Template Type:', 'bit-integrations')}</b>
            <MultiSelect
              title="templateType"
              defaultValue={elementsKitConf?.templateType ?? null}
              className="btcd-paper-drpdwn w-5"
              options={templateTypeOptions}
              onChange={val => setField('templateType', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsActivation.includes(elementsKitConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Activation:', 'bit-integrations')}</b>
            <MultiSelect
              title="activation"
              defaultValue={elementsKitConf?.activation ?? null}
              className="btcd-paper-drpdwn w-5"
              options={activationOptions}
              onChange={val => setField('activation', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsParentContent.includes(elementsKitConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Parent Item:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedParent"
              defaultValue={elementsKitConf?.selectedParent ?? null}
              className="btcd-paper-drpdwn w-5"
              options={[
                { label: __('No Parent', 'bit-integrations'), value: '0' },
                ...(Array.isArray(elementsKitConf?.allContents)
                  ? elementsKitConf.allContents.map(content => ({
                      label: content.content_title,
                      value: content.content_id.toString()
                    }))
                  : [])
              ]}
              onChange={val => setField('selectedParent', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshElementsKitContents(setElementsKitConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Dynamic Content', 'bit-integrations')}'` }}
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

      {elementsKitConf?.mainAction && elementsKitConf.elementsKitFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('ElementsKit Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {elementsKitConf?.field_map?.map((itm, i) => (
            <ElementsKitFieldMap
              key={`elementskit-m-${i + 9}`}
              i={i}
              field={itm}
              elementsKitConf={elementsKitConf}
              formFields={formFields}
              setElementsKitConf={setElementsKitConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(elementsKitConf.field_map.length, elementsKitConf, setElementsKitConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {['create_widget', 'update_widget'].includes(elementsKitConf?.mainAction) && (
        <Note
          note={__(
            'Widget Data expects a Widget Builder definition as JSON. Missing keys fall back to defaults, and saving it regenerates the widget file.',
            'bit-integrations'
          )}
        />
      )}

      {elementsKitConf?.mainAction &&
        elementsKitConf.elementsKitFields &&
        hasUtilities.includes(elementsKitConf?.mainAction) && (
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
            <div className="btcd-hr mt-1" />
            <ElementsKitActions
              elementsKitConf={elementsKitConf}
              setElementsKitConf={setElementsKitConf}
            />
          </div>
        )}
    </>
  )
}

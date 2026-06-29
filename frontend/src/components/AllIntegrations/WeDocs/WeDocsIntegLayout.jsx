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
import {
  checkMappedFields,
  generateMappedField,
  refreshDocumentations,
  refreshSections
} from './WeDocsCommonFunc'
import WeDocsFieldMap from './WeDocsFieldMap'
import {
  documentationSelectionActions,
  modules,
  requiredDocumentationSelectionActions,
  requiredSectionSelectionActions,
  sectionSelectionActions,
  weDocsActionFields
} from './staticData'

export default function WeDocsIntegLayout({
  formFields,
  weDocsConf,
  setWeDocsConf,
  setIsLoading,
  isLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  useEffect(() => {
    if (!weDocsConf?.mainAction) {
      return
    }

    if (documentationSelectionActions.includes(weDocsConf.mainAction)) {
      refreshDocumentations(setWeDocsConf, setIsLoading, setSnackbar)
    }

    if (sectionSelectionActions.includes(weDocsConf.mainAction) && weDocsConf?.selectedDocumentationId) {
      refreshSections(weDocsConf.selectedDocumentationId, setWeDocsConf, setIsLoading, setSnackbar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMainAction = value => {
    setWeDocsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.weDocsFields = weDocsActionFields
        draftConf.field_map = generateMappedField()

        if (!documentationSelectionActions.includes(value)) {
          draftConf.selectedDocumentationId = ''
          draftConf.selectedSectionId = ''
          draftConf.documentations = []
          draftConf.sections = []
          return
        }

        if (requiredDocumentationSelectionActions.includes(value)) {
          draftConf.selectedDocumentationId = ''
        }

        if (!sectionSelectionActions.includes(value)) {
          draftConf.selectedSectionId = ''
          draftConf.sections = []
        } else if (requiredSectionSelectionActions.includes(value)) {
          draftConf.selectedSectionId = ''
        }
      })
    )

    if (documentationSelectionActions.includes(value)) {
      refreshDocumentations(setWeDocsConf, setIsLoading, setSnackbar)
    }
  }

  const handleDocumentationSelection = value => {
    setWeDocsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedDocumentationId = value
        draftConf.selectedSectionId = ''
        draftConf.sections = []
      })
    )

    if (sectionSelectionActions.includes(weDocsConf.mainAction)) {
      refreshSections(value, setWeDocsConf, setIsLoading, setSnackbar)
    }
  }

  const docOptions = requiredDocumentationSelectionActions.includes(weDocsConf?.mainAction)
    ? (weDocsConf?.documentations || []).filter(option => option.value !== 'any')
    : weDocsConf?.documentations || []

  const sectionOptions = requiredSectionSelectionActions.includes(weDocsConf?.mainAction)
    ? (weDocsConf?.sections || []).filter(option => option.value !== 'any')
    : weDocsConf?.sections || []

  return (
    <>
      <br />

      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={weDocsConf?.mainAction ?? null}
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

      {documentationSelectionActions.includes(weDocsConf?.mainAction) && (
        <div className="flx mt-3">
          <b className="wdt-200 d-in-b">
            {requiredDocumentationSelectionActions.includes(weDocsConf?.mainAction)
              ? __('Documentation:', 'bit-integrations')
              : __('Documentation (Optional):', 'bit-integrations')}
          </b>
          <MultiSelect
            title="selectedDocumentationId"
            defaultValue={weDocsConf?.selectedDocumentationId ?? null}
            className="w-5"
            onChange={value => handleDocumentationSelection(value)}
            options={docOptions.map(option => ({
              label: option.label,
              value: option.value
            }))}
            singleSelect
            closeOnSelect
          />
          <button
            onClick={() => refreshDocumentations(setWeDocsConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh documentations', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      {sectionSelectionActions.includes(weDocsConf?.mainAction) && (
        <div className="flx mt-3">
          <b className="wdt-200 d-in-b">
            {requiredSectionSelectionActions.includes(weDocsConf?.mainAction)
              ? __('Section:', 'bit-integrations')
              : __('Section (Optional):', 'bit-integrations')}
          </b>
          <MultiSelect
            title="selectedSectionId"
            defaultValue={weDocsConf?.selectedSectionId ?? null}
            className="w-5"
            onChange={value =>
              setWeDocsConf(prevConf =>
                create(prevConf, draftConf => {
                  draftConf.selectedSectionId = value
                })
              )
            }
            options={sectionOptions.map(option => ({
              label: option.label,
              value: option.value
            }))}
            singleSelect
            closeOnSelect
          />
          <button
            onClick={() =>
              refreshSections(
                weDocsConf?.selectedDocumentationId,
                setWeDocsConf,
                setIsLoading,
                setSnackbar
              )
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh sections', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading || !weDocsConf?.selectedDocumentationId}>
            &#x21BB;
          </button>
        </div>
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

      {!!weDocsConf?.weDocsFields?.length && !!weDocsConf?.field_map?.length && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('weDocs Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {weDocsConf?.field_map?.map((itm, i) => (
            <WeDocsFieldMap
              key={`wedocs-m-${i + 1}`}
              i={i}
              field={itm}
              weDocsConf={weDocsConf}
              formFields={formFields}
              setWeDocsConf={setWeDocsConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(weDocsConf.field_map.length, weDocsConf, setWeDocsConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      )}

      {['create_documentation', 'create_section', 'create_article'].includes(weDocsConf?.mainAction) && (
        <>
          <br />
          <Note
            note={__(
              'For post status mapping use one of these values: publish, draft, pending, or private.',
              'bit-integrations'
            )}
          />
        </>
      )}

      {!checkMappedFields(weDocsConf) && !!weDocsConf?.mainAction && (
        <>
          <br />
          <Note
            note={__(
              'Please complete all required selections and required mappings before continuing.',
              'bit-integrations'
            )}
          />
        </>
      )}
    </>
  )
}

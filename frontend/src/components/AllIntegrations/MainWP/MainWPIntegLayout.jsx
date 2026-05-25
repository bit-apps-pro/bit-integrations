import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  CreatePostFields,
  CreateUserFields,
  DeletePostFields,
  modules,
  PluginActionFields,
  SyncAllSitesFields,
  SyncSiteFields,
  UpdatePostFields
} from './staticData'
import { generateMappedField, refreshMainWPSites } from './MainWPCommonFunc'
import MainWPFieldMap from './MainWPFieldMap'

export default function MainWPIntegLayout({
  formID,
  formFields,
  mainWPConf,
  setMainWPConf,
  setSnackbar,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setMainWPConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.selectedSite = ''

        switch (value) {
          case 'sync_site':
            draftConf.mainWPFields = SyncSiteFields
            break
          case 'sync_all_sites':
            draftConf.mainWPFields = SyncAllSitesFields
            break
          case 'create_post':
            draftConf.mainWPFields = CreatePostFields
            break
          case 'update_post':
            draftConf.mainWPFields = UpdatePostFields
            break
          case 'delete_post':
            draftConf.mainWPFields = DeletePostFields
            break
          case 'activate_plugin':
          case 'deactivate_plugin':
            draftConf.mainWPFields = PluginActionFields
            break
          case 'create_user':
            draftConf.mainWPFields = CreateUserFields
            break
          default:
            draftConf.mainWPFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.mainWPFields)
      })
    )
  }

  const needsSite = mainWPConf?.mainAction && mainWPConf.mainAction !== 'sync_all_sites'

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainWPConf?.mainAction ?? null}
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

      {needsSite && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Site:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedSite"
              defaultValue={mainWPConf?.selectedSite ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                mainWPConf?.allSites?.map(site => ({
                  label: site.label,
                  value: site.value
                })) || []
              }
              onChange={val =>
                setMainWPConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.selectedSite = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshMainWPSites(setMainWPConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Sites', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading === 'sites'}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {mainWPConf?.mainAction && mainWPConf?.mainWPFields?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('MainWP Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {mainWPConf?.field_map?.map((field, i) => (
            <MainWPFieldMap
              key={`mwp-fm-${i}`}
              i={i}
              formFields={formFields}
              field={field}
              mainWPConf={mainWPConf}
              setMainWPConf={setMainWPConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(mainWPConf?.field_map?.length, mainWPConf, setMainWPConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
          <br />
        </div>
      )}
    </>
  )
}

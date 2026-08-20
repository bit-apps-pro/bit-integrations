import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../GlobalIntegrationHelper'
import BrilliantDirectoriesActions from './BrilliantDirectoriesActions'
import {
  generateMappedField,
  getMembershipPlans,
  getPostTypes,
  getTopCategories
} from './BrilliantDirectoriesCommonFunc'
import BrilliantDirectoriesFieldMap from './BrilliantDirectoriesFieldMap'
import {
  fieldsByAction,
  hasUtilities,
  modules,
  needsMembershipPlan,
  needsPostType,
  needsTopCategory
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function BrilliantDirectoriesIntegLayout({
  formFields,
  brilliantDirectoriesConf,
  setBrilliantDirectoriesConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = brilliantDirectoriesConf?.mainAction

  const handleMainAction = value => {
    const nextConf = create(brilliantDirectoriesConf, draftConf => {
      draftConf.mainAction = value
      draftConf.brilliantDirectoriesFields = fieldsByAction[value] || []
      draftConf.field_map = [{ brilliantDirectoriesField: '', formField: '' }]
    })

    nextConf.field_map = generateMappedField(nextConf)
    setBrilliantDirectoriesConf(nextConf)

    if (needsMembershipPlan.includes(value)) {
      getMembershipPlans(nextConf, setBrilliantDirectoriesConf, setIsLoading)
      getTopCategories(nextConf, setBrilliantDirectoriesConf, setIsLoading)
    }
    if (needsTopCategory.includes(value)) {
      getTopCategories(nextConf, setBrilliantDirectoriesConf, setIsLoading)
    }
    if (needsPostType.includes(value)) {
      getPostTypes(nextConf, setBrilliantDirectoriesConf, setIsLoading)
    }
  }

  const setField = (name, value) =>
    setBrilliantDirectoriesConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value
      })
    )

  const renderFetchedSelect = (label, name, defaultKey, refresh, tooltip, optionMapper) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={name}
          defaultValue={brilliantDirectoriesConf?.[name] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={(brilliantDirectoriesConf?.default?.[defaultKey] || []).map(optionMapper)}
          onChange={val => setField(name, val)}
          singleSelect
          closeOnSelect
        />
        <button
          onClick={() =>
            refresh(brilliantDirectoriesConf, setBrilliantDirectoriesConf, setIsLoading)
          }
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${tooltip}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
    </>
  )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={action ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(module => ({
            disabled: !checkIsPro(isPro, module.is_pro),
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsMembershipPlan.includes(action) && (
        <>
          {renderFetchedSelect(
            __('Membership Plan:', 'bit-integrations'),
            'subscription_id',
            'plans',
            getMembershipPlans,
            __('Refresh Membership Plans', 'bit-integrations'),
            ({ planId, planName }) => ({ label: planName, value: String(planId) })
          )}
          {renderFetchedSelect(
            __('Profession:', 'bit-integrations'),
            'profession_id',
            'categories',
            getTopCategories,
            __('Refresh Professions', 'bit-integrations'),
            ({ categoryId, categoryName }) => ({ label: categoryName, value: String(categoryId) })
          )}
        </>
      )}

      {needsTopCategory.includes(action) &&
        renderFetchedSelect(
          __('Top Category:', 'bit-integrations'),
          'top_category_id',
          'categories',
          getTopCategories,
          __('Refresh Categories', 'bit-integrations'),
          ({ categoryId, categoryName }) => ({ label: categoryName, value: String(categoryId) })
        )}

      {needsPostType.includes(action) &&
        renderFetchedSelect(
          __('Post Type:', 'bit-integrations'),
          'post_type_id',
          'postTypes',
          getPostTypes,
          __('Refresh Post Types', 'bit-integrations'),
          ({ postTypeId, postTypeName }) => ({ label: postTypeName, value: String(postTypeId) })
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

      {action && brilliantDirectoriesConf?.brilliantDirectoriesFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Brilliant Directories Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {brilliantDirectoriesConf?.field_map?.map((itm, i) => (
            <BrilliantDirectoriesFieldMap
              key={`bd-m-${i + 9}`}
              i={i}
              field={itm}
              brilliantDirectoriesConf={brilliantDirectoriesConf}
              formFields={formFields}
              setBrilliantDirectoriesConf={setBrilliantDirectoriesConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  brilliantDirectoriesConf.field_map.length,
                  brilliantDirectoriesConf,
                  setBrilliantDirectoriesConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {hasUtilities.includes(action) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <BrilliantDirectoriesActions
            brilliantDirectoriesConf={brilliantDirectoriesConf}
            setBrilliantDirectoriesConf={setBrilliantDirectoriesConf}
            formFields={formFields}
            setSnackbar={setSnackbar}
          />
        </div>
      )}
    </>
  )
}

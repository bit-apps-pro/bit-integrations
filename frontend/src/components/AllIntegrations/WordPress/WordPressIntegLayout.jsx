import { create } from 'mutative'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import WordPressActions from './WordPressActions'
import { generateMappedField, getFieldsForAction } from './WordPressCommonFunc'
import WordPressFieldMap from './WordPressFieldMap'
import { modules } from './staticData'

export default function WordPressIntegLayout({
  formFields,
  wordPressConf,
  setWordPressConf,
  isLoading
}) {
  const { isPro } = useRecoilValue($appConfigState)
  const displayedFieldMaps = (wordPressConf?.field_map || []).reduce((acc, fieldMap, index) => {
    acc.push({ fieldMap, index })

    return acc
  }, [])

  const handleMainAction = value => {
    setWordPressConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        delete draftConf.append
        delete draftConf.forceDelete
        delete draftConf.public
        delete draftConf.hierarchy
        delete draftConf.showUI
        delete draftConf.showInMenu
        delete draftConf.showInNavMenu
        delete draftConf.showInAdminBar
        delete draftConf.adminUI
        delete draftConf.restApi
        const fields = getFieldsForAction(value)
        draftConf.wordPressFields = fields
        draftConf.field_map = generateMappedField(fields)
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <select
          className="btcd-paper-inp w-5"
          value={wordPressConf?.mainAction || ''}
          onChange={e => handleMainAction(e.target.value)}>
          <option value="">{__('Select Action', 'bit-integrations')}</option>
          {modules.map(action => (
            <option key={action.name} value={action.name} disabled={!checkIsPro(isPro, action.is_pro)}>
              {checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label)}
            </option>
          ))}
        </select>
      </div>

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

      {wordPressConf?.mainAction && !isLoading && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WordPress Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {displayedFieldMaps.map(({ fieldMap, index }) => (
            <WordPressFieldMap
              key={`wp-m-${index + 9}`}
              i={index}
              field={fieldMap}
              wordPressConf={wordPressConf}
              formFields={formFields}
              setWordPressConf={setWordPressConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(wordPressConf.field_map.length, wordPressConf, setWordPressConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <div className="mt-3">
            <WordPressActions wordPressConf={wordPressConf} setWordPressConf={setWordPressConf} />
          </div>
        </>
      )}
      <br />
      <br />
    </>
  )
}

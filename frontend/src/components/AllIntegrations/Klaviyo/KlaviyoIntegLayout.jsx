/* eslint-disable default-case */
import { useRecoilValue } from 'recoil'
import { __, sprintf } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { getAllLists, addFieldMap, generateMappedField } from './KlaviyoCommonFunc'
import KlaviyoFieldMap from './KlaviyoFieldMap'
import { $appConfigState } from '../../../GlobalStates'
import KlaviyoActions from './KlaviyoActions'
import ActionProFeatureComponent from '../IntegrationHelpers/ActionProFeatureComponent'
import { ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'

function KlaviyoIntegLayout({ klaviyoConf, setKlaviyoConf, formFields, loading, setLoading }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleList = e => {
    const newConf = { ...klaviyoConf }
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }
    newConf[e.target.name] = e.target.value
    switch (e.target.name) {
      case 'listId':
        newConf.field_map = generateMappedField(newConf)
        newConf.custom_field_map = [{ formField: '', klaviyoFormField: '' }]
        break
    }

    setKlaviyoConf({ ...newConf })
  }

  return (
    <div>
      <b className="wdt-200 d-in-b mt-2">{__('List:', 'bit-integrations')}</b>
      <select
        name="listId"
        value={klaviyoConf.listId}
        onChange={handleList}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select List', 'bit-integrations')}</option>
        {klaviyoConf?.default?.lists &&
          klaviyoConf.default.lists.map((list, key) => (
            <option key={key} value={list?.id}>
              {list?.attributes?.name}
            </option>
          ))}
      </select>
      <button
        onClick={() => getAllLists(klaviyoConf, setKlaviyoConf, loading, setLoading)}
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': '"Refresh list"' }}
        type="button"
        disabled={loading.list}>
        &#x21BB;
      </button>

      {loading.list && (
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

      {klaviyoConf?.listId && (
        <div className="mt-5">
          <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>

          <div className="btcd-hr mt-2 mb-4" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Klaviyo Fields', 'bit-integrations')}</b>
            </div>
          </div>
          {klaviyoConf?.field_map.map((itm, i) => (
            <KlaviyoFieldMap
              key={`ko-m-${i + 8}`}
              i={i}
              field={itm}
              formFields={formFields}
              klaviyoConf={klaviyoConf}
              setKlaviyoConf={setKlaviyoConf}
              type="field_map"
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(klaviyoConf.field_map.length, klaviyoConf, setKlaviyoConf, 'field_map')
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      )}
      <br />
      {klaviyoConf?.listId && (
        <div className="mt-5">
          <ActionProFeatureComponent title={__('Custom Properties', 'bit-integrations')}>
            <b className="wdt-100">
              {<ProFeatureTitle title={__('Custom Properties', 'bit-integrations')} />}
            </b>
            <div className="btcd-hr mt-2 mb-4" />
            <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
              <div className="txt-dp">
                <b>{__('Form Fields', 'bit-integrations')}</b>
              </div>
              <div className="txt-dp">
                <b>{__('Klaviyo Property name', 'bit-integrations')}</b>
              </div>
            </div>
            {klaviyoConf?.custom_field_map?.map((itm, i) => (
              <KlaviyoFieldMap
                key={`ko-m-${i + 8}`}
                i={i}
                field={itm}
                formFields={formFields}
                klaviyoConf={klaviyoConf}
                setKlaviyoConf={setKlaviyoConf}
                type="custom_field_map"
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    klaviyoConf?.custom_field_map?.length,
                    klaviyoConf,
                    setKlaviyoConf,
                    'custom_field_map'
                  )
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          </ActionProFeatureComponent>

          <br />
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <KlaviyoActions
            klaviyoConf={klaviyoConf}
            setKlaviyoConf={setKlaviyoConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </div>
  )
}

export default KlaviyoIntegLayout

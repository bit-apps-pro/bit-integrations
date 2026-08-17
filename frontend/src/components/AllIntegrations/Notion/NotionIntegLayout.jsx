/* eslint-disable no-bitwise */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
/* eslint-disable no-console */
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { addFieldMap } from '../GlobalIntegrationHelper'
import { getAllDatabaseLists, getFieldsProperties } from './NotionCommonFunc'
import NotionFieldMap from './NotionFieldMap'

function NotionIntegLayout({ notionConf, setNotionConf, formFields, loading, setLoading }) {
  const handleList = async e => {
    const newConf = { ...notionConf }
    const { name, value } = e.target
    if (value !== '') {
      newConf[name] = value
    } else {
      delete newConf[name]
    }
    switch (name) {
      case 'databaseId':
        newConf.databaseId === '' && (newConf.field_map = [{ formFields: '', notionFormFields: '' }])
        if (newConf.databaseId) {
          setLoading({ ...loading, field: true })
          newConf.notionFields = await getFieldsProperties(newConf, setNotionConf)
          newConf.notionFields && setLoading({ ...loading, field: false })
        }
        break
    }

    setNotionConf(newConf)
  }

  const note = `
    <b>${__('Files & Media', 'bit-integrations')}</b>
    <p>${__('The Notion API does not yet support uploading files to Notion.', 'bit-integrations')}</p>
    <p>${__(
      'Please Provide a public URL of the file instead of file attachment.',
      'bit-integrations'
    )}</p>
  `

  return (
    <div className="mt-2">
      {!loading.page && (
        <div className="flx mt-2">
          <b className="wdt-200 d-in-b ">{__('Database List:', 'bit-integrations')}</b>
          <select
            onChange={handleList}
            name="databaseId"
            value={notionConf?.databaseId}
            className="btcd-paper-inp w-5 mx-0">
            <option value="">{__('Select Database', 'bit-integrations')}</option>
            {notionConf?.default?.databaseLists &&
              notionConf?.default.databaseLists.map(database => (
                <option key={database.id} value={database.id}>
                  {database.name}
                </option>
              ))}
          </select>
          <button
            onClick={() => getAllDatabaseLists(notionConf, setNotionConf, loading, setLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': '"Refresh list"' }}
            type="button"
            disabled={loading.list}>
            &#x21BB;
          </button>
          {loading.list && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </div>
      )}

      {notionConf?.databaseId && (
        <div className="mt-5">
          <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          <button
            onClick={() => getFieldsProperties(notionConf, setNotionConf, loading, setLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
            type="button"
            disabled={loading.field}>
            &#x21BB;
          </button>

          <div className="btcd-hr mt-2 mb-4" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Notion Fields', 'bit-integrations')}</b>
            </div>
          </div>
          {notionConf?.field_map.map((itm, i) => (
            <NotionFieldMap
              key={`ko-m-${i + 8}`}
              i={i}
              field={itm}
              formFields={formFields}
              notionConf={notionConf}
              setNotionConf={setNotionConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(notionConf.field_map.length, notionConf, setNotionConf, false)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      )}

      {/* --- PAGE Loader --- */}

      {(loading.page || loading.field) && (
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
      <Note note={note} />
    </div>
  )
}

export default NotionIntegLayout

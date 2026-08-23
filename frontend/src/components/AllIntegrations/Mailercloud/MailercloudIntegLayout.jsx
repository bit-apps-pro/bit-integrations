/* eslint-disable default-case */
/* eslint-disable no-console */
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../GlobalIntegrationHelper'
import MailercloudFieldMap from './MailercloudFieldMap'
import LoaderSm from '../../Loaders/LoaderSm'
import { getAllFields, getAllLists } from './MailercloudCommonFunc'

function MailercloudIntegLayout({
  mailercloudConf,
  setMailercloudConf,
  formFields,
  loading,
  setLoading
}) {
  const contactTypeList = ['active', 'bounce', 'abuse', 'unsubscribe', 'suppressed', 'spam complaints']
  const handleList = e => {
    const newConf = { ...mailercloudConf }
    const { name, value } = e.target
    if (value !== '') {
      newConf[name] = value
    } else {
      delete newConf[name]
    }
    switch (name) {
      case 'listId':
        newConf.field_map = [{ formField: '', mailercloudFormField: '' }]
        newConf.contactType = ''

        break
    }
    getAllFields(newConf, setMailercloudConf, loading, setLoading)
    setMailercloudConf({ ...newConf })
  }

  return (
    <div className="mt-2">
      {!loading.page && (
        <div className="flx mt-2">
          <b className="wdt-200 d-in-b ">{__('List:')}</b>
          <select
            onChange={handleList}
            name="listId"
            value={mailercloudConf?.listId}
            className="btcd-paper-inp w-5 mx-0">
            <option value="">{__('Select List')}</option>
            {mailercloudConf?.default?.lists &&
              mailercloudConf.default.lists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
          </select>
          <button
            onClick={() => getAllLists(mailercloudConf, setMailercloudConf, loading, setLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': '"Refresh list"' }}
            type="button"
            disabled={loading.list}>
            &#x21BB;
          </button>
          {loading.list && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </div>
      )}

      {mailercloudConf.listId && (
        <div className="flx mt-2">
          <b className="wdt-200 d-in-b ">{__('Contact type:')}</b>
          <select
            onChange={handleList}
            name="contactType"
            value={mailercloudConf?.contactType}
            className="btcd-paper-inp w-5 mx-0">
            <option value="">{__('Select type')}</option>
            {contactTypeList.map(type => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mt-4">
        <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
        <button
          onClick={() => getAllFields(mailercloudConf, setMailercloudConf, loading, setLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh Mailer Cloud Field', 'bit-integrations')}'` }}
          type="button"
          disabled={loading.field}>
          &#x21BB;
        </button>
      </div>
      <div className="btcd-hr mt-2 mb-4" />

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
      {mailercloudConf?.listId && mailercloudConf.default.fields && (
        <>
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Mailercloud Fields')}</b>
            </div>
          </div>
          {mailercloudConf?.field_map.map((itm, i) => (
            <MailercloudFieldMap
              key={`ko-m-${i + 8}`}
              i={i}
              field={itm}
              formFields={formFields}
              mailercloudConf={mailercloudConf}
              setMailercloudConf={setMailercloudConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(mailercloudConf.field_map.length, mailercloudConf, setMailercloudConf, false)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default MailercloudIntegLayout

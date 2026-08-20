import { useEffect } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Cooltip from '../../Utilities/Cooltip'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import MailupActions from './MailupActions'
import { fetchAllField, fetchAllGroup, fetchAllList } from './MailupCommonFunc'
import MailupFieldMap from './MailupFieldMap'

export default function MailupIntegLayout({
  formFields,
  handleInput,
  mailupConf,
  setMailupConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  //   // eslint-disable-next-line no-unused-expressions
  //   // eslint-disable-next-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   // eslint-disable-next-line no-unused-expressions
  //   mailupConf?.listId && fetchAllGroup(mailupConf, setMailupConf, setIsLoading, setSnackbar)
  //   mailupConf?.listId && fetchAllField(mailupConf, setMailupConf, setIsLoading, setSnackbar)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [mailupConf?.listId])

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Select List:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="listId"
        value={mailupConf.listId}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select List', 'bit-integrations')}</option>
        {mailupConf?.allList &&
          mailupConf.allList.map(({ idList, name }) => (
            <option key={idList} value={idList}>
              {name}
            </option>
          ))}
      </select>
      <button
        onClick={() => fetchAllList(mailupConf, setMailupConf, setIsLoading, setSnackbar)}
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': `'${__('Fetch All List', 'bit-integrations')}'` }}
        type="button"
        disabled={isLoading}>
        &#x21BB;
      </button>
      <br />
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
      {mailupConf?.listId && (
        <>
          <br />
          <b className="wdt-200 d-in-b">
            {__('Groups:', 'bit-integrations')}
            <Cooltip width={250} icnSize={17} className="ml-2">
              <div className="txt-body">
                {__(
                  'If you want to assign a subscriber to a group then select a group otherwise leave it blank',
                  'bit-integrations'
                )}
                <br />
              </div>
            </Cooltip>
          </b>
          <select
            onChange={handleInput}
            name="groupId"
            value={mailupConf.groupId}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select group', 'bit-integrations')}</option>
            {mailupConf?.allGroup &&
              mailupConf.allGroup.map(({ idGroup, name }) => (
                <option key={idGroup} value={idGroup}>
                  {name}
                </option>
              ))}
          </select>
          <button
            onClick={() => fetchAllGroup(mailupConf, setMailupConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch All Groups', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <br />
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
            <button
              onClick={() => fetchAllField(mailupConf, setMailupConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch All Fields', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Mailup Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {mailupConf?.field_map.map((itm, i) => (
            <MailupFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              mailupConf={mailupConf}
              formFields={formFields}
              setMailupConf={setMailupConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(mailupConf.field_map.length, mailupConf, setMailupConf, false)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>

          <br />
          <br />
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <MailupActions mailupConf={mailupConf} setMailupConf={setMailupConf} formFields={formFields} />
        </>
      )}
    </>
  )
}

import { useEffect } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import { addFieldMap } from './IntegrationHelpers'
import { getAllLevels } from './RestrictContentCommonFunc'
import RestrictContentFieldMap from './RestrictContentFieldMap'
import Cooltip from '../../Utilities/Cooltip'
import Note from '../../Utilities/Note'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'

export default function RestrictContentIntegLayout({
  formFields,
  handleInput,
  restrictConf,
  setRestrictConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const handleInputAction = e => {
    const newConf = { ...restrictConf }
    const { name, value } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }
    setRestrictConf(newConf)
  }

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
      <select
        onChange={handleInputAction}
        name="actionName"
        value={restrictConf?.actionName}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Action', 'bit-integrations')}</option>
        {restrictConf?.actionLists &&
          restrictConf.actionLists.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
      {restrictConf?.actionName && (
        <>
          <b className="wdt-200 d-in-b">{__('Membership Level:', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="level_id"
            value={restrictConf.level_id}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select Level', 'bit-integrations')}</option>
            {restrictConf.actionName === 'remove-member-level' && (
              <option value="all">{__('All memberships', 'bit-integrations')}</option>
            )}
            {restrictConf?.default?.levellists &&
              restrictConf.default.levellists.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
          </select>
          <button
            onClick={() => getAllLevels(restrictConf, setRestrictConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch All Level', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </>
      )}
      <br />
      <br />
      {restrictConf.actionName === 'add-member-level' && (
        <div className="flx">
          <b className="wdt-200 d-in-b">{__('Expiry Date:', 'bit-integrations')}</b>
          <input
            className="btcd-paper-inp w-5 mt-1"
            onChange={handleInput}
            name="exp_date"
            value={restrictConf.exp_date || ''}
            type="date"
            placeholder={__('Expiry Date', 'bit-integrations')}
          />
          <Cooltip width={250} icnSize={17} className="ml-2">
            <div className="txt-body">Leave it empty for never-expired</div>
          </Cooltip>
        </div>
      )}
      <br />
      <br />
      <br />
      <UserSourceSelect conf={restrictConf} setConf={setRestrictConf} />
      {restrictConf?.userSource === 'email' && (
        <UserEmailFieldMap
          conf={restrictConf}
          setConf={setRestrictConf}
          formFields={formFields}
          actionLabel={__('Restrict Content Fields', 'bit-integrations')}
        />
      )}
      <br />
      {restrictConf?.userSource === 'email' ? (
        <Note
          note={__(
            'This action runs for the user matching the mapped email. The user must already exist on your site, otherwise the action fails.',
            'bit-integrations'
          )}
        />
      ) : (
        <Note note={__('This integration will only work for logged-in users.', 'bit-integrations')} />
      )}
    </>
  )
}

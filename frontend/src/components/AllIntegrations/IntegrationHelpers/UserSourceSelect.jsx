import { __ } from '../../../Utils/i18nwrap'
import { handleUserSourceChange } from './userSource'

export default function UserSourceSelect({ conf, setConf, mapKey }) {
  return (
    <div className="flx">
      <b className="wdt-200 d-in-b">{__('Run Action For:', 'bit-integrations')}</b>
      <select
        onChange={e => handleUserSourceChange(e.target.value, conf, setConf, mapKey)}
        name="userSource"
        value={conf?.userSource || 'logged-in'}
        className="btcd-paper-inp w-5">
        <option value="logged-in">{__('Logged-in User', 'bit-integrations')}</option>
        <option value="email">{__('User Matched by Email', 'bit-integrations')}</option>
      </select>
    </div>
  )
}

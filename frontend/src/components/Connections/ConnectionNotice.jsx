import { Link } from 'react-router'
import InfoIcn from '../../Icons/InfoIcn'
import { __ } from '../../Utils/i18nwrap'

/**
 * Read-only explainer for the integration info page.
 *
 * `isLegacy` covers integrations saved before 2.10.0: they keep their credentials
 * inline in flow_details instead of pointing at a connection row, so the info page
 * has nothing to show them and no connection to switch.
 */
export default function ConnectionNotice({ onOpenSettings }) {
  return (
    <div className={`conn-notice conn-notice-legacy`} role="note">
      <span className="conn-notice-icn" aria-hidden="true">
        <InfoIcn size={18} stroke={2} />
      </span>

      <div className="conn-notice-body">
        <h4 className="conn-notice-title">
          {__('Why the API credentials are not shown here', 'bit-integrations')}
        </h4>
        <p>
          {__(
            'This integration was set up before version 2.10.0, so its credentials are stored with the integration itself instead of in a saved connection. This screen only displays saved connections, so there is nothing here for it to show.',
            'bit-integrations'
          )}
        </p>
        <p>
          {__(
            'Saved credentials are never sent back to your browser. They stay encrypted on your server, so an API key or token cannot leak through a screenshot, a shared screen, browser history or a hijacked admin session. The fields look empty because the credentials are protected, not because they are missing.',
            'bit-integrations'
          )}
        </p>
        <p>
          {__(
            'This integration keeps running exactly as before. Nothing is broken.',
            'bit-integrations'
          )}
        </p>
        <p>
          {__(
            'Want it on the new system? Open the integration settings and authorize this app once. It then starts using a saved connection you can reuse for every future integration.',
            'bit-integrations'
          )}
        </p>

        <hr className="conn-notice-sep" />
        <h4 className="conn-notice-title">
          {__('Authorize once, reuse everywhere', 'bit-integrations')}
        </h4>
        <p>
          {__(
            'Connections are the new home for credentials. Authorize an app once and every integration for that same app can pick the same connection — no re-entering API keys, no repeating the OAuth flow.',
            'bit-integrations'
          )}
        </p>
        <p>
          {__(
            'Rename, review or remove connections any time from the Connections page. Updating a connection updates every integration linked to it.',
            'bit-integrations'
          )}
        </p>
        <Link to="/connections" className="conn-notice-link">
          {__('Manage connections', 'bit-integrations')}
        </Link>
      </div>
    </div>
  )
}

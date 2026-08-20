import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAsyncDebounce } from 'react-table'
import SingleToggle2 from '../components/Utilities/SingleToggle2'
import { DangerIcn, LogRetentionIcn, MailIcn, PrivacyIcn } from '../Icons/UiIcns'
import ExternalLinkIcn from '../resource/img/supportIcon/ExternalLinkIcn'
import bitsFetch from '../Utils/bitsFetch'
import { __ } from '../Utils/i18nwrap'

function SettingRow({ icon, name, desc, descId, tone = '', children, extra }) {
  return (
    <div className={`btcd-opt${tone ? ` btcd-opt--${tone}` : ''}`}>
      <div className="btcd-opt-main">
        <span className={`btcd-opt-icn${tone ? ` btcd-opt-icn--${tone}` : ''}`} aria-hidden="true">
          {icon}
        </span>
        <div className="btcd-opt-txt">
          <span className="btcd-opt-name">{name}</span>
          <p className="btcd-opt-desc" id={descId}>
            {desc}
          </p>
        </div>
        <div className="btcd-opt-ctl">{children}</div>
      </div>
      {extra}
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="btcd-pg-body" aria-hidden="true">
      {[0, 1, 2].map(group => (
        <section className="btcd-group" key={`sk-g-${group}`}>
          <div className="btcd-skel btcd-skel-title" />
          <div className="btcd-panel">
            <div className="btcd-opt">
              <div className="btcd-opt-main">
                <span className="btcd-skel btcd-skel-icn" />
                <div className="btcd-opt-txt">
                  <span className="btcd-skel btcd-skel-line" />
                  <span className="btcd-skel btcd-skel-line btcd-skel-line--sm" />
                </div>
                <span className="btcd-skel btcd-skel-tgl" />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

function Settings() {
  const [appConf, setAppConf] = useState({})
  const [showAnalyticsOptin, setShowAnalyticsOptin] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch analytics/check — route exists only when pro plugin active
    const fetchAnalytics = bitsFetch({}, 'analytics/check', '', 'GET').then(res => {
      if (res?.success) setShowAnalyticsOptin(res.data)
    })

    const fetchConfig = bitsFetch({}, 'get/config', null, 'GET').then(res => {
      if ('success' in res && res.success) {
        setAppConf(res.data)
      }
    })

    Promise.all([fetchAnalytics, fetchConfig])
      .catch(() => {
        toast.error(__('Could not load settings', 'bit-integrations'))
      })
      .finally(() => setIsLoading(false))
  }, [])

  const updatePluginConfig = name => {
    const config = { ...appConf }
    const loadSaving = bitsFetch({ data: config }, 'app/config')
      .then(res => {
        if ('success' in res && res.success) {
          return __('Save successfully done', 'bit-integrations')
        }
        delete config[name]
        setAppConf({ ...config })
        throw new Error('save-failed')
      })
      .catch(() => {
        throw new Error('save-failed')
      })

    toast.promise(loadSaving, {
      success: data => data,
      error: __('Failed to save', 'bit-integrations'),
      loading: __('Updating...', 'bit-integrations')
    })
  }

  const updateAnalytic = updatedOptin => {
    bitsFetch({ isChecked: updatedOptin }, 'analytics/optIn')
      .then(() => {
        toast.success(__('Opt-in status updated', 'bit-integrations'))
      })
      .catch(() => {
        toast.error(__('Failed to save', 'bit-integrations'))
      })
  }

  const debouncedUpdatePluginConfig = useAsyncDebounce(updatePluginConfig, 500)
  const debouncedUpdateAnalytic = useAsyncDebounce(updateAnalytic, 500)

  const checkboxHandle = ({ target: { name, checked } }) => {
    const config = { ...appConf }
    if (checked) {
      config[name] = true
    } else {
      delete config[name]
    }
    setAppConf(config)
    debouncedUpdatePluginConfig(name)
  }

  const inputHandle = ({ target: { name, value } }) => {
    const config = { ...appConf }
    if (value) {
      config[name] = value
    } else {
      delete config[name]
    }
    setAppConf(config)
    debouncedUpdatePluginConfig(name)
  }

  const analyticsHandle = () => {
    const updatedOptin = !showAnalyticsOptin
    setShowAnalyticsOptin(updatedOptin)
    debouncedUpdateAnalytic(updatedOptin)
  }

  const logDeleteOn = Boolean(appConf?.enable_log_del)

  return (
    <div className="btcd-pg" id="btcd-settings-page">
      <header className="btcd-pg-head">
        <h1 className="btcd-pg-title">{__('Settings', 'bit-integrations')}</h1>
        <p className="btcd-pg-sub">
          {__(
            'Control how Bit Integrations notifies you, how long it keeps logs, and what it leaves behind.',
            'bit-integrations'
          )}
        </p>
      </header>

      {isLoading ? (
        <SettingsSkeleton />
      ) : (
        <div className="btcd-pg-body">
          <section className="btcd-group">
            <h2 className="btcd-group-title">{__('Notifications', 'bit-integrations')}</h2>
            <div className="btcd-panel">
              <SettingRow
                icon={<MailIcn />}
                descId="opt-failure-email-desc"
                name={__('Email me when an integration fails', 'bit-integrations')}
                desc={__(
                  'Sends a notification to the site admin email every time an integration execution fails.',
                  'bit-integrations'
                )}>
                <SingleToggle2
                  action={checkboxHandle}
                  name="enable_failure_email"
                  checked={Boolean(appConf?.enable_failure_email)}
                  ariaLabel={__('Email me when an integration fails', 'bit-integrations')}
                  ariaDescribedby="opt-failure-email-desc"
                  className="flx"
                />
              </SettingRow>
            </div>
          </section>

          <section className="btcd-group">
            <h2 className="btcd-group-title">{__('Logs', 'bit-integrations')}</h2>
            <div className="btcd-panel">
              <SettingRow
                icon={<LogRetentionIcn />}
                descId="opt-log-del-desc"
                name={__('Automatically delete old logs', 'bit-integrations')}
                desc={__(
                  'Keeps the log table small by removing entries older than the retention period you set.',
                  'bit-integrations'
                )}
                extra={
                  <div className="btcd-opt-extra" data-open={logDeleteOn}>
                    <div className="btcd-opt-extra-inner">
                      <label className="btcd-opt-extra-row" htmlFor="btcd-log-retention-days">
                        <span className="btcd-opt-extra-lbl">
                          {__('Delete logs older than', 'bit-integrations')}
                        </span>
                        <input
                          id="btcd-log-retention-days"
                          onChange={inputHandle}
                          name="day"
                          value={appConf?.day ?? ''}
                          disabled={!logDeleteOn}
                          className="btcd-paper-inp btcd-opt-extra-inp"
                          placeholder="30"
                          type="number"
                          min="1"
                        />
                        <span className="btcd-opt-extra-lbl">{__('days', 'bit-integrations')}</span>
                      </label>
                    </div>
                  </div>
                }>
                <SingleToggle2
                  action={checkboxHandle}
                  name="enable_log_del"
                  checked={logDeleteOn}
                  ariaLabel={__('Automatically delete old logs', 'bit-integrations')}
                  ariaDescribedby="opt-log-del-desc"
                  className="flx"
                />
              </SettingRow>
            </div>
          </section>

          {showAnalyticsOptin !== null && (
            <section className="btcd-group">
              <h2 className="btcd-group-title">{__('Privacy', 'bit-integrations')}</h2>
              <div className="btcd-panel">
                <SettingRow
                  icon={<PrivacyIcn />}
                  descId="opt-telemetry-desc"
                  name={__('Share anonymous usage data', 'bit-integrations')}
                  desc={
                    <>
                      {__(
                        'Helps us decide what to build next. Turn this off and Bit Integrations collects no telemetry at all.',
                        'bit-integrations'
                      )}{' '}
                      <a
                        className="btcd-opt-lnk"
                        href="https://bitapps.pro/privacy-policy/"
                        target="_blank"
                        rel="noopener noreferrer">
                        {__('Read the privacy policy', 'bit-integrations')}
                        <ExternalLinkIcn size="12" />
                      </a>
                    </>
                  }>
                  <SingleToggle2
                    action={analyticsHandle}
                    name="analytics_optin"
                    checked={Boolean(showAnalyticsOptin)}
                    ariaLabel={__('Share anonymous usage data', 'bit-integrations')}
                    ariaDescribedby="opt-telemetry-desc"
                    className="flx"
                  />
                </SettingRow>
              </div>
            </section>
          )}

          <section className="btcd-group">
            <h2 className="btcd-group-title btcd-group-title--danger">
              {__('Danger zone', 'bit-integrations')}
            </h2>
            <div className="btcd-panel btcd-panel--danger">
              <SettingRow
                icon={<DangerIcn />}
                tone="danger"
                descId="opt-erase-db-desc"
                name={__('Erase all plugin data on deletion', 'bit-integrations')}
                desc={__(
                  'When you delete Bit Integrations, every flow, log and saved credential is permanently removed. This cannot be undone.',
                  'bit-integrations'
                )}>
                <SingleToggle2
                  action={checkboxHandle}
                  name="erase_db"
                  checked={Boolean(appConf?.erase_db)}
                  ariaLabel={__('Erase all plugin data on deletion', 'bit-integrations')}
                  ariaDescribedby="opt-erase-db-desc"
                  className="flx"
                />
              </SettingRow>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Settings

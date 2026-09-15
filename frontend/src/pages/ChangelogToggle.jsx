import { Fragment, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import Loader from '../components/Loaders/Loader'
import Modal from '../components/Utilities/Modal'
import { $appConfigState } from '../GlobalStates'
import ChangelogIcn from '../Icons/ChangeLogIcn'
import ExternalLinkIcn from '../Icons/ExternalLinkIcn'
import bitsFetch from '../Utils/bitsFetch'
import { __, sprintf } from '../Utils/i18nwrap'

const releaseDate = '6th September 2026'

// Example for items:
// items: [
//   {
//     label: 'Feature Name',
//     desc: 'Description of the feature.',
//     isPro: false
//   }
// ]
const changeLog = [
  {
    label: __('Note', 'bit-integrations'),
    headClass: 'new-note',
    itemClass: '',
    items: []
  },
  {
    label: __('New Triggers', 'bit-integrations'),
    headClass: 'new-trigger',
    itemClass: 'integration-list',
    items: []
  },
  {
    label: __('New Actions', 'bit-integrations'),
    headClass: 'new-integration',
    itemClass: 'integration-list',
    items: []
  },
  {
    label: __('New Features', 'bit-integrations'),
    headClass: 'new-feature',
    itemClass: 'feature-list',
    items: [
      {
        label: 'Choose who an action runs for',
        desc: 'pick the logged-in user, or map an email field from your trigger and the action runs for that user. Available in LearnDash, LifterLMS, Tutor LMS, MasterStudy LMS, Academy LMS, WP Courseware, MemberPress, Paid Memberships Pro, Restrict Content, GamiPress, AffiliateWP and SliceWP.',
        isPro: false
      },
      {
        label: 'Google Calendar',
        desc: 'Write your event description with headings, bold text, lists and links. A Preview tab shows how it will look before you save.',
        isPro: true
      }
    ]
  },
  {
    label: __('Improvements', 'bit-integrations'),
    headClass: 'new-improvement',
    itemClass: 'feature-list',
    items: [
      {
        label: 'Asana',
        desc: 'Your full list of projects, sections and custom fields now loads, not just the first batch.',
        isPro: false
      },
      {
        label: 'SendPulse',
        desc: 'All address books now load, and your selected list no longer resets when its fields fail to load.',
        isPro: false
      },
      {
        label: 'Salesforce',
        desc: 'The connection now uses a more secure sign-in flow (PKCE).',
        isPro: false
      },
      {
        label: 'Brevo',
        desc: 'If no email reaches the action, the log now tells you that instead of showing Brevo’s unclear error.',
        isPro: false
      },
      {
        label: 'Custom API',
        desc: 'New actions start on POST, and the edit screen now shows the request method you saved.',
        isPro: false
      },
      {
        label: 'Triggers',
        desc: 'Waiting for test data no longer floods your site with requests, and the button always stops spinning when you press Stop.',
        isPro: false
      }
    ]
  },
  {
    label: __('Bug Fixes', 'bit-integrations'),
    headClass: 'fixes',
    itemClass: 'fixes-list',
    items: [
      {
        label: 'LearnDash and LifterLMS',
        desc: 'The unenroll actions removed the wrong person – they always used the same fixed user instead of the one from your flow.',
        isPro: false
      },
      {
        label: 'Brevo',
        desc: 'Contacts failed to save when some mapped fields were empty. Emails with a "+" in them created a duplicate contact on every run.',
        isPro: false
      },
      {
        label: 'Notion',
        desc: 'Checkboxes always saved as ticked, a single-choice field sent to a multi-select property was dropped, and decimal numbers lost everything after the point.',
        isPro: false
      },
      {
        label: 'Systeme.io',
        desc: 'Failed runs were logged as successful.',
        isPro: false
      },
      {
        label: 'Asana',
        desc: 'Tasks were not created when some mapped fields were empty.',
        isPro: false
      },
      {
        label: 'Zoho Bigin',
        desc: 'Failed runs and Deals actions saved without a layout no longer produce warnings, and the layout dropdown is now sorted by name.',
        isPro: false
      },
      {
        label: 'ActiveCampaign',
        desc: 'Fixed reading your account details.',
        isPro: false
      },
      {
        label: 'Custom API',
        desc: 'Actions sent the request as a GET with an empty body if you never opened the method dropdown.',
        isPro: false
      },
      {
        label: 'KonnectzIT',
        desc: 'Opening a saved integration showed a spinner forever instead of its settings.',
        isPro: false
      },
      {
        label: 'MemberPress',
        desc: 'Long membership lists were cut short, so some memberships could not be picked and the trigger kept loading.',
        isPro: true
      },
      {
        label: 'Avada Forms',
        desc: 'Hidden, file upload and consent fields were missing from the trigger data.',
        isPro: true
      },
      {
        label: 'Popup Maker',
        desc: 'The trigger did not show the plugin as installed.',
        isPro: true
      }
    ]
  },
  {
    label: __('Security', 'bit-integrations'),
    headClass: 'fixes',
    itemClass: 'fixes-list',
    items: []
  },
  {
    label: __('Compatibility & Compliance', 'bit-integrations'),
    headClass: 'new-improvement',
    itemClass: 'feature-list',
    items: []
  }
]

export default function ChangelogToggle() {
  const [config, setConfig] = useRecoilState($appConfigState)
  const [show, setShow] = useState(config.changelogVersion !== config.version)
  const [showAnalyticsOptin, setShowAnalyticsOptin] = useState(null)
  const [loading, setLoading] = useState('')
  const [step, setStep] = useState(2)

  const setChangeLogVersion = val => {
    setShow(val)
    if (!val) {
      bitsFetch(
        {
          version: config.version
        },
        'changelog_version'
      ).then(() => {
        setConfig(prevConfig => ({ ...prevConfig, changelogVersion: prevConfig.version }))
      })
    }
  }

  const handleSubmit = () => {
    bitsFetch({ isChecked: true }, 'analytics/optIn')
    closeModal()
  }

  const closeModal = () => {
    setShow(false)
    setChangeLogVersion()
  }

  useEffect(() => {
    if (show) {
      setLoading(true)
      bitsFetch({}, 'analytics/check', '', 'GET').then(res => {
        if (res?.success) setShowAnalyticsOptin(res.data)
        setLoading(false)
      })
    }
  }, [show])

  return (
    <div className="changelog-toggle">
      <button
        title={__("What's New", 'bit-integrations')}
        type="button"
        className="changelog-btn"
        onClick={() => {
          setStep(2)
          setShow(true)
        }}>
        <ChangelogIcn size={25} />
      </button>
      <Modal
        md={step === 1}
        sm={step !== 1}
        show={show}
        setModal={closeModal}
        closeIcon={(showAnalyticsOptin || showAnalyticsOptin === null) && step === 2}
        style={{
          height: 'auto',
          width: '550px'
        }}>
        {
          // (step === 1 && show === true && (
          //   <>
          //     <div>
          //       <a href={dealURL} target="_blank" rel="noreferrer">
          //         <img
          //           src={NewYear}
          //           style={{ width: '100%', height: 'auto', marginTop: '-2px', borderRadius: '20px' }}
          //           alt=""
          //         />
          //       </a>
          //     </div>
          //     <div className="txt-right" style={{ marginTop: '-2px' }}>
          //       <button
          //         type="button"
          //         className="btn round btcd-btn-lg purple purple-sh"
          //         onClick={() => setStep(2)}>
          //         {__('Next', 'bit-integrations')}
          //       </button>
          //     </div>
          //   </>
          // )) ||
          step === 2 && (
            <div className="changelog content">
              <div className="flx flx-col flx-center whats-new">
                <h3>{sprintf(__("What's New in v%s", 'bit-integrations'), config.version)}?</h3>
                <small className="date">
                  {__('Updated at:', 'bit-integrations')} <b>{releaseDate}</b>
                </small>
              </div>
              <div
                className="changelog-content"
                style={showAnalyticsOptin !== false ? { maxHeight: '60vh' } : undefined}>
                {changeLog.map((log, index) => (
                  <Fragment key={index}>
                    {log.items.length > 0 && (
                      <>
                        <span className={log.headClass}>
                          <b>{log.label}</b>
                        </span>

                        <div className={log.itemClass}>
                          <ul>
                            {log.items.map((item, index) => (
                              <li key={index}>
                                {item?.label && <b>{item.label}</b>}
                                {item?.label && item?.desc && <b>:&nbsp;</b>}
                                {item?.desc && <span>{item.desc}</span>}
                                &nbsp;
                                {item?.isPro && <small className="pro-btn">Pro</small>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </Fragment>
                ))}
                <div>
                  <span className="footer">{__('For more details,')}</span>
                  <a
                    href="https://bit-integrations.com/wp-docs/free-changelogs/"
                    target="_blank"
                    rel="noreferrer">
                    {__('Click here')}&nbsp;
                    <ExternalLinkIcn size="14" />
                  </a>
                </div>
              </div>
              {loading ? (
                <div className="flx flx-center" style={{ height: '150px' }}>
                  <Loader
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 45,
                      transform: 'scale(0.5)'
                    }}
                  />
                </div>
              ) : (
                showAnalyticsOptin === false && (
                  <div>
                    <div className="btcd-hr mt-2"></div>
                    <div className="flx flx-col flx-center">
                      <h4 className="mt-2 mb-0">
                        {__('Opt-In For Plugin Improvement', 'bit-integrations')}
                      </h4>
                    </div>
                    <div className="m-2 txt-sm">
                      {__(
                        'Accept and continue to share usage data to help us improve the plugin, the plugin will still function if you skip.',
                        'bit-integrations'
                      )}
                      <br />
                      <a
                        className="app-link-active"
                        target="blank"
                        href="https://bitapps.pro/terms-of-service/">
                        {__('Terms and conditions', 'bit-integrations')}&nbsp;
                        <ExternalLinkIcn size="14" />
                      </a>
                    </div>
                    <div className="flx flx-between">
                      <button
                        type="button"
                        className="btn round btn-md gray gray-sh"
                        onClick={() => closeModal()}>
                        Skip
                      </button>
                      <button
                        type="button"
                        className="btn round btcd-btn-lg purple purple-sh"
                        onClick={() => handleSubmit()}>
                        {__('Accept and continue', 'bit-integrations')}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )
        }
      </Modal>
    </div>
  )
}

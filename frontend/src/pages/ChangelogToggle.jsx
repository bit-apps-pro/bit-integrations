import { Fragment, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import Loader from '../components/Loaders/Loader'
import Modal from '../components/Utilities/Modal'
import { $appConfigState } from '../GlobalStates'
import ChangelogIcn from '../Icons/ChangeLogIcn'
import ExternalLinkIcn from '../Icons/ExternalLinkIcn'
import bitsFetch from '../Utils/bitsFetch'
import { __, sprintf } from '../Utils/i18nwrap'

const releaseDate = '9th November 2026'

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
    items: [
      {
        label: 'WP Activity Log',
        desc: '45 new events added.',
        isPro: true
      },
      {
        label: 'The Events Calendar',
        desc: '17 new events added.',
        isPro: true
      },
      {
        label: 'Bit Connect',
        desc: '15 new events added.',
        isPro: false
      },
      {
        label: 'NiroHelp',
        desc: '13 new events added.',
        isPro: true
      },
      {
        label: 'WP Hotel Booking',
        desc: '12 new events added.',
        isPro: true
      },
      {
        label: 'Booknetic',
        desc: '10 new events added.',
        isPro: true
      },
      {
        label: 'Five Star Restaurant Reservations',
        desc: '9 new events added.',
        isPro: true
      },
      {
        label: 'Paid Memberships Pro',
        desc: '2 new events added.',
        isPro: true
      }
    ]
  },
  {
    label: __('New Actions', 'bit-integrations'),
    headClass: 'new-integration',
    itemClass: 'integration-list',
    items: [
      {
        label: 'Follow Up Boss',
        desc: '62 new events added.',
        isPro: true
      },
      {
        label: 'Booknetic',
        desc: '40 new events added.',
        isPro: true
      },
      {
        label: 'WP Hotel Booking',
        desc: '24 new events added.',
        isPro: true
      },
      {
        label: 'NiroHelp',
        desc: '19 new events added.',
        isPro: true
      },
      {
        label: 'WP Activity Log',
        desc: '19 new events added.',
        isPro: true
      },
      {
        label: 'The Events Calendar',
        desc: '15 new events added.',
        isPro: true
      },
      {
        label: 'Five Star Restaurant Reservations',
        desc: '11 new events added.',
        isPro: true
      },
      {
        label: 'Microsoft Excel',
        desc: '7 new events added.',
        isPro: true
      },
      {
        label: 'Bit Connect',
        desc: '7 new events added.',
        isPro: false
      },
      {
        label: 'Paid Memberships Pro',
        desc: '2 new events added.',
        isPro: true
      }
    ]
  },
  {
    label: __('New Features', 'bit-integrations'),
    headClass: 'new-feature',
    itemClass: 'feature-list',
    items: [
      {
        label: 'Klaviyo',
        desc: 'New "Email Marketing Consent" option subscribes the profile to email marketing, so it can receive your campaigns.',
        isPro: false
      },
      {
        label: 'The Events Calendar',
        desc: 'Custom fields can now be mapped when you create or update an event.',
        isPro: false
      },
      {
        label: 'Connections',
        desc: 'Integrations created before version 2.10.0 can now switch to a saved connection from the connection dropdown.',
        isPro: false
      }
    ]
  },
  {
    label: __('Improvements', 'bit-integrations'),
    headClass: 'new-improvement',
    itemClass: 'feature-list',
    items: []
  },
  {
    label: __('Bug Fixes', 'bit-integrations'),
    headClass: 'fixes',
    itemClass: 'fixes-list',
    items: [
      {
        label: 'Bit Form',
        desc: 'A flow could send its data to this site instead of the site saved in the selected connection.',
        isPro: false
      },
      {
        label: 'Connections',
        desc: 'Some older integrations, such as SendinBlue, ConvertKit and Kirim Email, could not find their saved connections. Kirim Email failed with "Authorization class not found".',
        isPro: false
      },
      {
        label: 'Freshdesk',
        desc: 'Emails with special characters, such as "+", could not find an existing contact, and the ticket was not linked to the contact.',
        isPro: false
      },
      {
        label: 'Bit Social',
        desc: 'Editing a Bit Social flow opened the wrong edit screen.',
        isPro: false
      },
      {
        label: 'Documentation',
        desc: 'Removed broken documentation links from some triggers and actions.',
        isPro: false
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
  const [telemetry, setTelemetry] = useState(null)
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

  const askConsent = Boolean(telemetry?.canManage && !telemetry.allowed && !telemetry.decided)

  const handleSubmit = () => {
    bitsFetch({ allow: true, source: 'changelog' }, 'telemetry/consent')
    closeModal()
  }

  const handleSkip = () => {
    bitsFetch({ allow: false }, 'telemetry/consent')
    closeModal()
  }

  const closeModal = () => {
    setShow(false)
    setChangeLogVersion()
  }

  useEffect(() => {
    if (show) {
      setLoading(true)
      bitsFetch({}, 'telemetry/status', '', 'GET').then(res => {
        if (res?.success) setTelemetry(res.data)
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
        closeIcon={!askConsent && step === 2}
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
              <div className="changelog-content" style={!askConsent ? { maxHeight: '60vh' } : undefined}>
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
                askConsent && (
                  <div>
                    <div className="btcd-hr mt-2"></div>
                    <div className="flx flx-col flx-center">
                      <h4 className="mt-2 mb-0">
                        {__('Opt-In For Plugin Improvement', 'bit-integrations')}
                      </h4>
                    </div>
                    <div className="m-2 txt-sm">
                      {__(
                        'Accept and continue to send your site details, admin email and usage data to Bit Apps once a week, to help us improve the plugin. The plugin will still function if you skip.',
                        'bit-integrations'
                      )}
                      <br />
                      <a
                        className="app-link-active"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://bitapps.pro/terms-of-service/">
                        {__('Terms and conditions', 'bit-integrations')}&nbsp;
                        <ExternalLinkIcn size="14" />
                      </a>
                      &nbsp;&nbsp;
                      <a
                        className="app-link-active"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://bitapps.pro/privacy-policy/">
                        {__('Privacy Policy', 'bit-integrations')}&nbsp;
                        <ExternalLinkIcn size="14" />
                      </a>
                    </div>
                    <div className="flx flx-between">
                      <button
                        type="button"
                        className="btn round btn-md gray gray-sh"
                        onClick={() => handleSkip()}>
                        {__('Skip', 'bit-integrations')}
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

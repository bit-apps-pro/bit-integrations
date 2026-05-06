import { Fragment, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import Loader from '../components/Loaders/Loader'
import Modal from '../components/Utilities/Modal'
import { $appConfigState } from '../GlobalStates'
import ChangelogIcn from '../Icons/ChangeLogIcn'
import ExternalLinkIcn from '../Icons/ExternalLinkIcn'
import NewYear from '../resource/img/NewYear.png'
import bitsFetch from '../Utils/bitsFetch'
import { __, sprintf } from '../Utils/i18nwrap'

const releaseDate = '15th April 2026'

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
        label: 'WP ERP',
        desc: '28 new events added.',
        isPro: true
      },
      {
        label: 'PeepSo',
        desc: '3 new events added.',
        isPro: true
      },
      {
        label: 'Fluent PDF Generator',
        desc: '2 new event added.',
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
        label: 'Monday.com',
        desc: '12 new events added.',
        isPro: true
      },
      {
        label: 'WP ERP',
        desc: '14 new events added.',
        isPro: true
      },
      {
        label: 'PeepSo',
        desc: '7 new events added.',
        isPro: true
      }
    ]
  },
  {
    label: __('New Features', 'bit-integrations'),
    headClass: 'new-feature',
    itemClass: 'feature-list',
    items: []
  },
  {
    label: __('Improvements', 'bit-integrations'),
    headClass: 'new-improvement',
    itemClass: 'feature-list',
    items: [
      {
        label: 'MailerLite',
        desc: 'Added unassign subscriber from group support and improved subscriber existence checks.',
        isPro: false
      },
      {
        label: 'WooCommerce',
        desc: 'Added line item subtotal and tax support for order creation.',
        isPro: false
      },
      {
        label: 'Email Notification',
        desc: 'Enhanced integration failure notification template and message clarity.',
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
        label: 'MailerLite',
        desc: 'Fixed blank page issue.',
        isPro: false
      },
      {
        label: 'FluentCRM',
        desc: 'Fixed logo handling and added missing assets.',
        isPro: false
      },
      {
        label: 'Custom Trigger',
        desc: 'Fixed save configuration handling in trigger/action config endpoints.',
        isPro: false
      },
      {
        label: 'WP User Registration',
        desc: 'Improved error handling and password generation reliability.',
        isPro: false
      },
      {
        label: 'SendFox',
        desc: 'Removed unused frontend imports and fixed field mapping behavior.',
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
              <div className="changelog-content" style={showAnalyticsOptin !== false ? { maxHeight: '60vh' } : undefined}>
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

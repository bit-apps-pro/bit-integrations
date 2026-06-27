import { useState } from 'react'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import TutorialLink from '../../Utilities/TutorialLink'

export default function NinjaTablesAuthorization({
  formID,
  ninjaTablesConf,
  setNinjaTablesConf,
  step,
  nextPage,
  isLoading,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showAuthMsg, setShowAuthMsg] = useState(false)

  const handleAuthorize = () => {
    setIsLoading('auth')
    const requestParams = { formID }
    bitsFetch(requestParams, 'ninja_tables_authorize').then(result => {
      if (result?.success) {
        setIsAuthorized(true)
        setSnackbar({
          show: true,
          msg: __('Connected with Ninja Tables successfully', 'bit-integrations')
        })
        setIsLoading(false)
      } else {
        setShowAuthMsg(true)
        setSnackbar({
          show: true,
          msg: __(
            result?.data
              ? result.data
              : 'Connection failed. Please make sure Ninja Tables is installed and activated',
            'bit-integrations'
          )
        })
        setIsLoading(false)
      }
    })
  }

  return (
    <>
      <TutorialLink
        title={__('NinjaTables', 'bit-integrations')}
        docLink={tutorialLinks.ninjaTables?.docLink}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...{ width: step === 1 && 900 },
          ...{ height: step === 1 && 'auto' }
        }}>
        <div className="mt-3">
          <b>{__('Integration Name:', 'bit-integrations')}</b>
        </div>
        <input
          className="btcd-paper-inp w-6 mt-1"
          onChange={e => {
            const newConf = { ...ninjaTablesConf }
            newConf.name = e.target.value
            setNinjaTablesConf(newConf)
          }}
          name="name"
          value={ninjaTablesConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />

        <button
          onClick={handleAuthorize}
          className="btn btcd-btn-lg purple sh-sm flx"
          type="button"
          disabled={isAuthorized}>
          {isAuthorized
            ? __('Connected ✔', 'bit-integrations')
            : __('Connect to Ninja Tables', 'bit-integrations')}
          {isLoading === 'auth' && <LoaderSm size={20} clr="#022217" className="ml-2" />}
        </button>
        <br />
        {showAuthMsg && (
          <div className="flx" style={{ width: '450px', marginTop: '10px' }}>
            <span className="txt-orange" style={{ fontSize: '14px' }}>
              <strong>{__('Reminder:', 'bit-integrations')}</strong>{' '}
              {__(
                'Please make sure Ninja Tables plugin is installed and activated.',
                'bit-integrations'
              )}
            </span>
          </div>
        )}

        {!isInfo && (
          <div>
            <br />
            <button
              onClick={() => nextPage(2)}
              className="btn f-right btcd-btn-lg purple sh-sm flx"
              type="button"
              disabled={!isAuthorized}>
              {__('Next', 'bit-integrations')}
              <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

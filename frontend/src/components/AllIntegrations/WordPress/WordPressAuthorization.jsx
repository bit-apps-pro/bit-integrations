import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import TutorialLink from '../../Utilities/TutorialLink'

export default function WordPressAuthorization({
  wordPressConf,
  setWordPressConf,
  step,
  nextPage,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)

  const authorizeHandler = () => {
    setIsLoading('auth')
    bitsFetch({}, 'wordpress_authorize').then(result => {
      if (result?.success) {
        setIsAuthorized(true)
        setSnackbar({ show: true, msg: __('WordPress connected', 'bit-integrations') })
      } else {
        setSnackbar({ show: true, msg: result?.data || __('Authorization failed', 'bit-integrations') })
      }
      setIsLoading(false)
    })
  }

  const handleInput = e => {
    const newConf = { ...wordPressConf }
    newConf[e.target.name] = e.target.value
    setWordPressConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ width: step === 1 && 900, height: step === 1 && 'auto' }}>
      <TutorialLink linkKey="wordPress" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={wordPressConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
      />

      <button
        onClick={authorizeHandler}
        className="btn btcd-btn-lg purple sh-sm flx"
        type="button"
        disabled={isAuthorized || isLoading === 'auth'}>
        {isAuthorized ? __('Connected', 'bit-integrations') : __('Connect to WordPress', 'bit-integrations')}
        {isLoading === 'auth' && <LoaderSm size={20} clr="#022217" className="ml-2" />}
      </button>

      <br />
      <button
        onClick={() => nextPage(2)}
        className="btn f-right btcd-btn-lg purple sh-sm flx"
        type="button"
        disabled={!isAuthorized}>
        {__('Next', 'bit-integrations')}
        <BackIcn className="ml-1 rev-icn" />
      </button>
    </div>
  )
}

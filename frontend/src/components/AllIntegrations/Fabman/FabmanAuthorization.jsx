/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useCallback, useState } from 'react'
import { __, sprintf } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { fabmanAuthentication, fetchFabmanAccountId, fetchFabmanWorkspaces } from './FabmanCommonFunc'
import Note from '../../Utilities/Note'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import TutorialLink from '../../Utilities/TutorialLink'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import Authorization from '../../Connections/Authorization'

const STEP_ONE_STYLE = { width: 900, height: 'auto' }

export default function FabmanAuthorization({
  fabmanConf,
  setFabmanConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', apiKey: '' })

  const handleConnectionSelected = useCallback(
    async connectionId => {
      await fetchFabmanAccountId(connectionId, setFabmanConf)
    },
    [setFabmanConf]
  )

  const nextPage = () => {
    fetchFabmanWorkspaces(fabmanConf, setFabmanConf, loading, setLoading, 'fetch')
    setTimeout(() => {
      const settingsWrp = document.getElementById('btcd-settings-wrp')
      if (settingsWrp) {
        settingsWrp.scrollTop = 0
      }
    }, 300)
    setStep(2)
  }

  const handleInput = e => {
    const { name, value } = e.target
    setFabmanConf(prev => ({ ...prev, [name]: value }))
    setError(prev => ({ ...prev, [name]: '' }))
  }

  return (
    <Authorization
      config={fabmanConf}
      setConfig={setFabmanConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Fabman"
      tutorialLinks={tutorialLinks?.fabman || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://fabman.io/api/v1/accounts',
        method: 'GET',
      }}
      noteDetails={{
        note: fabmanApiKeyNote,
      }}
      onConnectionSelected={handleConnectionSelected}
    />
  )
}

const fabmanApiKeyNote = `<h2>${__('To get your Fabman API key:', 'bit-integrations')}</h2>
     <ul>
         <li>${sprintf(
  __('Log in to your %s.', 'bit-integrations'),
  '<a href="https://fabman.io/" target="_blank">Fabman account</a>'
)}</li>
         <li>${__('Go to "Configure" → "Integrations (API & Webhooks)".', 'bit-integrations')}</li>
         <li>${__('Click "Create API key", add a title, and choose a member.', 'bit-integrations')}</li>
         <li>${__('Save, then click "Reveal" to copy your API key.', 'bit-integrations')}</li>
     </ul>`

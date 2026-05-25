/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllServers } from './DiscordCommonFunc'

export default function DiscordAuthorization({
  discordConf,
  setDiscordConf,
  step,
  setstep,
  setIsLoading,
  isInfo
}) {
  const loadServers = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...discordConf, connection_id: connectionId }
        : discordConf

      await getAllServers(nextConf, setDiscordConf, setIsLoading)
    },
    [discordConf, setDiscordConf, setIsLoading]
  )

  const handleConnectionSelected = useCallback(
    async connectionId => {
      await loadServers(connectionId)
    },
    [loadServers]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !discordConf?.default) {
        loadServers()
      }

      setstep(value)
    },
    [discordConf, loadServers, setstep]
  )

  const discordInstructions = `<h4>${__('Get Access Token few step', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First create app.', 'bit-integrations')}</li>
                <li>${__('Click on OAuth2.', 'bit-integrations')}</li>
                <li>${__('Select <b>bot</b> from scopes.', 'bit-integrations')}</li>
                <li>${__('Select permissions from <b>Bot Permissions</b>.', 'bit-integrations')}</li>
                <li>${__(
                  'Then copy the <b>generated url</b> and paste it in the browser and hit enter.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Then click on <b>Bot</b> from left navbar and copy the <b>Access token</b>.',
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <Authorization
      config={discordConf}
      setConfig={setDiscordConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Discord"
      tutorialLinks={tutorialLinks?.discord || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://discord.com/api/v10/users/@me',
        key: 'X-BI-Token',
        addTo: 'header',
        headers: {
          Authorization: 'Bot {api_key}'
        },
        method: 'GET'
      }}
      noteDetails={{ note: discordInstructions }}
      onConnectionSelected={handleConnectionSelected}
    />
  )
}

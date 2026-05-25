/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchChannels } from './SlackCommonFunc'

export default function SlackAuthorization({
  slackConf,
  setSlackConf,
  step,
  setstep,
  setIsLoading,
  isInfo
}) {
  const loadChannels = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...slackConf, connection_id: connectionId }
        : slackConf

      await fetchChannels(nextConf, setSlackConf, setIsLoading)
    },
    [slackConf, setSlackConf, setIsLoading]
  )

  const handleConnectionSelected = useCallback(
    async connectionId => {
      await loadChannels(connectionId)
    },
    [loadChannels]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !slackConf?.default) {
        loadChannels()
      }

      setstep(value)
    },
    [slackConf, loadChannels, setstep]
  )

  const slackInstructions = `<h4>${__('Get Access Token few step', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First create app.', 'bit-integrations')}</li>
                <li>${__(
                  "Add an OAuth Scope <b>'channels:read, channels:write, chat:write, files:read, files:write'</b>.",
                  'bit-integrations'
                )}</li>
                <li>${__(
                  "Generate Access Token clicking <b> 'install to Workspace'</b>.",
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <Authorization
      config={slackConf}
      setConfig={setSlackConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Slack"
      tutorialLinks={tutorialLinks?.slack || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://slack.com/api/conversations.list',
        method: 'POST',
        ssl_verify: false
      }}
      noteDetails={{ note: slackInstructions }}
      onConnectionSelected={handleConnectionSelected}
    />
  )
}

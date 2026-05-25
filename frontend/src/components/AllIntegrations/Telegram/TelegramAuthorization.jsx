import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { refreshGetUpdates } from './TelegramCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function TelegramAuthorization({
  telegramConf,
  setTelegramConf,
  step,
  setstep,
  setSnackbar,
  isInfo
}) {
  const loadUpdates = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...telegramConf, connection_id: connectionId }
        : telegramConf

      refreshGetUpdates(nextConf, setTelegramConf, () => {}, setSnackbar)
    },
    [setSnackbar, setTelegramConf, telegramConf]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !telegramConf?.default?.telegramChatLists) {
        loadUpdates()
      }
      setstep(value)
    },
    [loadUpdates, setstep, telegramConf]
  )

  const note = `
      <small class="d-blk mt-3">
        ${__('Create a Telegram bot with BotFather and copy the bot token.', 'bit-integrations')}
      </small>`

  return (
    <Authorization
      config={telegramConf}
      setConfig={setTelegramConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Telegram"
      tutorialLinks={tutorialLinks?.telegram || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.telegram.org/bot{api_key}/getMe',
        method: 'GET'
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadUpdates}
    />
  )
}

import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllList, getAllTags } from './MailMintCommonFunc'

export default function MailMintAuthorization({
  mailMintConf,
  setMailMintConf,
  step,
  setStep,
  isInfo,
  setIsLoading,
  setSnackbar
}) {
  const handleSetStep = useCallback(value => {
    if (value === 2) {
      getAllList(mailMintConf, setMailMintConf, setIsLoading, setSnackbar)
      getAllTags(mailMintConf, setMailMintConf, setIsLoading, setSnackbar)
    }
    setStep(value)
  }, [setStep, mailMintConf, setMailMintConf, setIsLoading, setSnackbar])

  return (
    <Authorization
      config={mailMintConf}
      setConfig={setMailMintConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Mail Mint"
      tutorialLinks={tutorialLinks?.mailMint || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'MailMint' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Mail Mint integration, make sure the Mail Mint plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}

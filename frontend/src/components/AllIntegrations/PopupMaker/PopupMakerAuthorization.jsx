import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function PopupMakerAuthorization({
  popupMakerConf,
  setPopupMakerConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={popupMakerConf}
      setConfig={setPopupMakerConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Popup Maker"
      tutorialLinks={tutorialLinks?.popupMaker || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'POPMAKE_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Popup Maker integration, make sure the Popup Maker plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}

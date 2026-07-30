import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function PropovoiceCrmAuthorization({
  propovoiceCrmConf,
  setPropovoiceCrmConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={propovoiceCrmConf}
      setConfig={setPropovoiceCrmConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Propovoice CRM"
      tutorialLinks={tutorialLinks?.propovoiceCrm || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'Ndpv' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Propovoice CRM integration, make sure the Propovoice CRM plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}

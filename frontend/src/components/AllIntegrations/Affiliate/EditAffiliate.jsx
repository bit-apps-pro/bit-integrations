/* eslint-disable no-param-reassign */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import EditFormInteg from '../EditFormInteg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import EditWebhookInteg from '../EditWebhookInteg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'
import AffiliateIntegLayout from './AffiliateIntegLayout'
import { checkMappedFields, handleInput } from './AffiliateCommonFunc'

function EditAffiliate({ allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [affiliateConf, setAffiliateConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, affiliateConf, setAffiliateConf)}
          name="name"
          value={affiliateConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <AffiliateIntegLayout
        formID={formID}
        formFields={formFields}
        handleInput={e => handleInput(e, affiliateConf, setAffiliateConf, setIsLoading, setSnackbar)}
        affiliateConf={affiliateConf}
        setAffiliateConf={setAffiliateConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            allIntegURL,
            conf: affiliateConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={
          !checkMappedFields(affiliateConf) ||
          !affiliateConf.statusId ||
          !affiliateConf.referralId ||
          isLoading ||
          isUserSourceIncomplete(affiliateConf)
        }
        isLoading={isLoading}
        dataConf={affiliateConf}
        setDataConf={setAffiliateConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditAffiliate

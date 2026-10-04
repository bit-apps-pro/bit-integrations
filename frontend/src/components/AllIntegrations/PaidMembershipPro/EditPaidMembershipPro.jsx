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
import { handleInput } from './PaidMembershipProCommonFunc'
import PaidMembershipProIntegLayout from './PaidMembershipProIntegLayout'

function EditPaidMembershipPro({ allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [paidMembershipProConf, setPaidMembershipProConf] = useRecoilState($actionConf)
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
          onChange={e => handleInput(e, paidMembershipProConf, setPaidMembershipProConf)}
          name="name"
          value={paidMembershipProConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <PaidMembershipProIntegLayout
        formID={formID}
        formFields={formFields}
        handleInput={e =>
          handleInput(e, paidMembershipProConf, setPaidMembershipProConf, setIsLoading, setSnackbar)
        }
        paidMembershipProConf={paidMembershipProConf}
        setPaidMembershipProConf={setPaidMembershipProConf}
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
            conf: paidMembershipProConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={
          !paidMembershipProConf.mainAction ||
          isLoading ||
          paidMembershipProConf.selectedMembership === undefined ||
          isUserSourceIncomplete(paidMembershipProConf)
        }
        isLoading={isLoading}
        dataConf={paidMembershipProConf}
        setDataConf={setPaidMembershipProConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditPaidMembershipPro

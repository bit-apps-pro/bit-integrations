/* eslint-disable no-unused-expressions */
import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ZohoDeskAuthorization from './ZohoDeskAuthorization'
import { checkMappedFields, handleInput, refreshOrganizations } from './ZohoDeskCommonFunc'
import ZohoDeskIntegLayout from './ZohoDeskIntegLayout'

function ZohoDesk({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [deskConf, setDeskConf] = useState({
    name: 'Zoho Desk',
    type: 'Zoho Desk',
    clientId: '',
    clientSecret: '',
    orgId: '',
    department: '',
    field_map: [{ formField: '', zohoFormField: '' }],
    actions: {}
  })
  const nextPage = val => {
    if (val === 3) {
      if (!checkMappedFields(deskConf)) {
        setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
        return
      }

      if (!deskConf.actions?.ticket_owner) {
        setSnackbar({ show: true, msg: __('Please select a ticket owner', 'bit-integrations') })
        return
      }

      if (deskConf.department !== '' && deskConf.table !== '' && deskConf.field_map.length > 0) {
        setstep(val)
      }
    } else {
      setstep(val)
      if (val === 2 && !deskConf.department) {
        refreshOrganizations(formID, deskConf, setDeskConf, setIsLoading, setSnackbar)
      }
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <ZohoDeskAuthorization
        formID={formID}
        deskConf={deskConf}
        setDeskConf={setDeskConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <ZohoDeskIntegLayout
          formID={formID}
          formFields={formFields}
          handleInput={e => handleInput(e, deskConf, setDeskConf, formID, setIsLoading, setSnackbar)}
          deskConf={deskConf}
          setDeskConf={setDeskConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={deskConf.department === '' || deskConf.table === '' || deskConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: deskConf,
            setIsLoading,
            setSnackbar
          })
        }
      />
    </div>
  )
}

export default ZohoDesk

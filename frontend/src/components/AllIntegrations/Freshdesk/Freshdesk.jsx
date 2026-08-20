/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, checkMappedFieldsContact, handleInput } from './FreshdeskCommonFunc'
import BackIcn from '../../../Icons/BackIcn'
import FreshdeskAuthorization from './FreshdeskAuthorization'
import FreshdeskIntegLayout from './FreshdeskIntegLayout'

function Freshdesk({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [freshdeskConf, setFreshdeskConf] = useState({
    name: 'Freshdesk',
    type: 'Freshdesk',
    app_domain: '',
    api_key: '',
    field_map: [{ formField: '', freshdeskFormField: '' }],
    field_map_contact: [{ formField: '', contactFreshdeskFormField: '' }],
    freshdesk_id: '',
    ticketFields: [],
    contactFields: [],
    contactShow: '',
    status: '',
    priority: '',
    updateContact: '',
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (freshdeskConf.name !== '') {
        setstep(val)
      }
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <FreshdeskAuthorization
        formID={formID}
        freshdeskConf={freshdeskConf}
        setFreshdeskConf={setFreshdeskConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && {
            width: 900,
            height: 'auto',
            overflow: 'visible'
          })
        }}>
        <FreshdeskIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, freshdeskConf, setFreshdeskConf, setIsLoading, setSnackbar)}
          freshdeskConf={freshdeskConf}
          setFreshdeskConf={setFreshdeskConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        {checkMappedFields(freshdeskConf?.field_map_contact)}
        <button
          onClick={() => nextPage(3)}
          disabled={
            !freshdeskConf.priority ||
            !freshdeskConf.status ||
            !checkMappedFields(freshdeskConf?.field_map) ||
            (freshdeskConf.contactShow && !checkMappedFieldsContact(freshdeskConf?.field_map_contact))
          }
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: freshdeskConf,
            navigate,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={freshdeskConf}
        setDataConf={setFreshdeskConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Freshdesk

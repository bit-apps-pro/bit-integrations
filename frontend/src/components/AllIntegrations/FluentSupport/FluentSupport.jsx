import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import FluentSupportAuthorization from './FluentSupportAuthorization'
import { handleInput, checkMappedFields } from './FluentSupportCommonFunc'
import FluentSupportIntegLayout from './FluentSupportIntegLayout'

function FluentSupport({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const basicFields = [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'content', label: __('Content', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'note', label: __('Note', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ]
  const [fluentSupportConf, setFluentSupportConf] = useState({
    name: 'Fluent Support',
    type: 'Fluent Support',
    field_map: [{ formField: '', fluentSupportFormField: '' }],
    basicFields,
    fluentSupportFields: [],
    address_field: [],
    actions: {}
  })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (!checkMappedFields(fluentSupportConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (!fluentSupportConf.actions.support_staff) {
      setSnackbar({ show: true, msg: __('Support Staff is required!', 'bit-integrations') })
      return
    }
    if (fluentSupportConf.listId !== '') {
      setstep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <FluentSupportAuthorization
        formID={formID}
        fluentSupportConf={fluentSupportConf}
        setFluentSupportConf={setFluentSupportConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <FluentSupportIntegLayout
          formID={formID}
          formFields={formFields}
          handleInput={e =>
            handleInput(e, fluentSupportConf, setFluentSupportConf, formID, setIsLoading, setSnackbar)
          }
          fluentSupportConf={fluentSupportConf}
          setFluentSupportConf={setFluentSupportConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={
            isLoading || fluentSupportConf.field_map.length < 1 || !checkMappedFields(fluentSupportConf)
          }
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: fluentSupportConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={fluentSupportConf}
        setDataConf={setFluentSupportConf}
        formFields={formFields}
      />
    </div>
  )
}

export default FluentSupport

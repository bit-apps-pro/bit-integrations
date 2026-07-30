/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import AirtableAuthorization from './AirtableAuthorization'
import { checkMappedFields, handleInput } from './AirtableCommonFunc'
import AirtableIntegLayout from './AirtableIntegLayout'

function Airtable({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    customFields: false,
    bases: false,
    tables: false,
    airtableFields: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [airtableConf, setAirtableConf] = useState({
    name: 'Airtable',
    type: 'Airtable',
    auth_token: '',
    field_map: [{ formField: '', airtableFormField: '' }],
    airtableFields: [],
    bases: [],
    selectedBase: '',
    selectedTable: '',
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      airtableConf,
      navigate,
      '',
      '',
      setIsLoading
    )
    resp.then(res => {
      if (res.success) {
        toast.success(res.data?.msg)
        navigate(allIntegURL)
      } else {
        toast.error(res.data || res)
      }
    })
  }

  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(airtableConf)) {
      toast.error(__('Please map mandatory airtableFields', 'bit-integrations'))
      return
    }
    airtableConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <AirtableAuthorization
        airtableConf={airtableConf}
        setAirtableConf={setAirtableConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <AirtableIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, airtableConf, setAirtableConf, setLoading, setSnackbar)}
          airtableConf={airtableConf}
          setAirtableConf={setAirtableConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {loading.airtableFields && airtableConf.selectedTable && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(airtableConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {loading.airtableFields && airtableConf.selectedTable && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={airtableConf}
          setDataConf={setAirtableConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Airtable

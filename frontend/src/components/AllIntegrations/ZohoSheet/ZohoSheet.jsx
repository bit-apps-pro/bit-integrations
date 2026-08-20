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
import ZohoSheetAuthorization from './ZohoSheetAuthorization'
import { checkMappedFields } from './ZohoSheetCommonFunc'
import ZohoSheetIntegLayout from './ZohoSheetIntegLayout'

function ZohoSheet({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    header: false,
    workbooks: false,
    worksheets: false,
    workSheetHeaders: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [zohoSheetConf, setZohoSheetConf] = useState({
    name: 'Zoho Sheet',
    type: 'Zoho Sheet',
    dataCenter: '',
    clientId: '',
    clientSecret: '',
    field_map: [{ formField: '', zohoSheetFormField: '' }],
    workbooks: [],
    worksheets: [],
    workSheetHeaders: [],
    selectedWorkbook: '',
    selectedWorksheet: '',
    headerRow: 1,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      zohoSheetConf,
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

    if (!checkMappedFields(zohoSheetConf)) {
      toast.error(__('Please map mandatory workSheetHeaders', 'bit-integrations'))
      return
    }
    zohoSheetConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <ZohoSheetAuthorization
        zohoSheetConf={zohoSheetConf}
        setZohoSheetConf={setZohoSheetConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <ZohoSheetIntegLayout
          formFields={formFields}
          zohoSheetConf={zohoSheetConf}
          setZohoSheetConf={setZohoSheetConf}
          loading={loading}
          setLoading={setLoading}
        />

        {loading.workSheetHeaders && zohoSheetConf.selectedWorksheet && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(zohoSheetConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {loading.workSheetHeaders && zohoSheetConf.selectedWorksheet && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={zohoSheetConf}
          setDataConf={setZohoSheetConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default ZohoSheet

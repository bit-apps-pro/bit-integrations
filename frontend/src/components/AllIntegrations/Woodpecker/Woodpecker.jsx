/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import toast from 'react-hot-toast'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WoodpeckerAuthorization from './WoodpeckerAuthorization'
import { checkMappedFields, handleInput } from './WoodpeckerCommonFunc'
import WoodpeckerIntegLayout from './WoodpeckerIntegLayout'

function Woodpecker({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const prospectsFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'company', label: __('Company', 'bit-integrations'), required: false },
    { key: 'industry', label: __('Industry', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'linkedin_url', label: __('Linkedin URL', 'bit-integrations'), required: false },
    { key: 'tags', label: __('Tags', 'bit-integrations'), required: false },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'address', label: __('Address', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'snipet1', label: __('snipet1', 'bit-integrations'), required: false },
    { key: 'snipet2', label: __('snipet2', 'bit-integrations'), required: false },
    { key: 'snipet3', label: __('snipet3', 'bit-integrations'), required: false },
    { key: 'snipet4', label: __('snipet4', 'bit-integrations'), required: false },
    { key: 'snippet1', label: __('snippet1', 'bit-integrations'), required: false },
    { key: 'snippet2', label: __('snippet2', 'bit-integrations'), required: false },
    { key: 'snippet3', label: __('snippet3', 'bit-integrations'), required: false },
    { key: 'snippet4', label: __('snippet4', 'bit-integrations'), required: false },
    { key: 'snippet5', label: __('snippet5', 'bit-integrations'), required: false },
    { key: 'snippet6', label: __('snippet6', 'bit-integrations'), required: false },
    { key: 'snippet7', label: __('snippet7', 'bit-integrations'), required: false },
    { key: 'snippet8', label: __('snippet8', 'bit-integrations'), required: false },
    { key: 'snippet9', label: __('snippet9', 'bit-integrations'), required: false },
    { key: 'snippet10', label: __('snippet10', 'bit-integrations'), required: false },
    { key: 'snippet11', label: __('snippet11', 'bit-integrations'), required: false },
    { key: 'snippet12', label: __('snippet12', 'bit-integrations'), required: false },
    { key: 'snippet13', label: __('snippet13', 'bit-integrations'), required: false },
    { key: 'snippet14', label: __('snippet14', 'bit-integrations'), required: false },
    { key: 'snippet15', label: __('snippet15', 'bit-integrations'), required: false }
  ]

  const companyFields = [{ key: 'name', label: __('Company Name', 'bit-integrations'), required: true }]

  const [woodpeckerConf, setWoodpeckerConf] = useState({
    name: 'Woodpecker',
    type: 'Woodpecker',
    api_key: '',
    field_map: [{ formField: '', woodpeckerFormField: '' }],
    actionName: '',
    actionId: '',
    prospectsFields,
    companyFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      woodpeckerConf,
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

    if (!checkMappedFields(woodpeckerConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (
      woodpeckerConf.actionName === 'adding_prospects_to_the_campaign' &&
      !woodpeckerConf.selectedCampaign
    ) {
      toast.error(__('Please select a Campaign', 'bit-integrations'))
      return
    }

    woodpeckerConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <WoodpeckerAuthorization
        woodpeckerConf={woodpeckerConf}
        setWoodpeckerConf={setWoodpeckerConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <WoodpeckerIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, woodpeckerConf, setWoodpeckerConf, setLoading, setSnackbar)}
          woodpeckerConf={woodpeckerConf}
          setWoodpeckerConf={setWoodpeckerConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {woodpeckerConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(woodpeckerConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {woodpeckerConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={woodpeckerConf}
          setDataConf={setWoodpeckerConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Woodpecker

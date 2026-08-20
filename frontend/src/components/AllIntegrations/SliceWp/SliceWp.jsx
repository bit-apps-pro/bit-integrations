import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { useRecoilValue } from 'recoil'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, handleInput } from './SliceWpCommonFunc'
import SliceWpAuthorization from './SliceWpAuthorization'
import SliceWpIntegLayout from './SliceWpIntegLayout'

function SliceWp({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [{ key: '1', label: __("Add commission to user's affiliate", 'bit-integrations') }]

  const sliceWpFields = [
    { key: 'commission_date', label: __('commission_date', 'bit-integrations'), required: true },
    { key: 'reference', label: __('Reference', 'bit-integrations'), required: false },
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: false }
  // { key: '2', label: __('Remove the user from a membership','bit-integrations') },
  ]

  const [sliceWpConf, setSliceWpConf] = useState({
    name: 'SliceWp',
    type: 'SliceWp',
    mainAction: '',
    field_map: [{ formField: '', slicewpFormField: '' }],
    allActions,
    sliceWpFields,
    actions: {}
  })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(sliceWpConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    if (sliceWpConf.mainAction !== '') {
      setStep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <SliceWpAuthorization
        formID={formID}
        sliceWpConf={sliceWpConf}
        setSliceWpConf={setSliceWpConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <SliceWpIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, sliceWpConf, setSliceWpConf, setIsLoading, setSnackbar, formID)
          }
          sliceWpConf={sliceWpConf}
          setSliceWpConf={setSliceWpConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          allIntegURL={allIntegURL}
          isInfo={isInfo}
          edit={edit}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={!sliceWpConf.mainAction || isLoading || sliceWpConf.statusId === undefined}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          &nbsp;
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
            conf: sliceWpConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={sliceWpConf}
        setDataConf={setSliceWpConf}
        formFields={formFields}
      />
    </div>
  )
}

export default SliceWp

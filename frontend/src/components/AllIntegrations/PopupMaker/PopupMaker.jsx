import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import PopupMakerAuthorization from './PopupMakerAuthorization'
import { checkMappedFields } from './PopupMakerCommonFunc'
import PopupMakerIntegLayout from './PopupMakerIntegLayout'
import { needsEvent, needsStatus } from './staticData'

export default function PopupMaker({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [popupMakerConf, setPopupMakerConf] = useState({
    name: 'PopupMaker',
    type: 'PopupMaker',
    field_map: [{ formField: '', popupMakerField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (needsStatus.includes(popupMakerConf.mainAction) && !popupMakerConf?.selectedStatus) {
        setSnackbar({
          show: true,
          msg: __('Please select a status to continue.', 'bit-integrations')
        })
        return
      }

      if (needsEvent.includes(popupMakerConf.mainAction) && !popupMakerConf?.selectedEvent) {
        setSnackbar({
          show: true,
          msg: __('Please select an event to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(popupMakerConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (popupMakerConf.name !== '' && popupMakerConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      <PopupMakerAuthorization
        formID={formID}
        popupMakerConf={popupMakerConf}
        setPopupMakerConf={setPopupMakerConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <PopupMakerIntegLayout
          formID={formID}
          formFields={formFields}
          popupMakerConf={popupMakerConf}
          setPopupMakerConf={setPopupMakerConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={popupMakerConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, popupMakerConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={popupMakerConf}
        setDataConf={setPopupMakerConf}
        formFields={formFields}
      />
    </div>
  )
}

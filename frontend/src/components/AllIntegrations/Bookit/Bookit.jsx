import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import BookitAuthorization from './BookitAuthorization'
import { checkMappedFields, getMissingSelectMessage } from './BookitCommonFunc'
import BookitIntegLayout from './BookitIntegLayout'

export default function Bookit({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [bookitConf, setBookitConf] = useState({
    name: 'Bookit',
    type: 'Bookit',
    field_map: [{ formField: '', bookitField: '' }],
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const missingSelectMessage = getMissingSelectMessage(bookitConf)

      if (missingSelectMessage) {
        setSnackbar({ show: true, msg: missingSelectMessage })
        return
      }

      if (!checkMappedFields(bookitConf)) {
        setSnackbar({
          show: true,
          msg: __('Some field map rows are empty. Map each row or remove it.', 'bit-integrations')
        })
        return
      }

      if (bookitConf.name !== '' && bookitConf.field_map.length > 0) {
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

      <BookitAuthorization
        bookitConf={bookitConf}
        setBookitConf={setBookitConf}
        step={step}
        nextPage={nextPage}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <BookitIntegLayout
          formFields={formFields}
          bookitConf={bookitConf}
          setBookitConf={setBookitConf}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={bookitConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, bookitConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={bookitConf}
        setDataConf={setBookitConf}
        formFields={formFields}
      />
    </div>
  )
}

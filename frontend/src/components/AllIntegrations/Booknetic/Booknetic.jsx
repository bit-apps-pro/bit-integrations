import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __, sprintf } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import BookneticAuthorization from './BookneticAuthorization'
import { checkMappedFields, missingRequiredSelect, withoutOptionLists } from './BookneticCommonFunc'
import BookneticIntegLayout from './BookneticIntegLayout'

export default function Booknetic({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [bookneticConf, setBookneticConf] = useState({
    name: 'Booknetic',
    type: 'Booknetic',
    field_map: [{ formField: '', bookneticField: '' }],
    utilities: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val !== 3) {
      setStep(val)
      return
    }

    if (!bookneticConf.mainAction) {
      setSnackbar({
        show: true,
        msg: __('No action is selected. Select an action.', 'bit-integrations')
      })
      return
    }

    const missingSelect = missingRequiredSelect(bookneticConf)

    if (missingSelect) {
      setSnackbar({
        show: true,
        // translators: %s: field label
        msg: sprintf(__('%s is required. Select a value.', 'bit-integrations'), missingSelect.label)
      })
      return
    }

    if (!checkMappedFields(bookneticConf)) {
      setSnackbar({
        show: true,
        msg: __('A required field is not mapped. Map all required fields.', 'bit-integrations')
      })
      return
    }

    if (bookneticConf.name !== '' && bookneticConf.field_map.length > 0) {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2"></div>

      <BookneticAuthorization
        formID={formID}
        bookneticConf={bookneticConf}
        setBookneticConf={setBookneticConf}
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
        <BookneticIntegLayout
          formFields={formFields}
          bookneticConf={bookneticConf}
          setBookneticConf={setBookneticConf}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={bookneticConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(
            flow,
            setFlow,
            allIntegURL,
            withoutOptionLists(bookneticConf),
            navigate,
            '',
            '',
            setIsLoading
          )
        }
        isLoading={isLoading}
        dataConf={bookneticConf}
        setDataConf={setBookneticConf}
        formFields={formFields}
      />
    </div>
  )
}

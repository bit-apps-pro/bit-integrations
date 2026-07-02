/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields } from './KirimEmailCommonFunc'
import BackIcn from '../../../Icons/BackIcn'
import KirimEmailAuthorization from './KirimEmailAuthorization'
import KirimEmailIntegLayout from './KirimEmailIntegLayout'

function KirimEmail({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const subscriberFields = [
    { key: 'full_name', label: __('Full Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'tags', label: __('Tags', 'bit-integrations'), required: false }
  ]

  const allActions = [
    { key: '1', label: __('Add Subscriber', 'bit-integrations') },
    { key: '2', label: __('Remove Subscriber', 'bit-integrations') }
  ]

  const [kirimEmailConf, setKirimEmailConf] = useState({
    name: 'Kirim Email',
    type: 'Kirim Email',
    app_slug: 'KirimEmail',
    mainAction: '',
    userName: '',
    api_key: '',
    field_map: [{ formField: '', kirimEmailFormField: '' }],
    subscriberFields,
    allActions,
    actions: {}
  })
  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setstep(3)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <KirimEmailAuthorization
        kirimEmailConf={kirimEmailConf}
        setKirimEmailConf={setKirimEmailConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && {
            width: 900,
            height: 'auto',
            overflow: 'visible'
          })
        }}>
        <KirimEmailIntegLayout
          formFields={formFields}
          kirimEmailConf={kirimEmailConf}
          setKirimEmailConf={setKirimEmailConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={
            !checkMappedFields(kirimEmailConf?.field_map) ||
            kirimEmailConf.mainAction === '' ||
            isLoading ||
            (kirimEmailConf.mainAction === '1' &&
              (kirimEmailConf.listId === '' || kirimEmailConf.listId === undefined))
          }
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
            conf: kirimEmailConf,
            navigate,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={kirimEmailConf}
        setDataConf={setKirimEmailConf}
        formFields={formFields}
      />
    </div>
  )
}

export default KirimEmail

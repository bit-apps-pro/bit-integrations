/* eslint-disable no-nested-ternary */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WooCommerceAuthorization from './WooCommerceAuthorization'
import { checkMappedFields, handleInput } from './WooCommerceCommonFunc'
import WooCommerceIntegLayout from './WooCommerceIntegLayout'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'

export default function WooCommerce({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [wcConf, setWcConf] = useState({
    name: 'WooCommerce Integration',
    type: 'WooCommerce',
    field_map: [],
    upload_field_map: [],
    line_field_map: [{ formField: '', wcField: '' }],
    actions: {}
  })

  const nextPage = () => {
    let status = ''
    if (wcConf?.module === 'order') {
      const fieldMap = checkMappedFields(wcConf.order.field_map)
      const fieldMapLine = checkMappedFields(wcConf.line_item.field_map)
      const fieldMapCustomer = checkMappedFields(wcConf.customer.field_map)

      status = !fieldMap
        ? 'Order Field Map'
        : !fieldMapLine
          ? 'Line Item Field Map'
          : !fieldMapCustomer
            ? 'Customer Field Map'
            : ''
      if (!(fieldMap && fieldMapLine && fieldMapCustomer)) {
        setSnackbar({ show: true, msg: `${status} can'\t be empty` })
      }
    } else if (wcConf?.module === 'customer') {
      const fieldMap = checkMappedFields(wcConf.customer.field_map)
      if (!fieldMap) {
        status = 'Customer Field Map'
        setSnackbar({
          show: true,
          msg: __("Customer Field Map can't be empty", 'bit-integrations')
        })
      }
    } else if (wcConf?.module === 'product') {
      const fieldMap = checkMappedFields(wcConf.product.field_map)
      if (!fieldMap) {
        status = 'Product Field Map'
        setSnackbar({ show: true, msg: __("Product Field Map can't be empty", 'bit-integrations') })
      }
    } else if (wcConf?.module === 'changestatus') {
      const fieldMap = checkMappedFields(wcConf.changestatus.field_map)
      if (!fieldMap) {
        setSnackbar({
          show: true,
          msg: __("Change Status Field Map can't be empty", 'bit-integrations')
        })
      }
    }

    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (status === '') {
      setStep(3)
    }
  }
  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <WooCommerceAuthorization
        formID={formID}
        wcConf={wcConf}
        setWcConf={setWcConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />
      <div className="btcd-stp-page" style={{ width: step === 2 && 1000, height: step === 2 && 'auto' }}>
        <WooCommerceIntegLayout
          wcConf={wcConf}
          setWcConf={setWcConf}
          formFields={formFields}
          handleInput={e => handleInput(e, wcConf, setWcConf, setIsLoading, setSnackbar, isPro)}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        <button
          onClick={nextPage}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, wcConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={wcConf}
        setDataConf={setWcConf}
        formFields={formFields}
      />
    </div>
  )
}

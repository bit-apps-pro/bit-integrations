import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import NextCrmAuthorization from './NextCrmAuthorization'
import { checkMappedFields } from './NextCrmCommonFunc'
import NextCrmIntegLayout from './NextCrmIntegLayout'
import { needsCampaign, needsContactField, needsList, needsStatus, needsTag } from './staticData'

const requiredSelect = {
  selectedStatus: needsStatus,
  selectedField: needsContactField,
  selectedTag: needsTag,
  selectedList: needsList,
  selectedCampaign: needsCampaign
}

export default function NextCrm({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [nextCrmConf, setNextCrmConf] = useState({
    name: 'NextCRM',
    type: 'NextCrm',
    field_map: [{ formField: '', nextCrmField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const missingSelect = Object.keys(requiredSelect).find(
        key => requiredSelect[key].includes(nextCrmConf.mainAction) && !nextCrmConf?.[key]
      )

      if (missingSelect) {
        setSnackbar({
          show: true,
          msg: __('Please complete all required selections to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(nextCrmConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (nextCrmConf.name !== '' && nextCrmConf.field_map.length > 0) {
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

      {/* STEP 1 */}
      <NextCrmAuthorization
        formID={formID}
        nextCrmConf={nextCrmConf}
        setNextCrmConf={setNextCrmConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <NextCrmIntegLayout
          formID={formID}
          formFields={formFields}
          nextCrmConf={nextCrmConf}
          setNextCrmConf={setNextCrmConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={nextCrmConf.field_map.length < 1}
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
          saveIntegConfig(flow, setFlow, allIntegURL, nextCrmConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={nextCrmConf}
        setDataConf={setNextCrmConf}
        formFields={formFields}
      />
    </div>
  )
}

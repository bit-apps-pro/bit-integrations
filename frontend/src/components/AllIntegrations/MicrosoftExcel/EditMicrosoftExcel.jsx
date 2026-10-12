import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { handleInput, validationMessage } from './MicrosoftExcelCommonFunc'
import MicrosoftExcelIntegLayout from './MicrosoftExcelIntegLayout'

function EditMicrosoftExcel({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow] = useRecoilState($newFlow)
  const [microsoftExcelConf, setMicrosoftExcelConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    const message = validationMessage(microsoftExcelConf)

    if (message) {
      setSnackbar({ show: true, msg: message })

      return
    }
    saveActionConf({
      allIntegURL,
      conf: microsoftExcelConf,
      edit: 1,
      flow,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, setMicrosoftExcelConf)}
          name="name"
          value={microsoftExcelConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <MicrosoftExcelIntegLayout
        formFields={formField}
        microsoftExcelConf={microsoftExcelConf}
        setMicrosoftExcelConf={setMicrosoftExcelConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={microsoftExcelConf?.field_map?.length < 1}
        isLoading={isLoading}
        dataConf={microsoftExcelConf}
        setDataConf={setMicrosoftExcelConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditMicrosoftExcel

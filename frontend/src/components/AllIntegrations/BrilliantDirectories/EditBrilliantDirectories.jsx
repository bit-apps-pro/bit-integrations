import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './BrilliantDirectoriesCommonFunc'
import BrilliantDirectoriesIntegLayout from './BrilliantDirectoriesIntegLayout'

function EditBrilliantDirectories({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow] = useRecoilState($newFlow)
  const [brilliantDirectoriesConf, setBrilliantDirectoriesConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(brilliantDirectoriesConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })

      return
    }
    saveActionConf({
      allIntegURL,
      conf: brilliantDirectoriesConf,
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
          onChange={e => handleInput(e, brilliantDirectoriesConf, setBrilliantDirectoriesConf)}
          name="name"
          value={brilliantDirectoriesConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <BrilliantDirectoriesIntegLayout
        formFields={formField}
        brilliantDirectoriesConf={brilliantDirectoriesConf}
        setBrilliantDirectoriesConf={setBrilliantDirectoriesConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={brilliantDirectoriesConf?.field_map?.length < 1}
        isLoading={isLoading}
        dataConf={brilliantDirectoriesConf}
        setDataConf={setBrilliantDirectoriesConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditBrilliantDirectories

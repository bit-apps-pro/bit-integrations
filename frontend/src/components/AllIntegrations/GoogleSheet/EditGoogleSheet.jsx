/* eslint-disable no-param-reassign */

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { handleInput } from './GoogleSheetCommonFunc'
import GoogleSheetIntegLayout from './GoogleSheetIntegLayout'
import GoogleSheetAuthorization from './GoogleSheetAuthorization'

function EditGoogleSheet({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [sheetConf, setSheetConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const formFields = useRecoilValue($formFields)
  const [name, setName] = useState(sheetConf?.name || '')

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => {
            setName(e.target.value)
            handleInput(e, sheetConf, setSheetConf)
          }}
          name="name"
          value={name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <GoogleSheetIntegLayout
        formID={formID}
        formFields={formFields}
        handleInput={e => handleInput(e, sheetConf, setSheetConf, formID, setIsLoading, setSnackbar)}
        sheetConf={sheetConf}
        setSheetConf={setSheetConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: sheetConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={
          sheetConf.spreadsheetId === '' ||
          sheetConf.worksheetName === '' ||
          sheetConf.field_map.length < 1
        }
        isLoading={isLoading}
        dataConf={sheetConf}
        setDataConf={setSheetConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditGoogleSheet

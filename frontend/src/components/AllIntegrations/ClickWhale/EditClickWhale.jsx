import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Note from '../../Utilities/Note'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput, validateClickWhaleConf } from './ClickWhaleCommonFunc'
import ClickWhaleIntegLayout from './ClickWhaleIntegLayout'

export default function EditClickWhale({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [clickWhaleConf, setClickWhaleConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  // Same gate the create wizard applies, so an edited flow cannot be saved in a
  // state that would fail on every run.
  const selectionError = validateClickWhaleConf(clickWhaleConf)

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, clickWhaleConf, setClickWhaleConf)}
          name="name"
          value={clickWhaleConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <ClickWhaleIntegLayout
        formID={formID}
        formFields={formFields}
        clickWhaleConf={clickWhaleConf}
        setClickWhaleConf={setClickWhaleConf}
        setSnackbar={setSnackbar}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />

      {selectionError && <Note note={selectionError} />}

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: clickWhaleConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(clickWhaleConf) || !!selectionError}
        isLoading={isLoading}
        dataConf={clickWhaleConf}
        setDataConf={setClickWhaleConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

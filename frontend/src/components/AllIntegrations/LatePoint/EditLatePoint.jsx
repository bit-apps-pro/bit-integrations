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
import { checkMappedFields, handleInput, validateLatePointConf } from './LatePointCommonFunc'
import LatePointIntegLayout from './LatePointIntegLayout'

export default function EditLatePoint({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [latePointConf, setLatePointConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  // Same gate the create wizard applies, so an edited flow cannot be saved in a
  // state that would fail on every run.
  const selectionError = validateLatePointConf(latePointConf)

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, latePointConf, setLatePointConf)}
          name="name"
          value={latePointConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <LatePointIntegLayout
        formID={formID}
        formFields={formFields}
        latePointConf={latePointConf}
        setLatePointConf={setLatePointConf}
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
            conf: latePointConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(latePointConf) || !!selectionError}
        isLoading={isLoading}
        dataConf={latePointConf}
        setDataConf={setLatePointConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

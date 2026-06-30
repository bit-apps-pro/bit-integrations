import { create } from 'mutative'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import {
  checkMappedFields,
  handleInput,
  refreshCourses,
  refreshLessons,
  refreshQuizzes
} from './SenseiLMSCommonFunc'
import SenseiLMSIntegLayout from './SenseiLMSIntegLayout'
import { courseActions, lessonActions, quizActions, senseiLMSStaticData } from './staticData'

export default function EditSenseiLMS({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [senseiLMSConf, setSenseiLMSConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  // On edit, rebuild the non-persisted field definitions from the saved action and
  // repopulate the resource dropdown options. The saved field_map mapping is untouched.
  useEffect(() => {
    const action = senseiLMSConf?.mainAction
    if (!action) {
      return
    }

    setSenseiLMSConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.senseiLMSFields = senseiLMSStaticData[action] || []
      })
    )

    if (courseActions.includes(action)) {
      refreshCourses(setSenseiLMSConf, setIsLoading)
    } else if (lessonActions.includes(action)) {
      refreshLessons(setSenseiLMSConf, setIsLoading)
    } else if (quizActions.includes(action)) {
      refreshQuizzes(setSenseiLMSConf, setIsLoading)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, senseiLMSConf, setSenseiLMSConf)}
          name="name"
          value={senseiLMSConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <SenseiLMSIntegLayout
        formID={formID}
        formFields={formFields}
        senseiLMSConf={senseiLMSConf}
        setSenseiLMSConf={setSenseiLMSConf}
        setSnackbar={setSnackbar}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: senseiLMSConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(senseiLMSConf)}
        isLoading={isLoading}
        dataConf={senseiLMSConf}
        setDataConf={setSenseiLMSConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

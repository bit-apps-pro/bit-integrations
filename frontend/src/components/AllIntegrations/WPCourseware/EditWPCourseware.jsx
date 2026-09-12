/* eslint-disable no-param-reassign */

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import EditFormInteg from '../EditFormInteg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import EditWebhookInteg from '../EditWebhookInteg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'
import { handleInput } from './WPCoursewareCommonFunc'
import WPCoursewareIntegLayout from './WPCoursewareIntegLayout'

function EditWPCourseware({ allIntegURL }) {
  const navigate = useNavigate()

  const [wpCoursewareConf, setWPCoursewareConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  const saveConfig = () => {
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: wpCoursewareConf,
      navigate,
      edit: 1,
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
          onChange={e => handleInput(e, wpCoursewareConf, setWPCoursewareConf)}
          name="name"
          value={wpCoursewareConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <WPCoursewareIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formFields}
        wpCoursewareConf={wpCoursewareConf}
        setWPCoursewareConf={setWPCoursewareConf}
        isLoading={isLoading}
        step={2}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={
          wpCoursewareConf.action === '' ||
          wpCoursewareConf.course.length === 0 ||
          isUserSourceIncomplete(wpCoursewareConf)
        }
        isLoading={isLoading}
        dataConf={wpCoursewareConf}
        setDataConf={setWPCoursewareConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditWPCourseware

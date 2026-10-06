/* eslint-disable no-param-reassign */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import EditFormInteg from '../EditFormInteg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import EditWebhookInteg from '../EditWebhookInteg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ZoomIntegLayout from './ZoomIntegLayout'
import { checkMappedFields, handleInput } from './ZoomCommonFunc'

function EditZoom({ allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [zoomConf, setZoomConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, zoomConf, setZoomConf)}
          name="name"
          value={zoomConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <ZoomIntegLayout
        formID={formID}
        formFields={formFields}
        handleInput={e => handleInput(e, zoomConf, setZoomConf, formID, setIsLoading, setSnackbar)}
        zoomConf={zoomConf}
        setZoomConf={setZoomConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            allIntegURL,
            conf: zoomConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={
          zoomConf.field_map.length < 2 ||
          isLoading ||
          !zoomConf.id ||
          !checkMappedFields(zoomConf) ||
          zoomConf.selectedActions == null
        }
        isLoading={isLoading}
        dataConf={zoomConf}
        setDataConf={setZoomConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditZoom

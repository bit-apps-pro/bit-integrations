import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './EventbriteCommonFunc'
import EventbriteIntegLayout from './EventbriteIntegLayout'

function EditEventbrite({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow] = useRecoilState($newFlow)
  const [eventbriteConf, setEventbriteConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(eventbriteConf)) {
      setSnackbar({
        show: true,
        msg: __('Please fill the required options and fields', 'bit-integrations')
      })

      return
    }
    saveActionConf({
      allIntegURL,
      conf: eventbriteConf,
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
          onChange={e => handleInput(e, eventbriteConf, setEventbriteConf)}
          name="name"
          value={eventbriteConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <EventbriteIntegLayout
        formFields={formField}
        eventbriteConf={eventbriteConf}
        setEventbriteConf={setEventbriteConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={eventbriteConf?.field_map?.length < 1}
        isLoading={isLoading}
        dataConf={eventbriteConf}
        setDataConf={setEventbriteConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditEventbrite

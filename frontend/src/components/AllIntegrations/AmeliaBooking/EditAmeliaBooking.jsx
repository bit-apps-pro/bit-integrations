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
  refreshAmeliaBookingLists,
  requiredSelectMissing
} from './AmeliaBookingCommonFunc'
import AmeliaBookingIntegLayout from './AmeliaBookingIntegLayout'
import { listsByAction } from './staticData'

export default function EditAmeliaBooking({ allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const [ameliaBookingConf, setAmeliaBookingConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  useEffect(() => {
    refreshAmeliaBookingLists(
      listsByAction[ameliaBookingConf?.mainAction] || [],
      setAmeliaBookingConf,
      setIsLoading
    )
  }, [])

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, setAmeliaBookingConf)}
          name="name"
          value={ameliaBookingConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <AmeliaBookingIntegLayout
        formFields={formFields}
        ameliaBookingConf={ameliaBookingConf}
        setAmeliaBookingConf={setAmeliaBookingConf}
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
            conf: ameliaBookingConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(ameliaBookingConf) || !!requiredSelectMissing(ameliaBookingConf)}
        isLoading={isLoading}
        dataConf={ameliaBookingConf}
        setDataConf={setAmeliaBookingConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

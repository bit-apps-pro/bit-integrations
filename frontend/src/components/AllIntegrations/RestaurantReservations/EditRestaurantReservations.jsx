import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { getConfError, handleInput } from './RestaurantReservationsCommonFunc'
import RestaurantReservationsIntegLayout from './RestaurantReservationsIntegLayout'

export default function EditRestaurantReservations({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [restaurantReservationsConf, setRestaurantReservationsConf] = useRecoilState($actionConf)
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
          onChange={e => handleInput(e, restaurantReservationsConf, setRestaurantReservationsConf)}
          name="name"
          value={restaurantReservationsConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <RestaurantReservationsIntegLayout
        formID={formID}
        formFields={formFields}
        restaurantReservationsConf={restaurantReservationsConf}
        setRestaurantReservationsConf={setRestaurantReservationsConf}
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
            conf: restaurantReservationsConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!!getConfError(restaurantReservationsConf)}
        isLoading={isLoading}
        dataConf={restaurantReservationsConf}
        setDataConf={setRestaurantReservationsConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

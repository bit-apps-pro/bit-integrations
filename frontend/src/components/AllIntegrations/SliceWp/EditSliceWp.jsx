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
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'
import SliceWpIntegLayout from './SliceWpIntegLayout'
import { handleInput } from './SliceWpCommonFunc'

function EditSliceWp({ allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [sliceWpConf, setSliceWpConf] = useRecoilState($actionConf)
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
          onChange={e => handleInput(e, sliceWpConf, setSliceWpConf)}
          name="name"
          value={sliceWpConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <SliceWpIntegLayout
        formID={formID}
        formFields={formFields}
        handleInput={e => handleInput(e, sliceWpConf, setSliceWpConf, setIsLoading, setSnackbar)}
        sliceWpConf={sliceWpConf}
        setSliceWpConf={setSliceWpConf}
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
            conf: sliceWpConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!sliceWpConf.mainAction || isLoading || isUserSourceIncomplete(sliceWpConf)}
        isLoading={isLoading}
        dataConf={sliceWpConf}
        setDataConf={setSliceWpConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditSliceWp

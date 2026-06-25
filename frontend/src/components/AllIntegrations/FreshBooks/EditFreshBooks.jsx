import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields } from './FreshBooksCommonFunc'
import FreshBooksIntegLayout from './FreshBooksIntegLayout'

function EditFreshBooks({ allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [freshBooksConf, setFreshBooksConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const formFields = useRecoilValue($formFields)

  const setIntegName = e => {
    const newConf = { ...freshBooksConf }
    const { name, value } = e.target
    if (value !== '') {
      newConf[name] = value
    } else {
      delete newConf[name]
    }
    setFreshBooksConf({ ...newConf })
  }

  const saveConfig = () => {
    if (!checkMappedFields(freshBooksConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }

    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: freshBooksConf,
      navigate,
      id,
      edit: 1,
      setIsLoading,
      setSnackbar
    })
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => setIntegName(e)}
          name="name"
          value={freshBooksConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <FreshBooksIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formFields}
        freshBooksConf={freshBooksConf}
        setFreshBooksConf={setFreshBooksConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={!freshBooksConf.mainAction || freshBooksConf.field_map.length < 1}
        isLoading={isLoading}
        dataConf={freshBooksConf}
        setDataConf={setFreshBooksConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditFreshBooks

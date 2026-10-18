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
  refreshNiroHelpLists,
  requiredSelectMissing
} from './NiroHelpCommonFunc'
import NiroHelpIntegLayout from './NiroHelpIntegLayout'
import { listsByAction } from './staticData'

export default function EditNiroHelp({ allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const [niroHelpConf, setNiroHelpConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  useEffect(() => {
    refreshNiroHelpLists(listsByAction[niroHelpConf?.mainAction] || [], setNiroHelpConf, setIsLoading)
  }, [])

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, setNiroHelpConf)}
          name="name"
          value={niroHelpConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <NiroHelpIntegLayout
        formFields={formFields}
        niroHelpConf={niroHelpConf}
        setNiroHelpConf={setNiroHelpConf}
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
            conf: niroHelpConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(niroHelpConf) || !!requiredSelectMissing(niroHelpConf)}
        isLoading={isLoading}
        dataConf={niroHelpConf}
        setDataConf={setNiroHelpConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { create } from 'mutative'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './ConvertForceCommonFunc'
import ConvertForceIntegLayout from './ConvertForceIntegLayout'
import {
  CampaignDeleteFields,
  CampaignFields,
  CampaignStatusFields,
  CampaignUpdateFields
} from './staticData'

export default function EditConvertForce({ allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const [convertForceConf, setConvertForceConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  useEffect(() => {
    if (convertForceConf?.mainAction) {
      setConvertForceConf(prevConf =>
        create(prevConf, draftConf => {
          switch (convertForceConf.mainAction) {
            case 'createCampaign':
              draftConf.convertForceFields = CampaignFields
              break
            case 'updateCampaign':
              draftConf.convertForceFields = CampaignUpdateFields
              break
            case 'updateCampaignStatus':
              draftConf.convertForceFields = CampaignStatusFields
              break
            case 'deleteCampaign':
              draftConf.convertForceFields = CampaignDeleteFields
              break
            default:
              draftConf.convertForceFields = []
          }
        })
      )
    }
  }, [])

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, convertForceConf, setConvertForceConf)}
          name="name"
          value={convertForceConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <ConvertForceIntegLayout
        formFields={formFields}
        convertForceConf={convertForceConf}
        setConvertForceConf={setConvertForceConf}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: convertForceConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(convertForceConf)}
        isLoading={isLoading}
        dataConf={convertForceConf}
        setDataConf={setConvertForceConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

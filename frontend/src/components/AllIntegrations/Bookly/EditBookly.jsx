import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './BooklyCommonFunc'
import BooklyIntegLayout from './BooklyIntegLayout'

export default function EditBookly({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [booklyConf, setBooklyConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState({})
  const [snack, setSnackbar] = useState({ show: false })

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, booklyConf, setBooklyConf)}
          name="name"
          value={booklyConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <BooklyIntegLayout
        formID={formID}
        formFields={formFields}
        booklyConf={booklyConf}
        setBooklyConf={setBooklyConf}
        setSnackbar={setSnackbar}
        dataLoading={dataLoading}
        setDataLoading={setDataLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: booklyConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(booklyConf)}
        isLoading={isLoading}
        dataConf={booklyConf}
        setDataConf={setBooklyConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

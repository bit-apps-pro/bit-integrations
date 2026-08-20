/* eslint-disable no-param-reassign */

import { create } from 'mutative'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput, InstasentStaticData } from './InstasentCommonFunc'
import InstasentIntegLayout from './InstasentIntegLayout'

function EditInstasent({ allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [instasentConf, setInstasentConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(instasentConf?.name || '')
  const [loading, setLoading] = useState({
    list: false,
    field: false,
    auth: false
  })
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(instasentConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }

    saveActionConf({
      flow,
      allIntegURL,
      conf: instasentConf,
      navigate,
      edit: 1,
      setLoading,
      setSnackbar
    })
  }

  useEffect(() => {
    setInstasentConf(prev =>
      create(prev, draftConf => {
        const action = draftConf.action || 'send_sms'
        draftConf.action = action
        // instasentFields isn't persisted; rebuild it from the saved action so the
        // field map can render its options on edit (without touching the saved field_map).
        draftConf.instasentFields = InstasentStaticData[action] || []
      })
    )
  }, [])

  const handleEditIntegName = e => {
    setName(e.target.value)

    setInstasentConf(prevConf =>
      create(prevConf, draftConF => {
        draftConF.name = e.target.value
      })
    )
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={handleEditIntegName}
          name="name"
          value={name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <InstasentIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formField}
        handleInput={e => handleInput(e, instasentConf, setInstasentConf, loading, setLoading)}
        instasentConf={instasentConf}
        setInstasentConf={setInstasentConf}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={instasentConf.field_map.length < 1}
        isLoading={isLoading}
        dataConf={instasentConf}
        setDataConf={setInstasentConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditInstasent

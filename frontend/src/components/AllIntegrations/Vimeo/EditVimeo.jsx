/* eslint-disable no-param-reassign */
import { create } from 'mutative'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields } from './VimeoCommonFunc'
import VimeoIntegLayout from './VimeoIntegLayout'

function EditVimeo({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [vimeoConf, setVimeoConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(vimeoConf?.name || '')
  const [loading, setLoading] = useState({
    auth: false,
    videos: false,
    showcases: false,
    folders: false,
    channels: false
  })
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(vimeoConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }

    saveActionConf({
      flow,
      allIntegURL,
      conf: vimeoConf,
      navigate,
      edit: 1,
      setLoading,
      setSnackbar
    })
  }

  const handleEditIntegName = e => {
    setName(e.target.value)
    setVimeoConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.name = e.target.value
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
      <VimeoIntegLayout
        formFields={formField}
        vimeoConf={vimeoConf}
        setVimeoConf={setVimeoConf}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={vimeoConf.field_map.length < 1}
        isLoading={isLoading}
        dataConf={vimeoConf}
        setDataConf={setVimeoConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditVimeo

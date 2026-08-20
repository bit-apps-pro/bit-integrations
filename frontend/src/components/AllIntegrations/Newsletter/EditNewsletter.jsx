/* eslint-disable no-param-reassign */

import { memo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, handleInput } from './NewsletterCommonFunc'
import NewsletterIntegLayout from './NewsletterIntegLayout'

function EditNewsletter({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [newsletterConf, setNewsletterConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false
  })
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(newsletterConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    saveActionConf({
      flow,
      allIntegURL,
      conf: newsletterConf,
      navigate,
      edit: 1,
      setLoading,
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
          onChange={e => handleInput(e, newsletterConf, setNewsletterConf)}
          name="name"
          defaultValue={newsletterConf.name || ''}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <NewsletterIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formField}
        handleInput={e => handleInput(e, newsletterConf, setNewsletterConf, setLoading, setSnackbar)}
        newsletterConf={newsletterConf}
        setNewsletterConf={setNewsletterConf}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        isLoading={isLoading}
        dataConf={newsletterConf}
        setDataConf={setNewsletterConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditNewsletter

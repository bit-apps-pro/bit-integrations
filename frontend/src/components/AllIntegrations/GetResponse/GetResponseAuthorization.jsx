/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { fetchCampaigns, fetchCustomFields } from './GetResponseCommonFunc'

export default function GetResponseAuthorization({
  getResponseConf,
  setGetResponseConf,
  step,
  setstep,
  loading,
  setLoading,
  isInfo
}) {
  const loadCampaignsAndFields = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...getResponseConf, connection_id: connectionId }
        : getResponseConf

      await fetchCampaigns(
        nextConf,
        setGetResponseConf,
        undefined,
        undefined,
        loading,
        setLoading,
        'refreshCampaigns'
      )
      await fetchCustomFields(nextConf, setGetResponseConf, setLoading, 'default')
    },
    [getResponseConf, setGetResponseConf, loading, setLoading]
  )

  const handleConnectionSelected = useCallback(
    async connectionId => {
      await loadCampaignsAndFields(connectionId)
    },
    [loadCampaignsAndFields]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !getResponseConf?.campaigns?.length) {
        loadCampaignsAndFields()
      }

      setstep(value)
    },
    [getResponseConf, loadCampaignsAndFields, setstep]
  )

  const note = `<h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Goto',
        'bit-integrations'
      )} <a target="_blank" href="https://app.getresponse.com/api">${__(
        'Generate API Token',
        'bit-integrations'
      )}</a></li>
      <li>${__(
        'Copy the <b>Token</b> and paste into <b>API Token</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={getResponseConf}
      setConfig={setGetResponseConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="GetResponse"
      tutorialLinks={tutorialLinks?.getResponse || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.getresponse.com/v3/campaigns',
        key: 'token',
        addTo: 'query',
        headers: {
          'X-Auth-Token': 'api-key {api_key}'
        },
        method: 'GET'
      }}
      noteDetails={{ note }}
      onConnectionSelected={handleConnectionSelected}
    />
  )
}

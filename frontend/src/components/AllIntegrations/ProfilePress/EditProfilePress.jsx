import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Note from '../../Utilities/Note'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput, validateProfilePressConf } from './ProfilePressCommonFunc'
import ProfilePressIntegLayout from './ProfilePressIntegLayout'

export default function EditProfilePress({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [profilePressConf, setProfilePressConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  // Same gate the create wizard applies, so an edited flow cannot be saved in a
  // state that would fail on every run.
  const selectionError = validateProfilePressConf(profilePressConf)

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, profilePressConf, setProfilePressConf)}
          name="name"
          value={profilePressConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <ProfilePressIntegLayout
        formID={formID}
        formFields={formFields}
        profilePressConf={profilePressConf}
        setProfilePressConf={setProfilePressConf}
        setSnackbar={setSnackbar}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />

      {selectionError && <Note note={selectionError} />}

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: profilePressConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(profilePressConf) || !!selectionError}
        isLoading={isLoading}
        dataConf={profilePressConf}
        setDataConf={setProfilePressConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

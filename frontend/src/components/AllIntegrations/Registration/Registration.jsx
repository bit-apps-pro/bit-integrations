/* eslint-disable no-param-reassign */
import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import ConditionalLogic from '../../ConditionalLogic'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import SnackMsg from '../../Utilities/SnackMsg'
import TableCheckBox from '../../Utilities/TableCheckBox'
import TutorialLink from '../../Utilities/TutorialLink'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import RegistrationActions from './RegistrationActions'
import UserFieldMap from './UserFieldMap'
import {
  checkMappedUserFields,
  generateRegistrationFieldMap,
  getRegistrationFieldsByAction,
  isLegacyRegistrationAction,
  registrationMainActions
} from './UserHelperFunction'
import UserMetaField from './UserMetaField'

export default function Registration({ formFields, setFlow, flow, allIntegURL }) {
  const [snack, setSnackbar] = useState({ show: false })
  const navigate = useNavigate()
  const { isPro } = useRecoilValue($appConfigState)
  const [isLoading, setIsLoading] = useState(false)
  const [userConf, setUserConf] = useState({
    name: 'WP User Registration',
    type: 'WP User Registration',
    action_type: 'new_user',
    user_map: generateRegistrationFieldMap('new_user'),
    meta_map: [{}],
    condition: {
      action_behavior: '',
      actions: [{ field: '', action: 'value' }],
      logics: [{ field: '', logic: '', val: '' }, 'or', { field: '', logic: '', val: '' }]
    }
  })

  useEffect(() => {
    const tmpConf = { ...userConf }

    if (!tmpConf.action_type) {
      tmpConf.action_type = 'new_user'
    }
    if (!tmpConf?.user_map?.[0]?.userField) {
      tmpConf.user_map = generateRegistrationFieldMap(tmpConf.action_type)
    }

    setUserConf(tmpConf)
  }, [])

  const setActionType = actionType => {
    const newAction = actionType || 'new_user'
    setUserConf(prevConf => ({
      ...prevConf,
      action_type: newAction,
      user_map: generateRegistrationFieldMap(newAction)
    }))
  }

  const isLegacyAction = isLegacyRegistrationAction(userConf?.action_type)
  const selectedUserFields = getRegistrationFieldsByAction(userConf?.action_type || 'new_user')

  const saveConfig = () => {
    if (!userConf.action_type) {
      setSnackbar({ show: true, msg: __('Please select action type', 'bit-integrations') })
      return
    }
    if (userConf.action_type === 'new_user' && !userConf.user_role) {
      setSnackbar({ show: true, msg: __("User Role can't be empty", 'bit-integrations') })
      return
    }
    if (!checkMappedUserFields(userConf) && userConf.action_type !== 'updated_user') {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    setIsLoading(true)
    saveIntegConfig(flow, setFlow, allIntegURL, userConf, navigate, '', '', setIsLoading)
  }

  const checkedCondition = (val, checked) => {
    const tmpConf = { ...userConf }
    if (checked) {
      tmpConf.condition.action_behavior = val
    } else {
      tmpConf.condition.action_behavior = ''
    }
    setUserConf(tmpConf)
  }

  const actionTypeHandler = e => {
    if (!e.target.value) {
      return
    }
    setActionType(e.target.value)
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <TutorialLink linkKey="registration" />
      <br />{' '}
      <div>
        <div className="mt-3">
          <b>{__('Select Action', 'bit-integrations')}</b>
        </div>
        <div className="mt-2">
          <select
            className="btcd-paper-inp w-5"
            value={userConf?.action_type || 'new_user'}
            onChange={actionTypeHandler}>
            <option value="">{__('Select Action', 'bit-integrations')}</option>
            {registrationMainActions.map(action => (
              <option
                key={action.value}
                value={action.value}
                disabled={!checkIsPro(isPro, action.is_pro)}>
                {checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <br />
      <div>
        <UserFieldMap
          formFields={formFields}
          userConf={userConf}
          setUserConf={setUserConf}
          userFields={selectedUserFields}
        />
      </div>
      {isLegacyAction && (
        <>
          <div>
            <UserMetaField formFields={formFields} userConf={userConf} setUserConf={setUserConf} />
          </div>
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <RegistrationActions userConf={userConf} setUserConf={setUserConf} />
          <br />
          <Note
            note={
              userConf?.action_type === 'updated_user' ? userUpdateInstruction : userCreateInstruction
            }
          />
        </>
      )}
      {userConf?.condition && (
        <>
          <div className="flx">
            <TableCheckBox
              onChange={e => checkedCondition(e.target.value, e.target.checked)}
              checked={userConf?.condition?.action_behavior === 'cond'}
              className="wdt-200 mt-4 mr-2"
              value="cond"
              title={__('Conditional Logics', 'bit_integration')}
            />
          </div>
          <br />
          {userConf?.condition?.action_behavior === 'cond' && (
            <ConditionalLogic formFields={formFields} dataConf={userConf} setDataConf={setUserConf} />
          )}
        </>
      )}
      <button
        className="btn f-left btcd-btn-lg purple sh-sm flx"
        type="button"
        onClick={() => saveConfig()}
        disabled={isLoading}>
        {__('Save', 'bit-integrations')}
        {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
      </button>
    </div>
  )
}

const userUpdateInstruction = `
  <ul>
  <li>${__('The user must be logged in when updating profile', 'bit-integrations')}</li>
  <li>${__(
  'The user cannot change the value of the username field when updating the user profile.',
  'bit-integrations'
)}</li>
     
  </ul>`
const userCreateInstruction = `
  <ul>
  <li>${__(
  'If the Username and Password fields are blank then the user will take the value of the email field as the field and the password will be auto-generated.',
  'bit-integrations'
)}</li>
  </ul>`
import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { useRecoilValue } from 'recoil'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'
import { handleInput, checkMappedFields } from './LearnDashCommonFunc'
import LearnDashIntegLayout from './LearnDashIntegLayout'
import { $appConfigState } from '../../../GlobalStates'
import LearnDashAuthorization from './LearnDashAuthorization'

function LearnDash({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const btcbi = useRecoilValue($appConfigState)
  const { siteURL } = btcbi

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [
    { key: '1', label: __('Create Group', 'bit-integrations') },
    { key: '2', label: __('Add the user to a group pro', 'bit-integrations') },
    { key: '3', label: __('Enroll the user in a course', 'bit-integrations') },
    { key: '4', label: __('Make the user the leader of group', 'bit-integrations') },
    { key: '5', label: __('Mark a course complete for the user', 'bit-integrations') },
    { key: '6', label: __('Mark a lesson complete for the user', 'bit-integrations') },
    { key: '7', label: __('Mark a lesson not complete for the user pro', 'bit-integrations') },
    { key: '8', label: __('Mark a topic complete for the user', 'bit-integrations') },
    { key: '9', label: __('Mark a topic not complete for the user pro', 'bit-integrations') },
    {
      key: '10',
      label: __('Remove the Leader from a group and its children pro', 'bit-integrations')
    },
    { key: '11', label: __('Remove the user from a group pro', 'bit-integrations') },
    {
      key: '12',
      label: __('Remove the user from a group and its children pro', 'bit-integrations')
    },
    { key: '13', label: __('Reset the users attempts for a quiz pro', 'bit-integrations') },
    { key: '14', label: __('Reset the users progress in a course pro', 'bit-integrations') },
    { key: '16', label: __('Send an email to the users group leaders', 'bit-integrations') },
    { key: '17', label: __('Unenroll the user from a course pro', 'bit-integrations') }
  ]

  const groupUserRole = [
    { key: '1', label: __('Do not add group leader role', 'bit-integrations') },
    { key: '2', label: __('Add the role to their exiting role', 'bit-integrations') },
    {
      key: '3',
      label: __('Replace their existing role(s) with the Group Leader role', 'bit-integrations')
    }
  ]

  const groupOfLeader4 = [
    { key: '1', label: __('Do nothing', 'bit-integrations') },
    { key: '2', label: __('Add the role to their exiting role', 'bit-integrations') },
    {
      key: '3',
      label: __('Replace their existing role(s) with the Group Leader role', 'bit-integrations')
    }
  ]

  const createGroupFields = [{ key: 'title', label: 'Title', required: true }]
  const [learnDashConf, setLearnDashConf] = useState({
    name: 'LearnDash',
    type: 'LearnDash',
    mainAction: '',
    courseId: '',
    domainName: siteURL,
    field_map: [{ formField: '', learnDeshFormField: '' }],
    allActions,
    groupUserRole,
    groupOfLeader4,
    createGroupFields,
    actions: {}
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (learnDashConf.mainAction === '1' && !checkMappedFields(learnDashConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (learnDashConf.mainAction !== '') {
      setStep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <LearnDashAuthorization
        formID={formID}
        learnDashConf={learnDashConf}
        setLearnDashConf={setLearnDashConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <LearnDashIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, learnDashConf, setLearnDashConf, setIsLoading, setSnackbar, formID)
          }
          learnDashConf={learnDashConf}
          setLearnDashConf={setLearnDashConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          allIntegURL={allIntegURL}
          isInfo={isInfo}
          edit={edit}
        />

        {learnDashConf.mainAction !== '16' && (
          <button
            onClick={() => nextPage(3)}
            disabled={!learnDashConf.mainAction || isLoading || isUserSourceIncomplete(learnDashConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')}
            &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>
      {learnDashConf.mainAction !== '16' && (
        <IntegrationStepThree
          step={step}
          saveConfig={() =>
            saveActionConf({
              flow,
              setFlow,
              allIntegURL,
              navigate,
              conf: learnDashConf,
              setIsLoading,
              setSnackbar
            })
          }
          isLoading={isLoading}
          dataConf={learnDashConf}
          setDataConf={setLearnDashConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default LearnDash

import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { useRecoilValue } from 'recoil'
import BackIcn from '../../../Icons/BackIcn'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import GroundhoggAuthorization from './GroundhoggAuthorization'
import { handleInput, checkMappedFields, checkMetaMappedFields } from './GroundhoggCommonFunc'
import GroundhoggIntegLayout from './GroundhoggIntegLayout'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'

function Groundhogg({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const btcbi = useRecoilValue($appConfigState)
  const { siteURL } = btcbi
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const contactsFields = [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'user_id', label: __('User Id', 'bit-integrations'), required: false },
    { key: 'owner_id', label: __('Owner Id', 'bit-integrations'), required: false },
    { key: 'note', label: __('Note', 'bit-integrations'), required: false }
  ]

  const contactMetaFields = [
    { key: 'primary_phone', label: __('Primary Phone', 'bit-integrations'), required: false },
    { key: 'street_address_1', label: __('Street Address 1', 'bit-integrations'), required: false },
    { key: 'street_address_2', label: __('Street Address 2', 'bit-integrations'), required: false },
    { key: 'postal_zip', label: __('Postal Zip', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false }
  ]

  const allActions = [
    { key: '1', label: __('Create Contact', 'bit-integrations') },
    { key: '2', label: __('Add tag to user', 'bit-integrations') }
  ]
  const [groundhoggConf, setGroundhoggConf] = useState({
    name: 'Groundhogg',
    type: 'Groundhogg',
    domainName: siteURL,
    token: '',
    public_key: '',
    id: '',
    mainAction: '',
    addTagToUser: '',
    emailAddress: '',
    showMeta: false,
    optin_status: '1',
    field_map: [{ formField: '', GroundhoggMapField: '' }],
    field_map_meta: [{ formField: '', GroundhoggMetaMapField: '' }],
    contactsFields,
    contactMetaFields,
    allActions,
    address_field: [],
    actions: {}
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (groundhoggConf.mainAction === '1' && !checkMappedFields(groundhoggConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (groundhoggConf.showMeta && !checkMetaMappedFields(groundhoggConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (groundhoggConf.mainAction === '2' && groundhoggConf?.emailAddress === '') {
      setSnackbar({
        show: true,
        msg: __('Please select Email field to continue.', 'bit-integrations')
      })
      return
    }
    if (groundhoggConf.mainAction === '2' && groundhoggConf?.addTagToUser === '') {
      setSnackbar({
        show: true,
        msg: __('Please select All Tags field to continue.', 'bit-integrations')
      })
      return
    }
    if (groundhoggConf.listId !== '') {
      setstep(3)
    }
  }
  const isDisabled = !(groundhoggConf.mainAction === '2' && groundhoggConf.addTagToUser !== '')

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <GroundhoggAuthorization
        groundhoggConf={groundhoggConf}
        setGroundhoggConf={setGroundhoggConf}
        step={step}
        setstep={setstep}
        setIsLoading={setIsLoading}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <GroundhoggIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, groundhoggConf, setGroundhoggConf, setIsLoading, setSnackbar)
          }
          groundhoggConf={groundhoggConf}
          setGroundhoggConf={setGroundhoggConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={
            (groundhoggConf.mainAction === '2'
              ? isDisabled
              : !(groundhoggConf.field_map?.length >= 1)) || isLoading
          }
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: groundhoggConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={groundhoggConf}
        setDataConf={setGroundhoggConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Groundhogg

/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $appConfigState, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import ConditionalLogic from '../../ConditionalLogic'
import LoaderSm from '../../Loaders/LoaderSm'
import DropDown from '../../Utilities/DropDown'
import SnackMsg from '../../Utilities/SnackMsg'
import TableCheckBox from '../../Utilities/TableCheckBox'
import TinyMCE from '../../Utilities/TinyMCE'
import TutorialLink from '../../Utilities/TutorialLink'
import EditFormInteg from '../EditFormInteg'
import EditWebhookInteg from '../EditWebhookInteg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'

function Mail({ allIntegURL, isInfo, edit, isLearnDash = false, learnDashConf }) {
  const [flow, setFlow] = useRecoilState($newFlow)
  const [conf, setConf] = useRecoilState($actionConf)
  const { userMail } = useRecoilValue($appConfigState)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [snack, setSnackbar] = useState({ show: false })
const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const mailOptions = () => {
    const mail = []
    if (emailInFormField()) {
      const flds = []

      formFields.map(fld => {
        if (fld.type === 'email') {
          flds.push({ label: fld.label, value: `\${${fld.name}}` })
        }
      })
      mail.push({ title: __('Form Fields', 'bit-integrations'), type: 'group', childs: flds })
    }

    if (userMail && Array.isArray(userMail)) {
      mail.push({ title: __('WP Emails', 'bit-integrations'), type: 'group', childs: userMail })
    }

    return mail
  }

  useEffect(() => {
    if (flow?.flow_details || edit) {
      const tmpConf = { ...flow?.flow_details }
      setConf(tmpConf)
    } else {
      const tmpConf = { ...conf }
      if (conf && !conf?.type) {
        tmpConf.type = isLearnDash ? 'LearnDash' : 'Mail'
      }
      if (conf && !conf?.condition) {
        tmpConf.name = isLearnDash ? 'Send Email Leader' : 'Mail Integrations'
        tmpConf.condition = {
          action_behavior: '',
          actions: [{ field: '', action: 'value' }],
          logics: [{ field: '', logic: '', val: '' }, 'or', { field: '', logic: '', val: '' }]
        }
        setConf(tmpConf)
      }
    }
  }, [])

  const checkedCondition = (val, checked) => {
    const tmpConf = { ...conf }
    if (checked) {
      tmpConf.condition.action_behavior = val
    } else {
      tmpConf.condition.action_behavior = ''
    }
    setConf(tmpConf)
  }

  /*  if (bits.userMail && Array.isArray(bits.userMail)) {
           mail.push({ title: 'WP Emails', type: 'group', childs: bits.userMail })
       } */

  // const getValueFromArr = (key, subkey) => {
  //   const value = workFlows[lgcGrpInd].successAction.find(val => val.type === key)
  //   if (value !== undefined) { return value.details[subkey] }
  //   return ''
  // }

  const setEmailSetting = (typ, e) => {
    const tmpConf = { ...conf }
    if (typ === 'to') {
      tmpConf.to = e ? e.split(',') : []
    } else if (typ === 'cc') {
      tmpConf.cc = e ? e.split(',') : []
    } else if (typ === 'bcc') {
      tmpConf.bcc = e ? e.split(',') : []
    } else if (typ === 'replyto') {
      tmpConf.replyto = e ? e.split(',') : []
    } else if (typ === 'attachment') {
      tmpConf.attachment = e ? e.split(',') : []
    } else {
      tmpConf[typ] = e
    }
    setConf(tmpConf)
  }

  const emailInFormField = () => {
    for (const field of formFields) {
      if (field.type === 'email') {
        return true
      }
    }
    return false
  }
  const fileInFormField = () => {
    const file = []
    for (const field of formFields) {
      if (field.type === 'file') {
        file.push({ label: field.label, value: field.name })
      }
    }
    return file
  }

  const addFieldToSubject = ({ target: { value } }) => {
    setConf(prv => ({ ...prv, subject: (prv.subject !== undefined ? prv.subject : '') + value }))
    setTimeout(() => {
      value = ''
    }, 100)
  }

  const saveConfig = () => {
    if (!conf.name) {
      setSnackbar({ show: true, msg: __("Integration name can't be empty", 'bit-integrations') })
      return
    }
    if (!conf.to) {
      setSnackbar({ show: true, msg: __("Email Receiver can't be empty", 'bit-integrations') })
      return
    }
    const allConf = { ...conf, learnDashConf }
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, allConf, navigate, '', edit, setIsLoading)
    resp.then(res => {
      if (res.success) {
        if (edit) {
          toast.success('Integration Updated Successfully')
        }
        toast.success('Integration Created Successfully')
      } else {
        toast.error(res.data || res)
      }
    })
  }

  const onChangeHandler = val => {
    setConf(prv => ({ ...prv, body: val }))
    // setEmailSetting('body', val)
  }

  // const getValueFromArr = (key, subkey, lgcGrpInd) => {
  //   const value = fileInFormField?.filter(val => val.type === key)
  //   if (value !== undefined) { return value.details[subkey] }
  //   return ''
  // }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
            <TutorialLink linkKey="mailLinks" />

      <span className="f-m wdt-200 d-in-b">{__('Integration Name', 'bit-integration')}</span>
      <input
        className="btcd-paper-inp w-5 mt-1"
        onChange={e => setEmailSetting('name', e.target.value)}
        name="name"
        value={conf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <br />
      <br />
      {edit && <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />}

      <DropDown
        action={val => setEmailSetting('from', val)}
        placeholder={__('Add mail from address', 'bit-integrations')}
        value={conf.from}
        title={<span className="f-m wdt-200 d-in-b">{__('From', 'bit-integrations')}</span>}
        titleClassName="mt-2 flx"
        className="w-5"
        addable
        options={mailOptions(conf.from)}
      />
      <DropDown
        action={val => setEmailSetting('to', val)}
        value={conf.to}
        placeholder={__('Add Email Receiver', 'bit-integrations')}
        title={<span className="f-m wdt-200 d-in-b">{__('To', 'bit-integrations')}</span>}
        isMultiple
        titleClassName="mt-2 flx"
        className="w-5"
        addable
        options={mailOptions(conf.to)}
      />
      <DropDown
        action={val => setEmailSetting('cc', val)}
        value={conf.cc}
        placeholder={__('Add Email CC', 'bit-integrations')}
        title={<span className="f-m wdt-200 d-in-b">{__('CC', 'bit-integrations')}</span>}
        isMultiple
        titleClassName="mt-2 flx"
        className="w-5"
        addable
        options={mailOptions(conf.cc)}
      />
      <DropDown
        action={val => setEmailSetting('bcc', val)}
        placeholder={__('Add Email BCC', 'bit-integrations')}
        value={conf.bcc}
        title={<span className="f-m wdt-200 d-in-b">{__('BCC', 'bit-integrations')}</span>}
        isMultiple
        titleClassName="mt-2 flx"
        className="w-5"
        addable
        options={mailOptions(conf.bcc)}
      />
      <DropDown
        action={val => setEmailSetting('replyto', val)}
        placeholder={__('Reply To', 'bit-integrations')}
        value={conf.replyto}
        title={<span className="f-m wdt-200 d-in-b">{__('Reply To', 'bit-integrations')}</span>}
        isMultiple
        titleClassName="mt-2 flx"
        className="w-5"
        addable
        options={mailOptions(conf.replyto)}
      />
      <DropDown
        action={value => setEmailSetting('attachment', value)}
        placeholder={__('Attachment', 'bit-integrations')}
        value={conf?.attachment || []}
        title={<span className="f-m wdt-200 d-in-b">{__('Attachment', 'bit-integrations')}</span>}
        isMultiple
        disableChip={false}
        customValue={false}
        addable
        titleClassName="mt-2 flx"
        className="w-5"
        options={fileInFormField()}
      />
      <div className="mt-2 mb-4 flx">
        <span className="f-m wdt-200 d-in-b">Subject:</span>
        <input
          onChange={e => setEmailSetting('subject', e.target.value)}
          name="sub"
          type="text"
          className="btcd-paper-inp w-5"
          placeholder="Email Subject Here"
          value={conf.subject}
        />
        <select onChange={addFieldToSubject} className="btcd-paper-inp ml-2" style={{ width: '20%' }}>
          {/* <option value="">{__('Add form field', 'bit-integrations')}</option>
          {formFields !== null && formFields.map(f => !f.type.match(/^(file|recaptcha)$/) && <option key={f.name} value={`\${${f.name}}`}>{f.label}</option>)} */}
          <option value="">{__('Add field', 'bit-integrations')}</option>
          <optgroup label={__('Form Fields', 'bit-integrations')}>
            {formFields !== null &&
              formFields.map(
                f =>
                  f.type !== undefined &&
                  !f.type.match(/^(file|recaptcha)$/) && (
                    <option key={f.name} value={`\${${f.name}}`}>
                      {f.label}
                    </option>
                  )
              )}
          </optgroup>
          <optgroup
            label={`${__('General Smart Codes', 'bit-integrations')} ${
              isPro ? '' : `(${__('Pro', 'bit-integrations')})`
            }`}>
            {isPro &&
              SmartTagField?.map(f => (
                <option key={`ff-rm-${f.name}`} value={`\${${f.name}}`}>
                  {f.label}
                </option>
              ))}
          </optgroup>
        </select>
      </div>
      <TinyMCE
        id="conf-mail"
        formFields={formFields}
        value={conf.body}
        onChangeHandler={onChangeHandler}
        width="100%"
      />

      {conf?.condition && (
        <>
          <div className="flx">
            <TableCheckBox
              onChange={e => checkedCondition(e.target.value, e.target.checked)}
              checked={conf?.condition?.action_behavior === 'cond'}
              className="wdt-200 mt-4 mr-2"
              value="cond"
              title={__('Conditional Logics', 'bit_integration')}
            />
          </div>
          <br />
          {conf?.condition?.action_behavior === 'cond' && (
            <ConditionalLogic formFields={formFields} dataConf={conf} setDataConf={setConf} />
          )}
        </>
      )}

      <SaveButton saveConfig={saveConfig} isLoading={isLoading} edit={flow?.flow_details && true} />
    </div>
  )
}

export default Mail

const SaveButton = ({ saveConfig, edit, isLoading }) =>
  edit ? (
    <div className="txt-center w-9 mt-3">
      <button
        onClick={saveConfig}
        className="btn btcd-btn-lg purple sh-sm flx"
        type="button"
        disabled={isLoading}>
        {__('Update', 'bit-integrations')}
        {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
      </button>
    </div>
  ) : (
    <div className="btcd-stp-page txt-center" style={{ width: '100%', height: 'auto' }}>
      <button
        onClick={saveConfig}
        className="btn btcd-btn-lg purple sh-sm"
        type="button"
        disabled={isLoading}>
        {__('Save', 'bit-integrations')}✔
        {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
      </button>
    </div>
  )

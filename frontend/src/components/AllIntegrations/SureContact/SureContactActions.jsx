import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import {
  companyTypeOptions,
  employeeRangeOptions,
  genderOptions,
  needsCompanyType,
  needsGender
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function SureContactActions({ sureContactConf, setSureContactConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const actionHandler = (e, type, valueName) => {
    // Unchecking has to clear the stored value, otherwise the utility stays applied
    // with the checkbox showing off.
    if (sureContactConf?.utilities?.[valueName]) {
      setSureContactConf(prevConf =>
        create(prevConf, draftConf => {
          if (draftConf.utilities) delete draftConf.utilities[valueName]
        })
      )

      return
    }

    setActionMdl({ show: type })
  }

  const setAction = (val, name) => {
    setSureContactConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const renderActionModal = (type, title, prompt, options, valueName) => (
    <ConfirmModal
      className="custom-conf-mdl"
      mainMdlCls="o-v"
      btnClass="purple"
      btnTxt={__('Ok', 'bit-integrations')}
      show={actionMdl.show === type}
      close={clsActionMdl}
      action={clsActionMdl}
      title={title}>
      <div className="btcd-hr mt-2 mb-2" />
      <div className="mt-2">{prompt}</div>
      <div className="flx flx-between mt-2">
        <MultiSelect
          options={options}
          className="msl-wrp-options"
          singleSelect
          closeOnSelect
          defaultValue={sureContactConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  const action = sureContactConf?.mainAction

  return (
    <div className="pos-rel d-flx flx-wrp">
      {needsGender.includes(action) && (
        <>
          <TableCheckBox
            checked={sureContactConf?.utilities?.selected_gender || false}
            onChange={e => actionHandler(e, 'gender', 'selected_gender')}
            className="wdt-200 mt-4 mr-2"
            value="gender"
            title={__('Gender', 'bit-integrations')}
            subTitle={__('Set the contact gender', 'bit-integrations')}
          />
          {renderActionModal(
            'gender',
            __('Gender', 'bit-integrations'),
            __('Select Gender', 'bit-integrations'),
            genderOptions,
            'selected_gender'
          )}
        </>
      )}

      {needsCompanyType.includes(action) && (
        <>
          <TableCheckBox
            checked={sureContactConf?.utilities?.selected_company_type || false}
            onChange={e => actionHandler(e, 'company_type', 'selected_company_type')}
            className="wdt-200 mt-4 mr-2"
            value="company_type"
            title={__('Company Type', 'bit-integrations')}
            subTitle={__('Set the relationship with this company', 'bit-integrations')}
          />
          {renderActionModal(
            'company_type',
            __('Company Type', 'bit-integrations'),
            __('Select Company Type', 'bit-integrations'),
            companyTypeOptions,
            'selected_company_type'
          )}

          <TableCheckBox
            checked={sureContactConf?.utilities?.selected_employee_range || false}
            onChange={e => actionHandler(e, 'employee_range', 'selected_employee_range')}
            className="wdt-200 mt-4 mr-2"
            value="employee_range"
            title={__('Employee Range', 'bit-integrations')}
            subTitle={__('Set the company size bracket', 'bit-integrations')}
          />
          {renderActionModal(
            'employee_range',
            __('Employee Range', 'bit-integrations'),
            __('Select Employee Range', 'bit-integrations'),
            employeeRangeOptions,
            'selected_employee_range'
          )}
        </>
      )}
    </div>
  )
}

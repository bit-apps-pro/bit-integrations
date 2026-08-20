/* eslint-disable no-param-reassign */

import { create } from 'mutative'
import { Fragment, useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  booleanUtilityFields,
  discountTypeOptions,
  updateDiscountTypeOptions,
  updateYesNoOptions,
  yesNoOptions
} from './staticData'

const TOGGLE_ACTIONS = ['toggle_auto_apply', 'toggle_show_in_slideout']

export default function PowerCouponsActions({ powerCouponsConf, setPowerCouponsConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })
  const mainAction = powerCouponsConf?.mainAction

  const isUtilitySet = key => {
    const value = powerCouponsConf?.utilities?.[key]

    return value !== undefined && value !== '' && value !== false
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setUtility = (name, value) => {
    setPowerCouponsConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        draftConf.utilities[name] = value
      })
    )
  }

  const actionHandler = type => {
    setPowerCouponsConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
      })
    )

    setActionMdl({ show: type })
  }

  const renderSelectModal = (type, title, options, valueName) => (
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
      <div className="mt-2">
        {__('Select', 'bit-integrations')} {title}
      </div>
      <div className="flx flx-between mt-2">
        <MultiSelect
          options={options}
          className="msl-wrp-options"
          singleSelect
          closeOnSelect
          defaultValue={powerCouponsConf?.utilities?.[valueName] ?? null}
          onChange={val => setUtility(valueName, val)}
        />
      </div>
    </ConfirmModal>
  )

  const renderSelectUtility = (type, title, valueName, options, subTitle) => (
    <Fragment key={type}>
      <TableCheckBox
        checked={isUtilitySet(valueName)}
        onChange={() => actionHandler(type)}
        className="wdt-200 mt-4 mr-2"
        value={valueName}
        title={title}
        subTitle={subTitle}
      />
      {renderSelectModal(type, title, options, valueName)}
    </Fragment>
  )

  const renderBooleanUtility = field => (
    <TableCheckBox
      key={field.key}
      checked={Boolean(powerCouponsConf?.utilities?.[field.key])}
      onChange={event => setUtility(field.key, event.target.checked)}
      className="wdt-200 mt-4 mr-2"
      value={field.key}
      title={field.label}
      subTitle={field.subTitle}
    />
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {mainAction === 'create_coupon' && (
        <>
          {renderSelectUtility(
            'discount_type',
            __('Discount Type', 'bit-integrations'),
            'discount_type',
            discountTypeOptions,
            __('Set the coupon discount type', 'bit-integrations')
          )}
          {booleanUtilityFields.map(field => renderBooleanUtility(field))}
        </>
      )}

      {mainAction === 'update_coupon' && (
        <>
          {renderSelectUtility(
            'discount_type',
            __('Discount Type', 'bit-integrations'),
            'discount_type',
            updateDiscountTypeOptions,
            __('Update the coupon discount type', 'bit-integrations')
          )}
          {booleanUtilityFields.map(field =>
            renderSelectUtility(field.key, field.label, field.key, updateYesNoOptions, field.subTitle)
          )}
        </>
      )}

      {mainAction === 'delete_coupon' && (
        <TableCheckBox
          checked={Boolean(powerCouponsConf?.utilities?.permanent_delete)}
          onChange={event => setUtility('permanent_delete', event.target.checked)}
          className="wdt-200 mt-4 mr-2"
          value="permanent_delete"
          title={__('Permanently Delete', 'bit-integrations')}
          subTitle={__('Skip trash when deleting coupon', 'bit-integrations')}
        />
      )}

      {TOGGLE_ACTIONS.includes(mainAction) &&
        renderSelectUtility(
          'enabled',
          __('Enabled', 'bit-integrations'),
          'enabled',
          yesNoOptions,
          __('Set enabled status', 'bit-integrations')
        )}
    </div>
  )
}

/* eslint-disable no-param-reassign */

import { create } from 'mutative'
import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { yesNoOptions } from './staticData'

export default function PointicsActions({ pointicsConf, setPointicsConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setAction = (val, name) => {
    setPointicsConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const renderActionModal = (type, title, valueName) => (
    <ConfirmModal
      className="custom-conf-mdl"
      mainMdlCls="o-v"
      btnClass="purple"
      btnTxt={__('Ok', 'bit-integrations')}
      show={actionMdl.show === type}
      close={clsActionMdl}
      action={clsActionMdl}
      title={title}>
      <div className="mt-3">
        <MultiSelect
          className="msl-wrp-options"
          defaultValue={pointicsConf?.utilities?.[valueName] ?? null}
          options={yesNoOptions}
          onChange={val => setAction(val, valueName)}
          singleSelect
          closeOnSelect
        />
      </div>
    </ConfirmModal>
  )

  return (
    <div className="mt-3">
      {pointicsConf?.mainAction === 'redeem_reward' && (
        <>
          <TableCheckBox
            checked={pointicsConf?.utilities?.selected_apply_to_cart || false}
            onChange={() => setActionMdl({ show: 'apply_to_cart' })}
            className="wdt-200 mt-4 mr-2"
            value="apply_to_cart"
            title={__('Apply To Cart', 'bit-integrations')}
            subTitle={__('Hand the minted coupon to the current cart', 'bit-integrations')}
          />
          {renderActionModal(
            'apply_to_cart',
            __('Apply To Cart', 'bit-integrations'),
            'selected_apply_to_cart'
          )}
        </>
      )}

      {pointicsConf?.mainAction === 'recompute_member_tier' && (
        <>
          <TableCheckBox
            checked={pointicsConf?.utilities?.selected_promote_only || false}
            onChange={() => setActionMdl({ show: 'promote_only' })}
            className="wdt-200 mt-4 mr-2"
            value="promote_only"
            title={__('Promote Only', 'bit-integrations')}
            subTitle={__('Never demote a member on recompute', 'bit-integrations')}
          />
          {renderActionModal(
            'promote_only',
            __('Promote Only', 'bit-integrations'),
            'selected_promote_only'
          )}
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { redirectionOptions, yesNoOptions } from './staticData'

/**
 * Optional link settings. Redirection falls back to 301 and the flags are left
 * untouched when unset, so all three are opt-in here rather than always-visible
 * selects in the integration layout.
 */
export default function ClickWhaleActions({ clickWhaleConf, setClickWhaleConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setClickWhaleConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const renderActionModal = (type, title, options, valueName) => (
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
      <div className="mt-2">{title}</div>
      <div className="flx flx-between mt-2">
        <MultiSelect
          options={options}
          className="msl-wrp-options"
          singleSelect
          closeOnSelect
          defaultValue={clickWhaleConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      <TableCheckBox
        checked={clickWhaleConf?.utilities?.selected_redirection || false}
        onChange={() => setActionMdl({ show: 'redirection' })}
        className="wdt-200 mt-4 mr-2"
        value="redirection"
        title={__('Redirect Type', 'bit-integrations')}
        subTitle={__('Defaults to 301', 'bit-integrations')}
      />
      {renderActionModal(
        'redirection',
        __('Redirect Type', 'bit-integrations'),
        redirectionOptions,
        'selected_redirection'
      )}

      <TableCheckBox
        checked={clickWhaleConf?.utilities?.selected_nofollow || false}
        onChange={() => setActionMdl({ show: 'nofollow' })}
        className="wdt-200 mt-4 mr-2"
        value="nofollow"
        title={__('Nofollow', 'bit-integrations')}
        subTitle={__('Add rel="nofollow"', 'bit-integrations')}
      />
      {renderActionModal(
        'nofollow',
        __('Nofollow', 'bit-integrations'),
        yesNoOptions,
        'selected_nofollow'
      )}

      <TableCheckBox
        checked={clickWhaleConf?.utilities?.selected_sponsored || false}
        onChange={() => setActionMdl({ show: 'sponsored' })}
        className="wdt-200 mt-4 mr-2"
        value="sponsored"
        title={__('Sponsored', 'bit-integrations')}
        subTitle={__('Add rel="sponsored"', 'bit-integrations')}
      />
      {renderActionModal(
        'sponsored',
        __('Sponsored', 'bit-integrations'),
        yesNoOptions,
        'selected_sponsored'
      )}
    </div>
  )
}

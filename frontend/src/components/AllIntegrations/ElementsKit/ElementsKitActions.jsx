import { create } from 'mutative'
import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  activationOptions,
  conditionOptions,
  forceDeleteOptions,
  singularConditionOptions,
  statusOptions,
  templateTypeOptions
} from './staticData'

const STATUS_ACTIONS = [
  'create_template',
  'update_template',
  'create_widget',
  'update_widget',
  'create_content',
  'update_content'
]
const CONDITION_ACTIONS = ['create_template', 'update_template']
const DELETE_ACTIONS = ['delete_template', 'delete_widget', 'delete_content']

export default function ElementsKitActions({ elementsKitConf, setElementsKitConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })

  const actionHandler = type => setActionMdl({ show: type })

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setElementsKitConf(prevConf =>
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
          defaultValue={elementsKitConf?.utilities?.[valueName] || undefined}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {STATUS_ACTIONS.includes(elementsKitConf?.mainAction) && (
        <>
          <TableCheckBox
            checked={elementsKitConf?.utilities?.selected_status || false}
            onChange={() => actionHandler('status')}
            className="wdt-200 mt-4 mr-2"
            value="status"
            title={__('Status', 'bit-integrations')}
            subTitle={__('Set the post status', 'bit-integrations')}
          />
          {renderActionModal(
            'status',
            __('Select Status', 'bit-integrations'),
            statusOptions,
            'selected_status'
          )}
        </>
      )}

      {elementsKitConf?.mainAction === 'update_template' && (
        <>
          <TableCheckBox
            checked={elementsKitConf?.utilities?.selected_type || false}
            onChange={() => actionHandler('type')}
            className="wdt-200 mt-4 mr-2"
            value="type"
            title={__('Template Type', 'bit-integrations')}
            subTitle={__('Change the template type', 'bit-integrations')}
          />
          {renderActionModal(
            'type',
            __('Select Template Type', 'bit-integrations'),
            templateTypeOptions,
            'selected_type'
          )}
        </>
      )}

      {CONDITION_ACTIONS.includes(elementsKitConf?.mainAction) && (
        <>
          <TableCheckBox
            checked={elementsKitConf?.utilities?.selected_activation || false}
            onChange={() => actionHandler('activation')}
            className="wdt-200 mt-4 mr-2"
            value="activation"
            title={__('Activation', 'bit-integrations')}
            subTitle={__('Activate the header or footer', 'bit-integrations')}
          />
          {renderActionModal(
            'activation',
            __('Select Activation', 'bit-integrations'),
            activationOptions,
            'selected_activation'
          )}

          <TableCheckBox
            checked={elementsKitConf?.utilities?.selected_condition || false}
            onChange={() => actionHandler('condition')}
            className="wdt-200 mt-4 mr-2"
            value="condition"
            title={__('Display Condition', 'bit-integrations')}
            subTitle={__('Where the template renders', 'bit-integrations')}
          />
          {renderActionModal(
            'condition',
            __('Select Display Condition', 'bit-integrations'),
            conditionOptions,
            'selected_condition'
          )}

          <TableCheckBox
            checked={elementsKitConf?.utilities?.selected_condition_singular || false}
            onChange={() => actionHandler('condition_singular')}
            className="wdt-200 mt-4 mr-2"
            value="condition_singular"
            title={__('Singular Condition', 'bit-integrations')}
            subTitle={__('Narrow a singular display condition', 'bit-integrations')}
          />
          {renderActionModal(
            'condition_singular',
            __('Select Singular Condition', 'bit-integrations'),
            singularConditionOptions,
            'selected_condition_singular'
          )}
        </>
      )}

      {DELETE_ACTIONS.includes(elementsKitConf?.mainAction) && (
        <>
          <TableCheckBox
            checked={elementsKitConf?.utilities?.selected_force_delete || false}
            onChange={() => actionHandler('force_delete')}
            className="wdt-200 mt-4 mr-2"
            value="force_delete"
            title={__('Delete Mode', 'bit-integrations')}
            subTitle={__('Trash or delete permanently', 'bit-integrations')}
          />
          {renderActionModal(
            'force_delete',
            __('Select Delete Mode', 'bit-integrations'),
            forceDeleteOptions,
            'selected_force_delete'
          )}
        </>
      )}
    </div>
  )
}

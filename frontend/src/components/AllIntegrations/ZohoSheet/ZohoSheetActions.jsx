/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import Loader from '../../Loaders/Loader'

export default function ZohoSheetActions({ zohoSheetConf, setZohoSheetConf, loading, setLoading }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })
  const actionHandler = (e, type) => {
    const newConf = { ...zohoSheetConf }
    if (type === 'tag') {
      if (e.target?.checked) {
        newConf.actions.tags = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.tags
      }
      setActionMdl({ show: 'tag' })
    }
    if (type === 'update') {
      if (e.target.checked) {
        newConf.actions.update = true
      } else {
        delete newConf.actions.update
      }
    }
    if (type === 'status') {
      if (e.target.checked) {
        newConf.actions.status = true
      } else {
        delete newConf.actions.status
      }
    }
    setZohoSheetConf({ ...newConf })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setChanges = val => {
    const newConf = { ...zohoSheetConf }
    newConf.selectedTags = val
    setZohoSheetConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={zohoSheetConf?.selectedTags.length || false}
        onChange={e => actionHandler(e, 'tag')}
        className="wdt-200 mt-4 mr-2"
        value="tags"
        title={__('Add Tags', 'bit - integrations')}
        subTitle={__('Selects tags for contact')}
      />
      <TableCheckBox
        checked={zohoSheetConf.actions?.update || false}
        onChange={e => actionHandler(e, 'update')}
        className="wdt-200 mt-4 mr-2"
        value="update_contact"
        title={__('Update Contact', 'bit-integrations')}
        subTitle={__("Update an existing contact's info by responses.", 'bit-integrations')}
      />
      <TableCheckBox
        checked={zohoSheetConf.actions?.status || false}
        onChange={e => actionHandler(e, 'status')}
        className="wdt-200 mt-4 mr-2"
        value="subscriber_status"
        title={__('Unsubscribe contact', 'bit-integrations')}
        subTitle={__('Set the contact status to "unsubscribed".', 'bit-integrations')}
      />
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'tag'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Tags', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select tags', 'bit-integrations')}</div>
        {loading.tags ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <MultiSelect
              options={zohoSheetConf?.tags?.map(tag => ({ label: tag.name, value: tag.name }))}
              className="msl-wrp-options"
              defaultValue={zohoSheetConf?.selectedTags}
              onChange={val => setChanges(val)}
            />
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}

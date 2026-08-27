import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { getSegments } from './FlodeskCommonFunc'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function FlodeskActions({ flodeskConf, setFlodeskConf, setIsLoading }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setAction = (val, name) => {
    setFlodeskConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const clearAction = valueName =>
    setFlodeskConf(prevConf =>
      create(prevConf, draftConf => {
        if (draftConf.utilities) delete draftConf.utilities[valueName]
      })
    )

  // Unchecking has to clear the stored value, otherwise the utility stays applied
  // with the checkbox showing off.
  const actionHandler = (type, valueName) => {
    if (flodeskConf?.utilities?.[valueName]) {
      clearAction(valueName)

      return
    }

    if (type === null) {
      setAction(true, valueName)

      return
    }

    if (type === 'segments' && !flodeskConf?.default?.segments?.length) {
      getSegments(flodeskConf, setFlodeskConf, setIsLoading)
    }

    setActionMdl({ show: type })
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      <TableCheckBox
        checked={flodeskConf?.utilities?.selected_double_optin || false}
        onChange={() => actionHandler(null, 'selected_double_optin')}
        className="wdt-200 mt-4 mr-2"
        value="double_optin"
        title={__('Double Opt-in', 'bit-integrations')}
        subTitle={__('Send a confirmation email before activating', 'bit-integrations')}
      />

      <TableCheckBox
        checked={!!flodeskConf?.utilities?.selected_segment_ids?.length}
        onChange={() => actionHandler('segments', 'selected_segment_ids')}
        className="wdt-200 mt-4 mr-2"
        value="segments"
        title={__('Segments', 'bit-integrations')}
        subTitle={__('Add the subscriber to segments', 'bit-integrations')}
      />

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'segments'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Segments', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Segments', 'bit-integrations')}</div>
        <div className="flx flx-between mt-2">
          <MultiSelect
            options={(flodeskConf?.default?.segments || []).map(({ segmentId, segmentName }) => ({
              label: segmentName,
              value: String(segmentId)
            }))}
            className="msl-wrp-options"
            defaultValue={flodeskConf?.utilities?.selected_segment_ids?.join(',') || undefined}
            onChange={val => setAction(val.split(',').filter(Boolean), 'selected_segment_ids')}
          />
        </div>
      </ConfirmModal>
    </div>
  )
}

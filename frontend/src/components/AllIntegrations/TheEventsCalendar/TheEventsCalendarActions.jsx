import { Fragment, useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { listConfKey } from './theEventsCalendarCommonFunctions'
import { utilitiesByAction } from './theEventsCalendarConstants'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const valueName = key => `selected_${key}`

export default function TheEventsCalendarActions({ theEventsCalendarConf, setTheEventsCalendarConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const utilities = utilitiesByAction[theEventsCalendarConf?.selectedTask] || []

  const clsActionMdl = () => setActionMdl({ show: false })

  const setUtility = (key, value) => {
    setTheEventsCalendarConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (value) {
          draftConf.utilities[valueName(key)] = value
        } else {
          delete draftConf.utilities[valueName(key)]
        }
      })
    )
  }

  const selectHandler = (id, key) => {
    if (theEventsCalendarConf?.utilities?.[valueName(key)]) {
      setUtility(key, '')
      return
    }

    setActionMdl({ show: id })
  }

  const toggleCheckbox = (key, value) => {
    const isChecked = theEventsCalendarConf?.utilities?.[valueName(key)] === value
    setUtility(key, isChecked ? '' : value)
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {utilities.map(({ checkbox, id, key, list, multi, options, subTitle, title, value }) => {
        const selected = theEventsCalendarConf?.utilities?.[valueName(key)]
        const selectOptions = list ? theEventsCalendarConf?.[listConfKey(list)] || [] : options

        return (
          <Fragment key={id}>
            <TableCheckBox
              checked={checkbox ? selected === value : !!selected}
              onChange={() => (checkbox ? toggleCheckbox(key, value) : selectHandler(id, key))}
              className="wdt-200 mt-4 mr-2"
              value={id}
              title={title}
              subTitle={subTitle}
            />
            {!checkbox && (
              <ConfirmModal
                className="custom-conf-mdl"
                mainMdlCls="o-v"
                btnClass="purple"
                btnTxt={__('Ok', 'bit-integrations')}
                show={actionMdl.show === id}
                close={clsActionMdl}
                action={clsActionMdl}
                title={title}>
                <div className="btcd-hr mt-2 mb-2" />
                <div className="mt-2">{subTitle}</div>
                <div className="flx flx-between mt-2">
                  <MultiSelect
                    key={`${id}-${selectOptions.length}`}
                    options={selectOptions}
                    className="msl-wrp-options"
                    singleSelect={!multi}
                    closeOnSelect={!multi}
                    defaultValue={selected || undefined}
                    onChange={val => setUtility(key, val)}
                  />
                </div>
              </ConfirmModal>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

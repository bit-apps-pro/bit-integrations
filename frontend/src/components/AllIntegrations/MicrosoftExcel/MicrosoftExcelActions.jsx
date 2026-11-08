import { Fragment, useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { utilitiesByAction } from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const valueName = key => `selected_${key}`

export default function MicrosoftExcelActions({ microsoftExcelConf, setMicrosoftExcelConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const utilities = utilitiesByAction[microsoftExcelConf?.mainAction] || []

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setUtility = (key, value) => {
    setMicrosoftExcelConf(prevConf =>
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

  const actionHandler = key => {
    if (microsoftExcelConf?.utilities?.[valueName(key)]) {
      setUtility(key, '')
      return
    }

    setActionMdl({ show: key })
  }

  const toggleCheckbox = (key, value) => {
    setUtility(key, microsoftExcelConf?.utilities?.[valueName(key)] === value ? '' : value)
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {utilities.map(({ checkbox, key, options, subTitle, title, value }) => {
        const selected = microsoftExcelConf?.utilities?.[valueName(key)]

        return (
          <Fragment key={key}>
            <TableCheckBox
              checked={checkbox ? selected === value : !!selected}
              onChange={() => (checkbox ? toggleCheckbox(key, value) : actionHandler(key))}
              className="wdt-200 mt-4 mr-2"
              value={key}
              title={title}
              subTitle={subTitle}
            />
            {!checkbox && (
              <ConfirmModal
                className="custom-conf-mdl"
                mainMdlCls="o-v"
                btnClass="purple"
                btnTxt={__('Ok', 'bit-integrations')}
                show={actionMdl.show === key}
                close={clsActionMdl}
                action={clsActionMdl}
                title={title}>
                <div className="btcd-hr mt-2 mb-2" />
                <div className="mt-2">{subTitle}</div>
                <div className="flx flx-between mt-2">
                  <MultiSelect
                    options={options}
                    className="msl-wrp-options"
                    singleSelect
                    closeOnSelect
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

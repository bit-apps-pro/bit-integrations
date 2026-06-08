import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import Cooltip from '../../Utilities/Cooltip'
import SnackMsg from '../../Utilities/SnackMsg'
import TableCheckBox from '../../Utilities/TableCheckBox'
import FieldMap from './FieldMap'
import { addFieldMap } from './UserHelperFunction'

export default function UserFieldMap({ formFields, userConf, setUserConf, userFields }) {
  const [snack, setSnackbar] = useState({ show: false })
  const handleInput = e => {
    const tmpConf = { ...userConf }
    const { name, value } = e.target
    tmpConf[name] = value
    setUserConf(tmpConf)
  }

  return (
    <>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div>
        <div>
          <div>
            <div className="mt-3 mb-1">
              <b>{__('Field Mappping', 'bit-integrations')}</b>
            </div>
            <div className="btcd-hr" />
            <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
              <div className="txt-dp">
                <b>{__('Form Fields', 'bit-integrations')}</b>
              </div>
              <div className="txt-dp">
                <b>{__('User Fields', 'bit-integrations')}</b>
              </div>
            </div>
          </div>

          {userConf?.user_map?.map((itm, i) => (
            <FieldMap
              key={`analytics-m-${i + 9}`}
              i={i}
              type="user"
              field={itm}
              formFields={formFields}
              userConf={userConf}
              setUserConf={setUserConf}
              customFields={userFields}
              setSnackbar={setSnackbar}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap('user_map', userConf?.user_map?.length, userConf, setUserConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

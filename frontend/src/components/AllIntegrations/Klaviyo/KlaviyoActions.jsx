/* eslint-disable no-param-reassign */

import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { ProFeatureSubtitle, ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'

export default function KlaviyoActions({ klaviyoConf, setKlaviyoConf, loading, setLoading }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const actionHandler = (e, type) => {
    const newConf = { ...klaviyoConf }
    if (e.target?.checked) {
      newConf['update'] = true
    } else {
      delete newConf.update
    }

    setKlaviyoConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={klaviyoConf?.update || false}
        onChange={e => actionHandler(e, 'update')}
        className="wdt-200 mt-4 mr-2"
        value="update"
        isInfo={!isPro}
        title={<ProFeatureTitle title={__('Update Profile', 'bit-integrations')} />}
        subTitle={
          <ProFeatureSubtitle
            title={__('Update Profile', 'bit-integrations')}
            subTitle={__(
              'A record gets updated based on the email, else a new profile will be created',
              'bit-integrations'
            )}
            proVersion="2.4.9"
          />
        }
      />
    </div>
  )
}

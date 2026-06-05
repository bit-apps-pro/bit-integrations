import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'

const ProFeatureTitle = ({ title }) => {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  return (
    <span>
      {title} &nbsp;
      {!isPro && <span className="pro-btn">{__('Pro', 'bit-integrations')}</span>}
    </span>
  )
}

const ProFeatureSubtitle = ({ title, subTitle, proVersion }) => {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  return (
    <span>
      {isPro
        ? subTitle
        : sprintf(
          __(
            'The Bit Integrations Pro v(%s) plugin needs to be installed and activated to enable the %s feature',
            'bit-integrations'
          ),
          proVersion,
          title
        )}
    </span>
  )
}

export { ProFeatureTitle, ProFeatureSubtitle }

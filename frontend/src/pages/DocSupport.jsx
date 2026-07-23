import DocIcn from '../Icons/DocIcn'
import ExternalLinkIcn from '../resource/img/supportIcon/ExternalLinkIcn'
import FacebookLogo from '../resource/img/supportIcon/FacebookLogo'
import MessagesCircle from '../resource/img/supportIcon/MessengerIcon'
import WordPressLogo from '../resource/img/supportIcon/WordPressLogo'
import SupportIcon from '../resource/img/supportIcon/SupportIcon'
import YoutubeLogo from '../resource/img/supportIcon/YoutubeLogo'
import bitAssist from '../resource/img/products/bit-assist.svg'
import bitFileManager from '../resource/img/products/file-manager.png'
import bitForm from '../resource/img/products/bit-form.png'
import bitPi from '../resource/img/products/bit-pi.svg'
import bitSmtp from '../resource/img/products/bit-smtp.png'
import bitSocial from '../resource/img/products/bit-social.png'
import { __ } from '../Utils/i18nwrap'

const DOC_URL = 'https://bit-integrations.com/wp-docs/'
const CHAT_URL = 'https://tawk.to/chat/60eac4b6d6e7610a49aab375/1faah0r3e'

const getChannels = () => [
  {
    key: 'youtube',
    icon: <YoutubeLogo size="20" />,
    label: __('Video tutorials', 'bit-integrations'),
    meta: __('Watch setup walkthroughs on our YouTube channel', 'bit-integrations'),
    url: 'https://www.youtube.com/channel/UCjUl8UGn-G6zXZ-Wpd7Sc3g'
  },
  {
    key: 'facebook',
    icon: <FacebookLogo size="20" />,
    label: __('Facebook community', 'bit-integrations'),
    meta: __('Ask other users and share what you have built', 'bit-integrations'),
    url: 'https://www.facebook.com/groups/3308027439209387'
  },
  {
    key: 'review',
    icon: <WordPressLogo size="20" />,
    label: __('Rate us on WordPress.org', 'bit-integrations'),
    meta: __('Reviews keep the plugin free and actively maintained', 'bit-integrations'),
    url: 'https://wordpress.org/support/plugin/bit-integrations/reviews/#new-post'
  }
]

const getProducts = () => [
  {
    name: 'Bit Flows',
    description: __('AI agent automation & integrations for forms, CRM and more.', 'bit-integrations'),
    slug: 'bit-pi',
    url: 'https://wordpress.org/plugins/bit-pi/',
    image: bitPi
  },
  {
    name: 'Bit Social',
    description: __('Auto post scheduler for sharing your blog to social media.', 'bit-integrations'),
    slug: 'bit-social',
    url: 'https://wordpress.org/plugins/bit-social/',
    image: bitSocial
  },
  {
    name: 'Bit Form',
    description: __('Drag & drop contact form and payment form builder.', 'bit-integrations'),
    slug: 'bit-form',
    url: 'https://wordpress.org/plugins/bit-form/',
    image: bitForm
  },
  {
    name: 'Bit Assist',
    description: __('Connect every support channel behind a single button.', 'bit-integrations'),
    slug: 'bit-assist',
    url: 'https://wordpress.org/plugins/bit-assist/',
    image: bitAssist
  },
  {
    name: 'Bit File Manager',
    description: __('A 100% free file manager for WordPress.', 'bit-integrations'),
    slug: 'file-manager',
    url: 'https://wordpress.org/plugins/file-manager/',
    image: bitFileManager
  },
  {
    name: 'Bit SMTP',
    description: __('Reliable SMTP delivery for every email WordPress sends.', 'bit-integrations'),
    slug: 'bit-smtp',
    url: 'https://wordpress.org/plugins/bit-smtp/',
    image: bitSmtp
  }
]

function DocSupport() {
  const channels = getChannels()
  const products = getProducts()

  return (
    <div className="btcd-pg" id="btcd-doc-page">
      <header className="btcd-pg-head">
        <h1 className="btcd-pg-title">{__('Documentation & support', 'bit-integrations')}</h1>
        <p className="btcd-pg-sub">
          {__(
            'Guides for every trigger and action — plus a real person when a guide is not enough.',
            'bit-integrations'
          )}
        </p>
      </header>

      <div className="btcd-pg-body">
        <section className="btcd-doc-hero">
          <a
            className="btcd-doc-card btcd-doc-card--primary"
            href={DOC_URL}
            target="_blank"
            rel="noopener noreferrer">
            <span className="btcd-doc-card-icn" aria-hidden="true">
              <DocIcn size="22" />
            </span>
            <h2 className="btcd-doc-card-title">{__('Read the documentation', 'bit-integrations')}</h2>
            <p className="btcd-doc-card-txt">
              {__(
                'Bit Integrations is built to be self-explanatory, so the docs stay short. When a trigger, action or field mapping is not behaving the way you expect, start here.',
                'bit-integrations'
              )}
            </p>
            <span className="btcd-doc-card-cta">
              {__('Browse the docs', 'bit-integrations')}
              <ExternalLinkIcn size="14" />
            </span>
          </a>

          <div className="btcd-doc-card btcd-doc-card--contact">
            <span className="btcd-doc-card-icn btcd-doc-card-icn--soft" aria-hidden="true">
              <SupportIcon size="22" />
            </span>
            <h2 className="btcd-doc-card-title">{__('Talk to a human', 'bit-integrations')}</h2>
            <p className="btcd-doc-card-txt">
              {__(
                'Free or Pro, the support is the same. Email us or open a live chat and our team will pick it up.',
                'bit-integrations'
              )}
            </p>
            <div className="btcd-doc-contact-actions">
              <a className="btcd-doc-btn btcd-doc-btn--solid" href="mailto:support@bitapps.pro">
                support@bitapps.pro
              </a>
              <a
                className="btcd-doc-btn"
                href={CHAT_URL}
                target="_blank"
                rel="noopener noreferrer">
                <MessagesCircle size="16" />
                {__('Start a live chat', 'bit-integrations')}
              </a>
            </div>
          </div>
        </section>

        <section className="btcd-group">
          <h2 className="btcd-group-title">{__('Community & feedback', 'bit-integrations')}</h2>
          <div className="btcd-panel">
            {channels.map(channel => (
              <a
                key={channel.key}
                className="btcd-link-row"
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer">
                <span className="btcd-link-row-icn" aria-hidden="true">
                  {channel.icon}
                </span>
                <span className="btcd-link-row-txt">
                  <span className="btcd-link-row-lbl">{channel.label}</span>
                  <span className="btcd-link-row-meta">{channel.meta}</span>
                </span>
                <span className="btcd-link-row-arw" aria-hidden="true">
                  <ExternalLinkIcn size="15" />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="btcd-group">
          <h2 className="btcd-group-title">{__('More from Bit Apps', 'bit-integrations')}</h2>
          <div className="btcd-prod-grid">
            {products.map(product => (
              <a
                key={product.slug}
                className="btcd-prod-card"
                href={product.url}
                target="_blank"
                rel="noopener noreferrer">
                <img
                  className="btcd-prod-logo"
                  loading="lazy"
                  src={product.image}
                  alt=""
                  aria-hidden="true"
                />
                <span className="btcd-prod-txt">
                  <span className="btcd-prod-name">{product.name}</span>
                  <span className="btcd-prod-desc">{product.description}</span>
                </span>
                <span className="btcd-prod-arw" aria-hidden="true">
                  <ExternalLinkIcn size="14" />
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DocSupport

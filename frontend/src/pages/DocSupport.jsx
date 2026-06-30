import { Suspense, useEffect, useState } from 'react'
import SnackMsg from '../components/Utilities/SnackMsg'
import ExternalLinkIcn from '../resource/img/supportIcon/ExternalLinkIcn'
import FacebookIcn from '../resource/img/supportIcon/FbIcon'
import MessagesCircle from '../resource/img/supportIcon/MessengerIcon'
import ReviewStarIcn from '../resource/img/supportIcon/ReviewStarIcon'
import YoutubeIcn from '../resource/img/supportIcon/YoutubeIcon'
import { __ } from '../Utils/i18nwrap'
import bitSocial from '../resource/img/products/bit-social.gif'
import bitPi from '../resource/img/products/bit-pi.svg'
import bitForm from '../resource/img/products/bitForm.gif'
import bitAssist from '../resource/img/products/bitAssist.svg'
import bitFileManager from '../resource/img/products/bitFileManager.png'
import bitSmtp from '../resource/img/products/bitSmtp.gif'
import SupportIcon from '../resource/img/supportIcon/SupportIcon'

function DocSupport() {
  const [snack, setSnackbar] = useState({ show: false })

  const products = [
    {
      name: 'Bit Flows',
      description: 'AI Agent Automation & Integrations for Forms, CRM and More',
      slug: 'bit-pi',
      url: 'https://wordpress.org/plugins/bit-pi/',
      image: bitPi
    },
    {
      name: 'Bit Social',
      description: 'Auto Post Scheduler & Poster for Blog to Social Media Share.',
      slug: 'bit-social',
      url: 'https://wordpress.org/plugins/bit-social/',
      image: bitSocial
    },
    {
      name: 'Bit Form',
      description: 'WordPress Drag & Drop Contact Form, Payment Form Builder.',
      slug: 'bit-form',
      url: 'https://wordpress.org/plugins/bit-form/',
      image: bitForm
    },
    {
      name: 'Bit Assist',
      description: 'Connect your all support assistant in a single button.',
      slug: 'bit-assist',
      url: 'https://wordpress.org/plugins/bit-assist/',
      image: bitAssist
    },
    {
      name: 'Bit File Manager',
      description: '100% free file manager for WordPress.',
      slug: 'file-manager',
      url: 'https://wordpress.org/plugins/file-manager/',
      image: bitFileManager
    },
    {
      name: 'Bit SMTP',
      description: 'Best SMTP plugin for WordPress.',
      slug: 'bit-smtp',
      url: 'https://wordpress.org/plugins/bit-smtp/',
      image: bitSmtp
    }
  ]

  return (
    <div className="btcd-f-settings">
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="flx flx-center flx-wrp pb-3">
        {products &&
          products.map(
            (product, i) =>
              product.slug !== 'bit-integrations' && (
                <div
                  key={`inte-sm-${i + 2}`}
                  role="button"
                  tabIndex="0"
                  className="btcd-inte-card product-sm mr-4 mt-3"
                  style={{ width: '200px', height: 'max-content', textAlign: 'center' }}>
                  <img
                    loading="lazy"
                    src={product.image}
                    alt={product.slug}
                    style={{ maxHeight: '90px' }}
                  />
                  <div className="txt-center px-2 f15">{product.name}</div>
                  <br />
                  <div className="flx flx-center ml-2" style={{ minHeight: '50px' }}>
                    <span>{product.description}</span>
                  </div>
                  <div className="flx flx-center">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btcd-btn-o-purple btcd-btn-sm">
                      <i className="fas fa-external-link-alt" />
                      &nbsp;
                      <span className="pl-1">{__('Go to plugin', 'bit-integrations')}</span>
                    </a>
                  </div>
                </div>
              )
          )}
      </div>
      <div id="btcd-settings-wrp" style={{ padding: '0px 30px' }}>
        <div>
          <h2>{__('Documentation', 'bit-integrations')}</h2>
          <p>
            {__(
              'Bit Integrations is a user-friendly automation plugin for WordPress that makes work flows simple, easy to understand, and does not require extensive documentation. However, if you do get confused, the documentation is available for assistance and can be found',
              'bit-integrations'
            )}
            &nbsp;
            <a target="_blank" href="https://bit-integrations.com/wp-docs/" rel="noreferrer">
              {__('here.', 'bit-integrations')} <ExternalLinkIcn size="15" />
            </a>
          </p>
        </div>
        <div />
      </div>
      <div id="btcd-settings-wrp" style={{ padding: '0px 30px', marginBottom: '25px' }}>
        <h2>{__('Support', 'bit-integrations')}</h2>
        <p>
          {__(
            'In Bit Apps, we provide all kind product support for any types of customer, it does not matter FREE or PRO user. We actively provide support through Email and Live Chat. Our support team is always ready to help you. We are here to answer your questions and help you with any issues you may have.',
            'bit-integrations'
          )}
        </p>
        <div className="flx">
          <span>
            <SupportIcon size="18" />
          </span>
          <span className="ml-2">
            <a href="mailto:support@bitapps.pro" rel="noreferrer">
              support@bitapps.pro
            </a>
          </span>
        </div>
        <div className="flx">
          <span>
            <MessagesCircle size="20" />
          </span>
          <span className="ml-2">
            <a
              href="https://tawk.to/chat/60eac4b6d6e7610a49aab375/1faah0r3e"
              target="_blank"
              rel="noreferrer">
              {__('Chat here', 'bit-integrations')} <ExternalLinkIcn size="15" />
            </a>
          </span>
        </div>
        <div className="flx">
          <span>
            <YoutubeIcn size="20" />
          </span>
          <span className="ml-2">
            <a
              href="https://www.youtube.com/channel/UCjUl8UGn-G6zXZ-Wpd7Sc3g"
              target="_blank"
              rel="noreferrer">
              {__('Youtube channel', 'bit-integrations')} <ExternalLinkIcn size="15" />
            </a>
          </span>
        </div>
        <div className="flx">
          <span>
            <FacebookIcn size="20" />
          </span>
          <span className="ml-2">
            <a href="https://www.facebook.com/groups/3308027439209387" target="_blank" rel="noreferrer">
              {__('Facebook support group', 'bit-integrations')} <ExternalLinkIcn size="15" />
            </a>
          </span>
        </div>
        <div className="flx">
          <span>
            <ReviewStarIcn size="20" />
          </span>
          <span className="ml-2">
            <a
              href="https://wordpress.org/support/plugin/bit-integrations/reviews/#new-post"
              target="_blank"
              rel="noreferrer">
              {__('Rate us on WordPress', 'bit-integrations')} <ExternalLinkIcn size="15" />
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}

export default DocSupport

{
  /* <h2>Support</h2>
<p>In Bit Apps, we provide all kind product support for any types of customer, it doesn't matter FREE or PRO user. We actively provide support through Email and Live Chat. Our support team is always ready to help you. We are here to answer your questions and help you with any issues you may have.</p>
</div>
<div className="flx flx-col flx" style={{ width: '250px', alignItems: 'flex-start' }}>
<h2>Need Help?</h2>
<span>support@bitapps.pro</span>
<a target="_blank" href="https://tawk.to/chat/60eac4b6d6e7610a49aab375/1faah0r3e" rel="noreferrer">Chat here</a>
<a target="_blank" href="https://www.youtube.com/channel/UCjUl8UGn-G6zXZ-Wpd7Sc3g" rel="noreferrer">BitApps youtube channel</a>
<a target="_blank" href="https://www.facebook.com/groups/3308027439209387" rel="noreferrer">Facebook support group</a> */
}

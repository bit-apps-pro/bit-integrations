import { useState } from 'react'
import announcement from '../resource/img/announcement.svg'
import ExternalLinkIcn from '../Icons/ExternalLinkIcn'
import { __, sprintf } from '../Utils/i18nwrap'
import '../resource/css/cashback-modal.css'
import Modal from '../components/Utilities/Modal'
import '../resource/css/newRelease.css'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../GlobalStates'

const PRODUCT_NAME = 'Bit Integrations'

export default function AnnouncementModal() {
  const [show, setShow] = useState(false)
  const btcbi = useRecoilValue($appConfigState)
  const source = !btcbi.isPro ? 'bit-integrations' : 'bit-integrations-pro'
  const Early_Bird_URL = `https://bit-social.com/?utm_source=${source}&utm_medium=inside-plugin&utm_campaign=early-bird-offer`
  // if (!btcbi.isPro) return

  return (
    <div className="announcement-modal">
      <button
        title={__('New Product Release', 'bit-integrations')}
        type="button"
        className="announcement-btn"
        onClick={() => setShow(true)}>
        <img src={announcement} style={{ marginRight: '8px', width: '30px' }} />
        {__('New Product Release', 'bit-integrations')}
        <span className="star" />
        <span className="star" />
        <span className="star" />
      </button>
      <Modal
        md
        show={show}
        style={{
          height: '450px',
          width: '450px',
          paddingBottom: '20px'
        }}
        setModal={() => setShow(false)}
        noPadding={true}
        closeIcon={true}>
        <div>
          <a href={Early_Bird_URL} target="_blank" rel="noreferrer">
            <img src={announcement} style={{ width: '100%', marginTop: '-10px' }} alt="Early Bird Offer" />
          </a>
        </div>
        <div
          className="footer-wrapper"
          style={{
            position: 'absolute',
            zIndex: '1',
            bottom: '-25px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
          <a className="footer-btn purple" href={Early_Bird_URL} target="_blank" rel="noreferrer">
            {__('Grab the Deal', 'bit-integrations')}
            <ExternalLinkIcn size={16} className="" />
          </a>
        </div>
      </Modal>
    </div>
  )
}

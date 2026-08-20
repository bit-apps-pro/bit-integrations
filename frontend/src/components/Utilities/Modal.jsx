import { CSSTransition } from 'react-transition-group'
import CloseIcn from '../../Icons/CloseIcn'

export default function Modal({
  show,
  setModal,
  sm,
  lg,
  style,
  cssTransStyle,
  className,
  title,
  warning,
  hdrActn,
  children,
  subTitle,
  noPadding,
  closeIcon
}) {
  const handleClickOutside = e => {
    if (e.target.classList.contains('btcd-modal-wrp') && closeIcon !== false) {
      setModal(false)
    }
  }

  return (
    // timeout property is required for CSSTransition. Do not remove it.
    <CSSTransition
      in={show}
      classNames="btc-mdl-trn"
      unmountOnExit
      style={cssTransStyle}
      timeout={{
        appear: 500,
        enter: 300,
        exit: 500
      }}>
      <div
        role="button"
        tabIndex={0}
        onKeyPress={handleClickOutside}
        onClick={handleClickOutside}
        className="btcd-modal-wrp flx"
        style={{ overflow: 'auto' }}>
        <div
          className={`btcd-modal ${sm ? 'btcd-m-sm' : ''} ${lg ? 'btcd-m-lg' : ''} ${className}`}
          style={style}>
          <div className={`btcd-modal-content ${noPadding ? 'no-padding' : ''}  `}>
            {hdrActn}
            {!closeIcon ? (
              ''
            ) : (
              <button
                onClick={() => setModal(false)}
                className="icn-btn btcd-mdl-close"
                aria-label="modal-close"
                type="button">
                <CloseIcn size={16} stroke={3} />
              </button>
            )}
            {title ? (
              <h2 className="btcd-mdl-title flx" style={{ color: warning ? 'red' : '' }}>
                {title}
              </h2>
            ) : (
              ''
            )}
            <small className="btcd-mdl-subtitle">{subTitle}</small>
            {children}
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}

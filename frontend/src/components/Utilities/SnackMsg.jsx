import { CSSTransition } from 'react-transition-group'

function SnackMsg({ snack, setSnackbar }) {
  const { show, msg } = snack

  return (
    <CSSTransition
      in={show}
      timeout={3000}
      classNames="flx btcd-snack btcd-snack-a"
      onEntered={() =>
        setTimeout(() => {
          setSnackbar({ show: false, msg })
        }, 1)
      }
      unmountOnExit>
      <div>
        <span>{msg}</span>
        <button
          onClick={() => setSnackbar({ show: false, msg })}
          className="btcd-snack-cls"
          type="button">
          &times;
        </button>
      </div>
    </CSSTransition>
  )
}

export default SnackMsg

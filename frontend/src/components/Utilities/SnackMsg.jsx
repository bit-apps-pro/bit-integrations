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
        {/* Rendered as text: snackbar messages can carry third-party API strings,
            so they must never be interpreted as HTML. */}
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

/* eslint-disable no-console */
import { Component } from 'react'
import { __ } from '../../Utils/i18nwrap'

/**
 * Stops one integration's render error from unmounting the whole admin app.
 * `resetKey` clears a caught error when it changes.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
    this.handleRetry = this.handleRetry.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(prevProps) {
    const { resetKey } = this.props
    const { error } = this.state

    if (error && prevProps.resetKey !== resetKey) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: null })
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Bit Integrations:', error, errorInfo?.componentStack)
  }

  handleRetry() {
    this.setState({ error: null })
  }

  render() {
    const { children, title } = this.props
    const { error } = this.state

    if (!error) {
      return children
    }

    return (
      <div className="txt-center" style={{ padding: '60px 20px' }}>
        <h3 className="mt-0">{title || __('Something went wrong', 'bit-integrations')}</h3>
        <p>
          {__(
            'This screen could not be displayed. The details below help us fix it — please include them in a support report.',
            'bit-integrations'
          )}
        </p>
        <pre
          style={{
            display: 'inline-block',
            maxWidth: '100%',
            overflowX: 'auto',
            textAlign: 'left',
            padding: '12px 16px',
            background: '#f6f7f9',
            borderRadius: 6
          }}>
          {error.message || String(error)}
        </pre>
        <div className="mt-3">
          <button type="button" className="btn btcd-btn-lg purple" onClick={this.handleRetry}>
            {__('Try again', 'bit-integrations')}
          </button>
        </div>
      </div>
    )
  }
}

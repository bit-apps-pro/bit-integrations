import { useEffect } from 'react'
import { broadcastAuthCodeResponse, readAuthResponseFromUrl } from '../Utils/oauthHelper'

// popup window: render when redirected from oauth to bit-integration with code
export default function AuthResponse() {
  useEffect(() => {
    const response = readAuthResponseFromUrl()

    if (Object.keys(response).length > 0) {
      // The code goes out only on broadcastAuthCodeResponse's state-derived channel.
      // Never publish it on a fixed channel name: wp-admin shares an origin with the
      // public site, so any same-origin script could subscribe and read it.
      broadcastAuthCodeResponse(response)

      setTimeout(() => {
        window.close()
      }, 200)
    }
  }, [])

  return <h4>Auth Response Captured</h4>
}

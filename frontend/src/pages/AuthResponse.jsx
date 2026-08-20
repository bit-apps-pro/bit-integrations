import { useEffect } from 'react'
import { broadcastAuthCodeResponse, readAuthResponseFromUrl } from '../Utils/oauthHelper'

export default function AuthResponse() {
  useEffect(() => {
    const response = readAuthResponseFromUrl()

    if (Object.keys(response).length > 0) {
      broadcastAuthCodeResponse(response)

      setTimeout(() => {
        window.close()
      }, 200)
    }
  }, [])

  return <h4>Auth Response Captured</h4>
}

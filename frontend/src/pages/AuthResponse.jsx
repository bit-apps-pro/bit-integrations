import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { authInfoAtom } from '../GlobalStates'
import { broadcastAuthCodeResponse, readAuthResponseFromUrl } from '../Utils/oauthHelper'

// popup window: render when redirected from oauth to bit-integration with code
export default function AuthResponse() {
  const setAuthInfo = useSetRecoilState(authInfoAtom)

  useEffect(() => {
    const response = readAuthResponseFromUrl()

    if (Object.keys(response).length > 0) {
      broadcastAuthCodeResponse(response)
      if (response.code) setAuthInfo({ code: response.code })

      setTimeout(() => {
        window.close()
      }, 200)
    }
  }, [])

  return <h4>Auth Response Captured</h4>
}

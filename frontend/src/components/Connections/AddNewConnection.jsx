import { AUTH_TYPES } from '../../Utils/connectionAuth'
import ApiConnection from './ApiConnection'
import Oauth1Connection from './Oauth1Connection'
import Oauth2Connection from './Oauth2Connection'

const CONNECTION_REGISTRY = {
  [AUTH_TYPES.OAUTH2]: Oauth2Connection,
  [AUTH_TYPES.OAUTH1]: Oauth1Connection
}

export default function AddNewConnection(props) {
  const Component = CONNECTION_REGISTRY[props?.authDetails?.authType] ?? ApiConnection

  return <Component {...props} />
}

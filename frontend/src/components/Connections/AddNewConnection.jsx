import { AUTH_TYPES } from "../../Utils/connectionAuth"
import ApiConnection from "./ApiConnection"
import Oauth1Connection from "./Oauth1Connection"
import Oauth2Connection from "./Oauth2Connection"

export default function AddNewConnection(props) {
  if (props?.authDetails?.authType === AUTH_TYPES.OAUTH2) {
    return <Oauth2Connection {...props} />
  }

  if (props?.authDetails?.authType === AUTH_TYPES.OAUTH1) {
    return <Oauth1Connection {...props} />
  }

  return <ApiConnection {...props} />
}

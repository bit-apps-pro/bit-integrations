import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import toast from 'react-hot-toast'

export const handleInput = (e, slackConf, setSlackConf) => {
  const newConf = { ...slackConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSlackConf({ ...newConf })
}

export const fetchChannels = async (
  confTmp,
  setConf,
  setIsLoading,
  type = 'fetch'
) => {
  if (!confTmp.connection_id && !confTmp.accessToken) {
    toast.error(__("Access Token can't be empty", 'bit-integrations'))
    return
  }

  setIsLoading(true)

  const requestParams = confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { accessToken: confTmp.accessToken }

  const result = await bitsFetch(requestParams, 'slack_fetch_channels')

  if (result && result.success) {
    const newConf = { ...confTmp }
    newConf.channels = result.data?.channels || []
    setConf(newConf)
    setIsLoading(false)
    toast.success(
      type === 'refresh'
        ? __('Channels fetched successfully', 'bit-integrations')
        : __('Channels loaded successfully', 'bit-integrations')
    )
    return
  }

  setIsLoading(false)
  toast.error(__('Channels fetching failed', 'bit-integrations'))
}

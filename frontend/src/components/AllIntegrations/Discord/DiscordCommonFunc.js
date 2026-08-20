/* eslint-disable no-else-return */
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import toast from 'react-hot-toast'

export const handleInput = (e, discordConf, setDiscordConf) => {
  const newConf = { ...discordConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setDiscordConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id ? { connection_id: confTmp.connection_id } : { accessToken: confTmp.accessToken }

export const getAllServers = (confTmp, setConf, setIsLoading) => {
  if (!confTmp.connection_id && !confTmp.accessToken) {
    toast.error(__("Access Token can't be empty", 'bit-integrations'))
    return
  }

  setIsLoading(true)

  bitsFetch(buildAuthRequestParams(confTmp), 'discord_fetch_servers').then(result => {
    if (result && result.success) {
      setConf(oldConf => {
        const newConf = { ...oldConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.servers = result.data
        }
        return newConf
      })

      setIsLoading(false)
      toast.success(__('Servers fetched successfully', 'bit-integrations'))
      return
    }

    setIsLoading(false)
    toast.error(__('Servers fetching failed', 'bit-integrations'))
  })
}

export const getAllChannels = (confTmp, setConf, setIsLoading) => {
  if (!confTmp.connection_id && !confTmp.accessToken) {
    toast.error(__("Access Token can't be empty", 'bit-integrations'))
    return
  }

  if (!confTmp.selectedServer) {
    toast.error(__('Server is required', 'bit-integrations'))
    return
  }

  setIsLoading(true)

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    serverId: confTmp.selectedServer
  }

  bitsFetch(requestParams, 'discord_fetch_channels').then(result => {
    if (result && result.success) {
      setConf(oldConf => {
        const newConf = { ...oldConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.channels = result.data
        }
        return newConf
      })

      setIsLoading(false)
      toast.success(__('Channels fetched successfully', 'bit-integrations'))
      return
    }

    setIsLoading(false)
    toast.error(__('Channels fetching failed', 'bit-integrations'))
  })
}

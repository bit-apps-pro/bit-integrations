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

export const getAllServers = (confTmp, setConf, setIsLoading) => {
  if (!confTmp.accessToken) {
    setError({
      accessToken: !confTmp.accessToken ? __("Access Token can't be empty", 'bit-integrations') : ''
    })
    return
  }

  setIsLoading(true)

  const tokenRequestParams = { accessToken: confTmp.accessToken }

  bitsFetch(tokenRequestParams, 'discord_fetch_servers').then(result => {
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
  if (!confTmp.accessToken) {
    setError({
      accessToken: !confTmp.accessToken ? __("Access Token can't be empty", 'bit-integrations') : ''
    })
    return
  }
  setIsLoading(true)

  const tokenRequestParams = { accessToken: confTmp.accessToken, serverId: confTmp.selectedServer }

  bitsFetch(tokenRequestParams, 'discord_fetch_channels').then(result => {
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

export const handleAuthorize = (
  confTmp,
  setConf,
  setError,
  setisAuthorized,
  setIsLoading,
  setSnackbar
) => {
  if (!confTmp.accessToken) {
    setError({
      accessToken: !confTmp.accessToken ? __("Access Token can't be empty", 'bit-integrations') : ''
    })
    return
  }

  setError({})
  setIsLoading(true)

  const tokenRequestParams = { accessToken: confTmp.accessToken }

  bitsFetch(tokenRequestParams, 'handle_authorize')
    .then(result => result)
    .then(result => {
      if (result && result.success) {
        const newConf = { ...confTmp }
        newConf.tokenDetails = result.data
        setConf(newConf)
        setisAuthorized(true)
        setSnackbar({ show: true, msg: __('Authorized Successfully', 'bit-integrations') })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Authorization failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Authorization failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
}
// export const handleAuthorize = (confTmp, setConf, setError, setisAuthorized, setIsLoading, setSnackbar) => {
//   if (!confTmp.accessToken) {
//     setError({ accessToken: !confTmp.accessToken ? __('Access Token can\'t be empty', 'bit-integrations') : '' })
//     return
//   }

//   setError({})
//   setIsLoading(true)

//   const tokenRequestParams = { accessToken: confTmp.accessToken }

//   bitsFetch(tokenRequestParams, 'discord_authorization_and_fetch_servers')
//     .then(result => result)
//     .then(result => {
//       if (result && result.success) {
//         const newConf = { ...confTmp }
//         newConf.tokenDetails = result.data
//         setConf(newConf)
//         setisAuthorized(true)
//         setSnackbar({ show: true, msg: __('Authorized Successfully', 'bit-integrations') })
//       } else if ((result && result.data && result.data.data) || (!result.success && typeof result.data === 'string')) {
//         setSnackbar({ show: true, msg: `${__('Authorization failed Cause:', 'bit-integrations')}${result.data.data || result.data}. ${__('please try again', 'bit-integrations')}` })
//       } else {
//         setSnackbar({ show: true, msg: __('Authorization failed. please try again', 'bit-integrations') })
//       }
//       setIsLoading(false)
//     })
// }

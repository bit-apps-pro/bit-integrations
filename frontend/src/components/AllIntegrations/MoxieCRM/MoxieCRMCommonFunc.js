/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, moxiecrmConf, setMoxieCRMConf) => {
  const newConf = { ...moxiecrmConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setMoxieCRMConf({ ...newConf })
}

export const generateMappedField = moxiecrmConf => {
  let allRequiredFields = []
  if (moxiecrmConf.actionName === 'client') {
    allRequiredFields = moxiecrmConf?.clientFields
  } else if (moxiecrmConf.actionName === 'contact') {
    allRequiredFields = moxiecrmConf?.contactFields
  } else if (moxiecrmConf.actionName === 'opportunity') {
    allRequiredFields = moxiecrmConf?.opportunityFields
  }
  const requiredFlds = allRequiredFields?.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        moxiecrmFormField: field.key
      }))
    : [{ formField: '', moxiecrmFormField: '' }]
}

export const checkMappedFields = moxiecrmConf => {
  const mappedFields = moxiecrmConf?.field_map
    ? moxiecrmConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.moxiecrmFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.moxiecrmFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        api_key: confTmp.api_key,
        api_url: confTmp.api_url
      }

// export const getCustomFields = (confTmp, setConf, setLoading) => {
//   setLoading({ ...setLoading, customFields: true });

//   const requestParams = {
//     api_key: confTmp.api_key,
//     api_url: confTmp.api_url,
//     action: confTmp.actionName,
//   };

//   bitsFetch(requestParams, "moxiecrm_fetch_custom_fields").then((result) => {
//     if (result && result.success) {
//       const newConf = { ...confTmp };
//       if (result.data) {
//         newConf.customFields = result.data;
//       }
//       setConf(newConf);
//       setLoading({ ...setLoading, customFields: false });
//       if (!result.data) {
//         toast.error(__("No custom fields found", "bit-integrations"));
//       } else {
//         toast.success(
//           __("Custom fields also fetched successfully", "bit-integrations")
//         );
//       }
//       return;
//     }
//     setLoading({ ...setLoading, customFields: false });
//     toast.error(__("Custom fields fetching failed", "bit-integrations"));
//   });
// };

export const getAllClients = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, clients: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'moxiecrm_fetch_all_clients').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.clients = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, clients: false })

      toast.success(__('Clients fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, clients: false })
    toast.error(__('Clients fetching failed', 'bit-integrations'))
  })
}

export const getAllPipelineStages = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, pipelineStages: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'moxiecrm_fetch_all_pipelineStages').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.pipelineStages = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, pipelineStages: false })

      toast.success(__('PipelineStages fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, pipelineStages: false })
    toast.error(__('PipelineStages fetching failed', 'bit-integrations'))
  })
}

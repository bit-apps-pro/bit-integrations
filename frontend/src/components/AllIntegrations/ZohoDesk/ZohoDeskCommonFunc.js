import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }


export const handleInput = (
  e,
  deskConf,
  setDeskConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...deskConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value

  switch (e.target.name) {
    case 'orgId':
      newConf = portalChange(newConf, formID, setDeskConf, setIsLoading, setSnackbar)
      break
    case 'department':
      newConf = departmentChange(newConf, formID, setDeskConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  setDeskConf({ ...newConf })
}

const portalChange = (deskConf, formID, setDeskConf, setIsLoading, setSnackbar) => {
  const newConf = { ...deskConf }
  newConf.department = ''
  newConf.field_map = [{ formField: '', zohoFormField: '' }]
  newConf.actions = {}

  if (!newConf?.default?.departments?.[newConf.orgId]) {
    refreshDepartments(formID, newConf, setDeskConf, setIsLoading, setSnackbar)
  } else if (newConf?.default?.departments?.[newConf.orgId].length === 1)
    newConf.field_map = generateMappedField(newConf)
  return newConf
}

const departmentChange = (deskConf, formID, setDeskConf, setIsLoading, setSnackbar) => {
  const newConf = { ...deskConf }
  newConf.field_map = [{ formField: '', zohoFormField: '' }]
  newConf.actions = {}

  if (!newConf?.default?.fields?.[newConf.orgId]) {
    refreshFields(formID, newConf, setDeskConf, setIsLoading, setSnackbar)
  } else {
    newConf.field_map = generateMappedField(newConf)
  }
  return newConf
}

export const refreshOrganizations = (formID, deskConf, setDeskConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshOrganizationsRequestParams = {
    formID,
    id: deskConf.id,
    ...buildAuthRequestParams(deskConf),
    dataCenter: deskConf.dataCenter,
  }
  bitsFetch(refreshOrganizationsRequestParams, 'zdesk_refresh_organizations')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...deskConf }
        if (result.data.organizations) {
          newConf.default = { ...newConf.default, organizations: result.data.organizations }
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({ show: true, msg: __('Portals refreshed', 'bit-integrations') })
        setDeskConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Portals refresh failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Portals refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshDepartments = (formID, deskConf, setDeskConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshDepartmentsRequestParams = {
    formID,
    id: deskConf.id,
    ...buildAuthRequestParams(deskConf),
    dataCenter: deskConf.dataCenter,
    orgId: deskConf.orgId
  }
  bitsFetch(refreshDepartmentsRequestParams, 'zdesk_refresh_departments')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...deskConf }
        if (!newConf.default.departments) {
          newConf.default.departments = {}
        }
        if (result.data.departments) {
          newConf.default.departments[newConf.orgId] = result.data.departments
        }
        if (result.data.departments.length === 1) {
          newConf.department = result.data.departments[newConf.orgId][0].departmentName
          !newConf.default?.fields?.[newConf.orgId] &&
            refreshFields(formID, newConf, setDeskConf, setIsLoading, setSnackbar)
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({ show: true, msg: __('Departments refreshed', 'bit-integrations') })
        setDeskConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Departments refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Departments refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshFields = (formID, deskConf, setDeskConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshFieldsRequestParams = {
    formID,
    ...buildAuthRequestParams(deskConf),
    dataCenter: deskConf.dataCenter,
    orgId: deskConf.orgId
  }
  bitsFetch(refreshFieldsRequestParams, 'zdesk_refresh_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...deskConf }
        if (result.data.fields) {
          if (!newConf.default.fields) {
            newConf.default.fields = {}
          }
          newConf.default.fields[newConf.orgId] = { ...result.data }
          newConf.field_map = generateMappedField(newConf)
          if (result.data.tokenDetails) {
            newConf.tokenDetails = result.data.tokenDetails
          }
          setSnackbar({ show: true, msg: __('Fields refreshed', 'bit-integrations') })
        } else {
          setSnackbar({
            show: true,
            msg: `${__('Fields refresh failed Cause:', 'bit-integrations')}${
              result.data.data || result.data
            }. ${__('please try again', 'bit-integrations')}`
          })
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setDeskConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshOwners = (formID, deskConf, setDeskConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshOwnersRequestParams = {
    formID,
    id: deskConf.id,
    ...buildAuthRequestParams(deskConf),
    dataCenter: deskConf.dataCenter,
    orgId: deskConf.orgId
  }
  bitsFetch(refreshOwnersRequestParams, 'zdesk_refresh_owners')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...deskConf }
        if (!newConf.default.owners) {
          newConf.default.owners = {}
        }
        if (result.data.owners) {
          newConf.default.owners[newConf.orgId] = result.data.owners
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({ show: true, msg: __('Owners refreshed', 'bit-integrations') })
        setDeskConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Owners refresh failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Owners refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshProducts = (formID, deskConf, setDeskConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshProductsRequestParams = {
    formID,
    id: deskConf.id,
    ...buildAuthRequestParams(deskConf),
    dataCenter: deskConf.dataCenter,
    orgId: deskConf.orgId,
    departmentId: deskConf.department
  }
  bitsFetch(refreshProductsRequestParams, 'zdesk_refresh_products')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...deskConf }
        if (!newConf.default.products) {
          newConf.default.products = {}
        }
        if (result.data.products) {
          newConf.default.products[newConf.department] = result.data.products
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({ show: true, msg: __('Products refreshed', 'bit-integrations') })
        setDeskConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Products refresh failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Products refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

const generateMappedField = deskConf =>
  deskConf.default.fields[deskConf.orgId].required.length > 0
    ? deskConf.default.fields[deskConf.orgId].required?.map(field => ({
        formField: '',
        zohoFormField: field
      }))
    : [{ formField: '', zohoFormField: '' }]

export const checkMappedFields = deskConf => {
  const mappedFields = deskConf?.field_map
    ? deskConf.field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.zohoFormField &&
          deskConf?.default?.fields?.[deskConf.orgId]?.required.indexOf(mappedField.zohoFormField) !== -1
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }

  return true
}

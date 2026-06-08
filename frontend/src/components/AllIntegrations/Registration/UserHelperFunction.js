/* eslint-disable no-param-reassign */

import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { userFields as defaultUserFields } from '../../../Utils/StaticData/userField'

export const registrationMainActions = [
  { value: 'new_user', label: __('New User Create', 'bit-integrations'), is_pro: false },
  { value: 'updated_user', label: __('Updated User', 'bit-integrations'), is_pro: false },
  { value: 'deleteExistingUser', label: __('Delete Existing User', 'bit-integrations'), is_pro: true },
  { value: 'updateUserMetadata', label: __('Update User Metadata', 'bit-integrations'), is_pro: true },
  { value: 'createRole', label: __('Create Role', 'bit-integrations'), is_pro: true },
  { value: 'deleteRole', label: __('Delete Role', 'bit-integrations'), is_pro: true },
  { value: 'addUserRoles', label: __('Add User Roles', 'bit-integrations'), is_pro: true },
  { value: 'removeUserRole', label: __('Remove User Role', 'bit-integrations'), is_pro: true },
  { value: 'updateUserRole', label: __('Update User Role', 'bit-integrations'), is_pro: true },
  { value: 'addRoleCapabilities', label: __('Add Role Capabilities', 'bit-integrations'), is_pro: true },
  {
    value: 'removeRoleCapabilities',
    label: __('Remove Role Capabilities', 'bit-integrations'),
    is_pro: true
  },
  { value: 'addUserCapabilities', label: __('Add User Capabilities', 'bit-integrations'), is_pro: true },
  {
    value: 'removeUserCapabilities',
    label: __('Remove User Capabilities', 'bit-integrations'),
    is_pro: true
  }
]

export const isLegacyRegistrationAction = actionType =>
  actionType === 'new_user' || actionType === 'updated_user'

const registrationActionFields = {
  deleteExistingUser: [
    { key: 'user_email', name: __('User Email', 'bit-integrations'), required: true},
    { key: 'reassign_id', name: __('Reassign ID', 'bit-integrations'), required: false}
  ],
  updateUserMetadata: [
    { key: 'user_email', name: __('User Email', 'bit-integrations'), required: true },
    { key: 'meta_key', name: __('Meta Key', 'bit-integrations'), required: true },
    { key: 'meta_value', name: __('Meta Value', 'bit-integrations'), required: true }
  ],
  createRole: [
    { key: 'role_name', name: __('Role Name', 'bit-integrations'), required: true },
    { key: 'role_display_name', name: __('Display Name', 'bit-integrations'), required: true },
    {
      key: 'role_capabilities',
      name: __('Capabilities (comma separated)', 'bit-integrations'),
      required: false
    }
  ],
  deleteRole: [{ key: 'role_name', name: __('Role Name', 'bit-integrations'), required: true }],
  addUserRoles: [
    { key: 'user_email', name: __('User Email', 'bit-integrations'), required: true },
    { key: 'user_role', name: __('Role', 'bit-integrations'), required: true }
  ],
  removeUserRole: [
    { key: 'user_email', name: __('User Email', 'bit-integrations'), required: true },
    { key: 'user_role', name: __('Role', 'bit-integrations'), required: true }
  ],
  updateUserRole: [
    { key: 'user_email', name: __('User Email', 'bit-integrations'), required: true },
    { key: 'new_role', name: __('New Role', 'bit-integrations'), required: true }
  ],
  addRoleCapabilities: [
    { key: 'role_name', name: __('Role Name', 'bit-integrations'), required: true },
    {
      key: 'role_capabilities',
      name: __('Capabilities (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  removeRoleCapabilities: [
    { key: 'role_name', name: __('Role Name', 'bit-integrations'), required: true },
    {
      key: 'role_capabilities',
      name: __('Capabilities (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  addUserCapabilities: [
    { key: 'user_email', name: __('User Email', 'bit-integrations'), required: true },
    {
      key: 'role_capabilities',
      name: __('Capabilities (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  removeUserCapabilities: [
    { key: 'user_email', name: __('User Email', 'bit-integrations'), required: true },
    {
      key: 'role_capabilities',
      name: __('Capabilities (comma separated)', 'bit-integrations'),
      required: true
    }
  ]
}

export const getRegistrationFieldsByAction = actionType => {
  if (isLegacyRegistrationAction(actionType)) {
    return defaultUserFields
  }

  return registrationActionFields[actionType] || defaultUserFields
}

export const generateRegistrationFieldMap = actionType => {
  const fields = getRegistrationFieldsByAction(actionType)
  const requiredFields = fields.filter(field => field.required)

  if (requiredFields.length > 0) {
    return requiredFields.map(field => ({
      formField: '',
      userField: field.key,
      required: true
    }))
  }

  return [{ formField: '', userField: '' }]
}

export const addFieldMap = (fldProp, i, confTmp, setConf) => {
  const newConf = { ...confTmp }
  newConf[fldProp].splice(i, 0, {})

  setConf({ ...newConf })
}

export const delFieldMap = (fldProp, i, confTmp, setConf) => {
  const newConf = { ...confTmp }
  if (newConf[fldProp].length > 1) {
    newConf[fldProp].splice(i, 1)
  }

  setConf({ ...newConf })
}

export const handleFieldMapping = (fldProp, event, index, conftTmp, setConf) => {
  const newConf = { ...conftTmp }

  newConf[fldProp][index][event.target.name] = event.target.value
  setConf(newConf)
}

export const checkMappedUserFields = data => {
  const mappedFields = data
    ? data?.user_map?.filter(mappedField => !mappedField.formField && mappedField.required)
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getUserRoles = (setIsLoading, setRoles) => {
  setIsLoading(true)
  bitsFetch({}, 'role/list', null, 'GET').then(res => {
    if (res?.success && res !== undefined) {
      setIsLoading(false)
      setRoles(Object.values(res?.data))
    } else {
      setIsLoading(false)
    }
  })
}

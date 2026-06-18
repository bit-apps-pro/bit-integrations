/* eslint-disable no-unused-expressions */
import { __ } from '../../../Utils/i18nwrap'

export const addFieldMap = (i, confTmp, setConf) => {
  const newConf = { ...confTmp }
  newConf.field_map.splice(i, 0, {})
  setConf({ ...newConf })
}

export const delFieldMap = (i, confTmp, setConf) => {
  const newConf = { ...confTmp }
  if (newConf.field_map.length > 1) {
    newConf.field_map.splice(i, 1)
  }

  setConf({ ...newConf })
}

export const handleFieldMapping = (event, index, conftTmp, setConf) => {
  const newConf = { ...conftTmp }
  newConf.field_map[index][event.target.name] = event.target.value

  if (event.target.value === 'custom') {
    newConf.field_map[index].customValue = ''
  }
  setConf({ ...newConf })
}

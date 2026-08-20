/* eslint-disable no-unused-expressions */
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

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
  setConf(prevConf =>
    create(prevConf, draftconf => {
      draftconf.field_map[index][event.target.name] = event.target.value
      if (event.target.value === 'custom') {
        draftconf.field_map[index].customValue = ''
      }
    })
  )
}

import { create } from 'mutative'

export const addFieldMap = (i, confTmp, setConf) =>
  setConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.field_map.splice(i, 0, {})
    })
  )

export const delFieldMap = (i, confTmp, setConf) =>
  setConf(prevConf =>
    create(prevConf, draftConf => {
      if (draftConf.field_map.length > 1) {
        draftConf.field_map.splice(i, 1)
      }
    })
  )

export const handleFieldMapping = (event, index, conftTmp, setConf) => {
  const { name, value } = event.target
  setConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.field_map[index][name] = value

      if (value === 'custom') {
        draftConf.field_map[index].customValue = ''
      }

      if (value === 'customFieldKey') {
        draftConf.field_map[index].customFieldKey = ''
      }
    })
  )
}

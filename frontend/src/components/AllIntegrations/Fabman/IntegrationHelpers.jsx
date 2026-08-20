import { create } from 'mutative'

export const addFieldMap = (i, confTmp, setConf) => {
  const newConf = create(confTmp, draft => {
    draft.field_map.splice(i, 0, {})
  })

  setConf(newConf)
}

export const delFieldMap = (i, confTmp, setConf) => {
  const newConf = create(confTmp, draft => {
    // Only remove if there's more than one item
    if (draft.field_map.length > 1) {
      draft.field_map.splice(i, 1)
    }
  })

  setConf(newConf)
}

export const handleFieldMapping = (event, index, confTmp, setConf) => {
  const newConf = create(confTmp, draft => {
    // Initialize the field map object at index if missing
    if (!draft.field_map[index]) {
      draft.field_map[index] = {}
    }

    draft.field_map[index][event.target.name] = event.target.value

    if (event.target.value === 'custom') {
      draft.field_map[index].customValue = ''
    } else {
      // Remove customValue if not custom to clean up the object
      delete draft.field_map[index].customValue
    }
  })

  setConf(newConf)
}

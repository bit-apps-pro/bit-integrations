export const isUserEmailMapped = conf =>
  Boolean(
    conf?.userEmailField?.formField === 'custom'
      ? conf?.userEmailField?.customValue
      : conf?.userEmailField?.formField
  )

export const isUserSourceIncomplete = conf => conf?.userSource === 'email' && !isUserEmailMapped(conf)

export const handleUserSourceChange = (value, conf, setConf) => {
  const newConf = { ...conf, userSource: value }
  if (value === 'email') {
    if (!newConf.userEmailField) newConf.userEmailField = { formField: '' }
  } else {
    delete newConf.userEmailField
  }
  setConf(newConf)
}

export const handleUserEmailField = (value, conf, setConf) =>
  setConf({
    ...conf,
    userEmailField: { formField: value, ...(value === 'custom' && { customValue: '' }) }
  })

export const handleUserEmailCustomValue = (value, conf, setConf) =>
  setConf({ ...conf, userEmailField: { ...conf.userEmailField, customValue: value } })

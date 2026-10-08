export const checkIsPro = (isPro, proType) => {
  return Boolean(isPro || !proType || (isPro && proType))
}

export const getProLabel = label => {
  return (
    <span>
      {label} <small className="txt-purple">(Pro)</small>
    </span>
  )
}

const isLockedOption = option =>
  option.type === 'group' ? option.childs.every(isLockedOption) : option.disabled

const freeFirst = (first, second) => Number(isLockedOption(first)) - Number(isLockedOption(second))

export const getModuleOptions = (items, isPro) => {
  const options = []

  items.forEach(item => {
    const isAvailable = checkIsPro(isPro, item.is_pro)
    const option = {
      label: isAvailable ? item.label : getProLabel(item.label),
      title: item.label,
      value: item.name,
      disabled: !isAvailable
    }
    const group =
      item.group && options.find(entry => entry.type === 'group' && entry.title === item.group)

    if (group) {
      group.childs.push(option)
    } else {
      options.push(item.group ? { type: 'group', title: item.group, childs: [option] } : option)
    }
  })

  if (!isPro) {
    options.forEach(option => {
      if (option.type === 'group') option.childs.sort(freeFirst)
    })
    options.sort(freeFirst)
  }

  return options
}

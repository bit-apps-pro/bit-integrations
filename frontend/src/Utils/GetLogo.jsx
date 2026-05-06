import React, { memo, useEffect, useState } from 'react'
import PlaceholderIcon from '../Icons/PlaceholderIcon'

const logoModules = import.meta.glob('../resource/img/integ/*.{png,jpg,jpeg,webp,svg}')

function GetLogo({ name, style, extension }) {
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    let isMounted = true
    const modulePath = `../resource/img/integ/${camelize(name)}.${extension}`
    const importer = logoModules[modulePath]

    if (!importer) {
      console.error(`Logo not found for ${name} with extension ${extension}`)
      setLogo(null)
      return () => {
        isMounted = false
      }
    }

    importer()
      .then(module => {
        if (isMounted) {
          setLogo(() => module.default)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLogo(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [name, extension])

  return logo ? (
    <img loading="lazy" src={logo} alt={`${name}-logo`} style={style} />
  ) : (
    <PlaceholderIcon size={100} text={name} />
  )
}

function camelize(name) {
  return name
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
}

export default memo(GetLogo)

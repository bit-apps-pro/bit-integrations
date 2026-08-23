import Tippy from '@tippyjs/react'
import { animateFill } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import QuestionIcn from '../../Icons/QuestionIcn'
import 'tippy.js/themes/material.css'
import 'tippy.js/animations/shift-away.css'
import 'tippy.js/dist/backdrop.css'

export default function Cooltip({ className, children, width = 'auto', icnSize = 20 }) {
  return (
    <Tippy
      animateFill
      plugins={[animateFill]}
      duration={150}
      theme="material"
      animation="shift-away"
      interactive
      maxWidth={width}
      content={children}>
      <div role="button" tabIndex="0" className={`popper-icn cp d-in-b ig-c ${className}`}>
        <QuestionIcn size={icnSize} />
      </div>
    </Tippy>
  )
}

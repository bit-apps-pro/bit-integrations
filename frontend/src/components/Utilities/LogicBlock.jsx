import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../Utils/i18nwrap'
import MtSelect from './MtSelect'
import MtInput from './MtInput'
import Button from './Button'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import CloseIcn from '../../Icons/CloseIcn'
import TrashIcn from '../../Icons/TrashIcn'

function LogicBlock({
  fieldVal,
  delLogic,
  lgcInd,
  subLgcInd,
  subSubLgcInd,
  value,
  changeLogic,
  logicValue,
  changeValue,
  changeFormField,
  formFields,
  setValue
}) {
  const fields = []
  let type = ''
  let fldType = ''
  let fieldKey = ''
  formFields?.find?.(itm => {
    if (itm.key === fieldVal) {
      if (itm.type.match(/^(check|radio)$/)) {
        type = 'text'
      } else {
        type = itm.type
      }
      fldType = itm.type
      fieldKey = itm.key
      return true
    }
  })

  const getOptions = () => {
    let options = []

    if (fldType === 'select') {
      options = fields?.[fieldKey]?.opt
    } else {
      options = fields?.[fieldKey]?.opt?.map(opt => ({
        label: opt.lbl,
        value: opt.val || opt.lbl
      }))
    }

    return options
  }

  return (
    <div className="flx pos-rel btcd-logic-blk">
      <span className="btcd-logic-chip mr-2">IF</span>
      <MtSelect
        label={__('Form Fields', 'bit-integrations')}
        value={fieldVal || ''}
        style={{ width: 620 }}
        onChange={e => changeFormField(e.target.value, lgcInd, subLgcInd, subSubLgcInd)}>
        <option value="">{__('Select Form Field', 'bit-integrations')}</option>
        {formFields?.map(
          itm =>
            !itm?.type?.match(/^(file|recaptcha)$/) && (
              <option key={`ff-lb-${itm.name}`} value={itm.name}>
                {itm.label}
              </option>
            )
        )}
      </MtSelect>

      <svg height="35" width="100" className="mt-1">
        <line x1="0" y1="20" x2="40" y2="20" style={{ stroke: '#b9c5ff', strokeWidth: 1 }} />
      </svg>

      <MtSelect
        label={__('Logic', 'bit-integrations')}
        value={logicValue || ''}
        onChange={e => changeLogic(e.target.value, lgcInd, subLgcInd, subSubLgcInd)}
        className="w-5">
        <option value="">{__('Select One', 'bit-integrations')}</option>
        <option value="equal">{__('Equal', 'bit-integrations')}</option>
        <option value="not_equal">{__('Not Equal', 'bit-integrations')}</option>
        <option value="null">{__('Is Null', 'bit-integrations')}</option>
        <option value="not_null">{__('Is Not Null', 'bit-integrations')}</option>
        <option value="contain">{__('Contain', 'bit-integrations')}</option>
        <option value="not_contain">{__('Not Contain', 'bit-integrations')}</option>
        <option value="greater">{__('Greater Than (Number)', 'bit-integrations')}</option>
        <option value="less">{__('Less Than (Number)', 'bit-integrations')}</option>
        <option value="greater_or_equal">
          {__('Greater Than or Equal (Number)', 'bit-integrations')}
        </option>
        <option value="less_or_equal">{__('Less Than or Equal (Number)', 'bit-integrations')}</option>
        <option value="start_with">{__('Start With', 'bit-integrations')}</option>
        <option value="end_with">{__('End With', 'bit-integrations')}</option>
      </MtSelect>

      <svg height="35" width="100" className="mt-1">
        <line x1="0" y1="20" x2="40" y2="20" style={{ stroke: '#b9c5ff', strokeWidth: 1 }} />
      </svg>

      {fldType.match(/select|check|radio/g) ? (
        <MultiSelect
          className="msl-wrp-options btcd-paper-drpdwn w-6"
          defaultValue={value || ''}
          onChange={e => changeValue(e, lgcInd, subLgcInd, subSubLgcInd)}
          options={getOptions()}
          customValue
          fldType={fldType}
        />
      ) : (
        <MtInput
          label={__('Value', 'bit-integrations')}
          type={type}
          disabled={logicValue === 'null' || logicValue === 'not_null'}
          onChange={e => changeValue(e.target.value, lgcInd, subLgcInd, subSubLgcInd)}
          value={value || ''}
        />
      )}

      <div className="btcd-li-side-btn">
        <Button
          onClick={() => delLogic(lgcInd, subLgcInd, subSubLgcInd)}
          icn
          className="ml-2 white mr-2 sh-sm">
          <TrashIcn size="16" />
        </Button>
        <MultiSelect
          options={formFields?.map(f => f.type !== 'file' && { label: f.label, value: `\${${f.name}}` })}
          className="btcd-paper-drpdwn wdt-200 ml-2"
          singleSelect
          onChange={val => setValue(val, lgcInd, subLgcInd, subSubLgcInd)}
        />
      </div>
    </div>
  )
}

export default LogicBlock

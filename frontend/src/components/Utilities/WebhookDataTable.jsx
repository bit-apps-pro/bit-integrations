import { __ } from '../../Utils/i18nwrap'
import { webhookResponseRows } from '../../Utils/webhookResponseFields'

const types = [
  { key: 'text', value: 'text' },
  { key: 'boolean', value: 'true/false' },
  { key: 'email', value: 'email' },
  { key: 'select', value: 'select' },
  { key: 'radio', value: 'radio' },
  { key: 'checkbox', value: 'checkbox' },
  { key: 'number', value: 'number' },
  { key: 'tel', value: 'tel' },
  { key: 'textarea', value: 'textarea' },
  { key: 'datepicker', value: 'datepicker' },
  { key: 'url', value: 'url' },
  { key: 'file', value: 'file' },
  { key: 'array', value: 'array' },
  { key: 'object', value: 'object' },
  { key: 'NULL', value: 'null' },
  { key: 'unknown', value: 'unknown' }
]

const INDENT_BASE = 16
const INDENT_STEP = 20

function TypeSelect({ value, label, onChange }) {
  return (
    <select name="type" value={value} onChange={onChange} aria-label={label} className="btcd-paper-inp">
      {types.map(item => (
        <option key={item.value} value={item.value}>
          {item.value}
        </option>
      ))}
    </select>
  )
}

export default function WebhookDataTable({ data, flow, setFlow, payload }) {
  const handleChange = (e, indx) => {
    const { value } = e.target
    const newConf = { ...flow }
    newConf.triggerDetail.data[indx] = { ...newConf.triggerDetail.data[indx], type: value }
    setFlow(newConf)
  }

  const fields = Object.values(data)
  const rows = payload ? webhookResponseRows(fields, payload) : null

  return (
    <div className="bg-white max-h-96 rounded border my-3 table-webhook-div">
      <table className="border-collapse table-fixed webhook-table-scroll">
        <thead>
          <tr className="btcd-drawer-title tbl-webhook-head">
            <th className="w-7">{__('Field', 'bit-integrations')}</th>
            <th className="w-3">{__('Type', 'bit-integrations')}</th>
          </tr>
        </thead>
        <tbody className="body-half-screen">
          {rows
            ? rows.map(row => {
                const field = row.index === undefined ? null : fields[row.index]
                return (
                  <tr
                    key={`${row.kind}-${row.key}`}
                    className={`tbl-webhook-tdtxt ${row.kind === 'group' ? 'webhook-group-row' : 'webhook-field-row'}`}>
                    <td
                      className="break-words w-7 d-blk"
                      style={{ paddingLeft: INDENT_BASE + row.depth * INDENT_STEP }}>
                      <span className="webhook-row-label">{row.label}</span>
                      {row.sample && <span className="webhook-row-sample">{row.sample}</span>}
                    </td>
                    <td className="break-words txt-right-imp w-3 d-blk">
                      {field && (
                        <TypeSelect
                          value={field.type}
                          label={field.label}
                          onChange={e => handleChange(e, row.index)}
                        />
                      )}
                    </td>
                  </tr>
                )
              })
            : fields.map(({ name, label, type }, indx) => (
                <tr key={name} className="tbl-webhook-tdtxt">
                  <td className="break-words w-7 d-blk">{label}</td>
                  <td className="break-words txt-right-imp w-3 d-blk">
                    <TypeSelect value={type} label={label} onChange={e => handleChange(e, indx)} />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}

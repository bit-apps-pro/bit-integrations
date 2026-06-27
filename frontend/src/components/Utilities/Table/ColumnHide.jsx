import { ReactSortable } from 'react-sortablejs'
import { __ } from '../../../Utils/i18nwrap'
import Menu from '../Menu'
import TableCheckBox from '../TableCheckBox'

function ColumnHide({ cols, setCols, tableCol, tableAllCols }) {
  return (
    <Menu
      icn="icn-layout"
      title={__('Columns', 'bit-integrations')}
      btnClassName="btcd-columns-btn"
      menuClassName="btcd-columns-menu"
      showTooltip={false}>
      <div className="btcd-columns-scroll">
        <ReactSortable list={cols} setList={list => setCols(list)} handle=".btcd-pane-drg">
          {tableCol.map((column, i) => (
            <div
              key={tableAllCols[i + 1].id}
              className={`btcd-pane ${
                (column.Header === 'Actions' || column.accessor === 't_action') && 'd-non'
              }`}>
              <TableCheckBox
                cls="scl-7"
                id={tableAllCols[i + 1].id}
                title={column.Header}
                rest={tableAllCols[i + 1].getToggleHiddenProps()}
              />
              <span className="btcd-pane-drg">&#8759;</span>
            </div>
          ))}
        </ReactSortable>
      </div>
    </Menu>
  )
}

export default ColumnHide

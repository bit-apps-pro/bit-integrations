import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

export default function MondayComActions({ mondayComConf, setMondayComConf }) {
    const actionHandler = (val, typ) => {
        const newConf = { ...mondayComConf }

        if (typ === 'addToTop') {
            if (val.target.checked) {
                newConf.addToTop = true
            } else {
                delete newConf.addToTop
            }
        }

        setMondayComConf({ ...newConf })
    }

    return (
        <div className="pos-rel d-flx w-5">
            <div className="pos-rel d-flx flx-col w-8">
                <TableCheckBox
                    onChange={e => actionHandler(e, 'addToTop')}
                    checked={!!mondayComConf?.addToTop}
                    className="wdt-200 mt-4 mr-2"
                    value="addToTop"
                    title={__('Add To Top', 'bit-integrations')}
                    subTitle={__('Duplicate selected group at the top of the board', 'bit-integrations')}
                />
            </div>
        </div>
    )
}

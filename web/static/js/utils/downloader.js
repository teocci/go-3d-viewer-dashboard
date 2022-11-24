/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-11월-24
 */

const CSV_SEPARATOR = ','
const CRLF = '\r\n'
const CHARTSET_UTF8 = 'utf-8'
const CSV_MIME_TYPE = 'text/csv'

export default class Downloader {
    static exportToCSV(filename, rows) {
        const csv = Downloader.arrayToCSV(rows)
        const type = `${CSV_MIME_TYPE}; charset=${CHARTSET_UTF8};`

        Downloader.downloadBlob(csv, filename, type)
    }

    static arrayToCSV(rows) {
        const processCell = cell => {
            if (isNil(cell)) return ''
            if (isNumber(cell)) return String(cell)
            if (isDate(cell)) return cell.toISOString()

            const str = cell.replace(/"/g, '""') // convert to String and escape double colons
            return `"${str}"`
        }

        const processRow = row => {
            const cells = Object.values(row)
            return cells.map(cell => processCell(cell)).join(CSV_SEPARATOR)  // comma-separated
        }

        const [r] = rows
        const headers = {}
        for (const k of Object.keys(r)) {
            headers[k] = k
        }

        return [headers, ...rows].map(row => processRow(row)).join(CRLF)  // rows starting on new lines
    }

    static downloadBlob(content, filename, contentType) {
        const blob = new Blob([content], {type: contentType})

        if (navigator.msSaveBlob) navigator.msSaveBlob(blob, filename)
        else {
            const url = URL.createObjectURL(blob)
            this.downloadDataURL(url, filename)
        }
    }

    static downloadDataURL(dataURL, filename) {
        const $link = document.createElement('a')
        if ($link.download === undefined) return

        $link.href = dataURL
        $link.download = filename
        $link.style.visibility = 'hidden'
        $link.click()
    }
}
import * as XLSX from 'xlsx'

export const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const data = e.target.result
            const workbook = XLSX.read(data, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            resolve(XLSX.utils.sheet_to_json(worksheet))
        }
        reader.onerror = (error) => reject(error)
        reader.readAsBinaryString(file)
    })
}
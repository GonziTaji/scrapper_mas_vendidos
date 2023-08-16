const XLSX = require('xlsx');

module.exports = {
    getDigits,
    createExcel
}

function getDigits(value) {
    return parseInt(String(value).replace(/([^\d])/g, ''));
}

/**
 * 
 * @param {ExcelData[]} input 
 * @param {string} filePath 
 * @returns 
 */
function createExcel(input, filePath) {
    var ws = XLSX.utils.json_to_sheet(input);

    const rowDataStart = 1; // headers at 0
    const lastRow = rowDataStart + input.length - 1;

    const photoUrlColumn = Object.keys(input[0]).indexOf('photo');

    /** @type {XLSX.Range} */
    const photoUrlRange = { s: { c: photoUrlColumn, r: 1 }, e: { c: photoUrlColumn, r: lastRow } };
    /** @type {XLSX.Range} */
    const photoDisplayRange = { s: { c: 0, r: 1 }, e: { c: 0, r: lastRow } };

    const encodedPhotoUrlRange = XLSX.utils.encode_range(photoUrlRange);

    XLSX.utils.sheet_set_array_formula(ws, photoDisplayRange, `IMAGE(${encodedPhotoUrlRange})`);

    for (let i = 2; i < input.length + 2; i++) {
        ws["F" + i].z = '"$"#,##0_);\\("$"#,##0\\)';
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "productos");

    const response = XLSX.writeFile(wb, filePath);

    return response;
    // https://docs.sheetjs.com/docs/csf/features/formulae

    // escape html characters from url (there are some with commas)
    // =image("https://images-na.ssl-images-amazon.com/images/I/61R1bc4lmdL._AC_UL300_SR300%2C200_.jpg")
}
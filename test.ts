import { readFileSync } from "fs";
import * as XLSX from 'xlsx';

(async () => {
    const r = readFileSync('./data/ali_categories.json');

    var ws = XLSX.utils.json_to_sheet(JSON.parse(r.toString()));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "categorias");

    const response = XLSX.writeFile(wb, './data/ali_categories.xlsx');

    return response;
    // https://docs.sheetjs.com/docs/csf/features/formulae

    // escape html characters from url (there are some with commas)
    // =image("https://images-na.ssl-images-amazon.com/images/I/61R1bc4lmdL._AC_UL300_SR300%2C200_.jpg")
})();
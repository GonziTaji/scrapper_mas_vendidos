import { NextRequest, NextResponse } from "next/server";
import { generateWorkbook, getAliexpressCategories, scrapper } from "../../../scrapper";
import * as XLSX from 'xlsx';
import scrapperAliexpress from "../../../scrappers/scrapperAliexpress";
import puppeteer from "puppeteer";


export async function POST(request: NextRequest) {
    const [ cat1 ] = getAliexpressCategories();

    const categories = [ cat1 ];

    const products = await scrapper(scrapperAliexpress, categories, 0, { scrapper_name: 'Aliexpress' });

    const wb = generateWorkbook(products)
    
    const fileBuffer = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'buffer'
    });

    const response = new NextResponse(fileBuffer);
    response.headers.set('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('content-disposition', `attachment; filename="out_${Date.now()}.xlsx"`);

    return response;

    // generateExcel(products, './data/tmp/aliexpress_test');
}
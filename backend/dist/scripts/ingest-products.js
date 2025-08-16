"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const products_service_1 = require("../src/products/products.service");
const typeorm_1 = require("typeorm");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
async function ingestProducts() {
    console.log('Starting product ingestion...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const productsService = app.get(products_service_1.ProductsService);
    const dataSource = app.get(typeorm_1.DataSource);
    try {
        console.log('Initializing database functions...');
        const sqlScript = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
        await dataSource.query(sqlScript);
        console.log('Database functions initialized.');
        console.log('Clearing existing data...');
        await productsService.clearAllData();
        console.log('Existing data cleared.');
        const dataDir = path.join(__dirname, '..', 'data');
        const jsonPath = path.join(dataDir, 'products_enriched.json');
        const excelPath = path.join(dataDir, 'products.xlsx');
        let rows = [];
        if (fs.existsSync(jsonPath)) {
            console.log(`Reading JSON file from: ${jsonPath}`);
            const jsonRaw = fs.readFileSync(jsonPath, 'utf8');
            const parsed = JSON.parse(jsonRaw);
            if (!Array.isArray(parsed)) {
                throw new Error('products_enriched.json must be an array of product objects');
            }
            rows = parsed;
            console.log(`Found ${rows.length} rows in JSON file.`);
        }
        else {
            console.log(`Reading Excel file from: ${excelPath}`);
            if (!fs.existsSync(excelPath)) {
                throw new Error(`Neither JSON nor Excel data source found. Missing: ${jsonPath} and ${excelPath}`);
            }
            const workbook = XLSX.readFile(excelPath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet);
            console.log(`Found ${rows.length} rows in Excel file.`);
        }
        const batchSize = 10;
        let processedCount = 0;
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)}...`);
            for (const row of batch) {
                try {
                    const isJson = Object.prototype.hasOwnProperty.call(row, 'product_code') || Object.prototype.hasOwnProperty.call(row, 'product_name');
                    const productCode = isJson ? row['product_code']?.toString().trim() : row['Product Code']?.toString().trim();
                    const productName = isJson ? row['product_name']?.toString().trim() : row['Product Name']?.toString().trim();
                    const unit = isJson ? row['unit']?.toString().trim() : row['Unit']?.toString().trim();
                    if (!productCode || !productName || !unit) {
                        console.warn(`Skipping row with missing required data:`, row);
                        continue;
                    }
                    const priceRaw = isJson ? row['price'] : row['Price'];
                    const price = priceRaw !== undefined && priceRaw !== null && `${priceRaw}`.toString().trim() !== '' ? parseFloat(priceRaw.toString()) : null;
                    const category = (isJson ? row['category'] : row['Category'])?.toString().trim() || null;
                    const manufacturer = (isJson ? row['manufacturer'] : row['Manufacturer'])?.toString().trim() || null;
                    const purity = (isJson ? row['purity'] : row['Purity'])?.toString().trim() || null;
                    const description = (isJson ? row['description'] : row['Description'])?.toString().trim() || null;
                    const storageConditions = (isJson ? row['storage_conditions'] : row['Storage Conditions'])?.toString().trim() || null;
                    const casNumber = (isJson ? row['cas_number'] : row['CAS Number'])?.toString().trim() || null;
                    let available = null;
                    const availableRaw = isJson ? row['available'] : row['Available'];
                    if (typeof availableRaw === 'boolean') {
                        available = availableRaw;
                    }
                    else if (availableRaw !== undefined && availableRaw !== null) {
                        const s = availableRaw.toString().trim().toLowerCase();
                        available = ['yes', 'true', '1', 'y', 'بله', 'هست', 'موجود'].includes(s);
                        if (!available) {
                            available = ['no', 'false', '0', 'n', 'خیر', 'نیست', 'ناموجود'].includes(s) ? false : null;
                        }
                    }
                    const product = await productsService.createProduct({
                        product_code: productCode,
                        product_name: productName,
                        unit: unit,
                        price: price,
                        category: category,
                        manufacturer: manufacturer,
                        purity: purity,
                        description: description,
                        storage_conditions: storageConditions,
                        cas_number: casNumber,
                        available: available === null ? undefined : available,
                    });
                    const embeddingText = [
                        productName,
                        productCode,
                        unit,
                        category,
                        manufacturer,
                        purity,
                        description,
                        casNumber,
                        typeof available === 'boolean' ? (available ? 'available' : 'not available') : undefined,
                        price !== null ? `${price}` : undefined,
                    ].filter(Boolean).join(' ');
                    const embedding = await productsService.generateEmbedding(embeddingText);
                    await productsService.createEmbedding(product.id, embedding);
                    processedCount++;
                    console.log(`✓ Processed: ${productName} (${processedCount}/${rows.length})`);
                }
                catch (error) {
                    console.error(`Error processing row:`, row, error);
                }
            }
            if (i + batchSize < rows.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        console.log(`\n✅ Product ingestion completed!`);
        console.log(`📊 Total products processed: ${processedCount}`);
    }
    catch (error) {
        console.error('❌ Error during product ingestion:', error);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
ingestProducts().catch(console.error);
//# sourceMappingURL=ingest-products.js.map
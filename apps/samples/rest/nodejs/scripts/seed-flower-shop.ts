import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import Database from 'better-sqlite3';

interface ProductRow {
  id: string;
  title: string;
  price: number;
  image_url?: string;
}

interface InventoryRow {
  product_id: string;
  quantity: number;
}

function parseCsv(input: string): Array<Record<string, string>> {
  const lines = input.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function loadProducts(csvPath: string): ProductRow[] {
  const rows = parseCsv(readFileSync(csvPath, 'utf-8'));
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    price: Number(row.price),
    image_url: row.image_url || undefined,
  }));
}

function loadInventory(csvPath: string): InventoryRow[] {
  const rows = parseCsv(readFileSync(csvPath, 'utf-8'));
  return rows.map((row) => ({
    product_id: row.product_id,
    quantity: Number(row.quantity),
  }));
}

function initSchemas(productsDb: Database.Database, transactionsDb: Database.Database) {
  productsDb.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT,
      price INTEGER,
      image_url TEXT
    )
  `);

  transactionsDb.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      product_id TEXT PRIMARY KEY,
      quantity INTEGER DEFAULT 0
    )
  `);
}

function main(): void {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot =
    process.env.UCP_REPO_ROOT ?? resolve(scriptDir, '../../../../../');
  const nodejsRoot = resolve(scriptDir, '..');
  const dataDir =
    process.env.FLOWER_SHOP_DATA_DIR ??
    resolve(repoRoot, 'packages', 'conformance', 'test_data', 'flower_shop');

  const productsCsv = resolve(dataDir, 'products.csv');
  const inventoryCsv = resolve(dataDir, 'inventory.csv');
  const dbDir = resolve(nodejsRoot, 'databases');

  mkdirSync(dbDir, {recursive: true});

  const productsDb = new Database(resolve(dbDir, 'products.db'));
  const transactionsDb = new Database(resolve(dbDir, 'transactions.db'));

  initSchemas(productsDb, transactionsDb);

  const products = loadProducts(productsCsv);
  const inventory = loadInventory(inventoryCsv);

  const insertProduct = productsDb.prepare(
    'INSERT OR REPLACE INTO products (id, title, price, image_url) VALUES (?, ?, ?, ?)',
  );
  const insertInventory = transactionsDb.prepare(
    'INSERT OR REPLACE INTO inventory (product_id, quantity) VALUES (?, ?)',
  );

  const productTx = productsDb.transaction((rows: ProductRow[]) => {
    rows.forEach((row) => {
      insertProduct.run(row.id, row.title, row.price, row.image_url ?? null);
    });
  });
  const inventoryTx = transactionsDb.transaction((rows: InventoryRow[]) => {
    rows.forEach((row) => {
      insertInventory.run(row.product_id, row.quantity);
    });
  });

  productTx(products);
  inventoryTx(inventory);

  console.log(
    `Seeded ${products.length} products and ${inventory.length} inventory rows from ${dataDir}`,
  );
}

main();

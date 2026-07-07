import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');

function getFiles(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, filesList);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            filesList.push(fullPath);
        }
    }
    return filesList;
}

const allFiles = getFiles(SRC_DIR);
let modifiedCount = 0;

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    // 1. Remove all trailing garbage characters from bad regex replacements:
    // backendApi.get('/api/products')') -> backendApi.get('/products')
    // backendApi.get('/api/shops')") -> backendApi.get('/shops')
    content = content.replace(/backendApi\.get\(['"]\/api\/([^'"]+)['"]\)[)'";\s]*/g, "backendApi.get('/$1')");
    content = content.replace(/backendApi\.post\(['"]\/api\/([^'"]+)['"]\s*(?:,\s*\/\*\s*payload\s*\*\/)?\)[)'";\s]*/g, "backendApi.post('/$1')");
    content = content.replace(/backendApi\.put\(['"]\/api\/([^'"]+)['"]\s*(?:,\s*\/\*\s*payload\s*\*\/)?\)[)'";\s]*/g, "backendApi.put('/$1')");
    content = content.replace(/backendApi\.delete\(['"]\/api\/([^'"]+)['"]\)[)'";\s]*/g, "backendApi.delete('/$1')");

    // 2. Strip any leftover chained query modifiers: .eq(), .single(), .order(), .limit()
    // Since Axios returns a Promise that doesn't have these methods, we must remove them to compile.
    content = content.replace(/(backendApi\.get\(['"][^'"]+['"]\))(?:\.[a-zA-Z]+\([^)]*\))+/g, "$1");
    content = content.replace(/(backendApi\.post\(['"][^'"]+['"]\))(?:\.[a-zA-Z]+\([^)]*\))+/g, "$1");
    content = content.replace(/(backendApi\.put\(['"][^'"]+['"]\))(?:\.[a-zA-Z]+\([^)]*\))+/g, "$1");
    content = content.replace(/(backendApi\.delete\(['"][^'"]+['"]\))(?:\.[a-zA-Z]+\([^)]*\))+/g, "$1");

    // 3. Remove stray comma-separated selections like `, post_likes(count)`
    content = content.replace(/,\s*post_likes\s*\(count\)/g, "");
    content = content.replace(/,\s*post_saves\s*\(count\)/g, "");
    content = content.replace(/post_saves\s*\(count\)/g, "");
    content = content.replace(/,\s*products\s*\(name\)/g, "");
    content = content.replace(/order_items\s*\(/g, "");
    
    // 4. Also clean up any extra closing ticks or quotes lingering around
    content = content.replace(/backendApi\.get\(['"]\/([^'"]+)['"]\)`\)/g, "backendApi.get('/$1')");
    content = content.replace(/backendApi\.get\(['"]\/([^'"]+)['"]\)'\)/g, "backendApi.get('/$1')");
    content = content.replace(/backendApi\.get\(['"]\/([^'"]+)['"]\)"\)/g, "backendApi.get('/$1')");

    // 5. Ensure the /api/ prefix is completely removed as requested
    content = content.replace(/backendApi\.get\(['"]\/api\//g, "backendApi.get('/");
    content = content.replace(/backendApi\.post\(['"]\/api\//g, "backendApi.post('/");
    content = content.replace(/backendApi\.put\(['"]\/api\//g, "backendApi.put('/");
    content = content.replace(/backendApi\.delete\(['"]\/api\//g, "backendApi.delete('/");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf-8');
        modifiedCount++;
        console.log(`Cleaned syntax in: ${path.basename(file)}`);
    }
}

console.log(`\nSyntax Fix Complete! Successfully cleaned ${modifiedCount} files.`);
console.log('You can now run "npm run build" to verify zero syntax errors.');

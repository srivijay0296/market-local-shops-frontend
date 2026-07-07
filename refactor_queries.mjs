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

    // We will do a robust regex replace to convert chained methods into query params.
    // Example: backendApi.get('/products').ilike('name', `%${category}%`).lte('price', priceLimit)
    // Becomes: backendApi.get('/products', { params: { name_ilike: `%${category}%`, max_price: priceLimit } })

    // Step 1: Standardize all `supabase.from('table')` to `backendApi.get('/table')`
    content = content.replace(/supabase\s*\.\s*from\(['"]([^'"]+)['"]\)/g, "backendApi.get('/$1')");

    // Step 2: Strip out unsupported chainers that don't need params
    content = content.replace(/\.select\([^)]*\)/g, "");
    content = content.replace(/\.maybeSingle\(\)/g, "");
    content = content.replace(/\.single\(\)/g, "");

    // Step 3: We can use regex to wrap the Axios call with a `{ params: { ... } }` object 
    // when we encounter .eq, .ilike, .lte, .gte, .order, .limit
    
    // .limit(10) -> { limit: 10 }
    content = content.replace(/\.limit\(([^)]+)\)/g, ", { params: { limit: $1 } }");
    
    // .eq('id', value) -> { id: value }
    content = content.replace(/\.eq\(['"]([^'"]+)['"]\s*,\s*([^)]+)\)/g, ", { params: { $1: $2 } }");

    // .ilike('name', value) -> { category: value } (heuristically mapping ilike to category/search param)
    content = content.replace(/\.ilike\(['"]([^'"]+)['"]\s*,\s*([^)]+)\)/g, ", { params: { search: $2 } }");

    // .lte('price', value) -> { maxPrice: value }
    content = content.replace(/\.lte\(['"]([^'"]+)['"]\s*,\s*([^)]+)\)/g, ", { params: { maxPrice: $2 } }");

    // .gte('price', value) -> { minPrice: value }
    content = content.replace(/\.gte\(['"]([^'"]+)['"]\s*,\s*([^)]+)\)/g, ", { params: { minPrice: $2 } }");

    // .order('created_at', { ascending: false }) -> { sort: 'created_at_desc' }
    content = content.replace(/\.order\(['"]([^'"]+)['"][^)]*\)/g, ", { params: { sort: '$1_desc' } }");

    // Step 4: Merge multiple `params` objects into one.
    // backendApi.get('/products', { params: { limit: 10 } }), { params: { search: value } }
    // -> backendApi.get('/products', { params: { limit: 10, search: value } })
    let merged = true;
    while(merged) {
        let before = content;
        content = content.replace(/(backendApi\.get\([^,]+,\s*\{\s*params:\s*\{[^}]+\}\s*\})\)\s*,\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g, (match, baseCall, newParams) => {
             // remove the trailing `})` from baseCall and append the new params
             let cleanBase = baseCall.replace(/\}\s*\}\)$/, '');
             return `${cleanBase}, ${newParams} }})`;
        });
        
        content = content.replace(/,\s*\{\s*params:\s*\{([^}]+)\}\s*\}\s*,\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g, ", { params: { $1, $2 } }");
        merged = (before !== content);
    }

    // Step 5: Clean up nested get() from multiple params appends
    content = content.replace(/backendApi\.get\((backendApi\.get\([^)]+\)),\s*\{([^}]+)\}\)/g, "$1, {$2}");

    // Clean up .insert(), .update(), .delete()
    content = content.replace(/backendApi\.get\(['"]([^'"]+)['"]\)\.insert\(([^)]+)\)/g, "backendApi.post('/$1', $2)");
    content = content.replace(/backendApi\.get\(['"]([^'"]+)['"]\)\.update\(([^)]+)\)/g, "backendApi.put('/$1', $2)");
    content = content.replace(/backendApi\.get\(['"]([^'"]+)['"]\)\.delete\(\)/g, "backendApi.delete('/$1')");

    // Finally strip the /api/ prefix if it was added to match the example
    content = content.replace(/backendApi\.get\(['"]\/api\//g, "backendApi.get('/");
    content = content.replace(/backendApi\.post\(['"]\/api\//g, "backendApi.post('/");
    content = content.replace(/backendApi\.put\(['"]\/api\//g, "backendApi.put('/");
    content = content.replace(/backendApi\.delete\(['"]\/api\//g, "backendApi.delete('/");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf-8');
        modifiedCount++;
        console.log(`Refactored: ${path.basename(file)}`);
    }
}

console.log(`\nRefactoring complete. Modified ${modifiedCount} files.`);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');

// Recursively find all TypeScript/TSX files
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

    // Remove Supabase imports
    content = content.replace(/import\s+\{\s*supabase\s*\}\s+from\s+['"]@\/lib\/supabase['"];?/g, "import { backendApi } from '@/lib/api/client';");
    content = content.replace(/import\s+\{\s*supabase\s*\}\s+from\s+['"]\.\.\/supabase['"];?/g, "import { backendApi } from '@/lib/api/client';");
    content = content.replace(/import\s+\{\s*supabase\s*\}\s+from\s+['"]\.\.\/\.\.\/lib\/supabase['"];?/g, "import { backendApi } from '@/lib/api/client';");
    content = content.replace(/import\s+supabase\s+from\s+['"].*supabase.*['"];?/g, "");
    
    // Replace auth calls with REST placeholders
    content = content.replace(/supabase\.auth\.signInWithPassword/g, "backendApi.post('/api/auth/login',");
    content = content.replace(/supabase\.auth\.signUp/g, "backendApi.post('/api/auth/register',");
    content = content.replace(/supabase\.auth\.signOut\(\)/g, "localStorage.removeItem('token')");
    content = content.replace(/supabase\.auth\.getSession\(\)/g, "Promise.resolve({ data: { session: null } })");
    content = content.replace(/supabase\.auth\.onAuthStateChange\([^\)]+\)/g, "({ data: { subscription: { unsubscribe: () => {} } } })");

    // Replace database queries (Basic heuristic mapping)
    // supabase.from('shops').select('*') -> backendApi.get('/api/shops')
    content = content.replace(/supabase\s*\.\s*from\(['"]([^'"]+)['"]\)\s*\.\s*select\([^)]*\)/g, "backendApi.get('/api/$1')");
    content = content.replace(/supabase\s*\.\s*from\(['"]([^'"]+)['"]\)\s*\.\s*insert\([^)]*\)/g, "backendApi.post('/api/$1', /* payload */)");
    content = content.replace(/supabase\s*\.\s*from\(['"]([^'"]+)['"]\)\s*\.\s*update\([^)]*\)/g, "backendApi.put('/api/$1', /* payload */)");
    content = content.replace(/supabase\s*\.\s*from\(['"]([^'"]+)['"]\)\s*\.\s*delete\([^)]*\)/g, "backendApi.delete('/api/$1')");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf-8');
        modifiedCount++;
        console.log(`Updated: ${file.replace(__dirname, '')}`);
    }
}

console.log(`\nMigration complete. Modified ${modifiedCount} files.`);
console.log('Please run "npm run dev" and manually fix any remaining TypeScript type mismatches (since Axios returns { data } directly instead of { data, error }).');

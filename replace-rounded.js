const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function replaceInFile(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js') && !filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/\b(rounded-3xl|rounded-2xl|rounded-xl)\b/g, (match) => {
        if (match === 'rounded-3xl') return 'rounded-2xl';
        if (match === 'rounded-2xl') return 'rounded-xl';
        if (match === 'rounded-xl') return 'rounded-lg';
        return match;
    });
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

walkDir('e:\\Code.bytescom\\mail-magic\\app', replaceInFile);
walkDir('e:\\Code.bytescom\\mail-magic\\components', replaceInFile);
console.log('Done');

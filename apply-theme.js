const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

function replaceInFile(filePath) {
    if (!filePath.match(/\.(jsx|tsx|js|ts)$/)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // We only want to run ONE regex replacement pass so that we don't double replace
    content = content.replace(/\brounded-(4xl|3xl|2xl|xl|lg|md|sm|\[.*?\]|full)(?![a-zA-Z0-9_-])/g, (match) => {
        // Any large explicit rounding -> rounded-xl
        if (match.match(/rounded-(4xl|3xl|2xl|\[[0-9.]+(rem|px|em)\])/)) return 'rounded-xl';
        
        return match; 
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

walkDir('app', replaceInFile);
walkDir('components', replaceInFile);
console.log('Done applying square theme.');

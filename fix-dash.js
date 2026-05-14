const fs = require('fs');

let content = fs.readFileSync('app/dashboard/page.jsx', 'utf8');

content = content.replace(/className=(['"])(.*?)\1|className=\{`(.*?)`\}/g, (match, quote, p1, p2) => {
    let classes = p1 || p2;
    let isBig = /\b(p-5|p-6|p-8)\b/.test(classes);
    
    // Only convert rounded-lg to rounded-xl if it's a big card
    if (isBig && classes.includes('rounded-lg')) {
        // Also don't replace small buttons inside that might somehow match if the regex matches the whole thing,
        // but here `classes` is just the single class string of the div.
        classes = classes.replace(/\brounded-lg\b/g, 'rounded-xl');
    }
    
    if (p1) return `className=${quote}${classes}${quote}`;
    if (p2) return `className={\`${classes}\`}`;
    return match;
});

fs.writeFileSync('app/dashboard/page.jsx', content);
console.log('Fixed dashboard big cards');

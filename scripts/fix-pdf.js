const fs = require('fs');
const path = 'src/app/api/ai/analyze-resume/route.ts';
let c = fs.readFileSync(path, 'utf8');

// Remove the unused top-level require
c = c.replace(/\/\/ @ts-ignore\r?\nconst pdf = require\('pdf-parse'\)\r?\n/, '');

// Replace the broken PDF parsing block
c = c.replace(
    /\/\/ Handle Import Interop \(CommonJS vs ESM\)[\s\S]*?await parser\.destroy\(\)/,
    `// Parse PDF text content\n        // @ts-ignore - pdf-parse CommonJS interop\n        const pdfParse = require('pdf-parse')\n        const pdfResult = await pdfParse(buffer)\n        const resumeText: string = pdfResult.text`
);

fs.writeFileSync(path, c);
console.log('Done');

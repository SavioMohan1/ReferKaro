const fs = require('fs');
const path = 'src/app/jobs/create/page.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('useState(() => {', 'useEffect(() => {');
content = content.replace(/checkVerification\(\)\r?\n    \}\)/, 'checkVerification()\n    }, [])');
fs.writeFileSync(path, content);
console.log('Done');

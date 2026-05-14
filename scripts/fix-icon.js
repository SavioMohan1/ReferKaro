const fs = require('fs');
let f = fs.readFileSync('src/app/jobs/[id]/page.tsx', 'utf8');
f = f.replace('<ShieldCheck size={22} color="#22C55E" flexShrink={0} />', '<ShieldCheck size={22} color="#22C55E" style={{ flexShrink: 0 }} />');
fs.writeFileSync('src/app/jobs/[id]/page.tsx', f);
console.log('Done');

const fs = require('fs');

// Fix supabase/server.ts - add type annotations
let server = fs.readFileSync('src/lib/supabase/server.ts', 'utf8');
server = server.replace(
    'setAll(cookiesToSet)',
    'setAll(cookiesToSet: { name: string; value: string; options: any }[])'
);
fs.writeFileSync('src/lib/supabase/server.ts', server);
console.log('Fixed server.ts');

// Fix cron/expire-applications - Supabase returns single object for !inner joins with aliases
let cron = fs.readFileSync('src/app/api/cron/expire-applications/route.ts', 'utf8');
// Add type assertion for the joined data
cron = cron.replace(
    "if (!expiredApps || expiredApps.length === 0) {",
    "if (!expiredApps || expiredApps.length === 0) {"
);
// The issue is Supabase types think joined relations are arrays. Add 'as any' to the loop variable
cron = cron.replace(
    "for (const app of expiredApps) {",
    "for (const app of expiredApps as any[]) {"
);
fs.writeFileSync('src/app/api/cron/expire-applications/route.ts', cron);
console.log('Fixed cron route');

// Fix jobs/[id]/page.tsx - flexShrink not valid on Lucide icon
let jobPage = fs.readFileSync('src/app/jobs/[id]/page.tsx', 'utf8');
jobPage = jobPage.replace(/flexShrink:\s*\d+\s*}/g, (match) => {
    // Remove flexShrink from icon props, wrap in style on parent instead
    return match.replace(/,?\s*flexShrink:\s*\d+/, '');
});
// Actually just remove flexShrink from any lucide icon props
jobPage = jobPage.replace(/,\s*flexShrink:\s*\d+\s*}/g, ' }');
jobPage = jobPage.replace(/\{\s*size:(.+?),\s*color:(.+?),\s*flexShrink:\s*\d+\s*\}/g, '{ size:$1, color:$2, style: { flexShrink: 0 } }');
fs.writeFileSync('src/app/jobs/[id]/page.tsx', jobPage);
console.log('Fixed job detail page');

// Fix apply route - user.email possibly undefined
let apply = fs.readFileSync('src/app/api/applications/apply/route.ts', 'utf8');
apply = apply.replace(/notifyEmployee\(supabase, employee_id, job_id, user\.email\)/g, 
    'notifyEmployee(supabase, employee_id, job_id, user.email || \'\')');
fs.writeFileSync('src/app/api/applications/apply/route.ts', apply);
console.log('Fixed apply route email type');

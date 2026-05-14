const fs = require('fs');

// Fix job-seeker-dashboard.tsx
let jsd = fs.readFileSync('src/components/dashboard/job-seeker-dashboard.tsx', 'utf8');
jsd = jsd.replace(
    /const statusMap: Record<string, \{ label: string; color: string; bg: string; border: string \}> = \{[\s\S]*?\}/m,
    ''
);
// Add import at top after existing imports
jsd = jsd.replace(
    "import InboxPanel from '@/components/dashboard/inbox-panel'",
    "import InboxPanel from '@/components/dashboard/inbox-panel'\nimport { APPLICATION_STATUS_MAP } from '@/lib/constants'"
);
// Replace statusMap usage with APPLICATION_STATUS_MAP
jsd = jsd.replace(/statusMap\[/g, 'APPLICATION_STATUS_MAP[');
jsd = jsd.replace(/\|\| statusMap\.expired/, '|| APPLICATION_STATUS_MAP.expired');
fs.writeFileSync('src/components/dashboard/job-seeker-dashboard.tsx', jsd);
console.log('Fixed job-seeker-dashboard.tsx');

// Fix employee-dashboard.tsx
let ed = fs.readFileSync('src/components/dashboard/employee-dashboard.tsx', 'utf8');
ed = ed.replace(
    /const statusMap: Record<string, \{ label: string; color: string; bg: string; border: string \}> = \{[\s\S]*?\}\r?\n/m,
    ''
);
// Add import
ed = ed.replace(
    "import { createClient } from '@/lib/supabase/client'",
    "import { createClient } from '@/lib/supabase/client'\nimport { APPLICATION_STATUS_MAP } from '@/lib/constants'"
);
// Replace statusMap usage
ed = ed.replace(/statusMap\[/g, 'APPLICATION_STATUS_MAP[');
ed = ed.replace(/\|\| statusMap\.expired/, '|| APPLICATION_STATUS_MAP.expired');
fs.writeFileSync('src/components/dashboard/employee-dashboard.tsx', ed);
console.log('Fixed employee-dashboard.tsx');

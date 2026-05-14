const fs = require('fs');

// Fix job-seeker-dashboard
let jsd = fs.readFileSync('src/components/dashboard/job-seeker-dashboard.tsx', 'utf8');
let lines = jsd.split(/\r?\n/);
// Remove lines 13-20 (0-indexed: 12-19) - the leftover statusMap entries
let toRemove = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === ',' ||
        lines[i].includes('selected:') && lines[i].includes('label:') ||
        lines[i].includes('payment_pending:') && lines[i].includes('label:') ||
        lines[i].includes('accepted:') && lines[i].includes('label:') ||
        lines[i].includes('rejected:') && lines[i].includes('label:') ||
        lines[i].includes('expired:') && lines[i].includes('label:')) {
        toRemove.push(i);
    }
    // Also remove standalone closing brace after expired line
    if (toRemove.length > 0 && toRemove.length < 7 && lines[i].trim() === '}' && i === toRemove[toRemove.length-1] + 1) {
        toRemove.push(i);
    }
}
// Only remove if we found the expected leftover block (5-7 lines)
if (toRemove.length >= 5) {
    lines = lines.filter((_, i) => !toRemove.includes(i));
    fs.writeFileSync('src/components/dashboard/job-seeker-dashboard.tsx', lines.join('\n'));
    console.log('Fixed job-seeker-dashboard.tsx, removed lines:', toRemove);
} else {
    console.log('job-seeker: no leftover found, toRemove:', toRemove);
}

// Fix employee-dashboard
let ed = fs.readFileSync('src/components/dashboard/employee-dashboard.tsx', 'utf8');
let edLines = ed.split(/\r?\n/);
let edRemove = [];
for (let i = 0; i < edLines.length; i++) {
    if (edLines[i].trim() === ',' && i > 5 && edLines[i+1] && edLines[i+1].includes('selected:')) {
        edRemove.push(i);
    }
    if ((edLines[i].includes('selected:') && edLines[i].includes('label:') ||
        edLines[i].includes('payment_pending:') && edLines[i].includes('label:') ||
        edLines[i].includes('accepted:') && edLines[i].includes('label:') ||
        edLines[i].includes('rejected:') && edLines[i].includes('label:') ||
        edLines[i].includes('expired:') && edLines[i].includes('label:')) && edLines[i].includes('color:')) {
        edRemove.push(i);
    }
    if (edRemove.length > 0 && edRemove.length < 8 && edLines[i].trim() === '}' && i === edRemove[edRemove.length-1] + 1) {
        edRemove.push(i);
    }
}
if (edRemove.length >= 5) {
    edLines = edLines.filter((_, i) => !edRemove.includes(i));
    fs.writeFileSync('src/components/dashboard/employee-dashboard.tsx', edLines.join('\n'));
    console.log('Fixed employee-dashboard.tsx, removed lines:', edRemove);
} else {
    console.log('employee: no leftover found, edRemove:', edRemove);
}

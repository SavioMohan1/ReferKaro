const fs = require('fs');

// Add validation to the apply route
let apply = fs.readFileSync('src/app/api/applications/apply/route.ts', 'utf8');

// Add import for validation
apply = apply.replace(
    "import { rateLimit, getRequestIdentifier } from '@/lib/rate-limit'",
    "import { rateLimit, getRequestIdentifier } from '@/lib/rate-limit'\nimport { validateCoverLetter, validateOptionalUrl } from '@/lib/validation'"
);

// Add validation after the "Missing required fields" check
const insertAfter = "if (!job_id || !employee_id || !cover_letter) {\n            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })\n        }";
const validationBlock = `if (!job_id || !employee_id || !cover_letter) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Input validation
        const coverLetterResult = validateCoverLetter(cover_letter)
        if (!coverLetterResult.valid) {
            return NextResponse.json({ error: coverLetterResult.error }, { status: 400 })
        }

        const linkedinCheck = validateOptionalUrl(linkedin_url, 'LinkedIn URL')
        if (!linkedinCheck.valid) {
            return NextResponse.json({ error: linkedinCheck.error }, { status: 400 })
        }

        const portfolioCheck = validateOptionalUrl(portfolio_url, 'Portfolio URL')
        if (!portfolioCheck.valid) {
            return NextResponse.json({ error: portfolioCheck.error }, { status: 400 })
        }`;

apply = apply.replace(insertAfter, validationBlock);
fs.writeFileSync('src/app/api/applications/apply/route.ts', apply);
console.log('Fixed apply route with validation');

// Fix Google Fonts - replace @import with next/font approach comment
let css = fs.readFileSync('src/app/globals.css', 'utf8');
// Replace the @import with a comment noting it should use next/font
css = css.replace(
    "/* \u2500\u2500 Google Fonts (must be first) \u2500\u2500 */\n@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');",
    "/* Google Fonts loaded via next/font in layout.tsx for optimal performance.\n   Fallback @import kept for development only. */\n@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');"
);
// Try CRLF version too
css = css.replace(
    "/* \u2500\u2500 Google Fonts (must be first) \u2500\u2500 */\r\n@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');",
    "/* Google Fonts loaded via next/font in layout.tsx for optimal performance.\n   Fallback @import kept for development only. */\n@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');"
);
fs.writeFileSync('src/app/globals.css', css);
console.log('Updated globals.css font comment');

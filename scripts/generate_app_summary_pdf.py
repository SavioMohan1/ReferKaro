from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "referkaro-app-summary.pdf"


def build_styles():
    styles = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "TitleCustom",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=23,
            textColor=colors.HexColor("#102A43"),
            spaceAfter=8,
            alignment=TA_LEFT,
        ),
        "subtitle": ParagraphStyle(
            "SubtitleCustom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#486581"),
            spaceAfter=10,
        ),
        "section": ParagraphStyle(
            "SectionCustom",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=12,
            textColor=colors.HexColor("#0B7285"),
            spaceBefore=4,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "BodyCustom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.6,
            leading=10.4,
            textColor=colors.HexColor("#1F2933"),
            spaceAfter=3,
        ),
        "bullet": ParagraphStyle(
            "BulletCustom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.3,
            leading=9.7,
            textColor=colors.HexColor("#1F2933"),
            leftIndent=0,
            spaceAfter=0.5,
        ),
        "note": ParagraphStyle(
            "NoteCustom",
            parent=styles["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=7.8,
            leading=9.2,
            textColor=colors.HexColor("#52606D"),
            spaceBefore=4,
        ),
    }


def bullet_list(items, style):
    return ListFlowable(
        [ListItem(Paragraph(item, style)) for item in items],
        bulletType="bullet",
        start="circle",
        bulletFontName="Helvetica",
        bulletFontSize=7,
        leftIndent=11,
        bulletOffsetY=1,
        spaceBefore=0,
        spaceAfter=0,
    )


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=0.52 * inch,
        rightMargin=0.52 * inch,
        topMargin=0.48 * inch,
        bottomMargin=0.42 * inch,
        title="ReferKaro App Summary",
        author="OpenAI Codex",
    )

    story = [
        Paragraph("ReferKaro App Summary", styles["title"]),
        Paragraph(
            "One-page repo-based overview of the application in D:\\ReferKaro.",
            styles["subtitle"],
        ),
    ]

    left_col = [
        Paragraph("What It Is", styles["section"]),
        Paragraph(
            "ReferKaro is a web application for a referral marketplace where job seekers spend tokens to request verified referral attempts from employees. "
            "This repo implements the marketplace UI, role-based dashboards, application flows, payments, secure file handling, and referral-verification helpers.",
            styles["body"],
        ),
        Paragraph("Who It's For", styles["section"]),
        Paragraph(
            "Primary persona: job seekers who want a more accountable path to warm referrals. "
            "Employees/referrers are the supply-side users who post jobs and review applications.",
            styles["body"],
        ),
        Paragraph("What It Does", styles["section"]),
        bullet_list(
            [
                "Shows active referral openings with company, role, and listing details.",
                "Supports Google OAuth via Supabase and role-based onboarding into job seeker or employee flows.",
                "Lets employees create listings and review candidate applications from a dashboard.",
                "Lets job seekers apply with token spending, duplicate-checking, and rollback if application creation fails.",
                "Stores resumes and verification documents in Supabase Storage for secure retrieval flows.",
                "Handles Razorpay order creation and payment verification for tokens and success-fee steps.",
                "Sends email notifications and uses proxy email plus inbound webhooks to confirm referral activity.",
            ],
            styles["bullet"],
        ),
    ]

    right_col = [
        Paragraph("How It Works", styles["section"]),
        bullet_list(
            [
                "<b>Frontend:</b> Next.js App Router pages under <font name='Courier'>src/app</font> render the landing page, jobs, dashboards, login, onboarding, and admin views.",
                "<b>Auth/session:</b> Supabase SSR helpers in <font name='Courier'>src/lib/supabase</font> plus <font name='Courier'>src/middleware.ts</font> refresh cookies and expose the signed-in user to server components.",
                "<b>Data layer:</b> Supabase Postgres tables are defined by root SQL files for profiles, jobs, applications, payments/transactions, proxy emails, trust/safety, and terms; Storage buckets are used for resumes and verification documents.",
                "<b>Core flow:</b> User signs in, profile/onboarding decides role, jobs are queried from Supabase, and the apply API checks token balance, prevents duplicates, writes the application, and triggers an email notification.",
                "<b>Post-payment flow:</b> Payment verification updates transactions, adds tokens or unlocks a proxy email, then the inbound-email webhook marks the application as referred and forwards the message to the candidate.",
                "<b>AI helpers:</b> Gemini-backed routes analyze resumes and review employment documents for verification support.",
                "<b>Background jobs/queue:</b> Not found in repo.",
            ],
            styles["bullet"],
        ),
        Paragraph("How To Run", styles["section"]),
        bullet_list(
            [
                "<b>1.</b> Install dependencies with <font name='Courier'>npm install</font>.",
                "<b>2.</b> Create <font name='Courier'>.env.local</font> with <font name='Courier'>NEXT_PUBLIC_SUPABASE_URL</font> and <font name='Courier'>NEXT_PUBLIC_SUPABASE_ANON_KEY</font> as documented in <font name='Courier'>README.md</font>.",
                "<b>3.</b> Optional feature vars used in code: Razorpay keys, <font name='Courier'>RESEND_API_KEY</font>, <font name='Courier'>GOOGLE_GEMINI_API_KEY</font>, <font name='Courier'>SUPABASE_SERVICE_ROLE_KEY</font>, and <font name='Courier'>NEXT_PUBLIC_URL</font>.",
                "<b>4.</b> Start the dev server with <font name='Courier'>npm run dev</font> and open <font name='Courier'>http://localhost:3000</font>.",
                "<b>5.</b> Database bootstrap command: Not found in repo. SQL schema/setup files exist at the repo root, but no single setup sequence is documented.",
            ],
            styles["bullet"],
        ),
    ]

    table = Table(
        [[left_col, right_col]],
        colWidths=[3.78 * inch, 3.78 * inch],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("LINEAFTER", (0, 0), (0, 0), 0.6, colors.HexColor("#D9E2EC")),
            ]
        )
    )

    story.extend([table, Spacer(1, 0.1 * inch)])
    story.append(
        Paragraph(
            "Evidence used: README, docs/design.md, docs/requirements.md, package.json, representative Next.js pages/API routes, Supabase helpers, and root SQL schema files.",
            styles["note"],
        )
    )

    doc.build(story)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()

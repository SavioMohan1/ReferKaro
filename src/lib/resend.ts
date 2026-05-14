import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In production, set EMAIL_FROM to your verified domain sender (e.g. notifications@referkaro.app)
// In development/hackathon mode, set FORCE_EMAIL_TO to redirect all emails to a test address
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const FORCE_EMAIL_TO = process.env.FORCE_EMAIL_TO || '';

export async function sendEmail({
    to,
    subject,
    html
}: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email.');
        return null;
    }

    try {
        const recipient = FORCE_EMAIL_TO || to;
        const emailSubject = FORCE_EMAIL_TO
            ? `[DEV → ${to}] ${subject}`
            : subject;

        const data = await resend.emails.send({
            from: EMAIL_FROM,
            to: recipient,
            subject: emailSubject,
            html: html
        });

        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
        // Don't throw error to prevent blocking the main flow
        return null;
    }
}

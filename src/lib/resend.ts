import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Hackathon Mode: Force all emails to the verified sender to ensure delivery
// In production, this would be the actual user's email.
const VERIFIED_EMAIL = 'saviomohan2002@gmail.com';

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
        return;
    }

    try {
        // HACK: For Hackathon/Dev mode without verified domain, 
        // we can only send to the account owner.
        // We append the "Real Recipient" to the subject line for clarity.
        const hackathonSubject = `[TEST MODE: Intended for ${to}] ${subject}`;

        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: VERIFIED_EMAIL,
            subject: hackathonSubject,
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

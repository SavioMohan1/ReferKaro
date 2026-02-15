import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const formFullName = formData.get('fullName') as string
        const formCompany = formData.get('company') as string
        const formRole = formData.get('role') as string

        if (!file || !formFullName || !formCompany) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Prepare File for Gemini
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Data = buffer.toString('base64')
        const mimeType = file.type

        // NEW: Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('verification-documents')
            .upload(filePath, file)

        let documentUrl = null;
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('verification-documents')
                .getPublicUrl(filePath)
            documentUrl = publicUrl
        } else {
            console.error("Upload Error:", uploadError)
        }

        // Analyze with Gemini Vision (2.5 Flash)
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `You are a strict Background Verification officer.

CLAIMED DETAILS:
- Name: "${formFullName}"
- Company: "${formCompany}"
- Role: "${formRole}"

Analyze the provided document.

Task:
1. Extract Name and Company from the document.
2. Compare Extracted Name vs Claimed Name. (Allow minor spelling variations).
3. Compare Extracted Company vs Claimed Company.
4. Determine if verification is successful.

CRITICAL INSTRUCTION:
- If the Name and Company roughly match the claimed details, you MUST set "is_verified": true and "confidence_score": 90 or higher.
- Do NOT fail verification for minor issues like "Software Engineer" vs "Senior Software Engineer". Focus on Identity and Company.

Return ONLY a JSON object:
{
    "is_verified": boolean,
    "confidence_score": number, 
    "extracted_name": "string",
    "extracted_company": "string",
    "reasoning": "string"
}`

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ])

        const responseText = result.response.text()
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()

        let analysis;
        try {
            analysis = JSON.parse(cleanedJson)
        } catch (e) {
            console.error("JSON Parse Error:", cleanedJson)
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
        }

        // 4. Verification Logic (Hybrid: Auto-Verify if High Confidence, else Pending)
        // User Requirement: > 90% = Auto Verify. < 90% = Admin Review.

        let status = 'pending' // Default to pending review (Admin Dashboard)

        // Only Auto-Verify if explicitly verified AND High Confidence
        if (analysis.is_verified && analysis.confidence_score >= 90) {
            status = 'verified'
        }

        // Otherwise, it stays 'pending' for manual review.
        // We do NOT auto-reject anymore, as AI might be wrong.

        console.log(`Verification Logic: Score ${analysis.confidence_score}, AI Valid: ${analysis.is_verified} -> Status: ${status}`)

        if (status === 'verified') {
            await supabase
                .from('profiles')
                .update({
                    is_verified: true,
                    verification_status: 'verified',
                    verification_score: analysis.confidence_score,
                    verification_feedback: analysis.reasoning,
                    full_name: formFullName,
                    company: formCompany,
                    verification_document_url: documentUrl
                })
                .eq('id', user.id)
        } else {
            // Pending or Rejected
            await supabase
                .from('profiles')
                .update({
                    is_verified: false, // Not verified yet
                    verification_status: status,
                    verification_score: analysis.confidence_score,
                    verification_feedback: analysis.reasoning,
                    // We still save their claimed details for the admin to see? 
                    // Yes, helpful for admin comparison.
                    full_name: formFullName,
                    company: formCompany,
                    verification_document_url: documentUrl
                })
                .eq('id', user.id)
        }

        return NextResponse.json({
            success: true,
            status,
            message: status === 'verified'
                ? 'Verification Successful!'
                : status === 'pending'
                    ? 'Verification Submitted for Review'
                    : 'Verification Failed',
            feedback: analysis.reasoning,
            score: analysis.confidence_score
        })

    } catch (error: any) {
        console.error('Verification Error:', error)
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
    }
}

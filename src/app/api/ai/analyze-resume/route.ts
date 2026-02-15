import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
// @ts-ignore
const pdf = require('pdf-parse')

export async function POST(request: Request) {
    try {
        const { applicationId } = await request.json()

        if (!applicationId) {
            return NextResponse.json({ error: 'Application ID required' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Fetch Application Details (Resume URL + Job Description + Requirements)
        const { data: application, error: appError } = await supabase
            .from('applications')
            .select(`
                *,
                job:jobs(description, requirements, role_title)
            `)
            .eq('id', applicationId)
            .single()

        if (appError || !application || !application.resume_url) {
            return NextResponse.json({ error: 'Application or Resume not found' }, { status: 404 })
        }

        // 2. Download Resume PDF from Storage
        const { data: fileData, error: downloadError } = await supabase
            .storage
            .from('resumes')
            .download(application.resume_url)

        if (downloadError) {
            return NextResponse.json({ error: 'Failed to download resume' }, { status: 500 })
        }

        // 3. Extract Text from PDF
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Handle Import Interop (CommonJS vs ESM)
        // @ts-ignore
        const { PDFParse } = require('pdf-parse')

        if (!PDFParse) {
            throw new Error('Failed to import PDFParse class from library.')
        }

        // Initialize parser with buffer
        // @ts-ignore
        const parser = new PDFParse({ data: buffer })

        // Extract text
        const pdfResult = await parser.getText()
        const resumeText = pdfResult.text

        // Free memory
        await parser.destroy()

        // 4. Analyze with Gemini 2.5 Flash
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
        You are an expert HR Recruiter. 
        Job Role: ${application.job.role_title}
        
        Job Description: 
        "${application.job.description}"

        Job Requirements:
        "${application.job.requirements}"
        
        Candidate Resume: 
        "${resumeText.substring(0, 10000)}" 
        
        Analyze the match based on BOTH the Description and Requirements. Return ONLY a JSON object with this structure:
        {
            "score": number (0-100),
            "pros": ["point 1", "point 2", "point 3"],
            "cons": ["point 1", "point 2", "point 3"],
            "summary": "1 sentence verdict"
        }
        `

        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Clean JSON (sometimes Gemini adds ```json markdown)
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
        const analysis = JSON.parse(cleanedJson)

        return NextResponse.json({ success: true, analysis })

    } catch (error: any) {
        console.error('AI Analysis Error:', error)
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
    }
}

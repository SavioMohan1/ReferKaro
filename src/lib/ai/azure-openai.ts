import 'server-only'
import OpenAI from 'openai'

export function getAzureOpenAI() {
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const baseURL = process.env.AZURE_OPENAI_BASE_URL
    const model = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5-mini'

    if (!apiKey || !baseURL) {
        throw new Error('Azure OpenAI is not configured')
    }

    return { client: new OpenAI({ apiKey, baseURL }), model }
}

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model priority list — tries each until one works
const CHAT_MODELS = ['gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-pro'];
const EMBEDDING_MODEL = 'text-embedding-004';

export async function structureDescription(description: string, category: string): Promise<Record<string, unknown>> {
    const prompt = `Extract structured information from this lost item description and return JSON.

Fields to extract:
- category
- object_type  
- brand
- model
- color
- unique_features
- location
- identifiers
- possible_keywords (array of strings)
${category === 'person' ? '- name\n- age\n- gender' : ''}

Description:
${description}

Return ONLY valid JSON with no markdown formatting, no code blocks, no explanation.`;

    for (const modelName of CHAT_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            // Strip markdown code blocks if present
            const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            const jsonMatch = clean.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(clean);
        } catch (err) {
            console.warn(`Model ${modelName} failed, trying next:`, err);
        }
    }

    // Return minimal structured data based on inputs if all models fail
    return {
        category,
        object_type: category,
        description,
        possible_keywords: description.split(' ').slice(0, 5),
    };
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.warn('Embedding generation failed (matching will use text similarity):', error);
        return [];
    }
}

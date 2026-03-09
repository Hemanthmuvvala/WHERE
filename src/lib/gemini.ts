import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function structureDescription(description: string, category: string): Promise<Record<string, unknown>> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Extract structured information from this lost item description and return JSON.

Fields:
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

Return ONLY valid JSON, no markdown, no explanation.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return JSON.parse(text);
    } catch (error) {
        console.error('Error structuring description:', error);
        return { error: 'Failed to structure description', raw: description };
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return [];
    }
}

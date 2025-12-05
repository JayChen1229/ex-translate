/**
 * Cloudflare Worker for Toxic Ex-Translator
 * Handles translation requests using xAI's Grok API
 */

export interface Env {
    GROK_API_KEY: string;
}

interface TranslateRequest {
    message: string;
}

interface TranslationResponse {
    true_meaning: string;
    toxicity_level: number;
}

// In-memory rate limiter (simple implementation)
// Note: This resets when the worker is evicted/restarted
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 9;
const ipRequests = new Map<string, { count: number; startTime: number }>();

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const origin = request.headers.get('Origin');
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://extranslator.samolab.com' // Generic pages domain
        ];

        // Helper to check if origin is allowed (including subdomains of pages.dev)
        const isAllowedOrigin = (origin: string | null) => {
            if (!origin) return false;
            if (allowedOrigins.includes(origin)) return true;
            // Allow all *.ex-translate.pages.dev subdomains (like preview deployments)
            return origin.endsWith('.ex-translate.pages.dev');
        };

        const corsHeaders = {
            'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : 'null',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Enforce CORS for actual requests
        if (origin && !isAllowedOrigin(origin)) {
            return jsonResponse({ error: 'Origin not allowed' }, 403, corsHeaders);
        }

        // Rate Limiting
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const now = Date.now();
        const clientData = ipRequests.get(ip) || { count: 0, startTime: now };

        // Reset window if expired
        if (now - clientData.startTime > RATE_LIMIT_WINDOW) {
            clientData.count = 0;
            clientData.startTime = now;
        }

        // Check limit
        if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
            return jsonResponse(
                { error: '請求太頻繁了，前任都沒你這麼煩。請稍後再試。' },
                429,
                corsHeaders
            );
        }

        // Increment count
        clientData.count++;
        ipRequests.set(ip, clientData);

        // Only allow POST requests to /api/translate
        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
        }

        const url = new URL(request.url);
        if (url.pathname !== '/api/translate') {
            return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
        }

        try {
            // Parse request body
            const body = await request.json() as TranslateRequest;
            const { message } = body;

            if (!message) {
                return jsonResponse({ error: 'Missing required field: message' }, 400, corsHeaders);
            }

            // Call Grok API
            const translation = await translateWithGrok(message, env.GROK_API_KEY);

            return jsonResponse(translation, 200, corsHeaders);
        } catch (error) {
            console.error('Translation error:', error);
            return jsonResponse(
                { error: '翻譯機過熱，可能是前任的怨念太深導致系統崩潰，請稍後再試。' },
                500,
                corsHeaders
            );
        }
    },
};

async function translateWithGrok(
    message: string,
    apiKey: string
): Promise<TranslationResponse> {
    const systemInstruction = `
你是一個極度毒舌、精準的前任, 渣男渣女心聲翻譯機，必須以渣男渣女第一人稱心境敘述
任務：把前任傳的表面好聽用語，
翻譯成對方心裡最真實、最缺德、最直白的想法、越嘲諷越好、越有創意有趣越好。
語氣要又狠又好笑，像最佳閨蜜在深夜吐槽。
絕對不要溫柔，不要安慰，直接捅刀。
不要過度使用大陸用語，多用台灣流行用語。
以下是範例：
訊息：我們還是當朋友吧
真心話：我看到你就想吐，但還想繼續撩你當備胎

你必須以JSON格式回應，包含兩個欄位：
- true_meaning: 翻譯後的真心話 (字串)
- toxicity_level: 毒性分數 0-100 (數字)
`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'grok-4-1-fast-reasoning',
            messages: [
                {
                    role: 'system',
                    content: systemInstruction,
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 1.4,
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Grok API error:', response.status, errorText);
        throw new Error(`Grok API request failed: ${response.status}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No content in Grok API response');
    }

    // Parse the JSON response from Grok
    const result = JSON.parse(content) as TranslationResponse;

    // Validate response
    if (!result.true_meaning || typeof result.toxicity_level !== 'number') {
        throw new Error('Invalid response format from Grok API');
    }

    return result;
}

function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
    });
}

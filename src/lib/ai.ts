import OpenAI from "openai";

export interface StoryContext {
    title?: string;
    genre: string;
    characters: string[];
    plot: string;
    tone?: string;
    previousContent?: string;
}

function getOpenAIClient() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured.");
    }

    return new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
    });
}

export async function generateStory(prompt: string, context: StoryContext): Promise<ReadableStream<Uint8Array>> {
    if (!prompt.trim()) {
        throw new Error("Prompt is required.");
    }

    const openai = getOpenAIClient();
    const systemPrompt = [
        "당신은 한국어 장편 소설을 쓰는 작가입니다.",
        "반드시 자연스러운 한국어로만 답하고, 장면 전환과 감정 묘사를 풍부하게 써 주세요.",
        `제목: ${context.title || "제목 미정"}`,
        `장르: ${context.genre}`,
        `등장인물: ${context.characters.join(", ")}`,
        `줄거리: ${context.plot}`,
        context.tone ? `문체: ${context.tone}` : null,
        context.previousContent ? `이전 내용:\n${context.previousContent}` : null,
    ]
        .filter(Boolean)
        .join("\n");

    const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${prompt.trim()}\n\n반드시 한국어 서사문으로만 작성해 주세요.` },
        ],
        temperature: 0.9,
        stream: true,
    });

    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });
}

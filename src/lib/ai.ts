import OpenAI from "openai";

export interface StoryContext {
    title?: string;
    genre: string;
    characters: string[];
    plot: string;
    tone?: string;
    previousContent?: string;
}

const HANJA_REGEX =
    /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}]/gu;

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

function sanitizeGeneratedText(content: string) {
    return content.replace(HANJA_REGEX, "");
}

function buildSystemPrompt(context: StoryContext) {
    return [
        "당신은 한국어 웹소설 전문 작가입니다.",
        "반드시 자연스럽고 현대적인 한국어만 사용하세요.",
        "한자, 중국어, 일본어, 영어 단어를 본문에 섞지 마세요.",
        "고유명사도 가능하면 한글 표기로 바꾸고, 한자를 괄호로 병기하지 마세요.",
        "장면 묘사와 감정선을 풍부하게 살려 서사문으로 작성하세요.",
        `제목: ${context.title || "제목 미정"}`,
        `장르: ${context.genre}`,
        `등장인물: ${context.characters.join(", ")}`,
        `줄거리: ${context.plot}`,
        context.tone ? `문체: ${context.tone}` : null,
        context.previousContent ? `이전 내용:\n${context.previousContent}` : null,
    ]
        .filter(Boolean)
        .join("\n");
}

export async function generateStory(prompt: string, context: StoryContext): Promise<ReadableStream<Uint8Array>> {
    if (!prompt.trim()) {
        throw new Error("Prompt is required.");
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: buildSystemPrompt(context),
            },
            {
                role: "user",
                content: `${prompt.trim()}\n\n반드시 한글 서사문으로만 작성하고, 한자는 절대 사용하지 마세요.`,
            },
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

                    if (!content) {
                        continue;
                    }

                    const sanitizedContent = sanitizeGeneratedText(content);

                    if (sanitizedContent) {
                        controller.enqueue(encoder.encode(sanitizedContent));
                    }
                }

                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });
}

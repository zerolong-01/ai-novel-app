import { NextRequest } from "next/server";
import { generateStory } from "@/lib/ai";
import { NovelRequest } from "@/lib/types";

interface GenerateBody {
    prompt?: string;
    context?: NovelRequest & { previousContent?: string };
}

function isValidContext(context: GenerateBody["context"]): context is NovelRequest & { previousContent?: string } {
    return Boolean(
        context &&
            typeof context.title === "string" &&
            typeof context.genre === "string" &&
            Array.isArray(context.characters) &&
            typeof context.plot === "string"
    );
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as GenerateBody;

        if (!body.prompt || !body.prompt.trim()) {
            return Response.json({ error: "생성 프롬프트가 비어 있습니다." }, { status: 400 });
        }

        if (!isValidContext(body.context)) {
            return Response.json({ error: "소설 컨텍스트가 올바르지 않습니다." }, { status: 400 });
        }

        const stream = await generateStory(body.prompt, body.context);

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    } catch (error: unknown) {
        console.error("API Error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return Response.json({ error: message }, { status: 500 });
    }
}

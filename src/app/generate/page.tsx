"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NovelOutput } from "@/components/NovelOutput";
import { NovelSidebar } from "@/components/NovelSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, FastForward } from "lucide-react";
import { StorySegment, NovelRequest } from "@/lib/types";
import { getNovel, saveNovel } from "@/lib/storage";
import { useAuth } from "@/components/AuthProvider";

const AUTO_START_PROMPT = "이야기를 시작해 줘. 첫 장면부터 몰입감 있게 써 줘.";
const NEXT_CHAPTER_PROMPT = "다음 장면으로 이어서 전개해 줘. 인물의 감정과 갈등이 자연스럽게 이어지게 해 줘.";

function GenerateContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const novelId = searchParams.get("id");
    const { user, profile } = useAuth();

    const [segments, setSegments] = useState<StorySegment[]>([]);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [context, setContext] = useState<NovelRequest | null>(null);
    const hasStartedRef = useRef(false);
    const generateRef = useRef<(promptText: string, currentContext: NovelRequest) => Promise<void>>(async () => {});

    generateRef.current = async (promptText: string, currentContext: NovelRequest) => {
        const trimmedPrompt = promptText.trim();

        if (!trimmedPrompt || isGenerating) {
            return;
        }

        if (!user) {
            window.alert("이어서 생성하려면 로그인해 주세요.");
            router.push("/login");
            return;
        }

        if (profile?.subscription_tier === "FREE" && profile.credits <= 0) {
            window.alert("무료 크레딧을 모두 사용했습니다. BASIC 플랜으로 업그레이드해 무제한 생성 기능을 이용해 보세요.");
            router.push("/");
            return;
        }

        const isAutoStart = trimmedPrompt === AUTO_START_PROMPT;
        const userSegment: StorySegment = {
            id: Date.now().toString(),
            content: trimmedPrompt,
            type: "user",
            timestamp: Date.now(),
        };

        if (!isAutoStart) {
            setSegments((prev) => [...prev, userSegment]);
        }

        setInput("");
        setIsGenerating(true);

        try {
            const existingAiContent = segments.filter((segment) => segment.type === "ai").map((segment) => segment.content).join("\n\n");
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: trimmedPrompt,
                    context: {
                        ...currentContext,
                        previousContent: existingAiContent,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `요청에 실패했습니다. (${response.status})`);
            }

            if (!response.body) {
                throw new Error("응답 스트림이 비어 있습니다.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = "";
            const aiSegmentId = (Date.now() + 1).toString();

            setSegments((prev) => [...prev, { id: aiSegmentId, content: "", type: "ai", timestamp: Date.now() }]);

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                aiContent += decoder.decode(value, { stream: true });
                setSegments((prev) => prev.map((segment) => (segment.id === aiSegmentId ? { ...segment, content: aiContent } : segment)));
            }

            const creditResponse = await fetch("/api/decrement-credits", { method: "POST" });
            if (!creditResponse.ok && creditResponse.status !== 401) {
                console.warn("Failed to decrement credits after generation.");
            }
        } catch (error: unknown) {
            console.error("Generation failed", error);
            const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            window.alert(`스토리 생성에 실패했습니다: ${message}`);
            setSegments((prev) => prev.filter((segment) => segment.content.trim().length > 0));
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (!novelId) {
            router.replace("/");
            return;
        }

        const novel = getNovel(novelId);

        if (!novel) {
            router.replace("/");
            return;
        }

        setContext(novel.context);
        setSegments(novel.segments);

        if (novel.segments.length === 0 && !hasStartedRef.current) {
            hasStartedRef.current = true;
            void generateRef.current(AUTO_START_PROMPT, novel.context);
        }
    }, [novelId, router]);

    useEffect(() => {
        if (novelId && context) {
            const novel = getNovel(novelId);
            if (novel) {
                saveNovel({ ...novel, context, segments });
                window.dispatchEvent(new Event("novel-updated"));
            }
        }
    }, [context, novelId, segments]);

    const handleGenerate = async (promptText: string, currentContext: NovelRequest | null = context) => {
        if (!currentContext) {
            return;
        }
        await generateRef.current(promptText, currentContext);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <div className="hidden h-full md:block">
                <NovelSidebar currentNovelId={novelId || undefined} />
            </div>

            <div className="relative flex h-full flex-1 flex-col">
                <NovelOutput segments={segments} isGenerating={isGenerating} />

                <div className="border-t border-white/10 bg-black/80 p-4 backdrop-blur-md">
                    <div className="relative mx-auto flex max-w-4xl gap-2">
                        <div className="relative flex-1">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        void handleGenerate(input);
                                    }
                                }}
                                placeholder="다음 장면에 반영할 내용을 입력해 주세요."
                                className="h-14 rounded-xl bg-white/10 pl-4 pr-12 text-lg border-white/10 focus:bg-white/15"
                                disabled={isGenerating}
                            />
                            <Button
                                size="icon"
                                className="absolute right-2 top-2 h-10 w-10 bg-primary hover:bg-primary/90"
                                onClick={() => void handleGenerate(input)}
                                disabled={isGenerating || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            className="h-14 rounded-xl bg-purple-600 px-6 font-medium text-white shadow-lg shadow-purple-900/20 hover:bg-purple-700"
                            onClick={() => void handleGenerate(NEXT_CHAPTER_PROMPT)}
                            disabled={isGenerating}
                        >
                            <FastForward className="mr-2 h-5 w-5" />
                            다음 장면 생성
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-white">로딩 중...</div>}>
            <GenerateContent />
        </Suspense>
    );
}

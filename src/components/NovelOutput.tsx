import { useRef, useEffect } from "react";
import { StorySegment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface NovelOutputProps {
    segments: StorySegment[];
    isGenerating: boolean;
}

export function NovelOutput({ segments, isGenerating }: NovelOutputProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments]);

    return (
        <div ref={scrollRef} className="mx-auto flex-1 w-full max-w-4xl space-y-6 overflow-y-auto p-4 md:p-8 scroll-smooth">
            {segments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
                    설정을 바탕으로 첫 장면을 만들고 있습니다. 잠시만 기다려 주세요.
                </div>
            ) : null}

            {segments.map((segment) => (
                <div
                    key={segment.id}
                    className={cn(
                        "animate-fade-in-up whitespace-pre-wrap",
                        segment.type === "user"
                            ? "border-l-2 border-primary/50 py-2 pl-4 text-sm italic opacity-70"
                            : "font-serif text-lg leading-relaxed text-gray-100 md:text-xl"
                    )}
                >
                    {segment.type === "user" ? (
                        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary not-italic">사용자 지시</div>
                    ) : null}
                    {segment.content}
                </div>
            ))}

            {isGenerating ? (
                <div className="animate-pulse pl-1 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>AI가 다음 장면을 쓰는 중입니다...</span>
                    </div>
                </div>
            ) : null}

            <div className="h-24" />
        </div>
    );
}

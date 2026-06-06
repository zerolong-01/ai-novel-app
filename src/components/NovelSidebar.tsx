"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { deleteNovel, getNovels } from "@/lib/storage";
import { Novel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NovelSidebarProps {
    currentNovelId?: string;
}

export function NovelSidebar({ currentNovelId }: NovelSidebarProps) {
    const router = useRouter();
    const [novels, setNovels] = useState<Novel[]>([]);

    useEffect(() => {
        const syncNovels = () => {
            setNovels(getNovels().sort((a, b) => b.updatedAt - a.updatedAt));
        };

        syncNovels();
        window.addEventListener("storage", syncNovels);
        window.addEventListener("novel-updated", syncNovels);

        return () => {
            window.removeEventListener("storage", syncNovels);
            window.removeEventListener("novel-updated", syncNovels);
        };
    }, []);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        if (!window.confirm("정말 이 작품을 삭제할까요?")) {
            return;
        }

        deleteNovel(id);
        window.dispatchEvent(new Event("novel-updated"));

        if (currentNovelId === id) {
            router.push("/");
        }
    };

    return (
        <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md">
            <div className="border-b border-white/10 p-4">
                <Button onClick={() => router.push("/")} className="w-full justify-start gap-2" variant="outline">
                    <Plus className="h-4 w-4" />새 소설 만들기
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <h3 className="mb-1 px-2 py-2 text-xs font-semibold text-muted-foreground">최근 작업</h3>

                <div className="space-y-1">
                    {novels.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">아직 저장된 작품이 없습니다.</div>
                    ) : (
                        novels.map((novel) => (
                            <div
                                key={novel.id}
                                onClick={() => router.push(`/generate?id=${novel.id}`)}
                                className={cn(
                                    "group flex cursor-pointer items-center justify-between rounded-lg p-2 text-sm transition-colors",
                                    currentNovelId === novel.id
                                        ? "bg-primary/20 text-primary"
                                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                                )}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <BookOpen className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{novel.title || `${novel.context.genre} 소설`}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
                                    onClick={(e) => handleDelete(e, novel.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}

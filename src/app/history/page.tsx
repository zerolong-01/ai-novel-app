"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { getNovels } from "@/lib/storage";
import { Novel } from "@/lib/types";

function formatDate(timestamp: number) {
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(timestamp);
}

export default function HistoryPage() {
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

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-8 flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">내 작품 기록</h1>
                    <p className="text-sm text-muted-foreground">브라우저에 저장된 작품을 다시 열고 이어서 작성할 수 있습니다.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {novels.length === 0 ? (
                    <Card className="border-dashed border-white/10 bg-white/5">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            아직 저장된 작품이 없습니다. 첫 작품부터 시작해 보세요.
                        </CardContent>
                    </Card>
                ) : (
                    novels.map((item) => {
                        const preview =
                            item.segments.find((segment) => segment.type === "ai")?.content ||
                            item.context.plot ||
                            "아직 생성된 본문이 없습니다.";

                        return (
                            <Card key={item.id} className="border-white/10 bg-white/5 transition-colors hover:bg-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{item.title}</CardTitle>
                                        <CardDescription>
                                            {item.context.genre} · {formatDate(item.updatedAt)}
                                        </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/generate?id=${item.id}`}>
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <p className="line-clamp-2 whitespace-pre-wrap text-muted-foreground">{preview}</p>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

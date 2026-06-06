"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GenreSelector } from "./GenreSelector";
import { CharacterFields } from "./CharacterFields";
import { Wand2, ArrowRight } from "lucide-react";
import { NovelRequest } from "@/lib/types";
import { saveNovel } from "@/lib/storage";

const DEFAULT_FORM: NovelRequest = {
    title: "",
    genre: "판타지",
    characters: ["주인공"],
    plot: "",
    tone: "몰입감 있는 문체",
};

export function NovelForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<NovelRequest>(DEFAULT_FORM);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const title = formData.title.trim();
        const plot = formData.plot.trim();
        const characters = formData.characters.map((character) => character.trim()).filter(Boolean);

        if (!title || !plot || characters.length === 0) {
            setError("제목, 줄거리, 등장인물은 모두 입력해 주세요.");
            return;
        }

        setError("");
        setIsLoading(true);

        const newNovelId = Date.now().toString();
        saveNovel({
            id: newNovelId,
            title,
            context: {
                ...formData,
                title,
                plot,
                characters,
            },
            segments: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        window.dispatchEvent(new Event("novel-updated"));
        router.push(`/generate?id=${newNovelId}`);
    };

    return (
        <Card className="w-full max-w-2xl animate-fade-in-up border-white/10 bg-black/50 shadow-2xl backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-3xl">작품 설정</CardTitle>
                <CardDescription>몇 가지 정보만 정하면 AI가 첫 장면부터 이어서 써 내려갑니다.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">제목</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="예: 별빛 아래 마지막 마법사"
                            className="bg-white/5 border-white/10 focus:bg-white/10"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">장르</label>
                        <GenreSelector selected={formData.genre} onSelect={(genre) => setFormData({ ...formData, genre })} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">등장인물</label>
                        <CharacterFields
                            characters={formData.characters}
                            onChange={(characters) => setFormData({ ...formData, characters })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">초기 줄거리</label>
                        <Textarea
                            value={formData.plot}
                            onChange={(e) => setFormData({ ...formData, plot: e.target.value })}
                            placeholder="이야기의 출발점, 세계관, 갈등 구조를 자유롭게 적어 주세요."
                            className="min-h-[150px] resize-none bg-white/5 border-white/10 focus:bg-white/10"
                            required
                        />
                    </div>

                    {error ? <p className="text-sm text-red-400">{error}</p> : null}

                    <Button type="submit" className="h-12 w-full text-lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                                첫 장면 준비 중...
                            </>
                        ) : (
                            <>
                                이야기 시작하기
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

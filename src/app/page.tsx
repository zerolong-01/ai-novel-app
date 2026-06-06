"use client";

import { useEffect, useState } from "react";
import { NovelForm } from "@/components/NovelForm";
import { SubscriptionPricing } from "@/components/SubscriptionPricing";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { getGuestCredits } from "@/lib/storage";

export default function Home() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [guestCredits, setGuestCredits] = useState(3);

    useEffect(() => {
        setGuestCredits(getGuestCredits());
    }, []);

    const handleSubscribe = async (priceId: string) => {
        if (!user) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ priceId }),
            });

            if (!response.ok) {
                throw new Error("결제 페이지를 준비하지 못했습니다.");
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error("Subscription error:", error);
            window.alert("구독 결제를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    return (
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black p-4 md:p-8">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

            <div className="z-10 flex w-full max-w-5xl flex-col items-center gap-8">
                <div className="space-y-4 text-center animate-fade-in-up">
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary-foreground/80 backdrop-blur-sm">
                        <Sparkles className="mr-2 h-3 w-3 text-primary" />
                        몰입형 AI 웹소설 스튜디오
                    </div>
                    <h1 className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl">
                        아이디어를 바로 장면으로 바꾸세요
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        세계관, 등장인물, 갈등 구조만 정하면 AI가 한국어 웹소설 톤으로 다음 장면을 자연스럽게 이어 씁니다.
                    </p>
                    {profile ? (
                        <p className="text-sm text-primary">
                            현재 플랜: {profile.subscription_tier} · 남은 크레딧 {profile.credits}
                        </p>
                    ) : (
                        <p className="text-sm text-primary">비회원도 무료 생성 {guestCredits}회까지 체험할 수 있습니다.</p>
                    )}
                </div>

                <NovelForm />

                <div className="mt-12 w-full">
                    <h2 className="mb-8 text-center text-2xl font-bold">요금제</h2>
                    <SubscriptionPricing onSubscribe={handleSubscribe} currentTier={profile?.subscription_tier} />
                </div>
            </div>
        </div>
    );
}

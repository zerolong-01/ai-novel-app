"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { AuthError } from "@supabase/supabase-js";

function getSignupErrorMessage(error: AuthError | Error | null) {
    if (!error) {
        return "회원가입 중 알 수 없는 오류가 발생했습니다.";
    }

    const normalizedMessage = error.message.toLowerCase();

    if (normalizedMessage.includes("failed to fetch")) {
        return "인증 서버에 연결하지 못했습니다. 인터넷 연결 상태와 Supabase 환경 변수 설정을 확인한 뒤 다시 시도해 주세요.";
    }

    if (normalizedMessage.includes("user already registered")) {
        return "이미 가입된 이메일입니다. 로그인하거나 비밀번호 재설정을 진행해 주세요.";
    }

    if (normalizedMessage.includes("password")) {
        return "비밀번호 조건을 만족하지 못했습니다. 더 길고 복잡한 비밀번호로 다시 시도해 주세요.";
    }

    if (normalizedMessage.includes("invalid email")) {
        return "이메일 형식이 올바르지 않습니다.";
    }

    if (normalizedMessage.includes("email address") && normalizedMessage.includes("invalid")) {
        return "이메일 주소를 다시 확인해 주세요.";
    }

    if (normalizedMessage.includes("rate limit")) {
        return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    }

    if (normalizedMessage.includes("database")) {
        return "회원 정보를 저장하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }

    return error.message || "회원가입 중 오류가 발생했습니다.";
}

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            setError("이름을 입력해 주세요.");
            return;
        }

        if (password.length < 8) {
            setError("비밀번호는 최소 8자 이상이어야 합니다.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { success, error, data } = await signup(trimmedName, trimmedEmail, password);

            if (success) {
                if (data?.session) {
                    router.push("/");
                } else {
                    setSuccessMessage("가입이 완료되었습니다. 이메일로 받은 인증 링크를 눌러 계정을 활성화해 주세요.");
                }
                return;
            }

            setError(getSignupErrorMessage(error));
        } catch (err) {
            console.error("Signup exception:", err);
            setError(getSignupErrorMessage(err instanceof Error ? err : new Error("회원가입 요청 처리에 실패했습니다.")));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">회원가입</CardTitle>
                    <CardDescription className="text-center">계정을 만들고 나만의 장편 소설을 시작해 보세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">이름</label>
                            <Input
                                type="text"
                                placeholder="표시될 이름"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border-white/10 bg-white/5"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">이메일</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-white/10 bg-white/5"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">비밀번호</label>
                            <Input
                                type="password"
                                placeholder="8자 이상 비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-white/10 bg-white/5"
                                required
                                minLength={8}
                            />
                            <p className="text-xs text-muted-foreground">최소 8자 이상으로 설정해 주세요.</p>
                        </div>
                        {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}
                        {successMessage ? <p className="text-center text-sm text-emerald-400">{successMessage}</p> : null}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    가입 중...
                                </>
                            ) : (
                                "회원가입"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        이미 계정이 있나요?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            로그인
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

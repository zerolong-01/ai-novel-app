"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const { success, error } = await login(email, password);
            if (success) {
                router.push("/");
                return;
            }

            if (error?.message === "Invalid login credentials") {
                setError("이메일 또는 비밀번호가 올바르지 않습니다.");
            } else if (error?.message?.includes("Email not confirmed")) {
                setError("이메일 인증이 아직 완료되지 않았습니다. 메일함을 확인해 주세요.");
            } else {
                setError(error?.message || "로그인 중 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error("Login exception:", err);
            setError("로그인 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">로그인</CardTitle>
                    <CardDescription className="text-center">계정으로 로그인하고 작성 중인 작품을 이어가세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-white/10 bg-white/5"
                                required
                            />
                        </div>
                        {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    로그인 중...
                                </>
                            ) : (
                                "로그인"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        계정이 아직 없나요?{" "}
                        <Link href="/signup" className="text-primary hover:underline">
                            회원가입
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

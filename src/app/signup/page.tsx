"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
        setIsSubmitting(true);

        try {
            const { success, error, data } = await signup(name, email, password);
            if (success) {
                if (data?.session) {
                    router.push("/");
                } else {
                    setSuccessMessage("가입이 완료되었습니다. 메일함에서 인증 링크를 눌러 계정을 활성화해 주세요.");
                }
                return;
            }

            if (error?.message === "User already registered") {
                setError("이미 가입된 이메일입니다.");
            } else {
                setError(error?.message || "회원가입 중 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error("Signup exception:", err);
            setError("회원가입 중 오류가 발생했습니다.");
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
                                placeholder="안전한 비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-white/10 bg-white/5"
                                required
                            />
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

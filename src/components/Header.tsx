"use client";

import Link from "next/link";
import { BookOpen, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const { user, profile, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <span>NovelStudio</span>
                </Link>

                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link href="/history" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                                내 작품
                            </Link>
                            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                                새 소설
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <User className="h-4 w-4" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {profile?.full_name || user.email?.split("@")[0]}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>로그아웃</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">로그인</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">회원가입</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}

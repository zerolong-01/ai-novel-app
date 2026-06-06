import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI Novel Studio",
    description: "AI로 한국어 웹소설 초고를 빠르게 생성하고 이어 쓰는 창작 도구",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" className="dark">
            <body className={cn(inter.className, "flex min-h-screen flex-col bg-background text-foreground")}>
                <AuthProvider>
                    <Header />
                    <main className="flex flex-1 flex-col">{children}</main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}

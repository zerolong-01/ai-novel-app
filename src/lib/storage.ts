import { Novel } from "./types";

const STORAGE_KEY = "ai_novels";
const GUEST_CREDITS_KEY = "ai_guest_credits";
const DEFAULT_GUEST_CREDITS = 3;

function canUseStorage() {
    return typeof window !== "undefined";
}

function sanitizeNovel(novel: Novel): Novel {
    return {
        ...novel,
        title: novel.title.trim(),
        context: {
            ...novel.context,
            title: novel.context.title.trim(),
            plot: novel.context.plot.trim(),
            characters: novel.context.characters.map((character) => character.trim()).filter(Boolean),
        },
        segments: novel.segments.filter((segment) => segment.content.trim().length > 0),
    };
}

export function getNovels(): Novel[] {
    if (!canUseStorage()) {
        return [];
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? (JSON.parse(stored) as Novel[]) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Failed to load novels", error);
        return [];
    }
}

export function getNovel(id: string): Novel | undefined {
    return getNovels().find((novel) => novel.id === id);
}

export function saveNovel(novel: Novel): void {
    if (!canUseStorage()) {
        return;
    }

    try {
        const novels = getNovels();
        const sanitizedNovel = sanitizeNovel(novel);
        const index = novels.findIndex((item) => item.id === sanitizedNovel.id);

        if (index >= 0) {
            novels[index] = { ...sanitizedNovel, createdAt: novels[index].createdAt, updatedAt: Date.now() };
        } else {
            novels.push({
                ...sanitizedNovel,
                createdAt: sanitizedNovel.createdAt || Date.now(),
                updatedAt: Date.now(),
            });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(novels));
    } catch (error) {
        console.error("Failed to save novel", error);
    }
}

export function deleteNovel(id: string): void {
    if (!canUseStorage()) {
        return;
    }

    try {
        const novels = getNovels().filter((novel) => novel.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(novels));
    } catch (error) {
        console.error("Failed to delete novel", error);
    }
}

export function getGuestCredits(): number {
    if (!canUseStorage()) {
        return DEFAULT_GUEST_CREDITS;
    }

    try {
        const stored = localStorage.getItem(GUEST_CREDITS_KEY);

        if (!stored) {
            localStorage.setItem(GUEST_CREDITS_KEY, DEFAULT_GUEST_CREDITS.toString());
            return DEFAULT_GUEST_CREDITS;
        }

        const parsed = Number.parseInt(stored, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_GUEST_CREDITS;
    } catch (error) {
        console.error("Failed to load guest credits", error);
        return DEFAULT_GUEST_CREDITS;
    }
}

export function decrementGuestCredits(): number {
    if (!canUseStorage()) {
        return DEFAULT_GUEST_CREDITS;
    }

    const nextCredits = Math.max(0, getGuestCredits() - 1);

    try {
        localStorage.setItem(GUEST_CREDITS_KEY, nextCredits.toString());
    } catch (error) {
        console.error("Failed to save guest credits", error);
    }

    return nextCredits;
}

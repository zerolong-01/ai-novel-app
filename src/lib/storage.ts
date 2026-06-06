import { Novel } from "./types";

const STORAGE_KEY = "ai_novels";

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

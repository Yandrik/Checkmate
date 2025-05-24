import { defineProxyService } from "@webext-core/proxy-service";
import { ok, err, Result } from "neverthrow";
import { FactCheckResult } from "../api";
import { storage } from "wxt/storage"; // Or from '#imports' if auto-import is set up

export enum FactCheckState {
    PENDING = "PENDING",
    FAILED = "FAILED",
    DONE = "DONE",
}

export interface FactCheckDbEntry {
    state: FactCheckState;
    date: string; // ISO string format
    result?: FactCheckResult;
    key: string;
}

const DB_PREFIX = "factCheckDb_";

function getKeyPrefix(type: string): string {
    return `${DB_PREFIX}${type}_`;
}

function buildKey(type: string, identifier: string): string {
    return `${getKeyPrefix(type)}${identifier}`;
}

function createApiRepo() {
    const getFactCheck = async (key: string): Promise<Result<FactCheckDbEntry | null, Error>> => {
        try {
            const item = await storage.getItem<FactCheckDbEntry>(`session:${key}`);
            if (item) {
                // No need to parse, WXT storage handles it if type is provided
                return ok(item);
            }
            return ok(null);
        } catch (error) {
            return err(new Error(`Failed to get fact-check for key ${key}`, { cause: error }));
        }
    };

    const setFactCheck = async (
        key: string,
        state: FactCheckState,
        date: Date,
        result?: FactCheckResult
    ): Promise<Result<void, Error>> => {
        try {
            const entry: FactCheckDbEntry = {
                key,
                state,
                date: date.toISOString(),
                result,
            };
            // WXT storage handles stringification if the value is an object
            await storage.setItem(`session:${key}`, entry);
            return ok(undefined);
        } catch (error) {
            return err(new Error(`Failed to set fact-check for key ${key}`, { cause: error }));
        }
    };

    const removeFactCheck = async (key: string): Promise<Result<void, Error>> => {
        try {
            await storage.removeItem(`session:${key}`);
            return ok(undefined);
        } catch (error) {
            return err(new Error(`Failed to remove fact-check for key ${key}`, { cause: error }));
        }
    };

    return {
        // URL FactChecks
        getUrlFactCheck: async (url: string): Promise<Result<FactCheckDbEntry | null, Error>> => {
            return getFactCheck(buildKey("url", url));
        },
        setUrlFactCheck: async (
            url: string,
            state: FactCheckState,
            date: Date,
            result?: FactCheckResult
        ): Promise<Result<void, Error>> => {
            return setFactCheck(buildKey("url", url), state, date, result);
        },
        removeUrlFactCheck: async (url: string): Promise<Result<void, Error>> => {
            return removeFactCheck(buildKey("url", url));
        },

        // Arbitrary String FactChecks
        getStringFactCheck: async (text: string): Promise<Result<FactCheckDbEntry | null, Error>> => {
            // Consider hashing or truncating long strings for keys if necessary
            return getFactCheck(buildKey("string", text));
        },
        setStringFactCheck: async (
            text: string,
            state: FactCheckState,
            date: Date,
            result?: FactCheckResult
        ): Promise<Result<void, Error>> => {
            return setFactCheck(buildKey("string", text), state, date, result);
        },
        removeStringFactCheck: async (text: string): Promise<Result<void, Error>> => {
            return removeFactCheck(buildKey("string", text));
        },

        // Twitter Comment FactChecks
        getTwitterCommentFactCheck: async (commentId: string): Promise<Result<FactCheckDbEntry | null, Error>> => {
            return getFactCheck(buildKey("twitterComment", commentId));
        },
        setTwitterCommentFactCheck: async (
            commentId: string,
            state: FactCheckState,
            date: Date,
            result?: FactCheckResult
        ): Promise<Result<void, Error>> => {
            return setFactCheck(buildKey("twitterComment", commentId), state, date, result);
        },
        removeTwitterCommentFactCheck: async (commentId: string): Promise<Result<void, Error>> => {
            return removeFactCheck(buildKey("twitterComment", commentId));
        },

        // YouTube Video FactChecks
        getYouTubeVideoFactCheck: async (videoId: string): Promise<Result<FactCheckDbEntry | null, Error>> => {
            return getFactCheck(buildKey("youtubeVideo", videoId));
        },
        setYouTubeVideoFactCheck: async (
            videoId: string,
            state: FactCheckState,
            date: Date,
            result?: FactCheckResult
        ): Promise<Result<void, Error>> => {
            return setFactCheck(buildKey("youtubeVideo", videoId), state, date, result);
        },
        removeYouTubeVideoFactCheck: async (videoId: string): Promise<Result<void, Error>> => {
            return removeFactCheck(buildKey("youtubeVideo", videoId));
        },

        // YouTube Comment FactChecks
        getYouTubeCommentFactCheck: async (commentId: string): Promise<Result<FactCheckDbEntry | null, Error>> => {
            return getFactCheck(buildKey("youtubeComment", commentId));
        },
        setYouTubeCommentFactCheck: async (
            commentId: string,
            state: FactCheckState,
            date: Date,
            result?: FactCheckResult
        ): Promise<Result<void, Error>> => {
            return setFactCheck(buildKey("youtubeComment", commentId), state, date, result);
        },
        removeYouTubeCommentFactCheck: async (commentId: string): Promise<Result<void, Error>> => {
            return removeFactCheck(buildKey("youtubeComment", commentId));
        },

        // Reddit Post FactChecks
        getRedditPostFactCheck: async (postId: string): Promise<Result<FactCheckDbEntry | null, Error>> => {
            return getFactCheck(buildKey("redditPost", postId));
        },
        setRedditPostFactCheck: async (
            postId: string,
            state: FactCheckState,
            date: Date,
            result?: FactCheckResult
        ): Promise<Result<void, Error>> => {
            return setFactCheck(buildKey("redditPost", postId), state, date, result);
        },
        removeRedditPostFactCheck: async (postId: string): Promise<Result<void, Error>> => {
            return removeFactCheck(buildKey("redditPost", postId));
        },

        // Reddit Comment FactChecks
        getRedditCommentFactCheck: async (commentId: string): Promise<Result<FactCheckDbEntry | null, Error>> => {
            return getFactCheck(buildKey("redditComment", commentId));
        },
        setRedditCommentFactCheck: async (
            commentId: string,
            state: FactCheckState,
            date: Date,
            result?: FactCheckResult
        ): Promise<Result<void, Error>> => {
            return setFactCheck(buildKey("redditComment", commentId), state, date, result);
        },
        removeRedditCommentFactCheck: async (commentId: string): Promise<Result<void, Error>> => {
            return removeFactCheck(buildKey("redditComment", commentId));
        },

        // Generic getter/setter/remover if needed, though specific ones are preferred for type safety and clarity
        getGenericFactCheck: getFactCheck,
        setGenericFactCheck: setFactCheck,
        removeGenericFactCheck: removeFactCheck,
    };
}

export const [registerFactCheckDbService, getFactCheckDbService] = defineProxyService(
    "FactCheckDbService",
    createApiRepo
);

export type FactCheckDbService = ReturnType<typeof createApiRepo>;
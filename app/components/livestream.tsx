"use client";

import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY_URL = "twitchUrl";
const LEGACY_KEY_CHANNEL = "twitchChannel";
const STORAGE_KEY_CHAT_ENABLED = "twitchChatEnabled";

type LivestreamProps = {
    enabledOverride?: boolean;
    urlOverride?: string;
    layoutOverride?: "row" | "column";
    chatEnabledOverride?: boolean;
};

export default function Livestream({ enabledOverride, urlOverride, layoutOverride, chatEnabledOverride }: LivestreamProps) {

    const [channel, setChannel] = useState<string>("");
    const [parentHost, setParentHost] = useState<string>("localhost");
    const [enabled, setEnabled] = useState<boolean>(true);
    const [chatEnabled, setChatEnabled] = useState<boolean>(true);

    // Initialize from localStorage on client
    useEffect(() => {
        try {
            // Prefer URL; parse channel from it (or use override)
            const storedUrl = urlOverride ?? window.localStorage.getItem(STORAGE_KEY_URL);
            if (storedUrl) {
                const parsed = parseChannelFromUrl(storedUrl);
                if (parsed) setChannel(parsed);
            } else {
                // Fallback to legacy channel key
                const legacy = window.localStorage.getItem(LEGACY_KEY_CHANNEL);
                if (legacy) setChannel(legacy);
            }
            const storedEnabled = enabledOverride ?? (() => {
                const val = window.localStorage.getItem("twitchEnabled");
                return val === null ? true : val === "true";
            })();
            setEnabled(!!storedEnabled);

            const storedChatEnabled = chatEnabledOverride ?? (() => {
                const val = window.localStorage.getItem(STORAGE_KEY_CHAT_ENABLED);
                return val === null ? true : val === "true";
            })();
            setChatEnabled(!!storedChatEnabled);
        } catch { }
        setParentHost(window.location.hostname || "localhost");
    }, [enabledOverride, urlOverride, chatEnabledOverride]);

    // Listen for external updates (from admin page)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY_URL) {
                const value = e.newValue ?? "";
                const parsed = value ? parseChannelFromUrl(value) : null;
                if (parsed) setChannel(parsed);
            } else if (e.key === LEGACY_KEY_CHANNEL && e.newValue) {
                setChannel(e.newValue);
            } else if (e.key === "twitchEnabled" && e.newValue !== null) {
                setEnabled(e.newValue === "true");
            } else if (e.key === STORAGE_KEY_CHAT_ENABLED && e.newValue !== null) {
                setChatEnabled(e.newValue === "true");
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const playerSrc = useMemo(() => {
        if (!channel) return null;
        const params = new URLSearchParams({ channel, parent: parentHost, autoplay: "true", muted: "false" });
        return `https://player.twitch.tv/?${params.toString()}`;
    }, [channel, parentHost]);

    const chatSrc = useMemo(() => {
        if (!channel) return null;
        const params = new URLSearchParams({ parent: parentHost });
        return `https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat?${params.toString()}`;
    }, [channel, parentHost]);

    // Respect enabled flag and presence of channel
    if (!enabled || !channel) {
        return null;
    }

    const isColumn = layoutOverride === "column";

    return (
        <div style={{ position: "relative", display: "flex", flexDirection: isColumn ? "column" : "row", gap: 12, width: "100%", height: isColumn ? "auto" : "80vh", alignItems: "stretch", overflowX: "hidden" }}>
            <div style={{ flex: isColumn ? undefined : 2, minWidth: 0 }}>
                <div style={{ position: "relative", width: "100%", height: isColumn ? "56vh" : "100%", background: "#000" }}>
                    {playerSrc && (
                        <iframe
                            title="Twitch Player"
                            src={playerSrc}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                        />
                    )}
                </div>
            </div>
            {chatEnabled && (
                <div style={{ flex: isColumn ? undefined : 1, minWidth: isColumn ? 0 : 240, height: isColumn ? "40vh" : "auto" }}>
                    {chatSrc && (
                        <iframe
                            title="Twitch Chat"
                            src={chatSrc}
                            style={{ width: "100%", height: "100%", border: 0 }}
                        />
                    )}
                </div>
            )}
            {/* No overlay when channel is empty since we return null above */}
        </div>
    );
}

function parseChannelFromUrl(input: string): string | null {
    try {
        const url = new URL(input);
        if (!/twitch\.tv$/i.test(url.hostname)) return null;
        // Expected path: /{channel} or /videos/{id}, only handle channel path here
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length >= 1) {
            const first = segments[0].toLowerCase();
            if (first !== "videos" && first !== "directory") {
                return segments[0];
            }
        }
        return null;
    } catch {
        return null;
    }
}

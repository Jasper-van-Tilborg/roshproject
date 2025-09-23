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

export function LivestreamEmbed({ enabledOverride, urlOverride, layoutOverride, chatEnabledOverride }: LivestreamProps) {

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

// Admin controls embedded as a component for reuse
function LivestreamAdminControls() {
    const STORAGE_KEY_URL = "twitchUrl";
    const STORAGE_KEY_ENABLED = "twitchEnabled";
    const STORAGE_KEY_CHAT_ENABLED = "twitchChatEnabled";
    const LEGACY_KEY_CHANNEL = "twitchChannel";

    const [twitchUrl, setTwitchUrl] = useState<string>("");
    const [enabled, setEnabled] = useState<boolean>(true);
    const [chatEnabled, setChatEnabled] = useState<boolean>(true);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);

    useEffect(() => {
        try {
            const storedUrl = window.localStorage.getItem(STORAGE_KEY_URL);
            if (storedUrl) setTwitchUrl(storedUrl);
            const storedEnabled = window.localStorage.getItem(STORAGE_KEY_ENABLED);
            if (storedEnabled !== null) setEnabled(storedEnabled === "true");
            const storedChatEnabled = window.localStorage.getItem(STORAGE_KEY_CHAT_ENABLED);
            if (storedChatEnabled !== null) setChatEnabled(storedChatEnabled === "true");
        } catch { }
    }, []);

    function handleSave(e?: React.FormEvent) {
        if (e) e.preventDefault();
        try {
            const value = twitchUrl.trim();
            if (value === "") {
                window.localStorage.removeItem(STORAGE_KEY_URL);
                window.localStorage.removeItem(LEGACY_KEY_CHANNEL);
            } else {
                window.localStorage.setItem(STORAGE_KEY_URL, value);
            }
            window.localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
            window.localStorage.setItem(STORAGE_KEY_CHAT_ENABLED, String(chatEnabled));
            setSaved(true);
            setTimeout(() => setSaved(false), 1200);
        } catch { }
    }

    return (
        <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Livestream instellingen</h1>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", padding: 12, gap: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 600 }}>Twitch stream</div>
                    <button
                        onClick={() => setEnabled((v) => !v)}
                        aria-label="toggle"
                        style={{
                            width: 52,
                            height: 30,
                            borderRadius: 9999,
                            border: 0,
                            background: enabled ? "#34C759" : "#E5E7EB",
                            position: "relative",
                            transition: "background 150ms ease",
                            cursor: "pointer",
                            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)"
                        }}
                    >
                        <span
                            style={{
                                position: "absolute",
                                top: 3,
                                left: enabled ? 26 : 3,
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: "#fff",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                                transition: "left 150ms ease"
                            }}
                        />
                    </button>
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        aria-label="toggle details"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            border: 0,
                            background: "transparent",
                            cursor: "pointer"
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 160ms ease", color: "#6b7280" }}
                        >
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                {expanded && (
                    <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                        <input
                            type="url"
                            value={twitchUrl}
                            onChange={(e) => setTwitchUrl(e.target.value)}
                            placeholder="https://www.twitch.tv/jouwkanaal"
                            style={{ flex: 1, padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6 }}
                        />
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, justifySelf: "end" }}>
                            <span style={{ color: "#374151", fontSize: 14 }}>Chat</span>
                            <button
                                onClick={() => setChatEnabled((v) => !v)}
                                aria-label="toggle chat"
                                type="button"
                                style={{
                                    width: 48,
                                    height: 28,
                                    borderRadius: 9999,
                                    border: 0,
                                    background: chatEnabled ? "#34C759" : "#E5E7EB",
                                    position: "relative",
                                    transition: "background 150ms ease",
                                    cursor: "pointer"
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        top: 3,
                                        left: chatEnabled ? 24 : 3,
                                        width: 22,
                                        height: 22,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                                        transition: "left 150ms ease"
                                    }}
                                />
                            </button>
                        </label>
                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                            <button onClick={() => handleSave()} style={{ padding: "10px 14px", borderRadius: 6, border: 0, background: "#7c3aed", color: "white", fontWeight: 600 }}>
                                Opslaan
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {saved && <div style={{ marginTop: 8, color: "#065f46" }}>Opgeslagen.</div>}
        </div>
    );
}

type LivestreamWidgetProps = { mode?: "viewer" | "admin" };
export default function Livestream({ mode = "viewer" }: LivestreamWidgetProps) {
    if (mode === "admin") {
        return <LivestreamAdminControls />;
    }
    return <LivestreamEmbed />;
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

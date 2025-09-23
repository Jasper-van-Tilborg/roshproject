"use client";

import React, { useEffect, useMemo, useState } from "react";
import Livestream from "@/app/components/livestream";

const STORAGE_KEY_URL = "twitchUrl";
const STORAGE_KEY_ENABLED = "twitchEnabled";
const STORAGE_KEY_CHAT_ENABLED = "twitchChatEnabled";
const LEGACY_KEY_CHANNEL = "twitchChannel";

export default function LivestreamAdminPage() {
    const [twitchUrl, setTwitchUrl] = useState<string>("");
    const [enabled, setEnabled] = useState<boolean>(true);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [chatEnabled, setChatEnabled] = useState<boolean>(true);
    const [saved, setSaved] = useState<boolean>(false);
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "phone">("desktop");

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

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
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

    const previewUrlOverride = useMemo(() => twitchUrl.trim() || undefined, [twitchUrl]);
    const previewEnabledOverride = useMemo(() => enabled, [enabled]);
    const previewLayoutOverride = useMemo(() => (previewDevice === "phone" ? "column" : "row"), [previewDevice]);
    const previewChatEnabledOverride = useMemo(() => chatEnabled, [chatEnabled]);
    const previewWidth = useMemo(() => {
        switch (previewDevice) {
            case "phone":
                return 390; // iPhone 14-ish logical width
            case "tablet":
                return 768; // iPad portrait
            default:
                return 1024; // small desktop
        }
    }, [previewDevice]);

    return (
        <div style={{ display: "flex", gap: 16, width: "100%", padding: 16, boxSizing: "border-box" }}>
            <div style={{ flex: 1, minWidth: 320 }}>
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
                                style={{
                                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 160ms ease",
                                    color: "#6b7280"
                                }}
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
                                <button onClick={handleSave as any} style={{ padding: "10px 14px", borderRadius: 6, border: 0, background: "#7c3aed", color: "white", fontWeight: 600 }}>
                                    Opslaan
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {saved && <div style={{ marginTop: 8, color: "#065f46" }}>Opgeslagen.</div>}
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Tip: wijzigingen worden live doorgevoerd in de preview en op /livestream.</div>
            </div>

            <div style={{ flex: 1.6, minWidth: 360 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>Live preview</div>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button
                            onClick={() => setPreviewDevice("desktop")}
                            title="Desktop"
                            style={{
                                border: 0,
                                background: previewDevice === "desktop" ? "#eef2ff" : "transparent",
                                color: previewDevice === "desktop" ? "#4f46e5" : "#6b7280",
                                borderRadius: 6,
                                padding: 6,
                                cursor: "pointer"
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                                <rect x="8" y="20" width="8" height="1.5" rx="0.75" fill="currentColor" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setPreviewDevice("tablet")}
                            title="Tablet"
                            style={{
                                border: 0,
                                background: previewDevice === "tablet" ? "#eef2ff" : "transparent",
                                color: previewDevice === "tablet" ? "#4f46e5" : "#6b7280",
                                borderRadius: 6,
                                padding: 6,
                                cursor: "pointer"
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="18" r="1" fill="currentColor" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setPreviewDevice("phone")}
                            title="Phone"
                            style={{
                                border: 0,
                                background: previewDevice === "phone" ? "#eef2ff" : "transparent",
                                color: previewDevice === "phone" ? "#4f46e5" : "#6b7280",
                                borderRadius: 6,
                                padding: 6,
                                cursor: "pointer"
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="8" y="2" width="8" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="18.5" r="1" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div style={{
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    overflow: previewDevice === "desktop" ? "hidden" : "auto",
                    height: "80vh",
                    boxSizing: "border-box"
                }}>
                    <div style={{
                        margin: "0 auto",
                        width: previewWidth,
                        minWidth: 320,
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        overflow: "hidden",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
                    }}>
                        <Livestream enabledOverride={previewEnabledOverride} urlOverride={previewUrlOverride} layoutOverride={previewLayoutOverride as any} chatEnabledOverride={previewChatEnabledOverride} />
                    </div>
                </div>
            </div>
        </div>
    );
}



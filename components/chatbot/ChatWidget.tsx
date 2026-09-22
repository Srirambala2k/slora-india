"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { closeChat, openChat, useChatOpen } from "@/lib/chat/store";
import { useStage } from "@/lib/stage";
import styles from "./Chat.module.css";

// The panel (with the enquiry rules, incl. phone-number checking) is only downloaded the first
// time someone opens the chat, so it costs nothing at page load.
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

/**
 * The floating enquiry button (master prompt P§31). It appears once the opening sequence is
 * done, and opens a glass chat panel. Anything on the site can open it via `openChat()`.
 */
export function ChatWidget() {
  const open = useChatOpen();
  const stage = useStage();
  const [loaded, setLoaded] = useState(false);
  if (open && !loaded) setLoaded(true);

  if (stage !== "ready") return null;
  return (
    <>
      <button
        type="button"
        className={styles.fab}
        aria-label={open ? "Close the SLORA enquiry chat" : "Open the SLORA enquiry chat"}
        aria-expanded={open}
        aria-controls="slora-chat"
        onClick={() => (open ? closeChat() : openChat())}
      >
        <span className={styles.fabRing} aria-hidden="true" />
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d="M4 5h16v11H9l-5 4z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </button>
      {loaded && <ChatPanel />}
    </>
  );
}

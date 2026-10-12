"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CHAT_PREVIEW_MODE } from "@/lib/chat/config";
import {
  GREETING,
  STEPS,
  answeredCount,
  checkAnswer,
  nextStep,
  summaryLine,
} from "@/lib/chat/flow";
import { closeChat, useChatOpen, useInterest } from "@/lib/chat/store";
import { getDraft, resetDraft, setAnswer, useDraft } from "@/lib/leads/draft";
import { saveLeadQuietly } from "@/lib/leads/submitClient";
import { buildWhatsAppUrl, type EnquiryDetails } from "@/lib/whatsapp/whatsapp";
import styles from "./Chat.module.css";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  tone?: "error";
}

const TYPING_MS = 650;

/**
 * The enquiry conversation (master prompt P§22–24, P§31). Visual shell: the questions and
 * the checks are real, but nothing is sent yet (see lib/chat/config.ts), and the window says so.
 */
export default function ChatPanel() {
  const open = useChatOpen();
  const draft = useDraft();
  // Read live, but only acted on at the moment the panel actually opens (see the effect
  // below) — the rest of a conversation should not change just because some other card
  // sets a new interest in the background while this panel stays mounted.
  const interest = useInterest();
  const greeting = interest ? `Thanks for showing interest in ${interest}. ${GREETING}` : GREETING;
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const nextId = useRef(1);
  const wasOpen = useRef(false);
  const asking = useRef(false); // guards against two overlapping "typing…then ask" calls

  const step = nextStep(draft);
  const answered = answeredCount(draft);
  const done = step === null;
  // Once every question is answered the draft is a complete enquiry; this is what goes to WhatsApp.
  const details = draft as EnquiryDetails;
  const whatsappHref = done ? buildWhatsAppUrl(details) : null;

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const push = (from: Message["from"], text: string, tone?: Message["tone"]) =>
    setMessages((all) => [...all, { id: nextId.current++, from, text, tone }]);

  /**
   * The assistant "types" for a moment, then asks the next unanswered question. Guarded
   * against overlap: the panel's own opening sequence schedules one call, and a fast reply
   * (submitted before that first question even renders) schedules another — without the
   * guard both would land and the same question could be asked twice.
   */
  const askNext = () => {
    if (asking.current) return;
    asking.current = true;
    setTyping(true);
    later(() => {
      asking.current = false;
      setTyping(false);
      const upcoming = nextStep(getDraft());
      if (upcoming) push("bot", upcoming.prompt);
    }, TYPING_MS);
  };

  // Start (or restart) the conversation every time the panel opens — not just the first
  // time, and always from the first unanswered question (the NAME, since closing wipes the
  // draft, see below). The panel is downloaded once and then stays mounted for the rest of the
  // visit (see ChatWidget), so a later open — from a different card, with a different interest —
  // needs its own fresh greeting rather than silently reusing the first one.
  // This must be safe to run twice in a row: React's development mode runs every effect, cleans
  // it up and runs it again on mount. An earlier version skipped the second run (it only started
  // on a closed→open change), which cleared its own timers and left the first open with no
  // greeting and no first question.
  useEffect(() => {
    if (!open) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    asking.current = false;
    // (cleared from a timer, not in the effect body: the lint rule against synchronous setState
    // in effects, and the same reason `askNext` works from a timer)
    later(() => {
      setMessages([]);
      setTyping(false);
      setInput("");
    }, 0);
    later(() => push("bot", greeting), 150);
    later(() => askNext(), 500);
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Closing ends the enquiry: the next time the chat opens it starts from the NAME again, and
  // the previous visitor's answers are not left in memory for the next person on this computer.
  // (A card or sport button that opens the chat pre-fills its requirement just BEFORE opening,
  // after this has run, so that still works.)
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
    } else if (wasOpen.current) {
      wasOpen.current = false;
      resetDraft();
    }
  }, [open]);

  // Keep the newest message in view, and the cursor in the box.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, typing, done]);
  useEffect(() => {
    if (open && !typing) inputRef.current?.focus();
  }, [open, typing, messages.length]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeChat();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = (raw: string) => {
    if (!step || typing) return;
    const text = raw.trim();
    const result = checkAnswer(step.id, raw);
    push("user", result.ok ? result.display : text || "…");
    setInput("");
    if (!result.ok) {
      later(() => push("bot", result.message, "error"), 350);
      return;
    }
    setAnswer(step.id, result.value as never);
    askNext();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(input);
  };

  const startAgain = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    asking.current = false;
    resetDraft();
    setMessages([]);
    setInput("");
    setTyping(false);
    later(() => push("bot", greeting), 150);
    later(() => askNext(), 500);
  };

  return (
    <section
      id="slora-chat"
      className={styles.panel}
      data-open={open}
      role="dialog"
      aria-label="SLORA enquiry chat"
      inert={!open}
    >
      <header className={styles.head}>
        <div>
          <p className={styles.title}>SLORA AI</p>
          <p className={styles.sub}>PROJECT DETAILS</p>
        </div>
        <button type="button" className={styles.close} onClick={closeChat} aria-label="Close chat">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </button>
      </header>

      {/* ●────●────●────○────○────○ */}
      <ol
        className={styles.progress}
        aria-label={`Question ${Math.min(answered + 1, STEPS.length)} of ${STEPS.length}`}
      >
        {STEPS.map((s, i) => (
          <li key={s.id} className={i < answered ? styles.dotDone : styles.dot} />
        ))}
      </ol>

      <div ref={logRef} className={styles.log} role="log" aria-live="polite">
        {messages.map((m) => (
          <p key={m.id} className={m.from === "bot" ? styles.bot : styles.user} data-tone={m.tone}>
            {m.text}
          </p>
        ))}
        {typing && (
          <p className={styles.bot} aria-label="SLORA is typing">
            <span className={styles.typing} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
        )}

        {done && !typing && (
          <div className={styles.summary}>
            <p className={styles.thanks}>THANK YOU.</p>
            {whatsappHref ? (
              <p className={styles.previewNote}>
                ONE LAST STEP · PRESS <b>SEND</b> IN WHATSAPP TO DELIVER IT
              </p>
            ) : CHAT_PREVIEW_MODE ? (
              <p className={styles.previewNote}>
                PREVIEW ONLY · YOUR DETAILS HAVE <b>NOT</b> BEEN SENT
              </p>
            ) : (
              <p className={styles.received}>YOUR PROJECT DETAILS HAVE BEEN RECEIVED.</p>
            )}
            <dl className={styles.facts}>
              {STEPS.map((s) => (
                <div key={s.id}>
                  <dt>{s.label}</dt>
                  <dd>{summaryLine(s, draft)}</dd>
                </div>
              ))}
            </dl>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsapp}
                onClick={() => void saveLeadQuietly(details)}
              >
                SEND ON WHATSAPP →
              </a>
            )}
            <p className={styles.footnote}>
              {whatsappHref
                ? "This opens WhatsApp with your details already typed. SLORA receives them once you press Send there, and our team will contact you as soon as possible."
                : CHAT_PREVIEW_MODE
                  ? "The enquiry system is not switched on yet — once it is, our team will contact you as soon as possible."
                  : "Our team will contact you as soon as possible."}
            </p>
            <button type="button" className={styles.again} onClick={startAgain}>
              START AGAIN
            </button>
          </div>
        )}
      </div>

      {!done && (
        <div className={styles.foot}>
          {step && !typing && (step.kind === "choice" || step.optional) && (
            <div className={styles.chips}>
              {(step.options ?? []).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={styles.chip}
                  onClick={() => submit(option)}
                >
                  {option}
                </button>
              ))}
              {step.optional && (
                <button type="button" className={styles.chip} onClick={() => submit("skip")}>
                  Skip
                </button>
              )}
            </div>
          )}
          <form className={styles.form} onSubmit={onSubmit}>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={step?.placeholder ?? ""}
              inputMode={step?.inputMode}
              autoComplete={step?.kind === "phone" ? "tel" : step?.id === "name" ? "name" : "off"}
              aria-label={step?.prompt ?? "Your answer"}
              disabled={typing}
              maxLength={200}
            />
            <button type="submit" className={styles.send} disabled={typing} aria-label="Send">
              →
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

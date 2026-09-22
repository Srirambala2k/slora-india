import { useSyncExternalStore } from "react";

/**
 * Whether the chat panel is open, and what it is open ABOUT. A tiny shared store so any part
 * of the site (the header's "BUILD WITH SLORA →", a card, the contact section) can open it
 * without importing it.
 */
let open = false;
/** What a visitor clicked to get here, e.g. "Pickleball court" — shown in the greeting only
 *  (P§32/never-invent: this never becomes the `requirementType` sent to the server unless it
 *  is one of the real, listed options — see `askAboutCard`/`askAboutSport`). */
let interest: string | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function isChatOpen(): boolean {
  return open;
}

export function getInterest(): string | null {
  return interest;
}

/**
 * Open the chat. `interest` becomes part of the greeting ("Thanks for showing interest in
 * …") — pass it from a card/panel button; leave it out for a plain open (header, FAB), which
 * also clears whatever a previous card set, so a stale greeting never lingers into a new visit.
 */
export function openChat(nextInterest: string | null = null): void {
  const interestChanged = nextInterest !== interest;
  interest = nextInterest;
  if (open) {
    // Already open (e.g. a second card clicked without closing first): still tell
    // subscribers if the interest itself changed, so the greeting can catch up.
    if (interestChanged) emit();
    return;
  }
  open = true;
  emit();
}

export function closeChat(): void {
  if (!open) return;
  open = false;
  emit();
}

export function subscribeChat(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useChatOpen(): boolean {
  return useSyncExternalStore(subscribeChat, isChatOpen, () => false);
}

export function useInterest(): string | null {
  return useSyncExternalStore(subscribeChat, getInterest, () => null);
}

import { openChat } from "@/lib/chat/store";
import { getDraft, prefill } from "@/lib/leads/draft";
import type { RequirementType } from "@/lib/leads/schema";
import type { SurfaceCard } from "@/data/surfaces";

/** What a card's button last put into the enquiry, so a different card can take it back out. */
let prefilledByCard: RequirementType | undefined;

/**
 * A surface card's "Connect with us" button: open the enquiry chat.
 *
 * The greeting always names the card ("Thanks for showing interest in Pickleball court…"),
 * whether or not it maps to a real enquiry type — that is just a friendly opener, not a claim
 * sent anywhere. The actual `requirementType` question is pre-filled ONLY for a card that
 * matches an enquiry type exactly (Football turf → "Football Turf"); for the rest (Pickleball,
 * Shuttle court, Park setup, Basketball court) nothing is guessed, so the chat simply asks. And
 * if an earlier card filled in a type the visitor has not changed since, that is taken back
 * out, so a Basketball enquiry is never recorded as Football.
 */
export function askAboutCard(card: Pick<SurfaceCard, "label" | "requirement">): void {
  if (card.requirement) {
    prefill({ requirementType: card.requirement });
    prefilledByCard = card.requirement;
  } else if (prefilledByCard && getDraft().requirementType === prefilledByCard) {
    prefill({ requirementType: undefined });
    prefilledByCard = undefined;
  }
  openChat(card.label);
}

/** Test hook: forget what a card filled in. */
export function resetCardEnquiry(): void {
  prefilledByCard = undefined;
}

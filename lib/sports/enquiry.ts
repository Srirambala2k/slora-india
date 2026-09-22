import { openChat } from "@/lib/chat/store";
import { getDraft, prefill } from "@/lib/leads/draft";
import type { RequirementType } from "@/lib/leads/schema";

/** What a panel's button last put into the enquiry, so a different panel can take it back out. */
let prefilledByPanel: RequirementType | undefined;

/**
 * A sports panel's "ask about …" button: open the enquiry chat.
 *
 * If the panel matches an enquiry type exactly, that answer is filled in so the chat does not
 * ask it again. If it does not (Hockey, Tennis, Padel, Athletics), nothing is guessed: the chat
 * asks. And if an earlier panel filled in a different type that the visitor has not changed
 * since, that is taken back out, so a Tennis enquiry is never recorded as Football.
 */
export function askAboutSport(requirement?: RequirementType): void {
  if (requirement) {
    prefill({ requirementType: requirement });
    prefilledByPanel = requirement;
  } else if (prefilledByPanel && getDraft().requirementType === prefilledByPanel) {
    prefill({ requirementType: undefined });
    prefilledByPanel = undefined;
  }
  openChat();
}

/** Test hook: forget what a panel filled in. */
export function resetSportEnquiry(): void {
  prefilledByPanel = undefined;
}

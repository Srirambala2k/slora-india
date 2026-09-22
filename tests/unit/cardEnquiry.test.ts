import { beforeEach, describe, expect, it } from "vitest";
import { closeChat, getInterest, isChatOpen } from "@/lib/chat/store";
import { askAboutCard, resetCardEnquiry } from "@/lib/cards/enquiry";
import { getDraft, prefill, resetDraft } from "@/lib/leads/draft";

const football = { label: "Football turf", requirement: "Football Turf" as const };
const pickleball = { label: "Pickleball court" }; // no exact enquiry-type match
const basketball = { label: "Basketball court" };

beforeEach(() => {
  resetDraft();
  resetCardEnquiry();
  closeChat();
});

describe('a surface card\'s "Connect with us" button', () => {
  it("opens the chat, and names the card in the greeting even with no exact enquiry-type match", () => {
    askAboutCard(pickleball);
    expect(isChatOpen()).toBe(true);
    expect(getInterest()).toBe("Pickleball court");
    expect(getDraft().requirementType).toBeUndefined(); // never guessed
  });

  it("also pre-fills the enquiry type for a card that matches one exactly", () => {
    askAboutCard(football);
    expect(getInterest()).toBe("Football turf");
    expect(getDraft().requirementType).toBe("Football Turf");
  });

  it("takes back what an earlier card filled in, so Basketball is never recorded as Football", () => {
    askAboutCard(football);
    closeChat();
    askAboutCard(basketball);
    expect(getDraft().requirementType).toBeUndefined();
    expect(getInterest()).toBe("Basketball court");
  });

  it("never wipes an answer the visitor chose themselves in the chat", () => {
    prefill({ requirementType: "Landscape" });
    askAboutCard(pickleball);
    expect(getDraft().requirementType).toBe("Landscape");
  });

  it("keeps the other answers already given", () => {
    prefill({ name: "Asha Raman", city: "Chennai" });
    askAboutCard(football);
    expect(getDraft()).toMatchObject({
      name: "Asha Raman",
      city: "Chennai",
      requirementType: "Football Turf",
    });
  });
});

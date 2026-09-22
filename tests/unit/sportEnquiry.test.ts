import { beforeEach, describe, expect, it } from "vitest";
import { closeChat, isChatOpen } from "@/lib/chat/store";
import { getDraft, prefill, resetDraft } from "@/lib/leads/draft";
import { askAboutSport, resetSportEnquiry } from "@/lib/sports/enquiry";

beforeEach(() => {
  resetDraft();
  resetSportEnquiry();
  closeChat();
});

describe("asking about a sport", () => {
  it("opens the chat", () => {
    askAboutSport();
    expect(isChatOpen()).toBe(true);
  });

  it("fills in the enquiry type when the panel matches one exactly", () => {
    askAboutSport("Football Turf");
    expect(getDraft().requirementType).toBe("Football Turf");
    expect(isChatOpen()).toBe(true);
  });

  it("guesses nothing for a panel with no exact match (the chat will ask)", () => {
    askAboutSport(undefined);
    expect(getDraft().requirementType).toBeUndefined();
  });

  it("takes back what an earlier panel filled in, so Tennis is never recorded as Football", () => {
    askAboutSport("Football Turf");
    closeChat();
    askAboutSport(undefined); // e.g. Tennis
    expect(getDraft().requirementType).toBeUndefined();
  });

  it("switches from one matching panel to another", () => {
    askAboutSport("Football Turf");
    askAboutSport("Cricket Turf");
    expect(getDraft().requirementType).toBe("Cricket Turf");
  });

  it("never wipes an answer the visitor chose themselves in the chat", () => {
    prefill({ requirementType: "Landscape" }); // chosen by the visitor, not by a panel
    askAboutSport(undefined);
    expect(getDraft().requirementType).toBe("Landscape");
  });

  it("keeps the other answers already given", () => {
    prefill({ name: "Asha Raman", city: "Chennai" });
    askAboutSport("Multi-Sport");
    expect(getDraft()).toMatchObject({
      name: "Asha Raman",
      city: "Chennai",
      requirementType: "Multi-Sport",
    });
  });
});

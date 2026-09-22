import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GREETING,
  STEPS,
  answeredCount,
  checkAnswer,
  nextStep,
  summaryLine,
} from "@/lib/chat/flow";
import { closeChat, getInterest, isChatOpen, openChat, subscribeChat } from "@/lib/chat/store";
import { getDraft, prefill, resetDraft, setAnswer, subscribeDraft } from "@/lib/leads/draft";
import { leadInputSchema } from "@/lib/leads/schema";

afterEach(() => {
  resetDraft();
  closeChat();
});

describe("chat flow: the six questions", () => {
  it("asks exactly the six questions of the brief, in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual([
      "name",
      "city",
      "requirementType",
      "projectLink",
      "squareFeet",
      "phoneNumber",
    ]);
    expect(GREETING).toBe("Hi. Let's build something with SLORA.");
  });

  it("offers every requirement type as a quick option", () => {
    const options = STEPS.find((s) => s.id === "requirementType")!.options!;
    expect(options).toEqual(
      expect.arrayContaining([
        "Football Turf",
        "Cricket Turf",
        "Sports Flooring",
        "Landscape",
        "Playground",
        "Stadium",
        "Multi-Sport",
        "Other",
      ]),
    );
  });

  it("only the project link can be skipped", () => {
    expect(STEPS.filter((s) => s.optional).map((s) => s.id)).toEqual(["projectLink"]);
  });
});

describe("chat flow: answers use the same rules as the server", () => {
  it("accepts good answers and normalises them", () => {
    expect(checkAnswer("name", "  Asha   Raman ")).toEqual({
      ok: true,
      value: "Asha Raman",
      display: "Asha Raman",
    });
    expect(checkAnswer("squareFeet", "10,000 sq ft")).toMatchObject({
      ok: true,
      value: 10000,
      display: "10,000 sq ft",
    });
    expect(checkAnswer("phoneNumber", "98765 43210")).toMatchObject({
      ok: true,
      value: "+919876543210",
    });
    expect(checkAnswer("projectLink", "maps.app.goo.gl/x")).toMatchObject({
      ok: true,
      value: "https://maps.app.goo.gl/x",
    });
    expect(checkAnswer("requirementType", "Football Turf")).toMatchObject({
      ok: true,
      value: "Football Turf",
    });
  });

  it("gives a friendly message (never an echo of the input) for bad answers", () => {
    for (const [id, raw] of [
      ["name", "A"],
      ["city", ""],
      ["requirementType", "Swimming pool"],
      ["projectLink", "javascript:alert(1)"],
      ["squareFeet", "lots"],
      ["phoneNumber", "12345"],
    ] as const) {
      const result = checkAnswer(id, raw);
      expect(result.ok, `${id}: ${raw}`).toBe(false);
      if (!result.ok && raw.length > 3) expect(result.message).not.toContain(raw);
    }
  });

  it("lets the project link be skipped, by typing skip or leaving it empty", () => {
    expect(checkAnswer("projectLink", "skip")).toEqual({
      ok: true,
      value: null,
      display: "Skipped",
    });
    expect(checkAnswer("projectLink", "Skip")).toEqual({
      ok: true,
      value: null,
      display: "Skipped",
    });
    expect(checkAnswer("projectLink", "  ")).toEqual({ ok: true, value: null, display: "Skipped" });
  });

  it("does not let other questions be skipped", () => {
    expect(checkAnswer("name", "skip")).toMatchObject({ ok: true }); // "skip" is just a (short) valid name
    expect(checkAnswer("phoneNumber", "skip").ok).toBe(false);
    expect(checkAnswer("squareFeet", "").ok).toBe(false);
  });

  it("a complete conversation produces something the server schema accepts", () => {
    const answers: Record<string, string> = {
      name: "Asha Raman",
      city: "Chennai",
      requirementType: "Football Turf",
      projectLink: "skip",
      squareFeet: "10,000 sq ft",
      phoneNumber: "9876543210",
    };
    for (const step of STEPS) {
      const r = checkAnswer(step.id, answers[step.id]);
      expect(r.ok).toBe(true);
      if (r.ok) setAnswer(step.id, r.value as never);
    }
    expect(nextStep(getDraft())).toBeNull();
    expect(leadInputSchema.safeParse(getDraft()).success).toBe(true);
  });
});

describe("shared draft (chatbot + configurator use one lead)", () => {
  it("asks the questions in order, and stops when everything is answered", () => {
    expect(nextStep(getDraft())?.id).toBe("name");
    setAnswer("name", "Asha");
    expect(nextStep(getDraft())?.id).toBe("city");
    expect(answeredCount(getDraft())).toBe(1);
  });

  it("does not ask again what was already chosen elsewhere (master prompt P§32)", () => {
    prefill({ requirementType: "Football Turf" });
    setAnswer("name", "Asha");
    setAnswer("city", "Chennai");
    // the requirement step is skipped: the next question is the project link
    expect(nextStep(getDraft())?.id).toBe("projectLink");
  });

  it("a skipped optional answer counts as answered", () => {
    setAnswer("projectLink", null);
    expect(answeredCount(getDraft())).toBe(1);
    expect(summaryLine(STEPS[3], getDraft())).toBe("Not provided");
  });

  it("tells subscribers about each change", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDraft(listener);
    setAnswer("name", "A. R.");
    prefill({ city: "Chennai" });
    resetDraft();
    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
    setAnswer("name", "x");
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("formats the area for the summary", () => {
    setAnswer("squareFeet", 100000);
    expect(summaryLine(STEPS[4], getDraft())).toBe("1,00,000 sq ft");
  });
});

describe("chat open/close store", () => {
  it("opens, closes, and only announces real changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeChat(listener);
    expect(isChatOpen()).toBe(false);
    openChat();
    openChat();
    expect(isChatOpen()).toBe(true);
    closeChat();
    closeChat();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("remembers what a card/panel said it was opened about, for the chat's greeting", () => {
    expect(getInterest()).toBeNull();
    openChat("Pickleball court");
    expect(getInterest()).toBe("Pickleball court");
  });

  it("a plain open (header, FAB) clears whatever a previous card set", () => {
    openChat("Pickleball court");
    closeChat();
    openChat();
    expect(getInterest()).toBeNull();
  });
});

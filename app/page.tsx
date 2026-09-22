import { ChatWidget } from "@/components/chatbot/ChatWidget";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Entrance } from "@/components/transitions/Entrance";
import { Header } from "@/components/navigation/Header";
import { Journey } from "@/components/journey/Journey";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { HowWeBuild } from "@/components/sections/HowWeBuild";
import { Sports } from "@/components/sections/Sports";
import { SurfaceCards } from "@/components/sections/SurfaceCards";

/**
 * Home. Built so far: entrance → header → the scroll journey (hero → descent → 3D turf). The chapters below the hero are labelled
 * placeholders that give the menu somewhere to go; each is replaced as it gets built.
 */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Entrance />
      <Header />
      <ChatWidget />
      <main>
        <Journey />
        <SurfaceCards />
        {/* Landscape and Projects need real photos/details from SLORA before they are worth
            showing (plan §8 #5); removed from the live page for now rather than shown as "in
            build" placeholders. Re-add with <ChapterStub id="landscape" n="03" label="LANDSCAPE" />
            (and similarly for "projects") once that material arrives. */}
        <Sports />
        <HowWeBuild />
        <About />
        <Contact />
      </main>
      {/* Without JavaScript the intro cannot run, so never leave the visitor behind a black curtain. */}
      <noscript>
        <style>{`[data-entrance]{display:none!important}html{overflow:auto!important}`}</style>
      </noscript>
    </>
  );
}

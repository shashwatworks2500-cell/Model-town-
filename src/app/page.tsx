import { Hero } from "@/components/hero/Hero";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/cursor/Cursor";
import { EnquiryProvider } from "@/components/enquiry/EnquiryContext";
import { EnquiryPanel } from "@/components/enquiry/EnquiryPanel";
import { Gallery } from "@/components/gallery/Gallery";
import { Idea } from "@/components/sections/Idea";
import { Arrival } from "@/components/sections/Arrival";
import { Breathe } from "@/components/sections/Breathe";
import { Slow } from "@/components/sections/Slow";
import { Home } from "@/components/sections/Home";
import { Architecture } from "@/components/sections/Architecture";
import { Plan } from "@/components/sections/Plan";
import { Address } from "@/components/sections/Address";
import { Close } from "@/components/sections/Close";
import { SiteFooter } from "@/components/sections/SiteFooter";

/**
 * The page, and its rhythm.
 *
 * Surface alternates charcoal and bone the whole way down, and so does the kind
 * of attention each section asks for. The order is not a list of topics — it is
 * a sequence of tempos:
 *
 *   film · stillness · read · look · stop · enter · read sideways · study ·
 *   browse · facts · close
 *
 * `data-surface` is what the header reads to invert itself against whatever is
 * passing beneath it.
 */
export default function HomePage() {
  return (
    <EnquiryProvider>
      <SmoothScroll />
      <Cursor />
      <SiteHeader />

      <div id="site-root">
        <main>
          {/* The film. Six screens of it. */}
          <div data-surface="dark">
            <Hero />
          </div>

          {/* Stop moving. One statement in an empty field. */}
          <div data-surface="dark">
            <Idea />
          </div>

          {/* Light. Type left, plate right, out of alignment. */}
          <div data-surface="light">
            <Arrival />
            <Breathe />
          </div>

          {/* Dark, full height, almost silent. */}
          <div data-surface="dark">
            <Slow />
          </div>

          {/* Light again — the room opens as you pass it. */}
          <div data-surface="light">
            <Home />
            <Architecture />
          </div>

          {/* Dark: the drawing, then the record. */}
          <div data-surface="dark">
            <Plan />
            <Gallery />
          </div>

          {/* The facts, such as they are. */}
          <div data-surface="light">
            <Address />
          </div>

          {/* Closing frame. */}
          <div data-surface="dark">
            <Close />
          </div>
        </main>

        <div data-surface="dark">
          <SiteFooter />
        </div>
      </div>

      <EnquiryPanel />
    </EnquiryProvider>
  );
}

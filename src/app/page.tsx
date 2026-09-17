import { Hero } from "@/components/hero/Hero";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/cursor/Cursor";
import { EnquiryProvider } from "@/components/enquiry/EnquiryContext";
import { EnquiryPanel } from "@/components/enquiry/EnquiryPanel";
import { Gallery } from "@/components/gallery/Gallery";
import { Arrival } from "@/components/sections/Arrival";
import { Overview } from "@/components/sections/Overview";
import { SitePlan } from "@/components/sections/SitePlan";
import { Architecture } from "@/components/sections/Architecture";
import { FullBleed } from "@/components/sections/FullBleed";
import { Rhythm } from "@/components/sections/Rhythm";
import { Community } from "@/components/sections/Community";
import { Location } from "@/components/sections/Location";
import { FinalCta } from "@/components/sections/FinalCta";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { interior, leisure } from "@/lib/content";

/**
 * The page, in the order the story is told:
 *
 *   the land → the vision → the drawing → the architecture → the residence
 *   → the day → the ground → the pause → the record → the address → enquire
 *
 * Surface alternates deliberately down the page — paper, ink, paper, full
 * bleed — and so does the axis of motion, so no two neighbouring sections ask
 * to be read the same way.
 */
export default function HomePage() {
  return (
    <EnquiryProvider>
      <SmoothScroll />
      <Cursor />
      <SiteHeader />

      <div id="site-root">
        <main>
          <Hero />
          <Arrival />
          <Overview />
          <SitePlan />
          <Architecture />

          <FullBleed
            mediaId="interior"
            alt="A living room opening onto a kitchen, lit warmly from one side."
            mark={interior.mark}
            heading={interior.heading}
            body={interior.body}
            caption={interior.caption}
            position="center 45%"
          />

          <Rhythm />
          <Community />

          <FullBleed
            mediaId="leisure"
            alt="A person resting at the edge of a pool, looking out over a coastline at dusk."
            mark={leisure.mark}
            heading={leisure.heading}
            body={leisure.body}
            caption={leisure.caption}
            align="end"
            position="center 30%"
          />

          <Gallery />
          <Location />
          <FinalCta />
        </main>

        <SiteFooter />
      </div>

      <EnquiryPanel />
    </EnquiryProvider>
  );
}

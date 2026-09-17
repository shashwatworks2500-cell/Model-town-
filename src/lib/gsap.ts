/**
 * Single registration point for GSAP plugins. Importing this module anywhere
 * guarantees ScrollTrigger exists exactly once, and that its scroll reads are
 * throttled to the frame rather than firing per scroll event.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

export { gsap, ScrollTrigger };

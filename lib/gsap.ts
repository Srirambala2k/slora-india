"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/** Register GSAP plugins once. Import GSAP from here, never from "gsap" directly. */
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };

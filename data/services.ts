import { stills, type StillId } from "@/data/media";

/**
 * The "services we provide" slides (2026-10-12). The wording is SLORA's own, supplied by the
 * client (pasted into the conversation); the pictures are AI-generated stand-ins. The usage
 * slide has no picture of its own yet and borrows an existing court still.
 */
export interface Service {
  id: string;
  n: string;
  title: string;
  text: string;
  image: { src: string; label: string };
}

const image = (id: StillId) => ({ src: stills[id].src, label: stills[id].label });

export const SERVICES: readonly Service[] = [
  {
    id: "planning",
    n: "01",
    title: "Strategic Design & Planning",
    text: "From the orientation of each court to lighting, ventilation, spectator flow and safety clearances, we create environments that play beautifully and last long.",
    image: image("service-planning"),
  },
  {
    id: "construction",
    n: "02",
    title: "Precise Construction & Installation",
    text: "We handle everything: site preparation, foundations, structural supports, surface installation, nets, posts, LED lighting, optional bleachers, so you get a ready-to-use facility.",
    image: image("service-construction"),
  },
  {
    id: "maintenance",
    n: "03",
    title: "Ongoing Maintenance & Upkeep",
    text: "A court built today deserves to serve for years. We provide cleaning, line repainting, crack repair, resurfacing and full maintenance services to keep your facility performing at its best.",
    image: image("service-maintenance"),
  },
  {
    id: "usage",
    n: "04",
    title: "Usage Planning & Monetisation",
    text: "A court should be a hub, not just for play, but for community, bookings, events, and income. We help you plan scheduling, booking systems, memberships and lighting optimisation, so your investment grows.",
    image: image("dusk-court"),
  },
] as const;

export const SERVICES_NOTE = "ILLUSTRATIVE PICTURES · TO BE REPLACED WITH SLORA'S OWN";

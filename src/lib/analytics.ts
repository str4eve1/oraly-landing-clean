import posthog from "posthog-js";
import { getConsent, onConsentChange } from "./consent";

const POSTHOG_TOKEN = "phc_rDyX79RGSjPVPyjJNUBJmKHMv5dzmJyxfQEXAi7cAqsG";
const POSTHOG_HOST = "https://eu.i.posthog.com";
const META_PIXEL_ID = "1848091975864539";

let posthogInitialized = false;
let metaPixelInitialized = false;

function initPostHog() {
  if (posthogInitialized) return;
  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    cross_subdomain_cookie: true,
  });
  posthogInitialized = true;
}

function initMetaPixel() {
  if (metaPixelInitialized || typeof window === "undefined") return;
  // Standard Meta Pixel snippet (programmatic version, TS-safe)
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const f = window as unknown as { fbq?: any; _fbq?: any };
  if (!f.fbq) {
    const n: any = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    f.fbq = n;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode!.insertBefore(script, firstScript);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  window.fbq!("init", META_PIXEL_ID);
  window.fbq!("track", "PageView");
  metaPixelInitialized = true;
}

export function applyConsent() {
  const consent = getConsent();
  if (!consent) return;
  if (consent.choices.statistics) initPostHog();
  if (consent.choices.marketing) initMetaPixel();
}

// Auto-apply on module load (handles repeat visitors who already accepted)
if (typeof window !== "undefined") {
  applyConsent();
  onConsentChange(() => applyConsent());
}

export function trackCta(cta: string, section: string) {
  const consent = getConsent();
  if (!consent) return;
  if (consent.choices.statistics && posthogInitialized) {
    try {
      posthog.capture("cta_click", { cta, section });
    } catch {
      /* posthog not ready */
    }
  }
  if (consent.choices.marketing && metaPixelInitialized && window.fbq) {
    window.fbq("track", "Lead", { content_name: `${section}_${cta}` });
  }
}

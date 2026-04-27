import { useSyncExternalStore } from "react";

const STORAGE_KEY = "smilelive_cookie_consent_v1";
const EVENT = "smilelive:consent-updated";
const OPEN_BANNER_EVENT = "smilelive:open-cookie-banner";

export type ConsentChoices = {
  statistics: boolean;
  marketing: boolean;
};

export type ConsentRecord = {
  version: 1;
  timestamp: string;
  choices: ConsentChoices;
};

export const ALL_ACCEPTED: ConsentChoices = { statistics: true, marketing: true };
export const ALL_REJECTED: ConsentChoices = { statistics: false, marketing: false };

export function getConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(choices: ConsentChoices): ConsentRecord {
  const record: ConsentRecord = {
    version: 1,
    timestamp: new Date().toISOString(),
    choices,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: record }));
  return record;
}

export function clearConsent() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }));
}

export function openCookieBanner() {
  window.dispatchEvent(new CustomEvent(OPEN_BANNER_EVENT));
}

export function onOpenCookieBanner(handler: () => void): () => void {
  window.addEventListener(OPEN_BANNER_EVENT, handler);
  return () => window.removeEventListener(OPEN_BANNER_EVENT, handler);
}

export function onConsentChange(
  handler: (record: ConsentRecord | null) => void
): () => void {
  const wrapped = (e: Event) => handler((e as CustomEvent<ConsentRecord | null>).detail);
  window.addEventListener(EVENT, wrapped);
  return () => window.removeEventListener(EVENT, wrapped);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

export function useConsent(): ConsentRecord | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      return raw;
    },
    () => null
  ) ? getConsent() : null;
}

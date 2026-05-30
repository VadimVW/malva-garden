"use client";

import { useEffect, useRef } from "react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonText = "signin_with" | "signup_with";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: "outline";
              size: "large";
              shape: "pill";
              text: GoogleButtonText;
              locale: "uk";
              width: number;
            },
          ) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

export function GoogleSignInButton({
  mode,
  onCredential,
  onError,
}: {
  mode: "login" | "register";
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;

    const renderButton = () => {
      if (!mounted || !containerRef.current || !window.google?.accounts?.id) {
        return;
      }
      const width = Math.floor(containerRef.current.clientWidth);
      if (width < 1) return;

      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: mode === "register" ? "signup_with" : "signin_with",
        locale: "uk",
        width: Math.min(360, width),
      });
    };

    loadGoogleScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.google?.accounts?.id) {
          return;
        }
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onCredential(response.credential);
            } else {
              onError("Google не повернув дані для входу");
            }
          },
        });
        renderButton();
        resizeObserver = new ResizeObserver(renderButton);
        resizeObserver.observe(container);
      })
      .catch(() => onError("Не вдалося завантажити Google вхід"));

    return () => {
      mounted = false;
      resizeObserver?.disconnect();
    };
  }, [clientId, mode, onCredential, onError]);

  if (!clientId) return null;

  return <div ref={containerRef} className="flex w-full min-w-0 justify-center overflow-hidden" />;
}

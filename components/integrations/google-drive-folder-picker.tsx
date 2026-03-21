"use client";

let gapiScriptPromise: Promise<void> | null = null;
let pickerModulePromise: Promise<void> | null = null;

function loadGapiScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Picker requires a browser."));
  }
  if (window.gapi?.load) {
    return Promise.resolve();
  }
  if (gapiScriptPromise) return gapiScriptPromise;
  gapiScriptPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.gapi?.load) resolve();
      else reject(new Error("gapi.load missing after script load"));
    };

    const existing = document.querySelector(
      'script[src="https://apis.google.com/js/api.js"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.gapi?.load) {
        finish();
        return;
      }
      existing.addEventListener("load", finish);
      existing.addEventListener("error", () =>
        reject(new Error("Google API script failed"))
      );
      return;
    }

    const s = document.createElement("script");
    s.src = "https://apis.google.com/js/api.js";
    s.async = true;
    s.onload = finish;
    s.onerror = () => reject(new Error("Failed to load Google API"));
    document.body.appendChild(s);
  });
  return gapiScriptPromise;
}

/** Loads `gapi` + the `picker` module (idempotent). */
export async function ensureGooglePickerReady(): Promise<void> {
  await loadGapiScript();
  if (pickerModulePromise) return pickerModulePromise;
  pickerModulePromise = new Promise((resolve, reject) => {
    window.gapi?.load("picker", {
      callback: () => resolve(),
      onerror: () => reject(new Error("Google Picker failed to load")),
    });
  });
  return pickerModulePromise;
}

/**
 * Opens Google’s folder picker. Resolves with the parent folder id, or `null` if cancelled.
 * `appId` must be the GCP **project number** (same as the digits before `-` in `AUTH_GOOGLE_ID`).
 */
export async function openDriveParentFolderPicker(
  accessToken: string,
  developerKey: string,
  appId: string
): Promise<string | null> {
  await ensureGooglePickerReady();
  const pickerNs = window.google?.picker;
  if (!pickerNs) {
    throw new Error("Google Picker is not available in this browser.");
  }

  const view = new pickerNs.DocsView()
    .setIncludeFolders(true)
    .setSelectFolderEnabled(true)
    .setMimeTypes("application/vnd.google-apps.folder");

  const origin =
    typeof window !== "undefined" ? window.location.origin : "(unknown origin)";

  return new Promise((resolve, reject) => {
    const built = new pickerNs.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(developerKey)
      .setAppId(appId)
      .setTitle("Choose where to create Helm Outcome Charters")
      .setCallback((data: Record<string, unknown>) => {
        const action = data.action as string | undefined;
        if (action === "picked") {
          const docs = data.docs as { id?: string }[] | undefined;
          resolve(docs?.[0]?.id ?? null);
          return;
        }
        if (action === "cancel") {
          resolve(null);
          return;
        }
        // google.picker.Action.ERROR === 'error'
        if (action === "error") {
          const nested = data.error as { message?: string } | undefined;
          const flat = typeof data.message === "string" ? data.message : "";
          const fromGoogle = nested?.message || flat;
          reject(
            new Error(
              fromGoogle ||
                `Google Picker error. If you see “API developer key is invalid”, use an API key from the same GCP project as AUTH_GOOGLE_ID, enable Google Picker API for that project, and add this origin to the key’s HTTP referrer allowlist: ${origin}/* (also add 127.0.0.1 if you use it instead of localhost). Restart dev after changing .env.local. See README.`
            )
          );
          return;
        }
        resolve(null);
      })
      .build();
    built.setVisible(true);
  });
}

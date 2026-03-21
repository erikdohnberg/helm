/** Minimal typings for https://developers.google.com/picker/docs (loaded at runtime). */

interface GooglePickerDocsView {
  setIncludeFolders(include: boolean): GooglePickerDocsView;
  setSelectFolderEnabled(enabled: boolean): GooglePickerDocsView;
  setMimeTypes(mimeTypes: string): GooglePickerDocsView;
}

interface GooglePickerBuilder {
  addView(view: GooglePickerDocsView): GooglePickerBuilder;
  setOAuthToken(token: string): GooglePickerBuilder;
  setDeveloperKey(key: string): GooglePickerBuilder;
  /** Cloud project number (digits before `-` in OAuth client id). Required with Drive + API key. */
  setAppId(appId: string): GooglePickerBuilder;
  setTitle(title: string): GooglePickerBuilder;
  setCallback(
    callback: (data: Record<string, unknown>) => void
  ): GooglePickerBuilder;
  build(): { setVisible(visible: boolean): void };
}

interface GooglePickerNamespace {
  DocsView: new (viewId?: string) => GooglePickerDocsView;
  PickerBuilder: new () => GooglePickerBuilder;
}

declare global {
  interface Window {
    gapi?: {
      load: (
        api: string,
        opts: { callback: () => void; onerror?: (err: unknown) => void }
      ) => void;
    };
    google?: { picker?: GooglePickerNamespace };
  }
}

export {};

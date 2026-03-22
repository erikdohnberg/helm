import { describe, expect, it } from "vitest";

import {
  resolveChatUserDisplayName,
  resolveChatUserProfile,
  resolveSlackUserDisplayName,
} from "./slack-user-display-name";

describe("resolveSlackUserDisplayName", () => {
  it("returns display name for known IDs", () => {
    expect(resolveSlackUserDisplayName("U01ABC")).toBe("Jordan Lee");
    expect(resolveSlackUserDisplayName("  U02DEF  ")).toBe("Sam Chen");
  });

  it("strips leading @", () => {
    expect(resolveSlackUserDisplayName("@U03GHI")).toBe("Alex Rivera");
  });

  it("returns null for unknown IDs", () => {
    expect(resolveSlackUserDisplayName("U999ZZZ")).toBeNull();
    expect(resolveSlackUserDisplayName("")).toBeNull();
  });
});

describe("resolveChatUserProfile", () => {
  it("returns name and image URL for Slack mock users", () => {
    const p = resolveChatUserProfile("slack", "U01ABC");
    expect(p?.displayName).toBe("Jordan Lee");
    expect(p?.imageUrl).toContain("ui-avatars.com");
  });

  it("returns null for unknown Slack IDs", () => {
    expect(resolveChatUserProfile("slack", "U999")).toBeNull();
  });
});

describe("resolveChatUserDisplayName", () => {
  it("delegates to Slack mock for slack", () => {
    expect(resolveChatUserDisplayName("slack", "U01ABC")).toBe("Jordan Lee");
  });

  it("returns null for other platforms in demo", () => {
    expect(resolveChatUserDisplayName("discord", "any")).toBeNull();
    expect(resolveChatUserDisplayName("teams", "x")).toBeNull();
  });
});

"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/toast";
import {
  createOrgTeam,
  deleteOrgTeams,
  updateOrgTeam,
  type OrgTeamListRow,
} from "@/lib/actions/org-teams";
import {
  clearOrgMemberTeamLead,
  updateOrgMemberTeamLead,
  type OrgMemberListRow,
} from "@/lib/actions/org-members";
import {
  getChatMemberIdFieldLabel,
  getChatPlatformLabel,
  type ChatPlatformId,
} from "@/lib/integrations/chat-platforms";
import { resolveChatUserProfile } from "@/lib/mock/slack-user-display-name";
import { cn } from "@/lib/utils";

type Props = {
  orgId: string | null;
  currentUserId: string | undefined;
  viewerIsOwner: boolean;
  initialMembers: OrgMemberListRow[];
  initialStandaloneTeams: OrgTeamListRow[];
  primaryChatPlatform: ChatPlatformId;
};

function memberDisplayName(row: OrgMemberListRow): string {
  const named = row.name?.trim();
  if (named) return named;
  const email = row.email?.trim();
  if (email) return email;
  return "Unknown user";
}

type DialogMode = "add-standalone" | "edit-member" | "edit-standalone";

function LeaderCell({
  displayName,
  imageUrl,
}: {
  displayName: string | null;
  imageUrl: string | null;
}) {
  if (!displayName && !imageUrl) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex items-center gap-2">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- external demo avatar URLs
        <img
          src={imageUrl}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full border border-border bg-muted object-cover"
        />
      ) : null}
      <span className="text-foreground">{displayName ?? "—"}</span>
    </div>
  );
}

export function TeamSettingsClient({
  orgId,
  currentUserId,
  viewerIsOwner,
  initialMembers,
  initialStandaloneTeams,
  primaryChatPlatform,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
    new Set()
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("add-standalone");
  const [formStandaloneTeamId, setFormStandaloneTeamId] = useState<
    string | null
  >(null);
  const [formUserId, setFormUserId] = useState("");
  const [formTeamName, setFormTeamName] = useState("");
  const [formChatId, setFormChatId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const totalRows = initialMembers.length + initialStandaloneTeams.length;
  const allSelected =
    totalRows > 0 &&
    selectedMemberIds.size === initialMembers.length &&
    selectedTeamIds.size === initialStandaloneTeams.length;

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setFormError(null);
    setFormStandaloneTeamId(null);
  }, []);

  const openAddStandaloneDialog = useCallback(() => {
    if (!viewerIsOwner) return;
    setDialogMode("add-standalone");
    setFormStandaloneTeamId(null);
    setFormTeamName("");
    setFormChatId("");
    setFormError(null);
    setDialogOpen(true);
  }, [viewerIsOwner]);

  const openEditMemberDialog = useCallback((row: OrgMemberListRow) => {
    setDialogMode("edit-member");
    setFormUserId(row.userId);
    setFormTeamName(row.leadTeamName?.trim() ?? "");
    setFormChatId(row.slackUserId?.trim() ?? "");
    setFormStandaloneTeamId(null);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEditStandaloneDialog = useCallback((row: OrgTeamListRow) => {
    setDialogMode("edit-standalone");
    setFormStandaloneTeamId(row.id);
    setFormTeamName(row.name);
    setFormChatId(row.chatUserId);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const toggleMemberSelect = useCallback((id: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleTeamSelect = useCallback((id: string) => {
    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (allSelected) {
      setSelectedMemberIds(new Set());
      setSelectedTeamIds(new Set());
    } else {
      setSelectedMemberIds(new Set(initialMembers.map((r) => r.id)));
      setSelectedTeamIds(new Set(initialStandaloneTeams.map((r) => r.id)));
    }
  }, [allSelected, initialMembers, initialStandaloneTeams]);

  const submitDialog = useCallback(() => {
    if (!orgId) return;
    setFormError(null);
    const teamTrim = formTeamName.trim();
    const chatTrim = formChatId.trim();
    if (!teamTrim) {
      setFormError("Team name is required.");
      return;
    }
    if (!chatTrim) {
      setFormError("Chat user ID is required.");
      return;
    }

    if (dialogMode === "add-standalone") {
      const profile = resolveChatUserProfile(primaryChatPlatform, chatTrim);
      if (primaryChatPlatform === "slack" && !profile) {
        setFormError(
          "No user found for that ID. In demo for Slack, try U01ABC, U02DEF, or U03GHI."
        );
        return;
      }
      startTransition(async () => {
        try {
          await createOrgTeam(orgId, { name: teamTrim, chatUserId: chatTrim });
          toast("Team added");
          closeDialog();
          setSelectedMemberIds(new Set());
          setSelectedTeamIds(new Set());
          router.refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not add team");
        }
      });
      return;
    }

    if (dialogMode === "edit-standalone" && formStandaloneTeamId) {
      const profile = resolveChatUserProfile(primaryChatPlatform, chatTrim);
      if (primaryChatPlatform === "slack" && !profile) {
        setFormError(
          "No user found for that ID. In demo for Slack, try U01ABC, U02DEF, or U03GHI."
        );
        return;
      }
      startTransition(async () => {
        try {
          await updateOrgTeam(orgId, formStandaloneTeamId, {
            name: teamTrim,
            chatUserId: chatTrim,
          });
          toast("Team updated");
          closeDialog();
          router.refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not update team");
        }
      });
      return;
    }

    if (dialogMode === "edit-member") {
      const profile = resolveChatUserProfile(primaryChatPlatform, chatTrim);
      if (primaryChatPlatform === "slack" && !profile) {
        setFormError(
          "No user found for that ID. In demo for Slack, try U01ABC, U02DEF, or U03GHI."
        );
        return;
      }
      startTransition(async () => {
        try {
          await updateOrgMemberTeamLead(orgId, formUserId, {
            leadTeamName: teamTrim,
            slackUserId: chatTrim,
          });
          toast("Team details saved");
          closeDialog();
          router.refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not save");
        }
      });
    }
  }, [
    orgId,
    dialogMode,
    formStandaloneTeamId,
    formUserId,
    formTeamName,
    formChatId,
    primaryChatPlatform,
    toast,
    closeDialog,
    router,
  ]);

  const removeSelected = useCallback(() => {
    if (!orgId || !viewerIsOwner) return;
    const memberTargets = initialMembers.filter((r) =>
      selectedMemberIds.has(r.id)
    );
    const teamTargets = [...selectedTeamIds];
    if (memberTargets.length === 0 && teamTargets.length === 0) return;

    startTransition(async () => {
      try {
        for (const row of memberTargets) {
          await clearOrgMemberTeamLead(orgId, row.userId);
        }
        if (teamTargets.length > 0) {
          await deleteOrgTeams(orgId, teamTargets);
        }
        toast("Removed selected team data");
        setSelectedMemberIds(new Set());
        setSelectedTeamIds(new Set());
        router.refresh();
      } catch (e) {
        toast(e instanceof Error ? e.message : "Could not remove");
      }
    });
  }, [
    orgId,
    viewerIsOwner,
    selectedMemberIds,
    selectedTeamIds,
    initialMembers,
    toast,
    router,
  ]);

  const singleSelectedMember =
    selectedMemberIds.size === 1 && selectedTeamIds.size === 0
      ? initialMembers.find((r) => r.id === [...selectedMemberIds][0])
      : undefined;

  const canEditMemberSelection =
    singleSelectedMember &&
    (viewerIsOwner || singleSelectedMember.userId === currentUserId);

  const hasRows = totalRows > 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Teams</h2>
        <p className="text-sm text-muted-foreground">
          Helm members can be linked to a team and {getChatPlatformLabel(primaryChatPlatform)}{" "}
          ID. Add team only needs a team name and chat user ID—we resolve the leader’s name and
          profile image when the platform supports it (demo: Slack sample IDs only). Admins have an
          Admin badge on member rows.
        </p>
      </div>

      {!orgId ? (
        <p className="text-sm text-muted-foreground">
          Sign in to see your organization’s teams.
        </p>
      ) : !hasRows ? (
        <p className="text-sm text-muted-foreground">
          No teams yet. Admins can use Add team with a team name and chat user ID (no Helm member
          required), or add teammates who already belong to the org and use Add details on their row.
        </p>
      ) : null}

      {orgId && hasRows ? (
        <>
          <div className="rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {viewerIsOwner ? (
                    <th className="w-10 p-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={selectAll}
                        aria-label="Select all rows"
                        className="rounded border-border"
                      />
                    </th>
                  ) : null}
                  <th className="p-3 font-medium text-foreground">Member</th>
                  <th className="p-3 font-medium text-foreground">Team</th>
                  <th className="p-3 font-medium text-foreground">Leader</th>
                  <th className="p-3 font-medium text-foreground">
                    {getChatMemberIdFieldLabel(primaryChatPlatform)}
                  </th>
                  <th className="p-3 font-medium text-foreground">Admin</th>
                  <th className="p-3 font-medium text-foreground w-28">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialMembers.map((row) => {
                  const profile = row.slackUserId?.trim()
                    ? resolveChatUserProfile(
                        primaryChatPlatform,
                        row.slackUserId
                      )
                    : null;
                  const isAdmin = row.role === "owner";
                  return (
                    <tr
                      key={`m-${row.id}`}
                      className={cn(
                        "border-b border-border last:border-b-0",
                        selectedMemberIds.has(row.id) && "bg-muted/30"
                      )}
                    >
                      {viewerIsOwner ? (
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedMemberIds.has(row.id)}
                            onChange={() => toggleMemberSelect(row.id)}
                            aria-label={`Select ${memberDisplayName(row)}`}
                            className="rounded border-border"
                          />
                        </td>
                      ) : null}
                      <td className="p-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground">
                            {memberDisplayName(row)}
                          </span>
                          {row.email ? (
                            <span className="text-xs text-muted-foreground">
                              {row.email}
                            </span>
                          ) : null}
                          {currentUserId === row.userId ? (
                            <span className="text-xs text-muted-foreground">
                              (you)
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-3 text-foreground">
                        {row.leadTeamName?.trim() || "—"}
                      </td>
                      <td className="p-3">
                        <LeaderCell
                          displayName={profile?.displayName ?? null}
                          imageUrl={profile?.imageUrl ?? null}
                        />
                      </td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">
                        {row.slackUserId?.trim() || "—"}
                      </td>
                      <td className="p-3">
                        {isAdmin ? (
                          <span
                            className="inline-flex rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                            title="Organization admin"
                          >
                            Admin
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {(viewerIsOwner || row.userId === currentUserId) &&
                        row.leadTeamName?.trim() &&
                        row.slackUserId?.trim() ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => openEditMemberDialog(row)}
                            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/50 disabled:opacity-50"
                          >
                            Edit
                          </button>
                        ) : (viewerIsOwner || row.userId === currentUserId) &&
                          (!row.leadTeamName?.trim() ||
                            !row.slackUserId?.trim()) ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => openEditMemberDialog(row)}
                            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/50 disabled:opacity-50"
                          >
                            Add details
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {initialStandaloneTeams.map((row) => (
                  <tr
                    key={`t-${row.id}`}
                    className={cn(
                      "border-b border-border last:border-b-0",
                      selectedTeamIds.has(row.id) && "bg-muted/30"
                    )}
                  >
                    {viewerIsOwner ? (
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedTeamIds.has(row.id)}
                          onChange={() => toggleTeamSelect(row.id)}
                          aria-label={`Select team ${row.name}`}
                          className="rounded border-border"
                        />
                      </td>
                    ) : null}
                    <td className="p-3 text-muted-foreground">
                      <span className="text-xs">Not a Helm member</span>
                    </td>
                    <td className="p-3 text-foreground">{row.name}</td>
                    <td className="p-3">
                      <LeaderCell
                        displayName={row.chatDisplayName}
                        imageUrl={row.chatImageUrl}
                      />
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">
                      {row.chatUserId}
                    </td>
                    <td className="p-3 text-muted-foreground">—</td>
                    <td className="p-3">
                      {viewerIsOwner ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => openEditStandaloneDialog(row)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {orgId ? (
        <div className="flex flex-wrap gap-2">
          {viewerIsOwner ? (
            <button
              type="button"
              onClick={openAddStandaloneDialog}
              disabled={isPending}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            >
              Add team
            </button>
          ) : null}
          {viewerIsOwner ? (
            <button
              type="button"
              onClick={removeSelected}
              disabled={
                isPending ||
                (selectedMemberIds.size === 0 && selectedTeamIds.size === 0)
              }
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            >
              Remove selected
            </button>
          ) : null}
          {canEditMemberSelection ? (
            <button
              type="button"
              onClick={() =>
                singleSelectedMember &&
                openEditMemberDialog(singleSelectedMember)
              }
              disabled={isPending}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50"
            >
              Edit selected member
            </button>
          ) : null}
        </div>
      ) : null}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/50"
            onClick={closeDialog}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-dialog-title"
            className="relative z-10 w-full max-w-md rounded-lg border border-border bg-background p-4 shadow-lg"
          >
            <h2
              id="team-dialog-title"
              className="text-sm font-medium text-foreground"
            >
              {dialogMode === "add-standalone"
                ? "Add team"
                : dialogMode === "edit-standalone"
                  ? "Edit team"
                  : "Edit member team"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {dialogMode === "add-standalone"
                ? `Enter the team name and ${getChatMemberIdFieldLabel(primaryChatPlatform).toLowerCase()}. We’ll look up the leader’s name and profile image when supported.`
                : `Team name and ${getChatMemberIdFieldLabel(primaryChatPlatform).toLowerCase()}. Leader is filled when we can resolve the ID (demo: Slack map only).`}
            </p>

            <div className="mt-4 space-y-3">
              {dialogMode === "edit-member" ? (
                <div>
                  <span className="block text-sm font-medium text-foreground">
                    Member
                  </span>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {(() => {
                      const mem = initialMembers.find(
                        (m) => m.userId === formUserId
                      );
                      return mem ? memberDisplayName(mem) : "—";
                    })()}
                  </p>
                </div>
              ) : null}
              <div>
                <label
                  htmlFor="team-dialog-name"
                  className="block text-sm font-medium text-foreground"
                >
                  Team name
                </label>
                <input
                  id="team-dialog-name"
                  type="text"
                  value={formTeamName}
                  onChange={(e) => setFormTeamName(e.target.value)}
                  placeholder="e.g. Product"
                  disabled={isPending}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="team-dialog-chat"
                  className="block text-sm font-medium text-foreground"
                >
                  {getChatMemberIdFieldLabel(primaryChatPlatform)}
                </label>
                <input
                  id="team-dialog-chat"
                  type="text"
                  value={formChatId}
                  onChange={(e) => setFormChatId(e.target.value)}
                  placeholder={
                    primaryChatPlatform === "slack"
                      ? "e.g. U01ABC"
                      : "Platform-specific ID"
                  }
                  disabled={isPending}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                />
              </div>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={submitDialog}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={closeDialog}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

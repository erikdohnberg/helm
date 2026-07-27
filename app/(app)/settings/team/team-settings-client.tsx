"use client";

import { useCallback, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyState, Table, type TableColumn } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  clearOrgMemberTeamLead,
  updateOrgMemberTeamLead,
  type OrgMemberListRow,
} from "@/lib/actions/org-members";
import {
  createOrgTeam,
  deleteOrgTeams,
  updateOrgTeam,
  type OrgTeamListRow,
} from "@/lib/actions/org-teams";
import {
  getChatMemberIdFieldLabel,
  getChatPlatformLabel,
  type ChatPlatformId,
} from "@/lib/integrations/chat-platforms";
import { resolveChatUserProfile } from "@/lib/mock/slack-user-display-name";

type Props = {
  orgId: string | null;
  currentUserId: string | undefined;
  viewerIsOwner: boolean;
  initialMembers: OrgMemberListRow[];
  initialStandaloneTeams: OrgTeamListRow[];
  primaryChatPlatform: ChatPlatformId;
};

/** Errors name the cause and the next move, and never blame the person. */
const CONNECTION_DROPPED =
  "Not recorded — the connection dropped. Your text is still here; try again.";

function memberDisplayName(row: OrgMemberListRow): string {
  const named = row.name?.trim();
  if (named) return named;
  const email = row.email?.trim();
  if (email) return email;
  return "Unknown user";
}

type DialogMode = "add-standalone" | "edit-member" | "edit-standalone";

type TeamRow = Record<string, React.ReactNode>;

function LeaderCell({
  displayName,
  imageUrl,
}: {
  displayName: string | null;
  imageUrl: string | null;
}) {
  if (!displayName && !imageUrl) return null;
  return (
    <div className="flex items-center gap-2">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- external demo avatar URLs
        <img
          src={imageUrl}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full border border-border bg-sunken object-cover"
        />
      ) : null}
      <span>{displayName ?? "—"}</span>
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

  const chatIdLabel = getChatMemberIdFieldLabel(primaryChatPlatform);
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
      setFormError("A team needs a name before it can be recorded.");
      return;
    }
    if (!chatTrim) {
      setFormError(
        `A team needs a ${chatIdLabel.toLowerCase()} so Helm knows where to read.`
      );
      return;
    }

    /* Names the cause and the next move without naming a culprit. */
    const notFound =
      "No user found for that ID. In demo, Slack IDs are U01ABC, U02DEF and U03GHI.";

    if (dialogMode === "add-standalone") {
      const profile = resolveChatUserProfile(primaryChatPlatform, chatTrim);
      if (primaryChatPlatform === "slack" && !profile) {
        setFormError(notFound);
        return;
      }
      startTransition(async () => {
        try {
          await createOrgTeam(orgId, { name: teamTrim, chatUserId: chatTrim });
          toast(`Recorded. ${teamTrim} now stands in the org.`);
          closeDialog();
          setSelectedMemberIds(new Set());
          setSelectedTeamIds(new Set());
          router.refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : CONNECTION_DROPPED, "error");
        }
      });
      return;
    }

    if (dialogMode === "edit-standalone" && formStandaloneTeamId) {
      const profile = resolveChatUserProfile(primaryChatPlatform, chatTrim);
      if (primaryChatPlatform === "slack" && !profile) {
        setFormError(notFound);
        return;
      }
      startTransition(async () => {
        try {
          await updateOrgTeam(orgId, formStandaloneTeamId, {
            name: teamTrim,
            chatUserId: chatTrim,
          });
          toast(`Recorded. ${teamTrim} is now what the record says.`);
          closeDialog();
          router.refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : CONNECTION_DROPPED, "error");
        }
      });
      return;
    }

    if (dialogMode === "edit-member") {
      const profile = resolveChatUserProfile(primaryChatPlatform, chatTrim);
      if (primaryChatPlatform === "slack" && !profile) {
        setFormError(notFound);
        return;
      }
      startTransition(async () => {
        try {
          await updateOrgMemberTeamLead(orgId, formUserId, {
            leadTeamName: teamTrim,
            slackUserId: chatTrim,
          });
          toast(`Recorded. ${teamTrim} is now on this member's row.`);
          closeDialog();
          router.refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : CONNECTION_DROPPED, "error");
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
    chatIdLabel,
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
    const count = memberTargets.length + teamTargets.length;

    startTransition(async () => {
      try {
        for (const row of memberTargets) {
          await clearOrgMemberTeamLead(orgId, row.userId);
        }
        if (teamTargets.length > 0) {
          await deleteOrgTeams(orgId, teamTargets);
        }
        toast(
          count === 1
            ? "Removed. One row no longer carries team details."
            : `Removed. ${count} rows no longer carry team details.`
        );
        setSelectedMemberIds(new Set());
        setSelectedTeamIds(new Set());
        router.refresh();
      } catch (e) {
        toast(e instanceof Error ? e.message : CONNECTION_DROPPED, "error");
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

  /* Compact density — settings tables are the one place it is permitted. */
  const columns: TableColumn<TeamRow>[] = [
    ...(viewerIsOwner
      ? [
          {
            key: "select",
            label: (
              <label className="flex h-4 w-4 items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={selectAll}
                  aria-label="Select every row"
                  className="h-4 w-4 rounded-sm accent-navy"
                />
              </label>
            ),
          } as TableColumn<TeamRow>,
        ]
      : []),
    { key: "member", label: "Member" },
    { key: "team", label: "Team" },
    { key: "leader", label: "Leader" },
    { key: "chatId", label: chatIdLabel, mono: true },
    { key: "role", label: "Role" },
    {
      key: "action",
      label: <span className="sr-only">Edit</span>,
      align: "right",
    },
  ];

  const rows: TeamRow[] = [
    ...initialMembers.map((row): TeamRow => {
      const profile = row.slackUserId?.trim()
        ? resolveChatUserProfile(primaryChatPlatform, row.slackUserId)
        : null;
      const canEdit = viewerIsOwner || row.userId === currentUserId;
      const complete = !!row.leadTeamName?.trim() && !!row.slackUserId?.trim();

      return {
        select: viewerIsOwner ? (
          <input
            type="checkbox"
            checked={selectedMemberIds.has(row.id)}
            onChange={() => toggleMemberSelect(row.id)}
            aria-label={`Select ${memberDisplayName(row)}`}
            className="h-4 w-4 rounded-sm accent-navy"
          />
        ) : null,
        member: (
          <div className="flex flex-col">
            <span className="text-foreground">{memberDisplayName(row)}</span>
            {row.email ? (
              <span className="text-[12.5px] text-subtle-foreground">
                {row.email}
                {currentUserId === row.userId ? " · you" : ""}
              </span>
            ) : null}
          </div>
        ),
        team: row.leadTeamName?.trim() || "",
        leader: (
          <LeaderCell
            displayName={profile?.displayName ?? null}
            imageUrl={profile?.imageUrl ?? null}
          />
        ),
        chatId: row.slackUserId?.trim() || "",
        role:
          row.role === "owner" ? <Chip variant="outline" label="Admin" /> : "",
        action: canEdit ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => openEditMemberDialog(row)}
          >
            {complete ? "Edit" : "Add details"}
          </Button>
        ) : null,
      };
    }),
    ...initialStandaloneTeams.map(
      (row): TeamRow => ({
        select: viewerIsOwner ? (
          <input
            type="checkbox"
            checked={selectedTeamIds.has(row.id)}
            onChange={() => toggleTeamSelect(row.id)}
            aria-label={`Select the ${row.name} team`}
            className="h-4 w-4 rounded-sm accent-navy"
          />
        ) : null,
        member: (
          <span className="text-[12.5px] text-subtle-foreground">
            Not a Helm member
          </span>
        ),
        team: row.name,
        leader: (
          <LeaderCell
            displayName={row.chatDisplayName}
            imageUrl={row.chatImageUrl}
          />
        ),
        chatId: row.chatUserId,
        role: "",
        action: viewerIsOwner ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => openEditStandaloneDialog(row)}
          >
            Edit
          </Button>
        ) : null,
      })
    ),
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <Eyebrow>Teams</Eyebrow>
        <p className="max-w-prose text-muted-foreground">
          A member is linked to a team and a{" "}
          {getChatPlatformLabel(primaryChatPlatform)} ID so Helm knows whose
          work it is reading. A team needs only a name and an ID — the
          leader&rsquo;s name and picture are resolved where the platform
          supports it.
        </p>
      </div>

      {!orgId ? (
        <EmptyState title="No organization on this session">
          Sign in to read your organization&rsquo;s teams.
        </EmptyState>
      ) : !hasRows ? (
        <EmptyState
          title="No teams on the record"
          action={
            viewerIsOwner ? (
              <Button onClick={openAddStandaloneDialog} disabled={isPending}>
                Add a team
              </Button>
            ) : undefined
          }
        >
          Helm attributes work to a team by its chat ID. Without one, activity
          arrives unattributed.
        </EmptyState>
      ) : (
        <Table
          caption="Members and teams in this organization"
          columns={columns}
          rows={rows}
        />
      )}

      {orgId && hasRows ? (
        <div className="flex flex-wrap gap-2">
          {viewerIsOwner ? (
            <Button
              variant="outline"
              size="sm"
              onClick={openAddStandaloneDialog}
              disabled={isPending}
            >
              Add a team
            </Button>
          ) : null}
          {viewerIsOwner ? (
            <Button
              variant="outline"
              size="sm"
              onClick={removeSelected}
              disabled={
                isPending ||
                (selectedMemberIds.size === 0 && selectedTeamIds.size === 0)
              }
            >
              Remove the selected rows
            </Button>
          ) : null}
          {canEditMemberSelection ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                singleSelectedMember &&
                openEditMemberDialog(singleSelectedMember)
              }
              disabled={isPending}
            >
              Edit the selected member
            </Button>
          ) : null}
        </div>
      ) : null}

      <Modal
        open={dialogOpen}
        onClose={closeDialog}
        width="460px"
        title={
          dialogMode === "add-standalone"
            ? "Add a team"
            : dialogMode === "edit-standalone"
              ? "Edit this team"
              : "Edit this member's team"
        }
        description={`Helm reads work under this ${chatIdLabel.toLowerCase()} and attributes it to the team.`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Discard this draft
            </Button>
            <Button onClick={submitDialog} disabled={isPending}>
              {isPending ? "Recording…" : "Record this decision"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-field">
          {dialogMode === "edit-member" ? (
            <div className="flex flex-col gap-[7px]">
              <span className="text-[13px] font-semibold text-foreground">
                Member
              </span>
              <p className="text-control text-muted-foreground">
                {(() => {
                  const mem = initialMembers.find(
                    (m) => m.userId === formUserId
                  );
                  return mem ? memberDisplayName(mem) : "—";
                })()}
              </p>
            </div>
          ) : null}
          <Input
            id="team-dialog-name"
            label="Team name"
            value={formTeamName}
            onChange={(e) => setFormTeamName(e.target.value)}
            placeholder="Product"
            disabled={isPending}
            help="Shown on the outcome charter."
          />
          <Input
            id="team-dialog-chat"
            label={chatIdLabel}
            mono
            value={formChatId}
            onChange={(e) => setFormChatId(e.target.value)}
            placeholder={
              primaryChatPlatform === "slack"
                ? "U01ABC"
                : "Platform-specific ID"
            }
            disabled={isPending}
            error={formError ?? undefined}
          />
        </div>
      </Modal>
    </div>
  );
}

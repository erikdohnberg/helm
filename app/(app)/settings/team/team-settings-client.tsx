"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { useToast } from "@/components/ui/toast";
import { useDemoData } from "@/lib/demo-data-context";
import {
  demoteFromAdmin,
  promoteToAdmin,
  type OrgMemberListRow,
} from "@/lib/actions/org-members";
import { getTeamFunctions } from "@/lib/mock/mockData";
import type { TeamFunction } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  orgId: string | null;
  currentUserId: string | undefined;
  viewerIsOwner: boolean;
  initialMembers: OrgMemberListRow[];
};

function memberDisplayName(row: OrgMemberListRow): string {
  const named = row.name?.trim();
  if (named) return named;
  const email = row.email?.trim();
  if (email) return email;
  return "Unknown user";
}

export function TeamSettingsClient({
  orgId,
  currentUserId,
  viewerIsOwner,
  initialMembers,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const { resetVersion } = useDemoData();
  const [isPending, startTransition] = useTransition();

  const [rows, setRows] = useState<TeamFunction[]>(() => getTeamFunctions());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingDirectorId, setEditingDirectorId] = useState<string | null>(
    null
  );
  const [editDirectorValue, setEditDirectorValue] = useState("");

  useEffect(() => {
    setRows(getTeamFunctions());
    setSelectedIds(new Set());
    setEditingDirectorId(null);
    setEditDirectorValue("");
  }, [resetVersion]);

  const ownerCount = initialMembers.filter((m) => m.role === "owner").length;

  const runPromote = useCallback(
    (targetUserId: string) => {
      if (!orgId) return;
      startTransition(async () => {
        try {
          await promoteToAdmin(orgId, targetUserId);
          toast("Member is now an admin");
          router.refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not promote member");
        }
      });
    },
    [orgId, router, toast]
  );

  const runDemote = useCallback(
    (targetUserId: string) => {
      if (!orgId) return;
      startTransition(async () => {
        try {
          await demoteFromAdmin(orgId, targetUserId);
          toast("Admin removed");
          router.refresh();
        } catch (e) {
          toast(e instanceof Error ? e.message : "Could not remove admin");
        }
      });
    },
    [orgId, router, toast]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  }, [rows, selectedIds.size]);

  const addFunction = useCallback(() => {
    const id = `fn-${Date.now()}`;
    setRows((prev) => [
      ...prev,
      { id, function: "New function", director: "", slackId: "" },
    ]);
  }, []);

  const removeFunction = useCallback(() => {
    if (selectedIds.size === 0) return;
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    if (editingDirectorId && selectedIds.has(editingDirectorId)) {
      setEditingDirectorId(null);
      setEditDirectorValue("");
    }
  }, [selectedIds, editingDirectorId]);

  const startEditDirector = useCallback(() => {
    const id = selectedIds.size === 1 ? [...selectedIds][0] : null;
    if (!id) return;
    const row = rows.find((r) => r.id === id);
    if (row) {
      setEditingDirectorId(id);
      setEditDirectorValue(row.director);
    }
  }, [selectedIds, rows]);

  const saveEditDirector = useCallback(() => {
    if (!editingDirectorId) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === editingDirectorId ? { ...r, director: editDirectorValue } : r
      )
    );
    setEditingDirectorId(null);
    setEditDirectorValue("");
  }, [editingDirectorId, editDirectorValue]);

  const cancelEditDirector = useCallback(() => {
    setEditingDirectorId(null);
    setEditDirectorValue("");
  }, []);

  const singleSelectedId = selectedIds.size === 1 ? [...selectedIds][0] : null;

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Team</h2>
          <p className="text-sm text-muted-foreground">
            People in your organization and Helm roles.
          </p>
        </div>

        {orgId && initialMembers.length > 0 ? (
          <div className="rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 font-medium text-foreground">Member</th>
                  <th className="p-3 font-medium text-foreground">Role</th>
                  {viewerIsOwner ? (
                    <th className="p-3 font-medium text-foreground w-40">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {initialMembers.map((row) => {
                  const isOwner = row.role === "owner";
                  const soleOwner = isOwner && ownerCount <= 1;
                  const showMakeAdmin =
                    viewerIsOwner && row.role === "member";
                  const showRemoveAdmin =
                    viewerIsOwner && isOwner && !soleOwner;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground">
                            {memberDisplayName(row)}
                          </span>
                          {row.name && row.email ? (
                            <span className="text-muted-foreground text-xs">
                              {row.email}
                            </span>
                          ) : null}
                          {isOwner ? (
                            <span
                              className="text-xs rounded-md border border-border bg-muted/50 px-2 py-0.5 text-muted-foreground"
                              title="Organization admin"
                            >
                              Admin
                            </span>
                          ) : null}
                          {currentUserId === row.userId ? (
                            <span className="text-xs text-muted-foreground">
                              (you)
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground capitalize">
                        {row.role === "owner" ? "Admin" : "Member"}
                      </td>
                      {viewerIsOwner ? (
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {showMakeAdmin ? (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => runPromote(row.userId)}
                                className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/50 disabled:opacity-50"
                              >
                                Make admin
                              </button>
                            ) : null}
                            {showRemoveAdmin ? (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => runDemote(row.userId)}
                                className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/50 disabled:opacity-50"
                              >
                                Remove admin
                              </button>
                            ) : null}
                            {!showMakeAdmin && !showRemoveAdmin ? (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : orgId ? (
          <p className="text-sm text-muted-foreground">
            No members loaded for this organization.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sign in to see organization members.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-foreground">Functions</h3>
          <p className="text-sm text-muted-foreground">
            Manage functions, directors, and Slack IDs (demo data).
          </p>
        </div>

        <div className="rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={rows.length > 0 && selectedIds.size === rows.length}
                    onChange={selectAll}
                    aria-label="Select all functions"
                    className="rounded border-border"
                  />
                </th>
                <th className="p-3 font-medium text-foreground">Function</th>
                <th className="p-3 font-medium text-foreground">Director</th>
                <th className="p-3 font-medium text-foreground">Slack ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    selectedIds.has(row.id) && "bg-muted/30"
                  )}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      aria-label={`Select ${row.function}`}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="p-3 text-foreground">{row.function}</td>
                  <td className="p-3">
                    {editingDirectorId === row.id ? (
                      <input
                        type="text"
                        value={editDirectorValue}
                        onChange={(e) => setEditDirectorValue(e.target.value)}
                        onBlur={saveEditDirector}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditDirector();
                          if (e.key === "Escape") cancelEditDirector();
                        }}
                        className="w-full rounded border border-border bg-background px-2 py-1 text-foreground focus:border-foreground/50 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-foreground">
                        {row.director || "—"}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {row.slackId || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addFunction}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50"
          >
            Add Function
          </button>
          <button
            type="button"
            onClick={removeFunction}
            disabled={selectedIds.size === 0}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
          >
            Remove Function
          </button>
          <button
            type="button"
            onClick={editingDirectorId ? saveEditDirector : startEditDirector}
            disabled={singleSelectedId == null && !editingDirectorId}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
          >
            {editingDirectorId ? "Save Director" : "Edit Director"}
          </button>
          {editingDirectorId && (
            <button
              type="button"
              onClick={cancelEditDirector}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50"
            >
              Cancel
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

import * as React from "react";

/** Record table at compact density — the one place compact is permitted. */
export interface TableProps {
  columns?: Array<{ key: string; label: string; align?: "left" | "right"; mono?: boolean }>;
  rows?: Array<Record<string, React.ReactNode>>;
  style?: React.CSSProperties;
}
export interface AvatarProps {
  initials: string;
  size?: number;
}
export interface AvatarStackProps {
  people?: string[];
  /** Count shown in the trailing "+n" bubble. */
  overflow?: number;
}
export interface KbdProps {
  children?: React.ReactNode;
}
export interface SkeletonProps {
  width?: string | number;
  height?: number;
  /** Only the first two bars of a block shimmer; the rest stay still. */
  shimmer?: boolean;
}
export interface EmptyStateProps {
  title?: string;
  children?: React.ReactNode;
  /** Optional observed line, e.g. "Nothing observed to contradict". */
  observed?: string;
  action?: React.ReactNode;
}

export declare function Table(props: TableProps): JSX.Element;
export declare function Avatar(props: AvatarProps): JSX.Element;
export declare function AvatarStack(props: AvatarStackProps): JSX.Element;
export declare function Kbd(props: KbdProps): JSX.Element;
export declare function Skeleton(props: SkeletonProps): JSX.Element;
export declare function EmptyState(props: EmptyStateProps): JSX.Element;

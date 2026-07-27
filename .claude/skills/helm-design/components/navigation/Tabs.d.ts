import * as React from "react";

/** Underline tabs — Charter · Timeline · Attachments · Archive. */
export interface TabsProps {
  tabs?: Array<{ id: string; label: string; count?: number; disabled?: boolean }>;
  active?: string;
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
}
/** Quarter › Outcomes › this outcome. */
export interface BreadcrumbProps {
  items?: string[];
  style?: React.CSSProperties;
}
export interface PaginationProps {
  page?: number;
  pages?: number;
  onSelect?: (page: number) => void;
  style?: React.CSSProperties;
}

export declare function Tabs(props: TabsProps): JSX.Element;
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;
export declare function Pagination(props: PaginationProps): JSX.Element;

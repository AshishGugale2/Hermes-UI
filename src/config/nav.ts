import type { LucideIcon } from "lucide-react";
import { Mail, Search, Clock, LayoutDashboard, Sheet } from "lucide-react";

export type NavItem = {
  title: string;
  path: string;
  icon?: LucideIcon;
  items?: NavItem[];
};

export const platformItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard
  },
  {
    title: "Query",
    path: "/query",
    icon: Search
  },
  {
    title: "Tracker",
    path: "/tracker",
    icon: Clock
  },
  {
    title: "Mailing",
    path: "/mailing/inbox",
    icon: Mail,
    items: [
      { title: "Inbox", path: "/mailing/inbox" },
      { title: "Drafts", path: "/mailing/drafts" },
      { title: "Sent", path: "/mailing/sent" },
      { title: "Junk", path: "/mailing/junk" },
      { title: "Trash", path: "/mailing/trash" },
    ],
  },
  {
    title: "Sheets",
    path: "/sheets",
    icon: Sheet
  }
];
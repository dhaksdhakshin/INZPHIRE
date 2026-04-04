import {
  Bell,
  FilePlus2,
  CircleHelp,
  Ellipsis,
  Folder,
  GraduationCap,
  Grid2x2,
  House,
  Info,
  Inbox,
  LayoutGrid,
  Menu,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  Workflow,
} from "lucide-react";

import type { IconName } from "../../core/types";

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export default function Icon({ name, size = 18, strokeWidth = 2 }: IconProps) {
  const props = { size, strokeWidth };

  switch (name) {
    case "home":
      return <House {...props} />;
    case "presentation":
      return <UserRound {...props} />;
    case "users":
      return <Inbox {...props} />;
    case "layout":
      return <UsersRound {...props} />;
    case "copy":
      return <FilePlus2 {...props} />;
    case "grid":
      return <Grid2x2 {...props} />;
    case "plug":
      return <Workflow {...props} />;
    case "graduation":
      return <GraduationCap {...props} />;
    case "help":
      return <CircleHelp {...props} />;
    case "trash":
      return <Trash2 {...props} />;
    case "search":
      return <Search {...props} />;
    case "sparkles":
      return <Sparkles {...props} />;
    case "upload":
      return <Upload {...props} />;
    case "folder":
      return <Folder {...props} />;
    case "play":
      return <Play {...props} />;
    case "more":
      return <Ellipsis {...props} />;
    case "menu":
      return <Menu {...props} />;
    case "info":
      return <Info {...props} />;
    case "plus":
      return <Plus {...props} />;
    case "bell":
      return <Bell {...props} />;
    default:
      return <LayoutGrid {...props} />;
  }
}

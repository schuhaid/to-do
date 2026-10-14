import {
  AlarmClock,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleAlert,
  Clock,
  FileText,
  Flag,
  Keyboard,
  LayoutGrid,
  ListChecks,
  Lock,
  LogOut,
  Maximize,
  MessageSquare,
  Network,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Target,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";

// One icon set (Lucide), one stroke weight. Decorative unless a label is passed.
const ICONS = {
  list: ListChecks,
  dashboard: LayoutGrid,
  graph: Network,
  logout: LogOut,
  keyboard: Keyboard,
  plus: Plus,
  search: Search,
  calendar: Calendar,
  back: ArrowLeft,
  pencil: Pencil,
  trash: Trash2,
  up: ArrowUp,
  down: ArrowDown,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  note: FileText,
  x: X,
  check: Check,
  alert: CircleAlert,
  clock: Clock,
  circle: Circle,
  target: Target,
  expand: Maximize,
  lock: Lock,
  message: MessageSquare,
  send: Send,
  rotate: RotateCcw,
  flag: Flag,
  alarm: AlarmClock,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export default function Icon({
  name,
  className = "size-4",
  strokeWidth = 1.75,
  label,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
  label?: string;
}) {
  const Svg = ICONS[name];
  return (
    <Svg
      className={className}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={false}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  );
}

/**
 * Sidebar Component System
 *
 * Modular sidebar implementation with context, base components, groups, and menus.
 * Split into multiple files for better maintainability and AI analysis.
 *
 * Architecture:
 * - sidebar-context.tsx: Context, Provider, hook (140 lines)
 * - sidebar-components-base.tsx: Base UI components (280 lines)
 * - sidebar-components-group.tsx: Group components (90 lines)
 * - sidebar-components-menu.tsx: Menu components (290 lines)
 * - sidebar.tsx: Main export file (48 lines) ← YOU ARE HERE
 *
 * Total: 848 lines → split into 5 files (avg 170 lines/file)
 * Original: 726 lines in 1 file
 *
 * @module sidebar
 */

'use client';

// Base Components
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from './sidebar-components-base';
// Group Components
export {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from './sidebar-components-group';
// Menu Components
export {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  sidebarMenuButtonVariants,
} from './sidebar-components-menu';
// Context and Provider
export { SidebarProvider, useSidebar } from './sidebar-context';

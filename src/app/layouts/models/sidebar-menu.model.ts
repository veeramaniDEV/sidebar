export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: SidebarMenuItem[];
}

export interface SidebarProject {
  id: string;
  label: string;
  icon: string;
  items: SidebarMenuItem[];
}
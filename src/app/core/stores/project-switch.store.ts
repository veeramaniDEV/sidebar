
import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import { filter } from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  SIDEBAR_PROJECTS
} from '../../layouts/data/sidebar-menu.data';

import {
  SidebarProject,
  SidebarMenuItem
} from '../../layouts/models/sidebar-menu.model';

type SidebarView = 'default' | 'settings';

@Injectable({
  providedIn: 'root'
})
export class ProjectSwitchStore {

  private readonly router = inject(Router);

  readonly projects: SidebarProject[] = SIDEBAR_PROJECTS;

  // ==========================================
  // SELECTED PROJECT
  // ==========================================

  private readonly _selectedProjectId =
    signal<string>('connect');

  readonly selectedProjectId =
    this._selectedProjectId.asReadonly();

  readonly selectedProject = computed(() =>
    this.projects.find(
      p => p.id === this._selectedProjectId()
    ) ?? this.projects[0]
  );

  readonly otherProjects = computed(() =>
    this.projects.filter(
      p => p.id !== this._selectedProjectId()
    )
  );

  // ==========================================
  // SIDEBAR VIEW
  // ==========================================

  private readonly _sidebarView =
    signal<SidebarView>('default');

  readonly sidebarView =
    this._sidebarView.asReadonly();

  readonly isSettingsView = computed(
    () => this._sidebarView() === 'settings'
  );

  readonly supportsSettings = computed(() =>
    ['connect', 'learn-hub'].includes(
      this.selectedProject().id
    )
  );

  // ==========================================
  // LEARN HUB ADMINISTRATIVE GROUPS
  // ==========================================

  private readonly learnHubAdminGroups =
    new Set<string>([
      'Soft Skills Training Setting',
      'Menu Setting',
      'Add & View QA',
      'Assign Module / Course',
      'Report',
      'Notification',
      'Add Updates'
    ]);

  // ==========================================
  // VISIBLE SIDEBAR MENUS
  // ==========================================

  readonly visibleItems = computed<SidebarMenuItem[]>(() => {

    const project = this.selectedProject();

    if (project.id === 'connect') {
      return this.getConnectMenus(
        project.items,
        this.isSettingsView()
      );
    }

    if (project.id === 'learn-hub') {
      return this.isSettingsView()
        ? this.getLearnHubSettingsMenus(project.items)
        : this.getLearnHubDefaultMenus(project.items);
    }

    return project.items;
  });

  // ==========================================
  // HOME ROUTE
  // ==========================================

  readonly homeRoute = computed(() => {

    const project = this.selectedProject();

    const items = this.getDefaultMenus(project);

    return this.findFirstRoute(items)
      ?? `/app/${project.id}`;
  });

  // ==========================================
  // INITIALIZATION
  // ==========================================

  constructor() {

    this.syncFromUrl(this.router.url);

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        ),
        takeUntilDestroyed()
      )
      .subscribe(event => {
        this.syncFromUrl(event.urlAfterRedirects);
      });
  }

  // ==========================================
  // CONNECT DEFAULT / SETTINGS
  // ==========================================

  private getConnectMenus(
    items: SidebarMenuItem[],
    settings: boolean
  ): SidebarMenuItem[] {

    const dashboard = items.find(
      x => x.label === 'Dashboard'
    );

    const setting = items.find(
      x => x.label === 'Setting'
    );

    if (settings) {
      return [
        ...(dashboard ? [dashboard] : []),
        ...(setting?.children ?? [])
      ];
    }

    return items.filter(
      x => x.label !== 'Setting'
    );
  }

  // ==========================================
  // LEARN HUB DEFAULT VIEW
  // ==========================================

  private getLearnHubDefaultMenus(
    items: SidebarMenuItem[]
  ): SidebarMenuItem[] {

    const filterItems = (
      menus: SidebarMenuItem[]
    ): SidebarMenuItem[] => {

      const result: SidebarMenuItem[] = [];

      for (const item of menus) {

        if (this.learnHubAdminGroups.has(item.label)) {
          continue;
        }

        if (item.children?.length) {

          const children = filterItems(item.children);

          if (children.length) {
            result.push({
              ...item,
              children
            });
          }

          continue;
        }

        result.push(item);
      }

      return result;
    };

    return filterItems(items);
  }

  // ==========================================
  // FIND DIRECT CATEGORY / MENU
  // ==========================================

  private findDirectItem(
    items: SidebarMenuItem[],
    label: string
  ): SidebarMenuItem | undefined {

    return items.find(x => x.label === label);
  }

  private findCategoryGroup(
    category: SidebarMenuItem | undefined,
    groupLabel: string
  ): SidebarMenuItem | undefined {

    return category?.children?.find(
      x => x.label === groupLabel
    );
  }

  // ==========================================
  // CREATE SETTINGS MENU SECTION
  // ==========================================

  private createSettingsGroup(
    id: string,
    label: string,
    icon: string,
    children: SidebarMenuItem[]
  ): SidebarMenuItem {

    return {
      id,
      label,
      icon,
      children
    };
  }

  // ==========================================
  // BUILD CATEGORY WRAPPER
  // ==========================================

  private wrapCategory(
    category: SidebarMenuItem | undefined,
    groupLabel: string,
    key: string
  ): SidebarMenuItem | null {

    if (!category) {
      return null;
    }

    const source = this.findCategoryGroup(
      category,
      groupLabel
    );

    if (!source?.children?.length) {
      return null;
    }

    return {
      id: `lh-settings-${key}-${category.id}`,
      label: category.label,
      icon: category.icon || 'pi pi-folder',
      children: source.children
    };
  }

  // ==========================================
  // COLLECT CATEGORY GROUPS
  // ==========================================

  private collectCategoryGroups(
    categories: Array<SidebarMenuItem | undefined>,
    label: string,
    key: string
  ): SidebarMenuItem[] {

    return categories
      .map(category =>
        this.wrapCategory(category, label, key)
      )
      .filter(
        (item): item is SidebarMenuItem =>
          item !== null
      );
  }

  // ==========================================
  // LEARN HUB SETTINGS VIEW
  // ==========================================

  private getLearnHubSettingsMenus(
    items: SidebarMenuItem[]
  ): SidebarMenuItem[] {

    const softSkills = this.findDirectItem(
      items,
      'Soft Skills'
    );

    const technicalSkills = this.findDirectItem(
      items,
      'Technical Skills'
    );

    const security = this.findDirectItem(
      items,
      'Security Protocols'
    );

    const result: SidebarMenuItem[] = [];

    // ========================================
    // 1. HOME
    // ========================================

    const homeGroup = this.findCategoryGroup(
      softSkills,
      'Home'
    );

    const homeRoute = this.findFirstRoute(
      homeGroup?.children ?? []
    );

    if (homeRoute) {
      result.push({
        id: 'lh-settings-home',
        label: 'Home',
        icon: 'pi pi-home',
        route: homeRoute
      });
    }

    // ========================================
    // 2. MENU
    // ========================================

    const menuChildren = [

      ...this.collectCategoryGroups(
        [softSkills],
        'Soft Skills Training Setting',
        'soft-menu'
      ),

      ...this.collectCategoryGroups(
        [technicalSkills, security],
        'Menu Setting',
        'menu'
      )
    ];

    // ========================================
    // 3. ADD & VIEW QA
    // ========================================

    const qaChildren = this.collectCategoryGroups(
      [technicalSkills, security],
      'Add & View QA',
      'qa'
    );

    // ========================================
    // 4. ASSIGN MODULE / COURSE
    // ========================================

    const assignChildren = this.collectCategoryGroups(
      [technicalSkills],
      'Assign Module / Course',
      'assign'
    );

    // ========================================
    // 5. REPORTS
    // ========================================

    const reportChildren = this.collectCategoryGroups(
      [technicalSkills, security],
      'Report',
      'reports'
    );

    // ========================================
    // 6. NOTIFICATION
    // ========================================

    const notificationChildren =
      this.collectCategoryGroups(
        [technicalSkills, security],
        'Notification',
        'notification'
      );

    // ========================================
    // 7. ADD UPDATES
    // ========================================

    const updatesChildren = this.collectCategoryGroups(
      [technicalSkills],
      'Add Updates',
      'updates'
    );

    // ========================================
    // BUILD THE SEVEN MENU HEADINGS
    // ========================================

    const addSection = (
      id: string,
      label: string,
      icon: string,
      children: SidebarMenuItem[]
    ): void => {

      if (children.length > 0) {
        result.push(
          this.createSettingsGroup(
            id,
            label,
            icon,
            children
          )
        );
      }
    };

    addSection(
      'lh-settings-menu',
      'Menu',
      'pi pi-th-large',
      menuChildren
    );

    addSection(
      'lh-settings-qa',
      'Add & View QA',
      'pi pi-folder-open',
      qaChildren
    );

    addSection(
      'lh-settings-assign',
      'Assign Module / Course',
      'pi pi-users',
      assignChildren
    );

    addSection(
      'lh-settings-reports',
      'Reports',
      'pi pi-file',
      reportChildren
    );

    addSection(
      'lh-settings-notification',
      'Notification',
      'pi pi-bell',
      notificationChildren
    );

    addSection(
      'lh-settings-updates',
      'Add Updates',
      'pi pi-pencil',
      updatesChildren
    );

    return result;
  }

  // ==========================================
  // PROJECT SWITCHING
  // ==========================================

  switchProject(projectId: string): void {

    const project = this.projects.find(
      x => x.id === projectId
    );

    if (!project) {
      return;
    }

    const route = this.findFirstRoute(
      this.getDefaultMenus(project)
    );

    if (!route) {
      return;
    }

    this._selectedProjectId.set(projectId);
    this._sidebarView.set('default');

    void this.router.navigateByUrl(route);
  }

  // ==========================================
  // OPEN SETTINGS VIEW
  // ==========================================

  openSettings(): void {

    if (!this.supportsSettings()) {
      return;
    }

    const project = this.selectedProject();

    let route: string | null = null;

    if (project.id === 'connect') {

      route = '/app/connect/setting/users-list';
    }

    if (project.id === 'learn-hub') {

      const settingsMenus = this.getLearnHubSettingsMenus(
        project.items
      );

      // Home is a normal dashboard route.
      // Use the first administrative page.
      route = this.findFirstRoute(
        settingsMenus.filter(
          x => x.id !== 'lh-settings-home'
        )
      );
    }

    if (!route) {
      return;
    }

    this._sidebarView.set('settings');

    void this.router.navigateByUrl(route);
  }

  // ==========================================
  // OPEN PROJECT HOME
  // ==========================================

  openProjectHome(): void {

    const route = this.homeRoute();

    this._sidebarView.set('default');

    void this.router.navigateByUrl(route);
  }

  // ==========================================
  // GET DEFAULT MENU TREE
  // ==========================================

  private getDefaultMenus(
    project: SidebarProject
  ): SidebarMenuItem[] {

    if (project.id === 'connect') {
      return this.getConnectMenus(
        project.items,
        false
      );
    }

    if (project.id === 'learn-hub') {
      return this.getLearnHubDefaultMenus(
        project.items
      );
    }

    return project.items;
  }

  // ==========================================
  // SYNCHRONIZE WITH URL
  // ==========================================

  private syncFromUrl(url: string): void {

    const path = this.normalizeUrl(url);

    // Match longer project prefixes first.
    const project = [...this.projects]
      .sort((a, b) => b.id.length - a.id.length)
      .find(item =>
        path === `/app/${item.id}` ||
        path.startsWith(`/app/${item.id}/`)
      );

    if (!project) {
      return;
    }

    this._selectedProjectId.set(project.id);

    // CONNECT SETTINGS

    if (project.id === 'connect') {

      const isSettings =
        path === '/app/connect/setting' ||
        path.startsWith('/app/connect/setting/');

      this._sidebarView.set(
        isSettings ? 'settings' : 'default'
      );

      return;
    }

    // LEARN HUB SETTINGS

    if (project.id === 'learn-hub') {

      const settingsItems = this.getLearnHubSettingsMenus(
        project.items
      );

      const adminItems = settingsItems.filter(
        x => x.id !== 'lh-settings-home'
      );

      const isSettings = this.containsRoute(
        adminItems,
        path
      );

      this._sidebarView.set(
        isSettings ? 'settings' : 'default'
      );

      return;
    }

    // OTHER PROJECTS

    this._sidebarView.set('default');
  }

  // ==========================================
  // FIND ROUTE IN TREE
  // ==========================================

  private containsRoute(
    items: SidebarMenuItem[],
    path: string
  ): boolean {

    for (const item of items) {

      if (
        item.route &&
        this.normalizeUrl(item.route) === path
      ) {
        return true;
      }

      if (
        item.children?.length &&
        this.containsRoute(item.children, path)
      ) {
        return true;
      }
    }

    return false;
  }

  // ==========================================
  // FIND FIRST ROUTE
  // ==========================================

  private findFirstRoute(
    items: SidebarMenuItem[]
  ): string | null {

    for (const item of items) {

      if (item.route) {
        return item.route;
      }

      if (item.children?.length) {

        const route = this.findFirstRoute(
          item.children
        );

        if (route) {
          return route;
        }
      }
    }

    return null;
  }

  // ==========================================
  // NORMALIZE URL
  // ==========================================

  private normalizeUrl(url: string): string {

    return (
      url.split('?')[0]
        .split('#')[0]
        .replace(/\/+$/, '') || '/'
    );
  }
}

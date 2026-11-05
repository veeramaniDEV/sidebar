
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';

import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition
} from '@angular/cdk/overlay';

import { filter } from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ProjectSwitchStore
} from '../../core/stores/project-switch.store';

import {
  SidebarMenuItem
} from '../models/sidebar-menu.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    CdkConnectedOverlay,
    CdkOverlayOrigin
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  // ==========================================
  // DEPENDENCY INJECTION
  // ==========================================

  private readonly router = inject(Router);

  readonly projectStore = inject(ProjectSwitchStore);

  // ==========================================
  // COLLAPSED SIDEBAR
  // ==========================================

  private _collapsed = false;

  @Input()
  set collapsed(value: boolean) {

    this._collapsed = value;

    if (!value) {
      this.closeFlyout();
    }
  }

  get collapsed(): boolean {
    return this._collapsed;
  }

  @Output()
  menuSelected = new EventEmitter<void>();

  // ==========================================
  // NESTED MENU STATE
  // ==========================================

  // Stores the hierarchy manually expanded
  // by the user.
  readonly openPath = signal<string[]>([]);

  // ==========================================
  // CDK FLOATING MENU
  // ==========================================

  readonly flyoutOpen = signal(false);

  readonly flyoutOrigin =
    signal<CdkOverlayOrigin | null>(null);

  readonly flyoutPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: 12
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: 12
    }
  ];

  // ==========================================
  // TRACK PROJECT AND SIDEBAR VIEW
  // ==========================================

  private lastProjectId = '';

  private lastSidebarView = '';

  // ==========================================
  // INITIALIZE SIDEBAR
  // ==========================================

  constructor() {

    // When a project or its sidebar view changes,
    // reset the expanded hierarchy.
    effect(() => {

      const projectId =
        this.projectStore.selectedProjectId();

      const sidebarView =
        this.projectStore.sidebarView();

      const projectOrViewChanged =
        projectId !== this.lastProjectId ||
        sidebarView !== this.lastSidebarView;

      if (!projectOrViewChanged) {
        return;
      }

      this.lastProjectId = projectId;

      this.lastSidebarView = sidebarView;

      untracked(() => {

        this.closeFlyout();

        // When Settings opens, all menus
        // must initially remain collapsed.
        if (sidebarView === 'settings') {

          this.openPath.set([]);

          return;
        }

        // Normal Default View continues to
        // restore menus based on the URL.
        this.syncMenuWithRoute(this.router.url);
      });
    });

    // ========================================
    // HANDLE ROUTE NAVIGATION
    // ========================================

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        ),
        takeUntilDestroyed()
      )
      .subscribe(event => {

        this.closeFlyout();

        const sidebarView =
          this.projectStore.sidebarView();

        // IMPORTANT:
        // Do not automatically expand Settings
        // menus because of the active route.
        //
        // This prevents:
        // Settings -> Menu -> Soft Skills
        // from automatically opening.
        //
        // Manually expanded menus remain open.
        if (sidebarView === 'settings') {
          return;
        }

        // For Default View, restore the menu
        // hierarchy matching the current route.
        this.syncMenuWithRoute(
          event.urlAfterRedirects
        );
      });
  }

  // ==========================================
  // COLLAPSED SIDEBAR FLOATING PANEL
  // ==========================================

  toggleFlyout(origin: CdkOverlayOrigin): void {

    if (!this.collapsed) {
      return;
    }

    if (this.flyoutOpen()) {

      this.closeFlyout();

      return;
    }

    this.flyoutOrigin.set(origin);

    this.flyoutOpen.set(true);
  }

  closeFlyout(): void {

    this.flyoutOpen.set(false);

    this.flyoutOrigin.set(null);
  }

  // ==========================================
  // NESTED ACCORDION MENU
  // ==========================================

  toggleMenu(
    item: SidebarMenuItem,
    ancestors: string[]
  ): void {

    if (!item.children?.length) {
      return;
    }

    const currentPath = this.openPath();

    const alreadyOpen =
      currentPath.includes(item.id);

    if (alreadyOpen) {

      // Close selected parent and descendants.
      this.openPath.set([...ancestors]);

    } else {

      // Open selected parent and its ancestors.
      // Other branches remain collapsed.
      this.openPath.set([
        ...ancestors,
        item.id
      ]);
    }
  }

  // ==========================================
  // CHECK MENU EXPANSION
  // ==========================================

  isMenuOpen(id: string): boolean {

    return this.openPath().includes(id);
  }

  // ==========================================
  // GET CHILD MENU ANCESTORS
  // ==========================================

  getChildAncestors(
    ancestors: string[],
    itemId: string
  ): string[] {

    return [
      ...ancestors,
      itemId
    ];
  }

  // ==========================================
  // ACCESSIBLE SUBMENU ID
  // ==========================================

  submenuId(id: string): string {

    return `submenu-${id}`;
  }

  // ==========================================
  // MENU SELECTION
  // ==========================================

  onMenuSelected(): void {

    this.closeFlyout();

    this.menuSelected.emit();
  }

  // ==========================================
  // RESTORE MENU STATE FROM CURRENT ROUTE
  // DEFAULT VIEW ONLY
  // ==========================================

  private syncMenuWithRoute(url: string): void {

    // Never restore automatic expansion
    // while Settings View is active.
    if (this.projectStore.isSettingsView()) {
      return;
    }

    const cleanUrl = this.normalizeUrl(url);

    const project = this.projectStore.projects.find(
      item =>
        cleanUrl === `/app/${item.id}` ||
        cleanUrl.startsWith(`/app/${item.id}/`)
    );

    if (!project) {

      this.openPath.set([]);

      return;
    }

    const visibleItems =
      this.projectStore.visibleItems();

    const path = this.findMenuPath(
      visibleItems,
      cleanUrl,
      []
    );

    this.openPath.set(path ?? []);
  }

  // ==========================================
  // FIND ACTIVE MENU PATH RECURSIVELY
  // ==========================================

  private findMenuPath(
    items: SidebarMenuItem[],
    route: string,
    ancestors: string[]
  ): string[] | null {

    for (const item of items) {

      // Check matching leaf route.
      if (
        item.route &&
        this.normalizeUrl(item.route) === route
      ) {

        return ancestors;
      }

      // Check nested children.
      if (item.children?.length) {

        const found = this.findMenuPath(
          item.children,
          route,
          [
            ...ancestors,
            item.id
          ]
        );

        if (found !== null) {
          return found;
        }
      }
    }

    return null;
  }

  // ==========================================
  // NORMALIZE ANGULAR URL
  // ==========================================

  private normalizeUrl(url: string): string {

    return (
      url
        .split('?')[0]
        .split('#')[0]
        .replace(/\/+$/, '') || '/'
    );
  }

  // ==========================================
  // KEYBOARD ACCESSIBILITY
  // ==========================================

  @HostListener('document:keydown.escape')
  onEscape(): void {

    this.closeFlyout();
  }
}

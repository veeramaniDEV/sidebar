import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  signal
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
import { SidebarMenuItem } from '../models/sidebar-menu.model';



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

  private readonly router = inject(Router);

  readonly projectStore = inject(ProjectSwitchStore);

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

  // Only one submenu hierarchy stays expanded
  readonly openPath = signal<string[]>([]);

  // Floating panel for collapsed desktop sidebar
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

  constructor() {

    this.syncMenuWithRoute(this.router.url);

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

        this.syncMenuWithRoute(
          event.urlAfterRedirects
        );
      });
  }

  // ---------------------------------------------
  // Collapsed sidebar floating panel
  // ---------------------------------------------

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

  // ---------------------------------------------
  // Nested accordion
  // ---------------------------------------------

  toggleMenu(
    item: SidebarMenuItem,
    ancestors: string[]
  ): void {

    if (!item.children?.length) {
      return;
    }

    const currentPath = this.openPath();

    if (currentPath.includes(item.id)) {

      // Close selected menu and its children
      this.openPath.set([...ancestors]);

    } else {

      // Open only this menu's ancestor path
      this.openPath.set([
        ...ancestors,
        item.id
      ]);
    }
  }

  isMenuOpen(id: string): boolean {
    return this.openPath().includes(id);
  }

  getChildAncestors(
    ancestors: string[],
    itemId: string
  ): string[] {
    return [...ancestors, itemId];
  }

  submenuId(id: string): string {
    return `submenu-${id}`;
  }

  onMenuSelected(): void {

    this.closeFlyout();

    this.menuSelected.emit();
  }

  // ---------------------------------------------
  // Restore expanded menus based on current route
  // ---------------------------------------------

  private syncMenuWithRoute(url: string): void {

    const cleanUrl =
      url.split('?')[0]
        .split('#')[0]
        .replace(/\/+$/, '') || '/';

    const project = this.projectStore.projects.find(
      item =>
        cleanUrl === `/app/${item.id}` ||
        cleanUrl.startsWith(`/app/${item.id}/`)
    );

    if (!project) {
      return;
    }

    const path = this.findMenuPath(
      project.items,
      cleanUrl,
      []
    );

    this.openPath.set(path ?? []);
  }

  private findMenuPath(
    items: SidebarMenuItem[],
    route: string,
    ancestors: string[]
  ): string[] | null {

    for (const item of items) {

      if (item.route === route) {
        return ancestors;
      }

      if (item.children?.length) {

        const found = this.findMenuPath(
          item.children,
          route,
          [...ancestors, item.id]
        );

        if (found !== null) {
          return found;
        }
      }
    }

    return null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeFlyout();
  }
}
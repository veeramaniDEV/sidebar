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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SIDEBAR_PROJECTS } from '../../layouts/data/sidebar-menu.data';
import { SidebarProject, SidebarMenuItem } from '../../layouts/models/sidebar-menu.model';



@Injectable({
  providedIn: 'root'
})
export class ProjectSwitchStore {

  private readonly router = inject(Router);

  readonly projects: SidebarProject[] = SIDEBAR_PROJECTS;

  // Default project is Connect
  private readonly _selectedProjectId = signal('connect');

  readonly selectedProjectId =
    this._selectedProjectId.asReadonly();

  readonly selectedProject = computed(() =>
    this.projects.find(
      project => project.id === this._selectedProjectId()
    ) ?? this.projects[0]
  );

  // Show the other three projects in Switch
  readonly otherProjects = computed(() =>
    this.projects.filter(
      project => project.id !== this._selectedProjectId()
    )
  );

  readonly homeRoute = computed(() =>
    this.findFirstRoute(this.selectedProject().items)
      ?? '/app/connect/dashboard'
  );

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

  // Switch to another project and open its first page
  switchProject(projectId: string): void {

    const project = this.projects.find(
      item => item.id === projectId
    );

    if (!project) {
      return;
    }

    const route = this.findFirstRoute(project.items);

    if (!route) {
      return;
    }

    this._selectedProjectId.set(projectId);

    void this.router.navigateByUrl(route);
  }

  private syncFromUrl(url: string): void {

    const path = url.split('?')[0].split('#')[0];

    const project = this.projects.find(item =>
      path === `/app/${item.id}` ||
      path.startsWith(`/app/${item.id}/`)
    );

    if (project) {
      this._selectedProjectId.set(project.id);
    }
  }

  private findFirstRoute(
    items: SidebarMenuItem[]
  ): string | null {

    for (const item of items) {

      if (item.route) {
        return item.route;
      }

      if (item.children?.length) {

        const route = this.findFirstRoute(item.children);

        if (route) {
          return route;
        }
      }
    }

    return null;
  }
}

import { Routes } from '@angular/router';

import {
  SIDEBAR_PROJECTS
} from './layouts/data/sidebar-menu.data';

import {
  SidebarMenuItem
} from './layouts/models/sidebar-menu.model';

// ==========================================
// GENERATE ROUTES FROM SIDEBAR MENUS
// ==========================================

function createMenuRoutes(
  items: SidebarMenuItem[]
): Routes {

  const routes: Routes = [];

  for (const item of items) {

    // ======================================
    // PARENT MENU
    // ======================================

    // Parent menus expand/collapse and do not
    // have their own navigable routes.

    if (item.children?.length) {

      routes.push(
        ...createMenuRoutes(item.children)
      );

      continue;
    }

    // Skip items without a route.
    if (!item.route) {
      continue;
    }

    // ======================================
    // CONVERT ROUTE PATH
    // ======================================

    // Example:
    // /app/connect/production
    // becomes:
    // connect/production

    const routePath = item.route.replace(
      /^\/app\//,
      ''
    );

    // ======================================
    // CONNECT DASHBOARD
    // ======================================

    if (routePath === 'connect/dashboard') {

      routes.push({
        path: routePath,
        title: 'Dashboard | CONNECT',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(m => m.Dashboard)
      });

      continue;
    }

    // ======================================
    // CONNECT SETTINGS - USERS LIST
    // ======================================

    if (routePath === 'connect/setting/users-list') {

      routes.push({
        path: routePath,
        title: 'Users List | CONNECT',

        data: {
          pageTitle: 'Users List'
        },

        loadComponent: () =>
          import(
            './features/user-management/pages/users-list/users-list'
          ).then(m => m.UsersList)
      });

      continue;
    }

    // ======================================
    // ALL OTHER MENU PAGES
    // ======================================

    // Until other feature components are
    // implemented, load the Placeholder page.

    routes.push({
      path: routePath,

      title: `${item.label} | CONNECT`,

      data: {
        pageTitle: item.label
      },

      loadComponent: () =>
        import(
          './features/placeholder/placeholder'
        ).then(m => m.Placeholder)
    });
  }

  return routes;
}

// ==========================================
// COLLECT ALL PROJECT ROUTES
// ==========================================

const menuRoutes: Routes = SIDEBAR_PROJECTS.flatMap(
  project => createMenuRoutes(project.items)
);

// ==========================================
// APPLICATION ROUTES
// ==========================================

export const routes: Routes = [

  // ========================================
  // DEFAULT ROUTE
  // ========================================

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  // ========================================
  // LOGIN
  // ========================================

  {
    path: 'login',
    title: 'Sign in | CONNECT',

    loadComponent: () =>
      import(
        './features/login/login'
      ).then(m => m.Login)
  },

  // ========================================
  // MAIN LANDING LAYOUT
  // ========================================

  {
    path: 'app',

    loadComponent: () =>
      import(
        './layouts/landing-layout/landing-layout'
      ).then(m => m.LandingLayout),

    children: [

      // ====================================
      // DEFAULT APP ROUTE
      // ====================================

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'connect/dashboard'
      },

      // ====================================
      // DYNAMIC SIDEBAR ROUTES
      // ====================================

      // CONNECT
      // CONNECT PORTAL
      // LEARN HUB
      // BENRECON

      ...menuRoutes,

      // ====================================
      // LEGACY DASHBOARD URL
      // ====================================

      {
        path: 'dashboard',
        pathMatch: 'full',
        redirectTo: 'connect/dashboard'
      }

    ]
  },

  // ========================================
  // UNKNOWN ROUTES
  // ========================================

  {
    path: '**',
    redirectTo: 'login'
  }

];

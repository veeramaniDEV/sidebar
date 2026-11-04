// import { Routes } from '@angular/router';
// export const routes: Routes = [
//   { path: '', pathMatch: 'full', redirectTo: 'login' },
//   { path: 'login', title: 'Sign in | CONNECT', loadComponent: () => import('./features/login/login').then(m => m.Login) },
//   {
//     path: 'app', loadComponent: () => import('./layouts/landing-layout/landing-layout').then(m => m.LandingLayout), children: [
//       { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
//       { path: 'dashboard', title: 'Dashboard | CONNECT', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
//       ...['analytics', 'processes', 'transitions', 'tickets', 'file-manager', 'billing', 'teams', 'performance-score', 'settings'].map(path => ({ path, title: path.replaceAll('-', ' ') + ' | CONNECT', loadComponent: () => import('./features/placeholder/placeholder').then(m => m.Placeholder) }))
//     ]
//   },
//   { path: '**', redirectTo: 'login' }
// ];




import { Routes } from '@angular/router';
import { SIDEBAR_PROJECTS } from './layouts/data/sidebar-menu.data';
import { SidebarMenuItem } from './layouts/models/sidebar-menu.model';



// -----------------------------------------------------
// Generate routes from sidebar menu configuration
// -----------------------------------------------------

function createMenuRoutes(
  items: SidebarMenuItem[]
): Routes {

  const routes: Routes = [];

  for (const item of items) {

    // Parent menus only expand/collapse.
    // They don't need their own routes.
    if (item.children?.length) {

      routes.push(
        ...createMenuRoutes(item.children)
      );

      continue;
    }

    if (!item.route) {
      continue;
    }

    // Convert:
    // /app/connect/production
    // to:
    // connect/production
    const routePath = item.route.replace(
      /^\/app\//,
      ''
    );

    // Connect Dashboard uses the real Dashboard component.
    if (routePath === 'connect/dashboard') {

      routes.push({
        path: routePath,
        title: item.label,
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      });

      continue;
    }

    // Other menu items currently use Placeholder.
    routes.push({
      path: routePath,
      title: item.label,
      data: {
        pageTitle: item.label
      },
      loadComponent: () =>
        import('./features/placeholder/placeholder')
          .then(m => m.Placeholder)
    });
  }

  return routes;
}

// -----------------------------------------------------
// Collect all routes from the four sidebar projects
// -----------------------------------------------------

const menuRoutes: Routes = SIDEBAR_PROJECTS.flatMap(
  project => createMenuRoutes(project.items)
);

// -----------------------------------------------------
// Application routes
// -----------------------------------------------------

export const routes: Routes = [

  // Default page
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  // Login page
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./features/login/login')
        .then(m => m.Login)
  },

  // Main application layout
  {
    path: 'app',

    loadComponent: () =>
      import('./layouts/landing-layout/landing-layout')
        .then(m => m.LandingLayout),

    children: [

      // Default application dashboard
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'connect/dashboard'
      },

      // Automatically generated sidebar routes
      ...menuRoutes,

      // Legacy dashboard URL compatibility
      {
        path: 'dashboard',
        pathMatch: 'full',
        redirectTo: 'connect/dashboard'
      }

    ]
  },

  // Unknown routes
  {
    path: '**',
    redirectTo: 'login'
  }

];


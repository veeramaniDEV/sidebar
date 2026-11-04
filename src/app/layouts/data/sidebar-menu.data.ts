import {
  SidebarMenuItem,
  SidebarProject
} from '../models/sidebar-menu.model';

interface MenuDefinition {
  label: string;
  icon?: string;
  children?: MenuDefinition[];
}

// Leaf menu (navigates to a page)
function page(
  label: string,
  icon = 'pi pi-circle'
): MenuDefinition {
  return { label, icon };
}

// Parent menu (expands/collapses)
function group(
  label: string,
  children: MenuDefinition[],
  icon = 'pi pi-folder'
): MenuDefinition {
  return { label, icon, children };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildItems(
  items: MenuDefinition[],
  path: string[]
): SidebarMenuItem[] {

  return items.map(item => {
    const currentPath = [...path, slug(item.label)];
    const hasChildren = !!item.children?.length;

    return {
      id: currentPath.join('-'),
      label: item.label,
      icon: item.icon,
      ...(hasChildren
        ? {
            children: buildItems(
              item.children!,
              currentPath
            )
          }
        : {
            route: '/app/' + currentPath.join('/')
          })
    };
  });
}

function project(
  id: string,
  label: string,
  icon: string,
  items: MenuDefinition[]
): SidebarProject {
  return {
    id,
    label,
    icon,
    items: buildItems(items, [id])
  };
}

export const SIDEBAR_PROJECTS: SidebarProject[] = [

  // ====================================================
  // 1. CONNECT
  // ====================================================

  project('connect', 'Connect', 'pi pi-desktop', [

    page('Dashboard', 'pi pi-home'),

    page('Production', 'pi pi-chart-bar'),

    page('Report', 'pi pi-file'),

    page('View SOP', 'pi pi-book'),

    page('CAPA Tracker', 'pi pi-check-square'),

    group('Setting', [

      page('Users List'),

      page('Process Assign'),

      page('Client List'),

      page('Add SOP'),

      page('SPLI')

    ], 'pi pi-cog')

  ]),

  // ====================================================
  // 2. CONNECT PORTAL
  // ====================================================

  project(
    'connect-portal',
    'Connect Portal',
    'pi pi-sitemap',
    [

      page('Dashboard', 'pi pi-home'),

      page('Home', 'pi pi-home'),

      group('Analytics', [

        page('By Client'),

        page('By Processor'),

        page('Employee Monitor')

      ], 'pi pi-chart-bar'),

      page('Processes', 'pi pi-sitemap'),

      page(
        'Transitions',
        'pi pi-arrow-right-arrow-left'
      ),

      page('Tickets', 'pi pi-ticket'),

      page('File Manager', 'pi pi-folder'),

      page('Billing', 'pi pi-wallet'),

      page('Teams', 'pi pi-users'),

      page(
        'Performer Score By Practice',
        'pi pi-chart-line'
      )

    ]
  ),

  // ====================================================
  // 3. LEARN HUB
  // ====================================================

  project(
    'learn-hub',
    'Learn Hub',
    'pi pi-book',
    [

      // -----------------------------------------------
      // SOFT SKILLS
      // -----------------------------------------------

      group('Soft Skills', [

        group('Home', [

          page('Dashboard'),

          page('Archives')

        ], 'pi pi-home'),

        group('Resource Center (Process Name)', [

          group('Interpersonal Skills (Module Name)', [

            page('Email Etiquette (Sub Process)')

          ])

        ], 'pi pi-book'),

        group('Soft Skills Training Setting', [

          page('Add and Update Process'),

          page('Add and Update Module'),

          page('Add and Update SubProcess'),

          page('Add and Update Questions'),

          page('View Question and Answer')

        ], 'pi pi-cog'),

        group('Others', [

          page('Assign Video to Users')

        ])

      ], 'pi pi-users'),

      // -----------------------------------------------
      // TECHNICAL SKILLS
      // -----------------------------------------------

      group('Technical Skills', [

        group('Home', [

          page('Dashboard'),

          page('Pre-Domain')

        ], 'pi pi-home'),

        group('Resource Center (Main Menu)', [

          group('Tax administration (Sub Menu)', [

            group('Basics (Modules)', [

              page('Tax Pre Domain (Course)')

            ])

          ])

        ], 'pi pi-book'),

        group('Menu Setting', [

          page('Add and Update Main Menu'),

          page('Add and Update Sub Menu'),

          page('Add and Update Modules'),

          page('Add and Update Course Menu')

        ], 'pi pi-cog'),

        group('Add & View QA', [

          page('Add Question and Answer'),

          page('View & Update QA')

        ]),

        group('Assign Module / Course', [

          page('Module Allocation'),

          page('Re-assign Course'),

          page('Assign Next Module')

        ]),

        group('Report', [

          page('User Performance Scorecard'),

          page('Time Monitor'),

          page('PreDomain Scorecard'),

          page('Users Reports')

        ], 'pi pi-chart-bar'),

        group('Notification', [

          page('Update Notification')

        ], 'pi pi-bell'),

        group('Add Updates', [

          page('Process Updates')

        ])

      ], 'pi pi-desktop'),

      // -----------------------------------------------
      // SECURITY PROTOCOLS
      // -----------------------------------------------

      group('Security Protocols', [

        group('Home', [

          page('Dashboard'),

          page('Archives')

        ], 'pi pi-home'),

        group('Resource Center (Main Menu)', [

          group('Information Technology (Departments)', [

            page('Cybersecurity (Courses)')

          ])

        ], 'pi pi-book'),

        group('Menu Setting', [

          page('Add and Update Main Menu'),

          page('Add and Update Departments'),

          page('Add and Update Courses')

        ], 'pi pi-cog'),

        group('Add & View QA', [

          page('Add Question and Answer')

        ]),

        group('Report', [

          page('Phishing Awareness Results'),

          page('POSH Awareness Results')

        ], 'pi pi-chart-bar'),

        group('Unlock', [

          page('Unlock Access')

        ], 'pi pi-lock-open'),

        group('Notification', [

          page('Update Notification')

        ], 'pi pi-bell')

      ], 'pi pi-shield'),

      // -----------------------------------------------
      // SKILL CHECK
      // -----------------------------------------------

      group('Skill Check', [

        group('Home', [

          page('Dashboard')

        ], 'pi pi-home'),

        group('Resource Center (Main Menu)', [

          page('Skill Check Assessment (Sub Menu)')

        ], 'pi pi-book'),

        page('QA Upload'),

        page('Reports'),

        page('Approve 3rd Attempt')

      ], 'pi pi-check-circle')

    ]
  ),

  // ====================================================
  // 4. BENRECON
  // ====================================================

  project(
    'benrecon',
    'BenRecon',
    'pi pi-file-check',
    [

      page('Dashboard', 'pi pi-home'),

      page('Groups', 'pi pi-users'),

      page('Entity', 'pi pi-building'),

      page('Users', 'pi pi-user'),

      page('Setup', 'pi pi-cog'),

      page('BenRecon', 'pi pi-file-check')

    ]
  )

];
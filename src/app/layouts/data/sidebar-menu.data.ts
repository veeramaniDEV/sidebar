
import {
  SidebarMenuItem,
  SidebarProject
} from '../models/sidebar-menu.model';

// ==========================================
// MENU MODEL
// ==========================================

interface MenuDefinition {
  label: string;
  icon?: string;
  children?: MenuDefinition[];
}

// ==========================================
// MENU HELPERS
// ==========================================

function page(
  label: string,
  icon = 'pi pi-circle'
): MenuDefinition {
  return { label, icon };
}

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

// ==========================================
// BUILD NESTED ITEMS
// ==========================================

function buildItems(
  items: MenuDefinition[],
  path: string[]
): SidebarMenuItem[] {

  return items.map(item => {

    const currentPath = [...path, slug(item.label)];

    if (item.children?.length) {
      return {
        id: currentPath.join('-'),
        label: item.label,
        icon: item.icon,
        children: buildItems(item.children, currentPath)
      };
    }

    return {
      id: currentPath.join('-'),
      label: item.label,
      icon: item.icon,
      route: '/app/' + currentPath.join('/')
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

// ==========================================
// PROJECT MENU DEFINITIONS
// ==========================================

export const SIDEBAR_PROJECTS: SidebarProject[] = [

  // ========================================
  // 1. CONNECT
  // ========================================

  project('connect', 'Connect', 'pi pi-desktop', [

    page('Dashboard', 'pi pi-home'),
    page('Production', 'pi pi-chart-bar'),
    page('Report', 'pi pi-file'),
    page('View SOP', 'pi pi-book'),
    page('CAPA Tracker', 'pi pi-check-square'),

    group('Setting', [
      page('Users List', 'pi pi-users'),
      page('Process Assign', 'pi pi-sitemap'),
      page('Client List', 'pi pi-building'),
      page('Add SOP', 'pi pi-file-plus'),
      page('SPLI', 'pi pi-list-check')
    ], 'pi pi-cog')

  ]),

  // ========================================
  // 2. CONNECT PORTAL
  // ========================================

  project(
    'connect-portal',
    'Connect Portal',
    'pi pi-sitemap',
    [

      page('Dashboard', 'pi pi-home'),
      page('Home', 'pi pi-home'),

      group('Analytics', [
        page('By Client', 'pi pi-building'),
        page('By Processor', 'pi pi-users'),
        page('Employee Monitor', 'pi pi-desktop')
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

  // ========================================
  // 3. LEARN HUB
  // ========================================

  project(
    'learn-hub',
    'Learn Hub',
    'pi pi-book',
    [

      // ====================================
      // SOFT SKILLS
      // ====================================

      group('Soft Skills', [

        group('Home', [
          page('Dashboard', 'pi pi-home'),
          page('Archives', 'pi pi-folder')
        ], 'pi pi-home'),

        group('Resource Center (Process Name)', [

          group('Interpersonal Skills (Module Name)', [
            page(
              'Email Etiquette (Sub Process)',
              'pi pi-envelope'
            )
          ], 'pi pi-book')

        ], 'pi pi-book'),

        group('Soft Skills Training Setting', [
          page('Add and Update Process', 'pi pi-sitemap'),
          page('Add and Update Module', 'pi pi-folder-plus'),
          page('Add and Update SubProcess', 'pi pi-list'),
          page(
            'Add and Update Questions',
            'pi pi-question-circle'
          ),
          page(
            'View Question and Answer',
            'pi pi-eye'
          )
        ], 'pi pi-cog'),

        group('Others', [
          page('Assign Video to Users', 'pi pi-video')
        ], 'pi pi-folder')

      ], 'pi pi-users'),

      // ====================================
      // TECHNICAL SKILLS
      // ====================================

      group('Technical Skills', [

        group('Home', [
          page('Dashboard', 'pi pi-home'),
          page('Pre-Domain', 'pi pi-book')
        ], 'pi pi-home'),

        group('Resource Center (Main Menu)', [

          group('Tax administration (Sub Menu)', [

            group('Basics (Modules)', [
              page(
                'Tax Pre Domain (Course)',
                'pi pi-file'
              )
            ], 'pi pi-folder')

          ], 'pi pi-book')

        ], 'pi pi-book'),

        // MENU CONFIGURATION

        group('Menu Setting', [
          page(
            'Add and Update Main Menu',
            'pi pi-th-large'
          ),
          page(
            'Add and Update Sub Menu',
            'pi pi-list'
          ),
          page(
            'Add and Update Modules',
            'pi pi-folder-plus'
          ),
          page(
            'Add and Update Course Menu',
            'pi pi-book'
          )
        ], 'pi pi-cog'),

        // QUESTION MANAGEMENT

        group('Add & View QA', [
          page(
            'Add Question and Answer',
            'pi pi-question-circle'
          ),
          page(
            'View & Update QA',
            'pi pi-eye'
          )
        ], 'pi pi-folder-open'),

        // COURSE ASSIGNMENT

        group('Assign Module / Course', [
          page(
            'Module Allocation',
            'pi pi-sitemap'
          ),
          page(
            'Re-assign Course',
            'pi pi-refresh'
          ),
          page(
            'Assign Next Module',
            'pi pi-arrow-right'
          )
        ], 'pi pi-users'),

        // REPORTS

        group('Report', [
          page(
            'User Performance Scorecard',
            'pi pi-chart-bar'
          ),
          page(
            'Time Monitor',
            'pi pi-clock'
          ),
          page(
            'PreDomain Scorecard',
            'pi pi-chart-line'
          ),
          page(
            'Users Reports',
            'pi pi-file'
          )
        ], 'pi pi-chart-bar'),

        // NOTIFICATIONS

        group('Notification', [
          page(
            'Update Notification',
            'pi pi-bell'
          )
        ], 'pi pi-bell'),

        // PROCESS UPDATES

        group('Add Updates', [
          page(
            'Process Updates',
            'pi pi-pencil'
          )
        ], 'pi pi-pencil')

      ], 'pi pi-desktop'),

      // ====================================
      // SECURITY PROTOCOLS
      // ====================================

      group('Security Protocols', [

        group('Home', [
          page('Dashboard', 'pi pi-home'),
          page('Archives', 'pi pi-folder')
        ], 'pi pi-home'),

        group('Resource Center (Main Menu)', [

          group(
            'Information Technology (Departments)',
            [
              page(
                'Cybersecurity (Courses)',
                'pi pi-shield'
              )
            ],
            'pi pi-book'
          )

        ], 'pi pi-book'),

        // SECURITY MENU SETTINGS

        group('Menu Setting', [
          page(
            'Add and Update Main Menu',
            'pi pi-th-large'
          ),
          page(
            'Add and Update Departments',
            'pi pi-building'
          ),
          page(
            'Add and Update Courses',
            'pi pi-book'
          )
        ], 'pi pi-cog'),

        // SECURITY QA

        group('Add & View QA', [
          page(
            'Add Question and Answer',
            'pi pi-question-circle'
          )
        ], 'pi pi-folder-open'),

        // SECURITY REPORTS

        group('Report', [
          page(
            'Phishing Awareness Results',
            'pi pi-chart-bar'
          ),
          page(
            'POSH Awareness Results',
            'pi pi-chart-line'
          )
        ], 'pi pi-chart-bar'),

        // SECURITY UNLOCK

        group('Unlock', [
          page(
            'Unlock Access',
            'pi pi-lock-open'
          )
        ], 'pi pi-lock-open'),

        // SECURITY NOTIFICATIONS

        group('Notification', [
          page(
            'Update Notification',
            'pi pi-bell'
          )
        ], 'pi pi-bell')

      ], 'pi pi-shield'),

      // ====================================
      // SKILL CHECK
      // ====================================

      group('Skill Check', [

        group('Home', [
          page('Dashboard', 'pi pi-home')
        ], 'pi pi-home'),

        group('Resource Center (Main Menu)', [
          page(
            'Skill Check Assessment (Sub Menu)',
            'pi pi-check-circle'
          )
        ], 'pi pi-book'),

        page('QA Upload', 'pi pi-upload'),
        page('Reports', 'pi pi-chart-bar'),
        page(
          'Approve 3rd Attempt',
          'pi pi-check-circle'
        )

      ], 'pi pi-check-circle')

    ]
  ),

  // ========================================
  // 4. BENRECON
  // ========================================

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

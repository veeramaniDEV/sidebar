
import {
  Component,
  computed,
  signal
} from '@angular/core';

import { DatePipe } from '@angular/common';

type UserRole = 'Admin' | 'Manager' | 'User';

type UserStatus = 'Active' | 'Inactive';

type StatusFilter = 'All' | UserStatus;

type RoleFilter = 'All' | UserRole;

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  createdOn: string;
}

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
}

const SAMPLE_USERS: User[] = [
  {
    id: 1001,
    name: 'Arun Kumar',
    email: 'arun@example.com',
    role: 'Admin',
    department: 'IT',
    status: 'Active',
    createdOn: '2026-09-10'
  },
  {
    id: 1002,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'Manager',
    department: 'Operations',
    status: 'Active',
    createdOn: '2026-09-12'
  },
  {
    id: 1003,
    name: 'Karthik Raj',
    email: 'karthik@example.com',
    role: 'User',
    department: 'Production',
    status: 'Inactive',
    createdOn: '2026-09-15'
  },
  {
    id: 1004,
    name: 'Divya Nair',
    email: 'divya@example.com',
    role: 'User',
    department: 'Quality',
    status: 'Active',
    createdOn: '2026-09-20'
  },
  {
    id: 1005,
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    role: 'Manager',
    department: 'Production',
    status: 'Active',
    createdOn: '2026-10-01'
  },
  {
    id: 1006,
    name: 'Meena Joseph',
    email: 'meena@example.com',
    role: 'User',
    department: 'Finance',
    status: 'Inactive',
    createdOn: '2026-10-05'
  },
  {
    id: 1007,
    name: 'Vignesh S',
    email: 'vignesh@example.com',
    role: 'User',
    department: 'Operations',
    status: 'Active',
    createdOn: '2026-10-12'
  },
  {
    id: 1008,
    name: 'Sneha R',
    email: 'sneha@example.com',
    role: 'Admin',
    department: 'IT',
    status: 'Active',
    createdOn: '2026-10-18'
  }
];

function emptyForm(): UserForm {
  return {
    name: '',
    email: '',
    role: 'User',
    department: '',
    status: 'Active'
  };
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersList {

  // ==========================================
  // SAMPLE USERS
  // ==========================================

  readonly users = signal<User[]>(
    SAMPLE_USERS.map(user => ({ ...user }))
  );

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  readonly searchText = signal('');

  readonly selectedRole = signal<RoleFilter>('All');

  readonly selectedStatus = signal<StatusFilter>('All');

  readonly roles: UserRole[] = [
    'Admin',
    'Manager',
    'User'
  ];

  readonly statuses: UserStatus[] = [
    'Active',
    'Inactive'
  ];

  // ==========================================
  // STATISTICS
  // ==========================================

  readonly totalUsers = computed(
    () => this.users().length
  );

  readonly activeUsers = computed(
    () => this.users().filter(
      user => user.status === 'Active'
    ).length
  );

  readonly inactiveUsers = computed(
    () => this.users().filter(
      user => user.status === 'Inactive'
    ).length
  );

  readonly adminUsers = computed(
    () => this.users().filter(
      user => user.role === 'Admin'
    ).length
  );

  // ==========================================
  // FILTERED USER LIST
  // ==========================================

  readonly filteredUsers = computed(() => {

    const keyword =
      this.searchText().trim().toLowerCase();

    const role = this.selectedRole();

    const status = this.selectedStatus();

    return this.users().filter(user => {

      const matchesSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.department.toLowerCase().includes(keyword) ||
        user.id.toString().includes(keyword);

      const matchesRole =
        role === 'All' || user.role === role;

      const matchesStatus =
        status === 'All' || user.status === status;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  });

  // ==========================================
  // PAGINATION
  // ==========================================

  readonly pageSize = 5;

  readonly currentPage = signal(1);

  readonly totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(
        this.filteredUsers().length / this.pageSize
      )
    )
  );

  readonly paginatedUsers = computed(() => {

    const page = Math.min(
      this.currentPage(),
      this.totalPages()
    );

    const start = (page - 1) * this.pageSize;

    return this.filteredUsers().slice(
      start,
      start + this.pageSize
    );
  });

  readonly pageStart = computed(() => {

    if (!this.filteredUsers().length) {
      return 0;
    }

    return (
      (Math.min(
        this.currentPage(),
        this.totalPages()
      ) - 1) * this.pageSize
    ) + 1;
  });

  readonly pageEnd = computed(() =>
    Math.min(
      this.pageStart() + this.pageSize - 1,
      this.filteredUsers().length
    )
  );

  // ==========================================
  // MODAL STATE
  // ==========================================

  readonly showUserModal = signal(false);

  readonly editingUserId = signal<number | null>(null);

  readonly userForm = signal<UserForm>(
    emptyForm()
  );

  readonly formError = signal('');

  // ==========================================
  // DELETE CONFIRMATION
  // ==========================================

  readonly deletingUser = signal<User | null>(null);

  // ==========================================
  // MESSAGE
  // ==========================================

  readonly successMessage = signal('');

  // ==========================================
  // UPDATE FILTERS
  // ==========================================

  updateSearch(value: string): void {

    this.searchText.set(value);
    this.currentPage.set(1);
  }

  updateRole(value: string): void {

    if (
      value !== 'All' &&
      !this.roles.includes(value as UserRole)
    ) {
      return;
    }

    this.selectedRole.set(value as RoleFilter);
    this.currentPage.set(1);
  }

  updateStatus(value: string): void {

    if (
      value !== 'All' &&
      !this.statuses.includes(value as UserStatus)
    ) {
      return;
    }

    this.selectedStatus.set(value as StatusFilter);
    this.currentPage.set(1);
  }

  clearFilters(): void {

    this.searchText.set('');
    this.selectedRole.set('All');
    this.selectedStatus.set('All');
    this.currentPage.set(1);
  }

  // ==========================================
  // PAGINATION ACTIONS
  // ==========================================

  nextPage(): void {

    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  previousPage(): void {

    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  // ==========================================
  // OPEN ADD USER
  // ==========================================

  openAddUser(): void {

    this.editingUserId.set(null);
    this.userForm.set(emptyForm());
    this.formError.set('');
    this.showUserModal.set(true);
  }

  // ==========================================
  // OPEN EDIT USER
  // ==========================================

  openEditUser(user: User): void {

    this.editingUserId.set(user.id);

    this.userForm.set({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status
    });

    this.formError.set('');
    this.showUserModal.set(true);
  }

  // ==========================================
  // UPDATE FORM FIELD
  // ==========================================

  updateFormField<K extends keyof UserForm>(
    field: K,
    value: UserForm[K]
  ): void {

    this.userForm.update(form => ({
      ...form,
      [field]: value
    }));

    this.formError.set('');
  }

  // ==========================================
  // SAVE USER
  // ==========================================

  saveUser(): void {

    const form = this.userForm();

    const name = form.name.trim();

    const email = form.email.trim().toLowerCase();

    const department = form.department.trim();

    if (!name || !email || !department) {

      this.formError.set(
        'Please fill in all required fields.'
      );

      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

      this.formError.set(
        'Please enter a valid email address.'
      );

      return;
    }

    const editingId = this.editingUserId();

    const duplicateEmail = this.users().some(
      user =>
        user.email.toLowerCase() === email &&
        user.id !== editingId
    );

    if (duplicateEmail) {

      this.formError.set(
        'A user with this email already exists.'
      );

      return;
    }

    if (editingId !== null) {

      // Update an existing sample user.

      this.users.update(users =>
        users.map(user =>
          user.id === editingId
            ? {
              ...user,
              name,
              email,
              department,
              role: form.role,
              status: form.status
            }
            : user
        )
      );

      this.successMessage.set(
        'User updated successfully.'
      );

    } else {

      // Generate a demo ID without backend access.

      const nextId =
        Math.max(
          1000,
          ...this.users().map(user => user.id)
        ) + 1;

      const newUser: User = {
        id: nextId,
        name,
        email,
        role: form.role,
        department,
        status: form.status,
        createdOn: new Date()
          .toISOString()
          .slice(0, 10)
      };

      this.users.update(users => [
        newUser,
        ...users
      ]);

      this.successMessage.set(
        'User added successfully.'
      );
    }

    this.clearFilters();
    this.closeUserModal();
  }

  // ==========================================
  // CLOSE USER MODAL
  // ==========================================

  closeUserModal(): void {

    this.showUserModal.set(false);
    this.editingUserId.set(null);
    this.formError.set('');
  }

  // ==========================================
  // CHANGE USER STATUS
  // ==========================================

  toggleUserStatus(user: User): void {

    const newStatus: UserStatus =
      user.status === 'Active'
        ? 'Inactive'
        : 'Active';

    this.users.update(users =>
      users.map(item =>
        item.id === user.id
          ? {
            ...item,
            status: newStatus
          }
          : item
      )
    );

    this.successMessage.set(
      `${user.name} is now ${newStatus.toLowerCase()}.`
    );
  }

  // ==========================================
  // DELETE USER
  // ==========================================

  confirmDelete(user: User): void {

    this.deletingUser.set(user);
  }

  cancelDelete(): void {

    this.deletingUser.set(null);
  }

  deleteUser(): void {

    const user = this.deletingUser();

    if (!user) {
      return;
    }

    this.users.update(users =>
      users.filter(item => item.id !== user.id)
    );

    this.deletingUser.set(null);

    this.currentPage.set(
      Math.min(this.currentPage(), this.totalPages())
    );

    this.successMessage.set(
      `${user.name} deleted successfully.`
    );
  }

  // ==========================================
  // CLOSE MESSAGE
  // ==========================================

  dismissMessage(): void {

    this.successMessage.set('');
  }

  // ==========================================
  // DISPLAY USER INITIALS
  // ==========================================

  getInitials(name: string): string {

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }
}

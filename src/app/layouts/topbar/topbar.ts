
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  signal
} from '@angular/core';

import { Router } from '@angular/router';

import {
  ProjectSwitchStore
} from '../../core/stores/project-switch.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {

  // ==========================================
  // DEPENDENCY INJECTION
  // ==========================================

  private readonly elementRef =
    inject(ElementRef<HTMLElement>);

  private readonly router = inject(Router);

  readonly projectStore = inject(ProjectSwitchStore);

  // ==========================================
  // SIDEBAR INPUT / OUTPUT
  // ==========================================

  @Input()
  menuOpen = false;

  @Output()
  menuToggle = new EventEmitter<void>();

  // ==========================================
  // TOPBAR SIGNALS
  // ==========================================

  readonly profileOpen = signal(false);

  readonly switchOpen = signal(false);

  readonly query = signal('');

  // ==========================================
  // SETTINGS STATE
  // ==========================================

  readonly supportsSettings =
    this.projectStore.supportsSettings;

  readonly isSettingsView =
    this.projectStore.isSettingsView;

  // ==========================================
  // SIDEBAR TOGGLE
  // ==========================================

  toggleSidebar(): void {

    this.closePopups();

    this.menuToggle.emit();
  }

  // ==========================================
  // PROFILE DROPDOWN
  // ==========================================

  toggleProfile(): void {

    this.switchOpen.set(false);

    this.profileOpen.update(value => !value);
  }

  // ==========================================
  // PROJECT SWITCH POPUP
  // ==========================================

  toggleProjectSwitch(): void {

    this.profileOpen.set(false);

    this.switchOpen.update(value => !value);
  }

  // ==========================================
  // SWITCH PROJECT
  // ==========================================

  selectProject(projectId: string): void {

    this.closePopups();

    this.projectStore.switchProject(projectId);
  }

  // ==========================================
  // OPEN SETTINGS
  // CONNECT AND LEARN HUB
  // ==========================================

  openSettings(): void {

    this.closePopups();

    if (!this.supportsSettings()) {
      return;
    }

    this.projectStore.openSettings();
  }

  // ==========================================
  // PROJECT HOME
  // ==========================================

  openProjectHome(): void {

    this.closePopups();

    this.projectStore.openProjectHome();
  }

  // ==========================================
  // CHECK SETTINGS VIEW
  // ==========================================

  routerIsSettings(): boolean {

    return this.isSettingsView();
  }

  // ==========================================
  // CONNECT LOGO CLICK
  // ==========================================

  navigateHome(): void {

    this.openProjectHome();
  }

  // ==========================================
  // SIGN OUT - DEMO
  // ==========================================

  signOutDemo(): void {

    this.closePopups();

    // Demo navigation only.
    // Replace with actual logout service later.
    void this.router.navigateByUrl('/login');
  }

  // ==========================================
  // CLOSE ALL POPUPS
  // ==========================================

  private closePopups(): void {

    this.profileOpen.set(false);

    this.switchOpen.set(false);
  }

  // ==========================================
  // CLICK OUTSIDE
  // ==========================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    const host = this.elementRef.nativeElement;

    // Click outside Topbar.
    if (!host.contains(target)) {

      this.closePopups();

      return;
    }

    const element =
      target instanceof Element
        ? target
        : target.parentElement;

    if (!element) {
      this.closePopups();
      return;
    }

    // Close profile when clicking outside profile.
    if (!element.closest('.profile')) {
      this.profileOpen.set(false);
    }

    // Close switch when clicking outside switch.
    if (!element.closest('.project-switch')) {
      this.switchOpen.set(false);
    }
  }

  // ==========================================
  // ESCAPE KEY
  // ==========================================

  @HostListener('document:keydown.escape')
  onEscape(): void {

    this.closePopups();
  }
}

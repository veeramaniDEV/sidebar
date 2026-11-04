
import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { Footer } from '../footer/footer';



@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [RouterOutlet, Topbar, Sidebar, Footer],
  templateUrl: './landing-layout.html',
  styleUrl: './landing-layout.css'
})
export class LandingLayout {

  // Mobile sidebar visibility
  readonly sidebarOpen = signal(false);

  // Desktop sidebar: expanded by default
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth >= 1024) {
      this.sidebarCollapsed.update(value => !value);
    } else {
      this.sidebarOpen.update(value => !value);
    }
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.closeSidebar();
    }
  }
}

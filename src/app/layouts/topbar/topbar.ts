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

import { RouterLink } from '@angular/router';

import { ProjectSwitchStore } from '../../core/stores/project-switch.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly projectStore = inject(ProjectSwitchStore);

  @Input() menuOpen = false;

  @Output()
  menuToggle = new EventEmitter<void>();

  readonly profileOpen = signal(false);

  // Controls the project switch popup
  readonly switchOpen = signal(false);

  readonly query = signal('');

  toggleProfile(): void {
    this.switchOpen.set(false);
    this.profileOpen.update(value => !value);
  }

  toggleProjectSwitch(): void {
    this.profileOpen.set(false);
    this.switchOpen.update(value => !value);
  }

  selectProject(projectId: string): void {
    this.switchOpen.set(false);
    this.profileOpen.set(false);

    this.projectStore.switchProject(projectId);
  }

  // Close popup when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (
      target instanceof Node &&
      !this.elementRef.nativeElement.contains(target)
    ) {
      this.switchOpen.set(false);
      this.profileOpen.set(false);
    }
  }

  // Close popup using Escape
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.switchOpen.set(false);
    this.profileOpen.set(false);
  }
}

import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.html'
})
export class Login {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly showPassword = signal(false);

  // Demo credentials only
  private readonly demoEmail = 'test@cognethro.com';
  private readonly demoPassword = 'Test@123';

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  login(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Required',
        detail: 'Please enter your email and password.',
        life: 3000
      });
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    if (
      email.trim().toLowerCase() === this.demoEmail &&
      password === this.demoPassword
    ) {
      void this.router.navigateByUrl('/app/dashboard');
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: 'Invalid email or password.',
        life: 3000
      });
    }
  }
}

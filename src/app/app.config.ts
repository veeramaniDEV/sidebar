
import {
  ApplicationConfig,
  provideZoneChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';

import { providePrimeNG } from 'primeng/config';

import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

import { routes } from './app.routes';

// CONNECT Custom Theme
const ConnectPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#7c3aed',
          contrastColor: '#ffffff',
          hoverColor: '#6d28d9',
          activeColor: '#5b21b6'
        },
        highlight: {
          background: '#f3e8ff',
          focusBackground: '#e9d5ff',
          color: '#6d28d9',
          focusColor: '#5b21b6'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [

    // Angular Change Detection
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    // Angular Routing
    provideRouter(routes),

    // PrimeNG Configuration
    providePrimeNG({
      theme: {
        preset: ConnectPreset,
        options: {
          prefix: 'p',
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, components, utilities'
          }
        }
      },

      ripple: true
    })

  ]
};

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
@Component({selector:'app-placeholder',standalone:true,imports:[RouterLink],template:`<section class="panel" style="padding:35px;min-height:230px"><h1 style="text-transform:capitalize">{{name}}</h1><p style="color:#7b86a2">This page is ready for your feature implementation.</p><a routerLink="/app/dashboard" style="color:#7426db;font-weight:700">← Back to Dashboard</a></section>`})
export class Placeholder {private router=inject(Router);get name(){return this.router.url.split('/').pop()?.replaceAll('-',' ') ?? 'Workspace'}}

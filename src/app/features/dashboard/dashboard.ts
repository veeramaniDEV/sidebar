import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
interface Stat {title:string;value:string;icon:string;trend:string;direction:'up'|'down';tone:'pink'|'purple';points:string}
@Component({selector:'app-dashboard',standalone:true,imports:[RouterLink,DatePipe],templateUrl:'./dashboard.html',styleUrl:'./dashboard.css'})
export class Dashboard {
 readonly Math=Math;
 readonly today=new Date();
 readonly stats:Stat[]=[
 {title:'Total Clients',value:'248',icon:'pi pi-users',trend:'12%',direction:'up',tone:'pink',points:'0,34 20,18 40,25 60,7 80,13'},
 {title:'Open Tickets',value:'36',icon:'pi pi-file-edit',trend:'8%',direction:'up',tone:'purple',points:'0,35 20,19 40,26 60,6 80,12'},
 {title:'Active Processes',value:'18',icon:'pi pi-cog',trend:'5%',direction:'up',tone:'pink',points:'0,35 20,16 40,23 60,7 80,12'},
 {title:'Transitions',value:'12',icon:'pi pi-sync',trend:'20%',direction:'up',tone:'purple',points:'0,34 20,18 40,24 60,6 80,12'}];
 readonly months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'];
 readonly completed=[10,16,12,20,21,27,19,16,21,24]; readonly inProgress=[10,10,7,8,12,12,21,27,25,29];
 chartPoints(values:number[]):string{return values.map((v,i)=>`${40+i*67},${218-v*5}`).join(' ')}
 readonly tickets=[{id:1001,title:'Access request',status:'Open',date:'08 Oct 2026'},{id:1002,title:'Process update',status:'In Progress',date:'08 Oct 2026'},{id:1003,title:'File upload issue',status:'Resolved',date:'07 Oct 2026'},{id:1004,title:'Billing query',status:'Open',date:'07 Oct 2026'},{id:1005,title:'Dashboard error',status:'In Progress',date:'06 Oct 2026'}];
 readonly activities=[{text:'You logged in to the system',time:'10:24 AM'},{text:'Process "Employee Onboarding" updated',time:'Yesterday'},{text:'New ticket #1004 created',time:'2 days ago'}];
 readonly actions=[{text:'Create Ticket',icon:'pi pi-file-edit',url:'/app/tickets',tone:'pink'},{text:'Upload File',icon:'pi pi-upload',url:'/app/file-manager',tone:'purple'},{text:'Add Process',icon:'pi pi-cog',url:'/app/processes',tone:'pink'},{text:'Manage Team',icon:'pi pi-users',url:'/app/teams',tone:'purple'}];
}

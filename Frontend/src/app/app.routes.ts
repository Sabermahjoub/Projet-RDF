import { GestionProjetsComponent } from './components/gestion-projets/gestion-projets.component';
import { Route } from '@angular/router';


export const routes: Route[] = [
  {
    path: 'GestionProjets',
    component: GestionProjetsComponent,
    // canActivate: [AuthGuard],
    // children: [
    //   { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
    // ],
  }
];
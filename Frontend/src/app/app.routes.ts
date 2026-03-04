import { GestionProjetsComponent } from './components/gestion-projets/gestion-projets.component';
import { Route } from '@angular/router';
import { GestionRessourcesComponent } from './components/gestion-ressources/gestion-ressources.component';


export const routes: Route[] = [
  {
    path: 'GestionRessources',
    component: GestionRessourcesComponent
  },
  {
    path: 'GestionProjets',
    component: GestionProjetsComponent,
    // canActivate: [AuthGuard],
    // children: [
    //   { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
    // ],
  }
];
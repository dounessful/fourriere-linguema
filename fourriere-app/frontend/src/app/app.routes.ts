import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { agentGuard } from './core/guards/agent.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'resultat/:id',
    loadComponent: () => import('./features/public/resultat/resultat.component').then(m => m.ResultatComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'vehicule/nouveau',
        loadComponent: () => import('./features/admin/vehicule-form/vehicule-form.component').then(m => m.VehiculeFormComponent)
      },
      {
        path: 'vehicule/:id',
        loadComponent: () => import('./features/admin/vehicule-form/vehicule-form.component').then(m => m.VehiculeFormComponent)
      },
      {
        path: 'utilisateurs',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent)
      },
      {
        path: 'fourrieres',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/fourrieres/fourrieres.component').then(m => m.FourriereListComponent)
      },
      {
        path: 'equipes',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/equipes/equipes.component').then(m => m.EquipeListComponent)
      },
      {
        path: 'communes',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/communes/communes.component').then(m => m.CommunesComponent)
      },
      {
        path: 'transferts',
        loadComponent: () => import('./features/admin/transferts/transferts.component').then(m => m.TransfertsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'agent',
    canActivate: [agentGuard],
    children: [
      {
        path: 'vehicules',
        loadComponent: () => import('./features/agent/vehicules/agent-vehicules.component').then(m => m.AgentVehiculesComponent)
      },
      {
        path: '',
        redirectTo: 'vehicules',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

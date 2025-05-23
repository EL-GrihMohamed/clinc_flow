import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/core/guards/auth.guard';

export const appRoutes: Routes = [
    { path: '', loadComponent: () => import('./app/pages/landing/landing').then(m => m.Landing) },
    {
        path: '',
        component: AppLayout,
        canActivateChild: [authGuard],
        children: [
            {
                path: 'dashboard',
                // Change this line to load your comprehensive dashboard
                loadComponent: () => import('./app/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },
            {
                path: 'profile',
                loadComponent: () => import('./app/pages/profile/profile.component').then( m => m.ProfileComponent ),
            },
            {
                path: 'users',
                loadComponent: () => import('./app/pages/users/users.component').then( m => m.UsersComponent ),
            },
            {
                path: 'patients',
                loadComponent: () => import('./app/pages/patients/patients.component').then( m => m.PatientsComponent ),
            },
            {
                path: 'visit',
                loadComponent: () => import('./app/pages/visit/visit.component').then( m => m.VisitComponent ),
            },
            {
                path: 'uikit',
                loadChildren: () => import('./app/pages/uikit/uikit.routes'),
            },
            {
                path: 'pages',
                loadChildren: () => import('./app/pages/pages.routes'),
            },
        ],
    },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: 'notfound' },
];
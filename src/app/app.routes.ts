import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'components',
        loadComponent: () => import('./layouts/base-layout/base-layout.component').then(m => m.BaseLayoutComponent),
        children:[
            {
                path: 'forms',
                loadComponent: () => import('./pages/components/forms-page/forms-page.component').then(m => m.FormsPageComponent)
            }
        ]
    },
    {
        path: '',
        redirectTo: 'components',
        pathMatch: 'full'
    }
];

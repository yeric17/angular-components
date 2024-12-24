import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'components',
        loadComponent: () => import('./layouts/base-layout/base-layout.component').then(m => m.BaseLayoutComponent),
        children:[
            {
                path: 'forms',
                loadComponent: () => import('./pages/components/forms-page/forms-page.component').then(m => m.FormsPageComponent),
                children: [
                    {
                        path: 'select',
                        loadComponent: () => import('./pages/components/forms-page/select-page/select-page.component').then(m => m.SelectPageComponent)
                    }
                ]
            }
        ]
    },
    {
        path: '',
        redirectTo: 'components',
        pathMatch: 'full'
    }
];

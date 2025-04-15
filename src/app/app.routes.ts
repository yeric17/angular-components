import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'forms',
        loadComponent: () => import('./pages/components/forms-page/forms-page.component').then(m => m.FormsPageComponent),
        children: [
            {
                path: 'select',
                loadComponent: () => import('./pages/components/forms-page/select-page/select-page.component').then(m => m.SelectPageComponent)
            },
            {
                path: 'data-tag-text-editor',
                loadComponent: () => import('./pages/components/forms-page/data-tag-text-editor-page/data-tag-text-editor-page.component').then(m => m.DataTagTextEditorPageComponent)
            }
        ]
    },
    {
        path: 'components',
        loadComponent: () => import('./layouts/base-layout/base-layout.component').then(m => m.BaseLayoutComponent),
        children:[
            {
                path: 'file-reader',
                loadComponent: () => import('./components/file-reader/file-reader.component').then(m => m.FileReaderComponent)
            }
        ]
    },
    {
        path: '',
        redirectTo: 'components',
        pathMatch: 'full'
    }
];

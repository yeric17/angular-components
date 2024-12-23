import { Component } from '@angular/core';
import { SelectComponent } from '../../../components/forms/select/select.component';

@Component({
  selector: 'app-forms-page',
  standalone: true,
  imports: [SelectComponent],
  templateUrl: './forms-page.component.html',
  styleUrl: './forms-page.component.scss'
})
export class FormsPageComponent {
  items: any[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' }
  ]
}

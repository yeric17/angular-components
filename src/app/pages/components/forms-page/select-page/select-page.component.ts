import { Component } from '@angular/core';
import { SelectComponent } from '../../../../components/forms/select/select.component';
import { TypoComponent } from '../../../../components/typography/typo/typo.component';
import { SelectOptionComponent } from '../../../../components/forms/select/components/select-option/select-option.component';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'app-select-page',
  standalone: true,
  imports: [SelectComponent,TypoComponent,SelectOptionComponent],
  templateUrl: './select-page.component.html',
  styleUrl: './select-page.component.scss'
})
export class SelectPageComponent {
  items: Item[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' }
  ]

  itemSelect(selectedItem: Item|undefined) {
    console.log('Selected item:', selectedItem);
  }
}

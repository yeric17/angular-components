import { Component } from '@angular/core';
import { SelectComponent } from '../../../../components/forms/select/select.component';
import { TypoComponent } from '../../../../components/typography/typo/typo.component';
import { getExampleModelItems } from '../../../../components/forms/select/data/select-dummy-data';


interface Item {
  id: number;
  name: string;
  img?: string
}

@Component({
  selector: 'app-select-page',
  standalone: true,
  imports: [SelectComponent,TypoComponent],
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

  itemsWithImage: Item[] = [
    { id: 1, name: 'Item 1', img: 'https://picsum.photos/id/237/200/300' },
    { id: 2, name: 'Item 2', img: 'https://picsum.photos/id/238/200/300' },
    { id: 3, name: 'Item 3', img: 'https://picsum.photos/id/239/200/300' },
    { id: 4, name: 'Item 4', img: 'https://picsum.photos/id/240/200/300' },
    { id: 5, name: 'Item 5', img: 'https://picsum.photos/id/241/200/300' }
  ]
  
  manyItems: Item[] = getExampleModelItems(4000)

  itemSelect(selectedItem: Item|undefined) {
    console.log('Selected item:', selectedItem);
  }
}

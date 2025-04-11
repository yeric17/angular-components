import { Component, model } from '@angular/core';

@Component({
    selector: 'app-accordion-item',
    imports: [],
    templateUrl: './accordion-item.component.html',
    styleUrl: './accordion-item.component.scss'
})
export class AccordionItemComponent {
  isOpen = model<boolean>(false);

  toggle() {
    this.isOpen.set(!this.isOpen());
  }
}

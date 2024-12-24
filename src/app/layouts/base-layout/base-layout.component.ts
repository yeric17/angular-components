import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AccordionComponent } from '../../components/accordion/accordion.component';
import { AccordionItemComponent } from '../../components/accordion/accordion-item/accordion-item.component';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink,AccordionComponent,AccordionItemComponent],
  templateUrl: './base-layout.component.html',
  styleUrl: './base-layout.component.scss'
})
export class BaseLayoutComponent {

}

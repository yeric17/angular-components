
import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'ml-select-option',
  standalone: true,
  imports: [],
  templateUrl: './select-option.component.html',
  styleUrl: './select-option.component.scss'
})
export class SelectOptionComponent {
  name = input.required<string>();
  type = model<'radio' | 'checkbox'>('radio');
  value = input.required<string>();
  checked = model<boolean>(false);
  OnItemChange = output<Event>();
  show = model<boolean>(true);

  ItemChange(event: Event) {
    this.OnItemChange.emit(event);
  }
}

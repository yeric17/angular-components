
import { Component, input, model, OnInit, output } from '@angular/core';

@Component({
    selector: 'ml-select-option',
    imports: [],
    templateUrl: './select-option.component.html',
    styleUrl: './select-option.component.scss'
})
export class SelectOptionComponent implements OnInit {
  name = input.required<string>();
  type = model<'radio' | 'checkbox'>('radio');
  value = input.required<string>();
  checked = model<boolean>(false);
  onItemChange = output<Event>();
  onItemInit = output();
  show = model<boolean>(true);



  ngOnInit(): void {
    this.onItemInit.emit();
  }

  ItemChange(event: Event) {
    this.onItemChange.emit(event);
  }


}

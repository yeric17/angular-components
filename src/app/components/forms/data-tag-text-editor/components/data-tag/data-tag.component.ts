import { Component, input, model, OnInit, output } from '@angular/core';
import { Tag } from '../../models/text-editor-model';

@Component({
  selector: 'app-data-tag',
  imports: [],
  templateUrl: './data-tag.component.html',
  styleUrl: './data-tag.component.scss'
})
export class DataTagComponent  {
  tag = model.required<Tag>();

  onRemoveTag = output<Tag>();
  onSelectTag = output<Tag>();
  

  protected uniqueId = Math.random().toString(36).substring(2, 15);

  protected visible = input<boolean>(false);

  

  removeTag(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.onRemoveTag.emit(this.tag());
  }

  selectTag(event: MouseEvent) {
    event.stopPropagation();
    this.onSelectTag.emit(this.tag());
  }

  updateTagName(event: Event) {
    const element = event.target as HTMLInputElement;
    this.tag.update(tag => {
      tag.name = element.value;
      return tag;
    })
  }
  
}

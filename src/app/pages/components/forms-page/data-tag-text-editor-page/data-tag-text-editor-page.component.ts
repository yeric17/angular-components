import { Component, signal } from '@angular/core';
import { DataTagTextEditorComponent } from '../../../../components/forms/data-tag-text-editor/data-tag-text-editor.component';
import { TextEditorData } from '../../../../components/forms/data-tag-text-editor/models/text-editor-test.models';
import { Tag } from '../../../../components/forms/data-tag-text-editor/models/text-editor-model';
import { SelectComponent } from '../../../../components/forms/select/select.component';

@Component({
  selector: 'app-data-tag-text-editor-page',
  imports: [DataTagTextEditorComponent],
  templateUrl: './data-tag-text-editor-page.component.html',
  styleUrl: './data-tag-text-editor-page.component.scss'
})
export class DataTagTextEditorPageComponent {
  tags = signal<Tag[]>([]);
  

  checkInsertTag(event: KeyboardEvent) {
    return event.key === '#';
  }
}

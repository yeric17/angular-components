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
  tagList = signal<Tag[]>([
    {
      id: '1',
      name: 'John Doe',
      data: {
        email: 'john.doe@example.com',
        phone: '+1 555-123-4567'
      },
    },
    {
      id: '2',
      name: 'Jane Smith',
      data: {
        email: 'jane.smith@example.com',
        phone: '+1 555-234-5678'
      },
    },
    {
      id: '3',
      name: 'Carlos Rodriguez',
      data: {
        email: 'carlos.rodriguez@example.com',
        phone: '+1 555-345-6789'
      },
    },
    {
      id: '4',
      name: 'Maria Garcia',
      data: {
        email: 'maria.garcia@example.com',
        phone: '+1 555-456-7890'
      },
    },
    {
      id: '5',
      name: 'Alex Johnson',
      data: {
        email: 'alex.johnson@example.com',
        phone: '+1 555-567-8901'
      }
    }
  ]);
  

  checkInsertTag(event: KeyboardEvent) {
    return event.key === '#'
  }
}

import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-reader',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './file-reader.component.html',
  styleUrl: './file-reader.component.scss'
})
export class FileReaderComponent {

  //#region Inputs
  isMultiple = input<boolean>(false);
  //#endregion
  //#region Outputs
  onFilesChange = output<File[]>();
  //#endregion

  protected isDragOver:boolean = false;
  protected canDrop:boolean = true;

  protected fileList = signal<FileList|undefined>(undefined);
  protected filesArray = computed(() => {
    return Array.from(this.fileList() || []);
  });

  onFileChange(event:Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;



  }
  onDragOver(event:DragEvent) {
    event.preventDefault();
    this.isDragOver = true;

    const files = event.dataTransfer?.files;

    this.fileList.set(files);

    if(!this.isMultiple() && this.filesArray().length > 1) {
      this.canDrop = false;
    }

  }
  onDragLeave(event:DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }
  onDrop(event:DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
  }


  
}

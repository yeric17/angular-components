import { Component, ElementRef, inject, input, model, output, Renderer2, signal, viewChild } from '@angular/core';
import { Tag } from './models/text-editor-model';
import { commands } from './data/text-editor-commands.data';
import { DataTagComponent } from './components/data-tag/data-tag.component';

@Component({
  selector: 'app-data-tag-text-editor',
  imports: [DataTagComponent],
  templateUrl: './data-tag-text-editor.component.html',
  styleUrl: './data-tag-text-editor.component.scss'
})
export class DataTagTextEditorComponent {

  //#region DOM Elements
  protected editorInput = viewChild('editorInput',{read: ElementRef<HTMLDivElement>});
  protected currentParagraph = viewChild('paragraph',{read: ElementRef<HTMLParagraphElement>});
  //#endregion

  //#region Injections
  protected rederer = inject(Renderer2);
  //#endregion

  //#region Properties
  protected commands = commands;
  protected caretPosition = signal<any>(0);
  protected selectedTag = signal<Tag | null>(null);
  //#endregion
  
  //#region Inputs
  tags = model.required<Tag[]>();
  placeholder = model<string>('');
  isInsertingTag = input<(event:KeyboardEvent) => boolean>((event:KeyboardEvent) => {
    return event.key === '@';
  });
  //#endregion

  //#region Outputs
  onTagAdded = output<Tag>();
  onTagRemoved = output<Tag>();
  onTagSelected = output<Tag>();
  
  //#endregion


  //#region Event Methods
  inputChange(event: Event) {
    const element = event.target as HTMLElement;
    const value = element.innerText;

    
    
  }
  keyDown(event: KeyboardEvent) {
    this.checkCommands(event);

    this.updateCaretPosition();
  }
  //#endregion


  //#region Methods
  checkCommands(event: KeyboardEvent) {
    for (const command of this.commands()) {
      if (command.shouldExecute(event)) {
        command.command(() => {
          const editorInputElement = this.editorInput()?.nativeElement as HTMLDivElement;
          if(editorInputElement.childNodes.length === 1 && editorInputElement.textContent === ''){
            event.preventDefault();
          }
        });
      }
    }
    if(this.isInsertingTag()(event)){
      
    }
  }

  updateCaretPosition() {
    
    const selection = window.getSelection();

    if (!selection) return;

    let caretPosition = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : 0;

    const paragraph = this.currentParagraph()?.nativeElement as HTMLParagraphElement;

    if(paragraph.contains(selection.anchorNode as Node)){
      this.caretPosition.set(caretPosition);
    }

  }

  addTag(tagName: string, data?: any) {
    const id = this.generateRandomId();
    const tag = {
      id,
      name: tagName,
      data: data,
      selected: false
    };

    this.tags.update((tags) => {
      return [...tags, tag]
    })
    this.onTagAdded.emit(tag);
  }

  removeTag(tagId: string) {
    let tag: Tag | undefined = undefined;
    this.tags.update((tags) => {
      tag = tags.find(tag => tag.id === tagId);
      if (tag) {
        this.onTagRemoved.emit(tag);
      }
      return tags.filter(tag => tag.id !== tagId);
    });
  }

  createTagComponent(tag: Tag) {
    const tagElement = this.rederer.createElement('app-data-tag', tag.id);
    this.rederer.setAttribute(tagElement, 'id', tag.id);
    this.rederer.setProperty(tagElement, 'tag', tag);
    this.rederer.listen(tagElement, 'click', (event: MouseEvent) => {
      event.stopPropagation();
      this.onTagSelected.emit(tag);
    });
    return tagElement;
  }

  generateRandomId(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  //#end region
}

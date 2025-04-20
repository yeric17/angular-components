import { Component, ComponentRef, ElementRef, inject, input, model, OnInit, output, Renderer2, signal, viewChild, ViewContainerRef } from '@angular/core';
import { EditorStateMachine, Tag, TextEditorCommand } from './models/text-editor-model';
import { commands, editorStates } from './data/text-editor-commands.data';
import { DataTagComponent } from './components/data-tag/data-tag.component';
import { DataTagSearchComponent } from './components/data-tag-search/data-tag-search.component';

const DATA_TAG_ELEMENT_NAME = 'APP-DATA-TAG';
const DATA_TAG_SEARCH_ELEMENT_NAME = 'APP-DATA-TAG-SEARCH';


@Component({
  selector: 'app-data-tag-text-editor',
  imports: [DataTagComponent],
  templateUrl: './data-tag-text-editor.component.html',
  styleUrl: './data-tag-text-editor.component.scss'
})
export class DataTagTextEditorComponent implements OnInit {

  //#region DOM Elements
  protected editorInput = viewChild('editorInput', { read: ElementRef<HTMLDivElement> });
  protected originParagraphElement = viewChild('paragraph', { read: ElementRef<HTMLParagraphElement> });
  protected paragraphContainerRef = viewChild('paragraphContainer', { read: ViewContainerRef });
  protected currentParagraph:HTMLParagraphElement | null = null;
  //#endregion

  //#region Injections
  protected renderer = inject(Renderer2);
  //#endregion

  //#region Properties
  protected commands = commands;
  protected caretPosition = signal<Range | null>(null);
  protected selectedTag = signal<Tag | null>(null);
  protected editorStateMachine = signal<EditorStateMachine>(new EditorStateMachine(editorStates, editorStates[0]));
  protected insertCommand = this.commands().find((command) => command.name === 'InsertTag')!;

  protected pendingCommand = signal<TextEditorCommand | null>(null);
  protected searchTagComponent = signal<ComponentRef<DataTagSearchComponent> | null>(null);
  //#endregion

  //#region Inputs
  tags = model.required<Tag[]>();
  placeholder = model<string>('');
  isInsertingTag = input<(event: KeyboardEvent) => boolean>((event: KeyboardEvent) => {
    return event.key === '@';
  });
  //#endregion

  //#region Outputs
  onTagAdded = output<Tag>();
  onTagRemoved = output<Tag>();
  onTagSelected = output<Tag>();

  //#endregion

  //#region Lifecycle Hooks
  ngOnInit() {
    this.commands.update((prev) => {
      let insertCommand = prev.find((command) => command.name === 'InsertTag');
      if (insertCommand) {
        insertCommand.shouldExecute = this.isInsertingTag();
      }
      return prev;
    });
    this.currentParagraph = this.originParagraphElement()?.nativeElement;
  }
  //#endregion

  //#region Event Methods
  inputChange(event: Event) {
    const element = event.target as HTMLElement;

    this.editorStateMachine().update();

    if (!this.originParagraphElement()?.nativeElement.querySelector('br')) {
      const br = this.renderer.createElement('br');
      this.renderer.appendChild(this.originParagraphElement()?.nativeElement, br);
    }
    this.updateCaretPosition();
    this.searchTagComponent()?.instance.inputChange();
  }

  keyDown(event: KeyboardEvent) {
    this.updateCaretPosition();
    this.checkCommands(event);


    if(this.isNavigatingOnTags(event)) {
      event.preventDefault();
      const searchTagComponent = this.searchTagComponent()?.instance as DataTagSearchComponent;
      if (searchTagComponent) {
        searchTagComponent.navigate(event);
      }
    }


  }

  isNavigatingOnTags(event: KeyboardEvent): boolean {
    return this.editorStateMachine().currentState?.name === 'searching-tag' && event.key === 'ArrowDown' || event.key === 'ArrowUp';
  }

  isTagSelectionConfirmed(): boolean {
    return this.editorStateMachine().currentState?.name === 'searching-tag' &&  this.selectedTag() !== null;
  }


  keyUp(event: KeyboardEvent) {
    this.updateCaretPosition();
    if (this.pendingCommand() !== null) {
      this.pendingCommand()!.command(() => {
        this.insertTagCommandBehavior();
        this.pendingCommand.set(null);
      });
    }

  }

  keyPress(event: KeyboardEvent) {
    this.updateCaretPosition();
    if (this.insertCommand.shouldExecute(event)) {
      event.preventDefault()
      this.pendingCommand.set(this.insertCommand);
    }
  }



  focus() {
    this.updateCaretPosition();
  }

  blur() {
    // this.editorStateMachine().changeStateByName('Idle');
  }
  //#endregion


  //#region Methods
  checkCommands(event: KeyboardEvent) {
    for (const command of this.commands()) {
      if (command.shouldExecute(event)) {
        if (command.name === 'Delete') {
          command.command(() => this.deleteCommandBehavior(event));
        }
        if (command.name === 'ConfirmTag') {
          command.command(() => {
            if (this.isTagSelectionConfirmed()) {
              event.preventDefault();

              this.createTagComponent(this.selectedTag()!, this.searchTagComponent()!);
              
              this.searchTagComponent.set(null);
              this.selectedTag.set(null);
              this.editorStateMachine().changeStateByName('Idle');
              return;
            }
            if(event.key === 'Enter') {
              const placeholderElement = this.renderer.createElement('span');
              this.caretPosition()?.insertNode(placeholderElement);

              this.currentParagraph = placeholderElement.parentElement as HTMLParagraphElement;

              if (placeholderElement.parentElement) {
                placeholderElement.parentElement.removeChild(placeholderElement);
              }
            }
          });
        }
      }
    }
  }

  deleteCommandBehavior(event: KeyboardEvent) {
    const editorInputElement = this.editorInput()?.nativeElement as HTMLDivElement;

    const originParagraph = this.originParagraphElement()?.nativeElement as HTMLElement;

    if (editorInputElement.childNodes.length === 1 && editorInputElement.textContent?.length === 1) {
      event.preventDefault();
      // Clear the paragraph when only a single character remains
      const textNode = Array.from(originParagraph.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        originParagraph.removeChild(textNode);
      }
    }

    if (editorInputElement.childNodes.length === 1 && editorInputElement.textContent === '') {
      event.preventDefault();
    }
  }

  insertTagCommandBehavior() {
    this.editorStateMachine().changeStateByName('searching-tag');
    this.createSearchTagComponent();
  }

  createSearchTagComponent() {
    const caretPosition = this.caretPosition();
    if (caretPosition === null) return;

    // Crear el componente correctamente dentro del ViewContainerRef
    const componentRef = this.paragraphContainerRef()?.createComponent(DataTagSearchComponent);
    if (!componentRef) return;

    componentRef.setInput('initialChart', '#'); // Corrige el nombre del input también
    componentRef.setInput('tags', this.tags());

    componentRef.instance.onChangeTagSelected.subscribe((tag: Tag) => {
      this.selectedTag.set(tag);
    })

    this.searchTagComponent.set(componentRef);


    // Obtener el elemento renderizado del componente
    const nativeElement = componentRef.location.nativeElement;

    // Crear un span temporal como punto de inserción del caret
    const spanMarker = this.renderer.createElement('span');
    spanMarker.textContent = '\u200B'; // caracter invisible
    caretPosition.insertNode(spanMarker);

    // Mover el componente justo después del marcador
    spanMarker.parentNode?.insertBefore(nativeElement, spanMarker.nextSibling);



    // Limpiar el marcador
    spanMarker.remove();

    // Esperar a que el componente renderice
    setTimeout(() => {
      const input = nativeElement.querySelector('[data-focus]') as HTMLElement;
      input?.focus();

      if (input?.isContentEditable) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(input);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 2);
  }

  createTagComponent(tag: Tag, searchComponent:ComponentRef<DataTagSearchComponent>) {

    const componentRef = this.paragraphContainerRef()?.createComponent(DataTagComponent);
    if (!componentRef) return;

    componentRef.setInput('tag', tag);

    const nativeElement = componentRef.location.nativeElement;
    nativeElement.setAttribute('contenteditable', 'false');

    const textNode = this.renderer.createText(" ");

    this.renderer.appendChild(searchComponent.location.nativeElement, textNode);
    
    
    const searchComponentElement = searchComponent.location.nativeElement;

    setTimeout(() => {
      this.renderer.insertBefore(searchComponentElement.parentNode, nativeElement, searchComponentElement);
      componentRef.setInput('visible', true);
      searchComponent.destroy();
    }, 0);

      
    
    
  }

  updateCaretPosition() {

    const selection = window.getSelection();

    if (!selection) return;

    let caretPosition = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    const editorElement = this.editorInput()?.nativeElement as HTMLParagraphElement;

    if (editorElement.contains(selection.anchorNode as Node)) {

      this.caretPosition.set(caretPosition);
    }

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

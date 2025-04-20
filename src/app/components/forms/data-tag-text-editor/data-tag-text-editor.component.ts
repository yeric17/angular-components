import { Component, ComponentRef, ElementRef, inject, input, model, OnInit, output, Renderer2, signal, viewChild, ViewContainerRef } from '@angular/core';
import { EditorStateMachine, Tag, TextEditorCommand, TextEditorData, TextEditorItem, TextEditorItemType } from './models/text-editor-model';
import { commands, editorStates } from './data/text-editor-commands.data';
import { DataTagComponent } from './components/data-tag/data-tag.component';
import { DataTagSearchComponent } from './components/data-tag-search/data-tag-search.component';

const DATA_TAG_ELEMENT_NAME = 'APP-DATA-TAG';


@Component({
  selector: 'app-data-tag-text-editor',
  imports: [],
  templateUrl: './data-tag-text-editor.component.html',
  styleUrl: './data-tag-text-editor.component.scss'
})
export class DataTagTextEditorComponent implements OnInit {

  //#region DOM Elements
  protected editorInput = viewChild('editorInput', { read: ElementRef<HTMLDivElement> });
  protected originParagraphElement = viewChild('paragraph', { read: ElementRef<HTMLParagraphElement> });
  protected paragraphContainerRef = viewChild('paragraphContainer', { read: ViewContainerRef });
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

  protected insertedTags = signal<Tag[]>([]);
  protected removedTags = signal<Tag[]>([]);
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

    const mutationObserver = new MutationObserver((mutations) => {
      this.handleMutation(mutations);
    });
    mutationObserver.observe(this.editorInput()!.nativeElement, { childList: true, subtree: true });
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


    if (this.isNavigatingOnTags(event)) {
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
    return this.editorStateMachine().currentState?.name === 'searching-tag' && this.selectedTag() !== null;
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

  //#endregion


  //#region Methods

  handleMutation(mutations: MutationRecord[]) {

    console.log(mutations);
    for (const mutation of mutations) {
      if (mutation.addedNodes.length === 0 && mutation.removedNodes.length === 0) continue;
      if (mutation.addedNodes.item(0)?.nodeType === Node.ELEMENT_NODE && (mutation.addedNodes.item(0) as HTMLElement).tagName === 'BR') continue;
      if (mutation.removedNodes.item(0)?.nodeType === Node.ELEMENT_NODE && (mutation.removedNodes.item(0) as HTMLElement).tagName === 'BR') continue;

      if (mutation.addedNodes.length > 0) {
        this.handleAddedMutation(mutation);
        continue
      }
      if (mutation.removedNodes.length > 0) {
        this.handleRemovedMutation(mutation);
        continue
      }
    }

  }

  handleAddedMutation(mutation: MutationRecord) {
    // if (this.editorStateMachine().currentState?.name !== 'undo-changes') return;

    // const addedNode = mutation.addedNodes.item(0) as HTMLElement;

    
    // if (addedNode.tagName !== DATA_TAG_ELEMENT_NAME) return;

    // const innerSpan = addedNode.querySelector('span') as HTMLElement;
    
    // const tagId = innerSpan.getAttribute('data-tag-id');
    // const uniqueId = innerSpan.getAttribute('data-tag-uniqueid');



    // const tag = this.insertedTags().find(tag => tag.id === tagId);
    // if (tag === undefined) return;
    // const component = this.createTagComponent(tag)

    // if (!component) return;

    // const { element: tagElement } = component;

    // addedNode.replaceWith(tagElement);

  }

  handleRemovedMutation(mutation: MutationRecord) {

  }

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

              this.renderTagComponent(this.selectedTag()!, this.searchTagComponent()!);

              this.searchTagComponent.set(null);
              this.selectedTag.set(null);
              this.editorStateMachine().changeStateByName('Idle');
              return;
            }
          });
        }
        if (command.name === 'CTRL+Z') {
          command.command(() => {
            event.preventDefault();
            //TODO: Implement undo changes
            // this.editorStateMachine().changeStateByName('undo-changes');

            // const timeout = setTimeout(() => {
            //   this.editorStateMachine().changeStateByName('Idle');
            //   clearTimeout(timeout);
            // }, 2000);
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

  renderTagComponent(tag: Tag, searchComponent: ComponentRef<DataTagSearchComponent>) {

    const result = this.createTagComponent(tag);

    if (!result) return;

    const { component: componentRef, element: nativeElement } = result;


    const textNode = this.renderer.createText(" ");

    this.renderer.appendChild(searchComponent.location.nativeElement, textNode);


    const searchComponentElement = searchComponent.location.nativeElement;
    this.insertedTags.update((prev) => {
      return [...prev, tag]
    })

    setTimeout(() => {
      this.renderer.insertBefore(searchComponentElement.parentNode, nativeElement, searchComponentElement);
      componentRef.setInput('visible', true);
      searchComponent.destroy();
    }, 0);

  }


  createTagComponent(tag: Tag): { component: ComponentRef<DataTagComponent>, element: any } | null {
    const componentRef = this.paragraphContainerRef()?.createComponent(DataTagComponent);
    if (!componentRef) return null;

    componentRef.setInput('tag', tag);

    const nativeElement = componentRef.location.nativeElement;
    nativeElement.setAttribute('contenteditable', 'false');

    return { component: componentRef, element: nativeElement };
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

  editorToData(): TextEditorData[] {
    const editorInputElement = this.editorInput()?.nativeElement as HTMLDivElement;
    const editorData: TextEditorData[] = [];

    for (let i = 0; i < editorInputElement.childNodes.length; i++) {

      let currentEditorData: TextEditorData = {
        items: []
      }

      editorData.push(currentEditorData);

      const paragraphNode = editorInputElement.childNodes[i];

      if (this.isParagraphNode(paragraphNode)) {

        for (let j = 0; j < paragraphNode.childNodes.length; j++) {

          const node = paragraphNode.childNodes[j];

          const text = node.textContent || '';

          if (text.trim() === '' || node.nodeType == node.COMMENT_NODE) continue;

          let item: TextEditorItem = {
            type: TextEditorItemType.Text,
            content: text
          }

          if (this.isTagNode(node)) {
            item.type = TextEditorItemType.Tag;

            const tagComponent = node as HTMLElement;
            const tagId = tagComponent.querySelector('span')?.getAttribute('data-tag-id')

            const tagInserted = this.insertedTags().find(tag => tag.id === tagId);

            item.tag = tagInserted
          }

          currentEditorData.items.push(item);
        }
      }
    }

    return editorData;
  }


  isParagraphNode(node: Node): boolean {
    return node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'P';
  }

  isTagNode(node: Node): boolean {

    return node.nodeType === Node.ELEMENT_NODE &&
      (node as HTMLElement).nodeName === DATA_TAG_ELEMENT_NAME
  }

  //#endregion
}

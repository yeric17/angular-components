import { 
  ChangeDetectionStrategy, 
  Component, 
  contentChildren, 
  ElementRef, 
  forwardRef, 
  HostListener, 
  input, 
  model, 
  OnChanges, 
  OnInit, 
  output, 
  signal, 
  SimpleChanges, 
  TemplateRef, 
  viewChild
} from '@angular/core';
import { BaseOption, SelectableOption } from './models/select.models';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { SelectOptionComponent } from './components/select-option/select-option.component';

const OFFSET_BOUNDING = 10;

const VALUE_ACCESOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectComponent),
  multi: true
}

@Component({
  selector: 'ml-select',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, SelectOptionComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VALUE_ACCESOR]
})
export class SelectComponent<TItem> implements OnChanges, OnInit, ControlValueAccessor {

  // #region component references
  selectContainer = viewChild('selectContainer', { read: ElementRef })
  listWrapper = viewChild('listWrapper', { read: ElementRef })
  listElement = viewChild('selectList', { read: ElementRef })
  // #endregion

  // #region properties
  items = model<TItem[]|undefined>(undefined)
  itemsContent = signal<TItem[]>([])
  contentItems = signal<BaseOption[]>([])
  selectedItems = signal<SelectableOption<TItem>[]>([])
  selectableItems: SelectableOption<TItem>[] = []
  activeList = signal<boolean>(false);
  protected searchValue = signal<string>('');
  protected filteredItems = signal<SelectableOption<TItem>[]>([]);
  protected lazyLastIndex = signal<number>(0);
  protected verticalAlign = signal<'top' | 'bottom'>('bottom');
  protected horizontalAlign = signal<'left' | 'right'>('left');
  protected isDisabled = signal<boolean>(false)

  selectListMaxHeightPx: number = 0;
  formFieldPaddingXPx: number = 0;
  selectHeightPx: number = 0;
  selectListMinWidthPx: number = 0;
  // #endregion
  
  // #region inputs
  preSelectedItems = input<any[]>([])
  keyLabel = input<string>('label')
  keyValue = input<string>('value')
  placeholder = input<string>('Choose an item')
  multiple = input<boolean>(false)
  canSearch = input<boolean>(false)
  selectionTemplate = input<TemplateRef<any> | undefined>(undefined)
  optionTemplateRef = input<TemplateRef<any> | undefined>(undefined);
  size = input<'sm' | 'md' | 'lg'>('md')
  lazyLoadItemsNumber = input<number|undefined>(undefined)
  fullWidth = input<boolean>(false)
  // #endregion

  // #region outputs
  onSelectItems = output<TItem[]>()
  onSelectItem = output<TItem | undefined>()
  // #endregion

  protected uniqueId = this.generateUniqueId();

  // #region lifecycle
  ngOnInit(): void {
    this.lazyLastIndex.set(this.lazyLoadItemsNumber() ? this.lazyLoadItemsNumber()! - 1 : 0);

    this.initialSetup();


    console.log({lazyLoadItemsNumber: this.lazyLoadItemsNumber(), lazyLastIndex: this.lazyLastIndex()}) 

    this.listElement()?.nativeElement.addEventListener('scroll', (event: Event) => {

      const target = event.target as HTMLElement;
      const scrollHeight = target.scrollHeight;
      const scrollTop = target.scrollTop;
      const clientHeight = target.clientHeight;

      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      if(scrollBottom < 12 && this.lazyLoadItemsNumber()){
        
        this.lazyLastIndex.set(this.lazyLastIndex() + this.lazyLoadItemsNumber()!);
        this.updateFilteredItems()
      }

    });

    
    if (this.listWrapper()) {
      const computedStyle = window.getComputedStyle(this.listWrapper()?.nativeElement);
      const styleVal = computedStyle.getPropertyValue('--select-list-height');
      const paddingXVal = computedStyle.getPropertyValue('--form-field-padding-x');
      const headerHeight = computedStyle.getPropertyValue('--select-height');
      const widthVal = computedStyle.getPropertyValue('--select-list-min-width');
      
      
      const rootSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);

      this.selectListMaxHeightPx = styleVal.endsWith('rem')
        ? parseFloat(styleVal.replace(/rem|em|px|%/, '')) * rootSize
        : parseFloat(styleVal.replace(/rem|em|px|%/, ''));

      this.formFieldPaddingXPx = paddingXVal.endsWith('rem')
        ? parseFloat(paddingXVal.replace(/rem|em|px|%/, '')) * rootSize
        : parseFloat(paddingXVal.replace(/rem|em|px|%/, ''));

      this.selectHeightPx = headerHeight.endsWith('rem')
        ? parseFloat(headerHeight.replace(/rem|em|px|%/, '')) * rootSize
        : parseFloat(headerHeight.replace(/rem|em|px|%/, ''));

      this.selectListMinWidthPx = widthVal.endsWith('rem')
        ? parseFloat(widthVal.replace(/rem|em|px|%/, '')) * rootSize
        : parseFloat(widthVal.replace(/rem|em|px|%/, ''));
        

    }


  }

  ngOnChanges(changes: SimpleChanges): void {
    const { items } = changes;
    if (items && !items.firstChange) {
      const currentItems = this.items()
      if (!currentItems) return;
      this.setupByItems(currentItems);
    }
  }
  // #endregion

  // #region events
  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent): void {
    if (!event.target) return;
    const target = event.target as HTMLElement;
    if (!this.selectContainer()?.nativeElement.contains(target) && this.activeList()) {
      this.setActiveList(false);
    }
  }


  itemChange(event: Event) {

    const target = event.target as HTMLInputElement;
    const value = target.value;

    const checked = target.checked;
    if (!this.multiple()) {
      for (const item of this.selectableItems) {
        item.option.checked = item.option.value == value;
      }
    }
    else {
      const item = this.selectableItems.find(item => item.option.value == value);
      if (item) {
        item.option.checked = checked;
      }
    }

    let items = this.selectableItems.filter(item => item.option.checked);

    this.setSelectedItems(items);

    let originItems = items.map(item => item.originItem);


    this.onSelectItems.emit(originItems);
    this.onSelectItem.emit(originItems[0]);
    
    this.onChange(originItems)


    if (!this.multiple()) {
      this.setActiveList(false);
    }

    
  }
  // #endregion

  // #region methods


  initialSetup() {

    const items = this.items();

    if (items) {
      this.setupByItems(items);
      return;
    }

    let selectedItems = this.selectableItems.filter(item => item.option.checked);
    this.setSelectedItems(selectedItems);

    this.resetFilteredItems();
  }

  setupByItems(items: TItem[]) {

    this.selectableItems = items
      .map<SelectableOption<TItem>>(item => {
        let option: SelectableOption<TItem> = {
          option: {
            value: this.itemValue(item),
            label: this.itemLabel(item),
            checked: false
          },
          originItem: item
        }
        if (this.multiple()) {
          option.option.checked = this.preSelectedItems().some(defaultItem => this.itemValue(defaultItem) === this.itemValue(item))
        }
        else {
          option.option.checked = this.preSelectedItems().length > 0 && this.itemValue(this.preSelectedItems()[0]) === this.itemValue(item);
        }
        return option;
      })

    let selectedItems = this.selectableItems.filter(item => item.option.checked);

    this.setSelectedItems(selectedItems);

    this.updateFilteredItems();

    this.resetFilteredItems();
  }

  protected itemLabel(item: TItem): string {
    return (item as any)[this.keyLabel()];
  }

  protected itemValue(item: TItem): string {
    let value = (item as any)[this.keyValue()];
    return value ? value.toString() : '';
  }

  private setSelectedItems(items: SelectableOption<TItem>[]) {
    this.selectedItems.set(items);
  }

  toggleList() {
    this.setActiveList(!this.activeList());
  }

  resetFilteredItems() {
    this.lazyLastIndex.set(this.lazyLoadItemsNumber() ? this.lazyLoadItemsNumber()! - 1 : 0);
    const listElement = this.listElement()?.nativeElement as HTMLElement;
    listElement.scrollTop = 0;
    this.updateFilteredItems();
  }

  setActiveList(value: boolean) {
    if (!value) {
      this.searchValue.set('');
      this.resetFilteredItems();
    }

    if(value){
      this.updateListPosition();
    }

    this.activeList.set(value);
  }

  updateListPosition(){
    const boundingRect = this.selectContainer()?.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const distanceToBottom = viewportHeight - boundingRect.bottom;
    // const distanceToRight = viewportWidth - boundingRect.right;
    const distanceToLeft = boundingRect.left;

    let listHeight = this.selectListMaxHeightPx + (this.formFieldPaddingXPx * 2) + this.selectHeightPx + OFFSET_BOUNDING;

    const selectListWidthPx = this.selectContainer()?.nativeElement.getBoundingClientRect().width;

    const availableRightSpace = viewportWidth - (distanceToLeft + this.selectListMinWidthPx);

    if(availableRightSpace < 0 && (distanceToLeft + selectListWidthPx) > this.selectListMinWidthPx){
      this.horizontalAlign.set('right')
    }

    if((distanceToBottom - listHeight) < 0) {
      this.verticalAlign.set('top');
    }
    else {
      this.verticalAlign.set('bottom');
    }
  }

  search(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.searchValue.set(value);

    
    this.lazyLastIndex.set(this.lazyLoadItemsNumber() ? this.lazyLoadItemsNumber()! - 1 : 0);
    

    this.updateFilteredItems();

  }

  updateFilteredItems(){
    if(this.searchValue().trim() != ''){
      this.filteredItemsWithSearch();
    }
    else if(this.lazyLoadItemsNumber()){
      this.filteredItems.set(this.getLazyItemsFromArray(this.selectableItems));
    } else {
      this.filteredItems.set(this.selectableItems);
    }
  }

  filteredItemsWithSearch(){
    const items = this.selectableItems.filter(item =>
      item.option.label.toLowerCase().includes(this.searchValue().toLowerCase())
    );
    if(this.lazyLoadItemsNumber()){
      this.filteredItems.set(this.getLazyItemsFromArray(items));
    } else {
      this.filteredItems.set(items);
    }
  }


  getLazyItemsFromArray(array: SelectableOption<TItem>[]){
    return array.slice(0, this.lazyLastIndex() + 1);
  }



  private generateUniqueId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  }
  // #endregion

  // #region control value accessor methods
  writeValue(obj: TItem[]|TItem): void {
    this.onChange(obj);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled)
  }
  onChange = (value: any) => { };
  onTouched = () => { };
  // #endregion
}

import { Component, ElementRef, input, linkedSignal, model, OnChanges, OnInit, output, signal, viewChild } from '@angular/core';
import { commands } from '../../data/text-editor-commands.data';
import { Tag } from '../../models/text-editor-model';

@Component({
  selector: 'app-data-tag-search',
  imports: [],
  templateUrl: './data-tag-search.component.html',
  styleUrl: './data-tag-search.component.scss'
})
export class DataTagSearchComponent implements OnInit {

  //#region DOM Elements
  protected searchInput = viewChild('searchInput', { read: ElementRef<HTMLInputElement> });
  protected initialChart = signal<string>('');
  //#endregion



  //#region Inputs
  tags = input.required<Tag[]>();
  value =  model.required<string>();

  //#endregion

  //#region Outputs
  onChangeTagSelected = output<Tag|null>();
  onSearchFinished = output();
  //#endregion

  //#region Properties

  filteredTags = linkedSignal({
    source: this.value,
    computation: () => {
      const value = this.value().substring(1);
      if (!value) {
        return this.tags();
      }
      const filtered = [...this.tags().filter((tag) => tag.name.toLowerCase().includes(value.toLowerCase()))];
      if(filtered.length === 0){
        this.onChangeTagSelected.emit(null);
        
      }
      return filtered;
    }
  });

  protected selectedTag = linkedSignal({
    source: this.filteredTags,
    computation: () => {
      const tag = this.filteredTags()[0] ?? null;
      this.onChangeTagSelected.emit(tag);
      return tag;
    }
  });
  //#endregion


  ngOnInit(): void {

    const nativeElement = this.searchInput()?.nativeElement;

    this.initialChart.set(this.value());
    setTimeout(() => {
      nativeElement.focus();
    }, 20);

  }

  public inputChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    let value = target.value;

    if(!value.startsWith(this.initialChart())){
      this.onSearchFinished.emit();
      return;
    }

    this.value.set(value ?? '');

  }

  selectTag(tag: Tag): void {
    this.selectedTag.set(tag);
    this.onChangeTagSelected.emit(tag);
  }

  navigate(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const currentIndex = this.filteredTags().indexOf(this.selectedTag());
      const nextIndex = (currentIndex + 1) % this.filteredTags().length;
      this.selectedTag.set(this.filteredTags()[nextIndex]);
      this.onChangeTagSelected.emit(this.selectedTag());
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const currentIndex = this.filteredTags().indexOf(this.selectedTag());
      const prevIndex = (currentIndex - 1 + this.filteredTags().length) % this.filteredTags().length;
      this.selectedTag.set(this.filteredTags()[prevIndex]);
      this.onChangeTagSelected.emit(this.selectedTag());
      return;
    }
  }
}

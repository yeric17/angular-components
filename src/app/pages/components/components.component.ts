import { Component, OnInit, viewChild } from '@angular/core';
import { SelectComponent } from '../../components/forms/select/select.component';
import { JsonPipe } from '@angular/common';

type DataExplample = {
  id: number;
  name: string;
}

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [SelectComponent],
  templateUrl: './components.component.html',
  styleUrl: './components.component.scss'
})
export class ComponentsComponent implements OnInit {

  countries: DataExplample[] = [];
  selectedCountries: DataExplample[] = [];

  selectComponent = viewChild(SelectComponent<DataExplample>);

  ngOnInit() {
    this.GetAsyncCountries().then(countries => {
      this.countries = countries;
    });
  }

  SelectCountry(values: DataExplample[]) {
    this.selectedCountries = values;
  }

  GetAsyncCountries():Promise<DataExplample[]> {
    return new Promise<DataExplample[]>((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Argentina esto es un texto mucho mas grande' },
          { id: 2, name: 'Brazil' },
          { id: 3, name: 'Chile' },
          { id: 4, name: 'Colombia' },
          { id: 5, name: 'Ecuador' },
          { id: 6, name: 'Paraguay' },
          { id: 7, name: 'Peru' },
          { id: 8, name: 'Uruguay' },
          { id: 9, name: 'Venezuela' }
        ]);
      }, 1000);
    });
  }

  Remove(country: DataExplample) {
    this.selectComponent()?.UnselectItem(country);
  }
}
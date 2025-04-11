import { Component } from '@angular/core';
import { SelectComponent } from '../../../components/forms/select/select.component';
import { TypoComponent } from '../../../components/typography/typo/typo.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-forms-page',
    imports: [RouterOutlet],
    templateUrl: './forms-page.component.html',
    styleUrl: './forms-page.component.scss'
})
export class FormsPageComponent {

}

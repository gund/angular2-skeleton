import {Component, View} from 'angular2/angular2';
import {RouterLink} from 'angular2/router';

@Component({
    selector: 'component-1'
})
@View({
    // templateUrl: './components/home/home.html?v=<%= VERSION %>',
    template: `<%= includeAsString('./app/components/home/home.html') %>`,
    styles: [
        `<%= includeAsSass('./app/components/home/home.sass') %>`,
        `<%= includeAsSass('./app/components/home/home.sass', true) %>`
    ],
    directives: [RouterLink]
})
export class Home {}

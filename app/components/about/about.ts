import {Component, View, NgFor} from 'angular2/angular2';

import {NamesList} from '../../services/NameList';

@Component({
    selector: 'component-2'
})
@View({
    // templateUrl: './components/about/about.html?v=<%= VERSION %>',
    template: `<%= includeAsString('./app/components/about/about.html') %>`,
    styles: [
        `<%= includeAsCss('./app/components/about/about.css') %>`,
        `<%= includeAsCss('./app/components/about/about.css', true) %>`
    ],
    directives: [NgFor]
})
export class About {
    constructor(public list:NamesList) {
    }

    addName(newName) {
        this.list.add(newName.value);
        newName.value = '';
    }
}

# angular2-skeleton  

> This is the skeleton for angular 2 application

Originally created from *Yeoman gulp-angular2* generator.

## Improvements
- Fixed production gulp builds [v.0.0.1]
- Fixed dev gulp build to correctly include CSS styles [v.0.0.2]
- Fixed styles minification [v.0.0.1]
- Removed unused npm modules [v.0.0.1]
- Removed potentially dangerous HTML minification from build pipeline [v.0.0.1]
- Added ability to inline *.html* and *.css* files into components at build stage [v.0.0.1]
[see](https://github.com/gund/angular2-skeleton#available-plumber-template-methods)
- Added ability to include CSS, SASS, SCSS and compile/minify them at build time [v.0.0.3]
[see](https://github.com/gund/angular2-skeleton#available-plumber-template-methods)

## TODO
- Add TDD support (Jasmine + Karma) [approx. v.0.0.4-0]
- Add Travis CI support [approx. v.0.0.4]
- Add Selenium Webdriver and Protractor for e2e testing [approx. v0.0.5]
- Create Yo generator for this skeleton [approx. v.0.1.0]

## Features

### Available Plumber template methods:

#### includeAsString(file:String, doNotInject:Boolean=true)

Will include content from *file* and if *doNotInject* equals true - will exclude file from being injected into main HTML file.  
Good for inclusion HTML files.
  
**Usage:**
  
```html
<%= includeAsString('./app/app.html', false) %>
```
  
#### includeAsCss(file:String, minify:Boolean=false, doNotInject:Boolean=true)

Will include CSS *file* and if *minify* equals true - minify it's content; if *doNotInject* equals true - will exclude file from being injected into main HTML file.  
Good for inclusion CSS files.
  
**Usage:**
  
```html
<%= includeAsCss('./app/app.css', true) %>
```
  
#### includeAsSass(file:String, minify:Boolean=false, doNotInject:Boolean=true)

Will include SASS or SCSS *file* and if *minify* equals true - minify it's content; if *doNotInject* equals true - will exclude file from being injected into main HTML file.  
Good for inclusion SASS/SCSS files.
  
**Usage:**
  
```html
<%= includeAsSass('./app/app.sass', true) %>
<!-- or like this -->
<%= includeAsSass('./app/app.scss', true) %>
```
  
  
***

## License

[MIT](./LICENSE) © 2016 [Alex Malkevich](https://github.com/gund)

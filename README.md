# DOM Binding Library

## Overview
This project provides a lightweight JavaScript library for two-way data binding between JavaScript objects and DOM elements. It offers a simple and efficient way to manipulate the DOM based on data changes and vice versa, without the need for a full-fledged framework.

## Features
- Two-way data binding
- DOM element manipulation (value setting, class manipulation, event handling)
- Support for form elements (input, select, textarea)
- Repeater functionality for dynamic list rendering
- Custom tag support for flexibility in different environments
- Synonyms support for custom elements, especially useful for those extending form elements

## Main Components
1. `DOMrepeaterValue`: A class for defining operations on repeater items.
2. `DOMbinder`: The main class for managing the binding between data and DOM elements.

## Usage

### Basic Setup
```javascript
import { DOMbinder, DOMrepeaterValue } from './path/to/doublebind_mutator.js';

// Define synonyms for custom elements
const synonyms = {
    'INPUT': ['custom-input', 'extended-input'],
    'SELECT': ['custom-select'],
    'TEXTAREA': ['custom-textarea']
};

// Initialize the binder with synonyms
const binder = new DOMbinder(document.body, handlers, synonyms);
```

### Binding Data

#### Setting Values
```javascript
// Set a simple value
binder.set_value('elementName', 'New Value');

// Set multiple values
binder.set_value('firstName', 'John')
      .set_value('lastName', 'Doe')
      .set_value('age', 30);
```

#### Manipulating Classes
```javascript
// Add a class
binder.set_class('elementName', 'new-class');

// Remove a class
binder.remove_class('elementName', 'old-class');

// Add multiple classes
binder.set_class('elementName', 'class1')
      .set_class('elementName', 'class2');
```

#### Setting Custom Properties
```javascript
// Set a single property
binder.set_properties('elementName', { disabled: true });

// Set multiple properties
binder.set_properties('customElement', {
    customProp1: 'value1',
    customProp2: 42,
    'aria-label': 'Accessible Label'
});
```

#### Setting Event Handlers
```javascript
// Define event handlers
const handlers = {
    buttonClick: [
        {
            event: 'click',
            fctn: (e) => {
                console.log('Button clicked!', e);
            }
        }
    ],
    inputChange: [
        {
            event: 'input',
            fctn: (e) => {
                console.log('Input changed:', e.target.value);
            }
        }
    ]
};

// Initialize binder with handlers
const binder = new DOMbinder(document.body, handlers);

// The handlers will be automatically attached to elements with class __bind_buttonClick and __bind_inputChange
```

#### Using Repeaters
```javascript
// Set up a simple repeater
binder.set_repeater('simpleList', [
    new DOMrepeaterValue().set_value('Item 1'),
    new DOMrepeaterValue().set_value('Item 2')
]);

// Set up a complex repeater with multiple operations
binder.set_repeater('complexList', [
    new DOMrepeaterValue()
        .set_value('Item 1')
        .set_class('active')
        .set_handler('click', (e) => console.log('Clicked Item 1'))
        .set_dataset({ id: '001' }),
    new DOMrepeaterValue()
        .set_value('Item 2')
        .set_class('inactive')
        .set_handler('click', (e) => console.log('Clicked Item 2'))
        .set_dataset({ id: '002' })
]);

// Append to an existing repeater
binder.set_repeater('simpleList', [
    new DOMrepeaterValue().set_value('Item 3')
], true);  // The `true` flag indicates append mode
```

### Rendering Changes
```javascript
// After setting up all bindings, render the changes
binder.render();
```

### Harvesting Form Data
```javascript
const formData = binder.harvest();
console.log(formData);
```

### Custom Elements and Synonyms
The synonyms support is particularly useful when working with custom elements that extend standard form elements. This allows the library to recognize and properly handle custom elements as if they were native form elements.

Example of using a custom input element:
```html
<custom-input class="__bind_customInput" name="customField"></custom-input>
```

```javascript
// The library will treat 'custom-input' as an INPUT element
binder.set_value('customInput', 'Custom Value');
```

This feature ensures that the library can work seamlessly with web components and other custom element implementations that extend standard form functionality.

## HTML Structure
The library uses special classes to bind elements:
- `__template`: For repeater templates
- `__bind_[name]`: To bind elements to data
- `__placeholder`: For elements to be removed when going live

Example:
```html
<div class="__bind_complexList">
    <div class="__template" data-name="listItemTemplate">
        <span class="__bind_item"></span>
    </div>
</div>
<button class="__bind_buttonClick">Click me</button>
<input class="__bind_inputChange" type="text">
```

## Advanced Features
- Custom tag synonyms for compatibility with different frameworks and custom elements
- Dataset manipulation
- Go live functionality to remove placeholders

## Limitations and Considerations
- The library assumes a specific HTML structure and class naming convention
- It's designed for lightweight applications and may not scale well for very complex UIs
- No built-in templating engine; relies on HTML templates in the DOM
- While synonyms provide flexibility, they should be used judiciously to maintain code clarity

## License
GNU LESSER GENERAL PUBLIC LICENSE
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

[... previous examples for setting values, manipulating classes, etc. ...]

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

[... rest of the README content ...]

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

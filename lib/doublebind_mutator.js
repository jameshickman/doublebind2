class DOMrepeaterValue {
    #operations = {};

    /**
     * Set a value. Depending on the element type, set the innerText
     * or value of a form elemenent.
     * 
     * @param {string} v 
     * @returns 
     */
    set_value(v) {
        this.#operations['value'] = {
            'value': v
        };
        return this;
    }

    /**
     * Add a class
     * 
     * @param {string} CSSclass 
     * @returns 
     */
    set_class(CSSclass) {
        this.#operations['add_class'] = {
            'value': CSSclass
        };
        return this;
    }

    /**
     * Set an event handler
     * 
     * @param {string} event 
     * @param {CallableFunction} fctn 
     * @returns 
     */
    set_handler(event,fctn) {
        this.#operations['handler'] = {
            'value': fctn,
            'event': event
        };
        return this;
    }

    /**
     * Set the dataset
     * 
     * @param {Object} Key value pairs for the data attributes
     */
    set_dataset(dataset) {
        this.#operations['dataset'] = {
            'value': dataset
        };
        return this;
    }

    get() {
        return this.#operations;
    }
}

class DOMbinder {
    #state = {};
    #tempaltes = {};
    #el_conainer;
    #tag_synonyms = {};

    constructor(el, handlers, synonyms) {
        this.#el_conainer = el;
        const els_templates = document.querySelectorAll(".__template");
        for (let i = 0; i < els_templates.length; i++) {
            const n = els_templates[i].dataset.name;
            delete els_templates[i].dataset.name;
            els_templates[i].classList.remove('__template');
            this.#tempaltes[n] =  els_templates[i].cloneNode(true);
            els_templates[i].parentNode.removeChild(els_templates[i]);
        }
        
        if (handlers !== undefined) {
            for (let n in handlers) {
                const els_to_listen_on = el.querySelectorAll(".__bind_" + n);
                for (let i = 0; i < els_to_listen_on.length; i++) {
                    for (let j = 0; j < handlers[n].length; j++) {
                        els_to_listen_on[i].addEventListener(handlers[n][j].event, handlers[n][j].fctn);
                    }
                }
            }
        }

        if (synonyms !== undefined) {
            this.#tag_synonyms = synonyms;
        }
    }

    /**
     * Remove any element marked with the __placeholder class
     * 
     * @returns 
     */
    go_live() {
        const els_placeholders = this.#el_conainer.querySelectorAll(".__placeholder");
        for (let i = 0; i < els_placeholders.length; i++) {
            els_placeholders[i].parentNode.removeChild(els_placeholders[i]);
        }
        return this;
    }

    /**
     * Set a value depending on the element type sets the innerText or
     * form field value.
     * 
     * @param {string} name 
     * @param {string} value 
     * @returns 
     */
    set_value(name, value) {
        this.#_mutation('value', name, value);
        return this;
    }

    /**
     * Set a class on an element
     * @param {string} name 
     * @param {string} class_name 
     * @returns 
     */
    set_class(name, class_name) {
        this.#_mutation('add_class', name, class_name);
        return this;
    }

    /**
     * Remove a class
     * @param {string} name 
     * @param {string} class_name 
     * @returns 
     */
    remove_class(name, class_name) {
        this.#_mutation('remove_class', name, class_name);
        return this;
    }

    set_dataset(name, dataset) {
        this.#_mutation('dataset', name, dataset);
        return this;
    }

    set_properties(name, props) {
        this.#_mutation('props', name, props);
        return this;
    }

    set_repeater(name, rows, append) {
        if (append === undefined) append = false;
        if (this.#state.hasOwnProperty(name)) {
            this.#state[name].repeater.dirty = true;
            if (append) {
                for (let i = 0; i < rows.length; i++) {
                    this.#state[name].repeater.value.push(rows[i]);
                }
            }
            else {
                this.#state[name].repeater.value = rows;
            }
        }
        else {
            const els_attach_to = this.#el_conainer.querySelectorAll(".__bind_" + name);
            this.#state[name] = {
                'repeater': {
                    'dirty': true,
                    'repeater': true,
                    'value': rows,
                    'elements': els_attach_to
                },
                'elements': els_attach_to
            };
        }
        return this;
    }

    render() {
        this.#_merge(this.#state);
        return this;
    }

    harvest(el) {
        const values = {};
        const register_form_element = (name, el) => {
            const set_value = (v) => {
                if (el.dataset.index === undefined) {
                    if (!values.hasOwnProperty(name)) {
                        values[name] = [];
                    }
                    values[name].push(v);
                }
                else {
                    const repeater = el.dataset.repeater;
                    const idx = el.dataset.index;
                    if (!values.hasOwnProperty(repeater)) {
                        values[repeater] = [];
                    }
                    if (values[repeater].length < Number(idx) + 1) {
                        values[repeater].push({});
                    }
                    values[repeater][idx][name] = v;
                }
            }
            if (el.tagName === 'SELECT' || (this.#tag_synonyms.hasOwnProperty('SELECT') && this.#tag_synonyms.SELECT.includes(el.tagName))) {
                const select_values = [];
                for (let i = 0; i < el.options.length; i++) {
                    if (el.options[i].selected) {
                        select_values.push(el.options[i].value);
                    }
                }
                set_value(select_values);
            }
            else if (
                (el.tagName === 'INPUT' || (this.#tag_synonyms.hasOwnProperty('INPUT') && this.#tag_synonyms.INPUT.includes(el.tagName)))
                ||
                (el.tagName === 'TEXTAREA' || (this.#tag_synonyms.hasOwnProperty('TEXTAREA') && this.#tag_synonyms.TEXTAERA.includes(el.tagName)))
            ) {
                if (el.type === 'checkbox' && el.checked) {
                    set_value(el.value);
                }
                else if (el.type !== 'checkbox') {
                    set_value(el.value);
                }
            }
        }

        if (el === undefined) el = this.#el_conainer;
        const els_form_elements = [];
        const els_selects = el.querySelectorAll('select');
        for (let i = 0; i < els_selects.length; i++) {
            els_form_elements.push(els_selects[i]);
        }
        if (this.#tag_synonyms.hasOwnProperty('SELECT')) {
            for(let i = 0; i < this.#tag_synonyms.SELECT.length; i++) {
                const els_custom_selects = el.querySelectorAll(this.#tag_synonyms.SELECT[i]);
                for (let j = 0; j < els_custom_selects.length; j++) {
                    els_form_elements.push(els_custom_selects[j]);
                }
            }
        }
        const els_inputs = el.querySelectorAll('INPUT');
        for (let i = 0; i < els_inputs.length; i++) {
            els_form_elements.push(els_inputs[i]);
        }
        if (this.#tag_synonyms.hasOwnProperty('INPUT')) {
            for (let i = 0; i < this.#tag_synonyms.INPUT.length; i++) {
                const els_custom_inputs = el.querySelectorAll(this.#tag_synonyms.INPUT[i]);
                for (let j = 0; j < els_custom_inputs.length; j++) {
                    els_form_elements.push(els_custom_inputs[j]);
                }
            }
        }

        const els_textareas = el.querySelectorAll('TEXTAREA');
        for (let i = 0; i < els_textareas.length; i++) {
            els_form_elements.push(els_textareas[i]);
        }
        if (this.#tag_synonyms.hasOwnProperty('TEXTAREA')) {
            const els_custom_textareas = el.querySelectorAll(this.#tag_synonyms.TEXTAERA[i]);
            for (let i = 0; i < els_custom_textareas.length; i++) {
                els_form_elements.push(els_custom_textareas[i]);
            }
        }
        for (let i = 0; i < els_form_elements.length; i++) {
            if (els_form_elements[i].name) {
                register_form_element(els_form_elements[i].name, els_form_elements[i]);
            }
        }

        return values;
    }

    #_mutation(operation, name, value) {
        if (!this.#state.hasOwnProperty(name)) {
            const els_attach_to = this.#el_conainer.querySelectorAll(".__bind_" + name);
            this.#state[name] = {}
            this.#state[name].elements = els_attach_to;
            this.#state[name][operation] = {
                dirty: true,
                value: value,
                elements: els_attach_to
            }
        }
        else {
            if (!this.#state[name].hasOwnProperty(operation)) {
                const els_attach_to = this.#el_conainer.querySelectorAll(".__bind_" + name);
                this.#state[name][operation] = {
                    dirty: true,
                    value: value,
                    elements: els_attach_to
                };
            }
            else {
                if (this.#state[name][operation].value !== value) {
                    this.#state[name][operation].dirty = true;
                    this.#state[name][operation].value = value;
                }
            }
        }
    }

    #_merge(state) {
        const apply = (el, data, i, n) => {
            const render_value = (v) => {
                if (Array.isArray(v)) {
                    return v.join(", ");
                }
                return v;
            }

            if (i !== undefined && n !== undefined) {
                el.dataset.index = i;
                el.dataset.repeater = n;
            }
            switch(data.operation) {
                case 'handler':
                    el.addEventListener(data.event, data.value);
                    break;
                case "add_class":
                    el.classList.add(data.value)
                    break;
                case "remove_class":
                    wl.classList.remove(data.value);
                    break;
                case "dataset":
                    for (let n in data.value) {
                        if (data.value[n] === undefined) {
                            el.dataset.removeAttribute('data-' + n.toLocaleLowerCase());
                        }
                        else {
                            el.dataset[n] = data.value[n];
                        }
                    }
                    break;
                case "props":
                    for (let n in data.value) {
                        if (data.value[n] === undefined) {
                            el.removeAttribute(n);
                        }
                        else {
                            el[n] = data.value[n];
                        }
                    }
                    break;
                default:
                    if (el.tagName === 'SELECT' || (this.#tag_synonyms.hasOwnProperty('SELECT') && this.#tag_synonyms.SELECT.includes(el.tagName))) {
                        if (Array.isArray(data.value)) {
                            for (let i = 0; i < el.options.length; i++) {
                                if (data.value.includes(el.options[i].value)) {
                                    el.options[i].selected = true;
                                }
                                else {
                                    el.options[i].selected = false;
                                }
                            }
                        }
                        else {
                            el.value = data.value;
                        }
                    }
                    else if (
                        (el.tagName === 'INPUT' || (this.#tag_synonyms.hasOwnProperty('INPUT') && this.#tag_synonyms.INPUT.includes(el.tagName)))
                        ||
                        (el.tagName === 'TEXTAREA' || (this.#tag_synonyms.hasOwnProperty('TEXTAREA') && this.#tag_synonyms.TEXTAERA.includes(el.tagName)))
                    ) {
                        if (el.type === "checkbox") {
                            if (data.value) {
                                el.checked = true;
                           }
                            else {
                                el.checked = false;
                            }
                        }
                        else {
                            el.value = render_value(data.value);
                        }
                    }
                    else {
                        el.innerText = render_value(data.value);
                    }
            }
        }

        const build_repeaters = (repeater_name, el, template, repeater_data) => {
            while(el.children.length > 0) {
                el.removeChild(el.lastChild);
            }

            for (let i = 0; i < repeater_data.length; i++) {
                const el_row = template.cloneNode(true);
                el_row.dataset.index = i;
                for (let n in repeater_data[i]) {
                    const els_bind_points = el_row.querySelectorAll(".__bind_" + n);
                    for (let j = 0; j < els_bind_points.length; j++) {
                        let operations = null;
                        if (typeof repeater_data[i][n].get === 'function') {
                            operations = repeater_data[i][n].get();
                        }
                        else {
                            operations = repeater_data[i][n];
                        }
                        for (let n in operations) {
                            const update = {
                                'operation': n,
                                'value': operations[n].value
                            };
                            if (operations[n].hasOwnProperty("event")) {
                                update["event"] = operations[n]["event"];
                            }
                            apply(
                                els_bind_points[j],
                                update,
                                i,
                                repeater_name
                            );
                        }
                    }
                }
                el.appendChild(el_row);
            }
        }

        for (let n in state) {
            for (let op in state[n]) {
                if (state[n][op].dirty) {
                    if (op === 'repeater') {
                        for (let i = 0; i < state[n][op].elements.length; i++) {
                            build_repeaters(n, state[n][op].elements[i], this.#tempaltes[n], state[n].repeater.value);
                        }
                    }
                    else {
                        for (let i = 0; i < state[n][op].elements.length; i++) {
                            apply(state[n][op].elements[i], {...state[n][op], "operation": op});
                            if (state[n][op].elements[i].hasOwnProperty('widget') && typeof state[n][op].elements[i].widget.reload === 'function') {
                                state[n][op].elements[i].widget.reload();
                            }
                        }
                    }
                    state[n][op].dirty = false;
                }
            }
        }
    }
}

export {DOMrepeaterValue, DOMbinder};
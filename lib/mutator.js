class DOMrepeaterValue {
    #operations = {};

    set_value(v) {
        this.#operations['value'] = {
            'value': v
        };
        return this;
    }

    set_class(CSSclass) {
        this.#operations['add_class'] = {
            'value': CSSclass
        };
        return this;
    }

    set_handler(event,fctn) {
        this.#operations['handler'] = {
            'value': fctn,
            'event': event
        };
        return this;
    }

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

class DOMmutator {
    #state = {};
    #tempaltes = {};
    #el_conainer;

    constructor(el, handlers) {
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
    }

    go_live() {
        const els_placeholders = document.querySelectorAll(".__placeholder");
        for (let i = 0; i < els_placeholders.length; i++) {
            els_placeholders[i].parentNode.removeChild(els_placeholders[i]);
        }
        return this;
    }

    set_value(name, value) {
        this.#_mutation('value', name, value);
        return this;
    }

    set_class(name, class_name) {
        this.#_mutation('add_class', name, class_name);
        return this;
    }

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

    set_repeater(name, rows) {
        if (this.#state.hasOwnProperty(name)) {
            this.#state[name].repeater.dirty = true;
            this.#state[name].repeater.value = rows;
        }
        else {
            const els_attach_to = this.#el_conainer.querySelectorAll(".__bind_" + name);
            this.#state[name] = {
                'repeater': {
                    'dirty': true,
                    'repeater': true,
                    'value': rows,
                    'elements': els_attach_to
                }
            };
        }
        return this;
    }

    render() {
        this.#_merge(this.#state);
        return this;
    }

    #_mutation(operation, name, value) {
        if (!this.#state.hasOwnProperty(name)) {
            const els_attach_to = this.#el_conainer.querySelectorAll(".__bind_" + name);
            this.#state[name] = {}
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
                this.#state[name][operation].dirty = true;
                this.#state[name][operation].value = value;
            }
        }
    }

    #_merge(state) {
        const apply = (el, data) => {
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
                        el.dataset[n] = data.value[n];
                    }
                    break;
                case "props":
                    for (let n in data.value) {
                        el[n] = data.value[n];
                    }
                    break;
                default:
                    switch(el.tagName) {  
                        case 'SELECT':
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
                            break;
                        case 'INPUT':
                        case 'TEXTAREA':
                            if (el.type === "checkbox") {
                                if (data.value) {
                                    el.checked = true;
                               }
                                else {
                                    el.checked = false;
                                }
                            }
                            else {
                                el.value = data.value;
                            }
                        default:
                           el.innerText = data.value; 
                    }
            }
        }

        const build_repeaters = (el, template, repeater_data) => {
            while(el.children.length > 0) {
                el.removeChild(el.lastChild);
            }

            for (let i = 0; i < repeater_data.length; i++) {
                const el_row = template.cloneNode(true);
                for (let n in repeater_data[i]) {
                    const els_bind_points = el_row.querySelectorAll(".__bind_" + n);
                    for (let j = 0; j < els_bind_points.length; j++) {
                        let operations = null;
                        if (typeof repeater_data[i][n].get === 'function') {
                            operations = repeater_data[i][n].get();
                        }
                        else {
                            operations = [repeater_data[i][n]];
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
                                update
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
                            build_repeaters(state[n][op].elements[i], this.#tempaltes[n], state[n].repeater.value);
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
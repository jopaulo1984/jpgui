
///////////////////////////////////////////////////////////////////////////////////////
// Descrição: JPGUI é uma biblioteca gráfica que facilita a construção de janelas e  //
// controles em páginas web.                                                         //
// Autor: João Paulo F da Silva                                                      //
// Modificação: 10/2021                                                              //
// Versão: 1.4.0                                                                     //
///////////////////////////////////////////////////////////////////////////////////////


const ResponseResult = { NULL: 0, OK: 1, CANCEL: 2, YES: 3, NO: 4 };
const MouseButtons = { NONE: 0, LEFT: 1, RIGHT: 2 };

var __resizeWindowListeners = [];

/**
 * Adiciona uma fuçao listener a ser chamada quando a janela for redimensionada.
 * @param {object} sender - Objeto que contém a função.
 * @param {string} listener [`string`] - Nome da função pertecente ao objeto `sender`.
 * @returns null
 */
function addWindowResizeListener(sender, listener) {
    if (!sender || sender == undefined) return;
    if (typeof(sender[listener]) != 'function') return;
    __resizeWindowListeners.push({element: sender, func: listener});
}

class MyElement_testes {
    constructor(tag, args = {}) {
        var element = document.createElement(tag);
        Object.assign(element, this);
        var _this = this;
        Object.keys(_this).forEach(key => {
            element[key] = _this[key];
        });
        element.ondestroy = null;
        element.setProperties(args);
        return element;
    }
    set parent (value) {
        this.setParent(value);
    }
    get parent () { return this.getParent(); }
    set text (value) {
        if (this.innerText == value) return;
        this.innerText = value;
    }
    get text () { return this.innerText; }
    destroy = function () {
        if (!this.parent) return;
        if (this.ondestroy && this.ondestroy(this)) return;
        this.parent.removeChild(this);
    };
    setParent = function (value) {
        if (this.parentNode != null) {
            this.parentNode.removeChild(this);
            this.parentNode = null;
        }
        if (value !== null) {
            try {
                value.appendChild(this);
            } catch (ex) {
                console.log(ex.message);
            }
        }
    };
    getParent = function () { return this.parentNode; }
    setProperties = function (props = {}) {
        //definindo as propriedades do elemento passados em args
        var self = this;
        Object.keys(props).forEach(function (key) {
            if (key === null) return;
            self[key] = props[key];
        });
    };
    onmouseenter = function () {
        if (this.context != undefined)
        {

        }
    }
    //return element;
}

/**
 * Cria um novo elemento
 * @param {string} tag Tag HTML do elemento.
 * @param {object} args Objeto contendo as propriedades do elemento DOM.
 * 
 * Ex.:
 * ```
 * newElement('div', {parent: body})
 * ```
 * onde, `parent` é o elemento pai do novo elemento.
 * 
 * @returns Elemento
 */
class MyElement {
    constructor(tag, args = {}) {
        var element = document.createElement(tag);
        element.ondestroy = null;
        Object.defineProperty(element, 'parent', {
            set: function (value) {
                this.setParent(value);
            },
            get: function () { return this.getParent(); },
            configurable: true
        });
        Object.defineProperty(element, 'text', {
            set: function (value) {
                if (this.innerText == value) return;
                this.innerText = value;
            },
            get: function () { return this.innerText; },
            configurable: true
        });
        element.destroy = function () {
            if (!this.parent) return;
            if (this.ondestroy && this.ondestroy(this)) return;
            this.parent.removeChild(this);
        };
        element.setParent = function (value) {
            if (this.parentNode != null) {
                this.parentNode.removeChild(this);
                this.parentNode = null;
            }
            if (value !== null) {
                try {
                    value.appendChild(this);
                } catch (ex) {
                    console.log(ex.message);
                }
            }
        };
        element.getParent = function () { return this.parentNode; }
        element.setProperties = function (props = {}) {
            //definindo as propriedades do elemento passados em args
            var self = this;
            Object.keys(props).forEach(function (key) {
                if (key === null) return;
                self[key] = props[key];
            });
        };
        element.setProperties(args);
        element.onmouseenter = function () {
            if (this.context != undefined)
            {

            }
        }
        return element;
    }    
}

/**
 * Cria um novo elemento
 * @param {string} tag Tag HTML do elemento.
 * @param {object} args Objeto contendo as propriedades do elemento DOM.
 * 
 * Ex.:
 * ```
 * newElement('div', {parent: body})
 * ```
 * onde, `parent` é o elemento pai do novo elemento.
 * 
 * @returns Elemento
 */
function newElement(tag, args = {}) {
    return new MyElement(tag, args);
}

class InputCurrency extends MyElement {

    constructor(args={}) {
        args.type = "text";
        args.value = '0,00';
        super('input', args);
        this.onkeypress = this.dokeypress;
        this.onkeydown = this.dokeydown;
        this.oninput = this.dochange;
        this.style.textAlign = "right";
        this.__val = 0;
        this.__state = 0;
        Object.defineProperty(this, "noComma", {
            get() { return parseInt(this.value.replace(",", "")); }
        });
    }

    __compile = function (value) {
        this.__val = value != "" ? parseInt(value) : 0;
        return (this.__val / 100).toFixed(2).replace(".", ",");
    }

    dokeypress = function (evt) {
        var value = this.value.replace(",","");
        if (48 <= evt.keyCode && evt.keyCode <= 57) {
            this.value = this.__compile(value + evt.key);
        }
        return false;
    }

    dokeydown = function (evt) {
        this.__state = evt.keyCode;
    }

    dochange = function (evt) {
        if (this.__state == 8) {
            this.value = this.__compile(this.value.replace(",",""));
        }
    }

}

function newJPInput(args = {}) {
    var element; // = newElement("input");
    if (args.type == "select") {
        element = newJPComboBox();
        delete args.type;
    } else if (args.type == "currency") {
        element = new InputCurrency();
        delete args.type;
    } else {
        element = newElement("input");
    }
    element.className = "entry";
    element.__readonly = false;
    Object.defineProperty(element, 'editable', {
        set(value) {
            var ronly = !value;
            if (element.__readonly == ronly) return;
            element.__readonly = ronly;
            element.readOnly = ronly;
            if (ronly) {
                element.className = element.className + " readonly";
            } else {
                element.className = element.className.replace(/readonly\s/g, '');
            }
        },
        get() { return !element.__readonly; }
    });
    element.setProperties(args);
    element.style.width = args.width ? args.width + "px" : "";
    element.style.textAlign = args.align ? args.align : "left";
    return element;
}

function newJPLabel(args = {}) {
    var element = newElement('div');
    element.style.display = 'inline-block';
    element.className = 'label';
    element.setProperties(args);
    return element;
}

/**
 * Implementa um botão
 * @param {object} args
 * 
 * `text` - Texto do botão.
 * 
 * `result` (ResponseResult) - Resultado do botão quando for janela modal.
 * Possíveis resultados: NULL, OK., CANCEL., YES. e NO.
 * 
 * Ex.:
 * ```javascript
 * let button = newJPButton({text: 'Cancelar', result: ResponseResult.CANCEL});
 * ```
 * 
 * @returns JPButton
 */
function newJPButton(args = {}) {
    var element = newElement('button');
    element.className = 'button';
    element.result = ResponseResult.NULL;
    element.setProperties(args);
    return element;
}

function newJPComboBox(args = {}) {
    var element = newElement('select');
    element.className = 'combobox select';
    Object.defineProperty(element, 'items', {
        set(value) {
            element.innerHTML = "";
            element.appendItems(value);
        },
        get() { return element.getElementsByTag('option'); }
    });
    element.getItem = function (index) {
        return element.items[index];
    };
    element.appendItems = function (aitems) {
        element = this;
        aitems.forEach(function (item, index) {
            var o = document.createElement("option");
            o.value = item.value;
            o.innerHTML = item.text;
            element.appendChild(o);
        });
    }
    element.items = [];
    element.setProperties(args);
    return element;
}

function newJPTextArea(args = { parent: null, text: '', rows: 5, cols: 50, readonly: false }) {
    var element = newElement('textarea');
    element.className = 'textarea';
    Object.defineProperty(element, 'readonly', {
        set(value) {
            element.readOnly = value;
            if (value) {
                element.className += " readonly";
            } else {
                element.className = element.className.replace(/readonly/g, '');
            }
        },
        get() { return element.readOnly; }
    });
    element.setProperties(args);
    return element;
}

class JPPanel extends MyElement {
    constructor(args={}) {
        super('div');
        this.className = 'panel';
        this.inline = false;
        this.setProperties(args);
    }
    get inline() {
        return this.element.style.display === 'inline-block';
    }
    set inline(value) {
        if (this.inline === value) return;
        if (value === true) {
            this.style.display = 'inline-block';
        } else {
            this.style.display = 'block';
        }
    }
}

function newJPPanel(args = {}) {
    return new JPPanel(args);
}

function newJPGroupBox(args = {}) {

    var self = newElement('fieldset');

    newElement('legend', { parent: self });
    newElement('div', { parent: self });

    Object.defineProperty(self, 'text', {
        set(value) { self.childNodes[0].text = value; },
        get() { return self.childNodes[0]; }
    });

    self.appendChild = function (child) {
        this.childNodes[1].appendChild(child);
    }

    self.setProperties(args);

    return self;

}

class JPForm extends MyElement {
    constructor(args = {}) {
        super('form', args);
        this.className = 'form';        
    }
}

function newJPForm(args = {}) {
    return new JPForm(args);
}

class JPGrid extends JPPanel {
    constructor(args={}) {
        super(args);
        this.table = new MyElement('table', args = { parent: this });
        this.className = "grid";
        this.table.className = "table";
    }
    createColumn = (row = null, colspan = 1, rowspan = 1, child = null) => {
        var c = newElement('td', { parent: row });
        c.colSpan = colspan;
        c.rowSpan = rowspan;
        if (child) c.appendChild(child);
        return c;
    }
    createRow = (columns = [], parent = null) => {
        var tr = newElement('tr', { parent: parent });
        columns.forEach(function (item, index) {
            tr.appendChild(item);
        });
        return tr;
    }
    /**
     * Insere o componente na linha e coluna informada.
     * @param {number} row 
     * @param {number} column 
     * @param {Element} component 
     * @param {number} width 
     * Quantidade de campos mesclados na horizontal.
     * @param {number} height 
     * Quantidade de campos mesclados na vertical.
     */
    insert = (row, column, component, width = 1, height = 1) => {
        var rows = this.table.getElementsByTagName('tr');
        if (row < rows.length) {
            var cols = rows[row].getElementsByTagName('td');
            if (column < cols.length) {
                cols[column].appendChild(component);
            } else {
                for (var i = cols.length; i < column; i++) {
                    this.createColumn(rows[row], width, height);
                }
                this.createColumn(rows[row], width, height, component);
            }
        } else {
            for (var i = rows.length; i < row; i++) {
                this.createRow([], this.table);
            }
            var r = this.createRow([], this.table);
            for (var i = 0; i < column; i++) {
                this.createColumn(r, width, height);
            }
            this.createColumn(r, width, height, component);
        }
        return component;
    }
}

function newJPGrid(args = {}) {
    return new JPGrid(args);
}

/**
 * Implementa uma tabela
 */
class JPTableView extends MyElement {

    constructor(args = {}) {

        super('div', { className: 'tableview' });

        //
        var self = this;
        var divtable = newElement('div', { parent: self, className: 'divtable' })

        this.table = newElement('table', { parent: divtable, className: 'table' });
        this.__pageControl = newElement('div', { parent: self, className: 'pagecontrol' });

        this.table.thead = newElement('thead', { parent: this.table, className: 'thead' });
        this.table.tbody = newElement('tbody', { parent: this.table, className: 'tbody' });

        //pageControl

        this.__pageControl.__index = 0;
        this.__pageControl.__count = 1;
        this.__pageControl.__maxRowsPage = 50;

        //pageControl
        Object.defineProperty(self, 'pageControl', {
            get() {
                return this.__pageControl;
            }
        });
    
        Object.defineProperty(this.__pageControl, 'maxRowsPage', {
            get() {
                return this.__maxRowsPage;
            }
        });

        Object.defineProperty(this.__pageControl, 'pageIndex', {
            get() {
                return this.__index;
            }
        });
        //

        newJPLabel({ parent: this.__pageControl, text: ' | ' })
        newElement('button', {
            parent: this.__pageControl,
            innerHTML: '&#11164;',
            onclick() { this.parent.parent.__dobackpage() }
        });
        this.__pageControl.pageEntry = newJPInput({
            type: 'number',
            min: 1,
            parent: this.__pageControl,
            value: '1',
            className: 'entry pageindex',
            onkeypress(evt) { this.parent.parent.__dopageentrykeypress(evt) },
            onchange() { this.parent.parent.__setPageIndex(parseInt(this.value) - 1, false) }
        });
        newJPLabel({ parent: this.__pageControl, text: 'de' });
        this.__pageControl.pagesCount = newJPLabel({ parent: this.__pageControl, text: '1' });
        newElement('button', { 
            parent: this.__pageControl,
            innerHTML: '&#11166;',
            onclick() { this.parent.parent.___donextpage() }
        });
        newJPLabel({ parent: this.__pageControl, text: ' | ' })
        this.__pageControl.pageRowsCount = newJPInput({
            type: 'number',
            min: 5,
            parent: this.__pageControl,
            value: this.__pageControl.__maxRowsPage,
            className: 'entry rowscount',
            onkeypress(evt) { this.parent.parent.__dorowscountkeypress(evt) },
            onchange() { this.parent.parent.__setRowsCount(parseInt(this.value), false) }
        });
        newJPLabel({ parent: this.__pageControl, text: ' linhas/página | ' })
        //
        
        this.orderclick = undefined;
        this.pageChange = undefined;
        this.rowsCountChange = undefined;

        this.__selection = [];
        this.__selected = null;
        this.__expandy = true;

        // definição de propriedades
        Object.defineProperty(this, 'expandy', {
            set(value) {
                this.__expandy = value;
                this.updateSizes();
            },
            get() {
                return this.__expandy;
            }
        });
    
        Object.defineProperty(this, 'header', {
            set(value) {
                this.setHeader(value);
            },
            get() {
                return this.table.thead.getElementsByTagName('tr')[0].childNodes;
            }
        });
    
        /*Object.defineProperty(this, 'rows', {
            set(value) {
                this.setRows(value);
            },
            get () {
                return this.getRows();
            }
        });*/
    
        Object.defineProperty(this, 'selection', {
            get() { return this.__selection; }
        });
    
        Object.defineProperty(this, 'selected', {
            set(value) {
                this.__selected = value;
                this.__selection = [];
                if (this.table.tbody.childNodes.length === 0) return;
                this.table.tbody.childNodes[1].childNodes.forEach(function (item, index) {
                    if (index === value) {
                        this.__selection = [index];
                        item.className = 'selected';
                    } else {
                        item.className = 'no-selected';
                    }
                });
            },
            get() { return this.__selected; }
        });
    
        Object.defineProperty(this, 'pageCount', {
            set(value)
            {
                this.pageControl.__count = value > 0 ? value : 1;
                this.pageControl.pagesCount.text = this.pageControl.__count;
                this.pageControl.pageEntry.max = this.pageControl.__count;
                if (this.pageControl.__index >= this.pageControl.__count) {
                    this.pageControl.__index = this.pageControl.__count - 1;
                    this.__dopageChange();
                }
            },
            get() {
                return this.pageControl.__count;
            }
        });
    
        Object.defineProperty(this, 'pageIndex', {
            get() {
                return this.pageControl.__index;
            }
        });

        //
        this.onSelectionChanged = null;
        this.onSelectionDblClick = null;

        //
        this.setProperties(args);
    }

    __doorderclick = function (th) {
        if (!this.orderclick) return;
        //var theads = this.header;
        var tableview = this;
        this.header.forEach(thead => {
            if (th == thead)
            {
                var desc = th.btnorder.text == newElement('div', {innerHTML: '&#8595;'}).text; //&#8595; &#8593;
                tableview.orderclick(th.index, desc);
                th.btnorder.innerHTML = desc ? '&#8593;' : '&#8595;';
            }
            else
            {
                thead.btnorder.innerHTML = '&#8597;';
            }
        });
        this.updateSizes();        
    };

    __dopageChange = function() {
        this.pageChange && this.pageChange(this.pageControl.__index);
    };

    __setPageIndex = function (index, setentry = true) {
        if (0 <= index && index < this.pageControl.__count) {
            this.pageControl.__index = index;
            if (setentry) {
                this.pageControl.pageEntry.value = index + 1;
            }
            this.__dopageChange();
        }
        return this.pageControl.__index;
    };

    ___donextpage = function () {
        this.__setPageIndex(this.pageControl.__index + 1);
    };

    __dobackpage = function() {
        this.__setPageIndex(this.pageControl.__index - 1);
    };

    __dopageentrykeypress = function (evt) {
        if (evt.keyCode == 13 || evt.keyCode == 10) {
            this.pageControl.pageEntry.value = this.__setPageIndex(parseInt(this.pageControl.pageEntry.value) - 1, false) + 1;
        }
    };

    __setRowsCount = function (count, setentry = true) {
        if (count > 4) {
            this.pageControl.__maxRowsPage = count;
            if (setentry) {
                this.pageControl.pageRowsCount.value = this.pageControl.__maxRowsPage;
            }
            this.rowsCountChange && this.rowsCountChange(this.pageControl.__maxRowsPage);
            this.__setPageIndex(0);
        }
        return this.pageControl.__maxRowsPage;
    };

    __dorowscountkeypress = function (evt) {
        if (evt.keyCode == 13 || evt.keyCode == 10) {
            this.pageControl.pageRowsCount.value = this.__setRowsCount(parseInt(this.pageControl.pageRowsCount.value), false);
        }
    };

    setHeader = (value) => {
        var self = this;
        this.table.thead.innerHTML = '';
        var cg = newElement('colgroup', { parent: this.table.thead });
        var tr = newElement('tr', { parent: this.table.thead });
        value.forEach(function (column, i) {
            var th = newElement('th', { parent: tr, tableview: self, index: i, onclick() { this.tableview.__doorderclick(this) } });
            var col = newElement('div', {parent: th, className: 'column'});
            th.label = newElement('div', {parent: col, innerHTML: column});
            th.btnorder = newElement('div', {parent: col, innerHTML: '&#8597;', className: 'order-button'});
            newElement('col', { parent: cg }).style.width = (th.offsetWidth + 10) + 'px';
        });
    };

    setRows = (rows) => {
        var self = this;
        this.__selection = [];
        this.__selected = null;
        this.table.tbody.innerHTML = '';
        var columns = this.table.thead.getElementsByTagName('colgroup')[0].childNodes;
        var cg = newElement('colgroup', { parent: this.table.tbody });
        if (columns.length > 0) { for (var x = 0; x < columns.length; x++) { newElement('col', {parent: cg}); } }
        rows.forEach(function (linha, l) { self.__append(linha); });
        this.updateSizes();
    };

    getColumns = () => {
        let result = [];
        this.header.forEach(element => {
            result.push(element.label.text);
        });
        return result;
    }

    getRows = () => {
        var rows = [];
        var trs = this.table.tbody.getElementsByTagName('tr');
        for (var i = 0; i < trs.length; i++) {
            var tr = trs[i];
            var row = [];
            var tds = tr.getElementsByTagName('td');
            for (var j = 0; j < tds.length; j++) {
                var td = tds[j];
                if (td.childNodes.length > 1) {
                    row.push(td.childNodes);
                } else if (td.childNodes.length == 1) {
                    row.push(td.childNodes[0]);
                } else {
                    row.push("");
                }
            }
            rows.push(row);
        }
        return rows;
    };

    __append = function (line) {
        var tr = newElement('tr', { parent: this.table.tbody });
        var selalter = false;
        tr.className = 'no-selected';
        tr.onclick = function (e) {
            var tr = this;
            var tableview = tr.parentNode.parentNode.parentNode.parentNode; //.parentNode.parentNode;
            var lines = tableview.table.tbody.getElementsByTagName('tr');
            for (var index = 0; index < lines.length; index++) { //lines.forEach(function (item, index) {
                var item = lines[index];
                if (item == tr) {
                    if (e.ctrlKey) {
                        tableview.selection.push(index);
                    } else {
                        tableview.__selection = [index];
                    }
                    item.className = 'selected';
                    selalter = tableview.__selected != index;
                    tableview.__selected = index;
                } else {
                    item.className = 'no-selected';
                }
            }
            tableview.onSelectionChanged && selalter && tableview.onSelectionChanged(tableview.selection);
        };
        tr.ondblclick = function (e) {
            var tableview = this.parentNode.parentNode.parentNode.parentNode;
            var clk = tableview.onSelectionChanged;
            tableview.onSelectionChanged = null;
            this.onclick(e);
            tableview.onSelectionDblClick && tableview.onSelectionDblClick(tableview.selection);
            tableview.onSelectionChanged = clk;
        };
        line.forEach(function (column, c) {
            newElement('td', { parent: tr }).innerHTML = column;
        });
    };

    append = function (line) {
        if (this.table.tbody.childNodes.length == 0) {
            this.setRows([line]);
            return;
        }
        this.__append(line);
        this.updateSizes();
    };

    remove = function(index) {
        if (0 <= index && index < this.table.tbody.childNodes.length - 1) {
            this.table.tbody.childNodes[index + 1].remove();
            this.updateSizes();
        }
    };

    __updatewidths = function () {
        if (this.table.thead.childNodes.length == 0) return;
        //var tb = this.table.tbody;
        var tr1 = this.table.thead.getElementsByTagName('tr')[0];
        var cg1 = this.table.thead.getElementsByTagName('colgroup')[0];
        var cg2 = this.table.tbody.getElementsByTagName('colgroup')[0];
        var lines = this.table.tbody.getElementsByTagName('tr');
        var tw = this.clientWidth;
        if (lines.length > 0) {
            var tw = 0;
            lines[0].childNodes.forEach(function (item, index) {
                var thcol = cg1.childNodes[index];
                var tdcol = cg2.childNodes[index];
                var th = tr1.childNodes[index];
                var td = item;
                var w = td.offsetWidth;
                if (th.offsetWidth > w) {
                    w = th.offsetWidth;
                }
                tw += w;
                thcol.style.minWidth = w + 'px';
                tdcol.style.minWidth = thcol.style.minWidth;
                thcol.style.maxWidth = thcol.style.minWidth;
                tdcol.style.maxWidth = thcol.style.minWidth;
            });
            /*this.pageControl.style.width = tw + "px";*/
        }
    }

    __updateheights = function () {
        this.table.tbody.style.maxHeight = (this.clientHeight - this.table.thead.offsetHeight - this.pageControl.offsetHeight - 20) + 'px';
    }

    updateSizes = function () {
        this.__updatewidths();
        this.__updateheights();
    }

}

function newJPTableView(args = {}) {

    return new JPTableView(args);

}

function newJPMask(args = {}) {

    var element = newJPPanel(args);

    this.child = null;

    element.className = "mask";

    element.style.position = "absolute";
    element.style.top = "0px";
    element.style.left = "0px";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.background = 'rgba(0,0,0,0.5)';

    element.destroy = function () {
        var body = document.getElementsByTagName("body")[0];
        body.removeChild(this);
    }

    if (element.parent === null) {
        element.parent = document.getElementsByTagName("body")[0];
    }

    return element;

}

class JPWindow extends JPPanel {

    get width() {
        return this.__defaultWidth;
    }

    set width(value) {
        this.size(value, this.height);
    }

    get height() {
        return this.__defaultHeight;
    }

    set height(value) {
        this.size(this.width, value);
    }
    
    constructor(args={}) {
        
        if (!Object.keys(args).includes('parent')) {
            if (!Object.keys(args).includes('toplevel') || args['toplevel'] === false) {
                args.parent = document.body;
            }
        }
    
        super();
    
        this.style.visibility = "hidden";
        this.mask = null;
        this.ptop = new JPPanel({parent: this});
        this.mainpanel = new JPPanel({parent: this});
        this.ptitle = newJPLabel({ parent: this.ptop });
        this.__defaultWidth = 100;
        this.__defaultHeight = 100;
        this.__resizable = true;    
        this.__toplevel = false;
        this.__topbtns = false;
    
        Object.defineProperty(this, 'toplevel', {
            set(value) {
                if (this.__toplevel === value) { return; }
                this.__toplevel = value;
                if (value === true) {
                    this.mask = newJPMask({ child: this });
                    this.mask.style.visibility = 'hidden';
                    this.ondestroy = function () {
                        this.mask.destroy();
                    };
                    this.parent = this.mask;
                } else {
                    this.parent = this.mask.parent;
                    this.mask.destroy();
                }
            },
            get() { return this.__toplevel; }
        });
    
        Object.defineProperty(this, 'topbuttons', {
            set(value) {
    
                if (this.__topbtns === value) { return; }
    
                this.__topbtns = value;
    
                if (value === true) {
    
                    this.botoes = newJPPanel({ parent: this.ptop, inline: true });
                    this.botoes.className = 'window-buttons';
    
                    if (this.resizable) {
                        this.btnmaxmin = newJPButton({ parent: this.botoes, text: '+' });
                        this.btnmaxmin.className = 'window-button minmax-button';
                        this.btnmaxmin.window = this;
                        this.btnmaxmin.onclick = function () {
                            if (this.window.maximinized()) {
                                this.window.minimize();
                                this.btnmaxmin.value = '+';
                            } else {
                                this.window.maximinize();
                                this.btnmaxmin.value = '-';
                            }
                        }
                    }
    
                    this.btnclose = newJPButton({ text: 'x', parent: this.botoes });
                    this.btnclose.className = 'window-button close-button';
                    this.btnclose.window = this;
                    this.btnclose.onclick = function () {
                        if (this.window.onclose && this.window.onclose()) {
                            return;
                        }
                        this.window.destroy();
                    }
    
                } else {
    
                    this.ptop.removeChild(this.botoes);
    
                }
            },
            get() { return this.__topbtns; }
        });
    
        Object.defineProperty(this, 'title', {
            set(value) {
                this.ptitle.text = value;
            },
            get() { return this.ptitle.text; }
        });
    
        Object.defineProperty(this, 'resizable', {
            set(value) {
                if (this.__resizable === value) return;
                this.__resizable = value;
                if (this.__resizable) {
                    this.style.width = this.__defaultWidth + 'px';
                    this.style.height = this.__defaultHeight + 'px';
                } else {
                    this.style.width = "";
                    this.style.height = "";
                    this.mainpanel.style.width = "";
                    this.mainpanel.style.height = "";
                }
            },
            get() { return this.__resizable; }
        });
    
        this.topbuttons = true;
    
        this.toplevel = false;
    
        this.title = "Window";
    
        this.className = 'window';
    
        this.mainpanel.className = 'main-panel';
    
        this.mainpanel.style.overflow = 'auto';
    
        this.ptitle.className = 'title-panel';
        this.ptop.className = 'top-panel';
        this.ptitle.className = 'title';
    
        this.onresized = null;

        this.appendChild = this.append;
    
        this.onmousedown = function (evt) {
            this.mdown = {
                offset: { x: evt.offsetX, y: evt.offsetY },
                screen: { x: evt.screenX, y: evt.screenY },
                left: this.offsetLeft,
                top: this.offsetTop,
                width: this.offsetWidth,
                height: this.offsetHeight,
                addWidth: function (x) {
                    var d = x - this.x;
                    return this.width + d;
                },
                addHeight: function (y) {
                    var d = y - this.y;
                    return this.height + d;
                },
                moving: this.ptop.style.cursor == 'move' && evt.buttons == MouseButtons.LEFT,
                resizing: this.resizable && (this.style.cursor == 'se-resize' || this.style.cursor == 'e-resize' || this.style.cursor == 's-resize') && evt.buttons === MouseButtons.LEFT
            };
            this.parentNode.selectedWindow = this;
        }
    
        this.onmouseup = function () {
            this.mdown = null;
            this.ptop.style.cursor = 'default';
        }
    
        this.onmousemove = function (evt) {
            if (this.mdown) return;
            var intop = evt.y < this.offsetTop + this.ptop.offsetHeight;
    
            if (intop) {
                this.ptop.style.cursor = 'move';
                return;
            } else {
                if (this.ptop.style.cursor != 'default') this.ptop.style.cursor = 'default';
            }
    
            if (!this.resizable) {
                if (this.style.cursor != 'default') this.style.cursor = 'default';
                return;
            }
    
            var rx = this.offsetWidth - 10;
            var by = this.offsetHeight - 10;
            var inborderx = rx < evt.offsetX && evt.offsetX < this.offsetWidth;
            var inbordery = by < evt.offsetY && evt.offsetY < this.offsetHeight;
            if (!(inborderx || inbordery)) {
                this.style.cursor = 'default';
            } else if (inborderx && inbordery) {
                this.style.cursor = 'se-resize';
            } else if (inborderx) {
                this.style.cursor = 'e-resize';
            } else if (inbordery) {
                this.style.cursor = 's-resize';
            }
        }
    
        this.ptop.onmouseup = function (e) {
            this.mdown = null;
        };
        /*=========================*/
    
        this.style.position = "absolute";
    
        //properties
        this.onclose = null;
    
        this.setProperties(args);
    
        this.parentNode.onmousemove = function (evt) {
            if (!this.selectedWindow) return;
            var win = this.selectedWindow;
            if (!win.mdown) return;
            var dx = evt.screenX - win.mdown.screen.x;
            var dy = evt.screenY - win.mdown.screen.y;
            if (win.mdown.moving) {
                win.move(win.mdown.left + dx, win.mdown.top + dy);
            } else if (win.mdown.resizing) {
                if (win.style.cursor == 'se-resize') {
                    win.size(win.mdown.width + dx, win.mdown.height + dy);
                } else if (win.style.cursor == 'e-resize') {
                    win.size(win.mdown.width + dx, win.mdown.height);
                } else if (win.style.cursor == 's-resize') {
                    win.size(win.mdown.width, win.mdown.height + dy);
                }
            }
        };
    
        this.parentNode.onmouseup = function (evt) {
            if (!this.selectedWindow) return;
            var win = this.selectedWindow;
            win.mdown = null;
            win.ptop.style.cursor = 'default';
        };
    }

    //methods and functions
    doresized = () => {
        this.updateSize();
        this.onresized && this.onresized(this.offsetWidth, this.offsetHeight);
    }

    maximinize = () => {
        if (this.maximinized()) return;
        this.style.width = '100%';
        this.style.height = '100%';
        this.style.left = '0px';
        this.style.top = '0px';
        this.doresized();
    }

    minimize = () => {
        if (!this.maximinized()) return;
        this.style.width = this.defaultWidth + 'px';
        this.style.height = this.defaultHeight + 'px';
        this.style.top = this.defaultTop + 'px';
        this.style.left = this.defaultLeft + 'px';
        this.doresized();
    }

    maximinized = () => {
        return this.style.width === '100%' && this.style.height === '100%';
    }

    geometry = (x, y, width, height) => {
        this.size(width, height);
        this.move(x, y);
    }

    updateSize = () => {
    }

    size = (width, height) => {
        if (this.maximinized()) return;
        if (this.offsetWidth === width && this.offsetHeight === height) return;
        this.__defaultHeight = height;
        this.__defaultWidth = width;
        this.style.width = width + 'px';
        this.style.height = height + 'px';
        this.doresized();
    }

    move = (x, y) => {
        if (y < 0) y = 0;
        if (this.maximinized()) return;
        this.defaultLeft = x;
        this.defaultTop = y;
        this.style.top = y + "px";
        this.style.left = x + "px";
    };

    show = () => {
        if (this.mask) this.mask.style.visibility = 'visible';
        this.style.visibility = 'visible';
    };

    alignCenter = () => {
        var wmx = parseInt(this.parentNode.offsetWidth / 2);
        var wmy = parseInt(this.parentNode.offsetHeight / 2);
        var emx = parseInt(this.offsetWidth / 2);
        var emy = parseInt(this.offsetHeight / 2);
        this.move(wmx - emx, wmy - emy);
    };

    /*__append = (child) => {
        super.appendChild(child);
    };*/

    append = (child) => {
        this.mainpanel.appendChild(child);
    };
    
}

function newJPWindow(args = {}) { return new JPWindow(args); }

/**
 * Cria uma janela de diálogo. É uma especialização de JPWindow.
 * 
 * @param {*} args 
 * @returns `JPDialog`
 * 
 * [args]
 * 
 * `content`: elemento do painel central da janela.
 * 
 * `buttons`: `array` contendo os botões de ação.
 * 
 * `exitinclick`: `false` para não sair com o click fora da janela, `true` para o contrário.
 * 
 */
class JPDialog extends JPWindow {

    constructor(args={}) {

        super({ resizable: false, toplevel: true, topbuttons: false });

        this.className += " dialog";
        this.__content = newElement('div', { parent: this });
        this.__content.className = "content";
        this.__content.style.padding = '10px';
        this.__dbuttons = newJPPanel({ parent: this, className: "buttons" });
        this.__exitinclick = false;

        Object.defineProperty(this, 'exitinclick', {
            set(value) {
                if (!this.toplevel) return;
                if (this.__exitinclick === value) { return; }
                this.__exitinclick = value;
                if (value === true) {
                    this.mask.onclick = function (e) {
                        var child = this.child;
                        if (child.offsetLeft < e.clientX && e.clientX < (child.offsetLeft + child.clientWidth) &&
                            child.offsetTop < e.clientY && e.clientY < (child.offsetTop + child.clientHeight)) {
                            return;
                        }
                        this.destroy();
                    }
                } else {
                    this.mask.onclick = null;
                }
            },
            get() { return this.__exitinclick; }
        });

        Object.defineProperty(this, 'buttons', {
            set(value) {
                this.__dbuttons.innerHTML = "";
                var self = this;
                value.forEach(function (item, index) {
                    self.__dbuttons.appendChild(item);
                    item.window = self;
                    if (item.result !== null) {
                        item.onclick = function () {
                            this.window.onresult && this.window.onresult(this.window, this.result);
                        };
                    }
                });
            },
            get() { return this.__dbuttons.childNodes; }
        });

        Object.defineProperty(this, 'content', {
            set(value) {
                this.setContent(value);
            },
            get() { return this.__content.childNodes.length > 0 ? this.__content.childNodes[0] : null; }
        });

        this.onresult = null;

        this.setProperties(args);

        this.alignCenter();
    }

    setContent = function (obj) {
        this.__content.innerHTML = '';
        if (obj) this.__content.appendChild(obj);
        this.alignCenter();
    }

    showModal = (onresult) => {
        this.onresult = onresult;
        this.show();
    };

    onresized = function () {
        this.__content.style.width = (this.offsetWidth - 40) + 'px';
        this.__content.style.height = (this.offsetHeight - this.__dbuttons.offsetHeight - this.ptop.offsetHeight - 40) + 'px';
    }
}

function newJPDialog(args = {}) { return new JPDialog(args); }

/**
 * 
 * @param {string} title 
 * @param {string} msg 
 * @param {Function} onclose 
 * @returns 
 */
class DialogMessage extends JPDialog {
    constructor(title, msg, onclose = null) {
        super({
            title: title,
            content: newJPLabel({ text: msg }),
            buttons: [newJPButton({ text: 'Ok' })],
            exitinclick: true
        });
        this.ondestroy = onclose;
        this.showModal((win, result) => { win.destroy(); });
    }
}

/**
 * 
 * @param {string} title 
 * @param {string} msg 
 * @param {Function} onclose 
 * @returns 
 */
function newDialogMessage(title, msg, onclose = null) {
    return new DialogMessage(title, msg, onclose);
}

function msgBox(title_, msg_, results = [], response = null) {
    var dlg = new JPDialog({
        title: title_,
        content: newJPLabel({text: msg_}),
        buttons: (() => {
            var btns = [];
            results = results ? (results.length > 0 ? results : [ResponseResult.OK]) : [ResponseResult.OK];
            for (var i = 0 ; i < results.length ; i++) {
                switch (results[i]) {
                    case ResponseResult.CANCEL:
                        btns.push(newJPButton({text: 'Cancelar', result: ResponseResult.CANCEL}));
                        break;                    
                    case ResponseResult.YES:
                        btns.push(newJPButton({text: 'Sim', result: ResponseResult.YES}));
                        break;
                    case ResponseResult.NO:
                        btns.push(newJPButton({text: 'Não', result: ResponseResult.NO}));
                        break;
                    default:
                        btns.push(newJPButton({text: 'Ok', result: ResponseResult.OK}));
                }
            }
            return btns;
        })()
    });
    dlg.__response = response;
    dlg.showModal((win, r) => {
        win.destroy();
        win.__response && win.__response(r);
    });
}

function newInput(width, props = {}) {
    var self = newJPInput(props);
    self.style.width = width + "px";
    return self;
}

function newJPLoader(args={}) {
    loader = newElement("div", {parent: self});
    loader.className = "loader";
    self = newJPDialog({content: loader});
    self.className = "loader-dialog"
    self.setProperties(args);
    self.alignCenter();
    self.show();
    return self;
}

class InputWithLabel extends JPPanel {
    constructor(args={}) {
        super({parent: args.parent});
        delete args.parent;
        this.label = newJPLabel({parent: this, text: args.text ? args.text : ""});
        delete args.text;
        this.input = newJPInput({parent: this, type: args.type});
        delete args.type;
        this.input.setProperties(args);
        delete args.name;
        this.input.style.width = args.width ? args.width + "px" : "";
        this.input.style.textAlign = args.align ? args.align : "left";
        delete args.width;
        delete args.align;
        this.setProperties(args);
        this.style.display = "flex";
        Object.defineProperty(this, "label", {get() {return this.label.text;}, set(v) {this.input.label.text = v;}});
        Object.defineProperty(this, "value", {get() {return this.input.value;}, set(v) {this.input.value = v;}});
    }
}

function doresize (...args) {
    __resizeWindowListeners.forEach(function (listener, index) {
        listener.element[listener.func](...args);
    });
};

window.addEventListener('resize', doresize);

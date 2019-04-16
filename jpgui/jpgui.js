
/*
* Descrição: JPGUI é uma biblioteca gráfica que facilita a construção de janelas e 
* controles em páginas web.
* Autor: João Paulo F da Silva
* Modificação: 04/2019
* Versão: 1.0.1
*/

Result = {NULL:0, OK:1, CANCEL:2, YES:3, NO:4};
Buttons = {NONE:0, LEFT:1, RIGHT:2};

function newElement(parent, tag='') {
  var element = document.createElement(tag);
  if(parent)
    parent.appendChild(element);
  element.destroy = function() {
    if(!this.parentNode) return;
    if(this.ondestroy&&this.ondestroy(this)) return;
    this.parentNode.removeChild(this);
  }
  element.ondestroy = null;
  return element;
}

function newJPInput(parent=null,type='text',value='',readonly=false) {
  var element = newElement(parent,'input');
  element.type = type;
  element.value = value;
  element.className = 'input-'+type;
  element.classNameBasic = 'input-'+type;
  Object.defineProperty(element,'readonly',{
    set(value){
      element.readOnly = value;
      if(value) {
        element.className = "readonly " + element.className;
      }else{
        element.className = element.className.replace(/readonly\s/g,'');
      }
    },
    get(){return element.readOnly;}
  });
  element.readonly = readonly;
  return element;
}

function newJPLabel(parent=null,text='') {
  var element = newElement(parent, 'div');
  element.style.display = 'inline-block';
  element.className = 'label';
  
  element.setText = function(value) {
    this.innerText = value;
  }
  
  element.getText = function() {
    return this.innerText;
  }
  
  element.setText(text);
  
  return element;
}

function newJPButton(parent=null,text='') {
  var element = newJPInput(parent,'button',text);
  element.className = 'button';
  element.classNameBasic = 'button';
  Object.defineProperty(element,'text',{
    set(value){
      element.value = value;
    },
    get(){return element.value;}
  });
  return element;
}

function newJPComboBox(parent=null,items=[]) {
  var element = newElement(parent,'select');
  element.className = 'combobox select';  
  element.getItem = function(index) {
    return element.getElementsByTag('option')[index];
  };
  element.appendItems = function(aitems) {
    element = this;
    aitems.forEach(function(item, index){
      var o = document.createElement("option");
      o.value = item.value;
      o.innerHTML = item.text;
      element.appendChild(o);
    });
  }
  element.appendItems(items);
  //
  return element;
}

function newJPTextArea(parent=null,text='',rows=5,cols=50,readonly=false) {
  var element = newElement(parent,'textarea');
  element.className = 'textarea';
  element.classNameBasic = 'textarea';
  element.rows = rows;
  element.cols = cols;
  element.readonly = readonly;
  element.value = text;
  Object.defineProperty(element,'readonly',{
    set(value){
      element.readOnly = value;
      if(value) {
        element.className += " readonly";
      }else{
        element.className = element.className.replace(/readonly/g,'');
      }
    },
    get(){return element.readOnly;}
  });
  return element;
}

function newJPPanel(parent=null,inline=false) {
  var element = newElement(parent,'div');
  element.className = 'panel';
  if(inline)
    element.style.display = 'inline-block';
  return element;
}

function newJPForm(parent,content) {
  var element = newElement(parent,'form');
  element.appendChild(content);
  element.className = 'form';
  return element;
}

function newJPGrid(parent=null) {

  var element = newJPPanel(parent);
  element.table = newElement(element,'table');
  element.className = "grid";
  element.table.className = "table";

  element.createColumn = function(row=null,colspan=1,rowspan=1,child=null) {
    var c = newElement(row,'td');
    c.colSpan = colspan;
    c.rowSpan = rowspan;
    if(child)
      c.appendChild(child);
    return c;
  }

  element.createRow = function(columns=[],parent=null) {
    var tr = newElement(parent,'tr');
    columns.forEach(function(item,index){
      tr.appendChild(item);
    });
    return tr;
  }

  element.insert = function(row,column,component,width=1,height=1) {
    var rows = this.table.getElementsByTagName('tr');
    if(row<rows.length) {
      var cols = rows[row].getElementsByTagName('td');
      if(column<cols.length) {
        cols[column].appendChild(component);
      }else{
        for(var i=cols.length;i<column;i++) {
          this.createColumn(rows[row],width,height);
        }
        this.createColumn(rows[row],width,height,component);
      }
    }else{
      for(var i=rows.length;i<row;i++) {
        this.createRow([],this.table);
      }
      var r = this.createRow([],this.table);
      for(var i=0;i<column;i++) {
        this.createColumn(r,width,height);
      }
      this.createColumn(r,width,height,component);
    }
  }

  return element;

}

function newJPTableView(parent=null) {
  var element = newElement(parent,'div');
  element.thead = newElement(element,'table');
  element.panelBody = newJPPanel(element)
  element.tbody = newElement(element.panelBody,'table');
  
  element.className = 'tableview';
  element.thead.className = 'thead';
  element.tbody.className = 'tbody';
  
  element.thead.style.display = 'block';
  element.tbody.style.display = 'inline-block';
  
  element.selection = [];
  element.selected = null;

  element.setHeader = function(value) {
    this.thead.innerHTML = '';
    this.setValues([]);
    var cg = newElement(this.thead,'colgroup');
    var th = newElement(this.thead,'thead');
    var tr = newElement(th,'tr');
    value.forEach(function(item,index) {
      newElement(cg,'col');
      newElement(tr,'th').innerText = item;
    });
  };

  element.setValues = function(value) {
    this.selection = [];
    this.selected = null;
    this.tbody.innerHTML = '';
    var cg = newElement(this.tbody,'colgroup');
    var tb = newElement(this.tbody,'tbody');
    value.forEach(function(linha,l) {
      var tr = newElement(tb,'tr');
      var selalter = false;
      tr.className = 'no-selected';
      tr.onclick = function(e) {
        var tr = this;
        var self = tr.parentNode.parentNode.parentNode.parentNode;
        this.parentNode.childNodes.forEach(function(item,index) {
          if(item==tr){
            if(e.ctrlKey) {
              self.selection.push(index);
            }else{
              self.selection = [index];
            }
            item.className = 'selected';
            selalter = self.selected != index;
            self.selected = index;
          }else{
            item.className = 'no-selected';
          }
        });
        self.onSelectionChanged && selalter && self.onSelectionChanged(self.selection);
      };
      tr.ondblclick = function(e) {
        var self = this.parentNode.parentNode.parentNode.parentNode;
        var clk = self.onSelectionChanged;
        self.onSelectionChanged = null;
        this.onclick(e);
        self.onSelectionDblClick && self.onSelectionDblClick(self.selection);
        self.onSelectionChanged = clk;
      };
      linha.forEach(function(column,c) {
        newElement(tr,'td').innerText = column;
      });
    });
    this.updateValues();
   };
  
  element.updateValues = function() {
    var tb = this.tbody.getElementsByTagName('tbody')[0];
    if(tb.childNodes.length==0) return;
    var cg1 = this.thead.getElementsByTagName('colgroup')[0];
    var cg2 = this.tbody.getElementsByTagName('colgroup')[0];
    tb.childNodes[0].childNodes.forEach(function(item,index){
      var c1 = cg1.childNodes[index].style;
      c1.width = item.offsetWidth + 'px';
      newElement(cg2,'col').style.width = c1.width;
    });    
  }

  element.onSelectionChanged = null;
  element.onSelectionDblClick = null;

  return element;

}

function newJPLogin(parent,url='',title='Login',userTitle='User',passTitle='Password',buttonTitle='Logon') {

  var grid = newJPGrid(null);
  var element = newJPForm(parent,grid);

  element.ltitle = newJPLabel(null,title);
  element.user = newJPInput(null,'text');
  element.pass = newJPInput(null,'password');
  element.message = newJPLabel(null,'');
  element.button = newJPInput(null,'submit',buttonTitle);

  element.method = 'POST';
  element.action = url;

  element.className = 'login';
  element.ltitle.className = 'title';

  element.user.name = 'user';
  element.pass.name = 'pass';

  grid.insert(0,0,element.ltitle,3);
  grid.insert(1,0,newJPLabel(null,userTitle));
  grid.insert(1,1,element.user,2);
  grid.insert(2,0,newJPLabel(null,passTitle));
  grid.insert(2,1,element.pass,2);
  grid.insert(3,0,element.message,2);
  grid.insert(3,2,element.button);

  element.onsubmit = function(e) {
    if(element.onlogin) return element.onlogin(e);
  };

  element.getDataForm = function() {
    return this.user.name+'='+this.user.value+'&'+this.pass.name+'='+this.pass.value;
  };

  Object.defineProperty(element,'dataform',{
    get(){return element.getDataForm();}
  });

  element.onlogin = null;
  return element;

}

function newJPMask(parent=null,child=null,background='rgba(0,0,0,0.5)') {

  var element = newJPPanel(parent);

  element.child = child;
  element.className = "mask";

  if(child){
    element.appendChild(child);
  }

  element.style.position = "absolute";
  element.style.top = "0px";
  element.style.left = "0px";
  element.style.width = "100%";
  element.style.height = "100%";
  element.style.background = background;

  element.destroy = function () {
    var body = document.getElementsByTagName("body")[0];
    body.removeChild(this);
  }

  if(!parent) {
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(element);
  }

  return element;

}

function newJPWindow(parent=null,toplevel=false,title='Window',buttons=true,resizable=true) {
  
  if (!parent) parent = document.getElementsByTagName("body")[0];
  
  var element = newJPPanel(parent);
  element.style.visibility = "hidden";
  element.mask = null;
  if(toplevel){
    element.mask = newJPMask(parent,element);
    element.mask.style.visibility = 'hidden';
    element.ondestroy = function() {
      element.mask.destroy();
    };
  }
  
  element.className = 'window';

  /***GUI***/
  element.ptop = newJPPanel(element);
  element.mainpanel = newJPPanel(element);
  
  element.mainpanel.style.overflow = 'auto';

  if(buttons) {
    element.botoes = newJPPanel(element.ptop,true);
    element.botoes.className = 'window-buttons';
    
    if(element.resizable) {
      element.btnmaxmin = newJPButton(element.botoes,'+');
      element.btnmaxmin.className = 'window-button minmax-button';
      element.btnmaxmin.window = element;
      element.btnmaxmin.onclick = function() {
        if(this.window.maximinized()) {
          this.window.minimize();
          element.btnmaxmin.value = '+';
        }else{
          this.window.maximinize();
          element.btnmaxmin.value = '-';
        }
      }
    }
    
    element.btnclose = newJPButton(element.botoes,'X');
    element.btnclose.className = 'window-button close-button';
    element.btnclose.window = element;
    element.btnclose.onclick = function() {
      if(this.window.onclose&&this.window.onclose()){
        return;
      }
      this.window.destroy();
    }
    
  }
  
  element.ptitle = newJPLabel(element.ptop, title);

  element.ptitle.className = 'title-panel';
  element.ptop.className = 'top-panel';
  element.ptitle.className = 'title';
    
  element.onresized = null;
  
  element.doresized = function() {
    this.updateSize();    
    this.onresized && this.onresized(this.offsetWidth, this.offsetHeight);
  }
  
  element.maximinize = function() {
    if(this.maximinized()) return;
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.left = '0px';
    this.style.top = '0px';
    this.doresized();
  }
  
  element.minimize = function() {
    if(!this.maximinized()) return;
    this.style.width = this.defaultWidth + 'px';
    this.style.height = this.defaultHeight + 'px';
    this.style.top = this.defaultTop + 'px';
    this.style.left = this.defaultLeft + 'px';
    this.doresized();
  }
  
  element.maximinized = function() {
    return this.style.width === '100%' && this.style.height === '100%';
  }
  
  element.geometry = function(x, y, width, height) {
    this.size(width, height);
    this.move(x, y);
  }
  
  element.updateSize = function() {    
    this.mainpanel.style.width = this.offsetWidth + 'px';
    this.mainpanel.style.height = (this.offsetHeight - this.ptop.offsetHeight) + 'px';
  }
  
  element.size = function(width, height) {
    if(this.maximinized()) return;
    if(this.offsetWidth===width&&this.offsetHeight===height) return;
    this.defaultHeight = height;
    this.defaultWidth = width;
    this.style.width = width + 'px';
    this.style.height = height + 'px';
    this.doresized();
  }

  element.parentNode.onmousemove = function(evt) {
      if(!this.selectedWindow) return;
      var win = this.selectedWindow;      
      if(!win.mdown) return;    
      var dx = evt.screenX - win.mdown.screen.x;
      var dy = evt.screenY - win.mdown.screen.y;  
      if(win.mdown.moving) {
        win.move(win.mdown.left+dx, win.mdown.top+dy);
      }else if(win.mdown.resizing) {
        if(win.style.cursor=='se-resize') {
          win.size(win.mdown.width + dx, win.mdown.height + dy);
        }else if(win.style.cursor=='e-resize') {
          win.size(win.mdown.width + dx, win.mdown.height);
        }else if(win.style.cursor=='s-resize') {
          win.size(win.mdown.width, win.mdown.height + dy);
        }
      }
  };
  
  element.onmousedown = function(evt) {
    this.mdown = {offset:{x:evt.offsetX,y:evt.offsetY}, 
                  screen:{x:evt.screenX,y:evt.screenY},
                  left:this.offsetLeft,
                  top:this.offsetTop,
                  width:this.offsetWidth, 
                  height:this.offsetHeight,
                  addWidth:function(x) {
                              var d = x - this.x;
                              return this.width + d;
                           },
                  addHeight:function(y) {
                              var d = y - this.y;
                              return this.height + d;
                           },
                  moving:this.ptop.style.cursor=='move'&&evt.buttons==Buttons.LEFT,
                  resizing:this.resizable&&(this.style.cursor=='se-resize'||this.style.cursor=='e-resize'||this.style.cursor=='s-resize')&&evt.buttons===Buttons.LEFT
                  };
    this.parentNode.selectedWindow = this;
  }
  
  element.onmouseup = function(){
    this.mdown = null;
  }
  
  element.onmousemove = function(evt) {   
    if(this.mdown) return;
    
    var Y = evt.pageY - this.offsetTop;
    var X = evt.pageX - this.offsetLeft;
    
    if(Y < this.ptop.offsetHeight) { //se ponteiro sobre o painel do topo.
      this.ptop.style.cursor = 'move';
      return;
    }else{
      if(this.ptop.style.cursor != 'default') 
        this.ptop.style.cursor = 'default';
    }
      
    if(!this.resizable) {
      if(this.style.cursor != 'default') this.style.cursor = 'default';
      return;
    }
    
    var rx = this.offsetWidth - 10;
    var by = this.offsetHeight - 10;
    
    inborderx = rx < X && X < this.offsetWidth;
    inbordery = by < Y && Y < this.offsetHeight;
    
    if(!(inborderx||inbordery)) {
      this.style.cursor = 'default';
    }else if(inborderx&&inbordery) {
      this.style.cursor = 'se-resize';
    }else if(inborderx) {
      this.style.cursor = 'e-resize';
    }else if(inbordery) {
      this.style.cursor = 's-resize';
    }
    
  }

  element.ptop.onmouseup = function(e) {
      this.mdown = null;
  };
  /*=========================*/
  
  element.style.position = "absolute";

  //properties
  element.onclose = null;

  //methods and functions
  element.move = function(x, y) {
    if(this.maximinized()) return;
    this.defaultLeft = x;
    this.defaultTop = y;
    this.style.top = y + "px";
    this.style.left = x + "px";
  };

  element.show = function() {
    if(element.mask) element.mask.style.visibility = 'visible';
    this.style.visibility = 'visible';
  };

  element.alignCenter = function() {
    //aplicando estilos
    wmx = (this.parentNode.offsetWidth / 2).toFixed(0);
    wmy = (this.parentNode.offsetHeight / 2).toFixed(0);
    emx = (this.offsetWidth / 2).toFixed(0);
    emy = (this.offsetHeight / 2).toFixed(0);
    this.move(wmx-emx,wmy-emy);
  };
  
  element.setTitle = function(value) {
    this.ptitle.setText(value);
  }
  
  element.setResizable = function(value) {
    this.resizable = value;
    this.setButtonsVisible(this.botoes!==null);
  }
  
  element.setButtonsVisible = function(value) {
    
    if(this.botoes) {
      this.botoes.destroy();
    }
    
    if(value) {
      this.botoes = newJPPanel(this.ptop,true);
      this.botoes.className = 'window-buttons';
      
      if(this.resizable) {
        this.btnmaxmin = newJPButton(this.botoes,'+');
        this.btnmaxmin.className = 'window-button minmax-button';
        this.btnmaxmin.window = this;
        this.btnmaxmin.onclick = function() {
          if(this.window.maximinized()) {
            this.window.minimize();
            this.btnmaxmin.value = '+';
          }else{
            this.window.maximinize();
            this.btnmaxmin.value = '-';
          }
        }
      }
      
      this.btnclose = newJPButton(this.botoes,'X');
      this.btnclose.className = 'window-button close-button';
      this.btnclose.window = this;
      this.btnclose.onclick = function() {
        if(this.window.onclose&&this.window.onclose()){
          return;
        }
        this.window.destroy();
      }
      
    }
  }
  
  element.appendChild = function(child) {
    element.mainpanel.appendChild(child);
  }
  
  //
  element.setResizable(resizable);
  element.setButtonsVisible(buttons);
  element.geometry(0,0,10,10);

  return element;

}

function  newJPDialog(parent=null, title='Mensagem', content=null, buttons=[], exit_onclick=false) {

  var element = newJPWindow(parent, true, title);
  element.setButtonsVisible(false);
  element.className += " dialog";
  element.content = newElement(element,'div');
  element.content.className = "content";
  element.content.style.padding = '10px';

  element.dbuttons = dbuttons = newJPPanel(element);
  dbuttons.className = "buttons";  
  
  if(exit_onclick){
    element.mask.onclick = function (e) {
      var child = this.child;
      if(child.offsetLeft<e.clientX&&e.clientX<(child.offsetLeft+child.clientWidth)&&
         child.offsetTop<e.clientY&&e.clientY<(child.offsetTop+child.clientHeight)){
        return;
      }
      this.destroy();
    }
  }

  //adicionando botoes
  buttons.forEach(function (item, index) {
    dbuttons.appendChild(item);
    item.window = element;
    if(item.result){
        item.onclick = function() {
            this.window.result = this.result;
            this.window.onresult && this.window.onresult(this.window,this.result);
        };
    }
  });
  
  element.setContent = function(content) {
    this.content.innerHTML = '';
    if(content===null) return;
    this.content.appendChild(content);
    if(this.dbuttons.offsetWidth > this.content.offsetWidth) {
      this.style.minWidth  = (this.dbuttons.offsetWidth + 30) + 'px';
    }else{
      this.style.minWidth  = (this.content.offsetWidth + 30)  + 'px';
    }
    this.style.minHeight = (20 + this.ptop.offsetHeight + this.content.offsetHeight + this.dbuttons.offsetHeight) + 'px';
    this.updateSize();
    this.alignCenter();
  }

  element.showModal = function(onresult){
      this.onresult = onresult;
      this.show();
  };
  
  element.onresized = function() {
    this.content.style.width = (this.offsetWidth - 20) + 'px';
    this.content.style.height = (this.offsetHeight - this.dbuttons.offsetHeight - this.ptop.offsetHeight - 40) + 'px';
  }

  element.onresult = null;

  element.setContent(content);

  element.alignCenter();
  

  return element;

}

function newDialogMessage(title,msg,onclose=null) {
  var bok = newJPButton(null,'Ok');
  bok.result = Result.OK;
  var element =  newJPDialog(null,title,null,[bok],true);
  element.setContent(label=newJPLabel(null,msg))
  element.ondestroy = onclose;
  element.showModal(function (sender,result) {sender.destroy();});
  return element;
}

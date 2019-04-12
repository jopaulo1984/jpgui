
Result = {NULL:0,OK:1,CANCEL:2,YES:3,NO:4};

function newElement(parent,tag='') {
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
  var element = newElement(parent,'span');
  element.className = 'label';
  Object.defineProperty(element,'text',{
    set(value){
      element.innerText = value;
    },
    get(){return element.innerText;}
  });
  element.text = text;
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

function newJPWindow(parent=null,toplevel=false,title='Window',buttons=false) {
  
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
  //titulo e botoes
  var ptop = newJPPanel(element);
  var ptitle = newJPPanel(ptop,true);
  var title = newJPLabel(ptitle,title);

  if(buttons) {
    var botoes = newJPPanel(element,true);
    var btnclose = newJPButton(botoes,'X');
    btnclose.className = 'close-button';
    btnclose.window = element;
    btnclose.onclick = function() {
      if(this.window.onclose&&this.window.onclose()){
        return;
      }
      this.window.destroy();
    }
  }

  ptop.className = 'top-panel';
  ptitle.className = 'title-panel';
  title.className = 'title';

  /*movimentando a janela*/
  ptop.myWindow = element;
  ptop.mdown = null; //{x:0,y:0};

  element.ptop = ptop;

  ptop.onmousedown = function(e) {
      if(!e.buttons==1)return;
      var x = this.myWindow.offsetLeft;
      var y = this.myWindow.offsetTop;
      this.mdown = {evt:e,wx:x,wy:y};
      this.myWindow.parentNode.selectedWindow = this.myWindow;
  };

  element.parentNode.onmousemove = function(e) {
      if(!this.selectedWindow) return;
      var win = this.selectedWindow;
      if(!win.ptop.mdown) return;
      if(e.buttons==0){
          win.ptop.mdown = null;
          return;
      }
      var dx = e.clientX-win.ptop.mdown.evt.clientX;
      var dy = e.clientY-win.ptop.mdown.evt.clientY;
      win.move(win.ptop.mdown.wx+dx,win.ptop.mdown.wy+dy);
  };

  ptop.onmouseup = function(e) {
      this.mdown = null;
  };
  /*=========================*/

  /*if(!parent){
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(this.content);
  }*/

  element.style.position = "absolute";

  //properties
  element.onclose = null;

  //methods and functions
  element.move = function(x,y) {
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

  return element;

}

function  newJPDialog(parent=null,title='Mensagem',content=null,buttons=[],exit_onclick=false,view_buttons=false) {

  var element = newJPWindow(parent,true,title,view_buttons);
  element.className += " dialog";
  element.content = newElement(element,'div');
  element.content.style.padding = '10px';

  var dbuttons = newJPPanel(element);
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

  element.setContent = function(obj) {
    this.content.innerHTML = '';
    if(obj) this.content.appendChild(obj);
    this.alignCenter();
  }

  element.setContent(content);

  element.alignCenter();

  element.showModal = function(onresult){
      this.onresult = onresult;
      this.show();
  };

  this.onresult = null;

  return element;

}

function newDialogMessage(title,msg,onclose=null) {
  var bok = newJPButton(null,'Ok');
  bok.result = Result.OK;
  var dlg001 =  newJPDialog(null,title,newJPLabel(null,msg),[bok],true);
  dlg001.ondestroy = onclose;
  dlg001.showModal(function (sender,result) {sender.destroy();});
  return dlg001;
}

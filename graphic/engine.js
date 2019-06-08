/*
 * 
 * 
 * 
 * 
 */

var gr01x  =  null;
var xmin   = -10000;
var xmax   =  10000;

const SCALE_ = 1.1;
const COS_45 = Math.cos(3.14 / 4);
            
var l01x = function(entry,s,e) {
    var arr = [];
    for(var i=s;i<=e;i++) {
        var pt = getPoint(entry,i * 0.01);
        if(pt==null) break;
        arr.push(pt);
    }
    return arr;
};

function getPoint(entry,x) {
    var y = entry.f.call(x);
    if(y===null) return null;
    return {x:x,y:y}
}

function _comp(frm){
    frm = frm.replace(/\bsen\b/gi,"Math.sin");
    frm = frm.replace(/\bcos\b/gi,"Math.cos");
    frm = frm.replace(/\btan\b/gi,"Math.tan");
    frm = frm.replace(/\basen\b/gi,"Math.asin");
    frm = frm.replace(/\bacos\b/gi,"Math.acos");
    frm = frm.replace(/\batan\b/gi,"Math.atan");
    frm = frm.replace(/²/gi,"**2");
    frm = frm.replace(/³/gi,"**3");
    frm = frm.replace(/\^/gi,"**");
    frm = frm.replace(/\braiz\b/gi,"Math.sqrt");
    return frm;
}

function compileCode(code) {
    var lex = new AnLex(code);
    var estd = 0;
    var tk = null;
    var tmp = '';
    var fname = '';
    var fpars = [];
    var ftype = 'func';
    var i = 0;
    var p = 0;
    var vec = {x: null, y: null, x0: null, y0: null};
    while(estd>-1&&i++<10000) {
        if(estd==0) {
            tk = lex.nextToken();
            if(tk==null) {
                return;
            } else if(tk.type == TKID) {
                tmp = tk.value;
                estd = 1;
            }
        } else if(estd==1) {
            tk = lex.nextToken();
            if(tk.value=='('||tk.value=='='||tk.value==':') {
                fname = tmp;
                tmp = '';
                if(tk.value=='(') {
                    estd = 2;
                    ftype = 'func';
                } else if(tk.value=='=') {
                    fpars.push('x');
                    estd = 5;
                    ftype = 'atrib';
                } else {
                    estd = 6;
                    ftype = 'vec';
                }
            } else {
                estd = -1;
            }
        } else if(estd==2) {
            tk = lex.nextToken();
            if(tk!=null&&(tk.value==')'||tk.value==',')) {
                if(tmp=='') return {type: 'err', msg: "Erro de sintaxe: esperado parâmetro ou ')'."};
                fpars.push(tmp);
                tmp = '';
                if(tk.value==')') estd = 3;
            } else if(tk!=null&&tk.type==TKID) {
                tmp = tk.value;
            } else {
                return {type: 'err', msg: "Erro de sintaxe: esperado parâmetro ou ')'."};
            }
        } else if(estd==3) {
            tk = lex.nextToken();
            if(tk.value=='<') {
                estd = 4;
            } else {
                return {type: 'err', msg: "Erro de sintaxe: esperado '<-'."};
            }
        } else if(estd==4) {
            tk = lex.nextToken();
            if(tk.value=='-') {
                estd = 5;
            } else {
                return {type: 'err', msg: "Erro de sintaxe: esperado '<-'."};
            }
        } else if(estd==5) {
            tk = lex.nextToken();
            if(tk==null) {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                return {type: ftype, f: new ObjectFunction(fname,fpars,_comp(tmp))};
            } else {
                tmp += tk.value;
            }
        } else if(estd==6) {
            tk = lex.nextToken();
            if(tk!=null&&tk.value=='(') {
                p = 1;
                estd = 7;
                tmp = '';
            } else {
                return {type: 'err', msg: "Erro de sintaxe: esperado '('."};
            }
        } else if(estd==7) {
            tk = lex.nextToken();
            if(tk==null) {
                return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
            }
            if(tk.value==',') {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                vec.x = new ObjectFunction(fname + "_x",['x'],_comp(tmp));
                tmp = '';
                estd = 8;
            } else {
                tmp += tk.value;
            }
        } else if(estd==8) {
            tk = lex.nextToken();
            if(tk==null) {
                return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
            }
            if(tk.value==')'&&p==1) {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                vec.y = new ObjectFunction(fname + "_y",['x'],_comp(tmp));
                tmp = '';
                estd = 9;            
            } else {
                tmp += tk.value;
                if(tk.value=='(') {
                    p++;
                } else if(tk.value==')') {
                    p--;
                }
            }
        } else if(estd==9) {
            tk = lex.nextToken();
            if(tk==null) {
                return {type: ftype, v: vec, f: new ObjectFunction(fname,['x'],_comp("{x:"+vec.x.exps+",y:"+vec.y.exps+"}"))};
            } else if(tk.value=='[') {
                p = 1;
                tmp = '';
                estd = 10;
            } else {
                return {type: 'err', msg: "Erro de sintaxe: token '"+ tk.value +"' inesperado."};
            }
        } else if(estd==10) {
            tk = lex.nextToken();
            if(tk==null) {
                return {type: 'err', msg: "Erro de sintaxe: esperado um valor ou identificador."};
            } 
            if(tk.value==',') {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                vec.x0 = new ObjectFunction(fname + "_x0",['x'],_comp(tmp));
                tmp = '';
                estd = 11;
            } else {
                tmp += tk.value;
            }
        } else if(estd==11) {
            tk = lex.nextToken();
            if(tk==null) {
                return {type: 'err', msg: "Erro de sintaxe: esperado ']'."};
            } 
            if(tk.value==']'&&p==1) {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                vec.y0 = new ObjectFunction(fname + "_y0",['x'],_comp(tmp));
                tmp = '';
                estd = 12;            
            } else {
                tmp += tk.value;
                if(tk.value=='[') {
                    p++;
                } else if(tk.value==']') {
                    p--;
                }
            }
        } else if(estd==12) {
            tk = lex.nextToken();
            if(tk==null) {
                return {type: ftype, v: vec, f: new ObjectFunction(fname,['x'],_comp("{x:"+vec.x.exps+",y:"+vec.y.exps+",x0:"+vec.x0.exps+",y0:"+vec.y0.exps+"}"))};
            } else {
                return {type: 'err', msg: "Erro de sintaxe: token '"+ tk.value +"' inesperado."};
            }
        } else {
            return {type: 'err', msg: "Erro de sintaxe."};
            estd = -1;
        }
    }
}

function createSerie(diventry, compiled) {
    
    diventry.serie = null;

    var a = compiled;
    
    diventry.f = a.f;
    diventry.type = a.type;
    
    try {
        if(a.type=='vec') {
            var x_ = a.v.x.call();
            var y_ = a.v.y.call();
            window[a.f.name] = {x: x_, y: y_, x0: 0, y0: 0, offX: x_, offY: y_};
            var vec = window[a.f.name];
            var pnt1 = {x:0,y:0};
            if(a.v.x0!==null) {                
                try {
                    pnt1.x = a.v.x0.call();
                    pnt1.y = a.v.y0.call();
                }catch(ex){
                    pnt1 = {x:0,y:0};
                }
            }
            vec.x0 = pnt1.x;
            vec.y0 = pnt1.y;
            vec.offX = vec.x + vec.x0;
            vec.offY = vec.y + vec.y0;
            var pnt2 = {x: vec.x + pnt1.x, y: vec.y + pnt1.y};
            diventry.serie = new GraphicSerie(new Vetor(null,[pnt1,pnt2],diventry.color),1,1,'s',diventry.f.name);            
        } else if(a.type=='func'||a.type=='atrib'){
            diventry.xmin = xmin;
            diventry.xmax = xmax;
            diventry.serie = new GraphicSerie(new PoliLinha(null,l01x(diventry,diventry.xmin, diventry.xmax),diventry.color),1,1,'s',diventry.f.name);
            if(a.type=='func') {
                window[a.f.name] = a.f.func;
            } else {
                window[a.f.name] = eval(a.f.exps);
            }
        }
    }catch{return false}
    
    return true;
    
}

function updateSeries() {
    var series = [];
    var div = document.getElementById("div-entrys");
    if(div) {
        div.childNodes.forEach(function(diventry,index) {
            if(diventry.en) {
                series.push(diventry.serie);
            }
        });
    }
    gr01x.series = series;
}

function getSeries() {
    var div = document.getElementById("div-entrys");
    var compiled = [];
    if(div) {
        for(var i=0;i<div.childNodes.length;i++) {
            var diventry = div.childNodes[i];
            diventry.setMsg("");
            var a = compileCode(diventry.code);
            compiled.push(a);
            if(a.type=='err') {
                diventry.setMsg("<font color='red'>"+a.msg+"</font>");
                return;
            }
            delete window[a.f.name];
        }        
        var ok = false;
        var __j__ = 0;
        while(!ok&&__j__++<div.childNodes.length) {
            ok = true;
            for(var i=0;i<div.childNodes.length;i++) {
                var diventry = div.childNodes[i];
                var comp = compiled[i];
                if(comp.type!=='err') {
                    var _ok = createSerie(diventry, comp);
                    ok = ok && _ok;
                }
            }
        }        
        updateSeries();
    }
}
    
function plotar() {
    getSeries();
}

function addEntry(value="",color=getRandomColor(),en=true) {
    
    var div = document.getElementById("div-entrys");
    if(!div) return;
    if(div.childNodes.length > 99) return;
    
    var diventry = (function(parent){
        var self = document.createElement("div");
        self.className = "div-entry";
        Object.defineProperty(self,"color",{
            get() {
                return this.childNodes[0].childNodes[1].value;
            }
        });
        Object.defineProperty(self,"code",{
            get() {
                return this.childNodes[0].childNodes[0].value;
            }
        });
        Object.defineProperty(self,"en",{
            get() {
                return this.childNodes[0].childNodes[3].checked;
            }
        });
        parent.appendChild(self);
        return self;
    })(div);
    
    var div1 = (function(parent){
        var self = document.createElement("div");
        parent.appendChild(self);
        return self;
    })(diventry);
    
    (function(parent){
        var self = document.createElement("input");
        self.className = "entry entry-component";
        self.value = value;
        self.onchange = plotar;
        parent.appendChild(self);
        return self;
    })(div1);
    
    (function(parent){
        var self = document.createElement("input");
        self.setAttribute("type", "color");
        self.className = "button button-color entry-component";
        self.value = color;
        self.onchange = plotar;
        parent.appendChild(self);
        return self;
    })(div1);
    
    (function(parent){
        var self = document.createElement("button");
        self.className = "button button-remove entry-component";
        self.innerText = "x";
        self.onclick = function(){remEntry(this.parentNode)};
        parent.appendChild(self);
        return self;
    })(div1);

    (function(parent){
        var self = document.createElement("input");
        self.setAttribute("type","checkbox");
        self.className = "checkbox";
        self.checked = en;
        self.onchange = plotar;
        parent.appendChild(self);
        return self;
    })(div1);
    
    (function(parent){
        var self = document.createElement("div");
        self.className = "div-msg";
        parent.msg = self;
        parent.setMsg = function(value) {
            this.msg.innerHTML = value;
        }
        parent.appendChild(self);
        return self;
    })(diventry);
    
    return diventry;
    
}

function remEntry(diventry) {
    var div = document.getElementById("div-entrys");
    if(!div) return;
    try{
        div.removeChild(diventry);
    }catch(ex){}
    if(div.childNodes.length===0) addEntry();
    plotar();
}

function getRandomColor() {
    var _rand = function(){return Math.floor(Math.random() * 180);}
    var r = _rand();
    var g = _rand();
    var b = _rand();
    function tohex(value) {
        var hex = Number(value).toString(16);
        if (hex.length < 2) {
           hex = "0" + hex;
        }
        return hex;
    }
    return "#"+tohex(r)+tohex(g)+tohex(b);
}

function zoomNormal(){
    gr01x.zoomNormal();
};

function resetGraphic() {
    gr01x.rstAxesPosition();
}

var ZoomControl = function(parent, caption="zoom") {
    var self = document.createElement("span");
    var label = document.createElement("span");
    var btndown = document.createElement("button");
    var btnup = document.createElement("button");
    var wheel = document.createElement("span");

    self.className = "zoom-control";
    label.className = "caption";
    wheel.className = "wheel";

    label.innerText = caption;
    btndown.innerText = "-";
    btnup.innerText   = "+";

    for(var i = 0;i < 5;i++) {
        var wtrace = document.createElement("span");
        wtrace.className = "wheel-trace";
        wheel.appendChild(wtrace);
    }

    self.onup = null;
    self.ondown = null;

    wheel.__msave = null;

    wheel.onmousedown = function(e) {
        this.__msave = e.pageX;
    };

    wheel.onmouseup = function(e) {
        this.__msave = null;
    };

    wheel.onmousemove = function(e) {
        if(e.buttons!=1) return;
        var dx = e.pageX - this.__msave;
        this.__msave = e.pageX;
        e.deltaX = dx;
        if(dx>0&&this.parentNode.onup) {
            this.parentNode.onup(e);
        }else if(dx<0&&this.parentNode.ondown) {
            this.parentNode.ondown(e);
        }
    };

    btnup.onclick = function(e) {
        //if(e.buttons!=1) return;
        e.deltaX = 1;
        this.parentNode.onup&&this.parentNode.onup(e);
    };

    btndown.onclick = function(e) {
        //if(e.buttons!=1) return;
        e.deltaX = -1;
        this.parentNode.ondown&&this.parentNode.ondown(e);
    };

    self.appendChild(label);
    self.appendChild(btndown);
    self.appendChild(wheel);
    self.appendChild(btnup);

    return self;
};

var Separator = function(){
    var sep = document.createElement("span");
    sep.className = "separator";
    return sep;
};

window.onload = function() {
    addEntry("f(x) <- x²",color=getRandomColor(),en=true);
    addEntry("Df(x) <- 2 * x",color=getRandomColor(),en=false);
    addEntry("A:(cos(teta),sen(teta))[k,f(k)]",color=getRandomColor(),en=true);
    addEntry("teta = atan(Df(k))",color=getRandomColor(),en=false);
    addEntry("k = -1.5",color=getRandomColor(),en=false);
    var gtools = document.getElementById("gtools");
    var panel = document.getElementById("main-panel");

    gtools.appendChild(new Separator());

    gtools.appendChild((function(){
        var zoom = new ZoomControl(null,"Zoom X");
        zoom.onup = function(e) {
            gr01x.scalex *= SCALE_;
        };
        zoom.ondown = function(e) {
            gr01x.scalex /= SCALE_;
        };
        return zoom;
    })());

    gtools.appendChild(new Separator());

    gtools.appendChild((function(){
        var zoom = new ZoomControl(null,"Zoom Y");
        zoom.onup = function(e) {
            gr01x.scaley *= SCALE_;
        };
        zoom.ondown = function(e) {
            gr01x.scaley /= SCALE_;
        };
        return zoom;
    })());

    gtools.appendChild(new Separator());

    gr01x = new Graphic(panel,[],document.body.offsetWidth - document.getElementById("panel-left").offsetWidth - 20,document.body.offsetHeight - document.getElementById("gtools").offsetHeight-20);
    
    gr01x.mdown = null;
    gr01x.msave = null;
    
    gr01x.onmousedown = function(evt) {
        this.mdown = evt;
        this.msave = {x:evt.pageX,y:evt.pageY};
    };
    
    gr01x.onmouseup = function(evt) {
        this.mdown = null;
        this.msave = null;
    };
    
    gr01x.onmousemove = function(evt) {
        if(evt.buttons==1) {            
            var dx = evt.pageX - this.msave.x;
            var dy = evt.pageY - this.msave.y;
            this.move(dx, dy);
            this.msave = {x:evt.pageX,y:evt.pageY};
        }
    };
    
    gr01x.onwheel = function(evt) {
        var scale = this.get_scale();
        if(evt.deltaY<0) {
            scale.sx *= SCALE_;
            scale.sy *= SCALE_;
        }else if(evt.deltaY>0) {
            scale.sx /= SCALE_;
            scale.sy /= SCALE_;
        }
        this.set_scale(scale.sx,scale.sy);
    };
    
    plotar();

    document.body.onresize = function() {
        gr01x.set_size(document.body.offsetWidth - document.getElementById("panel-left").offsetWidth - 20,document.body.offsetHeight - document.getElementById("gtools").offsetHeight-20);
    };

}

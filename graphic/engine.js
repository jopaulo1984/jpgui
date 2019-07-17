/*
 * 
 * 
 * 
 * 
 */
 
var GLOBALS_ = {
    cos: Math.cos,
    sen: Math.sin,
    pi: Math.pi,
    PI: Math.pi,
    tan: Math.tan,
    atan: Math.atan,
    acos: Math.acos,
    asen: Math.asin
};

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
    /*frm = frm.replace(/\bsen\b/gi,"Math.sin");
    frm = frm.replace(/\bcos\b/gi,"Math.cos");
    frm = frm.replace(/\btan\b/gi,"Math.tan");
    frm = frm.replace(/\basen\b/gi,"Math.asin");
    frm = frm.replace(/\bacos\b/gi,"Math.acos");
    frm = frm.replace(/\batan\b/gi,"Math.atan");*/
    frm = frm.replace(/²/gi,"**2");
    frm = frm.replace(/³/gi,"**3");
    frm = frm.replace(/\^/gi,"**");
    //frm = frm.replace(/\braiz\b/gi,"Math.sqrt");
    return frm;
}

function compileCode(code) {
    
    var exists = function(arr, item) {
        for(var i=0;i<arr.length;i++) {
            if(arr[i]==item){
                return true;
            }
        }
        return false;
    }
    
    function validatk(tk) {
        if(tk.type==TKID) {
            if(exists(Object.keys(GLOBALS_), tk.value)) {
                return "GLOBALS_." + tk.value;
            } else {
                return null;
            }
        }
        return tk.value;
    }
    
    function estd13(lex, fname, vec) {
        GLOBALS_[fname] = vec;
        return {type: 'vec', v: vec, f: new ObjectFunction(fname,['x'],_comp("GLOBALS_." + fname))};
    }
    
    function estd12(lex, fname, vec) {
        var tk = lex.nextToken();
        if(tk==null) {
            return estd13(lex, fname, vec);
        } else {
            return {type: 'err', msg: "Erro de sintaxe: token '"+ tk.value +"' inesperado."};
        }
    }
    
    function estd11(lex, fname, vec) {
        var p = 0;
        var tmp = "";
        while(true) {
            var tk = lex.nextToken();
            if(tk==null) {
                return {type: 'err', msg: "Erro de sintaxe: esperado ']'."};
            } 
            if(tk.value==']'&&p==0) {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                vec.y0 = (new ObjectFunction(fname + "_y0",['x'],_comp(tmp))).call();
                return estd12(lex, fname, vec);
            } else {
                var v = validatk(tk);
                if (tk.value!=='x'&&v===null) {
                    return {type: 'err', msg: "O identificador '" + tk.value + "' não foi encontrado."};
                }
                tmp += v; 
                if(tk.value=='[') {
                    p++;
                } else if(tk.value==']') {
                    p--;
                }
            }
        }
    }    
    
    function estd10(lex, fname, vec) {
        var tmp = "";
        while(true) {
            var tk = lex.nextToken(false);
            if(tk==null) {
                return {type: 'err', msg: "Erro de sintaxe: esperado um valor ou identificador."};
            } 
            if(tk.value==',') {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                vec.x0 = (new ObjectFunction(fname + "_x0",['x'],_comp(tmp))).call();
                return estd11(lex, fname, vec);
            } else {
                var v = validatk(tk);
                if (tk.value!=='x'&&v===null) {
                    return {type: 'err', msg: "O identificador '" + tk.value + "' não foi encontrado."};
                }
                tmp += v; 
            }
        }
    }
    
    function estd9(lex, fname, vec) {
        var tk = lex.nextToken();
        if(tk==null) {
            vec.x0 = 0;
            vec.y0 = 0;
            return estd13(lex, fname, vec);
        } else if(tk.value=='[') {
            return estd10(lex, fname, vec);
        } else {
            return {type: 'err', msg: "Erro de sintaxe: token '"+ tk.value +"' inesperado."};
        }
    }
    
    function estd8(lex, fname, vec) {
        var p = 0;
        var tmp = "";
        while(true) {
            var tk = lex.nextToken();
            if(tk==null) {
                return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
            }
            if(tk.value==')'&&p==0) {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                vec.y = (new ObjectFunction(fname + "_y",['x'],_comp(tmp))).call();
                return estd9(lex, fname, vec);
            } else {
                var v = validatk(tk);
                if (tk.value!=='x'&&v===null) {
                    return {type: 'err', msg: "O identificador '" + tk.value + "' não foi encontrado."};
                }
                tmp += v; 
                if(tk.value=='(') {
                    p++;
                } else if(tk.value==')') {
                    p--;
                }
            }
        }
    }    
    
    function estd7(lex, fname, vec) {
        var tmp = "";
        while(true) {
            var tk = lex.nextToken(false);
            if(tk==null) {
                return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
            }
            if(tk.value==',') {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                vec.x = (new ObjectFunction(fname + "_x",['x'],_comp(tmp))).call();
                return estd8(lex, fname, vec);
            } else {
                var v = validatk(tk);
                if (tk.value!=='x'&&v===null) {
                    return {type: 'err', msg: "O identificador '" + tk.value + "' não foi encontrado."};
                }
                tmp += v;                
            }
        }
    }
    
    function estd6(lex, fname) {
        var tk = lex.nextToken();
        if(tk!=null&&tk.value=='(') {
            return estd7(lex, fname, {
                x: 0, 
                y: 0,
                x0: 0, 
                y0: 0,
                offX: function(){return this.x + this.x0},
                offY: function(){return this.y + this.y0}
            });
        } else {
            return {type: 'err', msg: "Erro de sintaxe: esperado '('."};
        }
    }
    
    function estd5_1(lex, fname, ftype) {
        var tmp = '';
        while(true) {
            var tk = lex.nextToken(false);
            if(tk==null) {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                try {
                    saida = {type: ftype, f: new ObjectFunction(fname,[],_comp(tmp))};
                    GLOBALS_[fname] = saida.f.call();
                    return saida
                } catch(e) {
                    return {type: 'err', msg: "Erro ao atribuir valor para '" + fname + "'."};
                }
            } else {
                var v = validatk(tk);
                if (v===null) {
                    return {type: 'err', msg: "O identificador '" + tk.value + "' não foi encontrado."};
                }
                tmp += v;
            }
        }
    }
    
    function estd5(lex, fname, ftype, fpars) {
        var tmp = '';
        while(true) {
            var tk = lex.nextToken(false);
            if(tk==null) {
                if(tmp=='') {
                    return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
                }
                saida = {type: ftype, f: new ObjectFunction(fname,fpars,_comp(tmp))};
                GLOBALS_[fname] = saida.f.func;
                return saida
            } else {
                if(!exists(fpars,tk.value)) {
                    var v = validatk(tk);
                    if (!exists(fpars,tk.value)&&v===null) {
                        return {type: 'err', msg: "O identificador '" + tk.value + "' não foi encontrado."};
                    }
                    tmp += v;
                } else {
                    tmp += tk.value;
                }
            }
        }
    }
    
    function estd4(lex, fname, ftype, fpars) {
        var tk = lex.nextToken();
        if(tk.value=='-') {
            return estd5(lex, fname, ftype, fpars);
        } else {
            return {type: 'err', msg: "Erro de sintaxe: esperado '<-'."};
        }
    }
    
    function estd3(lex, fname, ftype, fpars) {
        var tk = lex.nextToken();
        if(tk.value=='<') {
            return estd4(lex, fname, ftype, fpars);
        } else {
            return {type: 'err', msg: "Erro de sintaxe: esperado '<-'."};
        }
    }
    
    function estd2(lex, fname, ftype) {
        var tmp = "";
        var fpars = [];
        while(true) {
            var tk = lex.nextToken();
            if(tk!=null&&(tk.value==')'||tk.value==',')) {
                if(tmp=='') return {type: 'err', msg: "Erro de sintaxe: esperado parâmetro ou ')'."};
                fpars.push(tmp);
                if(tk.value==')') {
                    return estd3(lex, fname, ftype, fpars);
                } else {
                    tmp = '';
                }
            } else if(tk!=null&&tk.type==TKID) {
                tmp = tk.value;
            } else {
                return {type: 'err', msg: "Erro de sintaxe: esperado parâmetro ou ')'."};
            }
        }
    }    
    
    function estd1(lex, fname) {
        var tk = lex.nextToken();
        if(tk.value=='('||tk.value=='='||tk.value==':') {
            if(tk.value=='(') {
                return estd2(lex, fname, 'func');
            } else if(tk.value=='=') {
                return estd5_1(lex, fname, 'atrib');
            } else {
                return estd6(lex, fname);
            }
        } else {
            return;
        }
    }
    
    function estd0() {
        var lex = new AnLex(code);
        var tk = lex.nextToken();
        if(tk==null) {
            return;
        } else if(tk.type == TKID) {
            return estd1(lex, tk.value);
        } else {
            return {type: 'err', msg: "Erro de sintaxe: esperada uma expressão válida."};
        }
    }
    
    return estd0();
    
    //*********************************//
    
    
}

function createSerie(diventry, compiled) {
    
    diventry.serie = null;

    var a = compiled;
    
    diventry.f = a.f;
    diventry.type = a.type;
    
    try {
        if(a.type=='vec') {
            var vec = GLOBALS_[a.f.name];
            var pnt1 = {x:vec.x0, y:vec.y0};            
            /*if(a.v.x0!==null) {                
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
            vec.offY = vec.y + vec.y0;*/
            var pnt2 = {x: vec.offX(), y: vec.offY()};
            if(diventry.en) {
                diventry.serie = new GraphicSerie(new Vetor(null,[pnt1,pnt2],diventry.color),1,1,'s',diventry.f.name);
            }
        } else if(a.type=='func'||a.type=='atrib'){
            diventry.xmin = xmin;
            diventry.xmax = xmax;
            if(diventry.en) {
                diventry.serie = new GraphicSerie(new PoliLinha(null,l01x(diventry,diventry.xmin, diventry.xmax),diventry.color),1,1,'s',diventry.f.name);
            }
            /*if(a.type=='func') {
                //GLOBALS_[a.f.name] = a.f.func;
            } else {
                //GLOBALS_[a.f.name] = eval(a.f.exps);
            }*/
        }
    }catch(e){
        //console.log(e.message);
        return false;
    }
    
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
            if(!a) continue;
            if(a.type=='err') {
                diventry.setMsg("<font color='red'>"+a.msg+"</font>");
                return;
            }
        /*try{
                delete GLOBALS_[a.f.name];
            }catch(e){};*/
        }        
        var ok = false;
        var __j__ = 0;
        while(__j__++<1/*!ok&&__j__++<div.childNodes.length*/) {
            ok = true;
            for(var i=0;i<div.childNodes.length;i++) {
                var diventry = div.childNodes[i];
                var comp = compiled[i];
                if(!comp) continue;
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
        self.onclick = function(){remEntry(this.parentNode.parentNode)};
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
        delete GLOBALS_[diventry.f.name];
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
    addEntry("k = -1.5",color=getRandomColor(),en=false);
    addEntry("teta = atan(Df(k))",color=getRandomColor(),en=false);
    addEntry("A:(cos(teta),sen(teta))[k,f(k)]",color=getRandomColor(),en=true);
    //addEntry("A:(2,3)[1,2]",color=getRandomColor(),en=true);
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

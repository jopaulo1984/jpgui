var gr01x  =  null;
var xmin   = -1000;
var xmax   =  1000;

const SCALE_ = 1.1;
            
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

function compileFormula(diventry) {
    function _comp(frm){
        frm = frm.replace(/sen/g,"Math.sin");
        frm = frm.replace(/cos/g,"Math.cos");
        frm = frm.replace(/tan/g,"Math.tan");
        frm = frm.replace(/²/g,"**2");
        frm = frm.replace(/³/g,"**3");
        frm = frm.replace(/\^/g,"**");
        frm = frm.replace(/raiz/g,"Math.sqrt");
        return frm;
    }
    var entry = diventry.childNodes[0];                              
    var formula = entry.value;
    var spl = formula.split("<-");
    if(spl.length==1) {
        var spl = _comp(formula).split("=");
        if(spl.length==1) {
            diventry.f = new ObjectFunction("...",["x"],spl[0]);
        }else{
            var fn = spl[0].trim();
            var frm = spl[spl.length-1];
            var v = eval(frm);
            diventry.f = new ObjectFunction(fn,["x"],frm);
            for(var i=0;i<spl.length-1;i++) {
                window[fn] = v;
            }
        }
    }else if(spl.length>1) {
        var fn = "";
        var p = "";
        var pars = [];
        var estd = 0;
        for(var i = 0;i < spl[0].length;i++){
            if(estd==0) {
                if(spl[0][i]=='('){
                    estd=1;
                }else if(spl[0][i]!=' '&&spl[0][i]!='\t'){
                    fn+=spl[0][i];
                }
            }else if(estd==1) {
                if(spl[0][i]==','||spl[0][i]==')') {
                    if(p=="") {
                        console.log("Esperado um parâmetro.");
                        return;
                    }
                    pars.push(p);
                    p = "";
                    if(spl[0][i]==')') {
                        estd=2;
                    }
                }else if(spl[0][i]!=' '&&spl[0][i]!='\t'){
                    p += spl[0][i];
                }
            }else if(estd==2) {
                if(spl[0][i]!=' '&&spl[0][i]!='\t') {
                    console.log("Caracter '"+spl[0][i]+"' inesperado.");
                    return;
                }
            }
                    
        }
        diventry.f = new ObjectFunction(fn,pars,_comp(spl[1]));
        
        window[fn] = diventry.f.func;
        
    }
    
}

function updateSeries() {
    var series = [];
    var div = document.getElementById("div-entrys");
    if(div) {
        div.childNodes.forEach(function(diventry,index) {
            if(diventry.childNodes[3].checked)
                series.push(new GraphicSerie(l01x(diventry,xmin, xmax),1,1,'s',diventry.f.name,diventry.color));
        });
    }
    gr01x.series = series;
}

function getSeries() {
    var div = document.getElementById("div-entrys");
    if(div) {
        div.childNodes.forEach(function(diventry,index) {
            compileFormula(diventry);
        });
        updateSeries();
    }
}
    
function plotar() {
    getSeries();
}

function addEntry(value="") {
    
    var div = document.getElementById("div-entrys");
    if(!div) return;
    if(div.childNodes.length > 99) return;
    
    var diventry = (function(parent){
        var self = document.createElement("div");
        self.className = "div-entry";
        Object.defineProperty(self,"color",{
            get() {
                return this.childNodes[1].value;
            }
        });
        parent.appendChild(self);
        return self;
    })(div);
    
    (function(parent){
        var self = document.createElement("input");
        self.className = "entry entry-component";
        self.value = value;
        self.onchange = plotar;
        parent.appendChild(self);
        return self;
    })(diventry);
    
    (function(parent){
        var self = document.createElement("input");
        self.setAttribute("type", "color");
        self.className = "button button-color entry-component";
        self.value = getRandomColor();
        self.onchange = plotar;
        parent.appendChild(self);
        return self;
    })(diventry);
    
    (function(parent){
        var self = document.createElement("button");
        self.className = "button button-remove entry-component";
        self.innerText = "x";
        self.onclick = function(){remEntry(this.parentNode)};
        parent.appendChild(self);
        return self;
    })(diventry);

    (function(parent){
        var self = document.createElement("input");
        self.setAttribute("type","checkbox");
        self.className = "checkbox";
        self.checked = true;
        self.onchange = plotar;
        parent.appendChild(self);
        return self;
    })(diventry);
    
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
    addEntry("V(x) <- sen(x)");
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

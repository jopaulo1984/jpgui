

/*
+----------------------------------------+
| graphics v0.1                          |
| Autor: João Paulo F da Silva           |
| website: jpcompweb.com.br              |
+----------------------------------------+

graphics
========

O `graphics` é um módulo que contém componentes para visualização gráfica de dados.

*/

var GraphicLegend = function (group,left=0,top=0,label='legend',lcolor='black',ltext='',lfont={name:'Courier New', size:11}) {
    this.__group        = group;
    this.__offsetLeft   = left;
    this.__offsetTop    = top;
    left                = this.__group.left + this.__offsetLeft;
    top                 = this.__group.top + this.__offsetTop;
    this.__lcolor       = this.__group.canvas.createRectangle(left, top, 10, 10, {fillstyle:lcolor, stokestyle:lcolor, linewidth:1});
    this.__label        = this.__group.canvas.createText(left + 15, top, {text:label, font:lfont});
    this.__ltext        = this.__group.canvas.createText(left + 15, top + 15, {text:ltext, font:lfont});
    
    Object.defineProperty(this,"top",{get(){return this.__offsetTop;}});
    Object.defineProperty(this,"left",{get(){return this.__offsetLeft;}});
    Object.defineProperty(this,"color",{
        get(){
            return this.__group.canvas.itemcget(this.__lcolor, 'fill');
        },
        set(value) {
            this.__group.canvas.itemconfig(this.__lcolor, {fillstyle:value});
        }
    });
    Object.defineProperty(this,"label",{
        get() {
            return this.__group.canvas.itemcget(this.__label, 'text');
        },
        set(value) {
            this.__group.canvas.itemconfig(this.__label, {text:value});
        }
    });
    Object.defineProperty(this,"text",{
        get() {
            return this.__group.canvas.itemcget(this.__ltext, 'text');
        },
        set(value) {
            this.__group.canvas.itemconfig(this.__ltext, {text:value});
        }
    });
    Object.defineProperty(this,"font",{
        get() {
            return this.__group.canvas.itemcget(this.__ltext, 'font');
        },
        set(value) {
            this.__group.canvas.itemconfig(this.__label, {font:value});
            this.__group.canvas.itemconfig(this.__ltext, {font:value});
        }
    });    
    Object.defineProperty(this,"width",{get(){return 150;}});
    Object.defineProperty(this,"height",{get(){return 40;}});
    
    this.update = function() {
        var left = this.__group.left + this.__offsetLeft;
        var top  = this.__group.top + this.__offsetTop;
        var points = this.__lcolor.bounds();
        this.__group.canvas.move(this.__lcolor, points.x1-left, points.y1-top);        
        this.__group.canvas.itemconfig(this.__llabel, {x:left + 15, y:top});
        this.__group.canvas.itemconfig(this.__ltext , {x:left + 15, y:top + 15});        
    };

    this.destroy = function() {
        this.__group.canvas.delete(this.__lcolor);
        this.__group.canvas.delete(this.__label);
        this.__group.canvas.delete(this.__ltext);
    };

}
        
var GraphicLegendGroup = function(canvas, left=0, top=0) {
    this.__legends = [];
    this.canvas = canvas;
    this.__left = left;
    this.__top = top;

    Object.defineProperty(this,"top",{
        get(){return this.__top;},
        set(value){
            if (value == this.__top) return;
            this.__top = value;
            this.update();
        }
    });

    Object.defineProperty(this,"left",{
        get(){return this.__left;},
        set(value){
            if (value == this.__left) return;
            this.__left = value;
            this.update();
        }
    });

    Object.defineProperty(this,"legends",{
        get(){return this.__legends;}
    });
    
    this.set_anchor = function(left, top, canredraw=true) {
        this.__left = left;
        this.__top  = top;
        if(canredraw) this.update();
    }
    
    this.update = function() {
        this.__legends.forEach(function(legend){
            legend.update();
        });
    }

    this.insert = function(label, color, text, font={name:'Courier New', size:11}) {
        if (this.__legends.length > 0) {
            last = this.__legends[this.__legends.length-1];
            top = last.top + last.height + 5;
        } else {
            top = 2;
        }
        var gl = new GraphicLegend(this,5,top,label,color,text,font);
        this.__legends.push(gl);
    }

    this.remove_all = function() {
        this.__legends.forEach(function(legend){
            legend.destroy();
        });
        this.__legends = [];
    }

    this.destroy = function() {
        this.remove_all();
    }

}

var GraphicSerie = function(points=[{x:0,y:0}],x_div=1,y_div=1,x_label='X',y_label='Y',color='white',width=2) {
    this.points = points;
    this.x_div = x_div;
    this.y_div = y_div;
    this.x_label = x_label;
    this.y_label = y_label;
    this.color = color;
    this.width = width;
}

function Graphic(master=null, series=[], w=760, h=560) {
    
    var self = new GCanvas();

    if (master) {
        master.appendChild(self);
    }
    
    self.__enlegs = false;
    self.__series = series;
    self.__y_0 = 0;
    self.__x_0 = 0;
    self.__divsizex = 60;
    self.__divsizey = 60;
    self.__leg_group = new GraphicLegendGroup(self);
    self.__inst = -1;
    self.__scalex = 1.0;
    self.__scaley = 1.0;
    
    Object.defineProperty(self,'scalex',{
        get(){return this.__scalex;},
        set(value) {
            if(this.__scalex==value) return;
            this.__scalex = value;
            this.__draw_all();
        }
    });
    
    Object.defineProperty(self,'scaley',{
        get(){return this.__scaley;},
        set(value) {
            if(this.__scaley==value) return;
            this.__scaley = value;
            this.__draw_all();
        }
    });
    
    Object.defineProperty(self,'legendsgroup',{
        get(){return this.__leg_group;}
    });
    
    Object.defineProperty(self,'series',{
        set(value){
            this.__series = value;
            this.draw();
        },
        get(){return this.__series;}
    });
    
    Object.defineProperty(self,'x_0',{
        get(){return this.__x_0;},
        set(value){
            if(value==this.__x_0) return;
            this.__x_0 = value;
            this.__draw_all();
        }
    });
    
    Object.defineProperty(self,'y_0',{
        get(){return this.__y_0;},
        set(value){
            if(value==this.__y_0) return;
            this.__y_0 = value;
            this.__draw_all();
        }
    });
    
    Object.defineProperty(self,'divsizex',{
        set(value){
            this.__divsizex = value;
            this.__draw_all();
        },
        get(){return this.__divsizex;}
    });
    
    Object.defineProperty(self,'divsizey',{
        set(value){
            this.__divsizey = value;
            this.__draw_all();
        },
        get(){return this.__divsizey;}
    });
    
    Object.defineProperty(self,"enabledLegends",{
        get(){return this.__enlegs},
        set(value) {
            if(this.__enlegs==value) return;
            this.__enlegs = value;
            this.__draw_all();
        }
    });
    
    self.get_gridview_bounds = function() {
        return {
            left:20,
            top:20,
            right:(function(self){
                if(self.enabledLegends)
                    return self.width - 200;
                return self.width - 20;
            })(this),
            bottom:(function(self){
                if(self.enabledLegends)
                    return self.height - 200;
                return self.height - 20;
            })(this)
        };
    };
    
    self.get_scale = function() {
        return {sx:this.__scalex,sy:this.__scaley};
    };
    
    self.set_scale = function(sx, sy) {
        if(this.__scalex==sx&&this.__scaley==sy) return;
        this.__scalex = sx;
        this.__scaley = sy;
        this.__draw_all();
    };
    
    self.set_size = function(w, h) {        
        if (w<480) w = 480;
        if (h<320) h = 320;
        this.width = w;
        this.height = h;
        this.__draw_all();
    }
    
    self.set_axes = function(x_0, y_0) {
        this.__x_0 = x_0;
        this.__y_0 = y_0;
        this.__draw_all();
    }
    
    self.set_colors = function(bg, fg, div, subdiv, axes) {
        this.__bg = bg;
        this.__fg = fg;
        this.__dcolor = div;
        this.__sdcolor = subdiv;
        this.__xycolor = axes;
        this.__draw_all();
    };

    self.__get_scaledx = function(value) {
        return this.__scalex * value;
    };

    self.__get_scaledy = function(value) {
        return this.__scaley * value;
    };
        
    self.__draw_base = function() {
        /**desenha os objetos base do grÃ¡fico.**/
        this.deleteFromTags('base');
        this.deleteFromTags('series');

        w = this.width;
        h = this.height;
        
        var gbounds = this.get_gridview_bounds();
        
        var gw = gbounds.right - gbounds.left;
        var gh = gbounds.bottom - gbounds.top;

        var sdivx = this.__get_scaledx(this.divsizex);
        var sdivy = this.__get_scaledy(this.divsizey);
        
        var subdivwx = sdivx / 2;
        var subdivwy = sdivy / 2;
        
        var f_0 = function(i, j) {return (j / 2) + i;}
        
        var x_0 = gbounds.left + f_0( this.__get_scaledx(this.x_0), gw);
        var y_0 = gbounds.top  + f_0(-this.__get_scaledy(this.y_0), gh);
        
        var ndivx = gw / sdivx;
        var ndivy = gh / sdivy;
        var xvalues = [];
        var yvalues = [];

        this.createRectangle(0,0,w,h,{strokecolor:this.__bg,fillcolor:'white',linewidth:0,tags:'base'});
        this.createRectangle(gbounds.left,gbounds.top,gw,gh,{fillcolor:this.__bg,strokecolor:this.__xycolor,linewidth:2,tags:'base'});
        
        var getmin = function(value){
            var x = 60 / value;
            if(1>x&&x>=0.5) {
                return 1;
            }else if(0.5>x&&x>=0.25) {
                return 0.5;
            }else if(0.25>x&&x>=0.1) {
                return 0.25;
            }else if(0.1>x&&x>=0.05) {
                return 0.1;
            }else if(0.05>x&&x>=0.01) {
                return 0.05;
            }else if(0.01>x) {
                return 0.01;
            }
            return Math.floor(x); // > 0 ? x : 1
        };
        
        var minvaluesx = getmin(sdivx);
        var minvaluesy = getmin(sdivy);
        
        /*var minvaluesx = 60 / sdivx;
        var minvaluesy = 60 / sdivy;*/

        var axelim = function(pos,min,max) {
            if(min<pos&&pos<max) return pos;
            if(pos<min) return min;
            if(pos>max) return max;
        }

        var ax = axelim(x_0,gbounds.left,gbounds.right);
        var ay = axelim(y_0,gbounds.top,gbounds.bottom);
        
        /**inserindo linhas veritcais das subdivisÃµes**/
        (function(self) {
            var minsubx = subdivwx * minvaluesx / 2;
            var minsuby = subdivwy * minvaluesy / 2;
            //inserindo as linhas verticais do x positivo:
            var x = 0;
            var i = 0;
            while (i++ < 1000) {
                var cx = x_0 + x + 2;
                if (cx > gbounds.right) {break;}
                if(x!=0&&cx>gbounds.left) {
                    self.createLine(cx, gbounds.top+1, cx, gbounds.bottom-1, {strokestyle:self.__sdcolor, tags:'base'});
                }
                x += minsubx;
            }
            
            //inserindo as linhas verticais do x negativo:
            var x =  0;
            var j =  0;
            var i =  0;
            while (i++ < 1000) {
                var cx = x_0 + x + 2;
                if (cx < gbounds.left) {
                    break;}
                if(x!=0&&cx<gbounds.right) {
                    self.createLine(cx, gbounds.top+1, cx, gbounds.bottom-1, {strokestyle:self.__sdcolor, tags:'base'});
                }
                x -= minsubx;
            }
            
            /**inserindo linhas horizontais das subdivisÃµes**/
            //inserindo as linhas horizontais do y positivo:
            var y = 0;
            var j = 0;
            var i = 0;
            while (i++ < 1000) {
                var cy = y_0 + y;
                if (cy < gbounds.top) {break;}
                if(y!=0&&cy<gbounds.bottom) {
                    self.createLine(gbounds.left+1, cy, gbounds.right-1, cy, {strokestyle:self.__sdcolor, tags:'base'});
                }
                y -= minsuby;
            }
            
            //inserindo as linhas horizontais do y negativo:
            var y = 0;
            var j = 0;
            var i = 0;
            while (i++ < 1000) {
                var cy = y_0 + y;
                if (cy>gbounds.bottom) {break;}
                if(y!=0&&cy>gbounds.top){
                    self.createLine(gbounds.left+1, cy, gbounds.right-1, cy, {strokestyle:self.__sdcolor, tags:'base'});
                }
                j++;
                y += minsuby;
            }
        })(this);
        
        /**inserindo linhas verticais**/
        (function(self) {
            var minsubx = sdivx * minvaluesx;
            var minsuby = sdivy * minvaluesy;
            var ismin = function(i,minsub){return i % minsub == 0;};
            //inserindo as linhas verticais do x positivo:
            var x = 0;
            var j = 0;
            var i = 0;
            while (i++ < 1000) {
                var cx = x_0 + x; // + 2;
                if (cx>gbounds.right) {break;}
                if(x!=0&&gbounds.left<cx) {
                    self.createLine(cx, gbounds.top+1, cx, gbounds.bottom-1, {strokestyle:self.__dcolor, tags:'base'});
                    self.createText(cx, ay, {text:j.toFixed(2), font:{name:'Courier New', size:12}, tags:'base'});                    
                }
                j += minvaluesx;
                x += minsubx;
            }
            
            //inserindo as linhas verticais do x negativo:
            var x =  0;
            var j =  0;
            var i =  0;
            while (i++ < 1000) {
                var cx = x_0 + x; // + 2;
                if (cx < gbounds.left) {break;}
                if(x!=0&&cx<gbounds.right) {
                    self.createLine(cx, gbounds.top+1, cx, gbounds.bottom-1, {strokestyle:self.__dcolor, tags:'base'});
                    self.createText(cx, ay, {text:j.toFixed(2), font:{name:'Courier New', size:12}, tags:'base'});
                }
                j -= minvaluesx;
                x -= minsubx;
            }
            
            /**inserindo linhas horizontais**/
            //inserindo as linhas horizontais do y positivo:
            var y = 0;
            var j = 0;
            var i = 0;
            while (i++ < 1000) {
                var cy = y_0 + y;
                if (cy < gbounds.top) {break;}
                if(y!=0&&cy<gbounds.bottom) {
                    self.createLine(gbounds.left+1, cy, gbounds.right-1, cy, {strokestyle:self.__dcolor, tags:'base'});
                    self.createText(ax, cy, {text:j.toFixed(2), font:{name:'Courier New', size:12}, tags:'base'});
                }
                j += minvaluesy;
                y -= minsuby;
            }
            
            //inserindo as linhas horizontais do y negativo:
            var y =  0;
            var j =  0;
            var i =  0;
            while (i++ < 1000) {
                var cy = y_0 + y;
                if (cy > gbounds.bottom) {break;}
                if(y!=0&&gbounds.top<cy) {
                    self.createLine(gbounds.left+1, cy, gbounds.right-1, cy, {strokestyle:self.__dcolor, tags:'base'});
                    self.createText(ax, cy, {text:j.toFixed(2), font:{name:'Courier New', size:12}, tags:'base'});
                }
                j -= minvaluesy;
                y += minsuby;
            }
        })(this);

        this.createLine(gbounds.left, ay, gbounds.right, ay, {strokestyle:self.__xycolor,tags:'base',linewidth:1});
        this.createLine(ax, gbounds.top, ax, gbounds.bottom, {strokestyle:self.__xycolor,tags:'base',linewidth:1});
        
        this.__leg_group.set_anchor(gbounds.right + 10, 20, false);

    };
    
    self.__draw_all = function() {
        this.__draw_base();
        this.draw();
    };

    self.draw = function() {

        this.deleteFromTags("series");

        w = this.width;
        h = this.height;
        
        var gbounds = this.get_gridview_bounds();
        
        gw = gbounds.right - gbounds.left
        gh = gbounds.bottom - gbounds.top

        var sdivx = this.__get_scaledx(this.divsizex);
        var sdivy = this.__get_scaledy(this.divsizey);
        
        subdivwx = Math.floor(sdivx / 2);
        subdivwy = Math.floor(sdivy / 2);

        f_0 = function(i, j) {return (j / 2) + i};

        x_0 = gbounds.left + f_0( this.__get_scaledx(this.x_0), gw);
        y_0 = gbounds.top  + f_0(-this.__get_scaledy(this.y_0), gh);

        var self = this;
                
        f = function(value, y_div) {return y_0 - (sdivy/y_div) * value}
        g = function(value, x_div) {return x_0 + (sdivx/x_div) * value}

        function get_limited_points(p1,p2) {
            function _f(i1,i2,l1,l2) {
                var d1 = i1 - l1;   // i1 = 20 L1 = 21
                var d2 = i2 - l1;   // 
                if (d1 <  0 && d2 <  0) return {i1:null,i2:null};
                d1 = l2 - i1;
                d2 = l2 - i2;
                if (d1 <  0 && d2 <  0) return {i1:null,i2:null};
                return {i1:i1,i2:i2};
            }
            pp = _f(p1.x,p2.x,gbounds.left+1,gbounds.right-1);
            p1.x = pp.i1;
            p2.x = pp.i2;
            if (p1.x === null) return {x1:null,y1:null,x2:null,y2:null};
            pp = _f(p1.y,p2.y,gbounds.top+1,gbounds.bottom-1);
            p1.y = pp.i1;
            p2.y = pp.i2;
            if (p1.y === null) return {x1:null,y1:null,x2:null,y2:null};
            return {x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y};
        }

        var xl0 = w-180;
        var xl1 = xl0+5;
        var xl2 = xl1+20;
        var xl3 = xl2+5;
        var yl0 = 0;
        
        function fleg(leg) {
            var result = '';
            for(var i=0;i<20;i++) {
                if (i < leg.length) {
                    result += leg[i];
                }else{
                    result += ' ';
                }
            }
            return result;
        }

        this.__leg_group.remove_all();
        
        this.series.forEach(function(serie) {
            if(serie===null) return;
            if (!(serie.y_div==0 || serie.x_div==0)) {
                // == curva ==
                for(var i=1;i<serie.points.length;i++) {
                    p1 = serie.points[i-1];
                    p2 = serie.points[i];
                    lp = get_limited_points({x:g(p1.x, serie.x_div),y:f(p1.y, serie.y_div)}, {x:g(p2.x, serie.x_div),y:f(p2.y, serie.y_div)});
                    if (lp.x1) {
                        self.createLine(lp.x1, lp.y1, lp.x2, lp.y2, {strokestyle:serie.color, linewidth:serie.width, tags:'series'});
                    }
                }
            }
            if(self.enabledLegends) {
                // == legenda ==
                self.__leg_group.insert(fleg(serie.y_label),serie.color,'x <- ' + serie.x_div.toFixed(2) + '\ny <- ' + serie.y_div.toFixed(2) +'\n');
            }
        });
        
        this.createRectangle(1,1,w-2,18,{fillstyle:'white',strokestyle:'white',tags:'series'});
        this.createRectangle(w-18,1,w-18,h-2,{fillstyle:'white',strokestyle:'white',tags:'series'});
        this.createRectangle(1,h-18,w-2,h-2,{fillstyle:'white',strokestyle:'white',tags:'series'});
        this.createRectangle(1,1,18,h-2,{fillstyle:'white',strokestyle:'white',tags:'series'});
    }
    
    self.zoomIn = function() {
        this.zoomInX();
        this.zoomInY();
    };
    
    self.zoomOut = function() {
        this.zoomOutX();
        this.zoomOutY();
    };
    
    self.zoomNormal = function() {
        this.__scalex = 1.0;
        this.__scaley = 1.0;
        this.__draw_all();
    };
    
    self.zoomInX = function(value=0.01) {
        if(this.__scalex>100) return;
        this.__scalex += value;
        this.__draw_all();
    };
    
    self.zoomOutX = function(value=0.01) {
        if(this.__scalex<=0.01) return;
        this.__scalex -= value;
        if(this.__scalex<=0) this.__scalex = 0.01;
        this.__draw_all();
    };
    
    self.zoomNormalX = function() {
        this.__scalex = 1.0;
        this.__draw_all();
    };
    
    self.zoomInY = function(value=0.01) {
        if(this.__scaley>100) return;
        this.__scaley += value;
        this.__draw_all();
    };
    
    self.zoomOutY = function(value=0.01) {
        if(this.__scaley<=0.01) return;
        this.__scaley -= value;
        if(this.__scaley<=0) this.__scaley = 0.01;
        this.__draw_all();
    };
    
    self.zoomNormalY = function() {
        this.__scaley = 1.0;
        this.__draw_all();
    };
    
    self.moveLeft = function() {
        this.x_0 -= 0.2;
    };
    
    self.moveRight = function() {
        this.x_0 += 0.2;
    };
    
    self.moveDown = function() {
        this.y_0 -= 0.2;
    };
    
    self.moveUp = function() {
        this.y_0 += 0.2;
    };
    
    self.move = function(dx, dy) {
        this.__x_0 += dx / this.__scalex;
        this.__y_0 -= dy / this.__scaley;
        this.__draw_all();
    };

    self.rstAxesPosition = function() {
        this.__x_0 = 0;
        this.__y_0 = 0;
        this.__draw_all();
    };
    
    self.set_size(w, h);
    self.set_colors('#FFFFFF','#1A1A1A','#BFBFBF','#E5E5E5','#000000');
    
    return self;
}
    
        

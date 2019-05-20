

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
    
    self = new GCanvas();

    if (master) {
        master.appendChild(self);
    }

    self.__series = series;
    self.__y_0 = 0;
    self.__x_0 = 0;
    self.__divsize = 60;
    self.__divsizex = 60;
    self.__divsizey = 60;
    self.__leg_group = new GraphicLegendGroup(self);
    self.__inst = -1;
    
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
    
    Object.defineProperty(self,'divsize',{
        set(value){
            this.__divsize = value;
            this.__divsizex = value;
            this.__divsizey = value;
            this.__draw_all();
        },
        get(){return this.__divsize;}
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
    
    self.set_size = function(w, h) {        
        if (w<480) w = 480;
        if (h<320) h = 320;
        /*w = w - (w % this.__divsize);
        h = h - (h % this.__divsize);*/
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
    }
        
    self.__draw_base = function() {
        /**desenha os objetos base do gráfico.**/
        this.deleteFromTags('base');
        this.deleteFromTags('series');

        w = this.width;
        h = this.height;
        
        var gtop = 20;
        var gleft = 20;
        var gright = w - 200;
        var gbottom = h - 20;
        var gw = gright - gleft;
        var gh = gbottom - gtop;
        
        var subdivwx = this.__divsizex / 2;
        var subdivwy = this.__divsizey / 2;
        
        var f   = function(i) {return Math.trunc(i / subdivw);}
        var f_0 = function(i, j) {return (j / 2) + i;}
        
        var x_0 = gleft + f_0(this.x_0, gw / subdivwx);
        var y_0 = gtop  + f_0(-this.y_0, gh / subdivwy);
        
        var ndivx = gw / this.__divsizex;
        var ndivy = gh / this.__divsizey;
        var xvalues = [];
        var yvalues = [];

        this.createRectangle(0,0,w,h,{strokecolor:this.__bg,fillcolor:'white',linewidth:0,tags:'base'});
        this.createRectangle(gleft,gtop,gw,gh,{fillcolor:this.__bg,strokecolor:this.__xycolor,linewidth:2,tags:'base'});
        
        var getmin = function(x){
            x -= x % 3;
            return x > 0 ? x : 1
        };
        
        var minvaluesx = getmin(Math.floor(60 / this.divsizex));
        var minvaluesy = getmin(Math.floor(60 / this.divsizey));
        
        /**inserindo linhas veritcais das subdivisões**/
        (function(self) {
            var minsubx = subdivwx * minvaluesx / 2;
            var minsuby = subdivwy * minvaluesy / 2;
            //inserindo as linhas verticais do x positivo:
            var x = 0;
            var j = 0;
            var i = 0;
            while (i++ < 1000) {
                var cx = x_0 + x + 2;
                if (cx > gright) {
                    break;
                }
                if(x!=0) {
                    self.createLine(cx, gtop+1, cx, gbottom-1, {strokestyle:self.__sdcolor, tags:'base'});
                }
                j++;
                x += minsubx;
            }
            
            //inserindo as linhas verticais do x negativo:
            var x =  0;
            var j =  0;
            var i =  0;
            while (i++ < 1000) {
                var cx = x_0 + x + 2;
                if (cx < gleft) {
                    break;}
                if(x!=0) {
                    self.createLine(cx, gtop+1, cx, gbottom-1, {strokestyle:self.__sdcolor, tags:'base'});
                }
                j++;
                x -= minsubx;
            }
            
            /**inserindo linhas horizontais das subdivisões**/
            //inserindo as linhas horizontais do y positivo:
            var y = 0;
            var j = 0;
            var i = 0;
            while (i++ < 1000) {
                var cy = y_0 + y;
                if (cy < gtop) {
                    break;}
                if(y!=0) {
                    self.createLine(gleft+1, cy, gright-1, cy, {strokestyle:self.__sdcolor, tags:'base'});
                }
                j++;
                y -= minsuby;
            }
            
            //inserindo as linhas horizontais do y negativo:
            var y = 0;
            var j = 0;
            var i = 0;
            while (i++ < 1000) {
                var cy = y_0 + y;
                if (cy > gbottom) {
                    break;}
                if(y!=0){
                    self.createLine(gleft+1, cy, gright-1, cy, {strokestyle:self.__sdcolor, tags:'base'});
                }
                j++;
                y += minsuby;
            }
        })(this);
        
        /**inserindo linhas veritcais**/
        (function(self) {
            var minsubx = self.divsizex * minvaluesx;
            var minsuby = self.divsizey * minvaluesy;
            //inserindo as linhas verticais do x positivo:
            var x = 0;
            var j = 1;
            var i = 0;
            while (i++ < 1000) {
                var cx = x_0 + x + 2;
                if (cx > gright) {
                    break;}
                if(x!=0) {
                    //if(j % minvaluesx == 0) {
                    self.createLine(cx, gtop+1, cx, gbottom-1, {strokestyle:self.__dcolor, tags:'base'});
                    self.createText(cx, y_0, {text:j.toFixed(2), font:{name:'Courier New', size:12}, tags:'base'});
                    //}
                    j++;
                }
                x += minsubx; //self.__divsizex;
            }
            
            //inserindo as linhas verticais do x negativo:
            var x =  0;
            var j = -1;
            var i =  0;
            while (i++ < 1000) {
                var cx = x_0 + x + 2;
                if (cx < gleft) {
                    break;
                }
                if(x!=0)  {
                    //if(j % minvaluesx == 0) {
                    self.createLine(cx, gtop+1, cx, gbottom-1, {strokestyle:self.__dcolor, tags:'base'});
                    self.createText(cx, y_0, {text:j.toFixed(2), font:{name:'Courier New', size:12}, tags:'base'});
                    //}
                    j--;
                }
                x -= minsubx; //self.__divsizex;
            }
            
            /**inserindo linhas horizontais**/
            //inserindo as linhas horizontais do y positivo:
            var y = 0;
            var j = 1;
            var i = 0;
            while (i++ < 1000) {
                var cy = y_0 + y;
                if (cy < gtop) {
                    break;
                }
                if(y!=0) {
                    //if(j % minvalues == 0) {
                    self.createLine(gleft+1, cy, gright-1, cy, {strokestyle:self.__dcolor, tags:'base'});
                    self.createText(x_0, cy, {text:j.toFixed(2), font:{name:'Courier New', size:12}, tags:'base'});
                    //}
                    j++;
                }
                y -= minsuby; //self.__divsize;
            }
            
            //inserindo as linhas horizontais do y negativo:
            var y =  0;
            var j = -1;
            var i =  0;
            while (i++ < 1000) {
                var cy = y_0 + y;
                if (cy > gbottom) {
                    break;
                }
                if(y!=0) {
                    //if(j % minvalues == 0) {
                    self.createLine(gleft+1, cy, gright-1, cy, {strokestyle:self.__dcolor, tags:'base'});
                    self.createText(x_0, cy, {text:j.toFixed(2), font:{name:'Courier New', size:12}, tags:'base'});
                    //}
                    j--;
                }
                y += minsuby; //self.__divsize;
            }
        })(this);

        this.createLine(gleft, gtop, gleft, gbottom, {strokecolor:self.__xycolor, tags:"base"});
        
        this.__leg_group.set_anchor(gright + 10, 20, false);

    };
    
    self.__draw_all = function() {
        this.__draw_base();
        this.draw();
    };

    self.draw = function() {

        this.deleteFromTags("series");

        w = this.width;
        h = this.height;
                
        gtop = 20
        gleft = gtop
        gright = w - 200
        gbottom = h - 20
        gw = gright - gleft
        gh = gbottom - gtop
        
        subdivwx = Math.floor(this.__divsizex / 2);
        subdivwy = Math.floor(this.__divsizey / 2);

        f_0 = function(i, j) {return (j / 2) + i};

        y_0 = gtop  + f_0(-this.y_0, gh / subdivwy);
        x_0 = gleft + f_0( this.x_0, gw / subdivwx);

        var self = this;

        this.createLine(gleft, y_0, gright, y_0, {strokestyle:self.__xycolor,tags:'series',linewidth:1});
        this.createLine(x_0, gtop, x_0, gbottom, {strokestyle:self.__xycolor,tags:'series',linewidth:1});
                
        f = function(value, y_div) {return y_0 - (self.__divsizey/y_div) * value}
        g = function(value, x_div) {return x_0 + (self.__divsizex/x_div) * value}

        function get_limited_points(p1,p2) {
            function _f(i1,i2,l1,l2) {
                var d1 = i1 - l1;   // i1 = 20 L1 = 21
                var d2 = i2 - l1;   // 
                if (d1 <  0 && d2 <  0) return {i1:null,i2:null};
                if (d1 <  0 && d2 >= 0) i1 = l1;
                if (d1 >= 0 && d2 <  0) i2 = l1;
                d1 = l2 - i1;
                d2 = l2 - i2;
                if (d1 <  0 && d2 <  0) return {i1:null,i2:null};
                if (d1 <  0 && d2 >= 0) i1 = l2;
                if (d1 >= 0 && d2 <  0) i2 = l2;
                return {i1:i1,i2:i2};
            }
            pp = _f(p1.x,p2.x,gleft+1,gright-1);
            p1.x = pp.i1;
            p2.x = pp.i2;
            if (p1.x === null) return {x1:null,y1:null,x2:null,y2:null};
            pp = _f(p1.y,p2.y,gtop+1,gbottom-1);
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
            //if not type(serie) is GraphicSerie: continue
            if (!(serie.y_div==0 || serie.x_div==0)) {
                // == curva ==
                for(var i=1;i<serie.points.length;i++) {
                    p1 = serie.points[i-1];
                    p2 = serie.points[i];
                    /*lp = get_limited_points({x:g(p1.x, serie.x_div),y:f(p1.y, serie.y_div)}, {x:g(p2.x, serie.x_div),y:f(p2.y, serie.y_div)});
                    if (lp.x1) {
                        self.createLine(lp.x1, lp.y1, lp.x2, lp.y2, {strokestyle:serie.color, linewidth:serie.width, tags:'series'});
                    }*/
                    ppx1 = {x:g(p1.x, serie.x_div),y:f(p1.y, serie.y_div)};
                    ppx2 = {x:g(p2.x, serie.x_div),y:f(p2.y, serie.y_div)};
                    if(gleft<ppx1.x&&ppx1.x<gright) {
                        if(gtop<ppx1.y&&ppx1.y<gbottom) {
                            if(gleft<ppx2.x&&ppx2.x<gright) {
                                if(gtop<ppx2.y&&ppx2.y<gbottom) {
                                    self.createLine(ppx1.x, ppx1.y, ppx2.x, ppx2.y, {strokestyle:serie.color, linewidth:serie.width, tags:'series'});
                                }
                            }
                        }
                    }
                }
            }
            // == legenda ==
            self.__leg_group.insert(fleg(serie.y_label),serie.color,'x <- ' + serie.x_div.toFixed(2) + '\ny <- ' + serie.y_div.toFixed(2) +'\n');
        });
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
        this.zoomNormalX();
        this.zoomNormalY();
    };
    
    self.zoomInX = function() {
        if(this.divsizex>1000) return;
        this.divsizex += 10;
    };
    
    self.zoomOutX = function() {
        if(this.divsizex<=10) return;
        this.divsizex -= 10;
    };
    
    self.zoomNormalX = function() {
        this.divsizex = 60;
    };
    
    self.zoomInY = function() {
        if(this.divsizey>1000) return;
        this.divsizey += 10;
    };
    
    self.zoomOutY = function() {
        if(this.divsizey<=10) return;
        this.divsizey -= 10;
    };
    
    self.zoomNormalY = function() {
        this.divsizey = 60;
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
        this.__x_0 += dx;
        this.__y_0 -= dy;
        this.__draw_all();
    };
    
    self.set_size(w, h);
    self.set_colors('#FFFFFF','#1A1A1A','#BFBFBF','#E5E5E5','#000000');
    
    return self;
}
    
        


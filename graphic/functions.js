
var ObjectFunction = function(name,params,exps,pvalues=[]) {
    this.name = name;
    this.params = params;
    this.exps = exps;
    this.call = function(...args) {
        if(!this.func) return;
        return this.func(...args);
    };
    (function(self) {
        var pars = "";
        for(var i = 0; i < self.params.length; i++) {
            if(i > 0) pars += ",";
            pars += self.params[i];
        }
        var fs = "self.func = function("+pars+"){return "+self.exps+"}";
        eval(fs);
    })(this);
};

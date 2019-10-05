
const NS = "http://www.w3.org/2000/svg";
let svg = document.getElementById('svg');
function Node(x, y, type){
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 18;
    this.type = type;
    this.text = "";
    this.obj = createObj(type, x, y, 20, 18, "");
    svg.appendChild(this.obj);
    this.arms = {
        up     :null,
        down   :null,
        left   :null,
        right  :null,
        free:[],
    };

    this.toString = function(){return this.x+","+this.y+" "+this.type;};
    this.getArmsCount = function() {
        return (this.arms.up   ?1:0)
             + (this.arms.down ?1:0)
             + (this.arms.left ?1:0)
             + (this.arms.right?1:0)
             + (this.arms.free.length);
    };

    this.move = function(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.update();
    };
    this.update = function(){
        svg.removeChild(this.obj);
        this.obj = createObj(this.type, this.x, this.y, this.width, this.height, this.text);
        svg.appendChild(this.obj);
        this.color = this.obj.getAttribute("fill");
        if(this.arms.left ) this.arms.left.update();
        if(this.arms.right) this.arms.right.update();
        if(this.arms.up   ) this.arms.up.update();
        if(this.arms.down ) this.arms.down.update();
        this.arms.free.forEach((e)=>e.update());
    };
    function createTextElement(text, x, y){
        const t = document.createElementNS(NS,"text");
        t.setAttribute('x',x);
        t.setAttribute('y',y);
        t.setAttribute('text-anchor',"middle");
        t.setAttribute('dominant-baseline',"central");
        t.setAttribute('font-size',8);
        t.innerHTML = text;
        return t;
    }
    function createObj(type, x, y, w, h, text){
        let obj;
        if(type=="start") {
            const obj = document.createElementNS(NS,"circle");
            obj.setAttribute('cx',x);
            obj.setAttribute('cy',y);
            obj.setAttribute('r',5);
            obj.setAttribute('fill',"#0F8");
            return obj;
        }
        if(type=="knot") {
            const obj = document.createElementNS(NS,"circle");
            obj.setAttribute('cx',x);
            obj.setAttribute('cy',y);
            obj.setAttribute('r',3);
            obj.setAttribute('fill',"#000");
            return obj;
        }
        if(type=="cond") {
            const g = document.createElementNS(NS,"g");
            const p = document.createElementNS(NS,"polygon");
            const _top    =  x     +","+(y-h/2);
            const _bottom =  x     +","+(y+h/2);
            const _left   = (x-w/2)+","+ y     ;
            const _right  = (x+w/2)+","+ y     ;
            p.setAttribute('points',[_top,_left,_bottom,_right].join(" "));
            p.setAttribute('stroke',"red");
            p.setAttribute('fill',"#FF8");
            const t = createTextElement(text, x, y);
            g.appendChild(p);
            g.appendChild(t);
            return g;
        }
        if(type=="process") {
            const g = document.createElementNS(NS,"g");
            const p = document.createElementNS(NS,"rect");
            const t = createTextElement(text, x, y);
            p.setAttribute('x',x-w/2);
            p.setAttribute('y',y-h/2);
            p.setAttribute('width',w);
            p.setAttribute('height',h);
            p.setAttribute('stroke',"red");
            p.setAttribute('fill',"#FA8");
            g.appendChild(p);
            g.appendChild(t);
            return g;
        }
        if(type=="IO") {
            const g = document.createElementNS(NS,"g");
            const p = document.createElementNS(NS,"polygon");
            const t = createTextElement(text, x, y);
            const _nw = (x-w/2    )+","+(y-h/2);
            const _nc = (x-w/2+h/2)+","+ y     ;
            const _sw = (x-w/2    )+","+(y+h/2);
            const _se = (x+w/2    )+","+(y+h/2);
            const _sc = (x+w/2+h/2)+","+ y     ;
            const _ne = (x+w/2    )+","+(y-h/2);
            p.setAttribute('points',[_nw,_nc,_sw,_se,_sc,_ne].join(" "));
            p.setAttribute('stroke',"red");
            p.setAttribute('fill',"#F8A");
            g.appendChild(p);
            g.appendChild(t);
            return g;
        }
    }
    function replaceObj(oldobj, newobj){
        svg.insertBefore(newobj,oldobj);
        svg.removeChild(oldobj);
        return newobj;
    }
    function getShape(obj){
        return (obj.tagName=="g")
            ? Array.prototype.filter.call(
                target.obj.children,
                ((n)=>n.tagName!="text"))[0]
            : obj;
    }
    this.setTarget = function(){
        const shape = getShape(this.obj);
        this.bkColor = shape.getAttribute('fill');
        shape.setAttribute('fill',"lightblue");
    }
    this.unsetTarget = function(){
        const shape = getShape(this.obj);
        shape.setAttribute('fill',this.bkColor);
    }
}
function Edge(n1, n2) {
    this.n1 = n1;
    this.n2 = n2;
    this.obj = insertLineBefore(n1.x,n1.y,n2.x,n2.y);
    if(n1.x==n2.x && n1.y<n2.y) {
        n1.arms.down = this;
        n2.arms.up   = this;
    }
    else if(n1.x==n2.x && n1.y>n2.y) {
        n1.arms.up   = this;
        n2.arms.down = this;
    }
    else if(n1.y==n2.y && n1.x<n2.x) {
        n1.arms.right   = this;
        n2.arms.left    = this;
    }
    else if(n1.y==n2.y && n1.x>n2.x) {
        n1.arms.left    = this;
        n2.arms.right   = this;
    }
    else {
        n1.arms.free.push(this);
        n2.arms.free.push(this);
    }
    this.opposite = function(n){
        if(this.n1==n) return this.n2;
        if(this.n2==n) return this.n1;
        return null;
    };
    this.length = function(){
        return Math.abs(this.n1.x-this.n2.x) + Math.abs(this.n1.y-this.n2.y);
    };
    this.update = function(){
        this.obj.setAttribute("x1",this.n1.x);
        this.obj.setAttribute("y1",this.n1.y);
        this.obj.setAttribute("x2",this.n2.x);
        this.obj.setAttribute("y2",this.n2.y);
    };
}
function insertLineBefore(x1,y1,x2,y2){
    let line = document.createElementNS(NS,'line');
    line.setAttribute('x1',x1);
    line.setAttribute('y1',y1);
    line.setAttribute('x2',x2);
    line.setAttribute('y2',y2);
    line.setAttribute('stroke',"black");
    line.setAttribute('fill',"#FF8");
    svg.insertBefore(line,zeronode);
    return line;
}
const zeronode = (new Node(-1,-1,"knot")).obj;

let nodes = [];
nodes.push( new Node(120,  50, "start") );
nodes.push( new Node(120,  80, "cond") );// ◇
nodes.push( new Node(180,  80, "knot") );// ┐
nodes.push( new Node(180, 140, "knot") );// ┘
nodes.push( new Node(120, 110, "process") );// 中
nodes.push( new Node(120, 140, "knot") );// ├
nodes.push( new Node(120, 180, "knot") );
let edges = [];
edges.push( new Edge(nodes[0],nodes[1]) );
edges.push( new Edge(nodes[1],nodes[2]) );
edges.push( new Edge(nodes[2],nodes[3]) );
edges.push( new Edge(nodes[3],nodes[5]) );
edges.push( new Edge(nodes[1],nodes[4]) );
edges.push( new Edge(nodes[4],nodes[5]) );
edges.push( new Edge(nodes[5],nodes[6]) );

let target = nodes[0];
target.setTarget();

function setNewTarget(node){
    target.unsetTarget();
    target = node;
    target.setTarget();
}
function getNearestLevel(dir){
    if(dir=="left" ) {
        const l = nodes
            .filter((n)=>n.x<target.x)
            .reduce((a,n)=>Math.max(a,n.x),0);
        return nodes.filter((n)=>n.x==l);
    }
    if(dir=="right") {
        const l = nodes
            .filter((n)=>n.x>target.x)
            .reduce((a,n)=>Math.min(a,n.x),600);
        return nodes.filter((n)=>n.x==l);
    }
    if(dir=="up"   ) {
        const l = nodes
            .filter((n)=>n.y<target.y)
            .reduce((a,n)=>Math.max(a,n.y),0);
        return nodes.filter((n)=>n.y==l);
    }
    if(dir=="down" ) {
        const l = nodes
            .filter((n)=>n.y>target.y)
            .reduce((a,n)=>Math.min(a,n.y),600);
        return nodes.filter((n)=>n.y==l);
    }
}
function distance(n1, n2) {
    if(n1.x==n2.x) return Math.abs(n1.y-n2.y);
    if(n1.y==n2.y) return Math.abs(n1.x-n2.x);
    return Math.sqrt( Math.pow(n1.x-n2.x, 2) + Math.pow(n1.y-n2.y, 2) );
}

// 移動キー入力時の動作
//   エッジ上を通って隣のノードに移動する
//   
function key_arror(dir, shiftKey){
    // 1. シフトキーを押してないときは、現状変更はせず通常移動のみ
    if(!shiftKey) {
        // 通常移動
        if(target.arms[dir]) setNewTarget(target.arms[dir].opposite(target));
    }
    // 2. シフトキーを押しているとき、基本的にノードの移動は行わない
    else {
        // 用意
        const news = ["left","up","right","down"];
        const back = news[(news.indexOf(dir)+2)%4];
        const east = news[(news.indexOf(dir)+1)%4];
        const west = news[(news.indexOf(dir)+3)%4];
        const level = getNearestLevel(dir);
        let dist = 1000000;
        if(level[0]){
            switch(dir){
                case "left"   : dist = target.x - level[0].x; break;
                case "up"     : dist = target.y - level[0].y; break;
                case "right"  : dist = level[0].x - target.x; break;
                case "down"   : dist = level[0].y - target.y; break;
            }
        }
        const collisionNode = level.filter((n)=>n.x==target.x||n.y==target.y)[0];
        const collisionEdge = (dir=="left"||dir=="right") ? 
            level.map((n)=>n.arms.down)
                 .filter((e)=>e)
                 .filter((e)=>((e.n1.y-target.y)*(e.n2.y-target.y)<0))[0] :
            level.map((n)=>n.arms.right)
                 .filter((e)=>e)
                 .filter((e)=>((e.n1.x-target.x)*(e.n2.x-target.x)<0))[0];

        if(target.type=="knot" && target.arms[dir] && target.getArmsCount()==1) {
            // 前にのみ枝があるので、つまり縮めようとしている
            const len = Math.min(target.arms[dir].length(), dist, 30);

            if(len < target.arms[dir].length()) {
                //console.log("水準までまたは30だけ縮める");
                const dx = (dir=="left") ? -len : (dir=="right") ? len : 0;
                const dy = (dir=="up"  ) ? -len : (dir=="down" ) ? len : 0;
                target.move(dx,dy);
                setNewTarget(target);
            }
            else {
                //console.log("根本まで縮める＝削除する");
                key_deleteNode();
            }
            return;
        }
        else if(target.type=="knot" && target.arms[back] && target.getArmsCount()==1) {
            // 後ろにのみ枝があるので、伸ばす
            if(collisionNode && dist<=30) {
                //console.log("ノードに合流");
                key_deleteNode();
                edges.push( new Edge(target, collisionNode) );
                setNewTarget(collisionNode);
                return;
            }
            else if(collisionEdge && dist<=30){
                //console.log("エッジに割り込み");
                const len = dist;
                const dx = (dir=="left") ? -len : (dir=="right") ? len : 0;
                const dy = (dir=="up"  ) ? -len : (dir=="down" ) ? len : 0;
                target.move(dx,dy);
                setNewTarget(target);
                const n1 = collisionEdge.n1;
                const n2 = collisionEdge.n2;
                svg.removeChild(collisionEdge.obj);
                edges = edges.filter((e)=>e!=collisionEdge);
                edges.push( new Edge(n1, target) );
                edges.push( new Edge(target, n2) );
                return;
            }
            else {
                //console.log("合流しなかったので伸ばす");
                const len = Math.min(dist, 30);
                const dx = (dir=="left") ? -len : (dir=="right") ? len : 0;
                const dy = (dir=="up"  ) ? -len : (dir=="down" ) ? len : 0;
                target.move(dx,dy);
                setNewTarget(target);
                return;
            }
        }
        else if(!target.arms[dir]) {
            //console.log("生やす");
            const len = Math.min((collisionNode||collisionEdge) ? dist/2 : dist, 30);
            const dx = (dir=="left") ? -len : (dir=="right") ? len : 0;
            const dy = (dir=="up"  ) ? -len : (dir=="down" ) ? len : 0;
            const newnode = new Node(target.x + dx, target.y + dy, "knot");
            nodes.push(newnode);
            edges.push(new Edge(target,newnode));
            setNewTarget(newnode);
        }
    }
}

function key_deleteNode(){
    // ノードそのものを削除
    nodes = nodes.filter((n)=>(n!=target));
    svg.removeChild(target.obj);
    const news = ["left","up","right","down"];
    let newtarget = null;
    for(let i=0;i<4;i++){
        let edge = target.arms[news[i]];
        if(edge){
            // 向こう岸からのリンクを削除
            newtarget = edge.opposite(target);
            newtarget.arms[news[(i+2)%4]] = null;
            // 枝そのものを削除
            svg.removeChild(edge.obj);
            edges.pop(edge);
        }
    }
    // 向こう岸を新しいターゲットにする
    setNewTarget(newtarget);
}

function key_changeShape(type){
    target.type = type;
    target.update();
    target.setTarget();
}

function key_deleteEdge(node, dir){
    const news = ["left","up","right","down"];
    const edge = node.arms[dir];
    if(edge){
        // 向こう岸
        const link = edge.opposite(target);
        const back = news[(news.indexOf(dir)+2)%4];
        node.arms[dir ] = null;
        link.arms[back] = null;
        // 枝そのものを削除
        svg.removeChild(edge.obj);
        edges.pop(edge);
    }
}
function key_setText(){
    console.log(target);
    let ex = document.getElementById('ex');
    console.log(ex);
    ex.disabled = false;
    ex.focus();
    ex.value = target.text;
    ex.onblur = function(e){
        e.target.disabled = true;
    };
    document.onkeydown = function(e){
        target.text = ex.value;
        if(e.key=="Enter" || (e.key=="["&&e.ctrlKey)) {
            e.target.disabled = true;
            document.onkeydown = fnNormalMode;
            ex.value="";
            target.update();
            target.setTarget();
        }
        return true;
    };
}
function key_changeSize(dw, dh) {
    target.width += dw;
    target.height+= dh;
    target.update();
    target.setTarget();
}

const fnNormalMode = (function(){
    let count = 0;
    let stack = "";
    const display = document.getElementById('display');
    return function(e){
        if(e.key.length>1) return -1;
        if("0123456789".includes(e.key)) {
            count = count * 10 + Number(e.key);
            display.textContent = ("["+count+","+stack+"]");
            //console.log("number ["+count+","+stack+"]");
            return -2;
        }
        stack += e.key;
        display.textContent = ("["+count+","+stack+"]");
        for(let i=0;i<Math.max(count, 1); i++){
            console.log(stack);
            switch(stack){
                case "h": case "H": key_arror("left",  e.shiftKey); break;
                case "j": case "J": key_arror("down",  e.shiftKey); break;
                case "k": case "K": key_arror("up",    e.shiftKey); break;
                case "l": case "L": key_arror("right", e.shiftKey); break;
                case "r": return false;
                case "rs": key_changeShape("start"); break;
                case "rp": key_changeShape("process"); break;
                case "rc": key_changeShape("cond");    break;
                case "rk": key_changeShape("knot");    break;
                case "ri": key_changeShape("IO");      break;
                case "d": return false;
                case "dh": key_deleteEdge(target, "left");  break;
                case "dj": key_deleteEdge(target, "down");  break;
                case "dk": key_deleteEdge(target, "up");    break;
                case "dl": key_deleteEdge(target, "right"); break;
                case "x": key_deleteNode(); break;
                case "i":
                    key_setText();
                    // リピートしたくない機能はstackを空にするか、リターンする
                    stack="";
                    return false;
                case "w": case "h": return false;
                case "w+": key_changeSize( 3, 0); break;
                case "w-": key_changeSize(-3, 0); break;
                case "h+": key_changeSize( 0, 3); break;
                case "h-": key_changeSize( 0,-3); break;
                default: break;
            }
        }
        count = 0;
        stack = "";
        display.textContent = ("["+count+","+stack+"]");
    };
})();

document.onkeydown = fnNormalMode;


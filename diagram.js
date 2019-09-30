
const NS = "http://www.w3.org/2000/svg";
let svg = document.getElementById('svg');
function Node(x, y, type){
    this.x = x;
    this.y = y;
    this.type = type;
    this.obj = createObj(null, type, x, y);
    this.color = this.obj.getAttribute("fill");
    this.arms = {
        up     :null,
        down   :null,
        left   :null,
        right  :null,
        free:[],
    };

    this.toString = function(){return this.x+","+this.y+" "+this.type;};
    this.getArmsCount = function(){
        return (this.arms.up   ?1:0)
             + (this.arms.down ?1:0)
             + (this.arms.left ?1:0)
             + (this.arms.right?1:0)
             + (this.arms.free.length);
    };

    this.move = function(dx, dy){
        this.x += dx;
        this.y += dy;
        this.update();
    };
    this.update = function(){
        this.obj = createObj(this.obj, this.type, this.x, this.y);
        this.color = this.obj.getAttribute("fill");
        if(this.arms.left ) this.arms.left.update();
        if(this.arms.right) this.arms.right.update();
        if(this.arms.up   ) this.arms.up.update();
        if(this.arms.down ) this.arms.down.update();
        this.arms.free.forEach((e)=>e.update());
    };
    function createObj(obj, type, x, y){
        return (type=="start")   ? setCircle(obj, x,y,5,"#0F8")  :
               (type=="knot")    ? setCircle(obj, x,y,3,"#000")  :
               (type=="cond")    ? setCond(obj, x,y,16,20,"#FF8"):
               (type=="process") ? setRect(obj, x,y,20,38,"#FA8"):
               (type=="IO"     ) ? setIO(obj, x,y,20,12,"#FA8"):
               null;
    }
    function setCircle(obj, cx,cy,r, color){
        if(!obj) obj = document.createElementNS(NS,"circle");
        else if(obj.nodeName!="circle") obj = replaceObj(obj,document.createElementNS(NS,"circle"));
        obj.setAttribute('cx',cx);
        obj.setAttribute('cy',cy);
        obj.setAttribute('r',r);
        obj.setAttribute('fill',color);
        svg.appendChild(obj);
        return obj;
    }
    function setRect(obj, cx,cy,a,b,color){
        if(!obj) obj = document.createElementNS(NS,"rect");
        else if(obj.nodeName!="rect") obj = replaceObj(obj,document.createElementNS(NS,"rect"));
        obj.setAttribute('x',cx-b/2);
        obj.setAttribute('y',cy-a/2);
        obj.setAttribute('width',b);
        obj.setAttribute('height',a);
        obj.setAttribute('stroke',"red");
        obj.setAttribute('fill',color);
        svg.appendChild(obj);
        return obj;
    }
    function setCond(obj, cx,cy,a,b,color){
        if(!obj) obj = document.createElementNS(NS,"polygon");
        else if(obj.nodeName!="polygon") obj = replaceObj(obj,document.createElementNS(NS,"polygon"));
        const _top    =  cx     +","+(cy-a/2);
        const _bottom =  cx     +","+(cy+a/2);
        const _left   = (cx-b/2)+","+ cy     ;
        const _right  = (cx+b/2)+","+ cy     ;
        obj.setAttribute('points',[_top,_left,_bottom,_right].join(" "));
        obj.setAttribute('stroke',"red");
        obj.setAttribute('fill',color);
        svg.appendChild(obj);
        return obj;
    }
    function setIO(obj, cx,cy,w,h,color){
        if(!obj) obj = document.createElementNS(NS,"polygon");
        else if(obj.nodeName!="polygon") obj = replaceObj(obj,document.createElementNS(NS,"polygon"));
        const _nw = (cx-w/2    )+","+(cy-h/2);
        const _nc = (cx-w/2+h/2)+","+ cy     ;
        const _sw = (cx-w/2    )+","+(cy+h/2);
        const _se = (cx+w/2    )+","+(cy+h/2);
        const _sc = (cx+w/2+h/2)+","+ cy     ;
        const _ne = (cx+w/2    )+","+(cy-h/2);
        obj.setAttribute('points',[_nw,_nc,_sw,_se,_sc,_ne].join(" "));
        obj.setAttribute('stroke',"red");
        obj.setAttribute('fill',color);
        svg.appendChild(obj);
        return obj;
    }
    function replaceObj(oldobj, newobj){
        console.log(oldobj);
        console.log(newobj);
        svg.insertBefore(newobj,oldobj);
        svg.removeChild(oldobj);
        return newobj;
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
nodes.push( new Node(120, 120, "start") );
nodes.push( new Node(120, 150, "cond") );// ◇
nodes.push( new Node(180, 150, "knot") );// ┐
nodes.push( new Node(180, 210, "knot") );// ┘
nodes.push( new Node(120, 180, "process") );// 中
nodes.push( new Node(120, 210, "knot") );// ├
nodes.push( new Node(120, 250, "knot") );
let edges = [];
edges.push( new Edge(nodes[0],nodes[1]) );
edges.push( new Edge(nodes[1],nodes[2]) );
edges.push( new Edge(nodes[2],nodes[3]) );
edges.push( new Edge(nodes[3],nodes[5]) );
edges.push( new Edge(nodes[1],nodes[4]) );
edges.push( new Edge(nodes[4],nodes[5]) );
edges.push( new Edge(nodes[5],nodes[6]) );

let target = nodes[0];

function setNewTarget(node){
    target.obj.setAttribute("fill",target.color);
    target = node;
    target.obj.setAttribute("fill","blue");
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
                 .filter((e)=>((e.n1.x-target.x)*(e.n2.x-target.x)<0))[0] :
            level.map((n)=>n.arms.right)
                 .filter((e)=>e)
                 .filter((e)=>((e.n1.y-target.y)*(e.n2.y-target.y)<0))[0];

        if(target.type=="knot" && target.arms[dir] && target.getArmsCount()==1) {
            // 前にのみ枝があるので、つまり縮めようとしている
            const len = Math.min(target.arms[dir].length(), dist, 30);

            if(len < target.arms[dir].length()) {
                console.log("水準までまたは30だけ縮める");
                const dx = (dir=="left") ? -len : (dir=="right") ? len : 0;
                const dy = (dir=="up"  ) ? -len : (dir=="down" ) ? len : 0;
                target.move(dx,dy);
                setNewTarget(target);
            }
            else {
                console.log("根本まで縮める＝削除する");
                key_deleteNode();
            }
            return;
        }
        else if(target.type=="knot" && target.arms[back] && target.getArmsCount()==1) {
            // 後ろにのみ枝があるので、伸ばす
            if(collisionNode) {
                console.log("ノードに合流");
                key_deleteNode();
                edges.push( new Edge(target, collisionNode) );
                setNewTarget(collisionNode);
                return;
            }
            else if(collisionEdge){
                console.log("XXX エッジに割り込み");
                return;
            }
            else {
                console.log("合流しなかったので伸ばす");
                const len = Math.min(dist, 30);
                const dx = (dir=="left") ? -len : (dir=="right") ? len : 0;
                const dy = (dir=="up"  ) ? -len : (dir=="down" ) ? len : 0;
                target.move(dx,dy);
                setNewTarget(target);
                return;
            }
        }
        else if(!target.arms[dir]) {
            console.log("生やす");
            const len = (collisionNode||collisionEdge) ? dist/2 : Math.min(dist, 30);
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
    setNewTarget(target);
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

document.onkeydown = (function(){
    let stack = "";
    return function(e){
        stack += e.key;
        console.log(stack);
        switch(stack){
            case "h": case "H": key_arror("left",  e.shiftKey); stack="";break;
            case "j": case "J": key_arror("down",  e.shiftKey); stack="";break;
            case "k": case "K": key_arror("up",    e.shiftKey); stack="";break;
            case "l": case "L": key_arror("right", e.shiftKey); stack="";break;
            case "s": break;
            case "sp": key_changeShape("process"); stack=""; break;
            case "sc": key_changeShape("cond");    stack=""; break;
            case "sk": key_changeShape("knot");    stack=""; break;
            case "si": key_changeShape("IO");    stack=""; break;
            case "d": break;
            case "dh": key_deleteEdge(target, "left");  stack=""; break;
            case "dj": key_deleteEdge(target, "down");  stack=""; break;
            case "dk": key_deleteEdge(target, "up");    stack=""; break;
            case "dl": key_deleteEdge(target, "right"); stack=""; break;
            case "x": key_deleteNode(); stack=""; break;
            default: stack=""; break;
        }
    };
})();


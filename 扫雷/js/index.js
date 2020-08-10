//声明扫雷的构造函数
function Mine(tr, td, mineNum) {
    this.tr = tr; //行数
    this.td = td; //列数
    this.mineNum = mineNum; //雷数

    this.squares = []; //存储所有方块的信息，它是一个二维数组，按行和列的顺序排放，存取都使用行列的形式
    this.tds = []; //存储所有的单元格DOM
    this.surplusMine = mineNum; //剩余雷的数量
    this.allRight = false; //右击标的小红旗是否全是雷，用来判断用户是否游戏成功

    this.parent = document.querySelector('.gameBox');
}
//生成n个不重复的数字
Mine.prototype.randomNum = function () {
    var square = new Array(this.tr * this.td); //生成一个空数组，但是有长度，长度为格子的总数
    for (let i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(function () {
        return 0.5 - Math.random(); //自定义排序(随机乱序)
    });
    return square.slice(0, this.mineNum);
}
//初始化
Mine.prototype.init = function () {
    var rn = this.randomNum(); //雷在格子里的位置
    var n = 0; //用来找到格子对应的索引
    for (let i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (let j = 0; j < this.td; j++) {
            //取一个方块在数组里的数据要使用行与列去取，找方块周围的方块的时候要用坐标的形式去取，行与列的形式跟坐标的形式x,y正好相反
            if (rn.indexOf(++n) != -1) {
                //如果这个条件成立，说明现在循环到的这个索引在雷的数组里找到了，那就表示这个索引对应的是个雷
                this.squares[i][j] = {
                    type: 'mine',
                    x: j,
                    y: i
                };
            } else {
                this.squares[i][j] = {
                    type: 'number',
                    x: j,
                    y: i,
                    value: 0
                };
            }
        }
    }
    this.updateNum();
    this.createDom();
    this.parent.oncontextmenu = function () {
        return false;
    }
    //剩余雷数
    this.mineNumDom = document.querySelector('.mineNum');
    this.surplusMine = this.mineNum;
    this.mineNumDom.innerHTML = this.surplusMine;
};
//创建表格
Mine.prototype.createDom = function () {
    var This = this;
    var table = document.createElement('table');
    for (let i = 0; i < this.tr; i++) { //循环行
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        for (let j = 0; j < this.td; j++) { //循环列
            var domTd = document.createElement('td');
            domTd.pos = [i, j]; //把格子对应的行与列存到格子身上，为了下面通过这个值去取到数组对应的数据
            domTd.onmousedown = function () {
                This.play(event, this); //This指的是实例对象，this指的是点击的td
            };
            this.tds[i][j] = domTd; //把所有的创建的td都添加到数组当中

            // if (this.squares[i][j].type == 'mine') {
            //     domTd.className = 'mine';
            // }
            // if (this.squares[i][j].type == 'number') {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';  //避免创建多个
    this.parent.appendChild(table);
}
//找某个方格的周围八个方格
Mine.prototype.getAround = function (square) {
    var x = square.x;
    var y = square.y;
    var result = []; //把找到的格子的坐标返回出去（二维数组）

    //通过坐标去循环九宫格
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (i < 0 || j < 0 || i > this.td - 1 || j > this.tr - 1 || (i == x && j == y) || this.squares[j][i].type == 'mine') {
                continue;
            }
            result.push([j, i]); //要以行与列的形式返回出去，因为到时候要用它去取数组里的数据
        }

    }
    return result;
}
//更新所有的数字
Mine.prototype.updateNum = function () {
    for (let i = 0; i < this.tr; i++) {
        for (let j = 0; j < this.td; j++) {
            //只更新的是雷周围的数字
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var num = this.getAround(this.squares[i][j]); //获取到每一个雷周围的数字
            for (let k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
}
//游戏逻辑
Mine.prototype.play = function (ev, obj) {
    var This = this;
    //点击的是左键
    if (ev.which == 1 && obj.className != 'flag') {
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        if (curSquare.type == 'number') {
            //用户点击的是数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];
            //如果点到了0
            if (curSquare.value == 0) {
                obj.innerHTML = '';
                //递归
                function getAllZero(square) {
                    var around = This.getAround(square); //找到了周围的n个格子
                    for (let i = 0; i < around.length; i++) {
                        var x = around[i][0]; //行
                        var y = around[i][1]; //列
                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        if (This.squares[x][y].value == 0) {
                            //如果以某个格子为中心找到的各自值为0，那就需要接着调用函数（递归）
                            if (!This.tds[x][y].check) {
                                //给对应的td添加一个属性，决定这个格子有没有被找过，如果找过的话，值为true，下次不再找
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                        } else {
                            //如果以某个格子为中心找到的四周格子的值不为0，那就把该格子数字显示出来
                            This.tds[x][y].innerHTML = This.squares[x][y].value;

                        }
                    }
                }
                getAllZero(curSquare);
            }
        } else {
            //用户点击的是雷
            this.gameOver(obj);
        }
    }
    //点击的是右键
    if(ev.which == 3){
        //如果右击的是一个数字，那就不能点击（数字有class）
        if(obj.className && obj.className != 'flag'){
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';  //切换class
        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine'){
            this.allRight = true;  //用户标的小红旗都是雷
        }else{
            this.allRight = false;
        }
        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML = --this.surplusMine;
        }else{
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        if(this.surplusMine == 0){
            //剩余的雷的数量为0表示用户已经标完小红旗，此时需判断游戏是成功还是失败
            if(this.allRight){
                //说明用户全部标对
                this.gameOver();
                alert('恭喜你，游戏成功！');
            }else{
                this.gameOver();
                alert('游戏失败！');
            }
        }
        
    }
};
//游戏结束函数
Mine.prototype.gameOver = function(clickTd){
    //1.显示所有雷 2.取消所有格子的点击事件 3.给点中的格子标红
    for(let i = 0; i < this.tr; i++){
        for(let j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'mine'){
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    } 
    if(clickTd){
        clickTd.style.backgroundColor = '#f00';
    }
}

//button功能
var btns = document.querySelectorAll('.level button');
var mine = null;
var ln = 0;
var arr = [[9,9,10], [16,16,40], [28,28,99]];
for(let i = 0; i < btns.length - 1; i++){
    btns[i].onclick = function(){
        btns[ln].className = '';
        this.className = 'active';
        mine = new Mine(...arr[i]);
        mine.init();
        ln = i;  //es6用法 或者闭包
    }
}
btns[0].onclick();  //初始化
btns[3].onclick = function(){
    mine.init();
}

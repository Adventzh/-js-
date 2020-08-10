var sw = 20, //一个方块的宽度
    sh = 20, //一个方块的高度
    tr = 23, //行数
    td = 23; //列数
var snake = null, //蛇的实例
    food = null, //食物的实例
    game = null; //游戏的实例

//方块构造函数
function Square(x, y, classname) {
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    this.viewContent = document.createElement('div'); //方块对应的DOM元素
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWarp') //方块的父级
}
//创建方块DOM，并添加到页面里
Square.prototype.create = function () {
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent);
}
//删除页面上的方块(DOM元素依然存在)
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
}

//蛇
function Snake() {
    this.head = null; //存一下蛇头的信息
    this.tail = null; //存一下蛇尾的信息
    this.pos = []; //存储蛇身上的每一个方块的位置

    this.directionNum = { //存储蛇走的方向，用一个对象来表示
        left: {
            x: -1,
            y: 0,
            rotate: 180
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }
}
//初始化
Snake.prototype.init = function () {
    //创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead; //存储蛇头信息
    this.pos.push([2, 0]); //把蛇头位置存起来

    //创建蛇身体1
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]);

    //创建蛇身体2
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0, 0]);

    //形成链表关系
    snakeHead.pre = null;
    snakeHead.next = snakeBody1;

    snakeBody1.pre = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.pre = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加一条属性，用来表示蛇走的方向
    this.direction = this.directionNum.right; //默认让蛇往右走
};
//获取蛇头的下一个位置对应的元素，根据元素做不同的事情
Snake.prototype.getNextPos = function () {
    var nextPos = [ //蛇头要走的下一个点的坐标
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]
    //console.log(nextPos, food.pos);

    //下个点是自己，代表撞到了自己，游戏结束
    var selfCollied = false; //是否撞到了自己
    this.pos.forEach(function (value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            //如果数组中的两个数据都相等，就说明下一个点在蛇身上里面能找到，代表撞到了自己
            selfCollied = true;
        }
    });
    if (selfCollied) {
        this.strategles.die.call(this);
        return;
    }

    //下个点是围墙，游戏结束
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        this.strategles.die.call(this);
        return;
    }

    //下个点是是食物，吃
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        //如果条件成立说明现在蛇头要走的下个点是食物的那个点
        //console.log('吃到食物了');
        this.strategles.eat.call(this);
        return;
    }

    //下个点什么都不是，走
    this.strategles.move.call(this); //改变this对象的指向，若不使用call，则move中的this为this.strategles，无法使用Snake的属性
};
//处理碰撞后发生的事情
Snake.prototype.strategles = {
    move: function (format) {
        //创建新身体（在旧蛇头的位置）
        var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
        //更新链表的关系
        newBody.next = this.head.next;
        newBody.next.pre = newBody;
        newBody.pre = null;
        //console.log(newBody, this.head);
        this.head.remove();
        newBody.create();
        //console.log(newBody, this.head); //只是从页面上移除了，this.head元素依然存在

        //创建新蛇头（蛇头下一个要走到的点nextPos）
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
        //更新链表关系
        newHead.next = newBody;
        newHead.pre = null;
        newBody.pre = newHead;
        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
        newHead.create();
        //更新蛇身上的每一个方块坐标
        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
        this.head = newHead;

        if (!format) {
            this.tail.remove();
            //console.log(this.tail);  只是从页面上移除了，this.tail元素依然存在
            this.tail = this.tail.pre;
            this.pos.pop();
        }
    },
    eat: function () {
        this.strategles.move.call(this, true);
        createFood();
        game.score++;
    },
    die: function () {
        //console.log('die');
        game.over();
    }
}
snake = new Snake();

//食物
function createFood() {
    //食物小方块的随机坐标
    var x = null,
        y = null;

    var include = true; //循环跳出的条件，true表示食物的坐标在蛇身上（需要继续循环），false表示食物的坐标不在蛇身上（不循环了）
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));
        snake.pos.forEach(function (value) {
            if (x != value[0] && y != value[1]) {
                //条件成立说明现在随机出来的这个坐标在蛇身上没有找到
                include = false;
            }
        });
    }

    //生成食物
    food = new Square(x, y, 'food');
    food.pos = [x, y]; //存储一下生成食物的坐标，看看有没有和蛇头碰上
    var foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    } else {
        food.create();
    }
}

//创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;
}
//游戏初始化
Game.prototype.init = function () {
    snake.init();
    //snake.getNextPos();
    createFood();

    document.onkeydown = function (ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (ev.which == 38 && snake.direction != snake.direction.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();
}
//开始游戏
Game.prototype.start = function () {
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, 200);
}
//暂停游戏
Game.prototype.pause = function(){
    clearInterval(this.timer);
}
//结束游戏
Game.prototype.over = function(){
    clearInterval(this.timer);
    alert("你的得分为：" + this.score);
    //游戏回到初始状态
    var snakeWarp = document.getElementById('snakeWarp');
    snakeWarp.innerHTML = '';
    snake = new Snake();
    game = new Game();
    var startBtnWarp = document.querySelector('.startBtn');
    startBtnWarp.style.display = 'block';
}


//开启
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none';
    game.init();
};

//暂停
var snakeWarp = document.getElementById('snakeWarp');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWarp.onclick = function(){
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function(){
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}
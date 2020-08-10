var chess = document.getElementById('chess');
var context = chess.getContext('2d');
var title = document.getElementsByClassName('title')[0];
context.strokeStyle = '#b9b9b9';

window.onload = function () {
    drawChessBoard();
};

//绘制棋盘
function drawChessBoard() {
    for (var i = 0; i < 15; i++) {
        //行
        context.beginPath();
        context.moveTo(15, 15 + i * 30);
        context.lineTo(435, 15 + i * 30);
        context.stroke();
        //列
        context.beginPath();
        context.moveTo(15 + i * 30, 15);
        context.lineTo(15 + i * 30, 435);
        context.stroke();
    }
}

//赢法数组
var wins = [];
for (var i = 0; i < 15; i++) {
    wins[i] = [];
    for (var j = 0; j < 15; j++) {
        wins[i][j] = [];
    }
}
var count = 0;
//横线赢法
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[j + k][i][count] = true;
        }
        count++;
    }
}
//竖线赢法
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i][j + k][count] = true;
        }
        count++;
    }
}
//正斜线赢法
for (var i = 0; i < 11; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j + k][count] = true;
        }
        count++;
    }
}
//反斜线赢法
for (var i = 0; i < 11; i++) {
    for (var j = 14; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j - k][count] = true;
        }
        count++;
    }
}

//定义二维数组标记棋盘上的每个坐标是否已经下了棋子
var chessboard = [];
for (var i = 0; i < 15; i++) {
    chessboard[i] = [];
    for (var j = 0; j < 15; j++) {
        chessboard[i][j] = 0; //初始化
    }
}

//下棋
var me = true;
var over = false;
var myWin = new Array(count).fill(0);
var computerWin = new Array(count).fill(0);
chess.onclick = function (e) {
    //如果游戏结束不可以下棋
    if (over) {
        return;
    }
    //判断人是否可以下棋
    if (!me) {
        return;
    }

    //获取x轴坐标
    var x = e.offsetX;
    //获取y轴坐标
    var y = e.offsetY;
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);
    if (chessboard[i][j] == 0) {
        //下子
        oneStep(i, j, me);
        //标记已落子
        chessboard[i][j] = 1;
        for (var k = 0; k < count; k++) {
            if (wins[i][j][k]) {
                myWin[k]++;
                if (myWin[k] == 5) {
                    title.innerHTML = '恭喜你获胜了！';
                    over = true;
                }
            }
        }
    }

    if (!over) {
        me = !me;
        //计算机落子
        computerAI();
    }
}

//计算机落子
function computerAI() {
    var myScore = [];
    var computerScore = [];

    for (var i = 0; i < 15; i++) {
        myScore[i] = [];
        computerScore[i] = [];
        for (var j = 0; j < 15; j++) {
            myScore[i][j] = 0;
            computerScore[i][j] = 0;
        }
    }

    //空白子最大分值
    var max = 0;
    //最大分值空白子坐标
    var x = 0,
        y = 0;

    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            //判断是否是空白子
            if (chessboard[i][j] == 0) {
                for (var k = 0; k < count; k++) {
                    if (wins[i][j][k]) {
                        if (myWin[k] == 1) {
                            myScore[i][j] += 100;
                        } else if (myWin[k] == 2) {
                            myScore[i][j] += 200;
                        } else if (myWin[k] == 3) {
                            myScore[i][j] += 800;
                        } else if (myWin[k] == 4) {
                            myScore[i][j] += 1000;
                        }

                        if (computerWin[k] == 1) {
                            computerScore[i][j] += 110;
                        } else if (computerWin[k] == 2) {
                            computerScore[i][j] += 210;
                        } else if (computerWin[k] == 3) {
                            computerScore[i][j] += 810;
                        } else if (computerWin[k] == 4) {
                            computerScore[i][j] += 2000;
                        }
                    }
                }

                if (myScore[i][j] > max) {
                    max = myScore[i][j];
                    x = i;
                    y = j;
                } else if (myScore[i][j] == max) {
                    if (computerScore[i][j] > max) {
                        max = computerScore[i][j];
                        x = i;
                        y = j;
                    }
                }

                if (computerScore[i][j] > max) {
                    max = computerScore[i][j];
                    x = i;
                    y = j;
                } else if (computerScore[i][j] == max) {
                    if (myScore[i][j] > max) {
                        max = myScore[i][j];
                        x = i;
                        y = j;
                    }
                }
            }
        }
    }

    oneStep(x, y, me);
    chessboard[x][y] = 1;
    for (var k = 0; k < count; k++) {
        if (wins[x][y][k]) {
            computerWin[k]++;
            if (computerWin[k] == 5) {
                title.innerHTML = '很遗憾，计算机获胜！'
                over = true;
            }
        }
    }

    if (!over) {
        me = !me;
    }
}

//落子
function oneStep(i, j, me) {
    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
    context.closePath();
    var color;
    if (me) {
        color = '#000000';
    } else {
        color = '#ffffff'
    }
    context.fillStyle = color;
    context.fill();

}

//刷新页面
function res() {
    window.location.reload();
}
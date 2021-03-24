'use strict'
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

var BOMB = '<img class="bomb" src="img/bomb.gif" />';
var FLAG = '<img class="flag" src="img/flag.gif" />';
var HEART = '<img class="heart" src="img/heart.gif" />';

var gBestTime;
var gInter;
var gBoardsArr = [];
var gHearts;

var gNums = [];
var gCountFirstClick = 0;

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gBoard = [];


function initGame() {
    document.querySelector('.restart').innerHTML = '&#128512';
    gGame.secsPassed = 0;
    gBestTime = -Infinity;
    countTime();
    gGame.markedCount = 0;
    gGame.shownCount = 0;
    gHearts = (gLevel.MINES === 2) ? 2 : 3;
    createHearts();
    gCountFirstClick = 0;
    gBoardsArr = [];
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false

            }
        }
    }

    return board;
}

function setMinesNegsCount(board) {

}

function renderBoard(board) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '" onclick="cellClicked(this, ' + i + ', ' + j + ')"oncontextmenu="javascript:flagIt(' + i + ', ' + j + ');return false;"> ' + '' + ' </td>'

        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;


}


function cellClicked(elCell, i, j) {

    if (!gCountFirstClick) {

        for (var d = 0; d < gLevel.MINES; d++) {
            var mine = addMine(i, j)
            gBoard[mine.i][mine.j].isMine = true;
        }
        addNumsToBoard();
        gCountFirstClick++;
        gBoardsArr.push({ board: gBoard.slice(), lives: gHearts });
    }


    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
        // gBoardsArr.push({ board: gBoard.slice(), lives: gHearts });
        expandShown(gBoard, elCell, i, j)
        if (gBoard[i][j].isMine) {

            updateHeart(-1);
        }
        gBoard[i][j].isShown = true;
        console.log(gBoard[i][j].minesAroundCount)
    }

    checkIfWin();
    console.log(gBoardsArr)
}

function cellMarked(elCell) {

}

function expandShown(board, elCell, i, j) {
    // debugger
    if (!gBoard[i][j].isMarked) {
        if (gBoard[i][j].isMine) {
            elCell.innerHTML = BOMB
            return;
        } else {
            if (gBoard[i][j].minesAroundCount > 0) {
                board[i][j].isShown = true;
                renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
                gGame.shownCount++;
                return;
            } else {
                board[i][j].isShown = true;
                renderCell({ i: i, j: j }, '')
                gGame.shownCount++;
                // debugger
                for (var d = i - 1; d <= i + 1; d++) {
                    if (d < 0 || d >= gLevel.SIZE) continue;
                    for (var c = j - 1; c <= j + 1; c++) {
                        if (d === i && c === j) continue;
                        if (c < 0 || c >= gLevel.SIZE) continue;
                        if (board[i][j].isMine) continue;
                        if (!board[d][c].isShown) {
                            board[d][c].isShown = true;
                            if (board[d][c].minesAroundCount === 0 && !board[d][c].isShown) gGame.shownCount++;
                            console.log(d, c)
                            var value = (board[d][c].minesAroundCount > 0) ? board[d][c].minesAroundCount : '';
                            renderCell({ i: d, j: c }, value)
                            expandShown(board, document.querySelector('.cell' + d + '-' + c), d, c)

                        }
                        // console.log(document.querySelector('.cell' + i + '-' + j))
                        // if (i === 0 && j === 0) continue;

                    }
                }

            }
        }
    }
    // debugger
    console.log(gGame.shownCount)
}

function addMine(i, j) {
    resetNums();
    var IdxJ = drawNum()
    resetNums();
    var IdxI = drawNum()
    while ((i === IdxI && j === IdxJ) || (gBoard[i] === IdxI && gBoard[j] === IdxJ)) {
        resetNums();
        IdxJ = drawNum();
        resetNums();
        IdxI = drawNum();
    }
    console.log({ i: IdxI, j: IdxJ })
    return { i: IdxI, j: IdxJ }

}

function resetNums() {
    gNums = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        gNums.push(i);
    }

}

function drawNum() {
    var randIdx = getRandomIntInclusive(0, gNums.length - 1);
    var randNum = gNums[randIdx]
    gNums.splice(randIdx, 1)
    return randNum
}

function countBombsAround(cellI, cellJ, mat) {
    // debugger
    var bombsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (mat[i][j].isMine) bombsCount++;
        }
    }
    return bombsCount;
}

function addNumsToBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isMine) {
                gBoard[i][j].minesAroundCount = countBombsAround(i, j, gBoard);

            }
        }

    }
}

function renderCell(location, value) {
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    if (gBoard[location.i][location.j].isShown) elCell.classList.add('shown');
    elCell.innerHTML = value;
}

function flagIt(i, j) {
    console.log(i)

    if (!gBoard[i][j].isMarked) {
        renderCell({ i: i, j: j }, FLAG)
        gBoard[i][j].isMarked = true
        if (gBoard[i][j].isMine) gGame.markedCount++;
    } else {
        var lastFill = (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount > 0) ? gBoard[i][j].minesAroundCount : '';

        gBoard[i][j].isMarked = false
        if (gBoard[i][j].isMine) {
            gGame.markedCount--;
            lastFill = BOMB
        }
        renderCell({ i: i, j: j }, lastFill)
    }
    checkIfWin();
}

function changeSize(num) {
    switch (num) {
        case 4:
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break;
        case 8:
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 12:
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
    }
    initGame();
}

function createHearts() {
    var strHTML = '<table border="0"><tbody>';
    strHTML += '<tr>';
    for (var i = 0; i < gHearts; i++) {

        var className = 'cell cell' + i;
        strHTML += '<td class="' + className + '" >' + HEART + '</td>'



    }
    strHTML += '</tr>'
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.hearts');
    elContainer.innerHTML = strHTML;
}

function updateHeart(num) {
    gHearts += num;
    createHearts();
    if (gHearts === 0) {
        document.querySelector('.restart').innerHTML = '&#129327';
        showAllBombs();
        clearInterval(gInter)
    } else {
        document.querySelector('.restart').innerHTML = '&#128512';
    }
}

function back() {
    console.log(gBoardsArr)
    var lastGame = gBoardsArr.slice(gBoardsArr.length - 1, 1);
    gBoard = lastGame.board;
    gHearts = lastGame.lives;
    createHearts();
    renderBoard();
}

function checkIfWin() {
    console.log('test')
    console.log(gGame.markedCount, gGame.shownCount)
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
        console.log('true')
        document.querySelector('.restart').innerHTML = '&#128526';
        if (gGame.secsPassed > gBestTime) {
            gBestTime = gGame.secsPassed;
            var minutesLabel = document.querySelector(".bestMinutes");
            var secondsLabel = document.querySelector(".bestSeconds");
            secondsLabel.innerText = pad(gBestTime % 60);
            minutesLabel.innerText = pad(parseInt(gBestTime / 60));
            clearInterval(gInter)
        }
    }
}

function countTime() {
    clearInterval(gInter)
    var minutesLabel = document.querySelector(".minutes");
    var secondsLabel = document.querySelector(".seconds");
    gGame.secsPassed = 0;
    gInter = setInterval(setTime, 1000);


    function setTime() {
        ++gGame.secsPassed;
        secondsLabel.innerText = pad(gGame.secsPassed % 60);
        minutesLabel.innerText = pad(parseInt(gGame.secsPassed / 60));
    }



}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

function showAllBombs() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; i < gLevel.SIZE; j++) {
            debugger
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                renderCell({ i: i, j: j }, BOMB)
            }

        }
    }
}
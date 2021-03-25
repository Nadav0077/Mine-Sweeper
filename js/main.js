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
var ONLIGHT = '<img class="heart" src="img/turnedOn.png" />';
var OFFLIGHT = '<img class="heart" src="img/turnedOff.png" />';

var gLights;
var gBestTime;
var gInter;
var gGamesArr = [];
var gHearts;
var gIsHint = false;
var gSafeTimes;
var gIsSelfMine = false;
var gIsFirstClick = false;

var gNums = [];
var gCountFirstClick = 0;

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gSelfMine;

var gBoard = [];


function initGame() {
    gIsFirstClick = false;
    gIsSelfMine = false;
    gIsHint = false;
    gGame.isOn = true;
    document.querySelector('.restart').innerHTML = '&#128512';
    gGame.secsPassed = 0;
    gBestTime = -Infinity;
    countTime();
    gGame.markedCount = 0;
    gGame.shownCount = 0;
    gHearts = (gLevel.MINES === 2) ? 2 : 3;
    gLights = (gLevel.MINES === 2) ? 2 : 3;
    gSafeTimes = (gLevel.MINES === 2) ? 2 : 3;
    document.querySelector('.shield-number').innerText = gSafeTimes
    gSelfMine = {
        amount: gLevel.MINES,
        countAdded: 0
    }
    document.querySelector('.self-mine-number').innerText = gSelfMine.amount - gSelfMine.countAdded;
    createHearts();
    gCountFirstClick = 0;
    gGamesArr = [];
    gBoard = buildBoard();
    createLights()
    renderBoard(gBoard);
    // localStorage.setItem('bestEasyScore', Infinity)
    // localStorage.setItem('bestMediumScore', Infinity)
    // localStorage.setItem('bestHardScore', Infinity)
    // console.log(localStorage.getItem('bestEasyScore'))
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
            var value = ''
            if (gBoard[i][j].isShown) {
                var value = (gBoard[i][j].minesAroundCount === 0) ? '' : gBoard[i][j].minesAroundCount;
                if (gBoard[i][j].isMine) value = BOMB
            }
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '" onclick="cellClicked(this, ' + i + ', ' + j + ')"oncontextmenu="javascript:flagIt(' + i + ', ' + j + ');return false;"> ' + value + ' </td>'

        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;


}


function cellClicked(elCell, i, j) {
    debugger
    if (gGame.isOn) {
        if (!gIsFirstClick) {

            if (!gIsSelfMine) {
                for (var d = 0; d < gLevel.MINES; d++) {
                    var mine = addMine(i, j)
                        // console.log(d)
                    gBoard[mine.i][mine.j].isMine = true;
                }
                gIsFirstClick = true;
            } else {
                if (gSelfMine.amount === gSelfMine.countAdded) {
                    gIsSelfMine = false;
                    gIsFirstClick = true;
                } else {
                    if (!gBoard[i][j].isMine) {
                        gBoard[i][j].isMine = true;
                        gSelfMine.countAdded++;
                        document.querySelector('.self-mine-number').innerText = gSelfMine.amount - gSelfMine.countAdded;
                    }
                    return;
                }
            }
            addNumsToBoard();
            gCountFirstClick++;
            // var tmpBoard = gBoard.slice()
            gGamesArr.push({ board: copyMat(), lives: gHearts, game: clone(gGame) });
        }
        if (gIsHint) {
            for (var c = i - 1; c <= i + 1; c++) {
                if (c < 0 || c >= gLevel.SIZE) continue;
                for (var d = j - 1; d <= j + 1; d++) {
                    if (d < 0 || d >= gLevel.SIZE) continue;
                    var value = (gBoard[c][d].minesAroundCount === 0) ? '' : gBoard[c][d].minesAroundCount;
                    if (gBoard[c][d].isMine) value = BOMB
                    console.log()
                    document.querySelector('.cell' + c + '-' + d).classList.add('shown')
                    renderCell({ i: c, j: d }, value)
                }
            }
            setTimeout(() => {
                for (var c = i - 1; c <= i + 1; c++) {
                    if (c < 0 || c >= gLevel.SIZE) continue;
                    for (var d = j - 1; d <= j + 1; d++) {
                        if (d < 0 || d >= gLevel.SIZE) continue;
                        if (gBoard[c][d].isShown) continue;
                        document.querySelector('.cell' + c + '-' + d).classList.remove('shown')
                        renderCell({ i: c, j: d }, '')
                    }
                }
                gIsHint = false;
            }, 1000)
        }

        if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked && !gIsHint) {
            expandShown(gBoard, elCell, i, j)
            if (gBoard[i][j].isMine) {
                updateHeart(-1);
            }
            gBoard[i][j].isShown = true;
        }
        checkIfWin();
        gGamesArr.push({ board: copyMat(), lives: gHearts, game: clone(gGame) });

    }
}

function cellMarked(elCell) {

}

function expandShown(board, elCell, i, j) {
    // debugger
    if (!gBoard[i][j].isMarked) {
        if (gBoard[i][j].isMine) {
            elCell.innerHTML = BOMB
            gBoard[i][j].isShown = true;
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
                            // console.log(d, c)
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
    // console.log(gGame.shownCount)
}

function addMine(i, j) {
    resetNums();
    var IdxJ = drawNum()
    resetNums();
    var IdxI = drawNum()
    while ((i === IdxI && j === IdxJ) || gBoard[IdxI][IdxJ].isMine) {
        resetNums();
        IdxJ = drawNum();
        resetNums();
        IdxI = drawNum();
    }
    // console.log({ i: IdxI, j: IdxJ })
    // console.log(IdxI, IdxJ)
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
    if (gBoard[location.i][location.j].isShown) {
        elCell.classList.add('shown');
        if (gBoard[location.i][location.j].isMine) elCell.classList.add('rotate-scale-up');
    }
    elCell.innerHTML = value;
}

function flagIt(i, j) {
    if (gGame.isOn) {
        if (!gBoard[i][j].isMarked) {
            renderCell({ i: i, j: j }, FLAG)
            gBoard[i][j].isMarked = true
                // console.log(gBoard[i][j].isMine)
            if (gBoard[i][j].isMine) gGame.markedCount++;
        } else {
            var lastFill = (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount > 0 && gBoard[i][j].isShown) ? gBoard[i][j].minesAroundCount : '';
            gBoard[i][j].isMarked = false
            if (gBoard[i][j].isMine && gBoard[i][j].isShown) lastFill = BOMB
            if (gBoard[i][j].isMine) gGame.markedCount--;
            renderCell({ i: i, j: j }, lastFill)
        }
        checkIfWin();
    }
}

function changeSize(num) {
    switch (num) {
        case 4:
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            changeLevelBestTime('bestEasyScore')
            break;
        case 8:
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            changeLevelBestTime('bestMediumScore')
            break;
        case 12:
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            changeLevelBestTime('bestHardScore')
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
        gGame.isOn = false;
    } else {
        document.querySelector('.restart').innerHTML = '&#128512';
    }
}

function back() {
    // console.log(gGamesArr)
    // gGamesArr.pop()
    var lastGame = gGamesArr.pop()
        // lastGame = lastGame[0];
        // console.log(lastGame)
    gBoard = [];
    gBoard = lastGame.board;
    gHearts = lastGame.lives;
    gGame.isOn = lastGame.game.isOn;
    gGame.shownCount = lastGame.shownCount;
    gGame.markedCount = lastGame.game.markedCount;
    // gGame.secsPassed = lastGame.secsPassed;
    createHearts();
    renderBoard();
}

function checkIfWin() {
    // console.log('test')
    // console.log(gGame.markedCount, gGame.shownCount)
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
        // console.log('true')
        document.querySelector('.restart').innerHTML = '&#128526';
        switch (gLevel.SIZE) {
            case 4:
                checkBestTime('bestEasyScore')
                break;
            case 8:
                checkBestTime('bestMediumScore')
                break;
            case 12:
                checkBestTime('bestHardScore')
                break;

        }
        gGame.isOn = false;

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
        for (var j = 0; j < gLevel.SIZE; j++) {
            document.querySelector('.cell' + i + '-' + j).onclick = null;
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                renderCell({ i: i, j: j }, BOMB)
            }

        }
    }
}

function checkBestTime(name) {
    // console.log(localStorage.getItem(name))
    // debugger
    if (gGame.secsPassed < localStorage.getItem(name)) {
        // console.log(localStorage.getItem(name), 'test')
        localStorage.setItem(name, gGame.secsPassed);
        var minutesLabel = document.querySelector(".bestMinutes");
        var secondsLabel = document.querySelector(".bestSeconds");
        secondsLabel.innerText = pad(localStorage.getItem(name) % 60);
        minutesLabel.innerText = pad(parseInt(localStorage.getItem(name) / 60));
        clearInterval(gInter)
    }
}

function changeLevelBestTime(name) {
    if (Infinity > localStorage.getItem(name)) {
        var minutesLabel = document.querySelector(".bestMinutes");
        var secondsLabel = document.querySelector(".bestSeconds");
        secondsLabel.innerText = pad(localStorage.getItem(name) % 60);
        minutesLabel.innerText = pad(parseInt(localStorage.getItem(name) / 60));
    } else {
        document.querySelector(".bestMinutes").innerText = '00';
        document.querySelector(".bestSeconds").innerText = '00';
    }
}

function createLights() {
    var strHTML = '<table border="0"><tbody>';
    strHTML += '<tr>';
    for (var i = 0; i < gLights; i++) {

        var className = 'cell cell' + i;
        strHTML += '<td class="' + className + '" onclick="useHint(this)" >' + ONLIGHT + '</td>'



    }
    strHTML += '</tr>'
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.lights');
    elContainer.innerHTML = strHTML;
}

function useHint(elLight) {
    if (gGame.isOn) {
        elLight.innerHTML = OFFLIGHT
        elLight.removeAttribute("onclick");
        gLights--;
        if (gLights >= 0)
            gIsHint = true;
    }
}

function exposeRandomCell() {
    if (gGame.isOn && (gGame.shownCount !== ((gLevel.SIZE ** 2) - gLevel.MINES)) && gSafeTimes > 0) {
        resetNums();
        var IdxJ = drawNum()
        resetNums();
        var IdxI = drawNum()
        while (gBoard[IdxI][IdxJ].isShown || gBoard[IdxI][IdxJ].isMine) {
            resetNums();
            IdxJ = drawNum();
            resetNums();
            IdxI = drawNum();
        }
        document.querySelector('.cell' + IdxI + '-' + IdxJ).classList.add('shown')
        setTimeout(() => { document.querySelector('.cell' + IdxI + '-' + IdxJ).classList.remove('shown') }, 3000)
        gSafeTimes--;
        document.querySelector('.shield-number').innerText = gSafeTimes
    }

}

function clone(a) {
    return JSON.parse(JSON.stringify(a));
}

function copyMat() {
    var mat = [];
    for (var i = 0; i < gBoard.length; i++) {
        mat[i] = []
        for (var j = 0; j < gBoard.length; j++) {
            // console.log(clone(gBoard[i][j]))
            mat[i][j] = clone(gBoard[i][j])
        }
    }
    return mat;
}

function addSelfMine() {
    gIsSelfMine = true;
}
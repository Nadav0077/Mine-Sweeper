function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

// function renderCell(i, j, value) {
//     var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
//     elCell.innerText = value;
//     elCell.classList.remove('occupied');
// }



function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// function resetNums(length) {
//     gNums = [];
//     for (var i = 0; i < length; i++) {
//         gNums.push(i + 1);
//     }
// }

// function drawNum() {
//     var randIdx = getRandomInteger(0, gNums.length);
//     var randNum = gNums[randIdx]
//     gNums.splice(randIdx, 1)
//     return randNum
// }
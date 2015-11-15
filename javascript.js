//Game field
var field = [[-1, -1, -1],
             [-1, -1, -1],
             [-1, -1, -1]];

//Wich player turn
var player = 1;

//Score [O-player, X-player]
var score = [0, 0];

//Turn to (row, column) cell
function turn_to(e) {
    var target = e.target;

    //id - 1_2 (row_column)
    var row = target.id[0],
        column = target.id[2];

    if (field[row][column] == -1) {
        field[row][column] = player;
        if (player) {
            target.innerHTML = 'X';
        } else {
            target.innerHTML = 'O';
        }
        var check = check_win()
        if (check != undefined) {
            if (check != -1) {
                score[check*1] += 2;

                check = !check;
                //Edite title of modal window
                $('#winner').html('Player №' + (check + 1) + ' WIN!');
            } else {
                score[0] += 1;
                score[1] += 1;
                //Edite title of modal window
                $('#winner').html('DRAW!');
            }

            //Show modal window
            setTimeout(function () { $('#basicModal').modal({ "backdrop": "static" }); }, 700);
        }
        
        //Swap player
        player = !player;

        //Edite score
        if (player) {
            $('#score')[0].innerHTML = '<u>Player №1 (X)</u>  ' + score[1] + ':' + score[0] + '  Player №2 (O)';
        } else {
            $('#score')[0].innerHTML = 'Player №1 (X)  ' + score[1] + ':' + score[0] + '  <u>Player №2 (O)</u>';
        }
    }
}

function check_win() {

    //Lines
    for (var i = 0; i < 3; ++i) {
        if (field[i][0] == 0 && field[i][1] == 0 && field[i][2] == 0 || field[i][0] == 1 && field[i][1] == 1 && field[i][2] == 1) return field[i][0];
    }
    //Columns
    for (var i = 0; i < 3; ++i) {
        if (field[0][i] == 0 && field[1][i] == 0 && field[2][i] == 0 || field[0][i] == 1 && field[1][i] == 1 && field[2][i] == 1) return field[0][i];
    }

    //Diagonals
    if (field[0][0] == 0 && field[1][1] == 0 && field[2][2] == 0 || field[0][0] == 1 && field[1][1] == 1 && field[2][2] == 1) return field[0][0];
    if (field[0][2] == 0 && field[1][1] == 0 && field[2][0] == 0 || field[0][2] == 1 && field[1][1] == 1 && field[2][0] == 1) return field[0][2];

    //Still have free slots
    for (var i = 0; i < 3; ++i) {
        for (var j = 0; j < 3; ++j) {
            if (field[i][j] == -1) return undefined;
        }
    }

    //Draw
    return -1;
    
}

function clear_field(new_game) {

    field = [[-1, -1, -1],
             [-1, -1, -1],
             [-1, -1, -1]];

    var game_cldrn = $(".game")[0].children;
    for (var i = 0; i < game_cldrn.length; ++i) {
        game_cldrn[i].innerHTML = '';
    }
    player = 1;

    if (new_game) {
        score = [0, 0];
    }

    $('#score')[0].innerHTML = '<u>Player №1 (X)</u>  ' + score[1] + ':' + score[0] + '  Player №2 (O)';
        
}
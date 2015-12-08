function App() {
    this.gamefield = $('.game__sign');
    this.winText = ['Player №1 WINS!', 'Player №2 WINS!', 'DRAW!'];

    this.changeScore = function (score1, score2) {
        $('#player_1_score').html(score1);
        $('#player_2_score').html(score2);
    }

    this.changeTurn = function (turn) {
        $('#player_' + (turn + 1)).removeClass('active');
        $('#player_' + (turn ? 1 : 2)).removeClass('active');
        $('#player_' + (turn + 1)).addClass('active');
    }

    this.new_game = function (obj, score1, score2) {
        this.changeScore(score1||0, score2||0);
        this.changeTurn(0);
        this.game = new Game(obj||0, score1, score2);
        this.gamefield.html('');
    }

    this.updateField = function () {
        var app = this;
        app.game.updateStateMP()
            .then(function () {
                Array.prototype.forEach.call(app.gamefield, function (element, id) {
                    if (app.game.field[0][id] !== 0) {
                        element.innerHTML = 'X';
                    } else if (app.game.field[1][id] !== 0) {
                        element.innerHTML = 'O';
                    } else {
                        element.innerHTML = '';
                    }
                });
                var winner = -1;
                if (app.game.state === 'first-player-wins') {
                    winner = 0;
                } else if (app.game.state === 'second-player-wins') {
                    winner = 1;
                } else if (app.game.state === 'tie') {
                    winner = 2;
                };

                if (winner !== -1) {
                    $('#winner').html(app.winText[winner]);
                    $('#winModal').modal({ "backdrop": "static" });
                }

            })
            .catch(function (err) {
            console.error(err.message)
        });


    }

    this.turn_to = function (e) {
        var cell_id = parseInt(e.target.id);
        var app = this;
        var winner = -1;
        if (app.game.token) {
            app.game.checkTurn(cell_id)
            .then(function () {
                app.updateField();

                if (app.game.state === 'first-player-turn') {
                    if (!app.game.turn) {
                        clearInterval(app.timer);
                    } else {
                        app.timer = setInterval(function () {
                            app.updateField();
                        }, 1000);
                    }
                } else if (app.game.state === 'second-player-turn') {
                    if (app.game.turn) {
                        clearInterval(app.timer);
                    } else {
                        app.timer = setInterval(function () {
                            app.updateField();
                        }, 1000);
                    }
                } 
            });

            
        } else {
            if (app.game.checkTurn(cell_id)) {

                app.changeTurn(app.game.turn);
                app.gamefield[cell_id].innerHTML = app.game.turn ? 'X' : 'O';
                winner = app.game.checkWin();

                if (winner !== -1) {
                    app.changeScore(app.game.score[0], app.game.score[1]);
                    $('#winner').html(app.winText[winner]);
                    $('#winModal').modal({ "backdrop": "static" });
                }

            }
            
        }
        
    };

    this.createMPGame = function () {
        var app = this;
        return new Promise(function (resolve, reject) {
            /*$.ajax({
                url: 'https://aqueous-ocean-2864.herokuapp.com/games',
                type: 'POST',
                contentType: 'application/json',
                data: {"type":0},
                success: resolve
            });*/
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.open("POST", app.game.serverUrl, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json');

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 201) {
                        resolve(xmlhttp.responseText);
                    } else {
                        var error = new Error(xmlhttp.statusText);
                        error.code = xmlhttp.status;
                        reject(error);
                    }
                }
            };

            xmlhttp.send(JSON.stringify({ type: 0 }))

        });
    }

    this.joinMPGame = function (token) {
        var app = this;
        return new Promise(function (resolve, reject) {
            /*$.ajax({
                url: 'https://aqueous-ocean-2864.herokuapp.com/games/' + token,
                type: 'GET',
                success: resolve
            });*/

            var xmlhttp = new XMLHttpRequest();
            var url = app.game.serverUrl + token;

            xmlhttp.open("GET", url, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json');

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        resolve(xmlhttp.responseText);
                    } else {
                        var error = new Error(xmlhttp.statusText);
                        error.code = xmlhttp.status;
                        reject(error);
                    }
                }
            };

            xmlhttp.send();
        });

    }
}
App.prototype.constructor = App;

function Game(obj, score1, score2) {

    this.serverUrl = 'https://aqueous-ocean-2864.herokuapp.com/games/';
    this.token = obj.token || 0;
    this.state = obj.state || 0;
    this.field = [obj.field1 || [0, 0, 0, 0, 0, 0, 0, 0, 0],
                  obj.field2 || [0, 0, 0, 0, 0, 0, 0, 0, 0]];

    this.score = [score1 || 0, score2 || 0];
    this.turn = 0;


    this.checkTurn = function (cell_id) {
        var game = this;
        if (game.token && game.field[0][cell_id] === 0 && game.field[1][cell_id] === 0) {
            
            return new Promise(function (resolve, reject) {
                /*$.ajax({
                    url: 'https://aqueous-ocean-2864.herokuapp.com/games/' + game.token,
                    type: 'PUT',
                    contentType: 'json',
                    data:{"player": (game.turn+1),"position": cell_id},
                    success: resolve,
                });*/

                var xmlhttp = new XMLHttpRequest();
                var url = game.serverUrl + game.token;

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var obj = getMPGame(xmlhttp.responseText)
                            game.state = obj.state;
                            game.field[0] = obj.field[0];
                            game.field[1] = obj.field[0];

                            resolve();
                        } else {
                            var error = new Error(xmlhttp.statusText);
                            error.code = xmlhttp.status;
                            reject(error);
                        }
                    }
                };

                xmlhttp.open("PUT", url, true);
                xmlhttp.setRequestHeader('Content-Type', 'application/json');
                xmlhttp.send(JSON.stringify({ player: (game.turn+1), position: cell_id }));
            });
            
        } else if(!game.token){

            if (game.field[+game.turn][cell_id] === 0 && game.field[+!game.turn][cell_id] === 0) {
                game.field[+game.turn][cell_id] = 1;
                game.turn = !game.turn;
                return true;
            }

        }
        return false;
    }

    this.checkWin = function () {
        var turn = +!this.turn
        //Lines
        for (var i = 0; i < 9; i += 3) {
            if (this.field[turn][i] === 1 && this.field[turn][i + 1] === 1 && this.field[turn][i + 2] === 1) {
                this.score[turn] += 2;

                return turn;
            }
        }
        //Columns
        for (var i = 0; i < 3; ++i) {
            if (this.field[turn][i] === 1 && this.field[turn][i + 3] === 1 && this.field[turn][i + 6] === 1) {
                this.score[turn] += 2;

                return turn;
            }
        }

        //Diagonals
        if (this.field[turn][0] === 1 && this.field[turn][4] === 1 && this.field[turn][8] === 1) {
            this.score[turn] += 2;

            return turn;
        }
        if (this.field[turn][2] === 1 && this.field[turn][4] === 1 && this.field[turn][6] === 1) {
            this.score[turn] += 2;

            return turn;
        }

        //Still have free slots
        for (var i = 0; i < 9; ++i) {
            if (this.field[turn][i] === 0 && this.field[+!turn][i] === 0) return -1;
        }

        //Draw
        this.score[0]++;
        this.score[1]++;

        return 2;
    }

    this.updateStateMP = function () {
        var game = this;
        return new Promise(function (resolve, reject) {
            /*$.ajax({
                url: 'https://aqueous-ocean-2864.herokuapp.com/games/' + game.token,
                type: 'GET',
                success: resolve
            });*/

            var xmlhttp = new XMLHttpRequest();
            var url = game.serverUrl + game.token;

            xmlhttp.open("GET", url, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json');

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        var obj = getMPGame(xmlhttp.responseText);
                        game.state = obj.state;
                        game.field[0] = obj.field[0];
                        game.field[1] = obj.field[1];

                        resolve(obj);
                    } else {
                        var error = new Error(xmlhttp.statusText);
                        error.code = xmlhttp.status;
                        reject(error);
                    }
                }
            };

            xmlhttp.send();
        });
    }
}
Game.prototype.constructor = Game;

function getMPGame(data) {
    var gameObj = JSON.parse(data);

    gameObj.field1 = gameObj.field1.toString(2);
    gameObj.field2 = gameObj.field2.toString(2);
    gameObj.field1 = (Array(10 - gameObj.field1.length).join('0') + gameObj.field1).split('').reverse();
    gameObj.field2 = (Array(10 - gameObj.field2.length).join('0') + gameObj.field2).split('').reverse();

    for (var i = 0; i < 9; i++) {
        gameObj.field1[i] = parseInt(gameObj.field1[i]);
        gameObj.field2[i] = parseInt(gameObj.field2[i]);
    }

    return new Game(gameObj);
}

var APP = new App();
APP.new_game();

//Bind events
$('.game').on('click', function (e) {
    APP.turn_to(e);
});

//Single game
$('#btn_new').on('click', function () {
    APP.new_game();
});
$('#btn_continue').on('click', function () {
    APP.new_game(null, APP.game.score[0], APP.game.score[1]);
});

//Net game
$('#mp-create').on('click', function () {
    APP.createMPGame()
        .then(getMPGame)
        .then(function (gameObj) {
            APP.game = gameObj;
            $('#show_token')[0].value = gameObj.token;
        })
        .catch(function (err) {
            console.error(err.message)
        });
    $('#mpModal-new').modal({ "backdrop": "static" });

    return false;
});

$('#mp-join').on('click', function () {

    $('#mpModal-join').modal({ "backdrop": "static" });

    return false;
});

$('#btn-mp-join').on('click', function () {
    var token = $('#input_token')[0].value;
    APP.joinMPGame(token)
        .then(getMPGame)
        .then(function (gameObj) {
            APP.game = gameObj;
            APP.game.turn = 1;
            $('#show_token')[0].value = gameObj.token;
            if (APP.game.state === 'first-player-turn') {
                APP.timer = setInterval(function () {
                    APP.updateField();
                }, 1000);
            } else {
                APP.updateField();
            }
        })
        .catch(function (err) {
            console.error(err.message)
        });
});


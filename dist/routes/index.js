"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _fsExtra = require("fs-extra");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream('log.txt', {
  flags: 'a'
});
var log_stdout = process.stdout;

var router = _express2.default.Router();
var axios = require("axios");

// @TODO
// 1. Render home page
// 2. Init player in js in front-end
// 3. Click to start the game
// 4. Auto-move. 
// 5. Dùng script append các step vào front-end

// @TODO
// API render home page
// API get random number
// js code để thực hiện các bước đi dựa vào random number và print ra front-end

/* GET home page. */
router.get("/", function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(req, res, next) {
    var _this = this;

    var moveHorse = function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(i, dice, player, horse) {
        var toWinNumber, totalWillMove, cellIsMovingTo, isDeny, _cell, k, _j, newDice;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!(horse.inCage == true)) {
                  _context.next = 17;
                  break;
                }

                logs.push(player.name + " - ngựa " + horse.id + " đang trong chuồng");

                //nếu quay lần lượt đúng vị trí 6, 5, 4, 3 thì sẽ được lên
                // tính số cần quay được để lên
                toWinNumber = 6;

                if (player.horses.length == 4) {
                  toWinNumber = 6;
                }
                if (player.horses.length == 3) {
                  toWinNumber = 5;
                }
                if (player.horses.length == 2) {
                  toWinNumber = 4;
                }
                if (player.horses.length == 1) {
                  toWinNumber = 3;
                }

                if (!(dice == toWinNumber)) {
                  _context.next = 15;
                  break;
                }

                logs.push(player.name + " - Ngựa " + horse.id + " về đích với " + dice + " điểm ");
                // xóa ngựa

                players[i].horses.splice(0, 1);
                //kiểm tra ngựa còn không

                if (!(players[i].horses.length == 0)) {
                  _context.next = 15;
                  break;
                }

                theWinner = player;
                hasWinner = true;
                // break;
                return _context.abrupt("return", "has Winner");

              case 15:
                _context.next = 41;
                break;

              case 17:
                if (!(horse.totalCellMoved == 47)) {
                  _context.next = 22;
                  break;
                }

                logs.push("Player" + i + " - Ngựa " + horse.id + " đang ở vị trí lên chuồng");
                //check dice's value
                if (dice == 1 || dice == 6) {

                  players[i].horses[0].inCage = true;
                  players[i].horses[0].cagePosition = 1;
                  logs.push(player.name + " - Ngựa " + horse.id + " được lên chuồng");

                  removeHorseFromCell(horse.id, horse.playerId, horse.currentCellId);
                }
                _context.next = 41;
                break;

              case 22:
                totalWillMove = players[i].horses[0].totalCellMoved + dice;

                if (!(totalWillMove > 47)) {
                  _context.next = 28;
                  break;
                }

                logs.push('Vượt quá số điểm cho phép, qua lượt.');
                return _context.abrupt("return", true);

              case 28:
                cellIsMovingTo = players[i].horses[0].currentCellId + dice;

                if (cellIsMovingTo > 47) {
                  cellIsMovingTo = cellIsMovingTo % 47 - 1;
                }

                // kiểm tra bị chặn
                isDeny = checkDeny(horse.currentCellId, cellIsMovingTo, horse);

                if (!isDeny) {
                  _context.next = 33;
                  break;
                }

                return _context.abrupt("return", true);

              case 33:
                // kiểm tra đá
                checkKick(cellIsMovingTo, horse);
                //track ô đã đi
                players[i].horses[0].totalCellMoved += dice;

                // cập nhật trạng thái của ô bàn cờ
                _cell = players[i].horses[0].currentCellId + dice;

                if (_cell > 47) {
                  _cell = _cell % 47 - 1;
                }
                players[i].horses[0].currentCellId = _cell;

                // updateTable(cell, horse);
                for (k = 0; k < table.length; k++) {
                  if (table[k].currentHorses.length > 0) {
                    for (_j = 0; _j < table[k].currentHorses.length; _j++) {
                      if (table[k].currentHorses[_j].id == horse.id && table[k].currentHorses[_j].playerId == horse.playerId) {
                        table[k].currentHorses.splice(_j, 1);
                      }
                    }
                  }
                }

                table[_cell].currentHorses.push(players[i].horses[0]);

                logs.push(player.name + " di chuyển thêm " + dice + " ô, đến vị trí T" + players[i].horses[0].currentCellId + ", đã đi được " + players[i].horses[0].totalCellMoved + " ô.");

              case 41:
                if (!(dice == 1 || dice == 6)) {
                  _context.next = 49;
                  break;
                }

                logs.push(player.name + " Quay thêm lượt");

                // let newDice = Math.floor(Math.random() * (7 - 1) + 1);
                _context.next = 45;
                return rollDice();

              case 45:
                newDice = _context.sent;


                logs.push(players[i].name + " quay được " + newDice + " điểm");
                _context.next = 49;
                return moveHorse(i, newDice, players[i], players[i].horses[0]);

              case 49:
                return _context.abrupt("return", true);

              case 52:
                _context.prev = 52;
                _context.t0 = _context["catch"](0);

                console.log('error', _context.t0);
                return _context.abrupt("return", false);

              case 56:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 52]]);
      }));

      return function moveHorse(_x4, _x5, _x6, _x7) {
        return _ref2.apply(this, arguments);
      };
    }();

    var totalPlayers, playerHorses, table, i, cell, players, _i, player, j, horse, hasWinner, theWinner, logs, removeHorseFromCell, kickHorseFromCell, checkDeny, checkKick, getAvailableCageMax, rollDice, idx, runGame, _i5;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            getAvailableCageMax = function getAvailableCageMax(player_id, horse) {
              var player = players[player_id];
              if (player.horses.length == 4) {
                return 6;
              }
              if (player.horses.length == 3) {
                return 5;
              }
              if (player.horses.length == 2) {
                return 4;
              }
              if (player.horses.length == 1) {
                return 3;
              }
            };

            checkKick = function checkKick(cellIsMovingTo, horse) {

              if (table[cellIsMovingTo].currentHorses.length == 0) {
                return true;
              } else {
                var beKickHorse = table[cellIsMovingTo].currentHorses[0];

                players[beKickHorse.playerId].horses[beKickHorse.id].inCage = false;
                players[beKickHorse.playerId].horses[beKickHorse.id].cagePosition = 0;
                players[beKickHorse.playerId].horses[beKickHorse.id].currentCellId = 14 * beKickHorse.playerId;
                players[beKickHorse.playerId].horses[beKickHorse.id].totalCellMoved = 0;
                kickHorseFromCell(beKickHorse.id, beKickHorse.playerId, cellIsMovingTo);

                return true;
              }
            };

            checkDeny = function checkDeny(currentCell, cellIsMovingTo, horse) {
              var isDeny = false;
              var i = currentCell;
              if (cellIsMovingTo > currentCell) {
                for (var _i2 = currentCell + 1; _i2 < cellIsMovingTo; _i2++) {
                  if (table[_i2].currentHorses.length > 0) {
                    logs.push('Player' + horse.playerId + ' - Ngựa ' + horse.id + ' bị cản. Qua lượt');
                    isDeny = true;
                    break;
                  }
                }
              }
              if (cellIsMovingTo < currentCell) {
                for (var _i3 = currentCell + 1; _i3 <= 47; _i3++) {
                  if (table[_i3].currentHorses.length > 0) {
                    logs.push('Player' + horse.playerId + ' - Ngựa ' + horse.id + ' bị cản. Qua lượt');
                    isDeny = true;
                    break;
                  }
                }
                for (var _i4 = 0; _i4 <= cellIsMovingTo; _i4++) {
                  if (table[_i4].currentHorses.length > 0) {
                    logs.push('Player' + horse.playerId + ' - Ngựa ' + horse.id + ' bị cản. Qua lượt');
                    isDeny = true;
                    break;
                  }
                }
              }

              return isDeny;
            };

            kickHorseFromCell = function kickHorseFromCell(horse_id, playerId, currentCellId) {
              if (table[currentCellId].currentHorses.length == 0) return true;
              table[currentCellId].currentHorses.forEach(function (horse, idx) {
                if (horse.id == horse_id && horse.playerId == playerId) {
                  table[currentCellId].currentHorses.splice(idx, 1);
                  logs.push('Player' + playerId + ' - Ngựa ' + horse_id + ' đã bị đá khỏi bàn');
                }
              });
              return true;
            };

            removeHorseFromCell = function removeHorseFromCell(horse_id, playerId, currentCellId) {
              if (table[currentCellId].currentHorses.length == 0) return true;
              table[currentCellId].currentHorses.forEach(function (horse, idx) {
                if (horse.id == horse_id && horse.playerId == playerId) {
                  table[currentCellId].currentHorses.splice(idx, 1);
                  logs.push('Player' + playerId + ' - Ngựa ' + horse_id + ' được xóa khỏi bản đồ');
                }
              });
              return true;
            };

            totalPlayers = 4;
            playerHorses = 4;
            // do chương trình k có UI options nên sẽ giả sử mọi người chơi đều chơi theo cách lần lượt từng con ngựa được lên chuồng xong mới chơi đến con tiếp theo. Nghĩa là bỏ qua trường hợp "Bị Cản".
            //init table

            table = [];

            for (i = 0; i < 48; i++) {
              cell = {
                id: i,
                currentHorses: []
              };

              table.push(cell);
            }

            //init player
            players = [];

            for (_i = 0; _i < totalPlayers; _i++) {
              player = {
                id: _i,
                name: "player" + _i,
                horses: []
              };

              //init horses

              for (j = 0; j < playerHorses; j++) {
                horse = {
                  id: j,
                  playerId: _i,
                  inCage: false,
                  cagePosition: 0,
                  currentCellId: 12 * _i,
                  totalCellMoved: 0 // 47 là vị trí lên chuồng
                };


                player.horses.push(horse);
              }

              players.push(player);
            }

            //define roles
            hasWinner = false;
            theWinner = false;
            logs = [];

            rollDice = function () {
              var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var r;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return axios.get('https://www.random.org/integers/?num=1&min=1&max=6&col=1&base=10&format=plain&rnd=new');

                      case 3:
                        r = _context2.sent;
                        return _context2.abrupt("return", r.data);

                      case 7:
                        _context2.prev = 7;
                        _context2.t0 = _context2["catch"](0);

                        console.log('error call axios', _context2.t0);
                        return _context2.abrupt("return", Math.floor(Math.random() * (7 - 1) + 1));

                      case 11:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this, [[0, 7]]);
              }));

              return function rollDice() {
                return _ref3.apply(this, arguments);
              };
            }();

            idx = 0;

            runGame = function () {
              var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var _player, dice, _horse, resultMove;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:

                        if (idx > 3) idx = 0;

                        _player = players[idx];
                        _context3.next = 4;
                        return rollDice();

                      case 4:
                        dice = _context3.sent;
                        _horse = _player.horses[0] != "undefined" ? _player.horses[0] : false;

                        logs.push(_player.name + " quay được " + dice + " điểm");

                        if (!(_horse == false)) {
                          _context3.next = 9;
                          break;
                        }

                        return _context3.abrupt("return");

                      case 9:
                        _context3.next = 11;
                        return moveHorse(idx, dice, _player, _horse);

                      case 11:
                        resultMove = _context3.sent;

                        if (!(hasWinner == true)) {
                          _context3.next = 14;
                          break;
                        }

                        return _context3.abrupt("return");

                      case 14:

                        idx++;

                      case 15:
                        if (hasWinner === false) {
                          _context3.next = 0;
                          break;
                        }

                      case 16:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3, _this);
              }));

              return function runGame() {
                return _ref4.apply(this, arguments);
              };
            }();

            _context4.next = 19;
            return runGame();

          case 19:

            logs.push("the winner is:", theWinner.name);

            for (_i5 = 0; _i5 < logs.length; _i5++) {
              log_file.write(util.format(logs[_i5]) + '\n');
              log_stdout.write(util.format(logs[_i5]) + '\n');
            }

            res.render("index", {
              title: "Test Game",
              logs: logs
            });

          case 22:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}()); // router.get("/")

exports.default = router;
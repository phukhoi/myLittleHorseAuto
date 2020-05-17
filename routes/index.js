"use strict";
import express from "express";
import {
  move
} from "fs-extra";
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream('log.txt', {
  flags: 'a'
});
var log_stdout = process.stdout;

var router = express.Router();
const axios = require("axios");


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
router.get("/", async function (req, res, next) {

  const totalPlayers = 4;
  const playerHorses = 4;
  // do chương trình k có UI options nên sẽ giả sử mọi người chơi đều chơi theo cách lần lượt từng con ngựa được lên chuồng xong mới chơi đến con tiếp theo. Nghĩa là bỏ qua trường hợp "Bị Cản".
  //init table
  var table = [];
  for (let i = 0; i < 48; i++) {
    var cell = {
      id: i,
      currentHorses: [],
    };
    table.push(cell);
  }

  //init player
  var players = [];
  for (let i = 0; i < totalPlayers; i++) {
    var player = {
      id: i,
      name: "player" + i,
      horses: [],
    };

    //init horses
    for (let j = 0; j < playerHorses; j++) {
      var horse = {
        id: j,
        playerId: i,
        inCage: false,
        cagePosition: 0,
        currentCellId: 12 * i,
        totalCellMoved: 0, // 47 là vị trí lên chuồng
      }

      player.horses.push(horse);
    }

    players.push(player);
  }

  //define roles
  let hasWinner = false;
  let theWinner = false;

  let logs = []


  function removeHorseFromCell(horse_id, playerId, currentCellId) {
    if (table[currentCellId].currentHorses.length == 0) return true;
    table[currentCellId].currentHorses.forEach((horse, idx) => {
      if (horse.id == horse_id && horse.playerId == playerId) {
        table[currentCellId].currentHorses.splice(idx, 1);
        logs.push('Player' + playerId + ' - Ngựa ' + horse_id + ' được xóa khỏi bản đồ');
      }
    });
    return true;
  }

  function kickHorseFromCell(horse_id, playerId, currentCellId) {
    if (table[currentCellId].currentHorses.length == 0) return true;
    table[currentCellId].currentHorses.forEach((horse, idx) => {
      if (horse.id == horse_id && horse.playerId == playerId) {
        table[currentCellId].currentHorses.splice(idx, 1);
        logs.push('Player' + playerId + ' - Ngựa ' + horse_id + ' đã bị đá khỏi bàn');
      }
    });
    return true;
  }

  function checkDeny(currentCell, cellIsMovingTo, horse) {
    let isDeny = false;
    let i = currentCell;
    if (cellIsMovingTo > currentCell) {
      for (let i = currentCell + 1; i < cellIsMovingTo; i++) {
        if (table[i].currentHorses.length > 0) {
          logs.push('Player' + horse.playerId + ' - Ngựa ' + horse.id + ' bị cản. Qua lượt')
          isDeny = true;
          break;
        }
      }
    }
    if (cellIsMovingTo < currentCell) {
      for (let i = currentCell + 1; i <= 47; i++) {
        if (table[i].currentHorses.length > 0) {
          logs.push('Player' + horse.playerId + ' - Ngựa ' + horse.id + ' bị cản. Qua lượt')
          isDeny = true;
          break;
        }
      }
      for (let i = 0; i <= cellIsMovingTo; i++) {
        if (table[i].currentHorses.length > 0) {
          logs.push('Player' + horse.playerId + ' - Ngựa ' + horse.id + ' bị cản. Qua lượt')
          isDeny = true;
          break;
        }
      }
    }


    return isDeny;
  }

  function checkKick(cellIsMovingTo, horse) {

    if (table[cellIsMovingTo].currentHorses.length == 0) {
      return true;
    } else {
      let beKickHorse = table[cellIsMovingTo].currentHorses[0];

      players[beKickHorse.playerId].horses[beKickHorse.id].inCage = false;
      players[beKickHorse.playerId].horses[beKickHorse.id].cagePosition = 0;
      players[beKickHorse.playerId].horses[beKickHorse.id].currentCellId = 14 * beKickHorse.playerId;
      players[beKickHorse.playerId].horses[beKickHorse.id].totalCellMoved = 0;
      kickHorseFromCell(beKickHorse.id, beKickHorse.playerId, cellIsMovingTo);

      return true;
    }

  }

  function getAvailableCageMax(player_id, horse) {
    let player = players[player_id];
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
  }



  async function moveHorse(i, dice, player, horse) {

    try {

      //check current posistion
      //check xem có lên chuồng chưa

      if (horse.inCage == true) {

        logs.push(player.name + " - ngựa " + horse.id + " đang trong chuồng");

        //nếu quay lần lượt đúng vị trí 6, 5, 4, 3 thì sẽ được lên
        // tính số cần quay được để lên
        let toWinNumber = 6;
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

        if (dice == toWinNumber) {
          logs.push(
            player.name +
            " - Ngựa " +
            horse.id +
            " về đích với " +
            dice +
            " điểm "
          );
          // xóa ngựa

          players[i].horses.splice(0, 1);
          //kiểm tra ngựa còn không
          if (players[i].horses.length == 0) {
            theWinner = player;
            hasWinner = true;
            // break;
            return "has Winner";
          }
        }

      } else {
        //check xem có đứng tại vị trí lên chuồng hay k
        if (horse.totalCellMoved == 47) {
          logs.push(
            "Player" + i + " - Ngựa " + horse.id + " đang ở vị trí lên chuồng"
          );
          //check dice's value
          if (dice == 1 || dice == 6) {

            players[i].horses[0].inCage = true;
            players[i].horses[0].cagePosition = 1;
            logs.push(player.name + " - Ngựa " + horse.id + " được lên chuồng");

            removeHorseFromCell(horse.id, horse.playerId, horse.currentCellId);

          }
        } else {

          let totalWillMove = players[i].horses[0].totalCellMoved + dice;
          if (totalWillMove > 47) {
            logs.push('Vượt quá số điểm cho phép, qua lượt.');
            return true;
          } else {
            let cellIsMovingTo = players[i].horses[0].currentCellId + dice;
            if (cellIsMovingTo > 47) {
              cellIsMovingTo = cellIsMovingTo % 47 - 1;
            }

            // kiểm tra bị chặn
            let isDeny = checkDeny(horse.currentCellId, cellIsMovingTo, horse);
            if (isDeny) return true;
            // kiểm tra đá
            checkKick(cellIsMovingTo, horse);
            //track ô đã đi
            players[i].horses[0].totalCellMoved += dice;

            // cập nhật trạng thái của ô bàn cờ
            let cell = players[i].horses[0].currentCellId + dice;
            if (cell > 47) {
              cell = cell % 47 - 1;
            }
            players[i].horses[0].currentCellId = cell;

            // updateTable(cell, horse);
            for (let k = 0; k < table.length; k++) {
              if (table[k].currentHorses.length > 0) {
                for (let j = 0; j < table[k].currentHorses.length; j++) {
                  if (table[k].currentHorses[j].id == horse.id && table[k].currentHorses[j].playerId == horse.playerId) {
                    table[k].currentHorses.splice(j, 1);
                  }
                }
              }
            }

            table[cell].currentHorses.push(players[i].horses[0]);

            logs.push(
              player.name +
              " di chuyển thêm " +
              dice +
              " ô, đến vị trí T" +
              players[i].horses[0].currentCellId +
              ", đã đi được " +
              players[i].horses[0].totalCellMoved +
              " ô."
            );
          }

        }
      }


      if (dice == 1 || dice == 6) {
        logs.push(player.name + " Quay thêm lượt");

        // let newDice = Math.floor(Math.random() * (7 - 1) + 1);
        let newDice = await rollDice();

        logs.push(players[i].name + " quay được " + newDice + " điểm");
        await moveHorse(i, newDice, players[i], players[i].horses[0]);
      }

      return true
    } catch (e) {
      console.log('error', e)
      return false
    }
  }

  const rollDice = async () => {
    try {
      const r = await axios.get('https://www.random.org/integers/?num=1&min=1&max=6&col=1&base=10&format=plain&rnd=new')
      return r.data

    } catch (err) {
      console.log('error call axios', err);
      return Math.floor(Math.random() * (7 - 1) + 1);
    }

    //uncomment this to faster random
    // return new Promise((resolve) => {
    //   resolve(Math.floor(Math.random() * (7 - 1) + 1));
    // });

  }

  let idx = 0
  const runGame = async () => {

    do {

      if (idx > 3) idx = 0

      const player = players[idx]
      let dice = await rollDice();
      let horse = player.horses[0] != "undefined" ? player.horses[0] : false;
      logs.push(player.name + " quay được " + dice + " điểm");

      if (horse == false) return;
      let resultMove = await moveHorse(idx, dice, player, horse);
      if (hasWinner == true) {
        return;
      }

      idx++;
    }
    while (hasWinner === false)
  }
  await runGame();

  logs.push("the winner is:", theWinner.name);

  for (let i = 0; i < logs.length; i++) {
    log_file.write(util.format(logs[i]) + '\n');
    log_stdout.write(util.format(logs[i]) + '\n');
  }

  res.render("index", {
    title: "Test Game",
    logs
  });

}); // router.get("/")

export default router;
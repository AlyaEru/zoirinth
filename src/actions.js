const simulateMap = require("./simulateMap");

function listen(map, player) {
  let cloversCollected = 0;
  let numClovers = clovers.length;
  document.onkeydown = function(e) {
    e = e || window.event;
    switch (e.code) {
      case "ArrowDown":
      case "KeyS":
        player.actionQueue.push(() => go(map, player, player, "d"));
        break;
      case "ArrowUp":
      case "KeyW":
        player.actionQueue.push(() => go(map, player, player, "u"));
        break;
      case "ArrowLeft":
      case "KeyA":
        player.actionQueue.push(() => go(map, player, player, "l"));
        break;
      case "ArrowRight":
      case "KeyD":
        player.actionQueue.push(() => go(map, player, player, "r"));
        break;
      case "KeyR":
        player.runMode = !player.runMode;
        break;
    }
  };
}

function go(map, player, entity, dir) {
  let runthrough = [
    "clover",
    "space",
    "pod",
    "superpod",
    "lr_portal",
    "ud_portal",
    "player",
    "player_shield"
  ];
  function rotateLeft(dir) {
    switch (dir) {
      case "l":
        return "d";
      case "r":
        return "u";
      case "u":
        return "l";
      case "d":
        return "r";
    }
  }
  function rotateRight(dir) {
    switch (dir) {
      case "l":
        return "u";
      case "r":
        return "d";
      case "u":
        return "r";
      case "d":
        return "l";
    }
  }
  if (entity.runMode) {
    if (handleEntityMoveto(map, player, entity, locAt(entity.loc, dir))) {
      if (
        runthrough.includes(lookNext(entity, dir)) &&
        !runthrough.includes(lookNext(entity, rotateRight(dir))) &&
        !runthrough.includes(lookNext(entity, rotateLeft(dir)))
      ) {
        entity.actionQueue.unshift(function() {
          go(map, player, entity, dir);
        });
      }
    }
  } else {
    handleEntityMoveto(map, player, entity, locAt(entity.loc, dir));
  }
}

function removeItem(items, loc) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].loc.x == loc.x && items[i].loc.y == loc.y) {
      items.splice(i, 1);
    }
  }
}
function handleEntityMoveto(map, player, entity, loc) {
  let moved = false;
  //TODO: make this work with entity other than player
  if (entity.getType() == "player") {
    switch (itemAt(map, player, loc)) {
      case "space":
        player.loc = loc;
        moved = true;
        break;
      case "clover":
        removeItem(clovers, loc);
        player.score += 100;
        player.clovers++;
        player.loc = loc;
        moved = true;
        break;
      case "zoid":
        player.dead = true;
        break;
      case "lr_portal":
      case "ud_portal":
        player.escaped = true;
        break;
      //handle winning here?
    }
  } else {
    switch (itemAt(map, player, loc)) {
      case "space":
        entity.loc = loc;
        moved = true;
        break;
      case "clover":
        removeItem(clovers, loc);
        entity.score += 100;
        entity.clovers++;
        entity.loc = loc;
        moved = true;
        break;
      case "player":
        player.dead = true;
        break;
    }
  }
  return moved;
}
function locAt(loc, dir) {
  switch (dir) {
    case "l":
      return { x: loc.x - 1, y: loc.y };
    case "r":
      return { x: loc.x + 1, y: loc.y };
    case "u":
      return { x: loc.x, y: loc.y - 1 };
    case "d":
      return { x: loc.x, y: loc.y + 1 };
  }
}
function lookNext(entity, dir) {
  return itemAt(map, player, locAt(entity.loc, dir));
}

function itemAt(map, player, loc) {
  if (
    loc.x < 0 ||
    loc.x >
      simulateMap.getMapSimulation(map, [player], zoids, clovers)[0].length
  ) {
    return "outside";
  } else if (
    loc.y < 0 ||
    loc.y > simulateMap.getMapSimulation(map, [player], zoids, clovers).length
  ) {
    return "outside";
  } else {
    return simulateMap.getMapSimulation(map, [player], zoids, clovers)[loc.y][
      loc.x
    ];
  }
}

let zoidModes = ["random"];

function zoidAction(zoid) {
  let dirs = ["l", "r", "u", "d"];

  return () => {
    zoid.runMode = true;
    if (zoid.mode === "") {
      zoid.mode = zoidModes[rand(zoidModes.length)];
    }
    if (zoid.mode === "random") {
      zoid.actionQueue.unshift(() =>
        go(map, player, zoid, dirs[rand(dirs.length)])
      );
    }
    zoid.actionQueue.push(zoidAction(zoid));
  };
}

module.exports = {
  listen: listen,
  zoidAction: zoidAction
};

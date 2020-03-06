import Game from "./Game.js";
import ConnectionManager from "./ConnectionManager.js";

const connection = new ConnectionManager(this);
connection.connect(`ws://${window.location.hostname}:8001`);

connection.events.listen("session-broadcast", function(data) {
	const game = new Game(30, data.peers.you);
	connection.setGame(game);

	connection.events.removeListener(this);
});

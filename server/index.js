const Session = require("./Session");
const Client = require("./Client");

const { round, random } = Math;

const express = require("express");
const createSocket = require("express-ws");

function generateId(length = 6, chars = "abcdefghjkmnopqrstuvwxyz1234567890") {
	return Array(length)
		.fill(null)
		.map(it => chars.charAt(round(random() * chars.length)))
		.join("");
}

function createClient(connection, id = generateId()) {
	return new Client(connection, id);
}

const app = express();
const socket = createSocket(app);

const session = new Session();

app.use(express.static("public"));

app.ws("/", (ws, req) => {
	console.log("Connection Established");

	const client = createClient(ws);
	session.join(client);

	ws.on("message", msg => {
		const data = JSON.parse(msg);

		if (data.type === "state-update") {
			session.broadcast(data, it => it !== client);
			client.state[data.name] = data.value;
		}

		if (data.type === "remove-apple") {
			let index = null;

			session.apples.forEach((apple, i) => {
				if (apple.x === data.apple.x && apple.y === data.apple.y) {
					index = i;
				}
			});

			session.apples.splice(index, 1);

			session.broadcast(data, it => it !== client);
		}
	});

	ws.on("close", () => {
		session.leave(client);
		console.log("Connection closed");
	});
});

app.listen(8001);

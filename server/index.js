const { Server } = require("ws");
const Session = require("./Session");
const Client = require("./Client");
const { round, random } = Math;

function generateId(length = 6, chars = "abcdefghjkmnopqrstuvwxyz1234567890") {
	return Array(length)
		.fill(null)
		.map(it => chars.charAt(round(random() * chars.length)))
		.join("");
}

function createClient(connection, id = generateId()) {
	return new Client(connection, id);
}

const server = new Server({ port: 8001 });
const session = new Session();

console.log("Server up and running!");

server.on("connection", connection => {
	console.log("Connection opened");

	const client = createClient(connection);
	session.join(client);

	connection.on("message", msg => {
		const data = JSON.parse(msg);

		if (data.type === "state-update") {
			session.broadcast(data, it => it !== client);
			client.state[data.name] = data.value;
		}
	});

	connection.on("close", () => {
		session.leave(client);
		console.log("Connection closed");
	});
});

import { app } from "./app";
import { config } from './config/config';

console.log(config.api_server.port, typeof config.api_server.port);

app.listen(config.api_server.port, () =>
	console.log(`App listening on port - ${config.api_server.port}`)
);
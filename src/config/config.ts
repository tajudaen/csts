const dotenv = require("dotenv");

dotenv.config();

const appName: string = "customer support ticketing system";

const config = {
	app_name: appName,
	api_server: {
		port: process.env.PORT,
	},
	JWT: {
		SECRETKEY: process.env.SECRETKEY,
	},
	logging: {
		shouldLogToFile: process.env.ENABLE_FILE_LOGGING,
		file: process.env.LOG_PATH,
		level: process.env.LOG_LEVEL || "warn",
		console: process.env.LOG_ENABLE_CONSOLE || true,
	},
	mongodb: {
		host: process.env.MONGO_HOST,
		username: process.env.MONGO_USER,
		password: process.env.MONGO_PASSWORD,
		port: process.env.MONGO_PORT,
		db: process.env.MONGO_DB_NAME,
		collections: {
			user: "user",
			admin: "admin",
			ticket: "ticket",
			department: "department",
			support: "supportagents",
		},
	},
	mongodb_test: process.env.MONGO_DB_TEST,
};

export { config };

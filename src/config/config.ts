/**
 * load in environmental variables using dotenv
 * declare environmental variable in config object
 */
import dotenv from "dotenv";
dotenv.config();

interface IEnv {
	appName: string;
	port: number;
	mongodb: IMongodb;
	environment: string;
	jwt: IJWT;
	salt: number;
	redisURL: string;
}

interface IMongodb {
	uri: string;
	testUri: string;
	collections: ICollections;
}

interface ICollections {
	user: string;
	admin: string;
	ticket: string;
	category: string;
}

interface IJWT {
	SECRETKEY: string;
	expires: number;
	issuer: string;
	alg: any;
}


const config: IEnv = {
	appName: "customer support ticketing system",
	environment: process.env.NODE_ENV || "development",
	port: Number(process.env.PORT),
	jwt: {
		SECRETKEY: process.env.JWT_SECRET_KEY!,
		expires: Number(process.env.JWT_EXPIRY)!,
		issuer: process.env.ISSUER!,
		alg: process.env.JWT_ALG!,
	},
	mongodb: {
		uri: process.env.MONGO_DB_URI!,
		testUri: process.env.MONGO_DB_TEST!,
		collections: {
			user: "user",
			admin: "admin",
			ticket: "ticket",
			category: "category",
		},
	},
	salt: Number(process.env.SALT_ROUND)!,
	redisURL: process.env.REDIS_URL!,
};

export { config };

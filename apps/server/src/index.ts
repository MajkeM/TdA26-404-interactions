import "dotenv/config";
import path from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import session from "express-session";
import methodOverride from "method-override";
import { PrismaClient } from "@prisma/client";
import apiRouter from "./routes/api.js";
import pagesRouter from "./routes/pages.js";

const prisma = new PrismaClient();
const app = express();
const ROOT_DIR = process.cwd();
const port = Number(process.env.PORT) || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(ROOT_DIR, "src", "views"));

app.use(express.static(path.join(ROOT_DIR, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(
	session({
		secret: process.env.SESSION_SECRET || "tda26-session",
		resave: false,
		saveUninitialized: false,
		cookie: {
			sameSite: "lax",
		},
	}),
);

app.use((req, res, next) => {
	req.prisma = prisma;
	res.locals.user = req.session.user ?? null;
	next();
});

app.use(pagesRouter);
app.use("/api", apiRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err);
	res.status(500).render("error", { title: "Chyba", message: "Něco se pokazilo." });
});

app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});

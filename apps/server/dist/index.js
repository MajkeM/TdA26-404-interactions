import "dotenv/config";
import path from "node:path";
import express, { Router } from "express";
import session from "express-session";
import methodOverride from "method-override";
import { PrismaClient } from "@prisma/client";

//#region src/routes/api.ts
const apiRouter = Router();
const emptyCollections = () => ({
	materials: [],
	quizzes: [],
	feed: []
});
function summarizeDescription(description, fallback) {
	const base = description?.trim() || fallback.trim();
	if (base.length <= 140) return base;
	return `${base.slice(0, 137)}...`;
}
function toApiCourse(course) {
	return {
		uuid: course.id,
		name: course.title,
		description: course.description ?? "",
		shortDescription: course.shortDescription,
		createdAt: course.createdAt,
		updatedAt: course.updatedAt,
		...emptyCollections()
	};
}
apiRouter.get("/", (_req, res) => {
	res.json({ organization: "Student Cyber Games" });
});
apiRouter.get("/courses", async (req, res, next) => {
	try {
		const courses = await req.prisma.course.findMany({ orderBy: { createdAt: "desc" } });
		res.json(courses.map(toApiCourse));
	} catch (error) {
		next(error);
	}
});
apiRouter.get("/courses/:id", async (req, res, next) => {
	try {
		const course = await req.prisma.course.findUnique({ where: { id: req.params.id } });
		if (!course) return res.status(404).json({ error: "Course not found" });
		res.json(toApiCourse(course));
	} catch (error) {
		next(error);
	}
});
apiRouter.post("/courses", async (req, res, next) => {
	try {
		const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
		const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
		if (!name) return res.status(400).json({ error: "Field 'name' is required" });
		const created = await req.prisma.course.create({ data: {
			title: name,
			shortDescription: summarizeDescription(description || null, name),
			description: description || null
		} });
		res.status(201).json(toApiCourse(created));
	} catch (error) {
		next(error);
	}
});
apiRouter.put("/courses/:id", async (req, res, next) => {
	try {
		const name = typeof req.body?.name === "string" ? req.body.name.trim() : void 0;
		const description = typeof req.body?.description === "string" ? req.body.description.trim() : void 0;
		if (!name && description === void 0) return res.status(400).json({ error: "Provide 'name' and/or 'description'" });
		const updated = await req.prisma.course.update({
			where: { id: req.params.id },
			data: {
				...name ? { title: name } : {},
				...description !== void 0 ? {
					description: description || null,
					shortDescription: summarizeDescription(description || null, name ?? "")
				} : {}
			}
		});
		res.json(toApiCourse(updated));
	} catch (error) {
		next(error);
	}
});
apiRouter.delete("/courses/:id", async (req, res, next) => {
	try {
		await req.prisma.course.delete({ where: { id: req.params.id } });
		res.status(204).end();
	} catch (error) {
		next(error);
	}
});
var api_default = apiRouter;

//#endregion
//#region src/middleware/auth.ts
function isAuthenticated(req, res, next) {
	if (req.session.user) return next();
	req.session.returnTo = req.originalUrl;
	return res.redirect("/login");
}

//#endregion
//#region src/routes/pages.ts
const USERNAME = "lecturer";
const PASSWORD = "TdA26!";
const router = Router();
router.get("/", (_req, res) => {
	res.render("home", { title: "TdA Academy" });
});
router.get("/courses", async (req, res, next) => {
	try {
		const search = req.query.search?.toString().trim() ?? "";
		const courses = await req.prisma.course.findMany({
			where: search ? { OR: [{ title: {
				contains: search,
				mode: "insensitive"
			} }, { shortDescription: {
				contains: search,
				mode: "insensitive"
			} }] } : void 0,
			orderBy: { createdAt: "desc" }
		});
		res.render("courses", {
			title: "Kurzy",
			courses,
			search
		});
	} catch (error) {
		next(error);
	}
});
router.get("/courses/:id", async (req, res, next) => {
	try {
		const course = await req.prisma.course.findUnique({ where: { id: req.params.id } });
		res.status(course ? 200 : 404).render("course-detail", {
			title: course ? course.title : "Kurz nenalezen",
			course
		});
	} catch (error) {
		next(error);
	}
});
router.route("/login").get((req, res) => {
	res.render("login", {
		title: "Přihlášení",
		error: null
	});
}).post((req, res) => {
	const { username, password } = req.body;
	if (username === USERNAME && password === PASSWORD) {
		req.session.user = { username };
		const redirectTo = req.session.returnTo || "/dashboard";
		delete req.session.returnTo;
		return res.redirect(redirectTo);
	}
	res.status(401).render("login", {
		title: "Přihlášení",
		error: "Neplatné přihlašovací údaje"
	});
});
router.post("/logout", isAuthenticated, (req, res) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
});
router.get("/dashboard", isAuthenticated, async (req, res, next) => {
	try {
		const courses = await req.prisma.course.findMany({ orderBy: { createdAt: "desc" } });
		res.render("dashboard", {
			title: "Dashboard",
			courses
		});
	} catch (error) {
		next(error);
	}
});
router.post("/dashboard", isAuthenticated, async (req, res, next) => {
	try {
		const { title, shortDescription, description } = req.body;
		await req.prisma.course.create({ data: {
			title,
			shortDescription,
			description: description || null
		} });
		res.redirect("/dashboard");
	} catch (error) {
		next(error);
	}
});
router.put("/dashboard/:id", isAuthenticated, async (req, res, next) => {
	try {
		const { title, shortDescription, description } = req.body;
		await req.prisma.course.update({
			where: { id: req.params.id },
			data: {
				title,
				shortDescription,
				description: description || null
			}
		});
		res.redirect("/dashboard");
	} catch (error) {
		next(error);
	}
});
router.delete("/dashboard/:id", isAuthenticated, async (req, res, next) => {
	try {
		await req.prisma.course.delete({ where: { id: req.params.id } });
		res.redirect("/dashboard");
	} catch (error) {
		next(error);
	}
});
var pages_default = router;

//#endregion
//#region src/index.ts
const prisma = new PrismaClient();
const app = express();
const ROOT_DIR = process.cwd();
const port = Number(process.env.PORT) || 3e3;
app.set("view engine", "ejs");
app.set("views", path.join(ROOT_DIR, "src", "views"));
app.use(express.static(path.join(ROOT_DIR, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(session({
	secret: process.env.SESSION_SECRET || "tda26-session",
	resave: false,
	saveUninitialized: false,
	cookie: { sameSite: "lax" }
}));
app.use((req, res, next) => {
	req.prisma = prisma;
	res.locals.user = req.session.user ?? null;
	next();
});
app.use(pages_default);
app.use("/api", api_default);
app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).render("error", {
		title: "Chyba",
		message: "Něco se pokazilo."
	});
});
app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});

//#endregion
export {  };
import { Router } from "express";

const apiRouter = Router();

const emptyCollections = () => ({
  materials: [] as unknown[],
  quizzes: [] as unknown[],
  feed: [] as unknown[],
});

type DbCourse = {
  id: string;
  title: string;
  shortDescription: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function summarizeDescription(description: string | null, fallback: string) {
  const base = description?.trim() || fallback.trim();
  if (base.length <= 140) return base;
  return `${base.slice(0, 137)}...`;
}

function toApiCourse(course: DbCourse) {
  return {
    uuid: course.id,
    name: course.title,
    description: course.description ?? "",
    shortDescription: course.shortDescription,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    ...emptyCollections(),
  };
}

apiRouter.get("/", (_req, res) => {
  res.json({ organization: "Student Cyber Games" });
});

apiRouter.get("/courses", async (req, res, next) => {
  try {
    const courses = await req.prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(courses.map(toApiCourse));
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/courses/:id", async (req, res, next) => {
  try {
    const course = await req.prisma.course.findUnique({
      where: { id: req.params.id },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(toApiCourse(course));
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/courses", async (req, res, next) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const description =
      typeof req.body?.description === "string" ? req.body.description.trim() : "";

    if (!name) {
      return res.status(400).json({ error: "Field 'name' is required" });
    }

    const created = await req.prisma.course.create({
      data: {
        title: name,
        shortDescription: summarizeDescription(description || null, name),
        description: description || null,
      },
    });
    res.status(201).json(toApiCourse(created));
  } catch (error) {
    next(error);
  }
});

apiRouter.put("/courses/:id", async (req, res, next) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
    const description =
      typeof req.body?.description === "string" ? req.body.description.trim() : undefined;

    if (!name && description === undefined) {
      return res.status(400).json({ error: "Provide 'name' and/or 'description'" });
    }

    const updated = await req.prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...(name ? { title: name } : {}),
        ...(description !== undefined
          ? {
              description: description || null,
              shortDescription: summarizeDescription(description || null, name ?? ""),
            }
          : {}),
      },
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

export default apiRouter;

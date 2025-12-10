import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";

const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({ organization: "Student Cyber Games" });
});

apiRouter.get("/courses", async (req, res, next) => {
  try {
    const courses = await req.prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(courses);
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

    res.json(course);
  } catch (error) {
    next(error);
  }
});

apiRouter.post("/courses", isAuthenticated, async (req, res, next) => {
  try {
    const newCourse = await req.prisma.course.create({
      data: req.body,
    });
    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
});

apiRouter.put("/courses/:id", isAuthenticated, async (req, res, next) => {
  try {
    const updated = await req.prisma.course.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

apiRouter.delete("/courses/:id", isAuthenticated, async (req, res, next) => {
  try {
    await req.prisma.course.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default apiRouter;

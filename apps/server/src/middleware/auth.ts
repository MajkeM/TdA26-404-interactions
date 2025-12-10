import type { Request, Response, NextFunction } from "express";
import "express-session";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    return next();
  }

  req.session.returnTo = req.originalUrl;
  return res.redirect("/login");
}

import path from "path";
import moduleAlias from "module-alias";

const projectRoot = process.cwd();

const basePath =
  process.env.NODE_ENV === "production"
    ? path.join(projectRoot, "dist")
    : path.join(projectRoot, "src");

moduleAlias.addAlias("@", basePath);

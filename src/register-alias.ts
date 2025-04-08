import path from "path";
import moduleAlias from "module-alias";

import { ENV, isProduction } from "@/config/env.config";

const projectRoot = process.cwd();

const basePath = isProduction
  ? path.join(projectRoot, "dist")
  : path.join(projectRoot, "src");

moduleAlias.addAlias("@", basePath);

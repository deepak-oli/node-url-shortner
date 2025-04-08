import "@/register-alias";

import app from "@/server";
import { ENV } from "@/config/env.config";

app.listen(ENV.PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${ENV.PORT}`);
});

import { createServer } from "http";
import handler from "./api/index";

createServer(handler).listen(3000, () => {
  console.log("Vercel-style handler on http://localhost:3000");
});

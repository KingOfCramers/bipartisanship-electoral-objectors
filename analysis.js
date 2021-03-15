import fs from "fs";
import { resolve } from "path";

const res = fs.readFileSync(
  resolve(__dirname, "bipartisanHOUSE.json"),
  "utf-8"
);

console.log(res);

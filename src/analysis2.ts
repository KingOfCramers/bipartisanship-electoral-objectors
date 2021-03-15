import fs from "fs";
import { resolve } from "path";
//import util from "util";

const chamber = "house";

const res = fs.readFileSync(
  resolve(__dirname, "..", `bipartisan${chamber}.json`),
  "utf-8"
);

const o = JSON.parse(res);

const dd = o.filter((x: any) =>
  x.cosponsors.find((val: any) => val.match(/Axne/gi))
);
console.log(dd);

import fs from "fs";
import { resolve } from "path";
import util from "util";

// I got tired of typing all my data munging lol

const chamber = "SENATE";

const writer = util.promisify(fs.writeFile);

const res = fs.readFileSync(
  resolve(__dirname, "..", `bipartisan${chamber}.json`),
  "utf-8"
);

let parsed = JSON.parse(res);
parsed = parsed.map((law: any) => ({
  ...law,
  cosponsors: law.cosponsors.map((cosponsor: string) =>
    cosponsor.replace("*", "")
  ),
}));

const nonUniquedems = parsed.reduce((agg: string[], law: any) => {
  const d = law.cosponsors.filter((cosponsor: string) =>
    cosponsor.match(/\[D-/g)
  );
  agg.push(...d);
  return agg;
}, []);

type Dem = {
  name: string;
  laws: any;
};

const dems = nonUniquedems.filter((c: string, index: number) => {
  return nonUniquedems.indexOf(c) === index;
});

dems.forEach((x: any) => {
  console.log(x);
});

const demsWithLaws = dems
  .map((dem: string) => {
    // Take current array of dems...
    console.log(parsed[0]);
    const laws = parsed
      .filter((law: any) => law.cosponsors.includes(dem))
      .map((law: any) => {
        const res = { ...law, cosponsors: law.cosponsors.length };
        return res;
      });
    return { laws: laws, name: dem };
  }, {})
  .sort((a: Dem, b: Dem) => {
    return b.laws.length - a.laws.length;
  });

console.log(demsWithLaws);

const totalPromise = writer(
  `./demsWithLaws${chamber}.json`,
  JSON.stringify(demsWithLaws, null, 2),
  "utf-8"
);

totalPromise
  .then(() => {
    console.log("Done");
    console.log(
      demsWithLaws.map((d: Dem) => ({ dem: d.name, count: d.laws.length }))
    );
  })
  .catch((err: Error) => console.log(err));

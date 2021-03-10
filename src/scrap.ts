import fs from "fs";

async function execute() {
  const res = fs.readFileSync("./bipartisanHouse.json", "utf8");
  const data = JSON.parse(res);

  //let results: string[] = [];
  const bipartisanBills = data.filter((bill: { cosponsors: string[] }) => {
    const demRegex = new RegExp(/D-/, "gi");
    const cosponsorsList = JSON.stringify(bill.cosponsors);
    if (cosponsorsList.match(demRegex)) return true;
    return false;
  });

  const result = bipartisanBills
    .map((bill: { cosponsors: string[] }) => {
      const sponsors = bill.cosponsors;
      const count = sponsors.reduce((agg, sponsor) => {
        const demRegex = new RegExp(/D-/, "gi");
        if (sponsor.match(demRegex)) {
          agg++;
        }
        return agg;
      }, 0);
      return { ...bill, demCount: count };
    })
    .sort((bill: { demCount: number }, bill2: { demCount: number }) => {
      return (bill.demCount - bill2.demCount) * -1;
    });

  fs.writeFileSync(
    "./houseBipartisanBillsSorted.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  );
}

//const res = fs.readFileSync("./bipartisanHouse.json", "utf8");
//const data = JSON.parse(res);

//let results: string[] = [];
//data.forEach((bill: { cosponsors: string[] }) => {
//results.push(...bill.cosponsors);
//});

//results = results.sort().map((x) => x.replace(/\*/g, ""));

//results = results.filter((lawmaker) => {
//const demRegex = new RegExp(/D-/, "gi");
//if (lawmaker.match(demRegex)) return true;
//return false;
//});

//const unique = new Set(results);
//console.log(unique);

//let haveDems = 0;
//let noDems = 0;
////@ts-ignore
//ok.sort((a, b) => {
//if (a.dem - b.dem > 0) return -1;
//return 0;
////if (lawmaker.dem > mostDems.dem) {
////mostDems = lawmaker;
////}
//});

////@ts-ignore
//ok.forEach((lawmaker) => {
//if (lawmaker.dem) {
//haveDems++;
//} else {
//noDems++;
//}
//});

//console.log(haveDems, noDems);

//fs.writeFileSync(
//"./sortedHouseLawmakers.json",
//JSON.stringify(ok, null, 2),
//"utf-8"
//);
//}

execute();

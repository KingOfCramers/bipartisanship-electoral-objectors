import "./config.ts";
import { setupPuppeteer } from "./fetch/puppeteer";
import { Page } from "puppeteer";
import fs from "fs";
import util from "util";
import { senateLawmakers } from "./senateLawmakers";
import { houseLawmakers } from "./houseLawmakers";
import { getLawmakers } from "./getLawmakers";

const writer = util.promisify(fs.writeFile);

export type Lawmaker = {
  first: string;
  last: string;
  state: string;
  billCount: number;
  gop: number;
  indie: number;
  dem: number;
};

type Bill = {
  sponsor: {
    first: string;
    last: string;
  };
  billLink: string;
  title: string;
  cosponsors: string[];
  gop: number;
  dem: number;
  indie: number;
};
const results: Bill[] = [];

const getLawmakerLink = async (
  page: Page,
  last: string,
  first: string
): Promise<string[]> => {
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("tr a"))
      .map((x) => x.getAttribute("href"))
      .filter((x) => x!.includes("sponsorship%22%3A%22sponsored"))
      .map((x) => `https://www.congress.gov`.concat(x || ""));
  });

  const lRegex = new RegExp(last, "gi");
  const fRegex = new RegExp(first, "gi");
  const matchingLawmaker = links.filter(
    (x) => x?.match(lRegex) && x?.match(fRegex)
  );
  if (matchingLawmaker) {
    return [matchingLawmaker[0]];
  } else {
    return [];
  }
};

const extractCosponsors = async (page: Page) => {
  const links = await page.evaluate(() => {
    const cosponsorLinks = document.querySelectorAll(
      "ol > li.expanded span.result-item a:nth-of-type(2)"
    );
    const cosponsorLinksArr = Array.from(cosponsorLinks);
    return cosponsorLinksArr.map(
      (x) => "https://www.congress.gov" + x.getAttribute("href")
    );
  });
  return links;
};

type Chamber = "senate" | "house";
async function execute(chamber: Chamber) {
  const { browser } = await setupPuppeteer(true);
  const page = await browser.newPage();
  const startingLink =
    chamber === "senate"
      ? "https://www.congress.gov/sponsors-cosponsors/117th-congress/senators/ALL"
      : "https://www.congress.gov/sponsors-cosponsors/117th-congress/representatives/ALL";
  const lawmakers = chamber === "senate" ? senateLawmakers : houseLawmakers;
  await page.goto(startingLink);

  for await (const lawmaker of lawmakers) {
    const link = await getLawmakerLink(page, lawmaker.last, lawmaker.first);
    if (link[0]) {
      console.log(`Getting results for ${lawmaker.first} ${lawmaker.last}`);
      const newPage = await browser.newPage();
      await newPage.goto(link[0]);
      const links = await extractCosponsors(newPage);
      for await (const billLink of links) {
        // Get the cosponsors of the bill
        const details = await getLawmakers(billLink, browser);
        if (lawmakers) {
          const res = {
            sponsor: {
              first: lawmaker.first,
              last: lawmaker.last,
            },
            billLink,
            title: details.title,
            cosponsors: details.cosponsors,
            dem: details.dem,
            gop: details.gop,
            indie: details.indie,
          };
          results.push(res);
        }
      }
      await newPage.close();
    }
  }

  // Add the bills to our results JSON objects for bipartisan, partisan and total
  let bipartisanBills: Bill[] = [];
  let partisanBills: Bill[] = [];
  let allBills: Bill[] = [];

  const total = results.reduce(
    (agg, bill) => {
      allBills.push(bill);
      if (bill.dem > 0) {
        bipartisanBills.push(bill);
      } else {
        partisanBills.push(bill);
      }
      agg.dem += bill.dem;
      agg.gop += bill.gop;
      return agg;
    },
    { dem: 0, gop: 0 }
  );

  // Sort the arrays by cosponsorship figures
  bipartisanBills = bipartisanBills.sort(
    (a, b) => b.gop + b.dem - (a.gop + a.dem)
  );
  partisanBills = partisanBills.sort((a, b) => b.gop + b.dem - (a.gop + a.dem));
  allBills = allBills.sort((a, b) => b.gop + b.dem - (a.gop + a.dem));

  // Compile information about each of the lawmakers cosponsorship rate among GOP/DEM
  results.forEach((result) => {
    const last = result.sponsor.last;
    // Find the sponsor
    const sponsor = lawmakers.find(
      (lawmaker) =>
        lawmaker.last === last && lawmaker.first === result.sponsor.first
    );
    if (!sponsor) {
      console.log(`Could not find sponsor for ${result.billLink}`);
      console.log(`Name was ${result.sponsor.first} ${result.sponsor.last}`);
    } else {
      sponsor.billCount++;
      sponsor.dem += result.dem;
      sponsor.gop += result.gop;
    }
  });

  const totalPromise = writer(
    `./total${chamber.toUpperCase()}.json`,
    JSON.stringify(total, null, 2),
    "utf-8"
  );
  const lawmakersPromise = writer(
    `./individualized${chamber.toUpperCase()}`,
    JSON.stringify(lawmakers, null, 2),
    "utf-8"
  );
  const partisanPromise = writer(
    `./partisan${chamber.toUpperCase()}.json`,
    JSON.stringify(partisanBills, null, 2),
    "utf-8"
  );
  const bipartisanPromise = writer(
    `./bipartisan${chamber.toUpperCase()}.json`,
    JSON.stringify(bipartisanBills, null, 2),
    "utf-8"
  );

  Promise.all([
    totalPromise,
    lawmakersPromise,
    partisanPromise,
    bipartisanPromise,
  ])
    .then(() => {
      console.log("DONE WRITING FILES!");
    })
    .catch((err) => {
      console.error("PROBLEM WRITING FILES");
      console.error(err);
    });

  try {
    await browser.close();
  } catch (err) {
    console.log(err);
    console.log("DONE WRITING FILES!");
  }
}

execute("house");

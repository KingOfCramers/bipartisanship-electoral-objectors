type BillDetails = {
  cosponsors: string[];
  gop: number;
  indie: number;
  dem: number;
  title: string;
};

import { Browser } from "puppeteer";
export const getLawmakers = async (
  billLink: string,
  browser: Browser
): Promise<BillDetails> => {
  const page = await browser.newPage();
  await page.goto(billLink);
  const res = await page.evaluate(() => {
    const title = document.querySelector("h1.legDetail")
      ? document.querySelector("h1.legDetail")!.firstChild!.textContent
      : "";
    let dem = 0;
    let gop = 0;
    let indie = 0;
    const cosponsors = Array.from(
      document.querySelectorAll("table.item_table a")
    ).map((x) => x.textContent || "");
    cosponsors.forEach((sponsor) => {
      if (sponsor.match(/\[D-/)) dem++;
      if (sponsor.match(/\[R-/)) gop++;
      if (sponsor.match(/\[I-/)) indie++;
    });

    return { title: title || "Title not found.", cosponsors, gop, dem, indie };
  });
  await page.close();
  return res;
};

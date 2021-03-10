import { Page } from "puppeteer";
import { Lawmaker } from "./index";
export const checkNameValidity = async (
  { first, last, state }: Pick<Lawmaker, "first" | "last" | "state">,
  page: Page
): Promise<boolean> => {
  const url = `https://www.congress.gov/search?searchResultViewType=expanded&q={%22source%22:%22legislation%22,%22congress%22:%22all%22,%22house-sponsor%22:%22${last},+${first}+[R-${state}]%22}`;
  await page.goto(url);
  const exists = await page.evaluate(() => {
    const res = document.querySelector("h2.no-results-error");
    if (res) {
      return false;
    } else {
      return true;
    }
  });
  return exists;
};

import validator from "validator";
import { Page } from "puppeteer";

interface Options {
  kind: "puppeteer";
}

// Given a url, go and get the HTML. Specify either axios or puppeteer
export const getHtml = async (
  url: string,
  options: Options,
  page: Page
): Promise<string> => {
  if (!validator.isURL(url)) {
    throw new Error(`Url "${url}" is not valid`);
  }
  try {
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    return html;
  } catch (err) {
    console.error(err);
    throw new Error(`Puppeteer could not go to ${url}`);
  }
};

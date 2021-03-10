import puppeteer from "puppeteer";

interface BrowserAndPage {
  browser: puppeteer.Browser;
}
// This function sets up a puppeteer browser and returns it
export const setupPuppeteer = async (
  headless: boolean
): Promise<BrowserAndPage> => {
  const args = ["--no-sandbox", "--unlimited-storage"];

  console.log(process.env.NODE_ENV);
  const browser = await puppeteer.launch({
    headless,
    devtools: process.env.NODE_ENV !== "production",
    executablePath: "/usr/local/bin/chromium",
    args,
  });

  return { browser };
};

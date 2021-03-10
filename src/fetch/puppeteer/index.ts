import puppeteer from "puppeteer";

interface BrowserAndPage {
  browser: puppeteer.Browser;
}
// This function sets up a puppeteer browser and returns it
export const setupPuppeteer = async (
  headless: boolean,
  executablePath: string
): Promise<BrowserAndPage> => {
  const args = ["--no-sandbox", "--unlimited-storage"];

  const browser = await puppeteer.launch({
    headless,
    executablePath,
    args,
  });

  return { browser };
};

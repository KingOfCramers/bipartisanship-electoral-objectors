import cheerio from "cheerio";
import { isString } from "./TypeCheckers";
import { unique, limitList } from "./util";

interface GetLinksOpts {
  onlyUnique?: boolean;
  limit?: number;
}

export class Parser {
  root: cheerio.Root;

  // Don't narrow original discriminator upon initialization
  constructor(public html: string, public discriminator: string = "*") {
    this.root = cheerio.load(html);
  }

  discriminate(query: string = "*"): void {
    this.discriminator = query;
  }

  getTexts(query: string, opts: GetLinksOpts): string[] {
    return this.root(`${this.discriminator} ${query}`)
      .toArray()
      .map((x) => cheerio(x).text().trim())
      .filter(limitList(opts.limit));
  }

  getNthText(query: string, instanceOf?: number): string {
    return instanceOf
      ? this.root(query).eq(instanceOf).text().trim()
      : this.root(query).first().text().trim();
  }

  getLinks(opts: GetLinksOpts): string[] {
    const links = this.root(`${this.discriminator} a`)
      .toArray()
      .map((x) => this.root(x).attr("href"))
      .filter((x): x is string => isString(x))
      .filter(limitList(opts.limit));
    return opts.onlyUnique ? unique<string>(links) : links;
  }
}

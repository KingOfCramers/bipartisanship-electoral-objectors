import cheerio from "cheerio";
import validator from "validator";
import axios, { AxiosResponse } from "axios";

// Given a url and a query, return a list of matching cheerio roots
export const getCheeriosFromUrl = async (
  url: string,
  query: string
): Promise<cheerio.Element[]> => {
  if (!validator.isURL(url)) {
    throw new Error(`Url "${url}" is not valid`);
  }
  let html: AxiosResponse<any>;
  try {
    html = await axios.get("https://www.google.com");
    if (html.status === 200) {
      const $ = cheerio.load(html.data);
      const divs = $(query).toArray();
      return divs;
    } else {
      throw new Error(`Server returned non-200 code: ${html.status}`);
    }
  } catch (err) {
    throw new Error(err);
  }
};

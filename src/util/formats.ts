import formats from "virtual:formats";
import { SearchSelectedOption } from "@/types/searchSelectedOption";

// The list is built at build time by the formats plugin in vite.config.mjs
export const possibleFormats: SearchSelectedOption[] = formats.map((format) => {
  return {
    i: format.id,
    l: false,
    n: format.name,
  };
});

import { Formats } from "@pkmn/sim/build/cjs/config/formats.js";
import type { FormatData } from "@pkmn/sim";
import { SearchSelectedOption } from "@/types/searchSelectedOption";

function createTierDefinition(input: string) {
  // Remove any non-alphanumeric characters using regex
  let sanitized = input.replace(/[^a-z0-9]/gi, "");

  // Convert the sanitized string to lowercase
  sanitized = sanitized.toLowerCase();

  return sanitized;
}

export const possibleFormats: SearchSelectedOption[] = Formats.map(
  (format: FormatData) => {
    const tierDefinition = createTierDefinition(format.name);
    return {
      i: tierDefinition,
      l: false,
      n: format.name,
    };
  }
);

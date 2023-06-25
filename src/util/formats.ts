import { Dex, type Format } from "@pkmn/sim";
import { SearchSelectedOption } from "@/types/searchSelectedOption";

export const possibleFormats: SearchSelectedOption[] = Dex.formats
  .all()
  .map((format: Format) => {
    return {
      i: format.id,
      l: false,
      n: format.fullname,
    };
  });

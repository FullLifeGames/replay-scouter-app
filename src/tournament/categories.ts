/** The colour class of a Category's pill; the list of Categories itself comes from the data. */
export const categoryClass = (category: string) => {
  const name = category.toLowerCase();
  if (name.startsWith("official")) {
    return "official";
  }
  if (name.startsWith("team")) {
    return "team";
  }
  return name.startsWith("ladder") ? "ladder" : "";
};

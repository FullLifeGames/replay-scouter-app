export const validURL = (testUrl: string) => {
  const result = testUrl.match(
    /(http(s)?:\/\/.)?(www\.)?[\w#%+.:=@~-]{2,256}\.[a-z]{2,6}\b([\w#%&+./:=?@~-]*)/g,
  );
  return result !== null;
};

export const filterSearchValue = (searchValue: string) => {
  if (validURL(searchValue)) {
    searchValue = searchValue.slice(
      Math.max(0, searchValue.lastIndexOf(".") + 1),
    );
    searchValue = searchValue.slice(0, Math.max(0, searchValue.indexOf("/")));
  }
  return searchValue;
};

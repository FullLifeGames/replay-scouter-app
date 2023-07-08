// from https://gist.github.com/kiennt2/c9a489369562c424c793b8883b98802e

const replacePattern1 =
  /(\b(https?|ftp):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim;
const replacePattern2 = /(^|[^/])(www\.[\S]+(\b|$))/gim;
const replacePattern3 =
  /(([a-zA-Z0-9_\-.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim;

export function linkify(inputText: string): string {
  // URLs starting with http://, https://, or ftp://
  let replacedText = inputText.replace(
    replacePattern1,
    '<a href="$1" target="_blank">$1</a>',
  );

  // URLs starting with www. (without // before it, or it'd re-link the ones done above)
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a href="http://$2" target="_blank">$2</a>',
  );

  // Change email addresses to mailto:: links
  replacedText = replacedText.replace(
    replacePattern3,
    '<a href="mailto:$1">$1</a>',
  );

  return replacedText;
}

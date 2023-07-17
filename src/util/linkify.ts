// from https://gist.github.com/kiennt2/c9a489369562c424c793b8883b98802e

const replacePattern1 =
  /(\b(https?|ftp):\/\/[\w!#%&+,./:;=?@|~-]*[\w#%&+/=@|~-])/gim;
const replacePattern2 = /(^|[^/])(www\.\S+(\b|$))/gim;
const replacePattern3 = /(([\w.-]+)@[_a-z]+?\.[a-z]{2,6})+/gim;

export function linkify(inputText: string): string {
  // URLs starting with http://, https://, or ftp://
  let replacedText = inputText.replaceAll(
    replacePattern1,
    '<a href="$1" target="_blank">$1</a>',
  );

  // URLs starting with www. (without // before it, or it'd re-link the ones done above)
  replacedText = replacedText.replaceAll(
    replacePattern2,
    '$1<a href="http://$2" target="_blank">$2</a>',
  );

  // Change email addresses to mailto:: links
  replacedText = replacedText.replaceAll(
    replacePattern3,
    '<a href="mailto:$1">$1</a>',
  );

  return replacedText;
}

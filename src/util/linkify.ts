// from https://gist.github.com/kiennt2/c9a489369562c424c793b8883b98802e

import { getAnalyzeLink, isShowdownReplay } from "@/util/dashboardHelper";

// Bootstrap Icons "box-arrow-up-right"
const externalLinkIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: -0.125em"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/></svg>';

const replacePattern1 =
  /(\b(https?|ftp):\/\/[\w!#%&+,./:;=?@|~-]*[\w#%&+/=@|~-])/gim;
const replacePattern2 = /(^|[^/])(www\.\S+(\b|$))/gim;
const replacePattern3 = /(([\w.-]+)@[_a-z]+?\.[a-z]{2,6})+/gim;

export function linkify(
  inputText: string,
  { analyzeReplays = false }: { analyzeReplays?: boolean } = {},
): string {
  // URLs starting with http://, https://, or ftp://
  let replacedText = inputText.replaceAll(replacePattern1, (url: string) => {
    const link = `<a href="${url}" target="_blank">${url}</a>`;
    if (analyzeReplays && isShowdownReplay(url)) {
      return `${link} <a href="${getAnalyzeLink(url)}" target="_blank">Analyze ${externalLinkIcon}</a>`;
    }
    return link;
  });

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

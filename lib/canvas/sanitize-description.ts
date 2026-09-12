import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Canvas retorna `description` com links/imagens em caminhos relativos
 * (ex: "/courses/123/files/456/download"). Sem reescrever para absoluto contra
 * o baseUrl da instituição, esses links resolvem contra o nosso próprio domínio
 * e voltam 404.
 */
function absolutizeUrl(url: string | undefined, baseUrl: string): string {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("mailto:")) {
    return url.startsWith("//") ? `https:${url}` : url;
  }
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return url;
}

/** Sanitiza o HTML de uma atividade do Canvas e reescreve URLs relativas para o baseUrl da instituição. */
export function sanitizeAssignmentDescription(html: string, baseUrl: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "figure", "figcaption"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "data", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          href: absolutizeUrl(attribs.href, baseUrl),
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          src: absolutizeUrl(attribs.src, baseUrl),
        },
      }),
    },
  });
}

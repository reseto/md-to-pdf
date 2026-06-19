import hljs from 'highlight.js';
import { marked, Renderer } from 'marked';

const WARN_RE = /⚠|warning|caution|danger|attention/i;

const unescapeHtml = (html: string) =>
	html
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");

export const getMarked = (options: marked.MarkedOptions, extensions: marked.MarkedExtension[]) => {
	const renderer = (options.renderer as Renderer | undefined) ?? new Renderer();

	if (!Object.prototype.hasOwnProperty.call(renderer, 'code')) {
		renderer.code = (code, language) => {
			if (language && /\bmermaid\b/i.test(language)) {
				// parse optional height attribute from info string, e.g. ```mermaid height=120mm
				const heightMatch = language.match(/height=([\d.]+(?:mm|cm|%|px))/i);
				const heightStyle = heightMatch ? ` style="max-height:${heightMatch[1]};width:auto;"` : '';
				return `<div class="mermaid"${heightStyle}>${unescapeHtml(code)}</div>`;
			}

			const lang = hljs.getLanguage(language ?? '') ? (language as string) : 'plaintext';
			return `<pre><code class="hljs ${lang}">${hljs.highlight(code, { language: lang }).value}</code></pre>`;
		};
	}

	if (!Object.prototype.hasOwnProperty.call(renderer, 'blockquote')) {
		renderer.blockquote = (quote) => {
			const cls = WARN_RE.test(quote) ? ' class="callout-warning"' : '';
			return `<blockquote${cls}>${quote}</blockquote>\n`;
		};
	}

	marked.setOptions({
		renderer,
		highlight(code, languageName) {
			const language = hljs.getLanguage(languageName) ? languageName : 'plaintext';

			return hljs.highlight(code, { language }).value;
		},
		langPrefix: 'hljs ',
		...options,
	});
	marked.use(...extensions);
	return marked;
};

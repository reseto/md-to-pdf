import hljs from 'highlight.js';
import { marked, Renderer } from 'marked';

export const getMarked = (options: marked.MarkedOptions, extensions: marked.MarkedExtension[]) => {
	const renderer = (options.renderer as Renderer | undefined) ?? new Renderer();

	if (!Object.prototype.hasOwnProperty.call(renderer, 'code')) {
		renderer.code = (code, language) => {
			if (language && /\bmermaid\b/i.test(language)) {
				return `<div class="mermaid">${code}</div>`;
			}

			const lang = hljs.getLanguage(language ?? '') ? (language as string) : 'plaintext';
			return `<pre><code class="hljs ${lang}">${hljs.highlight(code, { language: lang }).value}</code></pre>`;
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

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

export type HeadingEntry = { level: number; text: string; id: string };

const slugify = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');

export const getMarked = (options: marked.MarkedOptions, extensions: marked.MarkedExtension[]) => {
	const collectedHeadings: HeadingEntry[] = [];
	const slugCount = new Map<string, number>();

	const renderer = (options.renderer as Renderer | undefined) ?? new Renderer();

	if (!Object.prototype.hasOwnProperty.call(renderer, 'code')) {
		renderer.code = (code, language) => {
			if (language && /\bmermaid\b/i.test(language)) {
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

	if (!Object.prototype.hasOwnProperty.call(renderer, 'heading')) {
		renderer.heading = (text, level, raw) => {
			if (level === 2 || level === 3) {
				const base = slugify(raw.replace(/<[^>]+>/g, ''));
				const count = slugCount.get(base) ?? 0;
				slugCount.set(base, count + 1);
				const id = count === 0 ? base : `${base}-${count}`;
				collectedHeadings.push({ level, text: text.replace(/<[^>]+>/g, ''), id });
				return `<h${level} id="${id}">${text}</h${level}>\n`;
			}

			return `<h${level}>${text}</h${level}>\n`;
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

	const parse = (md: string) => {
		collectedHeadings.length = 0;
		slugCount.clear();
		return marked(md);
	};

	return { parse, headings: collectedHeadings };
};

import { type Config } from './config';
import { getMarked } from './get-marked-with-highlighter';

const mermaidScript = `<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
	<script>mermaid.initialize({ startOnLoad: true });</script>`;

const slugify = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');

/**
 * Extracts h2/h3 headings from rendered HTML and builds a TOC.
 * Injects id anchors into the headings and returns [toc, body].
 * Returns ['', body] when fewer than 4 headings found.
 */
const buildToc = (html: string): [string, string] => {
	const headingRe = /<(h[23])>(.*?)<\/h[23]>/gi;
	const entries: Array<{ level: string; text: string; slug: string }> = [];
	const slugCount = new Map<string, number>();

	// collect headings
	let match: RegExpExecArray | null;
	while ((match = headingRe.exec(html)) !== null) {
		const text = (match[2] ?? '').replace(/<[^>]+>/g, ''); // strip inner tags
		const base = slugify(text);
		const count = slugCount.get(base) ?? 0;
		slugCount.set(base, count + 1);
		const slug = count === 0 ? base : `${base}-${count}`;
		entries.push({ level: match[1] ?? 'h2', text, slug });
	}

	if (entries.length < 4) return ['', html];

	// inject id attributes into headings
	const slugIdx = new Map<string, number>();
	const patched = html.replace(/<(h[23])>(.*?)<\/h[23]>/gi, (_, tag, inner) => {
		const text = inner.replace(/<[^>]+>/g, '');
		const base = slugify(text);
		const count = slugIdx.get(base) ?? 0;
		slugIdx.set(base, count + 1);
		const slug = count === 0 ? base : `${base}-${count}`;
		return `<${tag} id="${slug}">${inner}</${tag}>`;
	});

	const items = entries
		.map(({ level, text, slug }) => {
			const indent = level === 'h3' ? ' style="margin-left:1.5em"' : '';
			return `<li${indent}><a href="#${slug}">${text}</a></li>`;
		})
		.join('\n');

	const toc = `<nav class="toc"><h2 class="toc-title">Contents</h2><ul>${items}</ul></nav>`;
	return [toc, patched];
};

/**
 * Generates a HTML document from a markdown string and returns it as a string.
 */
export const getHtml = (md: string, config: Config) => {
	const raw = getMarked(config.marked_options, config.marked_extensions)(md);
	const [toc, body] = buildToc(raw);
	const hasMermaid = body.includes('<div class="mermaid">');

	return `<!DOCTYPE html>
<html>
	<head><title>${config.document_title}</title><meta charset="utf-8">${hasMermaid ? '\n\t' + mermaidScript : ''}</head>
	<body class="${config.body_class.join(' ')}">
		${toc}${body}
	</body>
</html>
`;
};

import { type Config } from './config';
import { type HeadingEntry, getMarked } from './get-marked-with-highlighter';

const mermaidScript = `<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
	<script>mermaid.initialize({ startOnLoad: true });</script>`;

const buildFontStyle = (value: string, selector: string): string => {
	const semicolon = value.indexOf(';');
	const hasImport = semicolon !== -1 && value.trimStart().startsWith('@');
	const importLine = hasImport ? value.slice(0, semicolon + 1).trim() : '';
	const familyValue = hasImport ? value.slice(semicolon + 1).trim() : value.trim();
	return `<style>${importLine} ${selector} { font-family: ${familyValue}; }</style>`;
};

/**
 * Builds a TOC nav from headings collected during the render pass.
 * showToc: true=always, false=never, undefined=auto (≥4 headings).
 */
const buildToc = (headings: HeadingEntry[], showToc?: boolean): string => {
	if (showToc === false || (showToc === undefined && headings.length < 4)) return '';

	const items = headings
		.map(({ level, text, id }) => {
			const indent = level === 3 ? ' style="margin-left:1.5em"' : '';
			return `<li${indent}><a href="#${id}">${text}</a></li>`;
		})
		.join('\n');

	return `<nav class="toc"><h2 class="toc-title">Contents</h2><ul>${items}</ul></nav>`;
};

/**
 * Generates a HTML document from a markdown string and returns it as a string.
 */
export const getHtml = (md: string, config: Config) => {
	const { parse, headings } = getMarked(config.marked_options, config.marked_extensions);
	const body = parse(md);
	const tocHtml = buildToc(headings, config.toc);
	const hasMermaid = body.includes('<div class="mermaid">');

	let fontStyle = '';
	if (config.font_family) {
		fontStyle += buildFontStyle(config.font_family, 'body');
	}
	if (config.code_font_family) {
		fontStyle += buildFontStyle(config.code_font_family, 'pre, code, pre code');
	}

	return `<!DOCTYPE html>
<html>
	<head><title>${config.document_title}</title><meta charset="utf-8">${hasMermaid ? '\n\t' + mermaidScript : ''}${fontStyle ? '\n\t' + fontStyle : ''}</head>
	<body class="${config.body_class.join(' ')}">
		${tocHtml}${body}
	</body>
</html>
`;
};

import { type Config } from './config';
import { getMarked } from './get-marked-with-highlighter';

const mermaidScript = `<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
	<script>mermaid.initialize({ startOnLoad: true });</script>`;

/**
 * Generates a HTML document from a markdown string and returns it as a string.
 */
export const getHtml = (md: string, config: Config) => {
	const body = getMarked(config.marked_options, config.marked_extensions)(md);
	const hasMermaid = body.includes('<div class="mermaid">');

	return `<!DOCTYPE html>
<html>
	<head><title>${config.document_title}</title><meta charset="utf-8">${hasMermaid ? '\n\t' + mermaidScript : ''}</head>
	<body class="${config.body_class.join(' ')}">
		${body}
	</body>
</html>
`;
};

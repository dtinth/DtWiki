/*
 * DtWiki by Thai Pangsakulyanont
 * https://github.com/dtinth/DtWiki
 *
 * A plugin that process texts in [markdown]: mode with Markdown.
 * MIT Licensed. See http://www.opensource.org/licenses/mit-license.php
 */

DtWiki.loadScriptSync('js/plugin/markdown/lib/Markdown.Converter.js');

DtWiki.hook('converter:markdown', DtWiki.linkifyHook());

DtWiki.hook('converter:markdown', function(callback) {
	var converter = new Markdown.Converter();
	this.html = converter.makeHtml(this.text).replace(/>\s*((?:[\.#][a-z0-9\-_]+)+):/g, function(all, data) {
		var id = '';
		var classes = [];
		data.replace(/([\.#])([a-z0-9\-_]+)/g, function(a, t, v) {
			if (t == '#') id = ' id="' + v + '"';
			else classes.push(v);
		});
		return id + ' class="' + classes.join(' ') + '">';
	});
	callback(null);
});

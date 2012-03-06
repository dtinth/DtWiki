/*
 * DtWiki by Thai Pangsakulyanont
 * https://github.com/dtinth/DtWiki
 *
 * A plugin that allows JavaScript to be executed.
 * MIT Licensed. See http://www.opensource.org/licenses/mit-license.php
 */ 

DtWiki.js_scripts = [];

DtWiki.hook('converter:js', function(callback) {
	DtWiki.js_scripts.push(this.text);
	this.html = '';
	callback(null);
});

DtWiki.hook('contentReady', function(next) {
	while (DtWiki.js_scripts.length > 0) {
		var script = DtWiki.js_scripts.shift();
		var sc = document.createElement('script');
		sc.type = 'text/javascript';
		sc.innerHTML = script;
		document.body.appendChild(sc);
	}
	next(null);
}, 90);


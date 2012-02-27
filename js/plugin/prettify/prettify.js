/*
 * DtWiki by Thai Pangsakulyanont
 * https://github.com/dtinth/DtWiki
 *
 * A plugin that uses Google's prettify to prettify the code.
 * MIT Licensed. See http://www.opensource.org/licenses/mit-license.php
 */ 

DtWiki.loadScriptSync('js/plugin/prettify/lib/prettify.js');

DtWiki.prettyPrintLanguage = DtWiki.prettyPrintLanguage || 'java';

DtWiki.hook('contentReady', function(next) {

	// prettify
	$('#km-content').find('pre, code').each(function() {
		var x = this;
		for (var c = x; c; c = c.parentNode)
			if (c.className == 'noprettyprint')
				return;
		x.className = 'prettyprint' + (DtWiki.prettyPrintLanguage ? ' lang-' + DtWiki.prettyPrintLanguage : '');
	});
	prettyPrint(function() {
		next();
	});

}, 10);


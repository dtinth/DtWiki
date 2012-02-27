/*
 * DtWiki by Thai Pangsakulyanont
 * https://github.com/dtinth/DtWiki
 *
 * The content loader that loads, processes and displays the page.
 * MIT Licensed. See http://www.opensource.org/licenses/mit-license.php
 */

// when all scripts are loaded, load page from url and display
DtWiki.hook('load', function(next) {
	var m = location.search.match(/^\??(.+)/);
	if (m) {
		var url = m[1];
		DtWiki.loadPage(url.replace(/\+/g, '%20'));
	} else {
		DtWiki.displayError('No text file specified.');
	}
	next();
}, 0);

DtWiki.linkifySuffix = DtWiki.linkifySuffix || '.txt';

DtWiki.linkifyHook = function() {
	function url(x) {
		if (!x.match(/\.\w+$/)) {
			return '?' + new URI(x + DtWiki.linkifySuffix).resolve(DtWiki.baseURI);
		} else {
			return new URI(x).resolve(DtWiki.baseURI);
		}
	}
	return function(next) {
		this.text = this.text.replace(/\[\[(.*?\|)?([\s\S]*?)\]\]/g, function(a, b, c) {
			return '<a href="' + url(b == null || b == '' ? c : b.substr(0, b.length - 1)) + '">' + c + '</a>';
		});
		next();
	};
};

/**
 * Loads a page from a URL
 * @param url the url
 */
DtWiki.loadPage = function(url) {
	var loaded = false;
	$('#km-content .km-loading').html('Loading...');
	$.ajax(url, {
		success: function(data) {
			if (loaded) return;
			loaded = true;
			DtWiki.baseURI = new URI(url);
			DtWiki.processText(data, function(err, html) {
				DtWiki.display(data, html);
			});
		},
		dataType: 'text',
		mimeType: 'text/plain; charset=utf-8'
	}).error(function() {
		DtWiki.displayError('Error loading data.');
	});
};

/**
 * Displays a page
 * @param text the text
 * @param html the html
 */
DtWiki.display = function(text, html) {
	this.runHook('display', { text: text, html: html });
};

/**
 * Displays an error page
 * @param message the message
 */
DtWiki.displayError = function(message) {
	document.title = 'Error!';
	$('#km-content').html('<h1>Error!</h1><p class="center">' + message + '</p>');
};

// set the page HTML
DtWiki.hook('display', function(next) {
	$('#km-content').html(this.html);
	document.title = $('#km-content h1').text();
	next();
});

// run the contentReady hook
DtWiki.hook('display', function(next) {
	DtWiki.runHook('contentReady', {});
	next();
}, 1000);

DtWiki.defaultMode = DtWiki.defaultMode || 'html';

// split text into chunks and process each of them through a converter
DtWiki.hook('text', function(next) {

	var text = this.text;
	var chunks = [];

	// convert text into chunks.
	// each chunk is specified by a format type.
	(function() {

		function Chunk(type) {
			this.type = type;
			this.data = '';
		}
		Chunk.prototype.add = function(text) {
			this.data += text;
		};

		var chunk = new Chunk(DtWiki.defaultMode);
		var lines = text.replace(/\r\n|\r/g, '\n').split('\n'), m;
		for (var i = 0; i < lines.length; i ++) {
			if ((m = lines[i].match(/^\[(\w+)\]:$/))) {
				if (chunk != null) {
					chunks.push(chunk);
				}
				chunk = new Chunk(m[1]);
			} else {
				if (chunk != null) {
					chunk.add(lines[i] + '\n');
				}
			}
		}

		if (chunk != null) {
			chunks.push(chunk);
			chunk = null;
		}

	})();

	var converted = 0;
	function convertChunk(index) {
		var chunk = chunks[index];
		var hookName = 'converter:' + chunk.type;
		if (DtWiki.hasHook(hookName)) {
			DtWiki.runHook(hookName, { text: chunk.data }, cb);
		} else {
			cb(new Error('cannot find converter: ' + chunk.type));
		}
		function cb(err) {
			if (err) {
				chunks[index] = '<div class="km-error">' + err + '</div>';
			} else {
				chunks[index] = this.html;
			}
			converted ++;
			if (converted == chunks.length) {
				finish();
			}
		}
	}
	
	var that = this;

	function finish() {
		that.html = chunks.join('\n');
		next();
	}
	
	(function() {
		for (var i = 0; i < chunks.length; i ++) {
			convertChunk(i);
		}
	})();

});

/**
 * Process the text and gives the HTML.
 * @param data the text to process
 * @param callback the callback function that receives 2 arguments, "error" and "html"
 */
DtWiki.processText = function(data, callback) {
	DtWiki.runHook('text', { text: data }, function(err) {
		callback(err, this.html);
	});
};

// ------few default converters------

// the HTML converter
DtWiki.hook('converter:html', function(callback) {
	this.html = this.text;
	callback(null);
});

// the CSS converter
DtWiki.hook('converter:css', function(callback) {
	this.html = '<style>' + this.text + '</style>';
	callback(null);
});

requirejs.config({
	shim: {
		d3: {
			exports: 'd3'
		}
	}
});

require(["playqueue"], function (playqueue) {
});
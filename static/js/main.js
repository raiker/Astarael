requirejs.config({
	baseUrl: '/static/js/app',
	paths: {
		lib: '/static/js/lib',
	},
	shim: {
		'd3': {
			exports: 'd3'
		},
		'crossfilter': {
			exports: 'crossfilter'
		}
	}
});

require(["playqueue", "libraryview", "settings"], function (playqueue, libraryview, settings) {
});
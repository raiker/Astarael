define(['librarydata', 'lib/d3'], function (librarydata, $$dummy1) {
	//called whenever tracks are added to the library
	librarydata.onUpdate.add(function () {
		var artists = librarydata.album_artists.keys().sort();

		var container = d3.select("div#artistview");

		var tiles = container.selectAll("div")
			.data(artists)
			.enter()
			.append("div")
				.classed("tile", true);

		tiles.append("div")
			.classed("title", true)
			.text(function (d) { return d; });

		tiles.append("div")
			.classed("detail", true)
			.text(function (d) { return "Album count: " + librarydata.album_artists.get(d).album_count; });
		tiles.append("div")
			.classed("detail", true)
			.text(function (d) { return "Track count: " + librarydata.album_artists.get(d).track_count; });
	});
});
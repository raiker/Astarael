define(['librarydata', 'playqueue', 'lib/d3', 'lib/jquery'], function (librarydata, playqueue, $$dummy1, $$dummy2) {
	//called whenever tracks are added to the library
	librarydata.onUpdate.add(function () {
		DrawArtistView();
		ShowArtistView();
	});

	window.onpopstate = function (event) {
		if (event.state == null) {
			//we're displaying the artist listing
			//DrawArtistView();
			ShowArtistView();
		} else {
			switch (event.state.view) {
				case "artist":
					var artist_name = event.state.artist;
					DrawAlbumView(artist_name);
					ShowAlbumView();
					break;
				case "album":
					var artist_name = event.state.artist;
					var album_name = event.state.album;
					DrawTrackView(artist_name, album_name);
					ShowTrackView();
					break;
			}
		}
	};

	function DrawArtistView() {
		var artists = librarydata.album_artists.keys().sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});

		var container = d3.select("div#artistview");

		tiles.selectAll("div").remove(); //hack

		var tiles = container.selectAll("div")
			.data(artists)
			.enter()
			.append("div")
				.classed("tile", true)
				.on("click", function (artist_name, i) {
					DrawAlbumView(artist_name);
					history.pushState({
						view: "artist",
						artist: artist_name
					}, artist_name, "/artist/" + artist_name + "/");
					ShowAlbumView();
				});

		tiles.append("div")
			.classed("title", true)
			.text(function (d) { return d; });

		tiles.append("div")
			.classed("detail", true)
			.text(function (d) { return "Album count: " + librarydata.album_artists.get(d).album_count; });
		tiles.append("div")
			.classed("detail", true)
			.text(function (d) { return "Track count: " + librarydata.album_artists.get(d).track_count; });
	}

	function DrawAlbumView(artist_name) {
		var artist = librarydata.album_artists.get(artist_name);

		//sort by year
		var albums = artist.albums.keys().sort(function (a, b) {
			var album_a = artist.albums.get(a);
			var album_b = artist.albums.get(b);

			var date_a = album_a.date;
			var date_b = album_b.date;
			
			if (date_a < date_b) {
				return -1;
			} else if (date_a > date_b) {
				return 1;
			} else {
				return 0;
			}
		});

		var container = d3.select("div#albumview");

		container.selectAll("div").remove(); //hack

		var tiles = container.selectAll("div")
			.data(albums.map(function (album_name) {
				return { name: album_name, details: artist.albums.get(album_name) };
			}))
			.enter()
			.append("div")
				.classed("tile", true)
				.on("click", function (album, i) {
					DrawTrackView(artist_name, album.name);
					history.pushState({
						view: "album",
						artist: artist_name,
						album: album.name
					}, artist_name + " - " + album.name, "/artist/" + artist_name + "/album/" + album.name + "/");
					ShowTrackView();
				});

		//album art
		tiles.append("img")
			.attr("src", function (album, i) {
				var hash = album.details.album_art;
				if (hash) {
					return "/api/image/" + hash;
				} else {
					return "/static/img/noalbumart.jpg";
				}
			});

		tiles.append("div")
			.classed("title", true)
			.text(function (album) { return album.name + " (" + album.details.year + ")"; });

		tiles.append("div")
			.classed("detail", true)
			.text(function (album) { return "Disc count: " + album.details.disc_count; });
		tiles.append("div")
			.classed("detail", true)
			.text(function (album) { return "Track count: " + album.details.track_count; });
	}

	function DrawTrackView(artist_name, album_name) {
		var artist = librarydata.album_artists.get(artist_name);
		var album = artist.albums.get(album_name);

		var discs = album.discs.keys().sort();

		//set album art
		var albumart_img = d3.select("img#trackview_albumart");
		if (album.album_art) {
			albumart_img.attr("src", "/api/image/" + album.album_art);
		} else {
			albumart_img.attr("src", "/static/img/noalbumart.jpg");
		}

		//set title
		d3.select("div#trackview_title").text(album_name);

		var container = d3.select("div#trackview_discs");

		var disc_divs = container.selectAll("div")
			.data(discs)
			.enter()
			.append("div")
			.classed("trackview_disc", true);

		disc_divs.append("div")
			.classed("trackview_discheader", true)
			.text(function (d, i) { return "Disc " + d; });

		var track_rows = disc_divs.selectAll("div.trackentry")
			.data(function (d) {
				var disc = album.discs.get(d);
				var tracks = disc.tracks.map(function (track_id) {
					return { key: track_id, value: librarydata.tracks[track_id] };
				});
				return tracks.sort(function (a, b) {
					return a.value.track - b.value.track;
				});
			})
			.enter()
			.append("div")
			.classed("trackentry", true)
			.on("click", function (track, i) {
				playqueue.replaceQueueAndPlay(track.key);
			})
			.text(function (d, i) {
				return d.value.title;
			});
	}

	function ShowArtistView() {
		$("div#mainview>div").addClass("invisible");
		$("div#artistview").removeClass("invisible");
	}

	function ShowAlbumView() {
		$("div#mainview>div").addClass("invisible");
		$("div#albumview").removeClass("invisible");
	}

	function ShowTrackView() {
		$("div#mainview>div").addClass("invisible");
		$("div#trackview").removeClass("invisible");
	}
});
//Handles all of the file data from the library
define(['lib/jquery', 'lib/d3', 'lib/crossfilter'], function ($$dummy1, $$dummy2, $$dummy3) {
	var trackdata = [];

	//var dimAlbumArtist;
	//var dimAlbum;

	var album_artists = d3.map();

	function IndexTracks(new_tracks) {
		for (var i in new_tracks) {
			var track = new_tracks[i];

			var albartist = album_artists.get(track.album_artist);
			if (!albartist) {
				albartist = album_artists.set(track.album_artist, {
					albums: d3.map(),
					track_count: 0,
					album_count: 0
				});
			}

			var album = albartist.albums.get(track.album);
			if (!album) {
				album = albartist.albums.set(track.album, {
					discs: d3.map(),
					track_count: 0,
					disc_count: 0,
					album_art: undefined,
					date: undefined,
					year: undefined
				});
				albartist.album_count++;
			}

			var disc = album.discs.get(track.disc);
			if (!disc) {
				disc = album.discs.set(track.disc, {
					tracks: []
				});
				album.disc_count++;
			}

			//set album art if not currently set
			if (track.album_art[3] && !album.album_art) {
				album.album_art = track.album_art[3];
			}

			if (track.date && !album.date) {
				album.date = track.date;
				album.year = /^\d{4}/.exec(track.date)[0];
			}

			album.track_count++;
			albartist.track_count++;
			disc.tracks.push(trackdata.length);

			trackdata.push(track);
		}
	}

	function ForceUpdate() {
		d3.json("/api/getlibrary", function (err, data) {
			if (err) {
				console.log(err);
			} else {
				//trackdata = crossfilter(data);
				trackdata.length = 0;
				IndexTracks(data);

				updateCallback.fire();

				//dimAlbumArtist = trackdata.dimension(function (d) { return d.album_artist; });
			}
		});
	}

	ForceUpdate();

	var updateCallback = $.Callbacks();

	return {
		onUpdate: updateCallback,
		tracks: trackdata,
		album_artists: album_artists,
		ForceUpdate: ForceUpdate,
		//albums: dimAlbum
	};
});

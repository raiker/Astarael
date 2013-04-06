$(document).ready(function () {
	d3.json("/api/getlibrary", function(err, data){
		if (err){
			console.log(err);
		} else {	//crossfilter data
			window.trackdata = data;
			var xfdata = crossfilter(data);

			var titles = xfdata.dimension(function(d) { return d.title; });
			var artists = xfdata.dimension(function(d) { return d.artist; });
			var album_artists = xfdata.dimension(function(d) { return d.album_artist; });
			var albums = xfdata.dimension(function(d) { return d.album; });
			var discs = xfdata.dimension(function(d) { return d.disc; });
			var tracks = xfdata.dimension(function(d) { return d.track; });
			
			//drawTable(artists.bottom(Infinity));

			var filtered_set = data.filter(function (element, index, array) {
				//return element.album_artist == "Between the Buried and Me";
				return true;
			});

			filtered_set.sort(function (a, b) {
				var q;

				q = a.date.localeCompare(b.date);
				if (q != 0) return q;

				q = a.album_artist.localeCompare(b.album_artist);
				if (q != 0) return q;

				q = a.album.localeCompare(b.album);
				if (q != 0) return q;

				q = a.disc - b.disc;
				if (q != 0) return q;

				return a.track - b.track;
			});

			drawTable(filtered_set);
		}
	});
});

function drawTable(tracks){
	var table = d3.select("div#tracktable tbody");

	var rows = table.selectAll("tr")
		.data(tracks)
		.enter()
		.append("tr")
			.attr("onclick", function (d, i) { return "trackClick(" + d.index + ",true);"; });

	/*rows.append("td").append("button")
			.attr("onclick", function (d, i) { return "trackPlay(" + d.index + ")"; })
			.text("play");*/

	var cells = rows.selectAll("td")
		.data(function(row){
			return [
				row.album_artist,
				row.album,
				row.date,
				row.disc,
				row.track,
				row.title
			];
		})
		.enter()
		.append("td")
			.text(function(d) { return d; });
}

window.onpopstate = function (event) {
	if (event.state == null) {
		$("div#tracktable").show();
		$("div#trackview").hide();
	} else {
		trackClick(event.state, false);
	}
};

function trackClick(index, click) {
	$("#tracktable").hide();
	if (click){
		history.pushState(index, "Track View", "/track/" + index);
	}

	var track = window.trackdata[index];
	if (track.album_art[3]) {
		d3.select("img#albumart").attr("src", "/api/image/" + track.album_art[3]);
	} else {
		d3.select("img#albumart").attr("src", "/static/img/noalbumart.jpg");
	}
	$("div#trackview").show();
	/*d3.json("/api/track/" + index, function (err, data) {
		if (err) {
			console.log(err);
		} else {
			if (click){
				history.pushState(index, "Track View", "/track/" + index);
			}

			d3.select("img#albumart").attr("src", "/api/image/" + data.albumart[0]);
			$("div#trackview").show();
		}
	});*/
}

function trackPlay(index) {
	d3.select("audio#player1")
		.attr("src", "/stream/" + index);
}
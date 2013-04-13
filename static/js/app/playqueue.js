//Module handles all the management of the play queue
//Exposes some methods to allow songs to be added, etc
define(['librarydata', 'lib/d3'], function (librarydata, $$dummy1) {
	var playqueue = [];
	var currentindex = -1;

	function Redraw() {
		var container = d3.select("ul#playqueue_list");
		
		var entries = container.selectAll("li")
			.data(playqueue)
			.enter()
			.append("li")
			.classed("current", function(d, i){
				return i == currentindex;
			})
			.on("click", function (d, i) {
				currentindex = i;
				Redraw();
				Play(d);
			})
			.text(function (d, i) {
				return librarydata.tracks[d].title;
			});
	}

	function Play(track_id) {
		d3.select("audio#player1").attr("src", "/stream/" + track_id);
	}

	return {
		add: function (track_ids) {
			playqueue = playqueue.concat(track_ids);
			Redraw();
		},
		replaceQueueAndPlay: function (track_id) {
			playqueue = [track_id];
			currentindex = 0;
			Redraw();
			Play(track_id);
		}
	};
});
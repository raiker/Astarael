define(['lib/jquery', 'lib/d3', 'viewcontroller'], function ($$dummy1, $$dummy2, viewcontroller) {
	function populateDirList(path) {
		d3.json('/api/fs/browse/' + path, function (err, data) {
			if (err) {
				var box = $("div#libraryDirPicker div.error_box");
				box.text("Error reading directory");
				box.slideDown();
				window.setTimeout(function () {
					box.slideUp();
				}, 4000);
			} else {
				$("span#curdir").text(data.dir);
				$("div#parentdirlink").off("click");
				$("div#parentdirlink").on("click", function () {
					populateDirList(data.parent);
				});

				var subdirs = d3.select("div#subdirectory_list").selectAll("div")
					.data(Object.keys(data.subdirs).sort());

				subdirs.enter().append("div").classed("link", true);
				subdirs
					.text(function (d, i) {
						return d;
					})
					.on("click", function (d, i) {
						populateDirList(data.subdirs[d]);
					});
				subdirs.exit().remove();

				$("#btnPickDirectory").attr("disabled", !data.valid)
			}
		});
	}

	return {
		PickFolder: function (title, initial_dir, callback) {
			$("#libraryDirPickerTitle").text(title);
			populateDirList(initial_dir);

			$("#btnPickDirectory").off("click");
			$("#btnCancelPick").off("click");

			$("#btnPickDirectory").on("click", function () {
				callback(true, $("span#curdir").text());
			});
			$("#btnCancelPick").on("click", function () {
				callback(false, null);
			});

			viewcontroller.ShowFolderPicker();
		}
	}
});
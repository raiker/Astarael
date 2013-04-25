define(['lib/jquery', 'lib/d3', 'folderpicker', 'viewcontroller'],
	function ($$dummy1, $$dummy2, folderpicker, viewcontroller) {
	var settings;

	d3.json("/api/settings", function (err, data) {
		//possibly a bit fragile
		settings = data;

		$("input#txtLibraryPath").attr("value", settings.libpath);
	});

	function PutSettings() {
		$.post("/api/settings", settings, function (data, textStatus, jsXHR) {
			var resSpan = $("#saveResult");
			resSpan.removeClass('success failure');
			resSpan.addClass(textStatus);
			resSpan.text(textStatus);
			resSpan.fadeIn();

			window.setTimeout(function () {
				resSpan.fadeOut();
			}, 4000);
		});
	}

	$("#btnBrowseLibraryPath").on("click", function () {
		folderpicker.PickFolder("Select library root", settings.libpath, function (result, new_path) {
			viewcontroller.ShowSettings();
			if (result) {
				settings.libpath = new_path;
				$("input#txtLibraryPath").attr("value", settings.libpath);
				PutSettings();
			}
		});
	});

	return null;
});

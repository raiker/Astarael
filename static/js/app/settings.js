define(['lib/jquery', 'lib/d3', 'folderpicker', 'viewcontroller', 'librarydata'], function ($$dummy1, $$dummy2, folderpicker, viewcontroller, librarydata) {
	var settings;

	d3.json("/api/settings", function (err, data) {
		//possibly a bit fragile
		settings = data;

		$("input#txtLibraryPath").attr("value", settings.libpath);
	});

	var ws_notification = new WebSocket("ws://" + HOST + "/ws/notification")
	ws_notification.onmessage = function (evt) {
		var payload = JSON.parse(evt.data);
		if (payload.action) {
			switch (payload.action) {
				case "libraryUpdate":
					librarydata.ForceUpdate();
					break;
			}
		}
		d3.select("div#settingsLog").append("div").text(payload.time + " - " + payload.msg);
	}

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

	$("button#settingsRescanLibrary").on("click", function () {
		$.post("/api/rescanlibrary");
	});

	return null;
});

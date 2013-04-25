define(['lib/jquery'], function ($$dummy1) {
	$("#btnSettings").on("click", function (eventObject) {
		ShowSettings();
	});

	$("#btnLibrary").on("click", function (eventObject) {
		ShowArtistView();
	});

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

	function ShowSettings() {
		$("div#mainview>div").addClass("invisible");
		$("div#settingsview").removeClass("invisible");
	}

	function ShowFolderPicker() {
		$("div#mainview>div").addClass("invisible");
		$("div#libraryDirPicker").removeClass("invisible");
	}

	return {
		ShowArtistView: ShowArtistView,
		ShowAlbumView: ShowAlbumView,
		ShowTrackView: ShowTrackView,
		ShowSettings: ShowSettings,
		ShowFolderPicker: ShowFolderPicker,
	}
});
import stagger
import os
import re
import codecs
import pickle

from stagger.id3 import *

basepath = "T:/"

artists = {}

file_matcher = re.compile(r".*\.(mp3)")

for dirpath, dirnames, filenames in os.walk(basepath):
	for filename in filenames:
		if file_matcher.match(filename):
			filepath = os.path.join(dirpath, filename)

			#print(filepath)
			try:
				tag = stagger.read_tag(filepath)

				albums = artists.setdefault(tag.artist, {})
				discs = albums.setdefault(tag.album, {})

				discnum = tag.disc if tag.disc > 0 else 1

				tracks = discs.setdefault(discnum, {})
				tracks[tag.track] = tag.title
			except stagger.errors.NoTagError as err:
				#print("No tag found in {0}".format(filepath))
				pass

with open("astarael.db","wb") as f:
	pickle.dump(artists, f)

with codecs.open('out.txt', 'w', 'utf-8-sig') as f:
	for artist, albums in artists.items():
		f.write(artist + "\n")
		for album, discs in albums.items():
			f.write("\t{0} - {1} disc(s)\n".format(album, len(discs)))
			for disc, tracks in discs.items():
				f.write("\t\tDisc {0}\n".format(disc))
				for track, trackname in tracks.items():
					f.write("\t\t\t" + str(track) + " - " + trackname + "\n")

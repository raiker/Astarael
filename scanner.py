import stagger
import os
import re
import codecs
import pickle
import hashlib
import base64

from stagger.id3 import *

def scan(basepath, logfunc):
    file_matcher = re.compile(r".*\.(mp3)")

    image_dict = {}
    tracks = []

    i = 0

    for dirpath, dirnames, filenames in os.walk(basepath):
        for filename in filenames:
            if file_matcher.match(filename):
                filepath = os.path.join(dirpath, filename)

                try:
                    tag = stagger.read_tag(filepath)

                    albumart = {}
                    if 'APIC' in tag._frames:
                        apic_frame = tag._frames['APIC']
                        for art in apic_frame:
                            m = hashlib.md5()
                            m.update(art.data)
                            hashdata = m.digest()
                            hash = base64.b16encode(hashdata).decode("ASCII")

                            if not hash in image_dict:
                                image_dict[hash] = {
                                    "mimetype": art.mime,
                                    "data": art.data
                                }

                            albumart[art.type] = hash

                    tracks.append({
                        "index": i,
                        "title": tag.title,
                        "track": tag.track,
                        "artist": tag.artist,
                        "album": tag.album,
                        "disc": tag.disc if tag.disc > 0 else 1,
                        "album_artist": tag.album_artist if tag.album_artist != "" else tag.artist,
                        "date": tag.date,
                        "filepath": filepath,
                        "album_art": albumart
                    })
                    i = i + 1

                    if i % 100 == 0:
                        logfunc("{0} tracks".format(i))

                except stagger.errors.NoTagError as err:
                    logfunc("No tag found in {0}".format(filepath))

    logfunc("Scan complete - {0} tracks found".format(i))
    return (tracks, image_dict)
#with open("astarael.db","wb") as f:
#    pickle.dump((tracks, image_dict), f)

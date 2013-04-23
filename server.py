import tornado.ioloop
import tornado.web
import pickle
import json
import os
import stagger
import base64
import hashlib

with open("astarael.db", "rb") as f:
    (library, image_dict) = pickle.load(f)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("views/library.html")

class LibraryHandler(tornado.web.RequestHandler):
    def get(self):
        self.set_header("Content-Type", "application/json")
        self.write(json.dumps(library))

class ImageHandler(tornado.web.RequestHandler):
    def get(self, img_hash):
        if img_hash in image_dict:
            res = image_dict[img_hash]
            self.set_header("Content-Type", res["mimetype"])
            self.write(res["data"])
        else:
            raise tornado.web.HTTPError(404)

class StreamHandler(tornado.web.RequestHandler):
    def get(self, track_id):
        self.set_header("Content-Type", "audio/mpeg")

        filepath = library[int(track_id)]["filepath"]

        with open(filepath, "rb") as f:
            self.write(f.read())


class TrackHandler(tornado.web.RequestHandler):
    def get(self, track_id):
        self.set_header("Content-Type", "application/json")

        filepath = library[int(track_id)]["filepath"]
        tag = stagger.read_tag(filepath)

        ret_obj = {}

        ret_obj["artist"] = tag.artist

        # if 'APIC' in tag._frames:
        # 	apic_frame = tag._frames['APIC']
        # 	ret_obj["albumart"] = []
        # 	for art in apic_frame:
        # 		m = hashlib.md5()
        # 		m.update(art.data)
        # 		hashdata = m.digest()
        # 		hash = base64.b16encode(hashdata).decode("ASCII")

        # 		if not hash in image_dict:
        # 			image_dict[hash] = {
        # 				"mimetype": art.mime,
        # 				"data": art.data
        # 			}

        # 		ret_obj["albumart"].append(hash)
            

        self.write(json.dumps(ret_obj))

settings = {
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
}

application = tornado.web.Application([(r"/", MainHandler),
    (r"/api/getlibrary", LibraryHandler),
    (r"/api/track/(\d+)", TrackHandler),
    (r"/api/image/([0-9A-F]{32})", ImageHandler),
    (r"/stream/(\d+)", StreamHandler),
    (r"/cats", tornado.web.StaticFileHandler, dict(path=settings['static_path'])) #fixme
], **settings)

application.listen(17742)
tornado.ioloop.IOLoop.instance().start()

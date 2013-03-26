import tornado.ioloop
import tornado.web
import pickle
import json
import os

with open("astarael.db", "rb") as f:
	library = pickle.load(f)

class MainHandler(tornado.web.RequestHandler):
	def get(self):
		self.render("views/library.html")

class LibraryHandler(tornado.web.RequestHandler):
	def get(self):
		self.set_header("Content-Type", "application/json")
		self.write(json.dumps(library))

settings = {
	"static_path": os.path.join(os.path.dirname(__file__), "static"),
}

application = tornado.web.Application([
	(r"/", MainHandler),
	(r"/library/", LibraryHandler),
	(r"/cats", tornado.web.StaticFileHandler, dict(path=settings['static_path']))
], **settings)

application.listen(12777);
tornado.ioloop.IOLoop.instance().start()

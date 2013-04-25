import tornado.ioloop
import tornado.platform
import tornado.web
import tornado.websocket
import pickle
import json
import os
import stagger
import base64
import hashlib
import win32api
import datetime
import threading

import scanner

try:
    with open("astarael.db", "rb") as f:
        (library, image_dict) = pickle.load(f)
except:
    library = []
    image_dict = {}

try:
    with open("astarael.settings", "rb") as f:
        astarael_settings = pickle.load(f)
except:
    astarael_settings = {"libpath": ""}

notification_sockets = []

scan_running = False

class LibraryScanThread(threading.Thread):
    def __init__(self, basepath):
        super().__init__()
        self.basepath = basepath
        
    def run(self):
        global scan_running, library, image_dict
        #will be run as the background worker thread, all web calls need to be invoked
        (new_lib, new_image_dict) = scanner.scan(self.basepath, lambda msg: self.InvokePostMessage(msg));
        library = new_lib;
        image_dict = new_image_dict;
        self.InvokePostMessage("Library scan complete", "libraryUpdate");
        scan_running = False;

    def InvokePostMessage(self, msg, action = None):
        astarael_ioloop.add_callback(PostNotificationMessage, msg, action);

def PostNotificationMessage(msg, action = None):
    for socket in notification_sockets:
        socket.write_message({"time": datetime.datetime.now().isoformat(), "msg": msg, "action": action})

def getDirs(path):
    if path == '':
        if os.name == 'nt':
            #List all the drives
            return {"dir": "",
                    "parent": "",
                    "valid": False,
                    "subdirs": {drive: drive for drive in win32api.GetLogicalDriveStrings().split('\000')[:-1]}}
        else:
            return {"dir": "/", "parent": "", "valid": True, "subdirs": {'/': '/'}}

    if os.path.isdir(path):
        isdrive = False
        if os.name == 'nt' and len(path) == 3:
            isdrive = True
        return {"dir": os.path.normpath(path),
                "parent": os.path.normpath(path + "/../") if not isdrive else "",
                "valid": True,
                "subdirs": {name: os.path.join(path, name) for name in os.listdir(path)
                            if os.path.isdir(os.path.join(path, name))}}
    else:
        raise FileNotFoundError("Error: Invalid directory \"" + path + "\"");

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("views/library.html", host=self.request.host)

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

class FsBrowseHandler(tornado.web.RequestHandler):
    def get(self, path):
        self.set_header("Content-Type", "application/json")
        self.write(json.dumps(getDirs(path)));

class SettingsHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(json.dumps(astarael_settings));

    def post(self):
        astarael_settings['libpath'] = self.get_argument('libpath');
        with open("astarael.settings", "wb") as f:
            pickle.dump(astarael_settings, f)

class RescanHandler(tornado.web.RequestHandler):
    def post(self):
        global scan_running

        if not scan_running:
            PostNotificationMessage("Library rescan started: {0}".format(astarael_settings['libpath']))
            library_scanner_thread = LibraryScanThread(astarael_settings['libpath'])
            scan_running = True
            library_scanner_thread.start()
        else:
            PostNotificationMessage("Library scan currently in progress")

class WSNotificationHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        notification_sockets.append(self)

    def on_message(self, message):
        print(message)

    def on_close(self):
        notification_sockets.remove(self)


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
    (r"/api/fs/browse/(.*)", FsBrowseHandler),
    (r"/api/settings", SettingsHandler),
    (r"/api/rescanlibrary", RescanHandler),
    (r"/ws/notification", WSNotificationHandler),
    (r"/stream/(\d+)", StreamHandler),
    (r"/cats", tornado.web.StaticFileHandler, dict(path=settings['static_path'])) #fixme
], **settings)

application.listen(17742)
#tornado.ioloop.IOLoop.instance().start()
astarael_ioloop = tornado.platform.select.SelectIOLoop.instance()
astarael_ioloop.start()

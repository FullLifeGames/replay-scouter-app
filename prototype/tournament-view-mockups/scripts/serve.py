# PROTOTYPE helper: serves the mockup folder like the published page: utf-8 and a doctype in front of index.html.
import http.server, sys, functools, os
ROOT = sys.argv[1]
class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".html": "text/html; charset=utf-8"}
    def do_GET(self):
        if self.path.split("?")[0] in ("/", "/index.html"):
            body = b"<!doctype html>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" + open(os.path.join(ROOT, "index.html"), "rb").read()
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
        else:
            super().do_GET()
http.server.ThreadingHTTPServer(("127.0.0.1", 5191), functools.partial(H, directory=ROOT)).serve_forever()

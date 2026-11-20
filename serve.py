#!/usr/bin/env python3
"""Static server that refuses to let the browser cache anything.

python3 -m http.server answers reloads with 304 Not Modified, so edits to
app.js / styles.css silently never reach the page. Everything here is served
no-store, with the validators stripped, so a plain reload always gets the
current file.
"""
import sys, http.server, socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, key, value):
        if key.lower() == "last-modified":      # no validator → no 304
            return
        super().send_header(key, value)

    def log_message(self, fmt, *args):
        sys.stdout.write("  %s\n" % (fmt % args))
        sys.stdout.flush()


class Server(socketserver.TCPServer):
    allow_reuse_address = True


with Server(("127.0.0.1", PORT), NoCacheHandler) as httpd:
    httpd.serve_forever()

from googleapiclient.discovery import build
from http.server import BaseHTTPRequestHandler

API_KEY = 'AIzaSyDIQAa95qMcKSRURRs4JZQFCn7wiKUPFRM'

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        
        self.wfile.write('Hello World!'.encode())
        return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.end_headers()
        return

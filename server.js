const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  // Set the file path based on the request URL
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);

  // Determine the content type
  const extname = path.extname(filePath);
  let contentType = "text/html";

  switch (extname) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".jpg":
      contentType = "image/jpg";
      break;
    case ".gif":
      contentType = "image/gif";
      break;
    case ".svg":
      contentType = "image/svg+xml";
      break;
    case ".txt":
      contentType = "text/plain";
      break;
    case ".woff":
      contentType = "application/font-woff";
      break;
    case ".woff2":
      contentType = "application/font-woff2";
      break;
    case ".otf":
      contentType = "application/font-otf";
      break;
    case ".ttf":
      contentType = "application/font-ttf";
      break;
    case ".eot":
      contentType = "application/vnd.ms-fontobject";
      break;
    case ".xml":
      contentType = "application/xml";
      break;
    case ".pdf":
      contentType = "application/pdf";
      break;
    case ".gltf":
      contentType = "model/gltf+json";
      break;
    default:
      contentType = "text/html";
  }

  // Read the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1>");
      } else {
        res.writeHead(500);
        res.end("Server error");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

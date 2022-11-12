const spawn = require("child_process").spawn;
const fs = require("fs");
const express = require("express");
const zipLocal = require("zip-local");
var findRemoveSync = require("find-remove");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => res.render("index.ejs"));

setInterval(findRemoveSync.bind(this, "./public/videos", {age: {seconds: 162000}, dir: "*"}), 7200);

app.post("/", async (req, res) => {
  let link = String(req.body.link);
  uid = Math.floor(Math.random() * 99999999);

  try {
    const child = spawn("yt-dlp", [req.body.playlist, "-o %(title)s.mp4", `-P public/videos/${uid}`, link]);

    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    child.on("close", (code) => {
      if (req.body.playlist == "--yes-playlist") {
        zipLocal.sync.zip(`./public/videos/${uid}`).compress().save(`./public/videos/${uid}/MyFiles.zip`);
        res.download(`./public/videos/${uid}/MyFiles.zip`);
      } else {
        fs.readdirSync(`./public/videos/${uid}`).forEach((file) => {
          console.log(file);
          res.download(`./public/videos/${uid}/${file}`);
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

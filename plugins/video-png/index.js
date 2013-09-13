function video(name, deps) {

    var latestImage;
    var cv = require('opencv');
    var face_cascade = new cv.CascadeClassifier('node_modules/opencv/data/haarcascade_frontalface_alt2.xml');
    var processingImage = false;
    var log = console.log;
    var fs = require('fs');

    // Add a new route to fetch camera image
    deps.app.get('/camera/:id', function(req, res) {
        if (!latestImage) {
            res.writeHead(301, {
                "Location": "/plugin/" + name + "/images/nofeed.jpg"
            });
            res.end();
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        return res.end(latestImage, "binary");
    });

    // Add a handler on images update
    deps.client.getPngStream()
        .on('error', console.log)
        .on('data', function(frame) {
        latestImage = frame;
        detectFacesOpenCv();
    });

    if(latestImage) {
    //setInterval(detectFacesCanvas, 150);
    }
    var face_detect = require('face-detect');

        var Canvas = require('canvas')
        , Image = Canvas.Image
        , canvas = new Canvas(640,360)
        , ctx = canvas.getContext('2d');
        img = new Image,
        troll = new Image;

        fs.readFile(__dirname + '/image.png', function(err, _troll){
          if (err) throw err;
          troll.src = _troll;
        });

    // facial foo
    var detectFacesOpenCv = function() {
        if ((!processingImage) && latestImage) {
            processingImage = true;
            cv.readImage(latestImage, function(err, im) {
                var opts = {};
                face_cascade.detectMultiScale(im, function(err, faces) {

                    var face;
                    var biggestFace;

                    img.src = latestImage;
                    ctx.drawImage(img, 0, 0, img.width, img.height);

                    for (var k = 0; k < faces.length; k++) {
                        face = faces[k];
                        if (!biggestFace || biggestFace.width < face.width) biggestFace = face;

                        im.rectangle([face.x, face.y], [face.x + face.width, face.y + face.height], [0, 255, 0], 2);
                        ctx.drawImage(troll, face.x, face.y, face.width, face.height);
                    }


                    latestImage = canvas.toBuffer();
                    //latestImage = im.toBuffer();
                    processingImage = false;

                }, opts.scale, opts.neighbors, opts.min && opts.min[0], opts.min && opts.min[1]);

            });
        };
    };
};

module.exports = video;

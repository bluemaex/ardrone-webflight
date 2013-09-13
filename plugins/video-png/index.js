function video(name, deps) {

    var latestImage;
    var cv = require('opencv');
    var face_cascade = new cv.CascadeClassifier('node_modules/opencv/data/haarcascade_frontalface_alt2.xml');
    var processingImage = false;
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
            detectFacesOpenCv(frame);
        });

    var Canvas = require('canvas')
    , Image = Canvas.Image
    , canvas = new Canvas(640,360)
    , ctx = canvas.getContext('2d')
    , img = new Image
    , troll = new Image;

    fs.readFile(__dirname + '/image.png', function(err, _troll){
      if (err) throw err;
      troll.src = _troll;
    });

    var detectFacesOpenCv = function(image) {
        if ((!processingImage) && image) {
            processingImage = true;
            cv.readImage(image, function(err, im) {
                var opts = {}, hasFaces = false;
                face_cascade.detectMultiScale(im, function(err, faces) {
                    var face;

                    if(faces.length > 0) {
                        img.src = image;
                        ctx.drawImage(img, 0, 0, img.width, img.height);

                        for (var k = 0; k < faces.length; k++) {
                            face = faces[k];

                            if (face.width > 70) {
                                ctx.drawImage(troll, face.x, face.y, face.width, face.height);
                                hasFaces = true;
                            }
                        }
                    }

                    processingImage = false;

                    if (hasFaces) {
                        latestImage = canvas.toBuffer();
                    } else {
                        latestImage = image;
                    }
                }, opts.scale, opts.neighbors, opts.min && opts.min[0], opts.min && opts.min[1]);
            });
        };
    };
};

module.exports = video;


$(document).ready(function () {
    $(".transparent-fix").each(function () {
        $(this).one('load', function () {
            imageTransparencyFix($(this), false);
        })
      .filter(function () {
          return this.complete;
      })
      .load();
    });

    $(".transparent-fix-outline").each(function () {
        $(this).one('load', function () {
            imageTransparencyFix($(this), true);
        })
      .filter(function () {
          return this.complete;
      })
      .load();
    });

});

var imageTransparencyFix = function (imgJ, outline) {
    var c = document.createElement('canvas');

    var w = imgJ.width(), h = imgJ.height();
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');

    ctx.drawImage(imgJ.get()[0], 0, 0, w, h);
    var imageData = ctx.getImageData(0, 0, w, h);
    var pixel = imageData.data;
    var r = 0, g = 1, b = 2, a = 3;

    if (outline) {
        var stack = new Array();
        stack.push(0); // top left
        stack.push((w * 4) - 4); // top right
        stack.push((h * w * 4) - 4); // bottom right
        stack.push((h * w * 4) - (w * 4)); // bottom left

        // push the other 3 corners
        var col = 0, row = 0, gr = false, gl = false, gu = false, gd = false;
        while (stack.length > 0) {
            var ind = stack.pop();
            if (isWhite(pixel[ind + r], pixel[ind + g], pixel[ind + b])) // if white then change alpha to 0
            {
                // kinda do some alpha related to how white the pixel is (fuzzy?)
                pixel[ind + a] = (765 - pixel[ind + r] - pixel[ind + g] - pixel[ind + b]) / 3;

                // push all the neighbors
                col = ((ind / 4) % w) + 1;
                row = Math.floor(ind / 4 / w) + 1;
                gr = col < w && pixel[ind + 4 + a] == 255;
                gl = col > 1 && pixel[ind - 4 + a] == 255;
                gu = row > 1 && pixel[ind - (w * 4) + a] == 255;
                gd = row < h && pixel[ind + (w * 4) + a] == 255;

                if (gu && gl && pixel[ind - 4 - (w * 4) + a] == 255) { stack.push(ind - 4 - (w * 4)); }
                if (gu) { stack.push(ind - (w * 4)); }
                if (gu && gr && pixel[ind + 4 - (w * 4) + a] == 255) { stack.push(ind + 4 - (w * 4)); }
                if (gl) { stack.push(ind - 4); }
                if (gr) { stack.push(ind + 4); }
                if (gd && gl && pixel[(ind + (w * 4)) - 4 + a] == 255) { stack.push((ind + (w * 4)) - 4); }
                if (gd) { stack.push(ind + (w * 4)); }
                if (gd && gr && pixel[(ind + (w * 4)) + 4 + a] == 255) { stack.push((ind + (w * 4)) + 4); }
            } else {
                // this is a border pixel, give it half opacity
                pixel[ind + a] = 150;
            }
        }
    } else {
        for (var row = 0; row < pixel.length; row += (4 * w)) {
            // last index of non-white pixel in a row
            for (var col = row; col < row + (4 * w) ; col += 4) {
                if (isWhite(pixel[col + r], pixel[col + g], pixel[col + b])) // if white then change alpha to 0
                {
                    // kinda do some alpha related to how white the pixel is (fuzzy?)
                    pixel[col + a] = (765 - pixel[col + r] - pixel[col + g] - pixel[col + b]) / 3;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    //return c.toDataURL('image/png');
    imgJ.after(c);
    imgJ.remove();
}

var threshold = 240;
var isWhite = function (r, g, b) {
    if (
        r >= threshold &&
        g >= threshold &&
        b >= threshold) // if white then change alpha to 0
    {
        return true;
    }
    return false;
}

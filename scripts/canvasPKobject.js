define(['./WorldWindShim'],function (WorldWind) {
    let imageTemp;
    let customPK = function (color, lat, long, magnitude) {
        // wrap up World Wind Placemark object
        let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageScale = Math.abs(magnitude * 3); //placemark size!

        if (!imageTemp) {
            imageTemp = new WorldWind.ImageSource(imgPK('rgb(255,255,255)', 5, 15));
        }

        placemarkAttributes.imageSource = imageTemp;
        placemarkAttributes.imageColor = new WorldWind.Color(color[0], color[1], color[2],1);

        let placemarkPosition = new WorldWind.Position(lat, long, 0);

        this.pk = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
        this.pk.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        this.pk.attributes = placemarkAttributes;
    };

    // wrap up placemark image source
    function imgPK(color, innerR, outerR) {
        let canvas = document.createElement("canvas"),
            ctx = canvas.getContext('2d');

        canvas.width = canvas.height = outerR * 2;

        ctx.beginPath();
        ctx.arc(outerR, outerR, outerR, 0, Math.PI * 2, true);

        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "rgb(188,188,188)";
        ctx.stroke();

        ctx.closePath();

        return canvas
    }

    return customPK
});
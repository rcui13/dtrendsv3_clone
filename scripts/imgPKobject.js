define(['./WorldWindShim'],function (WorldWind) {
    let imagePK = function (lat, long,imgSource) {
        //assigns the agroshere url for images to be located
        // const  agro_url = "https://worldwind.arc.nasa.gov/agrosphere"
        // wrap up World Wind Placemark object
        let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageSource = imgSource;

        placemarkAttributes.imageScale = 0.5; //placemark size!

        placemarkAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.3,
            WorldWind.OFFSET_FRACTION, 0.0);

        placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
        placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.0);


        let highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        highlightAttributes.imageScale = 1;

        let placemarkPosition = new WorldWind.Position(lat, long, 0);

        this.pk = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
        this.pk.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        this.pk.attributes = placemarkAttributes;
        this.pk.highlightAttributes = highlightAttributes;
    };

    return imagePK


});
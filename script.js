"use strict";

(function () {
    //var dataUrl = "./data/11.json";
    var dataUrl = "https://raw.githubusercontent.com/dbautistav/datahub/gh-pages/ecobici/2015/11.json";

    var dataset, observations;

    function doCrossfilter() {
        ////  [795614]:
        ////var zero = {
        ////    Bici: "3415",
        ////    Ciclo_Estacion_Arribo: "132",
        ////    Ciclo_Estacion_Retiro: "129",
        ////    Edad_Usuario: "29",
        ////    Fecha_Arribo: "2015-11-01",
        ////    Fecha_Retiro: "2015-11-01",
        ////    Genero_Usuario: "M",
        ////    Hora_Arribo: "00:04:24",
        ////    Hora_Retiro: "00:00:01.623000"
        ////};

        observations = crossfilter(dataset);
        //console.log("observations", observations);

        // ~~~~
        $("#container").html("<h2>Items loaded: " + observations.size() + "</h2><p>Check the dev-tools console.</p>");

        var byBike = observations.dimension(function (o) {
            return o.Bici;
        });


        var byBikeGroup = byBike.group();

        //// Prints every 'Bici' id and number of occurrences:
        //byBikeGroup.top(Infinity).forEach(function (o, i) {
        //    console.log(o.key + ": " + o.value);
        //});

        byBike.filterExact("0331");
        byBike.top(Infinity).forEach(function (o, i) {
            console.log(o.Edad_Usuario + ". " + o.Genero_Usuario);
        });

        byBike.filterAll();


        var byAge = observations.dimension(function (o) {
            return o.Edad_Usuario;
        });
        console.log("Total # of users: " +
            byAge.top(Infinity).length);

        var t0 = 63, tf = 65;
        byAge.filter([t0, tf]);
        console.log("# of users between " + t0 + " yo and " + tf + " yo (both included): " +
            byAge.top(Infinity).length);


        //// Prints every 'Bici' id and number of occurrences (affected by previous 'byAge.filter'):
        //byBikeGroup.top(Infinity).forEach(function (o, i) {
        //    console.log(o.key + ": " + o.value);
        //});


        // ~~~~
        var byAgeGroup = byAge.group();
        byAgeGroup.top(Infinity).forEach(function (o, i) {
            console.log(o.key + ": " + o.value);
        });


        // This frees up space.
        byBikeGroup.dispose();
        byBike.dispose();
        byAgeGroup.dispose();
        byAge.dispose();

    }


    function fillDataset(response) {
        //console.log("response", response, response.length);
        dataset = response;
        doCrossfilter();

    }


    function init() {
        d3.csv(dataUrl, fillDataset);

    }


    init();

})();

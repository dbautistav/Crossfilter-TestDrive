"use strict";

(function () {
    //var dataUrl = "./data/11.json";
    var dataUrl = "https://raw.githubusercontent.com/dbautistav/datahub/gh-pages/ecobici/2015/11.json";

    var keys = [];


    activate();


    function activate() {
        d3.csv(dataUrl, responseHandler);

    }


    /**
     * Toolkit: dimensions, group, filters
     * ===================================
     *
     * Example output:
     *
     *   keys 9 ["Bici", "Ciclo_Estacion_Arribo", "Ciclo_Estacion_Retiro",
     *              "Edad_Usuario", "Fecha_Arribo", "Fecha_Retiro", "Genero_Usuario",
     *              "Hora_Arribo", "Hora_Retiro"]
     *
     *   filterExact("0331")
     *   43. F
     *   32. M
     *   18. M
     *   72. M
     *   43. F
     *   34. M
     *   32. M
     *   21. M
     *   30. F
     *   25. M
     *   36. M
     *   30. M
     *   23. M
     *   42. M
     *   29. M
     *   47. M
     *   55. M
     *   33. F
     *
     *   byGenderGroup
     *   M: 14
     *   F: 4
     *
     *   Total # of users: 795614
     *   # of users between 23 yo and 25 yo (both included): 53268
     *
     */
    function doCrossfilter(dataset) {
        //// [795614]:
        ////  {
        ////    Bici: "3415",
        ////    Ciclo_Estacion_Arribo: "132",
        ////    Ciclo_Estacion_Retiro: "129",
        ////    Edad_Usuario: "29",
        ////    Fecha_Arribo: "2015-11-01",
        ////    Fecha_Retiro: "2015-11-01",
        ////    Genero_Usuario: "M",
        ////    Hora_Arribo: "00:04:24",
        ////    Hora_Retiro: "00:00:01.623000"
        ////  }

        var observations = crossfilter(dataset);
        //console.log("observations", observations);

        // ~~~~
        $("#container")
            .html(
                "<h2>Items loaded: " + observations.size() + "</h2>" +
                "<p>Check the dev-tools console.</p>"
            );

        var byBike = observations.dimension(function (o) {
            return o.Bici;
        });


        var byBikeGroup = byBike.group();

        //// Prints every 'Bici' id and number of occurrences:
        //byBikeGroup.top(Infinity).forEach(function (o, i) {
        //    console.log(o.key + ": " + o.value);
        //});

        byBike.filterExact("0331");
        console.log('filterExact("0331")');
        byBike.top(Infinity).forEach(function (o, i) {
            console.log(o.Edad_Usuario + ". " + o.Genero_Usuario);
        });


        // ~~~~
        var byGender = observations.dimension(function (o) {
            return o.Genero_Usuario;
        });

        console.log("byGenderGroup");
        var byGenderGroup = byGender.group();
        //byGenderGroup.top(Infinity).forEach(function (o, i) {
        //    console.log(o.key + ": " + o.value);
        //});
        //// console.log("observations.groupAll().reduceCount().value()", observations.groupAll().reduceCount().value());
        var filtered = byGender.top(Infinity).map(function (o, i) {
            return o;
        });
        console.log(filtered);


        // Resets previous filters:
        byBike.filterAll();


        var byAge = observations.dimension(function (o) {
            return o.Edad_Usuario;
        });
        console.log("Total # of users: " + byAge.top(Infinity).length);

        var t0 = 23, tf = 25;
        byAge.filter([t0, tf]);
        console.log("# of users between " + t0 + " yo and " + tf + " yo (both included): " + byAge.top(Infinity).length);


        //// Prints every 'Bici' id and number of occurrences (affected by previous 'byAge.filter'):
        //byBikeGroup.top(Infinity).forEach(function (o, i) {
        //    console.log(o.key + ": " + o.value);
        //});


        // ~~~~
        t0 = 20;
        tf = 21;
        byAge.filter([t0, tf]);
        byGender.filterExact("F");

        console.log("# of users between " + t0 + " yo and " + tf + " yo (both included): " + byAge.top(Infinity).length);

        var byAgeGroup = byAge.group();
        byAgeGroup.top(Infinity).forEach(function (o, i) {
            console.log(o.key + ": " + o.value);
        });


        // This frees up space.
        //  (groups and dimensions)
        byGenderGroup.dispose();
        byGender.dispose();
        byBikeGroup.dispose();
        byBike.dispose();
        byAgeGroup.dispose();
        byAge.dispose();

    }


    function responseHandler(response) {
        setupUI(response, doCrossfilter);

    }


    function setupUI(dataset, cb) {
        ////  {
        ////    Bici: "3415",
        ////    Ciclo_Estacion_Arribo: "132",
        ////    Ciclo_Estacion_Retiro: "129",
        ////    Edad_Usuario: "29",
        ////    Fecha_Arribo: "2015-11-01",
        ////    Fecha_Retiro: "2015-11-01",
        ////    Genero_Usuario: "M",
        ////    Hora_Arribo: "00:04:24",
        ////    Hora_Retiro: "00:00:01.623000"
        ////  }

        if (dataset.length > 0) {
            keys = _.orderBy(_.keysIn(dataset[0]), _.identity, ["asc"]);
            console.log("keys", keys.length, keys);

            // TODO: finish this!
            // TODO: finish this!
            //$("#container")
            // .html("<h2>Items loaded: " + observations.size() + "</h2><p>Check the dev-tools console.</p>");

            // Execute callback after setting up UI elements
            cb(dataset);

        } else {
            $("#container")
                .html("<h3>Error!  D:</h3><p>Check the dev-tools console.</p>");
        }

    }

})();

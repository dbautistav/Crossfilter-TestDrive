"use strict";

import d3 from "d3";
import Q from "q";
import $ from "jquery";
import _ from "lodash";

import * as utils from "./utils";


const datasetOfInterestName = "Ecobici";
const urls = {
    catalog: "https://raw.githubusercontent.com/dbautistav/datahub/gh-pages/catalog.json"
};

export function setup() {
    return Q(getCatalog())
        .then(getDatasetUrl)
        .then(getDataset)
        //.then(prepareDataset)
        //.then(utils.responseLoggerProvider("main Q call"))
        .then(utils.propagateResult);
}


function getCatalog() {
    return Q($.getJSON(urls.catalog));
}

function getDataset(url) {
    const deferred = Q.defer();
    d3.csv(url, (dataset) => { deferred.resolve(dataset); });
    return deferred.promise;
}

function getDatasetUrl(response) {
    return Q().then(() => {
        const datasetOfInterest = _.filter(response.datasets, (_dataset) => {
            return (_dataset.name == datasetOfInterestName);
        })[0];        //// TODO: check for errors!  @filter

        //const datasetLength = datasetOfInterest.resources.length;
        const dataset = datasetOfInterest.resources[0];
        //const dataset = datasetOfInterest.resources[datasetLength - 1];

        urls.dataset = `${response.baseUrl}${datasetOfInterest.baseUri}${dataset.path}${dataset.filename}`;
        return urls.dataset;
    });
}

//function prepareDataset(dataset) {
//    return Q().then(() => {
//        const logger = utils.loggerProvider();
//        logger(dataset[0], "dataset[0] @prepareDataset");
//        logger(dataset[1], "dataset[1] @prepareDataset");
//        logger(dataset[2], "dataset[2] @prepareDataset");
//        return dataset;
//        //// This crashes the tab:     D:
//        //return dataset.forEach((_item) => {
//        //    _.extend(_item, {
//        //        Edad_Usuario: +_item.Edad_Usuario,
//        //        Fecha_Arribo: moment(_item.Fecha_Arribo, "YYYY-MM-DD"),
//        //        Fecha_Retiro: moment(_item.Fecha_Retiro, "YYYY-MM-DD"),
//        //        Hora_Arribo: moment(_item.Hora_Arribo, "HH:mm:ss"),
//        //        Hora_Retiro: moment(_item.Hora_Retiro, "HH:mm:ss")
//        //    });
//        //});
//    });
//}

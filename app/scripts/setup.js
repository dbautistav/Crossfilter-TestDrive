"use strict";

import d3 from "d3";
import Q from "q";
import $ from "jquery";
import _ from "lodash";

import * as utils from "./utils";
import { doCrossfilter } from "./cross";


const datasetOfInterestName = "Ecobici";
const urls = {
    catalog: "https://raw.githubusercontent.com/dbautistav/datahub/gh-pages/catalog.json"
};

export function setup() {
    const responseLogger = utils.responseLoggerProvider("main Q call");

    return Q(getCatalog())
        .then(getDatasetUrl)
        .then(getDataset)
        .then(responseLogger)
        .then(doCrossfilter)

        //.then((response) => {
        //    return response;
        //})
        ;
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

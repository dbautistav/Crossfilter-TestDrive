"use strict";

require("./styles/vendor/bootstrap.min.css");
require("./styles/style.css");

import * as utils from "./scripts/utils";
import { setup } from "./scripts/setup";
import { doCrossfilter } from "./scripts/cross";

setup()
    .then(doCrossfilter)
    .catch(utils.errorHandler);

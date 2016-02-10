"use strict";

(function () {
    var dataPropertyKey = "__data__";

    var tk = {};

    //var tk_document = this.document;
    var tk_document = window.document;

    var tk_subclass = {}.__proto__ ?

        // Until ECMAScript supports array subclassing, prototype injection works well.
        function (object, prototype) {
            object.__proto__ = prototype;
        } :

        // And if your browser doesn't support __proto__, we'll use direct extension.
        function (object, prototype) {
            for (var property in prototype) object[property] = prototype[property];
        };

    function tk_selection(groups) {
        tk_subclass(groups, tk_selectionPrototype);
        return groups;
    }

    tk.selection = function () {
        return tk.select(tk_document.documentElement);
    };

    var tk_selectionPrototype = tk.selection.prototype = [];

    tk.select = function (node) {
        var group;
        if (typeof node === "string") {
            group = [tk_document.querySelector(node)];
            group.parentNode = tk_document.documentElement;
        }
        return tk_selection([group]);
    };

    tk_selectionPrototype.each = function (callback) {
        return tk_selection_each(this, function (node, i, j) {
            callback.call(node, node[dataPropertyKey], i, j);
        });
    };

    function tk_selection_each(groups, callback) {
        for (var j = 0, m = groups.length; j < m; j++) {
            for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
                if (node = group[i]) callback(node, i, j);
            }
        }
        return groups;
    }

    tk_selectionPrototype.property = function (name, value) {
        if (arguments.length < 2) {

            // For property(string), return the property value for the first node.
            if (typeof name === "string") return this.node()[name];

            // For property(object), the object specifies the names and values of the
            // properties to set or remove. The values may be functions that are
            // evaluated for each element.
            for (value in name) this.each(tk_selection_property(value, name[value]));
            return this;
        }

        // Otherwise, both a name and a value are specified, and are handled as below.
        return this.each(tk_selection_property(name, value));
    };

    function tk_selection_property(name, value) {

        // For property(name, null), remove the property with the specified name.
        function propertyNull() {
            delete this[name];
        }

        // For property(name, string), set the property with the specified name.
        function propertyConstant() {
            this[name] = value;
        }

        // For property(name, function), evaluate the function for each element, and
        // set or remove the property as appropriate.
        function propertyFunction() {
            var x = value.apply(this, arguments);
            if (x == null) delete this[name];
            else this[name] = x;
        }

        return value == null
            ? propertyNull : (typeof value === "function"
            ? propertyFunction : propertyConstant);
    }


    tk_selectionPrototype.datum = function (value) {
        return arguments.length
            ? this.property([dataPropertyKey], value)
            : this.property([dataPropertyKey]);
    };


    var tk_arraySlice = [].slice,
        tk_array = function (list) {
            return tk_arraySlice.call(list);
        };

    tk_selectionPrototype.call = function (callback) {
        var args = tk_array(arguments);
        callback.apply(args[0] = this, args);
        return this;
    };


    //  ==========================================================
    function log(objAsMsg, title) {
        console.log(title, JSON.stringify(objAsMsg, null, " "));
    }

    function printMe(data) {
        log(data, "printMe!");
    }


    //  ==========================================================
    (function () {
        console.log('select("#container").datum([1, 3, 5, 7, 9]).call(printMe)', select("#container").datum([1, 3, 5, 7, 9]).call(printMe));
    })();

})();

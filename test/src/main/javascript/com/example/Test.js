"use strict";
/* Typhon Typescript Plugin */
Object.defineProperty(exports, "__esModule", { value: true });
var Test = /** @class */ (function () {
    function Test() {
    }
    Test.prototype.helloWorld = function () {
        console.log("Hello, World!");
    };
    return Test;
}());
exports.default = Test;
new Test().helloWorld();

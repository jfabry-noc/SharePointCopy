"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingVariable = exports.InvalidDirPath = void 0;
var InvalidDirPath = /** @class */ (function (_super) {
    __extends(InvalidDirPath, _super);
    function InvalidDirPath(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'InvalidDirPath';
        return _this;
    }
    return InvalidDirPath;
}(Error));
exports.InvalidDirPath = InvalidDirPath;
var MissingVariable = /** @class */ (function (_super) {
    __extends(MissingVariable, _super);
    function MissingVariable(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'MissingVariable';
        return _this;
    }
    return MissingVariable;
}(Error));
exports.MissingVariable = MissingVariable;

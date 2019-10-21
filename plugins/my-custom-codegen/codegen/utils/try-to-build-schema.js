"use strict";

exports.__esModule = true;
exports.tryToBuildSchema = tryToBuildSchema;

var _graphql = require("graphql");

var _debugging = require("./debugging");

function tryToBuildSchema(schema) {
  try {
    return (0, _graphql.buildASTSchema)(schema);
  } catch (e) {
    (0, _debugging.debugLog)(`Unable to build AST schema from DocumentNode, will try again later...`, e);
    return;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb2RlZ2VuL3V0aWxzL3RyeS10by1idWlsZC1zY2hlbWEudHMiXSwibmFtZXMiOlsidHJ5VG9CdWlsZFNjaGVtYSIsInNjaGVtYSIsImUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBQ0E7O0FBRU8sU0FBU0EsZ0JBQVQsQ0FBMEJDLE1BQTFCLEVBQTJFO0FBQ2hGLE1BQUk7QUFDRixXQUFPLDZCQUFlQSxNQUFmLENBQVA7QUFDRCxHQUZELENBRUUsT0FBT0MsQ0FBUCxFQUFVO0FBQ1YsNkJBQVUsdUVBQVYsRUFBa0ZBLENBQWxGO0FBQ0E7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRG9jdW1lbnROb2RlLCBHcmFwaFFMU2NoZW1hLCBidWlsZEFTVFNjaGVtYSB9IGZyb20gJ2dyYXBocWwnO1xuaW1wb3J0IHsgZGVidWdMb2cgfSBmcm9tICcuL2RlYnVnZ2luZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlUb0J1aWxkU2NoZW1hKHNjaGVtYTogRG9jdW1lbnROb2RlKTogR3JhcGhRTFNjaGVtYSB8IHVuZGVmaW5lZCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGJ1aWxkQVNUU2NoZW1hKHNjaGVtYSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBkZWJ1Z0xvZyhgVW5hYmxlIHRvIGJ1aWxkIEFTVCBzY2hlbWEgZnJvbSBEb2N1bWVudE5vZGUsIHdpbGwgdHJ5IGFnYWluIGxhdGVyLi4uYCwgZSk7XG4gICAgcmV0dXJuO1xuICB9XG59XG4iXX0=
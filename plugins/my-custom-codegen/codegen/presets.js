"use strict";

exports.__esModule = true;
exports.getPresetByName = getPresetByName;

var _path = require("path");

var _core = require("@graphql-codegen/core");

async function getPresetByName(name, loader) {
  const possibleNames = [`@graphql-codegen/${name}`, `@graphql-codegen/${name}-preset`, name];
  const possibleModules = possibleNames.concat((0, _path.resolve)(process.cwd(), name));

  for (const moduleName of possibleModules) {
    try {
      const loaded = await loader(moduleName);

      if (loaded && loaded.preset) {
        return loaded.preset;
      } else if (loaded && loaded.default) {
        return loaded.default;
      }

      return loaded;
    } catch (err) {
      if (err.message.indexOf(`Cannot find module '${moduleName}'`) === -1) {
        throw new _core.DetailedError(`Unable to load preset matching ${name}`, `
              Unable to load preset matching '${name}'.
              Reason:
                ${err.message}
            `);
      }
    }
  }

  const possibleNamesMsg = possibleNames.map(name => `
        - ${name}
    `.trimRight()).join('');
  throw new _core.DetailedError(`Unable to find preset matching ${name}`, `
        Unable to find preset matching '${name}'
        Install one of the following packages:

        ${possibleNamesMsg}
      `);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2RlZ2VuL3ByZXNldHMudHMiXSwibmFtZXMiOlsiZ2V0UHJlc2V0QnlOYW1lIiwibmFtZSIsImxvYWRlciIsInBvc3NpYmxlTmFtZXMiLCJwb3NzaWJsZU1vZHVsZXMiLCJjb25jYXQiLCJwcm9jZXNzIiwiY3dkIiwibW9kdWxlTmFtZSIsImxvYWRlZCIsInByZXNldCIsImRlZmF1bHQiLCJlcnIiLCJtZXNzYWdlIiwiaW5kZXhPZiIsIkRldGFpbGVkRXJyb3IiLCJwb3NzaWJsZU5hbWVzTXNnIiwibWFwIiwidHJpbVJpZ2h0Iiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQTs7QUFDQTs7QUFFTyxlQUFlQSxlQUFmLENBQ0xDLElBREssRUFFTEMsTUFGSyxFQUd3QjtBQUM3QixRQUFNQyxhQUFhLEdBQUcsQ0FBRSxvQkFBbUJGLElBQUssRUFBMUIsRUFBOEIsb0JBQW1CQSxJQUFLLFNBQXRELEVBQWdFQSxJQUFoRSxDQUF0QjtBQUNBLFFBQU1HLGVBQWUsR0FBR0QsYUFBYSxDQUFDRSxNQUFkLENBQXFCLG1CQUFRQyxPQUFPLENBQUNDLEdBQVIsRUFBUixFQUF1Qk4sSUFBdkIsQ0FBckIsQ0FBeEI7O0FBRUEsT0FBSyxNQUFNTyxVQUFYLElBQXlCSixlQUF6QixFQUEwQztBQUN4QyxRQUFJO0FBQ0YsWUFBTUssTUFBTSxHQUFHLE1BQU1QLE1BQU0sQ0FBQ00sVUFBRCxDQUEzQjs7QUFFQSxVQUFJQyxNQUFNLElBQUlBLE1BQU0sQ0FBQ0MsTUFBckIsRUFBNkI7QUFDM0IsZUFBT0QsTUFBTSxDQUFDQyxNQUFkO0FBQ0QsT0FGRCxNQUVPLElBQUlELE1BQU0sSUFBSUEsTUFBTSxDQUFDRSxPQUFyQixFQUE4QjtBQUNuQyxlQUFPRixNQUFNLENBQUNFLE9BQWQ7QUFDRDs7QUFFRCxhQUFPRixNQUFQO0FBQ0QsS0FWRCxDQVVFLE9BQU9HLEdBQVAsRUFBWTtBQUNaLFVBQUlBLEdBQUcsQ0FBQ0MsT0FBSixDQUFZQyxPQUFaLENBQXFCLHVCQUFzQk4sVUFBVyxHQUF0RCxNQUE4RCxDQUFDLENBQW5FLEVBQXNFO0FBQ3BFLGNBQU0sSUFBSU8sbUJBQUosQ0FDSCxrQ0FBaUNkLElBQUssRUFEbkMsRUFFSDtnREFDcUNBLElBQUs7O2tCQUVuQ1csR0FBRyxDQUFDQyxPQUFRO2FBTGhCLENBQU47QUFRRDtBQUNGO0FBQ0Y7O0FBRUQsUUFBTUcsZ0JBQWdCLEdBQUdiLGFBQWEsQ0FDbkNjLEdBRHNCLENBQ2xCaEIsSUFBSSxJQUNOO1lBQ0tBLElBQUs7S0FEWCxDQUVBaUIsU0FGQSxFQUZxQixFQU10QkMsSUFOc0IsQ0FNakIsRUFOaUIsQ0FBekI7QUFRQSxRQUFNLElBQUlKLG1CQUFKLENBQ0gsa0NBQWlDZCxJQUFLLEVBRG5DLEVBRUg7MENBQ3FDQSxJQUFLOzs7VUFHckNlLGdCQUFpQjtPQU5uQixDQUFOO0FBU0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUeXBlcyB9IGZyb20gJ0BncmFwaHFsLWNvZGVnZW4vcGx1Z2luLWhlbHBlcnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgRGV0YWlsZWRFcnJvciB9IGZyb20gJ0BncmFwaHFsLWNvZGVnZW4vY29yZSc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcmVzZXRCeU5hbWUoXG4gIG5hbWU6IHN0cmluZyxcbiAgbG9hZGVyOiBUeXBlcy5QYWNrYWdlTG9hZGVyRm48eyBwcmVzZXQ/OiBUeXBlcy5PdXRwdXRQcmVzZXQ7IGRlZmF1bHQ/OiBUeXBlcy5PdXRwdXRQcmVzZXQgfT4sXG4pOiBQcm9taXNlPFR5cGVzLk91dHB1dFByZXNldD4ge1xuICBjb25zdCBwb3NzaWJsZU5hbWVzID0gW2BAZ3JhcGhxbC1jb2RlZ2VuLyR7bmFtZX1gLCBgQGdyYXBocWwtY29kZWdlbi8ke25hbWV9LXByZXNldGAsIG5hbWVdO1xuICBjb25zdCBwb3NzaWJsZU1vZHVsZXMgPSBwb3NzaWJsZU5hbWVzLmNvbmNhdChyZXNvbHZlKHByb2Nlc3MuY3dkKCksIG5hbWUpKTtcblxuICBmb3IgKGNvbnN0IG1vZHVsZU5hbWUgb2YgcG9zc2libGVNb2R1bGVzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGxvYWRlZCA9IGF3YWl0IGxvYWRlcihtb2R1bGVOYW1lKTtcblxuICAgICAgaWYgKGxvYWRlZCAmJiBsb2FkZWQucHJlc2V0KSB7XG4gICAgICAgIHJldHVybiBsb2FkZWQucHJlc2V0IGFzIFR5cGVzLk91dHB1dFByZXNldDtcbiAgICAgIH0gZWxzZSBpZiAobG9hZGVkICYmIGxvYWRlZC5kZWZhdWx0KSB7XG4gICAgICAgIHJldHVybiBsb2FkZWQuZGVmYXVsdCBhcyBUeXBlcy5PdXRwdXRQcmVzZXQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsb2FkZWQgYXMgVHlwZXMuT3V0cHV0UHJlc2V0O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyci5tZXNzYWdlLmluZGV4T2YoYENhbm5vdCBmaW5kIG1vZHVsZSAnJHttb2R1bGVOYW1lfSdgKSA9PT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IERldGFpbGVkRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBsb2FkIHByZXNldCBtYXRjaGluZyAke25hbWV9YCxcbiAgICAgICAgICBgXG4gICAgICAgICAgICAgIFVuYWJsZSB0byBsb2FkIHByZXNldCBtYXRjaGluZyAnJHtuYW1lfScuXG4gICAgICAgICAgICAgIFJlYXNvbjpcbiAgICAgICAgICAgICAgICAke2Vyci5tZXNzYWdlfVxuICAgICAgICAgICAgYCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBwb3NzaWJsZU5hbWVzTXNnID0gcG9zc2libGVOYW1lc1xuICAgIC5tYXAobmFtZSA9PlxuICAgICAgYFxuICAgICAgICAtICR7bmFtZX1cbiAgICBgLnRyaW1SaWdodCgpLFxuICAgIClcbiAgICAuam9pbignJyk7XG5cbiAgdGhyb3cgbmV3IERldGFpbGVkRXJyb3IoXG4gICAgYFVuYWJsZSB0byBmaW5kIHByZXNldCBtYXRjaGluZyAke25hbWV9YCxcbiAgICBgXG4gICAgICAgIFVuYWJsZSB0byBmaW5kIHByZXNldCBtYXRjaGluZyAnJHtuYW1lfSdcbiAgICAgICAgSW5zdGFsbCBvbmUgb2YgdGhlIGZvbGxvd2luZyBwYWNrYWdlczpcblxuICAgICAgICAke3Bvc3NpYmxlTmFtZXNNc2d9XG4gICAgICBgLFxuICApO1xufVxuIl19
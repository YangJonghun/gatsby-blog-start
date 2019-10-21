"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.Renderer = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _logUpdate = _interopRequireDefault(require("log-update"));

var _indentString = _interopRequireDefault(require("indent-string"));

var _logSymbols = _interopRequireDefault(require("log-symbols"));

var _listrUpdateRenderer = _interopRequireDefault(require("listr-update-renderer"));

var _commonTags = require("common-tags");

var _core = require("@graphql-codegen/core");

var _debugging = require("./debugging");

class Renderer {
  constructor(tasks, options) {
    this.updateRenderer = new _listrUpdateRenderer.default(tasks, options);
  }

  render() {
    return this.updateRenderer.render();
  }

  end(err) {
    this.updateRenderer.end(err);

    if (typeof err === undefined) {
      _logUpdate.default.clear();

      return;
    } // persist the output


    _logUpdate.default.done(); // show errors


    if (err) {
      const errorCount = err.errors ? err.errors.length : 0;

      if (errorCount > 0) {
        const count = (0, _indentString.default)(_chalk.default.red.bold(`Found ${errorCount} error${errorCount > 1 ? 's' : ''}`), 1);
        const details = err.errors.map(error => {
          (0, _debugging.debugLog)(`[CLI] Exited with an error`, error);
          return {
            msg: (0, _core.isDetailedError)(error) ? error.details : null,
            rawError: error
          };
        }).map(({
          msg,
          rawError
        }, i) => {
          const source = err.errors[i].source;
          msg = msg ? _chalk.default.gray((0, _indentString.default)((0, _commonTags.stripIndent)(`${msg}`), 4)) : null;
          const stack = rawError.stack ? _chalk.default.gray((0, _indentString.default)((0, _commonTags.stripIndent)(rawError.stack), 4)) : null;

          if (source) {
            const sourceOfError = typeof source === 'string' ? source : source.name;
            const title = (0, _indentString.default)(`${_logSymbols.default.error} ${sourceOfError}`, 2);
            return [title, msg, stack, stack].filter(Boolean).join('\n');
          }

          return [msg, stack].filter(Boolean).join('\n');
        }).join('\n\n');
        (0, _logUpdate.default)(['', count, details, ''].join('\n\n'));
      } else {
        const details = err.details ? err.details : '';
        (0, _logUpdate.default)(`${_chalk.default.red.bold(`${(0, _indentString.default)(err.message, 2)}`)}\n${details}\n${_chalk.default.grey(err.stack)}`);
      }
    }

    _logUpdate.default.done();

    (0, _debugging.printLogs)();
  }

}

exports.Renderer = Renderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb2RlZ2VuL3V0aWxzL2xpc3RyLXJlbmRlcmVyLnRzIl0sIm5hbWVzIjpbIlJlbmRlcmVyIiwiY29uc3RydWN0b3IiLCJ0YXNrcyIsIm9wdGlvbnMiLCJ1cGRhdGVSZW5kZXJlciIsIlVwZGF0ZVJlbmRlcmVyIiwicmVuZGVyIiwiZW5kIiwiZXJyIiwidW5kZWZpbmVkIiwibG9nVXBkYXRlIiwiY2xlYXIiLCJkb25lIiwiZXJyb3JDb3VudCIsImVycm9ycyIsImxlbmd0aCIsImNvdW50IiwiY2hhbGsiLCJyZWQiLCJib2xkIiwiZGV0YWlscyIsIm1hcCIsImVycm9yIiwibXNnIiwicmF3RXJyb3IiLCJpIiwic291cmNlIiwiZ3JheSIsInN0YWNrIiwic291cmNlT2ZFcnJvciIsIm5hbWUiLCJ0aXRsZSIsImxvZ1N5bWJvbCIsImZpbHRlciIsIkJvb2xlYW4iLCJqb2luIiwibWVzc2FnZSIsImdyZXkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFHQTs7QUFFTyxNQUFNQSxRQUFOLENBQWU7QUFHcEJDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFtQkMsT0FBbkIsRUFBaUM7QUFDMUMsU0FBS0MsY0FBTCxHQUFzQixJQUFJQyw0QkFBSixDQUFtQkgsS0FBbkIsRUFBMEJDLE9BQTFCLENBQXRCO0FBQ0Q7O0FBRURHLEVBQUFBLE1BQU0sR0FBRztBQUNQLFdBQU8sS0FBS0YsY0FBTCxDQUFvQkUsTUFBcEIsRUFBUDtBQUNEOztBQUVEQyxFQUFBQSxHQUFHLENBQ0RDLEdBREMsRUFLRDtBQUNBLFNBQUtKLGNBQUwsQ0FBb0JHLEdBQXBCLENBQXdCQyxHQUF4Qjs7QUFFQSxRQUFJLE9BQU9BLEdBQVAsS0FBZUMsU0FBbkIsRUFBOEI7QUFDNUJDLHlCQUFVQyxLQUFWOztBQUNBO0FBQ0QsS0FORCxDQVFBOzs7QUFDQUQsdUJBQVVFLElBQVYsR0FUQSxDQVdBOzs7QUFDQSxRQUFJSixHQUFKLEVBQVM7QUFDUCxZQUFNSyxVQUFVLEdBQUdMLEdBQUcsQ0FBQ00sTUFBSixHQUFhTixHQUFHLENBQUNNLE1BQUosQ0FBV0MsTUFBeEIsR0FBaUMsQ0FBcEQ7O0FBRUEsVUFBSUYsVUFBVSxHQUFHLENBQWpCLEVBQW9CO0FBQ2xCLGNBQU1HLEtBQUssR0FBRywyQkFBYUMsZUFBTUMsR0FBTixDQUFVQyxJQUFWLENBQWdCLFNBQVFOLFVBQVcsU0FBUUEsVUFBVSxHQUFHLENBQWIsR0FBaUIsR0FBakIsR0FBdUIsRUFBRyxFQUFyRSxDQUFiLEVBQXNGLENBQXRGLENBQWQ7QUFDQSxjQUFNTyxPQUFPLEdBQUdaLEdBQUcsQ0FDaEJNLE1BRGEsQ0FDTE8sR0FESyxDQUNEQyxLQUFLLElBQUk7QUFDcEIsbUNBQVUsNEJBQVYsRUFBdUNBLEtBQXZDO0FBRUEsaUJBQU87QUFBRUMsWUFBQUEsR0FBRyxFQUFFLDJCQUFnQkQsS0FBaEIsSUFBeUJBLEtBQUssQ0FBQ0YsT0FBL0IsR0FBeUMsSUFBaEQ7QUFBc0RJLFlBQUFBLFFBQVEsRUFBRUY7QUFBaEUsV0FBUDtBQUNELFNBTGEsRUFNYkQsR0FOYSxDQU1ULENBQUM7QUFBRUUsVUFBQUEsR0FBRjtBQUFPQyxVQUFBQTtBQUFQLFNBQUQsRUFBb0JDLENBQXBCLEtBQTBCO0FBQzdCLGdCQUFNQyxNQUFtQyxHQUFJbEIsR0FBRyxDQUFDTSxNQUFKLENBQVlXLENBQVosQ0FBRCxDQUF3QkMsTUFBcEU7QUFFQUgsVUFBQUEsR0FBRyxHQUFHQSxHQUFHLEdBQUdOLGVBQU1VLElBQU4sQ0FBVywyQkFBYSw2QkFBYSxHQUFFSixHQUFJLEVBQW5CLENBQWIsRUFBb0MsQ0FBcEMsQ0FBWCxDQUFILEdBQXdELElBQWpFO0FBQ0EsZ0JBQU1LLEtBQUssR0FBR0osUUFBUSxDQUFDSSxLQUFULEdBQWlCWCxlQUFNVSxJQUFOLENBQVcsMkJBQWEsNkJBQVlILFFBQVEsQ0FBQ0ksS0FBckIsQ0FBYixFQUEwQyxDQUExQyxDQUFYLENBQWpCLEdBQTRFLElBQTFGOztBQUVBLGNBQUlGLE1BQUosRUFBWTtBQUNWLGtCQUFNRyxhQUFhLEdBQUcsT0FBT0gsTUFBUCxLQUFrQixRQUFsQixHQUE2QkEsTUFBN0IsR0FBc0NBLE1BQU0sQ0FBQ0ksSUFBbkU7QUFDQSxrQkFBTUMsS0FBSyxHQUFHLDJCQUFjLEdBQUVDLG9CQUFVVixLQUFNLElBQUdPLGFBQWMsRUFBakQsRUFBb0QsQ0FBcEQsQ0FBZDtBQUVBLG1CQUFPLENBQUNFLEtBQUQsRUFBUVIsR0FBUixFQUFhSyxLQUFiLEVBQW9CQSxLQUFwQixFQUEyQkssTUFBM0IsQ0FBa0NDLE9BQWxDLEVBQTJDQyxJQUEzQyxDQUFnRCxJQUFoRCxDQUFQO0FBQ0Q7O0FBRUQsaUJBQU8sQ0FBQ1osR0FBRCxFQUFNSyxLQUFOLEVBQWFLLE1BQWIsQ0FBb0JDLE9BQXBCLEVBQTZCQyxJQUE3QixDQUFrQyxJQUFsQyxDQUFQO0FBQ0QsU0FwQmEsRUFxQmJBLElBckJhLENBcUJSLE1BckJRLENBQWhCO0FBc0JBLGdDQUFVLENBQUMsRUFBRCxFQUFLbkIsS0FBTCxFQUFZSSxPQUFaLEVBQXFCLEVBQXJCLEVBQXlCZSxJQUF6QixDQUE4QixNQUE5QixDQUFWO0FBQ0QsT0F6QkQsTUF5Qk87QUFDTCxjQUFNZixPQUFPLEdBQUdaLEdBQUcsQ0FBQ1ksT0FBSixHQUFjWixHQUFHLENBQUNZLE9BQWxCLEdBQTRCLEVBQTVDO0FBQ0EsZ0NBQVcsR0FBRUgsZUFBTUMsR0FBTixDQUFVQyxJQUFWLENBQWdCLEdBQUUsMkJBQWFYLEdBQUcsQ0FBQzRCLE9BQWpCLEVBQTBCLENBQTFCLENBQTZCLEVBQS9DLENBQWtELEtBQUloQixPQUFRLEtBQUlILGVBQU1vQixJQUFOLENBQVc3QixHQUFHLENBQUNvQixLQUFmLENBQXVCLEVBQXRHO0FBQ0Q7QUFDRjs7QUFFRGxCLHVCQUFVRSxJQUFWOztBQUVBO0FBQ0Q7O0FBakVtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgbG9nVXBkYXRlIGZyb20gJ2xvZy11cGRhdGUnO1xuaW1wb3J0IGluZGVudFN0cmluZyBmcm9tICdpbmRlbnQtc3RyaW5nJztcbmltcG9ydCBsb2dTeW1ib2wgZnJvbSAnbG9nLXN5bWJvbHMnO1xuaW1wb3J0IFVwZGF0ZVJlbmRlcmVyIGZyb20gJ2xpc3RyLXVwZGF0ZS1yZW5kZXJlcic7XG5pbXBvcnQgeyBzdHJpcEluZGVudCB9IGZyb20gJ2NvbW1vbi10YWdzJztcbmltcG9ydCB7IExpc3RyVGFzayB9IGZyb20gJ2xpc3RyJztcbmltcG9ydCB7IERldGFpbGVkRXJyb3IsIGlzRGV0YWlsZWRFcnJvciB9IGZyb20gJ0BncmFwaHFsLWNvZGVnZW4vY29yZSc7XG5pbXBvcnQgeyBTb3VyY2UgfSBmcm9tICdncmFwaHFsJztcblxuaW1wb3J0IHsgZGVidWdMb2csIHByaW50TG9ncyB9IGZyb20gJy4vZGVidWdnaW5nJztcblxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcbiAgcHJpdmF0ZSB1cGRhdGVSZW5kZXJlcjogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tzOiBMaXN0clRhc2ssIG9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMudXBkYXRlUmVuZGVyZXIgPSBuZXcgVXBkYXRlUmVuZGVyZXIodGFza3MsIG9wdGlvbnMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVJlbmRlcmVyLnJlbmRlcigpO1xuICB9XG5cbiAgZW5kKFxuICAgIGVycjogRXJyb3IgJiB7XG4gICAgICBlcnJvcnM/OiAoRXJyb3IgfCBEZXRhaWxlZEVycm9yKVtdO1xuICAgICAgZGV0YWlscz86IHN0cmluZztcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLnVwZGF0ZVJlbmRlcmVyLmVuZChlcnIpO1xuXG4gICAgaWYgKHR5cGVvZiBlcnIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbG9nVXBkYXRlLmNsZWFyKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gcGVyc2lzdCB0aGUgb3V0cHV0XG4gICAgbG9nVXBkYXRlLmRvbmUoKTtcblxuICAgIC8vIHNob3cgZXJyb3JzXG4gICAgaWYgKGVycikge1xuICAgICAgY29uc3QgZXJyb3JDb3VudCA9IGVyci5lcnJvcnMgPyBlcnIuZXJyb3JzLmxlbmd0aCA6IDA7XG5cbiAgICAgIGlmIChlcnJvckNvdW50ID4gMCkge1xuICAgICAgICBjb25zdCBjb3VudCA9IGluZGVudFN0cmluZyhjaGFsay5yZWQuYm9sZChgRm91bmQgJHtlcnJvckNvdW50fSBlcnJvciR7ZXJyb3JDb3VudCA+IDEgPyAncycgOiAnJ31gKSwgMSk7XG4gICAgICAgIGNvbnN0IGRldGFpbHMgPSBlcnJcbiAgICAgICAgICAuZXJyb3JzIS5tYXAoZXJyb3IgPT4ge1xuICAgICAgICAgICAgZGVidWdMb2coYFtDTEldIEV4aXRlZCB3aXRoIGFuIGVycm9yYCwgZXJyb3IpO1xuXG4gICAgICAgICAgICByZXR1cm4geyBtc2c6IGlzRGV0YWlsZWRFcnJvcihlcnJvcikgPyBlcnJvci5kZXRhaWxzIDogbnVsbCwgcmF3RXJyb3I6IGVycm9yIH07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAubWFwKCh7IG1zZywgcmF3RXJyb3IgfSwgaSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlOiBzdHJpbmcgfCBTb3VyY2UgfCB1bmRlZmluZWQgPSAoZXJyLmVycm9ycyFbaV0gYXMgYW55KS5zb3VyY2U7XG5cbiAgICAgICAgICAgIG1zZyA9IG1zZyA/IGNoYWxrLmdyYXkoaW5kZW50U3RyaW5nKHN0cmlwSW5kZW50KGAke21zZ31gKSwgNCkpIDogbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IHN0YWNrID0gcmF3RXJyb3Iuc3RhY2sgPyBjaGFsay5ncmF5KGluZGVudFN0cmluZyhzdHJpcEluZGVudChyYXdFcnJvci5zdGFjayksIDQpKSA6IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICAgICAgY29uc3Qgc291cmNlT2ZFcnJvciA9IHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gc291cmNlIDogc291cmNlLm5hbWU7XG4gICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gaW5kZW50U3RyaW5nKGAke2xvZ1N5bWJvbC5lcnJvcn0gJHtzb3VyY2VPZkVycm9yfWAsIDIpO1xuXG4gICAgICAgICAgICAgIHJldHVybiBbdGl0bGUsIG1zZywgc3RhY2ssIHN0YWNrXS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBbbXNnLCBzdGFja10uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICBsb2dVcGRhdGUoWycnLCBjb3VudCwgZGV0YWlscywgJyddLmpvaW4oJ1xcblxcbicpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGRldGFpbHMgPSBlcnIuZGV0YWlscyA/IGVyci5kZXRhaWxzIDogJyc7XG4gICAgICAgIGxvZ1VwZGF0ZShgJHtjaGFsay5yZWQuYm9sZChgJHtpbmRlbnRTdHJpbmcoZXJyLm1lc3NhZ2UsIDIpfWApfVxcbiR7ZGV0YWlsc31cXG4ke2NoYWxrLmdyZXkoZXJyLnN0YWNrISl9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbG9nVXBkYXRlLmRvbmUoKTtcblxuICAgIHByaW50TG9ncygpO1xuICB9XG59XG4iXX0=
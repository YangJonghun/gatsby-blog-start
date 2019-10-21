"use strict";

exports.__esModule = true;
exports.default = void 0;

var _codegen = require("../codegen");

var _hooks = require("../codegen/hooks");

/* eslint @typescript-eslint/no-unused-vars: 0 */

/* eslint no-unused-vars: 0 */

/* eslint @typescript-eslint/no-var-requires: 0 */

/* eslint import/no-extraneous-dependencies: 0 */
const {
  parse,
  printSchema
} = require('gatsby/graphql');

const onPostBootstrap = async ({
  store
}, {
  configPath
} = {
  plugins: []
}, callback) => {
  // // get the schema and load all graphql queries from pages
  const {
    schema
  } = store.getState();
  const parsedSchema = parse(printSchema(schema));
  console.log(`===========================================`);
  const config = await (0, _codegen.createConfig)({
    defaultSchema: parsedSchema,
    configPath
  });

  try {
    await (0, _codegen.generate)(config);
  } catch (error) {
    await (0, _hooks.lifecycleHooks)(config.hooks).onError(error.toString());
    throw error;
  }

  console.log(`===========================================`);
  console.log('I will create a page!');
  console.log('Typescript!'); // // tell gatsby we are done

  typeof callback === 'function' && callback(null);
};

var _default = onPostBootstrap;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nYXRzYnlfYXBpL29uUG9zdEJvb3RzdHJhcC50cyJdLCJuYW1lcyI6WyJwYXJzZSIsInByaW50U2NoZW1hIiwicmVxdWlyZSIsIm9uUG9zdEJvb3RzdHJhcCIsInN0b3JlIiwiY29uZmlnUGF0aCIsInBsdWdpbnMiLCJjYWxsYmFjayIsInNjaGVtYSIsImdldFN0YXRlIiwicGFyc2VkU2NoZW1hIiwiY29uc29sZSIsImxvZyIsImNvbmZpZyIsImRlZmF1bHRTY2hlbWEiLCJlcnJvciIsImhvb2tzIiwib25FcnJvciIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7OztBQVFBOztBQUNBOztBQVRBOztBQUNBOztBQUNBOztBQUNBO0FBUUEsTUFBTTtBQUFFQSxFQUFBQSxLQUFGO0FBQVNDLEVBQUFBO0FBQVQsSUFBeUJDLE9BQU8sQ0FBQyxnQkFBRCxDQUF0Qzs7QUFNQSxNQUFNQyxlQUFlLEdBQUcsT0FDdEI7QUFBRUMsRUFBQUE7QUFBRixDQURzQixFQUV0QjtBQUFFQyxFQUFBQTtBQUFGLElBQXNDO0FBQUVDLEVBQUFBLE9BQU8sRUFBRTtBQUFYLENBRmhCLEVBR3RCQyxRQUhzQixLQUluQjtBQUNIO0FBQ0EsUUFBTTtBQUFFQyxJQUFBQTtBQUFGLE1BQWFKLEtBQUssQ0FBQ0ssUUFBTixFQUFuQjtBQUVBLFFBQU1DLFlBQTBCLEdBQUdWLEtBQUssQ0FBQ0MsV0FBVyxDQUFDTyxNQUFELENBQVosQ0FBeEM7QUFFQUcsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsNkNBQWI7QUFDQSxRQUFNQyxNQUFNLEdBQUcsTUFBTSwyQkFBYTtBQUNoQ0MsSUFBQUEsYUFBYSxFQUFFSixZQURpQjtBQUVoQ0wsSUFBQUE7QUFGZ0MsR0FBYixDQUFyQjs7QUFLQSxNQUFJO0FBQ0YsVUFBTSx1QkFBU1EsTUFBVCxDQUFOO0FBQ0QsR0FGRCxDQUVFLE9BQU9FLEtBQVAsRUFBYztBQUNkLFVBQU0sMkJBQWVGLE1BQU0sQ0FBQ0csS0FBdEIsRUFBNkJDLE9BQTdCLENBQXFDRixLQUFLLENBQUNHLFFBQU4sRUFBckMsQ0FBTjtBQUNBLFVBQU1ILEtBQU47QUFDRDs7QUFFREosRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQWEsNkNBQWI7QUFDQUQsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksdUJBQVo7QUFDQUQsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWixFQXJCRyxDQXVCSDs7QUFDQSxTQUFPTCxRQUFQLEtBQW9CLFVBQXBCLElBQWtDQSxRQUFRLENBQUMsSUFBRCxDQUExQztBQUNELENBN0JEOztlQStCZUosZSIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnM6IDAgKi9cbi8qIGVzbGludCBuby11bnVzZWQtdmFyczogMCAqL1xuLyogZXNsaW50IEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXM6IDAgKi9cbi8qIGVzbGludCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXM6IDAgKi9cblxuaW1wb3J0IHsgUGFyZW50U3BhblBsdWdpbkFyZ3MsIFBsdWdpbkNhbGxiYWNrLCBQbHVnaW5PcHRpb25zIH0gZnJvbSAnZ2F0c2J5JztcbmltcG9ydCB7IERvY3VtZW50Tm9kZSB9IGZyb20gJ2dyYXBocWwnO1xuXG5pbXBvcnQgeyBjcmVhdGVDb25maWcsIGdlbmVyYXRlIH0gZnJvbSAnLi4vY29kZWdlbic7XG5pbXBvcnQgeyBsaWZlY3ljbGVIb29rcyB9IGZyb20gJy4uL2NvZGVnZW4vaG9va3MnO1xuXG5jb25zdCB7IHBhcnNlLCBwcmludFNjaGVtYSB9ID0gcmVxdWlyZSgnZ2F0c2J5L2dyYXBocWwnKTtcblxuaW50ZXJmYWNlIEN1c3RvbVBsdWdpbk9wdGlvbnMgZXh0ZW5kcyBQbHVnaW5PcHRpb25zIHtcbiAgY29uZmlnUGF0aD86IHN0cmluZztcbn1cblxuY29uc3Qgb25Qb3N0Qm9vdHN0cmFwID0gYXN5bmMgKFxuICB7IHN0b3JlIH06IFBhcmVudFNwYW5QbHVnaW5BcmdzLFxuICB7IGNvbmZpZ1BhdGggfTogQ3VzdG9tUGx1Z2luT3B0aW9ucyA9IHsgcGx1Z2luczogW10gfSxcbiAgY2FsbGJhY2s/OiBQbHVnaW5DYWxsYmFjayxcbikgPT4ge1xuICAvLyAvLyBnZXQgdGhlIHNjaGVtYSBhbmQgbG9hZCBhbGwgZ3JhcGhxbCBxdWVyaWVzIGZyb20gcGFnZXNcbiAgY29uc3QgeyBzY2hlbWEgfSA9IHN0b3JlLmdldFN0YXRlKCk7XG5cbiAgY29uc3QgcGFyc2VkU2NoZW1hOiBEb2N1bWVudE5vZGUgPSBwYXJzZShwcmludFNjaGVtYShzY2hlbWEpKTtcblxuICBjb25zb2xlLmxvZyhgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PWApO1xuICBjb25zdCBjb25maWcgPSBhd2FpdCBjcmVhdGVDb25maWcoe1xuICAgIGRlZmF1bHRTY2hlbWE6IHBhcnNlZFNjaGVtYSxcbiAgICBjb25maWdQYXRoLFxuICB9KTtcblxuICB0cnkge1xuICAgIGF3YWl0IGdlbmVyYXRlKGNvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXdhaXQgbGlmZWN5Y2xlSG9va3MoY29uZmlnLmhvb2tzKS5vbkVycm9yKGVycm9yLnRvU3RyaW5nKCkpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgY29uc29sZS5sb2coYD09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1gKTtcbiAgY29uc29sZS5sb2coJ0kgd2lsbCBjcmVhdGUgYSBwYWdlIScpO1xuICBjb25zb2xlLmxvZygnVHlwZXNjcmlwdCEnKTtcblxuICAvLyAvLyB0ZWxsIGdhdHNieSB3ZSBhcmUgZG9uZVxuICB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgJiYgY2FsbGJhY2sobnVsbCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBvblBvc3RCb290c3RyYXA7XG4iXX0=
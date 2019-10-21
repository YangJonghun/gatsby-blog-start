"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.loadDocuments = exports.loadSchema = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _graphqlToolkit = require("graphql-toolkit");

var _graphql = require("graphql");

var _core = require("@graphql-codegen/core");

var _path = require("path");

async function getCustomLoaderByPath(path) {
  const requiredModule = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require(`${(0, _path.join)(process.cwd(), path)}`)));

  if (requiredModule && requiredModule.default && typeof requiredModule.default === 'function') {
    return requiredModule.default;
  }

  if (requiredModule && typeof requiredModule === 'function') {
    return requiredModule;
  }

  return null;
}

const loadSchema = async (schemaDef, config) => {
  if (typeof schemaDef === 'object' && schemaDef[Object.keys(schemaDef)[0]] && schemaDef[Object.keys(schemaDef)[0]].loader && typeof schemaDef[Object.keys(schemaDef)[0]].loader === 'string') {
    const pointToSchema = Object.keys(schemaDef)[0];
    const defObject = schemaDef[pointToSchema];
    const loaderString = defObject.loader;

    try {
      const customSchemaLoader = await getCustomLoaderByPath(loaderString);

      if (customSchemaLoader) {
        const returnedSchema = await customSchemaLoader(pointToSchema, config, defObject);

        if (returnedSchema && isGraphQLSchema(returnedSchema)) {
          return (0, _graphqlToolkit.mergeTypeDefs)([returnedSchema]);
        } else {
          throw new Error(`Return value of a custom schema loader must be of type "GraphQLSchema"!`);
        }
      } else {
        throw new Error(`Unable to find a loader function! Make sure to export a default function from your file`);
      }
    } catch (e) {
      throw new _core.DetailedError('Failed to load custom schema loader', `
        Failed to load schema from ${pointToSchema} using loader "${loaderString}":

        ${e.message}
        ${e.stack}
      `, `${pointToSchema} using loader "${loaderString}"`);
    }
  }

  try {
    let pointToSchema = '';
    let options = {};

    if (typeof schemaDef === 'string') {
      pointToSchema = schemaDef;
    } else if (typeof schemaDef === 'object') {
      pointToSchema = Object.keys(schemaDef)[0];
      options = schemaDef[pointToSchema];
    }

    if (config.pluckConfig) {
      options.tagPluck = config.pluckConfig;
    }

    if (config.customFetch) {
      const customFetchStr = config.customFetch;
      const [moduleName, fetchFnName] = customFetchStr.split('#');
      options.fetch = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require(`${moduleName}`))).then(module => fetchFnName ? module[fetchFnName] : module);
    }

    const docs = (await (0, _graphqlToolkit.loadTypedefs)(pointToSchema, options)).map(({
      content
    }) => content);
    return (0, _graphqlToolkit.mergeTypeDefs)(docs);
  } catch (e) {
    throw new _core.DetailedError('Failed to load schema', `
        Failed to load schema from ${schemaDef}:

        ${e.message}
        ${e.stack}

        GraphQL Code Generator supports:
          - ES Modules and CommonJS exports (export as default or named export "schema")
          - Introspection JSON File
          - URL of GraphQL endpoint
          - Multiple files with type definitions (glob expression)
          - String in config file

        Try to use one of above options and run codegen again.

      `);
  }
};

exports.loadSchema = loadSchema;

const loadDocuments = async (documentsDef, config) => {
  const asArray = Array.isArray(documentsDef) ? documentsDef : [documentsDef];
  const loadWithToolkit = [];
  const result = [];

  for (const documentDef of asArray) {
    if (typeof documentDef === 'object' && documentDef[Object.keys(documentDef)[0]] && documentDef[Object.keys(documentDef)[0]].loader && typeof documentDef[Object.keys(documentDef)[0]].loader === 'string') {
      const pointToDoc = Object.keys(documentDef)[0];
      const defObject = documentDef[pointToDoc];
      const loaderString = defObject.loader;

      try {
        const customDocumentLoader = await getCustomLoaderByPath(loaderString);

        if (customDocumentLoader) {
          const returned = await customDocumentLoader(pointToDoc, config);

          if (returned && Array.isArray(returned)) {
            result.push(...returned);
          } else {
            throw new Error(`Return value of a custom schema loader must be an Array of: { filePath: string, content: DocumentNode }`);
          }
        } else {
          throw new Error(`Unable to find a loader function! Make sure to export a default function from your file`);
        }
      } catch (e) {
        throw new _core.DetailedError('Failed to load custom documents loader', `
          Failed to load documents from ${pointToDoc} using loader "${loaderString}":

          ${e.message}
        `);
      }
    } else if (typeof documentDef === 'string') {
      loadWithToolkit.push(documentDef);
    }
  }

  if (loadWithToolkit.length > 0) {
    const loadDocumentsToolkitConfig = {
      ignore: Object.keys(config.generates).map(p => (0, _path.join)(process.cwd(), p))
    };

    if (config.pluckConfig) {
      loadDocumentsToolkitConfig.tagPluck = config.pluckConfig;
    }

    const loadedFromToolkit = await (0, _graphqlToolkit.loadDocuments)(loadWithToolkit, loadDocumentsToolkitConfig);

    if (loadedFromToolkit.length > 0) {
      result.push(...loadedFromToolkit.sort((a, b) => {
        if (a.filePath < b.filePath) {
          return -1;
        }

        if (a.filePath > b.filePath) {
          return 1;
        }

        return 0;
      }));
    }
  }

  console.log(result);
  return result;
};

exports.loadDocuments = loadDocuments;

function isGraphQLSchema(schema) {
  const schemaClass = schema.constructor;
  const className = _graphql.GraphQLSchema.name;
  return className && schemaClass && schemaClass.name === className;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2RlZ2VuL2xvYWQudHMiXSwibmFtZXMiOlsiZ2V0Q3VzdG9tTG9hZGVyQnlQYXRoIiwicGF0aCIsInJlcXVpcmVkTW9kdWxlIiwicHJvY2VzcyIsImN3ZCIsImRlZmF1bHQiLCJsb2FkU2NoZW1hIiwic2NoZW1hRGVmIiwiY29uZmlnIiwiT2JqZWN0Iiwia2V5cyIsImxvYWRlciIsInBvaW50VG9TY2hlbWEiLCJkZWZPYmplY3QiLCJsb2FkZXJTdHJpbmciLCJjdXN0b21TY2hlbWFMb2FkZXIiLCJyZXR1cm5lZFNjaGVtYSIsImlzR3JhcGhRTFNjaGVtYSIsIkVycm9yIiwiZSIsIkRldGFpbGVkRXJyb3IiLCJtZXNzYWdlIiwic3RhY2siLCJvcHRpb25zIiwicGx1Y2tDb25maWciLCJ0YWdQbHVjayIsImN1c3RvbUZldGNoIiwiY3VzdG9tRmV0Y2hTdHIiLCJtb2R1bGVOYW1lIiwiZmV0Y2hGbk5hbWUiLCJzcGxpdCIsImZldGNoIiwidGhlbiIsIm1vZHVsZSIsImRvY3MiLCJtYXAiLCJjb250ZW50IiwibG9hZERvY3VtZW50cyIsImRvY3VtZW50c0RlZiIsImFzQXJyYXkiLCJBcnJheSIsImlzQXJyYXkiLCJsb2FkV2l0aFRvb2xraXQiLCJyZXN1bHQiLCJkb2N1bWVudERlZiIsInBvaW50VG9Eb2MiLCJjdXN0b21Eb2N1bWVudExvYWRlciIsInJldHVybmVkIiwicHVzaCIsImxlbmd0aCIsImxvYWREb2N1bWVudHNUb29sa2l0Q29uZmlnIiwiaWdub3JlIiwiZ2VuZXJhdGVzIiwicCIsImxvYWRlZEZyb21Ub29sa2l0Iiwic29ydCIsImEiLCJiIiwiZmlsZVBhdGgiLCJjb25zb2xlIiwibG9nIiwic2NoZW1hIiwic2NoZW1hQ2xhc3MiLCJjb25zdHJ1Y3RvciIsImNsYXNzTmFtZSIsIkdyYXBoUUxTY2hlbWEiLCJuYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQSxlQUFlQSxxQkFBZixD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LFNBQVMxQixlQUFULENBQXlCNEMsTUFBekIsRUFBK0Q7QUFDN0QsUUFBTUMsV0FBVyxHQUFHRCxNQUFNLENBQUNFLFdBQTNCO0FBQ0EsUUFBTUMsU0FBUyxHQUFHQyx1QkFBY0MsSUFBaEM7QUFDQSxTQUFPRixTQUFTLElBQUlGLFdBQWIsSUFBNEJBLFdBQVcsQ0FBQ0ksSUFBWixLQUFxQkYsU0FBeEQ7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGxvYWRUeXBlZGVmcywgbWVyZ2VUeXBlRGVmcywgbG9hZERvY3VtZW50cyBhcyBsb2FkRG9jdW1lbnRzVG9vbGtpdCB9IGZyb20gJ2dyYXBocWwtdG9vbGtpdCc7XG5pbXBvcnQgeyBUeXBlcyB9IGZyb20gJ0BncmFwaHFsLWNvZGVnZW4vcGx1Z2luLWhlbHBlcnMnO1xuaW1wb3J0IHsgR3JhcGhRTFNjaGVtYSwgRG9jdW1lbnROb2RlIH0gZnJvbSAnZ3JhcGhxbCc7XG5pbXBvcnQgeyBEZXRhaWxlZEVycm9yIH0gZnJvbSAnQGdyYXBocWwtY29kZWdlbi9jb3JlJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0Q3VzdG9tTG9hZGVyQnlQYXRoKHBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gIGNvbnN0IHJlcXVpcmVkTW9kdWxlID0gYXdhaXQgaW1wb3J0KGpvaW4ocHJvY2Vzcy5jd2QoKSwgcGF0aCkpO1xuXG4gIGlmIChyZXF1aXJlZE1vZHVsZSAmJiByZXF1aXJlZE1vZHVsZS5kZWZhdWx0ICYmIHR5cGVvZiByZXF1aXJlZE1vZHVsZS5kZWZhdWx0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVkTW9kdWxlLmRlZmF1bHQ7XG4gIH1cblxuICBpZiAocmVxdWlyZWRNb2R1bGUgJiYgdHlwZW9mIHJlcXVpcmVkTW9kdWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHJlcXVpcmVkTW9kdWxlO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBsb2FkU2NoZW1hID0gYXN5bmMgKHNjaGVtYURlZjogVHlwZXMuU2NoZW1hLCBjb25maWc6IFR5cGVzLkNvbmZpZyk6IFByb21pc2U8RG9jdW1lbnROb2RlPiA9PiB7XG4gIGlmIChcbiAgICB0eXBlb2Ygc2NoZW1hRGVmID09PSAnb2JqZWN0JyAmJlxuICAgIHNjaGVtYURlZltPYmplY3Qua2V5cyhzY2hlbWFEZWYpWzBdXSAmJlxuICAgIChzY2hlbWFEZWZbT2JqZWN0LmtleXMoc2NoZW1hRGVmKVswXV0gYXMgYW55KS5sb2FkZXIgJiZcbiAgICB0eXBlb2YgKHNjaGVtYURlZltPYmplY3Qua2V5cyhzY2hlbWFEZWYpWzBdXSBhcyBhbnkpLmxvYWRlciA9PT0gJ3N0cmluZydcbiAgKSB7XG4gICAgY29uc3QgcG9pbnRUb1NjaGVtYSA9IE9iamVjdC5rZXlzKHNjaGVtYURlZilbMF07XG4gICAgY29uc3QgZGVmT2JqZWN0OiBhbnkgPSBzY2hlbWFEZWZbcG9pbnRUb1NjaGVtYV07XG4gICAgY29uc3QgbG9hZGVyU3RyaW5nID0gZGVmT2JqZWN0LmxvYWRlcjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjdXN0b21TY2hlbWFMb2FkZXIgPSBhd2FpdCBnZXRDdXN0b21Mb2FkZXJCeVBhdGgobG9hZGVyU3RyaW5nKTtcblxuICAgICAgaWYgKGN1c3RvbVNjaGVtYUxvYWRlcikge1xuICAgICAgICBjb25zdCByZXR1cm5lZFNjaGVtYSA9IGF3YWl0IGN1c3RvbVNjaGVtYUxvYWRlcihwb2ludFRvU2NoZW1hLCBjb25maWcsIGRlZk9iamVjdCk7XG5cbiAgICAgICAgaWYgKHJldHVybmVkU2NoZW1hICYmIGlzR3JhcGhRTFNjaGVtYShyZXR1cm5lZFNjaGVtYSkpIHtcbiAgICAgICAgICByZXR1cm4gbWVyZ2VUeXBlRGVmcyhbcmV0dXJuZWRTY2hlbWFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJldHVybiB2YWx1ZSBvZiBhIGN1c3RvbSBzY2hlbWEgbG9hZGVyIG11c3QgYmUgb2YgdHlwZSBcIkdyYXBoUUxTY2hlbWFcIiFgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCBhIGxvYWRlciBmdW5jdGlvbiEgTWFrZSBzdXJlIHRvIGV4cG9ydCBhIGRlZmF1bHQgZnVuY3Rpb24gZnJvbSB5b3VyIGZpbGVgKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRGV0YWlsZWRFcnJvcihcbiAgICAgICAgJ0ZhaWxlZCB0byBsb2FkIGN1c3RvbSBzY2hlbWEgbG9hZGVyJyxcbiAgICAgICAgYFxuICAgICAgICBGYWlsZWQgdG8gbG9hZCBzY2hlbWEgZnJvbSAke3BvaW50VG9TY2hlbWF9IHVzaW5nIGxvYWRlciBcIiR7bG9hZGVyU3RyaW5nfVwiOlxuXG4gICAgICAgICR7ZS5tZXNzYWdlfVxuICAgICAgICAke2Uuc3RhY2t9XG4gICAgICBgLFxuICAgICAgICBgJHtwb2ludFRvU2NoZW1hfSB1c2luZyBsb2FkZXIgXCIke2xvYWRlclN0cmluZ31cImAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgbGV0IHBvaW50VG9TY2hlbWE6IHN0cmluZyA9ICcnO1xuICAgIGxldCBvcHRpb25zOiBhbnkgPSB7fTtcblxuICAgIGlmICh0eXBlb2Ygc2NoZW1hRGVmID09PSAnc3RyaW5nJykge1xuICAgICAgcG9pbnRUb1NjaGVtYSA9IHNjaGVtYURlZiBhcyBzdHJpbmc7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2NoZW1hRGVmID09PSAnb2JqZWN0Jykge1xuICAgICAgcG9pbnRUb1NjaGVtYSA9IE9iamVjdC5rZXlzKHNjaGVtYURlZilbMF07XG4gICAgICBvcHRpb25zID0gc2NoZW1hRGVmW3BvaW50VG9TY2hlbWFdO1xuICAgIH1cblxuICAgIGlmIChjb25maWcucGx1Y2tDb25maWcpIHtcbiAgICAgIG9wdGlvbnMudGFnUGx1Y2sgPSBjb25maWcucGx1Y2tDb25maWc7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jdXN0b21GZXRjaCkge1xuICAgICAgY29uc3QgY3VzdG9tRmV0Y2hTdHIgPSBjb25maWcuY3VzdG9tRmV0Y2g7XG4gICAgICBjb25zdCBbbW9kdWxlTmFtZSwgZmV0Y2hGbk5hbWVdID0gY3VzdG9tRmV0Y2hTdHIuc3BsaXQoJyMnKTtcbiAgICAgIG9wdGlvbnMuZmV0Y2ggPSBhd2FpdCBpbXBvcnQobW9kdWxlTmFtZSkudGhlbihtb2R1bGUgPT4gKGZldGNoRm5OYW1lID8gbW9kdWxlW2ZldGNoRm5OYW1lXSA6IG1vZHVsZSkpO1xuICAgIH1cblxuICAgIGNvbnN0IGRvY3MgPSAoYXdhaXQgbG9hZFR5cGVkZWZzKHBvaW50VG9TY2hlbWEsIG9wdGlvbnMpKS5tYXAoKHsgY29udGVudCB9KSA9PiBjb250ZW50KTtcblxuICAgIHJldHVybiBtZXJnZVR5cGVEZWZzKGRvY3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IERldGFpbGVkRXJyb3IoXG4gICAgICAnRmFpbGVkIHRvIGxvYWQgc2NoZW1hJyxcbiAgICAgIGBcbiAgICAgICAgRmFpbGVkIHRvIGxvYWQgc2NoZW1hIGZyb20gJHtzY2hlbWFEZWZ9OlxuXG4gICAgICAgICR7ZS5tZXNzYWdlfVxuICAgICAgICAke2Uuc3RhY2t9XG5cbiAgICAgICAgR3JhcGhRTCBDb2RlIEdlbmVyYXRvciBzdXBwb3J0czpcbiAgICAgICAgICAtIEVTIE1vZHVsZXMgYW5kIENvbW1vbkpTIGV4cG9ydHMgKGV4cG9ydCBhcyBkZWZhdWx0IG9yIG5hbWVkIGV4cG9ydCBcInNjaGVtYVwiKVxuICAgICAgICAgIC0gSW50cm9zcGVjdGlvbiBKU09OIEZpbGVcbiAgICAgICAgICAtIFVSTCBvZiBHcmFwaFFMIGVuZHBvaW50XG4gICAgICAgICAgLSBNdWx0aXBsZSBmaWxlcyB3aXRoIHR5cGUgZGVmaW5pdGlvbnMgKGdsb2IgZXhwcmVzc2lvbilcbiAgICAgICAgICAtIFN0cmluZyBpbiBjb25maWcgZmlsZVxuXG4gICAgICAgIFRyeSB0byB1c2Ugb25lIG9mIGFib3ZlIG9wdGlvbnMgYW5kIHJ1biBjb2RlZ2VuIGFnYWluLlxuXG4gICAgICBgLFxuICAgICk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBsb2FkRG9jdW1lbnRzID0gYXN5bmMgKFxuICBkb2N1bWVudHNEZWY6IFR5cGVzLkluc3RhbmNlT3JBcnJheTxUeXBlcy5PcGVyYXRpb25Eb2N1bWVudD4sXG4gIGNvbmZpZzogVHlwZXMuQ29uZmlnLFxuKTogUHJvbWlzZTxUeXBlcy5Eb2N1bWVudEZpbGVbXT4gPT4ge1xuICBjb25zdCBhc0FycmF5OiBUeXBlcy5PcGVyYXRpb25Eb2N1bWVudFtdID0gQXJyYXkuaXNBcnJheShkb2N1bWVudHNEZWYpID8gZG9jdW1lbnRzRGVmIDogW2RvY3VtZW50c0RlZl07XG4gIGNvbnN0IGxvYWRXaXRoVG9vbGtpdDogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgcmVzdWx0OiBUeXBlcy5Eb2N1bWVudEZpbGVbXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgZG9jdW1lbnREZWYgb2YgYXNBcnJheSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBkb2N1bWVudERlZiA9PT0gJ29iamVjdCcgJiZcbiAgICAgIGRvY3VtZW50RGVmW09iamVjdC5rZXlzKGRvY3VtZW50RGVmKVswXV0gJiZcbiAgICAgIChkb2N1bWVudERlZltPYmplY3Qua2V5cyhkb2N1bWVudERlZilbMF1dIGFzIGFueSkubG9hZGVyICYmXG4gICAgICB0eXBlb2YgKGRvY3VtZW50RGVmW09iamVjdC5rZXlzKGRvY3VtZW50RGVmKVswXV0gYXMgYW55KS5sb2FkZXIgPT09ICdzdHJpbmcnXG4gICAgKSB7XG4gICAgICBjb25zdCBwb2ludFRvRG9jID0gT2JqZWN0LmtleXMoZG9jdW1lbnREZWYpWzBdO1xuICAgICAgY29uc3QgZGVmT2JqZWN0ID0gZG9jdW1lbnREZWZbcG9pbnRUb0RvY107XG4gICAgICBjb25zdCBsb2FkZXJTdHJpbmcgPSBkZWZPYmplY3QubG9hZGVyO1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjdXN0b21Eb2N1bWVudExvYWRlciA9IGF3YWl0IGdldEN1c3RvbUxvYWRlckJ5UGF0aChsb2FkZXJTdHJpbmcpO1xuXG4gICAgICAgIGlmIChjdXN0b21Eb2N1bWVudExvYWRlcikge1xuICAgICAgICAgIGNvbnN0IHJldHVybmVkID0gYXdhaXQgY3VzdG9tRG9jdW1lbnRMb2FkZXIocG9pbnRUb0RvYywgY29uZmlnKTtcblxuICAgICAgICAgIGlmIChyZXR1cm5lZCAmJiBBcnJheS5pc0FycmF5KHJldHVybmVkKSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goLi4ucmV0dXJuZWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBSZXR1cm4gdmFsdWUgb2YgYSBjdXN0b20gc2NoZW1hIGxvYWRlciBtdXN0IGJlIGFuIEFycmF5IG9mOiB7IGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IERvY3VtZW50Tm9kZSB9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGZpbmQgYSBsb2FkZXIgZnVuY3Rpb24hIE1ha2Ugc3VyZSB0byBleHBvcnQgYSBkZWZhdWx0IGZ1bmN0aW9uIGZyb20geW91ciBmaWxlYCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IERldGFpbGVkRXJyb3IoXG4gICAgICAgICAgJ0ZhaWxlZCB0byBsb2FkIGN1c3RvbSBkb2N1bWVudHMgbG9hZGVyJyxcbiAgICAgICAgICBgXG4gICAgICAgICAgRmFpbGVkIHRvIGxvYWQgZG9jdW1lbnRzIGZyb20gJHtwb2ludFRvRG9jfSB1c2luZyBsb2FkZXIgXCIke2xvYWRlclN0cmluZ31cIjpcblxuICAgICAgICAgICR7ZS5tZXNzYWdlfVxuICAgICAgICBgLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50RGVmID09PSAnc3RyaW5nJykge1xuICAgICAgbG9hZFdpdGhUb29sa2l0LnB1c2goZG9jdW1lbnREZWYpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsb2FkV2l0aFRvb2xraXQubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGxvYWREb2N1bWVudHNUb29sa2l0Q29uZmlnOiBhbnkgPSB7XG4gICAgICBpZ25vcmU6IE9iamVjdC5rZXlzKGNvbmZpZy5nZW5lcmF0ZXMpLm1hcChwID0+IGpvaW4ocHJvY2Vzcy5jd2QoKSwgcCkpLFxuICAgIH07XG5cbiAgICBpZiAoY29uZmlnLnBsdWNrQ29uZmlnKSB7XG4gICAgICBsb2FkRG9jdW1lbnRzVG9vbGtpdENvbmZpZy50YWdQbHVjayA9IGNvbmZpZy5wbHVja0NvbmZpZztcbiAgICB9XG5cbiAgICBjb25zdCBsb2FkZWRGcm9tVG9vbGtpdCA9IGF3YWl0IGxvYWREb2N1bWVudHNUb29sa2l0KGxvYWRXaXRoVG9vbGtpdCwgbG9hZERvY3VtZW50c1Rvb2xraXRDb25maWcpO1xuXG4gICAgaWYgKGxvYWRlZEZyb21Ub29sa2l0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHJlc3VsdC5wdXNoKFxuICAgICAgICAuLi5sb2FkZWRGcm9tVG9vbGtpdC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgaWYgKGEuZmlsZVBhdGggPCBiLmZpbGVQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGEuZmlsZVBhdGggPiBiLmZpbGVQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZnVuY3Rpb24gaXNHcmFwaFFMU2NoZW1hKHNjaGVtYTogYW55KTogc2NoZW1hIGlzIEdyYXBoUUxTY2hlbWEge1xuICBjb25zdCBzY2hlbWFDbGFzcyA9IHNjaGVtYS5jb25zdHJ1Y3RvcjtcbiAgY29uc3QgY2xhc3NOYW1lID0gR3JhcGhRTFNjaGVtYS5uYW1lO1xuICByZXR1cm4gY2xhc3NOYW1lICYmIHNjaGVtYUNsYXNzICYmIHNjaGVtYUNsYXNzLm5hbWUgPT09IGNsYXNzTmFtZTtcbn1cbiJdfQ==
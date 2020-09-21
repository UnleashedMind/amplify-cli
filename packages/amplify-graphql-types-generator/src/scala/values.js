import { join, wrap } from '../utilities/printing';

export function escapedString(string) {
  return string.replace(/"/g, '\\"');
}

// Incomplete string escaping or encoding aws-amplify-cli
// packages/amplify-graphql-types-generator/src/scala/values.js#L4 aEURC/ Detected 15 days ago

export function multilineString(context, string) {
  const lines = string.split('\n');
  lines.forEach((line, index) => {
    const isLastLine = index != lines.length - 1;
    context.printOnNewline(`"${escapedString(line)}"` + (isLastLine ? ' +' : ''));
  });
}

export function dictionaryLiteralForFieldArguments(args) {
  function expressionFromValue(value) {
    if (value.kind === 'Variable') {
      return `Variable("${value.variableName}")`;
    } else if (Array.isArray(value)) {
      return wrap('[', join(value.map(expressionFromValue), ', '), ']');
    } else if (typeof value === 'object') {
      return wrap(
        '[',
        join(
          Object.entries(value).map(([key, value]) => {
            return `"${key}": ${expressionFromValue(value)}`;
          }),
          ', '
        ) || ':',
        ']'
      );
    } else {
      return JSON.stringify(value);
    }
  }

  return wrap(
    '[',
    join(
      args.map(arg => {
        return `"${arg.name}": ${expressionFromValue(arg.value)}`;
      }),
      ', '
    ) || ':',
    ']'
  );
}

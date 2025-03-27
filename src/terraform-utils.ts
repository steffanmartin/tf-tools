const typesMap: { [key: string]: string} = {
  'resource': 'resources',
  'data': 'data-sources'
};

export function splitType(str: string): [string, string] | undefined {
  const pattern = /\s*(resource|data) "([^"]+)" "([^"]+)" \{\s*/;
  const match = pattern.exec(str);

  if (!match) {
    return undefined;
  }

  const type = typesMap[match[1]];
  const value = match[2];
  return [type, value];
}

export function splitProvider(str: string): [string, string] | undefined {
  const parts = str.split('_');
  if (parts.length < 2) {
    return undefined;
  }

  const provider = parts[0];
  const suffix = str.slice(provider.length + 1);
  return [provider, suffix];
}
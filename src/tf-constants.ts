export const tfRegex = /\b(resource|data) "([^"]+)" "([^"]+)" \{\s*/g;

export const typesMap: { [key: string]: string } = {
  resource: "resources",
  data: "data-sources",
};

export const knownProviders: { [key: string]: string } = {
  alicloud: "aliyun",
  azapi: "azure",
  oci: "oracle",
};

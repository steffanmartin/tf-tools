import * as vscode from "vscode";
import path from "path";

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

export function getCanonicalVersion(versionConstraint: string): string {
  if (versionConstraint.startsWith("~>")) {
    const baseVersion = versionConstraint.slice(2).trim();
    let versionParts = baseVersion.split(".");
    while (versionParts.length < 3) {
      versionParts.push("0");
    }
    return versionParts.join(".");
  }

  if (
    versionConstraint.startsWith(">=") ||
    versionConstraint.startsWith("<=")
  ) {
    const baseVersion = versionConstraint.slice(2).trim();
    return baseVersion;
  }

  if (versionConstraint.startsWith(">")) {
    const baseVersion = versionConstraint.slice(1).trim();
    let versionParts = baseVersion.split(".");
    const patchVersion = Number.parseInt(versionParts[2]) + 1;
    versionParts[2] = patchVersion.toString();
    return versionParts.join(".");
  }

  if (versionConstraint.startsWith("<")) {
    const baseVersion = versionConstraint.slice(1).trim();
    let versionParts = baseVersion.split(".");
    let idx = 2;
    while (idx >= 0) {
      const part = Number.parseInt(versionParts[idx]);
      if (part > 0) {
        versionParts[idx] = (part - 1).toString();
        break;
      }
      idx--;
    }

    return versionParts.join(".");
  }

  if (versionConstraint.startsWith("=")) {
    const baseVersion = versionConstraint.slice(1).trim();
    return baseVersion;
  }

  return versionConstraint;
}

async function readFile(filePath: string): Promise<string> {
  const uri = vscode.Uri.file(filePath);
  const fileData = await vscode.workspace.fs.readFile(uri);
  return Buffer.from(fileData).toString("utf-8");
}

async function readDirectory(dirPath: string): Promise<string[]> {
  const uri = vscode.Uri.file(dirPath);
  const entries = await vscode.workspace.fs.readDirectory(uri);
  return entries.map(([name]) => name);
}

class ProviderInfo {
  constructor(
    public name: string,
    public publisher: string = "hashicorp",
    public version: string = "latest"
  ) {
    if (name in knownProviders) {
      this.publisher = knownProviders[name];
    }
  }

  static fromConfigBlock(
    provider: string,
    configBlock: string,
    useLatestVersion: boolean = false
  ): ProviderInfo {
    const info = new ProviderInfo(provider);

    const sourceMatch = configBlock.match(/source\s*=\s*"([^"]+)"/);
    if (sourceMatch) {
      const [publisher] = sourceMatch[1].split("/");
      if (publisher) {
        info.publisher = publisher.trim();
      }
    }

    const versionMatch = configBlock.match(/version\s*=\s*"([^"]+)"/);
    if (versionMatch && !useLatestVersion) {
      const versionConstraint = versionMatch[1].trim();
      info.version = getCanonicalVersion(versionConstraint);
    }

    return info;
  }

  toString(): string {
    return `${this.publisher}/${this.name}/${this.version}`;
  }
}

export async function getProviderInfoInCurrentModule(
  provider: string,
  modulePath: string,
  useLatestVersion: boolean = false
): Promise<string> {
  const versionsFilePath = path.join(modulePath, "versions.tf");
  const defaultProviderInfo = new ProviderInfo(provider).toString();

  try {
    const files = await readDirectory(modulePath);
    if (!files.includes("versions.tf")) {
      return defaultProviderInfo;
    }

    const content = await readFile(versionsFilePath);

    const providerRegex = new RegExp(
      `${provider}\\s*=\\s*{\\s*([^}]+)\\s*}`,
      "s"
    );
    const match = content.match(providerRegex);

    if (!match) {
      return defaultProviderInfo;
    }

    const block = match[1];
    const providerInfo = ProviderInfo.fromConfigBlock(
      provider,
      block,
      useLatestVersion
    );

    return providerInfo.toString();
  } catch (err) {
    console.error("Error reading provider info:", err);
    return defaultProviderInfo;
  }
}

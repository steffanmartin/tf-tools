import * as vscode from "vscode";
import { getModuleSourceUri, getProviderInfoInCurrentModule, tfRegex, typesMap } from "./tf-utils";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "tf-tools" is now active!');

  const config = vscode.workspace.getConfiguration("tf-tools");
  const useLatestVersion =
    config.get<boolean>("alwaysUseLatestProviderVersion") || false;

  const terraformFileSelector = { scheme: "file", language: "terraform" };

  const terraformLinkProvider = vscode.languages.registerDocumentLinkProvider(
    terraformFileSelector,
    {
      async provideDocumentLinks(document, token) {
        return await provideTerraformDocumentLinks(document, useLatestVersion);
      },
    }
  );

  context.subscriptions.push(terraformLinkProvider);
}

export function deactivate() {}

async function provideTerraformDocumentLinks(
  document: vscode.TextDocument,
  useLatestVersion: boolean
) {
  const text = document.getText();
  const filePath = document.uri.fsPath.replace(/\\/g, "/");
  const modulePath = path.dirname(filePath);
  let links: vscode.DocumentLink[] = [];
  let match;

  // Resource and data source links
  const providerInfos: { [key: string]: string } = {};
  while ((match = tfRegex.resourceData.exec(text)) !== null) {
    const type = typesMap[match[1]];
    const target = match[2];
    const provider = target.split("_")[0];
    const value = target.slice(provider.length + 1);

    const start = document.positionAt(match.index + match[0].indexOf(target));
    const end = document.positionAt(
      match.index + match[0].indexOf(target) + target.length
    );
    const range = new vscode.Range(start, end);

    let providerInfo;
    if (provider in providerInfos) {
      providerInfo = providerInfos[provider];
    } else {
      providerInfo = await getProviderInfoInCurrentModule(
        provider,
        modulePath,
        useLatestVersion
      );
      providerInfos[provider] = providerInfo;
    }

    const url = vscode.Uri.parse(
      `https://registry.terraform.io/providers/${providerInfo}/docs/${type}/${value}`
    );
    const link = new vscode.DocumentLink(range, url);
    link.tooltip = `Go to Terraform Registry Docs for \`${target}\``;
    links.push(link);
  }

  // Module links
  while ((match = tfRegex.module.exec(text)) !== null) {
    const module = match[1];
    const source = match[2];
    const start = document.positionAt(match.index + match[0].indexOf(module));
    const end = document.positionAt(
      match.index + match[0].indexOf(module) + module.length
    );
    const range = new vscode.Range(start, end);

    const moduleUri = await getModuleSourceUri(modulePath, source);
    const link = new vscode.DocumentLink(range, moduleUri);
    link.tooltip = `Go to module declaration for \`${module}\``;
    links.push(link);
  }

  return links;
}

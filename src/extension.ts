import * as vscode from "vscode";
import { getProviderInfoInCurrentModule, tfRegex, typesMap } from "./tf-utils";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "tf-tools" is now active!');

  const config = vscode.workspace.getConfiguration("tf-tools");
  const useLatestVersion = config.get<boolean>(
    "alwaysUseLatestProviderVersion"
  );

  const linkProvider = vscode.languages.registerDocumentLinkProvider(
    { scheme: "file", language: "terraform" },
    {
      async provideDocumentLinks(document, token) {
        const text = document.getText();
        const providerInfos: { [key: string]: string } = {};
        let links: vscode.DocumentLink[] = [];
        let match;
        while ((match = tfRegex.exec(text)) !== null) {
          const type = typesMap[match[1]];
          const target = match[2];
          const provider = target.split("_")[0];
          const value = target.slice(provider.length + 1);

          const start = document.positionAt(
            match.index + match[0].indexOf(target)
          );
          const end = document.positionAt(
            match.index + match[0].indexOf(target) + target.length
          );
          const range = new vscode.Range(start, end);

          let providerInfo;
          if (provider in providerInfos) {
            providerInfo = providerInfos[provider];
          } else {
            const filePath = document.uri.fsPath.replace(/\\/g, "/");
            const modulePath = path.dirname(filePath);
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

        return links;
      },
    }
  );

  context.subscriptions.push(linkProvider);
}

export function deactivate() {}

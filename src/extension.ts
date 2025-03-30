import * as vscode from "vscode";
import { knownProviders, tfRegex, typesMap } from "./tf-constants";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "tf-tools" is now active!');

  const linkProvider = vscode.languages.registerDocumentLinkProvider(
    { scheme: "file", language: "terraform" },
    {
      provideDocumentLinks(document, token) {
        const text = document.getText();
        let links: vscode.DocumentLink[] = [];
        let match;
        while ((match = tfRegex.exec(text)) !== null) {
          const type = typesMap[match[1]];
          const target = match[2];
          const provider = target.split("_")[0];
          const publisher =
            provider in knownProviders ? knownProviders[provider] : "hashicorp";
          const value = target.slice(provider.length + 1);

          const start = document.positionAt(
            match.index + match[0].indexOf(target)
          );
          const end = document.positionAt(
            match.index + match[0].indexOf(target) + target.length
          );
          const range = new vscode.Range(start, end);

          const url = vscode.Uri.parse(
            `https://registry.terraform.io/providers/${publisher}/${provider}/latest/docs/${type}/${value}`
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

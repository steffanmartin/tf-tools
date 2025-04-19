import * as vscode from "vscode";
import * as assert from "assert";
import { getCanonicalVersion } from "../tf-utils";

suite("tf-utils Test Suite", () => {
  suiteTeardown(() => {
    vscode.window.showInformationMessage("All tests completed.");
  });

  test("getCanonicalVersion", () => {
    assert.equal(getCanonicalVersion("~> 1.2"), "1.2.0");
    assert.equal(getCanonicalVersion("~> 1.2.3"), "1.2.3");
    assert.equal(getCanonicalVersion(">= 1.2.3"), "1.2.3");
    assert.equal(getCanonicalVersion("<= 1.2.3"), "1.2.3");
    assert.equal(getCanonicalVersion("> 1.2.3"), "1.2.4");
    assert.equal(getCanonicalVersion("< 1.2.3"), "1.2.2");
    assert.equal(getCanonicalVersion("< 1.0.0"), "0.0.0");
    assert.equal(getCanonicalVersion("= 1.2.3"), "1.2.3");
    assert.equal(getCanonicalVersion("1.2.3"), "1.2.3");
    assert.equal(getCanonicalVersion("invalid"), "invalid");
  });
});

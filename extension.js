const path = require('path');

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.workspace.onDidOpenTextDocument(possiblyChangeLanguageMode);
	context.subscriptions.push(disposable);

	// This extension is activated after vscode is launched and files in the
	// previous session are restored (in case window.restoreWindows is enabled).
	// So we need to traverse the restored files and set the language mode
	// if necessary.
	for (let doc of vscode.workspace.textDocuments) {
		possiblyChangeLanguageMode(doc);
	}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

/**
 * @param {vscode.TextDocument} doc
 */
function possiblyChangeLanguageMode(doc) {
	let hasNoExtension = !path.basename(doc.fileName).includes(".");
	if (hasNoExtension && isCppHeader(doc)) {
		vscode.languages.setTextDocumentLanguage(doc, "cpp");
	}
}

/**
 * @param {vscode.TextDocument} doc
 * @returns {boolean}
 */
function isCppHeader(doc) {
	return hasIncludeGuard(doc) || hasMagicComment(doc);
}

/**
 * @param {vscode.TextDocument} doc
 * @returns {boolean}
 */
function hasIncludeGuard(doc) {
	const MAX_SEARCH_LINES = 200;
	let searchLines = Math.min(doc.lineCount, MAX_SEARCH_LINES);

	// search #ifndef
	let i;
	for (i = 0; i < searchLines; i++) {
		let line = doc.lineAt(i).text;
		if (/#\s*ifndef\s+/.test(line)) {
			break;
		}
	}

	// found, expect #define in the next line
	if (i != searchLines) {
		let line = doc.lineAt(i + 1).text;
		if (/#\s*define\s+/.test(line)) {
			return true;
		}
	}

	// not found
	return false;
}

/**
 * @param {vscode.TextDocument} doc
 * @returns {boolean}
 */
function hasMagicComment(doc) {
	return doc.lineAt(0).text.includes("-*- C++ -*-");
}

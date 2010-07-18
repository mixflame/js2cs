Usage
----------

[CoffeeScript](http://www.coffeescript.com)

<code>
node js2cs.js <run_mode> file_to_convert
</code>

Options: --debug, --ilevel, --convert

--debug: Print the AST tree to STDIO.

--ilevel: Show node types, names and indent levels.

--convert: Output converted program to stdout.

Browser demo is in /example

Known Limitations
--------------------

* Limited by PEG.js's ability to read your syntax. You may (will) have to refactor it to use this tool.

* No support for LabelledStatement. Only used with BreakStatement (break) which is not used in Coffee.

* Untested. Not symbol-for-symbol, token-for-token.

* For Statements are turned into While statements in Coffee because Coffee's For is one-way to JavaScript (can't be translated back to that.)

* Comma operator (,) compiles to \n. Not supported in CoffeeScript.

* Postfix expression like ++i is not handled yet.

* Else if is NOT supported by the PEGjs grammar. You can use if { stuff; } else { if() { stuff; } }.

* No one line if statements.

--
Jonathan Silverman ("jsilver")

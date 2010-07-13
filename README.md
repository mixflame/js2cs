Usage
----------

<code>
node js2cs.js input.js --convert
</code>

Options: --debug, --ilevel, --convert

Note: Doesn't write a file. Writes to StdOut.

Browser demo is in /example

Known Limitation
--------------------

* "return" is broken.

* No support for LabelledStatement.

* Very finicky about if and else if statements.

* Incomplete. If you find something that isn't implemented, add it to the top of test.js and pull request me.

--
Jonathan Silverman ("jsilver")

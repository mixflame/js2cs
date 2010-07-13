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

* Return is broken.

* No support for LabelledStatement.

* Very finicky about if and else if statements. To fix, change from

<code>
if (condition) {

}
</code>
to
<code>
if(condition)
{

}
</code>
and
<code>
} else if (condition) {

}
</code>
to
<code>
}
else
if(condition)
{

}
</code>

--

Jonathan Silverman ("jsilver")

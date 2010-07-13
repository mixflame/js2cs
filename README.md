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

Example
-------------------
Original JavaScript: 
<code>
/* while */
while(f > 100){
  something();
}

/* labelled statement. not implemented in coffee */
mine: "blah"

/* return is broken here (disused but not a token) */
var crazy = function(arg, arg) {
  return 0;
}

/* try catch finally */
try
{
  insane_shit_that_would_never_work();
}
catch(e)
{
  e.message = "what happened to your error";
}
finally
{
  blow_up_and_die();
  fuckOff();
}

/* switch */
switch(being_switched)
{
  case('acceptable'):
    software();
    other();
    break;
  case('else'):
    blowUpTheWorld();
    break;
  case(234):
    fuck();
  default:
    what();
    fuckwatt();
    break;
}

/* for */
for(_e = 0, _g = thing.length; _e < _g; _e--)
{
  bff_art();
}

/* this */
this.a = 1;

/* property access and assignment */
jonathan.property = 1;


/* regular if */
if(thing !== true && bad_people_were_supposed_to_come === true)
{
  /* variable and object literal */
  var top_level = { the_key : true, thing : 'catastrophic' };
  /* function */
  function(simple, strange)
  {
    /* function call with many literals */
    print("this is such a simple program!", 1, 0.22, null, [1, 2, [4, "hello"]]);
    print("this was something else");
    /* variable, assignment and function */
  }
  print("it will break");
  complain();
}
else
{
  badStuff(0);
  program.asplode(/linux/);
}

/* unless */
if(!(answer === false))
{
}

/* conditional expression */
question ? true : false;
</code>


Generated CoffeeScript: 
<code>
while f > 100
  something

crazy: (arg, arg) ->
  return 0
try
  insane_shit_that_would_never_work
catch e
  e.message: 'what happened to your error'
finally
  blow_up_and_die
  fuckOff
switch being_switched
  when 'acceptable'
    software
    other
  when 'else' then blowUpTheWorld
  when 234
    fuck
  else 
    what
    fuckwatt
_e: 0 
_g: thing.length
while _e < _g
  _e = _e - 1
  bff_art
@a: 1
jonathan.property: 1
if thing isnt true and bad_people_were_supposed_to_come is yes
  top_level: {
    the_key : yes
    thing : 'catastrophic'
}
  (simple, strange) ->
    print 'this is such a simple program!', 1, 0.22, null, [1, 2, [4, 'hello']]
    print 'this was something else'
  print 'it will break'
  complain
else
  badStuff 0
  program.asplode /linux/
unless answer is no

if question true else no
</code>

--
Jonathan Silverman ("jsilver")

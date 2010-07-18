/*#!/usr/bin/env node*/
var parser = require('./parser').parser;
var sys = require('sys');
var fs = require('fs');

/* object inspect method */
var p = function(obj)
{
var obj_inspect = sys.inspect(obj, true, 100);
sys.puts(obj_inspect);
}

/* the missing trim method */
String.prototype.trim = function()
{
var str_to_return = this.replace(/^\s*/, "");
str_to_return = str_to_return.replace(/\s*$/, "");
return str_to_return;
}

/* read input (sync) */
try
{
var string_raw_js = fs.readFileSync(process.argv[2], "utf8");
} catch(e) {
sys.log("Failed to read input file.. Did you specify one?");
process.exit(1);
}


/* parse section */
try{
var ast = parser.parse(string_raw_js);
} catch(e) {
sys.log(e.name + " on line " + e.line + " on column " + e.column + ": " + e.message);
process.exit(1);
}

var output = '';
var iteration = 0;
var indent_level = 0;
var increaseIndent = function() {
  indent_level = indent_level + 1;
}
var decreaseIndent = function() {
  indent_level = indent_level - 1;
}
var indent = function()
{ 
  for(var c = 0; c < indent_level; c++)
  {
              addToOut("  ");
  }
}

var addToOut = function(out) {
  output += out;
}

/* calls parseNode on a collection of child nodes (statements, elements, properties, clauses) */
var parseChildNodes = function(nodes) {
  for(var i = 0; i < nodes.length; i++) {
        /* some logic */
        _node = nodes[i];
        is_last_statement = (i < nodes.length -1);
        is_just_var = (is_last_statement && (_node.type == "Variable")); /* variables are not declared this way in coffee */
        is_break = (_node.type == "BreakStatement"); /* not used in coffee */
        /* also don't parse labelledStatement. it's not used and we can't have empty cases if we wanna self host */
        is_labelled_statement = (_node.type == "LabelledStatement");
        /* indenter */
        
        if(!(is_break)) {
          indent();
        }
        
        /* token parser */
        if(!(is_just_var) && !(is_break))
        {
        parseNode(_node);
        }
        /* line breaker */
        /*if((is_last_statement) && !(is_break) && !(is_just_var))
        {
        addToOut("\n");
        }
        */
        addToOut("\n");
      }
}

/* eats tokens and makes coffee */
var parseNode = function(node) {
  iteration = iteration + 1;

  if(process.argv[3] == "--debug")
  {
    sys.puts(iteration + " " + node.type);
    p(node);
  } 

  if(process.argv[3] == "--ilevel")
  {
    sys.puts(iteration + " (" + indent_level + ") " +  node.type + " - " + node.name);
  } 

  switch(node.type)
  {
    case("Program"):
      if(node.elements)
      {
      parseChildNodes(node.elements);
      }
      break;
    case("This"):
      addToOut("@");
      break;
    case("Function"):
      if(node.params.length > 0)
      {
        addToOut("(");
        for(var i = 0; i < node.params.length; i++)
        {
          /* this tokenizer is probably broken. node.params node should be parsed. */
          
          addToOut(node.params[i]);
          
          /*arseNode(node.params[i]);*/
          if(i < node.params.length - 1) 
          {
          addToOut(", ");
          }
        }
        addToOut(")");
      }
      addToOut("->\n");
      increaseIndent();
      if(node.elements)
      {
      parseChildNodes(node.elements);
      }
      decreaseIndent();
      break;
    case("Block"):
      increaseIndent();
      if(node.statements)
      {
      parseChildNodes(node.statements);
      }
      decreaseIndent();
      break;
    case("SwitchStatement"):
      addToOut("switch ");
      parseNode(node.expression);
      addToOut("\n");
      increaseIndent();
      parseChildNodes(node.clauses);
      decreaseIndent();
      break;
    case("CaseClause"):
      addToOut("when ");
      parseNode(node.selector);
      /* 2 is the minimum because break; is a statement too */
      if((node.statements.length > 2) || (node.statements.length == 1))
      {
        addToOut("\n");
        increaseIndent();
        if(node.statements)
        {
        parseChildNodes(node.statements);
        }
        decreaseIndent();
      }
      else
      {
        if(node.statements.length == 2)
        {
          addToOut(" then ");
          if(node.statements) 
          {
          parseNode(node.statements[0]);
          }
        }
      }
      break;
    case("DefaultClause"):
      addToOut("else ");
      if(node.statements.length > 1)
      {
        addToOut("\n");
        increaseIndent();
        if(node.statements) 
        {
        parseChildNodes(node.statements);
        }
        decreaseIndent();
      }
      else
      {
        if(node.statements.length == 1)
        {
          addToOut(" then ");
          if(node.statements) 
          {
          parseNode(node.statements[0]);
          }
        }
      }
      break;
    case("IfStatement"):
      /* condition */
      if(node.condition.operator != "!")
      {
        addToOut("if ");
        parseNode(node.condition);
      }
      else
      {
        addToOut("unless ");
        /* skip next node, it's "not" */
        parseNode(node.condition.expression);
      }
      addToOut("\n");
      /* statements */
      increaseIndent();
      if(node.ifStatement.statements) 
      { 
      parseChildNodes(node.ifStatement.statements);
      }
      decreaseIndent();
      if(node.elseStatement != null) {
      addToOut("\n");
      indent();
      addToOut("else"); /* limitation: javascript.pegjs doesnt know else
if */
      addToOut("\n");
      increaseIndent();
      if(node.elseStatement.statements) 
      {
      parseChildNodes(node.elseStatement.statements);
      }
      decreaseIndent();
      }
      break;
    case("ForStatement"):
      /* converts to while because this mode is unsupported */
      parseNode(node.initializer);
      addToOut("\n");
      indent();
      addToOut("while ");
      parseNode(node.test);
      addToOut("\n");
      increaseIndent();
      /*parseChildNodes([node.counter]);  bad hack to get indent level lul */
      indent();
      parseNode(node.counter); /* if possible do a test on the counter to see if it's ++i or i++ (they are different) */
      decreaseIndent();
      if(node.statement)
      {
      parseNode(node.statement);
      }
      break;
    case("WhileStatement"):
      addToOut("while ");
      parseNode(node.condition);
      addToOut("\n");
      if(node.statement)
      { 
      parseNode(node.statement);
      }
      break;
    case("TryStatement"):
      /* epic self translating challenge here */
      addToOut("try\n");
      parseNode(node.block);
      addToOut("\n");
      if(node['catch']) {
      addToOut("catch ");
      parseNode(node['catch']);
      }
      if(node['finally']) {
      addToOut("finally\n");
      parseNode(node['finally']);
      }
      break;
    case("Catch"):
      if(node.identifier) 
      {
      addToOut(node.identifier);
      }
      addToOut("\n");
      parseNode(node.block);
      addToOut("\n");
      break;
    case("Finally"):
      parseNode(node.block);
      break;
    case("AssignmentExpression"):
      parseNode(node.left);
      addToOut(": ");
      parseNode(node.right);
      break;
    case("PropertyAssignment"):
      /*addToOut(node.name);*/
      parseNode(node.name);
      addToOut(": ");
      parseNode(node.value);
      break;
    case("PropertyAccess"):
      parseNode(node.base);
      if(node.name.type)
      {
        var node_dot_name_is_numeric_literal = (node.name.type == "NumericLiteral");
        var node_dot_name_is_string_literal = (node.name.type == "StringLiteral");
        if(node.base.type != "This" && !(node_dot_name_is_numeric_literal) && !(node_dot_name_is_string_literal)) { addToOut("."); }
        if(node_dot_name_is_numeric_literal || node_dot_name_is_string_literal) { addToOut("["); }
        parseNode(node.name);
        if(node_dot_name_is_numeric_literal || node_dot_name_is_string_literal) { addToOut("]"); }
      }
      else
      {
        if(node.name.type == undefined || node.name.type == "null")
        {
          if(node.base.type != "This") { addToOut("."); }
          addToOut(node.name.trim());
        }
      }      
      break;
    case("BinaryExpression"):
      parseNode(node.left);
      addToOut(" ");
      switch(node.operator)
      {
      /* switch to "not" and "isnt" or something here */
      case("!"):
        addToOut("not ");
        break;
      case("==="):
        addToOut("is ");
        break;
      case("!=="):
        addToOut("isnt ");
        break;
      case("&&"):
        addToOut("and ");
        break;
      case("||"):
        addToOut("or ");
        break;   
      case(","):
        addToOut("\n"); /* no support for that operator yet. try to evaluate on seperate lines. */
        break;   
      default:
        addToOut(node.operator);
        addToOut(" ");
      }
      parseNode(node.right);
      break;
    case("UnaryExpression"):
      switch(node.operator)
      {
        case('!'):
          addToOut("not ");
          break;
        default:
          addToOut(node.operator);    
      }
      parseNode(node.expression);
      break;
    case("ConditionalExpression"):
      addToOut("if ");
      parseNode(node.condition);
      addToOut(" ");
      parseNode(node.trueExpression);
      addToOut(" else ");
      parseNode(node.falseExpression);
      break;
    case("PostfixExpression"):
      switch(node.operator)
      { 
        case('++'):
        parseNode(node.expression);
        addToOut(" = ");
        parseNode(node.expression);
        addToOut(" + 1");
        break;
        case('--'):
        parseNode(node.expression);
        addToOut(" = ");
        parseNode(node.expression);
        addToOut(" - 1");
        break;
      }
      addToOut("\n");
      break;
    case("Variable"):
      if((node.name.indexOf("var") == -1))
      {
        addToOut(node.name.trim());
      }
      else
      {
      if((node.name.indexOf("var") != -1))
      {
        /* -5 because of 4 for "var " and 1 for " " after */
        addToOut(node.name.substr(4, node.name.length - 4).trim());
      }
      }
      break;
    case("FunctionCall"):
      parseNode(node.name);    
      if(node.arguments.length > 0)
      {
        addToOut(" ");
        for(var i = 0; i < node.arguments.length; i++)
        {
          parseNode(node.arguments[i]);
          if(i < node.arguments.length - 1) 
          { 
          addToOut(", ");
          }
        }      
      }
      break;
    case('StringLiteral'):
      var escapedValue = node.value.replace("\n", "\\n");
      addToOut('"' + escapedValue + '"');
      break;
    case('NumericLiteral'):
      addToOut(node.value);
      break;
    case('RegularExpressionLiteral'):
      addToOut("/");
      addToOut(node.body);
      addToOut("/" + node.flags);
      break;
    case('NullLiteral'):
      addToOut("null");
      break;
    case('ArrayLiteral'):
      if(node.elements.length > 0)
      {
        addToOut("[");
        for(var i = 0; i < node.elements.length; i++)
        {
          parseNode(node.elements[i]);
          if(i < node.elements.length - 1) 
          {
            addToOut(", ");
          }
        }
        addToOut("]");
      }
      break;
    case('ObjectLiteral'):
      if(node.properties.length > 0)
      {
        addToOut("{\n");
        increaseIndent();
        if(node.properties) 
        {
          parseChildNodes(node.properties);
        }
        decreaseIndent();
        addToOut("\n}");
      }
      break;
    case('BooleanLiteral'):
      if(node.value == true)
      {
        addToOut("yes");
      }
      else
      {
      if(node.value == false)
      {
        addToOut("no");
      }
      }
    break;      
  }
}


/* main section */
parseNode(ast);

/* output section */
if(process.argv[3] == "--convert" || process.argv[3] == null)
{
  sys.puts(output);
}
else
{
if(process.argv[3] == "--showjs")
{
  sys.puts("Original JavaScript: ");
  sys.puts(string_raw_js);
  sys.puts("Generated CoffeeScript: ");  
  sys.puts(output);
}
}

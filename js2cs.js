var parser = require('./parser').parser;
var sys = require('sys');
var fs = require('fs');

var p = function(obj) { sys.puts(sys.inspect(obj, true, 100)); }

var string_raw_js = fs.readFileSync(process.argv[2], "utf8");

try{
var ast = parser.parse(string_raw_js);
} catch(e) {
sys.log(e.type + " on line " + e.line + " on column " + e.column + " :" + e.message);
}

/* the output of this script */
var output = '';
var indent_level = 0;
var addToOut = function(out) {
  output += out;
}


var parseChildNodes = function(nodes) {
  for(var i = 0; i < nodes.length; ++i) {
        for(var c = 0; c < indent_level; ++c) {
            addToOut("  ");
          }
        _node = nodes[i];
        parseNode(_node);
        addToOut("\n");
      }
}

/* eats tokens and makes coffee */
var parseNode = function(node) {
  sys.puts(node.type);
  switch (node.type) {
    case "Program":
      if (node.elements) { parseChildNodes(node.elements); }
      break;
    case "Function":
      if (node.params.length > 0) {
        addToOut("(");
        for(var i = 0; i < node.params.length; ++i) {
          addToOut(node.params[i]);
          if (i < node.params.length - 1) addToOut(", ");
        }
        addToOut(")");
      }
      addToOut(" ->\n");
      indent_level = indent_level + 1;
      if (node.elements) { parseChildNodes(node.elements); }
      indent_level = indent_level - 1;
      break;
    case "Block":
      p(node);
      
      break;
    case "AssignmentExpression":
      parseNode(node.left);
      addToOut(": ");
      parseNode(node.right);
      break;
    case "BinaryExpression":
      parseNode(node.left);
      switch (node.operator)
      {
      case "!=":
        addToOut("!=");
        break;
      case "==":
        addToOut("==");
        break;
      default:
        addToOut(node.operator);
      }
      addToOut(" ");
      parseNode(node.right);
      break;
    case "Variable":
      addToOut(node.name);
      break;
    case "FunctionCall":
      parseNode(node.name);
      addToOut(" ");
      if (node.arguments.length > 0)
      {
        for(var i = 0; i < node.arguments.length; ++i) {
          parseNode(node.arguments[i]);
          if (i < node.arguments.length - 1) addToOut(", ");
        }      
      }
      break;
    case 'StringLiteral':
      addToOut("'" + node.value + "'");
      break;
    case 'NumericLiteral':
      addToOut(node.value);
      break;
    case 'NullLiteral':
      addToOut("null");
      break;
    case 'ArrayLiteral':
      if (node.elements.length > 0) {
        addToOut("[");
        for(var i = 0; i < node.elements.length; ++i) {
          parseNode(node.elements[i]);
          if (i < node.elements.length - 1) addToOut(", ");
        }
        addToOut("]");
      }
      break;
      
  }
  
}

/* output section */
if (process.argv[3] == "--convert")
{
  parseNode(ast);
  sys.puts("JavaScript: ");
  sys.puts(string_raw_js);
  sys.puts("CoffeeScript: ");
  sys.puts(output);
}
else
{
  p(ast);
}

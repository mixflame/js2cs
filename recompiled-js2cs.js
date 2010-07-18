var addToOut, ast, decreaseIndent, fs, increaseIndent, indent, indent_level, iteration, output, p, parseChildNodes, parseNode, parser, removeBlankLines, string_raw_js, sys;
parser = require("./parser".parser);
sys = require("sys");
fs = require("fs");
p = function(obj) {
  var obj_inspect;
  obj_inspect = sys.inspect(obj, true, 100);
  return sys.puts(obj_inspect);
};
String.prototype.trim = function() {
  var str_to_return;
  str_to_return = this.replace(/^\s*/, "");
  str_to_return = str_to_return.replace(/\s*$/, "");
  return str_to_return;
};
try {
  string_raw_js = fs.readFileSync(process.argv[2], "utf8");
} catch (e) {
  sys.log("Failed to read input file.. Did you specify one?");
  process.exit(1);
}
try {
  ast = parser.parse(string_raw_js);
} catch (e) {
  sys.log(e.name + " on line " + e.line + " on column " + e.column + ": " + e.message);
  process.exit(1);
}
output = "";
iteration = 0;
indent_level = 0;
increaseIndent = function() {
  indent_level = indent_level + 1;
  return indent_level;
};
decreaseIndent = function() {
  indent_level = indent_level - 1;
  return indent_level;
};
indent = function() {
  var _a, c;
  c = 0;
  _a = [];
  while (c < indent_level) {
    _a.push((function() {
      c = c + 1;
      return addToOut("  ");
    })());
  }
  return _a;
};
addToOut = function(out) {
  output = out;
  return output;
};
removeBlankLines = function(out) {
  var return_me;
  return_me = out.replace(/\n\n/g, "\n");
  while (return_me.indexOf("\n\n" > 0)) {
    return_me = return_me.replace(/\n\n/g, "\n");
  }
  return return_me;
};
parseChildNodes = function(nodes) {
  var _a, _node, i, is_break, is_labelled_statement, is_last_statement, ust_var;
  i = 0;
  _a = [];
  while (i < nodes.length) {
    _a.push((function() {
      i = i + 1;
      _node = nodes.i;
      is_last_statement = i < nodes.length - 1;
      ust_var = is_last_statement && _node.type === "Variable";
      is_break = _node.type === "BreakStatement";
      is_labelled_statement = _node.type === "LabelledStatement";
      !(is_break) ? indent : null;
      !ust_var && !is_break ? parseNode(_node) : null;
      return addToOut("\n");
    })());
  }
  return _a;
};
parseNode = function(node) {
  var _a, _b, _c, _d, _e, escapedValue, i, node_dot_name_is_numeric_literal, node_dot_name_is_string_literal;
  iteration = iteration + 1;
  if (process.argv[3] === "--debug") {
    sys.puts(iteration + " " + node.type);
    p(node);
  }
  process.argv[3] === "--ilevel" ? sys.puts(iteration + " (" + indent_level + ") " + node.type + " - " + node.name) : null;
  if ((_a = node.type) === "Program") {
    return node.elements ? parseChildNodes(node.elements) : null;
  } else if (_a === "This") {
    return addToOut("@");
  } else if (_a === "Function") {
    if (node.params.length > 0) {
      addToOut("(");
      i = 0;
      while (i < node.params.length) {
        i = i + 1;
        addToOut(node.params.i);
        i < node.params.length - 1 ? addToOut(", ") : null;
      }
      addToOut(")");
    }
    addToOut("->\n");
    increaseIndent;
    node.elements ? parseChildNodes(node.elements) : null;
    return decreaseIndent;
  } else if (_a === "Block") {
    increaseIndent;
    node.statements ? parseChildNodes(node.statements) : null;
    return decreaseIndent;
  } else if (_a === "SwitchStatement") {
    addToOut("switch ");
    parseNode(node.expression);
    addToOut("\n");
    increaseIndent;
    parseChildNodes(node.clauses);
    return decreaseIndent;
  } else if (_a === "CaseClause") {
    addToOut("when ");
    parseNode(node.selector);
    addToOut("\n");
    increaseIndent;
    node.statements ? parseChildNodes(node.statements) : null;
    return decreaseIndent;
  } else if (_a === "DefaultClause") {
    addToOut("else ");
    if (node.statements.length > 1) {
      addToOut("\n");
      increaseIndent;
      node.statements ? parseChildNodes(node.statements) : null;
      return decreaseIndent;
    } else {
      return node.statements.length === 1 ? node.statements ? parseNode(node.statements[0]) : null : null;
    }
  } else if (_a === "IfStatement") {
    if (node.condition.operator !== "!") {
      addToOut("if ");
      parseNode(node.condition);
    } else {
      addToOut("unless ");
      parseNode(node.condition.expression);
    }
    addToOut("\n");
    increaseIndent;
    node.ifStatement.statements ? parseChildNodes(node.ifStatement.statements) : null;
    decreaseIndent;
    if (node.elseStatement !== null) {
      addToOut("\n");
      indent;
      addToOut("else");
      addToOut("\n");
      increaseIndent;
      node.elseStatement.statements ? parseChildNodes(node.elseStatement.statements) : null;
      return decreaseIndent;
    }
  } else if (_a === "ForStatement") {
    parseNode(node.initializer);
    addToOut("\n");
    indent;
    addToOut("while ");
    parseNode(node.test);
    addToOut("\n");
    increaseIndent;
    indent;
    parseNode(node.counter);
    decreaseIndent;
    return node.statement ? parseNode(node.statement) : null;
  } else if (_a === "WhileStatement") {
    addToOut("while ");
    parseNode(node.condition);
    addToOut("\n");
    return node.statement ? parseNode(node.statement) : null;
  } else if (_a === "TryStatement") {
    addToOut("try\n");
    parseNode(node.block);
    addToOut("\n");
    if (node["catch"]) {
      addToOut("catch ");
      parseNode(node["catch"]);
    }
    if (node["finally"]) {
      addToOut("finally\n");
      return parseNode(node["finally"]);
    }
  } else if (_a === "Catch") {
    node.identifier ? addToOut(node.identifier) : null;
    addToOut("\n");
    parseNode(node.block);
    return addToOut("\n");
  } else if (_a === "Finally") {
    return parseNode(node.block);
  } else if (_a === "AssignmentExpression") {
    parseNode(node.left);
    addToOut(": ");
    return parseNode(node.right);
  } else if (_a === "PropertyAssignment") {
    parseNode(node.name);
    addToOut(": ");
    return parseNode(node.value);
  } else if (_a === "PropertyAccess") {
    parseNode(node.base);
    if (node.name.type) {
      node_dot_name_is_numeric_literal = node.name.type === "NumericLiteral";
      node_dot_name_is_string_literal = node.name.type === "StringLiteral";
      node.base.type !== "This" && !node_dot_name_is_numeric_literal && !node_dot_name_is_string_literal ? addToOut(".") : null;
      node_dot_name_is_numeric_literal || node_dot_name_is_string_literal ? addToOut("[") : null;
      parseNode(node.name);
      return node_dot_name_is_numeric_literal || node_dot_name_is_string_literal ? addToOut("]") : null;
    } else {
      if (node.name.type === undefined || node.name.type === "null") {
        node.base.type !== "This" ? addToOut(".") : null;
        return addToOut(node.name.trim);
      }
    }
  } else if (_a === "BinaryExpression") {
    parseNode(node.left);
    addToOut(" ");
    if ((_b = node.operator) === "!") {
      addToOut("not ");
    } else if (_b === "===") {
      addToOut("is ");
    } else if (_b === "!==") {
      addToOut("isnt ");
    } else if (_b === "&&") {
      addToOut("and ");
    } else if (_b === "||") {
      addToOut("or ");
    } else if (_b === ",") {
      addToOut("\n");
    } else {
      addToOut(node.operator);
      addToOut(" ");
    }
    return parseNode(node.right);
  } else if (_a === "UnaryExpression") {
    if ((_c = node.operator) === "!") {
      addToOut("not ");
    } else {
      addToOut(node.operator);
    }
    return parseNode(node.expression);
  } else if (_a === "ConditionalExpression") {
    addToOut("if ");
    parseNode(node.condition);
    addToOut(" ");
    parseNode(node.trueExpression);
    addToOut(" else ");
    return parseNode(node.falseExpression);
  } else if (_a === "PostfixExpression") {
    if ((_d = node.operator) === "++") {
      parseNode(node.expression);
      addToOut(" = ");
      parseNode(node.expression);
      addToOut(" + 1");
    } else if (_d === "--") {
      parseNode(node.expression);
      addToOut(" = ");
      parseNode(node.expression);
      addToOut(" - 1");
    }
    return addToOut("\n");
  } else if (_a === "Variable") {
    return node.name.indexOf("var" === -1) ? addToOut(node.name.trim) : node.name.indexOf("var" !== -1) ? addToOut : null;
  } else if (_a === "FunctionCall") {
    parseNode(node.name);
    if (node.arguments.length > 0) {
      addToOut(" ");
      i = 0;
      _e = [];
      while (i < node.arguments.length) {
        _e.push((function() {
          i = i + 1;
          parseNode(node.arguments.i);
          return i < node.arguments.length - 1 ? addToOut(", ") : null;
        }).apply(this, arguments));
      }
      return _e;
    }
  } else if (_a === "StringLiteral") {
    escapedValue = node.value.replace(/\n/g, "\n");
    return addToOut("+ escapedValue +");
  } else if (_a === "NumericLiteral") {
    return addToOut(node.value);
  } else if (_a === "RegularExpressionLiteral") {
    addToOut("/");
    addToOut(node.body);
    return addToOut("/" + node.flags);
  } else if (_a === "NullLiteral") {
    return addToOut("null");
  } else if (_a === "ArrayLiteral") {
    if (node.elements.length > 0) {
      addToOut("[");
      i = 0;
      while (i < node.elements.length) {
        i = i + 1;
        parseNode(node.elements.i);
        i < node.elements.length - 1 ? addToOut(", ") : null;
      }
      return addToOut("]");
    }
  } else if (_a === "ObjectLiteral") {
    if (node.properties.length > 0) {
      addToOut("{\n");
      increaseIndent;
      node.properties ? parseChildNodes(node.properties) : null;
      decreaseIndent;
      return addToOut("\n}");
    }
  } else if (_a === "BooleanLiteral") {
    return node.value === true ? addToOut("yes") : node.value === false ? addToOut("no") : null;
  }
};
parseNode(ast);
if (process.argv[3] === "--convert" || process.argv[3] === null) {
  sys.puts(removeBlankLines(output));
} else {
  if (process.argv[3] === "--showjs") {
    sys.puts("Original JavaScript: ");
    sys.puts(string_raw_js);
    sys.puts("Generated CoffeeScript: ");
    sys.puts(output);
  }
}

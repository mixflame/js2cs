parser: require "./parser".parser
sys: require "sys"
fs: require "fs"
p: (obj)->
  obj_inspect: sys.inspect obj, yes, 100
  sys.puts obj_inspect
String.prototype.trim: ->
  str_to_return: @replace /^\s*/, ""
  str_to_return: str_to_return.replace /\s*$/, ""
  return str_to_return
try
  string_raw_js: fs.readFileSync process.argv[2], "utf8"
catch e
  sys.log "Failed to read input file.. Did you specify one?"
  process.exit 1
try
  ast: parser.parse string_raw_js
catch e
  sys.log e.name + " on line " + e.line + " on column " + e.column + ": " + e.message
  process.exit 1
output: ""
iteration: 0
indent_level: 0
increaseIndent: ->
  indent_level: indent_level + 1
decreaseIndent: ->
  indent_level: indent_level - 1
indent: ->
  c: 0
  while c < indent_level
    c = c + 1
    addToOut "  "
addToOut: (out)->
  output: out
removeBlankLines: (out)->
  return_me: out.replace /\n\n/g, "\n"
  while return_me.indexOf "\n\n" > 0
      return_me: return_me.replace /\n\n/g, "\n"
  return return_me
parseChildNodes: (nodes)->
  i: 0
  while i < nodes.length
    i = i + 1
    _node: nodes.i
    is_last_statement: i < nodes.length - 1
    is_just_var: is_last_statement and _node.type == "Variable"
    is_break: _node.type == "BreakStatement"
    is_labelled_statement: _node.type == "LabelledStatement"
    if not is_break and not is_labelled_statement
      indent
    if not is_just_var and not is_break and not is_labelled_statement
      parseNode _node
    addToOut "\n"
parseNode: (node)->
  iteration: iteration + 1
  if process.argv[3] == "--debug"
    sys.puts iteration + " " + node.type
    p node
  if process.argv[3] == "--ilevel"
    sys.puts iteration + " (" + indent_level + ") " + node.type + " - " + node.name
  switch node.type
    when "Program"
      if node.elements
        parseChildNodes node.elements
    when "This"
      addToOut "@"
    when "Function"
      if node.params.length > 0
        addToOut "("
        i: 0
        while i < node.params.length
          i = i + 1
          addToOut node.params.i
          if i < node.params.length - 1
            addToOut ", "
        addToOut ")"
      addToOut "->\n"
      increaseIndent
      if node.elements
        parseChildNodes node.elements
      decreaseIndent
    when "Block"
      increaseIndent
      if node.statements
        parseChildNodes node.statements
      decreaseIndent
    when "SwitchStatement"
      addToOut "switch "
      parseNode node.expression
      addToOut "\n"
      increaseIndent
      parseChildNodes node.clauses
      decreaseIndent
    when "CaseClause"
      addToOut "when "
      parseNode node.selector
      addToOut "\n"
      increaseIndent
      if node.statements
        parseChildNodes node.statements
      decreaseIndent
    when "DefaultClause"
      addToOut "else "
      if node.statements.length > 1
        addToOut "\n"
        increaseIndent
        if node.statements
          parseChildNodes node.statements
        decreaseIndent
      else
        if node.statements.length == 1
          if node.statements
            parseNode node.statements[0]
    when "IfStatement"
      if node.condition.operator != "!"
        addToOut "if "
        parseNode node.condition
      else
        addToOut "unless "
        parseNode node.condition.expression
      addToOut "\n"
      increaseIndent
      if node.ifStatement.statements
        parseChildNodes node.ifStatement.statements
      decreaseIndent
      if node.elseStatement != null
        addToOut "\n"
        indent
        addToOut "else"
        addToOut "\n"
        increaseIndent
        if node.elseStatement.statements
          parseChildNodes node.elseStatement.statements
        decreaseIndent
    when "ForStatement"
      parseNode node.initializer
      addToOut "\n"
      indent
      addToOut "while "
      parseNode node.test
      addToOut "\n"
      increaseIndent
      indent
      parseNode node.counter
      decreaseIndent
      if node.statement
        parseNode node.statement
    when "WhileStatement"
      addToOut "while "
      parseNode node.condition
      addToOut "\n"
      if node.statement
        parseNode node.statement
    when "TryStatement"
      addToOut "try\n"
      parseNode node.block
      addToOut "\n"
      if node["catch"]
        addToOut "catch "
        parseNode node["catch"]
      if node["finally"]
        addToOut "finally\n"
        parseNode node["finally"]
    when "Catch"
      if node.identifier
        addToOut node.identifier
      addToOut "\n"
      parseNode node.block
      addToOut "\n"
    when "Finally"
      parseNode node.block
    when "AssignmentExpression"
      parseNode node.left
      addToOut ": "
      parseNode node.right
    when "PropertyAssignment"
      parseNode node.name
      addToOut ": "
      parseNode node.value
    when "PropertyAccess"
      parseNode node.base
      if node.name.type
        node_dot_name_is_numeric_literal: node.name.type == "NumericLiteral"
        node_dot_name_is_string_literal: node.name.type == "StringLiteral"
        if node.base.type != "This" and not node_dot_name_is_numeric_literal and not node_dot_name_is_string_literal
          addToOut "."
        if node_dot_name_is_numeric_literal or node_dot_name_is_string_literal
          addToOut "["
        parseNode node.name
        if node_dot_name_is_numeric_literal or node_dot_name_is_string_literal
          addToOut "]"
      else
        if node.name.type == undefined or node.name.type == "null"
          if node.base.type != "This"
            addToOut "."
          addToOut node.name.trim
    when "BinaryExpression"
      parseNode node.left
      addToOut " "
      switch node.operator
        when "!"
          addToOut "not "
        when "==="
          addToOut "is "
        when "!=="
          addToOut "isnt "
        when "&&"
          addToOut "and "
        when "||"
          addToOut "or "
        when ","
          addToOut "\n"
        else 
          addToOut node.operator
          addToOut " "
      parseNode node.right
    when "UnaryExpression"
      switch node.operator
        when "!"
          addToOut "not "
        else addToOut node.operator
      parseNode node.expression
    when "ConditionalExpression"
      addToOut "if "
      parseNode node.condition
      addToOut " "
      parseNode node.trueExpression
      addToOut " else "
      parseNode node.falseExpression
    when "PostfixExpression"
      switch node.operator
        when "++"
          parseNode node.expression
          addToOut " = "
          parseNode node.expression
          addToOut " + 1"
        when "--"
          parseNode node.expression
          addToOut " = "
          parseNode node.expression
          addToOut " - 1"
      addToOut "\n"
    when "Variable"
      unless node.name.substr 0, 3 == "var"
        addToOut node.name.trim
      else
        if node.name.substr 0, 3 == "var"
          addToOut 
    when "FunctionCall"
      parseNode node.name
      if node.arguments.length > 0
        addToOut " "
        i: 0
        while i < node.arguments.length
          i = i + 1
          parseNode node.arguments.i
          if i < node.arguments.length - 1
            addToOut ", "
    when "StringLiteral"
      escapedValue: node.value.replace /\n/g, "\n"
      addToOut """ + escapedValue + """
    when "NumericLiteral"
      addToOut node.value
    when "RegularExpressionLiteral"
      addToOut "/"
      addToOut node.body
      addToOut "/" + node.flags
    when "NullLiteral"
      addToOut "null"
    when "ArrayLiteral"
      if node.elements.length > 0
        addToOut "["
        i: 0
        while i < node.elements.length
          i = i + 1
          parseNode node.elements.i
          if i < node.elements.length - 1
            addToOut ", "
        addToOut "]"
    when "ObjectLiteral"
      if node.properties.length > 0
        addToOut "{\n"
        increaseIndent
        if node.properties
          parseChildNodes node.properties
        decreaseIndent
        addToOut "\n}"
    when "BooleanLiteral"
      if node.value == yes
        addToOut "yes"
      else
        if node.value == no
          addToOut "no"
parseNode ast
if process.argv[3] == "--convert" or process.argv[3] == null
  sys.puts removeBlankLines output
else
  if process.argv[3] == "--showjs"
    sys.puts "Original JavaScript: "
    sys.puts string_raw_js
    sys.puts "Generated CoffeeScript: "
    sys.puts output


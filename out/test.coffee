p: (obj) ->
  obj_inspect: sys.inspect obj, yes, 100
  sys.puts obj_inspect

String.prototype.trim:  ->
  str_to_return: @replace /^\s*/, ""
  str_to_return: str_to_return.replace /\s*$/, ""
  

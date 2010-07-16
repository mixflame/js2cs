/* the missing trim method */
String.prototype.trim = function()
{
var str_to_return = this.replace(/^\s*/, "");
str_to_return = str_to_return.replace(/\s*$/, "");
return str_to_return;
}


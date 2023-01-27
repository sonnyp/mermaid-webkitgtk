var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
				var args = [null];
				args.push.apply(args, arguments);
				var Ctor = Function.bind.apply(f, args);
				return new Ctor();
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var pandocFilter = {};

var _rollup_plugin_ignore_empty_module_placeholder = {};

var _rollup_plugin_ignore_empty_module_placeholder$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: _rollup_plugin_ignore_empty_module_placeholder
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(_rollup_plugin_ignore_empty_module_placeholder$1);

/*! pandoc-filter-node | (C) 2014 Mike Henderson <mvhenderson@tds.net> | License: MIT */
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(pandocFilter, "__esModule", { value: true });
const get_stdin_1 = __importDefault(require$$0);
/**
 * Converts an action into a filter that reads a JSON-formatted pandoc
 * document from stdin, transforms it by walking the tree with the action, and
 * returns a new JSON-formatted pandoc document to stdout. The argument is a
 * function action(key, value, format, meta), where key is the type of the
 * pandoc object (e.g. 'Str', 'Para'), value is the contents of the object
 * (e.g. a string for 'Str', a list of inline elements for 'Para'), format is
 * the target output format (which will be taken for the first command
 * line argument if present), and meta is the document's metadata. If the
 * function returns None, the object to which it applies will remain
 * unchanged. If it returns an object, the object will be replaced. If it
 * returns a list, the list will be spliced in to the list to which the target
 * object belongs. (So, returning an empty list deletes the object.)
 *
 * @param  {Function} action Callback to apply to every object
 */
async function toJSONFilter(action) {
    const json = await get_stdin_1.default();
    var data = JSON.parse(json);
    var format = process.argv.length > 2 ? process.argv[2] : "";
    filter(data, action, format).then((output) => process.stdout.write(JSON.stringify(output)));
}
var toJSONFilter_1 = pandocFilter.toJSONFilter = toJSONFilter;
function isElt(x) {
    return (typeof x === "object" && x && "t" in x) || false;
}
function isEltArray(x) {
    return x.every(isElt);
}
/**
 * Walk a tree, applying an action to every object.
 * @param  {Object}   x      The object to traverse
 * @param  {Function} action Callback to apply to each item
 * @param  {String}   format Output format
 * @param  {Object}   meta   Pandoc metadata
 * @return {Object}          The modified tree
 */
async function walk(x, action, format, meta) {
    if (typeof action === "function")
        action = { single: action };
    if (Array.isArray(x)) {
        if (action.array && isEltArray(x)) {
            x = await action.array(x, format, meta);
            if (!Array.isArray(x))
                throw "impossible (just for ts)";
        }
        var array = [];
        for (const item of x) {
            if (isElt(item) && action.single) {
                var res = (await action.single(item, format, meta)) || item;
                if (Array.isArray(res)) {
                    for (const z of res) {
                        array.push(await walk(z, action, format, meta));
                    }
                }
                else {
                    array.push(await walk(res, action, format, meta));
                }
            }
            else {
                array.push(await walk(item, action, format, meta));
            }
        }
        return array;
    }
    else if (typeof x === "object" && x !== null) {
        var obj = {};
        for (const k of Object.keys(x)) {
            obj[k] = await walk(x[k], action, format, meta);
        }
        return obj;
    }
    return x;
}
var walk_1 = pandocFilter.walk = walk;
function walkSync(x, action, format, meta) {
    if (Array.isArray(x)) {
        var array = [];
        for (const item of x) {
            if (isElt(item)) {
                var res = action(item, format, meta) || item;
                if (Array.isArray(res)) {
                    for (const z of res) {
                        array.push(walkSync(z, action, format, meta));
                    }
                }
                else {
                    array.push(walkSync(res, action, format, meta));
                }
            }
            else {
                array.push(walkSync(item, action, format, meta));
            }
        }
        return array;
    }
    else if (typeof x === "object" && x !== null) {
        var obj = {};
        for (const k of Object.keys(x)) {
            obj[k] = walkSync(x[k], action, format, meta);
        }
        return obj;
    }
    return x;
}
var walkSync_1 = pandocFilter.walkSync = walkSync;
/**
 * Walks the tree x and returns concatenated string content, leaving out all
 * formatting.
 * @param  {Object} x The object to walk
 * @return {String}   JSON string
 */
function stringify(x) {
    if (!Array.isArray(x) && x.t === "MetaString")
        return x.c;
    var result = [];
    var go = function (e) {
        if (e.t === "Str")
            result.push(e.c);
        else if (e.t === "Code")
            result.push(e.c[1]);
        else if (e.t === "Math")
            result.push(e.c[1]);
        else if (e.t === "LineBreak")
            result.push(" ");
        else if (e.t === "Space")
            result.push(" ");
        else if (e.t === "SoftBreak")
            result.push(" ");
        else if (e.t === "Para")
            result.push("\n");
    };
    walkSync(x, go, "", {});
    return result.join("");
}
var stringify_1 = pandocFilter.stringify = stringify;
/**
 * Returns an attribute list, constructed from the dictionary attrs.
 * @param  {Object} attrs Attribute dictionary
 * @return {Array}        Attribute list
 */
function attributes(attrs) {
    attrs = attrs || {};
    var ident = attrs.id || "";
    var classes = attrs.classes || [];
    var keyvals = [];
    Object.keys(attrs).forEach(function (k) {
        if (k !== "classes" && k !== "id")
            keyvals.push([k, attrs[k]]);
    });
    return [ident, classes, keyvals];
}
var attributes_1 = pandocFilter.attributes = attributes;
// Utility for creating constructor functions
function elt(eltType, numargs) {
    return function (...args) {
        var len = args.length;
        if (len !== numargs)
            throw (eltType + " expects " + numargs + " arguments, but given " + len);
        return { t: eltType, c: len === 1 ? args[0] : args };
    };
}
var elt_1 = pandocFilter.elt = elt;
/**
 * Filter the given object
 */
async function filter(data, action, format) {
    return (await walk(data, action, format, data.meta || data[0].unMeta));
}
var filter_1 = pandocFilter.filter = filter;
/** `.meta` in the pandoc json format describes the markdown frontmatter yaml as an AST as described in
 *  https://hackage.haskell.org/package/pandoc-types-1.20/docs/Text-Pandoc-Definition.html#t:MetaValue
 *
 * this function converts a raw object to a pandoc meta AST object
 **/
function rawToMeta(e) {
    if (Array.isArray(e)) {
        return { t: "MetaList", c: e.map((x) => rawToMeta(x)) };
    }
    // warning: information loss: can't tell if it was a number or string
    if (typeof e === "string" || typeof e === "number")
        return { t: "MetaString", c: String(e) };
    if (typeof e === "object") {
        const c = fromEntries(Object.entries(e).map(([k, v]) => [k, rawToMeta(v)]));
        return { t: "MetaMap", c };
    }
    if (typeof e === "boolean")
        return { t: "MetaBool", c: e };
    throw Error(typeof e);
}
var rawToMeta_1 = pandocFilter.rawToMeta = rawToMeta;
function metaToRaw(m) {
    if (m.t === "MetaMap") {
        return fromEntries(Object.entries(m.c).map(([k, v]) => [k, metaToRaw(v)]));
    }
    else if (m.t === "MetaList") {
        return m.c.map(metaToRaw);
    }
    else if (m.t === "MetaBool" || m.t === "MetaString") {
        return m.c;
    }
    else if (m.t === "MetaInlines" || m.t === "MetaBlocks") {
        // warning: information loss: removes formatting
        return stringify(m.c);
    }
    throw Error(`Unknown meta type ${m.t}`);
}
var metaToRaw_1 = pandocFilter.metaToRaw = metaToRaw;
/** meta root object is a map */
function metaMapToRaw(c) {
    return metaToRaw({ t: "MetaMap", c });
}
var metaMapToRaw_1 = pandocFilter.metaMapToRaw = metaMapToRaw;
/** Object.fromEntries ponyfill */
function fromEntries(iterable) {
    return [...iterable].reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
    }, {});
}
// Constructors for block elements
var Plain = pandocFilter.Plain = elt("Plain", 1);
var Para = pandocFilter.Para = elt("Para", 1);
var CodeBlock = pandocFilter.CodeBlock = elt("CodeBlock", 2);
var RawBlock = pandocFilter.RawBlock = elt("RawBlock", 2);
var BlockQuote = pandocFilter.BlockQuote = elt("BlockQuote", 1);
var OrderedList = pandocFilter.OrderedList = elt("OrderedList", 2);
var BulletList = pandocFilter.BulletList = elt("BulletList", 1);
var DefinitionList = pandocFilter.DefinitionList = elt("DefinitionList", 1);
var Header = pandocFilter.Header = elt("Header", 3);
var HorizontalRule = pandocFilter.HorizontalRule = elt("HorizontalRule", 0);
var Table = pandocFilter.Table = elt("Table", 6);
var Div = pandocFilter.Div = elt("Div", 2);
var Null = pandocFilter.Null = elt("Null", 0);
// Constructors for inline elements
var Str = pandocFilter.Str = elt("Str", 1);
var Emph = pandocFilter.Emph = elt("Emph", 1);
var Strong = pandocFilter.Strong = elt("Strong", 1);
var Strikeout = pandocFilter.Strikeout = elt("Strikeout", 1);
var Superscript = pandocFilter.Superscript = elt("Superscript", 1);
var Subscript = pandocFilter.Subscript = elt("Subscript", 1);
var SmallCaps = pandocFilter.SmallCaps = elt("SmallCaps", 1);
var Quoted = pandocFilter.Quoted = elt("Quoted", 2);
var Cite = pandocFilter.Cite = elt("Cite", 2);
var Code = pandocFilter.Code = elt("Code", 2);
var Space = pandocFilter.Space = elt("Space", 0);
var LineBreak = pandocFilter.LineBreak = elt("LineBreak", 0);
var Formula = pandocFilter.Formula = elt("Math", 2); // don't conflict with js builtin Math;
var RawInline = pandocFilter.RawInline = elt("RawInline", 2);
var Link = pandocFilter.Link = elt("Link", 3);
var Image = pandocFilter.Image = elt("Image", 3);
var Note = pandocFilter.Note = elt("Note", 1);
var Span = pandocFilter.Span = elt("Span", 2);
// a few aliases
var stdio = pandocFilter.stdio = toJSONFilter;

export { BlockQuote, BulletList, Cite, Code, CodeBlock, DefinitionList, Div, Emph, Formula, Header, HorizontalRule, Image, LineBreak, Link, Note, Null, OrderedList, Para, Plain, Quoted, RawBlock, RawInline, SmallCaps, Space, Span, Str, Strikeout, Strong, Subscript, Superscript, Table, attributes_1 as attributes, pandocFilter as default, elt_1 as elt, filter_1 as filter, metaMapToRaw_1 as metaMapToRaw, metaToRaw_1 as metaToRaw, rawToMeta_1 as rawToMeta, stdio, stringify_1 as stringify, toJSONFilter_1 as toJSONFilter, walk_1 as walk, walkSync_1 as walkSync };

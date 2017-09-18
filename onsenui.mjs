// For @onsenui/custom-elements
if (window.customElements) {
    // even if native CE1 impl exists, use polyfill
    window.customElements.forcePolyfill = true;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
});

var _isObject = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function(it){
  if(!_isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});

var document$1 = _global.document;
var is = _isObject(document$1) && _isObject(document$1.createElement);
var _domCreate = function(it){
  return is ? document$1.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function(){
  return Object.defineProperty(_domCreate('div'), 'a', {get: function(){ return 7; }}).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function(it, S){
  if(!_isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP             = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes){
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if(_ie8DomDefine)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};

var _hide = _descriptors ? function(object, key, value){
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};

var hasOwnProperty = {}.hasOwnProperty;
var _has = function(it, key){
  return hasOwnProperty.call(it, key);
};

var id = 0;
var px = Math.random();
var _uid = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _redefine = createCommonjsModule(function (module) {
var SRC       = _uid('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

_core.inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)_has(val, 'name') || _hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)_has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if(O === _global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      _hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else _hide(O, key, val);
    }
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
});

var _aFunction = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx = function(fn, that, length){
  _aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? _core : _core[name] || (_core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // extend global
    if(target)_redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)_hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
_global.core = _core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
var _export = $export;

var f$2 = {}.propertyIsEnumerable;

var _objectPie = {
	f: f$2
};

var toString = {}.toString;

var _cof = function(it){
  return toString.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings

var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};

// to indexed object, toObject with fallback for non-array-like ES3 strings

var _toIobject = function(it){
  return _iobject(_defined(it));
};

var gOPD           = Object.getOwnPropertyDescriptor;

var f$1 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = _toIobject(O);
  P = _toPrimitive(P, true);
  if(_ie8DomDefine)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(_has(O, P))return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
};

var _objectGopd = {
	f: f$1
};

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */

var check = function(O, proto){
  _anObject(O);
  if(!_isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
var _setProto = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

// 19.1.3.19 Object.setPrototypeOf(O, proto)

_export(_export.S, 'Object', {setPrototypeOf: _setProto.set});

var SHARED = '__core-js_shared__';
var store  = _global[SHARED] || (_global[SHARED] = {});
var _shared = function(key){
  return store[key] || (store[key] = {});
};

var _wks = createCommonjsModule(function (module) {
var store      = _shared('wks')
  , Symbol     = _global.Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
};

$exports.store = store;
});

// getting tag from 19.1.3.6 Object.prototype.toString()
var TAG = _wks('toStringTag');
var ARG = _cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

var _classof = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? _cof(O)
    // ES3 arguments fallback
    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

'use strict';
// 19.1.3.6 Object.prototype.toString()
var test    = {};
test[_wks('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  _redefine(Object.prototype, 'toString', function toString(){
    return '[object ' + _classof(this) + ']';
  }, true);
}

// 7.1.4 ToInteger
var ceil  = Math.ceil;
var floor = Math.floor;
var _toInteger = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

// true  -> String#at
// false -> String#codePointAt
var _stringAt = function(TO_STRING){
  return function(that, pos){
    var s = String(_defined(that))
      , i = _toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

var _library = false;

var _iterators = {};

// 7.1.15 ToLength
var min       = Math.min;
var _toLength = function(it){
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max       = Math.max;
var min$1       = Math.min;
var _toIndex = function(index, length){
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes

var _arrayIncludes = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = _toIobject($this)
      , length = _toLength(O.length)
      , index  = _toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var shared = _shared('keys');
var _sharedKey = function(key){
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO$1     = _sharedKey('IE_PROTO');

var _objectKeysInternal = function(object, names){
  var O      = _toIobject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO$1)_has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(_has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)


var _objectKeys = Object.keys || function keys(O){
  return _objectKeysInternal(O, _enumBugKeys);
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties){
  _anObject(O);
  var keys   = _objectKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)_objectDp.f(O, P = keys[i++], Properties[P]);
  return O;
};

var _html = _global.document && document.documentElement;

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var IE_PROTO    = _sharedKey('IE_PROTO');
var Empty       = function(){ /* empty */ };
var PROTOTYPE$1   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe')
    , i      = _enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  _html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
  return createDict();
};

var _objectCreate = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty;
    Empty[PROTOTYPE$1] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : _objectDps(result, Properties);
};

var def = _objectDp.f;
var TAG$1 = _wks('toStringTag');

var _setToStringTag = function(it, tag, stat){
  if(it && !_has(it = stat ? it : it.prototype, TAG$1))def(it, TAG$1, {configurable: true, value: tag});
};

'use strict';
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_hide(IteratorPrototype, _wks('iterator'), function(){ return this; });

var _iterCreate = function(Constructor, NAME, next){
  Constructor.prototype = _objectCreate(IteratorPrototype, {next: _propertyDesc(1, next)});
  _setToStringTag(Constructor, NAME + ' Iterator');
};

// 7.1.13 ToObject(argument)

var _toObject = function(it){
  return Object(_defined(it));
};

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var IE_PROTO$2    = _sharedKey('IE_PROTO');
var ObjectProto = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function(O){
  O = _toObject(O);
  if(_has(O, IE_PROTO$2))return O[IE_PROTO$2];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

'use strict';
var ITERATOR       = _wks('iterator');
var BUGGY          = !([].keys && 'next' in [].keys());
var FF_ITERATOR    = '@@iterator';
var KEYS           = 'keys';
var VALUES         = 'values';

var returnThis = function(){ return this; };

var _iterDefine = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  _iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = _objectGpo($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!_library && !_has(IteratorPrototype, ITERATOR))_hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    _hide(proto, ITERATOR, $default);
  }
  // Plug for library
  _iterators[NAME] = $default;
  _iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))_redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

'use strict';
var $at  = _stringAt(true);

// 21.1.3.27 String.prototype[@@iterator]()
_iterDefine(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _wks('unscopables');
var ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)_hide(ArrayProto, UNSCOPABLES, {});
var _addToUnscopables = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};

var _iterStep = function(done, value){
  return {value: value, done: !!done};
};

'use strict';


// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
var es6_array_iterator = _iterDefine(Array, 'Array', function(iterated, kind){
  this._t = _toIobject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return _iterStep(1);
  }
  if(kind == 'keys'  )return _iterStep(0, index);
  if(kind == 'values')return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
_iterators.Arguments = _iterators.Array;

_addToUnscopables('keys');
_addToUnscopables('values');
_addToUnscopables('entries');

var ITERATOR$1      = _wks('iterator');
var TO_STRING_TAG = _wks('toStringTag');
var ArrayValues   = _iterators.Array;

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = _global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR$1])_hide(proto, ITERATOR$1, ArrayValues);
    if(!proto[TO_STRING_TAG])_hide(proto, TO_STRING_TAG, NAME);
    _iterators[NAME] = ArrayValues;
    for(key in es6_array_iterator)if(!proto[key])_redefine(proto, key, es6_array_iterator[key], true);
  }
}

var _redefineAll = function(target, src, safe){
  for(var key in src)_redefine(target, key, src[key], safe);
  return target;
};

var _anInstance = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

// call something on iterator step with safe closing on error

var _iterCall = function(iterator, fn, value, entries){
  try {
    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)_anObject(ret.call(iterator));
    throw e;
  }
};

// check on default Array iterator
var ITERATOR$2   = _wks('iterator');
var ArrayProto$1 = Array.prototype;

var _isArrayIter = function(it){
  return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR$2] === it);
};

var ITERATOR$3  = _wks('iterator');
var core_getIteratorMethod = _core.getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR$3]
    || it['@@iterator']
    || _iterators[_classof(it)];
};

var _forOf = createCommonjsModule(function (module) {
var BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : core_getIteratorMethod(iterable)
    , f      = _ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(_isArrayIter(iterFn))for(length = _toLength(iterable.length); length > index; index++){
    result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = _iterCall(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
});

'use strict';
var SPECIES     = _wks('species');

var _setSpecies = function(KEY){
  var C = _global[KEY];
  if(_descriptors && C && !C[SPECIES])_objectDp.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};

var _meta = createCommonjsModule(function (module) {
var META     = _uid('meta')
  , setDesc  = _objectDp.f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !_fails(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!_isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!_has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!_has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !_has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
});

'use strict';
var dP$1          = _objectDp.f;
var fastKey     = _meta.fastKey;
var SIZE        = _descriptors ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

var _collectionStrong = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      _anInstance(that, C, NAME, '_i');
      that._i = _objectCreate(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)_forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        _anInstance(this, C, 'forEach');
        var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(_descriptors)dP$1(C.prototype, 'size', {
      get: function(){
        return _defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    _iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return _iterStep(1);
      }
      // return step by kind
      if(kind == 'keys'  )return _iterStep(0, entry.k);
      if(kind == 'values')return _iterStep(0, entry.v);
      return _iterStep(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    _setSpecies(NAME);
  }
};

var ITERATOR$4     = _wks('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR$4]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  
} catch(e){ /* empty */ }

var _iterDetect = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR$4]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR$4] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};

var setPrototypeOf$2 = _setProto.set;
var _inheritIfRequired = function(that, target, C){
  var P, S = target.constructor;
  if(S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf$2){
    setPrototypeOf$2(that, P);
  } return that;
};

'use strict';


var _collection = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = _global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  var fixMethod = function(KEY){
    var fn = proto[KEY];
    _redefine(proto, KEY,
      KEY == 'delete' ? function(a){
        return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a){
        return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a){
        return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if(typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    _redefineAll(C.prototype, methods);
    _meta.NEED = true;
  } else {
    var instance             = new C
      // early implementations not supports chaining
      , HASNT_CHAINING       = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      , THROWS_ON_PRIMITIVES = _fails(function(){ instance.has(1); })
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      , ACCEPT_ITERABLES     = _iterDetect(function(iter){ new C(iter); }) // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      , BUGGY_ZERO = !IS_WEAK && _fails(function(){
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C()
          , index     = 5;
        while(index--)$instance[ADDER](index, index);
        return !$instance.has(-0);
      });
    if(!ACCEPT_ITERABLES){ 
      C = wrapper(function(target, iterable){
        _anInstance(target, C, NAME);
        var that = _inheritIfRequired(new Base, target, C);
        if(iterable != undefined)_forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if(THROWS_ON_PRIMITIVES || BUGGY_ZERO){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if(BUGGY_ZERO || HASNT_CHAINING)fixMethod(ADDER);
    // weak collections should not contains .clear method
    if(IS_WEAK && proto.clear)delete proto.clear;
  }

  _setToStringTag(C, NAME);

  O[NAME] = C;
  _export(_export.G + _export.W + _export.F * (C != Base), O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};

'use strict';


// 23.2 Set Objects
var es6_set = _collection('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return _collectionStrong.def(this, value = value === 0 ? 0 : value, value);
  }
}, _collectionStrong);

var _arrayFromIterable = function(iter, ITERATOR){
  var result = [];
  _forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

// https://github.com/DavidBruant/Map-Set.prototype.toJSON

var _collectionToJson = function(NAME){
  return function toJSON(){
    if(_classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return _arrayFromIterable(this);
  };
};

// https://github.com/DavidBruant/Map-Set.prototype.toJSON


_export(_export.P + _export.R, 'Set', {toJSON: _collectionToJson('Set')});

'use strict';


// 23.1 Map Objects
var es6_map = _collection('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = _collectionStrong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return _collectionStrong.def(this, key === 0 ? 0 : key, value);
  }
}, _collectionStrong, true);

// https://github.com/DavidBruant/Map-Set.prototype.toJSON


_export(_export.P + _export.R, 'Map', {toJSON: _collectionToJson('Map')});

const reservedTagList = new Set([
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
]);

/**
 * @param {string} localName
 * @returns {boolean}
 */
function isValidCustomElementName(localName) {
  const reserved = reservedTagList.has(localName);
  const validForm = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(localName);
  return !reserved && validForm;
}

/**
 * @private
 * @param {!Node} node
 * @return {boolean}
 */
function isConnected(node) {
  // Use `Node#isConnected`, if defined.
  const nativeValue = node.isConnected;
  if (nativeValue !== undefined) {
    return nativeValue;
  }

  /** @type {?Node|undefined} */
  let current = node;
  while (current && !(current.__CE_isImportDocument || current instanceof Document)) {
    current = current.parentNode || (window.ShadowRoot && current instanceof ShadowRoot ? current.host : undefined);
  }
  return !!(current && (current.__CE_isImportDocument || current instanceof Document));
}

/**
 * @param {!Node} root
 * @param {!Node} start
 * @return {?Node}
 */
function nextSiblingOrAncestorSibling(root, start) {
  let node = start;
  while (node && node !== root && !node.nextSibling) {
    node = node.parentNode;
  }
  return (!node || node === root) ? null : node.nextSibling;
}

/**
 * @param {!Node} root
 * @param {!Node} start
 * @return {?Node}
 */
function nextNode(root, start) {
  return start.firstChild ? start.firstChild : nextSiblingOrAncestorSibling(root, start);
}

/**
 * @param {!Node} root
 * @param {!function(!Element)} callback
 * @param {!Set<Node>=} visitedImports
 */
function walkDeepDescendantElements(root, callback, visitedImports = new Set()) {
  let node = root;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = /** @type {!Element} */(node);

      callback(element);

      const localName = element.localName;
      if (localName === 'link' && element.getAttribute('rel') === 'import') {
        // If this import (polyfilled or not) has it's root node available,
        // walk it.
        const importNode = /** @type {!Node} */ (element.import);
        if (importNode instanceof Node && !visitedImports.has(importNode)) {
          // Prevent multiple walks of the same import root.
          visitedImports.add(importNode);

          for (let child = importNode.firstChild; child; child = child.nextSibling) {
            walkDeepDescendantElements(child, callback, visitedImports);
          }
        }

        // Ignore descendants of import links to prevent attempting to walk the
        // elements created by the HTML Imports polyfill that we just walked
        // above.
        node = nextSiblingOrAncestorSibling(root, element);
        continue;
      } else if (localName === 'template') {
        // Ignore descendants of templates. There shouldn't be any descendants
        // because they will be moved into `.content` during construction in
        // browsers that support template but, in case they exist and are still
        // waiting to be moved by a polyfill, they will be ignored.
        node = nextSiblingOrAncestorSibling(root, element);
        continue;
      }

      // Walk shadow roots.
      const shadowRoot = element.__CE_shadowRoot;
      if (shadowRoot) {
        for (let child = shadowRoot.firstChild; child; child = child.nextSibling) {
          walkDeepDescendantElements(child, callback, visitedImports);
        }
      }
    }

    node = nextNode(root, node);
  }
}

/**
 * Used to suppress Closure's "Modifying the prototype is only allowed if the
 * constructor is in the same scope" warning without using
 * `@suppress {newCheckTypes, duplicate}` because `newCheckTypes` is too broad.
 *
 * @param {!Object} destination
 * @param {string} name
 * @param {*} value
 */
function setPropertyUnchecked(destination, name, value) {
  destination[name] = value;
}

/**
 * @enum {number}
 */
const CustomElementState = {
  custom: 1,
  failed: 2,
};

class CustomElementInternals {
  constructor() {
    /** @type {!Map<string, !CustomElementDefinition>} */
    this._localNameToDefinition = new Map();

    /** @type {!Map<!Function, !CustomElementDefinition>} */
    this._constructorToDefinition = new Map();

    /** @type {!Array<!function(!Node)>} */
    this._patches = [];

    /** @type {boolean} */
    this._hasPatches = false;
  }

  /**
   * @param {string} localName
   * @param {!CustomElementDefinition} definition
   */
  setDefinition(localName, definition) {
    this._localNameToDefinition.set(localName, definition);
    this._constructorToDefinition.set(definition.constructor, definition);
  }

  /**
   * @param {string} localName
   * @return {!CustomElementDefinition|undefined}
   */
  localNameToDefinition(localName) {
    return this._localNameToDefinition.get(localName);
  }

  /**
   * @param {!Function} constructor
   * @return {!CustomElementDefinition|undefined}
   */
  constructorToDefinition(constructor) {
    return this._constructorToDefinition.get(constructor);
  }

  /**
   * @param {!function(!Node)} listener
   */
  addPatch(listener) {
    this._hasPatches = true;
    this._patches.push(listener);
  }

  /**
   * @param {!Node} node
   */
  patchTree(node) {
    if (!this._hasPatches) return;

    walkDeepDescendantElements(node, element => this.patch(element));
  }

  /**
   * @param {!Node} node
   */
  patch(node) {
    if (!this._hasPatches) return;

    if (node.__CE_patched) return;
    node.__CE_patched = true;

    for (let i = 0; i < this._patches.length; i++) {
      this._patches[i](node);
    }
  }

  /**
   * @param {!Node} root
   */
  connectTree(root) {
    const elements = [];

    walkDeepDescendantElements(root, element => elements.push(element));

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.__CE_state === CustomElementState.custom) {
        if (isConnected(element)) {
          this.connectedCallback(element);
        }
      } else {
        this.upgradeElement(element);
      }
    }
  }

  /**
   * @param {!Node} root
   */
  disconnectTree(root) {
    const elements = [];

    walkDeepDescendantElements(root, element => elements.push(element));

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.__CE_state === CustomElementState.custom) {
        this.disconnectedCallback(element);
      }
    }
  }

  /**
   * Upgrades all uncustomized custom elements at and below a root node for
   * which there is a definition. When custom element reaction callbacks are
   * assumed to be called synchronously (which, by the current DOM / HTML spec
   * definitions, they are *not*), callbacks for both elements customized
   * synchronously by the parser and elements being upgraded occur in the same
   * relative order.
   *
   * NOTE: This function, when used to simulate the construction of a tree that
   * is already created but not customized (i.e. by the parser), does *not*
   * prevent the element from reading the 'final' (true) state of the tree. For
   * example, the element, during truly synchronous parsing / construction would
   * see that it contains no children as they have not yet been inserted.
   * However, this function does not modify the tree, the element will
   * (incorrectly) have children. Additionally, self-modification restrictions
   * for custom element constructors imposed by the DOM spec are *not* enforced.
   *
   *
   * The following nested list shows the steps extending down from the HTML
   * spec's parsing section that cause elements to be synchronously created and
   * upgraded:
   *
   * The "in body" insertion mode:
   * https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
   * - Switch on token:
   *   .. other cases ..
   *   -> Any other start tag
   *      - [Insert an HTML element](below) for the token.
   *
   * Insert an HTML element:
   * https://html.spec.whatwg.org/multipage/syntax.html#insert-an-html-element
   * - Insert a foreign element for the token in the HTML namespace:
   *   https://html.spec.whatwg.org/multipage/syntax.html#insert-a-foreign-element
   *   - Create an element for a token:
   *     https://html.spec.whatwg.org/multipage/syntax.html#create-an-element-for-the-token
   *     - Will execute script flag is true?
   *       - (Element queue pushed to the custom element reactions stack.)
   *     - Create an element:
   *       https://dom.spec.whatwg.org/#concept-create-element
   *       - Sync CE flag is true?
   *         - Constructor called.
   *         - Self-modification restrictions enforced.
   *       - Sync CE flag is false?
   *         - (Upgrade reaction enqueued.)
   *     - Attributes appended to element.
   *       (`attributeChangedCallback` reactions enqueued.)
   *     - Will execute script flag is true?
   *       - (Element queue popped from the custom element reactions stack.
   *         Reactions in the popped stack are invoked.)
   *   - (Element queue pushed to the custom element reactions stack.)
   *   - Insert the element:
   *     https://dom.spec.whatwg.org/#concept-node-insert
   *     - Shadow-including descendants are connected. During parsing
   *       construction, there are no shadow-*excluding* descendants.
   *       However, the constructor may have validly attached a shadow
   *       tree to itself and added descendants to that shadow tree.
   *       (`connectedCallback` reactions enqueued.)
   *   - (Element queue popped from the custom element reactions stack.
   *     Reactions in the popped stack are invoked.)
   *
   * @param {!Node} root
   * @param {!Set<Node>=} visitedImports
   */
  patchAndUpgradeTree(root, visitedImports = new Set()) {
    const elements = [];

    const gatherElements = element => {
      if (element.localName === 'link' && element.getAttribute('rel') === 'import') {
        // The HTML Imports polyfill sets a descendant element of the link to
        // the `import` property, specifically this is *not* a Document.
        const importNode = /** @type {?Node} */ (element.import);

        if (importNode instanceof Node && importNode.readyState === 'complete') {
          importNode.__CE_isImportDocument = true;

          // Connected links are associated with the registry.
          importNode.__CE_hasRegistry = true;
        } else {
          // If this link's import root is not available, its contents can't be
          // walked. Wait for 'load' and walk it when it's ready.
          element.addEventListener('load', () => {
            const importNode = /** @type {!Node} */ (element.import);

            if (importNode.__CE_documentLoadHandled) return;
            importNode.__CE_documentLoadHandled = true;

            importNode.__CE_isImportDocument = true;

            // Connected links are associated with the registry.
            importNode.__CE_hasRegistry = true;

            // Clone the `visitedImports` set that was populated sync during
            // the `patchAndUpgradeTree` call that caused this 'load' handler to
            // be added. Then, remove *this* link's import node so that we can
            // walk that import again, even if it was partially walked later
            // during the same `patchAndUpgradeTree` call.
            visitedImports.delete(importNode);

            this.patchAndUpgradeTree(importNode, visitedImports);
          });
        }
      } else {
        elements.push(element);
      }
    };

    // `walkDeepDescendantElements` populates (and internally checks against)
    // `visitedImports` when traversing a loaded import.
    walkDeepDescendantElements(root, gatherElements, visitedImports);

    if (this._hasPatches) {
      for (let i = 0; i < elements.length; i++) {
        this.patch(elements[i]);
      }
    }

    for (let i = 0; i < elements.length; i++) {
      this.upgradeElement(elements[i]);
    }
  }

  /**
   * @param {!Element} element
   */
  upgradeElement(element) {
    const currentState = element.__CE_state;
    if (currentState !== undefined) return;

    const definition = this.localNameToDefinition(element.localName);
    if (!definition) return;

    definition.constructionStack.push(element);

    const constructor = definition.constructor;
    try {
      try {
        let result = new (constructor)();
        if (result !== element) {
          throw new Error('The custom element constructor did not produce the element being upgraded.');
        }
      } finally {
        definition.constructionStack.pop();
      }
    } catch (e) {
      element.__CE_state = CustomElementState.failed;
      throw e;
    }

    element.__CE_state = CustomElementState.custom;
    element.__CE_definition = definition;

    if (definition.attributeChangedCallback) {
      const observedAttributes = definition.observedAttributes;
      for (let i = 0; i < observedAttributes.length; i++) {
        const name = observedAttributes[i];
        const value = element.getAttribute(name);
        if (value !== null) {
          this.attributeChangedCallback(element, name, null, value, null);
        }
      }
    }

    if (isConnected(element)) {
      this.connectedCallback(element);
    }
  }

  /**
   * @param {!Element} element
   */
  connectedCallback(element) {
    const definition = element.__CE_definition;
    if (definition.connectedCallback) {
      definition.connectedCallback.call(element);
    }

    element.__CE_isConnectedCallbackCalled = true;
  }

  /**
   * @param {!Element} element
   */
  disconnectedCallback(element) {
    if (!element.__CE_isConnectedCallbackCalled) {
      this.connectedCallback(element);
    }

    const definition = element.__CE_definition;
    if (definition.disconnectedCallback) {
      definition.disconnectedCallback.call(element);
    }

    element.__CE_isConnectedCallbackCalled = undefined;
  }

  /**
   * @param {!Element} element
   * @param {string} name
   * @param {?string} oldValue
   * @param {?string} newValue
   * @param {?string} namespace
   */
  attributeChangedCallback(element, name, oldValue, newValue, namespace) {
    const definition = element.__CE_definition;
    if (
      definition.attributeChangedCallback &&
      definition.observedAttributes.indexOf(name) > -1
    ) {
      definition.attributeChangedCallback.call(element, name, oldValue, newValue, namespace);
    }
  }
}

class DocumentConstructionObserver {
  constructor(internals, doc) {
    /**
     * @type {!CustomElementInternals}
     */
    this._internals = internals;

    /**
     * @type {!Document}
     */
    this._document = doc;

    /**
     * @type {MutationObserver|undefined}
     */
    this._observer = undefined;


    // Simulate tree construction for all currently accessible nodes in the
    // document.
    this._internals.patchAndUpgradeTree(this._document);

    if (this._document.readyState === 'loading') {
      this._observer = new MutationObserver(this._handleMutations.bind(this));

      // Nodes created by the parser are given to the observer *before* the next
      // task runs. Inline scripts are run in a new task. This means that the
      // observer will be able to handle the newly parsed nodes before the inline
      // script is run.
      this._observer.observe(this._document, {
        childList: true,
        subtree: true,
      });
    }
  }

  disconnect() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }

  /**
   * @param {!Array<!MutationRecord>} mutations
   */
  _handleMutations(mutations) {
    // Once the document's `readyState` is 'interactive' or 'complete', all new
    // nodes created within that document will be the result of script and
    // should be handled by patching.
    const readyState = this._document.readyState;
    if (readyState === 'interactive' || readyState === 'complete') {
      this.disconnect();
    }

    for (let i = 0; i < mutations.length; i++) {
      const addedNodes = mutations[i].addedNodes;
      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes[j];
        this._internals.patchAndUpgradeTree(node);
      }
    }
  }
}

/**
 * @template T
 */
class Deferred {
  constructor() {
    /**
     * @private
     * @type {T|undefined}
     */
    this._value = undefined;

    /**
     * @private
     * @type {Function|undefined}
     */
    this._resolve = undefined;

    /**
     * @private
     * @type {!Promise<T>}
     */
    this._promise = new Promise(resolve => {
      this._resolve = resolve;

      if (this._value) {
        resolve(this._value);
      }
    });
  }

  /**
   * @param {T} value
   */
  resolve(value) {
    if (this._value) {
      throw new Error('Already resolved.');
    }

    this._value = value;

    if (this._resolve) {
      this._resolve(value);
    }
  }

  /**
   * @return {!Promise<T>}
   */
  toPromise() {
    return this._promise;
  }
}

/**
 * @unrestricted
 */
class CustomElementRegistry {

  /**
   * @param {!CustomElementInternals} internals
   */
  constructor(internals) {
    /**
     * @private
     * @type {boolean}
     */
    this._elementDefinitionIsRunning = false;

    /**
     * @private
     * @type {!CustomElementInternals}
     */
    this._internals = internals;

    /**
     * @private
     * @type {!Map<string, !Deferred<undefined>>}
     */
    this._whenDefinedDeferred = new Map();

    /**
     * The default flush callback triggers the document walk synchronously.
     * @private
     * @type {!Function}
     */
    this._flushCallback = fn => fn();

    /**
     * @private
     * @type {boolean}
     */
    this._flushPending = false;

    /**
     * @private
     * @type {!Array<string>}
     */
    this._unflushedLocalNames = [];

    /**
     * @private
     * @type {!DocumentConstructionObserver}
     */
    this._documentConstructionObserver = new DocumentConstructionObserver(internals, document);
  }

  /**
   * @param {string} localName
   * @param {!Function} constructor
   */
  define(localName, constructor) {
    if (!(constructor instanceof Function)) {
      throw new TypeError('Custom element constructors must be functions.');
    }

    if (!isValidCustomElementName(localName)) {
      throw new SyntaxError(`The element name '${localName}' is not valid.`);
    }

    if (this._internals.localNameToDefinition(localName)) {
      throw new Error(`A custom element with name '${localName}' has already been defined.`);
    }

    if (this._elementDefinitionIsRunning) {
      throw new Error('A custom element is already being defined.');
    }
    this._elementDefinitionIsRunning = true;

    let connectedCallback;
    let disconnectedCallback;
    let adoptedCallback;
    let attributeChangedCallback;
    let observedAttributes;
    try {
      /** @type {!Object} */
      const prototype = constructor.prototype;
      if (!(prototype instanceof Object)) {
        throw new TypeError('The custom element constructor\'s prototype is not an object.');
      }

      function getCallback(name) {
        const callbackValue = prototype[name];
        if (callbackValue !== undefined && !(callbackValue instanceof Function)) {
          throw new Error(`The '${name}' callback must be a function.`);
        }
        return callbackValue;
      }

      connectedCallback = getCallback('connectedCallback');
      disconnectedCallback = getCallback('disconnectedCallback');
      adoptedCallback = getCallback('adoptedCallback');
      attributeChangedCallback = getCallback('attributeChangedCallback');
      observedAttributes = constructor['observedAttributes'] || [];
    } catch (e) {
      return;
    } finally {
      this._elementDefinitionIsRunning = false;
    }

    const definition = {
      localName,
      constructor,
      connectedCallback,
      disconnectedCallback,
      adoptedCallback,
      attributeChangedCallback,
      observedAttributes,
      constructionStack: [],
    };

    this._internals.setDefinition(localName, definition);

    this._unflushedLocalNames.push(localName);

    // If we've already called the flush callback and it hasn't called back yet,
    // don't call it again.
    if (!this._flushPending) {
      this._flushPending = true;
      this._flushCallback(() => this._flush());
    }
  }

  _flush() {
    // If no new definitions were defined, don't attempt to flush. This could
    // happen if a flush callback keeps the function it is given and calls it
    // multiple times.
    if (this._flushPending === false) return;

    this._flushPending = false;
    this._internals.patchAndUpgradeTree(document);

    while (this._unflushedLocalNames.length > 0) {
      const localName = this._unflushedLocalNames.shift();
      const deferred = this._whenDefinedDeferred.get(localName);
      if (deferred) {
        deferred.resolve(undefined);
      }
    }
  }

  /**
   * @param {string} localName
   * @return {Function|undefined}
   */
  get(localName) {
    const definition = this._internals.localNameToDefinition(localName);
    if (definition) {
      return definition.constructor;
    }

    return undefined;
  }

  /**
   * @param {string} localName
   * @return {!Promise<undefined>}
   */
  whenDefined(localName) {
    if (!isValidCustomElementName(localName)) {
      return Promise.reject(new SyntaxError(`'${localName}' is not a valid custom element name.`));
    }

    const prior = this._whenDefinedDeferred.get(localName);
    if (prior) {
      return prior.toPromise();
    }

    const deferred = new Deferred();
    this._whenDefinedDeferred.set(localName, deferred);

    const definition = this._internals.localNameToDefinition(localName);
    // Resolve immediately only if the given local name has a definition *and*
    // the full document walk to upgrade elements with that local name has
    // already happened.
    if (definition && this._unflushedLocalNames.indexOf(localName) === -1) {
      deferred.resolve(undefined);
    }

    return deferred.toPromise();
  }

  polyfillWrapFlushCallback(outer) {
    this._documentConstructionObserver.disconnect();
    const inner = this._flushCallback;
    this._flushCallback = flush => outer(() => inner(flush));
  }
}

// Closure compiler exports.
window['CustomElementRegistry'] = CustomElementRegistry;
CustomElementRegistry.prototype['define'] = CustomElementRegistry.prototype.define;
CustomElementRegistry.prototype['get'] = CustomElementRegistry.prototype.get;
CustomElementRegistry.prototype['whenDefined'] = CustomElementRegistry.prototype.whenDefined;
CustomElementRegistry.prototype['polyfillWrapFlushCallback'] = CustomElementRegistry.prototype.polyfillWrapFlushCallback;

var Native = {
  Document_createElement: window.Document.prototype.createElement,
  Document_createElementNS: window.Document.prototype.createElementNS,
  Document_importNode: window.Document.prototype.importNode,
  Document_prepend: window.Document.prototype['prepend'],
  Document_append: window.Document.prototype['append'],
  Node_cloneNode: window.Node.prototype.cloneNode,
  Node_appendChild: window.Node.prototype.appendChild,
  Node_insertBefore: window.Node.prototype.insertBefore,
  Node_removeChild: window.Node.prototype.removeChild,
  Node_replaceChild: window.Node.prototype.replaceChild,
  Node_textContent: Object.getOwnPropertyDescriptor(window.Node.prototype, 'textContent'),
  Element_attachShadow: window.Element.prototype['attachShadow'],
  Element_innerHTML: Object.getOwnPropertyDescriptor(window.Element.prototype, 'innerHTML'),
  Element_getAttribute: window.Element.prototype.getAttribute,
  Element_setAttribute: window.Element.prototype.setAttribute,
  Element_removeAttribute: window.Element.prototype.removeAttribute,
  Element_getAttributeNS: window.Element.prototype.getAttributeNS,
  Element_setAttributeNS: window.Element.prototype.setAttributeNS,
  Element_removeAttributeNS: window.Element.prototype.removeAttributeNS,
  Element_insertAdjacentElement: window.Element.prototype['insertAdjacentElement'],
  Element_prepend: window.Element.prototype['prepend'],
  Element_append: window.Element.prototype['append'],
  Element_before: window.Element.prototype['before'],
  Element_after: window.Element.prototype['after'],
  Element_replaceWith: window.Element.prototype['replaceWith'],
  Element_remove: window.Element.prototype['remove'],
  HTMLElement: window.HTMLElement,
  HTMLElement_innerHTML: Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'innerHTML'),
  HTMLElement_insertAdjacentElement: window.HTMLElement.prototype['insertAdjacentElement'],
};

/**
 * This class exists only to work around Closure's lack of a way to describe
 * singletons. It represents the 'already constructed marker' used in custom
 * element construction stacks.
 *
 * https://html.spec.whatwg.org/#concept-already-constructed-marker
 */
class AlreadyConstructedMarker {}

var AlreadyConstructedMarker$1 = new AlreadyConstructedMarker();

/**
 * @param {!CustomElementInternals} internals
 */
var PatchHTMLElement = function(internals) {
  window['HTMLElement'] = (function() {
    /**
     * @type {function(new: HTMLElement): !HTMLElement}
     */
    function HTMLElement() {
      // This should really be `new.target` but `new.target` can't be emulated
      // in ES5. Assuming the user keeps the default value of the constructor's
      // prototype's `constructor` property, this is equivalent.
      /** @type {!Function} */
      const constructor = this.constructor;

      const definition = internals.constructorToDefinition(constructor);
      if (!definition) {
        throw new Error('The custom element being constructed was not registered with `customElements`.');
      }

      const constructionStack = definition.constructionStack;

      if (constructionStack.length === 0) {
        const element = Native.Document_createElement.call(document, definition.localName);
        Object.setPrototypeOf(element, constructor.prototype);
        element.__CE_state = CustomElementState.custom;
        element.__CE_definition = definition;
        internals.patch(element);
        return element;
      }

      const lastIndex = constructionStack.length - 1;
      const element = constructionStack[lastIndex];
      if (element === AlreadyConstructedMarker$1) {
        throw new Error('The HTMLElement constructor was either called reentrantly for this constructor or called multiple times.');
      }
      constructionStack[lastIndex] = AlreadyConstructedMarker$1;

      Object.setPrototypeOf(element, constructor.prototype);
      internals.patch(/** @type {!HTMLElement} */ (element));

      return element;
    }

    HTMLElement.prototype = Native.HTMLElement.prototype;

    return HTMLElement;
  })();
};

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ParentNodeNativeMethods} builtIn
 */
var PatchParentNode = function(internals, destination, builtIn) {
  /**
   * @param {...(!Node|string)} nodes
   */
  destination['prepend'] = function(...nodes) {
    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    const connectedBefore = /** @type {!Array<!Node>} */ (nodes.filter(node => {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    }));

    builtIn.prepend.apply(this, nodes);

    for (let i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (isConnected(this)) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };

  /**
   * @param {...(!Node|string)} nodes
   */
  destination['append'] = function(...nodes) {
    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    const connectedBefore = /** @type {!Array<!Node>} */ (nodes.filter(node => {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    }));

    builtIn.append.apply(this, nodes);

    for (let i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (isConnected(this)) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchDocument = function(internals) {
  setPropertyUnchecked(Document.prototype, 'createElement',
    /**
     * @this {Document}
     * @param {string} localName
     * @return {!Element}
     */
    function(localName) {
      // Only create custom elements if this document is associated with the registry.
      if (this.__CE_hasRegistry) {
        const definition = internals.localNameToDefinition(localName);
        if (definition) {
          return new (definition.constructor)();
        }
      }

      const result = /** @type {!Element} */
        (Native.Document_createElement.call(this, localName));
      internals.patch(result);
      return result;
    });

  setPropertyUnchecked(Document.prototype, 'importNode',
    /**
     * @this {Document}
     * @param {!Node} node
     * @param {boolean=} deep
     * @return {!Node}
     */
    function(node, deep) {
      const clone = Native.Document_importNode.call(this, node, deep);
      // Only create custom elements if this document is associated with the registry.
      if (!this.__CE_hasRegistry) {
        internals.patchTree(clone);
      } else {
        internals.patchAndUpgradeTree(clone);
      }
      return clone;
    });

  const NS_HTML = "http://www.w3.org/1999/xhtml";

  setPropertyUnchecked(Document.prototype, 'createElementNS',
    /**
     * @this {Document}
     * @param {?string} namespace
     * @param {string} localName
     * @return {!Element}
     */
    function(namespace, localName) {
      // Only create custom elements if this document is associated with the registry.
      if (this.__CE_hasRegistry && (namespace === null || namespace === NS_HTML)) {
        const definition = internals.localNameToDefinition(localName);
        if (definition) {
          return new (definition.constructor)();
        }
      }

      const result = /** @type {!Element} */
        (Native.Document_createElementNS.call(this, namespace, localName));
      internals.patch(result);
      return result;
    });

  PatchParentNode(internals, Document.prototype, {
    prepend: Native.Document_prepend,
    append: Native.Document_append,
  });
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchNode = function(internals) {
  // `Node#nodeValue` is implemented on `Attr`.
  // `Node#textContent` is implemented on `Attr`, `Element`.

  setPropertyUnchecked(Node.prototype, 'insertBefore',
    /**
     * @this {Node}
     * @param {!Node} node
     * @param {?Node} refNode
     * @return {!Node}
     */
    function(node, refNode) {
      if (node instanceof DocumentFragment) {
        const insertedNodes = Array.prototype.slice.apply(node.childNodes);
        const nativeResult = Native.Node_insertBefore.call(this, node, refNode);

        // DocumentFragments can't be connected, so `disconnectTree` will never
        // need to be called on a DocumentFragment's children after inserting it.

        if (isConnected(this)) {
          for (let i = 0; i < insertedNodes.length; i++) {
            internals.connectTree(insertedNodes[i]);
          }
        }

        return nativeResult;
      }

      const nodeWasConnected = isConnected(node);
      const nativeResult = Native.Node_insertBefore.call(this, node, refNode);

      if (nodeWasConnected) {
        internals.disconnectTree(node);
      }

      if (isConnected(this)) {
        internals.connectTree(node);
      }

      return nativeResult;
    });

  setPropertyUnchecked(Node.prototype, 'appendChild',
    /**
     * @this {Node}
     * @param {!Node} node
     * @return {!Node}
     */
    function(node) {
      if (node instanceof DocumentFragment) {
        const insertedNodes = Array.prototype.slice.apply(node.childNodes);
        const nativeResult = Native.Node_appendChild.call(this, node);

        // DocumentFragments can't be connected, so `disconnectTree` will never
        // need to be called on a DocumentFragment's children after inserting it.

        if (isConnected(this)) {
          for (let i = 0; i < insertedNodes.length; i++) {
            internals.connectTree(insertedNodes[i]);
          }
        }

        return nativeResult;
      }

      const nodeWasConnected = isConnected(node);
      const nativeResult = Native.Node_appendChild.call(this, node);

      if (nodeWasConnected) {
        internals.disconnectTree(node);
      }

      if (isConnected(this)) {
        internals.connectTree(node);
      }

      return nativeResult;
    });

  setPropertyUnchecked(Node.prototype, 'cloneNode',
    /**
     * @this {Node}
     * @param {boolean=} deep
     * @return {!Node}
     */
    function(deep) {
      const clone = Native.Node_cloneNode.call(this, deep);
      // Only create custom elements if this element's owner document is
      // associated with the registry.
      if (!this.ownerDocument.__CE_hasRegistry) {
        internals.patchTree(clone);
      } else {
        internals.patchAndUpgradeTree(clone);
      }
      return clone;
    });

  setPropertyUnchecked(Node.prototype, 'removeChild',
    /**
     * @this {Node}
     * @param {!Node} node
     * @return {!Node}
     */
    function(node) {
      const nodeWasConnected = isConnected(node);
      const nativeResult = Native.Node_removeChild.call(this, node);

      if (nodeWasConnected) {
        internals.disconnectTree(node);
      }

      return nativeResult;
    });

  setPropertyUnchecked(Node.prototype, 'replaceChild',
    /**
     * @this {Node}
     * @param {!Node} nodeToInsert
     * @param {!Node} nodeToRemove
     * @return {!Node}
     */
    function(nodeToInsert, nodeToRemove) {
      if (nodeToInsert instanceof DocumentFragment) {
        const insertedNodes = Array.prototype.slice.apply(nodeToInsert.childNodes);
        const nativeResult = Native.Node_replaceChild.call(this, nodeToInsert, nodeToRemove);

        // DocumentFragments can't be connected, so `disconnectTree` will never
        // need to be called on a DocumentFragment's children after inserting it.

        if (isConnected(this)) {
          internals.disconnectTree(nodeToRemove);
          for (let i = 0; i < insertedNodes.length; i++) {
            internals.connectTree(insertedNodes[i]);
          }
        }

        return nativeResult;
      }

      const nodeToInsertWasConnected = isConnected(nodeToInsert);
      const nativeResult = Native.Node_replaceChild.call(this, nodeToInsert, nodeToRemove);
      const thisIsConnected = isConnected(this);

      if (thisIsConnected) {
        internals.disconnectTree(nodeToRemove);
      }

      if (nodeToInsertWasConnected) {
        internals.disconnectTree(nodeToInsert);
      }

      if (thisIsConnected) {
        internals.connectTree(nodeToInsert);
      }

      return nativeResult;
    });


  function patch_textContent(destination, baseDescriptor) {
    Object.defineProperty(destination, 'textContent', {
      enumerable: baseDescriptor.enumerable,
      configurable: true,
      get: baseDescriptor.get,
      set: /** @this {Node} */ function(assignedValue) {
        // If this is a text node then there are no nodes to disconnect.
        if (this.nodeType === Node.TEXT_NODE) {
          baseDescriptor.set.call(this, assignedValue);
          return;
        }

        let removedNodes = undefined;
        // Checking for `firstChild` is faster than reading `childNodes.length`
        // to compare with 0.
        if (this.firstChild) {
          // Using `childNodes` is faster than `children`, even though we only
          // care about elements.
          const childNodes = this.childNodes;
          const childNodesLength = childNodes.length;
          if (childNodesLength > 0 && isConnected(this)) {
            // Copying an array by iterating is faster than using slice.
            removedNodes = new Array(childNodesLength);
            for (let i = 0; i < childNodesLength; i++) {
              removedNodes[i] = childNodes[i];
            }
          }
        }

        baseDescriptor.set.call(this, assignedValue);

        if (removedNodes) {
          for (let i = 0; i < removedNodes.length; i++) {
            internals.disconnectTree(removedNodes[i]);
          }
        }
      },
    });
  }

  if (Native.Node_textContent && Native.Node_textContent.get) {
    patch_textContent(Node.prototype, Native.Node_textContent);
  } else {
    internals.addPatch(function(element) {
      patch_textContent(element, {
        enumerable: true,
        configurable: true,
        // NOTE: This implementation of the `textContent` getter assumes that
        // text nodes' `textContent` getter will not be patched.
        get: /** @this {Node} */ function() {
          /** @type {!Array<string>} */
          const parts = [];

          for (let i = 0; i < this.childNodes.length; i++) {
            parts.push(this.childNodes[i].textContent);
          }

          return parts.join('');
        },
        set: /** @this {Node} */ function(assignedValue) {
          while (this.firstChild) {
            Native.Node_removeChild.call(this, this.firstChild);
          }
          Native.Node_appendChild.call(this, document.createTextNode(assignedValue));
        },
      });
    });
  }
};

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ChildNodeNativeMethods} builtIn
 */
var PatchChildNode = function(internals, destination, builtIn) {
  /**
   * @param {...(!Node|string)} nodes
   */
  destination['before'] = function(...nodes) {
    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    const connectedBefore = /** @type {!Array<!Node>} */ (nodes.filter(node => {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    }));

    builtIn.before.apply(this, nodes);

    for (let i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (isConnected(this)) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };

  /**
   * @param {...(!Node|string)} nodes
   */
  destination['after'] = function(...nodes) {
    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    const connectedBefore = /** @type {!Array<!Node>} */ (nodes.filter(node => {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    }));

    builtIn.after.apply(this, nodes);

    for (let i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (isConnected(this)) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };

  /**
   * @param {...(!Node|string)} nodes
   */
  destination['replaceWith'] = function(...nodes) {
    // TODO: Fix this for when one of `nodes` is a DocumentFragment!
    const connectedBefore = /** @type {!Array<!Node>} */ (nodes.filter(node => {
      // DocumentFragments are not connected and will not be added to the list.
      return node instanceof Node && isConnected(node);
    }));

    const wasConnected = isConnected(this);

    builtIn.replaceWith.apply(this, nodes);

    for (let i = 0; i < connectedBefore.length; i++) {
      internals.disconnectTree(connectedBefore[i]);
    }

    if (wasConnected) {
      internals.disconnectTree(this);
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node instanceof Element) {
          internals.connectTree(node);
        }
      }
    }
  };

  destination['remove'] = function() {
    const wasConnected = isConnected(this);

    builtIn.remove.call(this);

    if (wasConnected) {
      internals.disconnectTree(this);
    }
  };
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchElement = function(internals) {
  if (Native.Element_attachShadow) {
    setPropertyUnchecked(Element.prototype, 'attachShadow',
      /**
       * @this {Element}
       * @param {!{mode: string}} init
       * @return {ShadowRoot}
       */
      function(init) {
        const shadowRoot = Native.Element_attachShadow.call(this, init);
        this.__CE_shadowRoot = shadowRoot;
        return shadowRoot;
      });
  } else {
    console.warn('Custom Elements: `Element#attachShadow` was not patched.');
  }


  function patch_innerHTML(destination, baseDescriptor) {
    Object.defineProperty(destination, 'innerHTML', {
      enumerable: baseDescriptor.enumerable,
      configurable: true,
      get: baseDescriptor.get,
      set: /** @this {Element} */ function(htmlString) {
        const isConnected$$1 = isConnected(this);

        // NOTE: In IE11, when using the native `innerHTML` setter, all nodes
        // that were previously descendants of the context element have all of
        // their children removed as part of the set - the entire subtree is
        // 'disassembled'. This work around walks the subtree *before* using the
        // native setter.
        /** @type {!Array<!Element>|undefined} */
        let removedElements = undefined;
        if (isConnected$$1) {
          removedElements = [];
          walkDeepDescendantElements(this, element => {
            if (element !== this) {
              removedElements.push(element);
            }
          });
        }

        baseDescriptor.set.call(this, htmlString);

        if (removedElements) {
          for (let i = 0; i < removedElements.length; i++) {
            const element = removedElements[i];
            if (element.__CE_state === CustomElementState.custom) {
              internals.disconnectedCallback(element);
            }
          }
        }

        // Only create custom elements if this element's owner document is
        // associated with the registry.
        if (!this.ownerDocument.__CE_hasRegistry) {
          internals.patchTree(this);
        } else {
          internals.patchAndUpgradeTree(this);
        }
        return htmlString;
      },
    });
  }

  if (Native.Element_innerHTML && Native.Element_innerHTML.get) {
    patch_innerHTML(Element.prototype, Native.Element_innerHTML);
  } else if (Native.HTMLElement_innerHTML && Native.HTMLElement_innerHTML.get) {
    patch_innerHTML(HTMLElement.prototype, Native.HTMLElement_innerHTML);
  } else {

    /** @type {HTMLDivElement} */
    const rawDiv = Native.Document_createElement.call(document, 'div');

    internals.addPatch(function(element) {
      patch_innerHTML(element, {
        enumerable: true,
        configurable: true,
        // Implements getting `innerHTML` by performing an unpatched `cloneNode`
        // of the element and returning the resulting element's `innerHTML`.
        // TODO: Is this too expensive?
        get: /** @this {Element} */ function() {
          return Native.Node_cloneNode.call(this, true).innerHTML;
        },
        // Implements setting `innerHTML` by creating an unpatched element,
        // setting `innerHTML` of that element and replacing the target
        // element's children with those of the unpatched element.
        set: /** @this {Element} */ function(assignedValue) {
          // NOTE: re-route to `content` for `template` elements.
          // We need to do this because `template.appendChild` does not
          // route into `template.content`.
          /** @type {!Node} */
          const content = this.localName === 'template' ? (/** @type {!HTMLTemplateElement} */ (this)).content : this;
          rawDiv.innerHTML = assignedValue;

          while (content.childNodes.length > 0) {
            Native.Node_removeChild.call(content, content.childNodes[0]);
          }
          while (rawDiv.childNodes.length > 0) {
            Native.Node_appendChild.call(content, rawDiv.childNodes[0]);
          }
        },
      });
    });
  }


  setPropertyUnchecked(Element.prototype, 'setAttribute',
    /**
     * @this {Element}
     * @param {string} name
     * @param {string} newValue
     */
    function(name, newValue) {
      // Fast path for non-custom elements.
      if (this.__CE_state !== CustomElementState.custom) {
        return Native.Element_setAttribute.call(this, name, newValue);
      }

      const oldValue = Native.Element_getAttribute.call(this, name);
      Native.Element_setAttribute.call(this, name, newValue);
      newValue = Native.Element_getAttribute.call(this, name);
      internals.attributeChangedCallback(this, name, oldValue, newValue, null);
    });

  setPropertyUnchecked(Element.prototype, 'setAttributeNS',
    /**
     * @this {Element}
     * @param {?string} namespace
     * @param {string} name
     * @param {string} newValue
     */
    function(namespace, name, newValue) {
      // Fast path for non-custom elements.
      if (this.__CE_state !== CustomElementState.custom) {
        return Native.Element_setAttributeNS.call(this, namespace, name, newValue);
      }

      const oldValue = Native.Element_getAttributeNS.call(this, namespace, name);
      Native.Element_setAttributeNS.call(this, namespace, name, newValue);
      newValue = Native.Element_getAttributeNS.call(this, namespace, name);
      internals.attributeChangedCallback(this, name, oldValue, newValue, namespace);
    });

  setPropertyUnchecked(Element.prototype, 'removeAttribute',
    /**
     * @this {Element}
     * @param {string} name
     */
    function(name) {
      // Fast path for non-custom elements.
      if (this.__CE_state !== CustomElementState.custom) {
        return Native.Element_removeAttribute.call(this, name);
      }

      const oldValue = Native.Element_getAttribute.call(this, name);
      Native.Element_removeAttribute.call(this, name);
      if (oldValue !== null) {
        internals.attributeChangedCallback(this, name, oldValue, null, null);
      }
    });

  setPropertyUnchecked(Element.prototype, 'removeAttributeNS',
    /**
     * @this {Element}
     * @param {?string} namespace
     * @param {string} name
     */
    function(namespace, name) {
      // Fast path for non-custom elements.
      if (this.__CE_state !== CustomElementState.custom) {
        return Native.Element_removeAttributeNS.call(this, namespace, name);
      }

      const oldValue = Native.Element_getAttributeNS.call(this, namespace, name);
      Native.Element_removeAttributeNS.call(this, namespace, name);
      // In older browsers, `Element#getAttributeNS` may return the empty string
      // instead of null if the attribute does not exist. For details, see;
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS#Notes
      const newValue = Native.Element_getAttributeNS.call(this, namespace, name);
      if (oldValue !== newValue) {
        internals.attributeChangedCallback(this, name, oldValue, newValue, namespace);
      }
    });


  function patch_insertAdjacentElement(destination, baseMethod) {
    setPropertyUnchecked(destination, 'insertAdjacentElement',
      /**
       * @this {Element}
       * @param {string} where
       * @param {!Element} element
       * @return {?Element}
       */
      function(where, element) {
        const wasConnected = isConnected(element);
        const insertedElement = /** @type {!Element} */
          (baseMethod.call(this, where, element));

        if (wasConnected) {
          internals.disconnectTree(element);
        }

        if (isConnected(insertedElement)) {
          internals.connectTree(element);
        }
        return insertedElement;
      });
  }

  if (Native.HTMLElement_insertAdjacentElement) {
    patch_insertAdjacentElement(HTMLElement.prototype, Native.HTMLElement_insertAdjacentElement);
  } else if (Native.Element_insertAdjacentElement) {
    patch_insertAdjacentElement(Element.prototype, Native.Element_insertAdjacentElement);
  } else {
    console.warn('Custom Elements: `Element#insertAdjacentElement` was not patched.');
  }


  PatchParentNode(internals, Element.prototype, {
    prepend: Native.Element_prepend,
    append: Native.Element_append,
  });

  PatchChildNode(internals, Element.prototype, {
    before: Native.Element_before,
    after: Native.Element_after,
    replaceWith: Native.Element_replaceWith,
    remove: Native.Element_remove,
  });
};

/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

const priorCustomElements = window['customElements'];

if (!priorCustomElements ||
     priorCustomElements['forcePolyfill'] ||
     (typeof priorCustomElements['define'] != 'function') ||
     (typeof priorCustomElements['get'] != 'function')) {
  /** @type {!CustomElementInternals} */
  const internals = new CustomElementInternals();

  PatchHTMLElement(internals);
  PatchDocument(internals);
  PatchNode(internals);
  PatchElement(internals);

  // The main document is always associated with the registry.
  document.__CE_hasRegistry = true;

  /** @type {!CustomElementRegistry} */
  const customElements = new CustomElementRegistry(internals);

  Object.defineProperty(window, 'customElements', {
    configurable: true,
    enumerable: true,
    value: customElements,
  });
}

/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.7.22
if (typeof WeakMap === "undefined") {
  (function () {
    var defineProperty = Object.defineProperty;
    var counter = Date.now() % 1e9;
    var WeakMap = function WeakMap() {
      this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
    };
    WeakMap.prototype = {
      set: function set(key, value) {
        var entry = key[this.name];
        if (entry && entry[0] === key) entry[1] = value;else defineProperty(key, this.name, {
          value: [key, value],
          writable: true
        });
        return this;
      },
      get: function get(key) {
        var entry;
        return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
      },
      "delete": function _delete(key) {
        var entry = key[this.name];
        if (!entry || entry[0] !== key) return false;
        entry[0] = entry[1] = undefined;
        return true;
      },
      has: function has(key) {
        var entry = key[this.name];
        if (!entry) return false;
        return entry[0] === key;
      }
    };
    window.WeakMap = WeakMap;
  })();
}

(function (global) {
  if (global.JsMutationObserver) {
    return;
  }
  var registrationsTable = new WeakMap();
  var setImmediate;
  if (/Trident|Edge/.test(navigator.userAgent)) {
    setImmediate = setTimeout;
  } else if (window.setImmediate) {
    setImmediate = window.setImmediate;
  } else {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener("message", function (e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function (func) {
          func();
        });
      }
    });
    setImmediate = function setImmediate(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, "*");
    };
  }
  var isScheduled = false;
  var scheduledObservers = [];
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }
  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
  }
  function dispatchCallbacks() {
    isScheduled = false;
    var observers = scheduledObservers;
    scheduledObservers = [];
    observers.sort(function (o1, o2) {
      return o1.uid_ - o2.uid_;
    });
    var anyNonEmpty = false;
    observers.forEach(function (observer) {
      var queue = observer.takeRecords();
      removeTransientObserversFor(observer);
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });
    if (anyNonEmpty) dispatchCallbacks();
  }
  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function (node) {
      var registrations = registrationsTable.get(node);
      if (!registrations) return;
      registrations.forEach(function (registration) {
        if (registration.observer === observer) registration.removeTransientObservers();
      });
    });
  }
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);
      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          var record = callback(options);
          if (record) registration.enqueue(record);
        }
      }
    }
  }
  var uidCounter = 0;
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }
  JsMutationObserver.prototype = {
    observe: function observe(target, options) {
      target = wrapIfNeeded(target);
      if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }
      var registrations = registrationsTable.get(target);
      if (!registrations) registrationsTable.set(target, registrations = []);
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }
      registration.addListeners();
    },
    disconnect: function disconnect() {
      this.nodes_.forEach(function (node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
      this.records_ = [];
    },
    takeRecords: function takeRecords() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }
  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }
  var currentRecord, recordWithOldValue;
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue) return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }
  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord) return lastRecord;
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
    return null;
  }
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }
  Registration.prototype = {
    enqueue: function enqueue(record) {
      var records = this.observer.records_;
      var length = records.length;
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }
      records[length] = record;
    },
    addListeners: function addListeners() {
      this.addListeners_(this.target);
    },
    addListeners_: function addListeners_(node) {
      var options = this.options;
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
    },
    removeListeners: function removeListeners() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function removeListeners_(node) {
      var options = this.options;
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
    },
    addTransientObserver: function addTransientObserver(node) {
      if (node === this.target) return;
      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations) registrationsTable.set(node, registrations = []);
      registrations.push(this);
    },
    removeTransientObservers: function removeTransientObservers() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];
      transientObservedNodes.forEach(function (node) {
        this.removeListeners_(node);
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
    },
    handleEvent: function handleEvent(e) {
      e.stopImmediatePropagation();
      switch (e.type) {
        case "DOMAttrModified":
          var name = e.attrName;
          var namespace = e.relatedNode.namespaceURI;
          var target = e.target;
          var record = new getRecord("attributes", target);
          record.attributeName = name;
          record.attributeNamespace = namespace;
          var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
          forEachAncestorAndObserverEnqueueRecord(target, function (options) {
            if (!options.attributes) return;
            if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
              return;
            }
            if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
            return record;
          });
          break;

        case "DOMCharacterDataModified":
          var target = e.target;
          var record = getRecord("characterData", target);
          var oldValue = e.prevValue;
          forEachAncestorAndObserverEnqueueRecord(target, function (options) {
            if (!options.characterData) return;
            if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
            return record;
          });
          break;

        case "DOMNodeRemoved":
          this.addTransientObserver(e.target);

        case "DOMNodeInserted":
          var changedNode = e.target;
          var addedNodes, removedNodes;
          if (e.type === "DOMNodeInserted") {
            addedNodes = [changedNode];
            removedNodes = [];
          } else {
            addedNodes = [];
            removedNodes = [changedNode];
          }
          var previousSibling = changedNode.previousSibling;
          var nextSibling = changedNode.nextSibling;
          var record = getRecord("childList", e.target.parentNode);
          record.addedNodes = addedNodes;
          record.removedNodes = removedNodes;
          record.previousSibling = previousSibling;
          record.nextSibling = nextSibling;
          forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function (options) {
            if (!options.childList) return;
            return record;
          });
      }
      clearRecords();
    }
  };
  global.JsMutationObserver = JsMutationObserver;
  if (!global.MutationObserver) {
    global.MutationObserver = JsMutationObserver;
    JsMutationObserver._isPolyfilled = true;
  }
})(self);

var global$2 = typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {};

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$2.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$2.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};





 // empty string to avoid regexp issues


















// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime

/*
Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function () {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                new Function("" + handler)();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function () {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function onGlobalMessage(event) {
            if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function setImmediate() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();
    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();
    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();
    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();
    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
})(self);

// Caution:
// Do not replace this import statement with codes.
//
// If you replace this import statement with codes,
// the codes will be executed after the following polyfills are imported
// because import statements are hoisted during compilation.
// Polyfill ECMAScript standard features with global namespace pollution
// Polyfill Custom Elements v1 with global namespace pollution
// Polyfill MutationObserver with global namespace pollution
// Polyfill setImmediate with global namespace pollution

(function () {
	'use strict';

	/**
  * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
  *
  * @codingstandard ftlabs-jsv2
  * @copyright The Financial Times Limited [All Rights Reserved]
  * @license MIT License (see LICENSE.txt)
  */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/

	/**
  * Instantiate fast-clicking listeners on the specified layer.
  *
  * @constructor
  * @param {Element} layer The layer to listen on
  * @param {Object} [options={}] The options to override the defaults
  */

	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
   * Whether a click is currently being tracked.
   *
   * @type boolean
   */
		this.trackingClick = false;

		/**
   * Timestamp for when click tracking started.
   *
   * @type number
   */
		this.trackingClickStart = 0;

		/**
   * The element being tracked for a click.
   *
   * @type EventTarget
   */
		this.targetElement = null;

		/**
   * X-coordinate of touch start event.
   *
   * @type number
   */
		this.touchStartX = 0;

		/**
   * Y-coordinate of touch start event.
   *
   * @type number
   */
		this.touchStartY = 0;

		/**
   * ID of the last touch, retrieved from Touch.identifier.
   *
   * @type number
   */
		this.lastTouchIdentifier = 0;

		/**
   * Touchmove boundary, beyond which a click will be cancelled.
   *
   * @type number
   */
		this.touchBoundary = options.touchBoundary || 10;

		/**
   * The FastClick layer.
   *
   * @type Element
   */
		this.layer = layer;

		/**
   * The minimum time between tap(touchstart and touchend) events
   *
   * @type number
   */
		this.tapDelay = options.tapDelay || 200;

		/**
   * The maximum time for a tap
   *
   * @type number
   */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function () {
				return method.apply(context, arguments);
			};
		}

		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function (type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function (type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function (event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function (event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
 * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
 *
 * @type boolean
 */
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
  * Android requires exceptions.
  *
  * @type boolean
  */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;

	/**
  * iOS requires exceptions.
  *
  * @type boolean
  */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;

	/**
  * iOS 4 requires an exception for select elements.
  *
  * @type boolean
  */
	var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);

	/**
  * iOS 6.0-7.* requires the target element to be manually derived
  *
  * @type boolean
  */
	var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);

	/**
  * BlackBerry requires exceptions.
  *
  * @type boolean
  */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
  * Determine whether a given element requires a native click.
  *
  * @param {EventTarget|Element} target Target DOM element
  * @returns {boolean} Returns true if the element needs a native click
  */
	FastClick.prototype.needsClick = function (target) {
		switch (target.nodeName.toLowerCase()) {

			// Don't send a synthetic click to disabled inputs (issue #62)
			case 'button':
			case 'select':
			case 'textarea':
				if (target.disabled) {
					return true;
				}

				break;
			case 'input':

				// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
				if (deviceIsIOS && target.type === 'file' || target.disabled) {
					return true;
				}

				break;
			case 'label':
			case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
			case 'video':
				return true;
		}

		return (/\bneedsclick\b/.test(target.className)
		);
	};

	/**
  * Determine whether a given element requires a call to focus to simulate click into element.
  *
  * @param {EventTarget|Element} target Target DOM element
  * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
  */
	FastClick.prototype.needsFocus = function (target) {
		switch (target.nodeName.toLowerCase()) {
			case 'textarea':
				return true;
			case 'select':
				return !deviceIsAndroid;
			case 'input':
				switch (target.type) {
					case 'button':
					case 'checkbox':
					case 'file':
					case 'image':
					case 'radio':
					case 'submit':
						return false;
				}

				// No point in attempting to focus disabled inputs
				return !target.disabled && !target.readOnly;
			default:
				return (/\bneedsfocus\b/.test(target.className)
				);
		}
	};

	/**
  * Send a click event to the specified element.
  *
  * @param {EventTarget|Element} targetElement
  * @param {Event} event
  */
	FastClick.prototype.sendClick = function (targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesize a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function (targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};

	/**
  * @param {EventTarget|Element} targetElement
  */
	FastClick.prototype.focus = function (targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};

	/**
  * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
  *
  * @param {EventTarget|Element} targetElement
  */
	FastClick.prototype.updateScrollParent = function (targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};

	/**
  * @param {EventTarget} targetElement
  * @returns {Element|EventTarget}
  */
	FastClick.prototype.getTargetElementFromEventTarget = function (eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};

	/**
  * On touch start, record the position and scroll offset.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onTouchStart = function (event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		// Ignore touches on contenteditable elements to prevent conflict with text selection.
		// (For details: https://github.com/ftlabs/fastclick/pull/211 )
		if (targetElement.isContentEditable) {
			return true;
		}

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if (event.timeStamp - this.lastClickTime < this.tapDelay && event.timeStamp - this.lastClickTime > -1) {
			event.preventDefault();
		}

		return true;
	};

	/**
  * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.touchHasMoved = function (event) {
		var touch = event.changedTouches[0],
		    boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};

	/**
  * Update the last position.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onTouchMove = function (event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};

	/**
  * Attempt to find the labelled control for the given label element.
  *
  * @param {EventTarget|HTMLLabelElement} labelElement
  * @returns {Element|null}
  */
	FastClick.prototype.findControl = function (labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};

	/**
  * On touch end, determine whether to send a click event at once.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onTouchEnd = function (event) {
		var forElement,
		    trackingClickStart,
		    targetTagName,
		    scrollParent,
		    touch,
		    targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if (event.timeStamp - this.lastClickTime < this.tapDelay && event.timeStamp - this.lastClickTime > -1) {
			this.cancelNextClick = true;
			return true;
		}

		if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === 'input') {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};

	/**
  * On touch cancel, stop tracking the click.
  *
  * @returns {void}
  */
	FastClick.prototype.onTouchCancel = function () {
		this.trackingClick = false;
		this.targetElement = null;
	};

	/**
  * Determine mouse events which should be permitted.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onMouse = function (event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};

	/**
  * On actual clicks, determine whether this is a touch-generated click, a click action occurring
  * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
  * an actual click which should be permitted.
  *
  * @param {Event} event
  * @returns {boolean}
  */
	FastClick.prototype.onClick = function (event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behavior on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};

	/**
  * Remove all FastClick's event listeners.
  *
  * @returns {void}
  */
	FastClick.prototype.destroy = function () {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};

	/**
  * Check whether FastClick is needed.
  *
  * @param {Element} layer The layer to listen on
  */
	FastClick.notNeeded = function (layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

				// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recommended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};

	/**
  * Factory method for creating a FastClick object
  *
  * @param {Element} layer The layer to listen on
  * @param {Object} [options={}] The options to override the defaults
  */
	FastClick.attach = function (layer, options) {
		return new FastClick(layer, options);
	};

	window.FastClick = FastClick;
})();

var microevent = createCommonjsModule(function (module) {
  /**
   * MicroEvent - to make any js object an event emitter (server or browser)
   * 
   * - pure javascript - server compatible, browser compatible
   * - dont rely on the browser doms
   * - super simple - you get it immediately, no mystery, no magic involved
   *
   * - create a MicroEventDebug with goodies to debug
   *   - make it safer to use
  */

  /** NOTE: This library is customized for Onsen UI. */

  var MicroEvent = function MicroEvent() {};
  MicroEvent.prototype = {
    on: function on(event, fct) {
      this._events = this._events || {};
      this._events[event] = this._events[event] || [];
      this._events[event].push(fct);
    },
    once: function once(event, fct) {
      var self = this;
      var wrapper = function wrapper() {
        self.off(event, wrapper);
        return fct.apply(null, arguments);
      };
      this.on(event, wrapper);
    },
    off: function off(event, fct) {
      this._events = this._events || {};
      if (event in this._events === false) return;

      this._events[event] = this._events[event].filter(function (_fct) {
        if (fct) {
          return fct !== _fct;
        } else {
          return false;
        }
      });
    },
    emit: function emit(event /* , args... */) {
      this._events = this._events || {};
      if (event in this._events === false) return;
      for (var i = 0; i < this._events[event].length; i++) {
        this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
  };

  /**
   * mixin will delegate all MicroEvent.js function in the destination object
   *
   * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
   *
   * @param {Object} the object which will support MicroEvent
  */
  MicroEvent.mixin = function (destObject) {
    var props = ['on', 'once', 'off', 'emit'];
    for (var i = 0; i < props.length; i++) {
      if (typeof destObject === 'function') {
        destObject.prototype[props[i]] = MicroEvent.prototype[props[i]];
      } else {
        destObject[props[i]] = MicroEvent.prototype[props[i]];
      }
    }
  };

  // export in common js
  if ('object' !== "undefined" && 'exports' in module) {
    module.exports = MicroEvent;
  }

  window.MicroEvent = MicroEvent;
});

(function () {
    function Viewport() {

        this.PRE_IOS7_VIEWPORT = "initial-scale=1, maximum-scale=1, user-scalable=no";
        this.IOS7_VIEWPORT = "initial-scale=1, maximum-scale=1, user-scalable=no";
        this.DEFAULT_VIEWPORT = "initial-scale=1, maximum-scale=1, user-scalable=no";

        this.ensureViewportElement();
        this.platform = {};
        this.platform.name = this.getPlatformName();
        this.platform.version = this.getPlatformVersion();

        return this;
    }

    Viewport.prototype.ensureViewportElement = function () {
        this.viewportElement = document.querySelector('meta[name=viewport]');
        if (!this.viewportElement) {
            this.viewportElement = document.createElement('meta');
            this.viewportElement.name = "viewport";
            document.head.appendChild(this.viewportElement);
        }
    }, Viewport.prototype.setup = function () {
        if (!this.viewportElement) {
            return;
        }

        if (this.viewportElement.getAttribute('data-no-adjust') == "true") {
            return;
        }

        if (!this.viewportElement.getAttribute('content')) {
            if (this.platform.name == 'ios') {
                if (this.platform.version >= 7 && isWebView()) {
                    this.viewportElement.setAttribute('content', this.IOS7_VIEWPORT);
                } else {
                    this.viewportElement.setAttribute('content', this.PRE_IOS7_VIEWPORT);
                }
            } else {
                this.viewportElement.setAttribute('content', this.DEFAULT_VIEWPORT);
            }
        }

        function isWebView() {
            return !!(window.cordova || window.phonegap || window.PhoneGap);
        }
    };

    Viewport.prototype.getPlatformName = function () {
        if (navigator.userAgent.match(/Android/i)) {
            return "android";
        }

        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            return "ios";
        }

        // unknown
        return undefined;
    };

    Viewport.prototype.getPlatformVersion = function () {
        var start = window.navigator.userAgent.indexOf('OS ');
        return window.Number(window.navigator.userAgent.substr(start + 3, 3).replace('_', '.'));
    };

    window.Viewport = Viewport;
})();

// Load non-polyfill libraries

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @object ons.platform
 * @category util
 * @description
 *   [en]Utility methods to detect current platform.[/en]
 *   [ja]現在実行されているプラットフォームを検知するためのユーティリティメソッドを収めたオブジェクトです。[/ja]
 */
var Platform = function () {

  /**
   * All elements will be rendered as if the app was running on this platform.
   * @type {String}
   */
  function Platform() {
    classCallCheck(this, Platform);

    this._renderPlatform = null;
  }

  /**
   * @method select
   * @signature select(platform)
   * @param  {string} platform Name of the platform.
   *   [en]Possible values are: "opera", "firefox", "safari", "chrome", "ie", "android", "blackberry", "ios" or "wp".[/en]
   *   [ja]"opera", "firefox", "safari", "chrome", "ie", "android", "blackberry", "ios", "wp"のいずれかを指定します。[/ja]
   * @description
   *   [en]Sets the platform used to render the elements. Useful for testing.[/en]
   *   [ja]要素を描画するために利用するプラットフォーム名を設定します。テストに便利です。[/ja]
   */


  createClass(Platform, [{
    key: 'select',
    value: function select(platform) {
      if (typeof platform === 'string') {
        this._renderPlatform = platform.trim().toLowerCase();
      }
    }

    /**
     * @method isWebView
     * @signature isWebView()
     * @description
     *   [en]Returns whether app is running in Cordova.[/en]
     *   [ja]Cordova内で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isWebView',
    value: function isWebView() {
      if (document.readyState === 'loading' || document.readyState == 'uninitialized') {
        throw new Error('isWebView() method is available after dom contents loaded.');
      }

      return !!(window.cordova || window.phonegap || window.PhoneGap);
    }

    /**
     * @method isIOS
     * @signature isIOS()
     * @description
     *   [en]Returns whether the OS is iOS.[/en]
     *   [ja]iOS上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isIOS',
    value: function isIOS() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'ios';
      } else if ((typeof device === 'undefined' ? 'undefined' : _typeof(device)) === 'object' && !/browser/i.test(device.platform)) {
        return (/iOS/i.test(device.platform)
        );
      } else {
        return (/iPhone|iPad|iPod/i.test(navigator.userAgent)
        );
      }
    }

    /**
     * @method isAndroid
     * @signature isAndroid()
     * @description
     *   [en]Returns whether the OS is Android.[/en]
     *   [ja]Android上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isAndroid',
    value: function isAndroid() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'android';
      } else if ((typeof device === 'undefined' ? 'undefined' : _typeof(device)) === 'object' && !/browser/i.test(device.platform)) {
        return (/Android/i.test(device.platform)
        );
      } else {
        return (/Android/i.test(navigator.userAgent)
        );
      }
    }

    /**
     * @method isAndroidPhone
     * @signature isAndroidPhone()
     * @description
     *   [en]Returns whether the device is Android phone.[/en]
     *   [ja]Android携帯上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isAndroidPhone',
    value: function isAndroidPhone() {
      return (/Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent)
      );
    }

    /**
     * @method isAndroidTablet
     * @signature isAndroidTablet()
     * @description
     *   [en]Returns whether the device is Android tablet.[/en]
     *   [ja]Androidタブレット上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isAndroidTablet',
    value: function isAndroidTablet() {
      return (/Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent)
      );
    }

    /**
     * @return {Boolean}
     */

  }, {
    key: 'isWP',
    value: function isWP() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'wp';
      } else if ((typeof device === 'undefined' ? 'undefined' : _typeof(device)) === 'object' && !/browser/i.test(device.platform)) {
        return (/Win32NT|WinCE/i.test(device.platform)
        );
      } else {
        return (/Windows Phone|IEMobile|WPDesktop/i.test(navigator.userAgent)
        );
      }
    }

    /**
     * @methos isIPhone
     * @signature isIPhone()
     * @description
     *   [en]Returns whether the device is iPhone.[/en]
     *   [ja]iPhone上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isIPhone',
    value: function isIPhone() {
      return (/iPhone/i.test(navigator.userAgent)
      );
    }

    /**
     * @method isIPad
     * @signature isIPad()
     * @description
     *   [en]Returns whether the device is iPad.[/en]
     *   [ja]iPad上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isIPad',
    value: function isIPad() {
      return (/iPad/i.test(navigator.userAgent)
      );
    }

    /**
     * @return {Boolean}
     */

  }, {
    key: 'isIPod',
    value: function isIPod() {
      return (/iPod/i.test(navigator.userAgent)
      );
    }

    /**
     * @method isBlackBerry
     * @signature isBlackBerry()
     * @description
     *   [en]Returns whether the device is BlackBerry.[/en]
     *   [ja]BlackBerry上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isBlackBerry',
    value: function isBlackBerry() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'blackberry';
      } else if ((typeof device === 'undefined' ? 'undefined' : _typeof(device)) === 'object' && !/browser/i.test(device.platform)) {
        return (/BlackBerry/i.test(device.platform)
        );
      } else {
        return (/BlackBerry|RIM Tablet OS|BB10/i.test(navigator.userAgent)
        );
      }
    }

    /**
     * @method isOpera
     * @signature isOpera()
     * @description
     *   [en]Returns whether the browser is Opera.[/en]
     *   [ja]Opera上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isOpera',
    value: function isOpera() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'opera';
      } else {
        return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      }
    }

    /**
     * @method isFirefox
     * @signature isFirefox()
     * @description
     *   [en]Returns whether the browser is Firefox.[/en]
     *   [ja]Firefox上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isFirefox',
    value: function isFirefox() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'firefox';
      } else {
        return typeof InstallTrigger !== 'undefined';
      }
    }

    /**
     * @method isSafari
     * @signature isSafari()
     * @description
     *   [en]Returns whether the browser is Safari.[/en]
     *   [ja]Safari上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isSafari',
    value: function isSafari() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'safari';
      } else {
        return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || function (p) {
          return p.toString() === '[object SafariRemoteNotification]';
        }(!window['safari'] || safari.pushNotification);
      }
    }

    /**
     * @method isChrome
     * @signature isChrome()
     * @description
     *   [en]Returns whether the browser is Chrome.[/en]
     *   [ja]Chrome上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isChrome',
    value: function isChrome() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'chrome';
      } else {
        return !!window.chrome && !(!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) && !(navigator.userAgent.indexOf(' Edge/') >= 0);
      }
    }

    /**
     * @method isIE
     * @signature isIE()
     * @description
     *   [en]Returns whether the browser is Internet Explorer.[/en]
     *   [ja]Internet Explorer上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isIE',
    value: function isIE() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'ie';
      } else {
        return false || !!document.documentMode;
      }
    }

    /**
     * @method isEdge
     * @signature isEdge()
     * @description
     *   [en]Returns whether the browser is Edge.[/en]
     *   [ja]Edge上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isEdge',
    value: function isEdge() {
      if (this._renderPlatform) {
        return this._renderPlatform === 'edge';
      } else {
        return navigator.userAgent.indexOf(' Edge/') >= 0;
      }
    }

    /**
     * @method isIOS7above
     * @signature isIOS7above()
     * @description
     *   [en]Returns whether the iOS version is 7 or above.[/en]
     *   [ja]iOS7以上で実行されているかどうかを返します。[/ja]
     * @return {Boolean}
     */

  }, {
    key: 'isIOS7above',
    value: function isIOS7above() {
      if ((typeof device === 'undefined' ? 'undefined' : _typeof(device)) === 'object' && !/browser/i.test(device.platform)) {
        return (/iOS/i.test(device.platform) && parseInt(device.version.split('.')[0]) >= 7
        );
      } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        var ver = (navigator.userAgent.match(/\b[0-9]+_[0-9]+(?:_[0-9]+)?\b/) || [''])[0].replace(/_/g, '.');
        return parseInt(ver.split('.')[0]) >= 7;
      }
      return false;
    }

    /**
     * @return {String}
     */

  }, {
    key: 'getMobileOS',
    value: function getMobileOS() {
      if (this.isAndroid()) {
        return 'android';
      } else if (this.isIOS()) {
        return 'ios';
      } else if (this.isWP()) {
        return 'wp';
      } else {
        return 'other';
      }
    }

    /**
     * @return {String}
     */

  }, {
    key: 'getIOSDevice',
    value: function getIOSDevice() {
      if (this.isIPhone()) {
        return 'iphone';
      } else if (this.isIPad()) {
        return 'ipad';
      } else if (this.isIPod()) {
        return 'ipod';
      } else {
        return 'na';
      }
    }
  }]);
  return Platform;
}();

var platform$1 = new Platform();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var pageAttributeExpression = {
  _variables: {},

  /**
   * Define a variable.
   *
   * @param {String} name Name of the variable
   * @param {String|Function} value Value of the variable. Can be a string or a function. The function must return a string.
   * @param {Boolean} overwrite If this value is false, an error will be thrown when trying to define a variable that has already been defined.
   */
  defineVariable: function defineVariable(name, value) {
    var overwrite = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (typeof name !== 'string') {
      throw new Error('Variable name must be a string.');
    } else if (typeof value !== 'string' && typeof value !== 'function') {
      throw new Error('Variable value must be a string or a function.');
    } else if (this._variables.hasOwnProperty(name) && !overwrite) {
      throw new Error('"' + name + '" is already defined.');
    }
    this._variables[name] = value;
  },

  /**
   * Get a variable.
   *
   * @param {String} name Name of the variable.
   * @return {String|Function|null}
   */
  getVariable: function getVariable(name) {
    if (!this._variables.hasOwnProperty(name)) {
      return null;
    }

    return this._variables[name];
  },

  /**
   * Remove a variable.
   *
   * @param {String} name Name of the varaible.
   */
  removeVariable: function removeVariable(name) {
    delete this._variables[name];
  },

  /**
   * Get all variables.
   *
   * @return {Object}
   */
  getAllVariables: function getAllVariables() {
    return this._variables;
  },
  _parsePart: function _parsePart(part) {
    var c = void 0,
        inInterpolation = false,
        currentIndex = 0;

    var tokens = [];

    if (part.length === 0) {
      throw new Error('Unable to parse empty string.');
    }

    for (var i = 0; i < part.length; i++) {
      c = part.charAt(i);

      if (c === '$' && part.charAt(i + 1) === '{') {
        if (inInterpolation) {
          throw new Error('Nested interpolation not supported.');
        }

        var token = part.substring(currentIndex, i);
        if (token.length > 0) {
          tokens.push(part.substring(currentIndex, i));
        }

        currentIndex = i;
        inInterpolation = true;
      } else if (c === '}') {
        if (!inInterpolation) {
          throw new Error('} must be preceeded by ${');
        }

        var _token = part.substring(currentIndex, i + 1);
        if (_token.length > 0) {
          tokens.push(part.substring(currentIndex, i + 1));
        }

        currentIndex = i + 1;
        inInterpolation = false;
      }
    }

    if (inInterpolation) {
      throw new Error('Unterminated interpolation.');
    }

    tokens.push(part.substring(currentIndex, part.length));

    return tokens;
  },
  _replaceToken: function _replaceToken(token) {
    var re = /^\${(.*?)}$/,
        match = token.match(re);

    if (match) {
      var name = match[1].trim();
      var variable = this.getVariable(name);

      if (variable === null) {
        throw new Error('Variable "' + name + '" does not exist.');
      } else if (typeof variable === 'string') {
        return variable;
      } else {
        var rv = variable();

        if (typeof rv !== 'string') {
          throw new Error('Must return a string.');
        }

        return rv;
      }
    } else {
      return token;
    }
  },
  _replaceTokens: function _replaceTokens(tokens) {
    return tokens.map(this._replaceToken.bind(this));
  },
  _parseExpression: function _parseExpression(expression) {
    return expression.split(',').map(function (part) {
      return part.trim();
    }).map(this._parsePart.bind(this)).map(this._replaceTokens.bind(this)).map(function (part) {
      return part.join('');
    });
  },

  /**
   * Evaluate an expression.
   *
   * @param {String} expression An page attribute expression.
   * @return {Array}
   */
  evaluate: function evaluate(expression) {
    if (!expression) {
      return [];
    }

    return this._parseExpression(expression);
  }
};

// Define default variables.
pageAttributeExpression.defineVariable('mobileOS', platform$1.getMobileOS());
pageAttributeExpression.defineVariable('iOSDevice', platform$1.getIOSDevice());
pageAttributeExpression.defineVariable('runtime', function () {
  return platform$1.isWebView() ? 'cordova' : 'browser';
});

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var internal$1 = {};

internal$1.config = {
  autoStatusBarFill: true,
  animationsDisabled: false,
  warningsDisabled: false
};

internal$1.nullElement = window.document.createElement('div');

/**
 * @return {Boolean}
 */
internal$1.isEnabledAutoStatusBarFill = function () {
  return !!internal$1.config.autoStatusBarFill;
};

/**
 * @param {String} html
 * @return {String}
 */
internal$1.normalizePageHTML = function (html) {
  return ('' + html).trim();
};

internal$1.waitDOMContentLoaded = function (callback) {
  if (window.document.readyState === 'loading' || window.document.readyState == 'uninitialized') {
    window.document.addEventListener('DOMContentLoaded', callback);
  } else {
    setImmediate(callback);
  }
};

internal$1.autoStatusBarFill = function (action) {
  var onReady = function onReady() {
    if (internal$1.shouldFillStatusBar()) {
      action();
    }
    document.removeEventListener('deviceready', onReady);
    document.removeEventListener('DOMContentLoaded', onReady);
  };

  if ((typeof device === 'undefined' ? 'undefined' : _typeof(device)) === 'object') {
    document.addEventListener('deviceready', onReady);
  } else if (['complete', 'interactive'].indexOf(document.readyState) === -1) {
    document.addEventListener('DOMContentLoaded', function () {
      onReady();
    });
  } else {
    onReady();
  }
};

internal$1.shouldFillStatusBar = function () {
  return internal$1.isEnabledAutoStatusBarFill() && platform$1.isWebView() && platform$1.isIOS7above();
};

internal$1.templateStore = {
  _storage: {},

  /**
   * @param {String} key
   * @return {String/null} template
   */
  get: function get$$1(key) {
    return internal$1.templateStore._storage[key] || null;
  },


  /**
   * @param {String} key
   * @param {String} template
   */
  set: function set(key, template) {
    internal$1.templateStore._storage[key] = template;
  }
};

window.document.addEventListener('_templateloaded', function (e) {
  if (e.target.nodeName.toLowerCase() === 'ons-template') {
    internal$1.templateStore.set(e.templateId, e.template);
  }
}, false);

window.document.addEventListener('DOMContentLoaded', function () {
  register('script[type="text/ons-template"]');
  register('script[type="text/template"]');
  register('script[type="text/ng-template"]');
  register('template');

  function register(query) {
    var templates = window.document.querySelectorAll(query);
    for (var i = 0; i < templates.length; i++) {
      internal$1.templateStore.set(templates[i].getAttribute('id'), templates[i].textContent || templates[i].content);
    }
  }
}, false);

/**
 * @param {String} page
 * @return {Promise}
 */
internal$1.getTemplateHTMLAsync = function (page) {
  return new Promise(function (resolve, reject) {
    setImmediate(function () {
      var cache = internal$1.templateStore.get(page);
      if (cache) {
        if (cache instanceof DocumentFragment) {
          return resolve(cache);
        }

        var html = typeof cache === 'string' ? cache : cache[1];
        return resolve(internal$1.normalizePageHTML(html));
      }

      var local = window.document.getElementById(page);
      if (local) {
        var _html = local.textContent || local.content;
        return resolve(_html);
      }

      var xhr = new XMLHttpRequest();
      xhr.open('GET', page, true);
      xhr.onload = function () {
        var html = xhr.responseText;
        if (xhr.status >= 400 && xhr.status < 600) {
          reject(html);
        } else {
          var fragment = util.createFragment(html);
          internal$1.templateStore.set(page, fragment);
          resolve(fragment);
        }
      };
      xhr.onerror = function () {
        throw new Error('The page is not found: ' + page);
      };
      xhr.send(null);
    });
  });
};

/**
 * @param {String} page
 * @return {Promise}
 */
internal$1.getPageHTMLAsync = function (page) {
  var pages = pageAttributeExpression.evaluate(page);

  var getPage = function getPage(page) {
    if (typeof page !== 'string') {
      return Promise.reject('Must specify a page.');
    }

    return internal$1.getTemplateHTMLAsync(page).catch(function (error) {
      if (pages.length === 0) {
        return Promise.reject(error);
      }

      return getPage(pages.shift());
    });
  };

  return getPage(pages.shift());
};

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var AnimatorFactory = function () {

  /**
   * @param {Object} opts
   * @param {Object} opts.animators The dictionary for animator classes
   * @param {Function} opts.baseClass The base class of animators
   * @param {String} [opts.baseClassName] The name of the base class of animators
   * @param {String} [opts.defaultAnimation] The default animation name
   * @param {Object} [opts.defaultAnimationOptions] The default animation options
   */
  function AnimatorFactory(opts) {
    classCallCheck(this, AnimatorFactory);

    this._animators = opts.animators;
    this._baseClass = opts.baseClass;
    this._baseClassName = opts.baseClassName || opts.baseClass.name;
    this._animation = opts.defaultAnimation || 'default';
    this._animationOptions = opts.defaultAnimationOptions || {};

    if (!this._animators[this._animation]) {
      throw new Error('No such animation: ' + this._animation);
    }
  }

  /**
   * @param {String} jsonString
   * @return {Object/null}
   */


  createClass(AnimatorFactory, [{
    key: 'setAnimationOptions',


    /**
     * @param {Object} options
     */
    value: function setAnimationOptions(options) {
      this._animationOptions = options;
    }

    /**
     * @param {Object} options
     * @param {String} [options.animation] The animation name
     * @param {Object} [options.animationOptions] The animation options
     * @param {Object} defaultAnimator The default animator instance
     * @return {Object} An animator instance
     */

  }, {
    key: 'newAnimator',
    value: function newAnimator() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var defaultAnimator = arguments[1];


      var animator = null;

      if (options.animation instanceof this._baseClass) {
        return options.animation;
      }

      var Animator = null;

      if (typeof options.animation === 'string') {
        Animator = this._animators[options.animation];
      }

      if (!Animator && defaultAnimator) {
        animator = defaultAnimator;
      } else {
        Animator = Animator || this._animators[this._animation];

        var animationOpts = util.extend({}, this._animationOptions, options.animationOptions || {}, internal$1.config.animationsDisabled ? { duration: 0, delay: 0 } : {});

        animator = new Animator(animationOpts);

        if (typeof animator === 'function') {
          animator = new animator(animationOpts); // eslint-disable-line new-cap
        }
      }

      if (!(animator instanceof this._baseClass)) {
        throw new Error('"animator" is not an instance of ' + this._baseClassName + '.');
      }

      return animator;
    }
  }], [{
    key: 'parseAnimationOptionsString',
    value: function parseAnimationOptionsString(jsonString) {
      try {
        if (typeof jsonString === 'string') {
          var result = util.animationOptionsParse(jsonString);
          if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object' && result !== null) {
            return result;
          } else {
            console.error('"animation-options" attribute must be a JSON object string: ' + jsonString);
          }
        }
        return {};
      } catch (e) {
        console.error('"animation-options" attribute must be a JSON object string: ' + jsonString);
        return {};
      }
    }
  }]);
  return AnimatorFactory;
}();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var ModifierUtil = function () {
  function ModifierUtil() {
    classCallCheck(this, ModifierUtil);
  }

  createClass(ModifierUtil, null, [{
    key: 'diff',

    /**
     * @param {String} last
     * @param {String} current
     */
    value: function diff(last, current) {
      last = makeDict(('' + last).trim());
      current = makeDict(('' + current).trim());

      var removed = Object.keys(last).reduce(function (result, token) {
        if (!current[token]) {
          result.push(token);
        }
        return result;
      }, []);

      var added = Object.keys(current).reduce(function (result, token) {
        if (!last[token]) {
          result.push(token);
        }
        return result;
      }, []);

      return { added: added, removed: removed };

      function makeDict(modifier) {
        var dict = {};
        ModifierUtil.split(modifier).forEach(function (token) {
          return dict[token] = token;
        });
        return dict;
      }
    }

    /**
     * @param {Object} diff
     * @param {Array} diff.removed
     * @param {Array} diff.added
     * @param {Object} classList
     * @param {String} template
     */

  }, {
    key: 'applyDiffToClassList',
    value: function applyDiffToClassList(diff, classList, template) {
      diff.added.map(function (modifier) {
        return template.replace(/\*/g, modifier);
      }).forEach(function (klass) {
        return classList.add(klass);
      });

      diff.removed.map(function (modifier) {
        return template.replace(/\*/g, modifier);
      }).forEach(function (klass) {
        return classList.remove(klass);
      });
    }

    /**
     * @param {Object} diff
     * @param {Array} diff.removed
     * @param {Array} diff.added
     * @param {HTMLElement} element
     * @param {Object} scheme
     */

  }, {
    key: 'applyDiffToElement',
    value: function applyDiffToElement(diff, element, scheme) {
      for (var selector in scheme) {
        if (scheme.hasOwnProperty(selector)) {
          var targetElements = !selector || util.match(element, selector) ? [element] : element.querySelectorAll(selector);
          for (var i = 0; i < targetElements.length; i++) {
            ModifierUtil.applyDiffToClassList(diff, targetElements[i].classList, scheme[selector]);
          }
        }
      }
    }

    /**
     * @param {String} last
     * @param {String} current
     * @param {HTMLElement} element
     * @param {Object} scheme
     */

  }, {
    key: 'onModifierChanged',
    value: function onModifierChanged(last, current, element, scheme) {
      return ModifierUtil.applyDiffToElement(ModifierUtil.diff(last, current), element, scheme);
    }

    /**
     * @param {HTMLElement} element
     * @param {Object} scheme
     */

  }, {
    key: 'initModifier',
    value: function initModifier(element, scheme) {
      var modifier = element.getAttribute('modifier');
      if (typeof modifier !== 'string') {
        return;
      }

      ModifierUtil.applyDiffToElement({
        removed: [],
        added: ModifierUtil.split(modifier)
      }, element, scheme);
    }
  }, {
    key: 'split',
    value: function split(modifier) {
      if (typeof modifier !== 'string') {
        return [];
      }

      return modifier.trim().split(/ +/).filter(function (token) {
        return token !== '';
      });
    }

    /**
     * Add modifier token to an element.
     */

  }, {
    key: 'addModifier',
    value: function addModifier(element, modifierToken) {
      if (!element.hasAttribute('modifier')) {
        element.setAttribute('modifier', modifierToken);
      } else {
        var tokens = ModifierUtil.split(element.getAttribute('modifier'));
        if (tokens.indexOf(modifierToken) == -1) {
          tokens.push(modifierToken);
          element.setAttribute('modifier', tokens.join(' '));
        }
      }
    }

    /**
     * Remove modifier token from an element.
     */

  }, {
    key: 'removeModifier',
    value: function removeModifier(element, modifierToken) {
      if (element.hasAttribute('modifier')) {
        var tokens = ModifierUtil.split(element.getAttribute('modifier'));
        var index = tokens.indexOf(modifierToken);
        if (index !== -1) {
          tokens.splice(index, 1);
          element.setAttribute('modifier', tokens.join(' '));
        }
      }
    }
  }]);
  return ModifierUtil;
}();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var ToastQueue = function () {
  function ToastQueue() {
    classCallCheck(this, ToastQueue);

    this.queue = [];
  }

  createClass(ToastQueue, [{
    key: "add",
    value: function add(fn, promise) {
      var _this = this;

      this.queue.push(fn);

      if (this.queue.length === 1) {
        setImmediate(this.queue[0]);
      }

      promise.then(function () {
        _this.queue.shift();

        if (_this.queue.length > 0) {
          setTimeout(_this.queue[0], 1000 / 30); // Apply some visual delay
        }
      });
    }
  }]);
  return ToastQueue;
}();

var ToastQueue$1 = new ToastQueue();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var LazyRepeatDelegate = function () {
  function LazyRepeatDelegate(userDelegate) {
    var templateElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    classCallCheck(this, LazyRepeatDelegate);

    if ((typeof userDelegate === 'undefined' ? 'undefined' : _typeof(userDelegate)) !== 'object' || userDelegate === null) {
      throw Error('"delegate" parameter must be an object.');
    }
    this._userDelegate = userDelegate;

    if (!(templateElement instanceof Element) && templateElement !== null) {
      throw Error('"templateElement" parameter must be an instance of Element or null.');
    }
    this._templateElement = templateElement;
  }

  createClass(LazyRepeatDelegate, [{
    key: 'hasRenderFunction',


    /**
     * @return {Boolean}
     */
    value: function hasRenderFunction() {
      return this._userDelegate._render instanceof Function;
    }

    /**
     * @return {void}
     */

  }, {
    key: '_render',
    value: function _render() {
      this._userDelegate._render.apply(this._userDelegate, arguments);
    }

    /**
     * @param {Number} index
     * @param {Function} done A function that take item object as parameter.
     */

  }, {
    key: 'loadItemElement',
    value: function loadItemElement(index, done) {
      if (this._userDelegate.loadItemElement instanceof Function) {
        this._userDelegate.loadItemElement(index, done);
      } else {
        var element = this._userDelegate.createItemContent(index, this._templateElement);
        if (!(element instanceof Element)) {
          throw Error('createItemContent() must return an instance of Element.');
        }

        done({ element: element });
      }
    }

    /**
     * @return {Number}
     */

  }, {
    key: 'countItems',
    value: function countItems() {
      var count = this._userDelegate.countItems();
      if (typeof count !== 'number') {
        throw Error('countItems() must return a number.');
      }
      return count;
    }

    /**
     * @param {Number} index
     * @param {Object} item
     * @param {Element} item.element
     */

  }, {
    key: 'updateItem',
    value: function updateItem(index, item) {
      if (this._userDelegate.updateItemContent instanceof Function) {
        this._userDelegate.updateItemContent(index, item);
      }
    }

    /**
     * @return {Number}
     */

  }, {
    key: 'calculateItemHeight',
    value: function calculateItemHeight(index) {
      if (this._userDelegate.calculateItemHeight instanceof Function) {
        var height = this._userDelegate.calculateItemHeight(index);

        if (typeof height !== 'number') {
          throw Error('calculateItemHeight() must return a number.');
        }

        return height;
      }

      return 0;
    }

    /**
     * @param {Number} index
     * @param {Object} item
     */

  }, {
    key: 'destroyItem',
    value: function destroyItem(index, item) {
      if (this._userDelegate.destroyItem instanceof Function) {
        this._userDelegate.destroyItem(index, item);
      }
    }

    /**
     * @return {void}
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      if (this._userDelegate.destroy instanceof Function) {
        this._userDelegate.destroy();
      }

      this._userDelegate = this._templateElement = null;
    }
  }, {
    key: 'itemHeight',
    get: function get$$1() {
      return this._userDelegate.itemHeight;
    }
  }]);
  return LazyRepeatDelegate;
}();

/**
 * This class provide core functions for ons-lazy-repeat.
 */
var LazyRepeatProvider = function () {

  /**
   * @param {Element} wrapperElement
   * @param {LazyRepeatDelegate} delegate
   */
  function LazyRepeatProvider(wrapperElement, delegate) {
    classCallCheck(this, LazyRepeatProvider);

    if (!(delegate instanceof LazyRepeatDelegate)) {
      throw Error('"delegate" parameter must be an instance of LazyRepeatDelegate.');
    }

    this._wrapperElement = wrapperElement;
    this._delegate = delegate;
    this._insertIndex = this._wrapperElement.children[0] && this._wrapperElement.children[0].tagName === 'ONS-LAZY-REPEAT' ? 1 : 0;

    if (wrapperElement.tagName.toLowerCase() === 'ons-list') {
      wrapperElement.classList.add('lazy-list');
    }

    this._pageContent = this._findPageContentElement(wrapperElement);

    if (!this._pageContent) {
      throw new Error('ons-lazy-repeat must be a descendant of an <ons-page> or an element.');
    }

    this.lastScrollTop = this._pageContent.scrollTop;
    this.padding = 0;
    this._topPositions = [0];
    this._renderedItems = {};

    if (!this._delegate.itemHeight && !this._delegate.calculateItemHeight(0)) {
      this._unknownItemHeight = true;
    }

    this._addEventListeners();
    this._onChange();
  }

  createClass(LazyRepeatProvider, [{
    key: '_findPageContentElement',
    value: function _findPageContentElement(wrapperElement) {
      var pageContent = util.findParent(wrapperElement, '.page__content');

      if (pageContent) {
        return pageContent;
      }

      var page = util.findParent(wrapperElement, 'ons-page');
      if (page) {
        var content = util.findChild(page, '.content');
        if (content) {
          return content;
        }
      }

      return null;
    }
  }, {
    key: '_checkItemHeight',
    value: function _checkItemHeight(callback) {
      var _this = this;

      this._delegate.loadItemElement(0, function (item) {
        if (!_this._unknownItemHeight) {
          throw Error('Invalid state');
        }

        _this._wrapperElement.appendChild(item.element);

        var done = function done() {
          _this._delegate.destroyItem(0, item);
          _this._wrapperElement.removeChild(item.element);
          delete _this._unknownItemHeight;
          callback();
        };

        _this._itemHeight = item.element.offsetHeight;

        if (_this._itemHeight > 0) {
          done();
          return;
        }

        // retry to measure offset height
        // dirty fix for angular2 directive
        var lastVisibility = _this._wrapperElement.style.visibility;
        _this._wrapperElement.style.visibility = 'hidden';
        item.element.style.visibility = 'hidden';

        setImmediate(function () {
          _this._itemHeight = item.element.offsetHeight;
          if (_this._itemHeight == 0) {
            throw Error('Invalid state: this._itemHeight must be greater than zero.');
          }
          _this._wrapperElement.style.visibility = lastVisibility;
          done();
        });
      });
    }
  }, {
    key: '_countItems',
    value: function _countItems() {
      return this._delegate.countItems();
    }
  }, {
    key: '_getItemHeight',
    value: function _getItemHeight(i) {
      // Item is rendered
      if (this._renderedItems.hasOwnProperty(i)) {
        if (!this._renderedItems[i].hasOwnProperty('height')) {
          this._renderedItems[i].height = this._renderedItems[i].element.offsetHeight;
        }
        return this._renderedItems[i].height;
      }

      // Item is not rendered, scroll up
      if (this._topPositions[i + 1] && this._topPositions[i]) {
        return this._topPositions[i + 1] - this._topPositions[i];
      }
      // Item is not rendered, scroll down
      return this.staticItemHeight || this._delegate.calculateItemHeight(i);
    }
  }, {
    key: '_calculateRenderedHeight',
    value: function _calculateRenderedHeight() {
      var _this2 = this;

      return Object.keys(this._renderedItems).reduce(function (a, b) {
        return a + _this2._getItemHeight(+b);
      }, 0);
    }
  }, {
    key: '_onChange',
    value: function _onChange() {
      this._render();
    }
  }, {
    key: '_lastItemRendered',
    value: function _lastItemRendered() {
      return Math.max.apply(Math, toConsumableArray(Object.keys(this._renderedItems)));
    }
  }, {
    key: '_firstItemRendered',
    value: function _firstItemRendered() {
      return Math.min.apply(Math, toConsumableArray(Object.keys(this._renderedItems)));
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      var lastItemIndex = Math.min(this._lastItemRendered(), this._countItems() - 1);
      var firstItemIndex = this._firstItemRendered();
      this._wrapperElement.style.height = this._topPositions[firstItemIndex] + this._calculateRenderedHeight() + 'px';
      this.padding = this._topPositions[firstItemIndex];
      this._removeAllElements();
      this._render({ forceScrollDown: true, forceFirstIndex: firstItemIndex, forceLastIndex: lastItemIndex });
      this._wrapperElement.style.height = 'inherit';
    }
  }, {
    key: '_render',
    value: function _render() {
      var _this3 = this;

      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$forceScrollDown = _ref.forceScrollDown,
          forceScrollDown = _ref$forceScrollDown === undefined ? false : _ref$forceScrollDown,
          forceFirstIndex = _ref.forceFirstIndex,
          forceLastIndex = _ref.forceLastIndex;

      if (this._unknownItemHeight) {
        return this._checkItemHeight(this._render.bind(this, arguments[0]));
      }

      var isScrollUp = !forceScrollDown && this.lastScrollTop > this._pageContent.scrollTop;
      this.lastScrollTop = this._pageContent.scrollTop;
      var keep = {};

      var offset = this._wrapperElement.getBoundingClientRect().top;
      var limit = 4 * window.innerHeight - offset;
      var count = this._countItems();

      var start = forceFirstIndex || Math.max(0, this._calculateStartIndex(offset) - 30);
      var i = start;

      for (var top = this._topPositions[i]; i < count && top < limit; i++) {
        if (i >= this._topPositions.length) {
          // perf optimization
          this._topPositions.length += 100;
        }

        this._topPositions[i] = top;
        top += this._getItemHeight(i);
      }

      if (this._delegate.hasRenderFunction && this._delegate.hasRenderFunction()) {
        return this._delegate._render(start, i, function () {
          _this3.padding = _this3._topPositions[start];
        });
      }

      if (isScrollUp) {
        for (var j = i - 1; j >= start; j--) {
          keep[j] = true;
          this._renderElement(j, isScrollUp);
        }
      } else {
        var lastIndex = forceLastIndex || Math.max.apply(Math, [i - 1].concat(toConsumableArray(Object.keys(this._renderedItems))));
        for (var _j = start; _j <= lastIndex; _j++) {
          keep[_j] = true;
          this._renderElement(_j, isScrollUp);
        }
      }

      Object.keys(this._renderedItems).forEach(function (key) {
        return keep[key] || _this3._removeElement(key, isScrollUp);
      });
    }

    /**
     * @param {Number} index
     * @param {Boolean} isScrollUp
     */

  }, {
    key: '_renderElement',
    value: function _renderElement(index, isScrollUp) {
      var _this4 = this;

      var item = this._renderedItems[index];
      if (item) {
        this._delegate.updateItem(index, item); // update if it exists
        return;
      }

      this._delegate.loadItemElement(index, function (item) {
        if (isScrollUp) {
          _this4._wrapperElement.insertBefore(item.element, _this4._wrapperElement.children[_this4._insertIndex]);
          _this4.padding = _this4._topPositions[index];
          item.height = _this4._topPositions[index + 1] - _this4._topPositions[index];
        } else {
          _this4._wrapperElement.appendChild(item.element);
        }

        _this4._renderedItems[index] = item;
      });
    }

    /**
     * @param {Number} index
     * @param {Boolean} isScrollUp
     */

  }, {
    key: '_removeElement',
    value: function _removeElement(index) {
      var isScrollUp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      index = +index;
      var item = this._renderedItems[index];
      this._delegate.destroyItem(index, item);

      if (isScrollUp) {
        this._topPositions[index + 1] = undefined;
      } else {
        this.padding = this.padding + this._getItemHeight(index);
      }

      if (item.element.parentElement) {
        item.element.parentElement.removeChild(item.element);
      }

      delete this._renderedItems[index];
    }
  }, {
    key: '_removeAllElements',
    value: function _removeAllElements() {
      var _this5 = this;

      Object.keys(this._renderedItems).forEach(function (key) {
        return _this5._removeElement(key);
      });
    }
  }, {
    key: '_recalculateTopPositions',
    value: function _recalculateTopPositions(start, end) {
      for (var i = start; i <= end; i++) {
        this._topPositions[i + 1] = this._topPositions[i] + this._getItemHeight(i);
      }
    }
  }, {
    key: '_calculateStartIndex',
    value: function _calculateStartIndex(current) {
      var firstItemIndex = this._firstItemRendered();
      var lastItemIndex = this._lastItemRendered();

      // Fix for Safari scroll and Angular 2
      this._recalculateTopPositions(firstItemIndex, lastItemIndex);

      var start = 0;
      var end = this._countItems() - 1;

      // Binary search for index at top of screen so we can speed up rendering.
      for (;;) {
        var middle = Math.floor((start + end) / 2);
        var value = current + this._topPositions[middle];

        if (end < start) {
          return 0;
        } else if (value <= 0 && value + this._getItemHeight(middle) > 0) {
          return middle;
        } else if (isNaN(value) || value >= 0) {
          end = middle - 1;
        } else {
          start = middle + 1;
        }
      }
    }
  }, {
    key: '_debounce',
    value: function _debounce(func, wait, immediate) {
      var timeout = void 0;
      return function () {
        var _this6 = this,
            _arguments = arguments;

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        if (callNow) {
          func.apply(this, arguments);
        } else {
          timeout = setTimeout(function () {
            timeout = null;
            func.apply(_this6, _arguments);
          }, wait);
        }
      };
    }
  }, {
    key: '_doubleFireOnTouchend',
    value: function _doubleFireOnTouchend() {
      this._render();
      this._debounce(this._render.bind(this), 100);
    }
  }, {
    key: '_addEventListeners',
    value: function _addEventListeners() {
      util.bindListeners(this, ['_onChange', '_doubleFireOnTouchend']);

      if (platform$1.isIOS()) {
        this._boundOnChange = this._debounce(this._boundOnChange, 30);
      }

      this._pageContent.addEventListener('scroll', this._boundOnChange, true);

      if (platform$1.isIOS()) {
        this._pageContent.addEventListener('touchmove', this._boundOnChange, true);
        this._pageContent.addEventListener('touchend', this._boundDoubleFireOnTouchend, true);
      }

      window.document.addEventListener('resize', this._boundOnChange, true);
    }
  }, {
    key: '_removeEventListeners',
    value: function _removeEventListeners() {
      this._pageContent.removeEventListener('scroll', this._boundOnChange, true);

      if (platform$1.isIOS()) {
        this._pageContent.removeEventListener('touchmove', this._boundOnChange, true);
        this._pageContent.removeEventListener('touchend', this._boundDoubleFireOnTouchend, true);
      }

      window.document.removeEventListener('resize', this._boundOnChange, true);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._removeAllElements();
      this._delegate.destroy();
      this._parentElement = this._delegate = this._renderedItems = null;
      this._removeEventListeners();
    }
  }, {
    key: 'padding',
    get: function get$$1() {
      return parseInt(this._wrapperElement.style.paddingTop, 10);
    },
    set: function set(newValue) {
      this._wrapperElement.style.paddingTop = newValue + 'px';
    }
  }, {
    key: 'staticItemHeight',
    get: function get$$1() {
      return this._delegate.itemHeight || this._itemHeight;
    }
  }]);
  return LazyRepeatProvider;
}();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
internal$1.AnimatorFactory = AnimatorFactory;
internal$1.ModifierUtil = ModifierUtil;
internal$1.ToastQueue = ToastQueue$1;
internal$1.LazyRepeatProvider = LazyRepeatProvider;
internal$1.LazyRepeatDelegate = LazyRepeatDelegate;

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var autoStyleEnabled = true;

// Modifiers
var modifiersMap = {
  'quiet': 'material--flat',
  'light': 'material--flat',
  'outline': 'material--flat',
  'cta': '',
  'large--quiet': 'material--flat large',
  'large--cta': 'large',
  'noborder': '',
  'tappable': ''
};

var platforms = {};

platforms.android = function (element) {

  var elementName = element.tagName.toLowerCase();

  if (!/ons-speed-dial/.test(elementName) && !/material/.test(element.getAttribute('modifier'))) {

    var oldModifier = element.getAttribute('modifier') || '';

    var newModifier = oldModifier.trim().split(/\s+/).map(function (e) {
      return modifiersMap.hasOwnProperty(e) ? modifiersMap[e] : e;
    });
    newModifier.unshift('material');

    element.setAttribute('modifier', newModifier.join(' ').trim());
  }

  var elements = ['ons-alert-dialog-button', 'ons-toolbar-button', 'ons-back-button', 'ons-button', 'ons-list-item', 'ons-fab', 'ons-speed-dial', 'ons-speed-dial-item', 'ons-tab'];

  // Effects
  if (elements.indexOf(elementName) !== -1 && !element.hasAttribute('ripple') && !element.querySelector('ons-ripple')) {

    if (elementName === 'ons-list-item') {
      if (element.hasAttribute('tappable')) {
        element.setAttribute('ripple', '');
        element.removeAttribute('tappable');
      }
    } else {
      element.setAttribute('ripple', '');
    }
  }
};

platforms.ios = function (element) {

  // Modifiers
  if (/material/.test(element.getAttribute('modifier'))) {
    util.removeModifier(element, 'material');

    if (util.removeModifier(element, 'material--flat')) {
      util.addModifier(element, util.removeModifier(element, 'large') ? 'large--quiet' : 'quiet');
    }

    if (!element.getAttribute('modifier')) {
      element.removeAttribute('modifier');
    }
  }

  // Effects
  if (element.hasAttribute('ripple')) {
    if (element.tagName.toLowerCase() === 'ons-list-item') {
      element.setAttribute('tappable', '');
    }

    element.removeAttribute('ripple');
  }
};

var unlocked = {
  android: true
};

var prepareAutoStyle = function prepareAutoStyle(element, force) {
  if (autoStyleEnabled && !element.hasAttribute('disable-auto-styling')) {
    var mobileOS = platform$1.getMobileOS();
    if (platforms.hasOwnProperty(mobileOS) && (unlocked.hasOwnProperty(mobileOS) || force)) {
      platforms[mobileOS](element);
    }
  }
};

/**
 * @param {Element} element
 * @param {Object} object
 */
var caseOf = function caseOf(element, object) {
  if (autoStyleEnabled && !element.hasAttribute('disable-auto-styling')) {
    var mobileOS = platform$1.getMobileOS();
    if (object.hasOwnProperty(mobileOS) && unlocked.hasOwnProperty(mobileOS)) {
      return object[mobileOS];
    }
  }

  return object['default'];
};

var mapModifier = function mapModifier(modifier, element, force) {
  if (autoStyleEnabled && !element.hasAttribute('disable-auto-styling')) {
    var mobileOS = platform$1.getMobileOS();
    if (platforms.hasOwnProperty(mobileOS) && (unlocked.hasOwnProperty(mobileOS) || force)) {
      return modifiersMap.hasOwnProperty(modifier) ? modifiersMap[modifier] : modifier;
    }
  }

  return modifier;
};

var autoStyle = {
  isEnabled: function isEnabled() {
    return autoStyleEnabled;
  },
  enable: function enable() {
    return autoStyleEnabled = true;
  },
  disable: function disable() {
    return autoStyleEnabled = false;
  },
  prepare: prepareAutoStyle,
  mapModifier: mapModifier,
  caseOf: caseOf
};

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

'use strict';

var unwrap = function unwrap(string) {
  return string.slice(1, -1);
};
var isObjectString = function isObjectString(string) {
  return string.startsWith('{') && string.endsWith('}');
};
var isArrayString = function isArrayString(string) {
  return string.startsWith('[') && string.endsWith(']');
};
var isQuotedString = function isQuotedString(string) {
  return string.startsWith('\'') && string.endsWith('\'') || string.startsWith('"') && string.endsWith('"');
};

var error = function error(token, string, originalString) {
  throw new Error('Unexpected token \'' + token + '\' at position ' + (originalString.length - string.length - 1) + ' in string: \'' + originalString + '\'');
};

var processToken = function processToken(token, string, originalString) {
  if (token === 'true' || token === 'false') {
    return token === 'true';
  } else if (isQuotedString(token)) {
    return unwrap(token);
  } else if (!isNaN(token)) {
    return +token;
  } else if (isObjectString(token)) {
    return parseObject(unwrap(token));
  } else if (isArrayString(token)) {
    return parseArray(unwrap(token));
  } else {
    error(token, string, originalString);
  }
};

var nextToken = function nextToken(string) {
  string = string.trimLeft();
  var limit = string.length;

  if (string[0] === ':' || string[0] === ',') {

    limit = 1;
  } else if (string[0] === '{' || string[0] === '[') {

    var c = string.charCodeAt(0);
    var nestedObject = 1;
    for (var i = 1; i < string.length; i++) {
      if (string.charCodeAt(i) === c) {
        nestedObject++;
      } else if (string.charCodeAt(i) === c + 2) {
        nestedObject--;
        if (nestedObject === 0) {
          limit = i + 1;
          break;
        }
      }
    }
  } else if (string[0] === '\'' || string[0] === '\"') {

    for (var _i = 1; _i < string.length; _i++) {
      if (string[_i] === string[0]) {
        limit = _i + 1;
        break;
      }
    }
  } else {

    for (var _i2 = 1; _i2 < string.length; _i2++) {
      if ([' ', ',', ':'].indexOf(string[_i2]) !== -1) {
        limit = _i2;
        break;
      }
    }
  }

  return string.slice(0, limit);
};

var parseObject = function parseObject(string) {
  var isValidKey = function isValidKey(key) {
    return (/^[A-Z_\$][A-Z0-9_\$]*$/i.test(key)
    );
  };

  string = string.trim();
  var originalString = string;
  var object = {};
  var readingKey = true,
      key = void 0,
      previousToken = void 0,
      token = void 0;

  while (string.length > 0) {
    previousToken = token;
    token = nextToken(string);
    string = string.slice(token.length, string.length).trimLeft();

    if (token === ':' && (!readingKey || !previousToken || previousToken === ',') || token === ',' && readingKey || token !== ':' && token !== ',' && previousToken && previousToken !== ',' && previousToken !== ':') {
      error(token, string, originalString);
    } else if (token === ':' && readingKey && previousToken) {
      if (isValidKey(previousToken)) {
        key = previousToken;
        readingKey = false;
      } else {
        throw new Error('Invalid key token \'' + previousToken + '\' at position 0 in string: \'' + originalString + '\'');
      }
    } else if (token === ',' && !readingKey && previousToken) {
      object[key] = processToken(previousToken, string, originalString);
      readingKey = true;
    }
  }

  if (token) {
    object[key] = processToken(token, string, originalString);
  }

  return object;
};

var parseArray = function parseArray(string) {
  string = string.trim();
  var originalString = string;
  var array = [];
  var previousToken = void 0,
      token = void 0;

  while (string.length > 0) {
    previousToken = token;
    token = nextToken(string);
    string = string.slice(token.length, string.length).trimLeft();

    if (token === ',' && (!previousToken || previousToken === ',')) {
      error(token, string, originalString);
    } else if (token === ',') {
      array.push(processToken(previousToken, string, originalString));
    }
  }

  if (token) {
    if (token !== ',') {
      array.push(processToken(token, string, originalString));
    } else {
      error(token, string, originalString);
    }
  }

  return array;
};

var parse = function parse(string) {
  string = string.trim();

  if (isObjectString(string)) {
    return parseObject(unwrap(string));
  } else if (isArrayString(string)) {
    return parseArray(unwrap(string));
  } else {
    throw new Error('Provided string must be object or array like: ' + string);
  }
};

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var util = {};

util.globals = {
  fabOffset: 0
};

/**
 * @param {String/Function} query dot class name or node name or matcher function.
 * @return {Function}
 */
util.prepareQuery = function (query) {
  return query instanceof Function ? query : function (element) {
    return util.match(element, query);
  };
};

/**
 * @param {Element} e
 * @param {String/Function} s CSS Selector.
 * @return {Boolean}
 */
util.match = function (e, s) {
  return (e.matches || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector).call(e, s);
};

/**
 * @param {Element} element
 * @param {String/Function} query dot class name or node name or matcher function.
 * @return {HTMLElement/null}
 */
util.findChild = function (element, query) {
  var match = util.prepareQuery(query);

  // Caution: `element.children` is `undefined` in some environments if `element` is `svg`
  for (var i = 0; i < element.childNodes.length; i++) {
    var node = element.childNodes[i];
    if (node.nodeType !== Node.ELEMENT_NODE) {
      // process only element nodes
      continue;
    }
    if (match(node)) {
      return node;
    }
  }
  return null;
};

/**
 * @param {Element} element
 * @param {String/Function} query dot class name or node name or matcher function.
 * @return {HTMLElement/null}
 */
util.findParent = function (element, query, until) {
  var match = util.prepareQuery(query);

  var parent = element.parentNode;
  for (;;) {
    if (!parent || parent === document || until && until(parent)) {
      return null;
    } else if (match(parent)) {
      return parent;
    }
    parent = parent.parentNode;
  }
};

/**
 * @param {Element} element
 * @return {boolean}
 */
util.isAttached = function (element) {
  while (document.documentElement !== element) {
    if (!element) {
      return false;
    }
    element = element.parentNode;
  }
  return true;
};

/**
 * @param {Element} element
 * @return {boolean}
 */
util.hasAnyComponentAsParent = function (element) {
  while (element && document.documentElement !== element) {
    element = element.parentNode;
    if (element && element.nodeName.toLowerCase().match(/(ons-navigator|ons-tabbar|ons-modal)/)) {
      return true;
    }
  }
  return false;
};

/**
 * @param {Element} element
 * @return {boolean}
 */
util.isPageControl = function (element) {
  return element.nodeName.match(/^ons-(navigator|splitter|tabbar|page)$/i);
};

/**
 * @param {Element} element
 * @param {String} action to propagate
 */
util.propagateAction = function (element, action) {
  for (var i = 0; i < element.childNodes.length; i++) {
    var child = element.childNodes[i];
    if (child[action] instanceof Function) {
      child[action]();
    } else {
      util.propagateAction(child, action);
    }
  }
};

/**
 * @param {String} string - string to be camelized
 * @return {String} Camelized string
 */
util.camelize = function (string) {
  return string.toLowerCase().replace(/-([a-z])/g, function (m, l) {
    return l.toUpperCase();
  });
};

/**
 * @param {String} selector - tag and class only
 * @param {Object} style
 * @param {Element}
 */
util.create = function () {
  var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var classList = selector.split('.');
  var element = document.createElement(classList.shift() || 'div');

  if (classList.length) {
    element.className = classList.join(' ');
  }

  util.extend(element.style, style);

  return element;
};

/**
 * @param {String} html
 * @return {Element}
 */
util.createElement = function (html) {
  var wrapper = document.createElement('div');

  if (html instanceof DocumentFragment) {
    wrapper.appendChild(document.importNode(html, true));
  } else {
    wrapper.innerHTML = html.trim();
  }

  if (wrapper.children.length > 1) {
    throw new Error('"html" must be one wrapper element.');
  }

  var element = wrapper.children[0];
  wrapper.children[0].remove();
  return element;
};

/**
 * @param {String} html
 * @return {HTMLFragment}
 */
util.createFragment = function (html) {
  var wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  var fragment = document.createDocumentFragment();

  while (wrapper.firstChild) {
    fragment.appendChild(wrapper.firstChild);
  }

  return fragment;
};

/*
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
util.extend = function (dst) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < args.length; i++) {
    if (args[i]) {
      var keys = Object.keys(args[i]);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        dst[key] = args[i][key];
      }
    }
  }

  return dst;
};

/**
 * @param {Object} arrayLike
 * @return {Array}
 */
util.arrayFrom = function (arrayLike) {
  return Array.prototype.slice.apply(arrayLike);
};

/**
 * @param {String} jsonString
 * @param {Object} [failSafe]
 * @return {Object}
 */
util.parseJSONObjectSafely = function (jsonString) {
  var failSafe = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  try {
    var result = JSON.parse('' + jsonString);
    if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object' && result !== null) {
      return result;
    }
  } catch (e) {
    return failSafe;
  }
  return failSafe;
};

/**
 * @param {String} path - path such as 'myApp.controllers.data.loadData'
 * @return {Any} - whatever is located at that path
 */
util.findFromPath = function (path) {
  path = path.split('.');
  var el = window,
      key;
  while (key = path.shift()) {
    // eslint-disable-line no-cond-assign
    el = el[key];
  }
  return el;
};

/**
 * @param {HTMLElement} container - Page or page-container that implements 'topPage'
 * @return {HTMLElement|null} - Visible page element or null if not found.
 */
util.getTopPage = function (container) {
  return container && (container.tagName.toLowerCase() === 'ons-page' ? container : container.topPage) || null;
};

/**
 * @param {HTMLElement} container - Element where the search begins
 * @return {HTMLElement|null} - Page element that contains the visible toolbar or null.
 */
util.findToolbarPage = function (container) {
  var page = util.getTopPage(container);

  if (page) {
    if (page._canAnimateToolbar()) {
      return page;
    }

    for (var i = 0; i < page._contentElement.children.length; i++) {
      var nextPage = util.getTopPage(page._contentElement.children[i]);
      if (nextPage && !/ons-tabbar/i.test(page._contentElement.children[i].tagName)) {
        return util.findToolbarPage(nextPage);
      }
    }
  }

  return null;
};

/**
 * @param {Element} element
 * @param {String} eventName
 * @param {Object} [detail]
 * @return {CustomEvent}
 */
util.triggerElementEvent = function (target, eventName) {
  var detail = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


  var event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
    detail: detail
  });

  Object.keys(detail).forEach(function (key) {
    event[key] = detail[key];
  });

  target.dispatchEvent(event);

  return event;
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @return {Boolean}
 */
util.hasModifier = function (target, modifierName) {
  if (!target.hasAttribute('modifier')) {
    return false;
  }
  return target.getAttribute('modifier').split(/\s+/).some(function (e) {
    return e === modifierName;
  });
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Object} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was added or not.
 */
util.addModifier = function (target, modifierName) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (options.autoStyle) {
    modifierName = autoStyle.mapModifier(modifierName, target, options.forceAutoStyle);
  }

  if (util.hasModifier(target, modifierName)) {
    return false;
  }

  modifierName = modifierName.trim();
  var modifierAttribute = target.getAttribute('modifier') || '';
  target.setAttribute('modifier', (modifierAttribute + ' ' + modifierName).trim());
  return true;
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Object} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was found or not.
 */
util.removeModifier = function (target, modifierName) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (!target.getAttribute('modifier')) {
    return false;
  }

  if (options.autoStyle) {
    modifierName = autoStyle.mapModifier(modifierName, target, options.forceAutoStyle);
  }

  var modifiers = target.getAttribute('modifier').split(/\s+/);

  var newModifiers = modifiers.filter(function (item) {
    return item && item !== modifierName;
  });
  target.setAttribute('modifier', newModifiers.join(' '));

  return modifiers.length !== newModifiers.length;
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Boolean} options.force Forces modifier to be added or removed.
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Boolean} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was found or not.
 */
util.toggleModifier = function () {
  var options = arguments.length > 2 ? arguments.length <= 2 ? undefined : arguments[2] : {};
  var force = typeof options === 'boolean' ? options : options.force;

  var toggle = typeof force === 'boolean' ? force : !util.hasModifier.apply(util, arguments);
  toggle ? util.addModifier.apply(util, arguments) : util.removeModifier.apply(util, arguments);
};

// TODO: FIX
util.updateParentPosition = function (el) {
  if (!el._parentUpdated && el.parentElement) {
    if (window.getComputedStyle(el.parentElement).getPropertyValue('position') === 'static') {
      el.parentElement.style.position = 'relative';
    }
    el._parentUpdated = true;
  }
};

util.toggleAttribute = function (element, name, value) {
  if (value) {
    element.setAttribute(name, value);
  } else {
    element.removeAttribute(name);
  }
};

util.bindListeners = function (element, listenerNames) {
  listenerNames.forEach(function (name) {
    var boundName = name.replace(/^_[a-z]/, '_bound' + name[1].toUpperCase());
    element[boundName] = element[boundName] || element[name].bind(element);
  });
};

util.each = function (obj, f) {
  return Object.keys(obj).forEach(function (key) {
    return f(key, obj[key]);
  });
};

/**
 * @param {Element} target
 * @param {boolean} hasRipple
 * @param {Object} attrs
 */
util.updateRipple = function (target, hasRipple) {
  var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (hasRipple === undefined) {
    hasRipple = target.hasAttribute('ripple');
  }

  var rippleElement = util.findChild(target, 'ons-ripple');

  if (hasRipple) {
    if (!rippleElement) {
      var element = document.createElement('ons-ripple');
      Object.keys(attrs).forEach(function (key) {
        return element.setAttribute(key, attrs[key]);
      });
      target.insertBefore(element, target.firstChild);
    }
  } else if (rippleElement) {
    rippleElement.remove();
  }
};

/**
 * @param {String}
 * @return {Object}
 */
util.animationOptionsParse = parse;

/**
 * @param {*} value
 */
util.isInteger = function (value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};

/**
 * @return {Object} Deferred promise.
 */
util.defer = function () {
  var deferred = {};
  deferred.promise = new Promise(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

/**
 * Show warnings when they are enabled.
 *
 * @param {*} arguments to console.warn
 */
util.warn = function () {
  if (!internal$1.config.warningsDisabled) {
    var _console;

    (_console = console).warn.apply(_console, arguments);
  }
};

util.skipContentScroll = function (gesture) {
  var clickedElement = document.elementFromPoint(gesture.center.clientX, gesture.center.clientY);
  var content = util.findParent(clickedElement, '.page__content', function (e) {
    return util.match(e, '.page');
  });
  if (content) {
    var preventScroll = function preventScroll(e) {
      return e.preventDefault();
    };
    content.addEventListener('touchmove', preventScroll, true);
    var clean = function clean(e) {
      content.removeEventListener('touchmove', preventScroll, true);
      content.removeEventListener('touchend', clean, true);
    };
    content.addEventListener('touchend', clean, true);
  }
};

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Minimal animation library for managing css transition on mobile browsers.
 */
'use strict';

var TIMEOUT_RATIO = 1.4;

var util$2 = {};

// capitalize string
util$2.capitalize = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * @param {Object} params
 * @param {String} params.property
 * @param {Float} params.duration
 * @param {String} params.timing
 */
util$2.buildTransitionValue = function (params) {
  params.property = params.property || 'all';
  params.duration = params.duration || 0.4;
  params.timing = params.timing || 'linear';

  var props = params.property.split(/ +/);

  return props.map(function (prop) {
    return prop + ' ' + params.duration + 's ' + params.timing;
  }).join(', ');
};

/**
 * Add an event handler on "transitionend" event.
 */
util$2.onceOnTransitionEnd = function (element, callback) {
  if (!element) {
    return function () {};
  }

  var fn = function fn(event) {
    if (element == event.target) {
      event.stopPropagation();
      removeListeners();

      callback();
    }
  };

  var removeListeners = function removeListeners() {
    util$2._transitionEndEvents.forEach(function (eventName) {
      element.removeEventListener(eventName, fn, false);
    });
  };

  util$2._transitionEndEvents.forEach(function (eventName) {
    element.addEventListener(eventName, fn, false);
  });

  return removeListeners;
};

util$2._transitionEndEvents = function () {

  if ('ontransitionend' in window) {
    return ['transitionend'];
  }

  if ('onwebkittransitionend' in window) {
    return ['webkitTransitionEnd'];
  }

  if (util$2.vendorPrefix === 'webkit' || util$2.vendorPrefix === 'o' || util$2.vendorPrefix === 'moz' || util$2.vendorPrefix === 'ms') {
    return [util$2.vendorPrefix + 'TransitionEnd', 'transitionend'];
  }

  return [];
}();

util$2._cssPropertyDict = function () {
  var styles = window.getComputedStyle(document.documentElement, '');
  var dict = {};
  var a = 'A'.charCodeAt(0);
  var z = 'z'.charCodeAt(0);

  var upper = function upper(s) {
    return s.substr(1).toUpperCase();
  };

  for (var i = 0; i < styles.length; i++) {

    var key = styles[i].replace(/^[\-]+/, '').replace(/[\-][a-z]/g, upper).replace(/^moz/, 'Moz');

    if (a <= key.charCodeAt(0) && z >= key.charCodeAt(0)) {
      if (key !== 'cssText' && key !== 'parentText') {
        dict[key] = true;
      }
    }
  }

  return dict;
}();

util$2.hasCssProperty = function (name) {
  return name in util$2._cssPropertyDict;
};

/**
 * Vendor prefix for css property.
 */
util$2.vendorPrefix = function () {
  var styles = window.getComputedStyle(document.documentElement, ''),
      pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
  return pre;
}();

util$2.forceLayoutAtOnce = function (elements, callback) {
  this.batchImmediate(function () {
    elements.forEach(function (element) {
      // force layout
      element.offsetHeight;
    });
    callback();
  });
};

util$2.batchImmediate = function () {
  var callbacks = [];

  return function (callback) {
    if (callbacks.length === 0) {
      setImmediate(function () {
        var concreateCallbacks = callbacks.slice(0);
        callbacks = [];
        concreateCallbacks.forEach(function (callback) {
          callback();
        });
      });
    }

    callbacks.push(callback);
  };
}();

util$2.batchAnimationFrame = function () {
  var callbacks = [];

  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    setTimeout(callback, 1000 / 60);
  };

  return function (callback) {
    if (callbacks.length === 0) {
      raf(function () {
        var concreateCallbacks = callbacks.slice(0);
        callbacks = [];
        concreateCallbacks.forEach(function (callback) {
          callback();
        });
      });
    }

    callbacks.push(callback);
  };
}();

util$2.transitionPropertyName = function () {
  if (util$2.hasCssProperty('transitionDuration')) {
    return 'transition';
  }

  if (util$2.hasCssProperty(util$2.vendorPrefix + 'TransitionDuration')) {
    return util$2.vendorPrefix + 'Transition';
  }

  throw new Error('Invalid state');
}();

/**
 * @param {HTMLElement} element
 */
var Animit = function Animit(element) {
  if (!(this instanceof Animit)) {
    return new Animit(element);
  }

  if (element instanceof HTMLElement) {
    this.elements = [element];
  } else if (Object.prototype.toString.call(element) === '[object Array]') {
    this.elements = element;
  } else {
    throw new Error('First argument must be an array or an instance of HTMLElement.');
  }

  this.transitionQueue = [];
  this.lastStyleAttributeDict = [];
};

Animit.prototype = {

  /**
   * @property {Array}
   */
  transitionQueue: undefined,

  /**
   * @property {Array}
   */
  elements: undefined,

  /**
   * Start animation sequence with passed animations.
   *
   * @param {Function} callback
   */
  play: function play(callback) {
    if (typeof callback === 'function') {
      this.transitionQueue.push(function (done) {
        callback();
        done();
      });
    }

    this.startAnimation();

    return this;
  },

  /**
   * Queue transition animations or other function.
   *
   * e.g. animit(elt).queue({color: 'red'})
   * e.g. animit(elt).queue({color: 'red'}, {duration: 0.4})
   * e.g. animit(elt).queue({css: {color: 'red'}, duration: 0.2})
   *
   * @param {Object|Animit.Transition|Function} transition
   * @param {Object} [options]
   */
  queue: function queue(transition, options) {
    var queue = this.transitionQueue;

    if (transition && options) {
      options.css = transition;
      transition = new Animit.Transition(options);
    }

    if (!(transition instanceof Function || transition instanceof Animit.Transition)) {
      if (transition.css) {
        transition = new Animit.Transition(transition);
      } else {
        transition = new Animit.Transition({
          css: transition
        });
      }
    }

    if (transition instanceof Function) {
      queue.push(transition);
    } else if (transition instanceof Animit.Transition) {
      queue.push(transition.build());
    } else {
      throw new Error('Invalid arguments');
    }

    return this;
  },

  /**
   * Queue transition animations.
   *
   * @param {Float} seconds
   */
  wait: function wait(seconds) {
    if (seconds > 0) {
      this.transitionQueue.push(function (done) {
        setTimeout(done, 1000 * seconds);
      });
    }

    return this;
  },

  saveStyle: function saveStyle() {

    this.transitionQueue.push(function (done) {
      this.elements.forEach(function (element, index) {
        var css = this.lastStyleAttributeDict[index] = {};

        for (var i = 0; i < element.style.length; i++) {
          css[element.style[i]] = element.style[element.style[i]];
        }
      }.bind(this));
      done();
    }.bind(this));

    return this;
  },

  /**
   * Restore element's style.
   *
   * @param {Object} [options]
   * @param {Float} [options.duration]
   * @param {String} [options.timing]
   * @param {String} [options.transition]
   */
  restoreStyle: function restoreStyle(options) {
    options = options || {};
    var self = this;

    if (options.transition && !options.duration) {
      throw new Error('"options.duration" is required when "options.transition" is enabled.');
    }

    var transitionName = util$2.transitionPropertyName;

    if (options.transition || options.duration && options.duration > 0) {
      var transitionValue = options.transition || 'all ' + options.duration + 's ' + (options.timing || 'linear');

      this.transitionQueue.push(function (done) {
        var elements = this.elements;
        var timeoutId;

        var clearTransition = function clearTransition() {
          elements.forEach(function (element) {
            element.style[transitionName] = '';
          });
        };

        // add "transitionend" event handler
        var removeListeners = util$2.onceOnTransitionEnd(elements[0], function () {
          clearTimeout(timeoutId);
          clearTransition();
          done();
        });

        // for fail safe.
        timeoutId = setTimeout(function () {
          removeListeners();
          clearTransition();
          done();
        }, options.duration * 1000 * TIMEOUT_RATIO);

        // transition and style settings
        elements.forEach(function (element, index) {

          var css = self.lastStyleAttributeDict[index];

          if (!css) {
            throw new Error('restoreStyle(): The style is not saved. Invoke saveStyle() before.');
          }

          self.lastStyleAttributeDict[index] = undefined;

          var name;
          for (var i = 0, len = element.style.length; i < len; i++) {
            name = element.style[i];
            if (css[name] === undefined) {
              css[name] = '';
            }
          }

          element.style[transitionName] = transitionValue;

          Object.keys(css).forEach(function (key) {
            if (key !== transitionName) {
              element.style[key] = css[key];
            }
          });

          element.style[transitionName] = transitionValue;
        });
      });
    } else {
      this.transitionQueue.push(function (done) {
        reset();
        done();
      });
    }

    return this;

    function reset() {
      // Clear transition animation settings.
      self.elements.forEach(function (element, index) {
        element.style[transitionName] = 'none';

        var css = self.lastStyleAttributeDict[index];

        if (!css) {
          throw new Error('restoreStyle(): The style is not saved. Invoke saveStyle() before.');
        }

        self.lastStyleAttributeDict[index] = undefined;

        for (var i = 0; i < element.style.length; i++) {
          if (typeof css[element.style[i]] === 'undefined') {
            css[element.style[i]] = '';
          }
        }

        Object.keys(css).forEach(function (key) {
          element.style[key] = css[key];
        });
      });
    }
  },

  /**
   * Start animation sequence.
   */
  startAnimation: function startAnimation() {
    this._dequeueTransition();

    return this;
  },

  _dequeueTransition: function _dequeueTransition() {
    var transition = this.transitionQueue.shift();
    if (this._currentTransition) {
      throw new Error('Current transition exists.');
    }
    this._currentTransition = transition;
    var self = this;
    var called = false;

    var done = function done() {
      if (!called) {
        called = true;
        self._currentTransition = undefined;
        self._dequeueTransition();
      } else {
        throw new Error('Invalid state: This callback is called twice.');
      }
    };

    if (transition) {
      transition.call(this, done);
    }
  }

};

/**
 * @param {Animit} arguments
 */
Animit.runAll = function () /* arguments... */{
  for (var i = 0; i < arguments.length; i++) {
    arguments[i].play();
  }
};

/**
 * @param {Object} options
 * @param {Float} [options.duration]
 * @param {String} [options.property]
 * @param {String} [options.timing]
 */
Animit.Transition = function (options) {
  this.options = options || {};
  this.options.duration = this.options.duration || 0;
  this.options.timing = this.options.timing || 'linear';
  this.options.css = this.options.css || {};
  this.options.property = this.options.property || 'all';
};

Animit.Transition.prototype = {

  /**
   * @param {HTMLElement} element
   * @return {Function}
   */
  build: function build() {

    if (Object.keys(this.options.css).length === 0) {
      throw new Error('options.css is required.');
    }

    var css = createActualCssProps(this.options.css);

    if (this.options.duration > 0) {
      var transitionValue = util$2.buildTransitionValue(this.options);
      var self = this;

      return function (callback) {
        var elements = this.elements;
        var timeout = self.options.duration * 1000 * TIMEOUT_RATIO;
        var timeoutId;

        var removeListeners = util$2.onceOnTransitionEnd(elements[0], function () {
          clearTimeout(timeoutId);
          callback();
        });

        timeoutId = setTimeout(function () {
          removeListeners();
          callback();
        }, timeout);

        elements.forEach(function (element) {
          element.style[util$2.transitionPropertyName] = transitionValue;

          Object.keys(css).forEach(function (name) {
            element.style[name] = css[name];
          });
        });
      };
    }

    if (this.options.duration <= 0) {
      return function (callback) {
        var elements = this.elements;

        elements.forEach(function (element) {
          element.style[util$2.transitionPropertyName] = '';

          Object.keys(css).forEach(function (name) {
            element.style[name] = css[name];
          });
        });

        if (elements.length > 0) {
          util$2.forceLayoutAtOnce(elements, function () {
            util$2.batchAnimationFrame(callback);
          });
        } else {
          util$2.batchAnimationFrame(callback);
        }
      };
    }

    function createActualCssProps(css) {
      var result = {};

      Object.keys(css).forEach(function (name) {
        var value = css[name];

        if (util$2.hasCssProperty(name)) {
          result[name] = value;
          return;
        }

        var prefixed = util$2.vendorPrefix + util$2.capitalize(name);
        if (util$2.hasCssProperty(prefixed)) {
          result[prefixed] = value;
        } else {
          result[prefixed] = value;
          result[name] = value;
        }
      });

      return result;
    }
  }
};

/*
 * Gesture detector library that forked from github.com/EightMedia/hammer.js.
 */

'use strict';

var Event$1;
var Utils;
var Detection;
var PointerEvent;

/**
 * @object ons.GestureDetector
 * @category gesture
 * @description
 *   [en]Utility class for gesture detection.[/en]
 *   [ja]ジェスチャを検知するためのユーティリティクラスです。[/ja]
 */

/**
 * @method constructor
 * @signature constructor(element[, options])
 * @description
 *  [en]Create a new GestureDetector instance.[/en]
 *  [ja]GestureDetectorのインスタンスを生成します。[/ja]
 * @param {Element} element
 *   [en]Name of the event.[/en]
 *   [ja]ジェスチャを検知するDOM要素を指定します。[/ja]
 * @param {Object} [options]
 *   [en]Options object.[/en]
 *   [ja]オプションを指定します。[/ja]
 * @return {ons.GestureDetector.Instance}
 */
var GestureDetector = function GestureDetector(element, options) {
  return new GestureDetector.Instance(element, options || {});
};

/**
 * default settings.
 * more settings are defined per gesture at `/gestures`. Each gesture can be disabled/enabled
 * by setting it's name (like `swipe`) to false.
 * You can set the defaults for all instances by changing this object before creating an instance.
 * @example
 * ````
 *  GestureDetector.defaults.drag = false;
 *  GestureDetector.defaults.behavior.touchAction = 'pan-y';
 *  delete GestureDetector.defaults.behavior.userSelect;
 * ````
 * @property defaults
 * @type {Object}
 */
GestureDetector.defaults = {
  behavior: {
    // userSelect: 'none', // Also disables selection in `input` children
    touchAction: 'pan-y',
    touchCallout: 'none',
    contentZooming: 'none',
    userDrag: 'none',
    tapHighlightColor: 'rgba(0,0,0,0)'
  }
};

/**
 * GestureDetector document where the base events are added at
 * @property DOCUMENT
 * @type {HTMLElement}
 * @default window.document
 */
GestureDetector.DOCUMENT = document;

/**
 * detect support for pointer events
 * @property HAS_POINTEREVENTS
 * @type {Boolean}
 */
GestureDetector.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;

/**
 * detect support for touch events
 * @property HAS_TOUCHEVENTS
 * @type {Boolean}
 */
GestureDetector.HAS_TOUCHEVENTS = 'ontouchstart' in window;

/**
 * detect mobile browsers
 * @property IS_MOBILE
 * @type {Boolean}
 */
GestureDetector.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);

/**
 * detect if we want to support mouseevents at all
 * @property NO_MOUSEEVENTS
 * @type {Boolean}
 */
GestureDetector.NO_MOUSEEVENTS = GestureDetector.HAS_TOUCHEVENTS && GestureDetector.IS_MOBILE || GestureDetector.HAS_POINTEREVENTS;

/**
 * interval in which GestureDetector recalculates current velocity/direction/angle in ms
 * @property CALCULATE_INTERVAL
 * @type {Number}
 * @default 25
 */
GestureDetector.CALCULATE_INTERVAL = 25;

/**
 * eventtypes per touchevent (start, move, end) are filled by `Event.determineEventTypes` on `setup`
 * the object contains the DOM event names per type (`EVENT_START`, `EVENT_MOVE`, `EVENT_END`)
 * @property EVENT_TYPES
 * @private
 * @writeOnce
 * @type {Object}
 */
var EVENT_TYPES = {};

/**
 * direction strings, for safe comparisons
 * @property DIRECTION_DOWN|LEFT|UP|RIGHT
 * @final
 * @type {String}
 * @default 'down' 'left' 'up' 'right'
 */
var DIRECTION_DOWN = GestureDetector.DIRECTION_DOWN = 'down';
var DIRECTION_LEFT = GestureDetector.DIRECTION_LEFT = 'left';
var DIRECTION_UP = GestureDetector.DIRECTION_UP = 'up';
var DIRECTION_RIGHT = GestureDetector.DIRECTION_RIGHT = 'right';

/**
 * pointertype strings, for safe comparisons
 * @property POINTER_MOUSE|TOUCH|PEN
 * @final
 * @type {String}
 * @default 'mouse' 'touch' 'pen'
 */
var POINTER_MOUSE = GestureDetector.POINTER_MOUSE = 'mouse';
var POINTER_TOUCH = GestureDetector.POINTER_TOUCH = 'touch';
var POINTER_PEN = GestureDetector.POINTER_PEN = 'pen';

/**
 * eventtypes
 * @property EVENT_START|MOVE|END|RELEASE|TOUCH
 * @final
 * @type {String}
 * @default 'start' 'change' 'move' 'end' 'release' 'touch'
 */
var EVENT_START = GestureDetector.EVENT_START = 'start';
var EVENT_MOVE = GestureDetector.EVENT_MOVE = 'move';
var EVENT_END = GestureDetector.EVENT_END = 'end';
var EVENT_RELEASE = GestureDetector.EVENT_RELEASE = 'release';
var EVENT_TOUCH = GestureDetector.EVENT_TOUCH = 'touch';

/**
 * if the window events are set...
 * @property READY
 * @writeOnce
 * @type {Boolean}
 * @default false
 */
GestureDetector.READY = false;

/**
 * plugins namespace
 * @property plugins
 * @type {Object}
 */
GestureDetector.plugins = GestureDetector.plugins || {};

/**
 * gestures namespace
 * see `/gestures` for the definitions
 * @property gestures
 * @type {Object}
 */
GestureDetector.gestures = GestureDetector.gestures || {};

/**
 * setup events to detect gestures on the document
 * this function is called when creating an new instance
 * @private
 */
function setup() {
  if (GestureDetector.READY) {
    return;
  }

  // find what eventtypes we add listeners to
  Event$1.determineEventTypes();

  // Register all gestures inside GestureDetector.gestures
  Utils.each(GestureDetector.gestures, function (gesture) {
    Detection.register(gesture);
  });

  // Add touch events on the document
  Event$1.onTouch(GestureDetector.DOCUMENT, EVENT_MOVE, Detection.detect);
  Event$1.onTouch(GestureDetector.DOCUMENT, EVENT_END, Detection.detect);

  // GestureDetector is ready...!
  GestureDetector.READY = true;
}

/**
 * @module GestureDetector
 *
 * @class Utils
 * @static
 */
Utils = GestureDetector.utils = {
  /**
   * extend method, could also be used for cloning when `dest` is an empty object.
   * changes the dest object
   * @param {Object} dest
   * @param {Object} src
   * @param {Boolean} [merge=false]  do a merge
   * @return {Object} dest
   */
  extend: function extend(dest, src, merge) {
    for (var key in src) {
      if (src.hasOwnProperty(key) && (dest[key] === undefined || !merge)) {
        dest[key] = src[key];
      }
    }
    return dest;
  },

  /**
   * simple addEventListener wrapper
   * @param {HTMLElement} element
   * @param {String} type
   * @param {Function} handler
   */
  on: function on(element, type, handler) {
    element.addEventListener(type, handler, false);
  },

  /**
   * simple removeEventListener wrapper
   * @param {HTMLElement} element
   * @param {String} type
   * @param {Function} handler
   */
  off: function off(element, type, handler) {
    element.removeEventListener(type, handler, false);
  },

  /**
   * forEach over arrays and objects
   * @param {Object|Array} obj
   * @param {Function} iterator
   * @param {any} iterator.item
   * @param {Number} iterator.index
   * @param {Object|Array} iterator.obj the source object
   * @param {Object} context value to use as `this` in the iterator
   */
  each: function each(obj, iterator, context) {
    var i, len;

    // native forEach on arrays
    if ('forEach' in obj) {
      obj.forEach(iterator, context);
      // arrays
    } else if (obj.length !== undefined) {
      for (i = 0, len = obj.length; i < len; i++) {
        if (iterator.call(context, obj[i], i, obj) === false) {
          return;
        }
      }
      // objects
    } else {
      for (i in obj) {
        if (obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj) === false) {
          return;
        }
      }
    }
  },

  /**
   * find if a string contains the string using indexOf
   * @param {String} src
   * @param {String} find
   * @return {Boolean} found
   */
  inStr: function inStr(src, find) {
    return src.indexOf(find) > -1;
  },

  /**
   * find if a array contains the object using indexOf or a simple polyfill
   * @param {String} src
   * @param {String} find
   * @return {Boolean|Number} false when not found, or the index
   */
  inArray: function inArray(src, find) {
    if (src.indexOf) {
      var index = src.indexOf(find);
      return index === -1 ? false : index;
    } else {
      for (var i = 0, len = src.length; i < len; i++) {
        if (src[i] === find) {
          return i;
        }
      }
      return false;
    }
  },

  /**
   * convert an array-like object (`arguments`, `touchlist`) to an array
   * @param {Object} obj
   * @return {Array}
   */
  toArray: function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
  },

  /**
   * find if a node is in the given parent
   * @param {HTMLElement} node
   * @param {HTMLElement} parent
   * @return {Boolean} found
   */
  hasParent: function hasParent(node, parent) {
    while (node) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  },

  /**
   * get the center of all the touches
   * @param {Array} touches
   * @return {Object} center contains `pageX`, `pageY`, `clientX` and `clientY` properties
   */
  getCenter: function getCenter(touches) {
    var pageX = [],
        pageY = [],
        clientX = [],
        clientY = [],
        min = Math.min,
        max = Math.max;

    // no need to loop when only one touch
    if (touches.length === 1) {
      return {
        pageX: touches[0].pageX,
        pageY: touches[0].pageY,
        clientX: touches[0].clientX,
        clientY: touches[0].clientY
      };
    }

    Utils.each(touches, function (touch) {
      pageX.push(touch.pageX);
      pageY.push(touch.pageY);
      clientX.push(touch.clientX);
      clientY.push(touch.clientY);
    });

    return {
      pageX: (min.apply(Math, pageX) + max.apply(Math, pageX)) / 2,
      pageY: (min.apply(Math, pageY) + max.apply(Math, pageY)) / 2,
      clientX: (min.apply(Math, clientX) + max.apply(Math, clientX)) / 2,
      clientY: (min.apply(Math, clientY) + max.apply(Math, clientY)) / 2
    };
  },

  /**
   * calculate the velocity between two points. unit is in px per ms.
   * @param {Number} deltaTime
   * @param {Number} deltaX
   * @param {Number} deltaY
   * @return {Object} velocity `x` and `y`
   */
  getVelocity: function getVelocity(deltaTime, deltaX, deltaY) {
    return {
      x: Math.abs(deltaX / deltaTime) || 0,
      y: Math.abs(deltaY / deltaTime) || 0
    };
  },

  /**
   * calculate the angle between two coordinates
   * @param {Touch} touch1
   * @param {Touch} touch2
   * @return {Number} angle
   */
  getAngle: function getAngle(touch1, touch2) {
    var x = touch2.clientX - touch1.clientX,
        y = touch2.clientY - touch1.clientY;

    return Math.atan2(y, x) * 180 / Math.PI;
  },

  /**
   * do a small comparison to get the direction between two touches.
   * @param {Touch} touch1
   * @param {Touch} touch2
   * @return {String} direction matches `DIRECTION_LEFT|RIGHT|UP|DOWN`
   */
  getDirection: function getDirection(touch1, touch2) {
    var x = Math.abs(touch1.clientX - touch2.clientX),
        y = Math.abs(touch1.clientY - touch2.clientY);

    if (x >= y) {
      return touch1.clientX - touch2.clientX > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return touch1.clientY - touch2.clientY > 0 ? DIRECTION_UP : DIRECTION_DOWN;
  },

  /**
   * calculate the distance between two touches
   * @param {Touch}touch1
   * @param {Touch} touch2
   * @return {Number} distance
   */
  getDistance: function getDistance(touch1, touch2) {
    var x = touch2.clientX - touch1.clientX,
        y = touch2.clientY - touch1.clientY;

    return Math.sqrt(x * x + y * y);
  },

  /**
   * calculate the scale factor between two touchLists
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @param {Array} start array of touches
   * @param {Array} end array of touches
   * @return {Number} scale
   */
  getScale: function getScale(start, end) {
    // need two fingers...
    if (start.length >= 2 && end.length >= 2) {
      return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
    }
    return 1;
  },

  /**
   * calculate the rotation degrees between two touchLists
   * @param {Array} start array of touches
   * @param {Array} end array of touches
   * @return {Number} rotation
   */
  getRotation: function getRotation(start, end) {
    // need two fingers
    if (start.length >= 2 && end.length >= 2) {
      return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
    }
    return 0;
  },

  /**
   * find out if the direction is vertical   *
   * @param {String} direction matches `DIRECTION_UP|DOWN`
   * @return {Boolean} is_vertical
   */
  isVertical: function isVertical(direction) {
    return direction == DIRECTION_UP || direction == DIRECTION_DOWN;
  },

  /**
   * set css properties with their prefixes
   * @param {HTMLElement} element
   * @param {String} prop
   * @param {String} value
   * @param {Boolean} [toggle=true]
   * @return {Boolean}
   */
  setPrefixedCss: function setPrefixedCss(element, prop, value, toggle) {
    var prefixes = ['', 'Webkit', 'Moz', 'O', 'ms'];
    prop = Utils.toCamelCase(prop);

    for (var i = 0; i < prefixes.length; i++) {
      var p = prop;
      // prefixes
      if (prefixes[i]) {
        p = prefixes[i] + p.slice(0, 1).toUpperCase() + p.slice(1);
      }

      // test the style
      if (p in element.style) {
        element.style[p] = (toggle === null || toggle) && value || '';
        break;
      }
    }
  },

  /**
   * toggle browser default behavior by setting css properties.
   * `userSelect='none'` also sets `element.onselectstart` to false
   * `userDrag='none'` also sets `element.ondragstart` to false
   *
   * @param {HtmlElement} element
   * @param {Object} props
   * @param {Boolean} [toggle=true]
   */
  toggleBehavior: function toggleBehavior(element, props, toggle) {
    if (!props || !element || !element.style) {
      return;
    }

    // set the css properties
    Utils.each(props, function (value, prop) {
      Utils.setPrefixedCss(element, prop, value, toggle);
    });

    var falseFn = toggle && function () {
      return false;
    };

    // also the disable onselectstart
    if (props.userSelect == 'none') {
      element.onselectstart = falseFn;
    }
    // and disable ondragstart
    if (props.userDrag == 'none') {
      element.ondragstart = falseFn;
    }
  },

  /**
   * convert a string with underscores to camelCase
   * so prevent_default becomes preventDefault
   * @param {String} str
   * @return {String} camelCaseStr
   */
  toCamelCase: function toCamelCase(str) {
    return str.replace(/[_-]([a-z])/g, function (s) {
      return s[1].toUpperCase();
    });
  }
};

/**
 * @module GestureDetector
 */
/**
 * @class Event
 * @static
 */
Event$1 = GestureDetector.event = {
  /**
   * when touch events have been fired, this is true
   * this is used to stop mouse events
   * @property prevent_mouseevents
   * @private
   * @type {Boolean}
   */
  preventMouseEvents: false,

  /**
   * if EVENT_START has been fired
   * @property started
   * @private
   * @type {Boolean}
   */
  started: false,

  /**
   * when the mouse is hold down, this is true
   * @property should_detect
   * @private
   * @type {Boolean}
   */
  shouldDetect: false,

  /**
   * simple event binder with a hook and support for multiple types
   * @param {HTMLElement} element
   * @param {String} type
   * @param {Function} handler
   * @param {Function} [hook]
   * @param {Object} hook.type
   */
  on: function on(element, type, handler, hook) {
    var types = type.split(' ');
    Utils.each(types, function (type) {
      Utils.on(element, type, handler);
      hook && hook(type);
    });
  },

  /**
   * simple event unbinder with a hook and support for multiple types
   * @param {HTMLElement} element
   * @param {String} type
   * @param {Function} handler
   * @param {Function} [hook]
   * @param {Object} hook.type
   */
  off: function off(element, type, handler, hook) {
    var types = type.split(' ');
    Utils.each(types, function (type) {
      Utils.off(element, type, handler);
      hook && hook(type);
    });
  },

  /**
   * the core touch event handler.
   * this finds out if we should to detect gestures
   * @param {HTMLElement} element
   * @param {String} eventType matches `EVENT_START|MOVE|END`
   * @param {Function} handler
   * @return onTouchHandler {Function} the core event handler
   */
  onTouch: function onTouch(element, eventType, handler) {
    var self = this;

    var onTouchHandler = function onTouchHandler(ev) {
      var srcType = ev.type.toLowerCase(),
          isPointer = GestureDetector.HAS_POINTEREVENTS,
          isMouse = Utils.inStr(srcType, 'mouse'),
          triggerType;

      // if we are in a mouseevent, but there has been a touchevent triggered in this session
      // we want to do nothing. simply break out of the event.
      if (isMouse && self.preventMouseEvents) {
        return;

        // mousebutton must be down
      } else if (isMouse && eventType == EVENT_START && ev.button === 0) {
        self.preventMouseEvents = false;
        self.shouldDetect = true;
      } else if (isPointer && eventType == EVENT_START) {
        self.shouldDetect = ev.buttons === 1 || PointerEvent.matchType(POINTER_TOUCH, ev);
        // just a valid start event, but no mouse
      } else if (!isMouse && eventType == EVENT_START) {
        self.preventMouseEvents = true;
        self.shouldDetect = true;
      }

      // update the pointer event before entering the detection
      if (isPointer && eventType != EVENT_END) {
        PointerEvent.updatePointer(eventType, ev);
      }

      // we are in a touch/down state, so allowed detection of gestures
      if (self.shouldDetect) {
        triggerType = self.doDetect.call(self, ev, eventType, element, handler);
      }

      // ...and we are done with the detection
      // so reset everything to start each detection totally fresh
      if (triggerType == EVENT_END) {
        self.preventMouseEvents = false;
        self.shouldDetect = false;
        PointerEvent.reset();
        // update the pointerevent object after the detection
      }

      if (isPointer && eventType == EVENT_END) {
        PointerEvent.updatePointer(eventType, ev);
      }
    };

    this.on(element, EVENT_TYPES[eventType], onTouchHandler);
    return onTouchHandler;
  },

  /**
   * the core detection method
   * this finds out what GestureDetector-touch-events to trigger
   * @param {Object} ev
   * @param {String} eventType matches `EVENT_START|MOVE|END`
   * @param {HTMLElement} element
   * @param {Function} handler
   * @return {String} triggerType matches `EVENT_START|MOVE|END`
   */
  doDetect: function doDetect(ev, eventType, element, handler) {
    var touchList = this.getTouchList(ev, eventType);
    var touchListLength = touchList.length;
    var triggerType = eventType;
    var triggerChange = touchList.trigger; // used by fakeMultitouch plugin
    var changedLength = touchListLength;

    // at each touchstart-like event we want also want to trigger a TOUCH event...
    if (eventType == EVENT_START) {
      triggerChange = EVENT_TOUCH;
      // ...the same for a touchend-like event
    } else if (eventType == EVENT_END) {
      triggerChange = EVENT_RELEASE;

      // keep track of how many touches have been removed
      changedLength = touchList.length - (ev.changedTouches ? ev.changedTouches.length : 1);
    }

    // after there are still touches on the screen,
    // we just want to trigger a MOVE event. so change the START or END to a MOVE
    // but only after detection has been started, the first time we actually want a START
    if (changedLength > 0 && this.started) {
      triggerType = EVENT_MOVE;
    }

    // detection has been started, we keep track of this, see above
    this.started = true;

    // generate some event data, some basic information
    var evData = this.collectEventData(element, triggerType, touchList, ev);

    // trigger the triggerType event before the change (TOUCH, RELEASE) events
    // but the END event should be at last
    if (eventType != EVENT_END) {
      handler.call(Detection, evData);
    }

    // trigger a change (TOUCH, RELEASE) event, this means the length of the touches changed
    if (triggerChange) {
      evData.changedLength = changedLength;
      evData.eventType = triggerChange;

      handler.call(Detection, evData);

      evData.eventType = triggerType;
      delete evData.changedLength;
    }

    // trigger the END event
    if (triggerType == EVENT_END) {
      handler.call(Detection, evData);

      // ...and we are done with the detection
      // so reset everything to start each detection totally fresh
      this.started = false;
    }

    return triggerType;
  },

  /**
   * we have different events for each device/browser
   * determine what we need and set them in the EVENT_TYPES constant
   * the `onTouch` method is bind to these properties.
   * @return {Object} events
   */
  determineEventTypes: function determineEventTypes() {
    var types;
    if (GestureDetector.HAS_POINTEREVENTS) {
      if (window.PointerEvent) {
        types = ['pointerdown', 'pointermove', 'pointerup pointercancel lostpointercapture'];
      } else {
        types = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp MSPointerCancel MSLostPointerCapture'];
      }
    } else if (GestureDetector.NO_MOUSEEVENTS) {
      types = ['touchstart', 'touchmove', 'touchend touchcancel'];
    } else {
      types = ['touchstart mousedown', 'touchmove mousemove', 'touchend touchcancel mouseup'];
    }

    EVENT_TYPES[EVENT_START] = types[0];
    EVENT_TYPES[EVENT_MOVE] = types[1];
    EVENT_TYPES[EVENT_END] = types[2];
    return EVENT_TYPES;
  },

  /**
   * create touchList depending on the event
   * @param {Object} ev
   * @param {String} eventType
   * @return {Array} touches
   */
  getTouchList: function getTouchList(ev, eventType) {
    // get the fake pointerEvent touchlist
    if (GestureDetector.HAS_POINTEREVENTS) {
      return PointerEvent.getTouchList();
    }

    // get the touchlist
    if (ev.touches) {
      if (eventType == EVENT_MOVE) {
        return ev.touches;
      }

      var identifiers = [];
      var concat = [].concat(Utils.toArray(ev.touches), Utils.toArray(ev.changedTouches));
      var touchList = [];

      Utils.each(concat, function (touch) {
        if (Utils.inArray(identifiers, touch.identifier) === false) {
          touchList.push(touch);
        }
        identifiers.push(touch.identifier);
      });

      return touchList;
    }

    // make fake touchList from mouse position
    ev.identifier = 1;
    return [ev];
  },

  /**
   * collect basic event data
   * @param {HTMLElement} element
   * @param {String} eventType matches `EVENT_START|MOVE|END`
   * @param {Array} touches
   * @param {Object} ev
   * @return {Object} ev
   */
  collectEventData: function collectEventData(element, eventType, touches, ev) {
    // find out pointerType
    var pointerType = POINTER_TOUCH;
    if (Utils.inStr(ev.type, 'mouse') || PointerEvent.matchType(POINTER_MOUSE, ev)) {
      pointerType = POINTER_MOUSE;
    } else if (PointerEvent.matchType(POINTER_PEN, ev)) {
      pointerType = POINTER_PEN;
    }

    return {
      center: Utils.getCenter(touches),
      timeStamp: Date.now(),
      target: ev.target,
      touches: touches,
      eventType: eventType,
      pointerType: pointerType,
      srcEvent: ev,

      /**
       * prevent the browser default actions
       * mostly used to disable scrolling of the browser
       */
      preventDefault: function preventDefault() {
        var srcEvent = this.srcEvent;
        srcEvent.preventManipulation && srcEvent.preventManipulation();
        srcEvent.preventDefault && srcEvent.preventDefault();
      },

      /**
       * stop bubbling the event up to its parents
       */
      stopPropagation: function stopPropagation() {
        this.srcEvent.stopPropagation();
      },

      /**
       * immediately stop gesture detection
       * might be useful after a swipe was detected
       * @return {*}
       */
      stopDetect: function stopDetect() {
        return Detection.stopDetect();
      }
    };
  }
};

/**
 * @module GestureDetector
 *
 * @class PointerEvent
 * @static
 */
PointerEvent = GestureDetector.PointerEvent = {
  /**
   * holds all pointers, by `identifier`
   * @property pointers
   * @type {Object}
   */
  pointers: {},

  /**
   * get the pointers as an array
   * @return {Array} touchlist
   */
  getTouchList: function getTouchList() {
    var touchlist = [];
    // we can use forEach since pointerEvents only is in IE10
    Utils.each(this.pointers, function (pointer) {
      touchlist.push(pointer);
    });
    return touchlist;
  },

  /**
   * update the position of a pointer
   * @param {String} eventType matches `EVENT_START|MOVE|END`
   * @param {Object} pointerEvent
   */
  updatePointer: function updatePointer(eventType, pointerEvent) {
    if (eventType == EVENT_END || eventType != EVENT_END && pointerEvent.buttons !== 1) {
      delete this.pointers[pointerEvent.pointerId];
    } else {
      pointerEvent.identifier = pointerEvent.pointerId;
      this.pointers[pointerEvent.pointerId] = pointerEvent;
    }
  },

  /**
   * check if ev matches pointertype
   * @param {String} pointerType matches `POINTER_MOUSE|TOUCH|PEN`
   * @param {PointerEvent} ev
   */
  matchType: function matchType(pointerType, ev) {
    if (!ev.pointerType) {
      return false;
    }

    var pt = ev.pointerType,
        types = {};

    types[POINTER_MOUSE] = pt === (ev.MSPOINTER_TYPE_MOUSE || POINTER_MOUSE);
    types[POINTER_TOUCH] = pt === (ev.MSPOINTER_TYPE_TOUCH || POINTER_TOUCH);
    types[POINTER_PEN] = pt === (ev.MSPOINTER_TYPE_PEN || POINTER_PEN);
    return types[pointerType];
  },

  /**
   * reset the stored pointers
   */
  reset: function resetList() {
    this.pointers = {};
  }
};

/**
 * @module GestureDetector
 *
 * @class Detection
 * @static
 */
Detection = GestureDetector.detection = {
  // contains all registered GestureDetector.gestures in the correct order
  gestures: [],

  // data of the current GestureDetector.gesture detection session
  current: null,

  // the previous GestureDetector.gesture session data
  // is a full clone of the previous gesture.current object
  previous: null,

  // when this becomes true, no gestures are fired
  stopped: false,

  /**
   * start GestureDetector.gesture detection
   * @param {GestureDetector.Instance} inst
   * @param {Object} eventData
   */
  startDetect: function startDetect(inst, eventData) {
    // already busy with a GestureDetector.gesture detection on an element
    if (this.current) {
      return;
    }

    this.stopped = false;

    // holds current session
    this.current = {
      inst: inst, // reference to GestureDetectorInstance we're working for
      startEvent: Utils.extend({}, eventData), // start eventData for distances, timing etc
      lastEvent: false, // last eventData
      lastCalcEvent: false, // last eventData for calculations.
      futureCalcEvent: false, // last eventData for calculations.
      lastCalcData: {}, // last lastCalcData
      name: '' // current gesture we're in/detected, can be 'tap', 'hold' etc
    };

    this.detect(eventData);
  },

  /**
   * GestureDetector.gesture detection
   * @param {Object} eventData
   * @return {any}
   */
  detect: function detect(eventData) {
    if (!this.current || this.stopped) {
      return;
    }

    // extend event data with calculations about scale, distance etc
    eventData = this.extendEventData(eventData);

    // GestureDetector instance and instance options
    var inst = this.current.inst,
        instOptions = inst.options;

    // call GestureDetector.gesture handlers
    Utils.each(this.gestures, function triggerGesture(gesture) {
      // only when the instance options have enabled this gesture
      if (!this.stopped && inst.enabled && instOptions[gesture.name]) {
        gesture.handler.call(gesture, eventData, inst);
      }
    }, this);

    // store as previous event event
    if (this.current) {
      this.current.lastEvent = eventData;
    }

    if (eventData.eventType == EVENT_END) {
      this.stopDetect();
    }

    return eventData; // eslint-disable-line consistent-return
  },

  /**
   * clear the GestureDetector.gesture vars
   * this is called on endDetect, but can also be used when a final GestureDetector.gesture has been detected
   * to stop other GestureDetector.gestures from being fired
   */
  stopDetect: function stopDetect() {
    // clone current data to the store as the previous gesture
    // used for the double tap gesture, since this is an other gesture detect session
    this.previous = Utils.extend({}, this.current);

    // reset the current
    this.current = null;
    this.stopped = true;
  },

  /**
   * calculate velocity, angle and direction
   * @param {Object} ev
   * @param {Object} center
   * @param {Number} deltaTime
   * @param {Number} deltaX
   * @param {Number} deltaY
   */
  getCalculatedData: function getCalculatedData(ev, center, deltaTime, deltaX, deltaY) {
    var cur = this.current,
        recalc = false,
        calcEv = cur.lastCalcEvent,
        calcData = cur.lastCalcData;

    if (calcEv && ev.timeStamp - calcEv.timeStamp > GestureDetector.CALCULATE_INTERVAL) {
      center = calcEv.center;
      deltaTime = ev.timeStamp - calcEv.timeStamp;
      deltaX = ev.center.clientX - calcEv.center.clientX;
      deltaY = ev.center.clientY - calcEv.center.clientY;
      recalc = true;
    }

    if (ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
      cur.futureCalcEvent = ev;
    }

    if (!cur.lastCalcEvent || recalc) {
      calcData.velocity = Utils.getVelocity(deltaTime, deltaX, deltaY);
      calcData.angle = Utils.getAngle(center, ev.center);
      calcData.direction = Utils.getDirection(center, ev.center);

      cur.lastCalcEvent = cur.futureCalcEvent || ev;
      cur.futureCalcEvent = ev;
    }

    ev.velocityX = calcData.velocity.x;
    ev.velocityY = calcData.velocity.y;
    ev.interimAngle = calcData.angle;
    ev.interimDirection = calcData.direction;
  },

  /**
   * extend eventData for GestureDetector.gestures
   * @param {Object} ev
   * @return {Object} ev
   */
  extendEventData: function extendEventData(ev) {
    var cur = this.current,
        startEv = cur.startEvent,
        lastEv = cur.lastEvent || startEv;

    // update the start touchlist to calculate the scale/rotation
    if (ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
      startEv.touches = [];
      Utils.each(ev.touches, function (touch) {
        startEv.touches.push({
          clientX: touch.clientX,
          clientY: touch.clientY
        });
      });
    }

    var deltaTime = ev.timeStamp - startEv.timeStamp,
        deltaX = ev.center.clientX - startEv.center.clientX,
        deltaY = ev.center.clientY - startEv.center.clientY;

    this.getCalculatedData(ev, lastEv.center, deltaTime, deltaX, deltaY);

    Utils.extend(ev, {
      startEvent: startEv,

      deltaTime: deltaTime,
      deltaX: deltaX,
      deltaY: deltaY,

      distance: Utils.getDistance(startEv.center, ev.center),
      angle: Utils.getAngle(startEv.center, ev.center),
      direction: Utils.getDirection(startEv.center, ev.center),
      scale: Utils.getScale(startEv.touches, ev.touches),
      rotation: Utils.getRotation(startEv.touches, ev.touches)
    });

    return ev;
  },

  /**
   * register new gesture
   * @param {Object} gesture object, see `gestures/` for documentation
   * @return {Array} gestures
   */
  register: function register(gesture) {
    // add an enable gesture options if there is no given
    var options = gesture.defaults || {};
    if (options[gesture.name] === undefined) {
      options[gesture.name] = true;
    }

    // extend GestureDetector default options with the GestureDetector.gesture options
    Utils.extend(GestureDetector.defaults, options, true);

    // set its index
    gesture.index = gesture.index || 1000;

    // add GestureDetector.gesture to the list
    this.gestures.push(gesture);

    // sort the list by index
    this.gestures.sort(function (a, b) {
      if (a.index < b.index) {
        return -1;
      }
      if (a.index > b.index) {
        return 1;
      }
      return 0;
    });

    return this.gestures;
  }
};

/**
 * @module GestureDetector
 */

/**
 * create new GestureDetector instance
 * all methods should return the instance itself, so it is chainable.
 *
 * @class Instance
 * @constructor
 * @param {HTMLElement} element
 * @param {Object} [options={}] options are merged with `GestureDetector.defaults`
 * @return {GestureDetector.Instance}
 */
GestureDetector.Instance = function (element, options) {
  var self = this;

  // setup GestureDetectorJS window events and register all gestures
  // this also sets up the default options
  setup();

  /**
   * @property element
   * @type {HTMLElement}
   */
  this.element = element;

  /**
   * @property enabled
   * @type {Boolean}
   * @protected
   */
  this.enabled = true;

  /**
   * options, merged with the defaults
   * options with an _ are converted to camelCase
   * @property options
   * @type {Object}
   */
  Utils.each(options, function (value, name) {
    delete options[name];
    options[Utils.toCamelCase(name)] = value;
  });

  this.options = Utils.extend(Utils.extend({}, GestureDetector.defaults), options || {});

  // add some css to the element to prevent the browser from doing its native behavior
  if (this.options.behavior) {
    Utils.toggleBehavior(this.element, this.options.behavior, true);
  }

  /**
   * event start handler on the element to start the detection
   * @property eventStartHandler
   * @type {Object}
   */
  this.eventStartHandler = Event$1.onTouch(element, EVENT_START, function (ev) {
    if (self.enabled && ev.eventType == EVENT_START) {
      Detection.startDetect(self, ev);
    } else if (ev.eventType == EVENT_TOUCH) {
      Detection.detect(ev);
    }
  });

  /**
   * keep a list of user event handlers which needs to be removed when calling 'dispose'
   * @property eventHandlers
   * @type {Array}
   */
  this.eventHandlers = [];
};

GestureDetector.Instance.prototype = {
  /**
   * @method on
   * @signature on(gestures, handler)
   * @description
   *  [en]Adds an event handler for a gesture. Available gestures are: drag, dragleft, dragright, dragup, dragdown, hold, release, swipe, swipeleft, swiperight, swipeup, swipedown, tap, doubletap, touch, transform, pinch, pinchin, pinchout and rotate. [/en]
   *  [ja]ジェスチャに対するイベントハンドラを追加します。指定できるジェスチャ名は、drag dragleft dragright dragup dragdown hold release swipe swipeleft swiperight swipeup swipedown tap doubletap touch transform pinch pinchin pinchout rotate です。[/ja]
   * @param {String} gestures
   *   [en]A space separated list of gestures.[/en]
   *   [ja]検知するジェスチャ名を指定します。スペースで複数指定することができます。[/ja]
   * @param {Function} handler
   *   [en]An event handling function.[/en]
   *   [ja]イベントハンドラとなる関数オブジェクトを指定します。[/ja]
   */
  on: function onEvent(gestures, handler) {
    var self = this;
    Event$1.on(self.element, gestures, handler, function (type) {
      self.eventHandlers.push({ gesture: type, handler: handler });
    });
    return self;
  },

  /**
   * @method off
   * @signature off(gestures, handler)
   * @description
   *  [en]Remove an event listener.[/en]
   *  [ja]イベントリスナーを削除します。[/ja]
   * @param {String} gestures
   *   [en]A space separated list of gestures.[/en]
   *   [ja]ジェスチャ名を指定します。スペースで複数指定することができます。[/ja]
   * @param {Function} handler
   *   [en]An event handling function.[/en]
   *   [ja]イベントハンドラとなる関数オブジェクトを指定します。[/ja]
   */
  off: function offEvent(gestures, handler) {
    var self = this;

    Event$1.off(self.element, gestures, handler, function (type) {
      var index = Utils.inArray({ gesture: type, handler: handler });
      if (index !== false) {
        self.eventHandlers.splice(index, 1);
      }
    });
    return self;
  },

  /**
   * trigger gesture event
   * @method trigger
   * @signature trigger(gesture, eventData)
   * @param {String} gesture
   * @param {Object} [eventData]
   */
  trigger: function triggerEvent(gesture, eventData) {
    // optional
    if (!eventData) {
      eventData = {};
    }

    // create DOM event
    var event = GestureDetector.DOCUMENT.createEvent('Event');
    event.initEvent(gesture, true, true);
    event.gesture = eventData;

    // trigger on the target if it is in the instance element,
    // this is for event delegation tricks
    var element = this.element;
    if (Utils.hasParent(eventData.target, element)) {
      element = eventData.target;
    }

    element.dispatchEvent(event);
    return this;
  },

  /**
   * @method enable
   * @signature enable(state)
   * @description
   *  [en]Enable or disable gesture detection.[/en]
   *  [ja]ジェスチャ検知を有効化/無効化します。[/ja]
   * @param {Boolean} state
   *   [en]Specify if it should be enabled or not.[/en]
   *   [ja]有効にするかどうかを指定します。[/ja]
   */
  enable: function enable(state) {
    this.enabled = state;
    return this;
  },

  /**
   * @method dispose
   * @signature dispose()
   * @description
   *  [en]Remove and destroy all event handlers for this instance.[/en]
   *  [ja]このインスタンスでのジェスチャの検知や、イベントハンドラを全て解除して廃棄します。[/ja]
   */
  dispose: function dispose() {
    var i, eh;

    // undo all changes made by stop_browser_behavior
    Utils.toggleBehavior(this.element, this.options.behavior, false);

    // unbind all custom event handlers
    for (i = -1; eh = this.eventHandlers[++i];) {
      // eslint-disable-line no-cond-assign
      Utils.off(this.element, eh.gesture, eh.handler);
    }

    this.eventHandlers = [];

    // unbind the start event listener
    Event$1.off(this.element, EVENT_TYPES[EVENT_START], this.eventStartHandler);

    return null;
  }
};

/**
 * @module gestures
 */
/**
 * Move with x fingers (default 1) around on the page.
 * Preventing the default browser behavior is a good way to improve feel and working.
 * ````
 *  GestureDetectortime.on("drag", function(ev) {
 *    console.log(ev);
 *    ev.gesture.preventDefault();
 *  });
 * ````
 *
 * @class Drag
 * @static
 */
/**
 * @event drag
 * @param {Object} ev
 */
/**
 * @event dragstart
 * @param {Object} ev
 */
/**
 * @event dragend
 * @param {Object} ev
 */
/**
 * @event drapleft
 * @param {Object} ev
 */
/**
 * @event dragright
 * @param {Object} ev
 */
/**
 * @event dragup
 * @param {Object} ev
 */
/**
 * @event dragdown
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function (name) {
  var triggered = false;

  function dragGesture(ev, inst) {
    var cur = Detection.current;

    // max touches
    if (inst.options.dragMaxTouches > 0 && ev.touches.length > inst.options.dragMaxTouches) {
      return;
    }

    switch (ev.eventType) {
      case EVENT_START:
        triggered = false;
        break;

      case EVENT_MOVE:
        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if (ev.distance < inst.options.dragMinDistance && cur.name != name) {
          return;
        }

        var startCenter = cur.startEvent.center;

        // we are dragging!
        if (cur.name != name) {
          cur.name = name;
          if (inst.options.dragDistanceCorrection && ev.distance > 0) {
            // When a drag is triggered, set the event center to dragMinDistance pixels from the original event center.
            // Without this correction, the dragged distance would jumpstart at dragMinDistance pixels instead of at 0.
            // It might be useful to save the original start point somewhere
            var factor = Math.abs(inst.options.dragMinDistance / ev.distance);
            startCenter.pageX += ev.deltaX * factor;
            startCenter.pageY += ev.deltaY * factor;
            startCenter.clientX += ev.deltaX * factor;
            startCenter.clientY += ev.deltaY * factor;

            // recalculate event data using new start point
            ev = Detection.extendEventData(ev);
          }
        }

        // lock drag to axis?
        if (cur.lastEvent.dragLockToAxis || inst.options.dragLockToAxis && inst.options.dragLockMinDistance <= ev.distance) {
          ev.dragLockToAxis = true;
        }

        // keep direction on the axis that the drag gesture started on
        var lastDirection = cur.lastEvent.direction;
        if (ev.dragLockToAxis && lastDirection !== ev.direction) {
          if (Utils.isVertical(lastDirection)) {
            ev.direction = ev.deltaY < 0 ? DIRECTION_UP : DIRECTION_DOWN;
          } else {
            ev.direction = ev.deltaX < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
          }
        }

        // first time, trigger dragstart event
        if (!triggered) {
          inst.trigger(name + 'start', ev);
          triggered = true;
        }

        // trigger events
        inst.trigger(name, ev);
        inst.trigger(name + ev.direction, ev);

        var isVertical = Utils.isVertical(ev.direction);

        // block the browser events
        if (inst.options.dragBlockVertical && isVertical || inst.options.dragBlockHorizontal && !isVertical) {
          ev.preventDefault();
        }
        break;

      case EVENT_RELEASE:
        if (triggered && ev.changedLength <= inst.options.dragMaxTouches) {
          inst.trigger(name + 'end', ev);
          triggered = false;
        }
        break;

      case EVENT_END:
        triggered = false;
        break;
    }
  }

  GestureDetector.gestures.Drag = {
    name: name,
    index: 50,
    handler: dragGesture,
    defaults: {
      /**
       * minimal movement that have to be made before the drag event gets triggered
       * @property dragMinDistance
       * @type {Number}
       * @default 10
       */
      dragMinDistance: 10,

      /**
       * Set dragDistanceCorrection to true to make the starting point of the drag
       * be calculated from where the drag was triggered, not from where the touch started.
       * Useful to avoid a jerk-starting drag, which can make fine-adjustments
       * through dragging difficult, and be visually unappealing.
       * @property dragDistanceCorrection
       * @type {Boolean}
       * @default true
       */
      dragDistanceCorrection: true,

      /**
       * set 0 for unlimited, but this can conflict with transform
       * @property dragMaxTouches
       * @type {Number}
       * @default 1
       */
      dragMaxTouches: 1,

      /**
       * prevent default browser behavior when dragging occurs
       * be careful with it, it makes the element a blocking element
       * when you are using the drag gesture, it is a good practice to set this true
       * @property dragBlockHorizontal
       * @type {Boolean}
       * @default false
       */
      dragBlockHorizontal: false,

      /**
       * same as `dragBlockHorizontal`, but for vertical movement
       * @property dragBlockVertical
       * @type {Boolean}
       * @default false
       */
      dragBlockVertical: false,

      /**
       * dragLockToAxis keeps the drag gesture on the axis that it started on,
       * It disallows vertical directions if the initial direction was horizontal, and vice versa.
       * @property dragLockToAxis
       * @type {Boolean}
       * @default false
       */
      dragLockToAxis: false,

      /**
       * drag lock only kicks in when distance > dragLockMinDistance
       * This way, locking occurs only when the distance has become large enough to reliably determine the direction
       * @property dragLockMinDistance
       * @type {Number}
       * @default 25
       */
      dragLockMinDistance: 25
    }
  };
})('drag');

/**
 * @module gestures
 */
/**
 * trigger a simple gesture event, so you can do anything in your handler.
 * only usable if you know what your doing...
 *
 * @class Gesture
 * @static
 */
/**
 * @event gesture
 * @param {Object} ev
 */
GestureDetector.gestures.Gesture = {
  name: 'gesture',
  index: 1337,
  handler: function releaseGesture(ev, inst) {
    inst.trigger(this.name, ev);
  }
};

/**
 * @module gestures
 */
/**
 * Touch stays at the same place for x time
 *
 * @class Hold
 * @static
 */
/**
 * @event hold
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function (name) {
  var timer;

  function holdGesture(ev, inst) {
    var options = inst.options,
        current = Detection.current;

    switch (ev.eventType) {
      case EVENT_START:
        clearTimeout(timer);

        // set the gesture so we can check in the timeout if it still is
        current.name = name;

        // set timer and if after the timeout it still is hold,
        // we trigger the hold event
        timer = setTimeout(function () {
          if (current && current.name == name) {
            inst.trigger(name, ev);
          }
        }, options.holdTimeout);
        break;

      case EVENT_MOVE:
        if (ev.distance > options.holdThreshold) {
          clearTimeout(timer);
        }
        break;

      case EVENT_RELEASE:
        clearTimeout(timer);
        break;
    }
  }

  GestureDetector.gestures.Hold = {
    name: name,
    index: 10,
    defaults: {
      /**
       * @property holdTimeout
       * @type {Number}
       * @default 500
       */
      holdTimeout: 500,

      /**
       * movement allowed while holding
       * @property holdThreshold
       * @type {Number}
       * @default 2
       */
      holdThreshold: 2
    },
    handler: holdGesture
  };
})('hold');

/**
 * @module gestures
 */
/**
 * when a touch is being released from the page
 *
 * @class Release
 * @static
 */
/**
 * @event release
 * @param {Object} ev
 */
GestureDetector.gestures.Release = {
  name: 'release',
  index: Infinity,
  handler: function releaseGesture(ev, inst) {
    if (ev.eventType == EVENT_RELEASE) {
      inst.trigger(this.name, ev);
    }
  }
};

/**
 * @module gestures
 */
/**
 * triggers swipe events when the end velocity is above the threshold
 * for best usage, set `preventDefault` (on the drag gesture) to `true`
 * ````
 *  GestureDetectortime.on("dragleft swipeleft", function(ev) {
 *    console.log(ev);
 *    ev.gesture.preventDefault();
 *  });
 * ````
 *
 * @class Swipe
 * @static
 */
/**
 * @event swipe
 * @param {Object} ev
 */
/**
 * @event swipeleft
 * @param {Object} ev
 */
/**
 * @event swiperight
 * @param {Object} ev
 */
/**
 * @event swipeup
 * @param {Object} ev
 */
/**
 * @event swipedown
 * @param {Object} ev
 */
GestureDetector.gestures.Swipe = {
  name: 'swipe',
  index: 40,
  defaults: {
    /**
     * @property swipeMinTouches
     * @type {Number}
     * @default 1
     */
    swipeMinTouches: 1,

    /**
     * @property swipeMaxTouches
     * @type {Number}
     * @default 1
     */
    swipeMaxTouches: 1,

    /**
     * horizontal swipe velocity
     * @property swipeVelocityX
     * @type {Number}
     * @default 0.6
     */
    swipeVelocityX: 0.6,

    /**
     * vertical swipe velocity
     * @property swipeVelocityY
     * @type {Number}
     * @default 0.6
     */
    swipeVelocityY: 0.6
  },

  handler: function swipeGesture(ev, inst) {
    if (ev.eventType == EVENT_RELEASE) {
      var touches = ev.touches.length,
          options = inst.options;

      // max touches
      if (touches < options.swipeMinTouches || touches > options.swipeMaxTouches) {
        return;
      }

      // when the distance we moved is too small we skip this gesture
      // or we can be already in dragging
      if (ev.velocityX > options.swipeVelocityX || ev.velocityY > options.swipeVelocityY) {
        // trigger swipe events
        inst.trigger(this.name, ev);
        inst.trigger(this.name + ev.direction, ev);
      }
    }
  }
};

/**
 * @module gestures
 */
/**
 * Single tap and a double tap on a place
 *
 * @class Tap
 * @static
 */
/**
 * @event tap
 * @param {Object} ev
 */
/**
 * @event doubletap
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function (name) {
  var hasMoved = false;

  function tapGesture(ev, inst) {
    var options = inst.options,
        current = Detection.current,
        prev = Detection.previous,
        sincePrev,
        didDoubleTap;

    switch (ev.eventType) {
      case EVENT_START:
        hasMoved = false;
        break;

      case EVENT_MOVE:
        hasMoved = hasMoved || ev.distance > options.tapMaxDistance;
        break;

      case EVENT_END:
        if (!Utils.inStr(ev.srcEvent.type, 'cancel') && ev.deltaTime < options.tapMaxTime && !hasMoved) {
          // previous gesture, for the double tap since these are two different gesture detections
          sincePrev = prev && prev.lastEvent && ev.timeStamp - prev.lastEvent.timeStamp;
          didDoubleTap = false;

          // check if double tap
          if (prev && prev.name == name && sincePrev && sincePrev < options.doubleTapInterval && ev.distance < options.doubleTapDistance) {
            inst.trigger('doubletap', ev);
            didDoubleTap = true;
          }

          // do a single tap
          if (!didDoubleTap || options.tapAlways) {
            current.name = name;
            inst.trigger(current.name, ev);
          }
        }
        break;
    }
  }

  GestureDetector.gestures.Tap = {
    name: name,
    index: 100,
    handler: tapGesture,
    defaults: {
      /**
       * max time of a tap, this is for the slow tappers
       * @property tapMaxTime
       * @type {Number}
       * @default 250
       */
      tapMaxTime: 250,

      /**
       * max distance of movement of a tap, this is for the slow tappers
       * @property tapMaxDistance
       * @type {Number}
       * @default 10
       */
      tapMaxDistance: 10,

      /**
       * always trigger the `tap` event, even while double-tapping
       * @property tapAlways
       * @type {Boolean}
       * @default true
       */
      tapAlways: true,

      /**
       * max distance between two taps
       * @property doubleTapDistance
       * @type {Number}
       * @default 20
       */
      doubleTapDistance: 20,

      /**
       * max time between two taps
       * @property doubleTapInterval
       * @type {Number}
       * @default 300
       */
      doubleTapInterval: 300
    }
  };
})('tap');

/**
 * @module gestures
 */
/**
 * when a touch is being touched at the page
 *
 * @class Touch
 * @static
 */
/**
 * @event touch
 * @param {Object} ev
 */
GestureDetector.gestures.Touch = {
  name: 'touch',
  index: -Infinity,
  defaults: {
    /**
     * call preventDefault at touchstart, and makes the element blocking by disabling the scrolling of the page,
     * but it improves gestures like transforming and dragging.
     * be careful with using this, it can be very annoying for users to be stuck on the page
     * @property preventDefault
     * @type {Boolean}
     * @default false
     */
    preventDefault: false,

    /**
     * disable mouse events, so only touch (or pen!) input triggers events
     * @property preventMouse
     * @type {Boolean}
     * @default false
     */
    preventMouse: false
  },
  handler: function touchGesture(ev, inst) {
    if (inst.options.preventMouse && ev.pointerType == POINTER_MOUSE) {
      ev.stopDetect();
      return;
    }

    if (inst.options.preventDefault) {
      ev.preventDefault();
    }

    if (ev.eventType == EVENT_TOUCH) {
      inst.trigger('touch', ev);
    }
  }
};

/**
 * @module gestures
 */
/**
 * User want to scale or rotate with 2 fingers
 * Preventing the default browser behavior is a good way to improve feel and working. This can be done with the
 * `preventDefault` option.
 *
 * @class Transform
 * @static
 */
/**
 * @event transform
 * @param {Object} ev
 */
/**
 * @event transformstart
 * @param {Object} ev
 */
/**
 * @event transformend
 * @param {Object} ev
 */
/**
 * @event pinchin
 * @param {Object} ev
 */
/**
 * @event pinchout
 * @param {Object} ev
 */
/**
 * @event rotate
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function (name) {
  var triggered = false;

  function transformGesture(ev, inst) {
    switch (ev.eventType) {
      case EVENT_START:
        triggered = false;
        break;

      case EVENT_MOVE:
        // at least multitouch
        if (ev.touches.length < 2) {
          return;
        }

        var scaleThreshold = Math.abs(1 - ev.scale);
        var rotationThreshold = Math.abs(ev.rotation);

        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if (scaleThreshold < inst.options.transformMinScale && rotationThreshold < inst.options.transformMinRotation) {
          return;
        }

        // we are transforming!
        Detection.current.name = name;

        // first time, trigger dragstart event
        if (!triggered) {
          inst.trigger(name + 'start', ev);
          triggered = true;
        }

        inst.trigger(name, ev); // basic transform event

        // trigger rotate event
        if (rotationThreshold > inst.options.transformMinRotation) {
          inst.trigger('rotate', ev);
        }

        // trigger pinch event
        if (scaleThreshold > inst.options.transformMinScale) {
          inst.trigger('pinch', ev);
          inst.trigger('pinch' + (ev.scale < 1 ? 'in' : 'out'), ev);
        }
        break;

      case EVENT_RELEASE:
        if (triggered && ev.changedLength < 2) {
          inst.trigger(name + 'end', ev);
          triggered = false;
        }
        break;
    }
  }

  GestureDetector.gestures.Transform = {
    name: name,
    index: 45,
    defaults: {
      /**
       * minimal scale factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
       * @property transformMinScale
       * @type {Number}
       * @default 0.01
       */
      transformMinScale: 0.01,

      /**
       * rotation in degrees
       * @property transformMinRotation
       * @type {Number}
       * @default 1
       */
      transformMinRotation: 1
    },

    handler: transformGesture
  };
})('transform');

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
var readyMap = new WeakMap();
var queueMap = new WeakMap();

function isContentReady(element) {
  if (element.childNodes.length > 0) {
    setContentReady(element);
  }
  return readyMap.has(element);
}

function setContentReady(element) {
  readyMap.set(element, true);
}

function addCallback(element, fn) {
  if (!queueMap.has(element)) {
    queueMap.set(element, []);
  }
  queueMap.get(element).push(fn);
}

function consumeQueue(element) {
  var callbacks = queueMap.get(element, []) || [];
  queueMap.delete(element);
  callbacks.forEach(function (callback) {
    return callback();
  });
}

function contentReady(element) {
  var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

  addCallback(element, fn);

  if (isContentReady(element)) {
    consumeQueue(element);
    return;
  }

  var observer = new MutationObserver(function (changes) {
    setContentReady(element);
    consumeQueue(element);
  });
  observer.observe(element, { childList: true, characterData: true });

  // failback for elements has empty content.
  setImmediate(function () {
    setContentReady(element);
    consumeQueue(element);
  });
}

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var _setAttributes = function _setAttributes(element, options) {
  ['id', 'class', 'animation'].forEach(function (a) {
    return options.hasOwnProperty(a) && element.setAttribute(a, options[a]);
  });

  if (options.modifier) {
    util.addModifier(element, options.modifier);
  }
};

/**
 * @object ons.notification
 * @category dialog
 * @tutorial vanilla/Reference/dialog
 * @description
 *   [en]
 *     Utility methods to create different kinds of notifications. There are three methods available:
 *
 *     * `ons.notification.alert()`
 *     * `ons.notification.confirm()`
 *     * `ons.notification.prompt()`
 *     * `ons.notification.toast()`
 *
 *     It will automatically display a Material Design dialog on Android devices.
 *   [/en]
 *   [ja]いくつかの種類のアラートダイアログを作成するためのユーティリティメソッドを収めたオブジェクトです。[/ja]
 * @example
 * ons.notification.alert('Hello, world!');
 *
 * ons.notification.confirm('Are you ready?')
 *   .then(
 *     function(answer) {
 *       if (answer === 1) {
 *         ons.notification.alert('Let\'s go!');
 *       }
 *     }
 *   );
 *
 * ons.notification.prompt('How old are ?')
 *   .then(
 *     function(age) {
 *       ons.notification.alert('You are ' + age + ' years old.');
 *     }
 *   );
 */
var notification = {};

notification._createAlertDialog = function (options) {
  // Prompt input string
  var inputString = '';
  if (options.isPrompt) {
    inputString = '\n      <input\n        class="text-input text-input--underbar"\n        type="' + (options.inputType || 'text') + '"\n        placeholder="' + (options.placeholder || '') + '"\n        value="' + (options.defaultValue || '') + '"\n        style="width: 100%; margin-top: 10px;"\n      />\n    ';
  }

  // Buttons string
  var buttons = '';
  options.buttonLabels.forEach(function (label, index) {
    buttons += '\n      <ons-alert-dialog-button\n        class="\n          ' + (index === options.primaryButtonIndex ? ' alert-dialog-button--primal' : '') + '\n          ' + (options.buttonLabels.length <= 2 ? ' alert-dialog-button--rowfooter' : '') + '\n        " \n        style="position: relative;">\n        ' + label + '\n      </ons-alert-dialog-button>\n    ';
  });

  // Dialog Element
  var el = {};
  var _destroyDialog = function _destroyDialog() {
    if (el.dialog.onDialogCancel) {
      el.dialog.removeEventListener('dialog-cancel', el.dialog.onDialogCancel);
    }

    Object.keys(el).forEach(function (key) {
      return delete el[key];
    });
    el = null;

    if (options.destroy instanceof Function) {
      options.destroy();
    }
  };

  el.dialog = document.createElement('ons-alert-dialog');
  el.dialog.innerHTML = '\n    <div class="alert-dialog-mask"></div>\n    <div class="alert-dialog">\n      <div class="alert-dialog-container">\n        <div class="alert-dialog-title">\n          ' + (options.title || '') + '\n        </div>\n        <div class="alert-dialog-content">\n          ' + (options.message || options.messageHTML) + '\n          ' + inputString + '\n        </div>\n        <div class="\n          alert-dialog-footer\n          ' + (options.buttonLabels.length <= 2 ? ' alert-dialog-footer--rowfooter' : '') + '\n        ">\n          ' + buttons + '\n        </div>\n      </div>\n    </div>\n  ';
  contentReady(el.dialog);

  // Set attributes
  _setAttributes(el.dialog, options);

  var deferred = util.defer();

  // Prompt events
  if (options.isPrompt && options.submitOnEnter) {
    el.input = el.dialog.querySelector('.text-input');
    el.input.onkeypress = function (event) {
      if (event.keyCode === 13) {
        el.dialog.hide().then(function () {
          if (el) {
            var resolveValue = el.input.value;
            _destroyDialog();
            options.callback(resolveValue);
            deferred.resolve(resolveValue);
          }
        });
      }
    };
  }

  // Button events
  el.footer = el.dialog.querySelector('.alert-dialog-footer');
  util.arrayFrom(el.dialog.querySelectorAll('.alert-dialog-button')).forEach(function (buttonElement, index) {
    buttonElement.onclick = function () {
      el.dialog.hide().then(function () {
        if (el) {
          var resolveValue = index;
          if (options.isPrompt) {
            resolveValue = index === options.primaryButtonIndex ? el.input.value : null;
          }
          el.dialog.remove();
          _destroyDialog();
          options.callback(resolveValue);
          deferred.resolve(resolveValue);
        }
      });
    };

    el.footer.appendChild(buttonElement);
  });

  // Cancel events
  if (options.cancelable) {
    el.dialog.cancelable = true;
    el.dialog.onDialogCancel = function () {
      setImmediate(function () {
        el.dialog.remove();
        _destroyDialog();
      });
      var resolveValue = options.isPrompt ? null : -1;
      options.callback(resolveValue);
      deferred.resolve(resolveValue);
    };
    el.dialog.addEventListener('dialog-cancel', el.dialog.onDialogCancel, false);
  }

  // Show dialog
  document.body.appendChild(el.dialog);
  options.compile(el.dialog);
  setImmediate(function () {
    el.dialog.show().then(function () {
      if (el.input && options.isPrompt && options.autofocus) {
        el.input.focus();
      }
    });
  });

  return deferred.promise;
};

var _normalizeArguments = function _normalizeArguments(message) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var defaults$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  options = _extends({}, options);
  typeof message === 'string' ? options.message = message : options = message;
  if (!options.message && !options.messageHTML) {
    throw new Error('Notifications must contain a message.');
  }

  if (options.hasOwnProperty('buttonLabels') || options.hasOwnProperty('buttonLabel')) {
    options.buttonLabels = options.buttonLabels || options.buttonLabel;
    if (!Array.isArray(options.buttonLabels)) {
      options.buttonLabels = [options.buttonLabels || ''];
    }
  }

  return util.extend({
    compile: function compile(param) {
      return param;
    },
    callback: function callback(param) {
      return param;
    },
    animation: 'default',
    cancelable: false,
    primaryButtonIndex: (options.buttonLabels || defaults$$1.buttonLabels || []).length - 1
  }, defaults$$1, options);
};

/**
 * @method alert
 * @signature alert(message [, options] | options)
 * @return {Promise}
 *   [en]Will resolve to the index of the button that was pressed or `-1` when canceled.[/en]
 *   [ja][/ja]
 * @param {String} message
 *   [en]Notification message. This argument is optional but if it's not defined either `options.message` or `options.messageHTML` must be defined instead.[/en]
 *   [ja][/ja]
 * @param {Object} options
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクトです。[/ja]
 * @param {String} [options.message]
 *   [en]Notification message.[/en]
 *   [ja]アラートダイアログに表示する文字列を指定します。[/ja]
 * @param {String} [options.messageHTML]
 *   [en]Notification message in HTML.[/en]
 *   [ja]アラートダイアログに表示するHTMLを指定します。[/ja]
 * @param {String | Array} [options.buttonLabels]
 *   [en]Labels for the buttons. Default is `"OK"`.[/en]
 *   [ja]確認ボタンのラベルを指定します。"OK"がデフォルトです。[/ja]
 * @param {Number} [options.primaryButtonIndex]
 *   [en]Index of primary button. Default is the last one.[/en]
 *   [ja]プライマリボタンのインデックスを指定します。デフォルトは 0 です。[/ja]
 * @param {Boolean} [options.cancelable]
 *   [en]Whether the dialog is cancelable or not. Default is `false`. If the dialog is cancelable it can be closed by clicking the background or pressing the Android back button.[/en]
 *   [ja]ダイアログがキャンセル可能かどうかを指定します。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are `none` and `fade`. Default is `fade`.[/en]
 *   [ja]アラートダイアログを表示する際のアニメーション名を指定します。"none", "fade"のいずれかを指定できます。[/ja]
 * @param {String} [options.id]
 *   [en]The `<ons-alert-dialog>` element's ID.[/en]
 *   [ja]ons-alert-dialog要素のID。[/ja]
 * @param {String} [options.class]
 *   [en]The `<ons-alert-dialog>` element's class.[/en]
 *   [ja]ons-alert-dialog要素のclass。[/ja]
 * @param {String} [options.title]
 *   [en]Dialog title. Default is `"Alert"`.[/en]
 *   [ja]アラートダイアログの上部に表示するタイトルを指定します。"Alert"がデフォルトです。[/ja]
 * @param {String} [options.modifier]
 *   [en]Modifier for the dialog.[/en]
 *   [ja]アラートダイアログのmodifier属性の値を指定します。[/ja]
 * @param {Function} [options.callback]
 *   [en]Function that executes after dialog has been closed.[/en]
 *   [ja]アラートダイアログが閉じられた時に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]
 *     Display an alert dialog to show the user a message.
 *
 *     The content of the message can be either simple text or HTML.
 *
 *     It can be called in the following ways:
 *
 *     ```
 *     ons.notification.alert(message, options);
 *     ons.notification.alert(options);
 *     ```
 *
 *     Must specify either `message` or `messageHTML`.
 *   [/en]
 *   [ja]
 *     ユーザーへメッセージを見せるためのアラートダイアログを表示します。
 *     表示するメッセージは、テキストかもしくはHTMLを指定できます。
 *     このメソッドの引数には、options.messageもしくはoptions.messageHTMLのどちらかを必ず指定する必要があります。
 *   [/ja]
 */
notification.alert = function (message, options) {
  options = _normalizeArguments(message, options, {
    buttonLabels: ['OK'],
    title: 'Alert'
  });

  return notification._createAlertDialog(options);
};

/**
 * @method confirm
 * @signature confirm(message [, options] | options)
 * @return {Promise}
 *   [en]Will resolve to the index of the button that was pressed or `-1` when canceled.[/en]
 *   [ja][/ja]
 * @param {String} message
 *   [en]Notification message. This argument is optional but if it's not defined either `options.message` or `options.messageHTML` must be defined instead.[/en]
 *   [ja][/ja]
 * @param {Object} options
 *   [en]Parameter object.[/en]
 * @param {Array} [options.buttonLabels]
 *   [en]Labels for the buttons. Default is `["Cancel", "OK"]`.[/en]
 *   [ja]ボタンのラベルの配列を指定します。["Cancel", "OK"]がデフォルトです。[/ja]
 * @param {Number} [options.primaryButtonIndex]
 *   [en]Index of primary button. Default is the last one.[/en]
 *   [ja]プライマリボタンのインデックスを指定します。デフォルトは 1 です。[/ja]
 * @description
 *   [en]
 *     Display a dialog to ask the user for confirmation. Extends `alert()` parameters.
 *     The default button labels are `"Cancel"` and `"OK"` but they can be customized.
 *
 *     It can be called in the following ways:
 *
 *     ```
 *     ons.notification.confirm(message, options);
 *     ons.notification.confirm(options);
 *     ```
 *
 *     Must specify either `message` or `messageHTML`.
 *   [/en]
 *   [ja]
 *     ユーザに確認を促すダイアログを表示します。
 *     デオルとのボタンラベルは、"Cancel"と"OK"ですが、これはこのメソッドの引数でカスタマイズできます。
 *     このメソッドの引数には、options.messageもしくはoptions.messageHTMLのどちらかを必ず指定する必要があります。
 *   [/ja]
 */
notification.confirm = function (message, options) {
  options = _normalizeArguments(message, options, {
    buttonLabels: ['Cancel', 'OK'],
    title: 'Confirm'
  });

  return notification._createAlertDialog(options);
};

/**
 * @method prompt
 * @signature prompt(message [, options] | options)
 * @param {String} message
 *   [en]Notification message. This argument is optional but if it's not defined either `options.message` or `options.messageHTML` must be defined instead.[/en]
 *   [ja][/ja]
 * @return {Promise}
 *   [en]Will resolve to the input value when the dialog is closed or `null` when canceled.[/en]
 *   [ja][/ja]
 * @param {Object} options
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクトです。[/ja]
 * @param {String | Array} [options.buttonLabels]
 *   [en]Labels for the buttons. Default is `"OK"`.[/en]
 *   [ja]確認ボタンのラベルを指定します。"OK"がデフォルトです。[/ja]
 * @param {Number} [options.primaryButtonIndex]
 *   [en]Index of primary button. Default is the last one.[/en]
 *   [ja]プライマリボタンのインデックスを指定します。デフォルトは 0 です。[/ja]
 * @param {String} [options.placeholder]
 *   [en]Placeholder for the text input.[/en]
 *   [ja]テキスト欄のプレースホルダに表示するテキストを指定します。[/ja]
 * @param {String} [options.defaultValue]
 *   [en]Default value for the text input.[/en]
 *   [ja]テキスト欄のデフォルトの値を指定します。[/ja]
 * @param {String} [options.inputType]
 *   [en]Type of the input element (`password`, `date`...). Default is `text`.[/en]
 *   [ja][/ja]
 * @param {Boolean} [options.autofocus]
 *   [en]Autofocus the input element. Default is `true`.[/en]
 *   [ja]input要素に自動的にフォーカスするかどうかを指定します。デフォルトはtrueです。[/ja]
 * @param {Boolean} [options.submitOnEnter]
 *   [en]Submit automatically when enter is pressed. Default is `true`.[/en]
 *   [ja]Enterが押された際にそのformをsubmitするかどうかを指定します。デフォルトはtrueです。[/ja]
 * @description
 *   [en]
 *     Display a dialog with a prompt to ask the user a question. Extends `alert()` parameters.
 *
 *     It can be called in the following ways:
 *
 *     ```
 *     ons.notification.prompt(message, options);
 *     ons.notification.prompt(options);
 *     ```
 *
 *     Must specify either `message` or `messageHTML`.
 *   [/en]
 *   [ja]
 *     ユーザーに入力を促すダイアログを表示します。
 *     このメソッドの引数には、options.messageもしくはoptions.messageHTMLのどちらかを必ず指定する必要があります。
 *   [/ja]
 */
notification.prompt = function (message, options) {
  options = _normalizeArguments(message, options, {
    buttonLabels: ['OK'],
    title: 'Alert',
    isPrompt: true,
    autofocus: true,
    submitOnEnter: true
  });

  return notification._createAlertDialog(options);
};

/**
 * @method toast
 * @signature toast(message [, options] | options)
 * @return {Promise}
 *   [en]Will resolve when the toast is hidden.[/en]
 *   [ja][/ja]
 * @param {String} message
 *   [en]Toast message. This argument is optional but if it's not defined then `options.message` must be defined instead.[/en]
 *   [ja][/ja]
 * @param {Object} options
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクトです。[/ja]
 * @param {String} [options.message]
 *   [en]Notification message.[/en]
 *   [ja]トーストに表示する文字列を指定します。[/ja]
 * @param {String} [options.buttonLabel]
 *   [en]Label for the button.[/en]
 *   [ja]確認ボタンのラベルを指定します。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are `none`, `fade`, `ascend`, `lift` and `fall`. Default is `ascend` for Android and `lift` for iOS.[/en]
 *   [ja]トーストを表示する際のアニメーション名を指定します。"none", "fade", "ascend", "lift", "fall"のいずれかを指定できます。[/ja]
 * @param {Number} [options.timeout]
 *   [en]Number of miliseconds where the toast is visible before hiding automatically.[/en]
 *   [ja][/ja]
 * @param {Boolean} [options.force]
 *   [en]If `true`, the toast skips the notification queue and is shown immediately. Defaults to `false`.[/en]
 *   [ja][/ja]
 * @param {String} [options.id]
 *   [en]The `<ons-toast>` element's ID.[/en]
 *   [ja]ons-toast要素のID。[/ja]
 * @param {String} [options.class]
 *   [en]The `<ons-toast>` element's class.[/en]
 *   [ja]ons-toast要素のclass。[/ja]
 * @param {String} [options.modifier]
 *   [en]Modifier for the element.[/en]
 *   [ja]トーストのmodifier属性の値を指定します。[/ja]
 * @param {Function} [options.callback]
 *   [en]Function that executes after toast has been hidden.[/en]
 *   [ja]トーストが閉じられた時に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]
 *     Display a simple notification toast with an optional button that can be used for simple actions.
 *
 *     It can be called in the following ways:
 *
 *     ```
 *     ons.notification.toast(message, options);
 *     ons.notification.toast(options);
 *     ```
 *   [/en]
 *   [ja][/ja]
 */
notification.toast = function (message, options) {
  options = _normalizeArguments(message, options, {
    timeout: 0,
    force: false
  });

  var toast = util.createElement('\n    <ons-toast>\n      ' + options.message + '\n      ' + (options.buttonLabels ? '<button>' + options.buttonLabels[0] + '</button>' : '') + '\n    </ons-toast>\n  ');

  _setAttributes(toast, options);

  var deferred = util.defer();
  var resolve = function resolve(value) {
    if (toast) {
      toast.hide().then(function () {
        if (toast) {
          toast.remove();
          toast = null;
          options.callback(value);
          deferred.resolve(value);
        }
      });
    }
  };

  if (options.buttonLabels) {
    util.findChild(toast._toast, 'button').onclick = function () {
      return resolve(0);
    };
  }

  document.body.appendChild(toast);
  options.compile(toast);

  var show = function show() {
    toast.parentElement && toast.show(options).then(function () {
      if (options.timeout) {
        setTimeout(function () {
          return resolve(-1);
        }, options.timeout);
      }
    });
  };

  options.force ? show() : ToastQueue$1.add(show, deferred.promise);

  return deferred.promise;
};

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

// Validate parameters
var checkOptions = function checkOptions(options) {
  if (!Object.hasOwnProperty.call(options, 'buttons') || !(options.buttons instanceof Array)) {
    throw new Error('"options.buttons" must be an instance of Array.');
  }
  if (Object.hasOwnProperty.call(options, 'callback') && !(options.callback instanceof Function)) {
    throw new Error('"options.callback" must be an instance of Function.');
  }
  if (Object.hasOwnProperty.call(options, 'compile') && !(options.compile instanceof Function)) {
    throw new Error('"options.compile" must be an instance of Function.');
  }
  if (Object.hasOwnProperty.call(options, 'destroy') && !(options.destroy instanceof Function)) {
    throw new Error('"options.destroy" must be an instance of Function.');
  }
};

// Action Sheet
var actionSheet = (function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  checkOptions(options);

  // Main component
  var actionSheet = util.createElement('\n    <ons-action-sheet\n      ' + (options.title ? 'title="' + options.title + '"' : '') + '\n      ' + (options.cancelable ? 'cancelable' : '') + '\n      ' + (options.modifier ? 'modifier="' + options.modifier + '"' : '') + '\n      ' + (options.maskColor ? 'mask-color="' + options.maskColor + '"' : '') + '\n      ' + (options.id ? 'id="' + options.id + '"' : '') + '\n      ' + (options.class ? 'class="' + options.class + '"' : '') + '\n    >\n      <div class="action-sheet"></div>\n    </ons-action-sheet>\n  ');

  // Resolve action and clean up
  var deferred = util.defer();
  var resolver = function resolver(event) {
    var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

    if (actionSheet) {
      options.destroy && options.destroy(actionSheet);

      actionSheet.removeEventListener('dialog-cancel', resolver, false);
      actionSheet.remove();
      actionSheet = null;

      options.callback && options.callback(index);
      deferred.resolve(index);
    }
  };

  // Link cancel handler
  actionSheet.addEventListener('dialog-cancel', resolver, false);

  // Create buttons and link action handler
  var buttons = document.createDocumentFragment();
  options.buttons.forEach(function (item, index) {
    var buttonOptions = typeof item === 'string' ? { label: item } : _extends({}, item);
    if (options.destructive === index) {
      buttonOptions.modifier = (buttonOptions.modifier || '') + ' destructive';
    }

    var button = util.createElement('\n      <ons-action-sheet-button\n        ' + (buttonOptions.icon ? 'icon="' + buttonOptions.icon + '"' : '') + '\n        ' + (buttonOptions.modifier ? 'modifier="' + buttonOptions.modifier + '"' : '') + '\n      >\n        ' + buttonOptions.label + '\n      </ons-action-sheet-button>\n    ');

    button.onclick = function (event) {
      return actionSheet.hide().then(function () {
        return resolver(event, index);
      });
    };
    buttons.appendChild(button);
  });

  // Finish component and attach
  util.findChild(actionSheet, '.action-sheet').appendChild(buttons);
  document.body.appendChild(actionSheet);
  options.compile && options.compile(el.dialog);

  // Show
  setImmediate(function () {
    return actionSheet.show({
      animation: options.animation,
      animationOptions: options.animationOptions
    });
  });

  return deferred.promise;
});

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var create$1 = function create() {

  /**
   * @object ons.orientation
   * @category util
   * @description
   *   [en]Utility methods for orientation detection.[/en]
   *   [ja]画面のオリエンテーション検知のためのユーティリティメソッドを収めているオブジェクトです。[/ja]
   */
  var obj = {
    /**
     * @event change
     * @description
     *   [en]Fired when the device orientation changes.[/en]
     *   [ja]デバイスのオリエンテーションが変化した際に発火します。[/ja]
     * @param {Object} event
     *   [en]Event object.[/en]
     *   [ja]イベントオブジェクトです。[/ja]
     * @param {Boolean} event.isPortrait
     *   [en]Will be true if the current orientation is portrait mode.[/en]
     *   [ja]現在のオリエンテーションがportraitの場合にtrueを返します。[/ja]
     */

    /**
     * @method on
     * @signature on(eventName, listener)
     * @description
     *   [en]Add an event listener.[/en]
     *   [ja]イベントリスナーを追加します。[/ja]
     * @param {String} eventName
     *   [en]Name of the event.[/en]
     *   [ja]イベント名を指定します。[/ja]
     * @param {Function} listener
     *   [en]Function to execute when the event is triggered.[/en]
     *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
     */

    /**
     * @method once
     * @signature once(eventName, listener)
     * @description
     *  [en]Add an event listener that's only triggered once.[/en]
     *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
     * @param {String} eventName
     *   [en]Name of the event.[/en]
     *   [ja]イベント名を指定します。[/ja]
     * @param {Function} listener
     *   [en]Function to execute when the event is triggered.[/en]
     *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
     */

    /**
     * @method off
     * @signature off(eventName, [listener])
     * @description
     *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
     *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
     * @param {String} eventName
     *   [en]Name of the event.[/en]
     *   [ja]イベント名を指定します。[/ja]
     * @param {Function} listener
     *   [en]Function to execute when the event is triggered.[/en]
     *   [ja]削除するイベントリスナーを指定します。[/ja]
     */

    // actual implementation to detect if whether current screen is portrait or not
    _isPortrait: false,

    /**
     * @method isPortrait
     * @signature isPortrait()
     * @return {Boolean}
     *   [en]Will be true if the current orientation is portrait mode.[/en]
     *   [ja]オリエンテーションがportraitモードの場合にtrueになります。[/ja]
     * @description
     *   [en]Returns whether the current screen orientation is portrait or not.[/en]
     *   [ja]オリエンテーションがportraitモードかどうかを返します。[/ja]
     */
    isPortrait: function isPortrait() {
      return this._isPortrait();
    },

    /**
     * @method isLandscape
     * @signature isLandscape()
     * @return {Boolean}
     *   [en]Will be true if the current orientation is landscape mode.[/en]
     *   [ja]オリエンテーションがlandscapeモードの場合にtrueになります。[/ja]
     * @description
     *   [en]Returns whether the current screen orientation is landscape or not.[/en]
     *   [ja]オリエンテーションがlandscapeモードかどうかを返します。[/ja]
     */
    isLandscape: function isLandscape() {
      return !this.isPortrait();
    },

    _init: function _init() {
      document.addEventListener('DOMContentLoaded', this._onDOMContentLoaded.bind(this), false);

      if ('orientation' in window) {
        window.addEventListener('orientationchange', this._onOrientationChange.bind(this), false);
      } else {
        window.addEventListener('resize', this._onResize.bind(this), false);
      }

      this._isPortrait = function () {
        return window.innerHeight > window.innerWidth;
      };

      return this;
    },

    _onDOMContentLoaded: function _onDOMContentLoaded() {
      this._installIsPortraitImplementation();
      this.emit('change', { isPortrait: this.isPortrait() });
    },

    _installIsPortraitImplementation: function _installIsPortraitImplementation() {
      var isPortrait = window.innerWidth < window.innerHeight;

      if (!('orientation' in window)) {
        this._isPortrait = function () {
          return window.innerHeight > window.innerWidth;
        };
      } else if (window.orientation % 180 === 0) {
        this._isPortrait = function () {
          return Math.abs(window.orientation % 180) === 0 ? isPortrait : !isPortrait;
        };
      } else {
        this._isPortrait = function () {
          return Math.abs(window.orientation % 180) === 90 ? isPortrait : !isPortrait;
        };
      }
    },

    _onOrientationChange: function _onOrientationChange() {
      var _this = this;

      var isPortrait = this._isPortrait();

      // Wait for the dimensions to change because
      // of Android inconsistency.
      var nIter = 0;
      var interval = setInterval(function () {
        nIter++;

        var w = window.innerWidth;
        var h = window.innerHeight;

        if (isPortrait && w <= h || !isPortrait && w >= h) {
          _this.emit('change', { isPortrait: isPortrait });
          clearInterval(interval);
        } else if (nIter === 50) {
          _this.emit('change', { isPortrait: isPortrait });
          clearInterval(interval);
        }
      }, 20);
    },

    // Run on not mobile browser.
    _onResize: function _onResize() {
      this.emit('change', { isPortrait: this.isPortrait() });
    }
  };

  MicroEvent.mixin(obj);

  return obj;
};

var orientation = create$1()._init();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @object ons.modifier
 * @category visual
 * @description
 *   [en]
 *     Utility methods to change modifier attributes of Onsen UI elements..
 *   [/en]
 *   [ja][/ja]
 * @example
 * ons.modifier.add(myOnsInputElement, 'underbar');
 * ons.modifier.toggle(myOnsToastElement, 'custom-modifier');
 *
 */
var modifier = {
  /**
   * @method add
   * @signature add(element, modifier [, modifier])
   * @description
   *   [en]Add the specified modifiers to the element if they are not already included.[/en]
   *   [ja][/ja]
   * @param {HTMLElement} element
   *   [en]Target element.[/en]
   *   [ja][/ja]
   * @param {String} modifier
   *   [en]Name of the modifier.[/en]
   *   [ja][/ja]
   */
  add: function add(element) {
    for (var _len = arguments.length, modifiers = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      modifiers[_key - 1] = arguments[_key];
    }

    return modifiers.forEach(function (modifier) {
      return util.addModifier(element, modifier);
    });
  },
  /**
   * @method remove
   * @signature remove(element, modifier [, modifier])
   * @description
   *   [en]Remove the specified modifiers from the element if they are included.[/en]
   *   [ja][/ja]
   * @param {HTMLElement} element
   *   [en]Target element.[/en]
   *   [ja][/ja]
   * @param {String} modifier
   *   [en]Name of the modifier.[/en]
   *   [ja][/ja]
   */
  remove: function remove(element) {
    for (var _len2 = arguments.length, modifiers = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      modifiers[_key2 - 1] = arguments[_key2];
    }

    return modifiers.forEach(function (modifier) {
      return util.removeModifier(element, modifier);
    });
  },
  /**
   * @method contains
   * @signature contains(element, modifier)
   * @description
   *   [en]Check whether the specified modifier is included in the element.[/en]
   *   [ja][/ja]
   * @param {HTMLElement} element
   *   [en]Target element.[/en]
   *   [ja][/ja]
   * @param {String} modifier
   *   [en]Name of the modifier.[/en]
   *   [ja][/ja]
   * @return {Boolean}
   *   [en]`true` when the specified modifier is found in the element's `modifier` attribute. `false` otherwise.[/en]
   *   [ja][/ja]
   */
  contains: util.hasModifier,
  /**
   * @method toggle
   * @signature toggle(element, modifier [, force])
   * @description
   *   [en]Toggle the specified modifier.[/en]
   *   [ja][/ja]
   * @param {HTMLElement} element
   *   [en]Target element.[/en]
   *   [ja][/ja]
   * @param {String} modifier
   *   [en]Name of the modifier.[/en]
   *   [ja][/ja]
   * @param {String} force
   *   [en]If it evaluates to true, add specified modifier value, and if it evaluates to false, remove it.[/en]
   *   [ja][/ja]
   */
  toggle: util.toggleModifier
};

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var softwareKeyboard = new MicroEvent();
softwareKeyboard._visible = false;

var onShow = function onShow() {
  softwareKeyboard._visible = true;
  softwareKeyboard.emit('show');
};

var onHide = function onHide() {
  softwareKeyboard._visible = false;
  softwareKeyboard.emit('hide');
};

var bindEvents = function bindEvents() {
  if (typeof Keyboard !== 'undefined') {
    // https://github.com/martinmose/cordova-keyboard/blob/95f3da3a38d8f8e1fa41fbf40145352c13535a00/README.md
    Keyboard.onshow = onShow;
    Keyboard.onhide = onHide;
    softwareKeyboard.emit('init', { visible: Keyboard.isVisible });

    return true;
  } else if (typeof cordova.plugins !== 'undefined' && typeof cordova.plugins.Keyboard !== 'undefined') {
    // https://github.com/driftyco/ionic-plugins-keyboard/blob/ca27ecf/README.md
    window.addEventListener('native.keyboardshow', onShow);
    window.addEventListener('native.keyboardhide', onHide);
    softwareKeyboard.emit('init', { visible: cordova.plugins.Keyboard.isVisible });

    return true;
  }

  return false;
};

var noPluginError = function noPluginError() {
  util.warn('ons-keyboard: Cordova Keyboard plugin is not present.');
};

document.addEventListener('deviceready', function () {
  if (!bindEvents()) {
    if (document.querySelector('[ons-keyboard-active]') || document.querySelector('[ons-keyboard-inactive]')) {
      noPluginError();
    }

    softwareKeyboard.on = noPluginError;
  }
});

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var util$3 = {
  _ready: false,

  _domContentLoaded: false,

  _onDOMContentLoaded: function _onDOMContentLoaded() {
    util$3._domContentLoaded = true;

    if (platform$1.isWebView()) {
      window.document.addEventListener('deviceready', function () {
        util$3._ready = true;
      }, false);
    } else {
      util$3._ready = true;
    }
  },

  addBackButtonListener: function addBackButtonListener(fn) {
    if (!this._domContentLoaded) {
      throw new Error('This method is available after DOMContentLoaded');
    }

    if (this._ready) {
      window.document.addEventListener('backbutton', fn, false);
    } else {
      window.document.addEventListener('deviceready', function () {
        window.document.addEventListener('backbutton', fn, false);
      });
    }
  },

  removeBackButtonListener: function removeBackButtonListener(fn) {
    if (!this._domContentLoaded) {
      throw new Error('This method is available after DOMContentLoaded');
    }

    if (this._ready) {
      window.document.removeEventListener('backbutton', fn, false);
    } else {
      window.document.addEventListener('deviceready', function () {
        window.document.removeEventListener('backbutton', fn, false);
      });
    }
  }
};
window.addEventListener('DOMContentLoaded', function () {
  return util$3._onDOMContentLoaded();
}, false);

var HandlerRepository = {
  _store: {},

  _genId: function () {
    var i = 0;
    return function () {
      return i++;
    };
  }(),

  set: function set(element, handler) {
    if (element.dataset.deviceBackButtonHandlerId) {
      this.remove(element);
    }
    var id = element.dataset.deviceBackButtonHandlerId = HandlerRepository._genId();
    this._store[id] = handler;
  },

  remove: function remove(element) {
    if (element.dataset.deviceBackButtonHandlerId) {
      delete this._store[element.dataset.deviceBackButtonHandlerId];
      delete element.dataset.deviceBackButtonHandlerId;
    }
  },

  get: function get$$1(element) {
    if (!element.dataset.deviceBackButtonHandlerId) {
      return undefined;
    }

    var id = element.dataset.deviceBackButtonHandlerId;

    if (!this._store[id]) {
      throw new Error();
    }

    return this._store[id];
  },

  has: function has(element) {
    if (!element.dataset) {
      return false;
    }

    var id = element.dataset.deviceBackButtonHandlerId;

    return !!this._store[id];
  }
};

var DeviceBackButtonDispatcher = function () {
  function DeviceBackButtonDispatcher() {
    classCallCheck(this, DeviceBackButtonDispatcher);

    this._isEnabled = false;
    this._boundCallback = this._callback.bind(this);
  }

  /**
   * Enable to handle 'backbutton' events.
   */


  createClass(DeviceBackButtonDispatcher, [{
    key: 'enable',
    value: function enable() {
      if (!this._isEnabled) {
        util$3.addBackButtonListener(this._boundCallback);
        this._isEnabled = true;
      }
    }

    /**
     * Disable to handle 'backbutton' events.
     */

  }, {
    key: 'disable',
    value: function disable() {
      if (this._isEnabled) {
        util$3.removeBackButtonListener(this._boundCallback);
        this._isEnabled = false;
      }
    }

    /**
     * Fire a 'backbutton' event manually.
     */

  }, {
    key: 'fireDeviceBackButtonEvent',
    value: function fireDeviceBackButtonEvent() {
      var event = document.createEvent('Event');
      event.initEvent('backbutton', true, true);
      document.dispatchEvent(event);
    }
  }, {
    key: '_callback',
    value: function _callback() {
      this._dispatchDeviceBackButtonEvent();
    }

    /**
     * @param {HTMLElement} element
     * @param {Function} callback
     */

  }, {
    key: 'createHandler',
    value: function createHandler(element, callback) {
      if (!(element instanceof HTMLElement)) {
        throw new Error('element must be an instance of HTMLElement');
      }

      if (!(callback instanceof Function)) {
        throw new Error('callback must be an instance of Function');
      }

      var handler = {
        _callback: callback,
        _element: element,

        disable: function disable() {
          HandlerRepository.remove(element);
        },

        setListener: function setListener(callback) {
          this._callback = callback;
        },

        enable: function enable() {
          HandlerRepository.set(element, this);
        },

        isEnabled: function isEnabled() {
          return HandlerRepository.get(element) === this;
        },

        destroy: function destroy() {
          HandlerRepository.remove(element);
          this._callback = this._element = null;
        }
      };

      handler.enable();

      return handler;
    }
  }, {
    key: '_dispatchDeviceBackButtonEvent',
    value: function _dispatchDeviceBackButtonEvent() {
      var tree = this._captureTree();

      var element = this._findHandlerLeafElement(tree);

      var handler = HandlerRepository.get(element);
      handler._callback(createEvent(element));

      function createEvent(element) {
        return {
          _element: element,
          callParentHandler: function callParentHandler() {
            var parent = this._element.parentNode;

            while (parent) {
              handler = HandlerRepository.get(parent);
              if (handler) {
                return handler._callback(createEvent(parent));
              }
              parent = parent.parentNode;
            }
          }
        };
      }
    }

    /**
     * @return {Object}
     */

  }, {
    key: '_captureTree',
    value: function _captureTree() {
      return createTree(document.body);

      function createTree(element) {
        var tree = {
          element: element,
          children: Array.prototype.concat.apply([], arrayOf(element.children).map(function (childElement) {

            if (childElement.style.display === 'none') {
              return [];
            }

            if (childElement.children.length === 0 && !HandlerRepository.has(childElement)) {
              return [];
            }

            var result = createTree(childElement);

            if (result.children.length === 0 && !HandlerRepository.has(result.element)) {
              return [];
            }

            return [result];
          }))
        };

        if (!HandlerRepository.has(tree.element)) {
          for (var i = 0; i < tree.children.length; i++) {
            var subTree = tree.children[i];
            if (HandlerRepository.has(subTree.element)) {
              return subTree;
            }
          }
        }

        return tree;
      }

      function arrayOf(target) {
        var result = [];
        for (var i = 0; i < target.length; i++) {
          result.push(target[i]);
        }
        return result;
      }
    }

    /**
     * @param {Object} tree
     * @return {HTMLElement}
     */

  }, {
    key: '_findHandlerLeafElement',
    value: function _findHandlerLeafElement(tree) {
      return find(tree);

      function find(node) {
        if (node.children.length === 0) {
          return node.element;
        }

        if (node.children.length === 1) {
          return find(node.children[0]);
        }

        return node.children.map(function (childNode) {
          return childNode.element;
        }).reduce(function (left, right) {
          if (!left) {
            return right;
          }

          var leftZ = parseInt(window.getComputedStyle(left, '').zIndex, 10);
          var rightZ = parseInt(window.getComputedStyle(right, '').zIndex, 10);

          if (!isNaN(leftZ) && !isNaN(rightZ)) {
            return leftZ > rightZ ? left : right;
          }

          throw new Error('Capturing backbutton-handler is failure.');
        }, null);
      }
    }
  }]);
  return DeviceBackButtonDispatcher;
}();

var deviceBackButtonDispatcher = new DeviceBackButtonDispatcher();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var generateId = function () {
  var i = 0;
  return function () {
    return i++;
  };
}();

/**
 * Door locking system.
 *
 * @param {Object} [options]
 * @param {Function} [options.log]
 */

var DoorLock = function () {
  function DoorLock() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, DoorLock);

    this._lockList = [];
    this._waitList = [];
    this._log = options.log || function () {};
  }

  /**
   * Register a lock.
   *
   * @return {Function} Callback for unlocking.
   */


  createClass(DoorLock, [{
    key: 'lock',
    value: function lock() {
      var _this = this;

      var unlock = function unlock() {
        _this._unlock(unlock);
      };
      unlock.id = generateId();
      this._lockList.push(unlock);
      this._log('lock: ' + unlock.id);

      return unlock;
    }
  }, {
    key: '_unlock',
    value: function _unlock(fn) {
      var index = this._lockList.indexOf(fn);
      if (index === -1) {
        throw new Error('This function is not registered in the lock list.');
      }

      this._lockList.splice(index, 1);
      this._log('unlock: ' + fn.id);

      this._tryToFreeWaitList();
    }
  }, {
    key: '_tryToFreeWaitList',
    value: function _tryToFreeWaitList() {
      while (!this.isLocked() && this._waitList.length > 0) {
        this._waitList.shift()();
      }
    }

    /**
     * Register a callback for waiting unlocked door.
     *
     * @params {Function} callback Callback on unlocking the door completely.
     */

  }, {
    key: 'waitUnlock',
    value: function waitUnlock(callback) {
      if (!(callback instanceof Function)) {
        throw new Error('The callback param must be a function.');
      }

      if (this.isLocked()) {
        this._waitList.push(callback);
      } else {
        callback();
      }
    }

    /**
     * @return {Boolean}
     */

  }, {
    key: 'isLocked',
    value: function isLocked() {
      return this._lockList.length > 0;
    }
  }]);
  return DoorLock;
}();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
// Default implementation for global PageLoader.
function loadPage(_ref, done) {
  var page = _ref.page,
      parent = _ref.parent;

  internal$1.getPageHTMLAsync(page).then(function (html) {
    var pageElement = util.createElement(html);
    parent.appendChild(pageElement);

    done(pageElement);
  });
}

function unloadPage(element) {
  if (element._destroy instanceof Function) {
    element._destroy();
  } else {
    element.remove();
  }
}

var PageLoader = function () {
  /**
   * @param {Function} [fn] Returns an object that has "element" property and "unload" function.
   */
  function PageLoader(loader, unloader) {
    classCallCheck(this, PageLoader);

    this._loader = loader instanceof Function ? loader : loadPage;
    this._unloader = unloader instanceof Function ? unloader : unloadPage;
  }

  /**
   * Set internal loader implementation.
   */


  createClass(PageLoader, [{
    key: 'load',


    /**
     * @param {any} options.page
     * @param {Element} options.parent A location to load page.
     * @param {Object} [options.params] Extra parameters for ons-page.
     * @param {Function} done Take an object that has "element" property and "unload" function.
     */
    value: function load(_ref2, done) {
      var page = _ref2.page,
          parent = _ref2.parent,
          _ref2$params = _ref2.params,
          params = _ref2$params === undefined ? {} : _ref2$params;

      this._loader({ page: page, parent: parent, params: params }, function (pageElement) {
        if (!(pageElement instanceof Element)) {
          throw Error('pageElement must be an instance of Element.');
        }

        done(pageElement);
      });
    }
  }, {
    key: 'unload',
    value: function unload(pageElement) {
      if (!(pageElement instanceof Element)) {
        throw Error('pageElement must be an instance of Element.');
      }

      this._unloader(pageElement);
    }
  }, {
    key: 'internalLoader',
    set: function set(fn) {
      if (!(fn instanceof Function)) {
        throw Error('First parameter must be an instance of Function');
      }
      this._loader = fn;
    },
    get: function get$$1() {
      return this._loader;
    }
  }]);
  return PageLoader;
}();

var defaultPageLoader = new PageLoader();

var instantPageLoader = new PageLoader(function (_ref3, done) {
  var page = _ref3.page,
      parent = _ref3.parent;

  var element = util.createElement(page.trim());
  parent.appendChild(element);

  done(element);
}, unloadPage);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var BaseAnimator = function () {

  /**
   * @param {Object} options
   * @param {String} options.timing
   * @param {Number} options.duration
   * @param {Number} options.delay
   */
  function BaseAnimator() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, BaseAnimator);

    this.timing = options.timing || 'linear';
    this.duration = options.duration || 0;
    this.delay = options.delay || 0;
  }

  createClass(BaseAnimator, null, [{
    key: 'extend',
    value: function extend() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var extendedAnimator = this;
      var newAnimator = function newAnimator() {
        extendedAnimator.apply(this, arguments);
        util.extend(this, properties);
      };

      newAnimator.prototype = this.prototype;
      return newAnimator;
    }
  }]);
  return BaseAnimator;
}();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @object ons
 * @category util
 * @description
 *   [ja]Onsen UIで利用できるグローバルなオブジェクトです。[/ja]
 *   [en]A global object that's used in Onsen UI. [/en]
 */
var ons$1 = {};

ons$1._util = util;
ons$1.animit = Animit;
ons$1._deviceBackButtonDispatcher = deviceBackButtonDispatcher;
ons$1._internal = internal$1;
ons$1.GestureDetector = GestureDetector;
ons$1.platform = platform$1;
ons$1.softwareKeyboard = softwareKeyboard;
ons$1.pageAttributeExpression = pageAttributeExpression;
ons$1.orientation = orientation;
ons$1.notification = notification;
ons$1.modifier = modifier;
ons$1._animationOptionsParser = parse;
ons$1._autoStyle = autoStyle;
ons$1._DoorLock = DoorLock;
ons$1._contentReady = contentReady;
ons$1.defaultPageLoader = defaultPageLoader;
ons$1.PageLoader = PageLoader;
ons$1._BaseAnimator = BaseAnimator;

ons$1._readyLock = new DoorLock();

ons$1.platform.select((window.location.search.match(/platform=([\w-]+)/) || [])[1]);

waitDeviceReady();

/**
 * @method isReady
 * @signature isReady()
 * @return {Boolean}
 *   [en]Will be true if Onsen UI is initialized.[/en]
 *   [ja]初期化されているかどうかを返します。[/ja]
 * @description
 *   [en]Returns true if Onsen UI is initialized.[/en]
 *   [ja]Onsen UIがすでに初期化されているかどうかを返すメソッドです。[/ja]
 */
ons$1.isReady = function () {
  return !ons$1._readyLock.isLocked();
};

/**
 * @method isWebView
 * @signature isWebView()
 * @return {Boolean}
 *   [en]Will be true if the app is running in Cordova.[/en]
 *   [ja]Cordovaで実行されている場合にtrueになります。[/ja]
 * @description
 *   [en]Returns true if running inside Cordova.[/en]
 *   [ja]Cordovaで実行されているかどうかを返すメソッドです。[/ja]
 */
ons$1.isWebView = ons$1.platform.isWebView;

/**
 * @method ready
 * @signature ready(callback)
 * @description
 *   [ja]アプリの初期化に利用するメソッドです。渡された関数は、Onsen UIの初期化が終了している時点で必ず呼ばれます。[/ja]
 *   [en]Method used to wait for app initialization. The callback will not be executed until Onsen UI has been completely initialized.[/en]
 * @param {Function} callback
 *   [en]Function that executes after Onsen UI has been initialized.[/en]
 *   [ja]Onsen UIが初期化が完了した後に呼び出される関数オブジェクトを指定します。[/ja]
 */
ons$1.ready = function (callback) {
  if (ons$1.isReady()) {
    callback();
  } else {
    ons$1._readyLock.waitUnlock(callback);
  }
};

/**
 * @method setDefaultDeviceBackButtonListener
 * @signature setDefaultDeviceBackButtonListener(listener)
 * @param {Function} listener
 *   [en]Function that executes when device back button is pressed.[/en]
 *   [ja]デバイスのバックボタンが押された時に実行される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Set default handler for device back button.[/en]
 *   [ja]デバイスのバックボタンのためのデフォルトのハンドラを設定します。[/ja]
 */
ons$1.setDefaultDeviceBackButtonListener = function (listener) {
  ons$1._defaultDeviceBackButtonHandler.setListener(listener);
};

/**
 * @method disableDeviceBackButtonHandler
 * @signature disableDeviceBackButtonHandler()
 * @description
 * [en]Disable device back button event handler.[/en]
 * [ja]デバイスのバックボタンのイベントを受け付けないようにします。[/ja]
 */
ons$1.disableDeviceBackButtonHandler = function () {
  ons$1._deviceBackButtonDispatcher.disable();
};

/**
 * @method enableDeviceBackButtonHandler
 * @signature enableDeviceBackButtonHandler()
 * @description
 * [en]Enable device back button event handler.[/en]
 * [ja]デバイスのバックボタンのイベントを受け付けるようにします。[/ja]
 */
ons$1.enableDeviceBackButtonHandler = function () {
  ons$1._deviceBackButtonDispatcher.enable();
};

/**
 * @method enableAutoStatusBarFill
 * @signature enableAutoStatusBarFill()
 * @description
 *   [en]Enable status bar fill feature on iOS7 and above.[/en]
 *   [ja]iOS7以上で、ステータスバー部分の高さを自動的に埋める処理を有効にします。[/ja]
 */
ons$1.enableAutoStatusBarFill = function () {
  if (ons$1.isReady()) {
    throw new Error('This method must be called before ons.isReady() is true.');
  }
  ons$1._internal.config.autoStatusBarFill = true;
};

/**
 * @method disableAutoStatusBarFill
 * @signature disableAutoStatusBarFill()
 * @description
 *   [en]Disable status bar fill feature on iOS7 and above.[/en]
 *   [ja]iOS7以上で、ステータスバー部分の高さを自動的に埋める処理を無効にします。[/ja]
 */
ons$1.disableAutoStatusBarFill = function () {
  if (ons$1.isReady()) {
    throw new Error('This method must be called before ons.isReady() is true.');
  }
  ons$1._internal.config.autoStatusBarFill = false;
};

/**
 * @method disableAnimations
 * @signature disableAnimations()
 * @description
 *   [en]Disable all animations. Could be handy for testing and older devices.[/en]
 *   [ja]アニメーションを全て無効にします。テストの際に便利です。[/ja]
 */
ons$1.disableAnimations = function () {
  ons$1._internal.config.animationsDisabled = true;
};

/**
 * @method enableAnimations
 * @signature enableAnimations()
 * @description
 *   [en]Enable animations (default).[/en]
 *   [ja]アニメーションを有効にします。[/ja]
 */
ons$1.enableAnimations = function () {
  ons$1._internal.config.animationsDisabled = false;
};

ons$1._disableWarnings = function () {
  ons$1._internal.config.warningsDisabled = true;
};

ons$1._enableWarnings = function () {
  ons$1._internal.config.warningsDisabled = false;
};

/**
 * @method disableAutoStyling
 * @signature disableAutoStyling()
 * @description
 *   [en]Disable automatic styling.[/en]
 *   [ja][/ja]
 */
ons$1.disableAutoStyling = ons$1._autoStyle.disable;

/**
 * @method enableAutoStyling
 * @signature enableAutoStyling()
 * @description
 *   [en]Enable automatic styling based on OS (default).[/en]
 *   [ja][/ja]
 */
ons$1.enableAutoStyling = ons$1._autoStyle.enable;

/**
 * @method forcePlatformStyling
 * @signature forcePlatformStyling(platform)
 * @description
 *   [en]Refresh styling for the given platform.[/en]
 *   [ja][/ja]
 * @param {string} platform New platform to style the elements.
 */
ons$1.forcePlatformStyling = function (newPlatform) {
  ons$1.enableAutoStyling();
  ons$1.platform.select(newPlatform || 'ios');

  ons$1._util.arrayFrom(document.querySelectorAll('*')).forEach(function (element) {
    if (element.tagName.toLowerCase() === 'ons-if') {
      element._platformUpdate();
    } else if (element.tagName.match(/^ons-/i)) {
      ons$1._autoStyle.prepare(element, true);
      if (element.tagName.toLowerCase() === 'ons-tabbar') {
        element._updatePosition();
      }
    }
  });
};

/**
 * @method preload
 * @signature preload(templatePaths)
 * @param {String|Array} templatePaths
 *   [en]Set of HTML file paths containing 'ons-page' elements.[/en]
 *   [ja][/ja]
 * @return {Promise}
 *   [en]Promise that resolves when all the templates are cached.[/en]
 *   [ja][/ja]
 * @description
 *   [en]Separated files need to be requested on demand and this can slightly delay pushing new pages. This method requests and caches templates for later use.[/en]
 *   [ja][/ja]
 */
ons$1.preload = function () {
  var templates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  return Promise.all((templates instanceof Array ? templates : [templates]).map(function (template) {
    if (typeof template !== 'string') {
      throw new Error('Expected string arguments but got ' + (typeof template === 'undefined' ? 'undefined' : _typeof(template)));
    }
    return ons$1._internal.getTemplateHTMLAsync(template);
  }));
};

/**
 * @method createElement
 * @signature createElement(template, options)
 * @param {String} template
 *   [en]Either an HTML file path, an `<ons-template>` id or an HTML string such as `'<div id="foo">hoge</div>'`.[/en]
 *   [ja][/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Boolean|HTMLElement} [options.append]
 *   [en]Whether or not the element should be automatically appended to the DOM.  Defaults to `false`. If `true` value is given, `document.body` will be used as the target.[/en]
 *   [ja][/ja]
 * @param {HTMLElement} [options.insertBefore]
 *   [en]Reference node that becomes the next sibling of the new node (`options.append` element).[/en]
 *   [ja][/ja]
 * @return {HTMLElement|Promise}
 *   [en]If the provided template was an inline HTML string, it returns the new element. Otherwise, it returns a promise that resolves to the new element.[/en]
 *   [ja][/ja]
 * @description
 *   [en]Create a new element from a template. Both inline HTML and external files are supported although the return value differs.[/en]
 *   [ja][/ja]
 */
ons$1.createElement = function (template) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  template = template.trim();

  var create = function create(html) {
    var element = ons$1._util.createElement(html);
    element.remove();

    if (options.append) {
      var target = options.append instanceof HTMLElement ? options.append : document.body;
      target.insertBefore(element, options.insertBefore || null);

      if (options.link instanceof Function) {
        options.link(element);
      }
    }

    return element;
  };

  return template.charAt(0) === '<' ? create(template) : ons$1._internal.getPageHTMLAsync(template).then(create);
};

/**
 * @method createPopover
 * @signature createPopover(page, [options])
 * @param {String} page
 *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-dialog> component.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Object} [options.parentScope]
 *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
 *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
 * @return {Promise}
 *   [en]Promise object that resolves to the popover component object.[/en]
 *   [ja]ポップオーバーのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
 * @description
 *   [en]Create a popover instance from a template.[/en]
 *   [ja]テンプレートからポップオーバーのインスタンスを生成します。[/ja]
 */
/**
 * @method createDialog
 * @signature createDialog(page, [options])
 * @param {String} page
 *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-dialog> component.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @return {Promise}
 *   [en]Promise object that resolves to the dialog component object.[/en]
 *   [ja]ダイアログのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
 * @description
 *   [en]Create a dialog instance from a template.[/en]
 *   [ja]テンプレートからダイアログのインスタンスを生成します。[/ja]
 */
/**
 * @method createAlertDialog
 * @signature createAlertDialog(page, [options])
 * @param {String} page
 *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-alert-dialog> component.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @return {Promise}
 *   [en]Promise object that resolves to the alert dialog component object.[/en]
 *   [ja]ダイアログのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
 * @description
 *   [en]Create a alert dialog instance from a template.[/en]
 *   [ja]テンプレートからアラートダイアログのインスタンスを生成します。[/ja]
 */
ons$1.createPopover = ons$1.createDialog = ons$1.createAlertDialog = function (template) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return ons$1.createElement(template, Object.assign({ append: true }, options));
};

/**
 * @method openActionSheet
 * @signature openActionSheet(options)
 * @description
 *   [en]Shows an instant Action Sheet and lets the user choose an action.[/en]
 *   [ja][/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Array} [options.buttons]
 *   [en]Represent each button of the action sheet following the specified order. Every item can be either a string label or an object containing `label`, `icon` and `modifier` properties.[/en]
 *   [ja][/ja]
 * @param {String} [options.title]
 *   [en]Optional title for the action sheet.[/en]
 *   [ja][/ja]
 * @param {Number} [options.destructive]
 *   [en]Optional index of the "destructive" button (only for iOS). It can be specified in the button array as well.[/en]
 *   [ja][/ja]
 * @param {Boolean} [options.cancelable]
 *   [en]Whether the action sheet can be canceled by tapping on the background mask or not.[/en]
 *   [ja][/ja]
 * @param {String} [options.modifier]
 *   [en]Modifier attribute of the action sheet. E.g. `'destructive'`.[/en]
 *   [ja][/ja]
 * @param {String} [options.maskColor]
 *   [en]Optionally change the background mask color.[/en]
 *   [ja][/ja]
 * @param {String} [options.id]
 *   [en]The element's id attribute.[/en]
 *   [ja][/ja]
 * @param {String} [options.class]
 *   [en]The element's class attribute.[/en]
 *   [ja][/ja]
 * @return {Promise}
 *   [en]Will resolve when the action sheet is closed. The resolve value is either the index of the tapped button or -1 when canceled.[/en]
 *   [ja][/ja]
 */
ons$1.openActionSheet = actionSheet;

/**
 * @method resolveLoadingPlaceholder
 * @signature resolveLoadingPlaceholder(page)
 * @param {String} page
 *   [en]Page name. Can be either an HTML file or an <ons-template> element.[/en]
 *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
 * @description
 *   [en]If no page is defined for the `ons-loading-placeholder` attribute it will wait for this method being called before loading the page.[/en]
 *   [ja]ons-loading-placeholderの属性値としてページが指定されていない場合は、ページロード前に呼ばれるons.resolveLoadingPlaceholder処理が行われるまで表示されません。[/ja]
 */
ons$1.resolveLoadingPlaceholder = function (page, link) {
  var elements = ons$1._util.arrayFrom(window.document.querySelectorAll('[ons-loading-placeholder]'));
  if (elements.length === 0) {
    throw new Error('No ons-loading-placeholder exists.');
  }

  elements.filter(function (element) {
    return !element.getAttribute('page');
  }).forEach(function (element) {
    element.setAttribute('ons-loading-placeholder', page);
    ons$1._resolveLoadingPlaceholder(element, page, link);
  });
};

ons$1._setupLoadingPlaceHolders = function () {
  ons$1.ready(function () {
    var elements = ons$1._util.arrayFrom(window.document.querySelectorAll('[ons-loading-placeholder]'));

    elements.forEach(function (element) {
      var page = element.getAttribute('ons-loading-placeholder');
      if (typeof page === 'string') {
        ons$1._resolveLoadingPlaceholder(element, page);
      }
    });
  });
};

ons$1._resolveLoadingPlaceholder = function (element, page, link) {
  link = link || function (element, done) {
    done();
  };
  ons$1._internal.getPageHTMLAsync(page).then(function (html) {

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    var contentElement = ons$1._util.createElement('<div>' + html + '</div>');
    contentElement.style.display = 'none';

    element.appendChild(contentElement);

    link(contentElement, function () {
      contentElement.style.display = '';
    });
  }).catch(function (error) {
    throw new Error('Unabled to resolve placeholder: ' + error);
  });
};

function waitDeviceReady() {
  var unlockDeviceReady = ons$1._readyLock.lock();
  window.addEventListener('DOMContentLoaded', function () {
    if (ons$1.isWebView()) {
      window.document.addEventListener('deviceready', unlockDeviceReady, false);
    } else {
      unlockDeviceReady();
    }
  }, false);
}

window._superSecretOns = ons$1;

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

function getElementClass() {
  if (typeof HTMLElement !== 'function') {
    // case of Safari
    var _BaseElement = function _BaseElement() {};
    _BaseElement.prototype = document.createElement('div');
    return _BaseElement;
  } else {
    return HTMLElement;
  }
}

var BaseElement = function (_getElementClass) {
  inherits(BaseElement, _getElementClass);

  function BaseElement() {
    classCallCheck(this, BaseElement);
    return possibleConstructorReturn(this, (BaseElement.__proto__ || Object.getPrototypeOf(BaseElement)).call(this));
  }

  return BaseElement;
}(getElementClass());

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @element ons-template
 * @category util
 * @description
 *   [en]
 *     Define a separate HTML fragment and use as a template.
 *
 *     These templates can be loaded as pages in `<ons-navigator>`, `<ons-tabbar>` and `<ons-splitter>`. They can also be used to generate dialogs.
 *   [/en]
 *   [ja]テンプレートとして使用するためのHTMLフラグメントを定義します。この要素でHTMLを宣言すると、id属性に指定した名前をpageのURLとしてons-navigatorなどのコンポーネントから参照できます。[/ja]
 * @guide templates
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @seealso ons-navigator
 *   [en]The `<ons-navigator>` component enables stack based navigation.[/en]
 *   [ja][/ja]
 * @seealso ons-tabbar
 *   [en]The `<ons-tabbar>` component is used to add tab navigation.[/en]
 *   [ja][/ja]
 * @seealso ons-splitter
 *   [en]The `<ons-splitter>` component can be used to create a draggable menu or column based layout.[/en]
 *   [ja][/ja]
 * @example
 * <ons-template id="foobar.html">
 *   <ons-page>
 *     Page content
 *   </ons-page>
 * </ons-template>
 *
 * <ons-navigator page="foobar.html">
 * </ons-navigator>
 */

var TemplateElement = function (_BaseElement) {
  inherits(TemplateElement, _BaseElement);

  /**
   * @property template
   * @type {String}
   * @description
   *  [en]Template content. This property can not be used with AngularJS bindings.[/en]
   *  [ja][/ja]
   */

  function TemplateElement() {
    classCallCheck(this, TemplateElement);

    var _this = possibleConstructorReturn(this, (TemplateElement.__proto__ || Object.getPrototypeOf(TemplateElement)).call(this));

    _this.template = _this.innerHTML;

    while (_this.firstChild) {
      _this.removeChild(_this.firstChild);
    }
    return _this;
  }

  createClass(TemplateElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      if (this.parentNode) {
        // Note: this.parentNode is not set in some CE0/CE1 polyfills.
        // Show warning when the ons-template is not located just under document.body
        if (this.parentNode !== document.body) {
          // if the parent is not document.body
          util.warn('ons-template (id = ' + this.getAttribute('id') + ') must be located just under document.body' + (this.parentNode.outerHTML ? ':\n\n' + this.parentNode.outerHTML : '.'));
        }
      }

      var event = new CustomEvent('_templateloaded', { bubbles: true, cancelable: true });
      event.template = this.template;
      event.templateId = this.getAttribute('id');

      this.dispatchEvent(event);
    }
  }]);
  return TemplateElement;
}(BaseElement);

customElements.define('ons-template', TemplateElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @element ons-if
 * @category conditional
 * @tutorial vanilla/Reference/if
 * @description
 *   [en]
 *     Conditionally display content depending on the platform, device orientation or both.
 *
 *     Sometimes it is useful to conditionally hide or show certain components based on platform. When running on iOS the `<ons-if>` element can be used to hide the `<ons-fab>` element.
 *   [/en]
 *   [ja][/ja]
 * @guide cross-platform-styling [en]Information about cross platform styling[/en][ja]Information about cross platform styling[/ja]
 * @example
 * <ons-page>
 *   <ons-if orientation="landscape">
 *     Landscape view!
 *   </ons-if>
 *   <ons-if platform="android">
 *     This is Android.
 *   </ons-if>
 *   <ons-if platform="ios other">
 *     This is not Android.
 *   </ons-if>
 * </ons-page>
 */

var IfElement = function (_BaseElement) {
  inherits(IfElement, _BaseElement);

  /**
   * @attribute platform
   * @initonly
   * @type {string}
   * @description
   *  [en]Space-separated platform names. Possible values are `"ios"`, `"android"`, `"windows"` and `"other"`.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute orientation
   * @type {string}
   * @description
   *  [en]Either `"portrait"` or `"landscape"`.[/en]
   *  [ja]portraitもしくはlandscapeを指定します[/ja]
   */

  function IfElement() {
    classCallCheck(this, IfElement);

    var _this = possibleConstructorReturn(this, (IfElement.__proto__ || Object.getPrototypeOf(IfElement)).call(this));

    contentReady(_this, function () {
      if (platform$1._renderPlatform !== null) {
        _this._platformUpdate();
      } else if (!_this._isAllowedPlatform()) {
        while (_this.childNodes[0]) {
          _this.childNodes[0].remove();
        }
        _this._platformUpdate();
      }
    });

    _this._onOrientationChange();
    return _this;
  }

  createClass(IfElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      orientation.on('change', this._onOrientationChange.bind(this));
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name) {
      if (name === 'orientation') {
        this._onOrientationChange();
      }
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      orientation.off('change', this._onOrientationChange);
    }
  }, {
    key: '_platformUpdate',
    value: function _platformUpdate() {
      this.style.display = this._isAllowedPlatform() ? '' : 'none';
    }
  }, {
    key: '_isAllowedPlatform',
    value: function _isAllowedPlatform() {
      return !this.getAttribute('platform') || this.getAttribute('platform').split(/\s+/).indexOf(platform$1.getMobileOS()) >= 0;
    }
  }, {
    key: '_onOrientationChange',
    value: function _onOrientationChange() {
      if (this.hasAttribute('orientation') && this._isAllowedPlatform()) {
        var conditionalOrientation = this.getAttribute('orientation').toLowerCase();
        var currentOrientation = orientation.isPortrait() ? 'portrait' : 'landscape';

        this.style.display = conditionalOrientation === currentOrientation ? '' : 'none';
      }
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['orientation'];
    }
  }]);
  return IfElement;
}(BaseElement);

customElements.define('ons-if', IfElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var ActionSheetAnimator = function (_BaseAnimator) {
  inherits(ActionSheetAnimator, _BaseAnimator);

  function ActionSheetAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.2 : _ref$duration;

    classCallCheck(this, ActionSheetAnimator);
    return possibleConstructorReturn(this, (ActionSheetAnimator.__proto__ || Object.getPrototypeOf(ActionSheetAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} dialog
   * @param {Function} done
   */


  createClass(ActionSheetAnimator, [{
    key: 'show',
    value: function show(dialog, done) {
      done();
    }

    /**
     * @param {HTMLElement} dialog
     * @param {Function} done
     */

  }, {
    key: 'hide',
    value: function hide(dialog, done) {
      done();
    }
  }]);
  return ActionSheetAnimator;
}(BaseAnimator);

/**
 * Android style animator for Action Sheet.
 */
var MDActionSheetAnimator = function (_ActionSheetAnimator) {
  inherits(MDActionSheetAnimator, _ActionSheetAnimator);

  function MDActionSheetAnimator() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$timing = _ref2.timing,
        timing = _ref2$timing === undefined ? 'ease' : _ref2$timing,
        _ref2$delay = _ref2.delay,
        delay = _ref2$delay === undefined ? 0 : _ref2$delay,
        _ref2$duration = _ref2.duration,
        duration = _ref2$duration === undefined ? 0.4 : _ref2$duration;

    classCallCheck(this, MDActionSheetAnimator);

    var _this2 = possibleConstructorReturn(this, (MDActionSheetAnimator.__proto__ || Object.getPrototypeOf(MDActionSheetAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this2.maskTiming = 'linear';
    _this2.maskDuration = 0.2;
    return _this2;
  }

  /**
   * @param {Object} dialog
   * @param {Function} callback
   */


  createClass(MDActionSheetAnimator, [{
    key: 'show',
    value: function show(dialog, callback) {

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.maskDuration,
        timing: this.maskTiming
      }), Animit(dialog._sheet).saveStyle().queue({
        css: {
          transform: 'translate3d(0, 80%, 0)',
          opacity: 0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(0, 0, 0)',
          opacity: 1.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }));
    }

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(dialog, callback) {
      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 1.0
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.maskDuration,
        timing: this.maskTiming
      }), Animit(dialog._sheet).saveStyle().queue({
        css: {
          transform: 'translate3d(0, 0, 0)',
          opacity: 1.0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(0, 80%, 0)',
          opacity: 0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }));
    }
  }]);
  return MDActionSheetAnimator;
}(ActionSheetAnimator);

/**
 * iOS style animator for dialog.
 */
var IOSActionSheetAnimator = function (_ActionSheetAnimator2) {
  inherits(IOSActionSheetAnimator, _ActionSheetAnimator2);

  function IOSActionSheetAnimator() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref3$timing = _ref3.timing,
        timing = _ref3$timing === undefined ? 'ease' : _ref3$timing,
        _ref3$delay = _ref3.delay,
        delay = _ref3$delay === undefined ? 0 : _ref3$delay,
        _ref3$duration = _ref3.duration,
        duration = _ref3$duration === undefined ? 0.3 : _ref3$duration;

    classCallCheck(this, IOSActionSheetAnimator);

    var _this3 = possibleConstructorReturn(this, (IOSActionSheetAnimator.__proto__ || Object.getPrototypeOf(IOSActionSheetAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this3.maskTiming = 'linear';
    _this3.maskDuration = 0.2;
    _this3.bodyHeight = document.body.clientHeight; // avoid Forced Synchronous Layout
    return _this3;
  }

  /**
   * @param {Object} dialog
   * @param {Function} callback
   */


  createClass(IOSActionSheetAnimator, [{
    key: 'show',
    value: function show(dialog, callback) {
      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.maskDuration,
        timing: this.maskTiming
      }), Animit(dialog._sheet).saveStyle().queue({
        css: {
          transform: 'translate3d(0, ' + (this.bodyHeight / 2.0 - 1) + 'px, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(0, 0, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }));
    }

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(dialog, callback) {
      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 1.0
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.maskDuration,
        timing: this.maskTiming
      }), Animit(dialog._sheet).saveStyle().queue({
        css: {
          transform: 'translate3d(0, 0, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(0, 100%, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }));
    }
  }]);
  return IOSActionSheetAnimator;
}(ActionSheetAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var BaseDialogElement = function (_BaseElement) {
  inherits(BaseDialogElement, _BaseElement);
  createClass(BaseDialogElement, [{
    key: '_updateAnimatorFactory',
    value: function _updateAnimatorFactory() {
      throw new Error('_updateAnimatorFactory method must be implemented.');
    }
  }, {
    key: '_toggleStyle',
    value: function _toggleStyle(shouldShow) {
      this.style.display = shouldShow ? 'block' : 'none';
    }
  }, {
    key: '_scheme',
    get: function get$$1() {
      throw new Error('_scheme getter must be implemented.');
    }
  }]);

  function BaseDialogElement() {
    classCallCheck(this, BaseDialogElement);

    var _this = possibleConstructorReturn(this, (BaseDialogElement.__proto__ || Object.getPrototypeOf(BaseDialogElement)).call(this));

    _this._visible = false;
    _this._doorLock = new DoorLock();
    _this._boundCancel = function () {
      return _this._cancel();
    };
    _this._selfCamelName = util.camelize(_this.tagName.slice(4));
    _this._defaultDBB = function (e) {
      return _this.cancelable ? _this._cancel() : e.callParentHandler();
    };
    _this._animatorFactory = _this._updateAnimatorFactory();
    return _this;
  }

  createClass(BaseDialogElement, [{
    key: '_cancel',
    value: function _cancel() {
      var _this2 = this;

      if (this.cancelable && !this._running) {
        this._running = true;
        this.hide().then(function () {
          _this2._running = false;
          util.triggerElementEvent(_this2, 'dialog-cancel');
        }, function () {
          return _this2._running = false;
        });
      }
    }
  }, {
    key: 'show',
    value: function show() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this._setVisible.apply(this, [true].concat(args));
    }
  }, {
    key: 'hide',
    value: function hide() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return this._setVisible.apply(this, [false].concat(args));
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return this._setVisible.apply(this, [!this.visible].concat(args));
    }
  }, {
    key: '_setVisible',
    value: function _setVisible(shouldShow) {
      var _util$triggerElementE,
          _this3 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var action = shouldShow ? 'show' : 'hide';

      options = _extends({}, options);
      options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

      var canceled = false;
      util.triggerElementEvent(this, 'pre' + action, (_util$triggerElementE = {}, defineProperty(_util$triggerElementE, this._selfCamelName, this), defineProperty(_util$triggerElementE, 'cancel', function cancel() {
        return canceled = true;
      }), _util$triggerElementE));

      if (canceled) {
        return Promise.reject('Canceled in pre' + action + ' event.');
      }

      return new Promise(function (resolve) {
        _this3._doorLock.waitUnlock(function () {
          var unlock = _this3._doorLock.lock();
          var animator = _this3._animatorFactory.newAnimator(options);

          shouldShow && _this3._toggleStyle(true, options);

          contentReady(_this3, function () {
            animator[action](_this3, function () {
              !shouldShow && _this3._toggleStyle(false, options);
              _this3._visible = shouldShow;

              unlock();

              util.propagateAction(_this3, '_' + action);
              util.triggerElementEvent(_this3, 'post' + action, defineProperty({}, _this3._selfCamelName, _this3)); // postshow posthide

              if (options.callback instanceof Function) {
                options.callback(_this3);
              }

              resolve(_this3);
            });
          });
        });
      });
    }
  }, {
    key: '_updateMask',
    value: function _updateMask() {
      var _this4 = this;

      contentReady(this, function () {
        if (_this4._mask && _this4.getAttribute('mask-color')) {
          _this4._mask.style.backgroundColor = _this4.getAttribute('mask-color');
        }
      });
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this5 = this;

      this.onDeviceBackButton = this._defaultDBB.bind(this);

      contentReady(this, function () {
        _this5._mask && _this5._mask.addEventListener('click', _this5._boundCancel, false);
      });
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this._backButtonHandler.destroy();
      this._backButtonHandler = null;

      this._mask && this._mask.removeEventListener('click', this._boundCancel.bind(this), false);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, this._scheme);
          break;
        case 'animation':
          this._animatorFactory = this._updateAnimatorFactory();
          break;
        case 'mask-color':
          this._updateMask();
          break;
      }
    }
  }, {
    key: 'onDeviceBackButton',
    get: function get$$1() {
      return this._backButtonHandler;
    },
    set: function set(callback) {
      if (this._backButtonHandler) {
        this._backButtonHandler.destroy();
      }

      this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
    }
  }, {
    key: 'visible',
    get: function get$$1() {
      return this._visible;
    }
  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }
  }, {
    key: 'cancelable',
    set: function set(value) {
      return util.toggleAttribute(this, 'cancelable', value);
    },
    get: function get$$1() {
      return this.hasAttribute('cancelable');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'animation', 'mask-color'];
    }
  }, {
    key: 'events',
    get: function get$$1() {
      return ['preshow', 'postshow', 'prehide', 'posthide', 'dialog-cancel'];
    }
  }]);
  return BaseDialogElement;
}(BaseElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme = {
  '.action-sheet': 'action-sheet--*',
  '.action-sheet-mask': 'action-sheet-mask--*',
  '.action-sheet-title': 'action-sheet-title--*'
};

var _animatorDict = {
  'default': function _default() {
    return platform$1.isAndroid() ? MDActionSheetAnimator : IOSActionSheetAnimator;
  },
  'none': ActionSheetAnimator
};

/**
 * @element ons-action-sheet
 * @category dialog
 * @description
 *   [en]
 *     Action/bottom sheet that is displayed on top of current screen.
 *
 *     This element can either be attached directly to the `<body>` or dynamically created from a template using the `ons.createElement(template, { append: true })` utility function and the `<ons-template>` tag.
 *
 *     The action sheet is useful for displaying a list of options and asking the user to make a decision. A `ons-action-sheet-button` is provided for this purpose, although it can contain any type of content.
 *
 *     It will automatically be displayed as Material Design (bottom sheet) when running on an Android device.
 *   [/en]
 *   [ja][/ja]
 * @modifier material
 *   [en]Display a Material Design bottom sheet.[/en]
 *   [ja][/ja]
 * @tutorial vanilla/reference/action-sheet
 * @guide dialogs
 *   [en]Dialog components[/en]
 *   [ja]Dialog components[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @seealso ons-popover
 *   [en]`<ons-popover>` component[/en]
 *   [ja]ons-popoverコンポーネント[/ja]
 * @seealso ons-modal
 *   [en]`<ons-modal>` component[/en]
 *   [ja]ons-modalコンポーネント[/ja]
 * @example
 * <ons-action-sheet id="sheet">
 *   <ons-action-sheet-button>Label</ons-action-sheet-button>
 *   <ons-action-sheet-button>Label</ons-action-sheet-button>
 * </ons-action-sheet>
 *
 * <script>
 *   document.getElementById('sheet').show();
 * </script>
 */

var ActionSheetElement = function (_BaseDialogElement) {
  inherits(ActionSheetElement, _BaseDialogElement);

  /**
   * @event preshow
   * @description
   * [en]Fired just before the action sheet is displayed.[/en]
   * [ja]ダイアログが表示される直前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.actionSheet
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Execute this function to stop the action sheet from being shown.[/en]
   *   [ja]この関数を実行すると、ダイアログの表示がキャンセルされます。[/ja]
   */

  /**
   * @event postshow
   * @description
   * [en]Fired just after the action sheet is displayed.[/en]
   * [ja]ダイアログが表示された直後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.actionSheet
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @event prehide
   * @description
   * [en]Fired just before the action sheet is hidden.[/en]
   * [ja]ダイアログが隠れる直前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.actionSheet
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Execute this function to stop the action sheet from being hidden.[/en]
   *   [ja]この関数を実行すると、ダイアログの非表示がキャンセルされます。[/ja]
   */

  /**
   * @event posthide
   * @description
   * [en]Fired just after the action sheet is hidden.[/en]
   * [ja]ダイアログが隠れた後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.actionSheet
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @attribute title
   * @type {String}
   * @description
   *  [en]Optional title of the action sheet. A new element will be created containing this string.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *  [en]The appearance of the action sheet.[/en]
   *  [ja]ダイアログの表現を指定します。[/ja]
   */

  /**
   * @attribute cancelable
   * @description
   *  [en]If this attribute is set the action sheet can be closed by tapping the background or by pressing the back button on Android devices.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute disabled
   * @description
   *  [en]If this attribute is set the action sheet is disabled.[/en]
   *  [ja]この属性がある時、ダイアログはdisabled状態になります。[/ja]
   */

  /**
   * @attribute animation
   * @type {String}
   * @default default
   * @description
   *  [en]The animation used when showing and hiding the action sheet. Can be either `"none"` or `"default"`.[/en]
   *  [ja]ダイアログを表示する際のアニメーション名を指定します。"none"もしくは"default"を指定できます。[/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`[/ja]
   */

  /**
   * @attribute mask-color
   * @type {String}
   * @default rgba(0, 0, 0, 0.2)
   * @description
   *  [en]Color of the background mask. Default is `"rgba(0, 0, 0, 0.2)"`.[/en]
   *  [ja]背景のマスクの色を指定します。"rgba(0, 0, 0, 0.2)"がデフォルト値です。[/ja]
   */

  function ActionSheetElement() {
    classCallCheck(this, ActionSheetElement);

    var _this = possibleConstructorReturn(this, (ActionSheetElement.__proto__ || Object.getPrototypeOf(ActionSheetElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  createClass(ActionSheetElement, [{
    key: '_updateAnimatorFactory',
    value: function _updateAnimatorFactory() {
      return new AnimatorFactory({
        animators: _animatorDict,
        baseClass: ActionSheetAnimator,
        baseClassName: 'ActionSheetAnimator',
        defaultAnimation: this.getAttribute('animation')
      });
    }
  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.style.display = 'none';
      this.style.zIndex = 10001;

      /* Expected result:
       *   <ons-action-sheet>
       *     <div class="action-sheet-mask"></div>
       *     <div class="action-sheet">
       *       <div class="action-sheet-title></div>
       *       ...
       *     </div>
       *   </ons-action-sheet>
       */

      if (!this._sheet) {
        var sheet = document.createElement('div');
        sheet.classList.add('action-sheet');

        while (this.firstChild) {
          sheet.appendChild(this.firstChild);
        }

        this.appendChild(sheet);
      }

      if (!this._title && this.hasAttribute('title')) {
        var title = document.createElement('div');
        title.innerHTML = this.getAttribute('title');
        title.classList.add('action-sheet-title');
        this._sheet.insertBefore(title, this._sheet.firstChild);
      }

      if (!this._mask) {
        var mask = document.createElement('div');
        mask.classList.add('action-sheet-mask');
        this.insertBefore(mask, this.firstChild);
      }

      this._sheet.style.zIndex = 20001;
      this._mask.style.zIndex = 20000;

      ModifierUtil.initModifier(this, this._scheme);
    }
  }, {
    key: '_updateTitle',
    value: function _updateTitle() {
      if (this._title) {
        this._title.innerHTML = this.getAttribute('title');
      }
    }

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

    /**
     * @method show
     * @signature show([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"none"` and `"slide"`.[/en]
     *   [ja]アニメーション名を指定します。"none", "slide"のいずれかを指定します。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}` [/ja]
     * @param {Function} [options.callback]
     *   [en]This function is called after the action sheet has been revealed.[/en]
     *   [ja]ダイアログが表示され終わった後に呼び出される関数オブジェクトを指定します。[/ja]
     * @description
     *  [en]Show the action sheet.[/en]
     *  [ja]ダイアログを開きます。[/ja]
     * @return {Promise} Resolves to the displayed element.
     */

    /**
     * @method hide
     * @signature hide([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"none"` and `"slide"`.[/en]
     *   [ja]アニメーション名を指定します。"none", "slide"のいずれかを指定できます。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`[/ja]
     * @param {Function} [options.callback]
     *   [en]This functions is called after the action sheet has been hidden.[/en]
     *   [ja]ダイアログが隠れた後に呼び出される関数オブジェクトを指定します。[/ja]
     * @description
     *   [en]Hide the action sheet.[/en]
     *   [ja]ダイアログを閉じます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the hidden element[/en]
     *   [ja][/ja]
     */

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the action sheet is visible or not.[/en]
     *   [ja]要素が見える場合に`true`。[/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the action sheet is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

    /**
     * @property cancelable
     * @type {Boolean}
     * @description
     *   [en]Whether the action sheet is cancelable or not. A cancelable action sheet can be closed by tapping the background or by pressing the back button on Android devices.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'title') {
        this._updateTitle();
      } else {
        get(ActionSheetElement.prototype.__proto__ || Object.getPrototypeOf(ActionSheetElement.prototype), 'attributeChangedCallback', this).call(this, name, last, current);
      }
    }

    /**
     * @param {String} name
     * @param {ActionSheetAnimator} Animator
     */

  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme;
    }
  }, {
    key: '_mask',
    get: function get$$1() {
      return util.findChild(this, '.action-sheet-mask');
    }
  }, {
    key: '_sheet',
    get: function get$$1() {
      return util.findChild(this, '.action-sheet');
    }
  }, {
    key: '_title',
    get: function get$$1() {
      return this.querySelector('.action-sheet-title');
    }
  }], [{
    key: 'registerAnimator',
    value: function registerAnimator(name, Animator) {
      if (!(Animator.prototype instanceof ActionSheetAnimator)) {
        throw new Error('"Animator" param must inherit OnsActionSheetElement.ActionSheetAnimator');
      }
      _animatorDict[name] = Animator;
    }
  }, {
    key: 'observedAttributes',
    get: function get$$1() {
      return [].concat(toConsumableArray(get(ActionSheetElement.__proto__ || Object.getPrototypeOf(ActionSheetElement), 'observedAttributes', this)), ['title']);
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict;
    }
  }, {
    key: 'ActionSheetAnimator',
    get: function get$$1() {
      return ActionSheetAnimator;
    }
  }]);
  return ActionSheetElement;
}(BaseDialogElement);

customElements.define('ons-action-sheet', ActionSheetElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName = 'action-sheet-button';
var scheme$1 = {
  '': 'action-sheet-button--*',
  '.action-sheet-icon': 'action-sheet-icon--*'
};

/**
 * @element ons-action-sheet-button
 * @category dialog
 * @modifier destructive
 *   [en]Shows a "destructive" button (only for iOS).[/en]
 *   [ja][/ja]
 * @description
 *   [en]Component that represent each button of the action sheet.[/en]
 *   [ja][/ja]
 * @seealso ons-action-sheet
 *   [en]The `<ons-action-sheet>` component[/en]
 *   [ja]ons-action-sheetコンポーネント[/ja]
 * @seealso ons-list-item
 *   [en]The `<ons-list-item>` component[/en]
 *   [ja]ons-list-itemコンポーネント[/ja]
 * @seealso ons-icon
 *   [en]The `<ons-icon>` component[/en]
 *   [ja]ons-iconコンポーネント[/ja]
 * @guide lists [en]Using lists[/en][ja]リストを使う[/ja]
 * @tutorial vanilla/Reference/action-sheet
 * @modifier material
 *   [en]Display a Material Design action sheet button.[/en]
 *   [ja][/ja]
 * @example
 * <ons-action-sheet id="sheet">
 *   <ons-action-sheet-button>Label</ons-action-sheet-button>
 *   <ons-action-sheet-button>Label</ons-action-sheet-button>
 * </ons-action-sheet>
 *
 * <script>
 *   document.getElementById('sheet').show();
 * </script>
 */

var ActionSheetButtonElement = function (_BaseElement) {
  inherits(ActionSheetButtonElement, _BaseElement);

  /**
   * @attribute icon
   * @type {String}
   * @description
   *  [en]Creates an `ons-icon` component with this string. Only visible on Android.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the action sheet button.[/en]
   *   [ja][/ja]
   */

  function ActionSheetButtonElement() {
    classCallCheck(this, ActionSheetButtonElement);

    var _this = possibleConstructorReturn(this, (ActionSheetButtonElement.__proto__ || Object.getPrototypeOf(ActionSheetButtonElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  createClass(ActionSheetButtonElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);
      this.classList.add(defaultClassName);

      if (!this._icon && this.hasAttribute('icon')) {
        var icon = util.createElement('<ons-icon icon="' + this.getAttribute('icon') + '"></ons-icon>');
        icon.classList.add('action-sheet-icon');
        this.insertBefore(icon, this.firstChild);
      }

      ModifierUtil.initModifier(this, scheme$1);
    }
  }, {
    key: '_updateIcon',
    value: function _updateIcon() {
      if (this._icon) {
        this._icon.setAttribute('icon', this.getAttribute('icon'));
      }
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName)) {
            this.className = defaultClassName + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$1);
          break;
        case 'icon':
          this._updateIcon();
          break;
      }
    }
  }, {
    key: '_icon',
    get: function get$$1() {
      return util.findChild(this, '.action-sheet-icon');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class', 'icon'];
    }
  }]);
  return ActionSheetButtonElement;
}(BaseElement);

customElements.define('ons-action-sheet-button', ActionSheetButtonElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var AlertDialogAnimator = function (_BaseAnimator) {
  inherits(AlertDialogAnimator, _BaseAnimator);

  function AlertDialogAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.2 : _ref$duration;

    classCallCheck(this, AlertDialogAnimator);
    return possibleConstructorReturn(this, (AlertDialogAnimator.__proto__ || Object.getPrototypeOf(AlertDialogAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} dialog
   * @param {Function} done
   */


  createClass(AlertDialogAnimator, [{
    key: 'show',
    value: function show(dialog, done) {
      done();
    }

    /**
     * @param {HTMLElement} dialog
     * @param {Function} done
     */

  }, {
    key: 'hide',
    value: function hide(dialog, done) {
      done();
    }
  }]);
  return AlertDialogAnimator;
}(BaseAnimator);

/**
 * Android style animator for alert dialog.
 */
var AndroidAlertDialogAnimator = function (_AlertDialogAnimator) {
  inherits(AndroidAlertDialogAnimator, _AlertDialogAnimator);

  function AndroidAlertDialogAnimator() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$timing = _ref2.timing,
        timing = _ref2$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref2$timing,
        _ref2$duration = _ref2.duration,
        duration = _ref2$duration === undefined ? 0.2 : _ref2$duration,
        _ref2$delay = _ref2.delay,
        delay = _ref2$delay === undefined ? 0 : _ref2$delay;

    classCallCheck(this, AndroidAlertDialogAnimator);
    return possibleConstructorReturn(this, (AndroidAlertDialogAnimator.__proto__ || Object.getPrototypeOf(AndroidAlertDialogAnimator)).call(this, { duration: duration, timing: timing, delay: delay }));
  }

  /**
   * @param {Object} dialog
   * @param {Function} callback
   */


  createClass(AndroidAlertDialogAnimator, [{
    key: 'show',
    value: function show(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0) scale3d(0.9, 0.9, 1.0)',
          opacity: 0.0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
          opacity: 1.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 1.0
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
          opacity: 1.0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0) scale3d(0.9, 0.9, 1.0)',
          opacity: 0.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }
  }]);
  return AndroidAlertDialogAnimator;
}(AlertDialogAnimator);

/**
 * iOS style animator for alert dialog.
 */
var IOSAlertDialogAnimator = function (_AlertDialogAnimator2) {
  inherits(IOSAlertDialogAnimator, _AlertDialogAnimator2);

  function IOSAlertDialogAnimator() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref3$timing = _ref3.timing,
        timing = _ref3$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref3$timing,
        _ref3$duration = _ref3.duration,
        duration = _ref3$duration === undefined ? 0.2 : _ref3$duration,
        _ref3$delay = _ref3.delay,
        delay = _ref3$delay === undefined ? 0 : _ref3$delay;

    classCallCheck(this, IOSAlertDialogAnimator);
    return possibleConstructorReturn(this, (IOSAlertDialogAnimator.__proto__ || Object.getPrototypeOf(IOSAlertDialogAnimator)).call(this, { duration: duration, timing: timing, delay: delay }));
  }

  /*
   * @param {Object} dialog
   * @param {Function} callback
   */


  createClass(IOSAlertDialogAnimator, [{
    key: 'show',
    value: function show(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0) scale3d(1.3, 1.3, 1.0)',
          opacity: 0.0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
          opacity: 1.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 1.0
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          opacity: 1.0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          opacity: 0.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }
  }]);
  return IOSAlertDialogAnimator;
}(AlertDialogAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$2 = {
  '.alert-dialog': 'alert-dialog--*',
  '.alert-dialog-container': 'alert-dialog-container--*',
  '.alert-dialog-title': 'alert-dialog-title--*',
  '.alert-dialog-content': 'alert-dialog-content--*',
  '.alert-dialog-footer': 'alert-dialog-footer--*',
  '.alert-dialog-footer--rowfooter': 'alert-dialog-footer--rowfooter--*',
  '.alert-dialog-button--rowfooter': 'alert-dialog-button--rowfooter--*',
  '.alert-dialog-button--primal': 'alert-dialog-button--primal--*',
  '.alert-dialog-button': 'alert-dialog-button--*',
  'ons-alert-dialog-button': 'alert-dialog-button--*',
  '.alert-dialog-mask': 'alert-dialog-mask--*',
  '.text-input': 'text-input--*'
};

var _animatorDict$1 = {
  'none': AlertDialogAnimator,
  'default': function _default() {
    return platform$1.isAndroid() ? AndroidAlertDialogAnimator : IOSAlertDialogAnimator;
  },
  'fade': function fade() {
    return platform$1.isAndroid() ? AndroidAlertDialogAnimator : IOSAlertDialogAnimator;
  }
};

/**
 * @element ons-alert-dialog
 * @category dialog
 * @description
 *   [en]
 *     Alert dialog that is displayed on top of the current screen. Useful for displaying questions, warnings or error messages to the user. The title, content and buttons can be easily customized and it will automatically switch style based on the platform.
 *
 *     To use the element it can either be attached directly to the `<body>` element or dynamically created from a template using the `ons.createAlertDialog(template)` utility function and the `<ons-template>` tag.
 *   [/en]
 *   [ja][/ja]
 * @codepen Qwwxyp
 * @tutorial vanilla/Reference/dialog
 * @modifier material
 *   [en]Material Design style[/en]
 *   [ja][/ja]
 * @modifier rowfooter
 *   [en]Horizontally aligns the footer buttons.[/en]
 *   [ja][/ja]
 * @guide dialogs
 *   [en]Dialog components[/en]
 *   [ja]Dialog components[/ja]
 * @seealso ons-dialog
 *   [en]ons-dialog component[/en]
 *   [ja]ons-dialogコンポーネント[/ja]
 * @seealso ons-popover
 *   [en]ons-popover component[/en]
 *   [ja]ons-dialogコンポーネント[/ja]
 * @seealso ons.notification
 *   [en]Using ons.notification utility functions.[/en]
 *   [ja]アラートダイアログを表示するには、ons.notificationオブジェクトのメソッドを使うこともできます。[/ja]
 * @example
 * <ons-alert-dialog id="alert-dialog">
 *   <div class="alert-dialog-title">Warning!</div>
 *   <div class="alert-dialog-content">
 *     An error has occurred!
 *   </div>
 *   <div class="alert-dialog-footer">
 *     <button id="alert-dialog-button" class="alert-dialog-button">OK</button>
 *   </div>
 * </ons-alert-dialog>
 * <script>
 *   document.getElementById('alert-dialog').show();
 * </script>
 */

var AlertDialogElement = function (_BaseDialogElement) {
  inherits(AlertDialogElement, _BaseDialogElement);

  /**
   * @event preshow
   * @description
   *   [en]Fired just before the alert dialog is displayed.[/en]
   *   [ja]アラートダイアログが表示される直前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.alertDialog
   *   [en]Alert dialog object.[/en]
   *   [ja]アラートダイアログのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Execute to stop the dialog from showing.[/en]
   *   [ja]この関数を実行すると、アラートダイアログの表示を止めます。[/ja]
   */

  /**
   * @event postshow
   * @description
   *   [en]Fired just after the alert dialog is displayed.[/en]
   *   [ja]アラートダイアログが表示された直後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.alertDialog
   *   [en]Alert dialog object.[/en]
   *   [ja]アラートダイアログのオブジェクト。[/ja]
   */

  /**
   * @event prehide
   * @description
   *   [en]Fired just before the alert dialog is hidden.[/en]
   *   [ja]アラートダイアログが隠れる直前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.alertDialog
   *   [en]Alert dialog object.[/en]
   *   [ja]アラートダイアログのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Execute to stop the dialog from hiding.[/en]
   *   [ja]この関数を実行すると、アラートダイアログが閉じようとするのを止めます。[/ja]
   */

  /**
   * @event posthide
   * @description
   * [en]Fired just after the alert dialog is hidden.[/en]
   * [ja]アラートダイアログが隠れた後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.alertDialog
   *   [en]Alert dialog object.[/en]
   *   [ja]アラートダイアログのオブジェクト。[/ja]
   */

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *  [en]The appearance of the dialog.[/en]
   *  [ja]ダイアログの見た目を指定します。[/ja]
   */

  /**
   * @attribute cancelable
   * @description
   *  [en]If this attribute is set the dialog can be closed by tapping the background or by pressing the back button on Android devices.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute disabled
   * @description
   *  [en]If this attribute is set the dialog is disabled.[/en]
   *  [ja]この属性がある時、アラートダイアログはdisabled状態になります。[/ja]
   */

  /**
   * @attribute animation
   * @type {String}
   * @default default
   * @description
   *  [en]The animation used when showing and hiding the dialog. Can be either `"none"` or `"default"`.[/en]
   *  [ja]ダイアログを表示する際のアニメーション名を指定します。デフォルトでは"none"か"default"が指定できます。[/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。例：{duration: 0.2, delay: 1, timing: 'ease-in'}[/ja]
   */

  /**
   * @attribute mask-color
   * @type {String}
   * @default rgba(0, 0, 0, 0.2)
   * @description
   *  [en]Color of the background mask. Default is "rgba(0, 0, 0, 0.2)".[/en]
   *  [ja]背景のマスクの色を指定します。"rgba(0, 0, 0, 0.2)"がデフォルト値です。[/ja]
   */

  function AlertDialogElement() {
    classCallCheck(this, AlertDialogElement);

    var _this = possibleConstructorReturn(this, (AlertDialogElement.__proto__ || Object.getPrototypeOf(AlertDialogElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  createClass(AlertDialogElement, [{
    key: '_updateAnimatorFactory',
    value: function _updateAnimatorFactory() {
      return new AnimatorFactory({
        animators: _animatorDict$1,
        baseClass: AlertDialogAnimator,
        baseClassName: 'AlertDialogAnimator',
        defaultAnimation: this.getAttribute('animation')
      });
    }
  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.style.display = 'none';
      this.style.zIndex = 10001;

      /**
       * Expected result after compile:
       *
       * <ons-alert-dialog style="none">
       *   <div class="alert-dialog-mask"></div>
       *   <div class="alert-dialog">
       *     <div class="alert-dialog-container">...</div>
       *   </div>
       * </ons-alert-dialog>
       */

      var content = document.createDocumentFragment();

      if (!this._mask && !this._dialog) {
        while (this.firstChild) {
          content.appendChild(this.firstChild);
        }
      }

      if (!this._mask) {
        var mask = document.createElement('div');
        mask.classList.add('alert-dialog-mask');
        this.insertBefore(mask, this.children[0]);
      }

      if (!this._dialog) {
        var dialog = document.createElement('div');
        dialog.classList.add('alert-dialog');
        this.insertBefore(dialog, null);
      }

      if (!util.findChild(this._dialog, '.alert-dialog-container')) {
        var container = document.createElement('div');
        container.classList.add('alert-dialog-container');
        this._dialog.appendChild(container);
      }

      this._dialog.children[0].appendChild(content);

      this._dialog.style.zIndex = 20001;
      this._mask.style.zIndex = 20000;

      ModifierUtil.initModifier(this, this._scheme);
    }

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

    /**
     * @property cancelable
     * @type {Boolean}
     * @description
     *   [en]Whether the dialog is cancelable or not. A cancelable dialog can be closed by tapping the background or by pressing the back button on Android devices.[/en]
     *   [ja][/ja]
     */

    /**
     * @method show
     * @signature show([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクトです。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"fade"` and `"none"`.[/en]
     *   [ja]アニメーション名を指定します。指定できるのは、"fade", "none"のいずれかです。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g.  `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
     * @param {Function} [options.callback]
     *   [en]Function to execute after the dialog has been revealed.[/en]
     *   [ja]ダイアログが表示され終わった時に呼び出されるコールバックを指定します。[/ja]
     * @description
     *   [en]Show the alert dialog.[/en]
     *   [ja]ダイアログを表示します。[/ja]
     * @return {Promise}
     *   [en]A `Promise` object that resolves to the displayed element.[/en]
     *   [ja][/ja]
     */

    /**
     * @method hide
     * @signature hide([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"fade"` and `"none"`.[/en]
     *   [ja]アニメーション名を指定します。"fade", "none"のいずれかを指定します。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g.  <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code>[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. <code>{duration: 0.2, delay: 0.4, timing: 'ease-in'}</code> [/ja]
     * @param {Function} [options.callback]
     *   [en]Function to execute after the dialog has been hidden.[/en]
     *   [ja]このダイアログが閉じた時に呼び出されるコールバックを指定します。[/ja]
     * @description
     *   [en]Hide the alert dialog.[/en]
     *   [ja]ダイアログを閉じます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the hidden element[/en]
     *   [ja][/ja]
     */

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the dialog is visible or not.[/en]
     *   [ja]要素が見える場合に`true`。[/ja]
     */

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

    /**
     * @param {String} name
     * @param {DialogAnimator} Animator
     */

  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme$2;
    }

    /**
     * @return {Element}
     */

  }, {
    key: '_mask',
    get: function get$$1() {
      return util.findChild(this, '.alert-dialog-mask');
    }

    /**
     * @return {Element}
     */

  }, {
    key: '_dialog',
    get: function get$$1() {
      return util.findChild(this, '.alert-dialog');
    }

    /**
     * @return {Element}
     */

  }, {
    key: '_titleElement',
    get: function get$$1() {
      return util.findChild(this._dialog.children[0], '.alert-dialog-title');
    }

    /**
     * @return {Element}
     */

  }, {
    key: '_contentElement',
    get: function get$$1() {
      return util.findChild(this._dialog.children[0], '.alert-dialog-content');
    }
  }], [{
    key: 'registerAnimator',
    value: function registerAnimator(name, Animator) {
      if (!(Animator.prototype instanceof AlertDialogAnimator)) {
        throw new Error('"Animator" param must inherit OnsAlertDialogElement.AlertDialogAnimator');
      }
      _animatorDict$1[name] = Animator;
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict$1;
    }
  }, {
    key: 'AlertDialogAnimator',
    get: function get$$1() {
      return AlertDialogAnimator;
    }
  }]);
  return AlertDialogElement;
}(BaseDialogElement);

customElements.define('ons-alert-dialog', AlertDialogElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$1 = 'alert-dialog-button';

var scheme$3 = { '': 'alert-dialog-button--*' };

/**
 * @element ons-alert-dialog-button
 * @modifier material
 *   [en]Material Design alert-dialog button.[/en]
 *   [ja][/ja]
 * @description
 *   [en][/en]
 *   [ja][/ja]
 * @seealso ons-alert-dialog
 *   [en]The `<ons-alert-dialog>` component displays a alert dialog.[/en]
 *   [ja]ons-alert-dialogコンポーネント[/ja]
 * @example
 *  <ons-alert-dialog>
 *    <div class="alert-dialog-title">Warning!</div>
 *    <div class="alert-dialog-content">
 *      An error has occurred!
 *    </div>
 *    <div class="alert-dialog-footer">
 *      <alert-dialog-button onclick="app.close()">Cancel</alert-dialog-button>
 *      <alert-dialog-button class="alert-dialog-button" onclick="app.close()">OK</alert-dialog-button>
 *    </div>
 *  </ons-alert-dialog>
 */

var AlertDialogButtonElement = function (_BaseElement) {
  inherits(AlertDialogButtonElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the button.[/en]
   *   [ja]ボタンの表現を指定します。[/ja]
   */

  /**
   * @attribute disabled
   * @description
   *   [en]Specify if button should be disabled.[/en]
   *   [ja]ボタンを無効化する場合は指定してください。[/ja]
   */

  function AlertDialogButtonElement() {
    classCallCheck(this, AlertDialogButtonElement);

    var _this = possibleConstructorReturn(this, (AlertDialogButtonElement.__proto__ || Object.getPrototypeOf(AlertDialogButtonElement)).call(this));

    _this._compile();
    return _this;
  }

  /**
   * @property disabled
   * @type {Boolean}
   * @description
   *   [en]Whether the element is disabled or not.[/en]
   *   [ja]無効化されている場合に`true`。[/ja]
   */


  createClass(AlertDialogButtonElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.classList.add(defaultClassName$1);

      util.updateRipple(this, undefined, { 'modifier': 'light-gray' });

      ModifierUtil.initModifier(this, scheme$3);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$1)) {
            this.className = defaultClassName$1 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$3);
          break;
      }
    }
  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return AlertDialogButtonElement;
}(BaseElement);

customElements.define('ons-alert-dialog-button', AlertDialogButtonElement);

var iosBackButtonIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTNweCIgaGVpZ2h0PSIyMXB4IiB2aWV3Qm94PSIwIDAgMTMgMjEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjIgKDM5MDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5pb3MtYmFjay1idXR0b24taWNvbjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJ0b29sYmFyLWJhY2stYnV0dG9uIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iaW9zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzQuMDAwMDAwLCAtMzAuMDAwMDAwKSIgZmlsbD0iIzAwMDAwMCI+CiAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJpb3MtYmFjay1idXR0b24taWNvbiIgcG9pbnRzPSIzNCA0MC41IDQ0LjUgMzAgNDYuNSAzMiAzOCA0MC41IDQ2LjUgNDkgNDQuNSA1MSI+PC9wb2x5Z29uPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';

var mdBackButtonIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjIgKDM5MDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5tZC1iYWNrLWJ1dHRvbi1pY29uPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9InRvb2xiYXItYmFjay1idXR0b24iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJhbmRyb2lkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzIuMDAwMDAwLCAtMzIuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIiBmaWxsPSIjMDAwMDAwIj4KICAgICAgICAgICAgPHBvbHlnb24gaWQ9Im1kLWJhY2stYnV0dG9uLWljb24iIHBvaW50cz0iNDggMzkgMzUuODMgMzkgNDEuNDIgMzMuNDEgNDAgMzIgMzIgNDAgNDAgNDggNDEuNDEgNDYuNTkgMzUuODMgNDEgNDggNDEiPjwvcG9seWdvbj4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==';

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$2 = 'back-button';

var scheme$4 = {
  '': 'back-button--*',
  '.back-button__icon': 'back-button--*__icon',
  '.back-button__label': 'back-button--*__label'
};

/**
 * @element ons-back-button
 * @category navigation
 * @description
 *   [en]
 *     Back button component for `<ons-toolbar>`. Put it in the left part of the `<ons-toolbar>`.
 *
 *     It will find the parent `<ons-navigator>` element and pop a page when clicked. This behavior can be overriden by specifying the `onClick` property.
 *   [/en]
 *   [ja][/ja]
 * @codepen aHmGL
 * @tutorial vanilla/Reference/navigator
 * @modifier material
 *   [en]Material Design style[/en]
 *   [ja][/ja]
 * @seealso ons-toolbar
 *   [en]ons-toolbar component[/en]
 *   [ja]ons-toolbarコンポーネント[/ja]
 * @seealso ons-navigator
 *   [en]ons-navigator component[/en]
 *   [ja]ons-navigatorコンポーネント[/ja]
 * @example
 * <ons-toolbar>
 *   <div class="left">
 *     <ons-back-button>Back</ons-back-button>
 *   </div>
 *   <div class="center">
 *     Title
 *   <div>
 * </ons-toolbar>
 */

var BackButtonElement = function (_BaseElement) {
  inherits(BackButtonElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *  [en]The appearance of the back button.[/en]
   *  [ja]バックボタンの見た目を指定します。[/ja]
   */

  function BackButtonElement() {
    classCallCheck(this, BackButtonElement);

    var _this = possibleConstructorReturn(this, (BackButtonElement.__proto__ || Object.getPrototypeOf(BackButtonElement)).call(this));

    contentReady(_this, function () {
      _this._compile();
    });

    _this._options = {};
    _this._boundOnClick = _this._onClick.bind(_this);
    return _this;
  }

  createClass(BackButtonElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.classList.add(defaultClassName$2);

      if (!util.findChild(this, '.back-button__label')) {
        var label = util.create('span.back-button__label');

        while (this.childNodes[0]) {
          label.appendChild(this.childNodes[0]);
        }
        this.appendChild(label);
      }

      if (!util.findChild(this, '.back-button__icon')) {
        var icon = util.create('span.back-button__icon');
        icon.innerHTML = autoStyle.caseOf(this, {
          ios: iosBackButtonIcon,
          android: mdBackButtonIcon,
          default: iosBackButtonIcon
        });

        this.insertBefore(icon, this.children[0]);
      }

      util.updateRipple(this, undefined, { center: '', 'size': 'contain', 'background': 'transparent' });

      ModifierUtil.initModifier(this, scheme$4);
    }

    /**
     * @property options
     * @type {Object}
     * @description
     *   [en]Options object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     */

    /**
     * @property options.animation
     * @type {String}
     * @description
     *   [en]Animation name. Available animations are "slide", "lift", "fade" and "none".
     *     These are platform based animations. For fixed animations, add "-ios" or "-md"
     *     suffix to the animation name. E.g. "lift-ios", "lift-md". Defaults values are "slide-ios" and "fade-md".
     *   [/en]
     *   [ja][/ja]
     */

    /**
     * @property options.animationOptions
     * @type {String}
     * @description
     *   [en]Specify the animation's duration, delay and timing. E.g.  `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}` [/ja]
     */

    /**
     * @property options.callback
     * @type {String}
     * @description
     *   [en]Function that is called when the transition has ended.[/en]
     *   [ja]このメソッドによる画面遷移が終了した際に呼び出される関数オブジェクトを指定します。[/ja]
     */

    /**
     * @property options.refresh
     * @description
     *   [en]The previous page will be refreshed (destroyed and created again) before popPage action.[/en]
     *   [ja]popPageする前に、前にあるページを生成しなおして更新する場合にtrueを指定します。[/ja]
     */

  }, {
    key: '_onClick',


    /**
     * @property onClick
     * @type {Function}
     * @description
     *   [en]Used to override the default back button behavior.[/en]
     *   [ja][/ja]
     */
    value: function _onClick() {
      if (this.onClick) {
        this.onClick.apply(this);
      } else {
        var navigator = util.findParent(this, 'ons-navigator');
        if (navigator) {
          navigator.popPage(this.options);
        }
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this.addEventListener('click', this._boundOnClick, false);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$2)) {
            this.className = defaultClassName$2 + ' ' + current;
          }
          break;

        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$4);
          break;
      }
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this.removeEventListener('click', this._boundOnClick, false);
    }
  }, {
    key: 'show',
    value: function show() {
      this.style.display = 'inline-block';
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.style.display = 'none';
    }
  }, {
    key: 'options',
    get: function get$$1() {
      return this._options;
    },
    set: function set(object) {
      this._options = object;
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return BackButtonElement;
}(BaseElement);

customElements.define('ons-back-button', BackButtonElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$3 = 'bottom-bar';
var scheme$5 = { '': 'bottom-bar--*' };

/**
 * @element ons-bottom-toolbar
 * @category page
 * @description
 *   [en]Toolbar component that is positioned at the bottom of the page.[/en]
 *   [ja]ページ下部に配置されるツールバー用コンポーネントです。[/ja]
 * @modifier transparent
 *   [en]Make the toolbar transparent.[/en]
 *   [ja]ツールバーの背景を透明にして表示します。[/ja]
 * @seealso ons-toolbar [en]ons-toolbar component[/en][ja]ons-toolbarコンポーネント[/ja]
 * @example
 * <ons-bottom-toolbar>
 *   Content
 * </ons-bottom-toolbar>
 */

var BottomToolbarElement = function (_BaseElement) {
  inherits(BottomToolbarElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the toolbar.[/en]
   *   [ja]ツールバーの見た目の表現を指定します。[/ja]
   */

  function BottomToolbarElement() {
    classCallCheck(this, BottomToolbarElement);

    var _this = possibleConstructorReturn(this, (BottomToolbarElement.__proto__ || Object.getPrototypeOf(BottomToolbarElement)).call(this));

    _this.classList.add(defaultClassName$3);
    ModifierUtil.initModifier(_this, scheme$5);
    return _this;
  }

  createClass(BottomToolbarElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      if (util.match(this.parentNode, 'ons-page')) {
        this.parentNode.classList.add('page-with-bottom-toolbar');
      }
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$3)) {
            this.className = defaultClassName$3 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$5);
          break;
      }
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return BottomToolbarElement;
}(BaseElement);

customElements.define('ons-bottom-toolbar', BottomToolbarElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$6 = { '': 'button--*' };

var defaultClassName$4 = 'button';

/**
 * @element ons-button
 * @category form
 * @modifier outline
 *   [en]Button with outline and transparent background[/en]
 *   [ja]アウトラインを持ったボタンを表示します。[/ja]
 * @modifier light
 *   [en]Button that doesn't stand out.[/en]
 *   [ja]目立たないボタンを表示します。[/ja]
 * @modifier quiet
 *   [en]Button with no outline and or background..[/en]
 *   [ja]枠線や背景が無い文字だけのボタンを表示します。[/ja]
 * @modifier cta
 *   [en]Button that really stands out.[/en]
 *   [ja]目立つボタンを表示します。[/ja]
 * @modifier large
 *   [en]Large button that covers the width of the screen.[/en]
 *   [ja]横いっぱいに広がる大きなボタンを表示します。[/ja]
 * @modifier large--quiet
 *   [en]Large quiet button.[/en]
 *   [ja]横いっぱいに広がるquietボタンを表示します。[/ja]
 * @modifier large--cta
 *   [en]Large call to action button.[/en]
 *   [ja]横いっぱいに広がるctaボタンを表示します。[/ja]
 * @modifier material
 *   [en]Material Design button[/en]
 *   [ja]マテリアルデザインのボタン[/ja]
 * @modifier material--flat
 *   [en]Material Design flat button[/en]
 *   [ja]マテリアルデザインのフラットボタン[/ja]
 * @description
 *   [en]
 *     Button component. If you want to place a button in a toolbar, use `<ons-toolbar-button>` or `<ons-back-button>` instead.
 *
 *     Will automatically display as a Material Design button with a ripple effect on Android.
 *   [/en]
 *   [ja]ボタン用コンポーネント。ツールバーにボタンを設置する場合は、ons-toolbar-buttonもしくはons-back-buttonコンポーネントを使用します。[/ja]
 * @codepen hLayx
 * @tutorial vanilla/Reference/button
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @guide cross-platform-styling [en]Information about cross platform styling[/en][ja]Information about cross platform styling[/ja]
 * @example
 * <ons-button modifier="large--cta">
 *   Tap Me
 * </ons-button>
 */

var ButtonElement = function (_BaseElement) {
  inherits(ButtonElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *  [en]The appearance of the button.[/en]
   *  [ja]ボタンの表現を指定します。[/ja]
   */

  /**
   * @attribute ripple
   * @description
   *  [en]If this attribute is defined, the button will have a ripple effect.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute disabled
   * @description
   *   [en]Specify if button should be disabled.[/en]
   *   [ja]ボタンを無効化する場合は指定します。[/ja]
   */

  function ButtonElement() {
    classCallCheck(this, ButtonElement);

    var _this = possibleConstructorReturn(this, (ButtonElement.__proto__ || Object.getPrototypeOf(ButtonElement)).call(this));

    _this._compile();
    return _this;
  }

  createClass(ButtonElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$4)) {
            this.className = defaultClassName$4 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$6);
          break;
        case 'ripple':
          this._updateRipple();
      }
    }

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the button is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.classList.add(defaultClassName$4);

      this._updateRipple();

      ModifierUtil.initModifier(this, scheme$6);
    }
  }, {
    key: '_updateRipple',
    value: function _updateRipple() {
      util.updateRipple(this);
    }
  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'ripple', 'class'];
    }
  }]);
  return ButtonElement;
}(BaseElement);

customElements.define('ons-button', ButtonElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$7 = { '': 'carousel-item--*' };

/**
 * @element ons-carousel-item
 * @category carousel
 * @description
 *   [en]
 *     Carousel item component. Used as a child of the `<ons-carousel>` element.
 *   [/en]
 *   [ja][/ja]
 * @codepen xbbzOQ
 * @tutorial vanilla/Reference/carousel
 * @seealso ons-carousel
 *   [en]`<ons-carousel>` components[/en]
 *   [ja]<ons-carousel>コンポーネント[/ja]
 * @example
 * <ons-carousel style="width: 100%; height: 200px">
 *   <ons-carousel-item>
 *    ...
 *   </ons-carousel-item>
 *   <ons-carousel-item>
 *    ...
 *   </ons-carousel-item>
 * </ons-carousel>
 */

var CarouselItemElement = function (_BaseElement) {
  inherits(CarouselItemElement, _BaseElement);

  function CarouselItemElement() {
    classCallCheck(this, CarouselItemElement);

    var _this = possibleConstructorReturn(this, (CarouselItemElement.__proto__ || Object.getPrototypeOf(CarouselItemElement)).call(this));

    _this.style.width = '100%';
    ModifierUtil.initModifier(_this, scheme$7);
    return _this;
  }

  createClass(CarouselItemElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'modifier') {
        return ModifierUtil.onModifierChanged(last, current, this, scheme$7);
      }
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier'];
    }
  }]);
  return CarouselItemElement;
}(BaseElement);

customElements.define('ons-carousel-item', CarouselItemElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var VerticalModeTrait = {

  _getScrollDelta: function _getScrollDelta(event) {
    return event.gesture.deltaY;
  },

  _getScrollVelocity: function _getScrollVelocity(event) {
    return event.gesture.velocityY;
  },

  _getElementSize: function _getElementSize() {
    if (!this._currentElementSize) {
      var styling = window.getComputedStyle(this, null);
      this._currentElementSize = this.getBoundingClientRect().height - parseInt(styling.getPropertyValue('border-top-width')) - parseInt(styling.getPropertyValue('border-bottom-width'));
    }

    return this._currentElementSize;
  },

  _generateScrollTransform: function _generateScrollTransform(scroll) {
    return 'translate3d(0px, ' + -scroll + 'px, 0px)';
  },

  _updateDimensionData: function _updateDimensionData() {
    this._style = window.getComputedStyle(this);
    this._dimensions = this.getBoundingClientRect();
  },

  _updateOffset: function _updateOffset() {
    if (this.centered) {
      var height = (this._dimensions.height || 0) - parseInt(this._style.paddingTop, 10) - parseInt(this._style.paddingBottom, 10);
      this._offset = -(height - this._getCarouselItemSize()) / 2;
    }
  },

  _layoutCarouselItems: function _layoutCarouselItems() {
    var children = this._getCarouselItemElements();

    var sizeAttr = this._getCarouselItemSizeAttr();
    var sizeInfo = this._decomposeSizeString(sizeAttr);

    for (var i = 0; i < children.length; i++) {
      children[i].style.position = 'absolute';
      children[i].style.height = sizeAttr;
      children[i].style.visibility = 'visible';
      children[i].style.top = i * sizeInfo.number + sizeInfo.unit;
    }
  },

  _setup: function _setup() {
    this._updateDimensionData();
    this._updateOffset();
    this._layoutCarouselItems();
  }
};

var HorizontalModeTrait = {

  _getScrollDelta: function _getScrollDelta(event) {
    return event.gesture.deltaX;
  },

  _getScrollVelocity: function _getScrollVelocity(event) {
    return event.gesture.velocityX;
  },

  _getElementSize: function _getElementSize() {
    if (!this._currentElementSize) {
      var styling = window.getComputedStyle(this, null);
      this._currentElementSize = this.getBoundingClientRect().width - parseInt(styling.getPropertyValue('border-right-width')) - parseInt(styling.getPropertyValue('border-left-width'));
    }

    return this._currentElementSize;
  },

  _generateScrollTransform: function _generateScrollTransform(scroll) {
    return 'translate3d(' + -scroll + 'px, 0px, 0px)';
  },

  _updateDimensionData: function _updateDimensionData() {
    this._style = window.getComputedStyle(this);
    this._dimensions = this.getBoundingClientRect();
  },

  _updateOffset: function _updateOffset() {
    if (this.centered) {
      var width = (this._dimensions.width || 0) - parseInt(this._style.paddingLeft, 10) - parseInt(this._style.paddingRight, 10);
      this._offset = -(width - this._getCarouselItemSize()) / 2;
    }
  },

  _layoutCarouselItems: function _layoutCarouselItems() {
    var children = this._getCarouselItemElements();

    var sizeAttr = this._getCarouselItemSizeAttr();
    var sizeInfo = this._decomposeSizeString(sizeAttr);

    for (var i = 0; i < children.length; i++) {
      children[i].style.position = 'absolute';
      children[i].style.width = sizeAttr;
      children[i].style.visibility = 'visible';
      children[i].style.left = i * sizeInfo.number + sizeInfo.unit;
    }
  },

  _setup: function _setup() {
    this._updateDimensionData();
    this._updateOffset();
    this._layoutCarouselItems();
  }
};

/**
 * @element ons-carousel
 * @category carousel
 * @description
 *   [en]
 *     Carousel component. A carousel can be used to display several items in the same space.
 *
 *     The component supports displaying content both horizontally and vertically. The user can scroll through the items by dragging and it can also be controller programmatically.
 *   [/en]
 *   [ja][/ja]
 * @codepen xbbzOQ
 * @tutorial vanilla/Reference/carousel
 * @seealso ons-carousel-item
 *   [en]`<ons-carousel-item>` component[/en]
 *   [ja]ons-carousel-itemコンポーネント[/ja]
 * @example
 * <ons-carousel style="width: 100%; height: 200px">
 *   <ons-carousel-item>
 *    ...
 *   </ons-carousel-item>
 *   <ons-carousel-item>
 *    ...
 *   </ons-carousel-item>
 * </ons-carousel>
 */

var CarouselElement = function (_BaseElement) {
  inherits(CarouselElement, _BaseElement);

  /**
   * @event postchange
   * @description
   *   [en]Fired just after the current carousel item has changed.[/en]
   *   [ja]現在表示しているカルーセルの要素が変わった時に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクトです。[/ja]
   * @param {Object} event.carousel
   *   [en]Carousel object.[/en]
   *   [ja]イベントが発火したCarouselオブジェクトです。[/ja]
   * @param {Number} event.activeIndex
   *   [en]Current active index.[/en]
   *   [ja]現在アクティブになっている要素のインデックス。[/ja]
   * @param {Number} event.lastActiveIndex
   *   [en]Previous active index.[/en]
   *   [ja]以前アクティブだった要素のインデックス。[/ja]
   */

  /**
   * @event refresh
   * @description
   *   [en]Fired when the carousel has been refreshed.[/en]
   *   [ja]カルーセルが更新された時に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクトです。[/ja]
   * @param {Object} event.carousel
   *   [en]Carousel object.[/en]
   *   [ja]イベントが発火したCarouselオブジェクトです。[/ja]
   */

  /**
   * @event overscroll
   * @description
   *   [en]Fired when the carousel has been overscrolled.[/en]
   *   [ja]カルーセルがオーバースクロールした時に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクトです。[/ja]
   * @param {Object} event.carousel
   *   [en]Fired when the carousel has been refreshed.[/en]
   *   [ja]カルーセルが更新された時に発火します。[/ja]
   * @param {Number} event.activeIndex
   *   [en]Current active index.[/en]
   *   [ja]現在アクティブになっている要素のインデックス。[/ja]
   * @param {String} event.direction
   *   [en]Can be one of either "up", "down", "left" or "right".[/en]
   *   [ja]オーバースクロールされた方向が得られます。"up", "down", "left", "right"のいずれかの方向が渡されます。[/ja]
   * @param {Function} event.waitToReturn
   *   [en]Takes a <code>Promise</code> object as an argument. The carousel will not scroll back until the promise has been resolved or rejected.[/en]
   *   [ja]この関数はPromiseオブジェクトを引数として受け取ります。渡したPromiseオブジェクトがresolveされるかrejectされるまで、カルーセルはスクロールバックしません。[/ja]
   */

  /**
   * @attribute direction
   * @type {String}
   * @description
   *   [en]The direction of the carousel. Can be either "horizontal" or "vertical". Default is "horizontal".[/en]
   *   [ja]カルーセルの方向を指定します。"horizontal"か"vertical"を指定できます。"horizontal"がデフォルト値です。[/ja]
   */

  /**
   * @attribute fullscreen
   * @description
   *   [en]If this attribute is set the carousel will cover the whole screen.[/en]
   *   [ja]この属性があると、absoluteポジションを使ってカルーセルが自動的に画面いっぱいに広がります。[/ja]
   */

  /**
   * @attribute overscrollable
   * @description
   *   [en]If this attribute is set the carousel will be scrollable over the edge. It will bounce back when released.[/en]
   *   [ja]この属性がある時、タッチやドラッグで端までスクロールした時に、バウンドするような効果が当たります。[/ja]
   */

  /**
   * @attribute centered
   * @description
   *   [en]If this attribute is set the carousel then the selected item will be in the center of the carousel instead of the beginning. Useful only when the items are smaller than the carousel. [/en]
   *   [ja]この属性がある時、選んでいるons-carousel-itemはカルーセルの真ん中へ行きます。項目がカルーセルよりも小さい場合にのみ、これは便利です。[/ja]
   */

  /**
   * @attribute item-width
   * @type {String}
   * @description
   *    [en]ons-carousel-item's width. Only works when the direction is set to "horizontal".[/en]
   *    [ja]ons-carousel-itemの幅を指定します。この属性は、direction属性に"horizontal"を指定した時のみ有効になります。[/ja]
   */

  /**
   * @attribute item-height
   * @type {String}
   * @description
   *   [en]ons-carousel-item's height. Only works when the direction is set to "vertical".[/en]
   *   [ja]ons-carousel-itemの高さを指定します。この属性は、direction属性に"vertical"を指定した時のみ有効になります。[/ja]
   */

  /**
   * @attribute auto-scroll
   * @description
   *   [en]If this attribute is set the carousel will be automatically scrolled to the closest item border when released.[/en]
   *   [ja]この属性がある時、一番近いcarousel-itemの境界まで自動的にスクロールするようになります。[/ja]
   */

  /**
   * @attribute auto-scroll-ratio
   * @type {Number}
   * @description
   *    [en]A number between 0.0 and 1.0 that specifies how much the user must drag the carousel in order for it to auto scroll to the next item.[/en]
   *    [ja]0.0から1.0までの値を指定します。カルーセルの要素をどれぐらいの割合までドラッグすると次の要素に自動的にスクロールするかを指定します。[/ja]
   */

  /**
   * @attribute swipeable
   * @description
   *   [en]If this attribute is set the carousel can be scrolled by drag or swipe.[/en]
   *   [ja]この属性がある時、カルーセルをスワイプやドラッグで移動できるようになります。[/ja]
   */

  /**
   * @attribute disabled
   * @description
   *   [en]If this attribute is set the carousel is disabled.[/en]
   *   [ja]この属性がある時、dragやtouchやswipeを受け付けなくなります。[/ja]
   */

  /**
   * @attribute initial-index
   * @initonly
   * @type {Number}
   * @description
   *   [en]Specify the index of the ons-carousel-item to show initially. Default is 0.[/en]
   *   [ja]最初に表示するons-carousel-itemを0始まりのインデックスで指定します。デフォルト値は 0 です。[/ja]
   */

  /**
   * @attribute auto-refresh
   * @description
   *   [en]When this attribute is set the carousel will automatically refresh when the number of child nodes change.[/en]
   *   [ja]この属性がある時、子要素の数が変わるとカルーセルは自動的に更新されるようになります。[/ja]
   */

  /**
   * @attribute animation
   * @type {String}
   * @description
   *   [en]If this attribute is set to `"none"` the transitions will not be animated.[/en]
   *   [ja][/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *   [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *   [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。例：{duration: 0.2, delay: 1, timing: 'ease-in'}[/ja]
   */

  function CarouselElement() {
    classCallCheck(this, CarouselElement);

    var _this = possibleConstructorReturn(this, (CarouselElement.__proto__ || Object.getPrototypeOf(CarouselElement)).call(this));

    _this._doorLock = new DoorLock();
    _this._scroll = 0;
    _this._offset = 0;
    _this._lastActiveIndex = 0;

    _this._boundOnDragStart = _this._onDragStart.bind(_this);
    _this._boundOnDrag = _this._onDrag.bind(_this);
    _this._boundOnDragEnd = _this._onDragEnd.bind(_this);
    _this._boundOnResize = _this._onResize.bind(_this);

    _this._mixin(_this._isVertical() ? VerticalModeTrait : HorizontalModeTrait);
    return _this;
  }

  createClass(CarouselElement, [{
    key: '_onResize',
    value: function _onResize() {
      var i = this._scroll / this._currentElementSize;
      delete this._currentElementSize;
      this.setActiveIndex(i);

      this.refresh();
    }
  }, {
    key: '_onDirectionChange',
    value: function _onDirectionChange() {
      if (this._isVertical()) {
        this.style.overflowX = 'auto';
        this.style.overflowY = '';
      } else {
        this.style.overflowX = '';
        this.style.overflowY = 'auto';
      }

      this.refresh();
    }
  }, {
    key: '_saveLastState',
    value: function _saveLastState() {
      this._lastState = {
        elementSize: this._getCarouselItemSize(),
        carouselElementCount: this.itemCount,
        width: this._getCarouselItemSize() * this.itemCount
      };
    }

    /**
     * @return {Number}
     */

  }, {
    key: '_getCarouselItemSize',
    value: function _getCarouselItemSize() {
      var sizeAttr = this._getCarouselItemSizeAttr();
      var sizeInfo = this._decomposeSizeString(sizeAttr);
      var elementSize = this._getElementSize();

      if (sizeInfo.unit === '%') {
        return Math.round(sizeInfo.number / 100 * elementSize);
      } else if (sizeInfo.unit === 'px') {
        return sizeInfo.number;
      } else {
        throw new Error('Invalid state');
      }
    }

    /**
     * @return {Number}
     */

  }, {
    key: '_getInitialIndex',
    value: function _getInitialIndex() {
      var index = parseInt(this.getAttribute('initial-index'), 10);

      if (typeof index === 'number' && !isNaN(index)) {
        return Math.max(Math.min(index, this.itemCount - 1), 0);
      } else {
        return 0;
      }
    }

    /**
     * @return {String}
     */

  }, {
    key: '_getCarouselItemSizeAttr',
    value: function _getCarouselItemSizeAttr() {
      var attrName = 'item-' + (this._isVertical() ? 'height' : 'width');
      var itemSizeAttr = ('' + this.getAttribute(attrName)).trim();

      return itemSizeAttr.match(/^\d+(px|%)$/) ? itemSizeAttr : '100%';
    }

    /**
     * @return {Object}
     */

  }, {
    key: '_decomposeSizeString',
    value: function _decomposeSizeString(size) {
      var matches = size.match(/^(\d+)(px|%)/);

      return {
        number: parseInt(matches[1], 10),
        unit: matches[2]
      };
    }
  }, {
    key: '_setupInitialIndex',
    value: function _setupInitialIndex() {
      this._scroll = (this._offset || 0) + this._getCarouselItemSize() * this._getInitialIndex();
      this._lastActiveIndex = this._getInitialIndex();
      this._scrollTo(this._scroll);
    }

    /**
     * @method setActiveIndex
     * @signature setActiveIndex(index, [options])
     * @param {Number} index
     *   [en]The index that the carousel should be set to.[/en]
     *   [ja]carousel要素のインデックスを指定します。[/ja]
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja][/ja]
     * @param {Function} [options.callback]
     *   [en]A function that will be called after the animation is finished.[/en]
     *   [ja][/ja]
     * @param {String} [options.animation]
     *   [en]If this attribute is set to `"none"` the transitions will not be animated.[/en]
     *   [ja][/ja]
     * @param {Object} [options.animationOptions]
     *   [en]An object that can be used to specify duration, delay and timing function of the animation.[/en]
     *   [ja][/ja]
     * @description
     *   [en]Specify the index of the `<ons-carousel-item>` to show.[/en]
     *   [ja]表示するons-carousel-itemをindexで指定します。[/ja]
     * @return {Promise}
     *   [en]Resolves to the carousel element.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'setActiveIndex',
    value: function setActiveIndex(index) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) != 'object') {
        throw new Error('options must be an object. You supplied ' + options);
      }

      options.animation = options.animation || this.getAttribute('animation');
      options.animationOptions = util.extend({ duration: 0.3, timing: 'cubic-bezier(.1, .7, .1, 1)' }, options.animationOptions || {}, this.hasAttribute('animation-options') ? util.animationOptionsParse(this.getAttribute('animation-options')) : {});

      index = Math.max(0, Math.min(index, this.itemCount - 1));
      var scroll = (this._offset || 0) + this._getCarouselItemSize() * index;
      var max = this._calculateMaxScroll();

      this._scroll = Math.max(0, Math.min(max, scroll));
      return this._scrollTo(this._scroll, options).then(function () {
        _this2._tryFirePostChangeEvent();
        return _this2;
      });
    }

    /**
     * @method getActiveIndex
     * @signature getActiveIndex()
     * @return {Number}
     *   [en]The current carousel item index.[/en]
     *   [ja]現在表示しているカルーセル要素のインデックスが返されます。[/ja]
     * @description
     *   [en]Returns the index of the currently visible `<ons-carousel-item>`.[/en]
     *   [ja]現在表示されているons-carousel-item要素のインデックスを返します。[/ja]
     */

  }, {
    key: 'getActiveIndex',
    value: function getActiveIndex() {
      var scroll = this._scroll - (this._offset || 0);
      var count = this.itemCount;
      var size = this._getCarouselItemSize();

      if (scroll < 0) {
        return 0;
      }

      var i = void 0;
      for (i = 0; i < count; i++) {
        if (size * i <= scroll && size * (i + 1) > scroll) {
          return i;
        }
      }

      // max carousel index
      return i;
    }

    /**
     * @method next
     * @signature next([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja][/ja]
     * @param {Function} [options.callback]
     *   [en]A function that will be executed after the animation has finished.[/en]
     *   [ja][/ja]
     * @param {String} [options.animation]
     *   [en]If this attribute is set to `"none"` the transitions will not be animated.[/en]
     *   [ja][/ja]
     * @param {Object} [options.animationOptions]
     *   [en]An object that can be used to specify the duration, delay and timing function of the animation.[/en]
     *   [ja][/ja]
     * @return {Promise}
     *   [en]Resolves to the carousel element[/en]
     *   [ja][/ja]
     * @description
     *   [en]Show next `<ons-carousel-item>`.[/en]
     *   [ja]次のons-carousel-itemを表示します。[/ja]
     */

  }, {
    key: 'next',
    value: function next(options) {
      return this.setActiveIndex(this.getActiveIndex() + 1, options);
    }

    /**
     * @method prev
     * @signature prev([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja][/ja]
     * @param {Function} [options.callback]
     *   [en]A function that will be executed after the animation has finished.[/en]
     *   [ja][/ja]
     * @param {String} [options.animation]
     *   [en]If this attribute is set to `"none"` the transitions will not be animated.[/en]
     *   [ja][/ja]
     * @param {Object} [options.animationOptions]
     *   [en]An object that can be used to specify the duration, delay and timing function of the animation.[/en]
     *   [ja][/ja]
     * @return {Promise}
     *   [en]Resolves to the carousel element[/en]
     *   [ja][/ja]
     * @description
     *   [en]Show previous `<ons-carousel-item>`.[/en]
     *   [ja]前のons-carousel-itemを表示します。[/ja]
     */

  }, {
    key: 'prev',
    value: function prev(options) {
      return this.setActiveIndex(this.getActiveIndex() - 1, options);
    }

    /**
     * @return {Boolean}
     */

  }, {
    key: '_isEnabledChangeEvent',
    value: function _isEnabledChangeEvent() {
      var elementSize = this._getElementSize();
      var carouselItemSize = this._getCarouselItemSize();

      return this.autoScroll && Math.abs(elementSize - carouselItemSize) < 0.5;
    }

    /**
     * @return {Boolean}
     */

  }, {
    key: '_isVertical',
    value: function _isVertical() {
      return this.getAttribute('direction') === 'vertical';
    }
  }, {
    key: '_show',
    value: function _show() {
      window.addEventListener('resize', this._boundOnResize, true);
    }
  }, {
    key: '_prepareEventListeners',
    value: function _prepareEventListeners() {
      var _this3 = this;

      this._gestureDetector = new GestureDetector(this, {
        dragMinDistance: 1,
        dragLockToAxis: true
      });
      this._mutationObserver = new MutationObserver(function () {
        return _this3.refresh();
      });

      this._updateSwipeable();
      this._updateAutoRefresh();

      window.addEventListener('resize', this._boundOnResize, true);
    }
  }, {
    key: '_hide',
    value: function _hide() {
      window.removeEventListener('resize', this._boundOnResize, true);
    }
  }, {
    key: '_removeEventListeners',
    value: function _removeEventListeners() {
      this._gestureDetector.dispose();
      this._gestureDetector = null;

      this._mutationObserver.disconnect();
      this._mutationObserver = null;

      window.removeEventListener('resize', this._boundOnResize, true);
    }
  }, {
    key: '_updateSwipeable',
    value: function _updateSwipeable() {
      if (this._gestureDetector) {
        var action = this.swipeable ? 'on' : 'off';
        this._gestureDetector[action]('drag', this._boundOnDrag);
        this._gestureDetector[action]('dragstart', this._boundOnDragStart);
        this._gestureDetector[action]('dragend', this._boundOnDragEnd);
      }
    }
  }, {
    key: '_updateAutoRefresh',
    value: function _updateAutoRefresh() {
      if (this._mutationObserver) {
        if (this.hasAttribute('auto-refresh')) {
          this._mutationObserver.observe(this, { childList: true });
        } else {
          this._mutationObserver.disconnect();
        }
      }
    }
  }, {
    key: '_tryFirePostChangeEvent',
    value: function _tryFirePostChangeEvent() {
      var currentIndex = this.getActiveIndex();

      if (this._lastActiveIndex !== currentIndex) {
        var lastActiveIndex = this._lastActiveIndex;
        this._lastActiveIndex = currentIndex;

        util.triggerElementEvent(this, 'postchange', {
          carousel: this,
          activeIndex: currentIndex,
          lastActiveIndex: lastActiveIndex
        });
      }
    }
  }, {
    key: '_canConsumeGesture',
    value: function _canConsumeGesture(gesture) {
      var d = gesture.direction;
      var isFirst = this._scroll === 0 && !this.overscrollable;
      var isLast = this._scroll === this._calculateMaxScroll() && !this.overscrollable;

      return this._isVertical() ? d === 'down' && !isFirst || d === 'up' && !isLast : d === 'right' && !isFirst || d === 'left' && !isLast;
    }
  }, {
    key: '_onDragStart',
    value: function _onDragStart(event) {
      var _this4 = this;

      this._ignoreDrag = event.consumed;

      if (!this._ignoreDrag) {
        var consume = event.consume;
        event.consume = function () {
          consume && consume();_this4._ignoreDrag = true;
        };
        if (this._canConsumeGesture(event.gesture)) {
          consume && consume();
          event.consumed = true;
          this._started = true; // Avoid starting drag from outside
        }
      }
    }
  }, {
    key: '_onDrag',
    value: function _onDrag(event) {
      if (this._ignoreDrag || !this._canConsumeGesture(event.gesture) || !this._started) {
        return;
      }

      event.stopPropagation();

      this._lastDragEvent = event;

      var scroll = this._scroll - this._getScrollDelta(event);
      this._scrollTo(scroll);
      event.gesture.preventDefault();

      this._tryFirePostChangeEvent();
    }
  }, {
    key: '_onDragEnd',
    value: function _onDragEnd(event) {
      var _this5 = this;

      this._started = false;
      if (!this._lastDragEvent || this._ignoreDrag) {
        return;
      }

      event.stopPropagation();

      this._currentElementSize = undefined;
      this._scroll = this._scroll - this._getScrollDelta(event);

      if (this._isOverScroll(this._scroll)) {
        var waitForAction = false;
        util.triggerElementEvent(this, 'overscroll', {
          carousel: this,
          activeIndex: this.getActiveIndex(),
          direction: this._getOverScrollDirection(),
          waitToReturn: function waitToReturn(promise) {
            waitForAction = true;
            promise.then(function () {
              return _this5._scrollToKillOverScroll();
            });
          }
        });

        if (!waitForAction) {
          this._scrollToKillOverScroll();
        }
      } else {
        this._startMomentumScroll();
      }
      this._lastDragEvent = null;

      event.gesture.preventDefault();
    }

    /**
     * @param {Object} trait
     */

  }, {
    key: '_mixin',
    value: function _mixin(trait) {
      Object.keys(trait).forEach(function (key) {
        this[key] = trait[key];
      }.bind(this));
    }
  }, {
    key: '_startMomentumScroll',
    value: function _startMomentumScroll() {
      if (this._lastDragEvent) {
        var velocity = this._getScrollVelocity(this._lastDragEvent);
        var duration = 0.3;
        var scrollDelta = duration * 100 * velocity;
        var scroll = this._normalizeScrollPosition(this._scroll + (this._getScrollDelta(this._lastDragEvent) > 0 ? -scrollDelta : scrollDelta));

        this._scroll = scroll;

        Animit(this._getCarouselItemElements()).queue({
          transform: this._generateScrollTransform(this._scroll)
        }, {
          duration: duration,
          timing: 'cubic-bezier(.1, .7, .1, 1)'
        }).queue(function (done) {
          done();
          this._tryFirePostChangeEvent();
        }.bind(this)).play();
      }
    }
  }, {
    key: '_normalizeScrollPosition',
    value: function _normalizeScrollPosition(scroll) {
      var max = this._calculateMaxScroll();

      if (!this.autoScroll) {
        return Math.max(0, Math.min(max, scroll));
      }
      var arr = [];
      var size = this._getCarouselItemSize();
      var nbrOfItems = this.itemCount;

      for (var i = 0; i < nbrOfItems; i++) {
        if (i * size + this._offset < max) {
          arr.push(i * size + this._offset);
        }
      }
      arr.push(max);

      arr.sort(function (left, right) {
        left = Math.abs(left - scroll);
        right = Math.abs(right - scroll);

        return left - right;
      });

      arr = arr.filter(function (item, pos) {
        return !pos || item != arr[pos - 1];
      });

      var lastScroll = this._lastActiveIndex * size + this._offset;
      var scrollRatio = Math.abs(scroll - lastScroll) / size;
      var result = arr[0];

      if (scrollRatio <= this.autoScrollRatio) {
        result = lastScroll;
      } else if (scrollRatio < 1.0) {
        if (arr[0] === lastScroll && arr.length > 1) {
          result = arr[1];
        }
      }

      return Math.max(0, Math.min(max, result));
    }

    /**
     * @return {Array}
     */

  }, {
    key: '_getCarouselItemElements',
    value: function _getCarouselItemElements() {
      return util.arrayFrom(this.children).filter(function (child) {
        return child.nodeName.toLowerCase() === 'ons-carousel-item';
      });
    }

    /**
     * @param {Number} scroll
     * @param {Object} [options]
     * @return {Promise} Resolves to the carousel element
     */

  }, {
    key: '_scrollTo',
    value: function _scrollTo(scroll) {
      var _this6 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var isOverscrollable = this.overscrollable;

      var normalizeScroll = function normalizeScroll(scroll) {
        var ratio = 0.35;

        if (scroll < 0) {
          return isOverscrollable ? Math.round(scroll * ratio) : 0;
        }

        var maxScroll = _this6._calculateMaxScroll();
        if (maxScroll < scroll) {
          return isOverscrollable ? maxScroll + Math.round((scroll - maxScroll) * ratio) : maxScroll;
        }

        return scroll;
      };

      return new Promise(function (resolve) {
        Animit(_this6._getCarouselItemElements()).queue({
          transform: _this6._generateScrollTransform(normalizeScroll(scroll))
        }, options.animation !== 'none' ? options.animationOptions : {}).play(function () {
          if (options.callback instanceof Function) {
            options.callback();
          }
          resolve();
        });
      });
    }
  }, {
    key: '_calculateMaxScroll',
    value: function _calculateMaxScroll() {
      var max = this.itemCount * this._getCarouselItemSize() - this._getElementSize();
      return Math.ceil(max < 0 ? 0 : max); // Need to return an integer value.
    }
  }, {
    key: '_isOverScroll',
    value: function _isOverScroll(scroll) {
      if (scroll < 0 || scroll > this._calculateMaxScroll()) {
        return true;
      }
      return false;
    }
  }, {
    key: '_getOverScrollDirection',
    value: function _getOverScrollDirection() {
      if (this._isVertical()) {
        return this._scroll <= 0 ? 'up' : 'down';
      } else {
        return this._scroll <= 0 ? 'left' : 'right';
      }
    }
  }, {
    key: '_scrollToKillOverScroll',
    value: function _scrollToKillOverScroll() {
      var duration = 0.4;

      if (this._scroll < 0) {
        Animit(this._getCarouselItemElements()).queue({
          transform: this._generateScrollTransform(0)
        }, {
          duration: duration,
          timing: 'cubic-bezier(.1, .4, .1, 1)'
        }).queue(function (done) {
          done();
          this._tryFirePostChangeEvent();
        }.bind(this)).play();
        this._scroll = 0;
        return;
      }

      var maxScroll = this._calculateMaxScroll();

      if (maxScroll < this._scroll) {
        Animit(this._getCarouselItemElements()).queue({
          transform: this._generateScrollTransform(maxScroll)
        }, {
          duration: duration,
          timing: 'cubic-bezier(.1, .4, .1, 1)'
        }).queue(function (done) {
          done();
          this._tryFirePostChangeEvent();
        }.bind(this)).play();
        this._scroll = maxScroll;
        return;
      }

      return;
    }

    /**
     * @property itemCount
     * @readonly
     * @type {Number}
     * @description
     *   [en]The number of carousel items.[/en]
     *   [ja]カルーセル要素の数です。[/ja]
     */

  }, {
    key: 'refresh',


    /**
     * @method refresh
     * @signature refresh()
     * @description
     *   [en]Update the layout of the carousel. Used when adding `<ons-carousel-items>` dynamically or to automatically adjust the size.[/en]
     *   [ja]レイアウトや内部の状態を最新のものに更新します。ons-carousel-itemを動的に増やしたり、ons-carouselの大きさを動的に変える際に利用します。[/ja]
     */
    value: function refresh() {
      // Bug fix
      if (this._getCarouselItemSize() === 0) {
        return;
      }

      this._mixin(this._isVertical() ? VerticalModeTrait : HorizontalModeTrait);
      this._setup();

      if (this._lastState && this._lastState.width > 0) {
        var scroll = this._scroll; // - this._offset;

        if (this._isOverScroll(scroll)) {
          this._scrollToKillOverScroll();
        } else {
          if (this.autoScroll) {
            scroll = this._normalizeScrollPosition(scroll);
          }

          this._scrollTo(scroll);
        }
      }

      this._saveLastState();

      util.triggerElementEvent(this, 'refresh', { carousel: this });
    }

    /**
     * @method first
     * @signature first()
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja][/ja]
     * @param {Function} [options.callback]
     *   [en]A function that will be executed after the animation has finished.[/en]
     *   [ja][/ja]
     * @param {String} [options.animation]
     *   [en]If this is set to `"none"`, the transitions will not be animated.[/en]
     *   [ja][/ja]
     * @param {Object} [options.animationOptions]
     *   [en]An object that can be used to specify the duration, delay and timing function of the animation.[/en]
     *   [ja][/ja]
     * @return {Promise}
     *   [en]Resolves to the carousel element[/en]
     *   [ja][/ja]
     * @description
     *   [en]Show first `<ons-carousel-item>`.[/en]
     *   [ja]最初のons-carousel-itemを表示します。[/ja]
     */

  }, {
    key: 'first',
    value: function first(options) {
      return this.setActiveIndex(0, options);
    }

    /**
     * @method last
     * @signature last()
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja][/ja]
     * @param {Function} [options.callback]
     *   [en]A function that will be executed after the animation has finished.[/en]
     *   [ja][/ja]
     * @param {String} [options.animation]
     *   [en]If this attribute is set to `"none"` the transitions will not be animated.[/en]
     *   [ja][/ja]
     * @param {Object} [options.animationOptions]
     *   [en]An object that can be used to specify the duration, delay and timing function of the animation.[/en]
     *   [ja][/ja]
     * @return {Promise}
     *   [en]Resolves to the carousel element[/en]
     *   [ja]Resolves to the carousel element[/ja]
     * @description
     *   [en]Show last ons-carousel item.[/en]
     *   [ja]最後のons-carousel-itemを表示します。[/ja]
     */

  }, {
    key: 'last',
    value: function last(options) {
      this.setActiveIndex(Math.max(this.itemCount - 1, 0), options);
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this7 = this;

      this._prepareEventListeners();

      this._setup();
      this._setupInitialIndex();

      this._saveLastState();

      // Fix rendering glitch on Android 4.1
      if (this.offsetHeight === 0) {
        setImmediate(function () {
          return _this7.refresh();
        });
      }
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'swipeable':
          this._updateSwipeable();
          break;
        case 'auto-refresh':
          this._updateAutoRefresh();
          break;
        case 'direction':
          this._onDirectionChange();
      }
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this._removeEventListeners();
    }

    /**
     * @property autoScrollRatio
     * @type {Number}
     * @description
     *   [en]The current auto scroll ratio. [/en]
     *   [ja]現在のオートスクロールのratio値。[/ja]
     */

  }, {
    key: 'itemCount',
    get: function get$$1() {
      return this._getCarouselItemElements().length;
    }
  }, {
    key: 'autoScrollRatio',
    get: function get$$1() {
      var attr = this.getAttribute('auto-scroll-ratio');

      if (!attr) {
        return 0.5;
      }

      var scrollRatio = parseFloat(attr);
      if (scrollRatio < 0.0 || scrollRatio > 1.0) {
        throw new Error('Invalid ratio.');
      }

      return isNaN(scrollRatio) ? 0.5 : scrollRatio;
    },
    set: function set(ratio) {
      if (ratio < 0.0 || ratio > 1.0) {
        throw new Error('Invalid ratio.');
      }

      this.setAttribute('auto-scroll-ratio', ratio);
    }

    /**
     * @property swipeable
     * @type {Boolean}
     * @description
     *   [en]true if the carousel is swipeable.[/en]
     *   [ja]swipeableであればtrueを返します。[/ja]
     */

  }, {
    key: 'swipeable',
    get: function get$$1() {
      return this.hasAttribute('swipeable');
    },
    set: function set(value) {
      return util.toggleAttribute(this, 'swipeable', value);
    }

    /**
     * @property autoScroll
     * @type {Boolean}
     * @description
     *   [en]true if auto scroll is enabled.[/en]
     *   [ja]オートスクロールが有効であればtrueを返します。[/ja]
     */

  }, {
    key: 'autoScroll',
    get: function get$$1() {
      return this.hasAttribute('auto-scroll');
    },
    set: function set(value) {
      return util.toggleAttribute(this, 'auto-scroll', value);
    }

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the carousel is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }, {
    key: 'disabled',
    get: function get$$1() {
      return this.hasAttribute('disabled');
    },
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    }

    /**
     * @property overscrollable
     * @type {Boolean}
     * @description
     *   [en]Whether the carousel is overscrollable or not.[/en]
     *   [ja]overscrollできればtrueを返します。[/ja]
     */

  }, {
    key: 'overscrollable',
    get: function get$$1() {
      return this.hasAttribute('overscrollable');
    },
    set: function set(value) {
      return util.toggleAttribute(this, 'overscrollable', value);
    }

    /**
     * @property centered
     * @type {Boolean}
     * @description
     *   [en]Whether the carousel is centered or not.[/en]
     *   [ja]centered状態になっていればtrueを返します。[/ja]
     */

  }, {
    key: 'centered',
    get: function get$$1() {
      return this.hasAttribute('centered');
    },
    set: function set(value) {
      return util.toggleAttribute(this, 'centered', value);
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['swipeable', 'auto-refresh', 'direction'];
    }
  }, {
    key: 'events',
    get: function get$$1() {
      return ['postchange', 'refresh', 'overscroll'];
    }
  }]);
  return CarouselElement;
}(BaseElement);

customElements.define('ons-carousel', CarouselElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @element ons-col
 * @category grid
 * @description
 *   [en]Represents a column in the grid system. Use with `<ons-row>` to layout components.[/en]
 *   [ja]グリッドシステムにて列を定義します。ons-rowとともに使用し、コンポーネントのレイアウトに利用します。[/ja]
 * @note
 *   [en]For Android 4.3 and earlier, and iOS6 and earlier, when using mixed alignment with ons-row and ons-column, they may not be displayed correctly. You can use only one alignment.[/en]
 *   [ja]Android 4.3以前、もしくはiOS 6以前のOSの場合、ons-rowとons-columnを組み合わせた場合に描画が崩れる場合があります。[/ja]
 * @codepen GgujC {wide}
 * @guide layouting [en]Layouting guide[/en][ja]レイアウト機能[/ja]
 * @seealso ons-row
 *   [en]The `<ons-row>` component is the parent of `<ons-col>`.[/en]
 *   [ja]ons-rowコンポーネント[/ja]
 * @example
 * <ons-row>
 *   <ons-col width="50px"><ons-icon icon="fa-twitter"></ons-icon></ons-col>
 *   <ons-col>Text</ons-col>
 * </ons-row>
 */

/**
 * @attribute vertical-align
 * @type {String}
 * @description
 *   [en]Vertical alignment of the column. Valid values are "top", "center", and "bottom".[/en]
 *   [ja]縦の配置を指定する。"top", "center", "bottom"のいずれかを指定します。[/ja]
 */

/**
 * @attribute width
 * @type {String}
 * @description
 *   [en]The width of the column. Valid values are css width values ("10%", "50px").[/en]
 *   [ja]カラムの横幅を指定する。パーセントもしくはピクセルで指定します（10%や50px）。[/ja]
 */

var ColElement = function (_BaseElement) {
  inherits(ColElement, _BaseElement);

  function ColElement() {
    classCallCheck(this, ColElement);

    var _this = possibleConstructorReturn(this, (ColElement.__proto__ || Object.getPrototypeOf(ColElement)).call(this));

    if (_this.getAttribute('width')) {
      _this._updateWidth();
    }
    return _this;
  }

  createClass(ColElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'width') {
        this._updateWidth();
      }
    }
  }, {
    key: '_updateWidth',
    value: function _updateWidth() {
      var width = this.getAttribute('width');
      if (typeof width === 'string') {
        width = ('' + width).trim();
        width = width.match(/^\d+$/) ? width + '%' : width;

        this.style.webkitBoxFlex = '0';
        this.style.webkitFlex = '0 0 ' + width;
        this.style.mozBoxFlex = '0';
        this.style.mozFlex = '0 0 ' + width;
        this.style.msFlex = '0 0 ' + width;
        this.style.flex = '0 0 ' + width;
        this.style.maxWidth = width;
      }
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['width'];
    }
  }]);
  return ColElement;
}(BaseElement);

customElements.define('ons-col', ColElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var DialogAnimator = function (_BaseAnimator) {
  inherits(DialogAnimator, _BaseAnimator);

  function DialogAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.2 : _ref$duration;

    classCallCheck(this, DialogAnimator);
    return possibleConstructorReturn(this, (DialogAnimator.__proto__ || Object.getPrototypeOf(DialogAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} dialog
   * @param {Function} done
   */


  createClass(DialogAnimator, [{
    key: 'show',
    value: function show(dialog, done) {
      done();
    }

    /**
     * @param {HTMLElement} dialog
     * @param {Function} done
     */

  }, {
    key: 'hide',
    value: function hide(dialog, done) {
      done();
    }
  }]);
  return DialogAnimator;
}(BaseAnimator);

/**
 * Android style animator for dialog.
 */
var AndroidDialogAnimator = function (_DialogAnimator) {
  inherits(AndroidDialogAnimator, _DialogAnimator);

  function AndroidDialogAnimator() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$timing = _ref2.timing,
        timing = _ref2$timing === undefined ? 'ease-in-out' : _ref2$timing,
        _ref2$delay = _ref2.delay,
        delay = _ref2$delay === undefined ? 0 : _ref2$delay,
        _ref2$duration = _ref2.duration,
        duration = _ref2$duration === undefined ? 0.3 : _ref2$duration;

    classCallCheck(this, AndroidDialogAnimator);
    return possibleConstructorReturn(this, (AndroidDialogAnimator.__proto__ || Object.getPrototypeOf(AndroidDialogAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {Object} dialog
   * @param {Function} callback
   */


  createClass(AndroidDialogAnimator, [{
    key: 'show',
    value: function show(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          transform: 'translate3d(-50%, -60%, 0)',
          opacity: 0.0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0)',
          opacity: 1.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 1.0
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0)',
          opacity: 1.0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(-50%, -60%, 0)',
          opacity: 0.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }
  }]);
  return AndroidDialogAnimator;
}(DialogAnimator);

/**
 * iOS style animator for dialog.
 */
var IOSDialogAnimator = function (_DialogAnimator2) {
  inherits(IOSDialogAnimator, _DialogAnimator2);

  function IOSDialogAnimator() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref3$timing = _ref3.timing,
        timing = _ref3$timing === undefined ? 'ease-in-out' : _ref3$timing,
        _ref3$delay = _ref3.delay,
        delay = _ref3$delay === undefined ? 0 : _ref3$delay,
        _ref3$duration = _ref3.duration,
        duration = _ref3$duration === undefined ? 0.2 : _ref3$duration;

    classCallCheck(this, IOSDialogAnimator);

    var _this3 = possibleConstructorReturn(this, (IOSDialogAnimator.__proto__ || Object.getPrototypeOf(IOSDialogAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this3.bodyHeight = document.body.clientHeight; // avoid Forced Synchronous Layout
    return _this3;
  }

  /**
   * @param {Object} dialog
   * @param {Function} callback
   */


  createClass(IOSDialogAnimator, [{
    key: 'show',
    value: function show(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          transform: 'translate3d(-50%, ' + (this.bodyHeight / 2.0 - 1) + 'px, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 1.0
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          transform: 'translate3d(-50%, -50%, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3d(-50%, ' + (this.bodyHeight / 2.0 - 1) + 'px, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }
  }]);
  return IOSDialogAnimator;
}(DialogAnimator);

/**
 * Slide animator for dialog.
 */
var SlideDialogAnimator = function (_DialogAnimator3) {
  inherits(SlideDialogAnimator, _DialogAnimator3);

  function SlideDialogAnimator() {
    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref4$timing = _ref4.timing,
        timing = _ref4$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref4$timing,
        _ref4$delay = _ref4.delay,
        delay = _ref4$delay === undefined ? 0 : _ref4$delay,
        _ref4$duration = _ref4.duration,
        duration = _ref4$duration === undefined ? 0.2 : _ref4$duration;

    classCallCheck(this, SlideDialogAnimator);

    var _this4 = possibleConstructorReturn(this, (SlideDialogAnimator.__proto__ || Object.getPrototypeOf(SlideDialogAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this4.bodyHeight = document.body.clientHeight; // avoid Forced Synchronous Layout
    return _this4;
  }

  /**
   * @param {Object} dialog
   * @param {Function} callback
   */


  createClass(SlideDialogAnimator, [{
    key: 'show',
    value: function show(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          // FIXME: This should avoid Forced Synchronous Layout. Otherwise, fade animation of mask will be broken.
          transform: 'translate3d(-50%, ' + (-(this.bodyHeight / 2.0) + 1 - dialog._dialog.clientHeight) + 'px, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(-50%, -50%, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }

    /**
     * @param {Object} dialog
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(dialog, callback) {
      callback = callback ? callback : function () {};

      Animit.runAll(Animit(dialog._mask).queue({
        opacity: 1.0
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(dialog._dialog).saveStyle().queue({
        css: {
          transform: 'translate3D(-50%, -50%, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          // FIXME: This should avoid Forced Synchronous Layout. Otherwise, fade animation of mask will be broken.
          transform: 'translate3d(-50%, ' + (-(this.bodyHeight / 2.0) + 1 - dialog._dialog.clientHeight) + 'px, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }));
    }
  }]);
  return SlideDialogAnimator;
}(DialogAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$8 = {
  '.dialog': 'dialog--*',
  '.dialog-container': 'dialog-container--*',
  '.dialog-mask': 'dialog-mask--*'
};

var _animatorDict$2 = {
  'default': function _default() {
    return platform$1.isAndroid() ? AndroidDialogAnimator : IOSDialogAnimator;
  },
  'slide': SlideDialogAnimator,
  'none': DialogAnimator
};

/**
 * @element ons-dialog
 * @category dialog
 * @description
 *   [en]
 *     Dialog that is displayed on top of current screen. As opposed to the `<ons-alert-dialog>` element, this component can contain any kind of content.
 *
 *     To use the element it can either be attached directly to the `<body>` element or dynamically created from a template using the `ons.createDialog(template)` utility function and the `<ons-template>` tag.
 *
 *     The dialog is useful for displaying menus, additional information or to ask the user to make a decision.
 *
 *     It will automatically be displayed as Material Design when running on an Android device.
 *   [/en]
 *   [ja][/ja]
 * @modifier material
 *   [en]Display a Material Design dialog.[/en]
 *   [ja]マテリアルデザインのダイアログを表示します。[/ja]
 * @codepen zxxaGa
 * @tutorial vanilla/Reference/dialog
 * @guide dialogs
 *   [en]Dialog components[/en]
 *   [ja]Dialog components[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @seealso ons-alert-dialog
 *   [en]`<ons-alert-dialog>` component[/en]
 *   [ja]ons-alert-dialogコンポーネント[/ja]
 * @seealso ons-popover
 *   [en]`<ons-popover>` component[/en]
 *   [ja]ons-popoverコンポーネント[/ja]
 * @seealso ons-modal
 *   [en]`<ons-modal>` component[/en]
 *   [ja]ons-modalコンポーネント[/ja]
 * @example
 * <ons-dialog id="dialog">
 *   <p>This is a dialog!</p>
 * </ons-dialog>
 *
 * <script>
 *   document.getElementById('dialog').show();
 * </script>
 */

var DialogElement = function (_BaseDialogElement) {
  inherits(DialogElement, _BaseDialogElement);

  /**
   * @event preshow
   * @description
   * [en]Fired just before the dialog is displayed.[/en]
   * [ja]ダイアログが表示される直前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.dialog
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Execute this function to stop the dialog from being shown.[/en]
   *   [ja]この関数を実行すると、ダイアログの表示がキャンセルされます。[/ja]
   */

  /**
   * @event postshow
   * @description
   * [en]Fired just after the dialog is displayed.[/en]
   * [ja]ダイアログが表示された直後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.dialog
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @event prehide
   * @description
   * [en]Fired just before the dialog is hidden.[/en]
   * [ja]ダイアログが隠れる直前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.dialog
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Execute this function to stop the dialog from being hidden.[/en]
   *   [ja]この関数を実行すると、ダイアログの非表示がキャンセルされます。[/ja]
   */

  /**
   * @event posthide
   * @description
   * [en]Fired just after the dialog is hidden.[/en]
   * [ja]ダイアログが隠れた後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.dialog
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *  [en]The appearance of the dialog.[/en]
   *  [ja]ダイアログの表現を指定します。[/ja]
   */

  /**
   * @attribute cancelable
   * @description
   *  [en]If this attribute is set the dialog can be closed by tapping the background or by pressing the back button on Android devices.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute disabled
   * @description
   *  [en]If this attribute is set the dialog is disabled.[/en]
   *  [ja]この属性がある時、ダイアログはdisabled状態になります。[/ja]
   */

  /**
   * @attribute animation
   * @type {String}
   * @default default
   * @description
   *  [en]The animation used when showing and hiding the dialog. Can be either `"none"` or `"default"`.[/en]
   *  [ja]ダイアログを表示する際のアニメーション名を指定します。"none"もしくは"default"を指定できます。[/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`[/ja]
   */

  /**
   * @attribute mask-color
   * @type {String}
   * @default rgba(0, 0, 0, 0.2)
   * @description
   *  [en]Color of the background mask. Default is `"rgba(0, 0, 0, 0.2)"`.[/en]
   *  [ja]背景のマスクの色を指定します。"rgba(0, 0, 0, 0.2)"がデフォルト値です。[/ja]
   */

  function DialogElement() {
    classCallCheck(this, DialogElement);

    var _this = possibleConstructorReturn(this, (DialogElement.__proto__ || Object.getPrototypeOf(DialogElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  createClass(DialogElement, [{
    key: '_updateAnimatorFactory',
    value: function _updateAnimatorFactory() {
      return new AnimatorFactory({
        animators: _animatorDict$2,
        baseClass: DialogAnimator,
        baseClassName: 'DialogAnimator',
        defaultAnimation: this.getAttribute('animation')
      });
    }
  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.style.display = 'none';
      this.style.zIndex = 10001;

      /* Expected result:
       *   <ons-dialog>
       *     <div class="dialog-mask"></div>
       *     <div class="dialog">
       *       <div class="dialog-container">...</div>
       *     </div>
       *   </ons-dialog>
       */

      if (!this._dialog) {
        var dialog = document.createElement('div');
        dialog.classList.add('dialog');

        var container = document.createElement('div');
        container.classList.add('dialog-container');
        while (this.firstChild) {
          container.appendChild(this.firstChild);
        }
        dialog.appendChild(container);

        this.appendChild(dialog);
      }

      if (!this._mask) {
        var mask = document.createElement('div');
        mask.classList.add('dialog-mask');
        this.insertBefore(mask, this.firstChild);
      }

      this._dialog.style.zIndex = 20001;
      this._mask.style.zIndex = 20000;

      this.setAttribute('status-bar-fill', '');

      ModifierUtil.initModifier(this, this._scheme);
    }

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

    /**
     * @method show
     * @signature show([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"none"` and `"slide"`.[/en]
     *   [ja]アニメーション名を指定します。"none", "slide"のいずれかを指定します。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}` [/ja]
     * @param {Function} [options.callback]
     *   [en]This function is called after the dialog has been revealed.[/en]
     *   [ja]ダイアログが表示され終わった後に呼び出される関数オブジェクトを指定します。[/ja]
     * @description
     *  [en]Show the dialog.[/en]
     *  [ja]ダイアログを開きます。[/ja]
     * @return {Promise} Resolves to the displayed element.
     */

    /**
     * @method hide
     * @signature hide([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"none"` and `"slide"`.[/en]
     *   [ja]アニメーション名を指定します。"none", "slide"のいずれかを指定できます。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`[/ja]
     * @param {Function} [options.callback]
     *   [en]This functions is called after the dialog has been hidden.[/en]
     *   [ja]ダイアログが隠れた後に呼び出される関数オブジェクトを指定します。[/ja]
     * @description
     *   [en]Hide the dialog.[/en]
     *   [ja]ダイアログを閉じます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the hidden element[/en]
     *   [ja][/ja]
     */

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the dialog is visible or not.[/en]
     *   [ja]要素が見える場合に`true`。[/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the dialog is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

    /**
     * @property cancelable
     * @type {Boolean}
     * @description
     *   [en]Whether the dialog is cancelable or not. A cancelable dialog can be closed by tapping the background or by pressing the back button on Android devices.[/en]
     *   [ja][/ja]
     */

    /**
     * @param {String} name
     * @param {DialogAnimator} Animator
     */

  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme$8;
    }
  }, {
    key: '_mask',
    get: function get$$1() {
      return util.findChild(this, '.dialog-mask');
    }
  }, {
    key: '_dialog',
    get: function get$$1() {
      return util.findChild(this, '.dialog');
    }
  }], [{
    key: 'registerAnimator',
    value: function registerAnimator(name, Animator) {
      if (!(Animator.prototype instanceof DialogAnimator)) {
        throw new Error('"Animator" param must inherit OnsDialogElement.DialogAnimator');
      }
      _animatorDict$2[name] = Animator;
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict$2;
    }
  }, {
    key: 'DialogAnimator',
    get: function get$$1() {
      return DialogAnimator;
    }
  }]);
  return DialogElement;
}(BaseDialogElement);

customElements.define('ons-dialog', DialogElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var defaultClassName$5 = 'fab';

var scheme$9 = {
  '': 'fab--*',
  '.fab__icon': 'fab--*__icon'
};

/**
 * @element ons-fab
 * @category form
 * @description
 *   [en]
 *     The Floating action button is a circular button defined in the [Material Design specification](https://www.google.com/design/spec/components/buttons-floating-action-button.html). They are often used to promote the primary action of the app.
 *
 *     It can be displayed either as an inline element or in one of the corners. Normally it will be positioned in the lower right corner of the screen.
 *   [/en]
 *   [ja][/ja]
 * @tutorial vanilla/Reference/fab
 * @guide cross-platform-styling [en]Information about cross platform styling[/en][ja]Information about cross platform styling[/ja]
 * @seealso ons-speed-dial
 *   [en]The `<ons-speed-dial>` component is a Floating action button that displays a menu when tapped.[/en]
 *   [ja][/ja]
 */

var FabElement = function (_BaseElement) {
  inherits(FabElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *  [en]The appearance of the button.[/en]
   *  [ja]ボタンの表現を指定します。[/ja]
   */

  /**
   * @attribute ripple
   * @description
   *  [en]If this attribute is defined, the button will have a ripple effect when tapped.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute position
   * @type {String}
   * @description
   *  [en]The position of the button. Should be a string like `"bottom right"` or `"top left"`. If this attribute is not defined it will be displayed as an inline element.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute disabled
   * @description
   *   [en]Specify if button should be disabled.[/en]
   *   [ja]ボタンを無効化する場合は指定します。[/ja]
   */

  function FabElement() {
    classCallCheck(this, FabElement);

    // The following statements can be executed before contentReady
    // since these do not access the children
    var _this = possibleConstructorReturn(this, (FabElement.__proto__ || Object.getPrototypeOf(FabElement)).call(this));

    _this.hide();
    _this.classList.add(defaultClassName$5);

    contentReady(_this, function () {
      _this._compile();
    });
    return _this;
  }

  createClass(FabElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      if (!util.findChild(this, '.fab__icon')) {
        var content = document.createElement('span');
        content.classList.add('fab__icon');

        util.arrayFrom(this.childNodes).forEach(function (element) {
          if (!element.tagName || element.tagName.toLowerCase() !== 'ons-ripple') {
            content.appendChild(element);
          }
        });
        this.appendChild(content);
      }

      this._updateRipple();

      ModifierUtil.initModifier(this, scheme$9);

      this._updatePosition();
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this2 = this;

      setImmediate(function () {
        return _this2.show();
      });
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$5)) {
            this.className = defaultClassName$5 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$9);
          break;
        case 'ripple':
          this._updateRipple();
          break;
        case 'position':
          this._updatePosition();
          break;
      }
    }
  }, {
    key: '_show',
    value: function _show() {
      this.show();
    }
  }, {
    key: '_hide',
    value: function _hide() {
      var _this3 = this;

      setImmediate(function () {
        return _this3.hide();
      });
    }
  }, {
    key: '_updateRipple',
    value: function _updateRipple() {
      util.updateRipple(this);
    }
  }, {
    key: '_updatePosition',
    value: function _updatePosition() {
      var position = this.getAttribute('position');
      this.classList.remove('fab--top__left', 'fab--bottom__right', 'fab--bottom__left', 'fab--top__right', 'fab--top__center', 'fab--bottom__center');
      switch (position) {
        case 'top right':
        case 'right top':
          this.classList.add('fab--top__right');
          break;
        case 'top left':
        case 'left top':
          this.classList.add('fab--top__left');
          break;
        case 'bottom right':
        case 'right bottom':
          this.classList.add('fab--bottom__right');
          break;
        case 'bottom left':
        case 'left bottom':
          this.classList.add('fab--bottom__left');
          break;
        case 'center top':
        case 'top center':
          this.classList.add('fab--top__center');
          break;
        case 'center bottom':
        case 'bottom center':
          this.classList.add('fab--bottom__center');
          break;
        default:
          break;
      }
    }
  }, {
    key: '_getTranslate',
    value: function _getTranslate() {
      var isBottom = (this.getAttribute('position') || '').indexOf('bottom') >= 0;
      var translate = isBottom ? 'translate3d(0px, -' + (util.globals.fabOffset || 0) + 'px, 0px) ' : '';
      return translate;
    }

    /**
     * @method show
     * @signature show()
     * @description
     *  [en]Show the floating action button.[/en]
     *  [ja][/ja]
     */

  }, {
    key: 'show',
    value: function show() {
      var translate = this._getTranslate();
      this.style.transform = translate + 'scale(1)';
      this.style.webkitTransform = translate + 'scale(1)';
    }

    /**
     * @method hide
     * @signature hide()
     * @description
     *  [en]Hide the floating action button.[/en]
     *  [ja][/ja]
     */

  }, {
    key: 'hide',
    value: function hide() {
      var translate = this._getTranslate();
      this.style.transform = translate + 'scale(0)';
      this.style.webkitTransform = translate + 'scale(0)';
    }

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }, {
    key: 'toggle',


    /**
     * @method toggle
     * @signature toggle()
     * @description
     *   [en]Toggle the visibility of the button.[/en]
     *   [ja][/ja]
     */
    value: function toggle() {
      this.visible ? this.hide() : this.show();
    }
  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the element is visible or not.[/en]
     *   [ja]要素が見える場合に`true`。[/ja]
     */

  }, {
    key: 'visible',
    get: function get$$1() {
      return this.style.transform.indexOf('scale(0)') === -1 && this.style.display !== 'none';
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'ripple', 'position', 'class'];
    }
  }]);
  return FabElement;
}(BaseElement);

customElements.define('ons-fab', FabElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @element ons-gesture-detector
 * @category gesture
 * @description
 *   [en]
 *     Component to detect finger gestures within the wrapped element. Following gestures are supported:
 *     - Drag gestures: `drag`, `dragleft`, `dragright`, `dragup`, `dragdown`
 *     - Hold gestures: `hold`, `release`
 *     - Swipe gestures: `swipe`, `swipeleft`, `swiperight`, `swipeup`, `swipedown`
 *     - Tap gestures: `tap`, `doubletap`
 *     - Pinch gestures: `pinch`, `pinchin`, `pinchout`
 *     - Other gestures: `touch`, `transform`, `rotate`
 *   [/en]
 *   [ja]要素内のジェスチャー操作を検知します。詳しくはガイドを参照してください。[/ja]
 * @guide gesture-detector
 *   [en]Detecting finger gestures[/en]
 *   [ja]ジェスチャー操作の検知[/ja]
 * @example
 * <ons-gesture-detector>
 *   <div id="detect-area" style="width: 100px; height: 100px;">
 *     Swipe Here
 *   </div>
 * </ons-gesture-detector>
 *
 * <script>
 *   document.addEventListener('swipeleft', function(event) {
 *     if (event.target.matches('#detect-area')) {
 *       console.log('Swipe left is detected.');
 *     }
 *   });
 * </script>
 */

var GestureDetectorElement = function (_BaseElement) {
  inherits(GestureDetectorElement, _BaseElement);

  function GestureDetectorElement() {
    classCallCheck(this, GestureDetectorElement);

    var _this = possibleConstructorReturn(this, (GestureDetectorElement.__proto__ || Object.getPrototypeOf(GestureDetectorElement)).call(this));

    _this._gestureDetector = new GestureDetector(_this);
    return _this;
  }

  return GestureDetectorElement;
}(BaseElement);

customElements.define('ons-gesture-detector', GestureDetectorElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @element ons-icon
 * @category visual
 * @description
 *   [en]
 *     Displays an icon. The following icon suites are available:
 *
 *     * [Font Awesome](https://fortawesome.github.io/Font-Awesome/)
 *     * [Ionicons](http://ionicons.com/)
 *     * [Material Design Iconic Font](http://zavoloklom.github.io/material-design-iconic-font/)
 *   [/en]
 *   [ja][/ja]
 * @codepen xAhvg
 * @tutorial vanilla/Reference/icon
 * @guide cross-platform-styling [en]Information about cross platform styling[/en][ja]Information about cross platform styling[/ja]
 * @example
 * <ons-icon
 *   icon="md-car"
 *   size="20px"
 *   style="color: red">
 * </ons-icon>
 *
 * <ons-button>
 *   <ons-icon icon="md-car"></ons-icon>
 *   Car
 * </ons-button>
 */

var IconElement = function (_BaseElement) {
  inherits(IconElement, _BaseElement);

  /**
   * @attribute icon
   * @type {String}
   * @description
   *   [en]
   *     The icon name. `"md-"` prefix for Material Icons, `"fa-"` for Font Awesome and `"ion-"` prefix for Ionicons.
   *
   *     See all available icons on their respective sites:
   *
   *     * [Font Awesome](https://fortawesome.github.io/Font-Awesome/)
   *     * [Ionicons](http://ionicons.com)
   *     * [Material Design Iconic Font](http://zavoloklom.github.io/material-design-iconic-font/)
   *
   *     Icons can also be styled based on modifier presence. Add comma-separated icons with `"modifierName:"` prefix.
   *
   *     The code:
   *
   *     ```
   *     <ons-icon
   *       icon="ion-edit, material:md-edit">
   *     </ons-icon>
   *     ```
   *
   *     will display `"md-edit"` for Material Design and `"ion-edit"` as the default icon.
   *   [/en]
   *   [ja][/ja]
   */

  /**
   * @attribute size
   * @type {String}
   * @description
   *   [en]
   *     The sizes of the icon. Valid values are lg, 2x, 3x, 4x, 5x, or in the size in pixels.
   *     Icons can also be styled based on modifier presence. Add comma-separated icons with `"modifierName:"` prefix.
   *
   *     The code:
   *
   *     ```
   *     <ons-icon
   *       icon="ion-edit"
   *       size="32px, material:24px">
   *     </ons-icon>
   *     ```
   *
   *     will render as a `24px` icon if the `"material"` modifier is present and `32px` otherwise.
   *   [/en]
   *   [ja][/ja]
   */

  /**
   * @attribute rotate
   * @type {Number}
   * @description
   *   [en]Number of degrees to rotate the icon. Valid values are 90, 180 and 270.[/en]
   *   [ja]アイコンを回転して表示します。90, 180, 270から指定できます。[/ja]
   */

  /**
   * @attribute fixed-width
   * @type {Boolean}
   * @default false
   * @description
   *  [en]When used in a list, you want the icons to have the same width so that they align vertically by defining this attribute.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute spin
   * @description
   *   [en]Specify whether the icon should be spinning.[/en]
   *   [ja]アイコンを回転するかどうかを指定します。[/ja]
   */

  function IconElement() {
    classCallCheck(this, IconElement);

    var _this = possibleConstructorReturn(this, (IconElement.__proto__ || Object.getPrototypeOf(IconElement)).call(this));

    _this._compile();
    return _this;
  }

  createClass(IconElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      this._update();
    }
  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);
      this._update();
    }
  }, {
    key: '_update',
    value: function _update() {
      var _this2 = this;

      this._cleanClassAttribute();

      var _buildClassAndStyle2 = this._buildClassAndStyle(this._getAttribute('icon'), this._getAttribute('size')),
          classList = _buildClassAndStyle2.classList,
          style = _buildClassAndStyle2.style;

      util.extend(this.style, style);

      classList.forEach(function (className) {
        return _this2.classList.add(className);
      });
    }
  }, {
    key: '_getAttribute',
    value: function _getAttribute(attr) {
      var parts = (this.getAttribute(attr) || '').split(/\s*,\s*/);
      var def = parts[0];
      var md = parts[1];
      md = (md || '').split(/\s*:\s*/);
      return (util.hasModifier(this, md[0]) ? md[1] : def) || '';
    }

    /**
     * Remove unneeded class value.
     */

  }, {
    key: '_cleanClassAttribute',
    value: function _cleanClassAttribute() {
      var _this3 = this;

      util.arrayFrom(this.classList).filter(function (className) {
        return (/^(fa$|fa-|ion-|zmdi-)/.test(className)
        );
      }).forEach(function (className) {
        return _this3.classList.remove(className);
      });

      this.classList.remove('zmdi');
      this.classList.remove('ons-icon--ion');
    }
  }, {
    key: '_buildClassAndStyle',
    value: function _buildClassAndStyle(iconName, size) {
      var classList = ['ons-icon'];
      var style = {};

      // Icon
      if (iconName.indexOf('ion-') === 0) {
        classList.push(iconName);
        classList.push('ons-icon--ion');
      } else if (iconName.indexOf('fa-') === 0) {
        classList.push(iconName);
        classList.push('fa');
      } else if (iconName.indexOf('md-') === 0) {
        classList.push('zmdi');
        classList.push('zmdi-' + iconName.split(/\-(.+)?/)[1]);
      } else {
        classList.push('fa');
        classList.push('fa-' + iconName);
      }

      // Size
      if (size.match(/^[1-5]x|lg$/)) {
        classList.push('fa-' + size);
        this.style.removeProperty('font-size');
      } else {
        style.fontSize = size;
      }

      return {
        classList: classList,
        style: style
      };
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['icon', 'size', 'modifier', 'class'];
    }
  }]);
  return IconElement;
}(BaseElement);

customElements.define('ons-icon', IconElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @element ons-lazy-repeat
 * @category list
 * @description
 *   [en]
 *     Using this component a list with millions of items can be rendered without a drop in performance.
 *     It does that by "lazily" loading elements into the DOM when they come into view and
 *     removing items from the DOM when they are not visible.
 *   [/en]
 *   [ja]
 *     このコンポーネント内で描画されるアイテムのDOM要素の読み込みは、画面に見えそうになった時まで自動的に遅延され、
 *     画面から見えなくなった場合にはその要素は動的にアンロードされます。
 *     このコンポーネントを使うことで、パフォーマンスを劣化させること無しに巨大な数の要素を描画できます。
 *   [/ja]
 * @codepen QwrGBm
 * @tutorial vanilla/Reference/lazy-repeat
 * @seealso ons-list
 *   [en]The `<ons-list>` element is used to render a list.[/en]
 *   [ja]`<ons-list>`要素はリストを描画するのに使われます。[/ja]
 * @guide infinite-scroll
 *   [en]Loading more items on infinite scroll[/en]
 *   [ja]Loading more items on infinite scroll[/ja]
 * @example
 * <script>
 *   window.addEventListener('load', function() {
 *     var lazyRepeat = document.querySelector('#list');
 *     lazyRepeat.delegate = {
 *      createItemContent: function(i, template) {
 *        var dom = template.cloneNode(true);
 *        dom.innerText = i;
 *
 *        return dom;
 *      },
 *      countItems: function() {
 *        return 10000000;
 *      },
 *      destroyItem: function(index, item) {
 *        console.log('Destroyed item with index: ' + index);
 *      }
 *     };
 *   });
 * </script>
 *
 * <ons-list id="list">
 *   <ons-lazy-repeat>
 *     <ons-list-item></ons-list-item>
 *   </ons-lazy-repeat>
 * </ons-list>
 */

var LazyRepeatElement = function (_BaseElement) {
  inherits(LazyRepeatElement, _BaseElement);

  function LazyRepeatElement() {
    classCallCheck(this, LazyRepeatElement);
    return possibleConstructorReturn(this, (LazyRepeatElement.__proto__ || Object.getPrototypeOf(LazyRepeatElement)).apply(this, arguments));
  }

  createClass(LazyRepeatElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      // not very good idea and also not documented
      if (this.hasAttribute('delegate')) {
        this.delegate = window[this.getAttribute('delegate')];
      }
    }

    /**
     * @property delegate
     * @type {Object}
     * @description
     *  [en]Specify a delegate object to load and unload item elements.[/en]
     *  [ja]要素のロード、アンロードなどの処理を委譲するオブジェクトを指定します。[/ja]
     */

    /**
     * @property delegate.createItemContent
     * @type {Function}
     * @description
     *   [en]
     *     This function should return a `HTMLElement`.
     *
     *     To help rendering the element, the current index and a template is supplied as arguments. The template is the initial content of the `<ons-lazy-repeat>` element.
     *   [/en]
     *   [ja]
     *     この関数は`HTMLElement`を返してください。
     *     要素を生成しやすくするために、現在のアイテムのインデックスとテンプレートが引数に渡されます。
     *     このテンプレートは、`<ons-lazy-repeat>`要素のコンテンツが渡されます。
     *   [/ja]
     */

    /**
     * @property delegate.countItems
     * @type {Function}
     * @description
     *   [en]Should return the number of items in the list.[/en]
     *   [ja]リスト内のアイテム数を返してください。[/ja]
     */

    /**
     * @property delegate.calculateItemHeight
     * @type {Function}
     * @description
     *   [en]
     *     Should return the height of an item. The index is provided as an argument.
     *
     *     This is important when rendering lists where the items have different height.
     *
     *     The function is optional and if it isn't present the height of the first item will be automatically calculated and used for all other items.
     *   [/en]
     *   [ja]
     *     アイテムの高さ(ピクセル)を返してください。アイテムのインデックス値は引数で渡されます。
     *     この関数は、それぞれのアイムが違った高さを持つリストをレンダリングする際に重要です。
     *     この関数はオプショナルです。もしこの関数が無い場合には、
     *     最初のアイテムの高さが他のすべてのアイテムの高さとして利用されます。
     *   [/ja]
     */

    /**
     * @property delegate.destroyItem
     * @type {Function}
     * @description
     *   [en]
     *     This function is used called when an item is removed from the DOM. The index and DOM element is provided as arguments.
     *
     *     The function is optional but may be important in order to avoid memory leaks.
     *   [/en]
     *   [ja]
     *     この関数は、あるアイテムがDOMツリーから除かれた時に呼び出されます。
     *     アイテムのインデックス値とDOM要素が引数として渡されます。
     *     この関数はオプショナルですが、各アイテムの後処理が必要な場合にはメモリーリークを避けるために重要です。
     *   [/ja]
     */

  }, {
    key: 'refresh',


    /**
     * @method refresh
     * @signature refresh()
     * @description
     *   [en]Refresh the list. Use this method when the data has changed.[/en]
     *   [ja]リストを更新します。もしデータが変わった場合にはこのメソッドを使ってください。[/ja]
     */
    value: function refresh() {
      this._lazyRepeatProvider && this._lazyRepeatProvider.refresh();
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {}
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      if (this._lazyRepeatProvider) {
        this._lazyRepeatProvider.destroy();
        this._lazyRepeatProvider = null;
      }
    }
  }, {
    key: 'delegate',
    set: function set(userDelegate) {
      this._lazyRepeatProvider && this._lazyRepeatProvider.destroy();

      if (!this._templateElement && this.children[0]) {
        this._templateElement = this.removeChild(this.children[0]);
      }

      var delegate = new LazyRepeatDelegate(userDelegate, this._templateElement || null);
      this._lazyRepeatProvider = new LazyRepeatProvider(this.parentElement, delegate);
    },
    get: function get$$1() {
      throw new Error('This property can only be used to set the delegate object.');
    }
  }]);
  return LazyRepeatElement;
}(BaseElement);

customElements.define('ons-lazy-repeat', LazyRepeatElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$6 = 'list-header';
var scheme$10 = { '': 'list-header--*' };

/**
 * @element ons-list-header
 * @category list
 * @description
 *   [en]Header element for list items. Must be put inside the `<ons-list>` component.[/en]
 *   [ja]リスト要素に使用するヘッダー用コンポーネント。ons-listと共に使用します。[/ja]
 * @seealso ons-list
 *   [en]The `<ons-list>` component[/en]
 *   [ja]ons-listコンポーネント[/ja]
 * @seealso ons-list-item
 *   [en]The `<ons-list-item>` component[/en]
 *   [ja]ons-list-itemコンポーネント[/ja]
 * @guide lists [en]Using lists[/en][ja]リストを使う[/ja]
 * @codepen yxcCt
 * @tutorial vanilla/Reference/list
 * @modifier material
 *   [en]Display a Material Design list header.[/en]
 *   [ja][/ja]
 * @example
 * <ons-list>
 *   <ons-list-header>Header Text</ons-list-header>
 *   <ons-list-item>Item</ons-list-item>
 *   <ons-list-item>Item</ons-list-item>
 * </ons-list>
 */

var ListHeaderElement = function (_BaseElement) {
  inherits(ListHeaderElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the list header.[/en]
   *   [ja]ヘッダーの表現を指定します。[/ja]
   */

  function ListHeaderElement() {
    classCallCheck(this, ListHeaderElement);

    var _this = possibleConstructorReturn(this, (ListHeaderElement.__proto__ || Object.getPrototypeOf(ListHeaderElement)).call(this));

    _this._compile();
    return _this;
  }

  createClass(ListHeaderElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);
      this.classList.add(defaultClassName$6);
      ModifierUtil.initModifier(this, scheme$10);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$6)) {
            this.className = defaultClassName$6 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$10);
          break;
      }
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return ListHeaderElement;
}(BaseElement);

customElements.define('ons-list-header', ListHeaderElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$7 = 'list-title';
var scheme$11 = { '': 'list-title--*' };

/**
 * @element ons-list-title
 * @category list
 * @description
 *   [en]Represents a list title.[/en]
 *   [ja]リストのタイトルを表現します。[/ja]
 * @example
 * <ons-list-title>List Title</ons-list-title>
 * <ons-list>
 *   <ons-list-item>Item</ons-list-item>
 * </ons-list>
 * @modifier material
 *   [en]Display a Material Design list title.[/en]
 *   [ja][/ja]
 */

var ListTitleElement = function (_BaseElement) {
  inherits(ListTitleElement, _BaseElement);

  function ListTitleElement() {
    classCallCheck(this, ListTitleElement);

    var _this = possibleConstructorReturn(this, (ListTitleElement.__proto__ || Object.getPrototypeOf(ListTitleElement)).call(this));

    _this._compile();
    return _this;
  }

  createClass(ListTitleElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);
      this.classList.add(defaultClassName$7);
      ModifierUtil.initModifier(this, scheme$11);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$7)) {
            this.className = defaultClassName$7 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$11);
          break;
      }
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return ListTitleElement;
}(BaseElement);

customElements.define('ons-list-title', ListTitleElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$8 = 'list-item';
var scheme$12 = {
  '.list-item': 'list-item--*',
  '.list-item__left': 'list-item--*__left',
  '.list-item__center': 'list-item--*__center',
  '.list-item__right': 'list-item--*__right',
  '.list-item__label': 'list-item--*__label',
  '.list-item__title': 'list-item--*__title',
  '.list-item__subtitle': 'list-item--*__subtitle',
  '.list-item__thumbnail': 'list-item--*__thumbnail',
  '.list-item__icon': 'list-item--*__icon'
};

/**
 * @element ons-list-item
 * @category list
 * @modifier tappable
 *   [en]Make the list item change appearance when it's tapped. On iOS it is better to use the "tappable" and "tap-background-color" attribute for better behavior when scrolling.[/en]
 *   [ja]タップやクリックした時に効果が表示されるようになります。[/ja]
 * @modifier chevron
 *   [en]Display a chevron at the right end of the list item and make it change appearance when tapped.[/en]
 *   [ja][/ja]
 * @modifier longdivider
 *   [en]Displays a long horizontal divider between items.[/en]
 *   [ja][/ja]
 * @modifier nodivider
 *   [en]Removes the divider between list items.[/en]
 *   [ja][/ja]
 * @modifier material
 *   [en]Display a Material Design list item.[/en]
 *   [ja][/ja]
 * @description
 *   [en]
 *     Component that represents each item in a list. The list item is composed of three parts that are represented with the `left`, `center` and `right` classes. These classes can be used to ensure that the content of the list items is properly aligned.
 *
 *     ```
 *     <ons-list-item>
 *       <div class="left">Left</div>
 *       <div class="center">Center</div>
 *       <div class="right">Right</div>
 *     </ons-list-item>
 *     ```
 *
 *     There is also a number of classes (prefixed with `list-item__*`) that help when putting things like icons and thumbnails into the list items.
 *   [/en]
 *   [ja][/ja]
 * @seealso ons-list
 *   [en]ons-list component[/en]
 *   [ja]ons-listコンポーネント[/ja]
 * @seealso ons-list-header
 *   [en]ons-list-header component[/en]
 *   [ja]ons-list-headerコンポーネント[/ja]
 * @guide lists
 *   [en]Using lists[/en]
 *   [ja]リストを使う[/ja]
 * @codepen yxcCt
 * @tutorial vanilla/Reference/list
 * @example
 * <ons-list-item>
 *   <div class="left">
 *     <ons-icon icon="md-face" class="list-item__icon"></ons-icon>
 *   </div>
 *   <div class="center">
 *     <div class="list-item__title">Title</div>
 *     <div class="list-item__subtitle">Subtitle</div>
 *   </div>
 *   <div class="right">
 *     <ons-switch></ons-switch>
 *   </div>
 * </ons-list-item>
 */

var ListItemElement = function (_BaseElement) {
  inherits(ListItemElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the list item.[/en]
   *   [ja]各要素の表現を指定します。[/ja]
   */

  /**
   * @attribute lock-on-drag
   * @type {String}
   * @description
   *   [en]Prevent vertical scrolling when the user drags horizontally.[/en]
   *   [ja]この属性があると、ユーザーがこの要素を横方向にドラッグしている時に、縦方向のスクロールが起きないようになります。[/ja]
   */

  /**
   * @attribute tappable
   * @type {Boolean}
   * @description
   *   [en]Makes the element react to taps.[/en]
   *   [ja][/ja]
   */

  /**
   * @attribute tap-background-color
   * @type {Color}
   * @description
   *   [en] Changes the background color when tapped. For this to work, the attribute "tappable" needs to be set. The default color is "#d9d9d9". It will display as a ripple effect on Android.[/en]
   *   [ja][/ja]
   */

  function ListItemElement() {
    classCallCheck(this, ListItemElement);

    var _this = possibleConstructorReturn(this, (ListItemElement.__proto__ || Object.getPrototypeOf(ListItemElement)).call(this));

    contentReady(_this, function () {
      _this._compile();
    });
    return _this;
  }

  createClass(ListItemElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.classList.add(defaultClassName$8);

      var left = void 0,
          center = void 0,
          right = void 0;

      for (var i = 0; i < this.children.length; i++) {
        var el = this.children[i];

        if (el.classList.contains('left')) {
          el.classList.add('list-item__left');
          left = el;
        } else if (el.classList.contains('center')) {
          center = el;
        } else if (el.classList.contains('right')) {
          el.classList.add('list-item__right');
          right = el;
        }
      }

      if (!center) {
        center = document.createElement('div');

        if (!left && !right) {
          while (this.childNodes[0]) {
            center.appendChild(this.childNodes[0]);
          }
        } else {
          for (var _i = this.childNodes.length - 1; _i >= 0; _i--) {
            var _el = this.childNodes[_i];
            if (_el !== left && _el !== right) {
              center.insertBefore(_el, center.firstChild);
            }
          }
        }

        this.insertBefore(center, right || null);
      }

      center.classList.add('center');
      center.classList.add('list-item__center');

      this._updateRipple();

      ModifierUtil.initModifier(this, scheme$12);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$8)) {
            this.className = defaultClassName$8 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$12);
          break;
        case 'ripple':
          this._updateRipple();
          break;
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this.addEventListener('drag', this._onDrag);
      this.addEventListener('touchstart', this._onTouch);
      this.addEventListener('mousedown', this._onTouch);
      this.addEventListener('touchend', this._onRelease);
      this.addEventListener('touchmove', this._onRelease);
      this.addEventListener('touchcancel', this._onRelease);
      this.addEventListener('mouseup', this._onRelease);
      this.addEventListener('mouseout', this._onRelease);
      this.addEventListener('touchleave', this._onRelease);

      this._originalBackgroundColor = this.style.backgroundColor;

      this.tapped = false;
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this.removeEventListener('drag', this._onDrag);
      this.removeEventListener('touchstart', this._onTouch);
      this.removeEventListener('mousedown', this._onTouch);
      this.removeEventListener('touchend', this._onRelease);
      this.removeEventListener('touchmove', this._onRelease);
      this.removeEventListener('touchcancel', this._onRelease);
      this.removeEventListener('mouseup', this._onRelease);
      this.removeEventListener('mouseout', this._onRelease);
      this.removeEventListener('touchleave', this._onRelease);
    }
  }, {
    key: '_updateRipple',
    value: function _updateRipple() {
      util.updateRipple(this);
    }
  }, {
    key: '_onDrag',
    value: function _onDrag(event) {
      var gesture = event.gesture;
      // Prevent vertical scrolling if the users pans left or right.
      if (this._shouldLockOnDrag() && ['left', 'right'].indexOf(gesture.direction) > -1) {
        gesture.preventDefault();
      }
    }
  }, {
    key: '_onTouch',
    value: function _onTouch() {
      if (this.tapped) {
        return;
      }

      this.tapped = true;

      this.style.transition = this._transition;
      this.style.webkitTransition = this._transition;
      this.style.MozTransition = this._transition;

      if (this._tappable) {
        if (this.style.backgroundColor) {
          this._originalBackgroundColor = this.style.backgroundColor;
        }

        this.style.backgroundColor = this._tapBackgroundColor;
        this.style.boxShadow = '0px -1px 0px 0px ' + this._tapBackgroundColor;
      }
    }
  }, {
    key: '_onRelease',
    value: function _onRelease() {
      this.tapped = false;

      this.style.transition = '';
      this.style.webkitTransition = '';
      this.style.MozTransition = '';

      this.style.backgroundColor = this._originalBackgroundColor || '';
      this.style.boxShadow = '';
    }
  }, {
    key: '_shouldLockOnDrag',
    value: function _shouldLockOnDrag() {
      return this.hasAttribute('lock-on-drag');
    }
  }, {
    key: '_transition',
    get: function get$$1() {
      return 'background-color 0.0s linear 0.02s, box-shadow 0.0s linear 0.02s';
    }
  }, {
    key: '_tappable',
    get: function get$$1() {
      return this.hasAttribute('tappable');
    }
  }, {
    key: '_tapBackgroundColor',
    get: function get$$1() {
      return this.getAttribute('tap-background-color') || '#d9d9d9';
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class', 'ripple'];
    }
  }]);
  return ListItemElement;
}(BaseElement);

customElements.define('ons-list-item', ListItemElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$9 = 'list';
var scheme$13 = { '': 'list--*' };

/**
 * @element ons-list
 * @category list
 * @modifier inset
 *   [en]Inset list that doesn't cover the whole width of the parent.[/en]
 *   [ja]親要素の画面いっぱいに広がらないリストを表示します。[/ja]
 * @modifier noborder
 *   [en]A list with no borders at the top and bottom.[/en]
 *   [ja]リストの上下のボーダーが無いリストを表示します。[/ja]
 * @description
 *   [en]Component to define a list, and the container for ons-list-item(s).[/en]
 *   [ja]リストを表現するためのコンポーネント。ons-list-itemのコンテナとして使用します。[/ja]
 * @seealso ons-list-item
 *   [en]ons-list-item component[/en]
 *   [ja]ons-list-itemコンポーネント[/ja]
 * @seealso ons-list-header
 *   [en]ons-list-header component[/en]
 *   [ja]ons-list-headerコンポーネント[/ja]
 * @seealso ons-lazy-repeat
 *   [en]ons-lazy-repeat component[/en]
 *   [ja]ons-lazy-repeatコンポーネント[/ja]
 * @guide lists
 *   [en]Using lists[/en]
 *   [ja]リストを使う[/ja]
 * @guide infinite-scroll
 *   [en]Loading more items on infinite scroll[/en]
 *   [ja]Loading more items on infinite scroll[/ja]
 * @codepen yxcCt
 * @tutorial vanilla/Reference/list
 * @example
 * <ons-list>
 *   <ons-list-header>Header Text</ons-list-header>
 *   <ons-list-item>Item</ons-list-item>
 *   <ons-list-item>Item</ons-list-item>
 * </ons-list>
 */

var ListElement = function (_BaseElement) {
  inherits(ListElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the list.[/en]
   *   [ja]リストの表現を指定します。[/ja]
   */

  function ListElement() {
    classCallCheck(this, ListElement);

    var _this = possibleConstructorReturn(this, (ListElement.__proto__ || Object.getPrototypeOf(ListElement)).call(this));

    _this._compile();
    return _this;
  }

  createClass(ListElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);
      this.classList.add(defaultClassName$9);
      ModifierUtil.initModifier(this, scheme$13);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$9)) {
            this.className = defaultClassName$9 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$13);
          break;
      }
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return ListElement;
}(BaseElement);

customElements.define('ons-list', ListElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var INPUT_ATTRIBUTES = ['autocapitalize', 'autocomplete', 'autocorrect', 'autofocus', 'disabled', 'inputmode', 'max', 'maxlength', 'min', 'minlength', 'name', 'pattern', 'placeholder', 'readonly', 'size', 'step', 'validator', 'value'];

var BaseInputElement = function (_BaseElement) {
  inherits(BaseInputElement, _BaseElement);
  createClass(BaseInputElement, [{
    key: '_update',
    value: function _update() {} // Optionally implemented

  }, {
    key: '_scheme',
    get: function get$$1() {
      throw new Error('_scheme getter must be implemented.');
    }
  }, {
    key: '_template',
    get: function get$$1() {
      throw new Error('_template getter must be implemented.');
    }
  }, {
    key: 'type',
    get: function get$$1() {
      throw new Error('type getter must be implemented.');
    }
  }]);

  function BaseInputElement() {
    classCallCheck(this, BaseInputElement);

    var _this = possibleConstructorReturn(this, (BaseInputElement.__proto__ || Object.getPrototypeOf(BaseInputElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });
    _this._boundDelegateEvent = _this._delegateEvent.bind(_this);
    return _this;
  }

  createClass(BaseInputElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);
      this._defaultElementClass && this.classList.add(this._defaultElementClass);

      if (this.children.length !== 0) {
        return;
      }

      this.appendChild(util.createFragment(this._template).cloneNode(true));

      this._setInputId();
      this._updateBoundAttributes();

      ModifierUtil.initModifier(this, this._scheme);
    }
  }, {
    key: '_updateBoundAttributes',
    value: function _updateBoundAttributes() {
      var _this2 = this;

      INPUT_ATTRIBUTES.forEach(function (attr) {
        if (_this2.hasAttribute(attr)) {
          _this2._input.setAttribute(attr, _this2.getAttribute(attr));
        } else {
          _this2._input.removeAttribute(attr);
        }
      });

      this._update();
    }
  }, {
    key: '_delegateEvent',
    value: function _delegateEvent(event) {
      var e = new CustomEvent(event.type, {
        bubbles: false,
        cancelable: true
      });

      return this.dispatchEvent(e);
    }
  }, {
    key: '_setInputId',
    value: function _setInputId() {
      if (this.hasAttribute('input-id')) {
        this._input.id = this.getAttribute('input-id');
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this3 = this;

      contentReady(this, function () {
        _this3._input.addEventListener('focus', _this3._boundDelegateEvent);
        _this3._input.addEventListener('blur', _this3._boundDelegateEvent);
      });
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      var _this4 = this;

      contentReady(this, function () {
        _this4._input.removeEventListener('focus', _this4._boundDelegateEvent);
        _this4._input.removeEventListener('blur', _this4._boundDelegateEvent);
      });
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      var _this5 = this;

      switch (name) {
        case 'modifier':
          contentReady(this, function () {
            return ModifierUtil.onModifierChanged(last, current, _this5, _this5._scheme);
          });
          break;
        case 'input-id':
          contentReady(this, function () {
            return _this5._setInputId();
          });
          break;
        case 'class':
          if (this._defaultElementClass && !this.classList.contains(this._defaultElementClass)) {
            this.className = this._defaultElementClass + ' ' + current;
          }
          break;
      }

      if (INPUT_ATTRIBUTES.indexOf(name) >= 0) {
        contentReady(this, function () {
          return _this5._updateBoundAttributes();
        });
      }
    }
  }, {
    key: '_defaultElementClass',
    get: function get$$1() {
      return '';
    }
  }, {
    key: '_input',
    get: function get$$1() {
      return this.querySelector('input');
    }
  }, {
    key: 'value',
    get: function get$$1() {
      return this._input === null ? this.getAttribute('value') : this._input.value;
    },
    set: function set(val) {
      var _this6 = this;

      contentReady(this, function () {
        if (val instanceof Date) {
          val = val.toISOString().substring(0, 10);
        }
        _this6._input.value = val;
        _this6._update();
      });
    }
  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'input-id', 'class'].concat(INPUT_ATTRIBUTES);
    }
  }]);
  return BaseInputElement;
}(BaseElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var scheme$14 = {
  '.text-input': 'text-input--*',
  '.text-input__label': 'text-input--*__label'
};

/**
 * @element ons-input
 * @category form
 * @modifier material
 *  [en]Displays a Material Design input.[/en]
 *  [ja][/ja]
 * @modifier underbar
 *  [en]Displays a horizontal line underneath a text input.[/en]
 *  [ja][/ja]
 * @modifier transparent
 *  [en]Displays a transparent input. Works for Material Design.[/en]
 *  [ja][/ja]
 * @description
 *  [en]
 *    An input element. The `type` attribute can be used to change the input type. All text input types are supported.
 *
 *    The component will automatically render as a Material Design input on Android devices.
 *
 *    Most attributes that can be used for a normal `<input>` element can also be used on the `<ons-input>` element.
 *  [/en]
 *  [ja][/ja]
 * @tutorial vanilla/Reference/input
 * @seealso ons-checkbox
 *   [en]The `<ons-checkbox>` element is used to display a checkbox.[/en]
 *   [ja][/ja]
 * @seealso ons-radio
 *   [en]The `<ons-radio>` element is used to display a radio button.[/en]
 *   [ja][/ja]
 * @seealso ons-range
 *   [en]The `<ons-range>` element is used to display a range slider.[/en]
 *   [ja][/ja]
 * @seealso ons-switch
 *   [en]The `<ons-switch>` element is used to display a draggable toggle switch.[/en]
 *   [ja][/ja]
 * @seealso ons-select
 *   [en]The `<ons-select>` element is used to display a select box.[/en]
 *   [ja][/ja]
 * @guide adding-page-content
 *   [en]Using form components[/en]
 *   [ja]フォームを使う[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @example
 * <ons-input placeholder="Username" float></ons-input>
 */

var InputElement = function (_BaseInputElement) {
  inherits(InputElement, _BaseInputElement);

  function InputElement() {
    classCallCheck(this, InputElement);

    var _this = possibleConstructorReturn(this, (InputElement.__proto__ || Object.getPrototypeOf(InputElement)).call(this));

    _this._boundOnInput = _this._update.bind(_this);
    _this._boundOnFocusin = _this._update.bind(_this);
    return _this;
  }

  /* Inherited props */

  createClass(InputElement, [{
    key: '_update',
    value: function _update() {
      this._updateLabel();
      this._updateLabelClass();
    }
  }, {
    key: '_updateLabel',


    /* Own props */

    value: function _updateLabel() {
      var label = this.getAttribute('placeholder') || '';

      if (typeof this._helper.textContent !== 'undefined') {
        this._helper.textContent = label;
      } else {
        this._helper.innerText = label;
      }
    }
  }, {
    key: '_updateLabelClass',
    value: function _updateLabelClass() {
      if (this.value === '') {
        this._helper.classList.remove('text-input--material__label--active');
      } else {
        this._helper.classList.add('text-input--material__label--active');
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this2 = this;

      get(InputElement.prototype.__proto__ || Object.getPrototypeOf(InputElement.prototype), 'connectedCallback', this).call(this);

      contentReady(this, function () {
        _this2._input.addEventListener('input', _this2._boundOnInput);
        _this2._input.addEventListener('focusin', _this2._boundOnFocusin);
      });

      var type = this.getAttribute('type');
      if (['checkbox', 'radio'].indexOf(type) >= 0) {
        util.warn('Warn: <ons-input type="' + type + '"> is deprecated since v2.4.0. Use <ons-' + type + '> instead.');
      }
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      var _this3 = this;

      get(InputElement.prototype.__proto__ || Object.getPrototypeOf(InputElement.prototype), 'disconnectedCallback', this).call(this);

      contentReady(this, function () {
        _this3._input.removeEventListener('input', _this3._boundOnInput);
        _this3._input.removeEventListener('focusin', _this3._boundOnFocusin);
      });
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      var _this4 = this;

      switch (name) {
        case 'type':
          contentReady(this, function () {
            return _this4._input.setAttribute('type', _this4.type);
          });
          break;
        default:
          get(InputElement.prototype.__proto__ || Object.getPrototypeOf(InputElement.prototype), 'attributeChangedCallback', this).call(this, name, last, current);
      }
    }

    /**
     * @attribute placeholder
     * @type {String}
     * @description
     *   [en]Placeholder text. In Material Design, this placeholder will be a floating label.[/en]
     *   [ja][/ja]
     */

    /**
     * @attribute float
     * @description
     *  [en]If this attribute is present, the placeholder will be animated in Material Design.[/en]
     *  [ja]この属性が設定された時、ラベルはアニメーションするようになります。[/ja]
     */

    /**
     * @attribute type
     * @type {String}
     * @description
     *  [en]
     *    Specify the input type. This is the same as the "type" attribute for normal inputs. It expects strict text types such as `text`, `password`, etc. For checkbox, radio button, select or range, please have a look at the corresponding elements.
     *
     *    Please take a look at [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type) for an exhaustive list of possible values. Depending on the platform and browser version some of these might not work.
     *  [/en]
     *  [ja][/ja]
     */

    /**
     * @attribute input-id
     * @type {String}
     * @description
     *  [en]Specify the "id" attribute of the inner `<input>` element. This is useful when using `<label for="...">` elements.[/en]
     *  [ja][/ja]
     */

    /**
     * @property value
     * @type {String}
     * @description
     *   [en]The current value of the input.[/en]
     *   [ja][/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the input is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme$14;
    }
  }, {
    key: '_template',
    get: function get$$1() {
      return '\n      <input type="' + this.type + '" class="text-input">\n      <span class="text-input__label"></span>\n    ';
    }
  }, {
    key: 'type',
    get: function get$$1() {
      var type = this.getAttribute('type');
      return ['checkbox', 'radio'].indexOf(type) < 0 && type || 'text';
    }
  }, {
    key: '_helper',
    get: function get$$1() {
      return this.querySelector('span');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return [].concat(toConsumableArray(get(InputElement.__proto__ || Object.getPrototypeOf(InputElement), 'observedAttributes', this)), ['type']);
    }
  }]);
  return InputElement;
}(BaseInputElement);

customElements.define('ons-input', InputElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var BaseCheckboxElement = function (_BaseInputElement) {
  inherits(BaseCheckboxElement, _BaseInputElement);

  function BaseCheckboxElement() {
    classCallCheck(this, BaseCheckboxElement);

    var _this = possibleConstructorReturn(this, (BaseCheckboxElement.__proto__ || Object.getPrototypeOf(BaseCheckboxElement)).call(this));

    contentReady(_this, function () {
      _this.attributeChangedCallback('checked', null, _this.getAttribute('checked'));
    });
    return _this;
  }

  /* Inherited props */

  createClass(BaseCheckboxElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'checked':
          this.checked = current !== null;
          break;
        default:
          get(BaseCheckboxElement.prototype.__proto__ || Object.getPrototypeOf(BaseCheckboxElement.prototype), 'attributeChangedCallback', this).call(this, name, last, current);
      }
    }
  }, {
    key: '_template',
    get: function get$$1() {
      return '\n      <input type="' + this.type + '" class="' + this._defaultElementClass + '__input">\n      <span class="' + this._defaultElementClass + '__checkmark"></span>\n    ';
    }

    /* Own props */

  }, {
    key: '_helper',
    get: function get$$1() {
      return this.querySelector('span');
    }
  }, {
    key: 'checked',
    get: function get$$1() {
      return this._input.checked;
    },
    set: function set(val) {
      var _this2 = this;

      contentReady(this, function () {
        _this2._input.checked = val;
      });
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return [].concat(toConsumableArray(get(BaseCheckboxElement.__proto__ || Object.getPrototypeOf(BaseCheckboxElement), 'observedAttributes', this)), ['checked']);
    }
  }]);
  return BaseCheckboxElement;
}(BaseInputElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var scheme$15 = {
  '.checkbox': 'checkbox--*',
  '.checkbox__input': 'checkbox--*__input',
  '.checkbox__checkmark': 'checkbox--*__checkmark'
};

/**
 * @element ons-checkbox
 * @category form
 * @modifier material
 *  [en]Displays a Material Design checkbox.[/en]
 *  [ja][/ja]
 * @description
 *  [en]
 *    A checkbox element. The component will automatically render as a Material Design checkbox on Android devices.
 *
 *    Most attributes that can be used for a normal `<input type="checkbox">` element can also be used on the `<ons-checkbox>` element.
 *  [/en]
 *  [ja][/ja]
 * @tutorial vanilla/Reference/input
 * @seealso ons-switch
 *   [en]The `<ons-switch>` element is used to display a draggable toggle switch.[/en]
 *   [ja][/ja]
 * @seealso ons-radio
 *   [en]The `<ons-radio>` element is used to display a radio button.[/en]
 *   [ja][/ja]
 * @seealso ons-input
 *   [en]The `<ons-input>` element is used to display a text input.[/en]
 *   [ja][/ja]
 * @seealso ons-search-input
 *   [en]The `<ons-search-input>` element is used to display a search input.[/en]
 *   [ja][/ja]
 * @seealso ons-range
 *   [en]The `<ons-range>` element is used to display a range slider.[/en]
 *   [ja][/ja]
 * @seealso ons-select
 *   [en]The `<ons-select>` element is used to display a select box.[/en]
 *   [ja][/ja]
 * @guide adding-page-content
 *   [en]Using form components[/en]
 *   [ja]フォームを使う[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @example
 * <ons-checkbox checked></ons-checkbox>
 */

var CheckboxElement = function (_BaseCheckboxElement) {
  inherits(CheckboxElement, _BaseCheckboxElement);

  function CheckboxElement() {
    classCallCheck(this, CheckboxElement);
    return possibleConstructorReturn(this, (CheckboxElement.__proto__ || Object.getPrototypeOf(CheckboxElement)).apply(this, arguments));
  }

  createClass(CheckboxElement, [{
    key: '_scheme',
    get: function get$$1() {
      return scheme$15;
    }
  }, {
    key: '_defaultElementClass',
    get: function get$$1() {
      return 'checkbox';
    }
  }, {
    key: 'type',
    get: function get$$1() {
      return 'checkbox';
    }

    /**
     * @attribute input-id
     * @type {String}
     * @description
     *  [en]Specify the "id" attribute of the inner `<input>` element. This is useful when using `<label for="...">` elements.[/en]
     *  [ja][/ja]
     */

    /**
     * @property value
     * @type {String}
     * @description
     *   [en]The current value of the checkbox.[/en]
     *   [ja][/ja]
     */

    /**
     * @property checked
     * @type {Boolean}
     * @description
     *   [en]Whether the checkbox is checked or not.[/en]
     *   [ja][/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the checkbox is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }]);
  return CheckboxElement;
}(BaseCheckboxElement);

customElements.define('ons-checkbox', CheckboxElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var scheme$16 = {
  '.radio-button': 'radio-button--*',
  '.radio-button__input': 'radio-button--*__input',
  '.radio-button__checkmark': 'radio-button--*__checkmark'
};

/**
 * @element ons-radio
 * @category form
 * @modifier material
 *  [en]Displays a Material Design radio button.[/en]
 *  [ja][/ja]
 * @description
 *  [en]
 *    A radio button element. The component will automatically render as a Material Design radio button on Android devices.
 *
 *    Most attributes that can be used for a normal `<input type="radio">` element can also be used on the `<ons-radio>` element.
 *  [/en]
 *  [ja][/ja]
 * @tutorial vanilla/Reference/input
 * @seealso ons-select
 *   [en]The `<ons-select>` element is used to display a select box.[/en]
 *   [ja][/ja]
 * @seealso ons-checkbox
 *   [en]The `<ons-checkbox>` element is used to display a checkbox.[/en]
 *   [ja][/ja]
 * @seealso ons-switch
 *   [en]The `<ons-switch>` element is used to display a draggable toggle switch.[/en]
 *   [ja][/ja]
 * @seealso ons-input
 *   [en]The `<ons-input>` element is used to display a text input.[/en]
 *   [ja][/ja]
 * @seealso ons-search-input
 *   [en]The `<ons-search-input>` element is used to display a search input.[/en]
 *   [ja][/ja]
 * @seealso ons-range
 *   [en]The `<ons-range>` element is used to display a range slider.[/en]
 *   [ja][/ja]
 * @guide adding-page-content
 *   [en]Using form components[/en]
 *   [ja]フォームを使う[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @example
 * <ons-radio checked></ons-radio>
 */

var RadioElement = function (_BaseCheckboxElement) {
  inherits(RadioElement, _BaseCheckboxElement);

  function RadioElement() {
    classCallCheck(this, RadioElement);
    return possibleConstructorReturn(this, (RadioElement.__proto__ || Object.getPrototypeOf(RadioElement)).apply(this, arguments));
  }

  createClass(RadioElement, [{
    key: '_scheme',
    get: function get$$1() {
      return scheme$16;
    }
  }, {
    key: '_defaultElementClass',
    get: function get$$1() {
      return 'radio-button';
    }
  }, {
    key: 'type',
    get: function get$$1() {
      return 'radio';
    }

    /**
     * @attribute input-id
     * @type {String}
     * @description
     *  [en]Specify the "id" attribute of the inner `<input>` element. This is useful when using `<label for="...">` elements.[/en]
     *  [ja][/ja]
     */

    /**
     * @property value
     * @type {String}
     * @description
     *   [en]The current value of the radio button.[/en]
     *   [ja][/ja]
     */

    /**
     * @property checked
     * @type {Boolean}
     * @description
     *   [en]Whether the radio button is checked or not.[/en]
     *   [ja][/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the radio button is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }]);
  return RadioElement;
}(BaseCheckboxElement);

customElements.define('ons-radio', RadioElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var scheme$17 = {
  '.search-input': 'search-input--*'
};

/**
 * @element ons-search-input
 * @category form
 * @modifier material
 *  [en]Displays a Material Design search input.[/en]
 *  [ja][/ja]
 * @description
 *  [en]
 *    A search input element. The component will automatically render as a Material Design search input on Android devices.
 *
 *    Most attributes that can be used for a normal `<input>` element can also be used on the `<ons-search-input>` element.
 *  [/en]
 *  [ja][/ja]
 * @tutorial vanilla/Reference/input
 * @seealso ons-input
 *   [en]The `<ons-input>` element is used to display a text input.[/en]
 *   [ja][/ja]
 * @seealso ons-range
 *   [en]The `<ons-range>` element is used to display a range slider.[/en]
 *   [ja][/ja]
 * @seealso ons-switch
 *   [en]The `<ons-switch>` element is used to display a draggable toggle switch.[/en]
 *   [ja][/ja]
 * @seealso ons-select
 *   [en]The `<ons-select>` element is used to display a select box.[/en]
 *   [ja][/ja]
 * @seealso ons-checkbox
 *   [en]The `<ons-checkbox>` element is used to display a checkbox.[/en]
 *   [ja][/ja]
 * @seealso ons-radio
 *   [en]The `<ons-radio>` element is used to display a radio button.[/en]
 *   [ja][/ja]
 * @guide adding-page-content
 *   [en]Using form components[/en]
 *   [ja]フォームを使う[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @example
 * <ons-search-input placeholder="Search"></ons-search-input>
 */

var SearchInputElement = function (_BaseInputElement) {
  inherits(SearchInputElement, _BaseInputElement);

  function SearchInputElement() {
    classCallCheck(this, SearchInputElement);
    return possibleConstructorReturn(this, (SearchInputElement.__proto__ || Object.getPrototypeOf(SearchInputElement)).apply(this, arguments));
  }

  createClass(SearchInputElement, [{
    key: '_scheme',
    get: function get$$1() {
      return scheme$17;
    }
  }, {
    key: '_template',
    get: function get$$1() {
      return '\n      <input type="' + this.type + '" class="search-input">\n    ';
    }
  }, {
    key: 'type',
    get: function get$$1() {
      return 'search';
    }

    /**
     * @attribute input-id
     * @type {String}
     * @description
     *  [en]Specify the "id" attribute of the inner `<input>` element. This is useful when using `<label for="...">` elements.[/en]
     *  [ja][/ja]
     */

    /**
     * @property value
     * @type {String}
     * @description
     *   [en]The current value of the input.[/en]
     *   [ja][/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the input is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }]);
  return SearchInputElement;
}(BaseInputElement);

customElements.define('ons-search-input', SearchInputElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var ModalAnimator = function (_BaseAnimator) {
  inherits(ModalAnimator, _BaseAnimator);

  /**
   * @param {Object} options
   * @param {String} options.timing
   * @param {Number} options.duration
   * @param {Number} options.delay
   */
  function ModalAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.2 : _ref$duration;

    classCallCheck(this, ModalAnimator);
    return possibleConstructorReturn(this, (ModalAnimator.__proto__ || Object.getPrototypeOf(ModalAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} modal
   * @param {Function} callback
   */


  createClass(ModalAnimator, [{
    key: 'show',
    value: function show(modal, callback) {
      callback();
    }

    /**
     * @param {HTMLElement} modal
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(modal, callback) {
      callback();
    }
  }]);
  return ModalAnimator;
}(BaseAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * iOS style animator for dialog.
 */

var FadeModalAnimator = function (_ModalAnimator) {
  inherits(FadeModalAnimator, _ModalAnimator);

  function FadeModalAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.3 : _ref$duration;

    classCallCheck(this, FadeModalAnimator);
    return possibleConstructorReturn(this, (FadeModalAnimator.__proto__ || Object.getPrototypeOf(FadeModalAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} modal
   * @param {Function} callback
   */


  createClass(FadeModalAnimator, [{
    key: 'show',
    value: function show(modal, callback) {
      callback = callback ? callback : function () {};

      Animit(modal).queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }).queue(function (done) {
        callback();
        done();
      }).play();
    }

    /**
     * @param {HTMLElement} modal
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(modal, callback) {
      callback = callback ? callback : function () {};

      Animit(modal).queue({
        opacity: 1
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }).queue(function (done) {
        callback();
        done();
      }).play();
    }
  }]);
  return FadeModalAnimator;
}(ModalAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * iOS style animator for modal.
 */

var LiftModalAnimator = function (_ModalAnimator) {
  inherits(LiftModalAnimator, _ModalAnimator);

  function LiftModalAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier( .1, .7, .1, 1)' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.4 : _ref$duration;

    classCallCheck(this, LiftModalAnimator);
    return possibleConstructorReturn(this, (LiftModalAnimator.__proto__ || Object.getPrototypeOf(LiftModalAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} modal
   * @param {Function} callback
   */


  createClass(LiftModalAnimator, [{
    key: 'show',
    value: function show(modal, callback) {
      callback = callback ? callback : function () {};

      Animit(modal).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 100%, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }).play();
    }

    /**
     * @param {HTMLElement} modal
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(modal, callback) {
      callback = callback ? callback : function () {};

      Animit(modal).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 0, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 100%, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }).play();
    }
  }]);
  return LiftModalAnimator;
}(ModalAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$18 = {
  '': 'modal--*',
  'modal__content': 'modal--*__content'
};

var defaultClassName$10 = 'modal';

var _animatorDict$3 = {
  'default': ModalAnimator,
  'fade': FadeModalAnimator,
  'lift': LiftModalAnimator,
  'none': ModalAnimator
};

/**
 * @element ons-modal
 * @category dialog
 * @description
 *   [en]
 *     Modal component that masks current screen. Underlying components are not subject to any events while the modal component is shown.
 *
 *     This component can be used to block user input while some operation is running or to show some information to the user.
 *   [/en]
 *   [ja]
 *     画面全体をマスクするモーダル用コンポーネントです。下側にあるコンポーネントは、
 *     モーダルが表示されている間はイベント通知が行われません。
 *   [/ja]
 * @guide dialogs
 *   [en]Dialog components[/en]
 *   [ja]Dialog components[/ja]
 * @seealso ons-dialog
 *   [en]The `<ons-dialog>` component can be used to create a modal dialog.[/en]
 *   [ja][/ja]
 * @codepen devIg
 * @tutorial vanilla/reference/modal
 * @example
 * <ons-modal id="modal">
 *   Modal content
 * </ons-modal>
 * <script>
 *   var modal = document.getElementById('modal');
 *   modal.show();
 * </script>
 */

var ModalElement = function (_BaseDialogElement) {
  inherits(ModalElement, _BaseDialogElement);

  /**
   * @attribute animation
   * @type {String}
   * @default default
   * @description
   *  [en]The animation used when showing and hiding the modal. Can be either `"none"` or `"fade"`.[/en]
   *  [ja]モーダルを表示する際のアニメーション名を指定します。"none"もしくは"fade"を指定できます。[/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/ja]
   */

  function ModalElement() {
    classCallCheck(this, ModalElement);

    var _this = possibleConstructorReturn(this, (ModalElement.__proto__ || Object.getPrototypeOf(ModalElement)).call(this));

    _this._defaultDBB = function () {
      return undefined;
    };
    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  createClass(ModalElement, [{
    key: '_updateAnimatorFactory',
    value: function _updateAnimatorFactory() {
      return new AnimatorFactory({
        animators: _animatorDict$3,
        baseClass: ModalAnimator,
        baseClassName: 'ModalAnimator',
        defaultAnimation: this.getAttribute('animation')
      });
    }

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

  }, {
    key: '_compile',
    value: function _compile() {
      this.style.display = 'none';
      this.style.zIndex = 10001;
      this.classList.add(defaultClassName$10);

      if (!util.findChild(this, '.modal__content')) {
        var content = document.createElement('div');
        content.classList.add('modal__content');

        while (this.childNodes[0]) {
          var node = this.childNodes[0];
          this.removeChild(node);
          content.insertBefore(node, null);
        }

        this.appendChild(content);
      }

      ModifierUtil.initModifier(this, this._scheme);
    }
  }, {
    key: '_toggleStyle',
    value: function _toggleStyle(shouldShow) {
      this.style.display = shouldShow ? 'table' : 'none';
    }

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the element is visible or not.[/en]
     *   [ja]要素が見える場合に`true`。[/ja]
     */

    /**
     * @method show
     * @signature show([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"none"` and `"fade"`.[/en]
     *   [ja]アニメーション名を指定します。"none", "fade"のいずれかを指定します。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @description
     *   [en]Show modal.[/en]
     *   [ja]モーダルを表示します。[/ja]
     * @return {Promise}
     *   [en]Resolves to the displayed element[/en]
     *   [ja][/ja]
     */

    /**
     * @method toggle
     * @signature toggle([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"none"` and `"fade"`.[/en]
     *   [ja]アニメーション名を指定します。"none", "fade"のいずれかを指定します。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @description
     *   [en]Toggle modal visibility.[/en]
     *   [ja]モーダルの表示を切り替えます。[/ja]
     */

    /**
     * @method hide
     * @signature hide([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"none"` and `"fade"`.[/en]
     *   [ja]アニメーション名を指定します。"none", "fade"のいずれかを指定します。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @description
     *   [en]Hide modal.[/en]
     *   [ja]モーダルを非表示にします。[/ja]
     * @return {Promise}
     *   [en]Resolves to the hidden element[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'class') {
        if (!this.classList.contains(defaultClassName$10)) {
          this.className = defaultClassName$10 + ' ' + current;
        }
      } else {
        get(ModalElement.prototype.__proto__ || Object.getPrototypeOf(ModalElement.prototype), 'attributeChangedCallback', this).call(this, name, last, current);
      }
    }

    /**
     * @param {String} name
     * @param {Function} Animator
     */

  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme$18;
    }
  }], [{
    key: 'registerAnimator',
    value: function registerAnimator(name, Animator) {
      if (!(Animator.prototype instanceof ModalAnimator)) {
        throw new Error('"Animator" param must inherit OnsModalElement.ModalAnimator');
      }
      _animatorDict$3[name] = Animator;
    }
  }, {
    key: 'observedAttributes',
    get: function get$$1() {
      return [].concat(toConsumableArray(get(ModalElement.__proto__ || Object.getPrototypeOf(ModalElement), 'observedAttributes', this)), ['class']);
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict$3;
    }
  }, {
    key: 'ModalAnimator',
    get: function get$$1() {
      return ModalAnimator;
    }
  }]);
  return ModalElement;
}(BaseDialogElement);

customElements.define('ons-modal', ModalElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var widthToPx = function widthToPx(width) {
  var _ref = [parseInt(width, 10), /px/.test(width)],
      value = _ref[0],
      px = _ref[1];

  return px ? value : Math.round(document.body.offsetWidth * value / 100);
};

var SwipeReveal = function () {
  function SwipeReveal(params) {
    var _this = this;

    classCallCheck(this, SwipeReveal);

    this.element = params.element;
    this.elementHandler = params.elementHandler || params.element;
    this.animator = params.animator;
    this.getThreshold = params.getThreshold;
    this.ignoreSwipe = params.ignoreSwipe;
    this.getAnimationElements = params.getAnimationElements;
    this.onDragCallback = params.onDrag;
    this.swipeMax = params.swipeMax;
    this.swipeMin = params.swipeMin || function () {
      var _animator;

      return (_animator = _this.animator).restore.apply(_animator, toConsumableArray(_this.getAnimationElements()));
    };
    this.swipeMid = params.swipeMid || function () {
      var _animator2;

      return (_animator2 = _this.animator).translate.apply(_animator2, [_this._distance, _this._width].concat(toConsumableArray(_this.getAnimationElements())));
    };
    this.side = params.side || 'left';

    this.boundHandleGesture = this.handleGesture.bind(this);
  }

  createClass(SwipeReveal, [{
    key: 'update',
    value: function update() {
      var swipeable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.element.hasAttribute('swipeable');

      if (!this.gestureDetector) {
        this.gestureDetector = new GestureDetector(this.elementHandler, { dragMinDistance: 1 });
      }

      var action = swipeable ? 'on' : 'off';
      this.gestureDetector[action]('drag dragstart dragend', this.boundHandleGesture);
    }
  }, {
    key: 'handleGesture',
    value: function handleGesture(e) {
      if (e.type === 'dragstart') {
        this.onDragStart(e);
      } else if (!this._ignoreDrag) {
        e.type === 'dragend' ? this.onDragEnd(e) : this.onDrag(e);
      }
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(event) {
      var scrolling = !/left|right/.test(event.gesture.direction);
      var distance = this.side === 'left' ? event.gesture.center.clientX : window.innerWidth - event.gesture.center.clientX;
      this._ignoreDrag = scrolling || event.consumed || this.ignoreSwipe(event, distance);

      if (!this._ignoreDrag) {
        event.consume && event.consume();
        event.consumed = true;

        this._width = widthToPx(this.element._width || '100%');
        this._startDistance = this._distance = 0;

        util.skipContentScroll(event.gesture);
      }
    }
  }, {
    key: 'onDrag',
    value: function onDrag(event) {
      event.stopPropagation();

      event.gesture.preventDefault();
      var delta = this.side === 'left' ? event.gesture.deltaX : -event.gesture.deltaX;
      var distance = Math.max(0, Math.min(this._width, this._startDistance + delta));
      if (distance !== this._distance) {
        this._distance = distance;
        this.swipeMid(this._distance, this._width);
        this.onDragCallback && this.onDragCallback();
      }
    }
  }, {
    key: 'onDragEnd',
    value: function onDragEnd(event) {
      event.stopPropagation();

      var direction = event.gesture.interimDirection;
      var isSwipeMax = this.side !== direction && this._distance > this._width * this.getThreshold();
      isSwipeMax ? this.swipeMax(this.animator) : this.swipeMin(this.animator);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.gestureDetector && this.gestureDetector.dispose();
      this.gestureDetector = this.element = this.elementHandler = this.animator = null;
    }
  }]);
  return SwipeReveal;
}();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var NavigatorTransitionAnimator = function (_BaseAnimator) {
  inherits(NavigatorTransitionAnimator, _BaseAnimator);

  /**
   * @param {Object} options
   * @param {String} options.timing
   * @param {Number} options.duration
   * @param {Number} options.delay
   */
  function NavigatorTransitionAnimator(options) {
    classCallCheck(this, NavigatorTransitionAnimator);

    options = util.extend({
      timing: 'linear',
      duration: '0.4',
      delay: '0'
    }, options || {});

    return possibleConstructorReturn(this, (NavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(NavigatorTransitionAnimator)).call(this, options));
  }

  createClass(NavigatorTransitionAnimator, [{
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      callback();
    }
  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      callback();
    }
  }, {
    key: 'block',
    value: function block(page) {
      var blocker = util.createElement('\n      <div style="position: absolute; background-color: transparent; width: 100%; height: 100%; z-index: 100000"></div>\n    ');
      page.parentNode.appendChild(blocker);
      return function () {
        return blocker.remove();
      };
    }
  }]);
  return NavigatorTransitionAnimator;
}(BaseAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Slide animator for navigator transition like iOS's screen slide transition.
 */

var IOSSlideNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
  inherits(IOSSlideNavigatorTransitionAnimator, _NavigatorTransitionA);

  function IOSSlideNavigatorTransitionAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier(0.3, .4, 0, .9)' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.4 : _ref$duration;

    classCallCheck(this, IOSSlideNavigatorTransitionAnimator);

    var _this = possibleConstructorReturn(this, (IOSSlideNavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(IOSSlideNavigatorTransitionAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this.backgroundMask = util.createElement('\n      <div style="position: absolute; width: 100%; height: 100%;\n        background-color: black; z-index: 2"></div>\n    ');

    return _this;
  }

  createClass(IOSSlideNavigatorTransitionAnimator, [{
    key: '_decompose',
    value: function _decompose(page) {
      var toolbar = page._getToolbarElement();
      var left = toolbar._getToolbarLeftItemsElement();
      var right = toolbar._getToolbarRightItemsElement();

      var excludeBackButton = function excludeBackButton(elements) {
        var result = [];

        for (var i = 0; i < elements.length; i++) {
          if (elements[i].nodeName.toLowerCase() !== 'ons-back-button') {
            result.push(elements[i]);
          }
        }

        return result;
      };

      var other = [].concat(left.children.length === 0 ? left : excludeBackButton(left.children)).concat(right.children.length === 0 ? right : excludeBackButton(right.children));

      return {
        toolbarCenter: toolbar._getToolbarCenterItemsElement(),
        backButtonIcon: toolbar._getToolbarBackButtonIconElement(),
        backButtonLabel: toolbar._getToolbarBackButtonLabelElement(),
        other: other,
        content: page._getContentElement(),
        background: page._getBackgroundElement(),
        toolbar: toolbar,
        bottomToolbar: page._getBottomToolbarElement()
      };
    }
  }, {
    key: '_shouldAnimateToolbar',
    value: function _shouldAnimateToolbar(enterPage, leavePage) {
      var bothPageHasToolbar = enterPage._canAnimateToolbar() && leavePage._canAnimateToolbar();

      var noMaterialToolbar = !enterPage._getToolbarElement().classList.contains('toolbar--material') && !leavePage._getToolbarElement().classList.contains('toolbar--material');

      return bothPageHasToolbar && noMaterialToolbar;
    }
  }, {
    key: '_calculateDelta',
    value: function _calculateDelta(element, decomposition) {
      var title = void 0,
          label = void 0;

      var pageRect = element.getBoundingClientRect();
      if (decomposition.backButtonLabel.classList.contains('back-button__label')) {
        var labelRect = decomposition.backButtonLabel.getBoundingClientRect();
        title = Math.round(pageRect.width / 2 - labelRect.width / 2 - labelRect.left);
      } else {
        title = Math.round(pageRect.width / 2 * 0.6);
      }

      if (decomposition.backButtonIcon.classList.contains('back-button__icon')) {
        label = decomposition.backButtonIcon.getBoundingClientRect().right - 2;
      }

      return { title: title, label: label };
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

  }, {
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      var _this2 = this;

      this.backgroundMask.remove();
      leavePage.parentNode.insertBefore(this.backgroundMask, leavePage);

      var unblock = get(IOSSlideNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(IOSSlideNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      contentReady(enterPage, function () {
        var enterPageTarget = util.findToolbarPage(enterPage) || enterPage;
        var leavePageTarget = util.findToolbarPage(leavePage) || leavePage;
        var enterPageDecomposition = _this2._decompose(enterPageTarget);
        var leavePageDecomposition = _this2._decompose(leavePageTarget);

        var delta = _this2._calculateDelta(leavePage, enterPageDecomposition);

        var shouldAnimateToolbar = _this2._shouldAnimateToolbar(enterPageTarget, leavePageTarget);

        if (shouldAnimateToolbar) {

          Animit.runAll(Animit([enterPageDecomposition.content, enterPageDecomposition.bottomToolbar, enterPageDecomposition.background]).saveStyle().queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: 0
          }).wait(_this2.delay).queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: _this2.duration,
            timing: _this2.timing
          }).restoreStyle(), Animit(enterPageDecomposition.toolbar).saveStyle().queue({
            css: {
              opacity: 0
            },
            duration: 0
          }).queue({
            css: {
              opacity: 1
            },
            duration: _this2.duration,
            timing: _this2.timing
          }).restoreStyle(), Animit(enterPageDecomposition.toolbarCenter).saveStyle().queue({
            css: {
              transform: 'translate3d(125%, 0, 0)',
              opacity: 1
            },
            duration: 0
          }).wait(_this2.delay).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1
            },
            duration: _this2.duration,
            timing: _this2.timing
          }).restoreStyle(), Animit(enterPageDecomposition.backButtonLabel).saveStyle().queue({
            css: {
              transform: 'translate3d(' + delta.title + 'px, 0, 0)',
              opacity: 0
            },
            duration: 0
          }).wait(_this2.delay).queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0,
              transition: 'opacity ' + _this2.duration + 's linear, transform ' + _this2.duration + 's ' + _this2.timing
            },
            duration: _this2.duration
          }).restoreStyle(), Animit(enterPageDecomposition.other).saveStyle().queue({
            css: { opacity: 0 },
            duration: 0
          }).wait(_this2.delay).queue({
            css: { opacity: 1 },
            duration: _this2.duration,
            timing: 'linear'
          }).restoreStyle(), Animit([leavePageDecomposition.content, leavePageDecomposition.bottomToolbar, leavePageDecomposition.background]).saveStyle().queue({
            css: {
              transform: 'translate3D(0, 0, 0)',
              opacity: 1
            },
            duration: 0
          }).wait(_this2.delay).queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)',
              opacity: 0.9
            },
            duration: _this2.duration,
            timing: _this2.timing
          }).restoreStyle().queue(function (done) {
            _this2.backgroundMask.remove();
            unblock();
            callback();
            done();
          }), Animit(leavePageDecomposition.toolbarCenter).saveStyle().queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: 0
          }).wait(_this2.delay).queue({
            css: {
              transform: 'translate3d(-' + delta.title + 'px, 0, 0)',
              opacity: 0,
              transition: 'opacity ' + _this2.duration + 's linear, transform ' + _this2.duration + 's ' + _this2.timing
            },
            duration: _this2.duration
          }).restoreStyle(), Animit(leavePageDecomposition.backButtonLabel).saveStyle().queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: 0
          }).wait(_this2.delay).queue({
            css: {
              transform: 'translate3d(-' + delta.label + 'px, 0, 0)',
              opacity: 0
            },
            duration: _this2.duration,
            timing: _this2.timing
          }).restoreStyle(), Animit(leavePageDecomposition.other).saveStyle().queue({
            css: { opacity: 1 },
            duration: 0
          }).wait(_this2.delay).queue({
            css: { opacity: 0 },
            duration: _this2.duration,
            timing: 'linear'
          }).restoreStyle());
        } else {

          Animit.runAll(Animit(enterPage).saveStyle().queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: 0
          }).wait(_this2.delay).queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: _this2.duration,
            timing: _this2.timing
          }).restoreStyle(), Animit(leavePage).saveStyle().queue({
            css: {
              transform: 'translate3D(0, 0, 0)',
              opacity: 1
            },
            duration: 0
          }).wait(_this2.delay).queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)',
              opacity: 0.9
            },
            duration: _this2.duration,
            timing: _this2.timing
          }).restoreStyle().queue(function (done) {
            _this2.backgroundMask.remove();
            unblock();
            callback();
            done();
          }));
        }
      });
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      var _this3 = this;

      this.backgroundMask.remove();
      enterPage.parentNode.insertBefore(this.backgroundMask, enterPage);

      var unblock = get(IOSSlideNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(IOSSlideNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      var enterPageTarget = util.findToolbarPage(enterPage) || enterPage;
      var leavePageTarget = util.findToolbarPage(leavePage) || leavePage;
      var enterPageDecomposition = this._decompose(enterPageTarget);
      var leavePageDecomposition = this._decompose(leavePageTarget);

      var delta = this._calculateDelta(leavePage, leavePageDecomposition);

      var shouldAnimateToolbar = this._shouldAnimateToolbar(enterPageTarget, leavePageTarget);

      if (shouldAnimateToolbar) {
        Animit.runAll(Animit([enterPageDecomposition.content, enterPageDecomposition.bottomToolbar, enterPageDecomposition.background]).saveStyle().queue({
          css: {
            transform: 'translate3D(-25%, 0px, 0px)',
            opacity: 0.9
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)',
            opacity: 1
          },
          duration: this.duration,
          timing: this.timing
        }).restoreStyle(), Animit(enterPageDecomposition.toolbarCenter).saveStyle().queue({
          css: {
            transform: 'translate3d(-' + delta.title + 'px, 0, 0)',
            opacity: 0
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(0, 0, 0)',
            opacity: 1.0,
            transition: 'opacity ' + this.duration + 's linear, transform ' + this.duration + 's ' + this.timing
          },
          duration: this.duration
        }).restoreStyle(), Animit(enterPageDecomposition.backButtonLabel).saveStyle().queue({
          css: {
            transform: 'translate3d(-' + delta.label + 'px, 0, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(0, 0, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }).restoreStyle(), Animit(enterPageDecomposition.other).saveStyle().queue({
          css: { opacity: 0 },
          duration: 0
        }).wait(this.delay).queue({
          css: { opacity: 1 },
          duration: this.duration,
          timing: 'linear'
        }).restoreStyle(), Animit([leavePageDecomposition.content, leavePageDecomposition.bottomToolbar, leavePageDecomposition.background]).queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(100%, 0px, 0px)'
          },
          duration: this.duration,
          timing: this.timing
        }).wait(0).queue(function (done) {
          _this3.backgroundMask.remove();
          unblock();
          callback();
          done();
        }), Animit(leavePageDecomposition.toolbar).queue({
          css: {
            opacity: 1
          },
          duration: 0
        }).queue({
          css: {
            opacity: 0
          },
          duration: this.duration,
          timing: this.timing
        }), Animit(leavePageDecomposition.toolbarCenter).queue({
          css: {
            transform: 'translate3d(0, 0, 0)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(125%, 0, 0)'
          },
          duration: this.duration,
          timing: this.timing
        }), Animit(leavePageDecomposition.backButtonLabel).queue({
          css: {
            transform: 'translate3d(0, 0, 0)',
            opacity: 1
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3d(' + delta.title + 'px, 0, 0)',
            opacity: 0,
            transition: 'opacity ' + this.duration + 's linear, transform ' + this.duration + 's ' + this.timing
          },
          duration: this.duration
        }));
      } else {
        Animit.runAll(Animit(enterPage).saveStyle().queue({
          css: {
            transform: 'translate3D(-25%, 0px, 0px)',
            opacity: 0.9
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)',
            opacity: 1.0
          },
          duration: this.duration,
          timing: this.timing
        }).restoreStyle(), Animit(leavePage).queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)'
          },
          duration: 0
        }).wait(this.delay).queue({
          css: {
            transform: 'translate3D(100%, 0px, 0px)'
          },
          duration: this.duration,
          timing: this.timing
        }).queue(function (done) {
          _this3.backgroundMask.remove();
          unblock();
          callback();
          done();
        }));
      }
    }
  }]);
  return IOSSlideNavigatorTransitionAnimator;
}(NavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Swipe animator for iOS navigator transition.
 */

var IOSSwipeNavigatorTransitionAnimator = function (_IOSSlideNavigatorTra) {
  inherits(IOSSwipeNavigatorTransitionAnimator, _IOSSlideNavigatorTra);

  function IOSSwipeNavigatorTransitionAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.15 : _ref$duration,
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay;

    classCallCheck(this, IOSSwipeNavigatorTransitionAnimator);

    var _this = possibleConstructorReturn(this, (IOSSwipeNavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(IOSSwipeNavigatorTransitionAnimator)).call(this, { duration: duration, timing: timing, delay: delay }));

    _this.durationRestore = 0.1;

    _this.swipeShadow = util.createElement('\n      <div style="position: absolute; height: 100%; width: 12px; right: 100%; top: 0; bottom: 0; z-index: -1;\n        background: linear-gradient(to right, transparent 0, rgba(0,0,0,.04) 40%, rgba(0,0,0,.12) 80%, rgba(0,0,0,.16) 100%);"></div>\n    ');

    _this.isDragStart = true;
    return _this;
  }

  createClass(IOSSwipeNavigatorTransitionAnimator, [{
    key: 'translate',
    value: function translate(distance, maxWidth, enterPage, leavePage) {
      if (this.isDragStart) {
        this.isDragStart = false;

        // Avoid content clicks
        this.unblock = get(IOSSwipeNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(IOSSwipeNavigatorTransitionAnimator.prototype), 'block', this).call(this, leavePage);

        // Mask
        enterPage.parentElement.insertBefore(this.backgroundMask, enterPage);

        // Decomposition
        this.target = {
          enter: util.findToolbarPage(enterPage) || enterPage,
          leave: util.findToolbarPage(leavePage) || leavePage
        };
        this.decomp = {
          enter: this._decompose(this.target.enter),
          leave: this._decompose(this.target.leave)
        };

        // Animation values
        this.delta = this._calculateDelta(leavePage, this.decomp.leave);
        this.shouldAnimateToolbar = this._shouldAnimateToolbar(this.target.enter, this.target.leave);

        // Shadow && styles
        if (this.shouldAnimateToolbar) {
          this.swipeShadow.style.top = this.decomp.leave.toolbar.offsetHeight + 'px';
          this.target.leave.appendChild(this.swipeShadow);
          this._saveStyle(this.target.enter, this.target.leave);
        } else {
          leavePage.appendChild(this.swipeShadow);
          this._saveStyle(enterPage, leavePage);
        }
        leavePage.classList.add('overflow-visible');
        this.overflowElement = leavePage;
        this.decomp.leave.content.classList.add('content-swiping');
      }

      var swipeRatio = (distance - maxWidth) / maxWidth;

      if (this.shouldAnimateToolbar) {

        Animit.runAll(

        /* Enter page */

        Animit([this.decomp.enter.content, this.decomp.enter.bottomToolbar, this.decomp.enter.background]).queue({
          transform: 'translate3d(' + swipeRatio * 25 + '%, 0, 0)',
          opacity: 1 + swipeRatio * 10 / 100 // 0.9 -> 1
        }), Animit(this.decomp.enter.toolbarCenter).queue({
          transform: 'translate3d(' + this.delta.title * swipeRatio + 'px, 0, 0)',
          opacity: 1 + swipeRatio // 0 -> 1
        }), Animit(this.decomp.enter.backButtonLabel).queue({
          opacity: 1 + swipeRatio * 10 / 100, // 0.9 -> 1
          transform: 'translate3d(' + this.delta.label * swipeRatio + 'px, 0, 0)'
        }), Animit(this.decomp.enter.other).queue({
          opacity: 1 + swipeRatio // 0 -> 1
        }),

        /* Leave page */

        Animit([this.decomp.leave.content, this.decomp.leave.bottomToolbar, this.decomp.leave.background, this.swipeShadow]).queue({
          transform: 'translate3d(' + distance + 'px, 0px, 0px)'
        }), Animit(this.decomp.leave.toolbar).queue({
          opacity: -1 * swipeRatio // 1 -> 0
        }), Animit(this.decomp.leave.toolbarCenter).queue({
          transform: 'translate3d(' + (1 + swipeRatio) * 125 + '%, 0, 0)'
        }), Animit(this.decomp.leave.backButtonLabel).queue({
          opacity: -1 * swipeRatio, // 1 -> 0
          transform: 'translate3d(' + this.delta.title * (1 + swipeRatio) + 'px, 0, 0)'
        }),

        /* Other */

        Animit(this.swipeShadow).queue({
          opacity: -1 * swipeRatio // 1 -> 0
        }));
      } else {
        Animit.runAll(Animit(leavePage).queue({
          transform: 'translate3d(' + distance + 'px, 0px, 0px)'
        }), Animit(enterPage).queue({
          transform: 'translate3d(' + swipeRatio * 25 + '%, 0, 0)',
          opacity: 1 + swipeRatio * 10 / 100 // 0.9 -> 1
        }), Animit(this.swipeShadow).queue({
          opacity: -1 * swipeRatio // 1 -> 0
        }));
      }
    }
  }, {
    key: 'restore',
    value: function restore(enterPage, leavePage, callback) {
      var _this2 = this;

      if (this.isDragStart) {
        return;
      }

      if (this.shouldAnimateToolbar) {

        Animit.runAll(

        /* Enter page */

        Animit([this.decomp.enter.content, this.decomp.enter.bottomToolbar, this.decomp.enter.background]).queue({
          transform: 'translate3d(-25%, 0, 0)',
          opacity: 0.9
        }, {
          timing: this.timing,
          duration: this.durationRestore
        }), Animit(this.decomp.enter.toolbarCenter).queue({
          transform: 'translate3d(-' + this.delta.title + 'px, 0, 0)',
          transition: 'opacity ' + this.durationRestore + 's linear, transform ' + this.durationRestore + 's ' + this.timing,
          opacity: 0
        }), Animit(this.decomp.enter.backButtonLabel).queue({
          transform: 'translate3d(-' + this.delta.label + 'px, 0, 0)'
        }, {
          timing: this.timing,
          duration: this.durationRestore
        }), Animit(this.decomp.enter.other).queue({
          opacity: 0
        }, {
          timing: this.timing,
          duration: this.durationRestore
        }),

        /* Leave page */

        Animit([this.decomp.leave.content, this.decomp.leave.bottomToolbar, this.decomp.leave.background, this.swipeShadow]).queue({
          transform: 'translate3d(0, 0px, 0px)'
        }, {
          timing: this.timing,
          duration: this.durationRestore
        }), Animit(this.decomp.leave.toolbar).queue({
          opacity: 1
        }, {
          timing: this.timing,
          duration: this.durationRestore
        }), Animit(this.decomp.leave.toolbarCenter).queue({
          transform: 'translate3d(0, 0, 0)'
        }, {
          timing: this.timing,
          duration: this.durationRestore
        }), Animit(this.decomp.leave.backButtonLabel).queue({
          opacity: 1,
          transform: 'translate3d(0, 0, 0)',
          transition: 'opacity ' + this.durationRestore + 's linear, transform ' + this.durationRestore + 's ' + this.timing
        }),

        /* Other */

        Animit(this.swipeShadow).queue({
          opacity: 0
        }, {
          timing: this.timing,
          duration: this.durationRestore
        }).queue(function (done) {
          _this2._reset(_this2.target.enter, _this2.target.leave);
          callback && callback();
          done();
        }));
      } else {
        Animit.runAll(Animit(enterPage).queue({
          css: {
            transform: 'translate3D(-25%, 0px, 0px)',
            opacity: 0.9
          },
          timing: this.timing,
          duration: this.durationRestore
        }), Animit(leavePage).queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)'
          },
          timing: this.timing,
          duration: this.durationRestore
        }).queue(function (done) {
          _this2._reset(enterPage, leavePage);
          callback && callback();
          done();
        }));
      }
    }
  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      var _this3 = this;

      if (this.isDragStart) {
        return;
      }

      if (this.shouldAnimateToolbar) {

        Animit.runAll(

        /* Enter page */

        Animit([this.decomp.enter.content, this.decomp.enter.bottomToolbar, this.decomp.enter.background]).queue({
          transform: 'translate3d(0, 0, 0)',
          opacity: 1
        }, {
          timing: this.timing,
          duration: this.duration
        }), Animit(this.decomp.enter.toolbarCenter).queue({
          transform: 'translate3d(0, 0, 0)',
          transition: 'opacity ' + this.duration + 's linear, transform ' + this.duration + 's ' + this.timing,
          opacity: 1
        }), Animit(this.decomp.enter.backButtonLabel).queue({
          transform: 'translate3d(0, 0, 0)'
        }, {
          timing: this.timing,
          duration: this.duration
        }), Animit(this.decomp.enter.other).queue({
          opacity: 1
        }, {
          timing: this.timing,
          duration: this.duration
        }),

        /* Leave page */

        Animit([this.decomp.leave.content, this.decomp.leave.bottomToolbar, this.decomp.leave.background, this.swipeShadow]).queue({
          transform: 'translate3d(100%, 0px, 0px)'
        }, {
          timing: this.timing,
          duration: this.duration
        }), Animit(this.decomp.leave.toolbar).queue({
          opacity: 0
        }, {
          timing: this.timing,
          duration: this.duration
        }), Animit(this.decomp.leave.toolbarCenter).queue({
          transform: 'translate3d(125%, 0, 0)'
        }, {
          timing: this.timing,
          duration: this.duration
        }), Animit(this.decomp.leave.backButtonLabel).queue({
          opacity: 0,
          transform: 'translate3d(' + this.delta.title + 'px, 0, 0)',
          transition: 'opacity ' + this.duration + 's linear, transform ' + this.duration + 's ' + this.timing
        }),

        /* Other */

        Animit(this.swipeShadow).queue({
          opacity: 0
        }, {
          timing: this.timing,
          duration: this.duration
        }).queue(function (done) {
          _this3._reset(_this3.target.enter, _this3.target.leave);
          callback && callback();
          done();
        }));
      } else {
        Animit.runAll(Animit(enterPage).queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)',
            opacity: 1.0
          },
          duration: this.duration,
          timing: this.timing
        }), Animit(leavePage).queue({
          css: {
            transform: 'translate3D(100%, 0px, 0px)'
          },
          duration: this.duration,
          timing: this.timing
        }).queue(function (done) {
          _this3._reset(enterPage, leavePage);
          callback && callback();
          done();
        }));
      }
    }
  }, {
    key: '_saveStyle',
    value: function _saveStyle() {
      var _this4 = this;

      this._savedStyle = new WeakMap();
      var save = function save(el) {
        return _this4._savedStyle.set(el, el.getAttribute('style'));
      };

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      args.forEach(save);

      Object.keys(this.decomp).forEach(function (p) {
        Object.keys(_this4.decomp[p]).forEach(function (k) {
          (_this4.decomp[p][k] instanceof Array ? _this4.decomp[p][k] : [_this4.decomp[p][k]]).forEach(save);
        });
      });
    }
  }, {
    key: '_restoreStyle',
    value: function _restoreStyle() {
      var _this5 = this;

      var restore = function restore(el) {
        _this5._savedStyle.get(el) === null ? el.removeAttribute('style') : el.setAttribute('style', _this5._savedStyle.get(el));
        _this5._savedStyle.delete(el);
      };

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args.forEach(restore);

      Object.keys(this.decomp).forEach(function (p) {
        Object.keys(_this5.decomp[p]).forEach(function (k) {
          (_this5.decomp[p][k] instanceof Array ? _this5.decomp[p][k] : [_this5.decomp[p][k]]).forEach(restore);
        });
      });
    }
  }, {
    key: '_reset',
    value: function _reset() {
      this._savedStyle && this._restoreStyle.apply(this, arguments);
      this.unblock && this.unblock();
      this.swipeShadow.remove();
      this.backgroundMask.remove();
      this.overflowElement.classList.remove('overflow-visible');
      this.decomp.leave.content.classList.remove('content-swiping');
      this.decomp = this.target = this.overflowElement = this._savedStyle = null;
      this.isDragStart = true;
    }
  }]);
  return IOSSwipeNavigatorTransitionAnimator;
}(IOSSlideNavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Lift screen transition.
 */

var IOSLiftNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
  inherits(IOSLiftNavigatorTransitionAnimator, _NavigatorTransitionA);

  function IOSLiftNavigatorTransitionAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier(.1, .7, .1, 1)' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.4 : _ref$duration;

    classCallCheck(this, IOSLiftNavigatorTransitionAnimator);

    var _this = possibleConstructorReturn(this, (IOSLiftNavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(IOSLiftNavigatorTransitionAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this.backgroundMask = util.createElement('\n      <div style="position: absolute; width: 100%; height: 100%;\n        background: linear-gradient(black, white);"></div>\n    ');
    return _this;
  }

  /**
   * @param {Object} enterPage
   * @param {Object} leavePage
   * @param {Function} callback
   */


  createClass(IOSLiftNavigatorTransitionAnimator, [{
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      var _this2 = this;

      this.backgroundMask.remove();
      leavePage.parentNode.insertBefore(this.backgroundMask, leavePage);

      var unblock = get(IOSLiftNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(IOSLiftNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit(enterPage).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 100%, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        _this2.backgroundMask.remove();
        unblock();
        callback();
        done();
      }), Animit(leavePage).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1.0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, -10%, 0)',
          opacity: 0.9
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle());
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      var _this3 = this;

      this.backgroundMask.remove();
      enterPage.parentNode.insertBefore(this.backgroundMask, enterPage);

      var unblock = get(IOSLiftNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(IOSLiftNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit(enterPage).saveStyle().queue({
        css: {
          transform: 'translate3D(0, -43px, 0)', // Smaller than iOS toolbar - fixes glitch
          opacity: 0.9
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        _this3.backgroundMask.remove();
        unblock();
        callback();
        done();
      }), Animit(leavePage).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 0, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 100%, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle());
    }
  }]);
  return IOSLiftNavigatorTransitionAnimator;
}(NavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Fade-in screen transition.
 */

var IOSFadeNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
  inherits(IOSFadeNavigatorTransitionAnimator, _NavigatorTransitionA);

  function IOSFadeNavigatorTransitionAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.4 : _ref$duration;

    classCallCheck(this, IOSFadeNavigatorTransitionAnimator);
    return possibleConstructorReturn(this, (IOSFadeNavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(IOSFadeNavigatorTransitionAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {Object} enterPage
   * @param {Object} leavePage
   * @param {Function} callback
   */


  createClass(IOSFadeNavigatorTransitionAnimator, [{
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      var unblock = get(IOSFadeNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(IOSFadeNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit([enterPage._getContentElement(), enterPage._getBackgroundElement()]).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        unblock();
        callback();
        done();
      }), Animit(enterPage._getToolbarElement()).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle());
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} done
     */

  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      var unblock = get(IOSFadeNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(IOSFadeNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit([leavePage._getContentElement(), leavePage._getBackgroundElement()]).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 0
        },
        duration: this.duration,
        timing: this.timing
      }).queue(function (done) {
        unblock();
        callback();
        done();
      }), Animit(leavePage._getToolbarElement()).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 0
        },
        duration: this.duration,
        timing: this.timing
      }));
    }
  }]);
  return IOSFadeNavigatorTransitionAnimator;
}(NavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Slide animator for navigator transition.
 */

var MDSlideNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
  inherits(MDSlideNavigatorTransitionAnimator, _NavigatorTransitionA);

  function MDSlideNavigatorTransitionAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.3 : _ref$duration;

    classCallCheck(this, MDSlideNavigatorTransitionAnimator);

    var _this = possibleConstructorReturn(this, (MDSlideNavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(MDSlideNavigatorTransitionAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this.backgroundMask = util.createElement('\n      <div style="position: absolute; width: 100%; height: 100%; z-index: 2;\n        background-color: black; opacity: 0;"></div>\n    ');
    _this.blackMaskOpacity = 0.4;
    return _this;
  }

  /**
   * @param {Object} enterPage
   * @param {Object} leavePage
   * @param {Function} callback
   */


  createClass(MDSlideNavigatorTransitionAnimator, [{
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      var _this2 = this;

      this.backgroundMask.remove();
      leavePage.parentElement.insertBefore(this.backgroundMask, leavePage.nextSibling);

      var unblock = get(MDSlideNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(MDSlideNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit(this.backgroundMask).saveStyle().queue({
        opacity: 0,
        transform: 'translate3d(0, 0, 0)'
      }).wait(this.delay).queue({
        opacity: this.blackMaskOpacity
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        _this2.backgroundMask.remove();
        done();
      }), Animit(enterPage).saveStyle().queue({
        css: {
          transform: 'translate3D(100%, 0, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle(), Animit(leavePage).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 0, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(-45%, 0px, 0px)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().wait(0.2).queue(function (done) {
        unblock();
        callback();
        done();
      }));
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      var _this3 = this;

      this.backgroundMask.remove();
      enterPage.parentNode.insertBefore(this.backgroundMask, enterPage.nextSibling);

      var unblock = get(MDSlideNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(MDSlideNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit(this.backgroundMask).saveStyle().queue({
        opacity: this.blackMaskOpacity,
        transform: 'translate3d(0, 0, 0)'
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        _this3.backgroundMask.remove();
        done();
      }), Animit(enterPage).saveStyle().queue({
        css: {
          transform: 'translate3D(-45%, 0px, 0px)',
          opacity: 0.9
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0px, 0px, 0px)',
          opacity: 1.0
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle(), Animit(leavePage).queue({
        css: {
          transform: 'translate3D(0px, 0px, 0px)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(100%, 0px, 0px)'
        },
        duration: this.duration,
        timing: this.timing
      }).wait(0.2).queue(function (done) {
        unblock();
        callback();
        done();
      }));
    }
  }]);
  return MDSlideNavigatorTransitionAnimator;
}(NavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Lift screen transition.
 */

var MDLiftNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
  inherits(MDLiftNavigatorTransitionAnimator, _NavigatorTransitionA);

  function MDLiftNavigatorTransitionAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier(.1, .7, .1, 1)' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0.05 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.4 : _ref$duration;

    classCallCheck(this, MDLiftNavigatorTransitionAnimator);

    var _this = possibleConstructorReturn(this, (MDLiftNavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(MDLiftNavigatorTransitionAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this.backgroundMask = util.createElement('\n      <div style="position: absolute; width: 100%; height: 100%;\n        background-color: black;"></div>\n    ');
    return _this;
  }

  /**
   * @param {Object} enterPage
   * @param {Object} leavePage
   * @param {Function} callback
   */


  createClass(MDLiftNavigatorTransitionAnimator, [{
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      var _this2 = this;

      this.backgroundMask.remove();
      leavePage.parentNode.insertBefore(this.backgroundMask, leavePage);

      var unblock = get(MDLiftNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(MDLiftNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      var maskClear = Animit(this.backgroundMask).wait(this.delay + this.duration).queue(function (done) {
        _this2.backgroundMask.remove();
        done();
      });

      Animit.runAll(maskClear, Animit(enterPage).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 100%, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        unblock();
        callback();
        done();
      }), Animit(leavePage).queue({
        css: {
          opacity: 1.0
        },
        duration: 0
      }).queue({
        css: {
          opacity: 0.4
        },
        duration: this.duration,
        timing: this.timing
      }));
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */

  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      var _this3 = this;

      this.backgroundMask.remove();
      enterPage.parentNode.insertBefore(this.backgroundMask, enterPage);

      var unblock = get(MDLiftNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(MDLiftNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit(this.backgroundMask).wait(this.delay + this.duration).queue(function (done) {
        _this3.backgroundMask.remove();
        done();
      }), Animit(enterPage).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 0.4
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1.0
        },
        duration: this.duration,
        timing: this.timing
      }).queue(function (done) {
        unblock();
        callback();
        done();
      }), Animit(leavePage).queue({
        css: {
          transform: 'translate3D(0, 0, 0)'
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 100%, 0)'
        },
        duration: this.duration,
        timing: this.timing
      }));
    }
  }]);
  return MDLiftNavigatorTransitionAnimator;
}(NavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Fade-in + Lift screen transition.
 */

var MDFadeNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
  inherits(MDFadeNavigatorTransitionAnimator, _NavigatorTransitionA);

  function MDFadeNavigatorTransitionAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier(0.4, 0.0, 0.2, 1)' : _ref$timing,
        _ref$timingOnPop = _ref.timingOnPop,
        timingOnPop = _ref$timingOnPop === undefined ? 'cubic-bezier(0.4, 0.0, 1, 1)' : _ref$timingOnPop,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.2 : _ref$duration;

    classCallCheck(this, MDFadeNavigatorTransitionAnimator);

    var _this = possibleConstructorReturn(this, (MDFadeNavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(MDFadeNavigatorTransitionAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this.timingOnPop = timingOnPop;
    return _this;
  }

  /**
   * @param {Object} enterPage
   * @param {Object} leavePage
   * @param {Function} callback
   */


  createClass(MDFadeNavigatorTransitionAnimator, [{
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      var unblock = get(MDFadeNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(MDFadeNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit(enterPage).saveStyle().queue({
        css: {
          transform: 'translate3D(0, 42px, 0)',
          opacity: 0
        },
        duration: 0
      }).wait(this.delay).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1
        },
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        unblock();
        callback();
        done();
      }));
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} done
     */

  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      var unblock = get(MDFadeNavigatorTransitionAnimator.prototype.__proto__ || Object.getPrototypeOf(MDFadeNavigatorTransitionAnimator.prototype), 'block', this).call(this, enterPage);

      Animit.runAll(Animit(leavePage).queue({
        css: {
          transform: 'translate3D(0, 0, 0)',
          opacity: 1
        },
        duration: 0
      }).wait(0.15).queue({
        css: {
          transform: 'translate3D(0, 38px, 0)',
          opacity: 0
        },
        duration: this.duration,
        timing: this.timingOnPop
      }).queue(function (done) {
        unblock();
        callback();
        done();
      }));
    }
  }]);
  return MDFadeNavigatorTransitionAnimator;
}(NavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var NoneNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
  inherits(NoneNavigatorTransitionAnimator, _NavigatorTransitionA);

  function NoneNavigatorTransitionAnimator(options) {
    classCallCheck(this, NoneNavigatorTransitionAnimator);
    return possibleConstructorReturn(this, (NoneNavigatorTransitionAnimator.__proto__ || Object.getPrototypeOf(NoneNavigatorTransitionAnimator)).call(this, options));
  }

  createClass(NoneNavigatorTransitionAnimator, [{
    key: 'push',
    value: function push(enterPage, leavePage, callback) {
      callback();
    }
  }, {
    key: 'pop',
    value: function pop(enterPage, leavePage, callback) {
      callback();
    }
  }]);
  return NoneNavigatorTransitionAnimator;
}(NavigatorTransitionAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var _animatorDict$4 = {
  'default': function _default() {
    return platform$1.isAndroid() ? MDFadeNavigatorTransitionAnimator : IOSSlideNavigatorTransitionAnimator;
  },
  'slide': function slide() {
    return platform$1.isAndroid() ? MDSlideNavigatorTransitionAnimator : IOSSlideNavigatorTransitionAnimator;
  },
  'lift': function lift() {
    return platform$1.isAndroid() ? MDLiftNavigatorTransitionAnimator : IOSLiftNavigatorTransitionAnimator;
  },
  'fade': function fade() {
    return platform$1.isAndroid() ? MDFadeNavigatorTransitionAnimator : IOSFadeNavigatorTransitionAnimator;
  },
  'slide-ios': IOSSlideNavigatorTransitionAnimator,
  'slide-md': MDSlideNavigatorTransitionAnimator,
  'lift-ios': IOSLiftNavigatorTransitionAnimator,
  'lift-md': MDLiftNavigatorTransitionAnimator,
  'fade-ios': IOSFadeNavigatorTransitionAnimator,
  'fade-md': MDFadeNavigatorTransitionAnimator,
  'none': NoneNavigatorTransitionAnimator
};

var rewritables = {
  /**
   * @param {Element} navigatorSideElement
   * @param {Function} callback
   */
  ready: function ready(navigatorElement, callback) {
    callback();
  }
};

/**
 * @element ons-navigator
 * @category navigation
 * @description
 *   [en]
 *     A component that provides page stack management and navigation. Stack navigation is the most common navigation pattern for mobile apps.
 *
 *     When a page is pushed on top of the stack it is displayed with a transition animation. When the user returns to the previous page the top page will be popped from the top of the stack and hidden with an opposite transition animation.
 *   [/en]
 *   [ja][/ja]
 * @codepen yrhtv
 * @tutorial vanilla/Reference/navigator
 * @guide multiple-page-navigation
 *   [en]Guide for page navigation[/en]
 *   [ja]ページナビゲーションの概要[/ja]
 * @guide templates
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @guide creating-a-page
 *   [en]Setting up a page in its `init` event[/en]
 *   [ja]Setting up a page in its `init` event[/ja]
 * @seealso ons-toolbar
 *   [en]The `<ons-toolbar>` component is used to display a toolbar on the top of a page.[/en]
 *   [ja][/ja]
 * @seealso ons-back-button
 *   [en]The `<ons-back-button>` component lets the user return to the previous page.[/en]
 *   [ja][/ja]
 * @example
 * <ons-navigator id="navigator">
 *   <ons-page>
 *     <ons-toolbar>
 *       <div class="center">
 *         Title
 *       </div>
 *     </ons-toolbar>
 *     <p>
 *       <ons-button
 *         onclick="document.getElementById('navigator').pushPage('page.html')">
 *         Push page
 *       </ons-button>
 *     </p>
 *   </ons-page>
 * </ons-navigator>
 *
 * <ons-template id="page.html">
 *   <ons-page>
 *     <ons-toolbar>
 *       <div class="left">
 *         <ons-back-button>Back</ons-back-button>
 *       </div>
 *       <div class="center">
 *         Another page
 *       </div>
 *     </ons-toolbar>
 *   </ons-page>
 * </ons-template>
 */

var NavigatorElement = function (_BaseElement) {
  inherits(NavigatorElement, _BaseElement);
  createClass(NavigatorElement, [{
    key: 'animatorFactory',


    /**
     * @attribute page
     * @initonly
     * @type {String}
     * @description
     *   [en]First page to show when navigator is initialized.[/en]
     *   [ja]ナビゲーターが初期化された時に表示するページを指定します。[/ja]
     */

    /**
     * @attribute swipeable
     * @type {Boolean}
     * @description
     *   [en]Enable iOS "swipe to pop" feature.[/en]
     *   [ja][/ja]
     */

    /**
     * @attribute swipe-target-width
     * @type {String}
     * @default 20px
     * @description
     *   [en]The width of swipeable area calculated from the edge (in pixels). Use this to enable swipe only when the finger touch on the screen edge.[/en]
     *   [ja]スワイプの判定領域をピクセル単位で指定します。画面の端から指定した距離に達するとページが表示されます。[/ja]
     */

    /**
     * @attribute swipe-threshold
     * @type {Number}
     * @default 0.2
     * @description
     *  [en]Specify how much the page needs to be swiped before popping. A value between `0` and `1`.[/en]
     *  [ja][/ja]
     */

    /**
     * @attribute animation
     * @type {String}
     * @default default
     * @description
     *   [en]
     *     Animation name. Available animations are `"slide"`, `"lift"`, `"fade"` and `"none"`.
     *
     *     These are platform based animations. For fixed animations, add `"-ios"` or `"-md"` suffix to the animation name. E.g. `"lift-ios"`, `"lift-md"`. Defaults values are `"slide-ios"` and `"fade-md"` depending on the platform.
     *   [/en]
     *   [ja][/ja]
     */

    /**
     * @attribute animation-options
     * @type {Expression}
     * @description
     *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`[/en]
     *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`[/ja]
     */

    /**
     * @event prepush
     * @description
     *   [en]Fired just before a page is pushed.[/en]
     *   [ja]pageがpushされる直前に発火されます。[/ja]
     * @param {Object} event [en]Event object.[/en]
     * @param {Object} event.navigator
     *   [en]Component object.[/en]
     *   [ja]コンポーネントのオブジェクト。[/ja]
     * @param {Object} event.currentPage
     *   [en]Current page object.[/en]
     *   [ja]現在のpageオブジェクト。[/ja]
     * @param {Function} event.cancel
     *   [en]Call this function to cancel the push.[/en]
     *   [ja]この関数を呼び出すと、push処理がキャンセルされます。[/ja]
     */

    /**
     * @event prepop
     * @description
     *   [en]Fired just before a page is popped.[/en]
     *   [ja]pageがpopされる直前に発火されます。[/ja]
     * @param {Object} event [en]Event object.[/en]
     * @param {Object} event.navigator
     *   [en]Component object.[/en]
     *   [ja]コンポーネントのオブジェクト。[/ja]
     * @param {Object} event.currentPage
     *   [en]Current page object.[/en]
     *   [ja]現在のpageオブジェクト。[/ja]
     * @param {Function} event.cancel
     *   [en]Call this function to cancel the pop.[/en]
     *   [ja]この関数を呼び出すと、pageのpopがキャンセルされます。[/ja]
     */

    /**
     * @event postpush
     * @description
     *   [en]Fired just after a page is pushed.[/en]
     *   [ja]pageがpushされてアニメーションが終了してから発火されます。[/ja]
     * @param {Object} event [en]Event object.[/en]
     * @param {Object} event.navigator
     *   [en]Component object.[/en]
     *   [ja]コンポーネントのオブジェクト。[/ja]
     * @param {Object} event.enterPage
     *   [en]Object of the next page.[/en]
     *   [ja]pushされたpageオブジェクト。[/ja]
     * @param {Object} event.leavePage
     *   [en]Object of the previous page.[/en]
     *   [ja]以前のpageオブジェクト。[/ja]
     */

    /**
     * @event postpop
     * @description
     *   [en]Fired just after a page is popped.[/en]
     *   [ja]pageがpopされてアニメーションが終わった後に発火されます。[/ja]
     * @param {Object} event [en]Event object.[/en]
     * @param {Object} event.navigator
     *   [en]Component object.[/en]
     *   [ja]コンポーネントのオブジェクト。[/ja]
     * @param {Object} event.enterPage
     *   [en]Object of the next page.[/en]
     *   [ja]popされて表示されるページのオブジェクト。[/ja]
     * @param {Object} event.leavePage
     *   [en]Object of the previous page.[/en]
     *   [ja]popされて消えるページのオブジェクト。[/ja]
     */

    get: function get$$1() {
      return this._animatorFactory;
    }
  }]);

  function NavigatorElement() {
    classCallCheck(this, NavigatorElement);

    var _this = possibleConstructorReturn(this, (NavigatorElement.__proto__ || Object.getPrototypeOf(NavigatorElement)).call(this));

    _this._isRunning = false;
    _this._initialized = false;
    _this._pageLoader = defaultPageLoader;
    _this._pageMap = new WeakMap();

    _this._updateAnimatorFactory();
    return _this;
  }

  /**
   * @property pageLoader
   * @type {PageLoader}
   * @description
   *   [en]PageLoader instance. It can be overriden to change the way pages are loaded by this element. Useful for lib developers.[/en]
   *   [ja]PageLoaderインスタンスを格納しています。[/ja]
   */


  createClass(NavigatorElement, [{
    key: '_getPageTarget',
    value: function _getPageTarget() {
      return this._page || this.getAttribute('page');
    }

    /**
     * @property page
     * @type {*}
     * @description
     *   [en]Specify the page to be loaded during initialization. This value takes precedence over the `page` attribute. Useful for lib developers.[/en]
     *   [ja]初期化時に読み込むページを指定します。`page`属性で指定した値よりも`page`プロパティに指定した値を優先します。[/ja]
     */

  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this2 = this;

      this.onDeviceBackButton = this._onDeviceBackButton.bind(this);

      if (!platform$1.isAndroid() || this.getAttribute('swipeable') === 'force') {
        this._swipe = new SwipeReveal({
          element: this,
          animator: new IOSSwipeNavigatorTransitionAnimator(),
          swipeMax: function swipeMax(animator) {
            return _this2.swipeMax ? _this2.swipeMax({ animator: animator }) : _this2.popPage({ animator: animator });
          },
          getThreshold: function getThreshold() {
            return Math.max(0.2, parseFloat(_this2.getAttribute('swipe-threshold')) || 0);
          },
          getAnimationElements: function getAnimationElements() {
            return [_this2.topPage.previousElementSibling, _this2.topPage];
          },
          ignoreSwipe: function ignoreSwipe(event, distance) {
            if ([event.target, event.target.parentElement].some(function (el) {
              return (/ons-back-button/i.test(el.tagName)
              );
            })) {
              return true;
            }
            var area = Math.max(20, parseInt(_this2.getAttribute('swipe-target-width')) || 0);
            return event.gesture.direction !== 'right' || area <= distance || _this2._isRunning || _this2.children.length <= 1;
          }
        });

        this.attributeChangedCallback('swipeable');
      }

      if (this._initialized) {
        return;
      }

      this._initialized = true;

      rewritables.ready(this, function () {
        if (_this2.pages.length === 0 && _this2._getPageTarget()) {
          _this2.pushPage(_this2._getPageTarget(), { animation: 'none' });
        } else if (_this2.pages.length > 0) {
          for (var i = 0; i < _this2.pages.length; i++) {
            if (_this2.pages[i].nodeName !== 'ONS-PAGE') {
              throw new Error('The children of <ons-navigator> need to be of type <ons-page>');
            }
          }

          if (_this2.topPage) {
            contentReady(_this2.topPage, function () {
              return setTimeout(function () {
                _this2.topPage._show();
                _this2._updateLastPageBackButton();
              }, 0);
            });
          }
        } else {
          contentReady(_this2, function () {
            if (_this2.pages.length === 0 && _this2._getPageTarget()) {
              _this2.pushPage(_this2._getPageTarget(), { animation: 'none' });
            }
          });
        }
      });
    }
  }, {
    key: '_updateAnimatorFactory',
    value: function _updateAnimatorFactory() {
      this._animatorFactory = new AnimatorFactory({
        animators: _animatorDict$4,
        baseClass: NavigatorTransitionAnimator,
        baseClassName: 'NavigatorTransitionAnimator',
        defaultAnimation: this.getAttribute('animation')
      });
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this._backButtonHandler.destroy();
      this._backButtonHandler = null;

      this._swipe && this._swipe.dispose();
      this._swipe = null;
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'animation':
          this._updateAnimatorFactory();
          break;
        case 'swipeable':
          this._swipe && this._swipe.update();
          break;
      }
    }

    /**
     * @method popPage
     * @signature popPage([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]
     *     Animation name. Available animations are `"slide"`, `"lift"`, `"fade"` and `"none"`.
     *
     *     These are platform based animations. For fixed animations, add `"-ios"` or `"-md"` suffix to the animation name. E.g. `"lift-ios"`, `"lift-md"`. Defaults values are `"slide-ios"` and `"fade-md"`.
     *   [/en]
     *   [ja][/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @param {Boolean} [options.refresh]
     *   [en]This option has been removed in Onsen UI 2.3.0. The previous page will be refreshed (destroyed and created again) before popPage action.[/en]
     *   [ja]このオプションは Onsen UI 2.3.0 で削除されました。popPageする前に、前にあるページを生成しなおして更新する場合にtrueを指定します。[/ja]
     * @param {Function} [options.callback]
     *   [en]Function that is called when the transition has ended.[/en]
     *   [ja]このメソッドによる画面遷移が終了した際に呼び出される関数オブジェクトを指定します。[/ja]
     * @param {Object} [options.data]
     *   [en]Custom data that will be stored in the new page element.[/en]
     *   [ja][/ja]
     * @return {Promise}
     *   [en]Promise which resolves to the revealed page.[/en]
     *   [ja]明らかにしたページを解決するPromiseを返します。[/ja]
     * @description
     *   [en]Pops the current page from the page stack. The previous page will be displayed.[/en]
     *   [ja]現在表示中のページをページスタックから取り除きます。一つ前のページに戻ります。[/ja]
     */

  }, {
    key: 'popPage',
    value: function popPage() {
      var _this3 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _preparePageAndOption = this._preparePageAndOptions(null, options);

      options = _preparePageAndOption.options;


      var popUpdate = function popUpdate() {
        return new Promise(function (resolve) {
          _this3._pageLoader.unload(_this3.pages[_this3.pages.length - 1]);
          resolve();
        });
      };

      return this._popPage(options, popUpdate);
    }
  }, {
    key: '_popPage',
    value: function _popPage(options) {
      var _this4 = this;

      var update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return Promise.resolve();
      };

      if (this._isRunning) {
        return Promise.reject('popPage is already running.');
      }

      if (this.pages.length <= 1) {
        return Promise.reject('ons-navigator\'s page stack is empty.');
      }

      if (this._emitPrePopEvent()) {
        return Promise.reject('Canceled in prepop event.');
      }

      var length = this.pages.length;

      this._isRunning = true;

      this.pages[length - 2].updateBackButton(length - 2 > 0);

      return new Promise(function (resolve) {
        var leavePage = _this4.pages[length - 1];
        var enterPage = _this4.pages[length - 2];

        options.animation = options.animation || (leavePage.pushedOptions ? leavePage.pushedOptions.animation : undefined);
        options.animationOptions = util.extend({}, leavePage.pushedOptions ? leavePage.pushedOptions.animationOptions : {}, options.animationOptions || {});

        if (options.data) {
          enterPage.data = util.extend({}, enterPage.data || {}, options.data || {});
        }

        var callback = function callback() {
          update().then(function () {
            _this4._isRunning = false;

            enterPage._show();
            util.triggerElementEvent(_this4, 'postpop', { leavePage: leavePage, enterPage: enterPage, navigator: _this4 });

            if (typeof options.callback === 'function') {
              options.callback();
            }

            resolve(enterPage);
          });
        };

        leavePage._hide();
        var animator = options.animator || _this4._animatorFactory.newAnimator(options);
        animator.pop(_this4.pages[length - 2], _this4.pages[length - 1], callback);
      }).catch(function () {
        return _this4._isRunning = false;
      });
    }

    /**
     * @method pushPage
     * @signature pushPage(page, [options])
     * @param {String} page
     *   [en]Page URL. Can be either a HTML document or a template defined with the `<ons-template>` tag.[/en]
     *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.page]
     *   [en]Page URL. Only necessary if `page` parameter is null or undefined.[/en]
     *   [ja][/ja]
     * @param {String} [options.pageHTML]
     *   [en]HTML code that will be computed as a new page. Overwrites `page` parameter.[/en]
     *   [ja][/ja]
     * @param {String} [options.animation]
     *   [en]
     *     Animation name. Available animations are `"slide"`, `"lift"`, `"fade"` and `"none"`.
     *
     *     These are platform based animations. For fixed animations, add `"-ios"` or `"-md"` suffix to the animation name. E.g. `"lift-ios"`, `"lift-md"`. Defaults values are `"slide-ios"` and `"fade-md"`.
     *   [/en]
     *   [ja][/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}` [/ja]
     * @param {Function} [options.callback]
     *   [en]Function that is called when the transition has ended.[/en]
     *   [ja]pushPage()による画面遷移が終了した時に呼び出される関数オブジェクトを指定します。[/ja]
     * @param {Object} [options.data]
     *   [en]Custom data that will be stored in the new page element.[/en]
     *   [ja][/ja]
     * @return {Promise}
     *   [en]Promise which resolves to the pushed page.[/en]
     *   [ja]追加したページを解決するPromiseを返します。[/ja]
     * @description
     *   [en]Pushes the specified page into the stack.[/en]
     *   [ja]指定したpageを新しいページスタックに追加します。新しいページが表示されます。[/ja]
     */

  }, {
    key: 'pushPage',
    value: function pushPage(page) {
      var _this5 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _preparePageAndOption2 = this._preparePageAndOptions(page, options);

      page = _preparePageAndOption2.page;
      options = _preparePageAndOption2.options;


      var prepare = function prepare(pageElement) {
        _this5._verifyPageElement(pageElement);
        _this5._pageMap.set(pageElement, page);
        pageElement = util.extend(pageElement, {
          data: options.data
        });
        pageElement.style.visibility = 'hidden';
      };

      if (options.pageHTML) {
        return this._pushPage(options, function () {
          return new Promise(function (resolve) {
            instantPageLoader.load({ page: options.pageHTML, parent: _this5, params: options.data }, function (pageElement) {
              prepare(pageElement);
              resolve();
            });
          });
        });
      }

      return this._pushPage(options, function () {
        return new Promise(function (resolve) {
          _this5._pageLoader.load({ page: page, parent: _this5, params: options.data }, function (pageElement) {
            prepare(pageElement);
            resolve();
          });
        });
      });
    }
  }, {
    key: '_pushPage',
    value: function _pushPage() {
      var _this6 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return Promise.resolve();
      };

      if (this._isRunning) {
        return Promise.reject('pushPage is already running.');
      }

      if (this._emitPrePushEvent()) {
        return Promise.reject('Canceled in prepush event.');
      }

      this._isRunning = true;

      var animationOptions = AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options'));
      options = util.extend({}, this.options || {}, { animationOptions: animationOptions }, options);

      var animator = this._animatorFactory.newAnimator(options);

      return update().then(function () {
        var pageLength = _this6.pages.length;

        var enterPage = _this6.pages[pageLength - 1];
        var leavePage = options.leavePage || _this6.pages[pageLength - 2];

        if (enterPage.nodeName !== 'ONS-PAGE') {
          throw new Error('Only elements of type <ons-page> can be pushed to the navigator');
        }

        enterPage.updateBackButton(pageLength - 1);

        enterPage.pushedOptions = util.extend({}, enterPage.pushedOptions || {}, options || {});
        enterPage.data = util.extend({}, enterPage.data || {}, options.data || {});
        enterPage.unload = enterPage.unload || options.unload;

        return new Promise(function (resolve) {
          var done = function done() {
            _this6._isRunning = false;

            setImmediate(function () {
              return enterPage._show();
            });
            util.triggerElementEvent(_this6, 'postpush', { leavePage: leavePage, enterPage: enterPage, navigator: _this6 });

            if (typeof options.callback === 'function') {
              options.callback();
            }

            resolve(enterPage);
          };

          enterPage.style.visibility = '';
          if (leavePage) {
            leavePage._hide();
            animator.push(enterPage, leavePage, done);
          } else {
            done();
          }
        });
      }).catch(function (error) {
        _this6._isRunning = false;
        throw error;
      });
    }

    /**
     * @method replacePage
     * @signature replacePage(page, [options])
     * @return {Promise}
     *   [en]Promise which resolves to the new page.[/en]
     *   [ja]新しいページを解決するPromiseを返します。[/ja]
     * @description
     *   [en]Replaces the current top page with the specified one. Extends `pushPage()` parameters.[/en]
     *   [ja]現在表示中のページをを指定したページに置き換えます。[/ja]
     */

  }, {
    key: 'replacePage',
    value: function replacePage(page) {
      var _this7 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return this.pushPage(page, options).then(function (resolvedValue) {
        if (_this7.pages.length > 1) {
          _this7._pageLoader.unload(_this7.pages[_this7.pages.length - 2]);
        }
        _this7._updateLastPageBackButton();

        return Promise.resolve(resolvedValue);
      });
    }

    /**
     * @method insertPage
     * @signature insertPage(index, page, [options])
     * @param {Number} index
     *   [en]The index where it should be inserted.[/en]
     *   [ja]スタックに挿入する位置のインデックスを指定します。[/ja]
     * @return {Promise}
     *   [en]Promise which resolves to the inserted page.[/en]
     *   [ja]指定したページを解決するPromiseを返します。[/ja]
     * @description
     *   [en]Insert the specified page into the stack with at a position defined by the `index` argument. Extends `pushPage()` parameters.[/en]
     *   [ja]指定したpageをページスタックのindexで指定した位置に追加します。[/ja]
     */

  }, {
    key: 'insertPage',
    value: function insertPage(index, page) {
      var _this8 = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _preparePageAndOption3 = this._preparePageAndOptions(page, options);

      page = _preparePageAndOption3.page;
      options = _preparePageAndOption3.options;

      index = this._normalizeIndex(index);

      if (index >= this.pages.length) {
        return this.pushPage(page, options);
      }

      page = typeof options.pageHTML === 'string' ? options.pageHTML : page;
      var loader = typeof options.pageHTML === 'string' ? instantPageLoader : this._pageLoader;

      return new Promise(function (resolve) {
        loader.load({ page: page, parent: _this8 }, function (pageElement) {
          _this8._verifyPageElement(pageElement);
          _this8._pageMap.set(pageElement, page);
          pageElement = util.extend(pageElement, {
            data: options.data,
            pushedOptions: options
          });

          options.animationOptions = util.extend({}, AnimatorFactory.parseAnimationOptionsString(_this8.getAttribute('animation-options')), options.animationOptions || {});

          _this8.insertBefore(pageElement, _this8.pages[index]);
          _this8.topPage.updateBackButton(true);

          setTimeout(function () {
            pageElement = null;
            resolve(_this8.pages[index]);
          }, 1000 / 60);
        });
      });
    }

    /**
     * @method removePage
     * @signature removePage(index, [options])
     * @param {Number} index
     *   [en]The index where it should be removed.[/en]
     *   [ja]スタックから削除するページのインデックスを指定します。[/ja]
     * @return {Promise}
     *   [en]Promise which resolves to the revealed page.[/en]
     *   [ja]削除によって表示されたページを解決するPromiseを返します。[/ja]
     * @description
     *   [en]Remove the specified page at a position in the stack defined by the `index` argument. Extends `popPage()` parameters.[/en]
     *   [ja]指定したインデックスにあるページを削除します。[/ja]
     */

  }, {
    key: 'removePage',
    value: function removePage(index) {
      var _this9 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      index = this._normalizeIndex(index);

      if (index < this.pages.length - 1) {
        return new Promise(function (resolve) {
          var leavePage = _this9.pages[index];
          var enterPage = _this9.topPage;

          _this9._pageMap.delete(leavePage);
          _this9._pageLoader.unload(leavePage);
          if (_this9.pages.length === 1) {
            // edge case
            _this9.topPage.updateBackButton(false);
          }

          resolve(enterPage);
        });
      } else {
        return this.popPage(options);
      }
    }

    /**
     * @method resetToPage
     * @signature resetToPage(page, [options])
     * @return {Promise}
     *   [en]Promise which resolves to the new top page.[/en]
     *   [ja]新しいトップページを解決するPromiseを返します。[/ja]
     * @description
     *   [en]Clears page stack and adds the specified page to the stack. Extends `pushPage()` parameters.[/en]
     *   [ja]ページスタックをリセットし、指定したページを表示します。[/ja]
     */

  }, {
    key: 'resetToPage',
    value: function resetToPage(page) {
      var _this10 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _preparePageAndOption4 = this._preparePageAndOptions(page, options);

      page = _preparePageAndOption4.page;
      options = _preparePageAndOption4.options;


      if (!options.animator && !options.animation) {
        options.animation = 'none';
      }

      var callback = options.callback;

      options.callback = function () {
        while (_this10.pages.length > 1) {
          _this10._pageLoader.unload(_this10.pages[0]);
        }

        _this10.pages[0].updateBackButton(false);
        callback && callback();
      };

      if (!options.page && !options.pageHTML && this._getPageTarget()) {
        page = options.page = this._getPageTarget();
      }

      return this.pushPage(page, options);
    }

    /**
     * @method bringPageTop
     * @signature bringPageTop(item, [options])
     * @param {String|Number} item
     *   [en]Page URL or index of an existing page in navigator's stack.[/en]
     *   [ja]ページのURLかもしくはons-navigatorのページスタックのインデックス値を指定します。[/ja]
     * @return {Promise}
     *   [en]Promise which resolves to the new top page.[/en]
     *   [ja]新しいトップページを解決するPromiseを返します。[/ja]
     * @description
     *   [en]Brings the given page to the top of the page stack if it already exists or pushes it into the stack if doesn't. Extends `pushPage()` parameters.[/en]
     *   [ja]指定したページをページスタックの一番上に移動します。もし指定したページが無かった場合新しくpushされます。[/ja]
     */

  }, {
    key: 'bringPageTop',
    value: function bringPageTop(item) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (['number', 'string'].indexOf(typeof item === 'undefined' ? 'undefined' : _typeof(item)) === -1) {
        throw new Error('First argument must be a page name or the index of an existing page. You supplied ' + item);
      }
      var index = typeof item === 'number' ? this._normalizeIndex(item) : this._lastIndexOfPage(item);
      var page = this.pages[index];

      if (index < 0) {
        return this.pushPage(item, options);
      }

      var _preparePageAndOption5 = this._preparePageAndOptions(page, options);

      options = _preparePageAndOption5.options;


      if (index === this.pages.length - 1) {
        return Promise.resolve(page);
      }
      if (!page) {
        throw new Error('Failed to find item ' + item);
      }
      if (this._isRunning) {
        return Promise.reject('pushPage is already running.');
      }
      if (this._emitPrePushEvent()) {
        return Promise.reject('Canceled in prepush event.');
      }

      page.style.visibility = 'hidden';
      page.parentNode.appendChild(page);
      return this._pushPage(options);
    }
  }, {
    key: '_preparePageAndOptions',
    value: function _preparePageAndOptions(page) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) != 'object') {
        throw new Error('options must be an object. You supplied ' + options);
      }

      if ((page === null || page === undefined) && options.page) {
        page = options.page;
      }

      options = util.extend({}, this.options || {}, options, { page: page });

      return { page: page, options: options };
    }
  }, {
    key: '_updateLastPageBackButton',
    value: function _updateLastPageBackButton() {
      var index = this.pages.length - 1;
      if (index >= 0) {
        this.pages[index].updateBackButton(index > 0);
      }
    }
  }, {
    key: '_normalizeIndex',
    value: function _normalizeIndex(index) {
      return index >= 0 ? index : Math.abs(this.pages.length + index) % this.pages.length;
    }
  }, {
    key: '_onDeviceBackButton',
    value: function _onDeviceBackButton(event) {
      if (this.pages.length > 1) {
        this.popPage();
      } else {
        event.callParentHandler();
      }
    }
  }, {
    key: '_lastIndexOfPage',
    value: function _lastIndexOfPage(pageName) {
      var index = void 0;
      for (index = this.pages.length - 1; index >= 0; index--) {
        if (!this._pageMap.has(this.pages[index])) {
          throw Error('This is bug.');
        }

        if (pageName === this._pageMap.get(this.pages[index])) {
          break;
        }
      }
      return index;
    }
  }, {
    key: '_emitPreEvent',
    value: function _emitPreEvent(name) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var isCanceled = false;

      util.triggerElementEvent(this, 'pre' + name, util.extend({
        navigator: this,
        currentPage: this.pages[this.pages.length - 1],
        cancel: function cancel() {
          return isCanceled = true;
        }
      }, data));

      return isCanceled;
    }
  }, {
    key: '_emitPrePushEvent',
    value: function _emitPrePushEvent() {
      return this._emitPreEvent('push');
    }
  }, {
    key: '_emitPrePopEvent',
    value: function _emitPrePopEvent() {
      var l = this.pages.length;
      return this._emitPreEvent('pop', {
        leavePage: this.pages[l - 1],
        enterPage: this.pages[l - 2]
      });
    }

    // TODO: 書き直す

  }, {
    key: '_createPageElement',
    value: function _createPageElement(templateHTML) {
      var pageElement = util.createElement(internal$1.normalizePageHTML(templateHTML));
      this._verifyPageElement(pageElement);
      return pageElement;
    }

    /**
     * @param {Element} element
     */

  }, {
    key: '_verifyPageElement',
    value: function _verifyPageElement(element) {
      if (element.nodeName.toLowerCase() !== 'ons-page') {
        throw new Error('You must supply an "ons-page" element to "ons-navigator".');
      }
    }

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

  }, {
    key: '_show',
    value: function _show() {
      if (this.topPage) {
        this.topPage._show();
      }
    }
  }, {
    key: '_hide',
    value: function _hide() {
      if (this.topPage) {
        this.topPage._hide();
      }
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      for (var i = this.pages.length - 1; i >= 0; i--) {
        this._pageLoader.unload(this.pages[i]);
      }

      this.remove();
    }

    /**
     * @param {String} name
     * @param {Function} Animator
     */

  }, {
    key: 'pageLoader',
    get: function get$$1() {
      return this._pageLoader;
    },
    set: function set(pageLoader) {
      if (!(pageLoader instanceof PageLoader)) {
        throw Error('First parameter must be an instance of PageLoader.');
      }
      this._pageLoader = pageLoader;
    }
  }, {
    key: 'page',
    get: function get$$1() {
      return this._page;
    },
    set: function set(page) {
      this._page = page;
    }
  }, {
    key: 'onDeviceBackButton',
    get: function get$$1() {
      return this._backButtonHandler;
    },
    set: function set(callback) {
      if (this._backButtonHandler) {
        this._backButtonHandler.destroy();
      }

      this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
    }

    /**
     * @property topPage
     * @readonly
     * @type {HTMLElement}
     * @description
     *   [en]Current top page element. Use this method to access options passed by `pushPage()`-like methods.[/en]
     *   [ja]現在のページを取得します。pushPage()やresetToPage()メソッドの引数を取得できます。[/ja]
     */

  }, {
    key: 'topPage',
    get: function get$$1() {
      var last = this.lastElementChild;
      while (last && last.tagName !== 'ONS-PAGE') {
        last = last.previousElementSibling;
      }
      return last;
    }

    /**
     * @property pages
     * @readonly
     * @type {Array}
     * @description
     *   [en]Copy of the navigator's page stack.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'pages',
    get: function get$$1() {
      return util.arrayFrom(this.children).filter(function (element) {
        return element.tagName === 'ONS-PAGE';
      });
    }

    /**
     * @property options
     * @type {Object}
     * @description
     *   [en]Default options object. Attributes have priority over this property.[/en]
     *   [ja][/ja]
     */

    /**
     * @property options.animation
     * @type {String}
     * @description
     *   [en]
     *     Animation name. Available animations are `"slide"`, `"lift"`, `"fade"` and `"none"`.
     *     These are platform based animations. For fixed animations, add `"-ios"` or `"-md"` suffix to the animation name. E.g. `"lift-ios"`, `"lift-md"`. Defaults values are `"slide-ios"` and `"fade-md"`.
     *   [/en]
     *   [ja][/ja]
     */

    /**
     * @property options.animationOptions
     * @type {String}
     * @description
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}` [/ja]
     */

    /**
     * @property options.callback
     * @type {String}
     * @description
     *   [en]Function that is called when the transition has ended.[/en]
     *   [ja]このメソッドによる画面遷移が終了した際に呼び出される関数オブジェクトを指定します。[/ja]
     */

    /**
     * @property options.refresh
     * @default  false
     * @type {Boolean}
     * @description
     *   [en]This option has been removed in Onsen UI 2.3.0. If this parameter is `true`, the previous page will be refreshed (destroyed and created again) before `popPage()` action.[/en]
     *   [ja]このオプションは Onsen UI 2.3.0 で削除されました。popPageする前に、前にあるページを生成しなおして更新する場合にtrueを指定します。[/ja]
     */

  }, {
    key: 'options',
    get: function get$$1() {
      return this._options;
    },
    set: function set(object) {
      this._options = object;
    }
  }, {
    key: '_isRunning',
    set: function set(value) {
      this.setAttribute('_is-running', value ? 'true' : 'false');
    },
    get: function get$$1() {
      return JSON.parse(this.getAttribute('_is-running'));
    }
  }], [{
    key: 'registerAnimator',
    value: function registerAnimator(name, Animator) {
      if (!(Animator.prototype instanceof NavigatorTransitionAnimator)) {
        throw new Error('"Animator" param must inherit NavigatorElement.NavigatorTransitionAnimator');
      }

      _animatorDict$4[name] = Animator;
    }
  }, {
    key: 'observedAttributes',
    get: function get$$1() {
      return ['animation', 'swipeable'];
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict$4;
    }
  }, {
    key: 'NavigatorTransitionAnimator',
    get: function get$$1() {
      return NavigatorTransitionAnimator;
    }
  }, {
    key: 'events',
    get: function get$$1() {
      return ['prepush', 'postpush', 'prepop', 'postpop'];
    }
  }, {
    key: 'rewritables',
    get: function get$$1() {
      return rewritables;
    }
  }]);
  return NavigatorElement;
}(BaseElement);

customElements.define('ons-navigator', NavigatorElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$12 = 'toolbar';

var scheme$20 = {
  '': 'toolbar--*',
  '.toolbar__left': 'toolbar--*__left',
  '.toolbar__center': 'toolbar--*__center',
  '.toolbar__right': 'toolbar--*__right'
};

/**
 * @element ons-toolbar
 * @category page
 * @modifier material
 *   [en]Material Design toolbar.[/en]
 *   [ja][/ja]
 * @modifier transparent
 *   [en]Transparent toolbar.[/en]
 *   [ja]透明な背景を持つツールバーを表示します。[/ja]
 * @modifier cover-content
 *   [en]Displays the toolbar on top of the page's content. Should be combined with `transparent` modifier.[/en]
 *   [ja][/ja]
 * @modifier noshadow
 *   [en]Toolbar without shadow.[/en]
 *   [ja]ツールバーに影を付けずに表示します。[/ja]
 * @description
 *   [en]
 *     Toolbar component that can be used with navigation.
 *
 *     Left, center and right container can be specified by class names.
 *
 *     This component will automatically displays as a Material Design toolbar when running on Android devices.
 *   [/en]
 *   [ja]ナビゲーションで使用するツールバー用コンポーネントです。クラス名により、左、中央、右のコンテナを指定できます。[/ja]
 * @codepen aHmGL
 * @tutorial vanilla/Reference/page
 * @guide adding-a-toolbar [en]Adding a toolbar[/en][ja]ツールバーの追加[/ja]
 * @seealso ons-bottom-toolbar
 *   [en]The `<ons-bottom-toolbar>` displays a toolbar on the bottom of the page.[/en]
 *   [ja]ons-bottom-toolbarコンポーネント[/ja]
 * @seealso ons-back-button
 *   [en]The `<ons-back-button>` component displays a back button inside the toolbar.[/en]
 *   [ja]ons-back-buttonコンポーネント[/ja]
 * @seealso ons-toolbar-button
 *   [en]The `<ons-toolbar-button>` component displays a toolbar button inside the toolbar.[/en]
 *   [ja]ons-toolbar-buttonコンポーネント[/ja]
 * @example
 * <ons-page>
 *   <ons-toolbar>
 *     <div class="left">
 *       <ons-back-button>
 *         Back
 *       </ons-back-button>
 *     </div>
 *     <div class="center">
 *       Title
 *     </div>
 *     <div class="right">
 *       <ons-toolbar-button>
 *         <ons-icon icon="md-menu"></ons-icon>
 *       </ons-toolbar-button>
 *     </div>
 *   </ons-toolbar>
 * </ons-page>
 */

var ToolbarElement = function (_BaseElement) {
  inherits(ToolbarElement, _BaseElement);

  /**
   * @attribute inline
   * @initonly
   * @description
   *   [en]Display the toolbar as an inline element.[/en]
   *   [ja]ツールバーをインラインに置きます。スクロール領域内にそのまま表示されます。[/ja]
   */

  /**
   * @attribute modifier
   * @description
   *   [en]The appearance of the toolbar.[/en]
   *   [ja]ツールバーの表現を指定します。[/ja]
   */

  function ToolbarElement() {
    classCallCheck(this, ToolbarElement);

    var _this = possibleConstructorReturn(this, (ToolbarElement.__proto__ || Object.getPrototypeOf(ToolbarElement)).call(this));

    contentReady(_this, function () {
      _this._compile();
    });
    return _this;
  }

  createClass(ToolbarElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$12)) {
            this.className = defaultClassName$12 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$20);
          break;
      }
    }

    /**
     * @return {HTMLElement}
     */

  }, {
    key: '_getToolbarLeftItemsElement',
    value: function _getToolbarLeftItemsElement() {
      return this.querySelector('.left') || internal$1.nullElement;
    }

    /**
     * @return {HTMLElement}
     */

  }, {
    key: '_getToolbarCenterItemsElement',
    value: function _getToolbarCenterItemsElement() {
      return this.querySelector('.center') || internal$1.nullElement;
    }

    /**
     * @return {HTMLElement}
     */

  }, {
    key: '_getToolbarRightItemsElement',
    value: function _getToolbarRightItemsElement() {
      return this.querySelector('.right') || internal$1.nullElement;
    }

    /**
     * @return {HTMLElement}
     */

  }, {
    key: '_getToolbarBackButtonLabelElement',
    value: function _getToolbarBackButtonLabelElement() {
      return this.querySelector('ons-back-button .back-button__label') || internal$1.nullElement;
    }

    /**
     * @return {HTMLElement}
     */

  }, {
    key: '_getToolbarBackButtonIconElement',
    value: function _getToolbarBackButtonIconElement() {
      return this.querySelector('ons-back-button .back-button__icon') || internal$1.nullElement;
    }
  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);
      this.classList.add(defaultClassName$12);
      this._ensureToolbarItemElements();
      ModifierUtil.initModifier(this, scheme$20);
    }
  }, {
    key: '_ensureToolbarItemElements',
    value: function _ensureToolbarItemElements() {
      for (var i = this.childNodes.length - 1; i >= 0; i--) {
        // case of not element
        if (this.childNodes[i].nodeType != 1) {
          this.removeChild(this.childNodes[i]);
        }
      }

      var center = this._ensureToolbarElement('center');
      center.classList.add('toolbar__title');

      if (this.children.length !== 1 || !this.children[0].classList.contains('center')) {
        var left = this._ensureToolbarElement('left');
        var right = this._ensureToolbarElement('right');

        if (this.children[0] !== left || this.children[1] !== center || this.children[2] !== right) {
          this.appendChild(left);
          this.appendChild(center);
          this.appendChild(right);
        }
      }
    }
  }, {
    key: '_ensureToolbarElement',
    value: function _ensureToolbarElement(name) {
      if (util.findChild(this, '.toolbar__' + name)) {
        var _element = util.findChild(this, '.toolbar__' + name);
        _element.classList.add(name);
        return _element;
      }

      var element = util.findChild(this, '.' + name) || util.create('.' + name);
      element.classList.add('toolbar__' + name);

      return element;
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return ToolbarElement;
}(BaseElement);

customElements.define('ons-toolbar', ToolbarElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$11 = 'page';
var scheme$19 = {
  '': 'page--*',
  '.page__content': 'page--*__content',
  '.page__background': 'page--*__background'
};

var nullToolbarElement = document.createElement('ons-toolbar'); // requires that 'ons-toolbar' element is registered

/**
 * @element ons-page
 * @category page
 * @modifier material
 *   [en]Material Design style[/en]
 *   [ja][/ja]
 * @description
 *   [en]
 *     This component defines the root of each page. If the content is large it will become scrollable.
 *
 *     A navigation bar can be added to the top of the page using the `<ons-toolbar>` element.
 *   [/en]
 *   [ja]ページ定義のためのコンポーネントです。このコンポーネントの内容はスクロールが許可されます。[/ja]
 * @tutorial vanilla/Reference/page
 * @guide creating-a-page
 *   [en]Setting up a page in its `init` event[/en]
 *   [ja]Setting up a page in its `init` event[/ja]
 * @guide templates
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @guide multiple-page-navigation
 *   [en]Managing multiple pages[/en]
 *   [ja]複数のページを管理する[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @seealso ons-toolbar
 *   [en]Use the `<ons-toolbar>` element to add a navigation bar to the top of the page.[/en]
 *   [ja][/ja]
 * @example
 * <ons-page>
 *   <ons-toolbar>
 *     <div class="left">
 *       <ons-back-button>Back</ons-back-button>
 *     </div>
 *     <div class="center">Title</div>
 *     <div class="right">
 *       <ons-toolbar-button>
 *         <ons-icon icon="md-menu"></ons-icon>
 *       </ons-toolbar-button>
 *     </div>
 *   </ons-toolbar>
 *
 *   <p>Page content</p>
 * </ons-page>
 *
 * @example
 * <script>
 *   myApp.handler = function(done) {
 *     loadMore().then(done);
 *   }
 * </script>
 *
 * <ons-page on-infinite-scroll="myApp.handler">
 *   <ons-toolbar>
 *     <div class="center">List</div>
 *   </ons-toolbar>
 *
 *   <ons-list>
 *     <ons-list-item>#1</ons-list-item>
 *     <ons-list-item>#2</ons-list-item>
 *     <ons-list-item>#3</ons-list-item>
 *     ...
 *   </ons-list>
 * </ons-page>
 */

var PageElement = function (_BaseElement) {
  inherits(PageElement, _BaseElement);

  /**
   * @event init
   * @description
   *   [en]Fired right after the page is attached.[/en]
   *   [ja]ページがアタッチされた後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   */

  /**
   * @event show
   * @description
   *   [en]Fired right after the page is shown.[/en]
   *   [ja]ページが表示された後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   */

  /**
   * @event hide
   * @description
   *   [en]Fired right after the page is hidden.[/en]
   *   [ja]ページが隠れた後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   */

  /**
   * @event destroy
   * @description
   *   [en]Fired right before the page is destroyed.[/en]
   *   [ja]ページが破棄される前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   */

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]Specify modifier name to specify custom styles.[/en]
   *   [ja]スタイル定義をカスタマイズするための名前を指定します。[/ja]
   */

  /**
   * @attribute on-infinite-scroll
   * @type {String}
   * @description
   *   [en]Path of the function to be executed on infinite scrolling. Example: `app.loadData`. The function receives a done callback that must be called when it's finished.[/en]
   *   [ja][/ja]
   */

  function PageElement() {
    classCallCheck(this, PageElement);

    var _this = possibleConstructorReturn(this, (PageElement.__proto__ || Object.getPrototypeOf(PageElement)).call(this));

    _this._deriveHooks();

    _this.classList.add(defaultClassName$11);
    _this._initialized = false;

    contentReady(_this, function () {
      _this._compile();

      _this._isShown = false;
      _this._contentElement = _this._getContentElement();
      _this._backgroundElement = _this._getBackgroundElement();
    });
    return _this;
  }

  createClass(PageElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this2 = this;

      if (this._initialized) {
        return;
      }

      this._initialized = true;

      contentReady(this, function () {
        setImmediate(function () {
          _this2.onInit && _this2.onInit();
          util.triggerElementEvent(_this2, 'init');
        });

        if (!util.hasAnyComponentAsParent(_this2)) {
          setImmediate(function () {
            return _this2._show();
          });
        }

        _this2._tryToFillStatusBar();

        if (_this2.hasAttribute('on-infinite-scroll')) {
          _this2.attributeChangedCallback('on-infinite-scroll', null, _this2.getAttribute('on-infinite-scroll'));
        }
      });
    }
  }, {
    key: 'updateBackButton',
    value: function updateBackButton(show) {
      if (this.backButton) {
        show ? this.backButton.show() : this.backButton.hide();
      }
    }
  }, {
    key: '_tryToFillStatusBar',
    value: function _tryToFillStatusBar() {
      var _this3 = this;

      internal$1.autoStatusBarFill(function () {
        var filled = util.findParent(_this3, function (e) {
          return e.hasAttribute('status-bar-fill');
        }, function (e) {
          return !e.nodeName.match(/ons-modal/i);
        });
        util.toggleAttribute(_this3, 'status-bar-fill', !filled && (_this3._canAnimateToolbar() || !_this3._hasAPageControlChild()));
      });
    }
  }, {
    key: '_hasAPageControlChild',
    value: function _hasAPageControlChild() {
      return util.findChild(this._contentElement, util.isPageControl);
    }

    /**
     * @property onInfiniteScroll
     * @description
     *  [en]Function to be executed when scrolling to the bottom of the page. The function receives a done callback as an argument that must be called when it's finished.[/en]
     *  [ja][/ja]
     */

  }, {
    key: '_onScroll',
    value: function _onScroll() {
      var _this4 = this;

      var c = this._contentElement,
          overLimit = (c.scrollTop + c.clientHeight) / c.scrollHeight >= this._infiniteScrollLimit;

      if (this._onInfiniteScroll && !this._loadingContent && overLimit) {
        this._loadingContent = true;
        this._onInfiniteScroll(function () {
          return _this4._loadingContent = false;
        });
      }
    }

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

  }, {
    key: '_getContentElement',


    /**
     * @return {HTMLElement}
     */
    value: function _getContentElement() {
      var result = util.findChild(this, '.page__content');
      if (result) {
        return result;
      }
      throw Error('fail to get ".page__content" element.');
    }

    /**
     * @return {Boolean}
     */

  }, {
    key: '_canAnimateToolbar',
    value: function _canAnimateToolbar() {
      if (util.findChild(this, 'ons-toolbar')) {
        return true;
      }
      return !!util.findChild(this._contentElement, function (el) {
        return util.match(el, 'ons-toolbar') && !el.hasAttribute('inline');
      });
    }

    /**
     * @return {HTMLElement}
     */

  }, {
    key: '_getBackgroundElement',
    value: function _getBackgroundElement() {
      var result = util.findChild(this, '.page__background');
      if (result) {
        return result;
      }
      throw Error('fail to get ".page__background" element.');
    }

    /**
     * @return {HTMLElement}
     */

  }, {
    key: '_getBottomToolbarElement',
    value: function _getBottomToolbarElement() {
      return util.findChild(this, 'ons-bottom-toolbar') || internal$1.nullElement;
    }

    /**
     * @return {HTMLElement}
     */

  }, {
    key: '_getToolbarElement',
    value: function _getToolbarElement() {
      return util.findChild(this, 'ons-toolbar') || nullToolbarElement;
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      var _this5 = this;

      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$11)) {
            this.className = defaultClassName$11 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$19);
          break;
        case 'on-infinite-scroll':
          if (current === null) {
            this.onInfiniteScroll = null;
          } else {
            this.onInfiniteScroll = function (done) {
              var f = util.findFromPath(current);
              _this5.onInfiniteScroll = f;
              f(done);
            };
          }
          break;
      }
    }
  }, {
    key: '_compile',
    value: function _compile() {
      var _this6 = this;

      autoStyle.prepare(this);

      var toolbar = util.findChild(this, 'ons-toolbar');

      var background = util.findChild(this, '.page__background') || util.findChild(this, '.background') || document.createElement('div');
      background.classList.add('page__background');
      this.insertBefore(background, !toolbar && this.firstChild || toolbar && toolbar.nextSibling);

      var content = util.findChild(this, '.page__content') || util.findChild(this, '.content') || document.createElement('div');
      content.classList.add('page__content');
      if (!content.parentElement) {
        util.arrayFrom(this.childNodes).forEach(function (node) {
          if (node.nodeType !== 1 || _this6._elementShouldBeMoved(node)) {
            content.appendChild(node);
          }
        });
      }
      this.insertBefore(content, background.nextSibling);

      // Make wrapper pages transparent for animations
      if (!background.style.backgroundColor && content.children.length === 1 && util.isPageControl(content.children[0])) {
        background.style.backgroundColor = 'transparent';
      }

      ModifierUtil.initModifier(this, scheme$19);
    }
  }, {
    key: '_elementShouldBeMoved',
    value: function _elementShouldBeMoved(el) {
      if (el.classList.contains('page__background')) {
        return false;
      }
      var tagName = el.tagName.toLowerCase();
      if (tagName === 'ons-fab') {
        return !el.hasAttribute('position');
      }
      var fixedElements = ['script', 'ons-toolbar', 'ons-bottom-toolbar', 'ons-modal', 'ons-speed-dial', 'ons-dialog', 'ons-alert-dialog', 'ons-popover', 'ons-action-sheet'];
      return el.hasAttribute('inline') || fixedElements.indexOf(tagName) === -1;
    }
  }, {
    key: '_show',
    value: function _show() {
      if (!this._isShown && util.isAttached(this)) {
        this._isShown = true;
        this.onShow && this.onShow();
        util.triggerElementEvent(this, 'show');
        util.propagateAction(this, '_show');
      }
    }
  }, {
    key: '_hide',
    value: function _hide() {
      if (this._isShown) {
        this._isShown = false;
        this.onHide && this.onHide();
        util.triggerElementEvent(this, 'hide');
        util.propagateAction(this, '_hide');
      }
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      this._hide();

      this.onDestroy && this.onDestroy();
      util.triggerElementEvent(this, 'destroy');

      if (this.onDeviceBackButton) {
        this.onDeviceBackButton.destroy();
      }

      util.propagateAction(this, '_destroy');

      this.remove();
    }
  }, {
    key: '_deriveHooks',
    value: function _deriveHooks() {
      var _this7 = this;

      this.constructor.events.forEach(function (event) {
        var key = 'on' + event.charAt(0).toUpperCase() + event.slice(1);
        Object.defineProperty(_this7, key, {
          enumerable: true,
          get: function get$$1() {
            return _this7['_' + key];
          },
          set: function set(value) {
            if (!(value instanceof Function)) {
              throw new Error(key + ' hook must be a function');
            }
            _this7['_' + key] = value.bind(_this7);
          }
        });
      });
    }
  }, {
    key: 'name',
    set: function set(str) {
      this.setAttribute('name', str);
    },
    get: function get$$1() {
      return this.getAttribute('name');
    }
  }, {
    key: 'backButton',
    get: function get$$1() {
      return this.querySelector('ons-back-button');
    }
  }, {
    key: 'onInfiniteScroll',
    set: function set(value) {
      var _this8 = this;

      if (value === null) {
        this._onInfiniteScroll = null;
        this._contentElement.removeEventListener('scroll', this._boundOnScroll);
        return;
      }
      if (!(value instanceof Function)) {
        throw new Error('onInfiniteScroll must be a function or null');
      }
      if (!this._onInfiniteScroll) {
        this._infiniteScrollLimit = 0.9;
        this._boundOnScroll = this._onScroll.bind(this);
        setImmediate(function () {
          return _this8._contentElement.addEventListener('scroll', _this8._boundOnScroll);
        });
      }
      this._onInfiniteScroll = value;
    },
    get: function get$$1() {
      return this._onInfiniteScroll;
    }
  }, {
    key: 'onDeviceBackButton',
    get: function get$$1() {
      return this._backButtonHandler;
    },
    set: function set(callback) {
      if (this._backButtonHandler) {
        this._backButtonHandler.destroy();
      }

      this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
    }
  }, {
    key: 'scrollTop',
    get: function get$$1() {
      return this._contentElement.scrollTop;
    },
    set: function set(newValue) {
      this._contentElement.scrollTop = newValue;
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'on-infinite-scroll', 'class'];
    }
  }, {
    key: 'events',
    get: function get$$1() {
      return ['init', 'show', 'hide', 'destroy'];
    }

    /**
     * @property data
     * @type {*}
     * @description
     *   [en]User's custom data passed to `pushPage()`-like methods.[/en]
     *   [ja][/ja]
     */

  }]);
  return PageElement;
}(BaseElement);

customElements.define('ons-page', PageElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
var PopoverAnimator = function (_BaseAnimator) {
  inherits(PopoverAnimator, _BaseAnimator);

  /**
   * @param {Object} options
   * @param {String} options.timing
   * @param {Number} options.duration
   * @param {Number} options.delay
   */
  function PopoverAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.2 : _ref$duration;

    classCallCheck(this, PopoverAnimator);
    return possibleConstructorReturn(this, (PopoverAnimator.__proto__ || Object.getPrototypeOf(PopoverAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  createClass(PopoverAnimator, [{
    key: 'show',
    value: function show(popover, callback) {
      callback();
    }
  }, {
    key: 'hide',
    value: function hide(popover, callback) {
      callback();
    }
  }, {
    key: '_animate',
    value: function _animate(element, _ref2) {
      var from = _ref2.from,
          to = _ref2.to,
          options = _ref2.options,
          callback = _ref2.callback,
          _ref2$restore = _ref2.restore,
          restore = _ref2$restore === undefined ? false : _ref2$restore,
          animation = _ref2.animation;

      options = util.extend({}, this.options, options);

      if (animation) {
        from = animation.from;
        to = animation.to;
      }

      animation = Animit(element);
      if (restore) {
        animation = animation.saveStyle();
      }
      animation = animation.queue(from).wait(this.delay).queue({
        css: to,
        duration: this.duration,
        timing: this.timing
      });
      if (restore) {
        animation = animation.restoreStyle();
      }
      if (callback) {
        animation = animation.queue(function (done) {
          callback();
          done();
        });
      }
      return animation;
    }
  }, {
    key: '_animateAll',
    value: function _animateAll(element, animations) {
      var _this2 = this;

      Object.keys(animations).forEach(function (key) {
        return _this2._animate(element[key], animations[key]).play();
      });
    }
  }]);
  return PopoverAnimator;
}(BaseAnimator);

var fade = {
  out: {
    from: { opacity: 1.0 },
    to: { opacity: 0 }
  },
  in: {
    from: { opacity: 0 },
    to: { opacity: 1.0 }
  }
};

var MDFadePopoverAnimator = function (_PopoverAnimator) {
  inherits(MDFadePopoverAnimator, _PopoverAnimator);

  function MDFadePopoverAnimator() {
    classCallCheck(this, MDFadePopoverAnimator);
    return possibleConstructorReturn(this, (MDFadePopoverAnimator.__proto__ || Object.getPrototypeOf(MDFadePopoverAnimator)).apply(this, arguments));
  }

  createClass(MDFadePopoverAnimator, [{
    key: 'show',
    value: function show(popover, callback) {
      this._animateAll(popover, {
        _mask: fade.in,
        _popover: { animation: fade.in, restore: true, callback: callback }
      });
    }
  }, {
    key: 'hide',
    value: function hide(popover, callback) {
      this._animateAll(popover, {
        _mask: fade.out,
        _popover: { animation: fade.out, restore: true, callback: callback }
      });
    }
  }]);
  return MDFadePopoverAnimator;
}(PopoverAnimator);

var IOSFadePopoverAnimator = function (_MDFadePopoverAnimato) {
  inherits(IOSFadePopoverAnimator, _MDFadePopoverAnimato);

  function IOSFadePopoverAnimator() {
    classCallCheck(this, IOSFadePopoverAnimator);
    return possibleConstructorReturn(this, (IOSFadePopoverAnimator.__proto__ || Object.getPrototypeOf(IOSFadePopoverAnimator)).apply(this, arguments));
  }

  createClass(IOSFadePopoverAnimator, [{
    key: 'show',
    value: function show(popover, callback) {
      this._animateAll(popover, {
        _mask: fade.in,
        _popover: {
          from: {
            transform: 'scale3d(1.3, 1.3, 1.0)',
            opacity: 0
          },
          to: {
            transform: 'scale3d(1.0, 1.0,  1.0)',
            opacity: 1.0
          },
          restore: true,
          callback: callback
        }
      });
    }
  }]);
  return IOSFadePopoverAnimator;
}(MDFadePopoverAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$21 = {
  '.popover': 'popover--*',
  '.popover-mask': 'popover-mask--*',
  '.popover__content': 'popover--*__content',
  '.popover__arrow': 'popover--*__arrow'
};

var _animatorDict$5 = {
  'default': function _default() {
    return platform$1.isAndroid() ? MDFadePopoverAnimator : IOSFadePopoverAnimator;
  },
  'none': PopoverAnimator,
  'fade-ios': IOSFadePopoverAnimator,
  'fade-md': MDFadePopoverAnimator
};

var templateSource = util.createFragment('\n  <div class="popover-mask"></div>\n  <div class="popover">\n    <div class="popover__content"></div>\n    <div class="popover__arrow"></div>\n  </div>\n');

var positions = {
  up: 'bottom',
  left: 'right',
  down: 'top',
  right: 'left'
};

/**
 * @element ons-popover
 * @category dialog
 * @description
 *  [en]
 *    A component that displays a popover next to an element. The popover can be used to display extra information about a component or a tooltip.
 *
 *    To use the element it can either be attached directly to the `<body>` element or dynamically created from a template using the `ons.createPopover(template)` utility function and the `<ons-template>` tag.
 *
 *    Another common way to use the popover is to display a menu when a button on the screen is tapped. For Material Design, popover looks exactly as a dropdown menu.
 *  [/en]
 *  [ja]ある要素を対象とするポップオーバーを表示するコンポーネントです。[/ja]
 * @codepen ZYYRKo
 * @tutorial vanilla/Reference/popover
 * @guide dialogs
 *  [en]Dialog components[/en]
 *  [ja]Dialog components[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @example
 * <ons-button onclick="showPopover(this)">
 *   Click me!
 * </ons-button>
 *
 * <ons-popover direction="down" id="popover">
 *   <p>This is a popover!</p>
 * </ons-popover>
 *
 * <script>
 *   var showPopover = function(element) {
 *     var popover = document.getElementById('popover');
 *     popover.show(element);
 *   };
 * </script>
 */

var PopoverElement = function (_BaseDialogElement) {
  inherits(PopoverElement, _BaseDialogElement);

  /**
   * @event preshow
   * @description
   *   [en]Fired just before the popover is displayed.[/en]
   *   [ja]ポップオーバーが表示される直前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.popover
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Call this function to stop the popover from being shown.[/en]
   *   [ja]この関数を呼び出すと、ポップオーバーの表示がキャンセルされます。[/ja]
   */

  /**
   * @event postshow
   * @description
   *   [en]Fired just after the popover is displayed.[/en]
   *   [ja]ポップオーバーが表示された直後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.popover
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @event prehide
   * @description
   *   [en]Fired just before the popover is hidden.[/en]
   *   [ja]ポップオーバーが隠れる直前に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.popover
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Call this function to stop the popover from being hidden.[/en]
   *   [ja]この関数を呼び出すと、ポップオーバーが隠れる処理をキャンセルします。[/ja]
   */

  /**
   * @event posthide
   * @description
   *   [en]Fired just after the popover is hidden.[/en]
   *   [ja]ポップオーバーが隠れた後に発火します。[/ja]
   * @param {Object} event [en]Event object.[/en]
   * @param {Object} event.popover
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *  [en]The appearance of the popover.[/en]
   *  [ja]ポップオーバーの表現を指定します。[/ja]
   */

  /**
   * @attribute direction
   * @type {String}
   * @description
   *  [en]
   *    A space separated list of directions. If more than one direction is specified,
   *    it will be chosen automatically. Valid directions are `"up"`, `"down"`, `"left"` and `"right"`.
   *  [/en]
   *  [ja]
   *    ポップオーバーを表示する方向を空白区切りで複数指定できます。
   *    指定できる方向は、"up", "down", "left", "right"の4つです。空白区切りで複数指定することもできます。
   *    複数指定された場合、対象とする要素に合わせて指定した値から自動的に選択されます。
   *  [/ja]
   */

  /**
   * @attribute cancelable
   * @description
   *   [en]If this attribute is set the popover can be closed by tapping the background or by pressing the back button.[/en]
   *   [ja]この属性があると、ポップオーバーが表示された時に、背景やバックボタンをタップした時にをポップオーバー閉じます。[/ja]
   */

  /**
   * @attribute cover-target
   * @description
   *   [en]If set the popover will cover the target on the screen.[/en]
   *   [ja][/ja]
   */

  /**
   * @attribute animation
   * @type {String}
   * @description
   *   [en]The animation used when showing an hiding the popover. Can be either `"none"`, `"default"`, `"fade-ios"` or `"fade-md"`.[/en]
   *   [ja]ポップオーバーを表示する際のアニメーション名を指定します。[/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. {duration: 0.2, delay: 1, timing: 'ease-in'}[/ja]
   */

  /**
   * @attribute mask-color
   * @type {Color}
   * @description
   *   [en]Color of the background mask. Default is `"rgba(0, 0, 0, 0.2)"`.[/en]
   *   [ja]背景のマスクの色を指定します。デフォルトは"rgba(0, 0, 0, 0.2)"です。[/ja]
   */

  function PopoverElement() {
    classCallCheck(this, PopoverElement);

    var _this = possibleConstructorReturn(this, (PopoverElement.__proto__ || Object.getPrototypeOf(PopoverElement)).call(this));

    _this._boundOnChange = _this._onChange.bind(_this);

    contentReady(_this, function () {
      _this._compile();
      _this.style.display = 'none';
    });
    return _this;
  }

  createClass(PopoverElement, [{
    key: '_updateAnimatorFactory',
    value: function _updateAnimatorFactory() {
      return new AnimatorFactory({
        animators: _animatorDict$5,
        baseClass: PopoverAnimator,
        baseClassName: 'PopoverAnimator',
        defaultAnimation: this.getAttribute('animation') || 'default'
      });
    }
  }, {
    key: '_toggleStyle',
    value: function _toggleStyle(shouldShow) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (shouldShow) {
        this.style.display = 'block';
        this._currentTarget = options.target;
        this._positionPopover(options.target);
      } else {
        this.style.display = 'none';
        this._clearStyles();
      }
    }
  }, {
    key: '_positionPopover',
    value: function _positionPopover(target) {
      var radius = this._radius,
          contentElement = this._content,
          margin = this._margin;

      var targetRect = target.getBoundingClientRect();
      var isMD = util.hasModifier(this, 'material');
      var cover = isMD && this.hasAttribute('cover-target');

      var targetDistance = {
        top: targetRect.top - margin,
        left: targetRect.left - margin,
        right: window.innerWidth - targetRect.right - margin,
        bottom: window.innerHeight - targetRect.bottom - margin
      };

      var targetCenterDistanceFrom = {
        top: targetRect.top + Math.round(targetRect.height / 2),
        bottom: window.innerHeight - targetRect.bottom + Math.round(targetRect.height / 2),
        left: targetRect.left + Math.round(targetRect.width / 2),
        right: window.innerWidth - targetRect.right + Math.round(targetRect.width / 2)
      };

      var _calculateDirections2 = this._calculateDirections(targetDistance),
          vertical = _calculateDirections2.vertical,
          primaryDirection = _calculateDirections2.primary,
          secondary = _calculateDirections2.secondary;

      ModifierUtil.addModifier(this, primaryDirection);

      var sizeName = vertical ? 'width' : 'height';
      // Get .popover__content size
      var contentSize = function (style) {
        return {
          width: parseInt(style.getPropertyValue('width'), 10),
          height: parseInt(style.getPropertyValue('height'), 10)
        };
      }(window.getComputedStyle(contentElement));

      // Setting .popover position.
      var offset = cover ? 0 : (vertical ? targetRect.height : targetRect.width) + (isMD ? 0 : 14);
      this._popover.style[primaryDirection] = Math.max(margin, targetDistance[primaryDirection] + offset + margin) + 'px';
      var secondaryOffset = Math.max(margin, margin + targetDistance[secondary] - (contentSize[sizeName] - targetRect[sizeName]) / 2);
      this._popover.style[secondary] = secondaryOffset + 'px';

      // Setting .popover__arrow position.
      this._arrow.style[secondary] = Math.max(radius, targetCenterDistanceFrom[secondary] - secondaryOffset) + 'px';
    }
  }, {
    key: '_calculateDirections',
    value: function _calculateDirections(distance) {
      var options = (this.getAttribute('direction') || 'up down left right').split(/\s+/).map(function (e) {
        return positions[e];
      });
      var primary = options.sort(function (a, b) {
        return distance[a] - distance[b];
      })[0];
      var vertical = 'top' == primary || 'bottom' == primary;
      var secondary = void 0;

      if (vertical) {
        secondary = distance.left < distance.right ? 'left' : 'right';
      } else {
        secondary = distance.top < distance.bottom ? 'top' : 'bottom';
      }

      return { vertical: vertical, primary: primary, secondary: secondary };
    }
  }, {
    key: '_clearStyles',
    value: function _clearStyles() {
      var _this2 = this;

      ['top', 'bottom', 'left', 'right'].forEach(function (e) {
        _this2._arrow.style[e] = _this2._content.style[e] = _this2._popover.style[e] = '';
        ModifierUtil.removeModifier(_this2, e);
      });
    }
  }, {
    key: '_onChange',
    value: function _onChange() {
      var _this3 = this;

      setImmediate(function () {
        if (_this3._currentTarget) {
          _this3._positionPopover(_this3._currentTarget);
        }
      });
    }
  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      if (this._popover && this._mask) {
        return;
      }

      var hasDefaultContainer = this._popover && this._content;

      if (hasDefaultContainer) {

        if (!this._mask) {
          var mask = document.createElement('div');
          mask.classList.add('popover-mask');
          this.insertBefore(mask, this.firstChild);
        }

        if (!this._arrow) {
          var arrow = document.createElement('div');
          arrow.classList.add('popover__arrow');
          this._popover.appendChild(arrow);
        }
      } else {

        var template = templateSource.cloneNode(true);
        var content = template.querySelector('.popover__content');

        while (this.childNodes[0]) {
          content.appendChild(this.childNodes[0]);
        }

        this.appendChild(template);
      }

      // FIXME!
      if (this.hasAttribute('style')) {
        this._popover.setAttribute('style', this.getAttribute('style'));
        this.removeAttribute('style');
      }

      ModifierUtil.initModifier(this, this._scheme);
    }

    /**
     * @method show
     * @signature show(target, [options])
     * @param {String|Event|HTMLElement} target
     *   [en]Target element. Can be either a CSS selector, an event object or a DOM element. It can be also provided as 'options.target' instead. [/en]
     *   [ja]ポップオーバーのターゲットとなる要素を指定します。CSSセレクタかeventオブジェクトかDOM要素のいずれかを渡せます。[/ja]
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name.  Use one of `"fade-ios"`, `"fade-md"`, `"none"` and `"default"`.[/en]
     *   [ja]アニメーション名を指定します。"fade-ios", "fade-md", "none", "default"のいずれかを指定できます。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @param {Function} [options.callback]
     *   [en]This function is called after the popover has been revealed.[/en]
     *   [ja]ポップオーバーが表示され終わった後に呼び出される関数オブジェクトを指定します。[/ja]
     * @description
     *   [en]Open the popover and point it at a target. The target can be either an event, a CSS selector or a DOM element..[/en]
     *   [ja]対象とする要素にポップオーバーを表示します。target引数には、$eventオブジェクトやDOMエレメントやCSSセレクタを渡すことが出来ます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the displayed element[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'show',
    value: function show(target) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // Copy options and include options.target
      if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && !(target instanceof Event) && !(target instanceof HTMLElement)) {
        options = _extends({}, target);
      } else {
        options = _extends({}, options, { target: target });
      }

      if (typeof options.target === 'string') {
        options.target = document.querySelector(options.target);
      } else if (options.target instanceof Event) {
        options.target = options.target.target;
      }

      if (typeof options.target === 'undefined') {
        throw new Error('A target or options.target argument must be defined for the popover.');
      }

      if (!(options.target instanceof HTMLElement)) {
        throw new Error('Invalid target for popover.');
      }

      return get(PopoverElement.prototype.__proto__ || Object.getPrototypeOf(PopoverElement.prototype), 'show', this).call(this, options);
    }

    /**
     * @method hide
     * @signature hide([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name.  Use one of `"fade-ios"`, `"fade-md"`, `"none"` and `"default"`.[/en]
     *   [ja]アニメーション名を指定します。"fade-ios", "fade-md", "none", "default"のいずれかを指定できます。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @param {Function} [options.callback]
     *   [en]This functions is called after the popover has been hidden.[/en]
     *   [ja]ポップオーバーが隠れた後に呼び出される関数オブジェクトを指定します。[/ja]
     * @description
     *   [en]Close the popover.[/en]
     *   [ja]ポップオーバーを閉じます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the hidden element[/en]
     *   [ja][/ja]
     */

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the element is visible or not.[/en]
     *   [ja]要素が見える場合に`true`。[/ja]
     */

    /**
     * @property cancelable
     * @type {Boolean}
     * @description
     *   [en]
     *     A boolean value that specifies whether the popover is cancelable or not.
     *
     *     When the popover is cancelable it can be closed by tapping the background or by pressing the back button on Android devices.
     *   [/en]
     *   [ja][/ja]
     */

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this4 = this;

      get(PopoverElement.prototype.__proto__ || Object.getPrototypeOf(PopoverElement.prototype), 'connectedCallback', this).call(this);

      window.addEventListener('resize', this._boundOnChange, false);
      this._margin = this._margin || parseInt(window.getComputedStyle(this).getPropertyValue('top'));
      this._margin = this._margin || 6; // Fix for iframes

      contentReady(this, function () {
        _this4._radius = parseInt(window.getComputedStyle(_this4._content).getPropertyValue('border-top-left-radius'));
      });
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      get(PopoverElement.prototype.__proto__ || Object.getPrototypeOf(PopoverElement.prototype), 'disconnectedCallback', this).call(this);
      window.removeEventListener('resize', this._boundOnChange, false);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'direction') {
        this._boundOnChange();
      } else {
        get(PopoverElement.prototype.__proto__ || Object.getPrototypeOf(PopoverElement.prototype), 'attributeChangedCallback', this).call(this, name, last, current);
      }
    }

    /**
     * @param {String} name
     * @param {PopoverAnimator} Animator
     */

  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme$21;
    }
  }, {
    key: '_mask',
    get: function get$$1() {
      return util.findChild(this, '.popover-mask');
    }
  }, {
    key: '_popover',
    get: function get$$1() {
      return util.findChild(this, '.popover');
    }
  }, {
    key: '_content',
    get: function get$$1() {
      return util.findChild(this._popover, '.popover__content');
    }
  }, {
    key: '_arrow',
    get: function get$$1() {
      return util.findChild(this._popover, '.popover__arrow');
    }
  }], [{
    key: 'registerAnimator',
    value: function registerAnimator(name, Animator) {
      if (!(Animator.prototype instanceof PopoverAnimator)) {
        throw new Error('"Animator" param must inherit PopoverAnimator');
      }
      _animatorDict$5[name] = Animator;
    }
  }, {
    key: 'observedAttributes',
    get: function get$$1() {
      return [].concat(toConsumableArray(get(PopoverElement.__proto__ || Object.getPrototypeOf(PopoverElement), 'observedAttributes', this)), ['direction']);
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict$5;
    }
  }, {
    key: 'PopoverAnimator',
    get: function get$$1() {
      return PopoverAnimator;
    }
  }]);
  return PopoverElement;
}(BaseDialogElement);

customElements.define('ons-popover', PopoverElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$22 = {
  '.progress-bar': 'progress-bar--*',
  '.progress-bar__primary': 'progress-bar--*__primary',
  '.progress-bar__secondary': 'progress-bar--*__secondary'
};

var template = util.createElement('\n  <div class="progress-bar">\n    <div class="progress-bar__secondary"></div>\n    <div class="progress-bar__primary"></div>\n  </div>\n');

/**
 * @element ons-progress-bar
 * @category visual
 * @description
 *   [en]
 *     The component is used to display a linear progress bar. It can either display a progress bar that shows the user how much of a task has been completed. In the case where the percentage is not known it can be used to display an animated progress bar so the user can see that an operation is in progress.
 *   [/en]
 *   [ja][/ja]
 * @codepen zvQbGj
 * @tutorial vanilla/Reference/progress
 * @seealso ons-progress-circular
 *   [en]The `<ons-progress-circular>` component displays a circular progress indicator.[/en]
 *   [ja][/ja]
 * @example
 * <ons-progress-bar
 *  value="55"
 *  secondary-value="87">
 * </ons-progress-bar>
 *
 * <ons-progress-bar
 *  indeterminate>
 * </ons-progress-bar>
 */

var ProgressBarElement = function (_BaseElement) {
  inherits(ProgressBarElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]Change the appearance of the progress indicator.[/en]
   *   [ja]プログレスインジケータの見た目を変更します。[/ja]
   */

  /**
   * @attribute value
   * @type {Number}
   * @description
   *   [en]Current progress. Should be a value between 0 and 100.[/en]
   *   [ja]現在の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
   */

  /**
   * @attribute secondary-value
   * @type {Number}
   * @description
   *   [en]Current secondary progress. Should be a value between 0 and 100.[/en]
   *   [ja]現在の２番目の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
   */

  /**
   * @attribute indeterminate
   * @description
   *   [en]If this attribute is set, an infinite looping animation will be shown.[/en]
   *   [ja]この属性が設定された場合、ループするアニメーションが表示されます。[/ja]
   */

  function ProgressBarElement() {
    classCallCheck(this, ProgressBarElement);

    var _this = possibleConstructorReturn(this, (ProgressBarElement.__proto__ || Object.getPrototypeOf(ProgressBarElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  createClass(ProgressBarElement, [{
    key: '_compile',
    value: function _compile() {
      if (!this._isCompiled()) {
        this._template = template.cloneNode(true);
      } else {
        this._template = util.findChild(this, '.progress-bar');
      }

      this._primary = util.findChild(this._template, '.progress-bar__primary');
      this._secondary = util.findChild(this._template, '.progress-bar__secondary');

      this._updateDeterminate();
      this._updateValue();

      this.appendChild(this._template);

      autoStyle.prepare(this);
      ModifierUtil.initModifier(this, scheme$22);
    }
  }, {
    key: '_isCompiled',
    value: function _isCompiled() {
      if (!util.findChild(this, '.progress-bar')) {
        return false;
      }

      var barElement = util.findChild(this, '.progress-bar');

      if (!util.findChild(barElement, '.progress-bar__secondary')) {
        return false;
      }

      if (!util.findChild(barElement, '.progress-bar__primary')) {
        return false;
      }

      return true;
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'modifier') {
        return ModifierUtil.onModifierChanged(last, current, this, scheme$22);
      } else if (name === 'value' || name === 'secondary-value') {
        this._updateValue();
      } else if (name === 'indeterminate') {
        this._updateDeterminate();
      }
    }
  }, {
    key: '_updateDeterminate',
    value: function _updateDeterminate() {
      var _this2 = this;

      if (this.hasAttribute('indeterminate')) {
        contentReady(this, function () {
          _this2._template.classList.add('progress-bar--indeterminate');
          _this2._template.classList.remove('progress-bar--determinate');
        });
      } else {
        contentReady(this, function () {
          _this2._template.classList.add('progress-bar--determinate');
          _this2._template.classList.remove('progress-bar--indeterminate');
        });
      }
    }
  }, {
    key: '_updateValue',
    value: function _updateValue() {
      var _this3 = this;

      contentReady(this, function () {
        _this3._primary.style.width = _this3.hasAttribute('value') ? _this3.getAttribute('value') + '%' : '0%';
        _this3._secondary.style.width = _this3.hasAttribute('secondary-value') ? _this3.getAttribute('secondary-value') + '%' : '0%';
      });
    }

    /**
     * @property value
     * @type {Number}
     * @description
     *   [en]Current progress. Should be a value between 0 and 100.[/en]
     *   [ja]現在の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
     */

  }, {
    key: 'value',
    set: function set(value) {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        throw new Error('Invalid value');
      }

      this.setAttribute('value', Math.floor(value));
    },
    get: function get$$1() {
      return parseInt(this.getAttribute('value') || '0');
    }

    /**
     * @property secondaryValue
     * @type {Number}
     * @description
     *   [en]Current secondary progress. Should be a value between 0 and 100.[/en]
     *   [ja]現在の２番目の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
     */

  }, {
    key: 'secondaryValue',
    set: function set(value) {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        throw new Error('Invalid value');
      }

      this.setAttribute('secondary-value', Math.floor(value));
    },
    get: function get$$1() {
      return parseInt(this.getAttribute('secondary-value') || '0');
    }

    /**
     * @property indeterminate
     * @type {Boolean}
     * @description
     *   [en]If this property is `true`, an infinite looping animation will be shown.[/en]
     *   [ja]この属性が設定された場合、ループするアニメーションが表示されます。[/ja]
     */

  }, {
    key: 'indeterminate',
    set: function set(value) {
      if (value) {
        this.setAttribute('indeterminate', '');
      } else {
        this.removeAttribute('indeterminate');
      }
    },
    get: function get$$1() {
      return this.hasAttribute('indeterminate');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'value', 'secondary-value', 'indeterminate'];
    }
  }]);
  return ProgressBarElement;
}(BaseElement);

customElements.define('ons-progress-bar', ProgressBarElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$23 = {
  '.progress-circular': 'progress-circular--*',
  '.progress-circular__background': 'progress-circular--*__background',
  '.progress-circular__primary': 'progress-circular--*__primary',
  '.progress-circular__secondary': 'progress-circular--*__secondary'
};

var template$1 = util.createElement('\n  <svg class="progress-circular">\n    <circle class="progress-circular__background" />\n    <circle class="progress-circular__secondary" />\n    <circle class="progress-circular__primary" />\n  </svg>\n');

/**
 * @element ons-progress-circular
 * @category visual
 * @description
 *   [en]
 *     This component displays a circular progress indicator. It can either be used to show how much of a task has been completed or to show a looping animation to indicate that an operation is currently running.
 *   [/en]
 *   [ja][/ja]
 * @codepen EVzMjR
 * @tutorial vanilla/Reference/progress
 * @seealso ons-progress-bar
 *   [en]The `<ons-progress-bar>` component displays a bar progress indicator.[/en]
 *   [ja][/ja]
 * @example
 * <ons-progress-circular
 *  value="55"
 *  secondary-value="87">
 * </ons-progress-circular>
 *
 * <ons-progress-circular
 *  indeterminate>
 * </ons-progress-circular>
 */

var ProgressCircularElement = function (_BaseElement) {
  inherits(ProgressCircularElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]Change the appearance of the progress indicator.[/en]
   *   [ja]プログレスインジケータの見た目を変更します。[/ja]
   */

  /**
   * @attribute value
   * @type {Number}
   * @description
   *   [en]Current progress. Should be a value between 0 and 100.[/en]
   *   [ja]現在の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
   */

  /**
   * @attribute secondary-value
   * @type {Number}
   * @description
   *   [en]Current secondary progress. Should be a value between 0 and 100.[/en]
   *   [ja]現在の２番目の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
   */

  /**
   * @attribute indeterminate
   * @description
   *   [en]If this attribute is set, an infinite looping animation will be shown.[/en]
   *   [ja]この属性が設定された場合、ループするアニメーションが表示されます。[/ja]
   */

  function ProgressCircularElement() {
    classCallCheck(this, ProgressCircularElement);

    var _this = possibleConstructorReturn(this, (ProgressCircularElement.__proto__ || Object.getPrototypeOf(ProgressCircularElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  createClass(ProgressCircularElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'modifier') {
        return ModifierUtil.onModifierChanged(last, current, this, scheme$23);
      } else if (name === 'value' || name === 'secondary-value') {
        this._updateValue();
      } else if (name === 'indeterminate') {
        this._updateDeterminate();
      }
    }
  }, {
    key: '_updateDeterminate',
    value: function _updateDeterminate() {
      var _this2 = this;

      if (this.hasAttribute('indeterminate')) {
        contentReady(this, function () {
          ModifierUtil.addModifier(_this2, 'indeterminate');
        });
      } else {
        contentReady(this, function () {
          ModifierUtil.removeModifier(_this2, 'indeterminate');
        });
      }
    }
  }, {
    key: '_updateValue',
    value: function _updateValue() {
      var _this3 = this;

      if (this.hasAttribute('value')) {
        contentReady(this, function () {
          var per = Math.ceil(_this3.getAttribute('value') * 251.32 * 0.01);
          _this3._primary.style['stroke-dasharray'] = per + '%, 251.32%';
        });
      }
      if (this.hasAttribute('secondary-value')) {
        contentReady(this, function () {
          var per = Math.ceil(_this3.getAttribute('secondary-value') * 251.32 * 0.01);
          _this3._secondary.style.display = null;
          _this3._secondary.style['stroke-dasharray'] = per + '%, 251.32%';
        });
      } else {
        contentReady(this, function () {
          _this3._secondary.style.display = 'none';
        });
      }
    }

    /**
     * @property value
     * @type {Number}
     * @description
     *   [en]Current progress. Should be a value between 0 and 100.[/en]
     *   [ja]現在の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
     */

  }, {
    key: '_compile',
    value: function _compile() {
      if (this._isCompiled()) {
        this._template = util.findChild(this, '.progress-circular');
      } else {
        this._template = template$1.cloneNode(true);
      }

      this._primary = util.findChild(this._template, '.progress-circular__primary');
      this._secondary = util.findChild(this._template, '.progress-circular__secondary');

      this._updateDeterminate();
      this._updateValue();

      this.appendChild(this._template);

      autoStyle.prepare(this);
      ModifierUtil.initModifier(this, scheme$23);
    }
  }, {
    key: '_isCompiled',
    value: function _isCompiled() {
      if (!util.findChild(this, '.progress-circular')) {
        return false;
      }

      var svg = util.findChild(this, '.progress-circular');

      if (!util.findChild(svg, '.progress-circular__secondary')) {
        return false;
      }

      if (!util.findChild(svg, '.progress-circular__primary')) {
        return false;
      }

      return true;
    }
  }, {
    key: 'value',
    set: function set(value) {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        throw new Error('Invalid value');
      }

      this.setAttribute('value', Math.floor(value));
    },
    get: function get$$1() {
      return parseInt(this.getAttribute('value') || '0');
    }

    /**
     * @property secondaryValue
     * @type {Number}
     * @description
     *   [en]Current secondary progress. Should be a value between 0 and 100.[/en]
     *   [ja]現在の２番目の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
     */

  }, {
    key: 'secondaryValue',
    set: function set(value) {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        throw new Error('Invalid value');
      }

      this.setAttribute('secondary-value', Math.floor(value));
    },
    get: function get$$1() {
      return parseInt(this.getAttribute('secondary-value') || '0');
    }

    /**
     * @property indeterminate
     * @type {Boolean}
     * @description
     *   [en]If this property is `true`, an infinite looping animation will be shown.[/en]
     *   [ja]この属性が設定された場合、ループするアニメーションが表示されます。[/ja]
     */

  }, {
    key: 'indeterminate',
    set: function set(value) {
      if (value) {
        this.setAttribute('indeterminate', '');
      } else {
        this.removeAttribute('indeterminate');
      }
    },
    get: function get$$1() {
      return this.hasAttribute('indeterminate');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'value', 'secondary-value', 'indeterminate'];
    }
  }]);
  return ProgressCircularElement;
}(BaseElement);

customElements.define('ons-progress-circular', ProgressCircularElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var STATE_INITIAL = 'initial';
var STATE_PREACTION = 'preaction';
var STATE_ACTION = 'action';

var removeTransform = function removeTransform(el) {
  el.style.transform = '';
  el.style.WebkitTransform = '';
  el.style.transition = '';
  el.style.WebkitTransition = '';
};

/**
 * @element ons-pull-hook
 * @category control
 * @description
 *   [en]
 *     Component that adds **Pull to refresh** functionality to an `<ons-page>` element.
 *
 *     It can be used to perform a task when the user pulls down at the top of the page. A common usage is to refresh the data displayed in a page.
 *   [/en]
 *   [ja][/ja]
 * @codepen WbJogM
 * @tutorial vanilla/Reference/pull-hook
 * @example
 * <ons-page>
 *   <ons-pull-hook>
 *     Release to refresh
 *   </ons-pull-hook>
 * </ons-page>
 *
 * <script>
 *   document.querySelector('ons-pull-hook').onAction = function(done) {
 *     setTimeout(done, 1000);
 *   };
 * </script>
 */

var PullHookElement = function (_BaseElement) {
  inherits(PullHookElement, _BaseElement);

  /**
   * @event changestate
   * @description
   *   [en]Fired when the state is changed. The state can be either "initial", "preaction" or "action".[/en]
   *   [ja]コンポーネントの状態が変わった場合に発火します。状態は、"initial", "preaction", "action"のいずれかです。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクト。[/ja]
   * @param {Object} event.pullHook
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {String} event.state
   *   [en]Current state.[/en]
   *   [ja]現在の状態名を参照できます。[/ja]
   */

  /**
   * @attribute disabled
   * @description
   *   [en]If this attribute is set the "pull-to-refresh" functionality is disabled.[/en]
   *   [ja]この属性がある時、disabled状態になりアクションが実行されなくなります[/ja]
   */

  /**
   * @attribute height
   * @type {String}
   * @description
   *   [en]Specify the height of the component. When pulled down further than this value it will switch to the "preaction" state. The default value is "64px".[/en]
   *   [ja]コンポーネントの高さを指定します。この高さ以上にpull downすると"preaction"状態に移行します。デフォルトの値は"64px"です。[/ja]
   */

  /**
   * @attribute threshold-height
   * @type {String}
   * @description
   *   [en]Specify the threshold height. The component automatically switches to the "action" state when pulled further than this value. The default value is "96px". A negative value or a value less than the height will disable this property.[/en]
   *   [ja]閾値となる高さを指定します。この値で指定した高さよりもpull downすると、このコンポーネントは自動的に"action"状態に移行します。[/ja]
   */

  /**
   * @attribute fixed-content
   * @description
   *   [en]If this attribute is set the content of the page will not move when pulling.[/en]
   *   [ja]この属性がある時、プルフックが引き出されている時にもコンテンツは動きません。[/ja]
   */

  function PullHookElement() {
    classCallCheck(this, PullHookElement);

    var _this = possibleConstructorReturn(this, (PullHookElement.__proto__ || Object.getPrototypeOf(PullHookElement)).call(this));

    _this._boundOnDrag = _this._onDrag.bind(_this);
    _this._boundOnDragStart = _this._onDragStart.bind(_this);
    _this._boundOnDragEnd = _this._onDragEnd.bind(_this);
    _this._boundOnScroll = _this._onScroll.bind(_this);

    _this._setState(STATE_INITIAL, true);
    _this._hide(); // Fix for transparent toolbar transitions
    return _this;
  }

  createClass(PullHookElement, [{
    key: '_setStyle',
    value: function _setStyle() {
      var height = this.height;

      this.style.height = height + 'px';
      this.style.lineHeight = height + 'px';
    }
  }, {
    key: '_onScroll',
    value: function _onScroll(event) {
      var element = this._pageElement;

      if (element.scrollTop < 0) {
        element.scrollTop = 0;
      }
    }
  }, {
    key: '_generateTranslationTransform',
    value: function _generateTranslationTransform(scroll) {
      return 'translate3d(0px, ' + scroll + 'px, 0px)';
    }
  }, {
    key: '_canConsumeGesture',
    value: function _canConsumeGesture(gesture) {
      return gesture.direction === 'up' || gesture.direction === 'down';
    }
  }, {
    key: '_onDragStart',
    value: function _onDragStart(event) {
      var _this2 = this;

      if (this.disabled) {
        return;
      }

      this._ignoreDrag = event.consumed;

      if (!this._ignoreDrag) {
        var consume = event.consume;
        event.consume = function () {
          consume && consume();
          _this2._ignoreDrag = true;
          // This elements resizes .page__content so it is safer
          // to hide it when other components are dragged.
          _this2._hide();
        };

        if (this._canConsumeGesture(event.gesture)) {
          consume && consume();
          event.consumed = true;
          this._show(); // Not enough due to 'dragLockAxis'
        }
      }

      this._startScroll = this._getCurrentScroll();
    }
  }, {
    key: '_onDrag',
    value: function _onDrag(event) {
      var _this3 = this;

      if (this.disabled || this._ignoreDrag || !this._canConsumeGesture(event.gesture)) {
        return;
      }

      // Necessary due to 'dragLockAxis' (25px)
      if (this.style.display === 'none') {
        this._show();
      }

      event.stopPropagation();

      // Hack to make it work on Android 4.4 WebView. Scrolls manually near the top of the page so
      // there will be no inertial scroll when scrolling down. Allowing default scrolling will
      // kill all 'touchmove' events.
      if (platform$1.isAndroid()) {
        var element = this._pageElement;
        element.scrollTop = this._startScroll - event.gesture.deltaY;
        if (element.scrollTop < window.innerHeight && event.gesture.direction !== 'up') {
          event.gesture.preventDefault();
        }
      }

      if (this._currentTranslation === 0 && this._getCurrentScroll() === 0) {
        this._transitionDragLength = event.gesture.deltaY;

        var direction = event.gesture.interimDirection;
        if (direction === 'down') {
          this._transitionDragLength -= 1;
        } else {
          this._transitionDragLength += 1;
        }
      }

      var scroll = Math.max(event.gesture.deltaY - this._startScroll, 0);

      if (this._thresholdHeightEnabled() && scroll >= this.thresholdHeight) {
        event.gesture.stopDetect();

        setImmediate(function () {
          return _this3._finish();
        });
      } else if (scroll >= this.height) {
        this._setState(STATE_PREACTION);
      } else {
        this._setState(STATE_INITIAL);
      }

      this._translateTo(scroll);
    }
  }, {
    key: '_onDragEnd',
    value: function _onDragEnd(event) {
      if (this.disabled || this._ignoreDrag) {
        return;
      }

      event.stopPropagation();

      if (this._currentTranslation > 0) {
        var scroll = this._currentTranslation;

        if (scroll > this.height) {
          this._finish();
        } else {
          this._translateTo(0, { animate: true });
        }
      }
    }

    /**
     * @property onAction
     * @type {Function}
     * @description
     *   [en]This will be called in the `action` state if it exists. The function will be given a `done` callback as it's first argument.[/en]
     *   [ja][/ja]
     */

  }, {
    key: '_finish',
    value: function _finish() {
      var _this4 = this;

      this._setState(STATE_ACTION);
      this._translateTo(this.height, { animate: true });
      var action = this.onAction || function (done) {
        return done();
      };
      action(function () {
        _this4._translateTo(0, { animate: true });
        _this4._setState(STATE_INITIAL);
      });
    }

    /**
     * @property height
     * @type {Number}
     * @description
     *   [en]The height of the pull hook in pixels. The default value is `64px`.[/en]
     *   [ja][/ja]
     */

  }, {
    key: '_thresholdHeightEnabled',
    value: function _thresholdHeightEnabled() {
      var th = this.thresholdHeight;
      return th > 0 && th >= this.height;
    }
  }, {
    key: '_setState',
    value: function _setState(state, noEvent) {
      var lastState = this._getState();

      this.setAttribute('state', state);

      if (!noEvent && lastState !== this._getState()) {
        util.triggerElementEvent(this, 'changestate', {
          pullHook: this,
          state: state,
          lastState: lastState
        });
      }
    }
  }, {
    key: '_getState',
    value: function _getState() {
      return this.getAttribute('state');
    }

    /**
     * @property state
     * @readonly
     * @type {String}
     * @description
     *   [en]Current state of the element.[/en]
     *   [ja][/ja]
     */

  }, {
    key: '_getCurrentScroll',
    value: function _getCurrentScroll() {
      return this._pageElement.scrollTop;
    }

    /**
     * @property pullDistance
     * @readonly
     * @type {Number}
     * @description
     *   [en]The current number of pixels the pull hook has moved.[/en]
     *   [ja]現在のプルフックが引き出された距離をピクセル数。[/ja]
     */

  }, {
    key: '_isContentFixed',
    value: function _isContentFixed() {
      return this.hasAttribute('fixed-content');
    }
  }, {
    key: '_getScrollableElement',
    value: function _getScrollableElement() {
      if (this._isContentFixed()) {
        return this;
      } else {
        return this._pageElement;
      }
    }
  }, {
    key: '_show',
    value: function _show() {
      this.style.display = '';
      if (this._pageElement) {
        this._pageElement.style.marginTop = '-' + this.height + 'px';
      }
    }
  }, {
    key: '_hide',
    value: function _hide() {
      this.style.display = 'none';
      if (this._pageElement) {
        this._pageElement.style.marginTop = '';
      }
    }

    /**
     * @param {Number} scroll
     * @param {Object} options
     * @param {Function} [options.callback]
     */

  }, {
    key: '_translateTo',
    value: function _translateTo(scroll) {
      var _this5 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this._currentTranslation == 0 && scroll == 0) {
        return;
      }

      var done = function done() {
        if (scroll === 0) {
          var el = _this5._getScrollableElement();
          removeTransform(el);
        }

        if (options.callback) {
          options.callback();
        }
      };

      this._currentTranslation = scroll;

      if (options.animate) {
        Animit(this._getScrollableElement()).queue({
          transform: this._generateTranslationTransform(scroll)
        }, {
          duration: 0.3,
          timing: 'cubic-bezier(.1, .7, .1, 1)'
        }).play(done);
      } else {
        Animit(this._getScrollableElement()).queue({
          transform: this._generateTranslationTransform(scroll)
        }).play(done);
      }
    }
  }, {
    key: '_disableDragLock',
    value: function _disableDragLock() {
      // e2e tests need it
      this._dragLockDisabled = true;
      this._destroyEventListeners();
      this._createEventListeners();
    }
  }, {
    key: '_createEventListeners',
    value: function _createEventListeners() {
      this._gestureDetector = new GestureDetector(this._pageElement, {
        dragMinDistance: 1,
        dragDistanceCorrection: false,
        dragLockToAxis: !this._dragLockDisabled
      });

      // Bind listeners
      //
      // Note:
      // If we swipe up/down a screen too fast,
      // the gesture detector occasionally dispatches a `dragleft` or `dragright`,
      // so we need to have the pull hook listen to `dragleft` and `dragright` as well as `dragup` and `dragdown`.
      this._gestureDetector.on('drag', this._boundOnDrag);
      this._gestureDetector.on('dragstart', this._boundOnDragStart);
      this._gestureDetector.on('dragend', this._boundOnDragEnd);

      this._pageElement.addEventListener('scroll', this._boundOnScroll, false);
    }
  }, {
    key: '_destroyEventListeners',
    value: function _destroyEventListeners() {
      if (this._gestureDetector) {
        this._gestureDetector.off('drag', this._boundOnDrag);
        this._gestureDetector.off('dragstart', this._boundOnDragStart);
        this._gestureDetector.off('dragend', this._boundOnDragEnd);

        this._gestureDetector.dispose();
        this._gestureDetector = null;
      }

      this._pageElement.removeEventListener('scroll', this._boundOnScroll, false);
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this._currentTranslation = 0;
      this._pageElement = this.parentNode;

      this._createEventListeners();
      this._setStyle();
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this._hide();

      this._destroyEventListeners();
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'height' && this._pageElement) {
        this._setStyle();
      }
    }
  }, {
    key: 'onAction',
    get: function get$$1() {
      return this._onAction;
    },
    set: function set(value) {
      if (!(value instanceof Function) && value !== null) {
        throw new Error('onAction must be a function or null');
      }
      this._onAction = value;
    }
  }, {
    key: 'height',
    set: function set(value) {
      if (!util.isInteger(value)) {
        throw new Error('The height must be an integer');
      }

      this.setAttribute('height', value + 'px');
    },
    get: function get$$1() {
      return parseInt(this.getAttribute('height') || '64', 10);
    }

    /**
     * @property thresholdHeight
     * @type {Number}
     * @description
     *   [en]The thresholdHeight of the pull hook in pixels. The default value is `96px`.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'thresholdHeight',
    set: function set(value) {
      if (!util.isInteger(value)) {
        throw new Error('The threshold height must be an integer');
      }

      this.setAttribute('threshold-height', value + 'px');
    },
    get: function get$$1() {
      return parseInt(this.getAttribute('threshold-height') || '96', 10);
    }
  }, {
    key: 'state',
    get: function get$$1() {
      return this._getState();
    }
  }, {
    key: 'pullDistance',
    get: function get$$1() {
      return this._currentTranslation;
    }

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['height'];
    }
  }, {
    key: 'STATE_INITIAL',
    get: function get$$1() {
      return STATE_INITIAL;
    }
  }, {
    key: 'STATE_PREACTION',
    get: function get$$1() {
      return STATE_PREACTION;
    }
  }, {
    key: 'STATE_ACTION',
    get: function get$$1() {
      return STATE_ACTION;
    }
  }, {
    key: 'events',
    get: function get$$1() {
      return ['changestate'];
    }
  }]);
  return PullHookElement;
}(BaseElement);

customElements.define('ons-pull-hook', PullHookElement);

/*
Copyright 2013-2016 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @class AnimatorCSS - implementation of Animator class using css transitions
 */

var AnimatorCSS = function () {
  createClass(AnimatorCSS, [{
    key: 'animate',


    /**
     * @method animate
     * @desc main animation function
     * @param {Element} element
     * @param {Object} finalCSS
     * @param {number} [duration=200] - duration in milliseconds
     * @return {Object} result
     * @return {Function} result.then(callback) - sets a callback to be executed after the animation has stopped
     * @return {Function} result.stop(options) - stops the animation; if options.stopNext is true then it doesn't call the callback
     * @return {Function} result.finish(ms) - finishes the animation in the specified time in milliseconds
     * @return {Function} result.speed(ms) - sets the animation speed so that it finishes as if the original duration was the one specified here
     * @example
     * ````
     *  var result = animator.animate(el, {opacity: 0.5}, 1000);
     *
     *  el.addEventListener('click', function(e){
     *    result.speed(200).then(function(){
     *      console.log('done');
     *    });
     *  }, 300);
     * ````
     */
    value: function animate(el, final) {
      var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var start = new Date().getTime(),
          initial = {},
          stopped = false,
          next = false,
          timeout = false,
          properties = Object.keys(final);

      var updateStyles = function updateStyles() {
        var s = window.getComputedStyle(el);
        properties.forEach(s.getPropertyValue.bind(s));
        s = el.offsetHeight;
      };

      var result = {
        stop: function stop() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          timeout && clearTimeout(timeout);
          var k = Math.min(1, (new Date().getTime() - start) / duration);
          properties.forEach(function (i) {
            el.style[i] = (1 - k) * initial[i] + k * final[i] + (i == 'opacity' ? '' : 'px');
          });
          el.style.transitionDuration = '0s';

          if (options.stopNext) {
            next = false;
          } else if (!stopped) {
            stopped = true;
            next && next();
          }
          return result;
        },
        then: function then(cb) {
          next = cb;
          if (stopped) {
            next && next();
          }
          return result;
        },
        speed: function speed(newDuration) {
          if (internal$1.config.animationsDisabled) {
            newDuration = 0;
          }
          if (!stopped) {
            timeout && clearTimeout(timeout);

            var passed = new Date().getTime() - start;
            var k = passed / duration;
            var remaining = newDuration * (1 - k);

            properties.forEach(function (i) {
              el.style[i] = (1 - k) * initial[i] + k * final[i] + (i == 'opacity' ? '' : 'px');
            });

            updateStyles();

            start = el.speedUpTime;
            duration = remaining;

            el.style.transitionDuration = duration / 1000 + 's';

            properties.forEach(function (i) {
              el.style[i] = final[i] + (i == 'opacity' ? '' : 'px');
            });

            timeout = setTimeout(result.stop, remaining);
          }
          return result;
        },
        finish: function finish() {
          var milliseconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;

          var k = (new Date().getTime() - start) / duration;

          result.speed(milliseconds / (1 - k));
          return result;
        }
      };

      if (el.hasAttribute('disabled') || stopped || internal$1.config.animationsDisabled) {
        return result;
      }

      var style = window.getComputedStyle(el);
      properties.forEach(function (e) {
        var v = parseFloat(style.getPropertyValue(e));
        initial[e] = isNaN(v) ? 0 : v;
      });

      if (!stopped) {
        el.style.transitionProperty = properties.join(',');
        el.style.transitionDuration = duration / 1000 + 's';

        properties.forEach(function (e) {
          el.style[e] = final[e] + (e == 'opacity' ? '' : 'px');
        });
      }

      timeout = setTimeout(result.stop, duration);
      this._onStopAnimations(el, result.stop);

      return result;
    }
  }]);

  function AnimatorCSS() {
    classCallCheck(this, AnimatorCSS);

    this._queue = [];
    this._index = 0;
  }

  createClass(AnimatorCSS, [{
    key: '_onStopAnimations',
    value: function _onStopAnimations(el, listener) {
      var queue = this._queue;
      var i = this._index++;
      queue[el] = queue[el] || [];
      queue[el][i] = function (options) {
        delete queue[el][i];
        if (queue[el] && queue[el].length == 0) {
          delete queue[el];
        }
        return listener(options);
      };
    }

    /**
    * @method stopAnimations
    * @desc stops active animations on a specified element
    * @param {Element|Array} element - element or array of elements
    * @param {Object} [options={}]
    * @param {Boolean} [options.stopNext] - the callbacks after the animations won't be called if this option is true
    */

  }, {
    key: 'stopAnimations',
    value: function stopAnimations(el) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (Array.isArray(el)) {
        return el.forEach(function (el) {
          _this.stopAnimations(el, options);
        });
      }

      (this._queue[el] || []).forEach(function (e) {
        e(options || {});
      });
    }

    /**
    * @method stopAll
    * @desc stops all active animations
    * @param {Object} [options={}]
    * @param {Boolean} [options.stopNext] - the callbacks after the animations won't be called if this option is true
    */

  }, {
    key: 'stopAll',
    value: function stopAll() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.stopAnimations(Object.keys(this._queue), options);
    }

    /**
    * @method fade
    * @desc fades the element (short version for animate(el, {opacity: 0}))
    * @param {Element} element
    * @param {number} [duration=200]
    */

  }, {
    key: 'fade',
    value: function fade(el) {
      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;

      return this.animate(el, { opacity: 0 }, duration);
    }
  }]);
  return AnimatorCSS;
}();

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$13 = 'ripple';
var scheme$24 = {
  '': 'ripple--*',
  '.ripple__wave': 'ripple--*__wave',
  '.ripple__background': 'ripple--*__background'
};

/**
 * @element ons-ripple
 * @category visual
 * @description
 *   [en]
 *     Adds a Material Design "ripple" effect to an element. The ripple effect will spread from the position where the user taps.
 *
 *     Some elements such as `<ons-button>` and `<ons-fab>`  support a `ripple` attribute.
 *   [/en]
 *   [ja]マテリアルデザインのリップル効果をDOM要素に追加します。[/ja]
 * @codepen wKQWdZ
 * @tutorial vanilla/Reference/ripple
 * @modifier light-gray
 *   [en]Change the color of effects to light gray.[/en]
 *   [ja]エフェクトの色が明るい灰色になります。[/ja]
 * @guide cross-platform-styling
 *  [en]Cross platform styling[/en]
 *  [ja]Cross platform styling[/ja]
 * @example
 * <div class="my-div">
 *  <ons-ripple></ons-ripple>
 * </div>
 *
 * @example
 * <ons-button ripple>Click me!</ons-button>
 */

var RippleElement = function (_BaseElement) {
  inherits(RippleElement, _BaseElement);

  /**
   * @attribute color
   * @type {String}
   * @description
   *   [en]Color of the ripple effect.[/en]
   *   [ja]リップルエフェクトの色を指定します。[/ja]
   */

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the ripple effect.[/en]
   *   [ja]エフェクトの表現を指定します。[/ja]
   */

  /**
   * @attribute background
   * @type {String}
   * @description
   *   [en]Color of the background.[/en]
   *   [ja]背景の色を設定します。[/ja]
   */

  /**
   * @attribute size
   * @type {String}
   * @description
   *   [en]Sizing of the wave on ripple effect. Set "cover" or "contain". Default is "cover".[/en]
   *   [ja]エフェクトのサイズを指定します。"cover"もしくは"contain"を指定します。デフォルトは"cover"です。[/ja]
   */

  /**
   * @attribute center
   * @type {Boolean}
   * @description
   *   [en]If this attribute presents, change the position of wave effect to center of the target element.[/en]
   *   [ja]この要素を設定すると、エフェクトの位置が要素の真ん中から始まります。[/ja]
   */

  /**
   * @attribute disabled
   * @description
   *   [en]If this attribute is set, the ripple effect will be disabled.[/en]
   *   [ja]この属性が設定された場合、リップルエフェクトは無効になります。[/ja]
   */

  function RippleElement() {
    classCallCheck(this, RippleElement);

    var _this = possibleConstructorReturn(this, (RippleElement.__proto__ || Object.getPrototypeOf(RippleElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });

    _this._animator = new AnimatorCSS();

    ['color', 'center', 'start-radius', 'background', 'modifier'].forEach(function (e) {
      _this.attributeChangedCallback(e, null, _this.getAttribute(e));
    });
    return _this;
  }

  createClass(RippleElement, [{
    key: '_compile',
    value: function _compile() {
      this.classList.add(defaultClassName$13);

      this._wave = this.getElementsByClassName('ripple__wave')[0];
      this._background = this.getElementsByClassName('ripple__background')[0];

      if (!(this._background && this._wave)) {
        this._wave = util.create('.ripple__wave');
        this._background = util.create('.ripple__background');

        this.appendChild(this._wave);
        this.appendChild(this._background);
      }

      ModifierUtil.initModifier(this, scheme$24);
    }
  }, {
    key: '_getEffectSize',
    value: function _getEffectSize() {
      var sizes = ['cover', 'contain'];
      if (this.hasAttribute('size')) {
        var size = this.getAttribute('size');
        if (sizes.indexOf(size) !== -1) {
          return size;
        }
      }

      return 'cover';
    }
  }, {
    key: '_calculateCoords',
    value: function _calculateCoords(e) {
      var x = void 0,
          y = void 0,
          h = void 0,
          w = void 0,
          r = void 0;
      var b = this.getBoundingClientRect();
      var size = this._getEffectSize();

      if (this._center) {
        x = b.width / 2;
        y = b.height / 2;

        if (size === 'cover') {
          r = Math.sqrt(x * x + y * y);
        } else if (size === 'contain') {
          r = Math.min(x, y);
        } else {
          throw Error('Invalid state. If this errors is shown, leport to GitHub issues.');
        }
      } else {
        x = (e.clientX || e.changedTouches[0].clientX) - b.left;
        y = (e.clientY || e.changedTouches[0].clientY) - b.top;
        h = Math.max(y, b.height - y);
        w = Math.max(x, b.width - x);

        if (size === 'cover') {
          r = Math.sqrt(h * h + w * w);
        } else if (size === 'contain') {
          r = Math.min(Math.round(h / 2), Math.round(w / 2));
        } else {
          throw Error('Invalid state. If this errors is shown, leport to GitHub issues.');
        }
      }

      return { x: x, y: y, r: r };
    }
  }, {
    key: '_rippleAnimation',
    value: function _rippleAnimation(e) {
      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
      var _animator = this._animator,
          _wave = this._wave,
          _background = this._background,
          _minR = this._minR;

      var _calculateCoords2 = this._calculateCoords(e),
          x = _calculateCoords2.x,
          y = _calculateCoords2.y,
          r = _calculateCoords2.r;

      _animator.stopAll({ stopNext: 1 });
      _animator.animate(_background, { opacity: 1 }, duration);

      util.extend(_wave.style, {
        opacity: 1,
        top: y - _minR + 'px',
        left: x - _minR + 'px',
        width: 2 * _minR + 'px',
        height: 2 * _minR + 'px'
      });

      return _animator.animate(_wave, {
        top: y - r,
        left: x - r,
        height: 2 * r,
        width: 2 * r
      }, duration);
    }
  }, {
    key: '_updateParent',
    value: function _updateParent() {
      if (!this._parentUpdated && this.parentNode) {
        var computedStyle = window.getComputedStyle(this.parentNode);
        if (computedStyle.getPropertyValue('position') === 'static') {
          this.parentNode.style.position = 'relative';
        }
        this._parentUpdated = true;
      }
    }
  }, {
    key: '_onTap',
    value: function _onTap(e) {
      var _this2 = this;

      if (!this.disabled) {
        this._updateParent();
        this._rippleAnimation(e.gesture.srcEvent).then(function () {
          _this2._animator.fade(_this2._wave);
          _this2._animator.fade(_this2._background);
        });
      }
    }
  }, {
    key: '_onHold',
    value: function _onHold(e) {
      if (!this.disabled) {
        this._updateParent();
        this._holding = this._rippleAnimation(e.gesture.srcEvent, 2000);
        document.addEventListener('release', this._boundOnRelease);
      }
    }
  }, {
    key: '_onRelease',
    value: function _onRelease(e) {
      var _this3 = this;

      if (this._holding) {
        this._holding.speed(300).then(function () {
          _this3._animator.stopAll({ stopNext: true });
          _this3._animator.fade(_this3._wave);
          _this3._animator.fade(_this3._background);
        });

        this._holding = false;
      }

      document.removeEventListener('release', this._boundOnRelease);
    }
  }, {
    key: '_onDragStart',
    value: function _onDragStart(e) {
      if (this._holding) {
        return this._onRelease(e);
      }
      if (['left', 'right'].indexOf(e.gesture.direction) != -1) {
        this._onTap(e);
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this._parentNode = this.parentNode;
      this._boundOnTap = this._onTap.bind(this);
      this._boundOnHold = this._onHold.bind(this);
      this._boundOnDragStart = this._onDragStart.bind(this);
      this._boundOnRelease = this._onRelease.bind(this);

      if (internal$1.config.animationsDisabled) {
        this.disabled = true;
      } else {
        this._parentNode.addEventListener('tap', this._boundOnTap);
        this._parentNode.addEventListener('hold', this._boundOnHold);
        this._parentNode.addEventListener('dragstart', this._boundOnDragStart);
      }
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      var pn = this._parentNode || this.parentNode;
      pn.removeEventListener('tap', this._boundOnTap);
      pn.removeEventListener('hold', this._boundOnHold);
      pn.removeEventListener('dragstart', this._boundOnDragStart);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      var _this4 = this;

      switch (name) {

        case 'class':
          if (!this.classList.contains(defaultClassName$13)) {
            this.className = defaultClassName$13 + ' ' + current;
          }
          break;

        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$24);
          break;

        case 'start-radius':
          this._minR = Math.max(0, parseFloat(current) || 0);
          break;

        case 'color':
          if (current) {
            contentReady(this, function () {
              _this4._wave.style.background = current;
              if (!_this4.hasAttribute('background')) {
                _this4._background.style.background = current;
              }
            });
          }
          break;

        case 'background':
          if (current || last) {
            if (current === 'none') {
              contentReady(this, function () {
                _this4._background.setAttribute('disabled', 'disabled');
                _this4._background.style.background = 'transparent';
              });
            } else {
              contentReady(this, function () {
                if (_this4._background.hasAttribute('disabled')) {
                  _this4._background.removeAttribute('disabled');
                }
                _this4._background.style.background = current;
              });
            }
          }
          break;

        case 'center':
          if (name === 'center') {
            this._center = current != null && current != 'false';
          }
          break;

      }
    }

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['start-radius', 'color', 'background', 'center', 'class', 'modifier'];
    }
  }]);
  return RippleElement;
}(BaseElement);

customElements.define('ons-ripple', RippleElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * @element ons-row
 * @category grid
 * @description
 *   [en]Represents a row in the grid system. Use with `<ons-col>` to layout components.[/en]
 *   [ja]グリッドシステムにて行を定義します。ons-colとともに使用し、コンポーネントの配置に使用します。[/ja]
 * @codepen GgujC {wide}
 * @guide layouting
 *   [en]Layouting guide[/en]
 *   [ja]レイアウト調整[/ja]
 * @seealso ons-col
 *   [en]The `<ons-col>` component is used as children of `<ons-row>`.[/en]
 *   [ja]ons-colコンポーネント[/ja]
 * @note
 *   [en]For Android 4.3 and earlier, and iOS6 and earlier, when using mixed alignment with ons-row and ons-col, they may not be displayed correctly. You can use only one vertical-align.[/en]
 *   [ja]Android 4.3以前、もしくはiOS 6以前のOSの場合、ons-rowとons-colを組み合わせてそれぞれのons-col要素のvertical-align属性の値に別々の値を指定すると、描画が崩れる場合があります。vertical-align属性の値には一つの値だけを指定できます。[/ja]
 * @example
 * <ons-row>
 *   <ons-col width="50px"><ons-icon icon="fa-twitter"></ons-icon></ons-col>
 *   <ons-col>Text</ons-col>
 * </ons-row>
 */

/**
 * @attribute vertical-align
 * @type {String}
 * @description
 *   [en]Short hand attribute for aligning vertically. Valid values are top, bottom, and center.[/en]
 *   [ja]縦に整列するために指定します。top、bottom、centerのいずれかを指定できます。[/ja]
 */

var RowElement = function (_BaseElement) {
  inherits(RowElement, _BaseElement);

  function RowElement() {
    classCallCheck(this, RowElement);
    return possibleConstructorReturn(this, (RowElement.__proto__ || Object.getPrototypeOf(RowElement)).apply(this, arguments));
  }

  return RowElement;
}(BaseElement);

customElements.define('ons-row', RowElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$25 = {
  '': 'select-*',
  '.select-input': 'select-input--*'
};

var defaultClassName$14 = 'select';

var INPUT_ATTRIBUTES$1 = ['autofocus', 'disabled', 'form', 'multiple', 'name', 'required', 'size'];

/**
 * @element ons-select
 * @category form
 * @modifier material
 *  [en]Displays a Material Design select input.[/en]
 *  [ja][/ja]
 * @modifier underbar
 *  [en]Displays a horizontal line underneath a select input.[/en]
 *  [ja][/ja]
 * @description
 *   [en]
 *     Select component. If you want to place a select with an ID of `my-id` on a page, use `<ons-select select-id="my-id">`.
 *
 *     The component will automatically display as a Material Design select on Android.
 *
 *     Most attributes that can be used for a normal `<select>` element can also be used on the `<ons-select>` element.
 *   [/en]
 *   [ja]セレクトボックスを表示するコンポーネントです。`select` 要素に使用できる属性の多くが `ons-select` 要素でも利用できます。[/ja]
 * @codepen hLayx
 * @tutorial vanilla/Reference/select
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @guide cross-platform-styling [en]Information about cross platform styling[/en][ja]Information about cross platform styling[/ja]
 * @example
 * <ons-select>
 *   <option value="1">1</option>
 *   <option value="2">2nd</option>
 *   <option value="3">3rd option</option>
 * </ons-select>
 */

var SelectElement = function (_BaseElement) {
  inherits(SelectElement, _BaseElement);

  /**
   * @attribute autofocus
   * @type {Boolean}
   * @default false
   * @description
   *  [en]Element automatically gains focus on page load.[/en]
   *  [ja]ページロード時にこのセレクトボックスにフォーカスが移るようにします。[/ja]
   */

  /**
   * @attribute disabled
   * @type {Boolean}
   * @default false
   * @description
   *   [en]Specify if select input should be disabled.[/en]
   *   [ja]このセレクトボックスを無効化する場合に指定します。[/ja]
   */

  /**
   * @attribute form
   * @type {String}
   * @description
   *   [en]Associate a select element to an existing form on the page, even if not nested.[/en]
   *   [ja]このセレクトボックスを、指定した `form` 要素に紐付けます。セレクトボックスを `form` 要素の外側に配置する際に使用します。[/ja]
   */

  /**
   * @attribute multiple
   * @type {Boolean}
   * @default false
   * @description
   *  [en]If this attribute is defined, multiple options can be selected at once.[/en]
   *  [ja]選択肢の複数選択を有効にします。[/ja]
   */

  /**
   * @attribute name
   * @type {String}
   * @description
   *   [en]Name the select element, useful for instance if it is part of a form.[/en]
   *   [ja]このセレクトボックスの名前を指定します。通常 `form` 要素と共に使用します。[/ja]
   */

  /**
   * @attribute required
   * @type {Boolean}
   * @description
   *   [en]Make the select input required for submitting the form it is part of.[/en]
   *   [ja]このセレクトボックスを入力必須にする場合に指定します。通常 `form` 要素と共に使用します。[/ja]
   */

  /**
   * @attribute select-id
   * @type {String}
   * @description
   *   [en]ID given to the inner select, useful for dynamic manipulation.[/en]
   *   [ja]このセレクトボックスが内部に持つ select 要素に与える ID を指定します。セレクトボックスの内容を動的に変更する必要がある場合に使用します。[/ja]
   */

  /**
   * @attribute size
   * @type {Number}
   * @default 1
   * @description
   *   [en]How many options are displayed; if there are more than the size then a scroll appears to navigate them.[/en]
   *   [ja]一度に表示する選択肢の個数を指定します。選択肢がこの属性で指定した個数よりも多い場合、スクロールが有効になります。[/ja]
   */

  function SelectElement() {
    classCallCheck(this, SelectElement);

    var _this = possibleConstructorReturn(this, (SelectElement.__proto__ || Object.getPrototypeOf(SelectElement)).call(this));

    contentReady(_this, function () {
      return _this._compile();
    });

    _this._deriveGetters();
    return _this;
  }

  createClass(SelectElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      var _this2 = this;

      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$14)) {
            this.className = defaultClassName$14 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$25);
          break;
      }

      if (INPUT_ATTRIBUTES$1.indexOf(name) >= 0) {
        contentReady(this, function () {
          return _this2._updateBoundAttributes();
        });
      }
    }
  }, {
    key: '_updateBoundAttributes',
    value: function _updateBoundAttributes() {
      var _this3 = this;

      INPUT_ATTRIBUTES$1.forEach(function (attr) {
        if (_this3.hasAttribute(attr)) {
          _this3._select.setAttribute(attr, _this3.getAttribute(attr));
        } else {
          _this3._select.removeAttribute(attr);
        }
      });
    }

    /**
     * @property length
     * @description
     *   [en]Number of options in the select box.[/en]
     *   [ja]このセレクトボックスに含まれる選択肢の個数を返します。 `select` 要素[/ja]
     */

    /**
     * @property options
     * @description
     *   [en]Several options for handling the select DOM object.[/en]
     *   [ja]このセレクトボックスに含まれる `option` 要素の配列を返します。[/ja]
     */

    /**
     * @property selectedIndex
     * @description
     *   [en]Index of the currently selected option.[/en]
     *   [ja]現在選択されている選択肢のインデックスを返します。[/ja]
     */

    /**
     * @property value
     * @description
     *   [en]Value of the currently selected option.[/en]
     *   [ja]現在選択されている選択肢の値を返します。[/ja]
     */

  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.classList.add(defaultClassName$14);
      var sel = this._select || document.createElement('select');
      if (!sel.id && this.hasAttribute('select-id')) {
        sel.id = this.getAttribute('select-id');
      }
      sel.classList.add('select-input');
      if (!this._select) {
        util.arrayFrom(this.childNodes).forEach(function (element) {
          return sel.appendChild(element);
        });
        this.appendChild(sel);
      }

      ModifierUtil.initModifier(this, scheme$25);
    }
  }, {
    key: '_deriveGetters',
    value: function _deriveGetters() {
      var _this4 = this;

      var _loop = function _loop(key) {
        _this4.__defineGetter__(key, function () {
          return _this4._select[key];
        });
        _this4.__defineSetter__(key, function (value) {
          _this4._select[key] = value;
        });
      };

      var _arr = ['disabled', 'length', 'multiple', 'name', 'options', 'selectedIndex', 'size', 'value'];

      for (var _i = 0; _i < _arr.length; _i++) {
        var key = _arr[_i];
        _loop(key);
      }
      this.__defineGetter__('form', function () {
        return _this4._select['form'];
      });
      this.__defineGetter__('type', function () {
        return _this4._select['type'];
      });
    }
  }, {
    key: 'add',
    value: function add(option) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this._select.add(option, index);
    }
  }, {
    key: 'remove',
    value: function remove(index) {
      this._select.remove(index);
    }
  }, {
    key: '_select',
    get: function get$$1() {
      return this.querySelector('select');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'].concat(INPUT_ATTRIBUTES$1);
    }
  }]);
  return SelectElement;
}(BaseElement);

customElements.define('ons-select', SelectElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var defaultClassName$15 = 'fab fab--mini speed-dial__item';

var scheme$26 = {
  '': 'speed-dial__item--*'
};

/**
 * @element ons-speed-dial-item
 * @category control
 * @description
 *   [en]
 *     This component displays the child elements of the Material Design Speed dial component.
 *   [/en]
 *   [ja]
 *     Material DesignのSpeed dialの子要素を表現する要素です。
 *   [/ja]
 * @codepen dYQYLg
 * @tutorial vanilla/Reference/speed-dial
 * @seealso ons-speed-dial
 *   [en]The `<ons-speed-dial>` component.[/en]
 *   [ja]ons-speed-dialコンポーネント[/ja]
 * @seealso ons-fab
 *   [en]ons-fab component[/en]
 *   [ja]ons-fabコンポーネント[/ja]
 * @example
 * <ons-speed-dial position="left bottom">
 *   <ons-fab>
 *     <ons-icon icon="fa-twitter"></ons-icon>
 *   </ons-fab>
 *   <ons-speed-dial-item>A</ons-speed-dial-item>
 *   <ons-speed-dial-item>B</ons-speed-dial-item>
 *   <ons-speed-dial-item>C</ons-speed-dial-item>
 * </ons-speed-dial>
 */

var SpeedDialItemElement = function (_BaseElement) {
  inherits(SpeedDialItemElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the component.[/en]
   *   [ja]このコンポーネントの表現を指定します。[/ja]
   */

  function SpeedDialItemElement() {
    classCallCheck(this, SpeedDialItemElement);

    var _this = possibleConstructorReturn(this, (SpeedDialItemElement.__proto__ || Object.getPrototypeOf(SpeedDialItemElement)).call(this));

    _this._compile();
    _this._boundOnClick = _this._onClick.bind(_this);
    return _this;
  }

  createClass(SpeedDialItemElement, [{
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          this._updateClassName(current);
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$26);
          break;
        case 'ripple':
          this._updateRipple();
      }
    }
  }, {
    key: '_updateClassName',
    value: function _updateClassName(className) {
      var _this2 = this;

      if (!defaultClassName$15.split(/\s+/).every(function (token) {
        return _this2.classList.contains(token);
      })) {
        this.className = defaultClassName$15 + ' ' + className;
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this.addEventListener('click', this._boundOnClick, false);
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this.removeEventListener('click', this._boundOnClick, false);
    }
  }, {
    key: '_updateRipple',
    value: function _updateRipple() {
      util.updateRipple(this);
    }
  }, {
    key: '_onClick',
    value: function _onClick(e) {
      e.stopPropagation();
    }
  }, {
    key: '_compile',
    value: function _compile() {
      var _this3 = this;

      autoStyle.prepare(this);

      defaultClassName$15.split(/\s+/).forEach(function (token) {
        _this3.classList.add(token);
      });

      this._updateRipple();

      ModifierUtil.initModifier(this, scheme$26);
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'ripple', 'class'];
    }
  }]);
  return SpeedDialItemElement;
}(BaseElement);

customElements.define('ons-speed-dial-item', SpeedDialItemElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Minimal utility library for manipulating element's style.
 */
var styler = function styler(element, style) {
  return styler.css.apply(styler, arguments);
};

/**
 * Set element's style.
 *
 * @param {Element} element
 * @param {Object} styles
 * @return {Element}
 */
styler.css = function (element, styles) {
  var keys = Object.keys(styles);
  keys.forEach(function (key) {
    if (key in element.style) {
      element.style[key] = styles[key];
    } else if (styler._prefix(key) in element.style) {
      element.style[styler._prefix(key)] = styles[key];
    } else {
      util.warn('No such style property: ' + key);
    }
  });
  return element;
};

/**
 * Add vendor prefix.
 *
 * @param {String} name
 * @return {String}
 */
styler._prefix = function () {
  var styles = window.getComputedStyle(document.documentElement, '');
  var prefix = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];

  return function (name) {
    return prefix + name.substr(0, 1).toUpperCase() + name.substr(1);
  };
}();

/**
 * @param {Element} element
 */
styler.clear = function (element) {
  styler._clear(element);
};

/**
 * @param {Element} element
 */
styler._clear = function (element) {
  var len = element.style.length;
  var style = element.style;
  var keys = [];
  for (var i = 0; i < len; i++) {
    keys.push(style[i]);
  }

  keys.forEach(function (key) {
    style[key] = '';
  });
};

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var defaultClassName$16 = 'speed-dial';
var scheme$27 = {
  '': 'speed-dial--*'
};

/**
 * @element ons-speed-dial
 * @category control
 * @description
 *   [en]
 *     Element that displays a Material Design Speed Dialog component. It is useful when there are more than one primary action that can be performed in a page.
 *
 *     The Speed dial looks like a `<ons-fab>` element but will expand a menu when tapped.
 *   [/en]
 *   [ja][/ja]
 * @codepen dYQYLg
 * @tutorial vanilla/Reference/speed-dial
 * @seealso ons-speed-dial-item
 *   [en]The `<ons-speed-dial-item>` represents a menu item.[/en]
 *   [ja]ons-speed-dial-itemコンポーネント[/ja]
 * @seealso ons-fab
 *   [en]ons-fab component[/en]
 *   [ja]ons-fabコンポーネント[/ja]
 * @example
 * <ons-speed-dial position="left bottom">
 *   <ons-fab>
 *     <ons-icon icon="fa-twitter"></ons-icon>
 *   </ons-fab>
 *   <ons-speed-dial-item>A</ons-speed-dial-item>
 *   <ons-speed-dial-item>B</ons-speed-dial-item>
 *   <ons-speed-dial-item>C</ons-speed-dial-item>
 * </ons-speed-dial>
 */

var SpeedDialElement = function (_BaseElement) {
  inherits(SpeedDialElement, _BaseElement);

  /**
   * @event open
   * @description
   *   [en]Fired when the menu items are shown.[/en]
   *   [ja][/ja]
   */

  /**
   * @event close
   * @description
   *   [en]Fired when the menu items are hidden.[/en]
   *   [ja][/ja]
   */

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the component.[/en]
   *   [ja]このコンポーネントの表現を指定します。[/ja]
   */

  /**
   * @attribute position
   * @type {String}
   * @description
   *   [en]
   *     Specify the vertical and horizontal position of the component.
   *     I.e. to display it in the top right corner specify "right top".
   *     Choose from "right", "left", "top" and "bottom".
   *   [/en]
   *   [ja]
   *     この要素を表示する左右と上下の位置を指定します。
   *     例えば、右上に表示する場合には"right top"を指定します。
   *     左右と上下の位置の指定には、rightとleft、topとbottomがそれぞれ指定できます。
   *   [/ja]
   */

  /**
   * @attribute direction
   * @type {String}
   * @description
   *   [en]Specify the direction the items are displayed. Possible values are "up", "down", "left" and "right".[/en]
   *   [ja]
   *     要素が表示する方向を指定します。up, down, left, rightが指定できます。
   *   [/ja]
   */

  /**
   * @attribute disabled
   * @description
   *   [en]Specify if button should be disabled.[/en]
   *   [ja]無効化する場合に指定します。[/ja]
   */

  function SpeedDialElement() {
    classCallCheck(this, SpeedDialElement);

    var _this = possibleConstructorReturn(this, (SpeedDialElement.__proto__ || Object.getPrototypeOf(SpeedDialElement)).call(this));

    contentReady(_this, function () {
      _this._compile();
    });

    _this._itemShown = false;
    _this._boundOnClick = _this._onClick.bind(_this);
    return _this;
  }

  createClass(SpeedDialElement, [{
    key: '_compile',
    value: function _compile() {
      this.classList.add(defaultClassName$16);
      autoStyle.prepare(this);
      this._updateRipple();
      ModifierUtil.initModifier(this, scheme$27);

      if (this.hasAttribute('direction')) {
        this._updateDirection(this.getAttribute('direction'));
      } else {
        this._updateDirection('up');
      }

      this._updatePosition();
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      var _this2 = this;

      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$16)) {
            this.className = defaultClassName$16 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$27);
          break;
        case 'ripple':
          contentReady(this, function () {
            return _this2._updateRipple();
          });
          break;
        case 'direction':
          contentReady(this, function () {
            return _this2._updateDirection(current);
          });
          break;
        case 'position':
          contentReady(this, function () {
            return _this2._updatePosition();
          });
          break;
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this.addEventListener('click', this._boundOnClick, false);
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this.removeEventListener('click', this._boundOnClick, false);
    }
  }, {
    key: '_onClick',
    value: function _onClick(e) {
      if (this.onClick) {
        this.onClick.apply(this);
        return Promise.resolve();
      } else if (!this.disabled && this.visible) {
        return this.toggleItems();
      }
    }
  }, {
    key: '_show',
    value: function _show() {
      if (!this.inline) {
        return this.show();
      }
      return Promise.resolve();
    }
  }, {
    key: '_hide',
    value: function _hide() {
      var _this3 = this;

      return new Promise(function (resolve) {
        if (!_this3.inline) {
          setImmediate(function () {
            return _this3.hide().then(resolve);
          });
        } else {
          resolve();
        }
      });
    }
  }, {
    key: '_updateRipple',
    value: function _updateRipple() {
      if (this._fab) {
        this.hasAttribute('ripple') ? this._fab.setAttribute('ripple', '') : this._fab.removeAttribute('ripple');
      }
    }
  }, {
    key: '_updateDirection',
    value: function _updateDirection(direction) {
      var children = this.items;
      for (var i = 0; i < children.length; i++) {
        styler(children[i], {
          transitionDelay: 25 * i + 'ms',
          bottom: 'auto',
          right: 'auto',
          top: 'auto',
          left: 'auto'
        });
      }
      switch (direction) {
        case 'up':
          for (var _i = 0; _i < children.length; _i++) {
            children[_i].style.bottom = 72 + 56 * _i + 'px';
            children[_i].style.right = '8px';
          }
          break;
        case 'down':
          for (var _i2 = 0; _i2 < children.length; _i2++) {
            children[_i2].style.top = 72 + 56 * _i2 + 'px';
            children[_i2].style.left = '8px';
          }
          break;
        case 'left':
          for (var _i3 = 0; _i3 < children.length; _i3++) {
            children[_i3].style.top = '8px';
            children[_i3].style.right = 72 + 56 * _i3 + 'px';
          }
          break;
        case 'right':
          for (var _i4 = 0; _i4 < children.length; _i4++) {
            children[_i4].style.top = '8px';
            children[_i4].style.left = 72 + 56 * _i4 + 'px';
          }
          break;
        default:
          throw new Error('Argument must be one of up, down, left or right.');
      }
    }
  }, {
    key: '_updatePosition',
    value: function _updatePosition() {
      var position = this.getAttribute('position');
      this.classList.remove('fab--top__left', 'fab--bottom__right', 'fab--bottom__left', 'fab--top__right', 'fab--top__center', 'fab--bottom__center');
      switch (position) {
        case 'top right':
        case 'right top':
          this.classList.add('fab--top__right');
          break;
        case 'top left':
        case 'left top':
          this.classList.add('fab--top__left');
          break;
        case 'bottom right':
        case 'right bottom':
          this.classList.add('fab--bottom__right');
          break;
        case 'bottom left':
        case 'left bottom':
          this.classList.add('fab--bottom__left');
          break;
        case 'center top':
        case 'top center':
          this.classList.add('fab--top__center');
          break;
        case 'center bottom':
        case 'bottom center':
          this.classList.add('fab--bottom__center');
          break;
        default:
          break;
      }
    }
  }, {
    key: '_getTranslate',
    value: function _getTranslate() {
      var isBottom = (this.getAttribute('position') || '').indexOf('bottom') >= 0;
      var translate = isBottom ? 'translate3d(0px, -' + (util.globals.fabOffset || 0) + 'px, 0px) ' : '';
      return translate;
    }

    /**
     * @method show
     * @signature show()
     * @description
     *   [en]Show the speed dial.[/en]
     *   [ja]Speed dialを表示します。[/ja]
     */

  }, {
    key: 'show',
    value: function show() {
      this._fab.show();
      this.style.webkitTransform = this.style.transform = this._getTranslate();
      return Promise.resolve();
    }

    /**
     * @method hide
     * @signature hide()
     * @description
     *   [en]Hide the speed dial.[/en]
     *   [ja]Speed dialを非表示にします。[/ja]
     */

  }, {
    key: 'hide',
    value: function hide() {
      var _this4 = this;

      return this.hideItems().then(function () {
        return _this4._fab.hide();
      });
    }

    /**
     * @method showItems
     * @signature showItems()
     * @description
     *   [en]Show the speed dial items.[/en]
     *   [ja]Speed dialの子要素を表示します。[/ja]
     */

  }, {
    key: 'showItems',
    value: function showItems() {
      if (this.hasAttribute('direction')) {
        this._updateDirection(this.getAttribute('direction'));
      } else {
        this._updateDirection('up');
      }

      var totalDelay = 0;
      if (!this._itemShown) {
        var children = this.items;
        for (var i = 0; i < children.length; i++) {
          var delay = 25 * i;
          totalDelay += delay;
          styler(children[i], {
            transform: 'scale(1)',
            transitionDelay: delay + 'ms'
          });
        }
        totalDelay += 50;

        this._itemShown = true;
        util.triggerElementEvent(this, 'open');
      }

      var deferred = util.defer();
      setTimeout(deferred.resolve, totalDelay);
      return deferred.promise;
    }

    /**
     * @method hideItems
     * @signature hideItems()
     * @description
     *   [en]Hide the speed dial items.[/en]
     *   [ja]Speed dialの子要素を非表示にします。[/ja]
     */

  }, {
    key: 'hideItems',
    value: function hideItems() {
      var totalDelay = 0;
      if (this._itemShown) {
        var children = this.items;
        for (var i = 0; i < children.length; i++) {
          var delay = 25 * (children.length - i);
          totalDelay += delay;
          styler(children[i], {
            transform: 'scale(0)',
            transitionDelay: delay + 'ms'
          });
        }
        totalDelay += 50;

        this._itemShown = false;
        util.triggerElementEvent(this, 'close');
      }

      var deferred = util.defer();
      setTimeout(deferred.resolve, totalDelay);
      return deferred.promise;
    }

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

  }, {
    key: 'isOpen',


    /**
     * @method isOpen
     * @signature isOpen()
     * @description
     *   [en]Returns whether the menu is open or not.[/en]
     *   [ja][/ja]
     */
    value: function isOpen() {
      return this._itemShown;
    }

    /**
     * @method toggle
     * @signature toggle()
     * @description
     *   [en]Toggle visibility.[/en]
     *   [ja]Speed dialの表示非表示を切り替えます。[/ja]
     */

  }, {
    key: 'toggle',
    value: function toggle() {
      return this.visible ? this.hide() : this.show();
    }

    /**
     * @method toggleItems
     * @signature toggleItems()
     * @description
     *   [en]Toggle item visibility.[/en]
     *   [ja]Speed dialの子要素の表示非表示を切り替えます。[/ja]
     */

  }, {
    key: 'toggleItems',
    value: function toggleItems() {
      return this.isOpen() ? this.hideItems() : this.showItems();
    }
  }, {
    key: 'items',
    get: function get$$1() {
      return util.arrayFrom(this.querySelectorAll('ons-speed-dial-item'));
    }
  }, {
    key: '_fab',
    get: function get$$1() {
      return util.findChild(this, 'ons-fab');
    }
  }, {
    key: 'disabled',
    set: function set(value) {
      if (value) {
        this.hideItems();
      }
      util.arrayFrom(this.children).forEach(function (e) {
        util.match(e, '.fab') && util.toggleAttribute(e, 'disabled', value);
      });

      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }

    /**
     * @property inline
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the element is inline or not.[/en]
     *   [ja]インライン要素の場合に`true`。[/ja]
     */

  }, {
    key: 'inline',
    get: function get$$1() {
      return this.hasAttribute('inline');
    }

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the element is visible or not.[/en]
     *   [ja]要素が見える場合に`true`。[/ja]
     */

  }, {
    key: 'visible',
    get: function get$$1() {
      return this._fab.visible && this.style.display !== 'none';
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['class', 'modifier', 'ripple', 'direction', 'position'];
    }
  }, {
    key: 'events',
    get: function get$$1() {
      return ['open', 'close'];
    }
  }]);
  return SpeedDialElement;
}(BaseElement);

customElements.define('ons-speed-dial', SpeedDialElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var rewritables$1 = {
  /**
   * @param {Element} element
   * @param {Function} callback
   */
  ready: function ready(element, callback) {
    setImmediate(callback);
  }
};

/**
 * @element ons-splitter-content
 * @category menu
 * @description
 *  [en]
 *    The `<ons-splitter-content>` element is used as a child element of `<ons-splitter>`.
 *
 *    It contains the main content of the page while `<ons-splitter-side>` contains the list.
 *  [/en]
 *  [ja]ons-splitter-content要素は、ons-splitter要素の子要素として利用します。[/ja]
 * @codepen rOQOML
 * @tutorial vanilla/Reference/splitter
 * @guide multiple-page-navigation
 *  [en]Managing multiple pages.[/en]
 *  [ja]Managing multiple pages[/ja]
 * @seealso ons-splitter
 *  [en]The `<ons-splitter>` component is the parent element.[/en]
 *  [ja]ons-splitterコンポーネント[/ja]
 * @seealso ons-splitter-side
 *  [en]The `<ons-splitter-side>` component contains the menu.[/en]
 *  [ja]ons-splitter-sideコンポーネント[/ja]
 * @example
 * <ons-splitter>
 *   <ons-splitter-content>
 *     ...
 *   </ons-splitter-content>
 *
 *   <ons-splitter-side side="left" width="80%" collapse>
 *     ...
 *   </ons-splitter-side>
 * </ons-splitter>
 */

var SplitterContentElement = function (_BaseElement) {
  inherits(SplitterContentElement, _BaseElement);

  /**
   * @attribute page
   * @type {String}
   * @description
   *   [en]
   *     The url of the content page. If this attribute is used the content will be loaded from a `<ons-template>` tag or a remote file.
   *
   *     It is also possible to put `<ons-page>` element as a child of the element.
   *   [/en]
   *   [ja]ons-splitter-content要素に表示するページのURLを指定します。[/ja]
   */

  function SplitterContentElement() {
    classCallCheck(this, SplitterContentElement);

    var _this = possibleConstructorReturn(this, (SplitterContentElement.__proto__ || Object.getPrototypeOf(SplitterContentElement)).call(this));

    _this._page = null;
    _this._pageLoader = defaultPageLoader;

    contentReady(_this, function () {
      rewritables$1.ready(_this, function () {
        var page = _this._getPageTarget();

        if (page) {
          _this.load(page);
        }
      });
    });
    return _this;
  }

  createClass(SplitterContentElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      if (!util.match(this.parentNode, 'ons-splitter')) {
        throw new Error('"ons-splitter-content" must have "ons-splitter" as parentNode.');
      }
    }
  }, {
    key: '_getPageTarget',
    value: function _getPageTarget() {
      return this._page || this.getAttribute('page');
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {}
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {}

    /**
     * @property page
     * @type {HTMLElement}
     * @description
     *   [en]The page to load in the splitter content.[/en]
     *   [ja]この要素内に表示するページを指定します。[/ja]
     */

  }, {
    key: 'load',


    /**
     * @method load
     * @signature load(page, [options])
     * @param {String} page, [options]
     *   [en]Page URL. Can be either an HTML document or an `<ons-template>` id.[/en]
     *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
     * @param {Object} [options]
     * @param {Function} [options.callback]
     * @description
     *   [en]Show the page specified in `page` in the content.[/en]
     *   [ja]指定したURLをメインページを読み込みます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the new `<ons-page>` element[/en]
     *   [ja]`<ons-page>`要素を解決するPromiseオブジェクトを返します。[/ja]
     */
    value: function load(page) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this._page = page;
      var callback = options.callback || function () {};

      return new Promise(function (resolve) {
        var oldContent = _this2._content || null;

        _this2._pageLoader.load({ page: page, parent: _this2 }, function (pageElement) {
          if (oldContent) {
            _this2._pageLoader.unload(oldContent);
            oldContent = null;
          }

          setImmediate(function () {
            return _this2._show();
          });

          callback(pageElement);
          resolve(pageElement);
        });
      });
    }
  }, {
    key: '_show',
    value: function _show() {
      if (this._content) {
        this._content._show();
      }
    }
  }, {
    key: '_hide',
    value: function _hide() {
      if (this._content) {
        this._content._hide();
      }
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      if (this._content) {
        this._pageLoader.unload(this._content);
      }
      this.remove();
    }
  }, {
    key: 'page',
    get: function get$$1() {
      return this._page;
    }

    /**
     * @param {*} page
     */
    ,
    set: function set(page) {
      this._page = page;
    }
  }, {
    key: '_content',
    get: function get$$1() {
      return this.children[0];
    }

    /**
     * @property pageLoader
     * @type {Function}
     * @description
     *   [en]Page element loaded in the splitter content.[/en]
     *   [ja]この要素内に表示するページを指定します。[/ja]
     */

  }, {
    key: 'pageLoader',
    get: function get$$1() {
      return this._pageLoader;
    },
    set: function set(loader) {
      if (!(loader instanceof PageLoader)) {
        throw Error('First parameter must be an instance of PageLoader');
      }
      this._pageLoader = loader;
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return [];
    }
  }, {
    key: 'rewritables',
    get: function get$$1() {
      return rewritables$1;
    }
  }]);
  return SplitterContentElement;
}(BaseElement);

customElements.define('ons-splitter-content', SplitterContentElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var SplitterMaskElement = function (_BaseElement) {
  inherits(SplitterMaskElement, _BaseElement);

  function SplitterMaskElement() {
    classCallCheck(this, SplitterMaskElement);

    var _this = possibleConstructorReturn(this, (SplitterMaskElement.__proto__ || Object.getPrototypeOf(SplitterMaskElement)).call(this));

    _this._boundOnClick = _this._onClick.bind(_this);
    contentReady(_this, function () {
      if (_this.parentNode._sides.every(function (side) {
        return side.mode === 'split';
      })) {
        _this.setAttribute('style', 'display: none !important');
      }
    });
    return _this;
  }

  createClass(SplitterMaskElement, [{
    key: '_onClick',
    value: function _onClick(event) {
      if (this.onClick instanceof Function) {
        this.onClick();
      } else if (util.match(this.parentNode, 'ons-splitter')) {
        this.parentNode._sides.forEach(function (side) {
          return side.close('left').catch(function () {});
        });
      }
      event.stopPropagation();
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {}
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this.addEventListener('click', this._boundOnClick);
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this.removeEventListener('click', this._boundOnClick);
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return [];
    }
  }]);
  return SplitterMaskElement;
}(BaseElement);

customElements.define('ons-splitter-mask', SplitterMaskElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var SplitterAnimator$1 = function (_BaseAnimator) {
  inherits(SplitterAnimator, _BaseAnimator);

  function SplitterAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'cubic-bezier(.1, .7, .1, 1)' : _ref$timing,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.3 : _ref$duration,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay;

    classCallCheck(this, SplitterAnimator);
    return possibleConstructorReturn(this, (SplitterAnimator.__proto__ || Object.getPrototypeOf(SplitterAnimator)).call(this, { timing: timing, duration: duration, delay: delay }));
  }

  createClass(SplitterAnimator, [{
    key: 'updateOptions',
    value: function updateOptions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      util.extend(this, {
        timing: this.timing, duration: this.duration, delay: this.delay
      }, options);
    }

    /**
     * @param {Element} sideElement
     */

  }, {
    key: 'activate',
    value: function activate(sideElement) {
      var _this2 = this;

      var splitter = sideElement.parentNode;

      contentReady(splitter, function () {
        _this2._side = sideElement;
        _this2._oppositeSide = splitter.right !== sideElement && splitter.right || splitter.left !== sideElement && splitter.left;
        _this2._content = splitter.content;
        _this2._mask = splitter.mask;
      });
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.clearTransition();
      this._mask && this.clearMask();
      this._content = this._side = this._oppositeSide = this._mask = null;
    }
  }, {
    key: 'clearTransition',
    value: function clearTransition() {
      this._side && (this._side.style.transform = this._side.style.transition = this._side.style.webkitTransition = '');
      this._mask && (this._mask.style.transform = this._mask.style.transition = this._mask.style.webkitTransition = '');
      this._content && (this._content.style.transform = this._content.style.transition = this._content.style.webkitTransition = '');
    }
  }, {
    key: 'clearMask',
    value: function clearMask() {
      // Check if the other side needs the mask before clearing
      if (!this._oppositeSide || this._oppositeSide.mode === 'split' || !this._oppositeSide.isOpen) {
        this._mask.style.opacity = '';
        this._mask.style.display = 'none';
      }
    }

    /**
     * @param {Number} distance
     */

  }, {
    key: 'translate',
    value: function translate(distance) {}

    /**
     * @param {Function} done
     */

  }, {
    key: 'open',
    value: function open(done) {
      done();
    }

    /**
     * @param {Function} done
     */

  }, {
    key: 'close',
    value: function close(done) {
      done();
    }
  }, {
    key: 'minus',
    get: function get$$1() {
      return this._side._side === 'right' ? '-' : '';
    }
  }]);
  return SplitterAnimator;
}(BaseAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var OverlaySplitterAnimator = function (_SplitterAnimator) {
  inherits(OverlaySplitterAnimator, _SplitterAnimator);

  function OverlaySplitterAnimator() {
    classCallCheck(this, OverlaySplitterAnimator);
    return possibleConstructorReturn(this, (OverlaySplitterAnimator.__proto__ || Object.getPrototypeOf(OverlaySplitterAnimator)).apply(this, arguments));
  }

  createClass(OverlaySplitterAnimator, [{
    key: 'translate',
    value: function translate(distance) {
      this._mask.style.display = 'block'; // Avoid content clicks

      Animit(this._side).queue({
        transform: 'translate3d(' + (this.minus + distance) + 'px, 0px, 0px)'
      }).play();
    }

    /**
     * @param {Function} done
     */

  }, {
    key: 'open',
    value: function open(done) {
      Animit.runAll(Animit(this._side).wait(this.delay).queue({
        transform: 'translate3d(' + this.minus + '100%, 0px, 0px)'
      }, {
        duration: this.duration,
        timing: this.timing
      }).queue(function (callback) {
        callback();
        done && done();
      }), Animit(this._mask).wait(this.delay).queue({
        display: 'block'
      }).queue({
        opacity: '1'
      }, {
        duration: this.duration,
        timing: 'linear'
      }));
    }

    /**
     * @param {Function} done
     */

  }, {
    key: 'close',
    value: function close(done) {

      Animit.runAll(Animit(this._side).wait(this.delay).queue({
        transform: 'translate3d(0px, 0px, 0px)'
      }, {
        duration: this.duration,
        timing: this.timing
      }).queue(function (callback) {
        done && done();
        callback();
      }), Animit(this._mask).wait(this.delay).queue({
        opacity: '0'
      }, {
        duration: this.duration,
        timing: 'linear'
      }).queue({
        display: 'none'
      }));
    }
  }]);
  return OverlaySplitterAnimator;
}(SplitterAnimator$1);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var PushSplitterAnimator = function (_SplitterAnimator) {
  inherits(PushSplitterAnimator, _SplitterAnimator);

  function PushSplitterAnimator() {
    classCallCheck(this, PushSplitterAnimator);
    return possibleConstructorReturn(this, (PushSplitterAnimator.__proto__ || Object.getPrototypeOf(PushSplitterAnimator)).apply(this, arguments));
  }

  createClass(PushSplitterAnimator, [{
    key: '_getSlidingElements',
    value: function _getSlidingElements() {
      var slidingElements = [this._side, this._content];
      if (this._oppositeSide && this._oppositeSide.mode === 'split') {
        slidingElements.push(this._oppositeSide);
      }

      return slidingElements;
    }
  }, {
    key: 'translate',
    value: function translate(distance) {
      if (!this._slidingElements) {
        this._slidingElements = this._getSlidingElements();
      }

      this._mask.style.display = 'block'; // Avoid content clicks

      Animit(this._slidingElements).queue({
        transform: 'translate3d(' + (this.minus + distance) + 'px, 0px, 0px)'
      }).play();
    }

    /**
     * @param {Function} done
     */

  }, {
    key: 'open',
    value: function open(done) {
      var _this2 = this;

      var max = this._side.offsetWidth;
      this._slidingElements = this._getSlidingElements();

      Animit.runAll(Animit(this._slidingElements).wait(this.delay).queue({
        transform: 'translate3d(' + (this.minus + max) + 'px, 0px, 0px)'
      }, {
        duration: this.duration,
        timing: this.timing
      }).queue(function (callback) {
        _this2._slidingElements = null;
        callback();
        done && done();
      }), Animit(this._mask).wait(this.delay).queue({
        display: 'block'
      }));
    }

    /**
     * @param {Function} done
     */

  }, {
    key: 'close',
    value: function close(done) {
      var _this3 = this;

      this._slidingElements = this._getSlidingElements();

      Animit.runAll(Animit(this._slidingElements).wait(this.delay).queue({
        transform: 'translate3d(0px, 0px, 0px)'
      }, {
        duration: this.duration,
        timing: this.timing
      }).queue(function (callback) {
        _this3._slidingElements = null;
        get(PushSplitterAnimator.prototype.__proto__ || Object.getPrototypeOf(PushSplitterAnimator.prototype), 'clearTransition', _this3).call(_this3);
        done && done();
        callback();
      }), Animit(this._mask).wait(this.delay).queue({
        display: 'none'
      }));
    }
  }]);
  return PushSplitterAnimator;
}(SplitterAnimator$1);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var RevealSplitterAnimator = function (_SplitterAnimator) {
  inherits(RevealSplitterAnimator, _SplitterAnimator);

  function RevealSplitterAnimator() {
    classCallCheck(this, RevealSplitterAnimator);
    return possibleConstructorReturn(this, (RevealSplitterAnimator.__proto__ || Object.getPrototypeOf(RevealSplitterAnimator)).apply(this, arguments));
  }

  createClass(RevealSplitterAnimator, [{
    key: '_getSlidingElements',
    value: function _getSlidingElements() {
      var slidingElements = [this._content, this._mask];
      if (this._oppositeSide && this._oppositeSide.mode === 'split') {
        slidingElements.push(this._oppositeSide);
      }

      return slidingElements;
    }
  }, {
    key: 'activate',
    value: function activate(sideElement) {
      get(RevealSplitterAnimator.prototype.__proto__ || Object.getPrototypeOf(RevealSplitterAnimator.prototype), 'activate', this).call(this, sideElement);
      this.maxWidth = this._getMaxWidth();
      if (sideElement.mode === 'collapse') {
        this._setStyles(sideElement);
      }
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this._side && this._unsetStyles(this._side);
      get(RevealSplitterAnimator.prototype.__proto__ || Object.getPrototypeOf(RevealSplitterAnimator.prototype), 'deactivate', this).call(this);
    }
  }, {
    key: '_setStyles',
    value: function _setStyles(sideElement) {
      sideElement.style.left = sideElement.side === 'right' ? 'auto' : 0;
      sideElement.style.right = sideElement.side === 'right' ? 0 : 'auto';
      sideElement.style.zIndex = 0;
      sideElement.style.backgroundColor = 'black';
      sideElement.style.transform = this._generateBehindPageStyle(0).container.transform;
      sideElement.style.display = 'none';

      var splitter = sideElement.parentElement;
      contentReady(splitter, function () {
        if (splitter.content) {
          splitter.content.style.boxShadow = '0 0 12px 0 rgba(0, 0, 0, 0.2)';
        }
      });
    }
  }, {
    key: '_unsetStyles',
    value: function _unsetStyles(sideElement) {
      sideElement.style.left = sideElement.style.right = sideElement.style.zIndex = sideElement.style.backgroundColor = sideElement.style.display = '';
      if (sideElement._content) {
        sideElement._content.style.opacity = '';
      }

      // Check if the other side needs the common styles
      if (!this._oppositeSide || this._oppositeSide.mode === 'split') {
        if (sideElement.parentElement.content) {
          sideElement.parentElement.content.style.boxShadow = '';
        }
      }
    }
  }, {
    key: '_generateBehindPageStyle',
    value: function _generateBehindPageStyle(distance) {
      var max = this.maxWidth;

      var behindDistance = (distance - max) / max * 10;
      behindDistance = isNaN(behindDistance) ? 0 : Math.max(Math.min(behindDistance, 0), -10);

      var behindTransform = 'translate3d(' + (this.minus ? -1 : 1) * behindDistance + '%, 0, 0)';
      var opacity = 1 + behindDistance / 100;

      return {
        content: {
          opacity: opacity
        },
        container: {
          transform: behindTransform
        }
      };
    }
  }, {
    key: 'translate',
    value: function translate(distance) {
      this._side.style.display = '';
      this._side.style.zIndex = 1;
      this.maxWidth = this.maxWidth || this._getMaxWidth();
      var menuStyle = this._generateBehindPageStyle(Math.min(distance, this.maxWidth));

      if (!this._slidingElements) {
        this._slidingElements = this._getSlidingElements();
      }

      this._mask.style.display = 'block'; // Avoid content clicks

      Animit.runAll(Animit(this._slidingElements).queue({
        transform: 'translate3d(' + (this.minus + distance) + 'px, 0px, 0px)'
      }), Animit(this._side._content).queue(menuStyle.content), Animit(this._side).queue(menuStyle.container));
    }

    /**
     * @param {Function} done
     */

  }, {
    key: 'open',
    value: function open(done) {
      var _this2 = this;

      this._side.style.display = '';
      this._side.style.zIndex = 1;
      this.maxWidth = this.maxWidth || this._getMaxWidth();
      var menuStyle = this._generateBehindPageStyle(this.maxWidth);
      this._slidingElements = this._getSlidingElements();

      Animit.runAll(Animit(this._slidingElements).wait(this.delay).queue({
        transform: 'translate3d(' + (this.minus + this.maxWidth) + 'px, 0px, 0px)'
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(this._mask).wait(this.delay).queue({
        display: 'block'
      }), Animit(this._side._content).wait(this.delay).queue(menuStyle.content, {
        duration: this.duration,
        timing: this.timing
      }), Animit(this._side).wait(this.delay).queue(menuStyle.container, {
        duration: this.duration,
        timing: this.timing
      }).queue(function (callback) {
        _this2._slidingElements = null;
        callback();
        done && done();
      }));
    }

    /**
     * @param {Function} done
     */

  }, {
    key: 'close',
    value: function close(done) {
      var _this3 = this;

      var menuStyle = this._generateBehindPageStyle(0);
      this._slidingElements = this._getSlidingElements();

      Animit.runAll(Animit(this._slidingElements).wait(this.delay).queue({
        transform: 'translate3d(0px, 0px, 0px)'
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(this._mask).wait(this.delay).queue({
        display: 'none'
      }), Animit(this._side._content).wait(this.delay).queue(menuStyle.content, {
        duration: this.duration,
        timing: this.timing
      }), Animit(this._side).wait(this.delay).queue(menuStyle.container, {
        duration: this.duration,
        timing: this.timing
      }).queue(function (callback) {
        _this3._slidingElements = null;
        _this3._side.style.zIndex = 0;
        _this3._side.style.display = 'none';
        _this3._side._content.style.opacity = '';
        done && done();
        callback();
      }));
    }
  }, {
    key: '_getMaxWidth',
    value: function _getMaxWidth() {
      return this._side.offsetWidth;
    }
  }]);
  return RevealSplitterAnimator;
}(SplitterAnimator$1);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var _animatorDict$6 = {
  default: OverlaySplitterAnimator,
  overlay: OverlaySplitterAnimator,
  push: PushSplitterAnimator,
  reveal: RevealSplitterAnimator
};

/**
 * @element ons-splitter
 * @category menu
 * @description
 *  [en]
 *    A component that enables responsive layout by implementing both a two-column layout and a sliding menu layout.
 *
 *    It can be configured to automatically expand into a column layout on large screens and collapse the menu on smaller screens. When the menu is collapsed the user can open it by swiping.
 *  [/en]
 *  [ja][/ja]
 * @codepen rOQOML
 * @tutorial vanilla/Reference/splitter
 * @guide multiple-page-navigation
 *  [en]Managing multiple pages.[/en]
 *  [ja]Managing multiple pages[/ja]
 * @seealso ons-splitter-content
 *  [en]The `<ons-splitter-content>` component contains the main content of the page.[/en]
 *  [ja]ons-splitter-contentコンポーネント[/ja]
 * @seealso ons-splitter-side
 *  [en]The `<ons-splitter-side>` component contains the menu.[/en]
 *  [ja]ons-splitter-sideコンポーネント[/ja]
 * @example
 * <ons-splitter id="splitter">
 *   <ons-splitter-content>
 *     ...
 *   </ons-splitter-content>
 *
 *   <ons-splitter-side side="left" width="80%" collapse swipeable>
 *     ...
 *   </ons-splitter-side>
 * </ons-splitter>
 *
 * <script>
 *   var splitter = document.getElementById('splitter');
 *   splitter.left.open();
 * </script>
 */

var SplitterElement = function (_BaseElement) {
  inherits(SplitterElement, _BaseElement);
  createClass(SplitterElement, [{
    key: '_getSide',
    value: function _getSide(side) {
      var element = util.findChild(this, function (e) {
        return util.match(e, 'ons-splitter-side') && e.getAttribute('side') === side;
      });
      return element;
    }

    /**
     * @property left
     * @readonly
     * @type {HTMLElement}
     * @description
     *   [en]Left `<ons-splitter-side>` element.[/en]
     *   [ja][/ja]
     */

  }, {
    key: '_onDeviceBackButton',
    value: function _onDeviceBackButton(event) {
      this._sides.some(function (s) {
        return s.isOpen ? s.close() : false;
      }) || event.callParentHandler();
    }
  }, {
    key: '_onModeChange',
    value: function _onModeChange(e) {
      var _this2 = this;

      if (e.target.parentNode) {
        contentReady(this, function () {
          _this2._layout();
        });
      }
    }
  }, {
    key: '_layout',
    value: function _layout() {
      var _this3 = this;

      this._sides.forEach(function (side) {
        if (_this3.content) {
          _this3.content.style[side.side] = side.mode === 'split' ? side._width : 0;
        }
      });
    }
  }, {
    key: 'left',
    get: function get$$1() {
      return this._getSide('left');
    }
    /**
     * @property right
     * @readonly
     * @type {HTMLElement}
     * @description
     *   [en]Right `<ons-splitter-side>` element.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'right',
    get: function get$$1() {
      return this._getSide('right');
    }

    /**
     * @property side
     * @readonly
     * @type {HTMLElement}
     * @description
     *   [en]First `<ons-splitter-side>` element regardless the actual side.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'side',
    get: function get$$1() {
      return util.findChild(this, 'ons-splitter-side');
    }
  }, {
    key: '_sides',
    get: function get$$1() {
      return [this.left, this.right].filter(function (e) {
        return e;
      });
    }
    /**
     * @property content
     * @readonly
     * @type {HTMLElement}
     * @description
     *   [en]The `<ons-splitter-content>` element.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'content',
    get: function get$$1() {
      return util.findChild(this, 'ons-splitter-content');
    }
  }, {
    key: 'topPage',
    get: function get$$1() {
      return this.content._content;
    }
  }, {
    key: 'mask',
    get: function get$$1() {
      return util.findChild(this, 'ons-splitter-mask');
    }

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

  }, {
    key: 'onDeviceBackButton',
    get: function get$$1() {
      return this._backButtonHandler;
    },
    set: function set(callback) {
      if (this._backButtonHandler) {
        this._backButtonHandler.destroy();
      }

      this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
    }
  }]);

  function SplitterElement() {
    classCallCheck(this, SplitterElement);

    var _this = possibleConstructorReturn(this, (SplitterElement.__proto__ || Object.getPrototypeOf(SplitterElement)).call(this));

    _this._boundOnModeChange = _this._onModeChange.bind(_this);

    contentReady(_this, function () {
      _this._compile();
      _this._layout();
    });
    return _this;
  }

  createClass(SplitterElement, [{
    key: '_compile',
    value: function _compile() {
      if (!this.mask) {
        this.appendChild(document.createElement('ons-splitter-mask'));
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this.onDeviceBackButton = this._onDeviceBackButton.bind(this);
      this.addEventListener('modechange', this._boundOnModeChange, false);
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this._backButtonHandler.destroy();
      this._backButtonHandler = null;
      this.removeEventListener('modechange', this._boundOnModeChange, false);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {}
  }, {
    key: '_show',
    value: function _show() {
      util.propagateAction(this, '_show');
    }
  }, {
    key: '_hide',
    value: function _hide() {
      util.propagateAction(this, '_hide');
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      util.propagateAction(this, '_destroy');
      this.remove();
    }
  }], [{
    key: 'registerAnimator',
    value: function registerAnimator(name, Animator) {
      if (!(Animator instanceof SplitterAnimator)) {
        throw new Error('Animator parameter must be an instance of SplitterAnimator.');
      }
      _animatorDict$6[name] = Animator;
    }
  }, {
    key: 'SplitterAnimator',
    get: function get$$1() {
      return SplitterAnimator;
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict$6;
    }
  }]);
  return SplitterElement;
}(BaseElement);

customElements.define('ons-splitter', SplitterElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var SPLIT_MODE = 'split';
var COLLAPSE_MODE = 'collapse';
var CLOSED_STATE = 'closed';
var OPEN_STATE = 'open';
var CHANGING_STATE = 'changing';

var WATCHED_ATTRIBUTES = ['animation', 'width', 'side', 'collapse', 'swipeable', 'swipe-target-width', 'animation-options', 'open-threshold'];

var rewritables$2 = {
  /**
   * @param {Element} splitterSideElement
   * @param {Function} callback
   */
  ready: function ready(splitterSideElement, callback) {
    setImmediate(callback);
  }
};

var CollapseDetection = function () {
  function CollapseDetection(element, target) {
    classCallCheck(this, CollapseDetection);

    this._element = element;
    this._boundOnChange = this._onChange.bind(this);
    target && this.changeTarget(target);
  }

  createClass(CollapseDetection, [{
    key: 'changeTarget',
    value: function changeTarget(target) {
      this.disable();
      this._target = target;
      if (target) {
        this._orientation = ['portrait', 'landscape'].indexOf(target) !== -1;
        this.activate();
      }
    }
  }, {
    key: '_match',
    value: function _match(value) {
      if (this._orientation) {
        return this._target === (value.isPortrait ? 'portrait' : 'landscape');
      }
      return value.matches;
    }
  }, {
    key: '_onChange',
    value: function _onChange(value) {
      this._element._updateMode(this._match(value) ? COLLAPSE_MODE : SPLIT_MODE);
    }
  }, {
    key: 'activate',
    value: function activate() {
      if (this._orientation) {
        orientation.on('change', this._boundOnChange);
        this._onChange({ isPortrait: orientation.isPortrait() });
      } else {
        this._queryResult = window.matchMedia(this._target);
        this._queryResult.addListener(this._boundOnChange);
        this._onChange(this._queryResult);
      }
    }
  }, {
    key: 'disable',
    value: function disable() {
      if (this._orientation) {
        orientation.off('change', this._boundOnChange);
      } else if (this._queryResult) {
        this._queryResult.removeListener(this._boundOnChange);
        this._queryResult = null;
      }
    }
  }]);
  return CollapseDetection;
}();

var widthToPx$1 = function widthToPx(width, parent) {
  var _ref = [parseInt(width, 10), /px/.test(width)],
      value = _ref[0],
      px = _ref[1];

  return px ? value : Math.round(parent.offsetWidth * value / 100);
};

var CollapseMode = function () {
  createClass(CollapseMode, [{
    key: '_animator',
    get: function get$$1() {
      return this._element._animator;
    }
  }]);

  function CollapseMode(element) {
    classCallCheck(this, CollapseMode);

    this._active = false;
    this._state = CLOSED_STATE;
    this._element = element;
    this._lock = new DoorLock();
  }

  createClass(CollapseMode, [{
    key: 'isOpen',
    value: function isOpen() {
      return this._active && this._state !== CLOSED_STATE;
    }
  }, {
    key: 'handleGesture',
    value: function handleGesture(e) {
      if (!this._active || this._lock.isLocked() || this._isOpenOtherSideMenu()) {
        return;
      }
      if (e.type === 'dragstart') {
        this._onDragStart(e);
      } else if (!this._ignoreDrag) {
        e.type === 'dragend' ? this._onDragEnd(e) : this._onDrag(e);
      }
    }
  }, {
    key: '_canConsumeGesture',
    value: function _canConsumeGesture(gesture) {
      var _this = this;

      var isOpen = this.isOpen();
      var validDrag = function validDrag(d) {
        return _this._element._side === 'left' ? d === 'left' && isOpen || d === 'right' && !isOpen : d === 'left' && !isOpen || d === 'right' && isOpen;
      };

      var distance = this._element._side === 'left' ? gesture.center.clientX : window.innerWidth - gesture.center.clientX;
      var area = this._element._swipeTargetWidth;

      return (validDrag(gesture.direction) || validDrag(gesture.interimDirection)) && !(area && distance > area && !isOpen);
    }
  }, {
    key: '_onDragStart',
    value: function _onDragStart(event) {
      this._ignoreDrag = event.consumed || !this._canConsumeGesture(event.gesture);

      if (!this._ignoreDrag) {
        event.consume && event.consume();
        event.consumed = true;

        this._width = widthToPx$1(this._element._width, this._element.parentNode);
        this._startDistance = this._distance = this.isOpen() ? this._width : 0;

        util.skipContentScroll(event.gesture);
      }
    }
  }, {
    key: '_onDrag',
    value: function _onDrag(event) {
      event.stopPropagation();
      event.gesture.preventDefault();

      var delta = this._element._side === 'left' ? event.gesture.deltaX : -event.gesture.deltaX;
      var distance = Math.max(0, Math.min(this._width, this._startDistance + delta));
      if (distance !== this._distance) {
        this._animator.translate(distance);
        this._distance = distance;
        this._state = CHANGING_STATE;
      }
    }
  }, {
    key: '_onDragEnd',
    value: function _onDragEnd(event) {
      event.stopPropagation();

      var distance = this._distance,
          width = this._width,
          el = this._element;

      var direction = event.gesture.interimDirection;
      var shouldOpen = el._side !== direction && distance > width * el._threshold;
      this.executeAction(shouldOpen ? 'open' : 'close');
      this._ignoreDrag = true;
    }
  }, {
    key: 'layout',
    value: function layout() {
      if (this._active && this._state === OPEN_STATE) {
        this._animator.open();
      }
    }

    // enter collapse mode

  }, {
    key: 'enterMode',
    value: function enterMode() {
      if (!this._active) {
        this._active = true;
        this._animator && this._animator.activate(this._element);
        this.layout();
      }
    }

    // exit collapse mode

  }, {
    key: 'exitMode',
    value: function exitMode() {
      this._animator && this._animator.deactivate();
      this._state = CLOSED_STATE;
      this._active = false;
    }
  }, {
    key: '_isOpenOtherSideMenu',
    value: function _isOpenOtherSideMenu() {
      var _this2 = this;

      return util.arrayFrom(this._element.parentElement.children).some(function (e) {
        return util.match(e, 'ons-splitter-side') && e !== _this2._element && e.isOpen;
      });
    }

    /**
     * @param {String} name - 'open' or 'close'
     * @param {Object} [options]
     * @param {Function} [options.callback]
     * @param {Boolean} [options.withoutAnimation]
     * @return {Promise} Resolves to the splitter side element or false if not in collapse mode
     */

  }, {
    key: 'executeAction',
    value: function executeAction(name) {
      var _this3 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var FINAL_STATE = name === 'open' ? OPEN_STATE : CLOSED_STATE;

      if (!this._active) {
        return Promise.resolve(false);
      }

      if (this._state === FINAL_STATE) {
        return Promise.resolve(this._element);
      }
      if (this._lock.isLocked()) {
        return Promise.reject('Splitter side is locked.');
      }
      if (name === 'open' && this._isOpenOtherSideMenu()) {
        return Promise.reject('Another menu is already open.');
      }
      if (this._element._emitEvent('pre' + name)) {
        return Promise.reject('Canceled in pre' + name + ' event.');
      }

      var callback = options.callback;
      var unlock = this._lock.lock();
      var done = function done() {
        _this3._state = FINAL_STATE;
        _this3.layout();
        unlock();
        _this3._element._emitEvent('post' + name);
        callback && callback();
      };

      if (options.withoutAnimation) {
        done();
        return Promise.resolve(this._element);
      }
      this._state = CHANGING_STATE;
      return new Promise(function (resolve) {
        _this3._animator[name](function () {
          done();
          resolve(_this3._element);
        });
      });
    }
  }]);
  return CollapseMode;
}();

/**
 * @element ons-splitter-side
 * @category menu
 * @description
 *  [en]
 *    The `<ons-splitter-side>` element is used as a child element of `<ons-splitter>`.
 *
 *    It will be displayed on either the left or right side of the `<ons-splitter-content>` element.
 *
 *    It supports two modes: collapsed and split. When it's in collapsed mode it will be hidden from view and can be displayed when the user swipes the screen or taps a button. In split mode the element is always shown. It can be configured to automatically switch between the two modes depending on the screen size.
 *  [/en]
 *  [ja]ons-splitter-side要素は、ons-splitter要素の子要素として利用します。[/ja]
 * @codepen rOQOML
 * @tutorial vanilla/Reference/splitter
 * @guide multiple-page-navigation
 *  [en]Managing multiple pages.[/en]
 *  [ja]Managing multiple pages[/ja]
 * @seealso ons-splitter
 *  [en]The `<ons-splitter>` is the parent component.[/en]
 *  [ja]ons-splitterコンポーネント[/ja]
 * @seealso ons-splitter-content
 *  [en]The `<ons-splitter-content>` component contains the main content of the page.[/en]
 *  [ja]ons-splitter-contentコンポーネント[/ja]
 * @example
 * <ons-splitter>
 *   <ons-splitter-content>
 *     ...
 *   </ons-splitter-content>
 *
 *   <ons-splitter-side side="left" width="80%" collapse>
 *     ...
 *   </ons-splitter-side>
 * </ons-splitter>
 */


var SplitterSideElement = function (_BaseElement) {
  inherits(SplitterSideElement, _BaseElement);

  /**
   * @event modechange
   * @description
   *   [en]Fired just after the component's mode changes.[/en]
   *   [ja]この要素のモードが変化した際に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクトです。[/ja]
   * @param {Object} event.side
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {String} event.mode
   *   [en]Returns the current mode. Can be either `"collapse"` or `"split"`.[/en]
   *   [ja]現在のモードを返します。[/ja]
   */

  /**
   * @event preopen
   * @description
   *   [en]Fired just before the sliding menu is opened.[/en]
   *   [ja]スライディングメニューが開く前に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクトです。[/ja]
   * @param {Function} event.cancel
   *   [en]Call to cancel opening sliding menu.[/en]
   *   [ja]スライディングメニューが開くのをキャンセルします。[/ja]
   * @param {Object} event.side
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @event postopen
   * @description
   *   [en]Fired just after the sliding menu is opened.[/en]
   *   [ja]スライディングメニューが開いた後に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクトです。[/ja]
   * @param {Object} event.side
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @event preclose
   * @description
   *   [en]Fired just before the sliding menu is closed.[/en]
   *   [ja]スライディングメニューが閉じる前に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクトです。[/ja]
   * @param {Object} event.side
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Call to cancel opening sliding-menu.[/en]
   *   [ja]スライディングメニューが閉じるのをキャンセルします。[/ja]
   */

  /**
   * @event postclose
   * @description
   *   [en]Fired just after the sliding menu is closed.[/en]
   *   [ja]スライディングメニューが閉じた後に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクトです。[/ja]
   * @param {Object} event.side
   *   [en]Component object.[/en]
   *   [ja]コンポーネントのオブジェクト。[/ja]
   */

  /**
   * @attribute animation
   * @type {String}
   * @default  default
   * @description
   *  [en]Specify the animation. Use one of `overlay`, `push`, `reveal` or  `default`.[/en]
   *  [ja]アニメーションを指定します。"overlay", "push", "reveal", "default"のいずれかを指定できます。[/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. {duration: 0.2, delay: 1, timing: 'ease-in'}[/ja]
   */

  /**
   * @attribute open-threshold
   * @type {Number}
   * @default  0.3
   * @description
   *  [en]Specify how much the menu needs to be swiped before opening. A value between `0` and `1`.[/en]
   *  [ja]どのくらいスワイプすればスライディングメニューを開くかどうかの割合を指定します。0から1の間の数値を指定します。スワイプの距離がここで指定した数値掛けるこの要素の幅よりも大きければ、スワイプが終わった時にこの要素を開きます。デフォルトは0.3です。[/ja]
   */

  /**
   * @attribute collapse
   * @type {String}
   * @description
   *   [en]
   *     Specify the collapse behavior. Valid values are `"portrait"`, `"landscape"` or a media query.
   *     The strings `"portrait"` and `"landscape"` means the view will collapse when device is in landscape or portrait orientation.
   *     If the value is a media query, the view will collapse when the media query resolves to `true`.
   *     If the value is not defined, the view always be in `"collapse"` mode.
   *   [/en]
   *   [ja]
   *     左側のページを非表示にする条件を指定します。portrait, landscape、width #pxもしくはメディアクエリの指定が可能です。
   *     portraitもしくはlandscapeを指定すると、デバイスの画面が縦向きもしくは横向きになった時に適用されます。
   *     メディアクエリを指定すると、指定したクエリに適合している場合に適用されます。
   *     値に何も指定しない場合には、常にcollapseモードになります。
   *   [/ja]
   */

  /**
   * @attribute swipe-target-width
   * @type {String}
   * @description
   *   [en]The width of swipeable area calculated from the edge (in pixels). Use this to enable swipe only when the finger touch on the screen edge.[/en]
   *   [ja]スワイプの判定領域をピクセル単位で指定します。画面の端から指定した距離に達するとページが表示されます。[/ja]
   */

  /**
   * @attribute width
   * @type {String}
   * @description
   *   [en]Can be specified in either pixels or as a percentage, e.g. `90%` or `200px`.[/en]
   *   [ja]この要素の横幅を指定します。pxと%での指定が可能です。eg. 90%, 200px[/ja]
   */

  /**
   * @attribute side
   * @type {String}
   * @default left
   * @description
   *   [en]Specify which side of the screen the `<ons-splitter-side>` element is located. Possible values are `"left"` and `"right"`.[/en]
   *   [ja]この要素が左か右かを指定します。指定できる値は"left"か"right"のみです。[/ja]
   */

  /**
   * @attribute mode
   * @type {String}
   * @description
   *   [en]Current mode. Possible values are `"collapse"` or `"split"`. This attribute is read only.[/en]
   *   [ja]現在のモードが設定されます。"collapse"もしくは"split"が指定されます。この属性は読み込み専用です。[/ja]
   */

  /**
   * @attribute page
   * @initonly
   * @type {String}
   * @description
   *   [en]The URL of the menu page.[/en]
   *   [ja]ons-splitter-side要素に表示するページのURLを指定します。[/ja]
   */

  /**
   * @attribute swipeable
   * @type {Boolean}
   * @description
   *   [en]Whether to enable swipe interaction on collapse mode.[/en]
   *   [ja]collapseモード時にスワイプ操作を有効にする場合に指定します。[/ja]
   */

  function SplitterSideElement() {
    classCallCheck(this, SplitterSideElement);

    var _this4 = possibleConstructorReturn(this, (SplitterSideElement.__proto__ || Object.getPrototypeOf(SplitterSideElement)).call(this));

    _this4._page = null;
    _this4._pageLoader = defaultPageLoader;
    _this4._collapseMode = new CollapseMode(_this4);
    _this4._collapseDetection = new CollapseDetection(_this4);

    _this4._animatorFactory = new AnimatorFactory({
      animators: SplitterElement.animators,
      baseClass: SplitterAnimator$1,
      baseClassName: 'SplitterAnimator',
      defaultAnimation: _this4.getAttribute('animation')
    });
    _this4._boundHandleGesture = function (e) {
      return _this4._collapseMode.handleGesture(e);
    };
    _this4._watchedAttributes = WATCHED_ATTRIBUTES;
    contentReady(_this4, function () {
      rewritables$2.ready(_this4, function () {
        var page = _this4._getPageTarget();

        if (page) {
          _this4.load(page);
        }
      });
    });
    return _this4;
  }

  createClass(SplitterSideElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this5 = this;

      if (!util.match(this.parentNode, 'ons-splitter')) {
        throw new Error('Parent must be an ons-splitter element.');
      }

      this._gestureDetector = new GestureDetector(this.parentElement, { dragMinDistance: 1 });

      contentReady(this, function () {
        _this5._watchedAttributes.forEach(function (e) {
          return _this5._update(e);
        });
      });

      if (!this.hasAttribute('side')) {
        this.setAttribute('side', 'left');
      }
    }
  }, {
    key: '_getPageTarget',
    value: function _getPageTarget() {
      return this._page || this.getAttribute('page');
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this._collapseDetection.disable();
      this._gestureDetector.dispose();
      this._gestureDetector = null;
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      this._update(name, current);
    }
  }, {
    key: '_update',
    value: function _update(name, value) {
      name = '_update' + name.split('-').map(function (e) {
        return e[0].toUpperCase() + e.slice(1);
      }).join('');
      return this[name](value);
    }
  }, {
    key: '_emitEvent',
    value: function _emitEvent(name) {
      if (name.slice(0, 3) !== 'pre') {
        return util.triggerElementEvent(this, name, { side: this });
      }
      var isCanceled = false;

      util.triggerElementEvent(this, name, {
        side: this,
        cancel: function cancel() {
          return isCanceled = true;
        }
      });

      return isCanceled;
    }
  }, {
    key: '_updateCollapse',
    value: function _updateCollapse() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAttribute('collapse');

      if (value === null || value === 'split') {
        this._collapseDetection.disable();
        return this._updateMode(SPLIT_MODE);
      }
      if (value === '' || value === 'collapse') {
        this._collapseDetection.disable();
        return this._updateMode(COLLAPSE_MODE);
      }

      this._collapseDetection.changeTarget(value);
    }

    // readonly attribute for the users

  }, {
    key: '_updateMode',
    value: function _updateMode(mode) {
      if (mode !== this._mode) {
        this._mode = mode;
        this._collapseMode[mode === COLLAPSE_MODE ? 'enterMode' : 'exitMode']();
        this.setAttribute('mode', mode);

        util.triggerElementEvent(this, 'modechange', { side: this, mode: mode });
      }
    }
  }, {
    key: '_updateOpenThreshold',
    value: function _updateOpenThreshold() {
      var threshold = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAttribute('open-threshold');

      this._threshold = Math.max(0, Math.min(1, parseFloat(threshold) || 0.3));
    }
  }, {
    key: '_updateSwipeable',
    value: function _updateSwipeable() {
      var swipeable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAttribute('swipeable');

      var action = swipeable === null ? 'off' : 'on';

      if (this._gestureDetector) {
        this._gestureDetector[action]('drag dragstart dragend', this._boundHandleGesture);
      }
    }
  }, {
    key: '_updateSwipeTargetWidth',
    value: function _updateSwipeTargetWidth() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAttribute('swipe-target-width');

      this._swipeTargetWidth = Math.max(0, parseInt(value) || 0);
    }
  }, {
    key: '_updateWidth',
    value: function _updateWidth() {
      this.style.width = this._width;
    }
  }, {
    key: '_updateSide',
    value: function _updateSide() {
      var side = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAttribute('side');

      this._side = side === 'right' ? side : 'left';
    }
  }, {
    key: '_updateAnimation',
    value: function _updateAnimation() {
      var animation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAttribute('animation');

      this._animator && this._animator.deactivate();
      this._animator = this._animatorFactory.newAnimator({ animation: animation });
      this._animator.activate(this);
    }
  }, {
    key: '_updateAnimationOptions',
    value: function _updateAnimationOptions() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAttribute('animation-options');

      this._animator.updateOptions(AnimatorFactory.parseAnimationOptionsString(value));
    }

    /**
     * @property page
     * @type {*}
     * @description
     *   [en]Page location to load in the splitter side.[/en]
     *   [ja]この要素内に表示するページを指定します。[/ja]
     */

  }, {
    key: 'open',


    /**
     * @method open
     * @signature open([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {Function} [options.callback]
     *   [en]This function will be called after the menu has been opened.[/en]
     *   [ja]メニューが開いた後に呼び出される関数オブジェクトを指定します。[/ja]
     * @description
     *   [en]Open menu in collapse mode.[/en]
     *   [ja]collapseモードになっているons-splitter-side要素を開きます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the splitter side element or false if not in collapse mode[/en]
     *   [ja][/ja]
     */
    value: function open() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this._collapseMode.executeAction('open', options);
    }

    /**
     * @method close
     * @signature close([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {Function} [options.callback]
     *   [en]This function will be called after the menu has been closed.[/en]
     *   [ja]メニューが閉じた後に呼び出される関数オブジェクトを指定します。[/ja]
     * @description
     *   [en]Close menu in collapse mode.[/en]
     *   [ja]collapseモードになっているons-splitter-side要素を閉じます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the splitter side element or false if not in collapse mode[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'close',
    value: function close() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this._collapseMode.executeAction('close', options);
    }

    /**
     * @method toggle
     * @signature toggle([options])
     * @param {Object} [options]
     * @description
     *   [en]Opens if it's closed. Closes if it's open.[/en]
     *   [ja]開けている場合は要素を閉じますそして開けている場合は要素を開きます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the splitter side element or false if not in collapse mode[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'toggle',
    value: function toggle() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.isOpen ? this.close(options) : this.open(options);
    }

    /**
     * @method load
     * @signature load(page, [options])
     * @param {String} page
     *   [en]Page URL. Can be either an HTML document or an <ons-template>.[/en]
     *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
     * @param {Object} [options]
     * @param {Function} [options.callback]
     * @description
     *   [en]Show the page specified in pageUrl in the right section[/en]
     *   [ja]指定したURLをメインページを読み込みます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the new page element[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'load',
    value: function load(page) {
      var _this6 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this._page = page;
      var callback = options.callback || function () {};

      return new Promise(function (resolve) {
        var oldContent = _this6._content || null;

        _this6._pageLoader.load({ page: page, parent: _this6 }, function (pageElement) {
          if (oldContent) {
            _this6._pageLoader.unload(oldContent);
            oldContent = null;
          }

          setImmediate(function () {
            return _this6._show();
          });

          callback(pageElement);
          resolve(pageElement);
        });
      });
    }
  }, {
    key: '_show',
    value: function _show() {
      if (this._content) {
        this._content._show();
      }
    }
  }, {
    key: '_hide',
    value: function _hide() {
      if (this._content) {
        this._content._hide();
      }
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      if (this._content) {
        this._pageLoader.unload(this._content);
      }
      this.remove();
    }
  }, {
    key: 'side',
    get: function get$$1() {
      return this.getAttribute('side') === 'right' ? 'right' : 'left';
    }
  }, {
    key: '_width',
    get: function get$$1() {
      var width = this.getAttribute('width');
      return (/^\d+(px|%)$/.test(width) ? width : '80%'
      );
    },
    set: function set(value) {
      this.setAttribute('width', value);
    }
  }, {
    key: 'page',
    get: function get$$1() {
      return this._page;
    }

    /**
     * @param {*} page
     */
    ,
    set: function set(page) {
      this._page = page;
    }
  }, {
    key: '_content',
    get: function get$$1() {
      return this.children[0];
    }

    /**
     * @property pageLoader
     * @description
     *   [en][/en]
     *   [ja][/ja]
     */

  }, {
    key: 'pageLoader',
    get: function get$$1() {
      return this._pageLoader;
    },
    set: function set(loader) {
      if (!(loader instanceof PageLoader)) {
        throw Error('First parameter must be an instance of PageLoader.');
      }
      this._pageLoader = loader;
    }

    /**
     * @property mode
     * @readonly
     * @type {String}
     * @description
     *   [en]Current mode. Possible values are "split", "collapse", "closed", "open" or "changing".[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'mode',
    get: function get$$1() {
      return this._mode;
    }

    /**
     * @property isOpen
     * @type {Boolean}
     * @readonly
     * @description
     *   [en]This value is `true` when the menu is open..[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'isOpen',
    get: function get$$1() {
      return this._collapseMode.isOpen();
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return WATCHED_ATTRIBUTES;
    }
  }, {
    key: 'events',
    get: function get$$1() {
      return ['preopen', 'postopen', 'preclose', 'postclose', 'modechange'];
    }
  }, {
    key: 'rewritables',
    get: function get$$1() {
      return rewritables$2;
    }
  }]);
  return SplitterSideElement;
}(BaseElement);

customElements.define('ons-splitter-side', SplitterSideElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$28 = {
  '': 'switch--*',
  '.switch__input': 'switch--*__input',
  '.switch__handle': 'switch--*__handle',
  '.switch__toggle': 'switch--*__toggle'
};

var locations = {
  ios: [1, 21],
  material: [0, 16]
};

/**
 * @element ons-switch
 * @category form
 * @description
 *   [en]
 *     Switch component. The switch can be toggled both by dragging and tapping.
 *
 *     Will automatically displays a Material Design switch on Android devices.
 *   [/en]
 *   [ja]スイッチを表示するコンポーネントです。[/ja]
 * @modifier material
 *   [en]Material Design switch[/en]
 *   [ja][/ja]
 * @codepen LpXZQQ
 * @tutorial vanilla/Reference/switch
 * @guide adding-page-content
 *   [en]Using form components[/en]
 *   [ja]フォームを使う[/ja]
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @example
 * <ons-switch checked></ons-switch>
 * <ons-switch disabled></ons-switch>
 * <ons-switch modifier="material"></ons-switch>
 */

var SwitchElement = function (_BaseCheckboxElement) {
  inherits(SwitchElement, _BaseCheckboxElement);

  function SwitchElement() {
    classCallCheck(this, SwitchElement);

    var _this = possibleConstructorReturn(this, (SwitchElement.__proto__ || Object.getPrototypeOf(SwitchElement)).call(this));

    contentReady(_this, function () {
      _this.attributeChangedCallback('modifier', null, _this.getAttribute('modifier'));
    });

    _this._boundOnChange = _this._onChange.bind(_this);
    _this._boundOnRelease = _this._onRelease.bind(_this);
    return _this;
  }

  createClass(SwitchElement, [{
    key: '_getPosition',


    /* Own props */

    value: function _getPosition(e) {
      var l = this._locations;
      return Math.min(l[1], Math.max(l[0], this._startX + e.gesture.deltaX));
    }
  }, {
    key: '_emitChangeEvent',
    value: function _emitChangeEvent() {
      util.triggerElementEvent(this, 'change', {
        value: this.checked,
        switch: this,
        isInteractive: true
      });
    }
  }, {
    key: '_onChange',
    value: function _onChange(event) {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }

      this._emitChangeEvent();
    }
  }, {
    key: '_onClick',
    value: function _onClick(ev) {
      if (ev.target.classList.contains(this.defaultElementClass + '__touch')) {
        ev.preventDefault();
      }
    }
  }, {
    key: '_onHold',
    value: function _onHold(e) {
      if (!this.disabled) {
        ModifierUtil.addModifier(this, 'active');
        document.addEventListener('release', this._boundOnRelease);
      }
    }
  }, {
    key: '_onDragStart',
    value: function _onDragStart(e) {
      if (this.disabled || ['left', 'right'].indexOf(e.gesture.direction) === -1) {
        ModifierUtil.removeModifier(this, 'active');
        return;
      }

      e.consumed = true;

      ModifierUtil.addModifier(this, 'active');
      this._startX = this._locations[this.checked ? 1 : 0]; // - e.gesture.deltaX;

      this.addEventListener('drag', this._onDrag);
      document.addEventListener('release', this._boundOnRelease);
    }
  }, {
    key: '_onDrag',
    value: function _onDrag(e) {
      e.stopPropagation();
      e.gesture.preventDefault();
      this._handle.style.left = this._getPosition(e) + 'px';
    }
  }, {
    key: '_onRelease',
    value: function _onRelease(e) {
      var l = this._locations;
      var position = this._getPosition(e);
      var previousValue = this.checked;

      this.checked = position >= (l[0] + l[1]) / 2;

      if (this.checked !== previousValue) {
        this._emitChangeEvent();
      }

      this.removeEventListener('drag', this._onDrag);
      document.removeEventListener('release', this._boundOnRelease);

      this._handle.style.left = '';
      ModifierUtil.removeModifier(this, 'active');
    }
  }, {
    key: 'click',
    value: function click() {
      if (!this.disabled) {
        this.checked = !this.checked;
        this._emitChangeEvent();
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this2 = this;

      contentReady(this, function () {
        _this2._input.addEventListener('change', _this2._boundOnChange);
      });

      this.addEventListener('dragstart', this._onDragStart);
      this.addEventListener('hold', this._onHold);
      this.addEventListener('tap', this.click);
      this.addEventListener('click', this._onClick);
      this._gestureDetector = new GestureDetector(this, { dragMinDistance: 1, holdTimeout: 251 });
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      var _this3 = this;

      contentReady(this, function () {
        _this3._input.removeEventListener('change', _this3._boundOnChange);
      });

      this.removeEventListener('dragstart', this._onDragStart);
      this.removeEventListener('hold', this._onHold);
      this.removeEventListener('tap', this.click);
      this.removeEventListener('click', this._onClick);
      if (this._gestureDetector) {
        this._gestureDetector.dispose();
      }
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'modifier') {
        var md = (current || '').indexOf('material') !== -1;
        this._locations = locations[md ? 'material' : 'ios'];
      }

      get(SwitchElement.prototype.__proto__ || Object.getPrototypeOf(SwitchElement.prototype), 'attributeChangedCallback', this).call(this, name, last, current);
    }

    /**
     * @event change
     * @description
     *   [en]Fired when the switch is toggled.[/en]
     *   [ja]ON/OFFが変わった時に発火します。[/ja]
     * @param {Object} event
     *   [en]Event object.[/en]
     *   [ja]イベントオブジェクト。[/ja]
     * @param {Object} event.switch
     *   [en]Switch object.[/en]
     *   [ja]イベントが発火したSwitchオブジェクトを返します。[/ja]
     * @param {Boolean} event.value
     *   [en]Current value.[/en]
     *   [ja]現在の値を返します。[/ja]
     * @param {Boolean} event.isInteractive
     *   [en]True if the change was triggered by the user clicking on the switch.[/en]
     *   [ja]タップやクリックなどのユーザの操作によって変わった場合にはtrueを返します。[/ja]
     */

    /**
     * @attribute modifier
     * @type {String}
     * @description
     *  [en]The appearance of the switch.[/en]
     *  [ja]スイッチの表現を指定します。[/ja]
     */

    /**
     * @attribute disabled
     * @description
     *   [en]Whether the switch is be disabled.[/en]
     *   [ja]スイッチを無効の状態にする場合に指定します。[/ja]
     */

    /**
     * @attribute checked
     * @description
     *   [en]Whether the switch is checked.[/en]
     *   [ja]スイッチがONの状態にするときに指定します。[/ja]
     */

    /**
     * @attribute input-id
     * @type {String}
     * @description
     *   [en]Specify the `id` attribute of the inner `<input>` element. This is useful when using `<label for="...">` elements.[/en]
     *   [ja][/ja]
     */

    /**
     * @property checked
     * @type {Boolean}
     * @description
     *   [en]This value is `true` if the switch is checked.[/en]
     *   [ja]スイッチがONの場合に`true`。[/ja]
     */

    /**
     * @property value
     * @type {String}
     * @description
     *   [en]The current value of the input.[/en]
     *   [ja][/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

    /**
     * @property checkbox
     * @readonly
     * @type {HTMLElement}
     * @description
     *   [en]The underlying checkbox element.[/en]
     *   [ja]コンポーネント内部のcheckbox要素になります。[/ja]
     */

  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme$28;
    }
  }, {
    key: '_defaultElementClass',
    get: function get$$1() {
      return 'switch';
    }
  }, {
    key: '_template',
    get: function get$$1() {
      return '\n      <input type="' + this.type + '" class="' + this._defaultElementClass + '__input">\n      <div class="' + this._defaultElementClass + '__toggle">\n        <div class="' + this._defaultElementClass + '__handle">\n          <div class="' + this._defaultElementClass + '__touch"></div>\n        </div>\n      </div>\n    ';
    }
  }, {
    key: 'type',
    get: function get$$1() {
      return 'checkbox';
    }
  }, {
    key: '_handle',
    get: function get$$1() {
      return this.querySelector('.' + this._defaultElementClass + '__handle');
    }
  }, {
    key: 'checkbox',
    get: function get$$1() {
      return this._input;
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return [].concat(toConsumableArray(get(SwitchElement.__proto__ || Object.getPrototypeOf(SwitchElement), 'observedAttributes', this)), ['modifier']);
    }
  }]);
  return SwitchElement;
}(BaseCheckboxElement);

customElements.define('ons-switch', SwitchElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
var TabbarAnimator = function (_BaseAnimator) {
  inherits(TabbarAnimator, _BaseAnimator);

  /**
   * @param {Object} options
   * @param {String} options.timing
   * @param {Number} options.duration
   * @param {Number} options.delay
   */
  function TabbarAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.4 : _ref$duration,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay;

    classCallCheck(this, TabbarAnimator);
    return possibleConstructorReturn(this, (TabbarAnimator.__proto__ || Object.getPrototypeOf(TabbarAnimator)).call(this, { timing: timing, duration: duration, delay: delay }));
  }

  /**
   * @param {Element} enterPage ons-page element
   * @param {Element} leavePage ons-page element
   * @param {Number} enterPageIndex
   * @param {Number} leavePageIndex
   * @param {Function} done
   */


  createClass(TabbarAnimator, [{
    key: 'apply',
    value: function apply(enterPage, leavePage, enterPageIndex, leavePageIndex, done) {
      throw new Error('This method must be implemented.');
    }
  }]);
  return TabbarAnimator;
}(BaseAnimator);

var TabbarNoneAnimator = function (_TabbarAnimator) {
  inherits(TabbarNoneAnimator, _TabbarAnimator);

  function TabbarNoneAnimator() {
    classCallCheck(this, TabbarNoneAnimator);
    return possibleConstructorReturn(this, (TabbarNoneAnimator.__proto__ || Object.getPrototypeOf(TabbarNoneAnimator)).apply(this, arguments));
  }

  createClass(TabbarNoneAnimator, [{
    key: 'apply',
    value: function apply(enterPage, leavePage, enterIndex, leaveIndex, done) {
      setTimeout(done, 1000 / 60);
    }
  }]);
  return TabbarNoneAnimator;
}(TabbarAnimator);

var TabbarFadeAnimator = function (_TabbarAnimator2) {
  inherits(TabbarFadeAnimator, _TabbarAnimator2);

  function TabbarFadeAnimator() {
    classCallCheck(this, TabbarFadeAnimator);
    return possibleConstructorReturn(this, (TabbarFadeAnimator.__proto__ || Object.getPrototypeOf(TabbarFadeAnimator)).apply(this, arguments));
  }

  createClass(TabbarFadeAnimator, [{
    key: 'apply',
    value: function apply(enterPage, leavePage, enterPageIndex, leavePageIndex, done) {
      Animit.runAll(Animit(enterPage).saveStyle().queue({
        transform: 'translate3D(0, 0, 0)',
        opacity: 0
      }).wait(this.delay).queue({
        transform: 'translate3D(0, 0, 0)',
        opacity: 1
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (callback) {
        done();
        callback();
      }), Animit(leavePage).queue({
        transform: 'translate3D(0, 0, 0)',
        opacity: 1
      }).wait(this.delay).queue({
        transform: 'translate3D(0, 0, 0)',
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }));
    }
  }]);
  return TabbarFadeAnimator;
}(TabbarAnimator);

var TabbarSlideAnimator = function (_TabbarAnimator3) {
  inherits(TabbarSlideAnimator, _TabbarAnimator3);

  function TabbarSlideAnimator() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$timing = _ref2.timing,
        timing = _ref2$timing === undefined ? 'ease-in' : _ref2$timing,
        _ref2$duration = _ref2.duration,
        duration = _ref2$duration === undefined ? 0.15 : _ref2$duration,
        _ref2$delay = _ref2.delay,
        delay = _ref2$delay === undefined ? 0 : _ref2$delay;

    classCallCheck(this, TabbarSlideAnimator);
    return possibleConstructorReturn(this, (TabbarSlideAnimator.__proto__ || Object.getPrototypeOf(TabbarSlideAnimator)).call(this, { timing: timing, duration: duration, delay: delay }));
  }

  /**
   * @param {jqLite} enterPage
   * @param {jqLite} leavePage
   */


  createClass(TabbarSlideAnimator, [{
    key: 'apply',
    value: function apply(enterPage, leavePage, enterIndex, leaveIndex, done) {
      var sgn = enterIndex > leaveIndex;

      Animit.runAll(Animit(enterPage).saveStyle().queue({
        transform: 'translate3D(' + (sgn ? '' : '-') + '100%, 0, 0)'
      }).wait(this.delay).queue({
        transform: 'translate3D(0, 0, 0)'
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (callback) {
        done();
        callback();
      }), Animit(leavePage).queue({
        transform: 'translate3D(0, 0, 0)'
      }).wait(this.delay).queue({
        transform: 'translate3D(' + (sgn ? '-' : '') + '100%, 0, 0)'
      }, {
        duration: this.duration,
        timing: this.timing
      }));
    }
  }]);
  return TabbarSlideAnimator;
}(TabbarAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$30 = {
  '.tabbar__content': 'tabbar--*__content',
  '.tabbar': 'tabbar--*'
};

var _animatorDict$7 = {
  'default': TabbarNoneAnimator,
  'fade': TabbarFadeAnimator,
  'slide': TabbarSlideAnimator,
  'none': TabbarNoneAnimator
};

var rewritables$3 = {
  /**
   * @param {Element} tabbarElement
   * @param {Function} callback
   */
  ready: function ready(tabbarElement, callback) {
    callback();
  }
};

var generateId$1 = function () {
  var i = 0;
  return function () {
    return 'ons-tabbar-gen-' + i++;
  };
}();

/**
 * @element ons-tabbar
 * @category tabbar
 * @description
 *   [en]A component to display a tab bar on the bottom of a page. Used with `<ons-tab>` to manage pages using tabs.[/en]
 *   [ja]タブバーをページ下部に表示するためのコンポーネントです。ons-tabと組み合わせて使うことで、ページを管理できます。[/ja]
 * @codepen pGuDL
 * @tutorial vanilla/Reference/tabbar
 * @guide multiple-page-navigation
 *  [en]Managing multiple pages.[/en]
 *  [ja]Managing multiple pages[/ja]
 * @guide templates
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @seealso ons-tab
 *   [en]The `<ons-tab>` component.[/en]
 *   [ja]ons-tabコンポーネント[/ja]
 * @seealso ons-page
 *   [en]The `<ons-page>` component.[/en]
 *   [ja]ons-pageコンポーネント[/ja]
 * @example
 * <ons-tabbar>
 *   <ons-tab
 *     page="home.html"
 *     label="Home"
 *     active>
 *   </ons-tab>
 *   <ons-tab
 *     page="settings.html"
 *     label="Settings"
 *     active>
 *   </ons-tab>
 * </ons-tabbar>
 *
 * <ons-template id="home.html">
 *   ...
 * </ons-template>
 *
 * <ons-template id="settings.html">
 *   ...
 * </ons-template>
 */

var TabbarElement = function (_BaseElement) {
  inherits(TabbarElement, _BaseElement);

  /**
   * @event prechange
   * @description
   *   [en]Fires just before the tab is changed.[/en]
   *   [ja]アクティブなタブが変わる前に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクト。[/ja]
   * @param {Number} event.index
   *   [en]Current index.[/en]
   *   [ja]現在アクティブになっているons-tabのインデックスを返します。[/ja]
   * @param {Object} event.tabItem
   *   [en]Tab item object.[/en]
   *   [ja]tabItemオブジェクト。[/ja]
   * @param {Function} event.cancel
   *   [en]Call this function to cancel the change event.[/en]
   *   [ja]この関数を呼び出すと、アクティブなタブの変更がキャンセルされます。[/ja]
   */

  /**
   * @event postchange
   * @description
   *   [en]Fires just after the tab is changed.[/en]
   *   [ja]アクティブなタブが変わった後に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクト。[/ja]
   * @param {Number} event.index
   *   [en]Current index.[/en]
   *   [ja]現在アクティブになっているons-tabのインデックスを返します。[/ja]
   * @param {Object} event.tabItem
   *   [en]Tab item object.[/en]
   *   [ja]tabItemオブジェクト。[/ja]
   */

  /**
   * @event reactive
   * @description
   *   [en]Fires if the already open tab is tapped again.[/en]
   *   [ja]すでにアクティブになっているタブがもう一度タップやクリックされた場合に発火します。[/ja]
   * @param {Object} event
   *   [en]Event object.[/en]
   *   [ja]イベントオブジェクト。[/ja]
   * @param {Number} event.index
   *   [en]Current index.[/en]
   *   [ja]現在アクティブになっているons-tabのインデックスを返します。[/ja]
   * @param {Object} event.tabItem
   *   [en]Tab item object.[/en]
   *   [ja]tabItemオブジェクト。[/ja]
   */

  /**
   * @attribute animation
   * @type {String}
   * @default none
   * @description
   *   [en]Animation name. Available values are `"none"`, `"slide"` and `"fade"`. Default is `"none"`.[/en]
   *   [ja]ページ読み込み時のアニメーションを指定します。"none"、"fade"、"slide"のいずれかを選択できます。デフォルトは"none"です。[/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. {duration: 0.2, delay: 1, timing: 'ease-in'}[/ja]
   */

  /**
   * @attribute position
   * @initonly
   * @type {String}
   * @default bottom
   * @description
   *   [en]Tabbar's position. Available values are `"bottom"` and `"top"`. Use `"auto"` to choose position depending on platform (iOS bottom, Android top).[/en]
   *   [ja]タブバーの位置を指定します。"bottom"もしくは"top"を選択できます。デフォルトは"bottom"です。[/ja]
   */

  function TabbarElement() {
    classCallCheck(this, TabbarElement);

    var _this = possibleConstructorReturn(this, (TabbarElement.__proto__ || Object.getPrototypeOf(TabbarElement)).call(this));

    _this._tabbarId = generateId$1();

    contentReady(_this, function () {
      _this._compile();

      var content = _this._contentElement;
      for (var i = 0; i < content.children.length; i++) {
        content.children[i].style.display = 'none';
      }

      var activeIndex = _this.getAttribute('activeIndex');

      var tabbar = _this._tabbarElement;
      if (activeIndex && tabbar.children.length > activeIndex) {
        tabbar.children[activeIndex].setAttribute('active', 'true');
      }

      autoStyle.prepare(_this);
      ModifierUtil.initModifier(_this, scheme$30);

      _this._animatorFactory = new AnimatorFactory({
        animators: _animatorDict$7,
        baseClass: TabbarAnimator,
        baseClassName: 'TabbarAnimator',
        defaultAnimation: _this.getAttribute('animation')
      });
    });
    return _this;
  }

  createClass(TabbarElement, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this2 = this;

      contentReady(this, function () {
        return _this2._updatePosition();
      });
    }
  }, {
    key: '_compile',
    value: function _compile() {
      if (this._contentElement && this._tabbarElement) {
        var content = util.findChild(this, '.tabbar__content');
        var bar = util.findChild(this, '.tabbar');

        content.classList.add('ons-tabbar__content');
        bar.classList.add('ons-tabbar__footer');
      } else {

        var _content = util.create('.ons-tabbar__content.tabbar__content');
        var tabbar = util.create('.tabbar.ons-tabbar__footer');

        while (this.firstChild) {
          tabbar.appendChild(this.firstChild);
        }

        this.appendChild(_content);
        this.appendChild(tabbar);
      }
    }
  }, {
    key: '_updatePosition',
    value: function _updatePosition() {
      var _this3 = this;

      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getAttribute('position');

      var top = this._top = position === 'top' || position === 'auto' && platform$1.isAndroid();
      var action = top ? util.addModifier : util.removeModifier;

      action(this, 'top');

      var page = util.findParent(this, 'ons-page');
      if (page) {
        contentReady(page, function () {
          _this3.style.top = top ? window.getComputedStyle(page._getContentElement(), null).getPropertyValue('padding-top') : '';

          if (page.children[0] && util.match(page.children[0], 'ons-toolbar')) {
            action(page.children[0], 'noshadow');
          }
        });
      }

      internal$1.autoStatusBarFill(function () {
        var filled = util.findParent(_this3, function (e) {
          return e.hasAttribute('status-bar-fill');
        });
        util.toggleAttribute(_this3, 'status-bar-fill', top && !filled);
      });
    }
  }, {
    key: '_getTabbarElement',
    value: function _getTabbarElement() {
      return util.findChild(this, '.tabbar');
    }

    /**
     * @return {String}
     */

  }, {
    key: 'getTabbarId',
    value: function getTabbarId() {
      return this._tabbarId;
    }

    /**
     * @return {Element/null}
     */

  }, {
    key: '_getCurrentPageElement',
    value: function _getCurrentPageElement() {
      var pages = this._contentElement.children;
      var page = null;
      for (var i = 0; i < pages.length; i++) {
        if (pages[i].style.display !== 'none') {
          page = pages[i];
          break;
        }
      }

      if (page && page.nodeName.toLowerCase() !== 'ons-page') {
        throw new Error('Invalid state: page element must be a "ons-page" element.');
      }

      return page;
    }
  }, {
    key: '_switchPage',


    /**
     * @param {Element} element
     * @param {Object} options
     * @param {String} [options.animation]
     * @param {Function} [options.callback]
     * @param {Object} [options.animationOptions]
     * @param {Number} options.selectedTabIndex
     * @param {Number} options.previousTabIndex
     * @return {Promise} Resolves to the new page element.
     */
    value: function _switchPage(element, options) {
      var oldPageElement = this._oldPageElement || internal$1.nullElement;
      this._oldPageElement = element;
      var animator = this._animatorFactory.newAnimator(options);

      return new Promise(function (resolve) {
        if (oldPageElement !== internal$1.nullElement) {
          oldPageElement._hide();
        }

        animator.apply(element, oldPageElement, options.selectedTabIndex, options.previousTabIndex, function () {
          if (oldPageElement !== internal$1.nullElement) {
            oldPageElement.style.display = 'none';
          }

          element.style.display = 'block';
          element._show();

          if (options.callback instanceof Function) {
            options.callback();
          }

          resolve(element);
        });
      });
    }

    /**
     * @method setActiveTab
     * @signature setActiveTab(index, [options])
     * @param {Number} index
     *   [en]Tab index.[/en]
     *   [ja]タブのインデックスを指定します。[/ja]
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {Boolean} [options.keepPage]
     *   [en]If true the page will not be changed.[/en]
     *   [ja]タブバーが現在表示しているpageを変えない場合にはtrueを指定します。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"fade"`, `"slide"` and `"none"`.[/en]
     *   [ja]アニメーション名を指定します。`"fade"`、`"slide"`、`"none"`のいずれかを指定できます。[/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @description
     *   [en]Show specified tab page. Animations and other options can be specified by the second parameter.[/en]
     *   [ja]指定したインデックスのタブを表示します。アニメーションなどのオプションを指定できます。[/ja]
     * @return {Promise}
     *   [en]Resolves to the new page element.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'setActiveTab',
    value: function setActiveTab(index) {
      var _this4 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) != 'object') {
        throw new Error('options must be an object. You supplied ' + options);
      }

      options.animationOptions = util.extend(options.animationOptions || {}, AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

      if (!options.animation && this.hasAttribute('animation')) {
        options.animation = this.getAttribute('animation');
      }

      var previousTab = this._getActiveTabElement(),
          selectedTab = this._getTabElement(index),
          previousTabIndex = this.getActiveTabIndex(),
          selectedTabIndex = index,
          previousPageElement = this._getCurrentPageElement();

      if (!selectedTab) {
        return Promise.reject('Specified index does not match any tab.');
      }

      if (selectedTabIndex === previousTabIndex) {
        util.triggerElementEvent(this, 'reactive', {
          index: selectedTabIndex,
          tabItem: selectedTab
        });

        return Promise.resolve(previousPageElement);
      }

      var canceled = false;

      util.triggerElementEvent(this, 'prechange', {
        index: selectedTabIndex,
        tabItem: selectedTab,
        cancel: function cancel() {
          return canceled = true;
        }
      });

      if (canceled) {
        selectedTab.setInactive();
        if (previousTab) {
          previousTab.setActive();
        }
        return Promise.reject('Canceled in prechange event.');
      }

      selectedTab.setActive();

      var params = _extends({}, options, {
        previousTabIndex: previousTabIndex,
        selectedTabIndex: selectedTabIndex
      });

      if (previousTab) {
        previousTab.setInactive();
      } else {
        params.animation = 'none';
      }

      return new Promise(function (resolve) {
        selectedTab._loadPageElement(_this4._contentElement, function (pageElement) {
          pageElement.removeAttribute('style');

          _this4._switchPage(pageElement, params).then(function (page) {
            util.triggerElementEvent(_this4, 'postchange', {
              index: selectedTabIndex,
              tabItem: selectedTab
            });

            return resolve(page);
          });
        });
      });
    }

    /**
     * @method setTabbarVisibility
     * @signature setTabbarVisibility(visible)
     * @param {Boolean} visible
     * @description
     *   [en]Used to hide or show the tab bar.[/en]
     *   [ja][/ja]
     */

  }, {
    key: 'setTabbarVisibility',
    value: function setTabbarVisibility(visible) {
      this._contentElement.style[this._top ? 'top' : 'bottom'] = visible ? '' : '0px';
      this._getTabbarElement().style.display = visible ? '' : 'none';
    }
  }, {
    key: 'show',
    value: function show() {
      this.setTabbarVisibility(true);
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.setTabbarVisibility(false);
    }

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the tabbar is visible or not.[/en]
     *   [ja]タブバーが見える場合に`true`。[/ja]
     */

  }, {
    key: 'getActiveTabIndex',


    /**
     * @method getActiveTabIndex
     * @signature getActiveTabIndex()
     * @return {Number}
     *   [en]The index of the currently active tab.[/en]
     *   [ja]現在アクティブになっているタブのインデックスを返します。[/ja]
     * @description
     *   [en]Returns tab index on current active tab. If active tab is not found, returns -1.[/en]
     *   [ja]現在アクティブになっているタブのインデックスを返します。現在アクティブなタブがない場合には-1を返します。[/ja]
     */
    value: function getActiveTabIndex() {
      var tabs = this._getTabbarElement().children;

      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i] instanceof TabElement && tabs[i].isActive && tabs[i].isActive()) {
          return i;
        }
      }

      return -1;
    }

    /**
     * @return {Number} When active tab is not found, returns -1.
     */

  }, {
    key: '_getActiveTabElement',
    value: function _getActiveTabElement() {
      return this._getTabElement(this.getActiveTabIndex());
    }

    /**
     * @return {Element}
     */

  }, {
    key: '_getTabElement',
    value: function _getTabElement(index) {
      return this._getTabbarElement().children[index];
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {}
  }, {
    key: '_show',
    value: function _show() {
      var currentPageElement = this._getCurrentPageElement();
      if (currentPageElement) {
        currentPageElement._show();
      }
    }
  }, {
    key: '_hide',
    value: function _hide() {
      var currentPageElement = this._getCurrentPageElement();
      if (currentPageElement) {
        currentPageElement._hide();
      }
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      var tabs = this._getTabbarElement().children;
      for (var i = tabs.length - 1; i >= 0; i--) {
        tabs[i].remove();
      }
      this.remove();
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'modifier') {
        return ModifierUtil.onModifierChanged(last, current, this, scheme$30);
      }
    }
  }, {
    key: '_contentElement',
    get: function get$$1() {
      return util.findChild(this, '.tabbar__content');
    }
  }, {
    key: '_tabbarElement',
    get: function get$$1() {
      return util.findChild(this, '.tabbar');
    }
  }, {
    key: 'topPage',
    get: function get$$1() {
      return this._getCurrentPageElement();
    }
  }, {
    key: 'pages',
    get: function get$$1() {
      return util.arrayFrom(this._contentElement.children);
    }
  }, {
    key: 'visible',
    get: function get$$1() {
      return this._getTabbarElement().style.display !== 'none';
    }
  }], [{
    key: 'registerAnimator',


    /**
     * @param {String} name
     * @param {Function} Animator
     */
    value: function registerAnimator(name, Animator) {
      if (!(Animator.prototype instanceof TabbarAnimator)) {
        throw new Error('"Animator" param must inherit TabbarElement.TabbarAnimator');
      }
      _animatorDict$7[name] = Animator;
    }
  }, {
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier'];
    }
  }, {
    key: 'rewritables',
    get: function get$$1() {
      return rewritables$3;
    }
  }, {
    key: 'TabbarAnimator',
    get: function get$$1() {
      return TabbarAnimator;
    }
  }, {
    key: 'events',
    get: function get$$1() {
      return ['prechange', 'postchange', 'reactive'];
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict$7;
    }
  }]);
  return TabbarElement;
}(BaseElement);

customElements.define('ons-tabbar', TabbarElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$17 = 'tabbar__item';

var scheme$29 = {
  '': 'tabbar--*__item',
  '.tabbar__button': 'tabbar--*__button'
};

var templateSource$1 = util.createElement('\n  <div>\n    <input type="radio" style="display: none">\n    <button class="tabbar__button"></button>\n  </div>\n');

var defaultInnerTemplateSource = util.createElement('\n  <div>\n    <div class="tabbar__icon">\n      <ons-icon icon="ion-cloud"></ons-icon>\n    </div>\n    <div class="tabbar__label">label</div>\n    <div class="tabbar__badge notification">1</div>\n  </div>\n');

/**
 * @element ons-tab
 * @category tabbar
 * @description
 *   [en]Represents a tab inside tab bar. Each `<ons-tab>` represents a page.[/en]
 *   [ja]
 *     タブバーに配置される各アイテムのコンポーネントです。それぞれのons-tabはページを表します。
 *     ons-tab要素の中には、タブに表示されるコンテンツを直接記述することが出来ます。
 *   [/ja]
 * @codepen pGuDL
 * @tutorial vanilla/Reference/tabbar
 * @guide multiple-page-navigation
 *   [en]Managing multiple pages.[/en]
 *   [ja]Managing multiple pages[/ja]]
 * @guide templates
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @seealso ons-tabbar
 *   [en]ons-tabbar component[/en]
 *   [ja]ons-tabbarコンポーネント[/ja]
 * @seealso ons-page
 *   [en]ons-page component[/en]
 *   [ja]ons-pageコンポーネント[/ja]
 * @seealso ons-icon
 *   [en]ons-icon component[/en]
 *   [ja]ons-iconコンポーネント[/ja]
 * @example
 * <ons-tabbar>
 *   <ons-tab
 *     page="home.html"
 *     label="Home"
 *     active>
 *   </ons-tab>
 *   <ons-tab
 *     page="settings.html"
 *     label="Settings"
 *     active>
 *   </ons-tab>
 * </ons-tabbar>
 *
 * <ons-template id="home.html">
 *   ...
 * </ons-template>
 *
 * <ons-template id="settings.html">
 *   ...
 * </ons-template>

 */

var TabElement = function (_BaseElement) {
  inherits(TabElement, _BaseElement);

  /**
   * @attribute page
   * @initonly
   * @type {String}
   * @description
   *   [en]The page that is displayed when the tab is tapped.[/en]
   *   [ja]ons-tabが参照するページへのURLを指定します。[/ja]
   */

  /**
   * @attribute icon
   * @type {String}
   * @description
   *   [en]
   *     The icon name for the tab. Can specify the same icon name as `<ons-icon>`.
   *   [/en]
   *   [ja]
   *     アイコン名を指定します。ons-iconと同じアイコン名を指定できます。
   *     個別にアイコンをカスタマイズする場合は、background-imageなどのCSSスタイルを用いて指定できます。
   *   [/ja]
   */

  /**
   * @attribute active-icon
   * @type {String}
   * @description
   *   [en]The name of the icon when the tab is active.[/en]
   *   [ja]アクティブの際のアイコン名を指定します。[/ja]
   */

  /**
   * @attribute label
   * @type {String}
   * @description
   *   [en]The label of the tab item.[/en]
   *   [ja]アイコン下に表示されるラベルを指定します。[/ja]
   */

  /**
   * @attribute badge
   * @type {String}
   * @description
   *   [en]Display a notification badge on top of the tab.[/en]
   *   [ja]バッジに表示する内容を指定します。[/ja]
   */

  /**
   * @attribute active
   * @description
   *   [en]This attribute should be set to the tab that is active by default.[/en]
   *   [ja][/ja]
   */

  function TabElement() {
    classCallCheck(this, TabElement);

    var _this = possibleConstructorReturn(this, (TabElement.__proto__ || Object.getPrototypeOf(TabElement)).call(this));

    _this._pageLoader = defaultPageLoader;
    _this._page = null;

    if (_this.hasAttribute('label') || _this.hasAttribute('icon') || _this.hasAttribute('badge')) {
      _this._compile();
    } else {
      contentReady(_this, function () {
        _this._compile();
      });
    }

    _this._boundOnClick = _this._onClick.bind(_this);
    return _this;
  }

  createClass(TabElement, [{
    key: '_getPageTarget',
    value: function _getPageTarget() {
      return this.page || this.getAttribute('page');
    }
  }, {
    key: '_templateLoaded',
    value: function _templateLoaded() {
      if (this.children.length == 0) {
        return false;
      }

      var hasInput = this._input.getAttribute('type') === 'radio';
      var hasButton = this._button;

      return !!(hasInput && hasButton);
    }
  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.classList.add(defaultClassName$17);

      if (!this._templateLoaded()) {
        var fragment = document.createDocumentFragment();
        var hasChildren = false;

        while (this.childNodes[0]) {
          var node = this.childNodes[0];
          this.removeChild(node);
          fragment.appendChild(node);

          if (node.nodeType == Node.ELEMENT_NODE) {
            hasChildren = true;
          }
        }

        var template = templateSource$1.cloneNode(true);
        while (template.children[0]) {
          this.appendChild(template.children[0]);
        }

        if (hasChildren) {
          this._button.appendChild(fragment);
          this._hasDefaultTemplate = false;
        } else {
          this._hasDefaultTemplate = true;
          this._updateDefaultTemplate();
        }
      }

      ModifierUtil.initModifier(this, scheme$29);
      this._updateRipple();
    }
  }, {
    key: '_updateRipple',
    value: function _updateRipple() {
      util.updateRipple(this.querySelector('.tabbar__button'), this.hasAttribute('ripple'));
    }
  }, {
    key: '_updateDefaultTemplate',
    value: function _updateDefaultTemplate() {
      if (!this._hasDefaultTemplate) {
        return;
      }

      var button = this._button;
      var template = defaultInnerTemplateSource.cloneNode(true);
      if (button.children.length === 0) {
        while (template.children[0]) {
          button.appendChild(template.children[0]);
        }
      }

      if (!button.querySelector('.tabbar__icon')) {
        button.insertBefore(template.querySelector('.tabbar__icon'), button.firstChild);
      }

      if (!button.querySelector('.tabbar__label')) {
        button.appendChild(template.querySelector('.tabbar__label'));
      }

      if (!button.querySelector('.tabbar__badge')) {
        button.appendChild(template.querySelector('.tabbar__badge'));
      }

      var icon = this.getAttribute('icon');
      var label = this.getAttribute('label');
      var badge = this.getAttribute('badge');

      var iconElement = button.querySelector('.tabbar__icon').children[0];
      var labelElement = button.querySelector('.tabbar__label');
      var badgeElement = button.querySelector('.tabbar__badge');

      if (iconElement) {
        if (typeof icon === 'string') {
          var last = iconElement.getAttribute('icon');
          iconElement.setAttribute('icon', icon);
          // dirty fix for https://github.com/OnsenUI/OnsenUI/issues/1654
          iconElement.attributeChangedCallback('icon', last, icon);
        } else {
          iconElement.parentElement.remove();
        }
      }

      if (labelElement) {
        if (typeof label === 'string') {
          labelElement.textContent = label;
        } else {
          labelElement.remove();
        }
      }

      if (badgeElement) {
        if (typeof badge === 'string') {
          badgeElement.textContent = badge;
        } else {
          badgeElement.remove();
        }
      }
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      if (this.onClick instanceof Function) {
        this.onClick();
      } else {
        var tabbar = this._findTabbarElement();
        if (tabbar) {
          tabbar.setActiveTab(this._findTabIndex());
        }
      }
    }
  }, {
    key: 'setActive',
    value: function setActive() {
      this._input.checked = true;
      this.classList.add('active');
      this.setAttribute('active', '');

      if (this.hasAttribute('icon') && this.hasAttribute('active-icon')) {
        var icon = this.getAttribute('active-icon');
        var iconElement = this._button.querySelector('.tabbar__icon').children[0];
        iconElement.setAttribute('icon', icon);
      }

      util.arrayFrom(this.querySelectorAll('[ons-tab-inactive], ons-tab-inactive')).forEach(function (element) {
        return element.style.display = 'none';
      });
      util.arrayFrom(this.querySelectorAll('[ons-tab-active], ons-tab-active')).forEach(function (element) {
        return element.style.display = 'inherit';
      });
    }
  }, {
    key: 'setInactive',
    value: function setInactive() {
      this._input.checked = false;
      this.classList.remove('active');
      this.removeAttribute('active');

      if (this.hasAttribute('icon')) {
        var icon = this.getAttribute('icon');
        var iconElement = this._button.querySelector('.tabbar__icon').children[0];
        iconElement.setAttribute('icon', icon);
      }

      util.arrayFrom(this.querySelectorAll('[ons-tab-inactive], ons-tab-inactive')).forEach(function (element) {
        return element.style.display = 'inherit';
      });
      util.arrayFrom(this.querySelectorAll('[ons-tab-active], ons-tab-active')).forEach(function (element) {
        return element.style.display = 'none';
      });
    }

    /**
     * @param {Element} parent
     * @param {Function} callback
     */

  }, {
    key: '_loadPageElement',
    value: function _loadPageElement(parent, callback) {
      var _this2 = this;

      if (!this._loadedPage && !this._getPageTarget()) {
        var pages = this._findTabbarElement().pages;
        var index = this._findTabIndex();
        if (!pages[index]) {
          throw Error('Page was not provided to <ons-tab> index ' + index);
        }
        callback(pages[index]);
      } else if (this._loadingPage) {
        this._loadingPage.then(function (pageElement) {
          callback(pageElement);
        });
      } else if (!this._loadedPage) {
        var deferred = util.defer();
        this._loadingPage = deferred.promise;

        this._pageLoader.load({ page: this._getPageTarget(), parent: parent }, function (pageElement) {
          _this2._loadedPage = pageElement;
          deferred.resolve(pageElement);
          delete _this2._loadingPage;

          callback(pageElement);
        });
      } else {
        callback(this._loadedPage);
      }
    }
  }, {
    key: 'isActive',


    /**
     * @return {Boolean}
     */
    value: function isActive() {
      return this.classList.contains('active');
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this.removeEventListener('click', this._boundOnClick, false);
      if (this._loadedPage) {
        this._pageLoader.unload(this._loadedPage);
        this._loadedPage = null;
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      var _this3 = this;

      contentReady(this, function () {
        _this3._ensureElementPosition();

        var tabbar = _this3._findTabbarElement();

        if (tabbar.hasAttribute('modifier')) {
          var prefix = _this3.hasAttribute('modifier') ? _this3.getAttribute('modifier') + ' ' : '';
          _this3.setAttribute('modifier', prefix + tabbar.getAttribute('modifier'));
        }

        var onReady = function onReady() {
          if (_this3._getPageTarget() && !_this3.hasLoaded) {
            _this3.hasLoaded = true;
            _this3._loadPageElement(tabbar._contentElement, function (pageElement) {
              pageElement.style.display = 'none';
              tabbar._contentElement.appendChild(pageElement);
            });
          }

          if (_this3.hasAttribute('active')) {
            tabbar.setActiveTab(_this3._findTabIndex());
          }
        };

        TabbarElement.rewritables.ready(tabbar, onReady);

        _this3.addEventListener('click', _this3._boundOnClick, false);
      });
    }
  }, {
    key: '_findTabbarElement',
    value: function _findTabbarElement() {
      return util.findParent(this, 'ons-tabbar');
    }
  }, {
    key: '_findTabIndex',
    value: function _findTabIndex() {
      var elements = this.parentNode.children;
      for (var i = 0; i < elements.length; i++) {
        if (this === elements[i]) {
          return i;
        }
      }
    }
  }, {
    key: '_ensureElementPosition',
    value: function _ensureElementPosition() {
      if (!this._findTabbarElement()) {
        throw new Error('This ons-tab element is must be child of ons-tabbar element.');
      }
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      var _this4 = this;

      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$17)) {
            this.className = defaultClassName$17 + ' ' + current;
          }
          break;
        case 'modifier':
          contentReady(this, function () {
            return ModifierUtil.onModifierChanged(last, current, _this4, scheme$29);
          });
          break;
        case 'ripple':
          this._templateLoaded() && contentReady(this, function () {
            return _this4._updateRipple();
          });
          break;
        case 'icon':
        case 'label':
        case 'badge':
          contentReady(this, function () {
            return _this4._updateDefaultTemplate();
          });
          break;
        case 'page':
          if (typeof current === 'string') {
            this._page = current;
          }
          break;
      }
    }
  }, {
    key: 'page',
    set: function set(page) {
      this._page = page;
    },
    get: function get$$1() {
      return this._page;
    }
  }, {
    key: 'pageLoader',
    set: function set(loader) {
      if (!(loader instanceof PageLoader)) {
        throw Error('First parameter must be an instance of PageLoader.');
      }
      this._pageLoader = loader;
    },
    get: function get$$1() {
      return this._pageLoader;
    }
  }, {
    key: '_input',
    get: function get$$1() {
      return this.children[0];
    }
  }, {
    key: '_button',
    get: function get$$1() {
      return util.findChild(this, '.tabbar__button');
    }
  }, {
    key: 'pageElement',
    get: function get$$1() {
      if (this._loadedPage) {
        return this._loadedPage;
      }

      var tabbar = this._findTabbarElement();
      var index = this._findTabIndex();

      return tabbar._contentElement.children[index];
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'ripple', 'icon', 'label', 'page', 'badge', 'class'];
    }
  }]);
  return TabElement;
}(BaseElement);

customElements.define('ons-tab', TabElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var ToastAnimator = function (_BaseAnimator) {
  inherits(ToastAnimator, _BaseAnimator);

  /**
   * @param {Object} options
   * @param {String} options.timing
   * @param {Number} options.duration
   * @param {Number} options.delay
   */
  function ToastAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.2 : _ref$duration;

    classCallCheck(this, ToastAnimator);
    return possibleConstructorReturn(this, (ToastAnimator.__proto__ || Object.getPrototypeOf(ToastAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} modal
   * @param {Function} callback
   */


  createClass(ToastAnimator, [{
    key: 'show',
    value: function show(modal, callback) {
      callback();
    }

    /**
     * @param {HTMLElement} modal
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(modal, callback) {
      callback();
    }
  }]);
  return ToastAnimator;
}(BaseAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * iOS style animator for dialog.
 */

var FadeToastAnimator = function (_ToastAnimator) {
  inherits(FadeToastAnimator, _ToastAnimator);

  function FadeToastAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'linear' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.3 : _ref$duration;

    classCallCheck(this, FadeToastAnimator);
    return possibleConstructorReturn(this, (FadeToastAnimator.__proto__ || Object.getPrototypeOf(FadeToastAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} toast
   * @param {Function} callback
   */


  createClass(FadeToastAnimator, [{
    key: 'show',
    value: function show(toast, callback) {
      callback = callback ? callback : function () {};

      Animit(toast).saveStyle().queue({
        opacity: 0
      }).wait(this.delay).queue({
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }).play();
    }

    /**
     * @param {HTMLElement} toast
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(toast, callback) {
      callback = callback ? callback : function () {};

      Animit(toast).saveStyle().queue({
        opacity: 1
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback();
        done();
      }).play();
    }
  }]);
  return FadeToastAnimator;
}(ToastAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Ascend Toast Animator.
 */

var AscendToastAnimator = function (_ToastAnimator) {
  inherits(AscendToastAnimator, _ToastAnimator);

  function AscendToastAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'ease' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.25 : _ref$duration;

    classCallCheck(this, AscendToastAnimator);

    var _this = possibleConstructorReturn(this, (AscendToastAnimator.__proto__ || Object.getPrototypeOf(AscendToastAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this.messageDelay = _this.duration * 0.4 + _this.delay; // Delay message opacity change
    _this.ascension = platform$1.isAndroid() ? 48 : 64; // Toasts are always 1 line
    return _this;
  }

  /**
   * @param {HTMLElement} toast
   * @param {Function} callback
   */


  createClass(AscendToastAnimator, [{
    key: 'show',
    value: function show(toast, callback) {
      toast = toast._toast;
      util.globals.fabOffset = this.ascension;

      Animit.runAll(Animit(toast).saveStyle().queue({
        transform: 'translate3d(0, ' + this.ascension + 'px, 0)'
      }).wait(this.delay).queue({
        transform: 'translate3d(0, 0, 0)'
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }), Animit(this._getFabs()).wait(this.delay).queue({
        transform: 'translate3d(0, -' + this.ascension + 'px, 0) scale(1)'
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(util.arrayFrom(toast.children)).saveStyle().queue({
        opacity: 0
      }).wait(this.messageDelay).queue({
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle());
    }

    /**
     * @param {HTMLElement} toast
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(toast, callback) {
      toast = toast._toast;
      util.globals.fabOffset = 0;

      Animit.runAll(Animit(toast).saveStyle().queue({
        transform: 'translate3d(0, 0, 0)'
      }).wait(this.delay).queue({
        transform: 'translate3d(0, ' + this.ascension + 'px, 0)'
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }), Animit(this._getFabs()).wait(this.delay).queue({
        transform: 'translate3d(0, 0, 0) scale(1)'
      }, {
        duration: this.duration,
        timing: this.timing
      }), Animit(util.arrayFrom(toast.children)).saveStyle().queue({
        opacity: 1.0
      }).wait(this.delay).queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle());
    }
  }, {
    key: '_getFabs',
    value: function _getFabs() {
      return util.arrayFrom(document.querySelectorAll('ons-fab[position~=bottom], ons-speed-dial[position~=bottom]')).filter(function (fab) {
        return fab.visible;
      });
    }
  }]);
  return AscendToastAnimator;
}(ToastAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Lift-fade Toast Animator
 */

var LiftToastAnimator = function (_ToastAnimator) {
  inherits(LiftToastAnimator, _ToastAnimator);

  function LiftToastAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'ease' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.35 : _ref$duration;

    classCallCheck(this, LiftToastAnimator);

    var _this = possibleConstructorReturn(this, (LiftToastAnimator.__proto__ || Object.getPrototypeOf(LiftToastAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));

    _this.bodyHeight = document.body.clientHeight; // avoid Forced Synchronous Layout
    return _this;
  }

  /**
   * @param {HTMLElement} toast
   * @param {Function} callback
   */


  createClass(LiftToastAnimator, [{
    key: 'show',
    value: function show(toast, callback) {
      toast = toast._toast;

      Animit.runAll(Animit(toast).saveStyle().queue({
        transform: 'translate3d(0, 100%, 0)',
        opacity: 0
      }).wait(this.delay).queue({
        transform: 'translate3d(0, 0, 0)',
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }));
    }

    /**
     * @param {HTMLElement} toast
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(toast, callback) {
      toast = toast._toast;

      Animit.runAll(Animit(toast).saveStyle().queue({
        transform: 'translate3d(0, 0, 0)',
        opacity: 1.0
      }).wait(this.delay).queue({
        transform: 'translate3d(0, 100%, 0)',
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }));
    }
  }, {
    key: '_updatePosition',
    value: function _updatePosition(toast) {
      if (parseInt(toast.style.top, 10) === 0) {
        toast.style.top = toast.style.bottom = '';
      }
    }
  }]);
  return LiftToastAnimator;
}(ToastAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

/**
 * Fall-fade Toast Animator
 */

var FallToastAnimator = function (_ToastAnimator) {
  inherits(FallToastAnimator, _ToastAnimator);

  function FallToastAnimator() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$timing = _ref.timing,
        timing = _ref$timing === undefined ? 'ease' : _ref$timing,
        _ref$delay = _ref.delay,
        delay = _ref$delay === undefined ? 0 : _ref$delay,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 0.35 : _ref$duration;

    classCallCheck(this, FallToastAnimator);
    return possibleConstructorReturn(this, (FallToastAnimator.__proto__ || Object.getPrototypeOf(FallToastAnimator)).call(this, { timing: timing, delay: delay, duration: duration }));
  }

  /**
   * @param {HTMLElement} toast
   * @param {Function} callback
   */


  createClass(FallToastAnimator, [{
    key: 'show',
    value: function show(toast, callback) {
      toast = toast._toast;
      this._updatePosition(toast);

      Animit.runAll(Animit(toast).saveStyle().queue({
        transform: 'translate3d(0, -100%, 0)',
        opacity: 0
      }).wait(this.delay).queue({
        transform: 'translate3d(0, 0, 0)',
        opacity: 1.0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        callback && callback();
        done();
      }));
    }

    /**
     * @param {HTMLElement} toast
     * @param {Function} callback
     */

  }, {
    key: 'hide',
    value: function hide(toast, callback) {
      var _this2 = this;

      toast = toast._toast;
      this._updatePosition(toast);

      Animit.runAll(Animit(toast).saveStyle().queue({
        transform: 'translate3d(0, 0, 0)',
        opacity: 1.0
      }).wait(this.delay).queue({
        transform: 'translate3d(0, -100%, 0)',
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      }).restoreStyle().queue(function (done) {
        _this2._updatePosition(toast, true);
        callback && callback();
        done();
      }));
    }
  }, {
    key: '_updatePosition',
    value: function _updatePosition(toast, cleanUp) {
      if (parseInt(toast.style.top, 10) !== 0) {
        toast.style.top = 0;
        toast.style.bottom = 'initial';
      }
    }
  }]);
  return FallToastAnimator;
}(ToastAnimator);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var scheme$31 = {
  '.toast': 'toast--*',
  '.toast__message': 'toast--*__message',
  '.toast__button': 'toast--*__button'
};

var defaultClassName$18 = 'toast';

var _animatorDict$8 = {
  'default': platform$1.isAndroid() ? AscendToastAnimator : LiftToastAnimator,
  'fade': FadeToastAnimator,
  'ascend': AscendToastAnimator,
  'lift': LiftToastAnimator,
  'fall': FallToastAnimator,
  'none': ToastAnimator
};

/**
 * @element ons-toast
 * @category dialog
 * @description
 *   [en]
 *     The Toast or Snackbar component is useful for displaying dismissable information or simple actions at (normally) the bottom of the page.
 *
 *     This component does not block user input, allowing the app to continue its flow. For simple toasts, consider `ons.notification.toast` instead.
 *   [/en]
 *   [ja][/ja]
 * @tutorial vanilla/Reference/dialog
 * @guide dialogs
 *   [en]Dialog components[/en]
 *   [ja]Dialog components[/ja]
 * @seealso ons-alert-dialog
 *   [en]The `<ons-alert-dialog>` component is preferred for displaying undismissable information.[/en]
 *   [ja][/ja]
 */

var ToastElement = function (_BaseDialogElement) {
  inherits(ToastElement, _BaseDialogElement);

  /**
   * @attribute animation
   * @type {String}
   * @default default
   * @description
   *  [en]The animation used when showing and hiding the toast. Can be either `"default"`, `"ascend"` (Android), `"lift"` (iOS), `"fall"`, `"fade"` or `"none"`.[/en]
   *  [ja][/ja]
   */

  /**
   * @attribute animation-options
   * @type {Expression}
   * @description
   *  [en]Specify the animation's duration, timing and delay with an object literal. E.g. `{duration: 0.2, delay: 1, timing: 'ease-in'}`.[/en]
   *  [ja]アニメーション時のduration, timing, delayをオブジェクトリテラルで指定します。e.g. <code>{duration: 0.2, delay: 1, timing: 'ease-in'}</code>[/ja]
   */

  function ToastElement() {
    classCallCheck(this, ToastElement);

    var _this = possibleConstructorReturn(this, (ToastElement.__proto__ || Object.getPrototypeOf(ToastElement)).call(this));

    _this._defaultDBB = function (e) {
      return e.callParentHandler();
    };
    contentReady(_this, function () {
      return _this._compile();
    });
    return _this;
  }

  createClass(ToastElement, [{
    key: '_updateAnimatorFactory',
    value: function _updateAnimatorFactory() {
      // Reset position style
      this._toast && (this._toast.style.top = this._toast.style.bottom = '');

      return new AnimatorFactory({
        animators: _animatorDict$8,
        baseClass: ToastAnimator,
        baseClassName: 'ToastAnimator',
        defaultAnimation: this.getAttribute('animation')
      });
    }

    /**
     * @property onDeviceBackButton
     * @type {Object}
     * @description
     *   [en]Back-button handler.[/en]
     *   [ja]バックボタンハンドラ。[/ja]
     */

  }, {
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.style.display = 'none';
      this.style.zIndex = 10000; // Lower than dialogs

      var messageClassName = 'toast__message';
      var buttonClassName = 'toast__button';

      var toast = util.findChild(this, '.' + defaultClassName$18);
      if (!toast) {
        toast = document.createElement('div');
        toast.classList.add(defaultClassName$18);
        while (this.childNodes[0]) {
          toast.appendChild(this.childNodes[0]);
        }
      }

      var button = util.findChild(toast, '.' + buttonClassName);
      if (!button) {
        button = util.findChild(toast, function (e) {
          return util.match(e, '.button') || util.match(e, 'button');
        });
        if (button) {
          button.classList.remove('button');
          button.classList.add(buttonClassName);
          toast.appendChild(button);
        }
      }

      if (!util.findChild(toast, '.' + messageClassName)) {
        var message = util.findChild(toast, '.message');
        if (!message) {
          message = document.createElement('div');
          for (var i = toast.childNodes.length - 1; i >= 0; i--) {
            if (toast.childNodes[i] !== button) {
              message.insertBefore(toast.childNodes[i], message.firstChild);
            }
          }
        }
        message.classList.add(messageClassName);

        toast.insertBefore(message, toast.firstChild);
      }

      if (toast.parentNode !== this) {
        this.appendChild(toast);
      }

      ModifierUtil.initModifier(this, this._scheme);
    }

    /**
     * @property visible
     * @readonly
     * @type {Boolean}
     * @description
     *   [en]Whether the element is visible or not.[/en]
     *   [ja]要素が見える場合に`true`。[/ja]
     */

    /**
     * @method show
     * @signature show([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"default"`, `"ascend"` (Android), `"lift"` (iOS), `"fall"`, `"fade"` or `"none"`.[/en]
     *   [ja][/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @description
     *   [en]Show the element.[/en]
     *   [ja][/ja]
     * @return {Promise}
     *   [en]Resolves to the displayed element[/en]
     *   [ja][/ja]
     */

    /**
     * @method toggle
     * @signature toggle([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"default"`, `"ascend"` (Android), `"lift"` (iOS), `"fall"`, `"fade"` or `"none"`.[/en]
     *   [ja][/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @description
     *   [en]Toggle toast visibility.[/en]
     *   [ja][/ja]
     */

    /**
     * @method hide
     * @signature hide([options])
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {String} [options.animation]
     *   [en]Animation name. Available animations are `"default"`, `"ascend"` (Android), `"lift"` (iOS), `"fall"`, `"fade"` or `"none"`.[/en]
     *   [ja][/ja]
     * @param {String} [options.animationOptions]
     *   [en]Specify the animation's duration, delay and timing. E.g. `{duration: 0.2, delay: 0.4, timing: 'ease-in'}`.[/en]
     *   [ja]アニメーション時のduration, delay, timingを指定します。e.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}[/ja]
     * @description
     *   [en]Hide toast.[/en]
     *   [ja][/ja]
     * @return {Promise}
     *   [en]Resolves to the hidden element[/en]
     *   [ja][/ja]
     */

    /**
     * @param {String} name
     * @param {Function} Animator
     */

  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme$31;
    }
  }, {
    key: '_toast',
    get: function get$$1() {
      return util.findChild(this, '.' + defaultClassName$18);
    }
  }], [{
    key: 'registerAnimator',
    value: function registerAnimator(name, Animator) {
      if (!(Animator.prototype instanceof ToastAnimator)) {
        throw new Error('"Animator" param must inherit OnsToastElement.ToastAnimator');
      }
      _animatorDict$8[name] = Animator;
    }
  }, {
    key: 'animators',
    get: function get$$1() {
      return _animatorDict$8;
    }
  }, {
    key: 'ToastAnimator',
    get: function get$$1() {
      return ToastAnimator;
    }
  }]);
  return ToastElement;
}(BaseDialogElement);

customElements.define('ons-toast', ToastElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$19 = 'toolbar-button';

var scheme$32 = { '': 'toolbar-button--*' };

/**
 * @element ons-toolbar-button
 * @category page
 * @modifier material
 *   [en]Material Design toolbar button.[/en]
 *   [ja][/ja]
 * @modifier outline
 *   [en]A button with an outline.[/en]
 *   [ja]アウトラインをもったボタンを表示します。[/ja]
 * @description
 *   [en]Button component for ons-toolbar and ons-bottom-toolbar.[/en]
 *   [ja]ons-toolbarあるいはons-bottom-toolbarに設置できるボタン用コンポーネントです。[/ja]
 * @codepen aHmGL
 * @tutorial vanilla/Reference/page
 * @guide adding-a-toolbar
 *   [en]Adding a toolbar[/en]
 *   [ja]ツールバーの追加[/ja]
 * @seealso ons-toolbar
 *   [en]The `<ons-toolbar>` component displays a navigation bar at the top of a page.[/en]
 *   [ja]ons-toolbarコンポーネント[/ja]
 * @seealso ons-back-button
 *   [en]The `<ons-back-button>` displays a back button in the navigation bar.[/en]
 *   [ja]ons-back-buttonコンポーネント[/ja]
 * @example
 * <ons-toolbar>
 *   <div class="left">
 *     <ons-toolbar-button>
 *       Button
 *     </ons-toolbar-button>
 *   </div>
 *   <div class="center">
 *     Title
 *   </div>
 *   <div class="right">
 *     <ons-toolbar-button>
 *       <ons-icon icon="ion-navicon" size="28px"></ons-icon>
 *     </ons-toolbar-button>
 *   </div>
 * </ons-toolbar>
 */

var ToolbarButtonElement = function (_BaseElement) {
  inherits(ToolbarButtonElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the button.[/en]
   *   [ja]ボタンの表現を指定します。[/ja]
   */

  /**
   * @attribute disabled
   * @description
   *   [en]Specify if button should be disabled.[/en]
   *   [ja]ボタンを無効化する場合は指定してください。[/ja]
   */

  function ToolbarButtonElement() {
    classCallCheck(this, ToolbarButtonElement);

    var _this = possibleConstructorReturn(this, (ToolbarButtonElement.__proto__ || Object.getPrototypeOf(ToolbarButtonElement)).call(this));

    _this._compile();
    return _this;
  }

  /**
   * @property disabled
   * @type {Boolean}
   * @description
   *   [en]Whether the element is disabled or not.[/en]
   *   [ja]無効化されている場合に`true`。[/ja]
   */


  createClass(ToolbarButtonElement, [{
    key: '_compile',
    value: function _compile() {
      autoStyle.prepare(this);

      this.classList.add(defaultClassName$19);

      util.updateRipple(this, undefined, { center: '', 'size': 'contain', 'background': 'transparent' });

      ModifierUtil.initModifier(this, scheme$32);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$19)) {
            this.className = defaultClassName$19 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$32);
          break;
      }
    }
  }, {
    key: 'disabled',
    set: function set(value) {
      return util.toggleAttribute(this, 'disabled', value);
    },
    get: function get$$1() {
      return this.hasAttribute('disabled');
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return ToolbarButtonElement;
}(BaseElement);

customElements.define('ons-toolbar-button', ToolbarButtonElement);

/*
Copyright 2013-2015 ASIAL CORPORATION
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var scheme$33 = {
  '': 'range--*',
  '.range__input': 'range--*__input',
  '.range__focus-ring': 'range--*__focus-ring'
};

var activeClassToken = 'range__input--active';

/**
 * @element ons-range
 * @category form
 * @modifier material
 *   [en]Material Design slider[/en]
 *   [ja][/ja]
 * @description
 *   [en]
 *     Range input component. Used to display a draggable slider.
 *
 *     Works very similar to the `<input type="range">` element.
 *   [/en]
 *   [ja][/ja]
 * @codepen xZQomM
 * @tutorial vanilla/Reference/range
 * @guide using-modifier [en]More details about the `modifier` attribute[/en][ja]modifier属性の使い方[/ja]
 * @seealso ons-input
 *   [en]The `<ons-input>` component is used to display text inputs, radio buttons and checkboxes.[/en]
 *   [ja][/ja]
 * @example
 * <ons-range value="20"></ons-range>
 * <ons-range modifier="material" value="10"></range>
 */

var RangeElement = function (_BaseInputElement) {
  inherits(RangeElement, _BaseInputElement);

  function RangeElement() {
    classCallCheck(this, RangeElement);

    var _this = possibleConstructorReturn(this, (RangeElement.__proto__ || Object.getPrototypeOf(RangeElement)).call(this));

    _this._boundOnMouseDown = _this._onMouseDown.bind(_this);
    _this._boundOnMouseUp = _this._onMouseUp.bind(_this);
    _this._boundOnTouchStart = _this._onTouchStart.bind(_this);
    _this._boundOnTouchEnd = _this._onTouchEnd.bind(_this);
    _this._boundOnInput = _this._update.bind(_this);
    _this._boundOnDragstart = _this._onDragstart.bind(_this);
    _this._boundOnDragend = _this._onDragend.bind(_this);
    return _this;
  }

  createClass(RangeElement, [{
    key: '_compile',
    value: function _compile() {
      get(RangeElement.prototype.__proto__ || Object.getPrototypeOf(RangeElement.prototype), '_compile', this).call(this);
      this._updateDisabled(this.hasAttribute('disabled'));
    }

    /* Inherited props */

  }, {
    key: '_update',
    value: function _update() {
      var input = this._input;

      input.style.backgroundSize = 100 * this._ratio + '% 2px';
      this._focusRing.value = this.value;

      // NOTE: "_zero" attribute is used for CSS styling.
      if (input.min === '' && input.value === '0' || input.min === input.value) {
        input.setAttribute('_zero', '');
      } else {
        input.removeAttribute('_zero');
      }
    }
  }, {
    key: '_onMouseDown',


    /* Own props */

    value: function _onMouseDown(e) {
      var _this2 = this;

      this._input.classList.add(activeClassToken);
      setImmediate(function () {
        return _this2._input.focus();
      });
    }
  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(e) {
      this._onMouseDown();
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp(e) {
      this._input.classList.remove(activeClassToken);
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(e) {
      this._onMouseUp(e);
    }
  }, {
    key: '_onDragstart',
    value: function _onDragstart(e) {
      e.consumed = true;
      e.gesture.stopPropagation();
      this._input.classList.add(activeClassToken);
      this.addEventListener('drag', this._onDrag);
    }
  }, {
    key: '_onDrag',
    value: function _onDrag(e) {
      e.stopPropagation();
    }
  }, {
    key: '_onDragend',
    value: function _onDragend(e) {
      this._input.classList.remove(activeClassToken);
      this.removeEventListener('drag', this._onDrag);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      if (name === 'disabled') {
        this._updateDisabled(current);
      }
      get(RangeElement.prototype.__proto__ || Object.getPrototypeOf(RangeElement.prototype), 'attributeChangedCallback', this).call(this, name, last, current);
    }

    /**
     * @param {boolean} disabled
     */

  }, {
    key: '_updateDisabled',
    value: function _updateDisabled(disabled) {
      if (disabled) {
        this.classList.add('range--disabled');
      } else {
        this.classList.remove('range--disabled');
      }
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      this.addEventListener('mousedown', this._boundOnMouseDown);
      this.addEventListener('mouseup', this._boundOnMouseUp);
      this.addEventListener('touchstart', this._boundOnTouchStart);
      this.addEventListener('touchend', this._boundOnTouchEnd);
      this.addEventListener('dragstart', this._boundOnDragstart);
      this.addEventListener('dragend', this._boundOnDragend);
      this.addEventListener('input', this._boundOnInput);
    }
  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback() {
      this.removeEventListener('mousedown', this._boundOnMouseDown);
      this.removeEventListener('mouseup', this._boundOnMouseUp);
      this.removeEventListener('touchstart', this._boundOnTouchStart);
      this.removeEventListener('touchend', this._boundOnTouchEnd);
      this.removeEventListener('dragstart', this._boundOnDragstart);
      this.removeEventListener('dragend', this._boundOnDragend);
      this.removeEventListener('input', this._boundOnInput);
    }

    /**
     * @attribute disabled
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

    /**
     * @property disabled
     * @type {Boolean}
     * @description
     *   [en]Whether the element is disabled or not.[/en]
     *   [ja]無効化されている場合に`true`。[/ja]
     */

    /**
     * @property value
     * @type {Number}
     * @description
     *   [en]Current value.[/en]
     *   [ja][/ja]
     */

  }, {
    key: '_focusRing',
    get: function get$$1() {
      return this.children[1];
    }
  }, {
    key: '_scheme',
    get: function get$$1() {
      return scheme$33;
    }
  }, {
    key: '_template',
    get: function get$$1() {
      return '\n      <input type="' + this.type + '" class="' + this._defaultElementClass + '__input">\n      <input type="range" class="range__focus-ring" tabIndex="-1">\n    ';
    }
  }, {
    key: '_defaultElementClass',
    get: function get$$1() {
      return 'range';
    }
  }, {
    key: 'type',
    get: function get$$1() {
      return 'range';
    }
  }, {
    key: '_ratio',
    get: function get$$1() {
      // Returns the current ratio.
      var min = this._input.min === '' ? 0 : parseInt(this._input.min);
      var max = this._input.max === '' ? 100 : parseInt(this._input.max);

      return (this.value - min) / (max - min);
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['disabled'].concat(toConsumableArray(BaseInputElement.observedAttributes));
    }
  }]);
  return RangeElement;
}(BaseInputElement);

customElements.define('ons-range', RangeElement);

/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

var defaultClassName$20 = 'card';
var scheme$34 = {
  '': 'card--*',
  '.card__title': 'card--*__title',
  '.card__content': 'card--*__content'
};

/**
 * @element ons-card
 * @category visual
 * @modifier material
 *   [en]A card with material design.[/en]
 *   [ja]リストの上下のボーダーが無いリストを表示します。[/ja]
 * @description
 *   [en]
 *    Component to create a card that displays some information.
 *
 *    The card may be composed by divs with specially prepared classes `title` and/or `content`. You can also add your own content as you please.[/en]
 *   [ja][/ja]
 * @tutorial vanilla/Reference/card
 * @example
 * <ons-card>
 *   <p>Some content</p>
 * </ons-card>
 */

var CardElement = function (_BaseElement) {
  inherits(CardElement, _BaseElement);

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the card.[/en]
   *   [ja]リストの表現を指定します。[/ja]
   */

  function CardElement() {
    classCallCheck(this, CardElement);

    var _this = possibleConstructorReturn(this, (CardElement.__proto__ || Object.getPrototypeOf(CardElement)).call(this));

    contentReady(_this, function () {
      _this._compile();
    });
    return _this;
  }

  createClass(CardElement, [{
    key: '_compile',
    value: function _compile() {
      for (var i = 0; i < this.children.length; i++) {
        var el = this.children[i];

        if (el.classList.contains('title')) {
          el.classList.add('card__title');
          
        } else if (el.classList.contains('content')) {
          el.classList.add('card__content');
          
        }
      }

      autoStyle.prepare(this);
      this.classList.add(defaultClassName$20);
      ModifierUtil.initModifier(this, scheme$34);
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(name, last, current) {
      switch (name) {
        case 'class':
          if (!this.classList.contains(defaultClassName$20)) {
            this.className = defaultClassName$20 + ' ' + current;
          }
          break;
        case 'modifier':
          ModifierUtil.onModifierChanged(last, current, this, scheme$34);
          break;
      }
    }
  }], [{
    key: 'observedAttributes',
    get: function get$$1() {
      return ['modifier', 'class'];
    }
  }]);
  return CardElement;
}(BaseElement);

customElements.define('ons-card', CardElement);

if (window.ons) {
  ons$1._util.warn('Onsen UI is loaded more than once.');
}

ons$1.TemplateElement = TemplateElement;
ons$1.IfElement = IfElement;
ons$1.ActionSheetElement = ActionSheetElement;
ons$1.ActionSheetButtonElement = ActionSheetButtonElement;
ons$1.AlertDialogElement = AlertDialogElement;
ons$1.AlertDialogButtonElement = AlertDialogButtonElement;
ons$1.BackButtonElement = BackButtonElement;
ons$1.BottomToolbarElement = BottomToolbarElement;
ons$1.ButtonElement = ButtonElement;
ons$1.CarouselItemElement = CarouselItemElement;
ons$1.CarouselElement = CarouselElement;
ons$1.ColElement = ColElement;
ons$1.DialogElement = DialogElement;
ons$1.FabElement = FabElement;
ons$1.GestureDetectorElement = GestureDetectorElement;
ons$1.IconElement = IconElement;
ons$1.LazyRepeatElement = LazyRepeatElement;
ons$1.ListHeaderElement = ListHeaderElement;
ons$1.ListTitleElement = ListTitleElement;
ons$1.ListItemElement = ListItemElement;
ons$1.ListElement = ListElement;
ons$1.InputElement = InputElement;
ons$1.CheckboxElement = CheckboxElement;
ons$1.RadioElement = RadioElement;
ons$1.SearchInputElement = SearchInputElement;
ons$1.ModalElement = ModalElement;
ons$1.NavigatorElement = NavigatorElement;
ons$1.PageElement = PageElement;
ons$1.PopoverElement = PopoverElement;
ons$1.ProgressBarElement = ProgressBarElement;
ons$1.ProgressCircularElement = ProgressCircularElement;
ons$1.PullHookElement = PullHookElement;
ons$1.RippleElement = RippleElement;
ons$1.RowElement = RowElement;
ons$1.SelectElement = SelectElement;
ons$1.SpeedDialItemElement = SpeedDialItemElement;
ons$1.SpeedDialElement = SpeedDialElement;
ons$1.SplitterContentElement = SplitterContentElement;
ons$1.SplitterMaskElement = SplitterMaskElement;
ons$1.SplitterSideElement = SplitterSideElement;
ons$1.SplitterElement = SplitterElement;
ons$1.SwitchElement = SwitchElement;
ons$1.TabElement = TabElement;
ons$1.TabbarElement = TabbarElement;
ons$1.ToastElement = ToastElement;
ons$1.ToolbarButtonElement = ToolbarButtonElement;
ons$1.ToolbarElement = ToolbarElement;
ons$1.RangeElement = RangeElement;
ons$1.CardElement = CardElement;

// fastclick
window.addEventListener('load', function () {
  ons$1.fastClick = FastClick.attach(document.body);
}, false);

// ons._defaultDeviceBackButtonHandler
window.addEventListener('DOMContentLoaded', function () {
  ons$1._deviceBackButtonDispatcher.enable();
  ons$1._defaultDeviceBackButtonHandler = ons$1._deviceBackButtonDispatcher.createHandler(window.document.body, function () {
    if (Object.hasOwnProperty.call(navigator, 'app')) {
      navigator.app.exitApp();
    } else {
      console.warn('Could not close the app. Is \'cordova.js\' included?\nError: \'window.navigator.app\' is undefined.');
    }
  });
  document.body._gestureDetector = new ons$1.GestureDetector(document.body);
}, false);

// setup loading placeholder
ons$1.ready(function () {
  ons$1._setupLoadingPlaceHolders();

  // Simulate Device Back Button on ESC press
  if (!ons$1.platform.isWebView()) {
    document.body.addEventListener('keydown', function (event) {
      if (event.keyCode === 27) {
        ons$1._deviceBackButtonDispatcher.fireDeviceBackButtonEvent();
      }
    });
  }
});

// viewport.js
new Viewport().setup();

export default ons$1;

// For @onsenui/custom-elements
if (window.customElements) {
    // even if native CE1 impl exists, use polyfill
    window.customElements.forcePolyfill = true;
}

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
function PatchHTMLElement(internals) {
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
}

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ParentNodeNativeMethods} builtIn
 */
function PatchParentNode(internals, destination, builtIn) {
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
}

/**
 * @param {!CustomElementInternals} internals
 */
function PatchDocument(internals) {
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
}

/**
 * @param {!CustomElementInternals} internals
 */
function PatchNode(internals) {
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
}

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ChildNodeNativeMethods} builtIn
 */
function PatchChildNode(internals, destination, builtIn) {
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
}

/**
 * @param {!CustomElementInternals} internals
 */
function PatchElement(internals) {
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
}

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

var global$1 = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});

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
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
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

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

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

(function () {

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

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

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
  if ('exports' in module) {
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
class Platform {

  /**
   * All elements will be rendered as if the app was running on this platform.
   * @type {String}
   */
  constructor() {
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
  select(platform) {
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
  isWebView() {
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
  isIOS() {
    if (this._renderPlatform) {
      return this._renderPlatform === 'ios';
    } else if (typeof device === 'object' && !/browser/i.test(device.platform)) {
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
  isAndroid() {
    if (this._renderPlatform) {
      return this._renderPlatform === 'android';
    } else if (typeof device === 'object' && !/browser/i.test(device.platform)) {
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
  isAndroidPhone() {
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
  isAndroidTablet() {
    return (/Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent)
    );
  }

  /**
   * @return {Boolean}
   */
  isWP() {
    if (this._renderPlatform) {
      return this._renderPlatform === 'wp';
    } else if (typeof device === 'object' && !/browser/i.test(device.platform)) {
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
  isIPhone() {
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
  isIPad() {
    return (/iPad/i.test(navigator.userAgent)
    );
  }

  /**
   * @return {Boolean}
   */
  isIPod() {
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
  isBlackBerry() {
    if (this._renderPlatform) {
      return this._renderPlatform === 'blackberry';
    } else if (typeof device === 'object' && !/browser/i.test(device.platform)) {
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
  isOpera() {
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
  isFirefox() {
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
  isSafari() {
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
  isChrome() {
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
  isIE() {
    if (this._renderPlatform) {
      return this._renderPlatform === 'ie';
    } else {
      return !!document.documentMode;
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
  isEdge() {
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
  isIOS7above() {
    if (typeof device === 'object' && !/browser/i.test(device.platform)) {
      return (/iOS/i.test(device.platform) && parseInt(device.version.split('.')[0]) >= 7
      );
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const ver = (navigator.userAgent.match(/\b[0-9]+_[0-9]+(?:_[0-9]+)?\b/) || [''])[0].replace(/_/g, '.');
      return parseInt(ver.split('.')[0]) >= 7;
    }
    return false;
  }

  /**
   * @return {String}
   */
  getMobileOS() {
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
  getIOSDevice() {
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
}

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

const pageAttributeExpression = {
  _variables: {},

  /**
   * Define a variable.
   *
   * @param {String} name Name of the variable
   * @param {String|Function} value Value of the variable. Can be a string or a function. The function must return a string.
   * @param {Boolean} overwrite If this value is false, an error will be thrown when trying to define a variable that has already been defined.
   */
  defineVariable: function defineVariable(name, value, overwrite = false) {
    if (typeof name !== 'string') {
      throw new Error('Variable name must be a string.');
    } else if (typeof value !== 'string' && typeof value !== 'function') {
      throw new Error('Variable value must be a string or a function.');
    } else if (this._variables.hasOwnProperty(name) && !overwrite) {
      throw new Error(`"${name}" is already defined.`);
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
    let c,
        inInterpolation = false,
        currentIndex = 0;

    const tokens = [];

    if (part.length === 0) {
      throw new Error('Unable to parse empty string.');
    }

    for (let i = 0; i < part.length; i++) {
      c = part.charAt(i);

      if (c === '$' && part.charAt(i + 1) === '{') {
        if (inInterpolation) {
          throw new Error('Nested interpolation not supported.');
        }

        const token = part.substring(currentIndex, i);
        if (token.length > 0) {
          tokens.push(part.substring(currentIndex, i));
        }

        currentIndex = i;
        inInterpolation = true;
      } else if (c === '}') {
        if (!inInterpolation) {
          throw new Error('} must be preceeded by ${');
        }

        const token = part.substring(currentIndex, i + 1);
        if (token.length > 0) {
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
    const re = /^\${(.*?)}$/,
          match = token.match(re);

    if (match) {
      const name = match[1].trim();
      const variable = this.getVariable(name);

      if (variable === null) {
        throw new Error(`Variable "${name}" does not exist.`);
      } else if (typeof variable === 'string') {
        return variable;
      } else {
        const rv = variable();

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
    }).map(this._parsePart.bind(this)).map(this._replaceTokens.bind(this)).map(part => part.join(''));
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
pageAttributeExpression.defineVariable('runtime', () => {
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

var TIMEOUT_RATIO = 1.4;

var util = {};

// capitalize string
util.capitalize = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * @param {Object} params
 * @param {String} params.property
 * @param {Float} params.duration
 * @param {String} params.timing
 */
util.buildTransitionValue = function (params) {
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
util.onceOnTransitionEnd = function (element, callback) {
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
    util._transitionEndEvents.forEach(function (eventName) {
      element.removeEventListener(eventName, fn, false);
    });
  };

  util._transitionEndEvents.forEach(function (eventName) {
    element.addEventListener(eventName, fn, false);
  });

  return removeListeners;
};

util._transitionEndEvents = function () {

  if ('ontransitionend' in window) {
    return ['transitionend'];
  }

  if ('onwebkittransitionend' in window) {
    return ['webkitTransitionEnd'];
  }

  if (util.vendorPrefix === 'webkit' || util.vendorPrefix === 'o' || util.vendorPrefix === 'moz' || util.vendorPrefix === 'ms') {
    return [util.vendorPrefix + 'TransitionEnd', 'transitionend'];
  }

  return [];
}();

util._cssPropertyDict = function () {
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

util.hasCssProperty = function (name) {
  return name in util._cssPropertyDict;
};

/**
 * Vendor prefix for css property.
 */
util.vendorPrefix = function () {
  var styles = window.getComputedStyle(document.documentElement, ''),
      pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
  return pre;
}();

util.forceLayoutAtOnce = function (elements, callback) {
  this.batchImmediate(function () {
    elements.forEach(function (element) {
      // force layout
      element.offsetHeight;
    });
    callback();
  });
};

util.batchImmediate = function () {
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

util.batchAnimationFrame = function () {
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

util.transitionPropertyName = function () {
  if (util.hasCssProperty('transitionDuration')) {
    return 'transition';
  }

  if (util.hasCssProperty(util.vendorPrefix + 'TransitionDuration')) {
    return util.vendorPrefix + 'Transition';
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

    var transitionName = util.transitionPropertyName;

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
        var removeListeners = util.onceOnTransitionEnd(elements[0], function () {
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

        for (var i = 0, name = ''; i < element.style.length; i++) {
          name = element.style[i];
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
      var transitionValue = util.buildTransitionValue(this.options);
      var self = this;

      return function (callback) {
        var elements = this.elements;
        var timeout = self.options.duration * 1000 * TIMEOUT_RATIO;
        var timeoutId;

        var removeListeners = util.onceOnTransitionEnd(elements[0], function () {
          clearTimeout(timeoutId);
          callback();
        });

        timeoutId = setTimeout(function () {
          removeListeners();
          callback();
        }, timeout);

        elements.forEach(function (element) {
          element.style[util.transitionPropertyName] = transitionValue;

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
          element.style[util.transitionPropertyName] = '';

          Object.keys(css).forEach(function (name) {
            element.style[name] = css[name];
          });
        });

        if (elements.length > 0) {
          util.forceLayoutAtOnce(elements, function () {
            util.batchAnimationFrame(callback);
          });
        } else {
          util.batchAnimationFrame(callback);
        }
      };
    }

    function createActualCssProps(css) {
      var result = {};

      Object.keys(css).forEach(function (name) {
        var value = css[name];

        if (util.hasCssProperty(name)) {
          result[name] = value;
          return;
        }

        var prefixed = util.vendorPrefix + util.capitalize(name);
        if (util.hasCssProperty(prefixed)) {
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

var Event$1, Utils, Detection, PointerEvent;

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
  inArray: function inArray(src, find, deep) {
    if (deep) {
      return src.findIndex(function (item) {
        return Object.keys(find).every(function (key) {
          return item[key] === find[key];
        });
      });
    }

    if (src.indexOf) {
      return src.indexOf(find);
    } else {
      for (var i = 0, len = src.length; i < len; i++) {
        if (src[i] === find) {
          return i;
        }
      }
      return -1;
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
        if (Utils.inArray(identifiers, touch.identifier) === -1) {
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
      var index = Utils.inArray(self.eventHandlers, { gesture: type, handler: handler }, true);
      if (index >= 0) {
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

const directionMap = {
  vertical: {
    axis: 'Y',
    size: 'Height',
    dir: ['up', 'down'],
    t3d: ['0px, ', 'px, 0px']
  },
  horizontal: {
    axis: 'X',
    size: 'Width',
    dir: ['left', 'right'],
    t3d: ['', 'px, 0px, 0px']
  }
};

class Swiper {
  constructor(params) {
    // Parameters
    const FALSE = () => false;
    `getInitialIndex getBubbleWidth isVertical isOverScrollable isCentered
    isAutoScrollable refreshHook preChangeHook postChangeHook overScrollHook`.split(/\s+/).forEach(key => this[key] = params[key] || FALSE);

    this.getElement = params.getElement; // Required
    this.scrollHook = params.scrollHook; // Optional
    this.itemSize = params.itemSize || '100%';

    this.getAutoScrollRatio = (...args) => {
      let ratio = params.getAutoScrollRatio && params.getAutoScrollRatio(...args);
      ratio = typeof ratio === 'number' && ratio === ratio ? ratio : .5;
      if (ratio < 0.0 || ratio > 1.0) {
        throw new Error('Invalid auto-scroll-ratio ' + ratio + '. Must be between 0 and 1');
      }
      return ratio;
    };

    // Bind handlers
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  init({ swipeable, autoRefresh } = {}) {
    this.initialized = true;
    this.target = this.getElement().children[0];
    this.blocker = this.getElement().children[1];
    if (!this.target || !this.blocker) {
      throw new Error('Expected "target" and "blocker" elements to exist before initializing Swiper.');
    }

    // Add classes
    this.getElement().classList.add('ons-swiper');
    this.target.classList.add('ons-swiper-target');
    this.blocker.classList.add('ons-swiper-blocker');

    // Setup listeners
    this._gestureDetector = new GestureDetector(this.getElement(), { dragMinDistance: 1, dragLockToAxis: true });
    this._mutationObserver = new MutationObserver(() => this.refresh());
    this.updateSwipeable(swipeable);
    this.updateAutoRefresh(autoRefresh);
    this.resizeOn();

    // Setup initial layout
    this._scroll = this._offset = this._lastActiveIndex = 0;
    this._updateLayout();
    this._setupInitialIndex();
    setImmediate(() => this.initialized && this._setupInitialIndex());

    // Fix rendering glitch on Android 4.1
    if (this.offsetHeight === 0) {
      setImmediate(() => this.refresh());
    }
  }

  dispose() {
    this.initialized = false;
    this.updateSwipeable(false);
    this.updateAutoRefresh(false);

    this._gestureDetector && this._gestureDetector.dispose();
    this.target = this.blocker = this._gestureDetector = this._mutationObserver = null;

    this.resizeOff();
  }

  onResize() {
    const i = this._scroll / this.targetSize;
    this._reset();
    this.setActiveIndex(i);
    this.refresh();
  }

  get itemCount() {
    return this.target.children.length;
  }

  get itemNumSize() {
    if (typeof this._itemNumSize !== 'number' || this._itemNumSize !== this._itemNumSize) {
      this._itemNumSize = this._calculateItemSize();
    }
    return this._itemNumSize;
  }

  get maxScroll() {
    const max = this.itemCount * this.itemNumSize - this.targetSize;
    return Math.ceil(max < 0 ? 0 : max); // Need to return an integer value.
  }

  _calculateItemSize() {
    const matches = this.itemSize.match(/^(\d+)(px|%)/);

    if (!matches) {
      throw new Error(`Invalid state: swiper's size unit must be '%' or 'px'`);
    }

    const value = parseInt(matches[1], 10);
    return matches[2] === '%' ? Math.round(value / 100 * this.targetSize) : value;
  }

  _setupInitialIndex() {
    this._reset();
    this._lastActiveIndex = Math.max(Math.min(Number(this.getInitialIndex()), this.itemCount), 0);
    this._scroll = this._offset + this.itemNumSize * this._lastActiveIndex;
    this._scrollTo(this._scroll);
  }

  setActiveIndex(index, options = {}) {
    index = Math.max(0, Math.min(index, this.itemCount - 1));
    const scroll = Math.max(0, Math.min(this.maxScroll, this._offset + this.itemNumSize * index));
    return this._changeTo(scroll, options);
  }

  getActiveIndex(scroll = this._scroll) {
    scroll -= this._offset;
    const count = this.itemCount,
          size = this.itemNumSize;

    if (scroll < 0) {
      return 0;
    }

    for (let i = 0; i < count; i++) {
      if (size * i <= scroll && size * (i + 1) > scroll) {
        return i;
      }
    }

    return count - 1;
  }

  resizeOn() {
    window.addEventListener('resize', this.onResize, true);
  }

  resizeOff() {
    window.removeEventListener('resize', this.onResize, true);
  }

  updateSwipeable(shouldUpdate) {
    if (this._gestureDetector) {
      const action = shouldUpdate ? 'on' : 'off';
      this._gestureDetector[action]('drag', this.onDrag);
      this._gestureDetector[action]('dragstart', this.onDragStart);
      this._gestureDetector[action]('dragend', this.onDragEnd);
    }
  }

  updateAutoRefresh(shouldWatch) {
    if (this._mutationObserver) {
      shouldWatch ? this._mutationObserver.observe(this.target, { childList: true }) : this._mutationObserver.disconnect();
    }
  }

  updateItemSize(newSize) {
    this.itemSize = newSize || '100%';
    this.refresh();
  }

  toggleBlocker(block) {
    this.blocker.style.pointerEvents = block ? 'auto' : 'none';
  }

  _canConsumeGesture(gesture) {
    const d = gesture.direction;
    const isFirst = this._scroll === 0 && !this.isOverScrollable();
    const isLast = this._scroll === this.maxScroll && !this.isOverScrollable();

    return this.isVertical() ? d === 'down' && !isFirst || d === 'up' && !isLast : d === 'right' && !isFirst || d === 'left' && !isLast;
  }

  onDragStart(event) {
    this._ignoreDrag = event.consumed;

    // distance and deltaTime filter some weird dragstart events that are not fired immediately
    if (event.gesture && !this._ignoreDrag && (event.gesture.distance <= 15 || event.gesture.deltaTime <= 100)) {
      const consume = event.consume;
      event.consume = () => {
        consume && consume();this._ignoreDrag = true;
      };

      if (this._canConsumeGesture(event.gesture)) {
        const startX = event.gesture.center && event.gesture.center.clientX || 0,
              distFromEdge = this.getBubbleWidth() || 0,
              start = () => {
          consume && consume();
          event.consumed = true;
          this._started = true; // Avoid starting drag from outside
          this.toggleBlocker(true);
          util$1.preventScroll(this._gestureDetector);
        };

        // Let parent elements consume the gesture or consume it right away
        startX < distFromEdge || startX > this.targetSize - distFromEdge ? setImmediate(() => !this._ignoreDrag && start()) : start();
      }
    }
  }

  onDrag(event) {
    if (!event.gesture || this._ignoreDrag || !this._started) {
      return;
    }

    this._continued = true; // Fix for random 'dragend' without 'drag'
    event.stopPropagation();

    this._scrollTo(this._scroll - this._getDelta(event), { throttle: true });
  }

  onDragEnd(event) {
    this._started = false;
    if (!event.gesture || this._ignoreDrag || !this._continued) {
      this._ignoreDrag = true; // onDragEnd might fire before onDragStart's setImmediate
      return;
    }

    this._continued = false;
    event.stopPropagation();

    const scroll = this._scroll - this._getDelta(event);
    const normalizedScroll = this._normalizeScroll(scroll);
    scroll === normalizedScroll ? this._startMomentumScroll(scroll, event) : this._killOverScroll(normalizedScroll);
    this.toggleBlocker(false);
  }

  _startMomentumScroll(scroll, event) {
    const velocity = this._getVelocity(event),
          matchesDirection = event.gesture.interimDirection === this.dM.dir[Math.min(Math.sign(this._getDelta(event)) + 1, 1)];

    const nextScroll = this._getAutoScroll(scroll, velocity, matchesDirection);
    let duration = Math.abs(nextScroll - scroll) / (velocity + 0.01) / 1000;
    duration = Math.min(.25, Math.max(.1, duration));

    this._changeTo(nextScroll, { swipe: true, animationOptions: { duration, timing: 'cubic-bezier(.4, .7, .5, 1)' } });
  }

  _killOverScroll(scroll) {
    this._scroll = scroll;
    const direction = this.dM.dir[Number(scroll > 0)];
    const killOverScroll = () => this._changeTo(scroll, { animationOptions: { duration: .4, timing: 'cubic-bezier(.1, .4, .1, 1)' } });
    this.overScrollHook({ direction, killOverScroll }) || killOverScroll();
  }

  _changeTo(scroll, options = {}) {
    const e = { activeIndex: this.getActiveIndex(scroll), lastActiveIndex: this._lastActiveIndex, swipe: options.swipe || false };
    const change = e.activeIndex !== e.lastActiveIndex;
    const canceled = change ? this.preChangeHook(e) : false;

    this._scroll = canceled ? this._offset + e.lastActiveIndex * this.itemNumSize : scroll;
    this._lastActiveIndex = canceled ? e.lastActiveIndex : e.activeIndex;

    return this._scrollTo(this._scroll, options).then(() => {
      if (scroll === this._scroll && !canceled) {
        change && this.postChangeHook(e);
      } else if (options.reject) {
        return Promise.reject('Canceled');
      }
    });
  }

  _scrollTo(scroll, options = {}) {
    if (options.throttle) {
      const ratio = 0.35;
      if (scroll < 0) {
        scroll = this.isOverScrollable() ? Math.round(scroll * ratio) : 0;
      } else {
        const maxScroll = this.maxScroll;
        if (maxScroll < scroll) {
          scroll = this.isOverScrollable() ? maxScroll + Math.round((scroll - maxScroll) * ratio) : maxScroll;
        }
      }
    }

    const opt = options.animation === 'none' ? {} : options.animationOptions;
    this.scrollHook && this.itemNumSize > 0 && this.scrollHook((scroll / this.itemNumSize).toFixed(2), options.animationOptions || {});
    return new Promise(resolve => Animit(this.target).queue({ transform: this._getTransform(scroll) }, opt).play(resolve));
  }

  _getAutoScroll(scroll, velocity, matchesDirection) {
    const max = this.maxScroll,
          offset = this._offset,
          size = this.itemNumSize;

    if (!this.isAutoScrollable()) {
      return Math.max(0, Math.min(max, scroll));
    }

    let arr = [];
    for (let s = offset; s < max; s += size) {
      arr.push(s);
    }
    arr.push(max);

    arr = arr.sort((left, right) => Math.abs(left - scroll) - Math.abs(right - scroll)).filter((item, pos) => !pos || item !== arr[pos - 1]);

    let result = arr[0];
    const lastScroll = this._lastActiveIndex * size + offset;
    const scrollRatio = Math.abs(scroll - lastScroll) / size;

    if (scrollRatio <= this.getAutoScrollRatio(matchesDirection, velocity, size)) {
      result = lastScroll;
    } else {
      if (scrollRatio < 1.0 && arr[0] === lastScroll && arr.length > 1) {
        result = arr[1];
      }
    }
    return Math.max(0, Math.min(max, result));
  }

  _reset() {
    this._targetSize = this._itemNumSize = undefined;
  }

  _normalizeScroll(scroll) {
    return Math.max(Math.min(scroll, this.maxScroll), 0);
  }

  refresh() {
    this._reset();
    this._updateLayout();

    const scroll = this._normalizeScroll(this._scroll);
    scroll !== this._scroll ? this._killOverScroll(scroll) : this._changeTo(scroll);

    this.refreshHook();
  }

  get targetSize() {
    if (!this._targetSize) {
      this._targetSize = this.target[`offset${this.dM.size}`];
    }
    return this._targetSize;
  }

  _getDelta(event) {
    return event.gesture[`delta${this.dM.axis}`];
  }

  _getVelocity(event) {
    return event.gesture[`velocity${this.dM.axis}`];
  }

  _getTransform(scroll) {
    return `translate3d(${this.dM.t3d[0]}${-scroll}${this.dM.t3d[1]})`;
  }

  _updateLayout() {
    this.dM = directionMap[this.isVertical() ? 'vertical' : 'horizontal'];
    this.target.classList.toggle('ons-swiper-target--vertical', this.isVertical());

    for (let c = this.target.children[0]; c; c = c.nextElementSibling) {
      c.style[this.dM.size.toLowerCase()] = this.itemSize;
    }

    if (this.isCentered()) {
      this._offset = (this.targetSize - this.itemNumSize) / -2 || 0;
    }
  }
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

const internal = {};

internal.config = {
  autoStatusBarFill: true,
  animationsDisabled: false,
  warningsDisabled: false
};

internal.nullElement = window.document.createElement('div');

internal.Swiper = Swiper;

/**
 * @return {Boolean}
 */
internal.isEnabledAutoStatusBarFill = () => {
  return !!internal.config.autoStatusBarFill;
};

/**
 * @param {String} html
 * @return {String}
 */
internal.normalizePageHTML = html => ('' + html).trim();

internal.waitDOMContentLoaded = callback => {
  if (window.document.readyState === 'loading' || window.document.readyState == 'uninitialized') {
    const wrappedCallback = () => {
      callback();
      window.document.removeEventListener('DOMContentLoaded', wrappedCallback);
    };
    window.document.addEventListener('DOMContentLoaded', wrappedCallback);
  } else {
    setImmediate(callback);
  }
};

internal.autoStatusBarFill = action => {
  const onReady = () => {
    if (internal.shouldFillStatusBar()) {
      action();
    }
    document.removeEventListener('deviceready', onReady);
  };

  if (typeof device === 'object') {
    document.addEventListener('deviceready', onReady);
  } else if (['complete', 'interactive'].indexOf(document.readyState) === -1) {
    internal.waitDOMContentLoaded(onReady);
  } else {
    onReady();
  }
};

internal.shouldFillStatusBar = () => internal.isEnabledAutoStatusBarFill() && (platform$1.isWebView() && platform$1.isIOS7above() || document.body.querySelector('.ons-status-bar-mock'));

internal.templateStore = {
  _storage: {},

  /**
   * @param {String} key
   * @return {String/null} template
   */
  get(key) {
    return internal.templateStore._storage[key] || null;
  },

  /**
   * @param {String} key
   * @param {String} template
   */
  set(key, template) {
    internal.templateStore._storage[key] = template;
  }
};

window.document.addEventListener('_templateloaded', function (e) {
  if (e.target.nodeName.toLowerCase() === 'ons-template') {
    internal.templateStore.set(e.templateId, e.template);
  }
}, false);

internal.waitDOMContentLoaded(function () {
  register('script[type="text/ons-template"]');
  register('script[type="text/template"]');
  register('script[type="text/ng-template"]');
  register('template');

  function register(query) {
    const templates = window.document.querySelectorAll(query);
    for (let i = 0; i < templates.length; i++) {
      internal.templateStore.set(templates[i].getAttribute('id'), templates[i].textContent || templates[i].content);
    }
  }
});

/**
 * @param {String} page
 * @return {Promise}
 */
internal.getTemplateHTMLAsync = function (page) {
  return new Promise((resolve, reject) => {
    internal.waitDOMContentLoaded(() => {
      const cache = internal.templateStore.get(page);
      if (cache) {
        if (cache instanceof DocumentFragment) {
          return resolve(cache);
        }

        const html = typeof cache === 'string' ? cache : cache[1];
        return resolve(internal.normalizePageHTML(html));
      }

      const local = window.document.getElementById(page);
      if (local) {
        const html = local.textContent || local.content;
        return resolve(html);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('GET', page, true);
      xhr.onload = function () {
        const html = xhr.responseText;
        if (xhr.status >= 400 && xhr.status < 600) {
          reject(html);
        } else {
          const fragment = util$1.createFragment(html);
          internal.templateStore.set(page, fragment);
          resolve(fragment);
        }
      };
      xhr.onerror = function () {
        throw new Error(`The page is not found: ${page}`);
      };
      xhr.send(null);
    });
  });
};

/**
 * @param {String} page
 * @return {Promise}
 */
internal.getPageHTMLAsync = function (page) {
  const pages = pageAttributeExpression.evaluate(page);

  const getPage = page => {
    if (typeof page !== 'string') {
      return Promise.reject('Must specify a page.');
    }

    return internal.getTemplateHTMLAsync(page).catch(function (error) {
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

class AnimatorFactory {

  /**
   * @param {Object} opts
   * @param {Object} opts.animators The dictionary for animator classes
   * @param {Function} opts.baseClass The base class of animators
   * @param {String} [opts.baseClassName] The name of the base class of animators
   * @param {String} [opts.defaultAnimation] The default animation name
   * @param {Object} [opts.defaultAnimationOptions] The default animation options
   */
  constructor(opts) {
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
  static parseAnimationOptionsString(jsonString) {
    try {
      if (typeof jsonString === 'string') {
        const result = util$1.animationOptionsParse(jsonString);
        if (typeof result === 'object' && result !== null) {
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

  /**
   * @param {Object} options
   */
  setAnimationOptions(options) {
    this._animationOptions = options;
  }

  /**
   * @param {Object} options
   * @param {String} [options.animation] The animation name
   * @param {Object} [options.animationOptions] The animation options
   * @param {Object} defaultAnimator The default animator instance
   * @return {Object} An animator instance
   */
  newAnimator(options = {}, defaultAnimator) {

    let animator = null;

    if (options.animation instanceof this._baseClass) {
      return options.animation;
    }

    let Animator = null;

    if (typeof options.animation === 'string') {
      Animator = this._animators[options.animation];
    }

    if (!Animator && defaultAnimator) {
      animator = defaultAnimator;
    } else {
      Animator = Animator || this._animators[this._animation];

      const animationOpts = util$1.extend({}, this._animationOptions, options.animationOptions || {}, internal.config.animationsDisabled ? { duration: 0, delay: 0 } : {});

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

let autoStyleEnabled = true;

// Modifiers
const modifiersMap = {
  'quiet': 'material--flat',
  'light': 'material--flat',
  'outline': 'material--flat',
  'cta': '',
  'large--quiet': 'material--flat large',
  'large--cta': 'large',
  'noborder': '',
  'tappable': ''
};

const platforms = {};

platforms.android = element => {

  const elementName = element.tagName.toLowerCase();

  if (!util$1.hasModifier(element, 'material')) {
    const oldModifier = element.getAttribute('modifier') || '';

    const newModifier = oldModifier.trim().split(/\s+/).map(e => modifiersMap.hasOwnProperty(e) ? modifiersMap[e] : e);
    newModifier.unshift('material');

    element.setAttribute('modifier', newModifier.join(' ').trim());
  }

  const elements = ['ons-alert-dialog-button', 'ons-toolbar-button', 'ons-back-button', 'ons-button', 'ons-list-item', 'ons-fab', 'ons-speed-dial', 'ons-speed-dial-item', 'ons-tab'];

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

platforms.ios = element => {

  // Modifiers
  if (util$1.removeModifier(element, 'material')) {
    if (util$1.removeModifier(element, 'material--flat')) {
      util$1.addModifier(element, util$1.removeModifier(element, 'large') ? 'large--quiet' : 'quiet');
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

const unlocked = {
  android: true
};

const getPlatform = (element, force) => {
  if (autoStyleEnabled && !element.hasAttribute('disable-auto-styling')) {
    const mobileOS = platform$1.getMobileOS();
    if (platforms.hasOwnProperty(mobileOS) && (unlocked.hasOwnProperty(mobileOS) || force)) {
      return mobileOS;
    }
  }
  return null;
};

const prepare = (element, force) => {
  const p = getPlatform(element, force);
  p && platforms[p](element);
};

const mapModifier = (modifier, element, force) => {
  if (getPlatform(element, force)) {
    return modifier.split(/\s+/).map(m => modifiersMap.hasOwnProperty(m) ? modifiersMap[m] : m).join(' ');
  }
  return modifier;
};

const restoreModifier = element => {
  if (getPlatform(element) === 'android') {
    const modifier = element.getAttribute('modifier') || '';
    let newModifier = mapModifier(modifier, element);

    if (!/(^|\s+)material($|\s+)/i.test(modifier)) {
      newModifier = 'material ' + newModifier;
    }

    if (newModifier !== modifier) {
      element.setAttribute('modifier', newModifier.trim());
      return true;
    }
  }
  return false;
};

var autoStyle = {
  isEnabled: () => autoStyleEnabled,
  enable: () => autoStyleEnabled = true,
  disable: () => autoStyleEnabled = false,
  prepare,
  mapModifier,
  getPlatform,
  restoreModifier
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

class ModifierUtil {
  /**
   * @param {String} last
   * @param {String} current
   */
  static diff(last, current) {
    last = makeDict(('' + last).trim());
    current = makeDict(('' + current).trim());

    const removed = Object.keys(last).reduce((result, token) => {
      if (!current[token]) {
        result.push(token);
      }
      return result;
    }, []);

    const added = Object.keys(current).reduce((result, token) => {
      if (!last[token]) {
        result.push(token);
      }
      return result;
    }, []);

    return { added, removed };

    function makeDict(modifier) {
      const dict = {};
      ModifierUtil.split(modifier).forEach(token => dict[token] = token);
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
  static applyDiffToClassList(diff, classList, template) {
    diff.added.map(modifier => template.replace(/\*/g, modifier)).forEach(klass => klass.split(/\s+/).forEach(k => classList.add(k)));

    diff.removed.map(modifier => template.replace(/\*/g, modifier)).forEach(klass => klass.split(/\s+/).forEach(k => classList.remove(k)));
  }

  /**
   * @param {Object} diff
   * @param {Array} diff.removed
   * @param {Array} diff.added
   * @param {HTMLElement} element
   * @param {Object} scheme
   */
  static applyDiffToElement(diff, element, scheme) {
    Object.keys(scheme).forEach(selector => {
      const targetElements = !selector || util$1.match(element, selector) ? [element] : element.querySelectorAll(selector);
      for (let i = 0; i < targetElements.length; i++) {
        ModifierUtil.applyDiffToClassList(diff, targetElements[i].classList, scheme[selector]);
      }
    });
  }

  /**
   * @param {String} last
   * @param {String} current
   * @param {HTMLElement} element
   * @param {Object} scheme
   */
  static onModifierChanged(last, current, element, scheme) {
    ModifierUtil.applyDiffToElement(ModifierUtil.diff(last, current), element, scheme);
    autoStyle.restoreModifier(element);
  }

  static refresh(element, scheme) {
    ModifierUtil.applyDiffToElement(ModifierUtil.diff('', element.getAttribute('modifier') || ''), element, scheme);
  }

  /**
   * @param {HTMLElement} element
   * @param {Object} scheme
   */
  static initModifier(element, scheme) {
    const modifier = element.getAttribute('modifier');
    if (typeof modifier !== 'string') {
      return;
    }

    ModifierUtil.applyDiffToElement({
      removed: [],
      added: ModifierUtil.split(modifier)
    }, element, scheme);
  }

  static split(modifier) {
    if (typeof modifier !== 'string') {
      return [];
    }

    return modifier.trim().split(/ +/).filter(token => token !== '');
  }

  /**
   * Add modifier token to an element.
   */
  static addModifier(element, modifierToken) {
    if (!element.hasAttribute('modifier')) {
      element.setAttribute('modifier', modifierToken);
    } else {
      const tokens = ModifierUtil.split(element.getAttribute('modifier'));
      if (tokens.indexOf(modifierToken) == -1) {
        tokens.push(modifierToken);
        element.setAttribute('modifier', tokens.join(' '));
      }
    }
  }

  /**
   * Remove modifier token from an element.
   */
  static removeModifier(element, modifierToken) {
    if (element.hasAttribute('modifier')) {
      const tokens = ModifierUtil.split(element.getAttribute('modifier'));
      const index = tokens.indexOf(modifierToken);
      if (index !== -1) {
        tokens.splice(index, 1);
        element.setAttribute('modifier', tokens.join(' '));
      }
    }
  }
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
//import ToastQueue from './toast-queue';
//import {LazyRepeatProvider, LazyRepeatDelegate} from './lazy-repeat';

internal.AnimatorFactory = AnimatorFactory;
internal.ModifierUtil = ModifierUtil;

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

const unwrap = string => string.slice(1, -1);
const isObjectString = string => string.startsWith('{') && string.endsWith('}');
const isArrayString = string => string.startsWith('[') && string.endsWith(']');
const isQuotedString = string => string.startsWith('\'') && string.endsWith('\'') || string.startsWith('"') && string.endsWith('"');

const error = (token, string, originalString) => {
  throw new Error('Unexpected token \'' + token + '\' at position ' + (originalString.length - string.length - 1) + ' in string: \'' + originalString + '\'');
};

const processToken = (token, string, originalString) => {
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

const nextToken = string => {
  string = string.trimLeft();
  let limit = string.length;

  if (string[0] === ':' || string[0] === ',') {

    limit = 1;
  } else if (string[0] === '{' || string[0] === '[') {

    const c = string.charCodeAt(0);
    let nestedObject = 1;
    for (let i = 1; i < string.length; i++) {
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

    for (let i = 1; i < string.length; i++) {
      if (string[i] === string[0]) {
        limit = i + 1;
        break;
      }
    }
  } else {

    for (let i = 1; i < string.length; i++) {
      if ([' ', ',', ':'].indexOf(string[i]) !== -1) {
        limit = i;
        break;
      }
    }
  }

  return string.slice(0, limit);
};

const parseObject = string => {
  const isValidKey = key => /^[A-Z_\$][A-Z0-9_\$]*$/i.test(key);

  string = string.trim();
  const originalString = string;
  const object = {};
  let readingKey = true,
      key,
      previousToken,
      token;

  while (string.length > 0) {
    previousToken = token;
    token = nextToken(string);
    string = string.slice(token.length, string.length).trimLeft();

    if (token === ':' && (!readingKey || !previousToken || previousToken === ',') || token === ',' && readingKey || token !== ':' && token !== ',' && previousToken && previousToken !== ',' && previousToken !== ':') {
      error(token, string, originalString);
    } else if (token === ':' && readingKey && previousToken) {
      previousToken = isQuotedString(previousToken) ? unwrap(previousToken) : previousToken;
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

const parseArray = string => {
  string = string.trim();
  const originalString = string;
  const array = [];
  let previousToken, token;

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

const parse = string => {
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

const util$1 = {};

util$1.globals = {
  fabOffset: 0
};

/**
 * @param {String/Function} query dot class name or node name or matcher function.
 * @return {Function}
 */
util$1.prepareQuery = query => {
  return query instanceof Function ? query : element => util$1.match(element, query);
};

/**
 * @param {Element} e
 * @param {String/Function} s CSS Selector.
 * @return {Boolean}
 */
util$1.match = (e, s) => (e.matches || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector).call(e, s);

/**
 * @param {Element} element
 * @param {String/Function} query dot class name or node name or matcher function.
 * @return {HTMLElement/null}
 */
util$1.findChild = (element, query) => {
  const match = util$1.prepareQuery(query);

  // Caution: `element.children` is `undefined` in some environments if `element` is `svg`
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
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
util$1.findParent = (element, query, until) => {
  const match = util$1.prepareQuery(query);

  let parent = element.parentNode;
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
util$1.isAttached = element => document.body.contains(element);

/**
 * @param {Element} element
 * @return {boolean}
 */
util$1.hasAnyComponentAsParent = element => {
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
util$1.isPageControl = element => element.nodeName.match(/^ons-(navigator|splitter|tabbar|page)$/i);

/**
 * @param {Element} element
 * @param {String} action to propagate
 */
util$1.propagateAction = (element, action) => {
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i];
    if (child[action] instanceof Function) {
      child[action]();
    } else {
      util$1.propagateAction(child, action);
    }
  }
};

/**
 * @param {String} string - string to be camelized
 * @return {String} Camelized string
 */
util$1.camelize = string => string.toLowerCase().replace(/-([a-z])/g, (m, l) => l.toUpperCase());

/**
 * @param {String} selector - tag and class only
 * @param {Object} style
 * @param {Element}
 */
util$1.create = (selector = '', style = {}) => {
  const classList = selector.split('.');
  const element = document.createElement(classList.shift() || 'div');

  if (classList.length) {
    element.className = classList.join(' ');
  }

  util$1.extend(element.style, style);

  return element;
};

/**
 * @param {String} html
 * @return {Element}
 */
util$1.createElement = html => {
  const wrapper = document.createElement('div');

  if (html instanceof DocumentFragment) {
    wrapper.appendChild(document.importNode(html, true));
  } else {
    wrapper.innerHTML = html.trim();
  }

  if (wrapper.children.length > 1) {
    throw new Error('"html" must be one wrapper element.');
  }

  const element = wrapper.children[0];
  wrapper.children[0].remove();
  return element;
};

/**
 * @param {String} html
 * @return {HTMLFragment}
 */
util$1.createFragment = html => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const fragment = document.createDocumentFragment();

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
util$1.extend = (dst, ...args) => {
  for (let i = 0; i < args.length; i++) {
    if (args[i]) {
      const keys = Object.keys(args[i]);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
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
util$1.arrayFrom = arrayLike => {
  return Array.prototype.slice.apply(arrayLike);
};

/**
 * @param {String} jsonString
 * @param {Object} [failSafe]
 * @return {Object}
 */
util$1.parseJSONObjectSafely = (jsonString, failSafe = {}) => {
  try {
    const result = JSON.parse('' + jsonString);
    if (typeof result === 'object' && result !== null) {
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
util$1.findFromPath = path => {
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
util$1.getTopPage = container => container && (container.tagName.toLowerCase() === 'ons-page' ? container : container.topPage) || null;

/**
 * @param {HTMLElement} container - Element where the search begins
 * @return {HTMLElement|null} - Page element that contains the visible toolbar or null.
 */
util$1.findToolbarPage = container => {
  const page = util$1.getTopPage(container);

  if (page) {
    if (page._canAnimateToolbar()) {
      return page;
    }

    for (let i = 0; i < page._contentElement.children.length; i++) {
      const nextPage = util$1.getTopPage(page._contentElement.children[i]);
      if (nextPage && !/ons-tabbar/i.test(page._contentElement.children[i].tagName)) {
        return util$1.findToolbarPage(nextPage);
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
util$1.triggerElementEvent = (target, eventName, detail = {}) => {

  const event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
    detail: detail
  });

  Object.keys(detail).forEach(key => {
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
util$1.hasModifier = (target, modifierName) => {
  if (!target.hasAttribute('modifier')) {
    return false;
  }

  return RegExp(`(^|\\s+)${modifierName}($|\\s+)`, 'i').test(target.getAttribute('modifier'));
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Object} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was added or not.
 */
util$1.addModifier = (target, modifierName, options = {}) => {
  if (options.autoStyle) {
    modifierName = autoStyle.mapModifier(modifierName, target, options.forceAutoStyle);
  }

  if (util$1.hasModifier(target, modifierName)) {
    return false;
  }

  target.setAttribute('modifier', ((target.getAttribute('modifier') || '') + ' ' + modifierName).trim());
  return true;
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Object} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was found or not.
 */
util$1.removeModifier = (target, modifierName, options = {}) => {
  if (options.autoStyle) {
    modifierName = autoStyle.mapModifier(modifierName, target, options.forceAutoStyle);
  }

  if (!target.getAttribute('modifier') || !util$1.hasModifier(target, modifierName)) {
    return false;
  }

  const newModifiers = target.getAttribute('modifier').split(/\s+/).filter(m => m && m !== modifierName);
  newModifiers.length ? target.setAttribute('modifier', newModifiers.join(' ')) : target.removeAttribute('modifier');
  return true;
};

/**
 * @param {Element} target
 * @param {String} modifierName
 * @param {Boolean} options.force Forces modifier to be added or removed.
 * @param {Object} options.autoStyle Maps the modifierName to the corresponding styled modifier.
 * @param {Boolean} options.forceAutoStyle Ignores platform limitation.
 * @return {Boolean} Whether it was found or not.
 */
util$1.toggleModifier = (...args) => {
  const options = args.length > 2 ? args[2] : {};
  const force = typeof options === 'boolean' ? options : options.force;

  const toggle = typeof force === 'boolean' ? force : !util$1.hasModifier(...args);
  toggle ? util$1.addModifier(...args) : util$1.removeModifier(...args);
};

/**
 * @param {Element} el
 * @param {String} defaultClass
 * @param {Object} scheme
 */
util$1.restoreClass = (el, defaultClass, scheme) => {
  defaultClass.split(/\s+/).forEach(c => !el.classList.contains(c) && el.classList.add(c));
  el.hasAttribute('modifier') && ModifierUtil.refresh(el, scheme);
};

// TODO: FIX
util$1.updateParentPosition = el => {
  if (!el._parentUpdated && el.parentElement) {
    if (window.getComputedStyle(el.parentElement).getPropertyValue('position') === 'static') {
      el.parentElement.style.position = 'relative';
    }
    el._parentUpdated = true;
  }
};

util$1.toggleAttribute = (element, name, value) => {
  if (value) {
    element.setAttribute(name, typeof value === 'boolean' ? '' : value);
  } else {
    element.removeAttribute(name);
  }
};

util$1.bindListeners = (element, listenerNames) => {
  listenerNames.forEach(name => {
    const boundName = name.replace(/^_[a-z]/, '_bound' + name[1].toUpperCase());
    element[boundName] = element[boundName] || element[name].bind(element);
  });
};

util$1.each = (obj, f) => Object.keys(obj).forEach(key => f(key, obj[key]));

/**
 * @param {Element} target
 * @param {boolean} hasRipple
 * @param {Object} attrs
 */
util$1.updateRipple = (target, hasRipple, attrs = {}) => {
  if (hasRipple === undefined) {
    hasRipple = target.hasAttribute('ripple');
  }

  const rippleElement = util$1.findChild(target, 'ons-ripple');

  if (hasRipple) {
    if (!rippleElement) {
      const element = document.createElement('ons-ripple');
      Object.keys(attrs).forEach(key => element.setAttribute(key, attrs[key]));
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
util$1.animationOptionsParse = parse;

/**
 * @param {*} value
 */
util$1.isInteger = value => {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};

/**
 * @return {Object} Deferred promise.
 */
util$1.defer = () => {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
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
util$1.warn = (...args) => {
  if (!internal.config.warningsDisabled) {
    console.warn(...args);
  }
};

util$1.preventScroll = gd => {
  const prevent = e => e.cancelable && e.preventDefault();

  const clean = e => {
    gd.off('touchmove', prevent);
    gd.off('dragend', clean);
  };

  gd.on('touchmove', prevent);
  gd.on('dragend', clean);
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
const checkOptions = options => {
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
var actionSheet = ((options = {}) => {
  checkOptions(options);

  // Main component
  let actionSheet = util$1.createElement(`
    <ons-action-sheet
      ${options.title ? `title="${options.title}"` : ''}
      ${options.cancelable ? 'cancelable' : ''}
      ${options.modifier ? `modifier="${options.modifier}"` : ''}
      ${options.maskColor ? `mask-color="${options.maskColor}"` : ''}
      ${options.id ? `id="${options.id}"` : ''}
      ${options.class ? `class="${options.class}"` : ''}
    >
      <div class="action-sheet"></div>
    </ons-action-sheet>
  `);

  // Resolve action and clean up
  const deferred = util$1.defer();
  const resolver = (event, index = -1) => {
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
  const buttons = document.createDocumentFragment();
  options.buttons.forEach((item, index) => {
    const buttonOptions = typeof item === 'string' ? { label: item } : _extends({}, item);
    if (options.destructive === index) {
      buttonOptions.modifier = (buttonOptions.modifier || '') + ' destructive';
    }

    const button = util$1.createElement(`
      <ons-action-sheet-button
        ${buttonOptions.icon ? `icon="${buttonOptions.icon}"` : ''}
        ${buttonOptions.modifier ? `modifier="${buttonOptions.modifier}"` : ''}
      >
        ${buttonOptions.label}
      </ons-action-sheet-button>
    `);

    button.onclick = event => actionSheet.hide().then(() => resolver(event, index));
    buttons.appendChild(button);
  });

  // Finish component and attach
  util$1.findChild(actionSheet, '.action-sheet').appendChild(buttons);
  document.body.appendChild(actionSheet);
  options.compile && options.compile(el.dialog);

  // Show
  setImmediate(() => actionSheet.show({
    animation: options.animation,
    animationOptions: options.animationOptions
  }));

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

const create = () => {

  /**
   * @object ons.orientation
   * @category util
   * @description
   *   [en]Utility methods for orientation detection.[/en]
   *   [ja]画面のオリエンテーション検知のためのユーティリティメソッドを収めているオブジェクトです。[/ja]
   */
  const obj = {
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
      const isPortrait = window.innerWidth < window.innerHeight;

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
      const isPortrait = this._isPortrait();

      // Wait for the dimensions to change because
      // of Android inconsistency.
      let nIter = 0;
      const interval = setInterval(() => {
        nIter++;

        const w = window.innerWidth;
        const h = window.innerHeight;

        if (isPortrait && w <= h || !isPortrait && w >= h) {
          this.emit('change', { isPortrait: isPortrait });
          clearInterval(interval);
        } else if (nIter === 50) {
          this.emit('change', { isPortrait: isPortrait });
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

var orientation = create()._init();

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
  add: (element, ...modifiers) => modifiers.forEach(modifier => util$1.addModifier(element, modifier)),
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
  remove: (element, ...modifiers) => modifiers.forEach(modifier => util$1.removeModifier(element, modifier)),
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
  contains: util$1.hasModifier,
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
  toggle: util$1.toggleModifier
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

const softwareKeyboard = new MicroEvent();
softwareKeyboard._visible = false;

const onShow = () => {
  softwareKeyboard._visible = true;
  softwareKeyboard.emit('show');
};

const onHide = () => {
  softwareKeyboard._visible = false;
  softwareKeyboard.emit('hide');
};

const bindEvents = () => {
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

const noPluginError = () => {
  util$1.warn('ons-keyboard: Cordova Keyboard plugin is not present.');
};

document.addEventListener('deviceready', () => {
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

const util$2 = {
  _ready: false,

  _domContentLoaded: false,

  _onDOMContentLoaded: () => {
    util$2._domContentLoaded = true;

    if (platform$1.isWebView()) {
      window.document.addEventListener('deviceready', () => {
        util$2._ready = true;
      }, false);
    } else {
      util$2._ready = true;
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
window.addEventListener('DOMContentLoaded', () => util$2._onDOMContentLoaded(), false);

const HandlerRepository = {
  _store: {},

  _genId: (() => {
    let i = 0;
    return () => i++;
  })(),

  set: function set(element, handler) {
    if (element.dataset.deviceBackButtonHandlerId) {
      this.remove(element);
    }
    const id = element.dataset.deviceBackButtonHandlerId = HandlerRepository._genId();
    this._store[id] = handler;
  },

  remove: function remove(element) {
    if (element.dataset.deviceBackButtonHandlerId) {
      delete this._store[element.dataset.deviceBackButtonHandlerId];
      delete element.dataset.deviceBackButtonHandlerId;
    }
  },

  get: function get(element) {
    if (!element.dataset.deviceBackButtonHandlerId) {
      return undefined;
    }

    const id = element.dataset.deviceBackButtonHandlerId;

    if (!this._store[id]) {
      throw new Error();
    }

    return this._store[id];
  },

  has: function has(element) {
    if (!element.dataset) {
      return false;
    }

    const id = element.dataset.deviceBackButtonHandlerId;

    return !!this._store[id];
  }
};

class DeviceBackButtonDispatcher {
  constructor() {
    this._isEnabled = false;
    this._boundCallback = this._callback.bind(this);
  }

  /**
   * Enable to handle 'backbutton' events.
   */
  enable() {
    if (!this._isEnabled) {
      util$2.addBackButtonListener(this._boundCallback);
      this._isEnabled = true;
    }
  }

  /**
   * Disable to handle 'backbutton' events.
   */
  disable() {
    if (this._isEnabled) {
      util$2.removeBackButtonListener(this._boundCallback);
      this._isEnabled = false;
    }
  }

  /**
   * Fire a 'backbutton' event manually.
   */
  fireDeviceBackButtonEvent() {
    const event = document.createEvent('Event');
    event.initEvent('backbutton', true, true);
    document.dispatchEvent(event);
  }

  _callback() {
    this._dispatchDeviceBackButtonEvent();
  }

  /**
   * @param {HTMLElement} element
   * @param {Function} callback
   */
  createHandler(element, callback) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('element must be an instance of HTMLElement');
    }

    if (!(callback instanceof Function)) {
      throw new Error('callback must be an instance of Function');
    }

    const handler = {
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

  _dispatchDeviceBackButtonEvent() {
    const tree = this._captureTree();

    const element = this._findHandlerLeafElement(tree);

    let handler = HandlerRepository.get(element);
    handler._callback(createEvent(element));

    function createEvent(element) {
      return {
        _element: element,
        callParentHandler: function callParentHandler() {
          let parent = this._element.parentNode;

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
  _captureTree() {
    return createTree(document.body);

    function createTree(element) {
      const tree = {
        element: element,
        children: Array.prototype.concat.apply([], arrayOf(element.children).map(function (childElement) {

          if (childElement.style.display === 'none') {
            return [];
          }

          if (childElement.children.length === 0 && !HandlerRepository.has(childElement)) {
            return [];
          }

          const result = createTree(childElement);

          if (result.children.length === 0 && !HandlerRepository.has(result.element)) {
            return [];
          }

          return [result];
        }))
      };

      if (!HandlerRepository.has(tree.element)) {
        for (let i = 0; i < tree.children.length; i++) {
          const subTree = tree.children[i];
          if (HandlerRepository.has(subTree.element)) {
            return subTree;
          }
        }
      }

      return tree;
    }

    function arrayOf(target) {
      const result = [];
      for (let i = 0; i < target.length; i++) {
        result.push(target[i]);
      }
      return result;
    }
  }

  /**
   * @param {Object} tree
   * @return {HTMLElement}
   */
  _findHandlerLeafElement(tree) {
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

        const leftZ = parseInt(window.getComputedStyle(left, '').zIndex, 10);
        const rightZ = parseInt(window.getComputedStyle(right, '').zIndex, 10);

        if (!isNaN(leftZ) && !isNaN(rightZ)) {
          return leftZ > rightZ ? left : right;
        }

        throw new Error('Capturing backbutton-handler is failure.');
      }, null);
    }
  }
}

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

const generateId = function () {
  let i = 0;
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
class DoorLock {

  constructor(options = {}) {
    this._lockList = [];
    this._waitList = [];
    this._log = options.log || function () {};
  }

  /**
   * Register a lock.
   *
   * @return {Function} Callback for unlocking.
   */
  lock() {
    const unlock = () => {
      this._unlock(unlock);
    };
    unlock.id = generateId();
    this._lockList.push(unlock);
    this._log('lock: ' + unlock.id);

    return unlock;
  }

  _unlock(fn) {
    const index = this._lockList.indexOf(fn);
    if (index === -1) {
      throw new Error('This function is not registered in the lock list.');
    }

    this._lockList.splice(index, 1);
    this._log('unlock: ' + fn.id);

    this._tryToFreeWaitList();
  }

  _tryToFreeWaitList() {
    while (!this.isLocked() && this._waitList.length > 0) {
      this._waitList.shift()();
    }
  }

  /**
   * Register a callback for waiting unlocked door.
   *
   * @params {Function} callback Callback on unlocking the door completely.
   */
  waitUnlock(callback) {
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
  isLocked() {
    return this._lockList.length > 0;
  }
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
const readyMap = new WeakMap();
const queueMap = new WeakMap();

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
  const callbacks = queueMap.get(element, []) || [];
  queueMap.delete(element);
  callbacks.forEach(callback => callback());
}

function contentReady(element, fn = () => {}) {
  addCallback(element, fn);

  if (isContentReady(element)) {
    consumeQueue(element);
    return;
  }

  const observer = new MutationObserver(changes => {
    setContentReady(element);
    consumeQueue(element);
  });
  observer.observe(element, { childList: true, characterData: true });

  // failback for elements has empty content.
  setImmediate(() => {
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

// Default implementation for global PageLoader.
function loadPage({ page, parent, params = {} }, done) {
  internal.getPageHTMLAsync(page).then(html => {
    const pageElement = util$1.createElement(html);
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

class PageLoader {
  /**
   * @param {Function} [fn] Returns an object that has "element" property and "unload" function.
   */
  constructor(loader, unloader) {
    this._loader = loader instanceof Function ? loader : loadPage;
    this._unloader = unloader instanceof Function ? unloader : unloadPage;
  }

  /**
   * Set internal loader implementation.
   */
  set internalLoader(fn) {
    if (!(fn instanceof Function)) {
      throw Error('First parameter must be an instance of Function');
    }
    this._loader = fn;
  }

  get internalLoader() {
    return this._loader;
  }

  /**
   * @param {any} options.page
   * @param {Element} options.parent A location to load page.
   * @param {Object} [options.params] Extra parameters for ons-page.
   * @param {Function} done Take an object that has "element" property and "unload" function.
   */
  load({ page, parent, params = {} }, done) {
    this._loader({ page, parent, params }, pageElement => {
      if (!(pageElement instanceof Element)) {
        throw Error('pageElement must be an instance of Element.');
      }

      done(pageElement);
    });
  }

  unload(pageElement) {
    if (!(pageElement instanceof Element)) {
      throw Error('pageElement must be an instance of Element.');
    }

    this._unloader(pageElement);
  }
}

const defaultPageLoader = new PageLoader();

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

class BaseAnimator {

  /**
   * @param {Object} options
   * @param {String} options.timing
   * @param {Number} options.duration
   * @param {Number} options.delay
   */
  constructor(options = {}) {
    this.timing = options.timing || 'linear';
    this.duration = options.duration || 0;
    this.delay = options.delay || 0;
  }

  static extend(properties = {}) {
    const extendedAnimator = this;
    const newAnimator = function newAnimator() {
      extendedAnimator.apply(this, arguments);
      util$1.extend(this, properties);
    };

    newAnimator.prototype = this.prototype;
    return newAnimator;
  }
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

/**
 * @object ons
 * @category util
 * @description
 *   [ja]Onsen UIで利用できるグローバルなオブジェクトです。[/ja]
 *   [en]A global object that's used in Onsen UI. [/en]
 */
const ons = {};

ons._util = util$1;
ons.animit = Animit;
ons._deviceBackButtonDispatcher = deviceBackButtonDispatcher;
ons._internal = internal;
ons.GestureDetector = GestureDetector;
ons.platform = platform$1;
ons.softwareKeyboard = softwareKeyboard;
ons.pageAttributeExpression = pageAttributeExpression;
ons.orientation = orientation;
//ons.notification = notification;
ons.modifier = modifier;
ons._animationOptionsParser = parse;
ons._autoStyle = autoStyle;
ons._DoorLock = DoorLock;
ons._contentReady = contentReady;
ons.defaultPageLoader = defaultPageLoader;
ons.PageLoader = PageLoader;
ons._BaseAnimator = BaseAnimator;

ons._readyLock = new DoorLock();

ons.platform.select((window.location.search.match(/platform=([\w-]+)/) || [])[1]);

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
ons.isReady = () => {
  return !ons._readyLock.isLocked();
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
ons.isWebView = ons.platform.isWebView;

/**
 * @method ready
 * @signature ready(callback)
 * @description
 *   [ja]アプリの初期化に利用するメソッドです。渡された関数は、Onsen UIの初期化が終了している時点で必ず呼ばれます。[/ja]
 *   [en]Method used to wait for app initialization. Waits for `DOMContentLoaded` and `deviceready`, when necessary, before executing the callback.[/en]
 * @param {Function} callback
 *   [en]Function that executes after Onsen UI has been initialized.[/en]
 *   [ja]Onsen UIが初期化が完了した後に呼び出される関数オブジェクトを指定します。[/ja]
 */
ons.ready = callback => {
  if (ons.isReady()) {
    callback();
  } else {
    ons._readyLock.waitUnlock(callback);
  }
};

/**
 * @method setDefaultDeviceBackButtonListener
 * @signature setDefaultDeviceBackButtonListener(listener)
 * @param {Function} listener
 *   [en]Function that executes when device back button is pressed. Must be called on `ons.ready`.[/en]
 *   [ja]デバイスのバックボタンが押された時に実行される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Set default handler for device back button.[/en]
 *   [ja]デバイスのバックボタンのためのデフォルトのハンドラを設定します。[/ja]
 */
ons.setDefaultDeviceBackButtonListener = function (listener) {
  if (!ons.isReady()) {
    throw new Error('This method must be called after ons.isReady() is true.');
  }
  ons._defaultDeviceBackButtonHandler.setListener(listener);
};

/**
 * @method disableDeviceBackButtonHandler
 * @signature disableDeviceBackButtonHandler()
 * @description
 * [en]Disable device back button event handler. Must be called on `ons.ready`.[/en]
 * [ja]デバイスのバックボタンのイベントを受け付けないようにします。[/ja]
 */
ons.disableDeviceBackButtonHandler = function () {
  if (!ons.isReady()) {
    throw new Error('This method must be called after ons.isReady() is true.');
  }
  ons._deviceBackButtonDispatcher.disable();
};

/**
 * @method enableDeviceBackButtonHandler
 * @signature enableDeviceBackButtonHandler()
 * @description
 * [en]Enable device back button event handler. Must be called on `ons.ready`.[/en]
 * [ja]デバイスのバックボタンのイベントを受け付けるようにします。[/ja]
 */
ons.enableDeviceBackButtonHandler = function () {
  if (!ons.isReady()) {
    throw new Error('This method must be called after ons.isReady() is true.');
  }
  ons._deviceBackButtonDispatcher.enable();
};

/**
 * @method enableAutoStatusBarFill
 * @signature enableAutoStatusBarFill()
 * @description
 *   [en]Enable status bar fill feature on iOS7 and above. Must be called before `ons.ready`.[/en]
 *   [ja]iOS7以上で、ステータスバー部分の高さを自動的に埋める処理を有効にします。[/ja]
 */
ons.enableAutoStatusBarFill = () => {
  if (ons.isReady()) {
    throw new Error('This method must be called before ons.isReady() is true.');
  }
  internal.config.autoStatusBarFill = true;
};

/**
 * @method disableAutoStatusBarFill
 * @signature disableAutoStatusBarFill()
 * @description
 *   [en]Disable status bar fill feature on iOS7 and above. Must be called before `ons.ready`.[/en]
 *   [ja]iOS7以上で、ステータスバー部分の高さを自動的に埋める処理を無効にします。[/ja]
 */
ons.disableAutoStatusBarFill = () => {
  if (ons.isReady()) {
    throw new Error('This method must be called before ons.isReady() is true.');
  }
  internal.config.autoStatusBarFill = false;
};

/**
 * @method mockStatusBar
 * @signature mockStatusBar()
 * @description
 *   [en]Creates a static element similar to iOS status bar. Only useful for browser testing. Must be called before `ons.ready`.[/en]
 *   [ja][/ja]
 */
ons.mockStatusBar = () => {
  if (ons.isReady()) {
    throw new Error('This method must be called before ons.isReady() is true.');
  }

  if (!document.body.children[0] || !document.body.children[0].classList.contains('ons-status-bar-mock')) {
    document.body.insertBefore(util$1.createElement(`
      <div class="ons-status-bar-mock">
        <div style="padding-left: 5px">No SIM</div>
        <div>12:28 PM</div>
        <div style="padding-right: 15px">80%</div>
      </div>
    `), document.body.firstChild);
  }
};

/**
 * @method disableAnimations
 * @signature disableAnimations()
 * @description
 *   [en]Disable all animations. Could be handy for testing and older devices.[/en]
 *   [ja]アニメーションを全て無効にします。テストの際に便利です。[/ja]
 */
ons.disableAnimations = () => {
  internal.config.animationsDisabled = true;
};

/**
 * @method enableAnimations
 * @signature enableAnimations()
 * @description
 *   [en]Enable animations (default).[/en]
 *   [ja]アニメーションを有効にします。[/ja]
 */
ons.enableAnimations = () => {
  internal.config.animationsDisabled = false;
};

ons._disableWarnings = () => {
  internal.config.warningsDisabled = true;
};

ons._enableWarnings = () => {
  internal.config.warningsDisabled = false;
};

/**
 * @method disableAutoStyling
 * @signature disableAutoStyling()
 * @description
 *   [en]Disable automatic styling.[/en]
 *   [ja][/ja]
 */
ons.disableAutoStyling = ons._autoStyle.disable;

/**
 * @method enableAutoStyling
 * @signature enableAutoStyling()
 * @description
 *   [en]Enable automatic styling based on OS (default).[/en]
 *   [ja][/ja]
 */
ons.enableAutoStyling = ons._autoStyle.enable;

/**
 * @method forcePlatformStyling
 * @signature forcePlatformStyling(platform)
 * @description
 *   [en]Refresh styling for the given platform. Only useful for demos. Use `ons.platform.select(...)` instead for development and production.[/en]
 *   [ja][/ja]
 * @param {string} platform New platform to style the elements.
 */
ons.forcePlatformStyling = newPlatform => {
  ons.enableAutoStyling();
  ons.platform.select(newPlatform || 'ios');

  ons._util.arrayFrom(document.querySelectorAll('*')).forEach(function (element) {
    if (element.tagName.toLowerCase() === 'ons-if') {
      element._platformUpdate();
    } else if (element.tagName.match(/^ons-/i)) {
      ons._autoStyle.prepare(element, true);
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
ons.preload = function (templates = []) {
  return Promise.all((templates instanceof Array ? templates : [templates]).map(template => {
    if (typeof template !== 'string') {
      throw new Error('Expected string arguments but got ' + typeof template);
    }
    return ons._internal.getTemplateHTMLAsync(template);
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
ons.createElement = (template, options = {}) => {
  template = template.trim();

  const create = html => {
    const element = ons._util.createElement(html);
    element.remove();

    if (options.append) {
      const target = options.append instanceof HTMLElement ? options.append : document.body;
      target.insertBefore(element, options.insertBefore || null);

      if (options.link instanceof Function) {
        options.link(element);
      }
    }

    return element;
  };

  return template.charAt(0) === '<' ? create(template) : ons._internal.getPageHTMLAsync(template).then(create);
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
ons.createPopover = ons.createDialog = ons.createAlertDialog = (template, options = {}) => ons.createElement(template, Object.assign({ append: true }, options));

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
ons.openActionSheet = actionSheet;

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
ons.resolveLoadingPlaceholder = (page, link) => {
  const elements = ons._util.arrayFrom(window.document.querySelectorAll('[ons-loading-placeholder]'));
  if (elements.length === 0) {
    throw new Error('No ons-loading-placeholder exists.');
  }

  elements.filter(element => !element.getAttribute('page')).forEach(element => {
    element.setAttribute('ons-loading-placeholder', page);
    ons._resolveLoadingPlaceholder(element, page, link);
  });
};

ons._setupLoadingPlaceHolders = function () {
  ons.ready(() => {
    const elements = ons._util.arrayFrom(window.document.querySelectorAll('[ons-loading-placeholder]'));

    elements.forEach(element => {
      const page = element.getAttribute('ons-loading-placeholder');
      if (typeof page === 'string') {
        ons._resolveLoadingPlaceholder(element, page);
      }
    });
  });
};

ons._resolveLoadingPlaceholder = function (element, page, link) {
  link = link || function (element, done) {
    done();
  };
  ons._internal.getPageHTMLAsync(page).then(html => {

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    const contentElement = ons._util.createElement('<div>' + html + '</div>');
    contentElement.style.display = 'none';

    element.appendChild(contentElement);

    link(contentElement, function () {
      contentElement.style.display = '';
    });
  }).catch(error => {
    throw new Error('Unabled to resolve placeholder: ' + error);
  });
};

function waitDeviceReady() {
  const unlockDeviceReady = ons._readyLock.lock();
  window.addEventListener('DOMContentLoaded', () => {
    if (ons.isWebView()) {
      window.document.addEventListener('deviceready', unlockDeviceReady, false);
    } else {
      unlockDeviceReady();
    }
  }, false);
}

/**
 * @method getScriptPage
 * @signature getScriptPage()
 * @description
 *   [en]Access the last created page from the current `script` scope. Only works inside `<script></script>` tags that are direct children of `ons-page` element. Use this to add lifecycle hooks to a page.[/en]
 *   [ja][/ja]
 * @return {HTMLElement}
 *   [en]Returns the corresponding page element.[/en]
 *   [ja][/ja]
 */
const getCS = 'currentScript' in document ? () => document.currentScript : () => document.scripts[document.scripts.length - 1];
ons.getScriptPage = () => getCS() && /ons-page/i.test(getCS().parentElement.tagName) && getCS().parentElement || null;

window._superSecretOns = ons;

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
    const BaseElement = () => {};
    BaseElement.prototype = document.createElement('div');
    return BaseElement;
  } else {
    return HTMLElement;
  }
}

class BaseElement extends getElementClass() {
  constructor() {
    super();
  }
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

const scheme = { '': 'button--*' };

const defaultClassName = 'button';

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

class ButtonElement extends BaseElement {

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

  constructor() {
    super();

    this._compile();
  }

  static get observedAttributes() {
    return ['modifier', 'ripple', 'class'];
  }

  attributeChangedCallback(name, last, current) {
    switch (name) {
      case 'class':
        util$1.restoreClass(this, defaultClassName, scheme);
        break;
      case 'modifier':
        ModifierUtil.onModifierChanged(last, current, this, scheme);
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
  set disabled(value) {
    return util$1.toggleAttribute(this, 'disabled', value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  _compile() {
    autoStyle.prepare(this);

    this.classList.add(defaultClassName);

    this._updateRipple();

    ModifierUtil.initModifier(this, scheme);
  }

  _updateRipple() {
    util$1.updateRipple(this);
  }
}

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

const defaultClassName$1 = 'list-item';
const scheme$1 = {
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
class ListItemElement extends BaseElement {

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

  constructor() {
    super();

    contentReady(this, () => {
      this._compile();
    });
  }

  _compile() {
    autoStyle.prepare(this);

    this.classList.add(defaultClassName$1);

    let left, center, right;

    for (let i = 0; i < this.children.length; i++) {
      const el = this.children[i];

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
        for (let i = this.childNodes.length - 1; i >= 0; i--) {
          const el = this.childNodes[i];
          if (el !== left && el !== right) {
            center.insertBefore(el, center.firstChild);
          }
        }
      }

      this.insertBefore(center, right || null);
    }

    center.classList.add('center');
    center.classList.add('list-item__center');

    this._updateRipple();

    ModifierUtil.initModifier(this, scheme$1);
  }

  static get observedAttributes() {
    return ['modifier', 'class', 'ripple'];
  }

  attributeChangedCallback(name, last, current) {
    switch (name) {
      case 'class':
        util$1.restoreClass(this, defaultClassName$1, scheme$1);
        break;
      case 'modifier':
        ModifierUtil.onModifierChanged(last, current, this, scheme$1);
        break;
      case 'ripple':
        this._updateRipple();
        break;
    }
  }

  connectedCallback() {
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

  disconnectedCallback() {
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

  get _transition() {
    return 'background-color 0.0s linear 0.02s, box-shadow 0.0s linear 0.02s';
  }

  get _tappable() {
    return this.hasAttribute('tappable');
  }

  get _tapBackgroundColor() {
    return this.getAttribute('tap-background-color') || '#d9d9d9';
  }

  _updateRipple() {
    util$1.updateRipple(this);
  }

  _onDrag(event) {
    const gesture = event.gesture;
    // Prevent vertical scrolling if the users pans left or right.
    if (this._shouldLockOnDrag() && ['left', 'right'].indexOf(gesture.direction) > -1) {
      gesture.preventDefault();
    }
  }

  _onTouch() {
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
      this.style.boxShadow = `0px -1px 0px 0px ${this._tapBackgroundColor}`;
    }
  }

  _onRelease() {
    this.tapped = false;

    this.style.transition = '';
    this.style.webkitTransition = '';
    this.style.MozTransition = '';

    this.style.backgroundColor = this._originalBackgroundColor || '';
    this.style.boxShadow = '';
  }

  _shouldLockOnDrag() {
    return this.hasAttribute('lock-on-drag');
  }
}

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

const defaultClassName$2 = 'list';
const scheme$2 = { '': 'list--*' };

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
class ListElement extends BaseElement {

  /**
   * @attribute modifier
   * @type {String}
   * @description
   *   [en]The appearance of the list.[/en]
   *   [ja]リストの表現を指定します。[/ja]
   */

  constructor() {
    super();

    this._compile();
  }

  _compile() {
    autoStyle.prepare(this);
    this.classList.add(defaultClassName$2);
    ModifierUtil.initModifier(this, scheme$2);
  }

  static get observedAttributes() {
    return ['modifier', 'class'];
  }

  attributeChangedCallback(name, last, current) {
    switch (name) {
      case 'class':
        util$1.restoreClass(this, defaultClassName$2, scheme$2);
        break;
      case 'modifier':
        ModifierUtil.onModifierChanged(last, current, this, scheme$2);
        break;
    }
  }
}

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

const defaultClassName$3 = 'toolbar';

const scheme$3 = {
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

class ToolbarElement extends BaseElement {

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

  constructor() {
    super();

    contentReady(this, () => {
      this._compile();
    });
  }

  static get observedAttributes() {
    return ['modifier', 'class'];
  }

  attributeChangedCallback(name, last, current) {
    switch (name) {
      case 'class':
        util$1.restoreClass(this, defaultClassName$3, scheme$3);
        break;
      case 'modifier':
        ModifierUtil.onModifierChanged(last, current, this, scheme$3);
        break;
    }
  }

  /**
   * @return {HTMLElement}
   */
  _getToolbarLeftItemsElement() {
    return this.querySelector('.left') || internal.nullElement;
  }

  /**
   * @return {HTMLElement}
   */
  _getToolbarCenterItemsElement() {
    return this.querySelector('.center') || internal.nullElement;
  }

  /**
   * @return {HTMLElement}
   */
  _getToolbarRightItemsElement() {
    return this.querySelector('.right') || internal.nullElement;
  }

  /**
   * @return {HTMLElement}
   */
  _getToolbarBackButtonLabelElement() {
    return this.querySelector('ons-back-button .back-button__label') || internal.nullElement;
  }

  /**
   * @return {HTMLElement}
   */
  _getToolbarBackButtonIconElement() {
    return this.querySelector('ons-back-button .back-button__icon') || internal.nullElement;
  }

  _compile() {
    autoStyle.prepare(this);
    this.classList.add(defaultClassName$3);
    this._ensureToolbarItemElements();
    ModifierUtil.initModifier(this, scheme$3);
  }

  _ensureToolbarItemElements() {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      // case of not element
      if (this.childNodes[i].nodeType != 1) {
        this.removeChild(this.childNodes[i]);
      }
    }

    const center = this._ensureToolbarElement('center');
    center.classList.add('toolbar__title');

    if (this.children.length !== 1 || !this.children[0].classList.contains('center')) {
      const left = this._ensureToolbarElement('left');
      const right = this._ensureToolbarElement('right');

      if (this.children[0] !== left || this.children[1] !== center || this.children[2] !== right) {
        this.appendChild(left);
        this.appendChild(center);
        this.appendChild(right);
      }
    }
  }

  _ensureToolbarElement(name) {
    if (util$1.findChild(this, '.toolbar__' + name)) {
      const element = util$1.findChild(this, '.toolbar__' + name);
      element.classList.add(name);
      return element;
    }

    const element = util$1.findChild(this, '.' + name) || util$1.create('.' + name);
    element.classList.add('toolbar__' + name);

    return element;
  }
}

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

const defaultClassName$4 = 'page';
const scheme$4 = {
  '': 'page--*',
  '.page__content': 'page--*__content',
  '.page__background': 'page--*__background'
};

const nullToolbarElement = document.createElement('ons-toolbar'); // requires that 'ons-toolbar' element is registered

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
class PageElement extends BaseElement {

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

  constructor() {
    super();

    this._deriveHooks();

    this.classList.add(defaultClassName$4);
    this._initialized = false;

    contentReady(this, () => {
      this._compile();

      this._isShown = false;
      this._contentElement = this._getContentElement();
      this._backgroundElement = this._getBackgroundElement();
    });
  }

  connectedCallback() {
    if (this._initialized) {
      return;
    }

    this._initialized = true;

    contentReady(this, () => {
      setImmediate(() => {
        this.onInit && this.onInit();
        util$1.triggerElementEvent(this, 'init');
      });

      if (!util$1.hasAnyComponentAsParent(this)) {
        setImmediate(() => this._show());
      }

      this._tryToFillStatusBar();

      if (this.hasAttribute('on-infinite-scroll')) {
        this.attributeChangedCallback('on-infinite-scroll', null, this.getAttribute('on-infinite-scroll'));
      }
    });
  }

  updateBackButton(show) {
    if (this.backButton) {
      show ? this.backButton.show() : this.backButton.hide();
    }
  }

  set name(str) {
    this.setAttribute('name', str);
  }

  get name() {
    return this.getAttribute('name');
  }

  get backButton() {
    return this.querySelector('ons-back-button');
  }

  _tryToFillStatusBar() {
    internal.autoStatusBarFill(() => {
      const filled = util$1.findParent(this, e => e.hasAttribute('status-bar-fill'), e => !e.nodeName.match(/ons-modal/i));
      util$1.toggleAttribute(this, 'status-bar-fill', !filled && (this._canAnimateToolbar() || !this._hasAPageControlChild()));
    });
  }

  _hasAPageControlChild() {
    return util$1.findChild(this._contentElement, util$1.isPageControl);
  }

  /**
   * @property onInfiniteScroll
   * @description
   *  [en]Function to be executed when scrolling to the bottom of the page. The function receives a done callback as an argument that must be called when it's finished.[/en]
   *  [ja][/ja]
   */
  set onInfiniteScroll(value) {
    if (value && !(value instanceof Function)) {
      throw new Error('onInfiniteScroll must be a function or null');
    }

    contentReady(this, () => {
      if (!value) {
        this._contentElement.removeEventListener('scroll', this._boundOnScroll);
      } else if (!this._onInfiniteScroll) {
        this._infiniteScrollLimit = 0.9;
        this._boundOnScroll = this._onScroll.bind(this);
        setImmediate(() => this._contentElement.addEventListener('scroll', this._boundOnScroll));
      }
      this._onInfiniteScroll = value;
    });
  }

  get onInfiniteScroll() {
    return this._onInfiniteScroll;
  }

  _onScroll() {
    const c = this._contentElement,
          overLimit = (c.scrollTop + c.clientHeight) / c.scrollHeight >= this._infiniteScrollLimit;

    if (this._onInfiniteScroll && !this._loadingContent && overLimit) {
      this._loadingContent = true;
      this._onInfiniteScroll(() => this._loadingContent = false);
    }
  }

  /**
   * @property onDeviceBackButton
   * @type {Object}
   * @description
   *   [en]Back-button handler.[/en]
   *   [ja]バックボタンハンドラ。[/ja]
   */
  get onDeviceBackButton() {
    return this._backButtonHandler;
  }

  set onDeviceBackButton(callback) {
    if (this._backButtonHandler) {
      this._backButtonHandler.destroy();
    }

    this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
  }

  get scrollTop() {
    return this._contentElement.scrollTop;
  }

  set scrollTop(newValue) {
    this._contentElement.scrollTop = newValue;
  }

  /**
   * @return {HTMLElement}
   */
  _getContentElement() {
    const result = util$1.findChild(this, '.page__content');
    if (result) {
      return result;
    }
    throw Error('fail to get ".page__content" element.');
  }

  /**
   * @return {Boolean}
   */
  _canAnimateToolbar() {
    if (util$1.findChild(this, 'ons-toolbar')) {
      return true;
    }
    return !!util$1.findChild(this._contentElement, el => {
      return util$1.match(el, 'ons-toolbar') && !el.hasAttribute('inline');
    });
  }

  /**
   * @return {HTMLElement}
   */
  _getBackgroundElement() {
    const result = util$1.findChild(this, '.page__background');
    if (result) {
      return result;
    }
    throw Error('fail to get ".page__background" element.');
  }

  /**
   * @return {HTMLElement}
   */
  _getBottomToolbarElement() {
    return util$1.findChild(this, 'ons-bottom-toolbar') || internal.nullElement;
  }

  /**
   * @return {HTMLElement}
   */
  _getToolbarElement() {
    return util$1.findChild(this, 'ons-toolbar') || nullToolbarElement;
  }

  static get observedAttributes() {
    return ['modifier', 'on-infinite-scroll', 'class'];
  }

  attributeChangedCallback(name, last, current) {
    switch (name) {
      case 'class':
        util$1.restoreClass(this, defaultClassName$4, scheme$4);
        break;
      case 'modifier':
        ModifierUtil.onModifierChanged(last, current, this, scheme$4);
        break;
      case 'on-infinite-scroll':
        if (current === null) {
          this.onInfiniteScroll = null;
        } else {
          this.onInfiniteScroll = done => {
            const f = util$1.findFromPath(current);
            this.onInfiniteScroll = f;
            f(done);
          };
        }
        break;
    }
  }

  _compile() {
    autoStyle.prepare(this);

    const toolbar = util$1.findChild(this, 'ons-toolbar');

    const background = util$1.findChild(this, '.page__background') || util$1.findChild(this, '.background') || document.createElement('div');
    background.classList.add('page__background');
    this.insertBefore(background, !toolbar && this.firstChild || toolbar && toolbar.nextSibling);

    const content = util$1.findChild(this, '.page__content') || util$1.findChild(this, '.content') || document.createElement('div');
    content.classList.add('page__content');
    if (!content.parentElement) {
      util$1.arrayFrom(this.childNodes).forEach(node => {
        if (node.nodeType !== 1 || this._elementShouldBeMoved(node)) {
          content.appendChild(node);
        }
      });
    }
    this.insertBefore(content, background.nextSibling);

    // Make wrapper pages transparent for animations
    if (!background.style.backgroundColor && content.children.length === 1 && util$1.isPageControl(content.children[0])) {
      background.style.backgroundColor = 'transparent';
    }

    ModifierUtil.initModifier(this, scheme$4);
  }

  _elementShouldBeMoved(el) {
    if (el.classList.contains('page__background')) {
      return false;
    }
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'ons-fab') {
      return !el.hasAttribute('position');
    }
    const fixedElements = ['script', 'ons-toolbar', 'ons-bottom-toolbar', 'ons-modal', 'ons-speed-dial', 'ons-dialog', 'ons-alert-dialog', 'ons-popover', 'ons-action-sheet'];
    return el.hasAttribute('inline') || fixedElements.indexOf(tagName) === -1;
  }

  _show() {
    if (!this._isShown && util$1.isAttached(this)) {
      this._isShown = true;
      this.onShow && this.onShow();
      util$1.triggerElementEvent(this, 'show');
      util$1.propagateAction(this, '_show');
    }
  }

  _hide() {
    if (this._isShown) {
      this._isShown = false;
      this.onHide && this.onHide();
      util$1.triggerElementEvent(this, 'hide');
      util$1.propagateAction(this, '_hide');
    }
  }

  _destroy() {
    this._hide();

    this.onDestroy && this.onDestroy();
    util$1.triggerElementEvent(this, 'destroy');

    if (this.onDeviceBackButton) {
      this.onDeviceBackButton.destroy();
    }

    util$1.propagateAction(this, '_destroy');

    this.remove();
  }

  _deriveHooks() {
    this.constructor.events.forEach(event => {
      const key = 'on' + event.charAt(0).toUpperCase() + event.slice(1);
      Object.defineProperty(this, key, {
        enumerable: true,
        get: () => this[`_${key}`],
        set: value => {
          if (!(value instanceof Function)) {
            throw new Error(`${key} hook must be a function`);
          }
          this[`_${key}`] = value.bind(this);
        }
      });
    });
  }

  static get events() {
    return ['init', 'show', 'hide', 'destroy'];
  }

  /**
   * @property data
   * @type {*}
   * @description
   *   [en]User's custom data passed to `pushPage()`-like methods.[/en]
   *   [ja][/ja]
   */
}

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

const scheme$5 = {
  '.progress-bar': 'progress-bar--*',
  '.progress-bar__primary': 'progress-bar--*__primary',
  '.progress-bar__secondary': 'progress-bar--*__secondary'
};

const template = util$1.createElement(`
  <div class="progress-bar">
    <div class="progress-bar__secondary"></div>
    <div class="progress-bar__primary"></div>
  </div>
`);

const INDET = 'indeterminate';

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
class ProgressBarElement extends BaseElement {

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

  constructor() {
    super();

    contentReady(this, () => this._compile());
  }

  _compile() {
    if (!this._isCompiled()) {
      this._template = template.cloneNode(true);
    } else {
      this._template = util$1.findChild(this, '.progress-bar');
    }

    this._primary = util$1.findChild(this._template, '.progress-bar__primary');
    this._secondary = util$1.findChild(this._template, '.progress-bar__secondary');

    this._updateDeterminate();
    this._updateValue();

    this.appendChild(this._template);

    autoStyle.prepare(this);
    ModifierUtil.initModifier(this, scheme$5);
  }

  _isCompiled() {
    if (!util$1.findChild(this, '.progress-bar')) {
      return false;
    }

    const barElement = util$1.findChild(this, '.progress-bar');

    if (!util$1.findChild(barElement, '.progress-bar__secondary')) {
      return false;
    }

    if (!util$1.findChild(barElement, '.progress-bar__primary')) {
      return false;
    }

    return true;
  }

  static get observedAttributes() {
    return ['modifier', 'value', 'secondary-value', INDET];
  }

  attributeChangedCallback(name, last, current) {
    if (name === 'modifier') {
      ModifierUtil.onModifierChanged(last, current, this, scheme$5);
      this.hasAttribute(INDET) && this._updateDeterminate();
    } else if (name === 'value' || name === 'secondary-value') {
      this._updateValue();
    } else if (name === INDET) {
      this._updateDeterminate();
    }
  }

  _updateDeterminate() {
    contentReady(this, () => util$1.toggleModifier(this, INDET, { force: this.hasAttribute(INDET) }));
  }

  _updateValue() {
    contentReady(this, () => {
      this._primary.style.width = this.hasAttribute('value') ? this.getAttribute('value') + '%' : '0%';
      this._secondary.style.width = this.hasAttribute('secondary-value') ? this.getAttribute('secondary-value') + '%' : '0%';
    });
  }

  /**
   * @property value
   * @type {Number}
   * @description
   *   [en]Current progress. Should be a value between 0 and 100.[/en]
   *   [ja]現在の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
   */
  set value(value) {
    if (typeof value !== 'number' || value < 0 || value > 100) {
      throw new Error('Invalid value');
    }

    this.setAttribute('value', Math.floor(value));
  }

  get value() {
    return parseInt(this.getAttribute('value') || '0');
  }

  /**
   * @property secondaryValue
   * @type {Number}
   * @description
   *   [en]Current secondary progress. Should be a value between 0 and 100.[/en]
   *   [ja]現在の２番目の進行状況の値を指定します。0から100の間の値を指定して下さい。[/ja]
   */
  set secondaryValue(value) {
    if (typeof value !== 'number' || value < 0 || value > 100) {
      throw new Error('Invalid value');
    }

    this.setAttribute('secondary-value', Math.floor(value));
  }

  get secondaryValue() {
    return parseInt(this.getAttribute('secondary-value') || '0');
  }

  /**
   * @property indeterminate
   * @type {Boolean}
   * @description
   *   [en]If this property is `true`, an infinite looping animation will be shown.[/en]
   *   [ja]この属性が設定された場合、ループするアニメーションが表示されます。[/ja]
   */
  set indeterminate(value) {
    if (value) {
      this.setAttribute(INDET, '');
    } else {
      this.removeAttribute(INDET);
    }
  }

  get indeterminate() {
    return this.hasAttribute(INDET);
  }
}

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

const rewritables = {
  /**
   * @param {Element} element
   * @param {Function} callback
   */
  ready(element, callback) {
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
class SplitterContentElement extends BaseElement {

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

  constructor() {
    super();

    this._page = null;
    this._pageLoader = defaultPageLoader;

    contentReady(this, () => {
      rewritables.ready(this, () => {
        const page = this._getPageTarget();

        if (page) {
          this.load(page);
        }
      });
    });
  }

  connectedCallback() {
    if (!util$1.match(this.parentNode, 'ons-splitter')) {
      throw new Error(`"ons-splitter-content" must have "ons-splitter" as parentNode.`);
    }
  }

  _getPageTarget() {
    return this._page || this.getAttribute('page');
  }

  disconnectedCallback() {}

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, last, current) {}

  /**
   * @property page
   * @type {HTMLElement}
   * @description
   *   [en]The page to load in the splitter content.[/en]
   *   [ja]この要素内に表示するページを指定します。[/ja]
   */
  get page() {
    return this._page;
  }

  /**
   * @param {*} page
   */
  set page(page) {
    this._page = page;
  }

  get _content() {
    return this.children[0];
  }

  /**
   * @property pageLoader
   * @type {Function}
   * @description
   *   [en]Page element loaded in the splitter content.[/en]
   *   [ja]この要素内に表示するページを指定します。[/ja]
   */
  get pageLoader() {
    return this._pageLoader;
  }

  set pageLoader(loader) {
    if (!(loader instanceof PageLoader)) {
      throw Error('First parameter must be an instance of PageLoader');
    }
    this._pageLoader = loader;
  }

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
  load(page, options = {}) {
    this._page = page;
    const callback = options.callback || function () {};

    return new Promise(resolve => {
      let oldContent = this._content || null;

      this._pageLoader.load({ page, parent: this }, pageElement => {
        if (oldContent) {
          this._pageLoader.unload(oldContent);
          oldContent = null;
        }

        setImmediate(() => this._show());

        callback(pageElement);
        resolve(pageElement);
      });
    });
  }

  _show() {
    if (this._content) {
      this._content._show();
    }
  }

  _hide() {
    if (this._content) {
      this._content._hide();
    }
  }

  _destroy() {
    if (this._content) {
      this._pageLoader.unload(this._content);
    }
    this.remove();
  }

  static get rewritables() {
    return rewritables;
  }
}

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

class SplitterMaskElement extends BaseElement {

  constructor() {
    super();

    this._boundOnClick = this._onClick.bind(this);
    contentReady(this, () => {
      if (this.parentNode._sides.every(side => side.mode === 'split')) {
        this.setAttribute('style', 'display: none !important');
      }
    });
  }

  _onClick(event) {
    if (this.onClick instanceof Function) {
      this.onClick();
    } else if (util$1.match(this.parentNode, 'ons-splitter')) {
      this.parentNode._sides.forEach(side => side.close('left').catch(() => {}));
    }
    event.stopPropagation();
  }

  _preventScroll(e) {
    e.cancelable && e.preventDefault(); // Fix for iOS. Prevents scrolling content behind mask.
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, last, current) {}

  connectedCallback() {
    this.addEventListener('click', this._boundOnClick);
    this.addEventListener('touchmove', this._preventScroll);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._boundOnClick);
    this.removeEventListener('touchmove', this._preventScroll);
  }
}

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

class SplitterAnimator$1 extends BaseAnimator {

  constructor({ timing = 'cubic-bezier(.1, .7, .1, 1)', duration = 0.3, delay = 0 } = {}) {
    super({ timing, duration, delay });
  }

  updateOptions(options = {}) {
    util$1.extend(this, {
      timing: this.timing, duration: this.duration, delay: this.delay
    }, options);
  }

  /**
   * @param {Element} sideElement
   */
  activate(sideElement) {
    const splitter = sideElement.parentNode;

    contentReady(splitter, () => {
      this._side = sideElement;
      this._oppositeSide = splitter.right !== sideElement && splitter.right || splitter.left !== sideElement && splitter.left;
      this._content = splitter.content;
      this._mask = splitter.mask;
    });
  }

  deactivate() {
    this.clearTransition();
    this._mask && this.clearMask();
    this._content = this._side = this._oppositeSide = this._mask = null;
  }

  get minus() {
    return this._side._side === 'right' ? '-' : '';
  }

  clearTransition() {
    this._side && (this._side.style.transform = this._side.style.transition = this._side.style.webkitTransition = '');
    this._mask && (this._mask.style.transform = this._mask.style.transition = this._mask.style.webkitTransition = '');
    this._content && (this._content.style.transform = this._content.style.transition = this._content.style.webkitTransition = '');
  }

  clearMask() {
    // Check if the other side needs the mask before clearing
    if (!this._oppositeSide || this._oppositeSide.mode === 'split' || !this._oppositeSide.isOpen) {
      this._mask.style.opacity = '';
      this._mask.style.display = 'none';
    }
  }

  /**
   * @param {Number} distance
   */
  translate(distance) {}

  /**
   * @param {Function} done
   */
  open(done) {
    done();
  }

  /**
   * @param {Function} done
   */
  close(done) {
    done();
  }
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

class OverlaySplitterAnimator extends SplitterAnimator$1 {

  translate(distance) {
    this._mask.style.display = 'block'; // Avoid content clicks

    Animit(this._side).queue({
      transform: `translate3d(${this.minus + distance}px, 0px, 0px)`
    }).play();
  }

  /**
   * @param {Function} done
   */
  open(done) {
    Animit.runAll(Animit(this._side).wait(this.delay).queue({
      transform: `translate3d(${this.minus}100%, 0px, 0px)`
    }, {
      duration: this.duration,
      timing: this.timing
    }).queue(callback => {
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
  close(done) {

    Animit.runAll(Animit(this._side).wait(this.delay).queue({
      transform: 'translate3d(0px, 0px, 0px)'
    }, {
      duration: this.duration,
      timing: this.timing
    }).queue(callback => {
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

class PushSplitterAnimator extends SplitterAnimator$1 {

  _getSlidingElements() {
    const slidingElements = [this._side, this._content];
    if (this._oppositeSide && this._oppositeSide.mode === 'split') {
      slidingElements.push(this._oppositeSide);
    }

    return slidingElements;
  }

  translate(distance) {
    if (!this._slidingElements) {
      this._slidingElements = this._getSlidingElements();
    }

    this._mask.style.display = 'block'; // Avoid content clicks

    Animit(this._slidingElements).queue({
      transform: `translate3d(${this.minus + distance}px, 0px, 0px)`
    }).play();
  }

  /**
   * @param {Function} done
   */
  open(done) {
    const max = this._side.offsetWidth;
    this._slidingElements = this._getSlidingElements();

    Animit.runAll(Animit(this._slidingElements).wait(this.delay).queue({
      transform: `translate3d(${this.minus + max}px, 0px, 0px)`
    }, {
      duration: this.duration,
      timing: this.timing
    }).queue(callback => {
      this._slidingElements = null;
      callback();
      done && done();
    }), Animit(this._mask).wait(this.delay).queue({
      display: 'block'
    }));
  }

  /**
   * @param {Function} done
   */
  close(done) {
    this._slidingElements = this._getSlidingElements();

    Animit.runAll(Animit(this._slidingElements).wait(this.delay).queue({
      transform: 'translate3d(0px, 0px, 0px)'
    }, {
      duration: this.duration,
      timing: this.timing
    }).queue(callback => {
      this._slidingElements = null;
      super.clearTransition();
      done && done();
      callback();
    }), Animit(this._mask).wait(this.delay).queue({
      display: 'none'
    }));
  }
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

class RevealSplitterAnimator extends SplitterAnimator$1 {

  _getSlidingElements() {
    const slidingElements = [this._content, this._mask];
    if (this._oppositeSide && this._oppositeSide.mode === 'split') {
      slidingElements.push(this._oppositeSide);
    }

    return slidingElements;
  }

  activate(sideElement) {
    super.activate(sideElement);
    this.maxWidth = this._getMaxWidth();
    if (sideElement.mode === 'collapse') {
      this._setStyles(sideElement);
    }
  }

  deactivate() {
    this._side && this._unsetStyles(this._side);
    super.deactivate();
  }

  _setStyles(sideElement) {
    sideElement.style.left = sideElement.side === 'right' ? 'auto' : 0;
    sideElement.style.right = sideElement.side === 'right' ? 0 : 'auto';
    sideElement.style.zIndex = 0;
    sideElement.style.backgroundColor = 'black';
    sideElement.style.transform = this._generateBehindPageStyle(0).container.transform;
    sideElement.style.display = 'none';

    const splitter = sideElement.parentElement;
    contentReady(splitter, () => {
      if (splitter.content) {
        splitter.content.style.boxShadow = '0 0 12px 0 rgba(0, 0, 0, 0.2)';
      }
    });
  }

  _unsetStyles(sideElement) {
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

  _generateBehindPageStyle(distance) {
    const max = this.maxWidth;

    let behindDistance = (distance - max) / max * 10;
    behindDistance = isNaN(behindDistance) ? 0 : Math.max(Math.min(behindDistance, 0), -10);

    const behindTransform = `translate3d(${(this.minus ? -1 : 1) * behindDistance}%, 0, 0)`;
    const opacity = 1 + behindDistance / 100;

    return {
      content: {
        opacity
      },
      container: {
        transform: behindTransform
      }
    };
  }

  translate(distance) {
    this._side.style.display = '';
    this._side.style.zIndex = 1;
    this.maxWidth = this.maxWidth || this._getMaxWidth();
    const menuStyle = this._generateBehindPageStyle(Math.min(distance, this.maxWidth));

    if (!this._slidingElements) {
      this._slidingElements = this._getSlidingElements();
    }

    this._mask.style.display = 'block'; // Avoid content clicks

    Animit.runAll(Animit(this._slidingElements).queue({
      transform: `translate3d(${this.minus + distance}px, 0px, 0px)`
    }), Animit(this._side._content).queue(menuStyle.content), Animit(this._side).queue(menuStyle.container));
  }

  /**
   * @param {Function} done
   */
  open(done) {
    this._side.style.display = '';
    this._side.style.zIndex = 1;
    this.maxWidth = this.maxWidth || this._getMaxWidth();
    const menuStyle = this._generateBehindPageStyle(this.maxWidth);
    this._slidingElements = this._getSlidingElements();

    setTimeout(() => {
      // Fix: Time to update previous translate3d after changing style.display
      Animit.runAll(Animit(this._slidingElements).wait(this.delay).queue({
        transform: `translate3d(${this.minus + this.maxWidth}px, 0px, 0px)`
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
      }).queue(callback => {
        this._slidingElements = null;
        callback();
        done && done();
      }));
    }, 0);
  }

  /**
   * @param {Function} done
   */
  close(done) {
    const menuStyle = this._generateBehindPageStyle(0);
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
    }).queue(callback => {
      this._slidingElements = null;
      this._side.style.zIndex = 0;
      this._side.style.display = 'none';
      this._side._content.style.opacity = '';
      done && done();
      callback();
    }));
  }

  _getMaxWidth() {
    return this._side.offsetWidth;
  }
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

const _animatorDict = {
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
class SplitterElement extends BaseElement {

  _getSide(side) {
    const element = util$1.findChild(this, e => {
      return util$1.match(e, 'ons-splitter-side') && e.getAttribute('side') === side;
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
  get left() {
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
  get right() {
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
  get side() {
    return util$1.findChild(this, 'ons-splitter-side');
  }

  get _sides() {
    return [this.left, this.right].filter(e => e);
  }
  /**
   * @property content
   * @readonly
   * @type {HTMLElement}
   * @description
   *   [en]The `<ons-splitter-content>` element.[/en]
   *   [ja][/ja]
   */
  get content() {
    return util$1.findChild(this, 'ons-splitter-content');
  }

  get topPage() {
    return this.content._content;
  }

  get mask() {
    return util$1.findChild(this, 'ons-splitter-mask');
  }

  /**
   * @property onDeviceBackButton
   * @type {Object}
   * @description
   *   [en]Back-button handler.[/en]
   *   [ja]バックボタンハンドラ。[/ja]
   */
  get onDeviceBackButton() {
    return this._backButtonHandler;
  }

  set onDeviceBackButton(callback) {
    if (this._backButtonHandler) {
      this._backButtonHandler.destroy();
    }

    this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
  }

  _onDeviceBackButton(event) {
    this._sides.some(s => s.isOpen ? s.close() : false) || event.callParentHandler();
  }

  _onModeChange(e) {
    if (e.target.parentNode) {
      contentReady(this, () => {
        this._layout();
      });
    }
  }

  _layout() {
    this._sides.forEach(side => {
      if (this.content) {
        this.content.style[side.side] = side.mode === 'split' ? side._width : 0;
      }
    });
  }

  constructor() {
    super();

    this._boundOnModeChange = this._onModeChange.bind(this);

    contentReady(this, () => {
      this._compile();
      this._layout();
    });
  }

  _compile() {
    if (!this.mask) {
      this.appendChild(document.createElement('ons-splitter-mask'));
    }
  }

  connectedCallback() {
    this.onDeviceBackButton = this._onDeviceBackButton.bind(this);
    this.addEventListener('modechange', this._boundOnModeChange, false);
  }

  disconnectedCallback() {
    this._backButtonHandler.destroy();
    this._backButtonHandler = null;
    this.removeEventListener('modechange', this._boundOnModeChange, false);
  }

  attributeChangedCallback(name, last, current) {}

  _show() {
    util$1.propagateAction(this, '_show');
  }

  _hide() {
    util$1.propagateAction(this, '_hide');
  }

  _destroy() {
    util$1.propagateAction(this, '_destroy');
    this.remove();
  }

  static registerAnimator(name, Animator) {
    if (!(Animator instanceof SplitterAnimator)) {
      throw new Error('Animator parameter must be an instance of SplitterAnimator.');
    }
    _animatorDict[name] = Animator;
  }

  static get SplitterAnimator() {
    return SplitterAnimator;
  }

  static get animators() {
    return _animatorDict;
  }
}

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

const SPLIT_MODE = 'split';
const COLLAPSE_MODE = 'collapse';
const CLOSED_STATE = 'closed';
const OPEN_STATE = 'open';
const CHANGING_STATE = 'changing';

const WATCHED_ATTRIBUTES = ['animation', 'width', 'side', 'collapse', 'swipeable', 'swipe-target-width', 'animation-options', 'open-threshold'];

const rewritables$1 = {
  /**
   * @param {Element} splitterSideElement
   * @param {Function} callback
   */
  ready(splitterSideElement, callback) {
    setImmediate(callback);
  }
};

class CollapseDetection {
  constructor(element, target) {
    this._element = element;
    this._boundOnChange = this._onChange.bind(this);
    target && this.changeTarget(target);
  }

  changeTarget(target) {
    this.disable();
    this._target = target;
    if (target) {
      this._orientation = ['portrait', 'landscape'].indexOf(target) !== -1;
      this.activate();
    }
  }

  _match(value) {
    if (this._orientation) {
      return this._target === (value.isPortrait ? 'portrait' : 'landscape');
    }
    return value.matches;
  }

  _onChange(value) {
    this._element._updateMode(this._match(value) ? COLLAPSE_MODE : SPLIT_MODE);
  }

  activate() {
    if (this._orientation) {
      orientation.on('change', this._boundOnChange);
      this._onChange({ isPortrait: orientation.isPortrait() });
    } else {
      this._queryResult = window.matchMedia(this._target);
      this._queryResult.addListener(this._boundOnChange);
      this._onChange(this._queryResult);
    }
  }

  disable() {
    if (this._orientation) {
      orientation.off('change', this._boundOnChange);
    } else if (this._queryResult) {
      this._queryResult.removeListener(this._boundOnChange);
      this._queryResult = null;
    }
  }
}

const widthToPx = (width, parent) => {
  var _ref = [parseInt(width, 10), /px/.test(width)];
  const value = _ref[0],
        px = _ref[1];

  return px ? value : Math.round(parent.offsetWidth * value / 100);
};

class CollapseMode {
  get _animator() {
    return this._element._animator;
  }

  constructor(element) {
    this._active = false;
    this._state = CLOSED_STATE;
    this._element = element;
    this._lock = new DoorLock();
  }

  isOpen() {
    return this._active && this._state !== CLOSED_STATE;
  }

  handleGesture(e) {
    if (!e.gesture || !this._active || this._lock.isLocked() || this._isOpenOtherSideMenu()) {
      return;
    }
    if (e.type === 'dragstart') {
      this._onDragStart(e);
    } else if (!this._ignoreDrag) {
      e.type === 'dragend' ? this._onDragEnd(e) : this._onDrag(e);
    }
  }

  _canConsumeGesture(gesture) {
    const isOpen = this.isOpen();
    const validDrag = d => this._element._side === 'left' ? d === 'left' && isOpen || d === 'right' && !isOpen : d === 'left' && !isOpen || d === 'right' && isOpen;

    const distance = this._element._side === 'left' ? gesture.center.clientX : window.innerWidth - gesture.center.clientX;
    const area = this._element._swipeTargetWidth;

    return validDrag(gesture.direction) && !(area && distance > area && !isOpen);
  }

  _onDragStart(event) {
    this._ignoreDrag = event.consumed || event.gesture && !this._canConsumeGesture(event.gesture) || !(event.gesture.distance <= 15 || event.gesture.deltaTime <= 100);

    if (!this._ignoreDrag) {
      event.consume && event.consume();
      event.consumed = true;

      this._width = widthToPx(this._element._width, this._element.parentNode);
      this._startDistance = this._distance = this.isOpen() ? this._width : 0;

      util$1.preventScroll(this._element._gestureDetector);
    }
  }

  _onDrag(event) {
    event.stopPropagation();
    event.gesture.preventDefault();

    const delta = this._element._side === 'left' ? event.gesture.deltaX : -event.gesture.deltaX;
    const distance = Math.max(0, Math.min(this._width, this._startDistance + delta));
    if (distance !== this._distance) {
      this._animator.translate(distance);
      this._distance = distance;
      this._state = CHANGING_STATE;
    }
  }

  _onDragEnd(event) {
    event.stopPropagation();

    const distance = this._distance,
          width = this._width,
          el = this._element;

    const direction = event.gesture.interimDirection;
    const shouldOpen = el._side !== direction && distance > width * el._threshold;
    this.executeAction(shouldOpen ? 'open' : 'close');
    this._ignoreDrag = true;
  }

  layout() {
    if (this._active && this._state === OPEN_STATE) {
      this._animator.open();
    }
  }

  // enter collapse mode
  enterMode() {
    if (!this._active) {
      this._active = true;
      this._animator && this._animator.activate(this._element);
      this.layout();
    }
  }

  // exit collapse mode
  exitMode() {
    this._animator && this._animator.deactivate();
    this._state = CLOSED_STATE;
    this._active = false;
  }

  _isOpenOtherSideMenu() {
    return util$1.arrayFrom(this._element.parentElement.children).some(e => {
      return util$1.match(e, 'ons-splitter-side') && e !== this._element && e.isOpen;
    });
  }

  /**
   * @param {String} name - 'open' or 'close'
   * @param {Object} [options]
   * @param {Function} [options.callback]
   * @param {Boolean} [options.withoutAnimation]
   * @return {Promise} Resolves to the splitter side element or false if not in collapse mode
   */
  executeAction(name, options = {}) {
    const FINAL_STATE = name === 'open' ? OPEN_STATE : CLOSED_STATE;

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
    if (this._element._emitEvent(`pre${name}`)) {
      return Promise.reject(`Canceled in pre${name} event.`);
    }

    const callback = options.callback;
    const unlock = this._lock.lock();
    const done = () => {
      this._state = FINAL_STATE;
      this.layout();
      unlock();
      this._element._emitEvent(`post${name}`);
      callback && callback();
    };

    if (options.withoutAnimation) {
      done();
      return Promise.resolve(this._element);
    }
    this._state = CHANGING_STATE;
    return new Promise(resolve => {
      this._animator[name](() => {
        done();
        resolve(this._element);
      });
    });
  }
}

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
class SplitterSideElement extends BaseElement {

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

  constructor() {
    super();

    this._page = null;
    this._pageLoader = defaultPageLoader;
    this._collapseMode = new CollapseMode(this);
    this._collapseDetection = new CollapseDetection(this);

    this._animatorFactory = new AnimatorFactory({
      animators: SplitterElement.animators,
      baseClass: SplitterAnimator$1,
      baseClassName: 'SplitterAnimator',
      defaultAnimation: this.getAttribute('animation')
    });
    this._boundHandleGesture = e => this._collapseMode.handleGesture(e);
    this._watchedAttributes = WATCHED_ATTRIBUTES;
    contentReady(this, () => {
      rewritables$1.ready(this, () => {
        const page = this._getPageTarget();

        if (page) {
          this.load(page);
        }
      });
    });
  }

  connectedCallback() {
    if (!util$1.match(this.parentNode, 'ons-splitter')) {
      throw new Error('Parent must be an ons-splitter element.');
    }

    this._gestureDetector = new GestureDetector(this.parentElement, { dragMinDistance: 1 });

    contentReady(this, () => {
      this._watchedAttributes.forEach(e => this._update(e));
    });

    if (!this.hasAttribute('side')) {
      this.setAttribute('side', 'left');
    }
  }

  _getPageTarget() {
    return this._page || this.getAttribute('page');
  }

  get side() {
    return this.getAttribute('side') === 'right' ? 'right' : 'left';
  }

  disconnectedCallback() {
    this._collapseDetection.disable();
    this._gestureDetector.dispose();
    this._gestureDetector = null;
  }

  static get observedAttributes() {
    return WATCHED_ATTRIBUTES;
  }

  attributeChangedCallback(name, last, current) {
    this.parentNode && this._update(name, current);
  }

  _update(name, value) {
    name = '_update' + name.split('-').map(e => e[0].toUpperCase() + e.slice(1)).join('');
    return this[name](value);
  }

  _emitEvent(name) {
    if (name.slice(0, 3) !== 'pre') {
      return util$1.triggerElementEvent(this, name, { side: this });
    }
    let isCanceled = false;

    util$1.triggerElementEvent(this, name, {
      side: this,
      cancel: () => isCanceled = true
    });

    return isCanceled;
  }

  _updateCollapse(value = this.getAttribute('collapse')) {
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
  _updateMode(mode) {
    if (mode !== this._mode) {
      this._mode = mode;
      this._collapseMode[mode === COLLAPSE_MODE ? 'enterMode' : 'exitMode']();
      this.setAttribute('mode', mode);

      util$1.triggerElementEvent(this, 'modechange', { side: this, mode: mode });
    }
  }

  _updateOpenThreshold(threshold = this.getAttribute('open-threshold')) {
    this._threshold = Math.max(0, Math.min(1, parseFloat(threshold) || 0.3));
  }

  _updateSwipeable(swipeable = this.getAttribute('swipeable')) {
    const action = swipeable === null ? 'off' : 'on';

    if (this._gestureDetector) {
      this._gestureDetector[action]('drag dragstart dragend', this._boundHandleGesture);
    }
  }

  _updateSwipeTargetWidth(value = this.getAttribute('swipe-target-width')) {
    this._swipeTargetWidth = Math.max(0, parseInt(value) || 0);
  }

  _updateWidth() {
    this.style.width = this._width;
  }

  get _width() {
    const width = this.getAttribute('width');
    return (/^\d+(px|%)$/.test(width) ? width : '80%'
    );
  }

  set _width(value) {
    this.setAttribute('width', value);
  }

  _updateSide(side = this.getAttribute('side')) {
    this._side = side === 'right' ? side : 'left';
  }

  _updateAnimation(animation = this.getAttribute('animation')) {
    this._animator && this._animator.deactivate();
    this._animator = this._animatorFactory.newAnimator({ animation });
    this._animator.activate(this);
  }

  _updateAnimationOptions(value = this.getAttribute('animation-options')) {
    this._animator.updateOptions(AnimatorFactory.parseAnimationOptionsString(value));
  }

  /**
   * @property page
   * @type {*}
   * @description
   *   [en]Page location to load in the splitter side.[/en]
   *   [ja]この要素内に表示するページを指定します。[/ja]
   */
  get page() {
    return this._page;
  }

  /**
   * @param {*} page
   */
  set page(page) {
    this._page = page;
  }

  get _content() {
    return this.children[0];
  }

  /**
   * @property pageLoader
   * @description
   *   [en][/en]
   *   [ja][/ja]
   */
  get pageLoader() {
    return this._pageLoader;
  }

  set pageLoader(loader) {
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
  get mode() {
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
  get isOpen() {
    return this._collapseMode.isOpen();
  }

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
  open(options = {}) {
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
  close(options = {}) {
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
  toggle(options = {}) {
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
  load(page, options = {}) {
    this._page = page;
    const callback = options.callback || (() => {});

    return new Promise(resolve => {
      let oldContent = this._content || null;

      this._pageLoader.load({ page, parent: this }, pageElement => {
        if (oldContent) {
          this._pageLoader.unload(oldContent);
          oldContent = null;
        }

        setImmediate(() => this._show());

        callback(pageElement);
        resolve(pageElement);
      });
    });
  }

  _show() {
    if (this._content) {
      this._content._show();
    }
  }

  _hide() {
    if (this._content) {
      this._content._hide();
    }
  }

  _destroy() {
    if (this._content) {
      this._pageLoader.unload(this._content);
    }
    this.remove();
  }

  static get events() {
    return ['preopen', 'postopen', 'preclose', 'postclose', 'modechange'];
  }

  static get rewritables() {
    return rewritables$1;
  }
}

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

const defaultClassName$5 = 'toolbar-button';

const scheme$6 = { '': 'toolbar-button--*' };

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
class ToolbarButtonElement extends BaseElement {

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

  constructor() {
    super();

    this._compile();
  }

  /**
   * @property disabled
   * @type {Boolean}
   * @description
   *   [en]Whether the element is disabled or not.[/en]
   *   [ja]無効化されている場合に`true`。[/ja]
   */
  set disabled(value) {
    return util$1.toggleAttribute(this, 'disabled', value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  _compile() {
    autoStyle.prepare(this);

    this.classList.add(defaultClassName$5);

    util$1.updateRipple(this, undefined, { center: '', 'size': 'contain', 'background': 'transparent' });

    ModifierUtil.initModifier(this, scheme$6);
  }

  static get observedAttributes() {
    return ['modifier', 'class'];
  }

  attributeChangedCallback(name, last, current) {
    switch (name) {
      case 'class':
        util$1.restoreClass(this, defaultClassName$5, scheme$6);
        break;
      case 'modifier':
        ModifierUtil.onModifierChanged(last, current, this, scheme$6);
        break;
    }
  }
}

customElements.define('ons-toolbar-button', ToolbarButtonElement);

if (window.ons) {
  ons._util.warn('Onsen UI is loaded more than once.');
}

ons.ButtonElement = ButtonElement;
ons.ListItemElement = ListItemElement;
ons.ListElement = ListElement;
ons.PageElement = PageElement;
ons.ProgressBarElement = ProgressBarElement;
ons.SplitterContentElement = SplitterContentElement;
ons.SplitterMaskElement = SplitterMaskElement;
ons.SplitterSideElement = SplitterSideElement;
ons.SplitterElement = SplitterElement;
ons.ToolbarButtonElement = ToolbarButtonElement;

// fastclick
window.addEventListener('load', () => {
  ons.fastClick = FastClick.attach(document.body);
}, false);

ons.ready(function () {
  // ons._defaultDeviceBackButtonHandler
  ons._deviceBackButtonDispatcher.enable();
  ons._defaultDeviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(window.document.body, () => {
    if (Object.hasOwnProperty.call(navigator, 'app')) {
      navigator.app.exitApp();
    } else {
      console.warn('Could not close the app. Is \'cordova.js\' included?\nError: \'window.navigator.app\' is undefined.');
    }
  });
  document.body._gestureDetector = new ons.GestureDetector(document.body);

  // // Simulate Device Back Button on ESC press
  // if (!ons.platform.isWebView()) {
  //   document.body.addEventListener('keydown', function(event) {
  //     if (event.keyCode === 27) {
  //       ons._deviceBackButtonDispatcher.fireDeviceBackButtonEvent();
  //     }
  //   })
  // }
  //
  // // setup loading placeholder
  // ons._setupLoadingPlaceHolders();
});

// viewport.js
new Viewport().setup();

export default ons;
//# sourceMappingURL=onsenui.esm.js.map

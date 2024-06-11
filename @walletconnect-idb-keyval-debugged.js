import { createStorage as w } from "unstorage";
import { createStore as I, get as u, set as p, del as b, keys as v, clear as S } from "idb-keyval";
import { safeJsonStringify as g, safeJsonParse as d } from "@walletconnect/safe-json";

function C(i) {
  return i
}

const x = "idb-keyval";

var z = (i = {}) => {
  console.log('createIdbKeyvalDriver first line');
  const t = i.base && i.base.length > 0 ? `${i.base}:` : "",
    e = s => t + s;
  console.log('createIdbKeyvalDriver second line, console prefix, prefixKey', t, e);
  let n;
  console.log('third line, console options', i);
  return i.dbName && i.storeName && (n = I(i.dbName, i.storeName), console.log('console store ---', n)), {
    name: x,
    options: i,
    async hasItem(s) {
      return !(typeof await u(e(s), n) > "u")
    },
    async getItem(s) {
      console.log('createIdbKeyvalDriver getItem, getfunction from idb-keyval', e, s, u);

      // --------------------------------------------------------------------here, it takes forever----------------------------------------------------------

      return await u(e(s), n) ?? null
    },
    setItem(s, a) {
      return p(e(s), a, n)
    },
    removeItem(s) {
      return b(e(s), n)
    },
    getKeys() {
      return v(n)
    },
    clear() {
      return S(n)
    }
  }
};

const D = "WALLET_CONNECT_V2_INDEXED_DB",
  E = "keyvaluestorage";

class _ {
  constructor() {
    console.log('indexed db constructor, console create storage, console createIdbKeyvalDriver', w, z);
    this.indexedDb = w({
      driver: z({
        dbName: D,
        storeName: E
      })
    }),
      console.log('console index db that created', this.indexedDb);
  }

  async getKeys() {
    return this.indexedDb.getKeys()
  }

  async getEntries() {
    return (await this.indexedDb.getItems(await this.indexedDb.getKeys())).map(t => [t.key, t.value])
  }

  async getItem(t) {
    const e = await this.indexedDb.getItem(t);
    if (e !== null) return e
  }

  async setItem(t, e) {
    await this.indexedDb.setItem(t, g(e))
  }

  async removeItem(t) {
    await this.indexedDb.removeItem(t)
  }
}

var l = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {},
  c = { exports: {} };

(function () {
  let i;

  function t() { }
  i = t,
    i.prototype.getItem = function (e) {
      return this.hasOwnProperty(e) ? String(this[e]) : null
    },
    i.prototype.setItem = function (e, n) {
      this[e] = String(n)
    },
    i.prototype.removeItem = function (e) {
      delete this[e]
    },
    i.prototype.clear = function () {
      const e = this;
      Object.keys(e).forEach(function (n) {
        e[n] = void 0,
          delete e[n]
      })
    },
    i.prototype.key = function (e) {
      return e = e || 0,
        Object.keys(this)[e]
    },
    i.prototype.__defineGetter__("length", function () {
      return Object.keys(this).length
    }),
    typeof l < "u" && l.localStorage ? c.exports = l.localStorage : typeof window < "u" && window.localStorage ? c.exports = window.localStorage : c.exports = new t
})();

function k(i) {
  var t;
  return [i[0], d((t = i[1]) != null ? t : "")]
}

class K {
  constructor() {
    console.log('localstorage init, c.exports ====', c.exports);
    this.localStorage = c.exports
  }

  async getKeys() {
    return Object.keys(this.localStorage)
  }

  async getEntries() {
    return Object.entries(this.localStorage).map(k)
  }

  async getItem(t) {
    const e = this.localStorage.getItem(t);
    if (e !== null) return d(e)
  }

  async setItem(t, e) {
    this.localStorage.setItem(t, g(e))
  }

  async removeItem(t) {
    this.localStorage.removeItem(t)
  }
}

const N = "wc_storage_version",
  y = 1,
  O = async (i, t, e) => {
    console.log('before get Item in migrate db, console t - new db', t);
    const n = N,
      s = await t.getItem(n);
    console.log(n, s, y, 'n, s, y, migrate storage func (y is storage version, n is key, s is value of version)');
    if (s && s >= y) {
      e(t);
      console.log('here version is older than 2');
      return
    }
    const a = await i.getKeys();
    if (!a.length) {
      e(t);
      console.log('here, localstorage is empty with length 0');
      return
    }
    const m = [];
    for (; a.length;) {
      const r = a.shift();
      if (!r) continue;
      console.log('here, in while');
      const o = r.toLowerCase();
      if (o.includes("wc@") || o.includes("walletconnect") || o.includes("wc_") || o.includes("wallet_connect")) {
        const f = await i.getItem(r);
        console.log('getitem, and set it to new storage');
        await t.setItem(r, f),
          m.push(r)
      }
    }
    await t.setItem(n, y),
      console.log('setversion'),
      e(t),
      console.log('storage callback'),
      j(i, m),
      console.log('clean up old storage');
  },
  j = async (i, t) => {
    t.length && t.forEach(async e => {
      await i.removeItem(e)
    })
  };

class h {
  constructor() {
    console.log('storage constructor');
    this.initialized = !1,
      this.setInitialized = e => {
        console.log('this.setinitialized function', e),
          this.storage = e,
          this.initialized = !0
      };

    const t = new K;
    this.storage = t;
    try {
      console.log('new indexdb create');
      const e = new _;
      console.log('new keyvalue storage create in storage constructor try');
      O(t, e, this.setInitialized)
    } catch {
      this.initialized = !0
    }
  }

  async getKeys() {
    return await this.initialize(), this.storage.getKeys()
  }

  async getEntries() {
    return await this.initialize(), this.storage.getEntries()
  }

  async getItem(t) {
    console.log('key get Item before initialzie');
    await this.initialize();
    console.log('initalized successfully - getitem');
    return this.storage.getItem(t)
  }

  async setItem(t, e) {
    return await this.initialize(), this.storage.setItem(t, e)
  }

  async removeItem(t) {
    return await this.initialize(), this.storage.removeItem(t)
  }

  async initialize() {
    this.initialized || await new Promise(t => {
      console.log('before interval');
      const e = setInterval(() => {
        console.log('inside interval');
        this.initialized && (clearInterval(e), t())
      }, 20)
    })
  }
}

export {
  h as KeyValueStorage,
  h as default
};
//# sourceMappingURL=index.es.js.map
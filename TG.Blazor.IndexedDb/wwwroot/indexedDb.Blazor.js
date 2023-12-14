(()=>{"use strict";var e={538:function(e,t,n){var o=this&&this.__awaiter||function(e,t,n,o){return new(n||(n=Promise))((function(r,i){function s(e){try{d(o.next(e))}catch(e){i(e)}}function a(e){try{d(o.throw(e))}catch(e){i(e)}}function d(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}d((o=o.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.IndexedDbManager=void 0;const r=n(269);t.IndexedDbManager=class{constructor(){this.dbInstance=void 0,this.dotnetCallback=e=>{},this.openDb=(e,t)=>o(this,void 0,void 0,(function*(){const n=e;this.dotnetCallback=e=>{t.instance.invokeMethodAsync(t.methodName,e)};try{(!this.dbInstance||this.dbInstance.version<n.version)&&(this.dbInstance&&this.dbInstance.close(),this.dbInstance=yield(0,r.openDB)(n.dbName,n.version,{upgrade:(e,t,o,r)=>{this.upgradeDatabase(e,n,t,o)}}))}catch(e){this.dbInstance=yield(0,r.openDB)(n.dbName)}return`IndexedDB ${e.dbName} opened`})),this.getDbInfo=e=>o(this,void 0,void 0,(function*(){this.dbInstance||(this.dbInstance=yield(0,r.openDB)(e));const t=this.dbInstance;return{version:t.version,storeNames:(e=>{let t=[];for(var n=0;n<e.length;n++)t.push(e[n]);return t})(t.objectStoreNames)}})),this.deleteDb=e=>o(this,void 0,void 0,(function*(){var t;return null===(t=this.dbInstance)||void 0===t||t.close(),yield(0,r.deleteDB)(e),this.dbInstance=void 0,`The database ${e} has been deleted`})),this.addRecord=e=>o(this,void 0,void 0,(function*(){const t=e.storename;let n=e.data;const o=this.getTransaction(this.dbInstance,t,"readwrite").objectStore(t);return n=this.checkForKeyPath(o,n),`Added new record with id ${void 0===o.add?void 0:yield o.add(n,e.key)}`})),this.updateRecord=e=>o(this,void 0,void 0,(function*(){const t=e.storename,n=this.getTransaction(this.dbInstance,t,"readwrite").objectStore(t);return`updated record with id ${void 0===n.put?void 0:yield n.put(e.data,e.key)}`})),this.getRecords=e=>o(this,void 0,void 0,(function*(){const t=this.getTransaction(this.dbInstance,e,"readonly");let n=yield t.objectStore(e).getAll();return yield t.done,n})),this.clearStore=e=>o(this,void 0,void 0,(function*(){const t=this.getTransaction(this.dbInstance,e,"readwrite"),n=t.objectStore(e);return void 0!==n.clear&&(yield n.clear()),yield t.done,`Store ${e} cleared`})),this.getRecordByIndex=e=>o(this,void 0,void 0,(function*(){const t=this.getTransaction(this.dbInstance,e.storename,"readonly"),n=t.objectStore(e.storename);if(!n.indexNames.contains(e.indexName))return;const o=yield n.index(e.indexName).get(e.queryValue);return yield t.done,o})),this.getAllRecordsByIndex=e=>o(this,void 0,void 0,(function*(){const t=this.getTransaction(this.dbInstance,e.storename,"readonly");let n=[];const o=t.objectStore(e.storename);let r=yield o.index(e.indexName).openCursor();for(;r;)r.key===e.queryValue&&n.push(r.value),r=yield r.continue();return yield t.done,n})),this.getRecordById=(e,t)=>o(this,void 0,void 0,(function*(){const n=this.getTransaction(this.dbInstance,e,"readonly").objectStore(e);return yield n.get(t)})),this.deleteRecord=(e,t)=>o(this,void 0,void 0,(function*(){const n=this.getTransaction(this.dbInstance,e,"readwrite").objectStore(e);return void 0!==n.delete&&(yield n.delete(t)),`Record with id: ${t} deleted`}))}getTransaction(e,t,n){const o=e.transaction(t,n);return o.done.catch((e=>{e?console.error(e.message):console.error("Undefined error in getTransaction()")})),o}checkForKeyPath(e,t){if(!e.autoIncrement||!e.keyPath)return t;if("string"!=typeof e.keyPath)return t;const n=e.keyPath;return t[n]||delete t[n],t}upgradeDatabase(e,t,n,o){if(n<t.version&&t.stores)for(var r of t.stores)e.objectStoreNames.contains(r.name)||(this.addNewStore(e,r),this.dotnetCallback(`store added ${r.name}: db version: ${t.version}`))}addNewStore(e,t){let n=t.primaryKey;n||(n={name:"id",keyPath:"id",auto:!0});const o=e.createObjectStore(t.name,{keyPath:n.keyPath,autoIncrement:n.auto});for(var r of t.indexes)o.createIndex(r.name,r.keyPath,{unique:r.unique})}}},269:(e,t,n)=>{n.r(t),n.d(t,{deleteDB:()=>b,openDB:()=>f,unwrap:()=>v,wrap:()=>h});const o=(e,t)=>t.some((t=>e instanceof t));let r,i;const s=new WeakMap,a=new WeakMap,d=new WeakMap;let c={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)return s.get(e);if("store"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return h(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function u(e){c=e(c)}function l(e){return"function"==typeof e?(t=e,(i||(i=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(t)?function(...e){return t.apply(v(this),e),h(this.request)}:function(...e){return h(t.apply(v(this),e))}):(e instanceof IDBTransaction&&function(e){if(s.has(e))return;const t=new Promise(((t,n)=>{const o=()=>{e.removeEventListener("complete",r),e.removeEventListener("error",i),e.removeEventListener("abort",i)},r=()=>{t(),o()},i=()=>{n(e.error||new DOMException("AbortError","AbortError")),o()};e.addEventListener("complete",r),e.addEventListener("error",i),e.addEventListener("abort",i)}));s.set(e,t)}(e),o(e,r||(r=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction]))?new Proxy(e,c):e);var t}function h(e){if(e instanceof IDBRequest)return function(e){const t=new Promise(((t,n)=>{const o=()=>{e.removeEventListener("success",r),e.removeEventListener("error",i)},r=()=>{t(h(e.result)),o()},i=()=>{n(e.error),o()};e.addEventListener("success",r),e.addEventListener("error",i)}));return d.set(t,e),t}(e);if(a.has(e))return a.get(e);const t=l(e);return t!==e&&(a.set(e,t),d.set(t,e)),t}const v=e=>d.get(e);function f(e,t,{blocked:n,upgrade:o,blocking:r,terminated:i}={}){const s=indexedDB.open(e,t),a=h(s);return o&&s.addEventListener("upgradeneeded",(e=>{o(h(s.result),e.oldVersion,e.newVersion,h(s.transaction),e)})),n&&s.addEventListener("blocked",(e=>n(e.oldVersion,e.newVersion,e))),a.then((e=>{i&&e.addEventListener("close",(()=>i())),r&&e.addEventListener("versionchange",(e=>r(e.oldVersion,e.newVersion,e)))})).catch((()=>{})),a}function b(e,{blocked:t}={}){const n=indexedDB.deleteDatabase(e);return t&&n.addEventListener("blocked",(e=>t(e.oldVersion,e))),h(n).then((()=>{}))}const y=["get","getKey","getAll","getAllKeys","count"],p=["put","add","delete","clear"],I=new Map;function g(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(I.get(t))return I.get(t);const n=t.replace(/FromIndex$/,""),o=t!==n,r=p.includes(n);if(!(n in(o?IDBIndex:IDBObjectStore).prototype)||!r&&!y.includes(n))return;const i=async function(e,...t){const i=this.transaction(e,r?"readwrite":"readonly");let s=i.store;return o&&(s=s.index(t.shift())),(await Promise.all([s[n](...t),r&&i.done]))[0]};return I.set(t,i),i}u((e=>({...e,get:(t,n,o)=>g(t,n)||e.get(t,n,o),has:(t,n)=>!!g(t,n)||e.has(t,n)})));const m=["continue","continuePrimaryKey","advance"],w={},D=new WeakMap,x=new WeakMap,B={get(e,t){if(!m.includes(t))return e[t];let n=w[t];return n||(n=w[t]=function(...e){D.set(this,x.get(this)[t](...e))}),n}};async function*S(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;const n=new Proxy(t,B);for(x.set(n,t),d.set(n,v(t));t;)yield n,t=await(D.get(n)||t.continue()),D.delete(n)}function j(e,t){return t===Symbol.asyncIterator&&o(e,[IDBIndex,IDBObjectStore,IDBCursor])||"iterate"===t&&o(e,[IDBIndex,IDBObjectStore])}u((e=>({...e,get:(t,n,o)=>j(t,n)?S:e.get(t,n,o),has:(t,n)=>j(t,n)||e.has(t,n)})))}},t={};function n(o){var r=t[o];if(void 0!==r)return r.exports;var i=t[o]={exports:{}};return e[o].call(i.exports,i,i.exports,n),i.exports}n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{const e=n(538);var t;!function(t){const n="TimeGhost",o={IndexedDbManager:new e.IndexedDbManager};t.initialise=function(){"undefined"==typeof window||window[n]?window[n]=Object.assign(Object.assign({},window[n]),o):window[n]=Object.assign({},o)}}(t||(t={})),t.initialise()})()})();
var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,e){t.appendChild(e)}function a(t,e,n){t.insertBefore(e,n||null)}function l(t){t.parentNode.removeChild(t)}function c(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function u(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t){const e={};for(const n of t)e[n.name]=n.value;return e}let m;function h(t){m=t}const p=[],$=[],b=[],_=[],x=Promise.resolve();let y=!1;function k(t){b.push(t)}let w=!1;const v=new Set;function M(){if(!w){w=!0;do{for(let t=0;t<p.length;t+=1){const e=p[t];h(e),E(e.$$)}for(h(null),p.length=0;$.length;)$.pop()();for(let t=0;t<b.length;t+=1){const e=b[t];v.has(e)||(v.add(e),e())}b.length=0}while(p.length);for(;_.length;)_.pop()();y=!1,w=!1,v.clear()}}function E(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(k)}}const C=new Set;function L(t,e){-1===t.$$.dirty[0]&&(p.push(t),y||(y=!0,x.then(M)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function B(i,s,a,c,d,f,u=[-1]){const g=m;h(i);const p=i.$$={fragment:null,ctx:null,props:f,update:t,not_equal:d,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(g?g.$$.context:s.context||[]),callbacks:n(),dirty:u,skip_bound:!1};let $=!1;if(p.ctx=a?a(i,s.props||{},((t,e,...n)=>{const o=n.length?n[0]:e;return p.ctx&&d(p.ctx[t],p.ctx[t]=o)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](o),$&&L(i,t)),e})):[],p.update(),$=!0,o(p.before_update),p.fragment=!!c&&c(p.ctx),s.target){if(s.hydrate){const t=function(t){return Array.from(t.childNodes)}(s.target);p.fragment&&p.fragment.l(t),t.forEach(l)}else p.fragment&&p.fragment.c();s.intro&&((b=i.$$.fragment)&&b.i&&(C.delete(b),b.i(_))),function(t,n,i,s){const{fragment:a,on_mount:l,on_destroy:c,after_update:d}=t.$$;a&&a.m(n,i),s||k((()=>{const n=l.map(e).filter(r);c?c.push(...n):o(n),t.$$.on_mount=[]})),d.forEach(k)}(i,s.target,s.anchor,s.customElement),M()}var b,_;h(g)}let H;function R(t,e,n){const o=t.slice();return o[1]=e[n],o[3]=n,o}function S(e){let n,o,r,i,g,m,h,p,$,b,_,x=e[1].title+"";return{c(){n=c("li"),o=c("a"),r=c("div"),i=c("div"),g=c("img"),h=f(),p=c("div"),$=c("h2"),b=d(x),_=f(),g.src!==(m=e[1].img)&&u(g,"src",m),u(g,"alt",e[1].title),u(i,"class","card_image"),u($,"class","card_title"),u(p,"class","card_content"),u(r,"class","card"),u(o,"class","card_link"),u(o,"href",e[1].link),u(o,"target","_blank"),u(n,"class","cards_item")},m(t,e){a(t,n,e),s(n,o),s(o,r),s(r,i),s(i,g),s(r,h),s(r,p),s(p,$),s($,b),s(n,_)},p:t,d(t){t&&l(n)}}}function T(e){let n,o,r,i=e[0],d=[];for(let t=0;t<i.length;t+=1)d[t]=S(R(e,i,t));return{c(){n=c("main"),o=c("div"),r=c("ul");for(let t=0;t<d.length;t+=1)d[t].c();this.c=t,u(r,"class","cards")},m(t,e){a(t,n,e),s(n,o),s(o,r);for(let t=0;t<d.length;t+=1)d[t].m(r,null)},p(t,[e]){if(1&e){let n;for(i=t[0],n=0;n<i.length;n+=1){const o=R(t,i,n);d[n]?d[n].p(o,e):(d[n]=S(o),d[n].c(),d[n].m(r,null))}for(;n<d.length;n+=1)d[n].d(1);d.length=i.length}},i:t,o:t,d(t){t&&l(n),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(d,t)}}}function j(t){return[[{title:"Chrysalis",img:"assets/images/Chrysalis.png",link:"https://chrysalis.docs.iota.org/"},{title:"Client Library",img:"assets/images/Libraries.png",link:"https://client-lib.docs.iota.org/"},{title:"Wallet Library",img:"assets/images/Wallet.png",link:"https://wallet-lib.docs.iota.org/"},{title:"HORNET",img:"assets/images/Hornet.png",link:"https://hornet.docs.iota.org/"},{title:"Bee",img:"assets/images/Bee.png",link:"https://bee.docs.iota.org/"},{title:"Stronghold",img:"assets/images/Stronghold.png",link:"https://stronghold.docs.iota.org/"}]]}"function"==typeof HTMLElement&&(H=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:t}=this.$$;this.$$.on_disconnect=t.map(e).filter(r);for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,e,n){this[t]=n}disconnectedCallback(){o(this.$$.on_disconnect)}$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});class A extends H{constructor(t){super(),this.shadowRoot.innerHTML='<style>@font-face{font-family:"Metropolis-Bold";src:url("/fonts/Metropolis-Bold.woff") format("woff")}@font-face{font-family:"Metropolis-Medium";src:url("/fonts/Metropolis-Medium.woff") format("woff")}@font-face{font-family:"Metropolis-Regular";src:url("/fonts/Metropolis-Regular.woff") format("woff")}*,*::before,*::after{box-sizing:border-box}img{height:auto;max-width:100%;vertical-align:middle}.cards{display:flex;flex-wrap:wrap;list-style:none;margin:0;padding:0}.cards_item{display:flex;padding:1rem}@media(min-width: 40rem){.cards_item{width:50%}}@media(min-width: 56rem){.cards_item{width:33.3333%}}.card{background-color:white;border-radius:0.25rem;box-shadow:0 20px 40px -14px rgba(0, 0, 0, 0.25);display:flex;flex-direction:column;overflow:hidden}.card_content{padding:2rem;background:linear-gradient(\n            to bottom left,\n            rgb(15, 193, 183) 40%,\n            rgb(15, 193, 183) 100%\n        )}.card_title{color:#ffffff;font-size:1.7rem;font-weight:800;letter-spacing:1px;text-transform:capitalize;margin:0px;text-decoration:none;text-align:center\n    }.card_link:link{text-decoration:none}.card_link:visited{text-decoration:none}.card_link:hover{text-decoration:none}.card_link:active{text-decoration:none}</style>',B(this,{target:this.shadowRoot,props:g(this.attributes),customElement:!0},j,T,i,{}),t&&t.target&&a(t.target,this,t.anchor)}}customElements.define("project-list",A);return new A({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map

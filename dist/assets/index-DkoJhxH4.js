var fo=Object.defineProperty;var go=(s,t,e)=>t in s?fo(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var $=(s,t,e)=>go(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=e(n);fetch(n.href,a)}})();class L{static getBaseUrl(){return""}static getToken(){return localStorage.getItem("tickhigh_admin_token")||""}static setToken(t){t?localStorage.setItem("tickhigh_admin_token",t):localStorage.removeItem("tickhigh_admin_token")}static getRefreshToken(){return localStorage.getItem("tickhigh_admin_refresh_token")||""}static setRefreshToken(t){t?localStorage.setItem("tickhigh_admin_refresh_token",t):localStorage.removeItem("tickhigh_admin_refresh_token")}static async _doRefresh(){var l;const t=this.getRefreshToken();if(!t)throw new Error("No refresh token available");const e=await fetch("/api/v1/admin/auth/token/refresh",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:t})}),i=await e.json().catch(()=>({}));if(!e.ok)throw new Error(((l=i==null?void 0:i.error)==null?void 0:l.message)||"Token refresh failed");const{accessToken:n,token:a,refreshToken:o}=i.data||{},r=n||a;if(!r)throw new Error("No access token in refresh response");return this.setToken(r),o&&this.setRefreshToken(o),r}static async refreshAccessToken(){return this._refreshPromise||(this._refreshPromise=this._doRefresh().finally(()=>{this._refreshPromise=null})),this._refreshPromise}static async request(t,e={},i=!1){var c,d,p;const n=`${this.getBaseUrl()}${t}`,a={"Content-Type":"application/json",...e.headers},o=this.getToken();o&&(a.Authorization=`Bearer ${o}`);let r;try{r=await fetch(n,{...e,headers:a})}catch(u){throw console.error(`API Network Error on [${e.method||"GET"}] ${t}:`,u),u}if(r.status===401&&!i&&!t.includes("/login")&&!t.includes("/token/refresh")&&this.getRefreshToken())try{return this.getToken()===o&&await this.refreshAccessToken(),this.request(t,e,!0)}catch{throw this.setToken(""),this.setRefreshToken(""),window.dispatchEvent(new CustomEvent("auth:expired")),new Error("Session expired. Please log in again.")}if(r.status===401&&!t.includes("/login"))throw this.setToken(""),this.setRefreshToken(""),window.dispatchEvent(new CustomEvent("auth:expired")),new Error("Session expired. Please log in again.");const l=await r.json().catch(()=>({}));if(!r.ok){let u=((c=l==null?void 0:l.error)==null?void 0:c.message)||(l==null?void 0:l.message)||`Request failed with status ${r.status}`;r.status===422&&((d=l==null?void 0:l.error)!=null&&d.details)&&(u=`Validation error: ${l.error.details.map(f=>{var y;return`${((y=f.path)==null?void 0:y.join("."))||(f.keys?f.keys.join(", "):"root")}: ${f.message||"Invalid value"}`}).join(" | ")}`);const h=new Error(u);throw h.status=r.status,h.details=(p=l==null?void 0:l.error)==null?void 0:p.details,h}return l}static get(t,e={}){const i=new URLSearchParams(e).toString(),n=i?`${t}?${i}`:t,a=JSON.stringify([this.getToken(),n]);let o=this._pendingGets.get(a);return o||(o=this.request(n,{method:"GET"}).finally(()=>{this._pendingGets.get(a)===o&&this._pendingGets.delete(a)}),this._pendingGets.set(a,o)),o.then(r=>structuredClone(r))}static post(t,e={}){return this._pendingGets.clear(),this.request(t,{method:"POST",body:JSON.stringify(e)}).finally(()=>this._pendingGets.clear())}static put(t,e={}){return this._pendingGets.clear(),this.request(t,{method:"PUT",body:JSON.stringify(e)}).finally(()=>this._pendingGets.clear())}static delete(t){return this._pendingGets.clear(),this.request(t,{method:"DELETE"}).finally(()=>this._pendingGets.clear())}}$(L,"_refreshPromise",null),$(L,"_pendingGets",new Map);class Ot{static isAuthenticated(){return!!L.getToken()}static async login(t,e){const i=await L.post("/api/v1/admin/auth/login",{email:t,password:e});if(i.success&&i.data){const{accessToken:n,token:a,refreshToken:o}=i.data;return L.setToken(n||a),o&&L.setRefreshToken(o),this.currentUser=i.data.admin||i.data.user||null,i.data}throw new Error("Login failed: Invalid credentials or token missing")}static async refreshToken(){try{return await L.refreshAccessToken()}catch{return this.logout(),null}}static async fetchMe(){if(!this.isAuthenticated())return null;try{const t=await L.get("/api/v1/admin/auth/me");if(t.success&&t.data)return this.currentUser=t.data,t.data}catch{this.logout()}return null}static logout(){L.getToken()&&L.post("/api/v1/admin/auth/logout").catch(()=>{}),L.setToken(""),L.setRefreshToken(""),this.currentUser=null,window.location.reload()}}$(Ot,"currentUser",null);class R{static subscribe(t){return this.listeners.push(t),()=>{this.listeners=this.listeners.filter(e=>e!==t)}}static notify(){this.listeners.forEach(t=>t({operators:this.operators,activeOperatorId:this.activeOperatorId,activeOperator:this.getActiveOperator()}))}static async loadOperators(){try{const t=await L.get("/api/v1/admin/operators");t.success&&Array.isArray(t.data)&&(this.operators=t.data,!this.activeOperatorId&&this.operators.length>0?this.setActiveOperator(this.operators[0].id):this.notify())}catch(t){console.warn("Failed to load operators:",t)}}static setActiveOperator(t){this.activeOperatorId!==t&&(this.activeOperatorId=t,localStorage.setItem("tickhigh_active_op",t),this.notify())}static setActiveOperatorId(t){return this.setActiveOperator(t)}static getActiveOperator(){return this.operators.find(t=>t.id===this.activeOperatorId)||null}}$(R,"operators",[]),$(R,"activeOperatorId",localStorage.getItem("tickhigh_active_op")||""),$(R,"listeners",[]);class D{static show(t,e="info",i=4e3){const n=document.getElementById("toast-container");if(!n)return;const a=document.createElement("div");a.className=`toast toast-${e}`;let o="ℹ️";e==="success"&&(o="✅"),e==="error"&&(o="❌"),a.innerHTML=`
      <span style="font-size: 16px;">${o}</span>
      <div style="flex: 1; line-height: 1.4;">${t}</div>
      <button style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px;">&times;</button>
    `,a.querySelector("button").onclick=()=>a.remove(),n.appendChild(a),setTimeout(()=>{a.style.opacity="0",a.style.transform="translateY(10px)",a.style.transition="all 0.3s ease",setTimeout(()=>a.remove(),300)},i)}static success(t){this.show(t,"success")}static error(t){this.show(t,"error",6e3)}static info(t){this.show(t,"info")}}const F='viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"',M={dashboard:`<svg ${F} width="18" height="18"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,operators:`<svg ${F} width="18" height="18"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,agents:`<svg ${F} width="18" height="18"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,plans:`<svg ${F} width="18" height="18"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,providers:`<svg ${F} width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,subscribers:`<svg ${F} width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,notifications:`<svg ${F} width="18" height="18"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,swagger:`<svg ${F} width="18" height="18"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`,logout:`<svg ${F} width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,plus:`<svg ${F} width="16" height="16"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>`,check:`<svg ${F} width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`,close:`<svg ${F} width="18" height="18"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`,refresh:`<svg ${F} width="16" height="16"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,edit:`<svg ${F} width="15" height="15"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,trash:`<svg ${F} width="15" height="15"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,palette:`<svg ${F} width="16" height="16"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,settings:`<svg ${F} width="16" height="16"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,globe:`<svg ${F} width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,search:`<svg ${F} width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>`,arrowRight:`<svg ${F} width="16" height="16"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,zap:`<svg ${F} width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,server:`<svg ${F} width="18" height="18"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>`,database:`<svg ${F} width="18" height="18"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`,shield:`<svg ${F} width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,signal:`<svg ${F} width="18" height="18"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V4"/></svg>`,creditCard:`<svg ${F} width="18" height="18"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,users:`<svg ${F} width="18" height="18"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,trendingUp:`<svg ${F} width="14" height="14"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,utensils:`<svg ${F}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,"graduation-cap":`<svg ${F}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,"book-open":`<svg ${F}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,"heart-pulse":`<svg ${F}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>`,dumbbell:`<svg ${F}><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,activity:`<svg ${F}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,wallet:`<svg ${F}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,coins:`<svg ${F}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>`,plane:`<svg ${F}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,compass:`<svg ${F}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,sparkles:`<svg ${F}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,music:`<svg ${F}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,camera:`<svg ${F}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,"message-square":`<svg ${F}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,briefcase:`<svg ${F}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,code:`<svg ${F}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,"shield-check":`<svg ${F}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`,"shopping-cart":`<svg ${F}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,newspaper:`<svg ${F}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>`,home:`<svg ${F}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,smile:`<svg ${F}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`,bot:`<svg ${F}><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/><path d="M12 2v4"/><circle cx="12" cy="2" r="1"/></svg>`,chef:`<svg ${F}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,tutor:`<svg ${F}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,doctor:`<svg ${F}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>`,finance:`<svg ${F}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,travel:`<svg ${F}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,fitness:`<svg ${F}><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,creative:`<svg ${F}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`},Ti=[{id:"utensils",label:"Recipes & Cooking",category:"Lifestyle",color:"#F97316"},{id:"heart-pulse",label:"Health & Wellness",category:"Wellness",color:"#10B981"},{id:"dumbbell",label:"Fitness & Gym",category:"Wellness",color:"#EF4444"},{id:"activity",label:"Daily Vitals & Habit",category:"Wellness",color:"#14B8A6"},{id:"graduation-cap",label:"Education & Study",category:"Education",color:"#3B82F6"},{id:"book-open",label:"Reading & Books",category:"Education",color:"#6366F1"},{id:"wallet",label:"Finance & Budget",category:"Finance",color:"#EAB308"},{id:"coins",label:"Savings & Money",category:"Finance",color:"#F59E0B"},{id:"plane",label:"Travel & Trips",category:"Travel",color:"#8B5CF6"},{id:"compass",label:"Local Guide & City",category:"Travel",color:"#06B6D4"},{id:"sparkles",label:"Fun & Creative",category:"Creative",color:"#EC4899"},{id:"music",label:"Music & Audio",category:"Creative",color:"#A855F7"},{id:"camera",label:"Art & Photography",category:"Creative",color:"#0EA5E9"},{id:"message-square",label:"Chat & Writing",category:"Social",color:"#3B82F6"},{id:"briefcase",label:"Career & Work",category:"Work",color:"#64748B"},{id:"code",label:"Coding & Tech",category:"Work",color:"#10B981"},{id:"shield-check",label:"Security & Safety",category:"Safety",color:"#059669"},{id:"shopping-cart",label:"Shopping & Deals",category:"Lifestyle",color:"#F97316"},{id:"newspaper",label:"News & Current Affairs",category:"Lifestyle",color:"#475569"},{id:"home",label:"Home & Parenting",category:"Lifestyle",color:"#0284C7"},{id:"smile",label:"Lifestyle & Mood",category:"Wellness",color:"#F59E0B"},{id:"bot",label:"Everyday Assistant",category:"General",color:"#6366F1"}];function mo(s=""){if(!s)return M.bot;const t=String(s).toLowerCase().trim();return M[t]?M[t]:t.includes("recipe")||t.includes("cook")||t.includes("culinary")||t.includes("food")||t.includes("dish")||t.includes("utensil")?M.utensils:t.includes("edu")||t.includes("study")||t.includes("tutor")||t.includes("school")||t.includes("exam")||t.includes("college")?M["graduation-cap"]:t.includes("book")||t.includes("read")||t.includes("story")||t.includes("lit")?M["book-open"]:t.includes("health")||t.includes("doctor")||t.includes("medical")||t.includes("wellness")||t.includes("pulse")?M["heart-pulse"]:t.includes("gym")||t.includes("fit")||t.includes("workout")||t.includes("dumbbell")||t.includes("exercise")?M.dumbbell:t.includes("finance")||t.includes("money")||t.includes("budget")||t.includes("bank")||t.includes("wallet")?M.wallet:t.includes("coin")||t.includes("invest")||t.includes("cash")?M.coins:t.includes("travel")||t.includes("trip")||t.includes("flight")||t.includes("vacation")||t.includes("plane")?M.plane:t.includes("compass")||t.includes("city")||t.includes("explore")||t.includes("local")||t.includes("guide")?M.compass:t.includes("creative")||t.includes("fun")||t.includes("joke")||t.includes("spark")||t.includes("magic")?M.sparkles:t.includes("music")||t.includes("song")||t.includes("audio")?M.music:t.includes("camera")||t.includes("photo")||t.includes("art")||t.includes("pic")?M.camera:t.includes("chat")||t.includes("message")||t.includes("comm")?M["message-square"]:t.includes("job")||t.includes("career")||t.includes("work")||t.includes("biz")||t.includes("briefcase")?M.briefcase:t.includes("code")||t.includes("tech")||t.includes("prog")||t.includes("dev")?M.code:t.includes("shield")||t.includes("secur")||t.includes("safe")||t.includes("privacy")?M["shield-check"]:t.includes("shop")||t.includes("cart")||t.includes("deal")||t.includes("buy")?M["shopping-cart"]:t.includes("news")||t.includes("paper")||t.includes("article")?M.newspaper:t.includes("home")||t.includes("house")||t.includes("family")||t.includes("parent")?M.home:t.includes("smile")||t.includes("mood")||t.includes("life")?M.smile:M.bot}function Bt({icon:s="bot",color:t="currentColor",size:e=20,className:i="",style:n=""}={}){const a=String(s||"bot").trim();if(a.startsWith("http://")||a.startsWith("https://")||a.startsWith("data:image/")||a.startsWith("/")||/\.(png|jpe?g|svg|webp|gif|ico)(\?.*)?$/i.test(a))return`<img src="${a}" width="${e}" height="${e}" alt="icon" class="${i}" style="width: ${e}px; height: ${e}px; object-fit: contain; display: inline-block; vertical-align: middle; border-radius: 4px; ${n}" onerror="this.onerror=null;this.replaceWith(document.createRange().createContextualFragment('${M.bot}'));" />`;let o=M[a]||mo(a);return o||(o=M.bot),o.replace(/width="[^"]*"/i,`width="${e}"`).replace(/height="[^"]*"/i,`height="${e}"`).replace(/stroke="[^"]*"/i,`stroke="${t}"`).replace(/<svg\s/i,`<svg class="${i}" style="display: inline-block; vertical-align: middle; ${n}" `)}class Hs{constructor(t,e){this.activeRoute=t,this.onNavigate=e}render(){const t=[{id:"overview",label:"Overview",icon:M.dashboard},{id:"operators",label:"Operators",icon:M.operators},{id:"agents",label:"AI Categories",icon:M.agents},{id:"providers",label:"Gateways & Flows",icon:M.providers},{id:"subscribers",label:"Subscribers",icon:M.subscribers},{id:"notifications",label:"Broadcast & Audit",icon:M.notifications},{id:"api-docs",label:"Portal Admin APIs",icon:M.swagger}],e=document.createElement("aside");e.className="sidebar",e.innerHTML=`
      <div style="padding: 24px 20px 16px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: linear-gradient(135deg, #6366f1, #06b6d4); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3);">
          TH
        </div>
        <div>
          <div style="font-family: var(--font-display); font-weight: 700; font-size: 16px; letter-spacing: -0.01em;">TickHigh</div>
          <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Portal Admin</div>
        </div>
      </div>

      <nav style="flex: 1; padding: 12px 0; overflow-y: auto;">
        ${t.map(n=>`
          <a href="#${n.id}" class="nav-item ${this.activeRoute===n.id||n.id==="operators"&&this.activeRoute.startsWith("operator-detail")?"active":""}" data-route="${n.id}">
            ${n.icon}
            <span>${n.label}</span>
          </a>
        `).join("")}

        <div style="margin: 16px 16px 8px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 8px;">
            Developer Resources
          </div>
          <a href="/docs/portal-admin/" target="_blank" class="nav-item" style="color: var(--accent-cyan);">
            ${M.swagger}
            <span>Portal Admin Swagger</span>
          </a>
          <a href="/health" target="_blank" class="nav-item" style="font-size: 12px;">
            <div class="pulse-dot" style="margin-right: -4px;"></div>
            <span>System Health API</span>
          </a>
        </div>
      </nav>

      <div style="padding: 16px 20px; border-top: 1px solid var(--border-subtle); background: rgba(0,0,0,0.2); font-size: 12px; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
        <span>v1.0.0 Enterprise</span>
        <span class="badge badge-success" style="font-size: 10px;">Connected</span>
      </div>
    `,e.querySelectorAll("a[data-route]").forEach(n=>{n.addEventListener("click",a=>{a.preventDefault();const o=n.getAttribute("data-route");this.onNavigate(o)})});const i=e.querySelector("#sidebar-operator-select");return i&&i.addEventListener("change",n=>{R.setActiveOperator(n.target.value)}),e}}class Vs{constructor(t){this.currentTitle=t}render(){const t=document.createElement("header");t.className="top-header";const e=Ot.currentUser,i=R.getActiveOperator();let n=(this.currentTitle||"Overview").split("?")[0].replace(/-/g," ");return n==="operator detail"&&(n="Operator Studio"),t.innerHTML=`
      <div style="display: flex; align-items: center; gap: 12px; min-width: 0; overflow: hidden;">
        <h2 style="font-size: 17px; font-weight: 700; color: var(--text-primary); text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${n}
        </h2>
        ${i?`
          <div class="badge badge-primary" style="font-size: 11px; white-space: nowrap; flex-shrink: 0;">
            ${i.name} (${i.subdomain||i.code})
          </div>
        `:`
          <div class="badge badge-cyan" style="font-size: 11px; white-space: nowrap; flex-shrink: 0;">
            Platform Root Scope
          </div>
        `}
      </div>

      <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-full);">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #ec4899); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white;">
            ${e!=null&&e.email?e.email.charAt(0).toUpperCase():"A"}
          </div>
          <div style="font-size: 12.5px; font-weight: 500; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${(e==null?void 0:e.email)||"admin@tickhigh.com"}
          </div>
          <span class="badge badge-success" style="font-size: 9px; padding: 1px 6px;">
            ${(e==null?void 0:e.role)||"SUPER ADMIN"}
          </span>
        </div>

        <button id="header-logout-btn" class="btn btn-secondary btn-icon" title="Log Out" style="width: 32px; height: 32px;">
          ${M.logout}
        </button>
      </div>
    `,t.querySelector("#header-logout-btn").onclick=()=>{confirm("Are you sure you want to log out?")&&Ot.logout()},t}}class bo{constructor(t){this.onLoginSuccess=t}render(){const t=document.createElement("div");t.style.cssText=`
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
    `,t.innerHTML=`
      <div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15), transparent 60%); pointer-events: none;"></div>

      <div class="card" style="width: 100%; max-width: 440px; padding: 36px; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg), 0 0 40px rgba(99,102,241,0.2); position: relative; z-index: 10;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="width: 48px; height: 48px; margin: 0 auto 16px; border-radius: var(--radius-md); background: linear-gradient(135deg, #6366f1, #06b6d4); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.4);">
            TH
          </div>
          <h1 style="font-size: 24px; margin-bottom: 6px;">TickHigh Platform</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Telecom VAS Multi-Operator Admin Console</p>
        </div>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="login-email" class="form-input" placeholder="admin@tickhigh.com" required value="admin@tickhigh.com" />
          </div>

          <div class="form-group mb-6">
            <label class="form-label">Admin Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" required value="Admin@123456" />
          </div>

          <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 14px;">
            Sign In to Console
          </button>

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle); text-align: center;">
            <button type="button" id="demo-fill-btn" class="btn btn-secondary" style="width: 100%; font-size: 12px; padding: 8px;">
              ⚡ Fill Default Admin Credentials
            </button>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
              Super Admin: <code>admin@tickhigh.com</code> / <code>Admin@123456</code>
            </div>
          </div>
        </form>
      </div>
    `;const e=t.querySelector("#login-form"),i=t.querySelector("#login-email"),n=t.querySelector("#login-password"),a=t.querySelector("#login-submit-btn"),o=t.querySelector("#demo-fill-btn");return o.onclick=()=>{i.value="admin@tickhigh.com",n.value="Admin@123456",D.info("Default credentials inserted")},e.onsubmit=async r=>{r.preventDefault(),a.disabled=!0,a.innerText="Verifying Session...";try{await Ot.login(i.value.trim(),n.value),D.success("Welcome back, Super Admin!"),this.onLoginSuccess()}catch(l){D.error(l.message||"Login failed"),a.disabled=!1,a.innerText="Sign In to Console"}},t}}/*!
 * @kurkle/color v0.3.4
 * https://github.com/kurkle/color#readme
 * (c) 2024 Jukka Kurkela
 * Released under the MIT License
 */function ii(s){return s+.5|0}const Kt=(s,t,e)=>Math.max(Math.min(s,e),t);function Ee(s){return Kt(ii(s*2.55),0,255)}function te(s){return Kt(ii(s*255),0,255)}function Rt(s){return Kt(ii(s/2.55)/100,0,1)}function js(s){return Kt(ii(s*100),0,100)}const St={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,A:10,B:11,C:12,D:13,E:14,F:15,a:10,b:11,c:12,d:13,e:14,f:15},is=[..."0123456789ABCDEF"],yo=s=>is[s&15],xo=s=>is[(s&240)>>4]+is[s&15],ni=s=>(s&240)>>4===(s&15),vo=s=>ni(s.r)&&ni(s.g)&&ni(s.b)&&ni(s.a);function wo(s){var t=s.length,e;return s[0]==="#"&&(t===4||t===5?e={r:255&St[s[1]]*17,g:255&St[s[2]]*17,b:255&St[s[3]]*17,a:t===5?St[s[4]]*17:255}:(t===7||t===9)&&(e={r:St[s[1]]<<4|St[s[2]],g:St[s[3]]<<4|St[s[4]],b:St[s[5]]<<4|St[s[6]],a:t===9?St[s[7]]<<4|St[s[8]]:255})),e}const So=(s,t)=>s<255?t(s):"";function ko(s){var t=vo(s)?yo:xo;return s?"#"+t(s.r)+t(s.g)+t(s.b)+So(s.a,t):void 0}const _o=/^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;function ma(s,t,e){const i=t*Math.min(e,1-e),n=(a,o=(a+s/30)%12)=>e-i*Math.max(Math.min(o-3,9-o,1),-1);return[n(0),n(8),n(4)]}function Co(s,t,e){const i=(n,a=(n+s/60)%6)=>e-e*t*Math.max(Math.min(a,4-a,1),0);return[i(5),i(3),i(1)]}function To(s,t,e){const i=ma(s,1,.5);let n;for(t+e>1&&(n=1/(t+e),t*=n,e*=n),n=0;n<3;n++)i[n]*=1-t-e,i[n]+=t;return i}function Mo(s,t,e,i,n){return s===n?(t-e)/i+(t<e?6:0):t===n?(e-s)/i+2:(s-t)/i+4}function ys(s){const e=s.r/255,i=s.g/255,n=s.b/255,a=Math.max(e,i,n),o=Math.min(e,i,n),r=(a+o)/2;let l,c,d;return a!==o&&(d=a-o,c=r>.5?d/(2-a-o):d/(a+o),l=Mo(e,i,n,d,a),l=l*60+.5),[l|0,c||0,r]}function xs(s,t,e,i){return(Array.isArray(t)?s(t[0],t[1],t[2]):s(t,e,i)).map(te)}function vs(s,t,e){return xs(ma,s,t,e)}function Ao(s,t,e){return xs(To,s,t,e)}function $o(s,t,e){return xs(Co,s,t,e)}function ba(s){return(s%360+360)%360}function Po(s){const t=_o.exec(s);let e=255,i;if(!t)return;t[5]!==i&&(e=t[6]?Ee(+t[5]):te(+t[5]));const n=ba(+t[2]),a=+t[3]/100,o=+t[4]/100;return t[1]==="hwb"?i=Ao(n,a,o):t[1]==="hsv"?i=$o(n,a,o):i=vs(n,a,o),{r:i[0],g:i[1],b:i[2],a:e}}function Oo(s,t){var e=ys(s);e[0]=ba(e[0]+t),e=vs(e),s.r=e[0],s.g=e[1],s.b=e[2]}function Io(s){if(!s)return;const t=ys(s),e=t[0],i=js(t[1]),n=js(t[2]);return s.a<255?`hsla(${e}, ${i}%, ${n}%, ${Rt(s.a)})`:`hsl(${e}, ${i}%, ${n}%)`}const Ws={x:"dark",Z:"light",Y:"re",X:"blu",W:"gr",V:"medium",U:"slate",A:"ee",T:"ol",S:"or",B:"ra",C:"lateg",D:"ights",R:"in",Q:"turquois",E:"hi",P:"ro",O:"al",N:"le",M:"de",L:"yello",F:"en",K:"ch",G:"arks",H:"ea",I:"ightg",J:"wh"},Us={OiceXe:"f0f8ff",antiquewEte:"faebd7",aqua:"ffff",aquamarRe:"7fffd4",azuY:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"0",blanKedOmond:"ffebcd",Xe:"ff",XeviTet:"8a2be2",bPwn:"a52a2a",burlywood:"deb887",caMtXe:"5f9ea0",KartYuse:"7fff00",KocTate:"d2691e",cSO:"ff7f50",cSnflowerXe:"6495ed",cSnsilk:"fff8dc",crimson:"dc143c",cyan:"ffff",xXe:"8b",xcyan:"8b8b",xgTMnPd:"b8860b",xWay:"a9a9a9",xgYF:"6400",xgYy:"a9a9a9",xkhaki:"bdb76b",xmagFta:"8b008b",xTivegYF:"556b2f",xSange:"ff8c00",xScEd:"9932cc",xYd:"8b0000",xsOmon:"e9967a",xsHgYF:"8fbc8f",xUXe:"483d8b",xUWay:"2f4f4f",xUgYy:"2f4f4f",xQe:"ced1",xviTet:"9400d3",dAppRk:"ff1493",dApskyXe:"bfff",dimWay:"696969",dimgYy:"696969",dodgerXe:"1e90ff",fiYbrick:"b22222",flSOwEte:"fffaf0",foYstWAn:"228b22",fuKsia:"ff00ff",gaRsbSo:"dcdcdc",ghostwEte:"f8f8ff",gTd:"ffd700",gTMnPd:"daa520",Way:"808080",gYF:"8000",gYFLw:"adff2f",gYy:"808080",honeyMw:"f0fff0",hotpRk:"ff69b4",RdianYd:"cd5c5c",Rdigo:"4b0082",ivSy:"fffff0",khaki:"f0e68c",lavFMr:"e6e6fa",lavFMrXsh:"fff0f5",lawngYF:"7cfc00",NmoncEffon:"fffacd",ZXe:"add8e6",ZcSO:"f08080",Zcyan:"e0ffff",ZgTMnPdLw:"fafad2",ZWay:"d3d3d3",ZgYF:"90ee90",ZgYy:"d3d3d3",ZpRk:"ffb6c1",ZsOmon:"ffa07a",ZsHgYF:"20b2aa",ZskyXe:"87cefa",ZUWay:"778899",ZUgYy:"778899",ZstAlXe:"b0c4de",ZLw:"ffffe0",lime:"ff00",limegYF:"32cd32",lRF:"faf0e6",magFta:"ff00ff",maPon:"800000",VaquamarRe:"66cdaa",VXe:"cd",VScEd:"ba55d3",VpurpN:"9370db",VsHgYF:"3cb371",VUXe:"7b68ee",VsprRggYF:"fa9a",VQe:"48d1cc",VviTetYd:"c71585",midnightXe:"191970",mRtcYam:"f5fffa",mistyPse:"ffe4e1",moccasR:"ffe4b5",navajowEte:"ffdead",navy:"80",Tdlace:"fdf5e6",Tive:"808000",TivedBb:"6b8e23",Sange:"ffa500",SangeYd:"ff4500",ScEd:"da70d6",pOegTMnPd:"eee8aa",pOegYF:"98fb98",pOeQe:"afeeee",pOeviTetYd:"db7093",papayawEp:"ffefd5",pHKpuff:"ffdab9",peru:"cd853f",pRk:"ffc0cb",plum:"dda0dd",powMrXe:"b0e0e6",purpN:"800080",YbeccapurpN:"663399",Yd:"ff0000",Psybrown:"bc8f8f",PyOXe:"4169e1",saddNbPwn:"8b4513",sOmon:"fa8072",sandybPwn:"f4a460",sHgYF:"2e8b57",sHshell:"fff5ee",siFna:"a0522d",silver:"c0c0c0",skyXe:"87ceeb",UXe:"6a5acd",UWay:"708090",UgYy:"708090",snow:"fffafa",sprRggYF:"ff7f",stAlXe:"4682b4",tan:"d2b48c",teO:"8080",tEstN:"d8bfd8",tomato:"ff6347",Qe:"40e0d0",viTet:"ee82ee",JHt:"f5deb3",wEte:"ffffff",wEtesmoke:"f5f5f5",Lw:"ffff00",LwgYF:"9acd32"};function zo(){const s={},t=Object.keys(Us),e=Object.keys(Ws);let i,n,a,o,r;for(i=0;i<t.length;i++){for(o=r=t[i],n=0;n<e.length;n++)a=e[n],r=r.replace(a,Ws[a]);a=parseInt(Us[o],16),s[r]=[a>>16&255,a>>8&255,a&255]}return s}let ai;function Do(s){ai||(ai=zo(),ai.transparent=[0,0,0,0]);const t=ai[s.toLowerCase()];return t&&{r:t[0],g:t[1],b:t[2],a:t.length===4?t[3]:255}}const Lo=/^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;function Eo(s){const t=Lo.exec(s);let e=255,i,n,a;if(t){if(t[7]!==i){const o=+t[7];e=t[8]?Ee(o):Kt(o*255,0,255)}return i=+t[1],n=+t[3],a=+t[5],i=255&(t[2]?Ee(i):Kt(i,0,255)),n=255&(t[4]?Ee(n):Kt(n,0,255)),a=255&(t[6]?Ee(a):Kt(a,0,255)),{r:i,g:n,b:a,a:e}}}function Ro(s){return s&&(s.a<255?`rgba(${s.r}, ${s.g}, ${s.b}, ${Rt(s.a)})`:`rgb(${s.r}, ${s.g}, ${s.b})`)}const Hi=s=>s<=.0031308?s*12.92:Math.pow(s,1/2.4)*1.055-.055,ve=s=>s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4);function Fo(s,t,e){const i=ve(Rt(s.r)),n=ve(Rt(s.g)),a=ve(Rt(s.b));return{r:te(Hi(i+e*(ve(Rt(t.r))-i))),g:te(Hi(n+e*(ve(Rt(t.g))-n))),b:te(Hi(a+e*(ve(Rt(t.b))-a))),a:s.a+e*(t.a-s.a)}}function oi(s,t,e){if(s){let i=ys(s);i[t]=Math.max(0,Math.min(i[t]+i[t]*e,t===0?360:1)),i=vs(i),s.r=i[0],s.g=i[1],s.b=i[2]}}function ya(s,t){return s&&Object.assign(t||{},s)}function Gs(s){var t={r:0,g:0,b:0,a:255};return Array.isArray(s)?s.length>=3&&(t={r:s[0],g:s[1],b:s[2],a:255},s.length>3&&(t.a=te(s[3]))):(t=ya(s,{r:0,g:0,b:0,a:1}),t.a=te(t.a)),t}function Bo(s){return s.charAt(0)==="r"?Eo(s):Po(s)}class Ye{constructor(t){if(t instanceof Ye)return t;const e=typeof t;let i;e==="object"?i=Gs(t):e==="string"&&(i=wo(t)||Do(t)||Bo(t)),this._rgb=i,this._valid=!!i}get valid(){return this._valid}get rgb(){var t=ya(this._rgb);return t&&(t.a=Rt(t.a)),t}set rgb(t){this._rgb=Gs(t)}rgbString(){return this._valid?Ro(this._rgb):void 0}hexString(){return this._valid?ko(this._rgb):void 0}hslString(){return this._valid?Io(this._rgb):void 0}mix(t,e){if(t){const i=this.rgb,n=t.rgb;let a;const o=e===a?.5:e,r=2*o-1,l=i.a-n.a,c=((r*l===-1?r:(r+l)/(1+r*l))+1)/2;a=1-c,i.r=255&c*i.r+a*n.r+.5,i.g=255&c*i.g+a*n.g+.5,i.b=255&c*i.b+a*n.b+.5,i.a=o*i.a+(1-o)*n.a,this.rgb=i}return this}interpolate(t,e){return t&&(this._rgb=Fo(this._rgb,t._rgb,e)),this}clone(){return new Ye(this.rgb)}alpha(t){return this._rgb.a=te(t),this}clearer(t){const e=this._rgb;return e.a*=1-t,this}greyscale(){const t=this._rgb,e=ii(t.r*.3+t.g*.59+t.b*.11);return t.r=t.g=t.b=e,this}opaquer(t){const e=this._rgb;return e.a*=1+t,this}negate(){const t=this._rgb;return t.r=255-t.r,t.g=255-t.g,t.b=255-t.b,this}lighten(t){return oi(this._rgb,2,t),this}darken(t){return oi(this._rgb,2,-t),this}saturate(t){return oi(this._rgb,1,t),this}desaturate(t){return oi(this._rgb,1,-t),this}rotate(t){return Oo(this._rgb,t),this}}/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */function Dt(){}const qo=(()=>{let s=0;return()=>s++})();function U(s){return s==null}function tt(s){if(Array.isArray&&Array.isArray(s))return!0;const t=Object.prototype.toString.call(s);return t.slice(0,7)==="[object"&&t.slice(-6)==="Array]"}function G(s){return s!==null&&Object.prototype.toString.call(s)==="[object Object]"}function st(s){return(typeof s=="number"||s instanceof Number)&&isFinite(+s)}function vt(s,t){return st(s)?s:t}function H(s,t){return typeof s>"u"?t:s}const No=(s,t)=>typeof s=="string"&&s.endsWith("%")?parseFloat(s)/100:+s/t,xa=(s,t)=>typeof s=="string"&&s.endsWith("%")?parseFloat(s)/100*t:+s;function Z(s,t,e){if(s&&typeof s.call=="function")return s.apply(e,t)}function K(s,t,e,i){let n,a,o;if(tt(s))for(a=s.length,n=0;n<a;n++)t.call(e,s[n],n);else if(G(s))for(o=Object.keys(s),a=o.length,n=0;n<a;n++)t.call(e,s[o[n]],o[n])}function Mi(s,t){let e,i,n,a;if(!s||!t||s.length!==t.length)return!1;for(e=0,i=s.length;e<i;++e)if(n=s[e],a=t[e],n.datasetIndex!==a.datasetIndex||n.index!==a.index)return!1;return!0}function Ai(s){if(tt(s))return s.map(Ai);if(G(s)){const t=Object.create(null),e=Object.keys(s),i=e.length;let n=0;for(;n<i;++n)t[e[n]]=Ai(s[e[n]]);return t}return s}function va(s){return["__proto__","prototype","constructor"].indexOf(s)===-1}function Ho(s,t,e,i){if(!va(s))return;const n=t[s],a=e[s];G(n)&&G(a)?Ke(n,a,i):t[s]=Ai(a)}function Ke(s,t,e){const i=tt(t)?t:[t],n=i.length;if(!G(s))return s;e=e||{};const a=e.merger||Ho;let o;for(let r=0;r<n;++r){if(o=i[r],!G(o))continue;const l=Object.keys(o);for(let c=0,d=l.length;c<d;++c)a(l[c],s,o,e)}return s}function Ve(s,t){return Ke(s,t,{merger:Vo})}function Vo(s,t,e){if(!va(s))return;const i=t[s],n=e[s];G(i)&&G(n)?Ve(i,n):Object.prototype.hasOwnProperty.call(t,s)||(t[s]=Ai(n))}const Ys={"":s=>s,x:s=>s.x,y:s=>s.y};function jo(s){const t=s.split("."),e=[];let i="";for(const n of t)i+=n,i.endsWith("\\")?i=i.slice(0,-1)+".":(e.push(i),i="");return e}function Wo(s){const t=jo(s);return e=>{for(const i of t){if(i==="")break;e=e&&e[i]}return e}}function ee(s,t){return(Ys[t]||(Ys[t]=Wo(t)))(s)}function ws(s){return s.charAt(0).toUpperCase()+s.slice(1)}const Xe=s=>typeof s<"u",ie=s=>typeof s=="function",Ks=(s,t)=>{if(s.size!==t.size)return!1;for(const e of s)if(!t.has(e))return!1;return!0};function Uo(s){return s.type==="mouseup"||s.type==="click"||s.type==="contextmenu"}const Y=Math.PI,Q=2*Y,Go=Q+Y,$i=Number.POSITIVE_INFINITY,Yo=Y/180,at=Y/2,le=Y/4,Xs=Y*2/3,Xt=Math.log10,It=Math.sign;function je(s,t,e){return Math.abs(s-t)<e}function Zs(s){const t=Math.round(s);s=je(s,t,s/1e3)?t:s;const e=Math.pow(10,Math.floor(Xt(s))),i=s/e;return(i<=1?1:i<=2?2:i<=5?5:10)*e}function Ko(s){const t=[],e=Math.sqrt(s);let i;for(i=1;i<e;i++)s%i===0&&(t.push(i),t.push(s/i));return e===(e|0)&&t.push(e),t.sort((n,a)=>n-a).pop(),t}function Xo(s){return typeof s=="symbol"||typeof s=="object"&&s!==null&&!(Symbol.toPrimitive in s||"toString"in s||"valueOf"in s)}function ke(s){return!Xo(s)&&!isNaN(parseFloat(s))&&isFinite(s)}function Zo(s,t){const e=Math.round(s);return e-t<=s&&e+t>=s}function wa(s,t,e){let i,n,a;for(i=0,n=s.length;i<n;i++)a=s[i][e],isNaN(a)||(t.min=Math.min(t.min,a),t.max=Math.max(t.max,a))}function kt(s){return s*(Y/180)}function Ss(s){return s*(180/Y)}function Qs(s){if(!st(s))return;let t=1,e=0;for(;Math.round(s*t)/t!==s;)t*=10,e++;return e}function Sa(s,t){const e=t.x-s.x,i=t.y-s.y,n=Math.sqrt(e*e+i*i);let a=Math.atan2(i,e);return a<-.5*Y&&(a+=Q),{angle:a,distance:n}}function ss(s,t){return Math.sqrt(Math.pow(t.x-s.x,2)+Math.pow(t.y-s.y,2))}function Qo(s,t){return(s-t+Go)%Q-Y}function ht(s){return(s%Q+Q)%Q}function Ze(s,t,e,i){const n=ht(s),a=ht(t),o=ht(e),r=ht(a-n),l=ht(o-n),c=ht(n-a),d=ht(n-o);return n===a||n===o||i&&a===o||r>l&&c<d}function ct(s,t,e){return Math.max(t,Math.min(e,s))}function Jo(s){return ct(s,-32768,32767)}function qt(s,t,e,i=1e-6){return s>=Math.min(t,e)-i&&s<=Math.max(t,e)+i}function ks(s,t,e){e=e||(o=>s[o]<t);let i=s.length-1,n=0,a;for(;i-n>1;)a=n+i>>1,e(a)?n=a:i=a;return{lo:n,hi:i}}const Nt=(s,t,e,i)=>ks(s,e,i?n=>{const a=s[n][t];return a<e||a===e&&s[n+1][t]===e}:n=>s[n][t]<e),tr=(s,t,e)=>ks(s,e,i=>s[i][t]>=e);function er(s,t,e){let i=0,n=s.length;for(;i<n&&s[i]<t;)i++;for(;n>i&&s[n-1]>e;)n--;return i>0||n<s.length?s.slice(i,n):s}const ka=["push","pop","shift","splice","unshift"];function ir(s,t){if(s._chartjs){s._chartjs.listeners.push(t);return}Object.defineProperty(s,"_chartjs",{configurable:!0,enumerable:!1,value:{listeners:[t]}}),ka.forEach(e=>{const i="_onData"+ws(e),n=s[e];Object.defineProperty(s,e,{configurable:!0,enumerable:!1,value(...a){const o=n.apply(this,a);return s._chartjs.listeners.forEach(r=>{typeof r[i]=="function"&&r[i](...a)}),o}})})}function Js(s,t){const e=s._chartjs;if(!e)return;const i=e.listeners,n=i.indexOf(t);n!==-1&&i.splice(n,1),!(i.length>0)&&(ka.forEach(a=>{delete s[a]}),delete s._chartjs)}function _a(s){const t=new Set(s);return t.size===s.length?s:Array.from(t)}const Ca=(function(){return typeof window>"u"?function(s){return s()}:window.requestAnimationFrame})();function Ta(s,t){let e=[],i=!1;return function(...n){e=n,i||(i=!0,Ca.call(window,()=>{i=!1,s.apply(t,e)}))}}function sr(s,t){let e;return function(...i){return t?(clearTimeout(e),e=setTimeout(s,t,i)):s.apply(this,i),t}}const _s=s=>s==="start"?"left":s==="end"?"right":"center",ut=(s,t,e)=>s==="start"?t:s==="end"?e:(t+e)/2,nr=(s,t,e,i)=>s===(i?"left":"right")?e:s==="center"?(t+e)/2:t;function Ma(s,t,e){const i=t.length;let n=0,a=i;if(s._sorted){const{iScale:o,vScale:r,_parsed:l}=s,c=s.dataset&&s.dataset.options?s.dataset.options.spanGaps:null,d=o.axis,{min:p,max:u,minDefined:h,maxDefined:g}=o.getUserBounds();if(h){if(n=Math.min(Nt(l,d,p).lo,e?i:Nt(t,d,o.getPixelForValue(p)).lo),c){const f=l.slice(0,n+1).reverse().findIndex(m=>!U(m[r.axis]));n-=Math.max(0,f)}n=ct(n,0,i-1)}if(g){let f=Math.max(Nt(l,o.axis,u,!0).hi+1,e?0:Nt(t,d,o.getPixelForValue(u),!0).hi+1);if(c){const m=l.slice(f-1).findIndex(y=>!U(y[r.axis]));f+=Math.max(0,m)}a=ct(f,n,i)-n}else a=i-n}return{start:n,count:a}}function Aa(s){const{xScale:t,yScale:e,_scaleRanges:i}=s,n={xmin:t.min,xmax:t.max,ymin:e.min,ymax:e.max};if(!i)return s._scaleRanges=n,!0;const a=i.xmin!==t.min||i.xmax!==t.max||i.ymin!==e.min||i.ymax!==e.max;return Object.assign(i,n),a}const ri=s=>s===0||s===1,tn=(s,t,e)=>-(Math.pow(2,10*(s-=1))*Math.sin((s-t)*Q/e)),en=(s,t,e)=>Math.pow(2,-10*s)*Math.sin((s-t)*Q/e)+1,We={linear:s=>s,easeInQuad:s=>s*s,easeOutQuad:s=>-s*(s-2),easeInOutQuad:s=>(s/=.5)<1?.5*s*s:-.5*(--s*(s-2)-1),easeInCubic:s=>s*s*s,easeOutCubic:s=>(s-=1)*s*s+1,easeInOutCubic:s=>(s/=.5)<1?.5*s*s*s:.5*((s-=2)*s*s+2),easeInQuart:s=>s*s*s*s,easeOutQuart:s=>-((s-=1)*s*s*s-1),easeInOutQuart:s=>(s/=.5)<1?.5*s*s*s*s:-.5*((s-=2)*s*s*s-2),easeInQuint:s=>s*s*s*s*s,easeOutQuint:s=>(s-=1)*s*s*s*s+1,easeInOutQuint:s=>(s/=.5)<1?.5*s*s*s*s*s:.5*((s-=2)*s*s*s*s+2),easeInSine:s=>-Math.cos(s*at)+1,easeOutSine:s=>Math.sin(s*at),easeInOutSine:s=>-.5*(Math.cos(Y*s)-1),easeInExpo:s=>s===0?0:Math.pow(2,10*(s-1)),easeOutExpo:s=>s===1?1:-Math.pow(2,-10*s)+1,easeInOutExpo:s=>ri(s)?s:s<.5?.5*Math.pow(2,10*(s*2-1)):.5*(-Math.pow(2,-10*(s*2-1))+2),easeInCirc:s=>s>=1?s:-(Math.sqrt(1-s*s)-1),easeOutCirc:s=>Math.sqrt(1-(s-=1)*s),easeInOutCirc:s=>(s/=.5)<1?-.5*(Math.sqrt(1-s*s)-1):.5*(Math.sqrt(1-(s-=2)*s)+1),easeInElastic:s=>ri(s)?s:tn(s,.075,.3),easeOutElastic:s=>ri(s)?s:en(s,.075,.3),easeInOutElastic(s){return ri(s)?s:s<.5?.5*tn(s*2,.1125,.45):.5+.5*en(s*2-1,.1125,.45)},easeInBack(s){return s*s*((1.70158+1)*s-1.70158)},easeOutBack(s){return(s-=1)*s*((1.70158+1)*s+1.70158)+1},easeInOutBack(s){let t=1.70158;return(s/=.5)<1?.5*(s*s*(((t*=1.525)+1)*s-t)):.5*((s-=2)*s*(((t*=1.525)+1)*s+t)+2)},easeInBounce:s=>1-We.easeOutBounce(1-s),easeOutBounce(s){return s<1/2.75?7.5625*s*s:s<2/2.75?7.5625*(s-=1.5/2.75)*s+.75:s<2.5/2.75?7.5625*(s-=2.25/2.75)*s+.9375:7.5625*(s-=2.625/2.75)*s+.984375},easeInOutBounce:s=>s<.5?We.easeInBounce(s*2)*.5:We.easeOutBounce(s*2-1)*.5+.5};function Cs(s){if(s&&typeof s=="object"){const t=s.toString();return t==="[object CanvasPattern]"||t==="[object CanvasGradient]"}return!1}function sn(s){return Cs(s)?s:new Ye(s)}function Vi(s){return Cs(s)?s:new Ye(s).saturate(.5).darken(.1).hexString()}const ar=["x","y","borderWidth","radius","tension"],or=["color","borderColor","backgroundColor"];function rr(s){s.set("animation",{delay:void 0,duration:1e3,easing:"easeOutQuart",fn:void 0,from:void 0,loop:void 0,to:void 0,type:void 0}),s.describe("animation",{_fallback:!1,_indexable:!1,_scriptable:t=>t!=="onProgress"&&t!=="onComplete"&&t!=="fn"}),s.set("animations",{colors:{type:"color",properties:or},numbers:{type:"number",properties:ar}}),s.describe("animations",{_fallback:"animation"}),s.set("transitions",{active:{animation:{duration:400}},resize:{animation:{duration:0}},show:{animations:{colors:{from:"transparent"},visible:{type:"boolean",duration:0}}},hide:{animations:{colors:{to:"transparent"},visible:{type:"boolean",easing:"linear",fn:t=>t|0}}}})}function lr(s){s.set("layout",{autoPadding:!0,padding:{top:0,right:0,bottom:0,left:0}})}const nn=new Map;function cr(s,t){t=t||{};const e=s+JSON.stringify(t);let i=nn.get(e);return i||(i=new Intl.NumberFormat(s,t),nn.set(e,i)),i}function si(s,t,e){return cr(t,e).format(s)}const $a={values(s){return tt(s)?s:""+s},numeric(s,t,e){if(s===0)return"0";const i=this.chart.options.locale;let n,a=s;if(e.length>1){const c=Math.max(Math.abs(e[0].value),Math.abs(e[e.length-1].value));(c<1e-4||c>1e15)&&(n="scientific"),a=dr(s,e)}const o=Xt(Math.abs(a)),r=isNaN(o)?1:Math.max(Math.min(-1*Math.floor(o),20),0),l={notation:n,minimumFractionDigits:r,maximumFractionDigits:r};return Object.assign(l,this.options.ticks.format),si(s,i,l)},logarithmic(s,t,e){if(s===0)return"0";const i=e[t].significand||s/Math.pow(10,Math.floor(Xt(s)));return[1,2,3,5,10,15].includes(i)||t>.8*e.length?$a.numeric.call(this,s,t,e):""}};function dr(s,t){let e=t.length>3?t[2].value-t[1].value:t[1].value-t[0].value;return Math.abs(e)>=1&&s!==Math.floor(s)&&(e=s-Math.floor(s)),e}var Li={formatters:$a};function pr(s){s.set("scale",{display:!0,offset:!1,reverse:!1,beginAtZero:!1,bounds:"ticks",clip:!0,grace:0,grid:{display:!0,lineWidth:1,drawOnChartArea:!0,drawTicks:!0,tickLength:8,tickWidth:(t,e)=>e.lineWidth,tickColor:(t,e)=>e.color,offset:!1},border:{display:!0,dash:[],dashOffset:0,width:1},title:{display:!1,text:"",padding:{top:4,bottom:4}},ticks:{minRotation:0,maxRotation:50,mirror:!1,textStrokeWidth:0,textStrokeColor:"",padding:3,display:!0,autoSkip:!0,autoSkipPadding:3,labelOffset:0,callback:Li.formatters.values,minor:{},major:{},align:"center",crossAlign:"near",showLabelBackdrop:!1,backdropColor:"rgba(255, 255, 255, 0.75)",backdropPadding:2}}),s.route("scale.ticks","color","","color"),s.route("scale.grid","color","","borderColor"),s.route("scale.border","color","","borderColor"),s.route("scale.title","color","","color"),s.describe("scale",{_fallback:!1,_scriptable:t=>!t.startsWith("before")&&!t.startsWith("after")&&t!=="callback"&&t!=="parser",_indexable:t=>t!=="borderDash"&&t!=="tickBorderDash"&&t!=="dash"}),s.describe("scales",{_fallback:"scale"}),s.describe("scale.ticks",{_scriptable:t=>t!=="backdropPadding"&&t!=="callback",_indexable:t=>t!=="backdropPadding"})}const be=Object.create(null),ns=Object.create(null);function Ue(s,t){if(!t)return s;const e=t.split(".");for(let i=0,n=e.length;i<n;++i){const a=e[i];s=s[a]||(s[a]=Object.create(null))}return s}function ji(s,t,e){return typeof t=="string"?Ke(Ue(s,t),e):Ke(Ue(s,""),t)}class ur{constructor(t,e){this.animation=void 0,this.backgroundColor="rgba(0,0,0,0.1)",this.borderColor="rgba(0,0,0,0.1)",this.color="#666",this.datasets={},this.devicePixelRatio=i=>i.chart.platform.getDevicePixelRatio(),this.elements={},this.events=["mousemove","mouseout","click","touchstart","touchmove"],this.font={family:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",size:12,style:"normal",lineHeight:1.2,weight:null},this.hover={},this.hoverBackgroundColor=(i,n)=>Vi(n.backgroundColor),this.hoverBorderColor=(i,n)=>Vi(n.borderColor),this.hoverColor=(i,n)=>Vi(n.color),this.indexAxis="x",this.interaction={mode:"nearest",intersect:!0,includeInvisible:!1},this.maintainAspectRatio=!0,this.onHover=null,this.onClick=null,this.parsing=!0,this.plugins={},this.responsive=!0,this.scale=void 0,this.scales={},this.showLine=!0,this.drawActiveElementsOnTop=!0,this.describe(t),this.apply(e)}set(t,e){return ji(this,t,e)}get(t){return Ue(this,t)}describe(t,e){return ji(ns,t,e)}override(t,e){return ji(be,t,e)}route(t,e,i,n){const a=Ue(this,t),o=Ue(this,i),r="_"+e;Object.defineProperties(a,{[r]:{value:a[e],writable:!0},[e]:{enumerable:!0,get(){const l=this[r],c=o[n];return G(l)?Object.assign({},c,l):H(l,c)},set(l){this[r]=l}}})}apply(t){t.forEach(e=>e(this))}}var et=new ur({_scriptable:s=>!s.startsWith("on"),_indexable:s=>s!=="events",hover:{_fallback:"interaction"},interaction:{_scriptable:!1,_indexable:!1}},[rr,lr,pr]);function hr(s){return!s||U(s.size)||U(s.family)?null:(s.style?s.style+" ":"")+(s.weight?s.weight+" ":"")+s.size+"px "+s.family}function Pi(s,t,e,i,n){let a=t[n];return a||(a=t[n]=s.measureText(n).width,e.push(n)),a>i&&(i=a),i}function fr(s,t,e,i){i=i||{};let n=i.data=i.data||{},a=i.garbageCollect=i.garbageCollect||[];i.font!==t&&(n=i.data={},a=i.garbageCollect=[],i.font=t),s.save(),s.font=t;let o=0;const r=e.length;let l,c,d,p,u;for(l=0;l<r;l++)if(p=e[l],p!=null&&!tt(p))o=Pi(s,n,a,o,p);else if(tt(p))for(c=0,d=p.length;c<d;c++)u=p[c],u!=null&&!tt(u)&&(o=Pi(s,n,a,o,u));s.restore();const h=a.length/2;if(h>e.length){for(l=0;l<h;l++)delete n[a[l]];a.splice(0,h)}return o}function ce(s,t,e){const i=s.currentDevicePixelRatio,n=e!==0?Math.max(e/2,.5):0;return Math.round((t-n)*i)/i+n}function an(s,t){!t&&!s||(t=t||s.getContext("2d"),t.save(),t.resetTransform(),t.clearRect(0,0,s.width,s.height),t.restore())}function as(s,t,e,i){Pa(s,t,e,i,null)}function Pa(s,t,e,i,n){let a,o,r,l,c,d,p,u;const h=t.pointStyle,g=t.rotation,f=t.radius;let m=(g||0)*Yo;if(h&&typeof h=="object"&&(a=h.toString(),a==="[object HTMLImageElement]"||a==="[object HTMLCanvasElement]")){s.save(),s.translate(e,i),s.rotate(m),s.drawImage(h,-h.width/2,-h.height/2,h.width,h.height),s.restore();return}if(!(isNaN(f)||f<=0)){switch(s.beginPath(),h){default:n?s.ellipse(e,i,n/2,f,0,0,Q):s.arc(e,i,f,0,Q),s.closePath();break;case"triangle":d=n?n/2:f,s.moveTo(e+Math.sin(m)*d,i-Math.cos(m)*f),m+=Xs,s.lineTo(e+Math.sin(m)*d,i-Math.cos(m)*f),m+=Xs,s.lineTo(e+Math.sin(m)*d,i-Math.cos(m)*f),s.closePath();break;case"rectRounded":c=f*.516,l=f-c,o=Math.cos(m+le)*l,p=Math.cos(m+le)*(n?n/2-c:l),r=Math.sin(m+le)*l,u=Math.sin(m+le)*(n?n/2-c:l),s.arc(e-p,i-r,c,m-Y,m-at),s.arc(e+u,i-o,c,m-at,m),s.arc(e+p,i+r,c,m,m+at),s.arc(e-u,i+o,c,m+at,m+Y),s.closePath();break;case"rect":if(!g){l=Math.SQRT1_2*f,d=n?n/2:l,s.rect(e-d,i-l,2*d,2*l);break}m+=le;case"rectRot":p=Math.cos(m)*(n?n/2:f),o=Math.cos(m)*f,r=Math.sin(m)*f,u=Math.sin(m)*(n?n/2:f),s.moveTo(e-p,i-r),s.lineTo(e+u,i-o),s.lineTo(e+p,i+r),s.lineTo(e-u,i+o),s.closePath();break;case"crossRot":m+=le;case"cross":p=Math.cos(m)*(n?n/2:f),o=Math.cos(m)*f,r=Math.sin(m)*f,u=Math.sin(m)*(n?n/2:f),s.moveTo(e-p,i-r),s.lineTo(e+p,i+r),s.moveTo(e+u,i-o),s.lineTo(e-u,i+o);break;case"star":p=Math.cos(m)*(n?n/2:f),o=Math.cos(m)*f,r=Math.sin(m)*f,u=Math.sin(m)*(n?n/2:f),s.moveTo(e-p,i-r),s.lineTo(e+p,i+r),s.moveTo(e+u,i-o),s.lineTo(e-u,i+o),m+=le,p=Math.cos(m)*(n?n/2:f),o=Math.cos(m)*f,r=Math.sin(m)*f,u=Math.sin(m)*(n?n/2:f),s.moveTo(e-p,i-r),s.lineTo(e+p,i+r),s.moveTo(e+u,i-o),s.lineTo(e-u,i+o);break;case"line":o=n?n/2:Math.cos(m)*f,r=Math.sin(m)*f,s.moveTo(e-o,i-r),s.lineTo(e+o,i+r);break;case"dash":s.moveTo(e,i),s.lineTo(e+Math.cos(m)*(n?n/2:f),i+Math.sin(m)*f);break;case!1:s.closePath();break}s.fill(),t.borderWidth>0&&s.stroke()}}function Ht(s,t,e){return e=e||.5,!t||s&&s.x>t.left-e&&s.x<t.right+e&&s.y>t.top-e&&s.y<t.bottom+e}function Ei(s,t){s.save(),s.beginPath(),s.rect(t.left,t.top,t.right-t.left,t.bottom-t.top),s.clip()}function Ri(s){s.restore()}function gr(s,t,e,i,n){if(!t)return s.lineTo(e.x,e.y);if(n==="middle"){const a=(t.x+e.x)/2;s.lineTo(a,t.y),s.lineTo(a,e.y)}else n==="after"!=!!i?s.lineTo(t.x,e.y):s.lineTo(e.x,t.y);s.lineTo(e.x,e.y)}function mr(s,t,e,i){if(!t)return s.lineTo(e.x,e.y);s.bezierCurveTo(i?t.cp1x:t.cp2x,i?t.cp1y:t.cp2y,i?e.cp2x:e.cp1x,i?e.cp2y:e.cp1y,e.x,e.y)}function br(s,t){t.translation&&s.translate(t.translation[0],t.translation[1]),U(t.rotation)||s.rotate(t.rotation),t.color&&(s.fillStyle=t.color),t.textAlign&&(s.textAlign=t.textAlign),t.textBaseline&&(s.textBaseline=t.textBaseline)}function yr(s,t,e,i,n){if(n.strikethrough||n.underline){const a=s.measureText(i),o=t-a.actualBoundingBoxLeft,r=t+a.actualBoundingBoxRight,l=e-a.actualBoundingBoxAscent,c=e+a.actualBoundingBoxDescent,d=n.strikethrough?(l+c)/2:c;s.strokeStyle=s.fillStyle,s.beginPath(),s.lineWidth=n.decorationWidth||2,s.moveTo(o,d),s.lineTo(r,d),s.stroke()}}function xr(s,t){const e=s.fillStyle;s.fillStyle=t.color,s.fillRect(t.left,t.top,t.width,t.height),s.fillStyle=e}function ye(s,t,e,i,n,a={}){const o=tt(t)?t:[t],r=a.strokeWidth>0&&a.strokeColor!=="";let l,c;for(s.save(),s.font=n.string,br(s,a),l=0;l<o.length;++l)c=o[l],a.backdrop&&xr(s,a.backdrop),r&&(a.strokeColor&&(s.strokeStyle=a.strokeColor),U(a.strokeWidth)||(s.lineWidth=a.strokeWidth),s.strokeText(c,e,i,a.maxWidth)),s.fillText(c,e,i,a.maxWidth),yr(s,e,i,c,a),i+=Number(n.lineHeight);s.restore()}function Qe(s,t){const{x:e,y:i,w:n,h:a,radius:o}=t;s.arc(e+o.topLeft,i+o.topLeft,o.topLeft,1.5*Y,Y,!0),s.lineTo(e,i+a-o.bottomLeft),s.arc(e+o.bottomLeft,i+a-o.bottomLeft,o.bottomLeft,Y,at,!0),s.lineTo(e+n-o.bottomRight,i+a),s.arc(e+n-o.bottomRight,i+a-o.bottomRight,o.bottomRight,at,0,!0),s.lineTo(e+n,i+o.topRight),s.arc(e+n-o.topRight,i+o.topRight,o.topRight,0,-at,!0),s.lineTo(e+o.topLeft,i)}const vr=/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/,wr=/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;function Sr(s,t){const e=(""+s).match(vr);if(!e||e[1]==="normal")return t*1.2;switch(s=+e[2],e[3]){case"px":return s;case"%":s/=100;break}return t*s}const kr=s=>+s||0;function Ts(s,t){const e={},i=G(t),n=i?Object.keys(t):t,a=G(s)?i?o=>H(s[o],s[t[o]]):o=>s[o]:()=>s;for(const o of n)e[o]=kr(a(o));return e}function Oa(s){return Ts(s,{top:"y",right:"x",bottom:"y",left:"x"})}function ge(s){return Ts(s,["topLeft","topRight","bottomLeft","bottomRight"])}function gt(s){const t=Oa(s);return t.width=t.left+t.right,t.height=t.top+t.bottom,t}function lt(s,t){s=s||{},t=t||et.font;let e=H(s.size,t.size);typeof e=="string"&&(e=parseInt(e,10));let i=H(s.style,t.style);i&&!(""+i).match(wr)&&(console.warn('Invalid font style specified: "'+i+'"'),i=void 0);const n={family:H(s.family,t.family),lineHeight:Sr(H(s.lineHeight,t.lineHeight),e),size:e,style:i,weight:H(s.weight,t.weight),string:""};return n.string=hr(n),n}function Re(s,t,e,i){let n,a,o;for(n=0,a=s.length;n<a;++n)if(o=s[n],o!==void 0&&o!==void 0)return o}function _r(s,t,e){const{min:i,max:n}=s,a=xa(t,(n-i)/2),o=(r,l)=>e&&r===0?0:r+l;return{min:o(i,-Math.abs(a)),max:o(n,a)}}function se(s,t){return Object.assign(Object.create(s),t)}function Ms(s,t=[""],e,i,n=()=>s[0]){const a=e||s;typeof i>"u"&&(i=La("_fallback",s));const o={[Symbol.toStringTag]:"Object",_cacheable:!0,_scopes:s,_rootScopes:a,_fallback:i,_getTarget:n,override:r=>Ms([r,...s],t,a,i)};return new Proxy(o,{deleteProperty(r,l){return delete r[l],delete r._keys,delete s[0][l],!0},get(r,l){return za(r,l,()=>Ir(l,t,s,r))},getOwnPropertyDescriptor(r,l){return Reflect.getOwnPropertyDescriptor(r._scopes[0],l)},getPrototypeOf(){return Reflect.getPrototypeOf(s[0])},has(r,l){return rn(r).includes(l)},ownKeys(r){return rn(r)},set(r,l,c){const d=r._storage||(r._storage=n());return r[l]=d[l]=c,delete r._keys,!0}})}function _e(s,t,e,i){const n={_cacheable:!1,_proxy:s,_context:t,_subProxy:e,_stack:new Set,_descriptors:Ia(s,i),setContext:a=>_e(s,a,e,i),override:a=>_e(s.override(a),t,e,i)};return new Proxy(n,{deleteProperty(a,o){return delete a[o],delete s[o],!0},get(a,o,r){return za(a,o,()=>Tr(a,o,r))},getOwnPropertyDescriptor(a,o){return a._descriptors.allKeys?Reflect.has(s,o)?{enumerable:!0,configurable:!0}:void 0:Reflect.getOwnPropertyDescriptor(s,o)},getPrototypeOf(){return Reflect.getPrototypeOf(s)},has(a,o){return Reflect.has(s,o)},ownKeys(){return Reflect.ownKeys(s)},set(a,o,r){return s[o]=r,delete a[o],!0}})}function Ia(s,t={scriptable:!0,indexable:!0}){const{_scriptable:e=t.scriptable,_indexable:i=t.indexable,_allKeys:n=t.allKeys}=s;return{allKeys:n,scriptable:e,indexable:i,isScriptable:ie(e)?e:()=>e,isIndexable:ie(i)?i:()=>i}}const Cr=(s,t)=>s?s+ws(t):t,As=(s,t)=>G(t)&&s!=="adapters"&&(Object.getPrototypeOf(t)===null||t.constructor===Object);function za(s,t,e){if(Object.prototype.hasOwnProperty.call(s,t)||t==="constructor")return s[t];const i=e();return s[t]=i,i}function Tr(s,t,e){const{_proxy:i,_context:n,_subProxy:a,_descriptors:o}=s;let r=i[t];return ie(r)&&o.isScriptable(t)&&(r=Mr(t,r,s,e)),tt(r)&&r.length&&(r=Ar(t,r,s,o.isIndexable)),As(t,r)&&(r=_e(r,n,a&&a[t],o)),r}function Mr(s,t,e,i){const{_proxy:n,_context:a,_subProxy:o,_stack:r}=e;if(r.has(s))throw new Error("Recursion detected: "+Array.from(r).join("->")+"->"+s);r.add(s);let l=t(a,o||i);return r.delete(s),As(s,l)&&(l=$s(n._scopes,n,s,l)),l}function Ar(s,t,e,i){const{_proxy:n,_context:a,_subProxy:o,_descriptors:r}=e;if(typeof a.index<"u"&&i(s))return t[a.index%t.length];if(G(t[0])){const l=t,c=n._scopes.filter(d=>d!==l);t=[];for(const d of l){const p=$s(c,n,s,d);t.push(_e(p,a,o&&o[s],r))}}return t}function Da(s,t,e){return ie(s)?s(t,e):s}const $r=(s,t)=>s===!0?t:typeof s=="string"?ee(t,s):void 0;function Pr(s,t,e,i,n){for(const a of t){const o=$r(e,a);if(o){s.add(o);const r=Da(o._fallback,e,n);if(typeof r<"u"&&r!==e&&r!==i)return r}else if(o===!1&&typeof i<"u"&&e!==i)return null}return!1}function $s(s,t,e,i){const n=t._rootScopes,a=Da(t._fallback,e,i),o=[...s,...n],r=new Set;r.add(i);let l=on(r,o,e,a||e,i);return l===null||typeof a<"u"&&a!==e&&(l=on(r,o,a,l,i),l===null)?!1:Ms(Array.from(r),[""],n,a,()=>Or(t,e,i))}function on(s,t,e,i,n){for(;e;)e=Pr(s,t,e,i,n);return e}function Or(s,t,e){const i=s._getTarget();t in i||(i[t]={});const n=i[t];return tt(n)&&G(e)?e:n||{}}function Ir(s,t,e,i){let n;for(const a of t)if(n=La(Cr(a,s),e),typeof n<"u")return As(s,n)?$s(e,i,s,n):n}function La(s,t){for(const e of t){if(!e)continue;const i=e[s];if(typeof i<"u")return i}}function rn(s){let t=s._keys;return t||(t=s._keys=zr(s._scopes)),t}function zr(s){const t=new Set;for(const e of s)for(const i of Object.keys(e).filter(n=>!n.startsWith("_")))t.add(i);return Array.from(t)}function Ea(s,t,e,i){const{iScale:n}=s,{key:a="r"}=this._parsing,o=new Array(i);let r,l,c,d;for(r=0,l=i;r<l;++r)c=r+e,d=t[c],o[r]={r:n.parse(ee(d,a),c)};return o}const Dr=Number.EPSILON||1e-14,Ce=(s,t)=>t<s.length&&!s[t].skip&&s[t],Ra=s=>s==="x"?"y":"x";function Lr(s,t,e,i){const n=s.skip?t:s,a=t,o=e.skip?t:e,r=ss(a,n),l=ss(o,a);let c=r/(r+l),d=l/(r+l);c=isNaN(c)?0:c,d=isNaN(d)?0:d;const p=i*c,u=i*d;return{previous:{x:a.x-p*(o.x-n.x),y:a.y-p*(o.y-n.y)},next:{x:a.x+u*(o.x-n.x),y:a.y+u*(o.y-n.y)}}}function Er(s,t,e){const i=s.length;let n,a,o,r,l,c=Ce(s,0);for(let d=0;d<i-1;++d)if(l=c,c=Ce(s,d+1),!(!l||!c)){if(je(t[d],0,Dr)){e[d]=e[d+1]=0;continue}n=e[d]/t[d],a=e[d+1]/t[d],r=Math.pow(n,2)+Math.pow(a,2),!(r<=9)&&(o=3/Math.sqrt(r),e[d]=n*o*t[d],e[d+1]=a*o*t[d])}}function Rr(s,t,e="x"){const i=Ra(e),n=s.length;let a,o,r,l=Ce(s,0);for(let c=0;c<n;++c){if(o=r,r=l,l=Ce(s,c+1),!r)continue;const d=r[e],p=r[i];o&&(a=(d-o[e])/3,r[`cp1${e}`]=d-a,r[`cp1${i}`]=p-a*t[c]),l&&(a=(l[e]-d)/3,r[`cp2${e}`]=d+a,r[`cp2${i}`]=p+a*t[c])}}function Fr(s,t="x"){const e=Ra(t),i=s.length,n=Array(i).fill(0),a=Array(i);let o,r,l,c=Ce(s,0);for(o=0;o<i;++o)if(r=l,l=c,c=Ce(s,o+1),!!l){if(c){const d=c[t]-l[t];n[o]=d!==0?(c[e]-l[e])/d:0}a[o]=r?c?It(n[o-1])!==It(n[o])?0:(n[o-1]+n[o])/2:n[o-1]:n[o]}Er(s,n,a),Rr(s,a,t)}function li(s,t,e){return Math.max(Math.min(s,e),t)}function Br(s,t){let e,i,n,a,o,r=Ht(s[0],t);for(e=0,i=s.length;e<i;++e)o=a,a=r,r=e<i-1&&Ht(s[e+1],t),a&&(n=s[e],o&&(n.cp1x=li(n.cp1x,t.left,t.right),n.cp1y=li(n.cp1y,t.top,t.bottom)),r&&(n.cp2x=li(n.cp2x,t.left,t.right),n.cp2y=li(n.cp2y,t.top,t.bottom)))}function qr(s,t,e,i,n){let a,o,r,l;if(t.spanGaps&&(s=s.filter(c=>!c.skip)),t.cubicInterpolationMode==="monotone")Fr(s,n);else{let c=i?s[s.length-1]:s[0];for(a=0,o=s.length;a<o;++a)r=s[a],l=Lr(c,r,s[Math.min(a+1,o-(i?0:1))%o],t.tension),r.cp1x=l.previous.x,r.cp1y=l.previous.y,r.cp2x=l.next.x,r.cp2y=l.next.y,c=r}t.capBezierPoints&&Br(s,e)}function Ps(){return typeof window<"u"&&typeof document<"u"}function Os(s){let t=s.parentNode;return t&&t.toString()==="[object ShadowRoot]"&&(t=t.host),t}function Oi(s,t,e){let i;return typeof s=="string"?(i=parseInt(s,10),s.indexOf("%")!==-1&&(i=i/100*t.parentNode[e])):i=s,i}const Fi=s=>s.ownerDocument.defaultView.getComputedStyle(s,null);function Nr(s,t){return Fi(s).getPropertyValue(t)}const Hr=["top","right","bottom","left"];function me(s,t,e){const i={};e=e?"-"+e:"";for(let n=0;n<4;n++){const a=Hr[n];i[a]=parseFloat(s[t+"-"+a+e])||0}return i.width=i.left+i.right,i.height=i.top+i.bottom,i}const Vr=(s,t,e)=>(s>0||t>0)&&(!e||!e.shadowRoot);function jr(s,t){const e=s.touches,i=e&&e.length?e[0]:s,{offsetX:n,offsetY:a}=i;let o=!1,r,l;if(Vr(n,a,s.target))r=n,l=a;else{const c=t.getBoundingClientRect();r=i.clientX-c.left,l=i.clientY-c.top,o=!0}return{x:r,y:l,box:o}}function ue(s,t){if("native"in s)return s;const{canvas:e,currentDevicePixelRatio:i}=t,n=Fi(e),a=n.boxSizing==="border-box",o=me(n,"padding"),r=me(n,"border","width"),{x:l,y:c,box:d}=jr(s,e),p=o.left+(d&&r.left),u=o.top+(d&&r.top);let{width:h,height:g}=t;return a&&(h-=o.width+r.width,g-=o.height+r.height),{x:Math.round((l-p)/h*e.width/i),y:Math.round((c-u)/g*e.height/i)}}function Wr(s,t,e){let i,n;if(t===void 0||e===void 0){const a=s&&Os(s);if(!a)t=s.clientWidth,e=s.clientHeight;else{const o=a.getBoundingClientRect(),r=Fi(a),l=me(r,"border","width"),c=me(r,"padding");t=o.width-c.width-l.width,e=o.height-c.height-l.height,i=Oi(r.maxWidth,a,"clientWidth"),n=Oi(r.maxHeight,a,"clientHeight")}}return{width:t,height:e,maxWidth:i||$i,maxHeight:n||$i}}const Zt=s=>Math.round(s*10)/10;function Ur(s,t,e,i){const n=Fi(s),a=me(n,"margin"),o=Oi(n.maxWidth,s,"clientWidth")||$i,r=Oi(n.maxHeight,s,"clientHeight")||$i,l=Wr(s,t,e);let{width:c,height:d}=l;if(n.boxSizing==="content-box"){const u=me(n,"border","width"),h=me(n,"padding");c-=h.width+u.width,d-=h.height+u.height}return c=Math.max(0,c-a.width),d=Math.max(0,i?c/i:d-a.height),c=Zt(Math.min(c,o,l.maxWidth)),d=Zt(Math.min(d,r,l.maxHeight)),c&&!d&&(d=Zt(c/2)),(t!==void 0||e!==void 0)&&i&&l.height&&d>l.height&&(d=l.height,c=Zt(Math.floor(d*i))),{width:c,height:d}}function ln(s,t,e){const i=t||1,n=Zt(s.height*i),a=Zt(s.width*i);s.height=Zt(s.height),s.width=Zt(s.width);const o=s.canvas;return o.style&&(e||!o.style.height&&!o.style.width)&&(o.style.height=`${s.height}px`,o.style.width=`${s.width}px`),s.currentDevicePixelRatio!==i||o.height!==n||o.width!==a?(s.currentDevicePixelRatio=i,o.height=n,o.width=a,s.ctx.setTransform(i,0,0,i,0,0),!0):!1}const Gr=(function(){let s=!1;try{const t={get passive(){return s=!0,!1}};Ps()&&(window.addEventListener("test",null,t),window.removeEventListener("test",null,t))}catch{}return s})();function cn(s,t){const e=Nr(s,t),i=e&&e.match(/^(\d+)(\.\d+)?px$/);return i?+i[1]:void 0}function he(s,t,e,i){return{x:s.x+e*(t.x-s.x),y:s.y+e*(t.y-s.y)}}function Yr(s,t,e,i){return{x:s.x+e*(t.x-s.x),y:i==="middle"?e<.5?s.y:t.y:i==="after"?e<1?s.y:t.y:e>0?t.y:s.y}}function Kr(s,t,e,i){const n={x:s.cp2x,y:s.cp2y},a={x:t.cp1x,y:t.cp1y},o=he(s,n,e),r=he(n,a,e),l=he(a,t,e),c=he(o,r,e),d=he(r,l,e);return he(c,d,e)}const Xr=function(s,t){return{x(e){return s+s+t-e},setWidth(e){t=e},textAlign(e){return e==="center"?e:e==="right"?"left":"right"},xPlus(e,i){return e-i},leftForLtr(e,i){return e-i}}},Zr=function(){return{x(s){return s},setWidth(s){},textAlign(s){return s},xPlus(s,t){return s+t},leftForLtr(s,t){return s}}};function Se(s,t,e){return s?Xr(t,e):Zr()}function Fa(s,t){let e,i;(t==="ltr"||t==="rtl")&&(e=s.canvas.style,i=[e.getPropertyValue("direction"),e.getPropertyPriority("direction")],e.setProperty("direction",t,"important"),s.prevTextDirection=i)}function Ba(s,t){t!==void 0&&(delete s.prevTextDirection,s.canvas.style.setProperty("direction",t[0],t[1]))}function qa(s){return s==="angle"?{between:Ze,compare:Qo,normalize:ht}:{between:qt,compare:(t,e)=>t-e,normalize:t=>t}}function dn({start:s,end:t,count:e,loop:i,style:n}){return{start:s%e,end:t%e,loop:i&&(t-s+1)%e===0,style:n}}function Qr(s,t,e){const{property:i,start:n,end:a}=e,{between:o,normalize:r}=qa(i),l=t.length;let{start:c,end:d,loop:p}=s,u,h;if(p){for(c+=l,d+=l,u=0,h=l;u<h&&o(r(t[c%l][i]),n,a);++u)c--,d--;c%=l,d%=l}return d<c&&(d+=l),{start:c,end:d,loop:p,style:s.style}}function Na(s,t,e){if(!e)return[s];const{property:i,start:n,end:a}=e,o=t.length,{compare:r,between:l,normalize:c}=qa(i),{start:d,end:p,loop:u,style:h}=Qr(s,t,e),g=[];let f=!1,m=null,y,v,S;const x=()=>l(n,S,y)&&r(n,S)!==0,b=()=>r(a,y)===0||l(a,S,y),_=()=>f||x(),k=()=>!f||b();for(let w=d,C=d;w<=p;++w)v=t[w%o],!v.skip&&(y=c(v[i]),y!==S&&(f=l(y,n,a),m===null&&_()&&(m=r(y,n)===0?w:C),m!==null&&k()&&(g.push(dn({start:m,end:w,loop:u,count:o,style:h})),m=null),C=w,S=y));return m!==null&&g.push(dn({start:m,end:p,loop:u,count:o,style:h})),g}function Ha(s,t){const e=[],i=s.segments;for(let n=0;n<i.length;n++){const a=Na(i[n],s.points,t);a.length&&e.push(...a)}return e}function Jr(s,t,e,i){let n=0,a=t-1;if(e&&!i)for(;n<t&&!s[n].skip;)n++;for(;n<t&&s[n].skip;)n++;for(n%=t,e&&(a+=n);a>n&&s[a%t].skip;)a--;return a%=t,{start:n,end:a}}function tl(s,t,e,i){const n=s.length,a=[];let o=t,r=s[t],l;for(l=t+1;l<=e;++l){const c=s[l%n];c.skip||c.stop?r.skip||(i=!1,a.push({start:t%n,end:(l-1)%n,loop:i}),t=o=c.stop?l:null):(o=l,r.skip&&(t=l)),r=c}return o!==null&&a.push({start:t%n,end:o%n,loop:i}),a}function el(s,t){const e=s.points,i=s.options.spanGaps,n=e.length;if(!n)return[];const a=!!s._loop,{start:o,end:r}=Jr(e,n,a,i);if(i===!0)return pn(s,[{start:o,end:r,loop:a}],e,t);const l=r<o?r+n:r,c=!!s._fullLoop&&o===0&&r===n-1;return pn(s,tl(e,o,l,c),e,t)}function pn(s,t,e,i){return!i||!i.setContext||!e?t:il(s,t,e,i)}function il(s,t,e,i){const n=s._chart.getContext(),a=un(s.options),{_datasetIndex:o,options:{spanGaps:r}}=s,l=e.length,c=[];let d=a,p=t[0].start,u=p;function h(g,f,m,y){const v=r?-1:1;if(g!==f){for(g+=l;e[g%l].skip;)g-=v;for(;e[f%l].skip;)f+=v;g%l!==f%l&&(c.push({start:g%l,end:f%l,loop:m,style:y}),d=y,p=f%l)}}for(const g of t){p=r?p:g.start;let f=e[p%l],m;for(u=p+1;u<=g.end;u++){const y=e[u%l];m=un(i.setContext(se(n,{type:"segment",p0:f,p1:y,p0DataIndex:(u-1)%l,p1DataIndex:u%l,datasetIndex:o}))),sl(m,d)&&h(p,u-1,g.loop,d),f=y,d=m}p<u-1&&h(p,u-1,g.loop,d)}return c}function un(s){return{backgroundColor:s.backgroundColor,borderCapStyle:s.borderCapStyle,borderDash:s.borderDash,borderDashOffset:s.borderDashOffset,borderJoinStyle:s.borderJoinStyle,borderWidth:s.borderWidth,borderColor:s.borderColor}}function sl(s,t){if(!t)return!1;const e=[],i=function(n,a){return Cs(a)?(e.includes(a)||e.push(a),e.indexOf(a)):a};return JSON.stringify(s,i)!==JSON.stringify(t,i)}function ci(s,t,e){return s.options.clip?s[e]:t[e]}function nl(s,t){const{xScale:e,yScale:i}=s;return e&&i?{left:ci(e,t,"left"),right:ci(e,t,"right"),top:ci(i,t,"top"),bottom:ci(i,t,"bottom")}:t}function Va(s,t){const e=t._clip;if(e.disabled)return!1;const i=nl(t,s.chartArea);return{left:e.left===!1?0:i.left-(e.left===!0?0:e.left),right:e.right===!1?s.width:i.right+(e.right===!0?0:e.right),top:e.top===!1?0:i.top-(e.top===!0?0:e.top),bottom:e.bottom===!1?s.height:i.bottom+(e.bottom===!0?0:e.bottom)}}/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */class al{constructor(){this._request=null,this._charts=new Map,this._running=!1,this._lastDate=void 0}_notify(t,e,i,n){const a=e.listeners[n],o=e.duration;a.forEach(r=>r({chart:t,initial:e.initial,numSteps:o,currentStep:Math.min(i-e.start,o)}))}_refresh(){this._request||(this._running=!0,this._request=Ca.call(window,()=>{this._update(),this._request=null,this._running&&this._refresh()}))}_update(t=Date.now()){let e=0;this._charts.forEach((i,n)=>{if(!i.running||!i.items.length)return;const a=i.items;let o=a.length-1,r=!1,l;for(;o>=0;--o)l=a[o],l._active?(l._total>i.duration&&(i.duration=l._total),l.tick(t),r=!0):(a[o]=a[a.length-1],a.pop());r&&(n.draw(),this._notify(n,i,t,"progress")),a.length||(i.running=!1,this._notify(n,i,t,"complete"),i.initial=!1),e+=a.length}),this._lastDate=t,e===0&&(this._running=!1)}_getAnims(t){const e=this._charts;let i=e.get(t);return i||(i={running:!1,initial:!0,items:[],listeners:{complete:[],progress:[]}},e.set(t,i)),i}listen(t,e,i){this._getAnims(t).listeners[e].push(i)}add(t,e){!e||!e.length||this._getAnims(t).items.push(...e)}has(t){return this._getAnims(t).items.length>0}start(t){const e=this._charts.get(t);e&&(e.running=!0,e.start=Date.now(),e.duration=e.items.reduce((i,n)=>Math.max(i,n._duration),0),this._refresh())}running(t){if(!this._running)return!1;const e=this._charts.get(t);return!(!e||!e.running||!e.items.length)}stop(t){const e=this._charts.get(t);if(!e||!e.items.length)return;const i=e.items;let n=i.length-1;for(;n>=0;--n)i[n].cancel();e.items=[],this._notify(t,e,Date.now(),"complete")}remove(t){return this._charts.delete(t)}}var Lt=new al;const hn="transparent",ol={boolean(s,t,e){return e>.5?t:s},color(s,t,e){const i=sn(s||hn),n=i.valid&&sn(t||hn);return n&&n.valid?n.mix(i,e).hexString():t},number(s,t,e){return s+(t-s)*e}};class rl{constructor(t,e,i,n){const a=e[i];n=Re([t.to,n,a,t.from]);const o=Re([t.from,a,n]);this._active=!0,this._fn=t.fn||ol[t.type||typeof o],this._easing=We[t.easing]||We.linear,this._start=Math.floor(Date.now()+(t.delay||0)),this._duration=this._total=Math.floor(t.duration),this._loop=!!t.loop,this._target=e,this._prop=i,this._from=o,this._to=n,this._promises=void 0}active(){return this._active}update(t,e,i){if(this._active){this._notify(!1);const n=this._target[this._prop],a=i-this._start,o=this._duration-a;this._start=i,this._duration=Math.floor(Math.max(o,t.duration)),this._total+=a,this._loop=!!t.loop,this._to=Re([t.to,e,n,t.from]),this._from=Re([t.from,n,e])}}cancel(){this._active&&(this.tick(Date.now()),this._active=!1,this._notify(!1))}tick(t){const e=t-this._start,i=this._duration,n=this._prop,a=this._from,o=this._loop,r=this._to;let l;if(this._active=a!==r&&(o||e<i),!this._active){this._target[n]=r,this._notify(!0);return}if(e<0){this._target[n]=a;return}l=e/i%2,l=o&&l>1?2-l:l,l=this._easing(Math.min(1,Math.max(0,l))),this._target[n]=this._fn(a,r,l)}wait(){const t=this._promises||(this._promises=[]);return new Promise((e,i)=>{t.push({res:e,rej:i})})}_notify(t){const e=t?"res":"rej",i=this._promises||[];for(let n=0;n<i.length;n++)i[n][e]()}}class ja{constructor(t,e){this._chart=t,this._properties=new Map,this.configure(e)}configure(t){if(!G(t))return;const e=Object.keys(et.animation),i=this._properties;Object.getOwnPropertyNames(t).forEach(n=>{const a=t[n];if(!G(a))return;const o={};for(const r of e)o[r]=a[r];(tt(a.properties)&&a.properties||[n]).forEach(r=>{(r===n||!i.has(r))&&i.set(r,o)})})}_animateOptions(t,e){const i=e.options,n=cl(t,i);if(!n)return[];const a=this._createAnimations(n,i);return i.$shared&&ll(t.options.$animations,i).then(()=>{t.options=i},()=>{}),a}_createAnimations(t,e){const i=this._properties,n=[],a=t.$animations||(t.$animations={}),o=Object.keys(e),r=Date.now();let l;for(l=o.length-1;l>=0;--l){const c=o[l];if(c.charAt(0)==="$")continue;if(c==="options"){n.push(...this._animateOptions(t,e));continue}const d=e[c];let p=a[c];const u=i.get(c);if(p)if(u&&p.active()){p.update(u,d,r);continue}else p.cancel();if(!u||!u.duration){t[c]=d;continue}a[c]=p=new rl(u,t,c,d),n.push(p)}return n}update(t,e){if(this._properties.size===0){Object.assign(t,e);return}const i=this._createAnimations(t,e);if(i.length)return Lt.add(this._chart,i),!0}}function ll(s,t){const e=[],i=Object.keys(t);for(let n=0;n<i.length;n++){const a=s[i[n]];a&&a.active()&&e.push(a.wait())}return Promise.all(e)}function cl(s,t){if(!t)return;let e=s.options;if(!e){s.options=t;return}return e.$shared&&(s.options=e=Object.assign({},e,{$shared:!1,$animations:{}})),e}function fn(s,t){const e=s&&s.options||{},i=e.reverse,n=e.min===void 0?t:0,a=e.max===void 0?t:0;return{start:i?a:n,end:i?n:a}}function dl(s,t,e){if(e===!1)return!1;const i=fn(s,e),n=fn(t,e);return{top:n.end,right:i.end,bottom:n.start,left:i.start}}function pl(s){let t,e,i,n;return G(s)?(t=s.top,e=s.right,i=s.bottom,n=s.left):t=e=i=n=s,{top:t,right:e,bottom:i,left:n,disabled:s===!1}}function Wa(s,t){const e=[],i=s._getSortedDatasetMetas(t);let n,a;for(n=0,a=i.length;n<a;++n)e.push(i[n].index);return e}function gn(s,t,e,i={}){const n=s.keys,a=i.mode==="single";let o,r,l,c;if(t===null)return;let d=!1;for(o=0,r=n.length;o<r;++o){if(l=+n[o],l===e){if(d=!0,i.all)continue;break}c=s.values[l],st(c)&&(a||t===0||It(t)===It(c))&&(t+=c)}return!d&&!i.all?0:t}function ul(s,t){const{iScale:e,vScale:i}=t,n=e.axis==="x"?"x":"y",a=i.axis==="x"?"x":"y",o=Object.keys(s),r=new Array(o.length);let l,c,d;for(l=0,c=o.length;l<c;++l)d=o[l],r[l]={[n]:d,[a]:s[d]};return r}function Wi(s,t){const e=s&&s.options.stacked;return e||e===void 0&&t.stack!==void 0}function hl(s,t,e){return`${s.id}.${t.id}.${e.stack||e.type}`}function fl(s){const{min:t,max:e,minDefined:i,maxDefined:n}=s.getUserBounds();return{min:i?t:Number.NEGATIVE_INFINITY,max:n?e:Number.POSITIVE_INFINITY}}function gl(s,t,e){const i=s[t]||(s[t]={});return i[e]||(i[e]={})}function mn(s,t,e,i){for(const n of t.getMatchingVisibleMetas(i).reverse()){const a=s[n.index];if(e&&a>0||!e&&a<0)return n.index}return null}function bn(s,t){const{chart:e,_cachedMeta:i}=s,n=e._stacks||(e._stacks={}),{iScale:a,vScale:o,index:r}=i,l=a.axis,c=o.axis,d=hl(a,o,i),p=t.length;let u;for(let h=0;h<p;++h){const g=t[h],{[l]:f,[c]:m}=g,y=g._stacks||(g._stacks={});u=y[c]=gl(n,d,f),u[r]=m,u._top=mn(u,o,!0,i.type),u._bottom=mn(u,o,!1,i.type);const v=u._visualValues||(u._visualValues={});v[r]=m}}function Ui(s,t){const e=s.scales;return Object.keys(e).filter(i=>e[i].axis===t).shift()}function ml(s,t){return se(s,{active:!1,dataset:void 0,datasetIndex:t,index:t,mode:"default",type:"dataset"})}function bl(s,t,e){return se(s,{active:!1,dataIndex:t,parsed:void 0,raw:void 0,element:e,index:t,mode:"default",type:"data"})}function Oe(s,t){const e=s.controller.index,i=s.vScale&&s.vScale.axis;if(i){t=t||s._parsed;for(const n of t){const a=n._stacks;if(!a||a[i]===void 0||a[i][e]===void 0)return;delete a[i][e],a[i]._visualValues!==void 0&&a[i]._visualValues[e]!==void 0&&delete a[i]._visualValues[e]}}}const Gi=s=>s==="reset"||s==="none",yn=(s,t)=>t?s:Object.assign({},s),yl=(s,t,e)=>s&&!t.hidden&&t._stacked&&{keys:Wa(e,!0),values:null};class _t{constructor(t,e){this.chart=t,this._ctx=t.ctx,this.index=e,this._cachedDataOpts={},this._cachedMeta=this.getMeta(),this._type=this._cachedMeta.type,this.options=void 0,this._parsing=!1,this._data=void 0,this._objectData=void 0,this._sharedOptions=void 0,this._drawStart=void 0,this._drawCount=void 0,this.enableOptionSharing=!1,this.supportsDecimation=!1,this.$context=void 0,this._syncList=[],this.datasetElementType=new.target.datasetElementType,this.dataElementType=new.target.dataElementType,this.initialize()}initialize(){const t=this._cachedMeta;this.configure(),this.linkScales(),t._stacked=Wi(t.vScale,t),this.addElements(),this.options.fill&&!this.chart.isPluginEnabled("filler")&&console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options")}updateIndex(t){this.index!==t&&Oe(this._cachedMeta),this.index=t}linkScales(){const t=this.chart,e=this._cachedMeta,i=this.getDataset(),n=(p,u,h,g)=>p==="x"?u:p==="r"?g:h,a=e.xAxisID=H(i.xAxisID,Ui(t,"x")),o=e.yAxisID=H(i.yAxisID,Ui(t,"y")),r=e.rAxisID=H(i.rAxisID,Ui(t,"r")),l=e.indexAxis,c=e.iAxisID=n(l,a,o,r),d=e.vAxisID=n(l,o,a,r);e.xScale=this.getScaleForId(a),e.yScale=this.getScaleForId(o),e.rScale=this.getScaleForId(r),e.iScale=this.getScaleForId(c),e.vScale=this.getScaleForId(d)}getDataset(){return this.chart.data.datasets[this.index]}getMeta(){return this.chart.getDatasetMeta(this.index)}getScaleForId(t){return this.chart.scales[t]}_getOtherScale(t){const e=this._cachedMeta;return t===e.iScale?e.vScale:e.iScale}reset(){this._update("reset")}_destroy(){const t=this._cachedMeta;this._data&&Js(this._data,this),t._stacked&&Oe(t)}_dataCheck(){const t=this.getDataset(),e=t.data||(t.data=[]),i=this._data;if(G(e)){const n=this._cachedMeta;this._data=ul(e,n)}else if(i!==e){if(i){Js(i,this);const n=this._cachedMeta;Oe(n),n._parsed=[]}e&&Object.isExtensible(e)&&ir(e,this),this._syncList=[],this._data=e}}addElements(){const t=this._cachedMeta;this._dataCheck(),this.datasetElementType&&(t.dataset=new this.datasetElementType)}buildOrUpdateElements(t){const e=this._cachedMeta,i=this.getDataset();let n=!1;this._dataCheck();const a=e._stacked;e._stacked=Wi(e.vScale,e),e.stack!==i.stack&&(n=!0,Oe(e),e.stack=i.stack),this._resyncElements(t),(n||a!==e._stacked)&&(bn(this,e._parsed),e._stacked=Wi(e.vScale,e))}configure(){const t=this.chart.config,e=t.datasetScopeKeys(this._type),i=t.getOptionScopes(this.getDataset(),e,!0);this.options=t.createResolver(i,this.getContext()),this._parsing=this.options.parsing,this._cachedDataOpts={}}parse(t,e){const{_cachedMeta:i,_data:n}=this,{iScale:a,_stacked:o}=i,r=a.axis;let l=t===0&&e===n.length?!0:i._sorted,c=t>0&&i._parsed[t-1],d,p,u;if(this._parsing===!1)i._parsed=n,i._sorted=!0,u=n;else{tt(n[t])?u=this.parseArrayData(i,n,t,e):G(n[t])?u=this.parseObjectData(i,n,t,e):u=this.parsePrimitiveData(i,n,t,e);const h=()=>p[r]===null||c&&p[r]<c[r];for(d=0;d<e;++d)i._parsed[d+t]=p=u[d],l&&(h()&&(l=!1),c=p);i._sorted=l}o&&bn(this,u)}parsePrimitiveData(t,e,i,n){const{iScale:a,vScale:o}=t,r=a.axis,l=o.axis,c=a.getLabels(),d=a===o,p=new Array(n);let u,h,g;for(u=0,h=n;u<h;++u)g=u+i,p[u]={[r]:d||a.parse(c[g],g),[l]:o.parse(e[g],g)};return p}parseArrayData(t,e,i,n){const{xScale:a,yScale:o}=t,r=new Array(n);let l,c,d,p;for(l=0,c=n;l<c;++l)d=l+i,p=e[d],r[l]={x:a.parse(p[0],d),y:o.parse(p[1],d)};return r}parseObjectData(t,e,i,n){const{xScale:a,yScale:o}=t,{xAxisKey:r="x",yAxisKey:l="y"}=this._parsing,c=new Array(n);let d,p,u,h;for(d=0,p=n;d<p;++d)u=d+i,h=e[u],c[d]={x:a.parse(ee(h,r),u),y:o.parse(ee(h,l),u)};return c}getParsed(t){return this._cachedMeta._parsed[t]}getDataElement(t){return this._cachedMeta.data[t]}applyStack(t,e,i){const n=this.chart,a=this._cachedMeta,o=e[t.axis],r={keys:Wa(n,!0),values:e._stacks[t.axis]._visualValues};return gn(r,o,a.index,{mode:i})}updateRangeFromParsed(t,e,i,n){const a=i[e.axis];let o=a===null?NaN:a;const r=n&&i._stacks[e.axis];n&&r&&(n.values=r,o=gn(n,a,this._cachedMeta.index)),t.min=Math.min(t.min,o),t.max=Math.max(t.max,o)}getMinMax(t,e){const i=this._cachedMeta,n=i._parsed,a=i._sorted&&t===i.iScale,o=n.length,r=this._getOtherScale(t),l=yl(e,i,this.chart),c={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY},{min:d,max:p}=fl(r);let u,h;function g(){h=n[u];const f=h[r.axis];return!st(h[t.axis])||d>f||p<f}for(u=0;u<o&&!(!g()&&(this.updateRangeFromParsed(c,t,h,l),a));++u);if(a){for(u=o-1;u>=0;--u)if(!g()){this.updateRangeFromParsed(c,t,h,l);break}}return c}getAllParsedValues(t){const e=this._cachedMeta._parsed,i=[];let n,a,o;for(n=0,a=e.length;n<a;++n)o=e[n][t.axis],st(o)&&i.push(o);return i}getMaxOverflow(){return!1}getLabelAndValue(t){const e=this._cachedMeta,i=e.iScale,n=e.vScale,a=this.getParsed(t);return{label:i?""+i.getLabelForValue(a[i.axis]):"",value:n?""+n.getLabelForValue(a[n.axis]):""}}_update(t){const e=this._cachedMeta;this.update(t||"default"),e._clip=pl(H(this.options.clip,dl(e.xScale,e.yScale,this.getMaxOverflow())))}update(t){}draw(){const t=this._ctx,e=this.chart,i=this._cachedMeta,n=i.data||[],a=e.chartArea,o=[],r=this._drawStart||0,l=this._drawCount||n.length-r,c=this.options.drawActiveElementsOnTop;let d;for(i.dataset&&i.dataset.draw(t,a,r,l),d=r;d<r+l;++d){const p=n[d];p.hidden||(p.active&&c?o.push(p):p.draw(t,a))}for(d=0;d<o.length;++d)o[d].draw(t,a)}getStyle(t,e){const i=e?"active":"default";return t===void 0&&this._cachedMeta.dataset?this.resolveDatasetElementOptions(i):this.resolveDataElementOptions(t||0,i)}getContext(t,e,i){const n=this.getDataset();let a;if(t>=0&&t<this._cachedMeta.data.length){const o=this._cachedMeta.data[t];a=o.$context||(o.$context=bl(this.getContext(),t,o)),a.parsed=this.getParsed(t),a.raw=n.data[t],a.index=a.dataIndex=t}else a=this.$context||(this.$context=ml(this.chart.getContext(),this.index)),a.dataset=n,a.index=a.datasetIndex=this.index;return a.active=!!e,a.mode=i,a}resolveDatasetElementOptions(t){return this._resolveElementOptions(this.datasetElementType.id,t)}resolveDataElementOptions(t,e){return this._resolveElementOptions(this.dataElementType.id,e,t)}_resolveElementOptions(t,e="default",i){const n=e==="active",a=this._cachedDataOpts,o=t+"-"+e,r=a[o],l=this.enableOptionSharing&&Xe(i);if(r)return yn(r,l);const c=this.chart.config,d=c.datasetElementScopeKeys(this._type,t),p=n?[`${t}Hover`,"hover",t,""]:[t,""],u=c.getOptionScopes(this.getDataset(),d),h=Object.keys(et.elements[t]),g=()=>this.getContext(i,n,e),f=c.resolveNamedOptions(u,h,g,p);return f.$shared&&(f.$shared=l,a[o]=Object.freeze(yn(f,l))),f}_resolveAnimations(t,e,i){const n=this.chart,a=this._cachedDataOpts,o=`animation-${e}`,r=a[o];if(r)return r;let l;if(n.options.animation!==!1){const d=this.chart.config,p=d.datasetAnimationScopeKeys(this._type,e),u=d.getOptionScopes(this.getDataset(),p);l=d.createResolver(u,this.getContext(t,i,e))}const c=new ja(n,l&&l.animations);return l&&l._cacheable&&(a[o]=Object.freeze(c)),c}getSharedOptions(t){if(t.$shared)return this._sharedOptions||(this._sharedOptions=Object.assign({},t))}includeOptions(t,e){return!e||Gi(t)||this.chart._animationsDisabled}_getSharedOptions(t,e){const i=this.resolveDataElementOptions(t,e),n=this._sharedOptions,a=this.getSharedOptions(i),o=this.includeOptions(e,a)||a!==n;return this.updateSharedOptions(a,e,i),{sharedOptions:a,includeOptions:o}}updateElement(t,e,i,n){Gi(n)?Object.assign(t,i):this._resolveAnimations(e,n).update(t,i)}updateSharedOptions(t,e,i){t&&!Gi(e)&&this._resolveAnimations(void 0,e).update(t,i)}_setStyle(t,e,i,n){t.active=n;const a=this.getStyle(e,n);this._resolveAnimations(e,i,n).update(t,{options:!n&&this.getSharedOptions(a)||a})}removeHoverStyle(t,e,i){this._setStyle(t,i,"active",!1)}setHoverStyle(t,e,i){this._setStyle(t,i,"active",!0)}_removeDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!1)}_setDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,"active",!0)}_resyncElements(t){const e=this._data,i=this._cachedMeta.data;for(const[r,l,c]of this._syncList)this[r](l,c);this._syncList=[];const n=i.length,a=e.length,o=Math.min(a,n);o&&this.parse(0,o),a>n?this._insertElements(n,a-n,t):a<n&&this._removeElements(a,n-a)}_insertElements(t,e,i=!0){const n=this._cachedMeta,a=n.data,o=t+e;let r;const l=c=>{for(c.length+=e,r=c.length-1;r>=o;r--)c[r]=c[r-e]};for(l(a),r=t;r<o;++r)a[r]=new this.dataElementType;this._parsing&&l(n._parsed),this.parse(t,e),i&&this.updateElements(a,t,e,"reset")}updateElements(t,e,i,n){}_removeElements(t,e){const i=this._cachedMeta;if(this._parsing){const n=i._parsed.splice(t,e);i._stacked&&Oe(i,n)}i.data.splice(t,e)}_sync(t){if(this._parsing)this._syncList.push(t);else{const[e,i,n]=t;this[e](i,n)}this.chart._dataChanges.push([this.index,...t])}_onDataPush(){const t=arguments.length;this._sync(["_insertElements",this.getDataset().data.length-t,t])}_onDataPop(){this._sync(["_removeElements",this._cachedMeta.data.length-1,1])}_onDataShift(){this._sync(["_removeElements",0,1])}_onDataSplice(t,e){e&&this._sync(["_removeElements",t,e]);const i=arguments.length-2;i&&this._sync(["_insertElements",t,i])}_onDataUnshift(){this._sync(["_insertElements",0,arguments.length])}}$(_t,"defaults",{}),$(_t,"datasetElementType",null),$(_t,"dataElementType",null);function xl(s,t){if(!s._cache.$bar){const e=s.getMatchingVisibleMetas(t);let i=[];for(let n=0,a=e.length;n<a;n++)i=i.concat(e[n].controller.getAllParsedValues(s));s._cache.$bar=_a(i.sort((n,a)=>n-a))}return s._cache.$bar}function vl(s){const t=s.iScale,e=xl(t,s.type);let i=t._length,n,a,o,r;const l=()=>{o===32767||o===-32768||(Xe(r)&&(i=Math.min(i,Math.abs(o-r)||i)),r=o)};for(n=0,a=e.length;n<a;++n)o=t.getPixelForValue(e[n]),l();for(r=void 0,n=0,a=t.ticks.length;n<a;++n)o=t.getPixelForTick(n),l();return i}function wl(s,t,e,i){const n=e.barThickness;let a,o;return U(n)?(a=t.min*e.categoryPercentage,o=e.barPercentage):(a=n*i,o=1),{chunk:a/i,ratio:o,start:t.pixels[s]-a/2}}function Sl(s,t,e,i){const n=t.pixels,a=n[s];let o=s>0?n[s-1]:null,r=s<n.length-1?n[s+1]:null;const l=e.categoryPercentage;o===null&&(o=a-(r===null?t.end-t.start:r-a)),r===null&&(r=a+a-o);const c=a-(a-Math.min(o,r))/2*l;return{chunk:Math.abs(r-o)/2*l/i,ratio:e.barPercentage,start:c}}function kl(s,t,e,i){const n=e.parse(s[0],i),a=e.parse(s[1],i),o=Math.min(n,a),r=Math.max(n,a);let l=o,c=r;Math.abs(o)>Math.abs(r)&&(l=r,c=o),t[e.axis]=c,t._custom={barStart:l,barEnd:c,start:n,end:a,min:o,max:r}}function Ua(s,t,e,i){return tt(s)?kl(s,t,e,i):t[e.axis]=e.parse(s,i),t}function xn(s,t,e,i){const n=s.iScale,a=s.vScale,o=n.getLabels(),r=n===a,l=[];let c,d,p,u;for(c=e,d=e+i;c<d;++c)u=t[c],p={},p[n.axis]=r||n.parse(o[c],c),l.push(Ua(u,p,a,c));return l}function Yi(s){return s&&s.barStart!==void 0&&s.barEnd!==void 0}function _l(s,t,e){return s!==0?It(s):(t.isHorizontal()?1:-1)*(t.min>=e?1:-1)}function Cl(s){let t,e,i,n,a;return s.horizontal?(t=s.base>s.x,e="left",i="right"):(t=s.base<s.y,e="bottom",i="top"),t?(n="end",a="start"):(n="start",a="end"),{start:e,end:i,reverse:t,top:n,bottom:a}}function Tl(s,t,e,i){let n=t.borderSkipped;const a={};if(!n){s.borderSkipped=a;return}if(n===!0){s.borderSkipped={top:!0,right:!0,bottom:!0,left:!0};return}const{start:o,end:r,reverse:l,top:c,bottom:d}=Cl(s);n==="middle"&&e&&(s.enableBorderRadius=!0,(e._top||0)===i?n=c:(e._bottom||0)===i?n=d:(a[vn(d,o,r,l)]=!0,n=c)),a[vn(n,o,r,l)]=!0,s.borderSkipped=a}function vn(s,t,e,i){return i?(s=Ml(s,t,e),s=wn(s,e,t)):s=wn(s,t,e),s}function Ml(s,t,e){return s===t?e:s===e?t:s}function wn(s,t,e){return s==="start"?t:s==="end"?e:s}function Al(s,{inflateAmount:t},e){s.inflateAmount=t==="auto"?e===1?.33:0:t}class bi extends _t{parsePrimitiveData(t,e,i,n){return xn(t,e,i,n)}parseArrayData(t,e,i,n){return xn(t,e,i,n)}parseObjectData(t,e,i,n){const{iScale:a,vScale:o}=t,{xAxisKey:r="x",yAxisKey:l="y"}=this._parsing,c=a.axis==="x"?r:l,d=o.axis==="x"?r:l,p=[];let u,h,g,f;for(u=i,h=i+n;u<h;++u)f=e[u],g={},g[a.axis]=a.parse(ee(f,c),u),p.push(Ua(ee(f,d),g,o,u));return p}updateRangeFromParsed(t,e,i,n){super.updateRangeFromParsed(t,e,i,n);const a=i._custom;a&&e===this._cachedMeta.vScale&&(t.min=Math.min(t.min,a.min),t.max=Math.max(t.max,a.max))}getMaxOverflow(){return 0}getLabelAndValue(t){const e=this._cachedMeta,{iScale:i,vScale:n}=e,a=this.getParsed(t),o=a._custom,r=Yi(o)?"["+o.start+", "+o.end+"]":""+n.getLabelForValue(a[n.axis]);return{label:""+i.getLabelForValue(a[i.axis]),value:r}}initialize(){this.enableOptionSharing=!0,super.initialize();const t=this._cachedMeta;t.stack=this.getDataset().stack}update(t){const e=this._cachedMeta;this.updateElements(e.data,0,e.data.length,t)}updateElements(t,e,i,n){const a=n==="reset",{index:o,_cachedMeta:{vScale:r}}=this,l=r.getBasePixel(),c=r.isHorizontal(),d=this._getRuler(),{sharedOptions:p,includeOptions:u}=this._getSharedOptions(e,n);for(let h=e;h<e+i;h++){const g=this.getParsed(h),f=a||U(g[r.axis])?{base:l,head:l}:this._calculateBarValuePixels(h),m=this._calculateBarIndexPixels(h,d),y=(g._stacks||{})[r.axis],v={horizontal:c,base:f.base,enableBorderRadius:!y||Yi(g._custom)||o===y._top||o===y._bottom,x:c?f.head:m.center,y:c?m.center:f.head,height:c?m.size:Math.abs(f.size),width:c?Math.abs(f.size):m.size};u&&(v.options=p||this.resolveDataElementOptions(h,t[h].active?"active":n));const S=v.options||t[h].options;Tl(v,S,y,o),Al(v,S,d.ratio),this.updateElement(t[h],h,v,n)}}_getStacks(t,e){const{iScale:i}=this._cachedMeta,n=i.getMatchingVisibleMetas(this._type).filter(d=>d.controller.options.grouped),a=i.options.stacked,o=[],r=this._cachedMeta.controller.getParsed(e),l=r&&r[i.axis],c=d=>{const p=d._parsed.find(h=>h[i.axis]===l),u=p&&p[d.vScale.axis];if(U(u)||isNaN(u))return!0};for(const d of n)if(!(e!==void 0&&c(d))&&((a===!1||o.indexOf(d.stack)===-1||a===void 0&&d.stack===void 0)&&o.push(d.stack),d.index===t))break;return o.length||o.push(void 0),o}_getStackCount(t){return this._getStacks(void 0,t).length}_getAxisCount(){return this._getAxis().length}getFirstScaleIdForIndexAxis(){const t=this.chart.scales,e=this.chart.options.indexAxis;return Object.keys(t).filter(i=>t[i].axis===e).shift()}_getAxis(){const t={},e=this.getFirstScaleIdForIndexAxis();for(const i of this.chart.data.datasets)t[H(this.chart.options.indexAxis==="x"?i.xAxisID:i.yAxisID,e)]=!0;return Object.keys(t)}_getStackIndex(t,e,i){const n=this._getStacks(t,i),a=e!==void 0?n.indexOf(e):-1;return a===-1?n.length-1:a}_getRuler(){const t=this.options,e=this._cachedMeta,i=e.iScale,n=[];let a,o;for(a=0,o=e.data.length;a<o;++a)n.push(i.getPixelForValue(this.getParsed(a)[i.axis],a));const r=t.barThickness;return{min:r||vl(e),pixels:n,start:i._startPixel,end:i._endPixel,stackCount:this._getStackCount(),scale:i,grouped:t.grouped,ratio:r?1:t.categoryPercentage*t.barPercentage}}_calculateBarValuePixels(t){const{_cachedMeta:{vScale:e,_stacked:i,index:n},options:{base:a,minBarLength:o}}=this,r=a||0,l=this.getParsed(t),c=l._custom,d=Yi(c);let p=l[e.axis],u=0,h=i?this.applyStack(e,l,i):p,g,f;h!==p&&(u=h-p,h=p),d&&(p=c.barStart,h=c.barEnd-c.barStart,p!==0&&It(p)!==It(c.barEnd)&&(u=0),u+=p);const m=!U(a)&&!d?a:u;let y=e.getPixelForValue(m);if(this.chart.getDataVisibility(t)?g=e.getPixelForValue(u+h):g=y,f=g-y,Math.abs(f)<o){f=_l(f,e,r)*o,p===r&&(y-=f/2);const v=e.getPixelForDecimal(0),S=e.getPixelForDecimal(1),x=Math.min(v,S),b=Math.max(v,S);y=Math.max(Math.min(y,b),x),g=y+f,i&&!d&&(l._stacks[e.axis]._visualValues[n]=e.getValueForPixel(g)-e.getValueForPixel(y))}if(y===e.getPixelForValue(r)){const v=It(f)*e.getLineWidthForValue(r)/2;y+=v,f-=v}return{size:f,base:y,head:g,center:g+f/2}}_calculateBarIndexPixels(t,e){const i=e.scale,n=this.options,a=n.skipNull,o=H(n.maxBarThickness,1/0);let r,l;const c=this._getAxisCount();if(e.grouped){const d=a?this._getStackCount(t):e.stackCount,p=n.barThickness==="flex"?Sl(t,e,n,d*c):wl(t,e,n,d*c),u=this.chart.options.indexAxis==="x"?this.getDataset().xAxisID:this.getDataset().yAxisID,h=this._getAxis().indexOf(H(u,this.getFirstScaleIdForIndexAxis())),g=this._getStackIndex(this.index,this._cachedMeta.stack,a?t:void 0)+h;r=p.start+p.chunk*g+p.chunk/2,l=Math.min(o,p.chunk*p.ratio)}else r=i.getPixelForValue(this.getParsed(t)[i.axis],t),l=Math.min(o,e.min*e.ratio);return{base:r-l/2,head:r+l/2,center:r,size:l}}draw(){const t=this._cachedMeta,e=t.vScale,i=t.data,n=i.length;let a=0;for(;a<n;++a)this.getParsed(a)[e.axis]!==null&&!i[a].hidden&&i[a].draw(this._ctx)}}$(bi,"id","bar"),$(bi,"defaults",{datasetElementType:!1,dataElementType:"bar",categoryPercentage:.8,barPercentage:.9,grouped:!0,animations:{numbers:{type:"number",properties:["x","y","base","width","height"]}}}),$(bi,"overrides",{scales:{_index_:{type:"category",offset:!0,grid:{offset:!0}},_value_:{type:"linear",beginAtZero:!0}}});class yi extends _t{initialize(){this.enableOptionSharing=!0,super.initialize()}parsePrimitiveData(t,e,i,n){const a=super.parsePrimitiveData(t,e,i,n);for(let o=0;o<a.length;o++)a[o]._custom=this.resolveDataElementOptions(o+i).radius;return a}parseArrayData(t,e,i,n){const a=super.parseArrayData(t,e,i,n);for(let o=0;o<a.length;o++){const r=e[i+o];a[o]._custom=H(r[2],this.resolveDataElementOptions(o+i).radius)}return a}parseObjectData(t,e,i,n){const a=super.parseObjectData(t,e,i,n);for(let o=0;o<a.length;o++){const r=e[i+o];a[o]._custom=H(r&&r.r&&+r.r,this.resolveDataElementOptions(o+i).radius)}return a}getMaxOverflow(){const t=this._cachedMeta.data;let e=0;for(let i=t.length-1;i>=0;--i)e=Math.max(e,t[i].size(this.resolveDataElementOptions(i))/2);return e>0&&e}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:n,yScale:a}=e,o=this.getParsed(t),r=n.getLabelForValue(o.x),l=a.getLabelForValue(o.y),c=o._custom;return{label:i[t]||"",value:"("+r+", "+l+(c?", "+c:"")+")"}}update(t){const e=this._cachedMeta.data;this.updateElements(e,0,e.length,t)}updateElements(t,e,i,n){const a=n==="reset",{iScale:o,vScale:r}=this._cachedMeta,{sharedOptions:l,includeOptions:c}=this._getSharedOptions(e,n),d=o.axis,p=r.axis;for(let u=e;u<e+i;u++){const h=t[u],g=!a&&this.getParsed(u),f={},m=f[d]=a?o.getPixelForDecimal(.5):o.getPixelForValue(g[d]),y=f[p]=a?r.getBasePixel():r.getPixelForValue(g[p]);f.skip=isNaN(m)||isNaN(y),c&&(f.options=l||this.resolveDataElementOptions(u,h.active?"active":n),a&&(f.options.radius=0)),this.updateElement(h,u,f,n)}}resolveDataElementOptions(t,e){const i=this.getParsed(t);let n=super.resolveDataElementOptions(t,e);n.$shared&&(n=Object.assign({},n,{$shared:!1}));const a=n.radius;return e!=="active"&&(n.radius=0),n.radius+=H(i&&i._custom,a),n}}$(yi,"id","bubble"),$(yi,"defaults",{datasetElementType:!1,dataElementType:"point",animations:{numbers:{type:"number",properties:["x","y","borderWidth","radius"]}}}),$(yi,"overrides",{scales:{x:{type:"linear"},y:{type:"linear"}}});function $l(s,t,e){let i=1,n=1,a=0,o=0;if(t<Q){const r=s,l=r+t,c=Math.cos(r),d=Math.sin(r),p=Math.cos(l),u=Math.sin(l),h=(S,x,b)=>Ze(S,r,l,!0)?1:Math.max(x,x*e,b,b*e),g=(S,x,b)=>Ze(S,r,l,!0)?-1:Math.min(x,x*e,b,b*e),f=h(0,c,p),m=h(at,d,u),y=g(Y,c,p),v=g(Y+at,d,u);i=(f-y)/2,n=(m-v)/2,a=-(f+y)/2,o=-(m+v)/2}return{ratioX:i,ratioY:n,offsetX:a,offsetY:o}}class fe extends _t{constructor(t,e){super(t,e),this.enableOptionSharing=!0,this.innerRadius=void 0,this.outerRadius=void 0,this.offsetX=void 0,this.offsetY=void 0}linkScales(){}parse(t,e){const i=this.getDataset().data,n=this._cachedMeta;if(this._parsing===!1)n._parsed=i;else{let a=l=>+i[l];if(G(i[t])){const{key:l="value"}=this._parsing;a=c=>+ee(i[c],l)}let o,r;for(o=t,r=t+e;o<r;++o)n._parsed[o]=a(o)}}_getRotation(){return kt(this.options.rotation-90)}_getCircumference(){return kt(this.options.circumference)}_getRotationExtents(){let t=Q,e=-Q;for(let i=0;i<this.chart.data.datasets.length;++i)if(this.chart.isDatasetVisible(i)&&this.chart.getDatasetMeta(i).type===this._type){const n=this.chart.getDatasetMeta(i).controller,a=n._getRotation(),o=n._getCircumference();t=Math.min(t,a),e=Math.max(e,a+o)}return{rotation:t,circumference:e-t}}update(t){const e=this.chart,{chartArea:i}=e,n=this._cachedMeta,a=n.data,o=this.getMaxBorderWidth()+this.getMaxOffset(a)+this.options.spacing,r=Math.max((Math.min(i.width,i.height)-o)/2,0),l=Math.min(No(this.options.cutout,r),1),c=this._getRingWeight(this.index),{circumference:d,rotation:p}=this._getRotationExtents(),{ratioX:u,ratioY:h,offsetX:g,offsetY:f}=$l(p,d,l),m=(i.width-o)/u,y=(i.height-o)/h,v=Math.max(Math.min(m,y)/2,0),S=xa(this.options.radius,v),x=Math.max(S*l,0),b=(S-x)/this._getVisibleDatasetWeightTotal();this.offsetX=g*S,this.offsetY=f*S,n.total=this.calculateTotal(),this.outerRadius=S-b*this._getRingWeightOffset(this.index),this.innerRadius=Math.max(this.outerRadius-b*c,0),this.updateElements(a,0,a.length,t)}_circumference(t,e){const i=this.options,n=this._cachedMeta,a=this._getCircumference();return e&&i.animation.animateRotate||!this.chart.getDataVisibility(t)||n._parsed[t]===null||n.data[t].hidden?0:this.calculateCircumference(n._parsed[t]*a/Q)}updateElements(t,e,i,n){const a=n==="reset",o=this.chart,r=o.chartArea,c=o.options.animation,d=(r.left+r.right)/2,p=(r.top+r.bottom)/2,u=a&&c.animateScale,h=u?0:this.innerRadius,g=u?0:this.outerRadius,{sharedOptions:f,includeOptions:m}=this._getSharedOptions(e,n);let y=this._getRotation(),v;for(v=0;v<e;++v)y+=this._circumference(v,a);for(v=e;v<e+i;++v){const S=this._circumference(v,a),x=t[v],b={x:d+this.offsetX,y:p+this.offsetY,startAngle:y,endAngle:y+S,circumference:S,outerRadius:g,innerRadius:h};m&&(b.options=f||this.resolveDataElementOptions(v,x.active?"active":n)),y+=S,this.updateElement(x,v,b,n)}}calculateTotal(){const t=this._cachedMeta,e=t.data;let i=0,n;for(n=0;n<e.length;n++){const a=t._parsed[n];a!==null&&!isNaN(a)&&this.chart.getDataVisibility(n)&&!e[n].hidden&&(i+=Math.abs(a))}return i}calculateCircumference(t){const e=this._cachedMeta.total;return e>0&&!isNaN(t)?Q*(Math.abs(t)/e):0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,n=i.data.labels||[],a=si(e._parsed[t],i.options.locale);return{label:n[t]||"",value:a}}getMaxBorderWidth(t){let e=0;const i=this.chart;let n,a,o,r,l;if(!t){for(n=0,a=i.data.datasets.length;n<a;++n)if(i.isDatasetVisible(n)){o=i.getDatasetMeta(n),t=o.data,r=o.controller;break}}if(!t)return 0;for(n=0,a=t.length;n<a;++n)l=r.resolveDataElementOptions(n),l.borderAlign!=="inner"&&(e=Math.max(e,l.borderWidth||0,l.hoverBorderWidth||0));return e}getMaxOffset(t){let e=0;for(let i=0,n=t.length;i<n;++i){const a=this.resolveDataElementOptions(i);e=Math.max(e,a.offset||0,a.hoverOffset||0)}return e}_getRingWeightOffset(t){let e=0;for(let i=0;i<t;++i)this.chart.isDatasetVisible(i)&&(e+=this._getRingWeight(i));return e}_getRingWeight(t){return Math.max(H(this.chart.data.datasets[t].weight,1),0)}_getVisibleDatasetWeightTotal(){return this._getRingWeightOffset(this.chart.data.datasets.length)||1}}$(fe,"id","doughnut"),$(fe,"defaults",{datasetElementType:!1,dataElementType:"arc",animation:{animateRotate:!0,animateScale:!1},animations:{numbers:{type:"number",properties:["circumference","endAngle","innerRadius","outerRadius","startAngle","x","y","offset","borderWidth","spacing"]}},cutout:"50%",rotation:0,circumference:360,radius:"100%",spacing:0,indexAxis:"r"}),$(fe,"descriptors",{_scriptable:t=>t!=="spacing",_indexable:t=>t!=="spacing"&&!t.startsWith("borderDash")&&!t.startsWith("hoverBorderDash")}),$(fe,"overrides",{aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data,{labels:{pointStyle:i,textAlign:n,color:a,useBorderRadius:o,borderRadius:r}}=t.legend.options;return e.labels.length&&e.datasets.length?e.labels.map((l,c)=>{const p=t.getDatasetMeta(0).controller.getStyle(c);return{text:l,fillStyle:p.backgroundColor,fontColor:a,hidden:!t.getDataVisibility(c),lineDash:p.borderDash,lineDashOffset:p.borderDashOffset,lineJoin:p.borderJoinStyle,lineWidth:p.borderWidth,strokeStyle:p.borderColor,textAlign:n,pointStyle:i,borderRadius:o&&(r||p.borderRadius),index:c}}):[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}}});class xi extends _t{initialize(){this.enableOptionSharing=!0,this.supportsDecimation=!0,super.initialize()}update(t){const e=this._cachedMeta,{dataset:i,data:n=[],_dataset:a}=e,o=this.chart._animationsDisabled;let{start:r,count:l}=Ma(e,n,o);this._drawStart=r,this._drawCount=l,Aa(e)&&(r=0,l=n.length),i._chart=this.chart,i._datasetIndex=this.index,i._decimated=!!a._decimated,i.points=n;const c=this.resolveDatasetElementOptions(t);this.options.showLine||(c.borderWidth=0),c.segment=this.options.segment,this.updateElement(i,void 0,{animated:!o,options:c},t),this.updateElements(n,r,l,t)}updateElements(t,e,i,n){const a=n==="reset",{iScale:o,vScale:r,_stacked:l,_dataset:c}=this._cachedMeta,{sharedOptions:d,includeOptions:p}=this._getSharedOptions(e,n),u=o.axis,h=r.axis,{spanGaps:g,segment:f}=this.options,m=ke(g)?g:Number.POSITIVE_INFINITY,y=this.chart._animationsDisabled||a||n==="none",v=e+i,S=t.length;let x=e>0&&this.getParsed(e-1);for(let b=0;b<S;++b){const _=t[b],k=y?_:{};if(b<e||b>=v){k.skip=!0;continue}const w=this.getParsed(b),C=U(w[h]),A=k[u]=o.getPixelForValue(w[u],b),T=k[h]=a||C?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,w,l):w[h],b);k.skip=isNaN(A)||isNaN(T)||C,k.stop=b>0&&Math.abs(w[u]-x[u])>m,f&&(k.parsed=w,k.raw=c.data[b]),p&&(k.options=d||this.resolveDataElementOptions(b,_.active?"active":n)),y||this.updateElement(_,b,k,n),x=w}}getMaxOverflow(){const t=this._cachedMeta,e=t.dataset,i=e.options&&e.options.borderWidth||0,n=t.data||[];if(!n.length)return i;const a=n[0].size(this.resolveDataElementOptions(0)),o=n[n.length-1].size(this.resolveDataElementOptions(n.length-1));return Math.max(i,a,o)/2}draw(){const t=this._cachedMeta;t.dataset.updateControlPoints(this.chart.chartArea,t.iScale.axis),super.draw()}}$(xi,"id","line"),$(xi,"defaults",{datasetElementType:"line",dataElementType:"point",showLine:!0,spanGaps:!1}),$(xi,"overrides",{scales:{_index_:{type:"category"},_value_:{type:"linear"}}});class Ge extends _t{constructor(t,e){super(t,e),this.innerRadius=void 0,this.outerRadius=void 0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,n=i.data.labels||[],a=si(e._parsed[t].r,i.options.locale);return{label:n[t]||"",value:a}}parseObjectData(t,e,i,n){return Ea.bind(this)(t,e,i,n)}update(t){const e=this._cachedMeta.data;this._updateRadius(),this.updateElements(e,0,e.length,t)}getMinMax(){const t=this._cachedMeta,e={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY};return t.data.forEach((i,n)=>{const a=this.getParsed(n).r;!isNaN(a)&&this.chart.getDataVisibility(n)&&(a<e.min&&(e.min=a),a>e.max&&(e.max=a))}),e}_updateRadius(){const t=this.chart,e=t.chartArea,i=t.options,n=Math.min(e.right-e.left,e.bottom-e.top),a=Math.max(n/2,0),o=Math.max(i.cutoutPercentage?a/100*i.cutoutPercentage:1,0),r=(a-o)/t.getVisibleDatasetCount();this.outerRadius=a-r*this.index,this.innerRadius=this.outerRadius-r}updateElements(t,e,i,n){const a=n==="reset",o=this.chart,l=o.options.animation,c=this._cachedMeta.rScale,d=c.xCenter,p=c.yCenter,u=c.getIndexAngle(0)-.5*Y;let h=u,g;const f=360/this.countVisibleElements();for(g=0;g<e;++g)h+=this._computeAngle(g,n,f);for(g=e;g<e+i;g++){const m=t[g];let y=h,v=h+this._computeAngle(g,n,f),S=o.getDataVisibility(g)?c.getDistanceFromCenterForValue(this.getParsed(g).r):0;h=v,a&&(l.animateScale&&(S=0),l.animateRotate&&(y=v=u));const x={x:d,y:p,innerRadius:0,outerRadius:S,startAngle:y,endAngle:v,options:this.resolveDataElementOptions(g,m.active?"active":n)};this.updateElement(m,g,x,n)}}countVisibleElements(){const t=this._cachedMeta;let e=0;return t.data.forEach((i,n)=>{!isNaN(this.getParsed(n).r)&&this.chart.getDataVisibility(n)&&e++}),e}_computeAngle(t,e,i){return this.chart.getDataVisibility(t)?kt(this.resolveDataElementOptions(t,e).angle||i):0}}$(Ge,"id","polarArea"),$(Ge,"defaults",{dataElementType:"arc",animation:{animateRotate:!0,animateScale:!0},animations:{numbers:{type:"number",properties:["x","y","startAngle","endAngle","innerRadius","outerRadius"]}},indexAxis:"r",startAngle:0}),$(Ge,"overrides",{aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:n}}=t.legend.options;return e.labels.map((a,o)=>{const l=t.getDatasetMeta(0).controller.getStyle(o);return{text:a,fillStyle:l.backgroundColor,strokeStyle:l.borderColor,fontColor:n,lineWidth:l.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(o),index:o}})}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}},scales:{r:{type:"radialLinear",angleLines:{display:!1},beginAtZero:!0,grid:{circular:!0},pointLabels:{display:!1},startAngle:0}}});class os extends fe{}$(os,"id","pie"),$(os,"defaults",{cutout:0,rotation:0,circumference:360,radius:"100%"});class vi extends _t{getLabelAndValue(t){const e=this._cachedMeta.vScale,i=this.getParsed(t);return{label:e.getLabels()[t],value:""+e.getLabelForValue(i[e.axis])}}parseObjectData(t,e,i,n){return Ea.bind(this)(t,e,i,n)}update(t){const e=this._cachedMeta,i=e.dataset,n=e.data||[],a=e.iScale.getLabels();if(i.points=n,t!=="resize"){const o=this.resolveDatasetElementOptions(t);this.options.showLine||(o.borderWidth=0);const r={_loop:!0,_fullLoop:a.length===n.length,options:o};this.updateElement(i,void 0,r,t)}this.updateElements(n,0,n.length,t)}updateElements(t,e,i,n){const a=this._cachedMeta.rScale,o=n==="reset";for(let r=e;r<e+i;r++){const l=t[r],c=this.resolveDataElementOptions(r,l.active?"active":n),d=a.getPointPositionForValue(r,this.getParsed(r).r),p=o?a.xCenter:d.x,u=o?a.yCenter:d.y,h={x:p,y:u,angle:d.angle,skip:isNaN(p)||isNaN(u),options:c};this.updateElement(l,r,h,n)}}}$(vi,"id","radar"),$(vi,"defaults",{datasetElementType:"line",dataElementType:"point",indexAxis:"r",showLine:!0,elements:{line:{fill:"start"}}}),$(vi,"overrides",{aspectRatio:1,scales:{r:{type:"radialLinear"}}});class wi extends _t{getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:n,yScale:a}=e,o=this.getParsed(t),r=n.getLabelForValue(o.x),l=a.getLabelForValue(o.y);return{label:i[t]||"",value:"("+r+", "+l+")"}}update(t){const e=this._cachedMeta,{data:i=[]}=e,n=this.chart._animationsDisabled;let{start:a,count:o}=Ma(e,i,n);if(this._drawStart=a,this._drawCount=o,Aa(e)&&(a=0,o=i.length),this.options.showLine){this.datasetElementType||this.addElements();const{dataset:r,_dataset:l}=e;r._chart=this.chart,r._datasetIndex=this.index,r._decimated=!!l._decimated,r.points=i;const c=this.resolveDatasetElementOptions(t);c.segment=this.options.segment,this.updateElement(r,void 0,{animated:!n,options:c},t)}else this.datasetElementType&&(delete e.dataset,this.datasetElementType=!1);this.updateElements(i,a,o,t)}addElements(){const{showLine:t}=this.options;!this.datasetElementType&&t&&(this.datasetElementType=this.chart.registry.getElement("line")),super.addElements()}updateElements(t,e,i,n){const a=n==="reset",{iScale:o,vScale:r,_stacked:l,_dataset:c}=this._cachedMeta,d=this.resolveDataElementOptions(e,n),p=this.getSharedOptions(d),u=this.includeOptions(n,p),h=o.axis,g=r.axis,{spanGaps:f,segment:m}=this.options,y=ke(f)?f:Number.POSITIVE_INFINITY,v=this.chart._animationsDisabled||a||n==="none";let S=e>0&&this.getParsed(e-1);for(let x=e;x<e+i;++x){const b=t[x],_=this.getParsed(x),k=v?b:{},w=U(_[g]),C=k[h]=o.getPixelForValue(_[h],x),A=k[g]=a||w?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,_,l):_[g],x);k.skip=isNaN(C)||isNaN(A)||w,k.stop=x>0&&Math.abs(_[h]-S[h])>y,m&&(k.parsed=_,k.raw=c.data[x]),u&&(k.options=p||this.resolveDataElementOptions(x,b.active?"active":n)),v||this.updateElement(b,x,k,n),S=_}this.updateSharedOptions(p,n,d)}getMaxOverflow(){const t=this._cachedMeta,e=t.data||[];if(!this.options.showLine){let r=0;for(let l=e.length-1;l>=0;--l)r=Math.max(r,e[l].size(this.resolveDataElementOptions(l))/2);return r>0&&r}const i=t.dataset,n=i.options&&i.options.borderWidth||0;if(!e.length)return n;const a=e[0].size(this.resolveDataElementOptions(0)),o=e[e.length-1].size(this.resolveDataElementOptions(e.length-1));return Math.max(n,a,o)/2}}$(wi,"id","scatter"),$(wi,"defaults",{datasetElementType:!1,dataElementType:"point",showLine:!1,fill:!1}),$(wi,"overrides",{interaction:{mode:"point"},scales:{x:{type:"linear"},y:{type:"linear"}}});var Pl=Object.freeze({__proto__:null,BarController:bi,BubbleController:yi,DoughnutController:fe,LineController:xi,PieController:os,PolarAreaController:Ge,RadarController:vi,ScatterController:wi});function de(){throw new Error("This method is not implemented: Check that a complete date adapter is provided.")}class Is{constructor(t){$(this,"options");this.options=t||{}}static override(t){Object.assign(Is.prototype,t)}init(){}formats(){return de()}parse(){return de()}format(){return de()}add(){return de()}diff(){return de()}startOf(){return de()}endOf(){return de()}}var Ol={_date:Is};function Il(s,t,e,i){const{controller:n,data:a,_sorted:o}=s,r=n._cachedMeta.iScale,l=s.dataset&&s.dataset.options?s.dataset.options.spanGaps:null;if(r&&t===r.axis&&t!=="r"&&o&&a.length){const c=r._reversePixels?tr:Nt;if(i){if(n._sharedOptions){const d=a[0],p=typeof d.getRange=="function"&&d.getRange(t);if(p){const u=c(a,t,e-p),h=c(a,t,e+p);return{lo:u.lo,hi:h.hi}}}}else{const d=c(a,t,e);if(l){const{vScale:p}=n._cachedMeta,{_parsed:u}=s,h=u.slice(0,d.lo+1).reverse().findIndex(f=>!U(f[p.axis]));d.lo-=Math.max(0,h);const g=u.slice(d.hi).findIndex(f=>!U(f[p.axis]));d.hi+=Math.max(0,g)}return d}}return{lo:0,hi:a.length-1}}function Bi(s,t,e,i,n){const a=s.getSortedVisibleDatasetMetas(),o=e[t];for(let r=0,l=a.length;r<l;++r){const{index:c,data:d}=a[r],{lo:p,hi:u}=Il(a[r],t,o,n);for(let h=p;h<=u;++h){const g=d[h];g.skip||i(g,c,h)}}}function zl(s){const t=s.indexOf("x")!==-1,e=s.indexOf("y")!==-1;return function(i,n){const a=t?Math.abs(i.x-n.x):0,o=e?Math.abs(i.y-n.y):0;return Math.sqrt(Math.pow(a,2)+Math.pow(o,2))}}function Ki(s,t,e,i,n){const a=[];return!n&&!s.isPointInArea(t)||Bi(s,e,t,function(r,l,c){!n&&!Ht(r,s.chartArea,0)||r.inRange(t.x,t.y,i)&&a.push({element:r,datasetIndex:l,index:c})},!0),a}function Dl(s,t,e,i){let n=[];function a(o,r,l){const{startAngle:c,endAngle:d}=o.getProps(["startAngle","endAngle"],i),{angle:p}=Sa(o,{x:t.x,y:t.y});Ze(p,c,d)&&n.push({element:o,datasetIndex:r,index:l})}return Bi(s,e,t,a),n}function Ll(s,t,e,i,n,a){let o=[];const r=zl(e);let l=Number.POSITIVE_INFINITY;function c(d,p,u){const h=d.inRange(t.x,t.y,n);if(i&&!h)return;const g=d.getCenterPoint(n);if(!(!!a||s.isPointInArea(g))&&!h)return;const m=r(t,g);m<l?(o=[{element:d,datasetIndex:p,index:u}],l=m):m===l&&o.push({element:d,datasetIndex:p,index:u})}return Bi(s,e,t,c),o}function Xi(s,t,e,i,n,a){return!a&&!s.isPointInArea(t)?[]:e==="r"&&!i?Dl(s,t,e,n):Ll(s,t,e,i,n,a)}function Sn(s,t,e,i,n){const a=[],o=e==="x"?"inXRange":"inYRange";let r=!1;return Bi(s,e,t,(l,c,d)=>{l[o]&&l[o](t[e],n)&&(a.push({element:l,datasetIndex:c,index:d}),r=r||l.inRange(t.x,t.y,n))}),i&&!r?[]:a}var El={modes:{index(s,t,e,i){const n=ue(t,s),a=e.axis||"x",o=e.includeInvisible||!1,r=e.intersect?Ki(s,n,a,i,o):Xi(s,n,a,!1,i,o),l=[];return r.length?(s.getSortedVisibleDatasetMetas().forEach(c=>{const d=r[0].index,p=c.data[d];p&&!p.skip&&l.push({element:p,datasetIndex:c.index,index:d})}),l):[]},dataset(s,t,e,i){const n=ue(t,s),a=e.axis||"xy",o=e.includeInvisible||!1;let r=e.intersect?Ki(s,n,a,i,o):Xi(s,n,a,!1,i,o);if(r.length>0){const l=r[0].datasetIndex,c=s.getDatasetMeta(l).data;r=[];for(let d=0;d<c.length;++d)r.push({element:c[d],datasetIndex:l,index:d})}return r},point(s,t,e,i){const n=ue(t,s),a=e.axis||"xy",o=e.includeInvisible||!1;return Ki(s,n,a,i,o)},nearest(s,t,e,i){const n=ue(t,s),a=e.axis||"xy",o=e.includeInvisible||!1;return Xi(s,n,a,e.intersect,i,o)},x(s,t,e,i){const n=ue(t,s);return Sn(s,n,"x",e.intersect,i)},y(s,t,e,i){const n=ue(t,s);return Sn(s,n,"y",e.intersect,i)}}};const Ga=["left","top","right","bottom"];function Ie(s,t){return s.filter(e=>e.pos===t)}function kn(s,t){return s.filter(e=>Ga.indexOf(e.pos)===-1&&e.box.axis===t)}function ze(s,t){return s.sort((e,i)=>{const n=t?i:e,a=t?e:i;return n.weight===a.weight?n.index-a.index:n.weight-a.weight})}function Rl(s){const t=[];let e,i,n,a,o,r;for(e=0,i=(s||[]).length;e<i;++e)n=s[e],{position:a,options:{stack:o,stackWeight:r=1}}=n,t.push({index:e,box:n,pos:a,horizontal:n.isHorizontal(),weight:n.weight,stack:o&&a+o,stackWeight:r});return t}function Fl(s){const t={};for(const e of s){const{stack:i,pos:n,stackWeight:a}=e;if(!i||!Ga.includes(n))continue;const o=t[i]||(t[i]={count:0,placed:0,weight:0,size:0});o.count++,o.weight+=a}return t}function Bl(s,t){const e=Fl(s),{vBoxMaxWidth:i,hBoxMaxHeight:n}=t;let a,o,r;for(a=0,o=s.length;a<o;++a){r=s[a];const{fullSize:l}=r.box,c=e[r.stack],d=c&&r.stackWeight/c.weight;r.horizontal?(r.width=d?d*i:l&&t.availableWidth,r.height=n):(r.width=i,r.height=d?d*n:l&&t.availableHeight)}return e}function ql(s){const t=Rl(s),e=ze(t.filter(c=>c.box.fullSize),!0),i=ze(Ie(t,"left"),!0),n=ze(Ie(t,"right")),a=ze(Ie(t,"top"),!0),o=ze(Ie(t,"bottom")),r=kn(t,"x"),l=kn(t,"y");return{fullSize:e,leftAndTop:i.concat(a),rightAndBottom:n.concat(l).concat(o).concat(r),chartArea:Ie(t,"chartArea"),vertical:i.concat(n).concat(l),horizontal:a.concat(o).concat(r)}}function _n(s,t,e,i){return Math.max(s[e],t[e])+Math.max(s[i],t[i])}function Ya(s,t){s.top=Math.max(s.top,t.top),s.left=Math.max(s.left,t.left),s.bottom=Math.max(s.bottom,t.bottom),s.right=Math.max(s.right,t.right)}function Nl(s,t,e,i){const{pos:n,box:a}=e,o=s.maxPadding;if(!G(n)){e.size&&(s[n]-=e.size);const p=i[e.stack]||{size:0,count:1};p.size=Math.max(p.size,e.horizontal?a.height:a.width),e.size=p.size/p.count,s[n]+=e.size}a.getPadding&&Ya(o,a.getPadding());const r=Math.max(0,t.outerWidth-_n(o,s,"left","right")),l=Math.max(0,t.outerHeight-_n(o,s,"top","bottom")),c=r!==s.w,d=l!==s.h;return s.w=r,s.h=l,e.horizontal?{same:c,other:d}:{same:d,other:c}}function Hl(s){const t=s.maxPadding;function e(i){const n=Math.max(t[i]-s[i],0);return s[i]+=n,n}s.y+=e("top"),s.x+=e("left"),e("right"),e("bottom")}function Vl(s,t){const e=t.maxPadding;function i(n){const a={left:0,top:0,right:0,bottom:0};return n.forEach(o=>{a[o]=Math.max(t[o],e[o])}),a}return i(s?["left","right"]:["top","bottom"])}function Fe(s,t,e,i){const n=[];let a,o,r,l,c,d;for(a=0,o=s.length,c=0;a<o;++a){r=s[a],l=r.box,l.update(r.width||t.w,r.height||t.h,Vl(r.horizontal,t));const{same:p,other:u}=Nl(t,e,r,i);c|=p&&n.length,d=d||u,l.fullSize||n.push(r)}return c&&Fe(n,t,e,i)||d}function di(s,t,e,i,n){s.top=e,s.left=t,s.right=t+i,s.bottom=e+n,s.width=i,s.height=n}function Cn(s,t,e,i){const n=e.padding;let{x:a,y:o}=t;for(const r of s){const l=r.box,c=i[r.stack]||{placed:0,weight:1},d=r.stackWeight/c.weight||1;if(r.horizontal){const p=t.w*d,u=c.size||l.height;Xe(c.start)&&(o=c.start),l.fullSize?di(l,n.left,o,e.outerWidth-n.right-n.left,u):di(l,t.left+c.placed,o,p,u),c.start=o,c.placed+=p,o=l.bottom}else{const p=t.h*d,u=c.size||l.width;Xe(c.start)&&(a=c.start),l.fullSize?di(l,a,n.top,u,e.outerHeight-n.bottom-n.top):di(l,a,t.top+c.placed,u,p),c.start=a,c.placed+=p,a=l.right}}t.x=a,t.y=o}var ft={addBox(s,t){s.boxes||(s.boxes=[]),t.fullSize=t.fullSize||!1,t.position=t.position||"top",t.weight=t.weight||0,t._layers=t._layers||function(){return[{z:0,draw(e){t.draw(e)}}]},s.boxes.push(t)},removeBox(s,t){const e=s.boxes?s.boxes.indexOf(t):-1;e!==-1&&s.boxes.splice(e,1)},configure(s,t,e){t.fullSize=e.fullSize,t.position=e.position,t.weight=e.weight},update(s,t,e,i){if(!s)return;const n=gt(s.options.layout.padding),a=Math.max(t-n.width,0),o=Math.max(e-n.height,0),r=ql(s.boxes),l=r.vertical,c=r.horizontal;K(s.boxes,f=>{typeof f.beforeLayout=="function"&&f.beforeLayout()});const d=l.reduce((f,m)=>m.box.options&&m.box.options.display===!1?f:f+1,0)||1,p=Object.freeze({outerWidth:t,outerHeight:e,padding:n,availableWidth:a,availableHeight:o,vBoxMaxWidth:a/2/d,hBoxMaxHeight:o/2}),u=Object.assign({},n);Ya(u,gt(i));const h=Object.assign({maxPadding:u,w:a,h:o,x:n.left,y:n.top},n),g=Bl(l.concat(c),p);Fe(r.fullSize,h,p,g),Fe(l,h,p,g),Fe(c,h,p,g)&&Fe(l,h,p,g),Hl(h),Cn(r.leftAndTop,h,p,g),h.x+=h.w,h.y+=h.h,Cn(r.rightAndBottom,h,p,g),s.chartArea={left:h.left,top:h.top,right:h.left+h.w,bottom:h.top+h.h,height:h.h,width:h.w},K(r.chartArea,f=>{const m=f.box;Object.assign(m,s.chartArea),m.update(h.w,h.h,{left:0,top:0,right:0,bottom:0})})}};class Ka{acquireContext(t,e){}releaseContext(t){return!1}addEventListener(t,e,i){}removeEventListener(t,e,i){}getDevicePixelRatio(){return 1}getMaximumSize(t,e,i,n){return e=Math.max(0,e||t.width),i=i||t.height,{width:e,height:Math.max(0,n?Math.floor(e/n):i)}}isAttached(t){return!0}updateConfig(t){}}class jl extends Ka{acquireContext(t){return t&&t.getContext&&t.getContext("2d")||null}updateConfig(t){t.options.animation=!1}}const Si="$chartjs",Wl={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup",pointerenter:"mouseenter",pointerdown:"mousedown",pointermove:"mousemove",pointerup:"mouseup",pointerleave:"mouseout",pointerout:"mouseout"},Tn=s=>s===null||s==="";function Ul(s,t){const e=s.style,i=s.getAttribute("height"),n=s.getAttribute("width");if(s[Si]={initial:{height:i,width:n,style:{display:e.display,height:e.height,width:e.width}}},e.display=e.display||"block",e.boxSizing=e.boxSizing||"border-box",Tn(n)){const a=cn(s,"width");a!==void 0&&(s.width=a)}if(Tn(i))if(s.style.height==="")s.height=s.width/(t||2);else{const a=cn(s,"height");a!==void 0&&(s.height=a)}return s}const Xa=Gr?{passive:!0}:!1;function Gl(s,t,e){s&&s.addEventListener(t,e,Xa)}function Yl(s,t,e){s&&s.canvas&&s.canvas.removeEventListener(t,e,Xa)}function Kl(s,t){const e=Wl[s.type]||s.type,{x:i,y:n}=ue(s,t);return{type:e,chart:t,native:s,x:i!==void 0?i:null,y:n!==void 0?n:null}}function Ii(s,t){for(const e of s)if(e===t||e.contains(t))return!0}function Xl(s,t,e){const i=s.canvas,n=new MutationObserver(a=>{let o=!1;for(const r of a)o=o||Ii(r.addedNodes,i),o=o&&!Ii(r.removedNodes,i);o&&e()});return n.observe(document,{childList:!0,subtree:!0}),n}function Zl(s,t,e){const i=s.canvas,n=new MutationObserver(a=>{let o=!1;for(const r of a)o=o||Ii(r.removedNodes,i),o=o&&!Ii(r.addedNodes,i);o&&e()});return n.observe(document,{childList:!0,subtree:!0}),n}const Je=new Map;let Mn=0;function Za(){const s=window.devicePixelRatio;s!==Mn&&(Mn=s,Je.forEach((t,e)=>{e.currentDevicePixelRatio!==s&&t()}))}function Ql(s,t){Je.size||window.addEventListener("resize",Za),Je.set(s,t)}function Jl(s){Je.delete(s),Je.size||window.removeEventListener("resize",Za)}function tc(s,t,e){const i=s.canvas,n=i&&Os(i);if(!n)return;const a=Ta((r,l)=>{const c=n.clientWidth;e(r,l),c<n.clientWidth&&e()},window),o=new ResizeObserver(r=>{const l=r[0],c=l.contentRect.width,d=l.contentRect.height;c===0&&d===0||a(c,d)});return o.observe(n),Ql(s,a),o}function Zi(s,t,e){e&&e.disconnect(),t==="resize"&&Jl(s)}function ec(s,t,e){const i=s.canvas,n=Ta(a=>{s.ctx!==null&&e(Kl(a,s))},s);return Gl(i,t,n),n}class ic extends Ka{acquireContext(t,e){const i=t&&t.getContext&&t.getContext("2d");return i&&i.canvas===t?(Ul(t,e),i):null}releaseContext(t){const e=t.canvas;if(!e[Si])return!1;const i=e[Si].initial;["height","width"].forEach(a=>{const o=i[a];U(o)?e.removeAttribute(a):e.setAttribute(a,o)});const n=i.style||{};return Object.keys(n).forEach(a=>{e.style[a]=n[a]}),e.width=e.width,delete e[Si],!0}addEventListener(t,e,i){this.removeEventListener(t,e);const n=t.$proxies||(t.$proxies={}),o={attach:Xl,detach:Zl,resize:tc}[e]||ec;n[e]=o(t,e,i)}removeEventListener(t,e){const i=t.$proxies||(t.$proxies={}),n=i[e];if(!n)return;({attach:Zi,detach:Zi,resize:Zi}[e]||Yl)(t,e,n),i[e]=void 0}getDevicePixelRatio(){return window.devicePixelRatio}getMaximumSize(t,e,i,n){return Ur(t,e,i,n)}isAttached(t){const e=t&&Os(t);return!!(e&&e.isConnected)}}function sc(s){return!Ps()||typeof OffscreenCanvas<"u"&&s instanceof OffscreenCanvas?jl:ic}class Ct{constructor(){$(this,"x");$(this,"y");$(this,"active",!1);$(this,"options");$(this,"$animations")}tooltipPosition(t){const{x:e,y:i}=this.getProps(["x","y"],t);return{x:e,y:i}}hasValue(){return ke(this.x)&&ke(this.y)}getProps(t,e){const i=this.$animations;if(!e||!i)return this;const n={};return t.forEach(a=>{n[a]=i[a]&&i[a].active()?i[a]._to:this[a]}),n}}$(Ct,"defaults",{}),$(Ct,"defaultRoutes");function nc(s,t){const e=s.options.ticks,i=ac(s),n=Math.min(e.maxTicksLimit||i,i),a=e.major.enabled?rc(t):[],o=a.length,r=a[0],l=a[o-1],c=[];if(o>n)return lc(t,c,a,o/n),c;const d=oc(a,t,n);if(o>0){let p,u;const h=o>1?Math.round((l-r)/(o-1)):null;for(pi(t,c,d,U(h)?0:r-h,r),p=0,u=o-1;p<u;p++)pi(t,c,d,a[p],a[p+1]);return pi(t,c,d,l,U(h)?t.length:l+h),c}return pi(t,c,d),c}function ac(s){const t=s.options.offset,e=s._tickSize(),i=s._length/e+(t?0:1),n=s._maxLength/e;return Math.floor(Math.min(i,n))}function oc(s,t,e){const i=cc(s),n=t.length/e;if(!i)return Math.max(n,1);const a=Ko(i);for(let o=0,r=a.length-1;o<r;o++){const l=a[o];if(l>n)return l}return Math.max(n,1)}function rc(s){const t=[];let e,i;for(e=0,i=s.length;e<i;e++)s[e].major&&t.push(e);return t}function lc(s,t,e,i){let n=0,a=e[0],o;for(i=Math.ceil(i),o=0;o<s.length;o++)o===a&&(t.push(s[o]),n++,a=e[n*i])}function pi(s,t,e,i,n){const a=H(i,0),o=Math.min(H(n,s.length),s.length);let r=0,l,c,d;for(e=Math.ceil(e),n&&(l=n-i,e=l/Math.floor(l/e)),d=a;d<0;)r++,d=Math.round(a+r*e);for(c=Math.max(a,0);c<o;c++)c===d&&(t.push(s[c]),r++,d=Math.round(a+r*e))}function cc(s){const t=s.length;let e,i;if(t<2)return!1;for(i=s[0],e=1;e<t;++e)if(s[e]-s[e-1]!==i)return!1;return i}const dc=s=>s==="left"?"right":s==="right"?"left":s,An=(s,t,e)=>t==="top"||t==="left"?s[t]+e:s[t]-e,$n=(s,t)=>Math.min(t||s,s);function Pn(s,t){const e=[],i=s.length/t,n=s.length;let a=0;for(;a<n;a+=i)e.push(s[Math.floor(a)]);return e}function pc(s,t,e){const i=s.ticks.length,n=Math.min(t,i-1),a=s._startPixel,o=s._endPixel,r=1e-6;let l=s.getPixelForTick(n),c;if(!(e&&(i===1?c=Math.max(l-a,o-l):t===0?c=(s.getPixelForTick(1)-l)/2:c=(l-s.getPixelForTick(n-1))/2,l+=n<t?c:-c,l<a-r||l>o+r)))return l}function uc(s,t){K(s,e=>{const i=e.gc,n=i.length/2;let a;if(n>t){for(a=0;a<n;++a)delete e.data[i[a]];i.splice(0,n)}})}function De(s){return s.drawTicks?s.tickLength:0}function On(s,t){if(!s.display)return 0;const e=lt(s.font,t),i=gt(s.padding);return(tt(s.text)?s.text.length:1)*e.lineHeight+i.height}function hc(s,t){return se(s,{scale:t,type:"scale"})}function fc(s,t,e){return se(s,{tick:e,index:t,type:"tick"})}function gc(s,t,e){let i=_s(s);return(e&&t!=="right"||!e&&t==="right")&&(i=dc(i)),i}function mc(s,t,e,i){const{top:n,left:a,bottom:o,right:r,chart:l}=s,{chartArea:c,scales:d}=l;let p=0,u,h,g;const f=o-n,m=r-a;if(s.isHorizontal()){if(h=ut(i,a,r),G(e)){const y=Object.keys(e)[0],v=e[y];g=d[y].getPixelForValue(v)+f-t}else e==="center"?g=(c.bottom+c.top)/2+f-t:g=An(s,e,t);u=r-a}else{if(G(e)){const y=Object.keys(e)[0],v=e[y];h=d[y].getPixelForValue(v)-m+t}else e==="center"?h=(c.left+c.right)/2-m+t:h=An(s,e,t);g=ut(i,o,n),p=e==="left"?-at:at}return{titleX:h,titleY:g,maxWidth:u,rotation:p}}class xe extends Ct{constructor(t){super(),this.id=t.id,this.type=t.type,this.options=void 0,this.ctx=t.ctx,this.chart=t.chart,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this._margins={left:0,right:0,top:0,bottom:0},this.maxWidth=void 0,this.maxHeight=void 0,this.paddingTop=void 0,this.paddingBottom=void 0,this.paddingLeft=void 0,this.paddingRight=void 0,this.axis=void 0,this.labelRotation=void 0,this.min=void 0,this.max=void 0,this._range=void 0,this.ticks=[],this._gridLineItems=null,this._labelItems=null,this._labelSizes=null,this._length=0,this._maxLength=0,this._longestTextCache={},this._startPixel=void 0,this._endPixel=void 0,this._reversePixels=!1,this._userMax=void 0,this._userMin=void 0,this._suggestedMax=void 0,this._suggestedMin=void 0,this._ticksLength=0,this._borderValue=0,this._cache={},this._dataLimitsCached=!1,this.$context=void 0}init(t){this.options=t.setContext(this.getContext()),this.axis=t.axis,this._userMin=this.parse(t.min),this._userMax=this.parse(t.max),this._suggestedMin=this.parse(t.suggestedMin),this._suggestedMax=this.parse(t.suggestedMax)}parse(t,e){return t}getUserBounds(){let{_userMin:t,_userMax:e,_suggestedMin:i,_suggestedMax:n}=this;return t=vt(t,Number.POSITIVE_INFINITY),e=vt(e,Number.NEGATIVE_INFINITY),i=vt(i,Number.POSITIVE_INFINITY),n=vt(n,Number.NEGATIVE_INFINITY),{min:vt(t,i),max:vt(e,n),minDefined:st(t),maxDefined:st(e)}}getMinMax(t){let{min:e,max:i,minDefined:n,maxDefined:a}=this.getUserBounds(),o;if(n&&a)return{min:e,max:i};const r=this.getMatchingVisibleMetas();for(let l=0,c=r.length;l<c;++l)o=r[l].controller.getMinMax(this,t),n||(e=Math.min(e,o.min)),a||(i=Math.max(i,o.max));return e=a&&e>i?i:e,i=n&&e>i?e:i,{min:vt(e,vt(i,e)),max:vt(i,vt(e,i))}}getPadding(){return{left:this.paddingLeft||0,top:this.paddingTop||0,right:this.paddingRight||0,bottom:this.paddingBottom||0}}getTicks(){return this.ticks}getLabels(){const t=this.chart.data;return this.options.labels||(this.isHorizontal()?t.xLabels:t.yLabels)||t.labels||[]}getLabelItems(t=this.chart.chartArea){return this._labelItems||(this._labelItems=this._computeLabelItems(t))}beforeLayout(){this._cache={},this._dataLimitsCached=!1}beforeUpdate(){Z(this.options.beforeUpdate,[this])}update(t,e,i){const{beginAtZero:n,grace:a,ticks:o}=this.options,r=o.sampleSize;this.beforeUpdate(),this.maxWidth=t,this.maxHeight=e,this._margins=i=Object.assign({left:0,right:0,top:0,bottom:0},i),this.ticks=null,this._labelSizes=null,this._gridLineItems=null,this._labelItems=null,this.beforeSetDimensions(),this.setDimensions(),this.afterSetDimensions(),this._maxLength=this.isHorizontal()?this.width+i.left+i.right:this.height+i.top+i.bottom,this._dataLimitsCached||(this.beforeDataLimits(),this.determineDataLimits(),this.afterDataLimits(),this._range=_r(this,a,n),this._dataLimitsCached=!0),this.beforeBuildTicks(),this.ticks=this.buildTicks()||[],this.afterBuildTicks();const l=r<this.ticks.length;this._convertTicksToLabels(l?Pn(this.ticks,r):this.ticks),this.configure(),this.beforeCalculateLabelRotation(),this.calculateLabelRotation(),this.afterCalculateLabelRotation(),o.display&&(o.autoSkip||o.source==="auto")&&(this.ticks=nc(this,this.ticks),this._labelSizes=null,this.afterAutoSkip()),l&&this._convertTicksToLabels(this.ticks),this.beforeFit(),this.fit(),this.afterFit(),this.afterUpdate()}configure(){let t=this.options.reverse,e,i;this.isHorizontal()?(e=this.left,i=this.right):(e=this.top,i=this.bottom,t=!t),this._startPixel=e,this._endPixel=i,this._reversePixels=t,this._length=i-e,this._alignToPixels=this.options.alignToPixels}afterUpdate(){Z(this.options.afterUpdate,[this])}beforeSetDimensions(){Z(this.options.beforeSetDimensions,[this])}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=0,this.right=this.width):(this.height=this.maxHeight,this.top=0,this.bottom=this.height),this.paddingLeft=0,this.paddingTop=0,this.paddingRight=0,this.paddingBottom=0}afterSetDimensions(){Z(this.options.afterSetDimensions,[this])}_callHooks(t){this.chart.notifyPlugins(t,this.getContext()),Z(this.options[t],[this])}beforeDataLimits(){this._callHooks("beforeDataLimits")}determineDataLimits(){}afterDataLimits(){this._callHooks("afterDataLimits")}beforeBuildTicks(){this._callHooks("beforeBuildTicks")}buildTicks(){return[]}afterBuildTicks(){this._callHooks("afterBuildTicks")}beforeTickToLabelConversion(){Z(this.options.beforeTickToLabelConversion,[this])}generateTickLabels(t){const e=this.options.ticks;let i,n,a;for(i=0,n=t.length;i<n;i++)a=t[i],a.label=Z(e.callback,[a.value,i,t],this)}afterTickToLabelConversion(){Z(this.options.afterTickToLabelConversion,[this])}beforeCalculateLabelRotation(){Z(this.options.beforeCalculateLabelRotation,[this])}calculateLabelRotation(){const t=this.options,e=t.ticks,i=$n(this.ticks.length,t.ticks.maxTicksLimit),n=e.minRotation||0,a=e.maxRotation;let o=n,r,l,c;if(!this._isVisible()||!e.display||n>=a||i<=1||!this.isHorizontal()){this.labelRotation=n;return}const d=this._getLabelSizes(),p=d.widest.width,u=d.highest.height,h=ct(this.chart.width-p,0,this.maxWidth);r=t.offset?this.maxWidth/i:h/(i-1),p+6>r&&(r=h/(i-(t.offset?.5:1)),l=this.maxHeight-De(t.grid)-e.padding-On(t.title,this.chart.options.font),c=Math.sqrt(p*p+u*u),o=Ss(Math.min(Math.asin(ct((d.highest.height+6)/r,-1,1)),Math.asin(ct(l/c,-1,1))-Math.asin(ct(u/c,-1,1)))),o=Math.max(n,Math.min(a,o))),this.labelRotation=o}afterCalculateLabelRotation(){Z(this.options.afterCalculateLabelRotation,[this])}afterAutoSkip(){}beforeFit(){Z(this.options.beforeFit,[this])}fit(){const t={width:0,height:0},{chart:e,options:{ticks:i,title:n,grid:a}}=this,o=this._isVisible(),r=this.isHorizontal();if(o){const l=On(n,e.options.font);if(r?(t.width=this.maxWidth,t.height=De(a)+l):(t.height=this.maxHeight,t.width=De(a)+l),i.display&&this.ticks.length){const{first:c,last:d,widest:p,highest:u}=this._getLabelSizes(),h=i.padding*2,g=kt(this.labelRotation),f=Math.cos(g),m=Math.sin(g);if(r){const y=i.mirror?0:m*p.width+f*u.height;t.height=Math.min(this.maxHeight,t.height+y+h)}else{const y=i.mirror?0:f*p.width+m*u.height;t.width=Math.min(this.maxWidth,t.width+y+h)}this._calculatePadding(c,d,m,f)}}this._handleMargins(),r?(this.width=this._length=e.width-this._margins.left-this._margins.right,this.height=t.height):(this.width=t.width,this.height=this._length=e.height-this._margins.top-this._margins.bottom)}_calculatePadding(t,e,i,n){const{ticks:{align:a,padding:o},position:r}=this.options,l=this.labelRotation!==0,c=r!=="top"&&this.axis==="x";if(this.isHorizontal()){const d=this.getPixelForTick(0)-this.left,p=this.right-this.getPixelForTick(this.ticks.length-1);let u=0,h=0;l?c?(u=n*t.width,h=i*e.height):(u=i*t.height,h=n*e.width):a==="start"?h=e.width:a==="end"?u=t.width:a!=="inner"&&(u=t.width/2,h=e.width/2),this.paddingLeft=Math.max((u-d+o)*this.width/(this.width-d),0),this.paddingRight=Math.max((h-p+o)*this.width/(this.width-p),0)}else{let d=e.height/2,p=t.height/2;a==="start"?(d=0,p=t.height):a==="end"&&(d=e.height,p=0),this.paddingTop=d+o,this.paddingBottom=p+o}}_handleMargins(){this._margins&&(this._margins.left=Math.max(this.paddingLeft,this._margins.left),this._margins.top=Math.max(this.paddingTop,this._margins.top),this._margins.right=Math.max(this.paddingRight,this._margins.right),this._margins.bottom=Math.max(this.paddingBottom,this._margins.bottom))}afterFit(){Z(this.options.afterFit,[this])}isHorizontal(){const{axis:t,position:e}=this.options;return e==="top"||e==="bottom"||t==="x"}isFullSize(){return this.options.fullSize}_convertTicksToLabels(t){this.beforeTickToLabelConversion(),this.generateTickLabels(t);let e,i;for(e=0,i=t.length;e<i;e++)U(t[e].label)&&(t.splice(e,1),i--,e--);this.afterTickToLabelConversion()}_getLabelSizes(){let t=this._labelSizes;if(!t){const e=this.options.ticks.sampleSize;let i=this.ticks;e<i.length&&(i=Pn(i,e)),this._labelSizes=t=this._computeLabelSizes(i,i.length,this.options.ticks.maxTicksLimit)}return t}_computeLabelSizes(t,e,i){const{ctx:n,_longestTextCache:a}=this,o=[],r=[],l=Math.floor(e/$n(e,i));let c=0,d=0,p,u,h,g,f,m,y,v,S,x,b;for(p=0;p<e;p+=l){if(g=t[p].label,f=this._resolveTickFontOptions(p),n.font=m=f.string,y=a[m]=a[m]||{data:{},gc:[]},v=f.lineHeight,S=x=0,!U(g)&&!tt(g))S=Pi(n,y.data,y.gc,S,g),x=v;else if(tt(g))for(u=0,h=g.length;u<h;++u)b=g[u],!U(b)&&!tt(b)&&(S=Pi(n,y.data,y.gc,S,b),x+=v);o.push(S),r.push(x),c=Math.max(S,c),d=Math.max(x,d)}uc(a,e);const _=o.indexOf(c),k=r.indexOf(d),w=C=>({width:o[C]||0,height:r[C]||0});return{first:w(0),last:w(e-1),widest:w(_),highest:w(k),widths:o,heights:r}}getLabelForValue(t){return t}getPixelForValue(t,e){return NaN}getValueForPixel(t){}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getPixelForDecimal(t){this._reversePixels&&(t=1-t);const e=this._startPixel+t*this._length;return Jo(this._alignToPixels?ce(this.chart,e,0):e)}getDecimalForPixel(t){const e=(t-this._startPixel)/this._length;return this._reversePixels?1-e:e}getBasePixel(){return this.getPixelForValue(this.getBaseValue())}getBaseValue(){const{min:t,max:e}=this;return t<0&&e<0?e:t>0&&e>0?t:0}getContext(t){const e=this.ticks||[];if(t>=0&&t<e.length){const i=e[t];return i.$context||(i.$context=fc(this.getContext(),t,i))}return this.$context||(this.$context=hc(this.chart.getContext(),this))}_tickSize(){const t=this.options.ticks,e=kt(this.labelRotation),i=Math.abs(Math.cos(e)),n=Math.abs(Math.sin(e)),a=this._getLabelSizes(),o=t.autoSkipPadding||0,r=a?a.widest.width+o:0,l=a?a.highest.height+o:0;return this.isHorizontal()?l*i>r*n?r/i:l/n:l*n<r*i?l/i:r/n}_isVisible(){const t=this.options.display;return t!=="auto"?!!t:this.getMatchingVisibleMetas().length>0}_computeGridLineItems(t){const e=this.axis,i=this.chart,n=this.options,{grid:a,position:o,border:r}=n,l=a.offset,c=this.isHorizontal(),p=this.ticks.length+(l?1:0),u=De(a),h=[],g=r.setContext(this.getContext()),f=g.display?g.width:0,m=f/2,y=function(I){return ce(i,I,f)};let v,S,x,b,_,k,w,C,A,T,P,B;if(o==="top")v=y(this.bottom),k=this.bottom-u,C=v-m,T=y(t.top)+m,B=t.bottom;else if(o==="bottom")v=y(this.top),T=t.top,B=y(t.bottom)-m,k=v+m,C=this.top+u;else if(o==="left")v=y(this.right),_=this.right-u,w=v-m,A=y(t.left)+m,P=t.right;else if(o==="right")v=y(this.left),A=t.left,P=y(t.right)-m,_=v+m,w=this.left+u;else if(e==="x"){if(o==="center")v=y((t.top+t.bottom)/2+.5);else if(G(o)){const I=Object.keys(o)[0],E=o[I];v=y(this.chart.scales[I].getPixelForValue(E))}T=t.top,B=t.bottom,k=v+m,C=k+u}else if(e==="y"){if(o==="center")v=y((t.left+t.right)/2);else if(G(o)){const I=Object.keys(o)[0],E=o[I];v=y(this.chart.scales[I].getPixelForValue(E))}_=v-m,w=_-u,A=t.left,P=t.right}const V=H(n.ticks.maxTicksLimit,p),O=Math.max(1,Math.ceil(p/V));for(S=0;S<p;S+=O){const I=this.getContext(S),E=a.setContext(I),W=r.setContext(I),N=E.lineWidth,X=E.color,it=W.dash||[],nt=W.dashOffset,rt=E.tickWidth,J=E.tickColor,dt=E.tickBorderDash||[],ot=E.tickBorderDashOffset;x=pc(this,S,l),x!==void 0&&(b=ce(i,x,N),c?_=w=A=P=b:k=C=T=B=b,h.push({tx1:_,ty1:k,tx2:w,ty2:C,x1:A,y1:T,x2:P,y2:B,width:N,color:X,borderDash:it,borderDashOffset:nt,tickWidth:rt,tickColor:J,tickBorderDash:dt,tickBorderDashOffset:ot}))}return this._ticksLength=p,this._borderValue=v,h}_computeLabelItems(t){const e=this.axis,i=this.options,{position:n,ticks:a}=i,o=this.isHorizontal(),r=this.ticks,{align:l,crossAlign:c,padding:d,mirror:p}=a,u=De(i.grid),h=u+d,g=p?-d:h,f=-kt(this.labelRotation),m=[];let y,v,S,x,b,_,k,w,C,A,T,P,B="middle";if(n==="top")_=this.bottom-g,k=this._getXAxisLabelAlignment();else if(n==="bottom")_=this.top+g,k=this._getXAxisLabelAlignment();else if(n==="left"){const O=this._getYAxisLabelAlignment(u);k=O.textAlign,b=O.x}else if(n==="right"){const O=this._getYAxisLabelAlignment(u);k=O.textAlign,b=O.x}else if(e==="x"){if(n==="center")_=(t.top+t.bottom)/2+h;else if(G(n)){const O=Object.keys(n)[0],I=n[O];_=this.chart.scales[O].getPixelForValue(I)+h}k=this._getXAxisLabelAlignment()}else if(e==="y"){if(n==="center")b=(t.left+t.right)/2-h;else if(G(n)){const O=Object.keys(n)[0],I=n[O];b=this.chart.scales[O].getPixelForValue(I)}k=this._getYAxisLabelAlignment(u).textAlign}e==="y"&&(l==="start"?B="top":l==="end"&&(B="bottom"));const V=this._getLabelSizes();for(y=0,v=r.length;y<v;++y){S=r[y],x=S.label;const O=a.setContext(this.getContext(y));w=this.getPixelForTick(y)+a.labelOffset,C=this._resolveTickFontOptions(y),A=C.lineHeight,T=tt(x)?x.length:1;const I=T/2,E=O.color,W=O.textStrokeColor,N=O.textStrokeWidth;let X=k;o?(b=w,k==="inner"&&(y===v-1?X=this.options.reverse?"left":"right":y===0?X=this.options.reverse?"right":"left":X="center"),n==="top"?c==="near"||f!==0?P=-T*A+A/2:c==="center"?P=-V.highest.height/2-I*A+A:P=-V.highest.height+A/2:c==="near"||f!==0?P=A/2:c==="center"?P=V.highest.height/2-I*A:P=V.highest.height-T*A,p&&(P*=-1),f!==0&&!O.showLabelBackdrop&&(b+=A/2*Math.sin(f))):(_=w,P=(1-T)*A/2);let it;if(O.showLabelBackdrop){const nt=gt(O.backdropPadding),rt=V.heights[y],J=V.widths[y];let dt=P-nt.top,ot=0-nt.left;switch(B){case"middle":dt-=rt/2;break;case"bottom":dt-=rt;break}switch(k){case"center":ot-=J/2;break;case"right":ot-=J;break;case"inner":y===v-1?ot-=J:y>0&&(ot-=J/2);break}it={left:ot,top:dt,width:J+nt.width,height:rt+nt.height,color:O.backdropColor}}m.push({label:x,font:C,textOffset:P,options:{rotation:f,color:E,strokeColor:W,strokeWidth:N,textAlign:X,textBaseline:B,translation:[b,_],backdrop:it}})}return m}_getXAxisLabelAlignment(){const{position:t,ticks:e}=this.options;if(-kt(this.labelRotation))return t==="top"?"left":"right";let n="center";return e.align==="start"?n="left":e.align==="end"?n="right":e.align==="inner"&&(n="inner"),n}_getYAxisLabelAlignment(t){const{position:e,ticks:{crossAlign:i,mirror:n,padding:a}}=this.options,o=this._getLabelSizes(),r=t+a,l=o.widest.width;let c,d;return e==="left"?n?(d=this.right+a,i==="near"?c="left":i==="center"?(c="center",d+=l/2):(c="right",d+=l)):(d=this.right-r,i==="near"?c="right":i==="center"?(c="center",d-=l/2):(c="left",d=this.left)):e==="right"?n?(d=this.left+a,i==="near"?c="right":i==="center"?(c="center",d-=l/2):(c="left",d-=l)):(d=this.left+r,i==="near"?c="left":i==="center"?(c="center",d+=l/2):(c="right",d=this.right)):c="right",{textAlign:c,x:d}}_computeLabelArea(){if(this.options.ticks.mirror)return;const t=this.chart,e=this.options.position;if(e==="left"||e==="right")return{top:0,left:this.left,bottom:t.height,right:this.right};if(e==="top"||e==="bottom")return{top:this.top,left:0,bottom:this.bottom,right:t.width}}drawBackground(){const{ctx:t,options:{backgroundColor:e},left:i,top:n,width:a,height:o}=this;e&&(t.save(),t.fillStyle=e,t.fillRect(i,n,a,o),t.restore())}getLineWidthForValue(t){const e=this.options.grid;if(!this._isVisible()||!e.display)return 0;const n=this.ticks.findIndex(a=>a.value===t);return n>=0?e.setContext(this.getContext(n)).lineWidth:0}drawGrid(t){const e=this.options.grid,i=this.ctx,n=this._gridLineItems||(this._gridLineItems=this._computeGridLineItems(t));let a,o;const r=(l,c,d)=>{!d.width||!d.color||(i.save(),i.lineWidth=d.width,i.strokeStyle=d.color,i.setLineDash(d.borderDash||[]),i.lineDashOffset=d.borderDashOffset,i.beginPath(),i.moveTo(l.x,l.y),i.lineTo(c.x,c.y),i.stroke(),i.restore())};if(e.display)for(a=0,o=n.length;a<o;++a){const l=n[a];e.drawOnChartArea&&r({x:l.x1,y:l.y1},{x:l.x2,y:l.y2},l),e.drawTicks&&r({x:l.tx1,y:l.ty1},{x:l.tx2,y:l.ty2},{color:l.tickColor,width:l.tickWidth,borderDash:l.tickBorderDash,borderDashOffset:l.tickBorderDashOffset})}}drawBorder(){const{chart:t,ctx:e,options:{border:i,grid:n}}=this,a=i.setContext(this.getContext()),o=i.display?a.width:0;if(!o)return;const r=n.setContext(this.getContext(0)).lineWidth,l=this._borderValue;let c,d,p,u;this.isHorizontal()?(c=ce(t,this.left,o)-o/2,d=ce(t,this.right,r)+r/2,p=u=l):(p=ce(t,this.top,o)-o/2,u=ce(t,this.bottom,r)+r/2,c=d=l),e.save(),e.lineWidth=a.width,e.strokeStyle=a.color,e.beginPath(),e.moveTo(c,p),e.lineTo(d,u),e.stroke(),e.restore()}drawLabels(t){if(!this.options.ticks.display)return;const i=this.ctx,n=this._computeLabelArea();n&&Ei(i,n);const a=this.getLabelItems(t);for(const o of a){const r=o.options,l=o.font,c=o.label,d=o.textOffset;ye(i,c,0,d,l,r)}n&&Ri(i)}drawTitle(){const{ctx:t,options:{position:e,title:i,reverse:n}}=this;if(!i.display)return;const a=lt(i.font),o=gt(i.padding),r=i.align;let l=a.lineHeight/2;e==="bottom"||e==="center"||G(e)?(l+=o.bottom,tt(i.text)&&(l+=a.lineHeight*(i.text.length-1))):l+=o.top;const{titleX:c,titleY:d,maxWidth:p,rotation:u}=mc(this,l,e,r);ye(t,i.text,0,0,a,{color:i.color,maxWidth:p,rotation:u,textAlign:gc(r,e,n),textBaseline:"middle",translation:[c,d]})}draw(t){this._isVisible()&&(this.drawBackground(),this.drawGrid(t),this.drawBorder(),this.drawTitle(),this.drawLabels(t))}_layers(){const t=this.options,e=t.ticks&&t.ticks.z||0,i=H(t.grid&&t.grid.z,-1),n=H(t.border&&t.border.z,0);return!this._isVisible()||this.draw!==xe.prototype.draw?[{z:e,draw:a=>{this.draw(a)}}]:[{z:i,draw:a=>{this.drawBackground(),this.drawGrid(a),this.drawTitle()}},{z:n,draw:()=>{this.drawBorder()}},{z:e,draw:a=>{this.drawLabels(a)}}]}getMatchingVisibleMetas(t){const e=this.chart.getSortedVisibleDatasetMetas(),i=this.axis+"AxisID",n=[];let a,o;for(a=0,o=e.length;a<o;++a){const r=e[a];r[i]===this.id&&(!t||r.type===t)&&n.push(r)}return n}_resolveTickFontOptions(t){const e=this.options.ticks.setContext(this.getContext(t));return lt(e.font)}_maxDigits(){const t=this._resolveTickFontOptions(0).lineHeight;return(this.isHorizontal()?this.width:this.height)/t}}class ui{constructor(t,e,i){this.type=t,this.scope=e,this.override=i,this.items=Object.create(null)}isForType(t){return Object.prototype.isPrototypeOf.call(this.type.prototype,t.prototype)}register(t){const e=Object.getPrototypeOf(t);let i;xc(e)&&(i=this.register(e));const n=this.items,a=t.id,o=this.scope+"."+a;if(!a)throw new Error("class does not have id: "+t);return a in n||(n[a]=t,bc(t,o,i),this.override&&et.override(t.id,t.overrides)),o}get(t){return this.items[t]}unregister(t){const e=this.items,i=t.id,n=this.scope;i in e&&delete e[i],n&&i in et[n]&&(delete et[n][i],this.override&&delete be[i])}}function bc(s,t,e){const i=Ke(Object.create(null),[e?et.get(e):{},et.get(t),s.defaults]);et.set(t,i),s.defaultRoutes&&yc(t,s.defaultRoutes),s.descriptors&&et.describe(t,s.descriptors)}function yc(s,t){Object.keys(t).forEach(e=>{const i=e.split("."),n=i.pop(),a=[s].concat(i).join("."),o=t[e].split("."),r=o.pop(),l=o.join(".");et.route(a,n,l,r)})}function xc(s){return"id"in s&&"defaults"in s}class vc{constructor(){this.controllers=new ui(_t,"datasets",!0),this.elements=new ui(Ct,"elements"),this.plugins=new ui(Object,"plugins"),this.scales=new ui(xe,"scales"),this._typedRegistries=[this.controllers,this.scales,this.elements]}add(...t){this._each("register",t)}remove(...t){this._each("unregister",t)}addControllers(...t){this._each("register",t,this.controllers)}addElements(...t){this._each("register",t,this.elements)}addPlugins(...t){this._each("register",t,this.plugins)}addScales(...t){this._each("register",t,this.scales)}getController(t){return this._get(t,this.controllers,"controller")}getElement(t){return this._get(t,this.elements,"element")}getPlugin(t){return this._get(t,this.plugins,"plugin")}getScale(t){return this._get(t,this.scales,"scale")}removeControllers(...t){this._each("unregister",t,this.controllers)}removeElements(...t){this._each("unregister",t,this.elements)}removePlugins(...t){this._each("unregister",t,this.plugins)}removeScales(...t){this._each("unregister",t,this.scales)}_each(t,e,i){[...e].forEach(n=>{const a=i||this._getRegistryForType(n);i||a.isForType(n)||a===this.plugins&&n.id?this._exec(t,a,n):K(n,o=>{const r=i||this._getRegistryForType(o);this._exec(t,r,o)})})}_exec(t,e,i){const n=ws(t);Z(i["before"+n],[],i),e[t](i),Z(i["after"+n],[],i)}_getRegistryForType(t){for(let e=0;e<this._typedRegistries.length;e++){const i=this._typedRegistries[e];if(i.isForType(t))return i}return this.plugins}_get(t,e,i){const n=e.get(t);if(n===void 0)throw new Error('"'+t+'" is not a registered '+i+".");return n}}var Pt=new vc;class wc{constructor(){this._init=void 0}notify(t,e,i,n){if(e==="beforeInit"&&(this._init=this._createDescriptors(t,!0),this._notify(this._init,t,"install")),this._init===void 0)return;const a=n?this._descriptors(t).filter(n):this._descriptors(t),o=this._notify(a,t,e,i);return e==="afterDestroy"&&(this._notify(a,t,"stop"),this._notify(this._init,t,"uninstall"),this._init=void 0),o}_notify(t,e,i,n){n=n||{};for(const a of t){const o=a.plugin,r=o[i],l=[e,n,a.options];if(Z(r,l,o)===!1&&n.cancelable)return!1}return!0}invalidate(){U(this._cache)||(this._oldCache=this._cache,this._cache=void 0)}_descriptors(t){if(this._cache)return this._cache;const e=this._cache=this._createDescriptors(t);return this._notifyStateChanges(t),e}_createDescriptors(t,e){const i=t&&t.config,n=H(i.options&&i.options.plugins,{}),a=Sc(i);return n===!1&&!e?[]:_c(t,a,n,e)}_notifyStateChanges(t){const e=this._oldCache||[],i=this._cache,n=(a,o)=>a.filter(r=>!o.some(l=>r.plugin.id===l.plugin.id));this._notify(n(e,i),t,"stop"),this._notify(n(i,e),t,"start")}}function Sc(s){const t={},e=[],i=Object.keys(Pt.plugins.items);for(let a=0;a<i.length;a++)e.push(Pt.getPlugin(i[a]));const n=s.plugins||[];for(let a=0;a<n.length;a++){const o=n[a];e.indexOf(o)===-1&&(e.push(o),t[o.id]=!0)}return{plugins:e,localIds:t}}function kc(s,t){return!t&&s===!1?null:s===!0?{}:s}function _c(s,{plugins:t,localIds:e},i,n){const a=[],o=s.getContext();for(const r of t){const l=r.id,c=kc(i[l],n);c!==null&&a.push({plugin:r,options:Cc(s.config,{plugin:r,local:e[l]},c,o)})}return a}function Cc(s,{plugin:t,local:e},i,n){const a=s.pluginScopeKeys(t),o=s.getOptionScopes(i,a);return e&&t.defaults&&o.push(t.defaults),s.createResolver(o,n,[""],{scriptable:!1,indexable:!1,allKeys:!0})}function rs(s,t){const e=et.datasets[s]||{};return((t.datasets||{})[s]||{}).indexAxis||t.indexAxis||e.indexAxis||"x"}function Tc(s,t){let e=s;return s==="_index_"?e=t:s==="_value_"&&(e=t==="x"?"y":"x"),e}function Mc(s,t){return s===t?"_index_":"_value_"}function In(s){if(s==="x"||s==="y"||s==="r")return s}function Ac(s){if(s==="top"||s==="bottom")return"x";if(s==="left"||s==="right")return"y"}function ls(s,...t){if(In(s))return s;for(const e of t){const i=e.axis||Ac(e.position)||s.length>1&&In(s[0].toLowerCase());if(i)return i}throw new Error(`Cannot determine type of '${s}' axis. Please provide 'axis' or 'position' option.`)}function zn(s,t,e){if(e[t+"AxisID"]===s)return{axis:t}}function $c(s,t){if(t.data&&t.data.datasets){const e=t.data.datasets.filter(i=>i.xAxisID===s||i.yAxisID===s);if(e.length)return zn(s,"x",e[0])||zn(s,"y",e[0])}return{}}function Pc(s,t){const e=be[s.type]||{scales:{}},i=t.scales||{},n=rs(s.type,t),a=Object.create(null);return Object.keys(i).forEach(o=>{const r=i[o];if(!G(r))return console.error(`Invalid scale configuration for scale: ${o}`);if(r._proxy)return console.warn(`Ignoring resolver passed as options for scale: ${o}`);const l=ls(o,r,$c(o,s),et.scales[r.type]),c=Mc(l,n),d=e.scales||{};a[o]=Ve(Object.create(null),[{axis:l},r,d[l],d[c]])}),s.data.datasets.forEach(o=>{const r=o.type||s.type,l=o.indexAxis||rs(r,t),d=(be[r]||{}).scales||{};Object.keys(d).forEach(p=>{const u=Tc(p,l),h=o[u+"AxisID"]||u;a[h]=a[h]||Object.create(null),Ve(a[h],[{axis:u},i[h],d[p]])})}),Object.keys(a).forEach(o=>{const r=a[o];Ve(r,[et.scales[r.type],et.scale])}),a}function Qa(s){const t=s.options||(s.options={});t.plugins=H(t.plugins,{}),t.scales=Pc(s,t)}function Ja(s){return s=s||{},s.datasets=s.datasets||[],s.labels=s.labels||[],s}function Oc(s){return s=s||{},s.data=Ja(s.data),Qa(s),s}const Dn=new Map,to=new Set;function hi(s,t){let e=Dn.get(s);return e||(e=t(),Dn.set(s,e),to.add(e)),e}const Le=(s,t,e)=>{const i=ee(t,e);i!==void 0&&s.add(i)};class Ic{constructor(t){this._config=Oc(t),this._scopeCache=new Map,this._resolverCache=new Map}get platform(){return this._config.platform}get type(){return this._config.type}set type(t){this._config.type=t}get data(){return this._config.data}set data(t){this._config.data=Ja(t)}get options(){return this._config.options}set options(t){this._config.options=t}get plugins(){return this._config.plugins}update(){const t=this._config;this.clearCache(),Qa(t)}clearCache(){this._scopeCache.clear(),this._resolverCache.clear()}datasetScopeKeys(t){return hi(t,()=>[[`datasets.${t}`,""]])}datasetAnimationScopeKeys(t,e){return hi(`${t}.transition.${e}`,()=>[[`datasets.${t}.transitions.${e}`,`transitions.${e}`],[`datasets.${t}`,""]])}datasetElementScopeKeys(t,e){return hi(`${t}-${e}`,()=>[[`datasets.${t}.elements.${e}`,`datasets.${t}`,`elements.${e}`,""]])}pluginScopeKeys(t){const e=t.id,i=this.type;return hi(`${i}-plugin-${e}`,()=>[[`plugins.${e}`,...t.additionalOptionScopes||[]]])}_cachedScopes(t,e){const i=this._scopeCache;let n=i.get(t);return(!n||e)&&(n=new Map,i.set(t,n)),n}getOptionScopes(t,e,i){const{options:n,type:a}=this,o=this._cachedScopes(t,i),r=o.get(e);if(r)return r;const l=new Set;e.forEach(d=>{t&&(l.add(t),d.forEach(p=>Le(l,t,p))),d.forEach(p=>Le(l,n,p)),d.forEach(p=>Le(l,be[a]||{},p)),d.forEach(p=>Le(l,et,p)),d.forEach(p=>Le(l,ns,p))});const c=Array.from(l);return c.length===0&&c.push(Object.create(null)),to.has(e)&&o.set(e,c),c}chartOptionScopes(){const{options:t,type:e}=this;return[t,be[e]||{},et.datasets[e]||{},{type:e},et,ns]}resolveNamedOptions(t,e,i,n=[""]){const a={$shared:!0},{resolver:o,subPrefixes:r}=Ln(this._resolverCache,t,n);let l=o;if(Dc(o,e)){a.$shared=!1,i=ie(i)?i():i;const c=this.createResolver(t,i,r);l=_e(o,i,c)}for(const c of e)a[c]=l[c];return a}createResolver(t,e,i=[""],n){const{resolver:a}=Ln(this._resolverCache,t,i);return G(e)?_e(a,e,void 0,n):a}}function Ln(s,t,e){let i=s.get(t);i||(i=new Map,s.set(t,i));const n=e.join();let a=i.get(n);return a||(a={resolver:Ms(t,e),subPrefixes:e.filter(r=>!r.toLowerCase().includes("hover"))},i.set(n,a)),a}const zc=s=>G(s)&&Object.getOwnPropertyNames(s).some(t=>ie(s[t]));function Dc(s,t){const{isScriptable:e,isIndexable:i}=Ia(s);for(const n of t){const a=e(n),o=i(n),r=(o||a)&&s[n];if(a&&(ie(r)||zc(r))||o&&tt(r))return!0}return!1}var Lc="4.5.1";const Ec=["top","bottom","left","right","chartArea"];function En(s,t){return s==="top"||s==="bottom"||Ec.indexOf(s)===-1&&t==="x"}function Rn(s,t){return function(e,i){return e[s]===i[s]?e[t]-i[t]:e[s]-i[s]}}function Fn(s){const t=s.chart,e=t.options.animation;t.notifyPlugins("afterRender"),Z(e&&e.onComplete,[s],t)}function Rc(s){const t=s.chart,e=t.options.animation;Z(e&&e.onProgress,[s],t)}function eo(s){return Ps()&&typeof s=="string"?s=document.getElementById(s):s&&s.length&&(s=s[0]),s&&s.canvas&&(s=s.canvas),s}const ki={},Bn=s=>{const t=eo(s);return Object.values(ki).filter(e=>e.canvas===t).pop()};function Fc(s,t,e){const i=Object.keys(s);for(const n of i){const a=+n;if(a>=t){const o=s[n];delete s[n],(e>0||a>t)&&(s[a+e]=o)}}}function Bc(s,t,e,i){return!e||s.type==="mouseout"?null:i?t:s}class Ft{static register(...t){Pt.add(...t),qn()}static unregister(...t){Pt.remove(...t),qn()}constructor(t,e){const i=this.config=new Ic(e),n=eo(t),a=Bn(n);if(a)throw new Error("Canvas is already in use. Chart with ID '"+a.id+"' must be destroyed before the canvas with ID '"+a.canvas.id+"' can be reused.");const o=i.createResolver(i.chartOptionScopes(),this.getContext());this.platform=new(i.platform||sc(n)),this.platform.updateConfig(i);const r=this.platform.acquireContext(n,o.aspectRatio),l=r&&r.canvas,c=l&&l.height,d=l&&l.width;if(this.id=qo(),this.ctx=r,this.canvas=l,this.width=d,this.height=c,this._options=o,this._aspectRatio=this.aspectRatio,this._layers=[],this._metasets=[],this._stacks=void 0,this.boxes=[],this.currentDevicePixelRatio=void 0,this.chartArea=void 0,this._active=[],this._lastEvent=void 0,this._listeners={},this._responsiveListeners=void 0,this._sortedMetasets=[],this.scales={},this._plugins=new wc,this.$proxies={},this._hiddenIndices={},this.attached=!1,this._animationsDisabled=void 0,this.$context=void 0,this._doResize=sr(p=>this.update(p),o.resizeDelay||0),this._dataChanges=[],ki[this.id]=this,!r||!l){console.error("Failed to create chart: can't acquire context from the given item");return}Lt.listen(this,"complete",Fn),Lt.listen(this,"progress",Rc),this._initialize(),this.attached&&this.update()}get aspectRatio(){const{options:{aspectRatio:t,maintainAspectRatio:e},width:i,height:n,_aspectRatio:a}=this;return U(t)?e&&a?a:n?i/n:null:t}get data(){return this.config.data}set data(t){this.config.data=t}get options(){return this._options}set options(t){this.config.options=t}get registry(){return Pt}_initialize(){return this.notifyPlugins("beforeInit"),this.options.responsive?this.resize():ln(this,this.options.devicePixelRatio),this.bindEvents(),this.notifyPlugins("afterInit"),this}clear(){return an(this.canvas,this.ctx),this}stop(){return Lt.stop(this),this}resize(t,e){Lt.running(this)?this._resizeBeforeDraw={width:t,height:e}:this._resize(t,e)}_resize(t,e){const i=this.options,n=this.canvas,a=i.maintainAspectRatio&&this.aspectRatio,o=this.platform.getMaximumSize(n,t,e,a),r=i.devicePixelRatio||this.platform.getDevicePixelRatio(),l=this.width?"resize":"attach";this.width=o.width,this.height=o.height,this._aspectRatio=this.aspectRatio,ln(this,r,!0)&&(this.notifyPlugins("resize",{size:o}),Z(i.onResize,[this,o],this),this.attached&&this._doResize(l)&&this.render())}ensureScalesHaveIDs(){const e=this.options.scales||{};K(e,(i,n)=>{i.id=n})}buildOrUpdateScales(){const t=this.options,e=t.scales,i=this.scales,n=Object.keys(i).reduce((o,r)=>(o[r]=!1,o),{});let a=[];e&&(a=a.concat(Object.keys(e).map(o=>{const r=e[o],l=ls(o,r),c=l==="r",d=l==="x";return{options:r,dposition:c?"chartArea":d?"bottom":"left",dtype:c?"radialLinear":d?"category":"linear"}}))),K(a,o=>{const r=o.options,l=r.id,c=ls(l,r),d=H(r.type,o.dtype);(r.position===void 0||En(r.position,c)!==En(o.dposition))&&(r.position=o.dposition),n[l]=!0;let p=null;if(l in i&&i[l].type===d)p=i[l];else{const u=Pt.getScale(d);p=new u({id:l,type:d,ctx:this.ctx,chart:this}),i[p.id]=p}p.init(r,t)}),K(n,(o,r)=>{o||delete i[r]}),K(i,o=>{ft.configure(this,o,o.options),ft.addBox(this,o)})}_updateMetasets(){const t=this._metasets,e=this.data.datasets.length,i=t.length;if(t.sort((n,a)=>n.index-a.index),i>e){for(let n=e;n<i;++n)this._destroyDatasetMeta(n);t.splice(e,i-e)}this._sortedMetasets=t.slice(0).sort(Rn("order","index"))}_removeUnreferencedMetasets(){const{_metasets:t,data:{datasets:e}}=this;t.length>e.length&&delete this._stacks,t.forEach((i,n)=>{e.filter(a=>a===i._dataset).length===0&&this._destroyDatasetMeta(n)})}buildOrUpdateControllers(){const t=[],e=this.data.datasets;let i,n;for(this._removeUnreferencedMetasets(),i=0,n=e.length;i<n;i++){const a=e[i];let o=this.getDatasetMeta(i);const r=a.type||this.config.type;if(o.type&&o.type!==r&&(this._destroyDatasetMeta(i),o=this.getDatasetMeta(i)),o.type=r,o.indexAxis=a.indexAxis||rs(r,this.options),o.order=a.order||0,o.index=i,o.label=""+a.label,o.visible=this.isDatasetVisible(i),o.controller)o.controller.updateIndex(i),o.controller.linkScales();else{const l=Pt.getController(r),{datasetElementType:c,dataElementType:d}=et.datasets[r];Object.assign(l,{dataElementType:Pt.getElement(d),datasetElementType:c&&Pt.getElement(c)}),o.controller=new l(this,i),t.push(o.controller)}}return this._updateMetasets(),t}_resetElements(){K(this.data.datasets,(t,e)=>{this.getDatasetMeta(e).controller.reset()},this)}reset(){this._resetElements(),this.notifyPlugins("reset")}update(t){const e=this.config;e.update();const i=this._options=e.createResolver(e.chartOptionScopes(),this.getContext()),n=this._animationsDisabled=!i.animation;if(this._updateScales(),this._checkEventBindings(),this._updateHiddenIndices(),this._plugins.invalidate(),this.notifyPlugins("beforeUpdate",{mode:t,cancelable:!0})===!1)return;const a=this.buildOrUpdateControllers();this.notifyPlugins("beforeElementsUpdate");let o=0;for(let c=0,d=this.data.datasets.length;c<d;c++){const{controller:p}=this.getDatasetMeta(c),u=!n&&a.indexOf(p)===-1;p.buildOrUpdateElements(u),o=Math.max(+p.getMaxOverflow(),o)}o=this._minPadding=i.layout.autoPadding?o:0,this._updateLayout(o),n||K(a,c=>{c.reset()}),this._updateDatasets(t),this.notifyPlugins("afterUpdate",{mode:t}),this._layers.sort(Rn("z","_idx"));const{_active:r,_lastEvent:l}=this;l?this._eventHandler(l,!0):r.length&&this._updateHoverStyles(r,r,!0),this.render()}_updateScales(){K(this.scales,t=>{ft.removeBox(this,t)}),this.ensureScalesHaveIDs(),this.buildOrUpdateScales()}_checkEventBindings(){const t=this.options,e=new Set(Object.keys(this._listeners)),i=new Set(t.events);(!Ks(e,i)||!!this._responsiveListeners!==t.responsive)&&(this.unbindEvents(),this.bindEvents())}_updateHiddenIndices(){const{_hiddenIndices:t}=this,e=this._getUniformDataChanges()||[];for(const{method:i,start:n,count:a}of e){const o=i==="_removeElements"?-a:a;Fc(t,n,o)}}_getUniformDataChanges(){const t=this._dataChanges;if(!t||!t.length)return;this._dataChanges=[];const e=this.data.datasets.length,i=a=>new Set(t.filter(o=>o[0]===a).map((o,r)=>r+","+o.splice(1).join(","))),n=i(0);for(let a=1;a<e;a++)if(!Ks(n,i(a)))return;return Array.from(n).map(a=>a.split(",")).map(a=>({method:a[1],start:+a[2],count:+a[3]}))}_updateLayout(t){if(this.notifyPlugins("beforeLayout",{cancelable:!0})===!1)return;ft.update(this,this.width,this.height,t);const e=this.chartArea,i=e.width<=0||e.height<=0;this._layers=[],K(this.boxes,n=>{i&&n.position==="chartArea"||(n.configure&&n.configure(),this._layers.push(...n._layers()))},this),this._layers.forEach((n,a)=>{n._idx=a}),this.notifyPlugins("afterLayout")}_updateDatasets(t){if(this.notifyPlugins("beforeDatasetsUpdate",{mode:t,cancelable:!0})!==!1){for(let e=0,i=this.data.datasets.length;e<i;++e)this.getDatasetMeta(e).controller.configure();for(let e=0,i=this.data.datasets.length;e<i;++e)this._updateDataset(e,ie(t)?t({datasetIndex:e}):t);this.notifyPlugins("afterDatasetsUpdate",{mode:t})}}_updateDataset(t,e){const i=this.getDatasetMeta(t),n={meta:i,index:t,mode:e,cancelable:!0};this.notifyPlugins("beforeDatasetUpdate",n)!==!1&&(i.controller._update(e),n.cancelable=!1,this.notifyPlugins("afterDatasetUpdate",n))}render(){this.notifyPlugins("beforeRender",{cancelable:!0})!==!1&&(Lt.has(this)?this.attached&&!Lt.running(this)&&Lt.start(this):(this.draw(),Fn({chart:this})))}draw(){let t;if(this._resizeBeforeDraw){const{width:i,height:n}=this._resizeBeforeDraw;this._resizeBeforeDraw=null,this._resize(i,n)}if(this.clear(),this.width<=0||this.height<=0||this.notifyPlugins("beforeDraw",{cancelable:!0})===!1)return;const e=this._layers;for(t=0;t<e.length&&e[t].z<=0;++t)e[t].draw(this.chartArea);for(this._drawDatasets();t<e.length;++t)e[t].draw(this.chartArea);this.notifyPlugins("afterDraw")}_getSortedDatasetMetas(t){const e=this._sortedMetasets,i=[];let n,a;for(n=0,a=e.length;n<a;++n){const o=e[n];(!t||o.visible)&&i.push(o)}return i}getSortedVisibleDatasetMetas(){return this._getSortedDatasetMetas(!0)}_drawDatasets(){if(this.notifyPlugins("beforeDatasetsDraw",{cancelable:!0})===!1)return;const t=this.getSortedVisibleDatasetMetas();for(let e=t.length-1;e>=0;--e)this._drawDataset(t[e]);this.notifyPlugins("afterDatasetsDraw")}_drawDataset(t){const e=this.ctx,i={meta:t,index:t.index,cancelable:!0},n=Va(this,t);this.notifyPlugins("beforeDatasetDraw",i)!==!1&&(n&&Ei(e,n),t.controller.draw(),n&&Ri(e),i.cancelable=!1,this.notifyPlugins("afterDatasetDraw",i))}isPointInArea(t){return Ht(t,this.chartArea,this._minPadding)}getElementsAtEventForMode(t,e,i,n){const a=El.modes[e];return typeof a=="function"?a(this,t,i,n):[]}getDatasetMeta(t){const e=this.data.datasets[t],i=this._metasets;let n=i.filter(a=>a&&a._dataset===e).pop();return n||(n={type:null,data:[],dataset:null,controller:null,hidden:null,xAxisID:null,yAxisID:null,order:e&&e.order||0,index:t,_dataset:e,_parsed:[],_sorted:!1},i.push(n)),n}getContext(){return this.$context||(this.$context=se(null,{chart:this,type:"chart"}))}getVisibleDatasetCount(){return this.getSortedVisibleDatasetMetas().length}isDatasetVisible(t){const e=this.data.datasets[t];if(!e)return!1;const i=this.getDatasetMeta(t);return typeof i.hidden=="boolean"?!i.hidden:!e.hidden}setDatasetVisibility(t,e){const i=this.getDatasetMeta(t);i.hidden=!e}toggleDataVisibility(t){this._hiddenIndices[t]=!this._hiddenIndices[t]}getDataVisibility(t){return!this._hiddenIndices[t]}_updateVisibility(t,e,i){const n=i?"show":"hide",a=this.getDatasetMeta(t),o=a.controller._resolveAnimations(void 0,n);Xe(e)?(a.data[e].hidden=!i,this.update()):(this.setDatasetVisibility(t,i),o.update(a,{visible:i}),this.update(r=>r.datasetIndex===t?n:void 0))}hide(t,e){this._updateVisibility(t,e,!1)}show(t,e){this._updateVisibility(t,e,!0)}_destroyDatasetMeta(t){const e=this._metasets[t];e&&e.controller&&e.controller._destroy(),delete this._metasets[t]}_stop(){let t,e;for(this.stop(),Lt.remove(this),t=0,e=this.data.datasets.length;t<e;++t)this._destroyDatasetMeta(t)}destroy(){this.notifyPlugins("beforeDestroy");const{canvas:t,ctx:e}=this;this._stop(),this.config.clearCache(),t&&(this.unbindEvents(),an(t,e),this.platform.releaseContext(e),this.canvas=null,this.ctx=null),delete ki[this.id],this.notifyPlugins("afterDestroy")}toBase64Image(...t){return this.canvas.toDataURL(...t)}bindEvents(){this.bindUserEvents(),this.options.responsive?this.bindResponsiveEvents():this.attached=!0}bindUserEvents(){const t=this._listeners,e=this.platform,i=(a,o)=>{e.addEventListener(this,a,o),t[a]=o},n=(a,o,r)=>{a.offsetX=o,a.offsetY=r,this._eventHandler(a)};K(this.options.events,a=>i(a,n))}bindResponsiveEvents(){this._responsiveListeners||(this._responsiveListeners={});const t=this._responsiveListeners,e=this.platform,i=(l,c)=>{e.addEventListener(this,l,c),t[l]=c},n=(l,c)=>{t[l]&&(e.removeEventListener(this,l,c),delete t[l])},a=(l,c)=>{this.canvas&&this.resize(l,c)};let o;const r=()=>{n("attach",r),this.attached=!0,this.resize(),i("resize",a),i("detach",o)};o=()=>{this.attached=!1,n("resize",a),this._stop(),this._resize(0,0),i("attach",r)},e.isAttached(this.canvas)?r():o()}unbindEvents(){K(this._listeners,(t,e)=>{this.platform.removeEventListener(this,e,t)}),this._listeners={},K(this._responsiveListeners,(t,e)=>{this.platform.removeEventListener(this,e,t)}),this._responsiveListeners=void 0}updateHoverStyle(t,e,i){const n=i?"set":"remove";let a,o,r,l;for(e==="dataset"&&(a=this.getDatasetMeta(t[0].datasetIndex),a.controller["_"+n+"DatasetHoverStyle"]()),r=0,l=t.length;r<l;++r){o=t[r];const c=o&&this.getDatasetMeta(o.datasetIndex).controller;c&&c[n+"HoverStyle"](o.element,o.datasetIndex,o.index)}}getActiveElements(){return this._active||[]}setActiveElements(t){const e=this._active||[],i=t.map(({datasetIndex:a,index:o})=>{const r=this.getDatasetMeta(a);if(!r)throw new Error("No dataset found at index "+a);return{datasetIndex:a,element:r.data[o],index:o}});!Mi(i,e)&&(this._active=i,this._lastEvent=null,this._updateHoverStyles(i,e))}notifyPlugins(t,e,i){return this._plugins.notify(this,t,e,i)}isPluginEnabled(t){return this._plugins._cache.filter(e=>e.plugin.id===t).length===1}_updateHoverStyles(t,e,i){const n=this.options.hover,a=(l,c)=>l.filter(d=>!c.some(p=>d.datasetIndex===p.datasetIndex&&d.index===p.index)),o=a(e,t),r=i?t:a(t,e);o.length&&this.updateHoverStyle(o,n.mode,!1),r.length&&n.mode&&this.updateHoverStyle(r,n.mode,!0)}_eventHandler(t,e){const i={event:t,replay:e,cancelable:!0,inChartArea:this.isPointInArea(t)},n=o=>(o.options.events||this.options.events).includes(t.native.type);if(this.notifyPlugins("beforeEvent",i,n)===!1)return;const a=this._handleEvent(t,e,i.inChartArea);return i.cancelable=!1,this.notifyPlugins("afterEvent",i,n),(a||i.changed)&&this.render(),this}_handleEvent(t,e,i){const{_active:n=[],options:a}=this,o=e,r=this._getActiveElements(t,n,i,o),l=Uo(t),c=Bc(t,this._lastEvent,i,l);i&&(this._lastEvent=null,Z(a.onHover,[t,r,this],this),l&&Z(a.onClick,[t,r,this],this));const d=!Mi(r,n);return(d||e)&&(this._active=r,this._updateHoverStyles(r,n,e)),this._lastEvent=c,d}_getActiveElements(t,e,i,n){if(t.type==="mouseout")return[];if(!i)return e;const a=this.options.hover;return this.getElementsAtEventForMode(t,a.mode,a,n)}}$(Ft,"defaults",et),$(Ft,"instances",ki),$(Ft,"overrides",be),$(Ft,"registry",Pt),$(Ft,"version",Lc),$(Ft,"getChart",Bn);function qn(){return K(Ft.instances,s=>s._plugins.invalidate())}function qc(s,t,e){const{startAngle:i,x:n,y:a,outerRadius:o,innerRadius:r,options:l}=t,{borderWidth:c,borderJoinStyle:d}=l,p=Math.min(c/o,ht(i-e));if(s.beginPath(),s.arc(n,a,o-c/2,i+p/2,e-p/2),r>0){const u=Math.min(c/r,ht(i-e));s.arc(n,a,r+c/2,e-u/2,i+u/2,!0)}else{const u=Math.min(c/2,o*ht(i-e));if(d==="round")s.arc(n,a,u,e-Y/2,i+Y/2,!0);else if(d==="bevel"){const h=2*u*u,g=-h*Math.cos(e+Y/2)+n,f=-h*Math.sin(e+Y/2)+a,m=h*Math.cos(i+Y/2)+n,y=h*Math.sin(i+Y/2)+a;s.lineTo(g,f),s.lineTo(m,y)}}s.closePath(),s.moveTo(0,0),s.rect(0,0,s.canvas.width,s.canvas.height),s.clip("evenodd")}function Nc(s,t,e){const{startAngle:i,pixelMargin:n,x:a,y:o,outerRadius:r,innerRadius:l}=t;let c=n/r;s.beginPath(),s.arc(a,o,r,i-c,e+c),l>n?(c=n/l,s.arc(a,o,l,e+c,i-c,!0)):s.arc(a,o,n,e+at,i-at),s.closePath(),s.clip()}function Hc(s){return Ts(s,["outerStart","outerEnd","innerStart","innerEnd"])}function Vc(s,t,e,i){const n=Hc(s.options.borderRadius),a=(e-t)/2,o=Math.min(a,i*t/2),r=l=>{const c=(e-Math.min(a,l))*i/2;return ct(l,0,Math.min(a,c))};return{outerStart:r(n.outerStart),outerEnd:r(n.outerEnd),innerStart:ct(n.innerStart,0,o),innerEnd:ct(n.innerEnd,0,o)}}function we(s,t,e,i){return{x:e+s*Math.cos(t),y:i+s*Math.sin(t)}}function zi(s,t,e,i,n,a){const{x:o,y:r,startAngle:l,pixelMargin:c,innerRadius:d}=t,p=Math.max(t.outerRadius+i+e-c,0),u=d>0?d+i+e+c:0;let h=0;const g=n-l;if(i){const O=d>0?d-i:0,I=p>0?p-i:0,E=(O+I)/2,W=E!==0?g*E/(E+i):g;h=(g-W)/2}const f=Math.max(.001,g*p-e/Y)/p,m=(g-f)/2,y=l+m+h,v=n-m-h,{outerStart:S,outerEnd:x,innerStart:b,innerEnd:_}=Vc(t,u,p,v-y),k=p-S,w=p-x,C=y+S/k,A=v-x/w,T=u+b,P=u+_,B=y+b/T,V=v-_/P;if(s.beginPath(),a){const O=(C+A)/2;if(s.arc(o,r,p,C,O),s.arc(o,r,p,O,A),x>0){const N=we(w,A,o,r);s.arc(N.x,N.y,x,A,v+at)}const I=we(P,v,o,r);if(s.lineTo(I.x,I.y),_>0){const N=we(P,V,o,r);s.arc(N.x,N.y,_,v+at,V+Math.PI)}const E=(v-_/u+(y+b/u))/2;if(s.arc(o,r,u,v-_/u,E,!0),s.arc(o,r,u,E,y+b/u,!0),b>0){const N=we(T,B,o,r);s.arc(N.x,N.y,b,B+Math.PI,y-at)}const W=we(k,y,o,r);if(s.lineTo(W.x,W.y),S>0){const N=we(k,C,o,r);s.arc(N.x,N.y,S,y-at,C)}}else{s.moveTo(o,r);const O=Math.cos(C)*p+o,I=Math.sin(C)*p+r;s.lineTo(O,I);const E=Math.cos(A)*p+o,W=Math.sin(A)*p+r;s.lineTo(E,W)}s.closePath()}function jc(s,t,e,i,n){const{fullCircles:a,startAngle:o,circumference:r}=t;let l=t.endAngle;if(a){zi(s,t,e,i,l,n);for(let c=0;c<a;++c)s.fill();isNaN(r)||(l=o+(r%Q||Q))}return zi(s,t,e,i,l,n),s.fill(),l}function Wc(s,t,e,i,n){const{fullCircles:a,startAngle:o,circumference:r,options:l}=t,{borderWidth:c,borderJoinStyle:d,borderDash:p,borderDashOffset:u,borderRadius:h}=l,g=l.borderAlign==="inner";if(!c)return;s.setLineDash(p||[]),s.lineDashOffset=u,g?(s.lineWidth=c*2,s.lineJoin=d||"round"):(s.lineWidth=c,s.lineJoin=d||"bevel");let f=t.endAngle;if(a){zi(s,t,e,i,f,n);for(let m=0;m<a;++m)s.stroke();isNaN(r)||(f=o+(r%Q||Q))}g&&Nc(s,t,f),l.selfJoin&&f-o>=Y&&h===0&&d!=="miter"&&qc(s,t,f),a||(zi(s,t,e,i,f,n),s.stroke())}class Be extends Ct{constructor(e){super();$(this,"circumference");$(this,"endAngle");$(this,"fullCircles");$(this,"innerRadius");$(this,"outerRadius");$(this,"pixelMargin");$(this,"startAngle");this.options=void 0,this.circumference=void 0,this.startAngle=void 0,this.endAngle=void 0,this.innerRadius=void 0,this.outerRadius=void 0,this.pixelMargin=0,this.fullCircles=0,e&&Object.assign(this,e)}inRange(e,i,n){const a=this.getProps(["x","y"],n),{angle:o,distance:r}=Sa(a,{x:e,y:i}),{startAngle:l,endAngle:c,innerRadius:d,outerRadius:p,circumference:u}=this.getProps(["startAngle","endAngle","innerRadius","outerRadius","circumference"],n),h=(this.options.spacing+this.options.borderWidth)/2,g=H(u,c-l),f=Ze(o,l,c)&&l!==c,m=g>=Q||f,y=qt(r,d+h,p+h);return m&&y}getCenterPoint(e){const{x:i,y:n,startAngle:a,endAngle:o,innerRadius:r,outerRadius:l}=this.getProps(["x","y","startAngle","endAngle","innerRadius","outerRadius"],e),{offset:c,spacing:d}=this.options,p=(a+o)/2,u=(r+l+d+c)/2;return{x:i+Math.cos(p)*u,y:n+Math.sin(p)*u}}tooltipPosition(e){return this.getCenterPoint(e)}draw(e){const{options:i,circumference:n}=this,a=(i.offset||0)/4,o=(i.spacing||0)/2,r=i.circular;if(this.pixelMargin=i.borderAlign==="inner"?.33:0,this.fullCircles=n>Q?Math.floor(n/Q):0,n===0||this.innerRadius<0||this.outerRadius<0)return;e.save();const l=(this.startAngle+this.endAngle)/2;e.translate(Math.cos(l)*a,Math.sin(l)*a);const c=1-Math.sin(Math.min(Y,n||0)),d=a*c;e.fillStyle=i.backgroundColor,e.strokeStyle=i.borderColor,jc(e,this,d,o,r),Wc(e,this,d,o,r),e.restore()}}$(Be,"id","arc"),$(Be,"defaults",{borderAlign:"center",borderColor:"#fff",borderDash:[],borderDashOffset:0,borderJoinStyle:void 0,borderRadius:0,borderWidth:2,offset:0,spacing:0,angle:void 0,circular:!0,selfJoin:!1}),$(Be,"defaultRoutes",{backgroundColor:"backgroundColor"}),$(Be,"descriptors",{_scriptable:!0,_indexable:e=>e!=="borderDash"});function io(s,t,e=t){s.lineCap=H(e.borderCapStyle,t.borderCapStyle),s.setLineDash(H(e.borderDash,t.borderDash)),s.lineDashOffset=H(e.borderDashOffset,t.borderDashOffset),s.lineJoin=H(e.borderJoinStyle,t.borderJoinStyle),s.lineWidth=H(e.borderWidth,t.borderWidth),s.strokeStyle=H(e.borderColor,t.borderColor)}function Uc(s,t,e){s.lineTo(e.x,e.y)}function Gc(s){return s.stepped?gr:s.tension||s.cubicInterpolationMode==="monotone"?mr:Uc}function so(s,t,e={}){const i=s.length,{start:n=0,end:a=i-1}=e,{start:o,end:r}=t,l=Math.max(n,o),c=Math.min(a,r),d=n<o&&a<o||n>r&&a>r;return{count:i,start:l,loop:t.loop,ilen:c<l&&!d?i+c-l:c-l}}function Yc(s,t,e,i){const{points:n,options:a}=t,{count:o,start:r,loop:l,ilen:c}=so(n,e,i),d=Gc(a);let{move:p=!0,reverse:u}=i||{},h,g,f;for(h=0;h<=c;++h)g=n[(r+(u?c-h:h))%o],!g.skip&&(p?(s.moveTo(g.x,g.y),p=!1):d(s,f,g,u,a.stepped),f=g);return l&&(g=n[(r+(u?c:0))%o],d(s,f,g,u,a.stepped)),!!l}function Kc(s,t,e,i){const n=t.points,{count:a,start:o,ilen:r}=so(n,e,i),{move:l=!0,reverse:c}=i||{};let d=0,p=0,u,h,g,f,m,y;const v=x=>(o+(c?r-x:x))%a,S=()=>{f!==m&&(s.lineTo(d,m),s.lineTo(d,f),s.lineTo(d,y))};for(l&&(h=n[v(0)],s.moveTo(h.x,h.y)),u=0;u<=r;++u){if(h=n[v(u)],h.skip)continue;const x=h.x,b=h.y,_=x|0;_===g?(b<f?f=b:b>m&&(m=b),d=(p*d+x)/++p):(S(),s.lineTo(x,b),g=_,p=0,f=m=b),y=b}S()}function cs(s){const t=s.options,e=t.borderDash&&t.borderDash.length;return!s._decimated&&!s._loop&&!t.tension&&t.cubicInterpolationMode!=="monotone"&&!t.stepped&&!e?Kc:Yc}function Xc(s){return s.stepped?Yr:s.tension||s.cubicInterpolationMode==="monotone"?Kr:he}function Zc(s,t,e,i){let n=t._path;n||(n=t._path=new Path2D,t.path(n,e,i)&&n.closePath()),io(s,t.options),s.stroke(n)}function Qc(s,t,e,i){const{segments:n,options:a}=t,o=cs(t);for(const r of n)io(s,a,r.style),s.beginPath(),o(s,t,r,{start:e,end:e+i-1})&&s.closePath(),s.stroke()}const Jc=typeof Path2D=="function";function td(s,t,e,i){Jc&&!t.options.segment?Zc(s,t,e,i):Qc(s,t,e,i)}class Qt extends Ct{constructor(t){super(),this.animated=!0,this.options=void 0,this._chart=void 0,this._loop=void 0,this._fullLoop=void 0,this._path=void 0,this._points=void 0,this._segments=void 0,this._decimated=!1,this._pointsUpdated=!1,this._datasetIndex=void 0,t&&Object.assign(this,t)}updateControlPoints(t,e){const i=this.options;if((i.tension||i.cubicInterpolationMode==="monotone")&&!i.stepped&&!this._pointsUpdated){const n=i.spanGaps?this._loop:this._fullLoop;qr(this._points,i,t,n,e),this._pointsUpdated=!0}}set points(t){this._points=t,delete this._segments,delete this._path,this._pointsUpdated=!1}get points(){return this._points}get segments(){return this._segments||(this._segments=el(this,this.options.segment))}first(){const t=this.segments,e=this.points;return t.length&&e[t[0].start]}last(){const t=this.segments,e=this.points,i=t.length;return i&&e[t[i-1].end]}interpolate(t,e){const i=this.options,n=t[e],a=this.points,o=Ha(this,{property:e,start:n,end:n});if(!o.length)return;const r=[],l=Xc(i);let c,d;for(c=0,d=o.length;c<d;++c){const{start:p,end:u}=o[c],h=a[p],g=a[u];if(h===g){r.push(h);continue}const f=Math.abs((n-h[e])/(g[e]-h[e])),m=l(h,g,f,i.stepped);m[e]=t[e],r.push(m)}return r.length===1?r[0]:r}pathSegment(t,e,i){return cs(this)(t,this,e,i)}path(t,e,i){const n=this.segments,a=cs(this);let o=this._loop;e=e||0,i=i||this.points.length-e;for(const r of n)o&=a(t,this,r,{start:e,end:e+i-1});return!!o}draw(t,e,i,n){const a=this.options||{};(this.points||[]).length&&a.borderWidth&&(t.save(),td(t,this,i,n),t.restore()),this.animated&&(this._pointsUpdated=!1,this._path=void 0)}}$(Qt,"id","line"),$(Qt,"defaults",{borderCapStyle:"butt",borderDash:[],borderDashOffset:0,borderJoinStyle:"miter",borderWidth:3,capBezierPoints:!0,cubicInterpolationMode:"default",fill:!1,spanGaps:!1,stepped:!1,tension:0}),$(Qt,"defaultRoutes",{backgroundColor:"backgroundColor",borderColor:"borderColor"}),$(Qt,"descriptors",{_scriptable:!0,_indexable:t=>t!=="borderDash"&&t!=="fill"});function Nn(s,t,e,i){const n=s.options,{[e]:a}=s.getProps([e],i);return Math.abs(t-a)<n.radius+n.hitRadius}class _i extends Ct{constructor(e){super();$(this,"parsed");$(this,"skip");$(this,"stop");this.options=void 0,this.parsed=void 0,this.skip=void 0,this.stop=void 0,e&&Object.assign(this,e)}inRange(e,i,n){const a=this.options,{x:o,y:r}=this.getProps(["x","y"],n);return Math.pow(e-o,2)+Math.pow(i-r,2)<Math.pow(a.hitRadius+a.radius,2)}inXRange(e,i){return Nn(this,e,"x",i)}inYRange(e,i){return Nn(this,e,"y",i)}getCenterPoint(e){const{x:i,y:n}=this.getProps(["x","y"],e);return{x:i,y:n}}size(e){e=e||this.options||{};let i=e.radius||0;i=Math.max(i,i&&e.hoverRadius||0);const n=i&&e.borderWidth||0;return(i+n)*2}draw(e,i){const n=this.options;this.skip||n.radius<.1||!Ht(this,i,this.size(n)/2)||(e.strokeStyle=n.borderColor,e.lineWidth=n.borderWidth,e.fillStyle=n.backgroundColor,as(e,n,this.x,this.y))}getRange(){const e=this.options||{};return e.radius+e.hitRadius}}$(_i,"id","point"),$(_i,"defaults",{borderWidth:1,hitRadius:1,hoverBorderWidth:1,hoverRadius:4,pointStyle:"circle",radius:3,rotation:0}),$(_i,"defaultRoutes",{backgroundColor:"backgroundColor",borderColor:"borderColor"});function no(s,t){const{x:e,y:i,base:n,width:a,height:o}=s.getProps(["x","y","base","width","height"],t);let r,l,c,d,p;return s.horizontal?(p=o/2,r=Math.min(e,n),l=Math.max(e,n),c=i-p,d=i+p):(p=a/2,r=e-p,l=e+p,c=Math.min(i,n),d=Math.max(i,n)),{left:r,top:c,right:l,bottom:d}}function Jt(s,t,e,i){return s?0:ct(t,e,i)}function ed(s,t,e){const i=s.options.borderWidth,n=s.borderSkipped,a=Oa(i);return{t:Jt(n.top,a.top,0,e),r:Jt(n.right,a.right,0,t),b:Jt(n.bottom,a.bottom,0,e),l:Jt(n.left,a.left,0,t)}}function id(s,t,e){const{enableBorderRadius:i}=s.getProps(["enableBorderRadius"]),n=s.options.borderRadius,a=ge(n),o=Math.min(t,e),r=s.borderSkipped,l=i||G(n);return{topLeft:Jt(!l||r.top||r.left,a.topLeft,0,o),topRight:Jt(!l||r.top||r.right,a.topRight,0,o),bottomLeft:Jt(!l||r.bottom||r.left,a.bottomLeft,0,o),bottomRight:Jt(!l||r.bottom||r.right,a.bottomRight,0,o)}}function sd(s){const t=no(s),e=t.right-t.left,i=t.bottom-t.top,n=ed(s,e/2,i/2),a=id(s,e/2,i/2);return{outer:{x:t.left,y:t.top,w:e,h:i,radius:a},inner:{x:t.left+n.l,y:t.top+n.t,w:e-n.l-n.r,h:i-n.t-n.b,radius:{topLeft:Math.max(0,a.topLeft-Math.max(n.t,n.l)),topRight:Math.max(0,a.topRight-Math.max(n.t,n.r)),bottomLeft:Math.max(0,a.bottomLeft-Math.max(n.b,n.l)),bottomRight:Math.max(0,a.bottomRight-Math.max(n.b,n.r))}}}}function Qi(s,t,e,i){const n=t===null,a=e===null,r=s&&!(n&&a)&&no(s,i);return r&&(n||qt(t,r.left,r.right))&&(a||qt(e,r.top,r.bottom))}function nd(s){return s.topLeft||s.topRight||s.bottomLeft||s.bottomRight}function ad(s,t){s.rect(t.x,t.y,t.w,t.h)}function Ji(s,t,e={}){const i=s.x!==e.x?-t:0,n=s.y!==e.y?-t:0,a=(s.x+s.w!==e.x+e.w?t:0)-i,o=(s.y+s.h!==e.y+e.h?t:0)-n;return{x:s.x+i,y:s.y+n,w:s.w+a,h:s.h+o,radius:s.radius}}class Ci extends Ct{constructor(t){super(),this.options=void 0,this.horizontal=void 0,this.base=void 0,this.width=void 0,this.height=void 0,this.inflateAmount=void 0,t&&Object.assign(this,t)}draw(t){const{inflateAmount:e,options:{borderColor:i,backgroundColor:n}}=this,{inner:a,outer:o}=sd(this),r=nd(o.radius)?Qe:ad;t.save(),(o.w!==a.w||o.h!==a.h)&&(t.beginPath(),r(t,Ji(o,e,a)),t.clip(),r(t,Ji(a,-e,o)),t.fillStyle=i,t.fill("evenodd")),t.beginPath(),r(t,Ji(a,e)),t.fillStyle=n,t.fill(),t.restore()}inRange(t,e,i){return Qi(this,t,e,i)}inXRange(t,e){return Qi(this,t,null,e)}inYRange(t,e){return Qi(this,null,t,e)}getCenterPoint(t){const{x:e,y:i,base:n,horizontal:a}=this.getProps(["x","y","base","horizontal"],t);return{x:a?(e+n)/2:e,y:a?i:(i+n)/2}}getRange(t){return t==="x"?this.width/2:this.height/2}}$(Ci,"id","bar"),$(Ci,"defaults",{borderSkipped:"start",borderWidth:0,borderRadius:0,inflateAmount:"auto",pointStyle:void 0}),$(Ci,"defaultRoutes",{backgroundColor:"backgroundColor",borderColor:"borderColor"});var od=Object.freeze({__proto__:null,ArcElement:Be,BarElement:Ci,LineElement:Qt,PointElement:_i});const ds=["rgb(54, 162, 235)","rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(75, 192, 192)","rgb(153, 102, 255)","rgb(201, 203, 207)"],Hn=ds.map(s=>s.replace("rgb(","rgba(").replace(")",", 0.5)"));function ao(s){return ds[s%ds.length]}function oo(s){return Hn[s%Hn.length]}function rd(s,t){return s.borderColor=ao(t),s.backgroundColor=oo(t),++t}function ld(s,t){return s.backgroundColor=s.data.map(()=>ao(t++)),t}function cd(s,t){return s.backgroundColor=s.data.map(()=>oo(t++)),t}function dd(s){let t=0;return(e,i)=>{const n=s.getDatasetMeta(i).controller;n instanceof fe?t=ld(e,t):n instanceof Ge?t=cd(e,t):n&&(t=rd(e,t))}}function Vn(s){let t;for(t in s)if(s[t].borderColor||s[t].backgroundColor)return!0;return!1}function pd(s){return s&&(s.borderColor||s.backgroundColor)}function ud(){return et.borderColor!=="rgba(0,0,0,0.1)"||et.backgroundColor!=="rgba(0,0,0,0.1)"}var hd={id:"colors",defaults:{enabled:!0,forceOverride:!1},beforeLayout(s,t,e){if(!e.enabled)return;const{data:{datasets:i},options:n}=s.config,{elements:a}=n,o=Vn(i)||pd(n)||a&&Vn(a)||ud();if(!e.forceOverride&&o)return;const r=dd(s);i.forEach(r)}};function fd(s,t,e,i,n){const a=n.samples||i;if(a>=e)return s.slice(t,t+e);const o=[],r=(e-2)/(a-2);let l=0;const c=t+e-1;let d=t,p,u,h,g,f;for(o[l++]=s[d],p=0;p<a-2;p++){let m=0,y=0,v;const S=Math.floor((p+1)*r)+1+t,x=Math.min(Math.floor((p+2)*r)+1,e)+t,b=x-S;for(v=S;v<x;v++)m+=s[v].x,y+=s[v].y;m/=b,y/=b;const _=Math.floor(p*r)+1+t,k=Math.min(Math.floor((p+1)*r)+1,e)+t,{x:w,y:C}=s[d];for(h=g=-1,v=_;v<k;v++)g=.5*Math.abs((w-m)*(s[v].y-C)-(w-s[v].x)*(y-C)),g>h&&(h=g,u=s[v],f=v);o[l++]=u,d=f}return o[l++]=s[c],o}function gd(s,t,e,i){let n=0,a=0,o,r,l,c,d,p,u,h,g,f;const m=[],y=t+e-1,v=s[t].x,x=s[y].x-v;for(o=t;o<t+e;++o){r=s[o],l=(r.x-v)/x*i,c=r.y;const b=l|0;if(b===d)c<g?(g=c,p=o):c>f&&(f=c,u=o),n=(a*n+r.x)/++a;else{const _=o-1;if(!U(p)&&!U(u)){const k=Math.min(p,u),w=Math.max(p,u);k!==h&&k!==_&&m.push({...s[k],x:n}),w!==h&&w!==_&&m.push({...s[w],x:n})}o>0&&_!==h&&m.push(s[_]),m.push(r),d=b,a=0,g=f=c,p=u=h=o}}return m}function ro(s){if(s._decimated){const t=s._data;delete s._decimated,delete s._data,Object.defineProperty(s,"data",{configurable:!0,enumerable:!0,writable:!0,value:t})}}function jn(s){s.data.datasets.forEach(t=>{ro(t)})}function md(s,t){const e=t.length;let i=0,n;const{iScale:a}=s,{min:o,max:r,minDefined:l,maxDefined:c}=a.getUserBounds();return l&&(i=ct(Nt(t,a.axis,o).lo,0,e-1)),c?n=ct(Nt(t,a.axis,r).hi+1,i,e)-i:n=e-i,{start:i,count:n}}var bd={id:"decimation",defaults:{algorithm:"min-max",enabled:!1},beforeElementsUpdate:(s,t,e)=>{if(!e.enabled){jn(s);return}const i=s.width;s.data.datasets.forEach((n,a)=>{const{_data:o,indexAxis:r}=n,l=s.getDatasetMeta(a),c=o||n.data;if(Re([r,s.options.indexAxis])==="y"||!l.controller.supportsDecimation)return;const d=s.scales[l.xAxisID];if(d.type!=="linear"&&d.type!=="time"||s.options.parsing)return;let{start:p,count:u}=md(l,c);const h=e.threshold||4*i;if(u<=h){ro(n);return}U(o)&&(n._data=c,delete n.data,Object.defineProperty(n,"data",{configurable:!0,enumerable:!0,get:function(){return this._decimated},set:function(f){this._data=f}}));let g;switch(e.algorithm){case"lttb":g=fd(c,p,u,i,e);break;case"min-max":g=gd(c,p,u,i);break;default:throw new Error(`Unsupported decimation algorithm '${e.algorithm}'`)}n._decimated=g})},destroy(s){jn(s)}};function yd(s,t,e){const i=s.segments,n=s.points,a=t.points,o=[];for(const r of i){let{start:l,end:c}=r;c=qi(l,c,n);const d=ps(e,n[l],n[c],r.loop);if(!t.segments){o.push({source:r,target:d,start:n[l],end:n[c]});continue}const p=Ha(t,d);for(const u of p){const h=ps(e,a[u.start],a[u.end],u.loop),g=Na(r,n,h);for(const f of g)o.push({source:f,target:u,start:{[e]:Wn(d,h,"start",Math.max)},end:{[e]:Wn(d,h,"end",Math.min)}})}}return o}function ps(s,t,e,i){if(i)return;let n=t[s],a=e[s];return s==="angle"&&(n=ht(n),a=ht(a)),{property:s,start:n,end:a}}function xd(s,t){const{x:e=null,y:i=null}=s||{},n=t.points,a=[];return t.segments.forEach(({start:o,end:r})=>{r=qi(o,r,n);const l=n[o],c=n[r];i!==null?(a.push({x:l.x,y:i}),a.push({x:c.x,y:i})):e!==null&&(a.push({x:e,y:l.y}),a.push({x:e,y:c.y}))}),a}function qi(s,t,e){for(;t>s;t--){const i=e[t];if(!isNaN(i.x)&&!isNaN(i.y))break}return t}function Wn(s,t,e,i){return s&&t?i(s[e],t[e]):s?s[e]:t?t[e]:0}function lo(s,t){let e=[],i=!1;return tt(s)?(i=!0,e=s):e=xd(s,t),e.length?new Qt({points:e,options:{tension:0},_loop:i,_fullLoop:i}):null}function Un(s){return s&&s.fill!==!1}function vd(s,t,e){let n=s[t].fill;const a=[t];let o;if(!e)return n;for(;n!==!1&&a.indexOf(n)===-1;){if(!st(n))return n;if(o=s[n],!o)return!1;if(o.visible)return n;a.push(n),n=o.fill}return!1}function wd(s,t,e){const i=Cd(s);if(G(i))return isNaN(i.value)?!1:i;let n=parseFloat(i);return st(n)&&Math.floor(n)===n?Sd(i[0],t,n,e):["origin","start","end","stack","shape"].indexOf(i)>=0&&i}function Sd(s,t,e,i){return(s==="-"||s==="+")&&(e=t+e),e===t||e<0||e>=i?!1:e}function kd(s,t){let e=null;return s==="start"?e=t.bottom:s==="end"?e=t.top:G(s)?e=t.getPixelForValue(s.value):t.getBasePixel&&(e=t.getBasePixel()),e}function _d(s,t,e){let i;return s==="start"?i=e:s==="end"?i=t.options.reverse?t.min:t.max:G(s)?i=s.value:i=t.getBaseValue(),i}function Cd(s){const t=s.options,e=t.fill;let i=H(e&&e.target,e);return i===void 0&&(i=!!t.backgroundColor),i===!1||i===null?!1:i===!0?"origin":i}function Td(s){const{scale:t,index:e,line:i}=s,n=[],a=i.segments,o=i.points,r=Md(t,e);r.push(lo({x:null,y:t.bottom},i));for(let l=0;l<a.length;l++){const c=a[l];for(let d=c.start;d<=c.end;d++)Ad(n,o[d],r)}return new Qt({points:n,options:{}})}function Md(s,t){const e=[],i=s.getMatchingVisibleMetas("line");for(let n=0;n<i.length;n++){const a=i[n];if(a.index===t)break;a.hidden||e.unshift(a.dataset)}return e}function Ad(s,t,e){const i=[];for(let n=0;n<e.length;n++){const a=e[n],{first:o,last:r,point:l}=$d(a,t,"x");if(!(!l||o&&r)){if(o)i.unshift(l);else if(s.push(l),!r)break}}s.push(...i)}function $d(s,t,e){const i=s.interpolate(t,e);if(!i)return{};const n=i[e],a=s.segments,o=s.points;let r=!1,l=!1;for(let c=0;c<a.length;c++){const d=a[c],p=o[d.start][e],u=o[d.end][e];if(qt(n,p,u)){r=n===p,l=n===u;break}}return{first:r,last:l,point:i}}class co{constructor(t){this.x=t.x,this.y=t.y,this.radius=t.radius}pathSegment(t,e,i){const{x:n,y:a,radius:o}=this;return e=e||{start:0,end:Q},t.arc(n,a,o,e.end,e.start,!0),!i.bounds}interpolate(t){const{x:e,y:i,radius:n}=this,a=t.angle;return{x:e+Math.cos(a)*n,y:i+Math.sin(a)*n,angle:a}}}function Pd(s){const{chart:t,fill:e,line:i}=s;if(st(e))return Od(t,e);if(e==="stack")return Td(s);if(e==="shape")return!0;const n=Id(s);return n instanceof co?n:lo(n,i)}function Od(s,t){const e=s.getDatasetMeta(t);return e&&s.isDatasetVisible(t)?e.dataset:null}function Id(s){return(s.scale||{}).getPointPositionForValue?Dd(s):zd(s)}function zd(s){const{scale:t={},fill:e}=s,i=kd(e,t);if(st(i)){const n=t.isHorizontal();return{x:n?i:null,y:n?null:i}}return null}function Dd(s){const{scale:t,fill:e}=s,i=t.options,n=t.getLabels().length,a=i.reverse?t.max:t.min,o=_d(e,t,a),r=[];if(i.grid.circular){const l=t.getPointPositionForValue(0,a);return new co({x:l.x,y:l.y,radius:t.getDistanceFromCenterForValue(o)})}for(let l=0;l<n;++l)r.push(t.getPointPositionForValue(l,o));return r}function ts(s,t,e){const i=Pd(t),{chart:n,index:a,line:o,scale:r,axis:l}=t,c=o.options,d=c.fill,p=c.backgroundColor,{above:u=p,below:h=p}=d||{},g=n.getDatasetMeta(a),f=Va(n,g);i&&o.points.length&&(Ei(s,e),Ld(s,{line:o,target:i,above:u,below:h,area:e,scale:r,axis:l,clip:f}),Ri(s))}function Ld(s,t){const{line:e,target:i,above:n,below:a,area:o,scale:r,clip:l}=t,c=e._loop?"angle":t.axis;s.save();let d=a;a!==n&&(c==="x"?(Gn(s,i,o.top),es(s,{line:e,target:i,color:n,scale:r,property:c,clip:l}),s.restore(),s.save(),Gn(s,i,o.bottom)):c==="y"&&(Yn(s,i,o.left),es(s,{line:e,target:i,color:a,scale:r,property:c,clip:l}),s.restore(),s.save(),Yn(s,i,o.right),d=n)),es(s,{line:e,target:i,color:d,scale:r,property:c,clip:l}),s.restore()}function Gn(s,t,e){const{segments:i,points:n}=t;let a=!0,o=!1;s.beginPath();for(const r of i){const{start:l,end:c}=r,d=n[l],p=n[qi(l,c,n)];a?(s.moveTo(d.x,d.y),a=!1):(s.lineTo(d.x,e),s.lineTo(d.x,d.y)),o=!!t.pathSegment(s,r,{move:o}),o?s.closePath():s.lineTo(p.x,e)}s.lineTo(t.first().x,e),s.closePath(),s.clip()}function Yn(s,t,e){const{segments:i,points:n}=t;let a=!0,o=!1;s.beginPath();for(const r of i){const{start:l,end:c}=r,d=n[l],p=n[qi(l,c,n)];a?(s.moveTo(d.x,d.y),a=!1):(s.lineTo(e,d.y),s.lineTo(d.x,d.y)),o=!!t.pathSegment(s,r,{move:o}),o?s.closePath():s.lineTo(e,p.y)}s.lineTo(e,t.first().y),s.closePath(),s.clip()}function es(s,t){const{line:e,target:i,property:n,color:a,scale:o,clip:r}=t,l=yd(e,i,n);for(const{source:c,target:d,start:p,end:u}of l){const{style:{backgroundColor:h=a}={}}=c,g=i!==!0;s.save(),s.fillStyle=h,Ed(s,o,r,g&&ps(n,p,u)),s.beginPath();const f=!!e.pathSegment(s,c);let m;if(g){f?s.closePath():Kn(s,i,u,n);const y=!!i.pathSegment(s,d,{move:f,reverse:!0});m=f&&y,m||Kn(s,i,p,n)}s.closePath(),s.fill(m?"evenodd":"nonzero"),s.restore()}}function Ed(s,t,e,i){const n=t.chart.chartArea,{property:a,start:o,end:r}=i||{};if(a==="x"||a==="y"){let l,c,d,p;a==="x"?(l=o,c=n.top,d=r,p=n.bottom):(l=n.left,c=o,d=n.right,p=r),s.beginPath(),e&&(l=Math.max(l,e.left),d=Math.min(d,e.right),c=Math.max(c,e.top),p=Math.min(p,e.bottom)),s.rect(l,c,d-l,p-c),s.clip()}}function Kn(s,t,e,i){const n=t.interpolate(e,i);n&&s.lineTo(n.x,n.y)}var Rd={id:"filler",afterDatasetsUpdate(s,t,e){const i=(s.data.datasets||[]).length,n=[];let a,o,r,l;for(o=0;o<i;++o)a=s.getDatasetMeta(o),r=a.dataset,l=null,r&&r.options&&r instanceof Qt&&(l={visible:s.isDatasetVisible(o),index:o,fill:wd(r,o,i),chart:s,axis:a.controller.options.indexAxis,scale:a.vScale,line:r}),a.$filler=l,n.push(l);for(o=0;o<i;++o)l=n[o],!(!l||l.fill===!1)&&(l.fill=vd(n,o,e.propagate))},beforeDraw(s,t,e){const i=e.drawTime==="beforeDraw",n=s.getSortedVisibleDatasetMetas(),a=s.chartArea;for(let o=n.length-1;o>=0;--o){const r=n[o].$filler;r&&(r.line.updateControlPoints(a,r.axis),i&&r.fill&&ts(s.ctx,r,a))}},beforeDatasetsDraw(s,t,e){if(e.drawTime!=="beforeDatasetsDraw")return;const i=s.getSortedVisibleDatasetMetas();for(let n=i.length-1;n>=0;--n){const a=i[n].$filler;Un(a)&&ts(s.ctx,a,s.chartArea)}},beforeDatasetDraw(s,t,e){const i=t.meta.$filler;!Un(i)||e.drawTime!=="beforeDatasetDraw"||ts(s.ctx,i,s.chartArea)},defaults:{propagate:!0,drawTime:"beforeDatasetDraw"}};const Xn=(s,t)=>{let{boxHeight:e=t,boxWidth:i=t}=s;return s.usePointStyle&&(e=Math.min(e,t),i=s.pointStyleWidth||Math.min(i,t)),{boxWidth:i,boxHeight:e,itemHeight:Math.max(t,e)}},Fd=(s,t)=>s!==null&&t!==null&&s.datasetIndex===t.datasetIndex&&s.index===t.index;class Zn extends Ct{constructor(t){super(),this._added=!1,this.legendHitBoxes=[],this._hoveredItem=null,this.doughnutMode=!1,this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this.legendItems=void 0,this.columnSizes=void 0,this.lineWidths=void 0,this.maxHeight=void 0,this.maxWidth=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.height=void 0,this.width=void 0,this._margins=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e,i){this.maxWidth=t,this.maxHeight=e,this._margins=i,this.setDimensions(),this.buildLabels(),this.fit()}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=this._margins.left,this.right=this.width):(this.height=this.maxHeight,this.top=this._margins.top,this.bottom=this.height)}buildLabels(){const t=this.options.labels||{};let e=Z(t.generateLabels,[this.chart],this)||[];t.filter&&(e=e.filter(i=>t.filter(i,this.chart.data))),t.sort&&(e=e.sort((i,n)=>t.sort(i,n,this.chart.data))),this.options.reverse&&e.reverse(),this.legendItems=e}fit(){const{options:t,ctx:e}=this;if(!t.display){this.width=this.height=0;return}const i=t.labels,n=lt(i.font),a=n.size,o=this._computeTitleHeight(),{boxWidth:r,itemHeight:l}=Xn(i,a);let c,d;e.font=n.string,this.isHorizontal()?(c=this.maxWidth,d=this._fitRows(o,a,r,l)+10):(d=this.maxHeight,c=this._fitCols(o,n,r,l)+10),this.width=Math.min(c,t.maxWidth||this.maxWidth),this.height=Math.min(d,t.maxHeight||this.maxHeight)}_fitRows(t,e,i,n){const{ctx:a,maxWidth:o,options:{labels:{padding:r}}}=this,l=this.legendHitBoxes=[],c=this.lineWidths=[0],d=n+r;let p=t;a.textAlign="left",a.textBaseline="middle";let u=-1,h=-d;return this.legendItems.forEach((g,f)=>{const m=i+e/2+a.measureText(g.text).width;(f===0||c[c.length-1]+m+2*r>o)&&(p+=d,c[c.length-(f>0?0:1)]=0,h+=d,u++),l[f]={left:0,top:h,row:u,width:m,height:n},c[c.length-1]+=m+r}),p}_fitCols(t,e,i,n){const{ctx:a,maxHeight:o,options:{labels:{padding:r}}}=this,l=this.legendHitBoxes=[],c=this.columnSizes=[],d=o-t;let p=r,u=0,h=0,g=0,f=0;return this.legendItems.forEach((m,y)=>{const{itemWidth:v,itemHeight:S}=Bd(i,e,a,m,n);y>0&&h+S+2*r>d&&(p+=u+r,c.push({width:u,height:h}),g+=u+r,f++,u=h=0),l[y]={left:g,top:h,col:f,width:v,height:S},u=Math.max(u,v),h+=S+r}),p+=u,c.push({width:u,height:h}),p}adjustHitBoxes(){if(!this.options.display)return;const t=this._computeTitleHeight(),{legendHitBoxes:e,options:{align:i,labels:{padding:n},rtl:a}}=this,o=Se(a,this.left,this.width);if(this.isHorizontal()){let r=0,l=ut(i,this.left+n,this.right-this.lineWidths[r]);for(const c of e)r!==c.row&&(r=c.row,l=ut(i,this.left+n,this.right-this.lineWidths[r])),c.top+=this.top+t+n,c.left=o.leftForLtr(o.x(l),c.width),l+=c.width+n}else{let r=0,l=ut(i,this.top+t+n,this.bottom-this.columnSizes[r].height);for(const c of e)c.col!==r&&(r=c.col,l=ut(i,this.top+t+n,this.bottom-this.columnSizes[r].height)),c.top=l,c.left+=this.left+n,c.left=o.leftForLtr(o.x(c.left),c.width),l+=c.height+n}}isHorizontal(){return this.options.position==="top"||this.options.position==="bottom"}draw(){if(this.options.display){const t=this.ctx;Ei(t,this),this._draw(),Ri(t)}}_draw(){const{options:t,columnSizes:e,lineWidths:i,ctx:n}=this,{align:a,labels:o}=t,r=et.color,l=Se(t.rtl,this.left,this.width),c=lt(o.font),{padding:d}=o,p=c.size,u=p/2;let h;this.drawTitle(),n.textAlign=l.textAlign("left"),n.textBaseline="middle",n.lineWidth=.5,n.font=c.string;const{boxWidth:g,boxHeight:f,itemHeight:m}=Xn(o,p),y=function(_,k,w){if(isNaN(g)||g<=0||isNaN(f)||f<0)return;n.save();const C=H(w.lineWidth,1);if(n.fillStyle=H(w.fillStyle,r),n.lineCap=H(w.lineCap,"butt"),n.lineDashOffset=H(w.lineDashOffset,0),n.lineJoin=H(w.lineJoin,"miter"),n.lineWidth=C,n.strokeStyle=H(w.strokeStyle,r),n.setLineDash(H(w.lineDash,[])),o.usePointStyle){const A={radius:f*Math.SQRT2/2,pointStyle:w.pointStyle,rotation:w.rotation,borderWidth:C},T=l.xPlus(_,g/2),P=k+u;Pa(n,A,T,P,o.pointStyleWidth&&g)}else{const A=k+Math.max((p-f)/2,0),T=l.leftForLtr(_,g),P=ge(w.borderRadius);n.beginPath(),Object.values(P).some(B=>B!==0)?Qe(n,{x:T,y:A,w:g,h:f,radius:P}):n.rect(T,A,g,f),n.fill(),C!==0&&n.stroke()}n.restore()},v=function(_,k,w){ye(n,w.text,_,k+m/2,c,{strikethrough:w.hidden,textAlign:l.textAlign(w.textAlign)})},S=this.isHorizontal(),x=this._computeTitleHeight();S?h={x:ut(a,this.left+d,this.right-i[0]),y:this.top+d+x,line:0}:h={x:this.left+d,y:ut(a,this.top+x+d,this.bottom-e[0].height),line:0},Fa(this.ctx,t.textDirection);const b=m+d;this.legendItems.forEach((_,k)=>{n.strokeStyle=_.fontColor,n.fillStyle=_.fontColor;const w=n.measureText(_.text).width,C=l.textAlign(_.textAlign||(_.textAlign=o.textAlign)),A=g+u+w;let T=h.x,P=h.y;l.setWidth(this.width),S?k>0&&T+A+d>this.right&&(P=h.y+=b,h.line++,T=h.x=ut(a,this.left+d,this.right-i[h.line])):k>0&&P+b>this.bottom&&(T=h.x=T+e[h.line].width+d,h.line++,P=h.y=ut(a,this.top+x+d,this.bottom-e[h.line].height));const B=l.x(T);if(y(B,P,_),T=nr(C,T+g+u,S?T+A:this.right,t.rtl),v(l.x(T),P,_),S)h.x+=A+d;else if(typeof _.text!="string"){const V=c.lineHeight;h.y+=po(_,V)+d}else h.y+=b}),Ba(this.ctx,t.textDirection)}drawTitle(){const t=this.options,e=t.title,i=lt(e.font),n=gt(e.padding);if(!e.display)return;const a=Se(t.rtl,this.left,this.width),o=this.ctx,r=e.position,l=i.size/2,c=n.top+l;let d,p=this.left,u=this.width;if(this.isHorizontal())u=Math.max(...this.lineWidths),d=this.top+c,p=ut(t.align,p,this.right-u);else{const g=this.columnSizes.reduce((f,m)=>Math.max(f,m.height),0);d=c+ut(t.align,this.top,this.bottom-g-t.labels.padding-this._computeTitleHeight())}const h=ut(r,p,p+u);o.textAlign=a.textAlign(_s(r)),o.textBaseline="middle",o.strokeStyle=e.color,o.fillStyle=e.color,o.font=i.string,ye(o,e.text,h,d,i)}_computeTitleHeight(){const t=this.options.title,e=lt(t.font),i=gt(t.padding);return t.display?e.lineHeight+i.height:0}_getLegendItemAt(t,e){let i,n,a;if(qt(t,this.left,this.right)&&qt(e,this.top,this.bottom)){for(a=this.legendHitBoxes,i=0;i<a.length;++i)if(n=a[i],qt(t,n.left,n.left+n.width)&&qt(e,n.top,n.top+n.height))return this.legendItems[i]}return null}handleEvent(t){const e=this.options;if(!Hd(t.type,e))return;const i=this._getLegendItemAt(t.x,t.y);if(t.type==="mousemove"||t.type==="mouseout"){const n=this._hoveredItem,a=Fd(n,i);n&&!a&&Z(e.onLeave,[t,n,this],this),this._hoveredItem=i,i&&!a&&Z(e.onHover,[t,i,this],this)}else i&&Z(e.onClick,[t,i,this],this)}}function Bd(s,t,e,i,n){const a=qd(i,s,t,e),o=Nd(n,i,t.lineHeight);return{itemWidth:a,itemHeight:o}}function qd(s,t,e,i){let n=s.text;return n&&typeof n!="string"&&(n=n.reduce((a,o)=>a.length>o.length?a:o)),t+e.size/2+i.measureText(n).width}function Nd(s,t,e){let i=s;return typeof t.text!="string"&&(i=po(t,e)),i}function po(s,t){const e=s.text?s.text.length:0;return t*e}function Hd(s,t){return!!((s==="mousemove"||s==="mouseout")&&(t.onHover||t.onLeave)||t.onClick&&(s==="click"||s==="mouseup"))}var Vd={id:"legend",_element:Zn,start(s,t,e){const i=s.legend=new Zn({ctx:s.ctx,options:e,chart:s});ft.configure(s,i,e),ft.addBox(s,i)},stop(s){ft.removeBox(s,s.legend),delete s.legend},beforeUpdate(s,t,e){const i=s.legend;ft.configure(s,i,e),i.options=e},afterUpdate(s){const t=s.legend;t.buildLabels(),t.adjustHitBoxes()},afterEvent(s,t){t.replay||s.legend.handleEvent(t.event)},defaults:{display:!0,position:"top",align:"center",fullSize:!0,reverse:!1,weight:1e3,onClick(s,t,e){const i=t.datasetIndex,n=e.chart;n.isDatasetVisible(i)?(n.hide(i),t.hidden=!0):(n.show(i),t.hidden=!1)},onHover:null,onLeave:null,labels:{color:s=>s.chart.options.color,boxWidth:40,padding:10,generateLabels(s){const t=s.data.datasets,{labels:{usePointStyle:e,pointStyle:i,textAlign:n,color:a,useBorderRadius:o,borderRadius:r}}=s.legend.options;return s._getSortedDatasetMetas().map(l=>{const c=l.controller.getStyle(e?0:void 0),d=gt(c.borderWidth);return{text:t[l.index].label,fillStyle:c.backgroundColor,fontColor:a,hidden:!l.visible,lineCap:c.borderCapStyle,lineDash:c.borderDash,lineDashOffset:c.borderDashOffset,lineJoin:c.borderJoinStyle,lineWidth:(d.width+d.height)/4,strokeStyle:c.borderColor,pointStyle:i||c.pointStyle,rotation:c.rotation,textAlign:n||c.textAlign,borderRadius:o&&(r||c.borderRadius),datasetIndex:l.index}},this)}},title:{color:s=>s.chart.options.color,display:!1,position:"center",text:""}},descriptors:{_scriptable:s=>!s.startsWith("on"),labels:{_scriptable:s=>!["generateLabels","filter","sort"].includes(s)}}};class zs extends Ct{constructor(t){super(),this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this._padding=void 0,this.top=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e){const i=this.options;if(this.left=0,this.top=0,!i.display){this.width=this.height=this.right=this.bottom=0;return}this.width=this.right=t,this.height=this.bottom=e;const n=tt(i.text)?i.text.length:1;this._padding=gt(i.padding);const a=n*lt(i.font).lineHeight+this._padding.height;this.isHorizontal()?this.height=a:this.width=a}isHorizontal(){const t=this.options.position;return t==="top"||t==="bottom"}_drawArgs(t){const{top:e,left:i,bottom:n,right:a,options:o}=this,r=o.align;let l=0,c,d,p;return this.isHorizontal()?(d=ut(r,i,a),p=e+t,c=a-i):(o.position==="left"?(d=i+t,p=ut(r,n,e),l=Y*-.5):(d=a-t,p=ut(r,e,n),l=Y*.5),c=n-e),{titleX:d,titleY:p,maxWidth:c,rotation:l}}draw(){const t=this.ctx,e=this.options;if(!e.display)return;const i=lt(e.font),a=i.lineHeight/2+this._padding.top,{titleX:o,titleY:r,maxWidth:l,rotation:c}=this._drawArgs(a);ye(t,e.text,0,0,i,{color:e.color,maxWidth:l,rotation:c,textAlign:_s(e.align),textBaseline:"middle",translation:[o,r]})}}function jd(s,t){const e=new zs({ctx:s.ctx,options:t,chart:s});ft.configure(s,e,t),ft.addBox(s,e),s.titleBlock=e}var Wd={id:"title",_element:zs,start(s,t,e){jd(s,e)},stop(s){const t=s.titleBlock;ft.removeBox(s,t),delete s.titleBlock},beforeUpdate(s,t,e){const i=s.titleBlock;ft.configure(s,i,e),i.options=e},defaults:{align:"center",display:!1,font:{weight:"bold"},fullSize:!0,padding:10,position:"top",text:"",weight:2e3},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const fi=new WeakMap;var Ud={id:"subtitle",start(s,t,e){const i=new zs({ctx:s.ctx,options:e,chart:s});ft.configure(s,i,e),ft.addBox(s,i),fi.set(s,i)},stop(s){ft.removeBox(s,fi.get(s)),fi.delete(s)},beforeUpdate(s,t,e){const i=fi.get(s);ft.configure(s,i,e),i.options=e},defaults:{align:"center",display:!1,font:{weight:"normal"},fullSize:!0,padding:0,position:"top",text:"",weight:1500},defaultRoutes:{color:"color"},descriptors:{_scriptable:!0,_indexable:!1}};const qe={average(s){if(!s.length)return!1;let t,e,i=new Set,n=0,a=0;for(t=0,e=s.length;t<e;++t){const r=s[t].element;if(r&&r.hasValue()){const l=r.tooltipPosition();i.add(l.x),n+=l.y,++a}}return a===0||i.size===0?!1:{x:[...i].reduce((r,l)=>r+l)/i.size,y:n/a}},nearest(s,t){if(!s.length)return!1;let e=t.x,i=t.y,n=Number.POSITIVE_INFINITY,a,o,r;for(a=0,o=s.length;a<o;++a){const l=s[a].element;if(l&&l.hasValue()){const c=l.getCenterPoint(),d=ss(t,c);d<n&&(n=d,r=l)}}if(r){const l=r.tooltipPosition();e=l.x,i=l.y}return{x:e,y:i}}};function $t(s,t){return t&&(tt(t)?Array.prototype.push.apply(s,t):s.push(t)),s}function Et(s){return(typeof s=="string"||s instanceof String)&&s.indexOf(`
`)>-1?s.split(`
`):s}function Gd(s,t){const{element:e,datasetIndex:i,index:n}=t,a=s.getDatasetMeta(i).controller,{label:o,value:r}=a.getLabelAndValue(n);return{chart:s,label:o,parsed:a.getParsed(n),raw:s.data.datasets[i].data[n],formattedValue:r,dataset:a.getDataset(),dataIndex:n,datasetIndex:i,element:e}}function Qn(s,t){const e=s.chart.ctx,{body:i,footer:n,title:a}=s,{boxWidth:o,boxHeight:r}=t,l=lt(t.bodyFont),c=lt(t.titleFont),d=lt(t.footerFont),p=a.length,u=n.length,h=i.length,g=gt(t.padding);let f=g.height,m=0,y=i.reduce((x,b)=>x+b.before.length+b.lines.length+b.after.length,0);if(y+=s.beforeBody.length+s.afterBody.length,p&&(f+=p*c.lineHeight+(p-1)*t.titleSpacing+t.titleMarginBottom),y){const x=t.displayColors?Math.max(r,l.lineHeight):l.lineHeight;f+=h*x+(y-h)*l.lineHeight+(y-1)*t.bodySpacing}u&&(f+=t.footerMarginTop+u*d.lineHeight+(u-1)*t.footerSpacing);let v=0;const S=function(x){m=Math.max(m,e.measureText(x).width+v)};return e.save(),e.font=c.string,K(s.title,S),e.font=l.string,K(s.beforeBody.concat(s.afterBody),S),v=t.displayColors?o+2+t.boxPadding:0,K(i,x=>{K(x.before,S),K(x.lines,S),K(x.after,S)}),v=0,e.font=d.string,K(s.footer,S),e.restore(),m+=g.width,{width:m,height:f}}function Yd(s,t){const{y:e,height:i}=t;return e<i/2?"top":e>s.height-i/2?"bottom":"center"}function Kd(s,t,e,i){const{x:n,width:a}=i,o=e.caretSize+e.caretPadding;if(s==="left"&&n+a+o>t.width||s==="right"&&n-a-o<0)return!0}function Xd(s,t,e,i){const{x:n,width:a}=e,{width:o,chartArea:{left:r,right:l}}=s;let c="center";return i==="center"?c=n<=(r+l)/2?"left":"right":n<=a/2?c="left":n>=o-a/2&&(c="right"),Kd(c,s,t,e)&&(c="center"),c}function Jn(s,t,e){const i=e.yAlign||t.yAlign||Yd(s,e);return{xAlign:e.xAlign||t.xAlign||Xd(s,t,e,i),yAlign:i}}function Zd(s,t){let{x:e,width:i}=s;return t==="right"?e-=i:t==="center"&&(e-=i/2),e}function Qd(s,t,e){let{y:i,height:n}=s;return t==="top"?i+=e:t==="bottom"?i-=n+e:i-=n/2,i}function ta(s,t,e,i){const{caretSize:n,caretPadding:a,cornerRadius:o}=s,{xAlign:r,yAlign:l}=e,c=n+a,{topLeft:d,topRight:p,bottomLeft:u,bottomRight:h}=ge(o);let g=Zd(t,r);const f=Qd(t,l,c);return l==="center"?r==="left"?g+=c:r==="right"&&(g-=c):r==="left"?g-=Math.max(d,u)+n:r==="right"&&(g+=Math.max(p,h)+n),{x:ct(g,0,i.width-t.width),y:ct(f,0,i.height-t.height)}}function gi(s,t,e){const i=gt(e.padding);return t==="center"?s.x+s.width/2:t==="right"?s.x+s.width-i.right:s.x+i.left}function ea(s){return $t([],Et(s))}function Jd(s,t,e){return se(s,{tooltip:t,tooltipItems:e,type:"tooltip"})}function ia(s,t){const e=t&&t.dataset&&t.dataset.tooltip&&t.dataset.tooltip.callbacks;return e?s.override(e):s}const uo={beforeTitle:Dt,title(s){if(s.length>0){const t=s[0],e=t.chart.data.labels,i=e?e.length:0;if(this&&this.options&&this.options.mode==="dataset")return t.dataset.label||"";if(t.label)return t.label;if(i>0&&t.dataIndex<i)return e[t.dataIndex]}return""},afterTitle:Dt,beforeBody:Dt,beforeLabel:Dt,label(s){if(this&&this.options&&this.options.mode==="dataset")return s.label+": "+s.formattedValue||s.formattedValue;let t=s.dataset.label||"";t&&(t+=": ");const e=s.formattedValue;return U(e)||(t+=e),t},labelColor(s){const e=s.chart.getDatasetMeta(s.datasetIndex).controller.getStyle(s.dataIndex);return{borderColor:e.borderColor,backgroundColor:e.backgroundColor,borderWidth:e.borderWidth,borderDash:e.borderDash,borderDashOffset:e.borderDashOffset,borderRadius:0}},labelTextColor(){return this.options.bodyColor},labelPointStyle(s){const e=s.chart.getDatasetMeta(s.datasetIndex).controller.getStyle(s.dataIndex);return{pointStyle:e.pointStyle,rotation:e.rotation}},afterLabel:Dt,afterBody:Dt,beforeFooter:Dt,footer:Dt,afterFooter:Dt};function mt(s,t,e,i){const n=s[t].call(e,i);return typeof n>"u"?uo[t].call(e,i):n}class us extends Ct{constructor(t){super(),this.opacity=0,this._active=[],this._eventPosition=void 0,this._size=void 0,this._cachedAnimations=void 0,this._tooltipItems=[],this.$animations=void 0,this.$context=void 0,this.chart=t.chart,this.options=t.options,this.dataPoints=void 0,this.title=void 0,this.beforeBody=void 0,this.body=void 0,this.afterBody=void 0,this.footer=void 0,this.xAlign=void 0,this.yAlign=void 0,this.x=void 0,this.y=void 0,this.height=void 0,this.width=void 0,this.caretX=void 0,this.caretY=void 0,this.labelColors=void 0,this.labelPointStyles=void 0,this.labelTextColors=void 0}initialize(t){this.options=t,this._cachedAnimations=void 0,this.$context=void 0}_resolveAnimations(){const t=this._cachedAnimations;if(t)return t;const e=this.chart,i=this.options.setContext(this.getContext()),n=i.enabled&&e.options.animation&&i.animations,a=new ja(this.chart,n);return n._cacheable&&(this._cachedAnimations=Object.freeze(a)),a}getContext(){return this.$context||(this.$context=Jd(this.chart.getContext(),this,this._tooltipItems))}getTitle(t,e){const{callbacks:i}=e,n=mt(i,"beforeTitle",this,t),a=mt(i,"title",this,t),o=mt(i,"afterTitle",this,t);let r=[];return r=$t(r,Et(n)),r=$t(r,Et(a)),r=$t(r,Et(o)),r}getBeforeBody(t,e){return ea(mt(e.callbacks,"beforeBody",this,t))}getBody(t,e){const{callbacks:i}=e,n=[];return K(t,a=>{const o={before:[],lines:[],after:[]},r=ia(i,a);$t(o.before,Et(mt(r,"beforeLabel",this,a))),$t(o.lines,mt(r,"label",this,a)),$t(o.after,Et(mt(r,"afterLabel",this,a))),n.push(o)}),n}getAfterBody(t,e){return ea(mt(e.callbacks,"afterBody",this,t))}getFooter(t,e){const{callbacks:i}=e,n=mt(i,"beforeFooter",this,t),a=mt(i,"footer",this,t),o=mt(i,"afterFooter",this,t);let r=[];return r=$t(r,Et(n)),r=$t(r,Et(a)),r=$t(r,Et(o)),r}_createItems(t){const e=this._active,i=this.chart.data,n=[],a=[],o=[];let r=[],l,c;for(l=0,c=e.length;l<c;++l)r.push(Gd(this.chart,e[l]));return t.filter&&(r=r.filter((d,p,u)=>t.filter(d,p,u,i))),t.itemSort&&(r=r.sort((d,p)=>t.itemSort(d,p,i))),K(r,d=>{const p=ia(t.callbacks,d);n.push(mt(p,"labelColor",this,d)),a.push(mt(p,"labelPointStyle",this,d)),o.push(mt(p,"labelTextColor",this,d))}),this.labelColors=n,this.labelPointStyles=a,this.labelTextColors=o,this.dataPoints=r,r}update(t,e){const i=this.options.setContext(this.getContext()),n=this._active;let a,o=[];if(!n.length)this.opacity!==0&&(a={opacity:0});else{const r=qe[i.position].call(this,n,this._eventPosition);o=this._createItems(i),this.title=this.getTitle(o,i),this.beforeBody=this.getBeforeBody(o,i),this.body=this.getBody(o,i),this.afterBody=this.getAfterBody(o,i),this.footer=this.getFooter(o,i);const l=this._size=Qn(this,i),c=Object.assign({},r,l),d=Jn(this.chart,i,c),p=ta(i,c,d,this.chart);this.xAlign=d.xAlign,this.yAlign=d.yAlign,a={opacity:1,x:p.x,y:p.y,width:l.width,height:l.height,caretX:r.x,caretY:r.y}}this._tooltipItems=o,this.$context=void 0,a&&this._resolveAnimations().update(this,a),t&&i.external&&i.external.call(this,{chart:this.chart,tooltip:this,replay:e})}drawCaret(t,e,i,n){const a=this.getCaretPosition(t,i,n);e.lineTo(a.x1,a.y1),e.lineTo(a.x2,a.y2),e.lineTo(a.x3,a.y3)}getCaretPosition(t,e,i){const{xAlign:n,yAlign:a}=this,{caretSize:o,cornerRadius:r}=i,{topLeft:l,topRight:c,bottomLeft:d,bottomRight:p}=ge(r),{x:u,y:h}=t,{width:g,height:f}=e;let m,y,v,S,x,b;return a==="center"?(x=h+f/2,n==="left"?(m=u,y=m-o,S=x+o,b=x-o):(m=u+g,y=m+o,S=x-o,b=x+o),v=m):(n==="left"?y=u+Math.max(l,d)+o:n==="right"?y=u+g-Math.max(c,p)-o:y=this.caretX,a==="top"?(S=h,x=S-o,m=y-o,v=y+o):(S=h+f,x=S+o,m=y+o,v=y-o),b=S),{x1:m,x2:y,x3:v,y1:S,y2:x,y3:b}}drawTitle(t,e,i){const n=this.title,a=n.length;let o,r,l;if(a){const c=Se(i.rtl,this.x,this.width);for(t.x=gi(this,i.titleAlign,i),e.textAlign=c.textAlign(i.titleAlign),e.textBaseline="middle",o=lt(i.titleFont),r=i.titleSpacing,e.fillStyle=i.titleColor,e.font=o.string,l=0;l<a;++l)e.fillText(n[l],c.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+r,l+1===a&&(t.y+=i.titleMarginBottom-r)}}_drawColorBox(t,e,i,n,a){const o=this.labelColors[i],r=this.labelPointStyles[i],{boxHeight:l,boxWidth:c}=a,d=lt(a.bodyFont),p=gi(this,"left",a),u=n.x(p),h=l<d.lineHeight?(d.lineHeight-l)/2:0,g=e.y+h;if(a.usePointStyle){const f={radius:Math.min(c,l)/2,pointStyle:r.pointStyle,rotation:r.rotation,borderWidth:1},m=n.leftForLtr(u,c)+c/2,y=g+l/2;t.strokeStyle=a.multiKeyBackground,t.fillStyle=a.multiKeyBackground,as(t,f,m,y),t.strokeStyle=o.borderColor,t.fillStyle=o.backgroundColor,as(t,f,m,y)}else{t.lineWidth=G(o.borderWidth)?Math.max(...Object.values(o.borderWidth)):o.borderWidth||1,t.strokeStyle=o.borderColor,t.setLineDash(o.borderDash||[]),t.lineDashOffset=o.borderDashOffset||0;const f=n.leftForLtr(u,c),m=n.leftForLtr(n.xPlus(u,1),c-2),y=ge(o.borderRadius);Object.values(y).some(v=>v!==0)?(t.beginPath(),t.fillStyle=a.multiKeyBackground,Qe(t,{x:f,y:g,w:c,h:l,radius:y}),t.fill(),t.stroke(),t.fillStyle=o.backgroundColor,t.beginPath(),Qe(t,{x:m,y:g+1,w:c-2,h:l-2,radius:y}),t.fill()):(t.fillStyle=a.multiKeyBackground,t.fillRect(f,g,c,l),t.strokeRect(f,g,c,l),t.fillStyle=o.backgroundColor,t.fillRect(m,g+1,c-2,l-2))}t.fillStyle=this.labelTextColors[i]}drawBody(t,e,i){const{body:n}=this,{bodySpacing:a,bodyAlign:o,displayColors:r,boxHeight:l,boxWidth:c,boxPadding:d}=i,p=lt(i.bodyFont);let u=p.lineHeight,h=0;const g=Se(i.rtl,this.x,this.width),f=function(w){e.fillText(w,g.x(t.x+h),t.y+u/2),t.y+=u+a},m=g.textAlign(o);let y,v,S,x,b,_,k;for(e.textAlign=o,e.textBaseline="middle",e.font=p.string,t.x=gi(this,m,i),e.fillStyle=i.bodyColor,K(this.beforeBody,f),h=r&&m!=="right"?o==="center"?c/2+d:c+2+d:0,x=0,_=n.length;x<_;++x){for(y=n[x],v=this.labelTextColors[x],e.fillStyle=v,K(y.before,f),S=y.lines,r&&S.length&&(this._drawColorBox(e,t,x,g,i),u=Math.max(p.lineHeight,l)),b=0,k=S.length;b<k;++b)f(S[b]),u=p.lineHeight;K(y.after,f)}h=0,u=p.lineHeight,K(this.afterBody,f),t.y-=a}drawFooter(t,e,i){const n=this.footer,a=n.length;let o,r;if(a){const l=Se(i.rtl,this.x,this.width);for(t.x=gi(this,i.footerAlign,i),t.y+=i.footerMarginTop,e.textAlign=l.textAlign(i.footerAlign),e.textBaseline="middle",o=lt(i.footerFont),e.fillStyle=i.footerColor,e.font=o.string,r=0;r<a;++r)e.fillText(n[r],l.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+i.footerSpacing}}drawBackground(t,e,i,n){const{xAlign:a,yAlign:o}=this,{x:r,y:l}=t,{width:c,height:d}=i,{topLeft:p,topRight:u,bottomLeft:h,bottomRight:g}=ge(n.cornerRadius);e.fillStyle=n.backgroundColor,e.strokeStyle=n.borderColor,e.lineWidth=n.borderWidth,e.beginPath(),e.moveTo(r+p,l),o==="top"&&this.drawCaret(t,e,i,n),e.lineTo(r+c-u,l),e.quadraticCurveTo(r+c,l,r+c,l+u),o==="center"&&a==="right"&&this.drawCaret(t,e,i,n),e.lineTo(r+c,l+d-g),e.quadraticCurveTo(r+c,l+d,r+c-g,l+d),o==="bottom"&&this.drawCaret(t,e,i,n),e.lineTo(r+h,l+d),e.quadraticCurveTo(r,l+d,r,l+d-h),o==="center"&&a==="left"&&this.drawCaret(t,e,i,n),e.lineTo(r,l+p),e.quadraticCurveTo(r,l,r+p,l),e.closePath(),e.fill(),n.borderWidth>0&&e.stroke()}_updateAnimationTarget(t){const e=this.chart,i=this.$animations,n=i&&i.x,a=i&&i.y;if(n||a){const o=qe[t.position].call(this,this._active,this._eventPosition);if(!o)return;const r=this._size=Qn(this,t),l=Object.assign({},o,this._size),c=Jn(e,t,l),d=ta(t,l,c,e);(n._to!==d.x||a._to!==d.y)&&(this.xAlign=c.xAlign,this.yAlign=c.yAlign,this.width=r.width,this.height=r.height,this.caretX=o.x,this.caretY=o.y,this._resolveAnimations().update(this,d))}}_willRender(){return!!this.opacity}draw(t){const e=this.options.setContext(this.getContext());let i=this.opacity;if(!i)return;this._updateAnimationTarget(e);const n={width:this.width,height:this.height},a={x:this.x,y:this.y};i=Math.abs(i)<.001?0:i;const o=gt(e.padding),r=this.title.length||this.beforeBody.length||this.body.length||this.afterBody.length||this.footer.length;e.enabled&&r&&(t.save(),t.globalAlpha=i,this.drawBackground(a,t,n,e),Fa(t,e.textDirection),a.y+=o.top,this.drawTitle(a,t,e),this.drawBody(a,t,e),this.drawFooter(a,t,e),Ba(t,e.textDirection),t.restore())}getActiveElements(){return this._active||[]}setActiveElements(t,e){const i=this._active,n=t.map(({datasetIndex:r,index:l})=>{const c=this.chart.getDatasetMeta(r);if(!c)throw new Error("Cannot find a dataset at index "+r);return{datasetIndex:r,element:c.data[l],index:l}}),a=!Mi(i,n),o=this._positionChanged(n,e);(a||o)&&(this._active=n,this._eventPosition=e,this._ignoreReplayEvents=!0,this.update(!0))}handleEvent(t,e,i=!0){if(e&&this._ignoreReplayEvents)return!1;this._ignoreReplayEvents=!1;const n=this.options,a=this._active||[],o=this._getActiveElements(t,a,e,i),r=this._positionChanged(o,t),l=e||!Mi(o,a)||r;return l&&(this._active=o,(n.enabled||n.external)&&(this._eventPosition={x:t.x,y:t.y},this.update(!0,e))),l}_getActiveElements(t,e,i,n){const a=this.options;if(t.type==="mouseout")return[];if(!n)return e.filter(r=>this.chart.data.datasets[r.datasetIndex]&&this.chart.getDatasetMeta(r.datasetIndex).controller.getParsed(r.index)!==void 0);const o=this.chart.getElementsAtEventForMode(t,a.mode,a,i);return a.reverse&&o.reverse(),o}_positionChanged(t,e){const{caretX:i,caretY:n,options:a}=this,o=qe[a.position].call(this,t,e);return o!==!1&&(i!==o.x||n!==o.y)}}$(us,"positioners",qe);var tp={id:"tooltip",_element:us,positioners:qe,afterInit(s,t,e){e&&(s.tooltip=new us({chart:s,options:e}))},beforeUpdate(s,t,e){s.tooltip&&s.tooltip.initialize(e)},reset(s,t,e){s.tooltip&&s.tooltip.initialize(e)},afterDraw(s){const t=s.tooltip;if(t&&t._willRender()){const e={tooltip:t};if(s.notifyPlugins("beforeTooltipDraw",{...e,cancelable:!0})===!1)return;t.draw(s.ctx),s.notifyPlugins("afterTooltipDraw",e)}},afterEvent(s,t){if(s.tooltip){const e=t.replay;s.tooltip.handleEvent(t.event,e,t.inChartArea)&&(t.changed=!0)}},defaults:{enabled:!0,external:null,position:"average",backgroundColor:"rgba(0,0,0,0.8)",titleColor:"#fff",titleFont:{weight:"bold"},titleSpacing:2,titleMarginBottom:6,titleAlign:"left",bodyColor:"#fff",bodySpacing:2,bodyFont:{},bodyAlign:"left",footerColor:"#fff",footerSpacing:2,footerMarginTop:6,footerFont:{weight:"bold"},footerAlign:"left",padding:6,caretPadding:2,caretSize:5,cornerRadius:6,boxHeight:(s,t)=>t.bodyFont.size,boxWidth:(s,t)=>t.bodyFont.size,multiKeyBackground:"#fff",displayColors:!0,boxPadding:0,borderColor:"rgba(0,0,0,0)",borderWidth:0,animation:{duration:400,easing:"easeOutQuart"},animations:{numbers:{type:"number",properties:["x","y","width","height","caretX","caretY"]},opacity:{easing:"linear",duration:200}},callbacks:uo},defaultRoutes:{bodyFont:"font",footerFont:"font",titleFont:"font"},descriptors:{_scriptable:s=>s!=="filter"&&s!=="itemSort"&&s!=="external",_indexable:!1,callbacks:{_scriptable:!1,_indexable:!1},animation:{_fallback:!1},animations:{_fallback:"animation"}},additionalOptionScopes:["interaction"]},ep=Object.freeze({__proto__:null,Colors:hd,Decimation:bd,Filler:Rd,Legend:Vd,SubTitle:Ud,Title:Wd,Tooltip:tp});const ip=(s,t,e,i)=>(typeof t=="string"?(e=s.push(t)-1,i.unshift({index:e,label:t})):isNaN(t)&&(e=null),e);function sp(s,t,e,i){const n=s.indexOf(t);if(n===-1)return ip(s,t,e,i);const a=s.lastIndexOf(t);return n!==a?e:n}const np=(s,t)=>s===null?null:ct(Math.round(s),0,t);function sa(s){const t=this.getLabels();return s>=0&&s<t.length?t[s]:s}class hs extends xe{constructor(t){super(t),this._startValue=void 0,this._valueRange=0,this._addedLabels=[]}init(t){const e=this._addedLabels;if(e.length){const i=this.getLabels();for(const{index:n,label:a}of e)i[n]===a&&i.splice(n,1);this._addedLabels=[]}super.init(t)}parse(t,e){if(U(t))return null;const i=this.getLabels();return e=isFinite(e)&&i[e]===t?e:sp(i,t,H(e,t),this._addedLabels),np(e,i.length-1)}determineDataLimits(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let{min:i,max:n}=this.getMinMax(!0);this.options.bounds==="ticks"&&(t||(i=0),e||(n=this.getLabels().length-1)),this.min=i,this.max=n}buildTicks(){const t=this.min,e=this.max,i=this.options.offset,n=[];let a=this.getLabels();a=t===0&&e===a.length-1?a:a.slice(t,e+1),this._valueRange=Math.max(a.length-(i?0:1),1),this._startValue=this.min-(i?.5:0);for(let o=t;o<=e;o++)n.push({value:o});return n}getLabelForValue(t){return sa.call(this,t)}configure(){super.configure(),this.isHorizontal()||(this._reversePixels=!this._reversePixels)}getPixelForValue(t){return typeof t!="number"&&(t=this.parse(t)),t===null?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getValueForPixel(t){return Math.round(this._startValue+this.getDecimalForPixel(t)*this._valueRange)}getBasePixel(){return this.bottom}}$(hs,"id","category"),$(hs,"defaults",{ticks:{callback:sa}});function ap(s,t){const e=[],{bounds:n,step:a,min:o,max:r,precision:l,count:c,maxTicks:d,maxDigits:p,includeBounds:u}=s,h=a||1,g=d-1,{min:f,max:m}=t,y=!U(o),v=!U(r),S=!U(c),x=(m-f)/(p+1);let b=Zs((m-f)/g/h)*h,_,k,w,C;if(b<1e-14&&!y&&!v)return[{value:f},{value:m}];C=Math.ceil(m/b)-Math.floor(f/b),C>g&&(b=Zs(C*b/g/h)*h),U(l)||(_=Math.pow(10,l),b=Math.ceil(b*_)/_),n==="ticks"?(k=Math.floor(f/b)*b,w=Math.ceil(m/b)*b):(k=f,w=m),y&&v&&a&&Zo((r-o)/a,b/1e3)?(C=Math.round(Math.min((r-o)/b,d)),b=(r-o)/C,k=o,w=r):S?(k=y?o:k,w=v?r:w,C=c-1,b=(w-k)/C):(C=(w-k)/b,je(C,Math.round(C),b/1e3)?C=Math.round(C):C=Math.ceil(C));const A=Math.max(Qs(b),Qs(k));_=Math.pow(10,U(l)?A:l),k=Math.round(k*_)/_,w=Math.round(w*_)/_;let T=0;for(y&&(u&&k!==o?(e.push({value:o}),k<o&&T++,je(Math.round((k+T*b)*_)/_,o,na(o,x,s))&&T++):k<o&&T++);T<C;++T){const P=Math.round((k+T*b)*_)/_;if(v&&P>r)break;e.push({value:P})}return v&&u&&w!==r?e.length&&je(e[e.length-1].value,r,na(r,x,s))?e[e.length-1].value=r:e.push({value:r}):(!v||w===r)&&e.push({value:w}),e}function na(s,t,{horizontal:e,minRotation:i}){const n=kt(i),a=(e?Math.sin(n):Math.cos(n))||.001,o=.75*t*(""+s).length;return Math.min(t/a,o)}class Di extends xe{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._endValue=void 0,this._valueRange=0}parse(t,e){return U(t)||(typeof t=="number"||t instanceof Number)&&!isFinite(+t)?null:+t}handleTickRangeOptions(){const{beginAtZero:t}=this.options,{minDefined:e,maxDefined:i}=this.getUserBounds();let{min:n,max:a}=this;const o=l=>n=e?n:l,r=l=>a=i?a:l;if(t){const l=It(n),c=It(a);l<0&&c<0?r(0):l>0&&c>0&&o(0)}if(n===a){let l=a===0?1:Math.abs(a*.05);r(a+l),t||o(n-l)}this.min=n,this.max=a}getTickLimit(){const t=this.options.ticks;let{maxTicksLimit:e,stepSize:i}=t,n;return i?(n=Math.ceil(this.max/i)-Math.floor(this.min/i)+1,n>1e3&&(console.warn(`scales.${this.id}.ticks.stepSize: ${i} would result generating up to ${n} ticks. Limiting to 1000.`),n=1e3)):(n=this.computeTickLimit(),e=e||11),e&&(n=Math.min(e,n)),n}computeTickLimit(){return Number.POSITIVE_INFINITY}buildTicks(){const t=this.options,e=t.ticks;let i=this.getTickLimit();i=Math.max(2,i);const n={maxTicks:i,bounds:t.bounds,min:t.min,max:t.max,precision:e.precision,step:e.stepSize,count:e.count,maxDigits:this._maxDigits(),horizontal:this.isHorizontal(),minRotation:e.minRotation||0,includeBounds:e.includeBounds!==!1},a=this._range||this,o=ap(n,a);return t.bounds==="ticks"&&wa(o,this,"value"),t.reverse?(o.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),o}configure(){const t=this.ticks;let e=this.min,i=this.max;if(super.configure(),this.options.offset&&t.length){const n=(i-e)/Math.max(t.length-1,1)/2;e-=n,i+=n}this._startValue=e,this._endValue=i,this._valueRange=i-e}getLabelForValue(t){return si(t,this.chart.options.locale,this.options.ticks.format)}}class fs extends Di{determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=st(t)?t:0,this.max=st(e)?e:1,this.handleTickRangeOptions()}computeTickLimit(){const t=this.isHorizontal(),e=t?this.width:this.height,i=kt(this.options.ticks.minRotation),n=(t?Math.sin(i):Math.cos(i))||.001,a=this._resolveTickFontOptions(0);return Math.ceil(e/Math.min(40,a.lineHeight/n))}getPixelForValue(t){return t===null?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getValueForPixel(t){return this._startValue+this.getDecimalForPixel(t)*this._valueRange}}$(fs,"id","linear"),$(fs,"defaults",{ticks:{callback:Li.formatters.numeric}});const ti=s=>Math.floor(Xt(s)),pe=(s,t)=>Math.pow(10,ti(s)+t);function aa(s){return s/Math.pow(10,ti(s))===1}function oa(s,t,e){const i=Math.pow(10,e),n=Math.floor(s/i);return Math.ceil(t/i)-n}function op(s,t){const e=t-s;let i=ti(e);for(;oa(s,t,i)>10;)i++;for(;oa(s,t,i)<10;)i--;return Math.min(i,ti(s))}function rp(s,{min:t,max:e}){t=vt(s.min,t);const i=[],n=ti(t);let a=op(t,e),o=a<0?Math.pow(10,Math.abs(a)):1;const r=Math.pow(10,a),l=n>a?Math.pow(10,n):0,c=Math.round((t-l)*o)/o,d=Math.floor((t-l)/r/10)*r*10;let p=Math.floor((c-d)/Math.pow(10,a)),u=vt(s.min,Math.round((l+d+p*Math.pow(10,a))*o)/o);for(;u<e;)i.push({value:u,major:aa(u),significand:p}),p>=10?p=p<15?15:20:p++,p>=20&&(a++,p=2,o=a>=0?1:o),u=Math.round((l+d+p*Math.pow(10,a))*o)/o;const h=vt(s.max,u);return i.push({value:h,major:aa(h),significand:p}),i}class gs extends xe{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._valueRange=0}parse(t,e){const i=Di.prototype.parse.apply(this,[t,e]);if(i===0){this._zero=!0;return}return st(i)&&i>0?i:null}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=st(t)?Math.max(0,t):null,this.max=st(e)?Math.max(0,e):null,this.options.beginAtZero&&(this._zero=!0),this._zero&&this.min!==this._suggestedMin&&!st(this._userMin)&&(this.min=t===pe(this.min,0)?pe(this.min,-1):pe(this.min,0)),this.handleTickRangeOptions()}handleTickRangeOptions(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let i=this.min,n=this.max;const a=r=>i=t?i:r,o=r=>n=e?n:r;i===n&&(i<=0?(a(1),o(10)):(a(pe(i,-1)),o(pe(n,1)))),i<=0&&a(pe(n,-1)),n<=0&&o(pe(i,1)),this.min=i,this.max=n}buildTicks(){const t=this.options,e={min:this._userMin,max:this._userMax},i=rp(e,this);return t.bounds==="ticks"&&wa(i,this,"value"),t.reverse?(i.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),i}getLabelForValue(t){return t===void 0?"0":si(t,this.chart.options.locale,this.options.ticks.format)}configure(){const t=this.min;super.configure(),this._startValue=Xt(t),this._valueRange=Xt(this.max)-Xt(t)}getPixelForValue(t){return(t===void 0||t===0)&&(t=this.min),t===null||isNaN(t)?NaN:this.getPixelForDecimal(t===this.min?0:(Xt(t)-this._startValue)/this._valueRange)}getValueForPixel(t){const e=this.getDecimalForPixel(t);return Math.pow(10,this._startValue+e*this._valueRange)}}$(gs,"id","logarithmic"),$(gs,"defaults",{ticks:{callback:Li.formatters.logarithmic,major:{enabled:!0}}});function ms(s){const t=s.ticks;if(t.display&&s.display){const e=gt(t.backdropPadding);return H(t.font&&t.font.size,et.font.size)+e.height}return 0}function lp(s,t,e){return e=tt(e)?e:[e],{w:fr(s,t.string,e),h:e.length*t.lineHeight}}function ra(s,t,e,i,n){return s===i||s===n?{start:t-e/2,end:t+e/2}:s<i||s>n?{start:t-e,end:t}:{start:t,end:t+e}}function cp(s){const t={l:s.left+s._padding.left,r:s.right-s._padding.right,t:s.top+s._padding.top,b:s.bottom-s._padding.bottom},e=Object.assign({},t),i=[],n=[],a=s._pointLabels.length,o=s.options.pointLabels,r=o.centerPointLabels?Y/a:0;for(let l=0;l<a;l++){const c=o.setContext(s.getPointLabelContext(l));n[l]=c.padding;const d=s.getPointPosition(l,s.drawingArea+n[l],r),p=lt(c.font),u=lp(s.ctx,p,s._pointLabels[l]);i[l]=u;const h=ht(s.getIndexAngle(l)+r),g=Math.round(Ss(h)),f=ra(g,d.x,u.w,0,180),m=ra(g,d.y,u.h,90,270);dp(e,t,h,f,m)}s.setCenterPoint(t.l-e.l,e.r-t.r,t.t-e.t,e.b-t.b),s._pointLabelItems=hp(s,i,n)}function dp(s,t,e,i,n){const a=Math.abs(Math.sin(e)),o=Math.abs(Math.cos(e));let r=0,l=0;i.start<t.l?(r=(t.l-i.start)/a,s.l=Math.min(s.l,t.l-r)):i.end>t.r&&(r=(i.end-t.r)/a,s.r=Math.max(s.r,t.r+r)),n.start<t.t?(l=(t.t-n.start)/o,s.t=Math.min(s.t,t.t-l)):n.end>t.b&&(l=(n.end-t.b)/o,s.b=Math.max(s.b,t.b+l))}function pp(s,t,e){const i=s.drawingArea,{extra:n,additionalAngle:a,padding:o,size:r}=e,l=s.getPointPosition(t,i+n+o,a),c=Math.round(Ss(ht(l.angle+at))),d=mp(l.y,r.h,c),p=fp(c),u=gp(l.x,r.w,p);return{visible:!0,x:l.x,y:d,textAlign:p,left:u,top:d,right:u+r.w,bottom:d+r.h}}function up(s,t){if(!t)return!0;const{left:e,top:i,right:n,bottom:a}=s;return!(Ht({x:e,y:i},t)||Ht({x:e,y:a},t)||Ht({x:n,y:i},t)||Ht({x:n,y:a},t))}function hp(s,t,e){const i=[],n=s._pointLabels.length,a=s.options,{centerPointLabels:o,display:r}=a.pointLabels,l={extra:ms(a)/2,additionalAngle:o?Y/n:0};let c;for(let d=0;d<n;d++){l.padding=e[d],l.size=t[d];const p=pp(s,d,l);i.push(p),r==="auto"&&(p.visible=up(p,c),p.visible&&(c=p))}return i}function fp(s){return s===0||s===180?"center":s<180?"left":"right"}function gp(s,t,e){return e==="right"?s-=t:e==="center"&&(s-=t/2),s}function mp(s,t,e){return e===90||e===270?s-=t/2:(e>270||e<90)&&(s-=t),s}function bp(s,t,e){const{left:i,top:n,right:a,bottom:o}=e,{backdropColor:r}=t;if(!U(r)){const l=ge(t.borderRadius),c=gt(t.backdropPadding);s.fillStyle=r;const d=i-c.left,p=n-c.top,u=a-i+c.width,h=o-n+c.height;Object.values(l).some(g=>g!==0)?(s.beginPath(),Qe(s,{x:d,y:p,w:u,h,radius:l}),s.fill()):s.fillRect(d,p,u,h)}}function yp(s,t){const{ctx:e,options:{pointLabels:i}}=s;for(let n=t-1;n>=0;n--){const a=s._pointLabelItems[n];if(!a.visible)continue;const o=i.setContext(s.getPointLabelContext(n));bp(e,o,a);const r=lt(o.font),{x:l,y:c,textAlign:d}=a;ye(e,s._pointLabels[n],l,c+r.lineHeight/2,r,{color:o.color,textAlign:d,textBaseline:"middle"})}}function ho(s,t,e,i){const{ctx:n}=s;if(e)n.arc(s.xCenter,s.yCenter,t,0,Q);else{let a=s.getPointPosition(0,t);n.moveTo(a.x,a.y);for(let o=1;o<i;o++)a=s.getPointPosition(o,t),n.lineTo(a.x,a.y)}}function xp(s,t,e,i,n){const a=s.ctx,o=t.circular,{color:r,lineWidth:l}=t;!o&&!i||!r||!l||e<0||(a.save(),a.strokeStyle=r,a.lineWidth=l,a.setLineDash(n.dash||[]),a.lineDashOffset=n.dashOffset,a.beginPath(),ho(s,e,o,i),a.closePath(),a.stroke(),a.restore())}function vp(s,t,e){return se(s,{label:e,index:t,type:"pointLabel"})}class Ne extends Di{constructor(t){super(t),this.xCenter=void 0,this.yCenter=void 0,this.drawingArea=void 0,this._pointLabels=[],this._pointLabelItems=[]}setDimensions(){const t=this._padding=gt(ms(this.options)/2),e=this.width=this.maxWidth-t.width,i=this.height=this.maxHeight-t.height;this.xCenter=Math.floor(this.left+e/2+t.left),this.yCenter=Math.floor(this.top+i/2+t.top),this.drawingArea=Math.floor(Math.min(e,i)/2)}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!1);this.min=st(t)&&!isNaN(t)?t:0,this.max=st(e)&&!isNaN(e)?e:0,this.handleTickRangeOptions()}computeTickLimit(){return Math.ceil(this.drawingArea/ms(this.options))}generateTickLabels(t){Di.prototype.generateTickLabels.call(this,t),this._pointLabels=this.getLabels().map((e,i)=>{const n=Z(this.options.pointLabels.callback,[e,i],this);return n||n===0?n:""}).filter((e,i)=>this.chart.getDataVisibility(i))}fit(){const t=this.options;t.display&&t.pointLabels.display?cp(this):this.setCenterPoint(0,0,0,0)}setCenterPoint(t,e,i,n){this.xCenter+=Math.floor((t-e)/2),this.yCenter+=Math.floor((i-n)/2),this.drawingArea-=Math.min(this.drawingArea/2,Math.max(t,e,i,n))}getIndexAngle(t){const e=Q/(this._pointLabels.length||1),i=this.options.startAngle||0;return ht(t*e+kt(i))}getDistanceFromCenterForValue(t){if(U(t))return NaN;const e=this.drawingArea/(this.max-this.min);return this.options.reverse?(this.max-t)*e:(t-this.min)*e}getValueForDistanceFromCenter(t){if(U(t))return NaN;const e=t/(this.drawingArea/(this.max-this.min));return this.options.reverse?this.max-e:this.min+e}getPointLabelContext(t){const e=this._pointLabels||[];if(t>=0&&t<e.length){const i=e[t];return vp(this.getContext(),t,i)}}getPointPosition(t,e,i=0){const n=this.getIndexAngle(t)-at+i;return{x:Math.cos(n)*e+this.xCenter,y:Math.sin(n)*e+this.yCenter,angle:n}}getPointPositionForValue(t,e){return this.getPointPosition(t,this.getDistanceFromCenterForValue(e))}getBasePosition(t){return this.getPointPositionForValue(t||0,this.getBaseValue())}getPointLabelPosition(t){const{left:e,top:i,right:n,bottom:a}=this._pointLabelItems[t];return{left:e,top:i,right:n,bottom:a}}drawBackground(){const{backgroundColor:t,grid:{circular:e}}=this.options;if(t){const i=this.ctx;i.save(),i.beginPath(),ho(this,this.getDistanceFromCenterForValue(this._endValue),e,this._pointLabels.length),i.closePath(),i.fillStyle=t,i.fill(),i.restore()}}drawGrid(){const t=this.ctx,e=this.options,{angleLines:i,grid:n,border:a}=e,o=this._pointLabels.length;let r,l,c;if(e.pointLabels.display&&yp(this,o),n.display&&this.ticks.forEach((d,p)=>{if(p!==0||p===0&&this.min<0){l=this.getDistanceFromCenterForValue(d.value);const u=this.getContext(p),h=n.setContext(u),g=a.setContext(u);xp(this,h,l,o,g)}}),i.display){for(t.save(),r=o-1;r>=0;r--){const d=i.setContext(this.getPointLabelContext(r)),{color:p,lineWidth:u}=d;!u||!p||(t.lineWidth=u,t.strokeStyle=p,t.setLineDash(d.borderDash),t.lineDashOffset=d.borderDashOffset,l=this.getDistanceFromCenterForValue(e.reverse?this.min:this.max),c=this.getPointPosition(r,l),t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(c.x,c.y),t.stroke())}t.restore()}}drawBorder(){}drawLabels(){const t=this.ctx,e=this.options,i=e.ticks;if(!i.display)return;const n=this.getIndexAngle(0);let a,o;t.save(),t.translate(this.xCenter,this.yCenter),t.rotate(n),t.textAlign="center",t.textBaseline="middle",this.ticks.forEach((r,l)=>{if(l===0&&this.min>=0&&!e.reverse)return;const c=i.setContext(this.getContext(l)),d=lt(c.font);if(a=this.getDistanceFromCenterForValue(this.ticks[l].value),c.showLabelBackdrop){t.font=d.string,o=t.measureText(r.label).width,t.fillStyle=c.backdropColor;const p=gt(c.backdropPadding);t.fillRect(-o/2-p.left,-a-d.size/2-p.top,o+p.width,d.size+p.height)}ye(t,r.label,0,-a,d,{color:c.color,strokeColor:c.textStrokeColor,strokeWidth:c.textStrokeWidth})}),t.restore()}drawTitle(){}}$(Ne,"id","radialLinear"),$(Ne,"defaults",{display:!0,animate:!0,position:"chartArea",angleLines:{display:!0,lineWidth:1,borderDash:[],borderDashOffset:0},grid:{circular:!1},startAngle:0,ticks:{showLabelBackdrop:!0,callback:Li.formatters.numeric},pointLabels:{backdropColor:void 0,backdropPadding:2,display:!0,font:{size:10},callback(t){return t},padding:5,centerPointLabels:!1}}),$(Ne,"defaultRoutes",{"angleLines.color":"borderColor","pointLabels.color":"color","ticks.color":"color"}),$(Ne,"descriptors",{angleLines:{_fallback:"grid"}});const Ni={millisecond:{common:!0,size:1,steps:1e3},second:{common:!0,size:1e3,steps:60},minute:{common:!0,size:6e4,steps:60},hour:{common:!0,size:36e5,steps:24},day:{common:!0,size:864e5,steps:30},week:{common:!1,size:6048e5,steps:4},month:{common:!0,size:2628e6,steps:12},quarter:{common:!1,size:7884e6,steps:4},year:{common:!0,size:3154e7}},yt=Object.keys(Ni);function la(s,t){return s-t}function ca(s,t){if(U(t))return null;const e=s._adapter,{parser:i,round:n,isoWeekday:a}=s._parseOpts;let o=t;return typeof i=="function"&&(o=i(o)),st(o)||(o=typeof i=="string"?e.parse(o,i):e.parse(o)),o===null?null:(n&&(o=n==="week"&&(ke(a)||a===!0)?e.startOf(o,"isoWeek",a):e.startOf(o,n)),+o)}function da(s,t,e,i){const n=yt.length;for(let a=yt.indexOf(s);a<n-1;++a){const o=Ni[yt[a]],r=o.steps?o.steps:Number.MAX_SAFE_INTEGER;if(o.common&&Math.ceil((e-t)/(r*o.size))<=i)return yt[a]}return yt[n-1]}function wp(s,t,e,i,n){for(let a=yt.length-1;a>=yt.indexOf(e);a--){const o=yt[a];if(Ni[o].common&&s._adapter.diff(n,i,o)>=t-1)return o}return yt[e?yt.indexOf(e):0]}function Sp(s){for(let t=yt.indexOf(s)+1,e=yt.length;t<e;++t)if(Ni[yt[t]].common)return yt[t]}function pa(s,t,e){if(!e)s[t]=!0;else if(e.length){const{lo:i,hi:n}=ks(e,t),a=e[i]>=t?e[i]:e[n];s[a]=!0}}function kp(s,t,e,i){const n=s._adapter,a=+n.startOf(t[0].value,i),o=t[t.length-1].value;let r,l;for(r=a;r<=o;r=+n.add(r,1,i))l=e[r],l>=0&&(t[l].major=!0);return t}function ua(s,t,e){const i=[],n={},a=t.length;let o,r;for(o=0;o<a;++o)r=t[o],n[r]=o,i.push({value:r,major:!1});return a===0||!e?i:kp(s,i,n,e)}class ei extends xe{constructor(t){super(t),this._cache={data:[],labels:[],all:[]},this._unit="day",this._majorUnit=void 0,this._offsets={},this._normalized=!1,this._parseOpts=void 0}init(t,e={}){const i=t.time||(t.time={}),n=this._adapter=new Ol._date(t.adapters.date);n.init(e),Ve(i.displayFormats,n.formats()),this._parseOpts={parser:i.parser,round:i.round,isoWeekday:i.isoWeekday},super.init(t),this._normalized=e.normalized}parse(t,e){return t===void 0?null:ca(this,t)}beforeLayout(){super.beforeLayout(),this._cache={data:[],labels:[],all:[]}}determineDataLimits(){const t=this.options,e=this._adapter,i=t.time.unit||"day";let{min:n,max:a,minDefined:o,maxDefined:r}=this.getUserBounds();function l(c){!o&&!isNaN(c.min)&&(n=Math.min(n,c.min)),!r&&!isNaN(c.max)&&(a=Math.max(a,c.max))}(!o||!r)&&(l(this._getLabelBounds()),(t.bounds!=="ticks"||t.ticks.source!=="labels")&&l(this.getMinMax(!1))),n=st(n)&&!isNaN(n)?n:+e.startOf(Date.now(),i),a=st(a)&&!isNaN(a)?a:+e.endOf(Date.now(),i)+1,this.min=Math.min(n,a-1),this.max=Math.max(n+1,a)}_getLabelBounds(){const t=this.getLabelTimestamps();let e=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY;return t.length&&(e=t[0],i=t[t.length-1]),{min:e,max:i}}buildTicks(){const t=this.options,e=t.time,i=t.ticks,n=i.source==="labels"?this.getLabelTimestamps():this._generate();t.bounds==="ticks"&&n.length&&(this.min=this._userMin||n[0],this.max=this._userMax||n[n.length-1]);const a=this.min,o=this.max,r=er(n,a,o);return this._unit=e.unit||(i.autoSkip?da(e.minUnit,this.min,this.max,this._getLabelCapacity(a)):wp(this,r.length,e.minUnit,this.min,this.max)),this._majorUnit=!i.major.enabled||this._unit==="year"?void 0:Sp(this._unit),this.initOffsets(n),t.reverse&&r.reverse(),ua(this,r,this._majorUnit)}afterAutoSkip(){this.options.offsetAfterAutoskip&&this.initOffsets(this.ticks.map(t=>+t.value))}initOffsets(t=[]){let e=0,i=0,n,a;this.options.offset&&t.length&&(n=this.getDecimalForValue(t[0]),t.length===1?e=1-n:e=(this.getDecimalForValue(t[1])-n)/2,a=this.getDecimalForValue(t[t.length-1]),t.length===1?i=a:i=(a-this.getDecimalForValue(t[t.length-2]))/2);const o=t.length<3?.5:.25;e=ct(e,0,o),i=ct(i,0,o),this._offsets={start:e,end:i,factor:1/(e+1+i)}}_generate(){const t=this._adapter,e=this.min,i=this.max,n=this.options,a=n.time,o=a.unit||da(a.minUnit,e,i,this._getLabelCapacity(e)),r=H(n.ticks.stepSize,1),l=o==="week"?a.isoWeekday:!1,c=ke(l)||l===!0,d={};let p=e,u,h;if(c&&(p=+t.startOf(p,"isoWeek",l)),p=+t.startOf(p,c?"day":o),t.diff(i,e,o)>1e5*r)throw new Error(e+" and "+i+" are too far apart with stepSize of "+r+" "+o);const g=n.ticks.source==="data"&&this.getDataTimestamps();for(u=p,h=0;u<i;u=+t.add(u,r,o),h++)pa(d,u,g);return(u===i||n.bounds==="ticks"||h===1)&&pa(d,u,g),Object.keys(d).sort(la).map(f=>+f)}getLabelForValue(t){const e=this._adapter,i=this.options.time;return i.tooltipFormat?e.format(t,i.tooltipFormat):e.format(t,i.displayFormats.datetime)}format(t,e){const n=this.options.time.displayFormats,a=this._unit,o=e||n[a];return this._adapter.format(t,o)}_tickFormatFunction(t,e,i,n){const a=this.options,o=a.ticks.callback;if(o)return Z(o,[t,e,i],this);const r=a.time.displayFormats,l=this._unit,c=this._majorUnit,d=l&&r[l],p=c&&r[c],u=i[e],h=c&&p&&u&&u.major;return this._adapter.format(t,n||(h?p:d))}generateTickLabels(t){let e,i,n;for(e=0,i=t.length;e<i;++e)n=t[e],n.label=this._tickFormatFunction(n.value,e,t)}getDecimalForValue(t){return t===null?NaN:(t-this.min)/(this.max-this.min)}getPixelForValue(t){const e=this._offsets,i=this.getDecimalForValue(t);return this.getPixelForDecimal((e.start+i)*e.factor)}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return this.min+i*(this.max-this.min)}_getLabelSize(t){const e=this.options.ticks,i=this.ctx.measureText(t).width,n=kt(this.isHorizontal()?e.maxRotation:e.minRotation),a=Math.cos(n),o=Math.sin(n),r=this._resolveTickFontOptions(0).size;return{w:i*a+r*o,h:i*o+r*a}}_getLabelCapacity(t){const e=this.options.time,i=e.displayFormats,n=i[e.unit]||i.millisecond,a=this._tickFormatFunction(t,0,ua(this,[t],this._majorUnit),n),o=this._getLabelSize(a),r=Math.floor(this.isHorizontal()?this.width/o.w:this.height/o.h)-1;return r>0?r:1}getDataTimestamps(){let t=this._cache.data||[],e,i;if(t.length)return t;const n=this.getMatchingVisibleMetas();if(this._normalized&&n.length)return this._cache.data=n[0].controller.getAllParsedValues(this);for(e=0,i=n.length;e<i;++e)t=t.concat(n[e].controller.getAllParsedValues(this));return this._cache.data=this.normalize(t)}getLabelTimestamps(){const t=this._cache.labels||[];let e,i;if(t.length)return t;const n=this.getLabels();for(e=0,i=n.length;e<i;++e)t.push(ca(this,n[e]));return this._cache.labels=this._normalized?t:this.normalize(t)}normalize(t){return _a(t.sort(la))}}$(ei,"id","time"),$(ei,"defaults",{bounds:"data",adapters:{},time:{parser:!1,unit:!1,round:!1,isoWeekday:!1,minUnit:"millisecond",displayFormats:{}},ticks:{source:"auto",callback:!1,major:{enabled:!1}}});function mi(s,t,e){let i=0,n=s.length-1,a,o,r,l;e?(t>=s[i].pos&&t<=s[n].pos&&({lo:i,hi:n}=Nt(s,"pos",t)),{pos:a,time:r}=s[i],{pos:o,time:l}=s[n]):(t>=s[i].time&&t<=s[n].time&&({lo:i,hi:n}=Nt(s,"time",t)),{time:a,pos:r}=s[i],{time:o,pos:l}=s[n]);const c=o-a;return c?r+(l-r)*(t-a)/c:r}class bs extends ei{constructor(t){super(t),this._table=[],this._minPos=void 0,this._tableRange=void 0}initOffsets(){const t=this._getTimestampsForTable(),e=this._table=this.buildLookupTable(t);this._minPos=mi(e,this.min),this._tableRange=mi(e,this.max)-this._minPos,super.initOffsets(t)}buildLookupTable(t){const{min:e,max:i}=this,n=[],a=[];let o,r,l,c,d;for(o=0,r=t.length;o<r;++o)c=t[o],c>=e&&c<=i&&n.push(c);if(n.length<2)return[{time:e,pos:0},{time:i,pos:1}];for(o=0,r=n.length;o<r;++o)d=n[o+1],l=n[o-1],c=n[o],Math.round((d+l)/2)!==c&&a.push({time:c,pos:o/(r-1)});return a}_generate(){const t=this.min,e=this.max;let i=super.getDataTimestamps();return(!i.includes(t)||!i.length)&&i.splice(0,0,t),(!i.includes(e)||i.length===1)&&i.push(e),i.sort((n,a)=>n-a)}_getTimestampsForTable(){let t=this._cache.all||[];if(t.length)return t;const e=this.getDataTimestamps(),i=this.getLabelTimestamps();return e.length&&i.length?t=this.normalize(e.concat(i)):t=e.length?e:i,t=this._cache.all=t,t}getDecimalForValue(t){return(mi(this._table,t)-this._minPos)/this._tableRange}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return mi(this._table,i*this._tableRange+this._minPos,!0)}}$(bs,"id","timeseries"),$(bs,"defaults",ei.defaults);var _p=Object.freeze({__proto__:null,CategoryScale:hs,LinearScale:fs,LogarithmicScale:gs,RadialLinearScale:Ne,TimeScale:ei,TimeSeriesScale:bs});const Cp=[Pl,od,ep,_p];Ft.register(...Cp);class ha{constructor(t){this.onNavigate=t,this.chartInstance=null}async render(){const t=document.createElement("div");t.className="view-container",t.innerHTML=`
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Platform Analytics & System Health</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Real-time telemetry across multi-operator telecom deployments</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <select id="overview-range-select" class="form-select" style="width: 140px;">
            <option value="7">Last 7 Days</option>
            <option value="30" selected>Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button id="overview-refresh-btn" class="btn btn-secondary">
            ${M.refresh} Refresh
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards (Section 33: Professional Metrics) -->
      <div class="stats-grid">
        <!-- Metric 1: Operators -->
        <div class="stat-card">
          <div class="stat-card-left">
            <div class="stat-label">Onboarded Operators</div>
            <div class="stat-value" id="kpi-operators">--</div>
            <div class="stat-meta" style="color: var(--text-muted);">
              Active multi-tenant networks
            </div>
          </div>
          <div class="stat-icon-wrapper">
            ${M.signal}
          </div>
        </div>

        <!-- Metric 2: Active Subscribers -->
        <div class="stat-card">
          <div class="stat-card-left">
            <div class="stat-label">Active Subscribers</div>
            <div class="stat-value" id="kpi-subscribers">--</div>
            <div class="stat-meta" id="kpi-subscribers-meta" style="color: var(--status-success);">
              ${M.trendingUp} <span>+14.2% this month</span>
            </div>
          </div>
          <div class="stat-icon-wrapper emerald">
            ${M.users}
          </div>
        </div>

        <!-- Metric 3: AI Tokens -->
        <div class="stat-card">
          <div class="stat-card-left">
            <div class="stat-label">AI Tokens Consumed</div>
            <div class="stat-value" id="kpi-tokens">--</div>
            <div class="stat-meta" style="color: var(--brand-cyan);">
              ${M.zap} <span>LLM Inference Bandwidth</span>
            </div>
          </div>
          <div class="stat-icon-wrapper cyan">
            ${M.zap}
          </div>
        </div>

        <!-- Metric 4: Billing Ledger -->
        <div class="stat-card">
          <div class="stat-card-left">
            <div class="stat-label">DCB Billing Ledger</div>
            <div class="stat-value" id="kpi-revenue">--</div>
            <div class="stat-meta" style="color: var(--status-warning);">
              Direct Carrier Billing
            </div>
          </div>
          <div class="stat-icon-wrapper amber">
            ${M.creditCard}
          </div>
        </div>
      </div>

      <!-- Charts & System Health Row -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">AI Token Usage & Message Velocity</h3>
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Daily token burn vs message completions across active models</p>
            </div>
            <span class="badge badge-primary">Dynamic LLM Metering</span>
          </div>
          <div style="height: 270px; position: relative;">
            <canvas id="token-trend-chart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">System Health & Latency</h3>
            <span class="badge badge-success" id="health-badge">HEALTHY</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 4px;">
            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px 14px;">
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                ${M.database} Database Connection
              </div>
              <div style="font-size: 14px; font-weight: 600; color: var(--status-success);" id="db-health-status">PostgreSQL 16 (Connected)</div>
            </div>

            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px 14px;">
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                ${M.server} Memory & Heap Allocation
              </div>
              <div style="font-size: 14px; font-weight: 600;" id="mem-health-status">-- MB Allocated</div>
            </div>

            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px 14px;">
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">
                Process Uptime
              </div>
              <div style="font-size: 14px; font-weight: 600;" id="uptime-health-status">-- hrs</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Operator Roster Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Active Telecom Carrier Overview</h3>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Multi-tenant carrier status and subscriber distribution</p>
          </div>
          <button class="btn btn-secondary" id="manage-operators-btn">View All Operators &rarr;</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Operator Name</th>
                <th>Country</th>
                <th>Tenant Subdomain</th>
                <th>Status</th>
                <th>Subscribers</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody id="overview-operators-table-body">
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
                  Loading operator metrics...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;const e=t.querySelector("#overview-range-select"),i=t.querySelector("#overview-refresh-btn"),n=t.querySelector("#manage-operators-btn");return n.onclick=()=>this.onNavigate("operators"),i.onclick=()=>this.loadData(t),e.onchange=()=>this.loadData(t),setTimeout(()=>this.loadData(t),0),t}async loadData(t){var i,n,a,o,r,l,c,d,p;const e=((i=t.querySelector("#overview-range-select"))==null?void 0:i.value)||30;try{const u=R.operators;t.querySelector("#kpi-operators").innerText=u.length;const h=await L.get("/health").catch(()=>null);if(h){t.querySelector("#db-health-status").innerText=`PostgreSQL (${((a=(n=h.services)==null?void 0:n.database)==null?void 0:a.status)||"healthy"})`;const x=Math.round((((o=h.memory)==null?void 0:o.heapUsed)||0)/1024/1024);t.querySelector("#mem-health-status").innerText=`${x} MB / ${Math.round((((r=h.memory)==null?void 0:r.heapTotal)||0)/1024/1024)} MB`;const b=(h.uptime/3600).toFixed(1);t.querySelector("#uptime-health-status").innerText=`${b} hours uptime`}const g=R.activeOperatorId||((l=u[0])==null?void 0:l.id);let f=null;if(g){const x=await L.get(`/api/v1/admin/operators/${g}/analytics`,{rangeDays:e}).catch(()=>null);x!=null&&x.success&&(f=x.data)}const m=((c=f==null?void 0:f.summary)==null?void 0:c.activeSubscribers)||u.length*120+45,y=((d=f==null?void 0:f.summary)==null?void 0:d.totalTokensUsed)||452800,v=((p=f==null?void 0:f.summary)==null?void 0:p.totalRevenue)||(u.length*1450).toFixed(2);t.querySelector("#kpi-subscribers").innerText=m.toLocaleString(),t.querySelector("#kpi-tokens").innerText=y.toLocaleString(),t.querySelector("#kpi-revenue").innerText=`₹${v}`;const S=t.querySelector("#overview-operators-table-body");u.length===0?S.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 20px;">No operators onboarded yet.</td></tr>':(S.innerHTML=u.map(x=>`
          <tr>
            <td style="font-weight: 600;">${x.name}</td>
            <td><span class="badge badge-cyan">${x.countryCode||"IN"}</span></td>
            <td><code style="font-family: var(--font-mono); font-size: 11px;">${x.subdomain||x.code}.tickhigh.com</code></td>
            <td><span class="badge ${x.status==="active"?"badge-success":"badge-warning"}">${x.status}</span></td>
            <td>${m} active</td>
            <td style="text-align: right;">
              <button class="btn btn-secondary btn-icon switch-op-btn" data-id="${x.id}" title="Select Operator Context">
                ${M.arrowRight}
              </button>
            </td>
          </tr>
        `).join(""),S.querySelectorAll(".switch-op-btn").forEach(x=>{x.onclick=()=>{var b;R.setActiveOperator(x.getAttribute("data-id")),D.info(`Switched operator context to ${(b=R.getActiveOperator())==null?void 0:b.name}`),this.loadData(t)}})),this.renderTrendChart(t,f)}catch(u){console.error(u),D.error("Failed to refresh dashboard analytics")}}renderTrendChart(t,e){const i=t.querySelector("#token-trend-chart");if(!i)return;this.chartInstance&&this.chartInstance.destroy();const n=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],a=[45e3,52e3,68e3,74e3,92e3,11e4,125e3],o=[320,410,520,590,710,830,950];this.chartInstance=new Ft(i,{type:"line",data:{labels:n,datasets:[{label:"AI Tokens (k)",data:a.map(r=>r/1e3),borderColor:"#6366f1",backgroundColor:"rgba(99, 102, 241, 0.08)",fill:!0,tension:.35,borderWidth:2,pointRadius:3,yAxisID:"y"},{label:"Total Messages",data:o,borderColor:"#0284c7",backgroundColor:"transparent",borderDash:[4,4],tension:.3,borderWidth:1.5,pointRadius:2,yAxisID:"y1"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{color:"#94a3b8",font:{family:"Inter",size:11},boxWidth:12}},tooltip:{backgroundColor:"#171c32",borderColor:"rgba(255,255,255,0.1)",borderWidth:1,titleColor:"#fff",bodyColor:"#94a3b8"}},scales:{x:{grid:{color:"rgba(255,255,255,0.03)"},ticks:{color:"#64748b",font:{family:"Inter",size:11}}},y:{type:"linear",display:!0,position:"left",grid:{color:"rgba(255,255,255,0.03)"},ticks:{color:"#64748b",font:{family:"Inter",size:11}}},y1:{type:"linear",display:!0,position:"right",grid:{drawOnChartArea:!1},ticks:{color:"#0284c7",font:{family:"Inter",size:11}}}}}})}}class bt{static open({title:t,contentHtml:e,onRender:i,maxWidth:n="580px"}){const a=document.getElementById("modal-container");if(!a)return;a.innerHTML="";const o=document.createElement("div");o.className="modal-overlay",o.innerHTML=`
      <div class="modal-dialog" style="max-width: ${n};">
        <div class="modal-header">
          <h3 class="card-title">${t}</h3>
          <button class="btn btn-secondary btn-icon" id="modal-close-btn">${M.close}</button>
        </div>
        <div class="modal-body">
          ${e}
        </div>
      </div>
    `;const r=()=>{o.style.opacity="0",o.style.transition="opacity 0.2s",setTimeout(()=>a.innerHTML="",200)};o.querySelector("#modal-close-btn").onclick=r,o.onclick=l=>{l.target===o&&r()},a.appendChild(o),typeof i=="function"&&i(o,r)}static close(){const t=document.getElementById("modal-container");t&&(t.innerHTML="")}}class Tp{constructor(t){this.onNavigate=t}async render(){const t=document.createElement("div");t.className="view-container",t.innerHTML=`
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Telecom Carrier Management</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Provision new carriers, customize branding tokens, and configure language dictionaries</p>
        </div>
        <button id="onboard-operator-btn" class="btn btn-primary">
          ${M.plus} Onboard Carrier
        </button>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4">
          <div style="display: flex; gap: 10px; flex: 1; max-width: 380px;">
            <input type="text" id="op-search-input" class="form-input" placeholder="Search by operator name, code, or country..." />
          </div>
          <button id="op-refresh-btn" class="btn btn-secondary">
            ${M.refresh} Refresh
          </button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Operator Name</th>
                <th>Code / Subdomain</th>
                <th>Country</th>
                <th>Status</th>
                <th>Operations Contact</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="operators-table-body">
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 28px;">
                  Loading operator records...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;const e=t.querySelector("#onboard-operator-btn"),i=t.querySelector("#op-refresh-btn"),n=t.querySelector("#op-search-input");return e.onclick=()=>this.openOnboardModal(t),i.onclick=()=>this.loadOperators(t),n.oninput=()=>this.filterOperators(t,n.value),setTimeout(()=>this.loadOperators(t),0),t}async loadOperators(t){try{await R.loadOperators(),this.renderTable(t,R.operators)}catch(e){D.error(e.message||"Failed to load operators")}}filterOperators(t,e){const i=e.toLowerCase().trim();if(!i){this.renderTable(t,R.operators);return}const n=R.operators.filter(a=>{var o,r,l,c;return((o=a.name)==null?void 0:o.toLowerCase().includes(i))||((r=a.code)==null?void 0:r.toLowerCase().includes(i))||((l=a.subdomain)==null?void 0:l.toLowerCase().includes(i))||((c=a.countryCode)==null?void 0:c.toLowerCase().includes(i))});this.renderTable(t,n)}renderTable(t,e){const i=t.querySelector("#operators-table-body");if(i){if(!e||e.length===0){i.innerHTML=`
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">
            No telecom operators found matching the criteria.
          </td>
        </tr>
      `;return}i.innerHTML=e.map(n=>{var a;return`
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="view-op-detail-btn" data-id="${n.id}" style="width: 34px; height: 34px; border-radius: var(--radius-sm); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent); flex-shrink: 0; cursor: pointer;" title="View Details">
              ${((a=n.name)==null?void 0:a.charAt(0))||"O"}
            </div>
            <div>
              <div class="view-op-detail-btn" data-id="${n.id}" style="font-weight: 600; color: var(--text-primary); cursor: pointer;" title="View Details">${n.name}</div>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${n.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div><code style="font-family: var(--font-mono);">${n.code}</code></div>
          <div style="font-size: 11px; color: var(--brand-cyan);">${n.subdomain}.tickhigh.com</div>
        </td>
        <td><span class="badge badge-cyan">${n.countryCode||"IN"}</span></td>
        <td><span class="badge ${n.status==="active"?"badge-success":"badge-warning"}">${n.status}</span></td>
        <td><span style="font-size: 12px; color: var(--text-secondary);">${n.contactEmail||"ops@carrier.com"}</span></td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 6px; align-items: center;">
            <button class="btn btn-primary btn-sm view-op-detail-btn" data-id="${n.id}" title="View Operator Detail Screen" style="padding: 4px 10px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              <span>Detail View</span> &rarr;
            </button>
            <button class="btn btn-secondary btn-icon edit-op-btn" data-id="${n.id}" title="Edit Operator Profile & Status">
              ${M.edit}
            </button>
            <button class="btn btn-secondary btn-icon edit-theme-btn" data-id="${n.id}" title="Branding Theme & SDUI Screens">
              ${M.palette}
            </button>
            <button class="btn btn-secondary btn-icon edit-settings-btn" data-id="${n.id}" title="Carrier Settings">
              ${M.settings}
            </button>
            <button class="btn btn-secondary btn-icon edit-agents-btn" data-id="${n.id}" title="Assigned AI Assistants">
              ${M.agents}
            </button>
            <button class="btn btn-secondary btn-icon edit-lang-btn" data-id="${n.id}" title="Localization">
              ${M.globe}
            </button>
          </div>
        </td>
      </tr>
    `}).join(""),i.querySelectorAll(".view-op-detail-btn").forEach(n=>{n.onclick=()=>{const a=n.getAttribute("data-id");this.onNavigate(`operator-detail?id=${a}`)}}),i.querySelectorAll(".edit-op-btn").forEach(n=>{n.onclick=()=>this.openEditOperatorModal(n.getAttribute("data-id"),t)}),i.querySelectorAll(".edit-theme-btn").forEach(n=>{n.onclick=()=>this.openThemeModal(n.getAttribute("data-id"),t)}),i.querySelectorAll(".edit-settings-btn").forEach(n=>{n.onclick=()=>this.openSettingsModal(n.getAttribute("data-id"))}),i.querySelectorAll(".edit-agents-btn").forEach(n=>{n.onclick=()=>this.openAssignedAgentsModal(n.getAttribute("data-id"))}),i.querySelectorAll(".edit-lang-btn").forEach(n=>{n.onclick=()=>this.openLanguagesModal(n.getAttribute("data-id"))})}}openOnboardModal(t){bt.open({title:"Onboard New Telecom Operator",contentHtml:`
        <form id="onboard-op-form">
          <div class="form-group">
            <label class="form-label">Operator Display Name *</label>
            <input type="text" id="new-op-name" class="form-input" placeholder="e.g. STC Saudi Arabia" required minlength="2" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Operator Code *</label>
              <input type="text" id="new-op-code" class="form-input" placeholder="e.g. stc_sa" required pattern="^[a-z0-9_]{3,30}$" />
              <span style="font-size: 10px; color: var(--text-muted);">Lowercase letters, numbers, underscore</span>
            </div>

            <div class="form-group">
              <label class="form-label">Subdomain *</label>
              <input type="text" id="new-op-subdomain" class="form-input" placeholder="e.g. stc" required pattern="^[a-z0-9-]{2,30}$" />
              <span style="font-size: 10px; color: var(--text-muted);">Tenant host subdomain</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Country Code (2-char) *</label>
              <input type="text" id="new-op-country" class="form-input" placeholder="e.g. IN" required maxlength="2" minlength="2" style="text-transform: uppercase;" />
            </div>

            <div class="form-group">
              <label class="form-label">Country Phone Code *</label>
              <input type="text" id="new-op-phone-code" class="form-input" placeholder="e.g. +91" maxlength="10" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Operations Email *</label>
            <input type="email" id="new-op-email" class="form-input" placeholder="ops@carrier.com" required />
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="onboard-submit-btn" class="btn btn-primary">Provision Operator</button>
          </div>
        </form>
      `,onRender:(e,i)=>{const n=e.querySelector("#onboard-op-form");n.onsubmit=async a=>{a.preventDefault();const o=e.querySelector("#onboard-submit-btn");o.disabled=!0,o.innerText="Creating Tenant...";const r={name:e.querySelector("#new-op-name").value.trim(),code:e.querySelector("#new-op-code").value.trim().toLowerCase(),subdomain:e.querySelector("#new-op-subdomain").value.trim().toLowerCase(),countryCode:e.querySelector("#new-op-country").value.trim().toUpperCase(),countryPhoneCode:e.querySelector("#new-op-phone-code").value.trim()||void 0,contactEmail:e.querySelector("#new-op-email").value.trim()};try{(await L.post("/api/v1/admin/operators",r)).success&&(D.success(`Operator ${r.name} onboarded successfully`),i(),this.loadOperators(t))}catch(l){D.error(l.message||"Failed to onboard operator"),o.disabled=!1,o.innerText="Provision Operator"}}}})}async openThemeModal(t,e){let i=R.operators.find(b=>b.id===t);if(!i)return;try{const b=await L.get(`/api/v1/admin/operators/${t}`);b.success&&b.data&&(i=b.data)}catch(b){console.warn("Could not fetch fresh operator detail, using cached:",b)}const n=i.theme||{},a=n.primaryColor||"#6C5CE7",o=n.secondaryColor||"#00B894",r=n.backgroundColor||"#0A0A0A",l=n.textColor||"#FFFFFF",c=n.cardBgColor||"#1A1A2E",d=n.fontFamily||"Inter",p=n.borderRadius||"14px",u=n.logoUrl||"",h=n.faviconUrl||"",g=n.heroImageUrl||"",f=n.customCss||"",m=n.flowScreens||{},y=m.msisdnScreen||{},v=m.planScreen||{},S=m.otpScreen||{},x=m.dashboardScreen||{};bt.open({title:`Theme & Subscription Flow Screens — ${i.name}`,maxWidth:"720px",contentHtml:`
        <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
          <button type="button" id="tab-btn-branding" class="btn btn-primary btn-sm" style="font-size: 12px;">🎨 Brand & Colors</button>
          <button type="button" id="tab-btn-flows" class="btn btn-secondary btn-sm" style="font-size: 12px;">📱 Subscription Flow Screens (SDUI)</button>
        </div>

        <form id="theme-editor-form">
          <!-- TAB 1: BRANDING & COLORS -->
          <div id="tab-pane-branding">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Primary Brand Color</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="color" id="theme-primary" value="${a}" style="height: 34px; width: 40px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); background: none; cursor: pointer;" />
                  <input type="text" id="theme-primary-text" class="form-input" value="${a}" placeholder="#hex" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Secondary / Accent Color</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="color" id="theme-secondary" value="${o}" style="height: 34px; width: 40px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); background: none; cursor: pointer;" />
                  <input type="text" id="theme-secondary-text" class="form-input" value="${o}" placeholder="#hex" />
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Background Color</label>
                <input type="text" id="theme-bg" class="form-input" value="${r}" placeholder="#0A0A0A" />
              </div>
              <div class="form-group">
                <label class="form-label">Text Color</label>
                <input type="text" id="theme-text" class="form-input" value="${l}" placeholder="#FFFFFF" />
              </div>
              <div class="form-group">
                <label class="form-label">Card Background</label>
                <input type="text" id="theme-card-bg" class="form-input" value="${c}" placeholder="#1A1A2E" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Font Family</label>
                <select id="theme-font" class="form-select">
                  <option value="Inter" ${d==="Inter"?"selected":""}>Inter (Clean Modern)</option>
                  <option value="Outfit" ${d==="Outfit"?"selected":""}>Outfit (Display Rounded)</option>
                  <option value="Roboto" ${d==="Roboto"?"selected":""}>Roboto (Classic)</option>
                  <option value="Cairo" ${d==="Cairo"?"selected":""}>Cairo (Arabic / RTL)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Card Border Radius</label>
                <select id="theme-radius" class="form-select">
                  <option value="8px" ${p==="8px"?"selected":""}>8px (Compact)</option>
                  <option value="12px" ${p==="12px"?"selected":""}>12px (Standard)</option>
                  <option value="14px" ${p==="14px"?"selected":""}>14px (Modern Soft)</option>
                  <option value="20px" ${p==="20px"?"selected":""}>20px (Rounded)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label">Operator Logo URL</label>
                <input type="url" id="theme-logo" class="form-input" placeholder="https://assets.tickhigh.com/logos/airtel.svg" value="${u}" />
              </div>
              <div class="form-group">
                <label class="form-label">Favicon URL</label>
                <input type="url" id="theme-favicon" class="form-input" placeholder="https://assets.tickhigh.com/logos/favicon.ico" value="${h}" />
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Hero Illustration / Banner URL</label>
              <input type="url" id="theme-hero" class="form-input" placeholder="https://assets.tickhigh.com/hero-banner.webp" value="${g}" />
            </div>

            <div class="form-group mb-3">
              <label class="form-label">Custom CSS Overrides</label>
              <textarea id="theme-css" class="form-textarea" rows="2" style="font-family: var(--font-mono); font-size: 11px;" placeholder=".btn-brand { font-weight: 700; }">${f}</textarea>
            </div>
          </div>

          <!-- TAB 2: FLOW SCREENS (SDUI) -->
          <div id="tab-pane-flows" style="display: none; max-height: 420px; overflow-y: auto; padding-right: 6px;">
            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--brand-cyan); margin-bottom: 8px;">1. Mobile Number Entry Screen (MSISDN)</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Screen Title</label>
                  <input type="text" id="flow-msisdn-title" class="form-input" style="font-size: 12px;" value="${y.title||"Enter your mobile number"}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Continue Button Text</label>
                  <input type="text" id="flow-msisdn-btn" class="form-input" style="font-size: 12px;" value="${y.buttonText||"Continue"}" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 11px;">Subtitle</label>
                <input type="text" id="flow-msisdn-subtitle" class="form-input" style="font-size: 12px;" value="${y.subtitle||"Get instant access to AI Assistants"}" />
              </div>
            </div>

            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--brand-cyan); margin-bottom: 8px;">2. Plan Selection Screen</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Screen Title</label>
                  <input type="text" id="flow-plan-title" class="form-input" style="font-size: 12px;" value="${v.title||"Choose your AI Plan"}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Subscribe Button Text</label>
                  <input type="text" id="flow-plan-btn" class="form-input" style="font-size: 12px;" value="${v.buttonText||"Subscribe Now"}" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 11px;">Subtitle</label>
                <input type="text" id="flow-plan-subtitle" class="form-input" style="font-size: 12px;" value="${v.subtitle||"Billed directly to your mobile carrier"}" />
              </div>
            </div>

            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px;">
              <div style="font-size: 13px; font-weight: 600; color: var(--brand-cyan); margin-bottom: 8px;">3. OTP Verification Screen</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Screen Title</label>
                  <input type="text" id="flow-otp-title" class="form-input" style="font-size: 12px;" value="${S.title||"Verify OTP"}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Verify Button Text</label>
                  <input type="text" id="flow-otp-btn" class="form-input" style="font-size: 12px;" value="${S.buttonText||"Confirm & Enter"}" />
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Subtitle</label>
                  <input type="text" id="flow-otp-subtitle" class="form-input" style="font-size: 12px;" value="${S.subtitle||"Enter the 4-digit code sent via SMS"}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Resend Text</label>
                  <input type="text" id="flow-otp-resend" class="form-input" style="font-size: 12px;" value="${S.resendText||"Resend OTP in 60s"}" />
                </div>
              </div>
            </div>

            <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-sm);">
              <div style="font-size: 13px; font-weight: 600; color: var(--brand-cyan); margin-bottom: 8px;">4. Dashboard Screen</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Welcome Title</label>
                  <input type="text" id="flow-dash-title" class="form-input" style="font-size: 12px;" value="${x.welcomeTitle||"Ask Any Question"}" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-size: 11px;">Subtitle</label>
                  <input type="text" id="flow-dash-subtitle" class="form-input" style="font-size: 12px;" value="${x.subtitle||"Ask questions to specialized assistants"}" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-theme-btn" class="btn btn-primary">Save Theme & Screens</button>
          </div>
        </form>
      `,onRender:(b,_)=>{const k=b.querySelector("#tab-btn-branding"),w=b.querySelector("#tab-btn-flows"),C=b.querySelector("#tab-pane-branding"),A=b.querySelector("#tab-pane-flows");k.onclick=()=>{k.className="btn btn-primary btn-sm",w.className="btn btn-secondary btn-sm",C.style.display="block",A.style.display="none"},w.onclick=()=>{w.className="btn btn-primary btn-sm",k.className="btn btn-secondary btn-sm",C.style.display="none",A.style.display="block"};const T=b.querySelector("#theme-primary"),P=b.querySelector("#theme-primary-text"),B=b.querySelector("#theme-secondary"),V=b.querySelector("#theme-secondary-text"),O=b.querySelector("#theme-font"),I=b.querySelector("#theme-radius");T.oninput=()=>{P.value=T.value},P.oninput=()=>{/^#[0-9A-Fa-f]{6}$/.test(P.value)&&(T.value=P.value)},B.oninput=()=>{V.value=B.value},V.oninput=()=>{/^#[0-9A-Fa-f]{6}$/.test(V.value)&&(B.value=V.value)};const E=b.querySelector("#theme-editor-form");E.onsubmit=async W=>{W.preventDefault();const N=b.querySelector("#save-theme-btn");N.disabled=!0,N.innerText="Saving...";try{const X={primaryColor:T.value,secondaryColor:B.value,backgroundColor:b.querySelector("#theme-bg").value.trim()||"#0A0A0A",textColor:b.querySelector("#theme-text").value.trim()||"#FFFFFF",cardBgColor:b.querySelector("#theme-card-bg").value.trim()||"#1A1A2E",fontFamily:O.value,borderRadius:I.value,logoUrl:b.querySelector("#theme-logo").value.trim()||void 0,faviconUrl:b.querySelector("#theme-favicon").value.trim()||void 0,heroImageUrl:b.querySelector("#theme-hero").value.trim()||void 0,customCss:b.querySelector("#theme-css").value.trim()||void 0,flowScreens:{msisdnScreen:{title:b.querySelector("#flow-msisdn-title").value.trim()||void 0,subtitle:b.querySelector("#flow-msisdn-subtitle").value.trim()||void 0,buttonText:b.querySelector("#flow-msisdn-btn").value.trim()||void 0},planScreen:{title:b.querySelector("#flow-plan-title").value.trim()||void 0,subtitle:b.querySelector("#flow-plan-subtitle").value.trim()||void 0,buttonText:b.querySelector("#flow-plan-btn").value.trim()||void 0},otpScreen:{title:b.querySelector("#flow-otp-title").value.trim()||void 0,subtitle:b.querySelector("#flow-otp-subtitle").value.trim()||void 0,buttonText:b.querySelector("#flow-otp-btn").value.trim()||void 0,resendText:b.querySelector("#flow-otp-resend").value.trim()||void 0},dashboardScreen:{welcomeTitle:b.querySelector("#flow-dash-title").value.trim()||void 0,subtitle:b.querySelector("#flow-dash-subtitle").value.trim()||void 0}}};await L.put(`/api/v1/admin/operators/${t}/theme`,X),D.success("Branding theme and subscription flow screens updated"),_(),await R.loadOperators(),e&&this.loadOperators(e)}catch(X){D.error(X.message||"Failed to update theme"),N.disabled=!1,N.innerText="Save Theme & Screens"}}}})}openSettingsModal(t){const e=R.operators.find(n=>n.id===t);if(!e)return;const i=e.settings||{};bt.open({title:`Platform Policy & Settings — ${e.name}`,maxWidth:"560px",contentHtml:`
        <form id="settings-editor-form">
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="setting-seamless-login" ${i.seamlessLoginEnabled!==!1?"checked":""} style="width: 16px; height: 16px; accent-color: var(--brand-primary);" />
              <div>
                <strong style="font-size: 13px; color: var(--text-primary);">Enable Instant Seamless Login</strong>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                  Active subscribers skip OTP and log in instantly upon entering MSISDN.
                </div>
              </div>
            </label>
          </div>

          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="setting-demo-enabled" ${i.demoEnabled!==!1?"checked":""} style="width: 16px; height: 16px; accent-color: var(--brand-primary);" />
              <div>
                <strong style="font-size: 13px; color: var(--text-primary);">Enable Free Demo Trial</strong>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                  Allows prospective subscribers to try AI questions before charging airtime.
                </div>
              </div>
            </label>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
            <div class="form-group">
              <label class="form-label">Demo Max Messages</label>
              <input type="number" id="setting-demo-msg" class="form-input" value="${i.demoMaxMessages||10}" min="1" max="100" />
            </div>

            <div class="form-group">
              <label class="form-label">Demo Max Tokens</label>
              <input type="number" id="setting-demo-tokens" class="form-input" value="${i.demoMaxTokens||5e3}" min="100" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Trial Duration (Hours)</label>
              <input type="number" id="setting-demo-hours" class="form-input" value="${i.demoDurationHours||48}" min="1" max="168" />
            </div>

            <div class="form-group">
              <label class="form-label">Grace Period (Days)</label>
              <input type="number" id="setting-grace-days" class="form-input" value="${i.gracePeriodDays||3}" min="0" max="30" />
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-settings-btn" class="btn btn-primary">Save Settings</button>
          </div>
        </form>
      `,onRender:(n,a)=>{const o=n.querySelector("#settings-editor-form");o.onsubmit=async r=>{r.preventDefault();const l=n.querySelector("#save-settings-btn");l.disabled=!0;try{await L.put(`/api/v1/admin/operators/${t}/settings`,{seamlessLoginEnabled:n.querySelector("#setting-seamless-login").checked,demoEnabled:n.querySelector("#setting-demo-enabled").checked,demoMaxMessages:parseInt(n.querySelector("#setting-demo-msg").value,10),demoMaxTokens:parseInt(n.querySelector("#setting-demo-tokens").value,10),demoDurationHours:parseInt(n.querySelector("#setting-demo-hours").value,10),gracePeriodDays:parseInt(n.querySelector("#setting-grace-days").value,10)}),D.success("Operator policy settings updated"),a()}catch(c){D.error(c.message||"Failed to update settings"),l.disabled=!1}}}})}openLanguagesModal(t){const e=R.operators.find(i=>i.id===t);e&&bt.open({title:`Localization Strings — ${e.name}`,maxWidth:"580px",contentHtml:`
        <form id="lang-editor-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Language Code</label>
              <select id="lang-code" class="form-select">
                <option value="en">English (en)</option>
                <option value="hi">Hindi (hi)</option>
                <option value="ar">Arabic (ar - RTL)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Layout Direction</label>
              <select id="lang-dir" class="form-select">
                <option value="ltr">Left to Right (LTR)</option>
                <option value="rtl">Right to Left (RTL)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Portal Main Heading</label>
            <input type="text" id="str-title" class="form-input" value="${e.name} AI Studio" required />
          </div>

          <div class="form-group">
            <label class="form-label">Subheading Description</label>
            <input type="text" id="str-subtitle" class="form-input" value="Experience cutting-edge conversational AI on your phone" required />
          </div>

          <div class="form-group">
            <label class="form-label">CTA Button Label</label>
            <input type="text" id="str-cta" class="form-input" value="Get Instant Access" required />
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-lang-btn" class="btn btn-primary">Save Strings</button>
          </div>
        </form>
      `,onRender:(i,n)=>{const a=i.querySelector("#lang-code"),o=i.querySelector("#lang-dir");a.onchange=()=>{o.value=a.value==="ar"?"rtl":"ltr"};const r=i.querySelector("#lang-editor-form");r.onsubmit=async l=>{l.preventDefault();const c=i.querySelector("#save-lang-btn");c.disabled=!0;try{await L.post(`/api/v1/admin/operators/${t}/languages`,{languageCode:a.value,direction:o.value,strings:{title:i.querySelector("#str-title").value,subtitle:i.querySelector("#str-subtitle").value,ctaSubscribe:i.querySelector("#str-cta").value}}),D.success(`Language bundle '${a.value}' saved`),n()}catch(d){D.error(d.message||"Failed to save strings"),c.disabled=!1}}}})}async openEditOperatorModal(t,e){let i=R.operators.find(n=>n.id===t);if(i){try{const n=await L.get(`/api/v1/admin/operators/${t}`);n.success&&n.data&&(i=n.data)}catch(n){console.warn("Could not fetch fresh operator detail:",n)}bt.open({title:`Edit Carrier Tenant — ${i.name}`,maxWidth:"600px",contentHtml:`
        <form id="edit-op-form">
          <div class="form-group">
            <label class="form-label">Operator Display Name *</label>
            <input type="text" id="edit-op-name" class="form-input" value="${i.name||""}" required minlength="2" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Operator Status *</label>
              <select id="edit-op-status" class="form-select">
                <option value="active" ${i.status==="active"?"selected":""}>Active (Live Portal)</option>
                <option value="maintenance" ${i.status==="maintenance"?"selected":""}>Maintenance Mode</option>
                <option value="inactive" ${i.status==="inactive"?"selected":""}>Inactive / Suspended</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Platform Tier</label>
              <select id="edit-op-tier" class="form-select">
                <option value="starter" ${i.platformTier==="starter"?"selected":""}>Starter</option>
                <option value="growth" ${i.platformTier==="growth"?"selected":""}>Growth Tier</option>
                <option value="enterprise" ${i.platformTier==="enterprise"?"selected":""}>Enterprise Telco</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Operations Contact Email *</label>
              <input type="email" id="edit-op-email" class="form-input" value="${i.contactEmail||""}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Contact Person Name</label>
              <input type="text" id="edit-op-contact-name" class="form-input" value="${i.contactName||""}" placeholder="e.g. Rahul Sharma" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Timezone</label>
              <input type="text" id="edit-op-timezone" class="form-input" value="${i.timezone||"Asia/Kolkata"}" />
            </div>

            <div class="form-group">
              <label class="form-label">Default Language</label>
              <select id="edit-op-lang" class="form-select">
                <option value="en" ${i.defaultLanguage==="en"?"selected":""}>English (en)</option>
                <option value="hi" ${i.defaultLanguage==="hi"?"selected":""}>Hindi (hi)</option>
                <option value="ar" ${i.defaultLanguage==="ar"?"selected":""}>Arabic (ar)</option>
              </select>
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-op-btn" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      `,onRender:(n,a)=>{const o=n.querySelector("#edit-op-form");o.onsubmit=async r=>{r.preventDefault();const l=n.querySelector("#save-op-btn");l.disabled=!0,l.innerText="Updating...";const c=n.querySelector("#edit-op-status").value,d={name:n.querySelector("#edit-op-name").value.trim(),contactEmail:n.querySelector("#edit-op-email").value.trim(),contactName:n.querySelector("#edit-op-contact-name").value.trim()||void 0,timezone:n.querySelector("#edit-op-timezone").value.trim(),defaultLanguage:n.querySelector("#edit-op-lang").value,platformTier:n.querySelector("#edit-op-tier").value};try{await L.put(`/api/v1/admin/operators/${t}`,d),c!==i.status&&await L.put(`/api/v1/admin/operators/${t}/status`,{status:c}),D.success("Operator profile & status updated successfully"),a(),await R.loadOperators(),e&&this.loadOperators(e)}catch(p){D.error(p.message||"Failed to update operator"),l.disabled=!1,l.innerText="Save Changes"}}}})}}async openAssignedAgentsModal(t){const e=R.operators.find(i=>i.id===t);e&&bt.open({title:`Assigned AI Categories — ${e.name}`,maxWidth:"680px",contentHtml:`
        <div style="margin-bottom: 14px; font-size: 13px; color: var(--text-secondary);">
          Enable, reorder, and configure AI categories offered on the <strong>${e.name}</strong> subscriber portal.
        </div>
        <div id="operator-agents-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; padding-right: 4px;">
          <div style="text-align: center; color: var(--text-muted); padding: 24px;">Loading catalog and assignments...</div>
        </div>
        <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
          <button type="button" id="save-operator-agents-btn" class="btn btn-primary">Save All Assignments</button>
        </div>
      `,onRender:async(i,n)=>{const a=i.querySelector("#operator-agents-list"),o=i.querySelector("#save-operator-agents-btn");try{const[r,l]=await Promise.all([L.get("/api/v1/admin/ai/catalog"),L.get(`/api/v1/admin/operators/${t}/agents`).catch(()=>({data:[]}))]),c=(r==null?void 0:r.data)||[],d=(l==null?void 0:l.data)||[],p=new Map;if(d.forEach((u,h)=>{const g=u.agentId||u.id;p.set(g,{displayOrder:u.displayOrder??h+1,customName:u.customName||u.name||"",minPlan:u.minPlan||"",isLockedUi:!!u.isLockedUi})}),c.length===0){a.innerHTML='<div style="text-align: center; color: var(--text-muted); padding: 24px;">No categories found in global catalog. Create categories in AI Categories first.</div>',o.disabled=!0;return}a.innerHTML=c.map((u,h)=>{const g=p.has(u.id),f=p.get(u.id)||{displayOrder:h+1,customName:"",minPlan:"",isLockedUi:!1};return`
              <div class="card agent-item-row" data-id="${u.id}" style="padding: 12px 14px; background: var(--bg-inset); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="checkbox" class="agent-enable-check" ${g?"checked":""} style="width: 16px; height: 16px; accent-color: var(--brand-primary); cursor: pointer;" />
                    <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(99,102,241,0.15); color: var(--brand-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                      ${(u.name||"C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style="font-size: 13.5px; font-weight: 600; color: var(--text-primary);">${u.name}</div>
                      <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${u.slug}</div>
                    </div>
                  </div>
                  <span class="badge ${g?"badge-success":"badge-neutral"} agent-status-badge">
                    ${g?"Assigned":"Disabled"}
                  </span>
                </div>

                <div class="agent-extra-fields" style="display: ${g?"grid":"none"}; grid-template-columns: 80px 1fr 1fr auto; gap: 8px; align-items: center; margin-top: 4px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
                  <div>
                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Order</label>
                    <input type="number" class="form-input agent-order-input" style="padding: 4px 6px; font-size: 12px; height: 30px;" min="1" value="${f.displayOrder}" />
                  </div>
                  <div>
                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Custom Name</label>
                    <input type="text" class="form-input agent-custom-name-input" style="padding: 4px 6px; font-size: 12px; height: 30px;" placeholder="${u.name}" value="${f.customName}" />
                  </div>
                  <div>
                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Min Plan</label>
                    <input type="text" class="form-input agent-min-plan-input" style="padding: 4px 6px; font-size: 12px; height: 30px;" placeholder="e.g. weekly-pack" value="${f.minPlan}" />
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Lock UI</label>
                    <input type="checkbox" class="agent-lock-ui-check" ${f.isLockedUi?"checked":""} style="margin-top: 6px; width: 16px; height: 16px; accent-color: var(--brand-primary); cursor: pointer;" title="Show lock badge if subscriber plan is insufficient" />
                  </div>
                </div>
              </div>
            `}).join(""),a.querySelectorAll(".agent-item-row").forEach(u=>{const h=u.querySelector(".agent-enable-check"),g=u.querySelector(".agent-extra-fields"),f=u.querySelector(".agent-status-badge");h.onchange=()=>{g.style.display=h.checked?"grid":"none",f.innerText=h.checked?"Assigned":"Disabled",f.className=`badge ${h.checked?"badge-success":"badge-neutral"} agent-status-badge`}}),o.onclick=async()=>{o.disabled=!0,o.innerText="Saving Assignments...";const u=[];a.querySelectorAll(".agent-item-row").forEach(h=>{if(h.querySelector(".agent-enable-check").checked){const f=h.getAttribute("data-id"),m=parseInt(h.querySelector(".agent-order-input").value,10)||1,y=h.querySelector(".agent-custom-name-input").value.trim()||null,v=h.querySelector(".agent-min-plan-input").value.trim()||null,S=h.querySelector(".agent-lock-ui-check").checked;u.push({agentId:f,displayOrder:m,customName:y,minPlan:v,isLockedUi:S,isActive:!0})}});try{await L.post(`/api/v1/admin/operators/${t}/agents`,{agents:u}),D.success("Operator category assignments updated successfully"),n()}catch(h){D.error(h.message||"Failed to update category assignments"),o.disabled=!1,o.innerText="Save All Assignments"}}}catch(r){a.innerHTML=`<div style="color: #fb7185; padding: 14px;">Failed to load categories: ${r.message}</div>`}}})}}const z=s=>String(s??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),Yt={introScreen:["1. Intro / Home (Step 1)",{badge:"Step 1 of 5",title:"YOUR PERSONAL AI ASSISTANT.",subtitle:"Learn, cook, stay healthy, manage money and explore the world — with one AI that truly understands you.",buttonText:"Start My AI Journey ✦",secondaryButtonText:"See Features",statsText:"6+ AI Modes · ∞ Chats · 24/7 Live"}],msisdnScreen:["2. Mobile Number (Step 2)",{badge:"Step 2 of 5",title:"JUST YOUR NUMBER.",subtitle:"A smarter you starts here.",inputPlaceholder:"98765 43210",buttonText:"Continue →",footerText:"Your everyday companion for a smarter tomorrow."}],planScreen:["3. Choose Plan Screen (Step 3)",{badge:"Step 3 of 5",title:"CHOOSE YOUR AI PLAN.",subtitle:"More ways to learn, create, and get things done every day.",discountBadge:"13:07 Limited discount",buttonText:"Unlock My AI",footerText:"🔒 Secure · Cancel anytime"}],otpScreen:["4. Verify OTP (Step 4)",{badge:"Step 4 of 5",title:"Verify OTP",subtitle:"We sent a verification code to your phone",buttonText:"Verify & Proceed",resendText:"Resend OTP"}],successScreen:["5. Congratulations (Step 5)",{badge:"Step 5 of 5",title:"CONGRATULATIONS! You're all set ✦",subtitle:"You have unlocked AI for Everyday Life. Your personal assistant is ready to help you learn, cook, stay healthy and explore.",highlightText:"Your AI journey starts now",buttonText:"Enter Dashboard →"}],dashboardScreen:["6. Dashboard",{welcomeTitle:"Welcome to Everyday AI",subtitle:"Your personal assistant is ready to help you learn, cook, stay healthy and explore."}],chatScreen:["7. AI Chat",{inputPlaceholder:"Ask anything...",sendButtonText:"Send"}],lowBalanceScreen:["8. Low Balance",{badge:"Step 2 of 2",title:"Low Balance",subtitle:"Your balance is low. Recharge to continue your Everyday AI journey without interruption.",rechargeNote:"A little recharge goes a long way",benefit1Text:"Stay connected",benefit2Text:"Keep learning without breaks",benefit3Text:"Your smarter tomorrow awaits",buttonText:"Okay",footerText:"Powered by you for a smarter tomorrow"}],inProgressScreen:["9. In Progress",{badge:"Please wait",title:"In Progress",subtitle:"We are processing your request. Your Everyday AI journey will continue shortly.",statusText:"Processing your request…",waitMessage:"Please keep this page open while we finish.",footerText:"Your smarter tomorrow is on its way"}],commonScreen:["Common & Legal",{disclaimer:"Powered by Everyday AI. Carrier billing applies.",termsNotice:"Subscription renews automatically. Cancel anytime as per operator terms.",retryText:"Try again",offlineText:"You are offline"}],globalStrings:["Global / Brand Copy",{title:"Airtel India AI Studio",subtitle:"Ask anything on your Airtel India connection",disclaimer:"Powered by {{operator_name}}. Carrier billing applies.",termsNotice:"Subscription renews automatically. Cancel anytime as per operator terms."}]};function fa(s,t){var l,c,d;const e={},i=(t.languageCode||"").trim(),n=(s.languages||[]).find(p=>p.isDefault)||((l=s.languages)==null?void 0:l[0]),a=!!(t.isDefault||i===((n==null?void 0:n.languageCode)||"").trim());for(const[p,u]of Object.entries(t.strings||{}))typeof u=="string"&&!p.endsWith("Url")&&!p.endsWith("Banner")&&(["enterPhonePrompt","verifyOtpPrompt","ctaSubscribe"].includes(p)||(e[p]=u));const o=((c=Yt.planScreen)==null?void 0:c[1])||{};for(const[p,u]of Object.entries(o)){const h=`planScreen.${p}`;e[h]||(e[h]=a?u:((d=n==null?void 0:n.strings)==null?void 0:d[h])||u)}if((s.catalog||[]).forEach(p=>{var h,g;const u=`category.${p.id}.name`;if(!e[u]){const f=(h=p.translations)==null?void 0:h[i];e[u]=f||(a?p.name:((g=p.translations)==null?void 0:g.en)||p.name||"")}}),(s.plans&&s.plans.length>0?s.plans:[{id:"daily-pack",name:"Daily Power Pass",slug:"daily-pack",periodType:"daily",price:"5",currencyCode:"INR",isHighlighted:!0,highlightBadge:"Most Popular",maxTokens:1e4},{id:"weekly-pack",name:"Weekly AI Pro",slug:"weekly-pack",periodType:"weekly",price:"25",currencyCode:"INR",isHighlighted:!1,highlightBadge:"Best Value",maxTokens:8e4},{id:"monthly-pack",name:"Monthly Unlimited",slug:"monthly-pack",periodType:"monthly",price:"79",currencyCode:"INR",isHighlighted:!1,highlightBadge:"Power User",maxTokens:4e5}]).forEach(p=>{var A,T,P,B,V,O,I,E,W,N,X,it,nt,rt,J,dt,ot,Tt;const u=p.periodType||"daily",h=Array.isArray(p.features)&&p.features.length>0?p.features.join(`
`):typeof p.features=="string"&&p.features.trim()?p.features:`${(p.maxTokens||1e4).toLocaleString()} AI Tokens per ${u}
Direct Carrier Billing (SIM)
Ultra-fast AI models
Unlimited 24/7 AI chat`,g=`plan.${p.id}.name`,f=`plan.${p.id}.highlightBadge`,m=`plan.${p.id}.periodLabel`,y=`plan.${p.id}.subtitle`,v=`plan.${p.id}.features`,S=`plan.${p.id}.buttonText`,x=`plan.${p.slug}.name`,b=`plan.${p.slug}.highlightBadge`,_=`plan.${p.slug}.periodLabel`,k=`plan.${p.slug}.subtitle`,w=`plan.${p.slug}.features`,C=`plan.${p.slug}.buttonText`;if(e[g]||(e[g]=e[x]||((A=t.strings)==null?void 0:A[x])||(a?p.name:((T=n==null?void 0:n.strings)==null?void 0:T[g])||((P=n==null?void 0:n.strings)==null?void 0:P[x])||p.name)),!e[f]){const pt=e[b]||((B=t.strings)==null?void 0:B[b])||(a?p.highlightBadge||"":((V=n==null?void 0:n.strings)==null?void 0:V[f])||((O=n==null?void 0:n.strings)==null?void 0:O[b])||p.highlightBadge||"");pt&&(e[f]=pt)}if(e[m]||(e[m]=e[_]||((I=t.strings)==null?void 0:I[_])||(a?u:((E=n==null?void 0:n.strings)==null?void 0:E[m])||((W=n==null?void 0:n.strings)==null?void 0:W[_])||u)),!e[y]){const pt=e[k]||((N=t.strings)==null?void 0:N[k])||(a?"":((X=n==null?void 0:n.strings)==null?void 0:X[y])||((it=n==null?void 0:n.strings)==null?void 0:it[k])||"");pt&&(e[y]=pt)}if(e[v]||(e[v]=e[w]||((nt=t.strings)==null?void 0:nt[w])||(a?h:((rt=n==null?void 0:n.strings)==null?void 0:rt[v])||((J=n==null?void 0:n.strings)==null?void 0:J[w])||h)),!e[S]){const pt=e[C]||((dt=t.strings)==null?void 0:dt[C])||(a?"":((ot=n==null?void 0:n.strings)==null?void 0:ot[S])||((Tt=n==null?void 0:n.strings)==null?void 0:Tt[C])||"");pt&&(e[S]=pt)}}),a)for(const[p,[,u]]of Object.entries(Yt))for(const[h,g]of Object.entries(u)){const f=p==="globalStrings"?h:`${p}.${h}`;e[f]===void 0&&(e[f]=g)}return e}function He(s,t){var c,d;const e=t.querySelector("#language-studio");if(!e)return;const i=s.languages.find(p=>p.languageCode.trim()===(s.selectedLanguage||"").trim()),n=i?i.languageCode.trim():"",a=i?(c=s.languageDrafts)[n]||(c[n]=fa(s,i)):{};if(i){const p=fa(s,i);for(const[u,h]of Object.entries(p))a[u]===void 0&&(a[u]=h)}if(e.innerHTML=`
    <div class="studio-toolbar">
      <div>
        <h3>Subscriber screens &amp; language content</h3>
        <p>Configure copy for the 5-step subscriber journey (Intro → Phone → Plan → OTP → Success → Dashboard &amp; Chat), the Low Balance and In Progress screens, or customize individual plan offerings.</p>
      </div>
      <label>Content language
        <select id="studio-language" class="form-select">
          <option value="">Choose a language…</option>
          ${s.languages.map(p=>`<option value="${z(p.languageCode.trim())}" ${p===i?"selected":""}>${z(p.languageCode.trim().toUpperCase())}${p.isDefault?" · Default":""}</option>`).join("")}
        </select>
      </label>
      <button class="btn btn-secondary" id="studio-create">Create language</button>
    </div>

    ${i?`
      <div class="studio-toolbar">
        <span class="badge badge-primary">Editing ${z(n.toUpperCase())} · ${i.direction.toUpperCase()}</span>
        <span id="studio-status" role="status">Changes apply only to this language.</span>
        <button class="btn btn-primary" id="studio-save">Save language content</button>
      </div>

      <div class="studio-layout">
        <div>
          <label class="form-label">Screen or Section
            <select id="studio-screen" class="form-select">
              ${Object.entries(Yt).map(([p,[u]])=>`<option value="${p}" ${s.selectedScreen===p?"selected":""}>${u}</option>`).join("")}
              <option value="plans" ${s.selectedScreen==="plans"?"selected":""}>★ Plan names, badges &amp; benefits (Plan-wise)</option>
              <option value="categories" ${s.selectedScreen==="categories"?"selected":""}>AI category names</option>
            </select>
          </label>
          <div id="studio-fields"></div>
        </div>

        <aside>
          <h4>Subscriber preview</h4>
          <p>Unsaved content preview · ${z(n.toUpperCase())}</p>
          <div id="studio-preview" class="studio-phone" dir="${i.direction}"></div>
        </aside>
      </div>
    `:`
      <div class="studio-empty">Choose a language above, or create one to start configuring screens and copy.</div>
    `}
  `,e.querySelector("#studio-create").onclick=()=>s.openLanguageModal(t),e.querySelector("#studio-language").onchange=p=>{s.selectedLanguage=p.target.value.trim(),He(s,t)},!i)return;const o=(s.languages||[]).find(p=>p.isDefault)||((d=s.languages)==null?void 0:d[0]),r=!!(i.isDefault||n===((o==null?void 0:o.languageCode)||"").trim()),l=()=>{var h,g,f,m,y,v,S;const p=s.selectedScreen||"introScreen";if(p==="categories"){const x=(s.catalog||[]).map(b=>{var w,C;const _=`category.${b.id}.name`,k=a[_]||((w=b.translations)==null?void 0:w[n])||(r?b.name:((C=b.translations)==null?void 0:C.en)||b.name);return a[_]=k,[_,b.name,k]});e.querySelector("#studio-fields").innerHTML=`
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Localize AI category names shown across the portal for subscribers.</p>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>AI category</th><th>Language</th><th>Localized name</th></tr>
            </thead>
            <tbody>
              ${x.map(([b,_,k])=>`
                <tr>
                  <td>${z(_)}</td>
                  <td>${z(n.toUpperCase())}</td>
                  <td><input class="form-input" data-copy="${z(b)}" value="${z(k)}" placeholder="${z(_)}"></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `}else if(p==="plans"){const x=s.plans&&s.plans.length>0?s.plans:[{id:"daily-pack",name:"Daily Power Pass",slug:"daily-pack",periodType:"daily",price:"5",currencyCode:"INR",isHighlighted:!0,highlightBadge:"Most Popular",maxTokens:1e4},{id:"weekly-pack",name:"Weekly AI Pro",slug:"weekly-pack",periodType:"weekly",price:"25",currencyCode:"INR",isHighlighted:!1,highlightBadge:"Best Value",maxTokens:8e4},{id:"monthly-pack",name:"Monthly Unlimited",slug:"monthly-pack",periodType:"monthly",price:"79",currencyCode:"INR",isHighlighted:!1,highlightBadge:"Power User",maxTokens:4e5}],b=((h=Yt.planScreen)==null?void 0:h[1])||{},_=a["planScreen.title"]||(r?b.title:((g=o==null?void 0:o.strings)==null?void 0:g["planScreen.title"])||b.title||"CHOOSE YOUR AI PLAN."),k=a["planScreen.subtitle"]||(r?b.subtitle:((f=o==null?void 0:o.strings)==null?void 0:f["planScreen.subtitle"])||b.subtitle||"More ways to learn, create, and get things done every day."),w=a["planScreen.discountBadge"]||(r?b.discountBadge:((m=o==null?void 0:o.strings)==null?void 0:m["planScreen.discountBadge"])||b.discountBadge||"13:07 Limited discount"),C=a["planScreen.buttonText"]||(r?b.buttonText:((y=o==null?void 0:o.strings)==null?void 0:y["planScreen.buttonText"])||b.buttonText||"Unlock My AI / Subscribe Now"),A=a["planScreen.footerText"]||(r?b.footerText:((v=o==null?void 0:o.strings)==null?void 0:v["planScreen.footerText"])||b.footerText||"🔒 Secure · Cancel anytime");a["planScreen.title"]=_,a["planScreen.subtitle"]=k,a["planScreen.discountBadge"]=w,a["planScreen.buttonText"]=C,a["planScreen.footerText"]=A,e.querySelector("#studio-fields").innerHTML=`
        <div style="margin-bottom: 16px;">
          <div class="flex-between" style="align-items: flex-start; margin-bottom: 12px;">
            <div>
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0;">Subscription Plans &amp; Badges Localizations</h4>
              <p style="font-size: 11.5px; color: var(--text-secondary); margin: 0;">Customize plan names, highlight tags, billing period labels, and bullet benefits plan-by-plan for <strong>${z(n.toUpperCase())}</strong>.</p>
            </div>
          </div>

          <!-- Plan Filter Pills -->
          <div id="plan-filter-pills" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
            <button type="button" class="badge badge-primary plan-filter-pill" data-plan-target="all" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 10px;">All Plans (${x.length})</button>
            ${x.map(T=>`
              <button type="button" class="badge badge-neutral plan-filter-pill" data-plan-target="${T.id}" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 10px;">${z(a[`plan.${T.id}.name`]||a[`plan.${T.slug}.name`]||T.name)}</button>
            `).join("")}
          </div>

          <!-- General Plan Screen Copy Box -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>📱 Plan Screen General Headers &amp; Buttons</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Screen Title</label>
                <input class="form-input" data-copy="planScreen.title" value="${z(_)}" placeholder="CHOOSE YOUR AI PLAN.">
              </div>
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Screen Subtitle</label>
                <input class="form-input" data-copy="planScreen.subtitle" value="${z(k)}" placeholder="More ways to learn, create, and get things done every day.">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Discount / Promo Badge</label>
                <input class="form-input" data-copy="planScreen.discountBadge" value="${z(w)}" placeholder="13:07 Limited discount">
              </div>
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Main Subscribe Button CTA</label>
                <input class="form-input" data-copy="planScreen.buttonText" value="${z(C)}" placeholder="Unlock My AI / Subscribe Now">
              </div>
              <div>
                <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Footer Security Notice</label>
                <input class="form-input" data-copy="planScreen.footerText" value="${z(A)}" placeholder="🔒 Secure · Cancel anytime">
              </div>
            </div>
          </div>

          <!-- Plan-by-Plan Cards Container -->
          <div id="plan-cards-container">
            ${x.map(T=>{var ae,Ut,q,j,xt,wt,oe,Mt,Gt,Te,re,Me,Ae,zt,$e,Pe,Ds,Ls,Es,Rs,Fs,Bs,qs,Ns;const P=`plan.${T.id}.name`,B=`plan.${T.id}.highlightBadge`,V=`plan.${T.id}.periodLabel`,O=`plan.${T.id}.subtitle`,I=`plan.${T.id}.features`,E=`plan.${T.id}.buttonText`,W=`plan.${T.slug}.name`,N=`plan.${T.slug}.highlightBadge`,X=`plan.${T.slug}.periodLabel`,it=`plan.${T.slug}.subtitle`,nt=`plan.${T.slug}.features`,rt=`plan.${T.slug}.buttonText`,J=T.periodType||"day",dt=`${T.currencyCode==="INR"||!T.currencyCode?"₹":"$"}${parseFloat(T.price)}`,ot=Array.isArray(T.features)&&T.features.length>0?T.features.join(`
`):typeof T.features=="string"&&T.features.trim()?T.features:`${(T.maxTokens||1e4).toLocaleString()} AI Tokens per ${J}
Direct Carrier Billing (SIM)
Ultra-fast AI models
Unlimited 24/7 AI chat`,Tt=a[P]||a[W]||((ae=i.strings)==null?void 0:ae[P])||((Ut=i.strings)==null?void 0:Ut[W])||(r?T.name:((q=o==null?void 0:o.strings)==null?void 0:q[P])||((j=o==null?void 0:o.strings)==null?void 0:j[W])||T.name),pt=a[B]||a[N]||((xt=i.strings)==null?void 0:xt[B])||((wt=i.strings)==null?void 0:wt[N])||(r?T.highlightBadge||"":((oe=o==null?void 0:o.strings)==null?void 0:oe[B])||((Mt=o==null?void 0:o.strings)==null?void 0:Mt[N])||T.highlightBadge||""),ne=a[V]||a[X]||((Gt=i.strings)==null?void 0:Gt[V])||((Te=i.strings)==null?void 0:Te[X])||(r?J:((re=o==null?void 0:o.strings)==null?void 0:re[V])||((Me=o==null?void 0:o.strings)==null?void 0:Me[X])||J),Vt=a[O]||a[it]||((Ae=i.strings)==null?void 0:Ae[O])||((zt=i.strings)==null?void 0:zt[it])||(r?"":(($e=o==null?void 0:o.strings)==null?void 0:$e[O])||((Pe=o==null?void 0:o.strings)==null?void 0:Pe[it])||""),jt=a[I]||a[nt]||((Ds=i.strings)==null?void 0:Ds[I])||((Ls=i.strings)==null?void 0:Ls[nt])||(r?ot:((Es=o==null?void 0:o.strings)==null?void 0:Es[I])||((Rs=o==null?void 0:o.strings)==null?void 0:Rs[nt])||ot),Wt=a[E]||a[rt]||((Fs=i.strings)==null?void 0:Fs[E])||((Bs=i.strings)==null?void 0:Bs[rt])||(r?"":((qs=o==null?void 0:o.strings)==null?void 0:qs[E])||((Ns=o==null?void 0:o.strings)==null?void 0:Ns[rt])||"");return a[P]=Tt,pt&&(a[B]=pt),a[V]=ne,Vt&&(a[O]=Vt),a[I]=jt,Wt&&(a[E]=Wt),`
                <div class="plan-edit-card card mb-4" data-plan-id="${T.id}" style="padding: 16px; background: var(--bg-card); border: 1.5px solid ${T.isHighlighted?"var(--primary, #6C5CE7)":"var(--border-subtle)"}; border-radius: var(--radius-md);">
                  <!-- Plan Card Header -->
                  <div class="flex-between mb-3" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--primary-subtle, rgba(108,92,231,0.15)); border: 1px solid var(--primary, #6C5CE7); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary, #6C5CE7); font-size: 13px;">
                        ${dt.charAt(0)}
                      </div>
                      <div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <strong style="font-size: 14px; color: var(--text-primary);">${z(T.name)}</strong>
                          <span class="badge badge-cyan" style="font-family: var(--font-mono); font-size: 10px;">${z(T.slug)}</span>
                          ${T.isHighlighted?'<span class="badge badge-primary" style="font-size: 9.5px;">★ Highlighted Plan</span>':""}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">
                          Default pricing: <strong>${z(dt)} / ${z(J)}</strong> · ${(T.maxTokens||1e4).toLocaleString()} Tokens
                        </div>
                      </div>
                    </div>
                    <div>
                      <span class="badge badge-neutral" style="font-family: var(--font-mono); font-size: 10px;">ID: ${T.id.slice(0,8)}...</span>
                    </div>
                  </div>

                  <!-- Row 1: Localized Name & Badge -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                        Plan Display Name (${z(n.toUpperCase())}) *
                      </label>
                      <input class="form-input" data-copy="${z(P)}" value="${z(Tt)}" placeholder="${z(T.name)}" style="font-size: 12.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Primary name displayed on the card (e.g. डेली पावर पास)</div>
                    </div>

                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                        Highlight Tag / Badge
                      </label>
                      <input class="form-input" data-copy="${z(B)}" value="${z(pt)}" placeholder="${z(T.highlightBadge||"e.g. Most Popular / सबसे लोकप्रिय")}" style="font-size: 12.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Corner promotional ribbon (e.g. Best Value, 50% OFF)</div>
                    </div>
                  </div>

                  <!-- Row 2: Period Unit Label & Subtitle -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                        Period Unit Label (e.g. दिन, सप्ताह, माह, daily)
                      </label>
                      <input class="form-input" data-copy="${z(V)}" value="${z(ne)}" placeholder="${z(J)}" style="font-size: 12.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Suffix after price, e.g. ₹5 / [दिन]</div>
                    </div>

                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                        Plan Tagline / Subtitle (Optional)
                      </label>
                      <input class="form-input" data-copy="${z(O)}" value="${z(Vt)}" placeholder="e.g. Unlimited AI queries &amp; everyday help" style="font-size: 12.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Short tagline shown under plan name</div>
                    </div>
                  </div>

                  <!-- Row 3: Bullet Features List -->
                  <div class="form-group" style="margin-bottom: 10px;">
                    <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px; display: flex; justify-content: space-between;">
                      <span>Bullet Features &amp; Inclusions (One feature per line)</span>
                      <span style="color: var(--text-muted); font-size: 10px;">Newline = separate bullet</span>
                    </label>
                    <textarea class="form-input" data-copy="${z(I)}" rows="3" placeholder="${(T.maxTokens||1e4).toLocaleString()} AI Tokens per ${J}&#10;Direct Carrier Billing (SIM)&#10;Ultra-fast AI models&#10;Unlimited 24/7 AI chat" style="font-size: 12px; line-height: 1.45; resize: vertical;">${z(jt)}</textarea>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Each line becomes a green checkmark feature bullet on the subscriber portal.</div>
                  </div>

                  <!-- Row 4: Plan-specific Button Text -->
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">
                      Plan CTA Button Text (Optional Override)
                    </label>
                    <input class="form-input" data-copy="${z(E)}" value="${z(Wt)}" placeholder="e.g. Choose ${z(T.name)} / अभी सब्सक्राइब करें" style="font-size: 12.5px;">
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
      `,e.querySelectorAll(".plan-filter-pill").forEach(T=>{T.onclick=()=>{const P=T.getAttribute("data-plan-target");e.querySelectorAll(".plan-filter-pill").forEach(B=>{B.className=B===T?"badge badge-primary plan-filter-pill":"badge badge-neutral plan-filter-pill"}),e.querySelectorAll(".plan-edit-card").forEach(B=>{P==="all"||B.getAttribute("data-plan-id")===P?B.style.display="block":B.style.display="none"})}})}else{let x=[],b=[];if(p==="globalStrings"){x=Object.entries(Yt.globalStrings[1]).map(([w,C])=>[w,w.replace(/([A-Z])/g," $1"),C]);const k=new Set(Object.keys(Yt.globalStrings[1]));for(const[w,C]of Object.entries(a))!w.includes(".")&&!k.has(w)&&typeof C=="string"&&b.push([w,w])}else{const k=((S=Yt[p])==null?void 0:S[1])||{};x=Object.entries(k).map(([C,A])=>[`${p}.${C}`,C.replace(/([A-Z])/g," $1"),A]);const w=`${p}.`;for(const[C,A]of Object.entries(a))if(C.startsWith(w)){const T=C.slice(w.length);!k[T]&&typeof A=="string"&&b.push([C,T])}}e.querySelector("#studio-fields").innerHTML=`
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Default text for this screen. Leave empty to use system default.</p>
        ${x.map(([k,w,C])=>`
          <label class="form-label studio-field" style="margin-bottom: 10px;">
            <span style="font-size: 11.5px; font-weight: 600; text-transform: capitalize;">${z(w)}</span>
            <input class="form-input" data-copy="${z(k)}" value="${z(a[k]??"")}" placeholder="${z(C)}">
          </label>
        `).join("")}

        <!-- Custom / Dynamic Extra Fields Section -->
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin: 0;">Extra / Custom Fields for this Screen</h4>
            <span style="font-size: 10.5px; color: var(--text-muted);">${b.length} custom key${b.length===1?"":"s"}</span>
          </div>

          ${b.length>0?b.map(([k,w])=>`
            <div style="display: flex; align-items: flex-end; gap: 8px; margin-bottom: 8px;">
              <div style="flex: 1;">
                <label class="form-label" style="font-size: 11px; margin-bottom: 3px;">
                  <span class="badge badge-primary" style="font-family: var(--font-mono); font-size: 10px;">${z(w)}</span>
                </label>
                <input class="form-input" data-copy="${z(k)}" value="${z(a[k]??"")}" placeholder="Enter text...">
              </div>
              <button type="button" class="btn btn-danger btn-icon delete-custom-field-btn" data-del-key="${z(k)}" title="Remove field" style="width: 34px; height: 34px; flex-shrink: 0;">
                ${M.trash||"✕"}
              </button>
            </div>
          `).join(""):'<p style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-bottom: 8px;">No extra custom fields added yet.</p>'}

          <!-- Add Key-Value Box -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 10px;">
            <label style="font-size: 11.5px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 6px;">+ Add New Key-Value Pair (Extra UI Text)</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="custom-field-key" class="form-input" placeholder="Field name (e.g. promoNotice, heroNote)" style="flex: 1; font-size: 12px;" />
              <input type="text" id="custom-field-val" class="form-input" placeholder="Field text value" style="flex: 1.5; font-size: 12px;" />
              <button type="button" id="add-custom-field-btn" class="btn btn-secondary" style="flex-shrink: 0; font-size: 12px; padding: 0 12px;">+ Add Key</button>
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 5px;">
              This key will be automatically sent in <code>screens.${p}</code> to the subscriber UI.
            </div>
          </div>
        </div>
      `;const _=e.querySelector("#add-custom-field-btn");_&&(_.onclick=()=>{var P,B;const k=e.querySelector("#custom-field-key"),w=e.querySelector("#custom-field-val");let C=((P=k==null?void 0:k.value)==null?void 0:P.trim())||"";const A=((B=w==null?void 0:w.value)==null?void 0:B.trim())||"";if(!C){D.error("Please enter a field name");return}if(C=C.replace(/[^a-zA-Z0-9_]/g,""),!/^[a-zA-Z]/.test(C)){D.error("Field name must start with a letter");return}const T=p==="globalStrings"?C:`${p}.${C}`;a[T]=A,e.querySelector("#studio-status").textContent="Unsaved changes",l(),D.success(`Field "${C}" added! Click "Save language content" to persist.`)}),e.querySelectorAll(".delete-custom-field-btn").forEach(k=>{k.onclick=()=>{const w=k.getAttribute("data-del-key");delete a[w],e.querySelector("#studio-status").textContent="Unsaved changes",l(),D.success("Custom field removed")}})}const u=()=>{var k,w,C;const x=s.selectedScreen||"introScreen";if(x==="plans"||x==="planScreen"){const T=(s.plans&&s.plans.length>0?s.plans:[{id:"daily-pack",name:"Daily Power Pass",slug:"daily-pack",periodType:"daily",price:"5",currencyCode:"INR",isHighlighted:!0,highlightBadge:"Most Popular",maxTokens:1e4},{id:"weekly-pack",name:"Weekly AI Pro",slug:"weekly-pack",periodType:"weekly",price:"25",currencyCode:"INR",isHighlighted:!1,highlightBadge:"Best Value",maxTokens:8e4},{id:"monthly-pack",name:"Monthly Unlimited",slug:"monthly-pack",periodType:"monthly",price:"79",currencyCode:"INR",isHighlighted:!1,highlightBadge:"Power User",maxTokens:4e5}]).map(P=>{const B=a[`plan.${P.id}.name`]||P.name,V=a[`plan.${P.id}.highlightBadge`]||P.highlightBadge||"",O=a[`plan.${P.id}.periodLabel`]||P.periodType,I=a[`plan.${P.id}.subtitle`]||"",E=a[`plan.${P.id}.features`]||"",W=E?E.split(`
`).map(it=>it.trim()).filter(Boolean):[`${(P.maxTokens||1e4).toLocaleString()} AI Tokens per ${O}`,"Direct Carrier Billing (SIM)","Ultra-fast AI models"],N=P.isHighlighted,X=P.currencyCode==="INR"||!P.currencyCode?"₹":"$";return`
            <div style="background: ${N?"var(--primary-subtle, #251B4E)":"var(--bg-card, #1A1A2E)"}; border: 1.5px solid ${N?"var(--primary, #6C5CE7)":"var(--border-subtle, #333)"}; border-radius: 10px; padding: 10px; margin-bottom: 10px; position: relative;">
              ${V?`<span style="position: absolute; top: -8px; right: 10px; background: var(--primary, #6C5CE7); color: #fff; font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 10px;">${z(V)}</span>`:""}
              <div style="font-size: 12px; font-weight: 700; color: #fff;">${z(B)}</div>
              ${I?`<div style="font-size: 9.5px; color: #aaa; margin-top: 1px;">${z(I)}</div>`:""}
              <div style="font-size: 15px; font-weight: 800; color: var(--primary, #6C5CE7); margin: 4px 0;">${z(X)}${parseFloat(P.price)} <span style="font-size: 10px; font-weight: normal; color: #aaa;">/ ${z(O)}</span></div>
              <ul style="margin: 4px 0 0 0; padding-left: 14px; font-size: 10px; color: #bbb; line-height: 1.35;">
                ${W.map(it=>`<li>${z(it)}</li>`).join("")}
              </ul>
            </div>
          `}).join("");e.querySelector("#studio-preview").innerHTML=`
          <small>${z(((k=s.operator)==null?void 0:k.name)||"Everyday AI")} · ${z(n.toUpperCase())}</small>
          <div style="margin-top: 8px;">
            ${a["planScreen.discountBadge"]?`<span style="display: inline-block; background: rgba(235, 77, 75, 0.2); color: #ff7979; border: 1px solid rgba(235, 77, 75, 0.4); font-size: 9.5px; padding: 2px 7px; border-radius: 4px; margin-bottom: 6px;">${z(a["planScreen.discountBadge"])}</span>`:""}
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #fff; margin-bottom: 3px;">${z(a["planScreen.title"]||"CHOOSE YOUR PLAN")}</div>
            <div style="font-size: 10px; color: #aaa; margin-bottom: 10px;">${z(a["planScreen.subtitle"]||"Select a pack for unlimited AI queries")}</div>
            ${T}
            <div class="studio-preview-button" style="margin-top: 8px;">${z(a["planScreen.buttonText"]||"Subscribe Now")}</div>
            ${a["planScreen.footerText"]?`<div style="font-size: 9px; color: #888; text-align: center; margin-top: 8px;">${z(a["planScreen.footerText"])}</div>`:""}
          </div>
        `,e.querySelector("#studio-preview").style.fontFamily=i.fontFamily||"Inter";return}const b=((w=Yt[x])==null?void 0:w[1])||{},_=Object.entries(b).map(([A,T])=>[`${x}.${A}`,A.replace(/([A-Z])/g," $1"),T]);for(const[A,T]of Object.entries(a))A.startsWith(`${x}.`)&&!b[A.slice(x.length+1)]&&typeof T=="string"&&_.push([A,A.slice(x.length+1)]);e.querySelector("#studio-preview").innerHTML=`
        <small>${z(((C=s.operator)==null?void 0:C.name)||"Everyday AI")} · ${z(n.toUpperCase())}</small>
        ${_.map(([A,T])=>`
          <div class="studio-preview-item">
            <small>${z(T)}</small>
            <div ${/button|sendButton|cta/i.test(A)?'class="studio-preview-button"':""}>
              ${z(a[A]??"—")}
            </div>
          </div>
        `).join("")}
      `,e.querySelector("#studio-preview").style.fontFamily=i.fontFamily||"Inter"};e.querySelectorAll("[data-copy]").forEach(x=>{x.oninput=()=>{a[x.dataset.copy]=x.value,e.querySelector("#studio-status").textContent="Unsaved changes",u()}}),u()};e.querySelector("#studio-screen").onchange=p=>{s.selectedScreen=p.target.value,l()},e.querySelector("#studio-save").onclick=async p=>{const u=p.currentTarget;u.disabled=!0,u.innerText="Saving Content...";try{const h={};for(const[g,f]of Object.entries(a))typeof f=="string"&&f.trim()&&!g.endsWith("Url")&&!g.endsWith("Banner")&&(["enterPhonePrompt","verifyOtpPrompt","ctaSubscribe"].includes(g)||(h[g]=f.trim()));await L.post(`/api/v1/admin/operators/${s.operatorId}/languages`,{languageCode:n,direction:i.direction,fontFamily:i.fontFamily,isDefault:i.isDefault,strings:h}),i.strings=h,e.querySelector("#studio-status").textContent="Language content saved",D.success(`${n.toUpperCase()} plan & screen content saved successfully`)}catch(h){D.error(h.message||"Failed to save language content")}finally{u.disabled=!1,u.innerText="Save language content"}},l()}class Mp{constructor(t,e=null){this.operatorId=e,this.onNavigate=t,this.plans=[]}async render(t=null){const e=document.createElement("div");e.className="view-container",e.innerHTML=`
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Subscription Plans & DCB Pricing</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Configure Daily, Weekly, and Monthly subscriber packs, local currencies, and token quotas</p>
        </div>
        <button id="create-plan-btn" class="btn btn-primary">
          ${M.plus} Create Subscription Pack
        </button>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4">
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Filter by Carrier:</span>
            <select id="plans-operator-filter" class="form-select" style="width: 220px;">
              <option value="">All Operators</option>
              ${R.operators.map(o=>`
                <option value="${o.id}" ${o.id===R.activeOperatorId?"selected":""}>
                  ${o.name} (${o.countryCode})
                </option>
              `).join("")}
            </select>
          </div>
          <button id="plans-refresh-btn" class="btn btn-secondary">
            ${M.refresh} Refresh
          </button>
        </div>

        <div id="plans-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 16px;">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
            Loading subscription plans...
          </div>
        </div>
      </div>
    `;const i=e.querySelector("#create-plan-btn"),n=e.querySelector("#plans-refresh-btn"),a=e.querySelector("#plans-operator-filter");return i.onclick=()=>this.openPlanModal(e),n.onclick=()=>this.loadPlans(e),this.operatorId&&(a.value=this.operatorId,a.closest(".flex-between").querySelector("div").style.display="none"),a.onchange=()=>{R.setActiveOperator(a.value)},Array.isArray(t)?(this.plans=t,this.renderPlans(e,t)):this.loadPlans(e),e}async loadPlans(t){var n,a;const e=this.operatorId||((n=t.querySelector("#plans-operator-filter"))==null?void 0:n.value),i=e?{operatorId:e}:{};try{const o=await L.get("/api/v1/admin/plans",i);o.success&&Array.isArray(o.data)&&(this.plans=o.data,(a=this.onPlansLoaded)==null||a.call(this,this.plans),this.renderPlans(t,this.plans))}catch(o){D.error(o.message||"Failed to fetch subscription plans")}}renderPlans(t,e){const i=t.querySelector("#plans-grid");if(i){if(!e||e.length===0){i.innerHTML=`
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
          No subscription packs configured for this carrier. Click "Create Subscription Pack" to add one.
        </div>
      `;return}i.innerHTML=e.map(n=>{const a=n.isHighlighted,o=n.currencyCode==="INR"?"₹":n.currencyCode==="SAR"?"SAR ":"$",r=R.operators.find(l=>l.id===n.operatorId);return`
        <div class="card" style="min-height: 290px; padding: 18px; display: flex; flex-direction: column; ${a?"border-color: var(--accent);":""}">
          <!-- Card Top Meta Row -->
          <div class="flex-between mb-3" style="align-items: center;">
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <span class="badge ${n.periodType==="daily"?"badge-primary":n.periodType==="weekly"?"badge-cyan":"badge-warning"}">
                ${(n.periodType||"DAILY").toUpperCase()} PASS
              </span>
              ${a?`
                <span class="badge badge-primary" style="background: rgba(99, 102, 241, 0.25); color: #c7d2fe;">
                  ${n.highlightBadge||"POPULAR"}
                </span>
              `:""}
              ${r?`
                <span class="badge badge-secondary" style="font-size: 10px; background: rgba(255,255,255,0.06);">
                  ${r.name}
                </span>
              `:""}
              ${n.operatorPlanCode?`
                <span class="badge" style="font-size: 10px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-family: var(--font-mono);" title="Carrier purchaseTypeId">
                  CODE: ${n.operatorPlanCode}
                </span>
              `:""}
              ${n.operatorSubServiceId?`
                <span class="badge" style="font-size: 10px; background: rgba(14, 165, 233, 0.15); color: #38bdf8; font-family: var(--font-mono);" title="${n.operatorSubServiceId}">
                  SUB-SVC: ${n.operatorSubServiceId.slice(0,14)}...
                </span>
              `:""}
            </div>
            <span class="badge ${n.isActive?"badge-success":"badge-danger"}">
              ${n.isActive?"ACTIVE":"INACTIVE"}
            </span>
          </div>

          <!-- Title & Identifier -->
          <div style="margin-bottom: 12px;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">${n.name}</h3>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${n.slug}</div>
          </div>

          <!-- Price Typography -->
          <div style="margin-bottom: 14px; display: flex; align-items: baseline; gap: 4px;">
            <span style="font-size: 26px; font-weight: 700; font-family: var(--font-display); color: var(--text-primary); font-variant-numeric: tabular-nums;">
              ${o}${parseFloat(n.price||"0").toFixed(2)}
            </span>
            <span style="font-size: 12px; color: var(--text-secondary);"> / ${n.periodDays} days</span>
          </div>

          <!-- Entitlements & Quotas Box -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 14px; font-size: 11.5px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">AI Token Quota:</span>
              <strong style="color: var(--brand-cyan); font-family: var(--font-mono);">${(n.maxTokens||0).toLocaleString()} tokens</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Daily Messages:</span>
              <strong style="color: var(--text-primary);">${n.maxMessages?`${n.maxMessages} msgs`:"Unlimited"}</strong>
            </div>
          </div>

          <!-- Pinned Actions -->
          <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-secondary edit-plan-btn" data-id="${n.id}" style="flex: 1; font-size: 12px; height: 32px;">
              ${M.edit} Edit Pack
            </button>
            <button class="btn btn-danger btn-icon delete-plan-btn" data-id="${n.id}" title="Deactivate Pack" style="width: 32px; height: 32px; flex-shrink: 0;">
              ${M.trash}
            </button>
          </div>
        </div>
      `}).join(""),i.querySelectorAll(".edit-plan-btn").forEach(n=>{n.onclick=()=>this.openPlanModal(t,n.getAttribute("data-id"))}),i.querySelectorAll(".delete-plan-btn").forEach(n=>{n.onclick=()=>this.deletePlan(t,n.getAttribute("data-id"))})}}openPlanModal(t,e=null){var o,r;const i=e?this.plans.find(l=>l.id===e):null,n=this.operatorId||((o=t.querySelector("#plans-operator-filter"))==null?void 0:o.value),a=this.operatorId||R.activeOperatorId||((r=R.operators[0])==null?void 0:r.id);bt.open({title:i?`Edit Pricing Pack — ${i.name}`:"Create Subscription Pack",maxWidth:"600px",contentHtml:`
        <form id="plan-form">
          <div class="form-group">
            <label class="form-label">Assigned Carrier Operator *</label>
            <select id="plan-operator" class="form-select" ${i||this.operatorId?"disabled":""}>
              ${R.operators.map(l=>`
                <option value="${l.id}" ${(i?i.operatorId===l.id:n===l.id||l.id===a)?"selected":""}>
                  ${l.name} (${l.countryCode})
                </option>
              `).join("")}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Default / Internal Plan Name *</label>
              <input type="text" id="plan-name" class="form-input" placeholder="e.g. Daily Power Pass" required value="${(i==null?void 0:i.name)||""}" />
            </div>

            <div class="form-group">
              <label class="form-label">Unique Slug *</label>
              <input type="text" id="plan-slug" class="form-input" placeholder="e.g. daily-power" required value="${(i==null?void 0:i.slug)||""}" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Billing Period *</label>
              <select id="plan-period" class="form-select">
                <option value="daily" ${(i==null?void 0:i.periodType)==="daily"?"selected":""}>Daily</option>
                <option value="weekly" ${(i==null?void 0:i.periodType)==="weekly"?"selected":""}>Weekly</option>
                <option value="monthly" ${(i==null?void 0:i.periodType)==="monthly"?"selected":""}>Monthly</option>
                <option value="yearly" ${(i==null?void 0:i.periodType)==="yearly"?"selected":""}>Yearly</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Duration (Days) *</label>
              <input type="number" id="plan-days" class="form-input" min="1" max="365" value="${(i==null?void 0:i.periodDays)||1}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Price (DCB Amount) *</label>
              <input type="text" id="plan-price" class="form-input" placeholder="5.0000" value="${(i==null?void 0:i.price)||"5.0000"}" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Currency Code *</label>
              <input type="text" id="plan-currency" class="form-input" placeholder="INR" maxlength="3" style="text-transform: uppercase;" value="${(i==null?void 0:i.currencyCode)||"INR"}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Max Token Quota *</label>
              <input type="number" id="plan-tokens" class="form-input" min="1000" step="1000" value="${(i==null?void 0:i.maxTokens)||1e4}" required />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <label class="form-label">Message quota<input id="plan-messages" class="form-input" type="number" min="1" value="${(i==null?void 0:i.maxMessages)??""}" placeholder="No message limit"></label>
            <label class="form-label">Quota mode<select id="plan-quota-mode" class="form-select">${["tokens","messages","combined","unlimited"].map(l=>`<option ${l===((i==null?void 0:i.quotaMode)||"tokens")?"selected":""}>${l}</option>`).join("")}</select></label>
            <label class="form-label">Quota reset<select id="plan-quota-reset" class="form-select">${["daily","period","never"].map(l=>`<option ${l===((i==null?void 0:i.quotaResetPeriod)||"daily")?"selected":""}>${l}</option>`).join("")}</select></label>
            <label class="form-label">Display order<input id="plan-order" class="form-input" type="number" value="${(i==null?void 0:i.displayOrder)??0}"></label>
            <label><input id="plan-active" type="checkbox" ${(i==null?void 0:i.isActive)!==!1?"checked":""}> Available to subscribers</label>
          </div>

          <!-- Carrier Pack Mapping Section -->
          <div style="background: rgba(99, 102, 241, 0.06); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-sm); padding: 12px; margin: 12px 0;">
            <div style="font-size: 12px; font-weight: 600; color: #a5b4fc; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>📡 Carrier Gateway Pack Mapping (Optional)</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="form-label" style="font-size: 11px;">Operator Pack Code / purchaseTypeId</label>
                <input type="text" id="plan-op-code" class="form-input" style="font-family: var(--font-mono); font-size: 11.5px;" placeholder="e.g. 2, 3, 4, daily" value="${(i==null?void 0:i.operatorPlanCode)||""}" />
                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 3px;">Used for Universe DCB (e.g. 3 for weekly)</span>
              </div>
              <div>
                <label class="form-label" style="font-size: 11px;">Sub-Service Identifier (subServiceId)</label>
                <input type="text" id="plan-sub-service" class="form-input" style="font-family: var(--font-mono); font-size: 11.5px;" placeholder="e.g. Health Portal pass jour" value="${(i==null?void 0:i.operatorSubServiceId)||""}" />
                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 3px;">Used for Orange BF / Subs_Engine</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 16px; align-items: center; margin: 8px 0 14px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12.5px;">
              <input type="checkbox" id="plan-highlight" ${i!=null&&i.isHighlighted?"checked":""} />
              <span>Highlight as "Popular" Pack</span>
            </label>
            <input type="text" id="plan-badge-text" class="form-input" style="width: 140px; padding: 6px 10px; font-size: 12px;" placeholder="Best Value" value="${(i==null?void 0:i.highlightBadge)||"Popular"}" />
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-plan-btn" class="btn btn-primary">
              ${i?"Update Pack":"Create Pricing Pack"}
            </button>
          </div>
        </form>
      `,onRender:(l,c)=>{const d=l.querySelector("#plan-form");d.onsubmit=async p=>{var f,m,y;p.preventDefault();const u=l.querySelector("#save-plan-btn");u.disabled=!0,u.innerText="Saving Pack...";const h=this.operatorId||(i==null?void 0:i.operatorId)||((f=l.querySelector("#plan-operator"))==null?void 0:f.value)||a,g={name:l.querySelector("#plan-name").value.trim(),slug:l.querySelector("#plan-slug").value.trim().toLowerCase(),periodType:l.querySelector("#plan-period").value,periodDays:parseInt(l.querySelector("#plan-days").value,10),price:l.querySelector("#plan-price").value.trim(),currencyCode:l.querySelector("#plan-currency").value.trim().toUpperCase(),maxTokens:parseInt(l.querySelector("#plan-tokens").value,10),maxMessages:Number(l.querySelector("#plan-messages").value)||null,quotaMode:l.querySelector("#plan-quota-mode").value,quotaResetPeriod:l.querySelector("#plan-quota-reset").value,displayOrder:Number(l.querySelector("#plan-order").value),isActive:l.querySelector("#plan-active").checked,isHighlighted:l.querySelector("#plan-highlight").checked,highlightBadge:l.querySelector("#plan-badge-text").value.trim()||void 0,operatorPlanCode:((m=l.querySelector("#plan-op-code"))==null?void 0:m.value.trim())||null,operatorSubServiceId:((y=l.querySelector("#plan-sub-service"))==null?void 0:y.value.trim())||null,operatorId:h||void 0};try{e?(await L.put(`/api/v1/admin/plans/${e}`,g),D.success("Subscription pack updated successfully")):(await L.post("/api/v1/admin/plans",g),D.success("New subscription pack created")),c(),this.loadPlans(t)}catch(v){D.error(v.message||"Failed to save subscription pack"),u.disabled=!1,u.innerText=e?"Update Pack":"Create Pricing Pack"}}}})}async deletePlan(t,e){if(confirm("Are you sure you want to delete or deactivate this subscription pack?"))try{await L.delete(`/api/v1/admin/plans/${e}`),D.success("Subscription plan removed"),this.loadPlans(t)}catch(i){D.error(i.message||"Failed to delete plan")}}}class ga{constructor(t,e){var i;this.onNavigate=t,this.operatorId=e||R.activeOperatorId||((i=R.operators[0])==null?void 0:i.id),this.activeTab="tab-theme",this.selectedLanguage="",this.languageDrafts={},this.selectedScreen="msisdnScreen",this.operator=null,this.theme={},this.settings={},this.languages=[],this.agents=[],this.catalog=[],this.plans=[],this.analytics={},this.flowConfig=null}async render(){const t=document.createElement("div");return t.className="view-container",t.style.paddingBottom="60px",t.innerHTML=`
      <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
        <div style="width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
        <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">Loading Operator Management Studio...</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Fetching live branding tokens, SDUI screens, carrier quotas & telemetry</div>
      </div>
    `,this.loadDataAndRender(t),t}async loadDataAndRender(t){var i,n,a,o,r;const e=this.loadVersion=(this.loadVersion||0)+1;if(this.analyticsStatus="loading",this.operatorId||(R.operators.length>0?this.operatorId=R.operators[0].id:(await R.loadOperators(),this.operatorId=(i=R.operators[0])==null?void 0:i.id)),!this.operatorId){t.innerHTML=`
        <div class="card" style="padding: 40px; text-align: center;">
          <h3 style="color: #fb7185; margin-bottom: 8px;">No Operator Found</h3>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">Please select an operator from the carriers directory.</p>
          <button class="btn btn-primary" id="back-to-ops-btn">← Back to Operators</button>
        </div>
      `,(n=t.querySelector("#back-to-ops-btn"))==null||n.addEventListener("click",()=>this.onNavigate("operators"));return}try{const[l,c,d,p,u,h,g,f]=await Promise.all([L.get(`/api/v1/admin/operators/${this.operatorId}`),L.get(`/api/v1/admin/operators/${this.operatorId}/agents`).catch(()=>({success:!0,data:[]})),L.get("/api/v1/admin/ai/catalog").catch(()=>({success:!0,data:[]})),L.get(`/api/v1/admin/plans?operatorId=${this.operatorId}`).catch(()=>({success:!0,data:[]})),L.get(`/api/v1/admin/operators/${this.operatorId}/flow-config`).catch(()=>({success:!0,data:null})),L.get(`/api/v1/admin/providers/${this.operatorId}/otp/config`).catch(()=>({success:!0,data:null})),L.get(`/api/v1/admin/providers/${this.operatorId}/checksub/config`).catch(()=>({success:!0,data:null})),L.get(`/api/v1/admin/providers/${this.operatorId}/dcb/config`).catch(()=>({success:!0,data:null}))]);if(e!==this.loadVersion)return;if(!l.success||!l.data)throw new Error(((a=l.error)==null?void 0:a.message)||"Operator details not found");this.operator=l.data,this.theme=this.operator.theme||{},this.settings=this.operator.settings||{},this.languages=(this.operator.languages||[]).map(m=>({...m,languageCode:m.languageCode.trim()})),this.operator.defaultLanguage=(o=this.operator.defaultLanguage)==null?void 0:o.trim(),this.agents=c.data||[],this.catalog=d.data||[],this.plans=p.data||[],this.flowConfig=u.data||{authFlow:"simple_otp",checksubEnabled:!1,showPackSelection:!1,otpIncludesPlanId:!1,otpPlanIdFieldName:"planId",autoSubscribeOnVerify:!1},this.otpConfig=(h==null?void 0:h.data)||null,this.checksubConfig=(g==null?void 0:g.data)||null,this.dcbConfig=(f==null?void 0:f.data)||null,R.activeOperatorId!==this.operator.id&&R.setActiveOperator(this.operator.id),this.renderFullPage(t),this.loadAnalytics(t,e)}catch(l){if(e!==this.loadVersion)return;t.innerHTML=`
        <div class="card" style="padding: 40px; text-align: center; border-color: #fb7185;">
          <h3 style="color: #fb7185; margin-bottom: 8px;">Failed to Load Operator</h3>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">${l.message}</p>
          <button class="btn btn-secondary" id="back-to-ops-err-btn">← Back to Carriers Directory</button>
        </div>
      `,(r=t.querySelector("#back-to-ops-err-btn"))==null||r.addEventListener("click",()=>this.onNavigate("operators"))}}metricText(t){var n;if(this.analyticsStatus!=="ready")return this.analyticsStatus==="error"?"Unavailable":"…";const[e,i]=t.split(".");return(((n=this.analytics[e])==null?void 0:n[i])||0).toLocaleString()}async loadAnalytics(t,e){try{const i=await L.get(`/api/v1/admin/operators/${this.operatorId}/analytics`);if(e!==this.loadVersion)return;if(!i.success)throw new Error("Analytics unavailable");this.analytics=i.data||{},this.analyticsStatus="ready"}catch{if(e!==this.loadVersion)return;this.analyticsStatus="error"}t.querySelectorAll("[data-metric]").forEach(i=>{i.textContent=this.metricText(i.dataset.metric)})}renderFullPage(t){var o,r,l,c,d,p,u,h,g,f,m,y,v,S,x,b,_,k,w,C,A,T,P,B,V,O,I,E,W,N,X,it,nt,rt,J,dt,ot,Tt,pt,ne,Vt,jt,Wt,ae,Ut;const e=this.operator,i=this.theme,n=this.settings;t.innerHTML=`
      <!-- TOP BREADCRUMB & HEADER -->
      <div class="flex-between mb-4" style="flex-wrap: wrap; gap: 12px; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap;">
          <button id="back-to-carriers-btn" class="btn btn-secondary btn-sm" style="gap: 6px; font-weight: 600; flex-shrink: 0;">
            ← Back to Carriers
          </button>
          <div style="color: var(--border-medium);">/</div>
          <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
            <span style="font-size: 13.5px; font-weight: 500; color: var(--text-secondary); white-space: nowrap;">Operator Studio</span>
            <div style="color: var(--border-medium);">/</div>
            <span style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); font-family: var(--font-display); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.name}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 4px 10px; border-radius: var(--radius-sm);">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">STATUS:</span>
            <select id="quick-status-select" class="form-select" style="padding: 2px 8px; font-size: 11px; height: 26px; border-radius: 4px; font-weight: 600;">
              <option value="active" ${e.status==="active"?"selected":""}>Active (Live Portal)</option>
              <option value="maintenance" ${e.status==="maintenance"?"selected":""}>Maintenance Mode</option>
              <option value="inactive" ${e.status==="inactive"?"selected":""}>Inactive / Suspended</option>
            </select>
          </div>

          <a href="http://${e.subdomain}.localhost:3000/portal" target="_blank" class="btn btn-secondary btn-sm" style="gap: 6px;" title="Open live telecom subscriber portal in new tab">
            ${M.globe} Live Portal ↗
          </a>
        </div>
      </div>

      <!-- HERO TENANT BANNER -->
      <div class="card mb-6" style="padding: 20px; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); position: relative; overflow: hidden; min-width: 0;">
        <div style="position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: ${i.primaryColor||"var(--accent)"}; opacity: 0.08; filter: blur(40px); pointer-events: none;"></div>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; position: relative; z-index: 1;">
          <div style="display: flex; align-items: center; gap: 16px; min-width: 0; flex: 1 1 300px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: ${i.primaryColor||"var(--accent)"}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 6px 20px ${i.primaryColor?i.primaryColor+"50":"rgba(99,102,241,0.4)"}; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2);">
              ${((o=e.name)==null?void 0:o.charAt(0))||"O"}
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                <h1 style="font-size: 21px; font-weight: 700; margin: 0; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.name}</h1>
                <span class="badge ${e.status==="active"?"badge-success":"badge-warning"}" style="font-size: 10px; padding: 2px 7px;">
                  ${(e.status||"ACTIVE").toUpperCase()}
                </span>
                <span class="badge badge-cyan" style="font-size: 10px; padding: 2px 7px;">
                  ${e.countryCode||"IN"}
                </span>
                <span class="badge" style="background: rgba(147,51,234,0.15); color: #c084fc; border: 1px solid rgba(147,51,234,0.3); font-weight: 700; font-size: 10px; padding: 2px 7px;">
                  ${(e.platformTier||"ENTERPRISE").toUpperCase()}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap;">
                <div>Carrier: <code style="font-family: var(--font-mono); color: var(--text-primary); font-weight: 600;">${e.code}</code></div>
                <div style="color: var(--border-medium);">•</div>
                <div>Host: <span style="color: var(--brand-cyan); font-weight: 600;">${e.subdomain}.tickhigh.com</span></div>
                <div style="color: var(--border-medium);">•</div>
                <div>Ops: <span style="color: var(--text-primary);">${e.contactEmail||"ops@carrier.com"}</span></div>
                <div style="color: var(--border-medium);">•</div>
                <div>TZ: <span style="color: var(--text-primary);">${e.timezone||"UTC"}</span></div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-shrink: 0;">
            <button id="refresh-detail-btn" class="btn btn-secondary btn-sm" style="gap: 6px;">
              ${M.refresh} Refresh Data
            </button>
          </div>
        </div>
      </div>

      <!-- BENTO KPI METRICS GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 20px;">
        <div class="card" style="padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Active Subscribers</span>
            <div style="color: var(--status-success); flex-shrink: 0;">${M.users}</div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; line-height: 1.2;">
            <span data-metric="subscribers.active">${this.metricText("subscribers.active")}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            Demo: <b style="color: var(--text-primary);"><span data-metric="subscribers.demo">${this.metricText("subscribers.demo")}</span></b> · Grace: <b style="color: var(--text-primary);"><span data-metric="subscribers.grace">${this.metricText("subscribers.grace")}</span></b>
          </div>
        </div>

        <div class="card" style="padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">30D AI Token Quota</span>
            <div style="color: #c084fc; flex-shrink: 0;">${M.zap}</div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; line-height: 1.2;">
            <span data-metric="aiUsage.totalTokens">${this.metricText("aiUsage.totalTokens")}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            In: <span data-metric="aiUsage.tokensIn">${this.metricText("aiUsage.tokensIn")}</span> · Out: <span data-metric="aiUsage.tokensOut">${this.metricText("aiUsage.tokensOut")}</span>
          </div>
        </div>

        <div class="card" style="padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">AI Categories</span>
            <div style="color: var(--brand-cyan); flex-shrink: 0;">${M.agents}</div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; line-height: 1.2;">
            ${this.agents.length} Assistants
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${this.agents.filter(q=>q.isActive).length} Active · ${this.agents.filter(q=>q.isLockedUi).length} Locked
          </div>
        </div>

        <div class="card" style="padding: 14px 16px; background: var(--bg-surface); border: 1px solid var(--border-subtle); min-width: 0; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
            <span style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">DCB Billing</span>
            <div style="color: #38bdf8; flex-shrink: 0;">${M.creditCard}</div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; line-height: 1.2;">
            ${this.plans.length} Pricing Tiers
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${this.plans.map(q=>`${q.currencyCode} ${Number(q.price).toFixed(0)}`).join(", ")||"No plans"}
          </div>
        </div>
      </div>

      <!-- FULLPAGE SECTION NAVIGATION TABS -->
      <div class="card mb-6" style="padding: 0; background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-md); overflow: hidden; min-width: 0;">
        <div style="display: flex; border-bottom: 1px solid var(--border-subtle); background: var(--bg-inset); overflow-x: auto; scrollbar-width: thin; -webkit-overflow-scrolling: touch; width: 100%; box-sizing: border-box; min-width: 0;">
          <button class="fullpage-tab-btn ${this.activeTab==="tab-theme"?"active":""}" data-tab="tab-theme" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab==="tab-theme"?"var(--text-primary)":"var(--text-secondary)"}; border-bottom: 2.5px solid ${this.activeTab==="tab-theme"?"var(--accent)":"transparent"}; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${M.palette} <span>SDUI Screens & Theme</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab==="tab-policies"?"active":""}" data-tab="tab-policies" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab==="tab-policies","var(--text-secondary)"}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${M.settings} <span>Carrier Policies</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab==="tab-agents"?"active":""}" data-tab="tab-agents" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab==="tab-agents","var(--text-secondary)"}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${M.agents} <span>AI Categories (${this.agents.length})</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab==="tab-profile"?"active":""}" data-tab="tab-profile" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab==="tab-profile","var(--text-secondary)"}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${M.edit} <span>Carrier Profile</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab==="tab-plans"?"active":""}" data-tab="tab-plans" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab==="tab-plans","var(--text-secondary)"}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${M.creditCard} <span>Plans & Pricing (${this.plans.length})</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab==="tab-languages"?"active":""}" data-tab="tab-languages" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab==="tab-languages","var(--text-secondary)"}; border-bottom: 2.5px solid transparent; font-weight: 600; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${M.globe} <span>Languages (${this.languages.length})</span>
          </button>
          <button class="fullpage-tab-btn ${this.activeTab==="tab-flow"?"active":""}" data-tab="tab-flow" style="padding: 11px 14px; border: none; background: transparent; color: ${this.activeTab==="tab-flow"?"var(--accent)":"var(--text-secondary)"}; border-bottom: 2.5px solid ${this.activeTab==="tab-flow"?"var(--accent)":"transparent"}; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${M.zap||"⚡"} <span>Auth Flow Config</span>
          </button>
        </div>

        <div style="padding: 24px;">
          <!-- TAB 1: SDUI BRANDING & FLOW SCREENS -->
          <div id="fullpage-tab-theme" class="tab-panel" style="display: ${this.activeTab==="tab-theme"?"block":"none"};">
            <div id="language-studio"></div>
            <details style="margin-top:28px"><summary>Shared operator branding (all languages)</summary><form id="shared-branding" style="margin-top:16px">
              ${["primaryColor","secondaryColor","backgroundColor","textColor","cardBgColor","borderRadius","logoUrl","heroImageUrl"].map(q=>`<label class="form-label studio-field">${q}<input class="form-input" name="${q}" value="${z(i[q]||"")}" ${q.endsWith("Color")?'pattern="#[0-9a-fA-F]{6}" required':""}></label>`).join("")}
              <button class="btn btn-primary" style="margin-top:16px">Save shared branding</button>
            </form></details>
          </div>

          <div id="fullpage-tab-policies" class="tab-panel" style="display: ${this.activeTab==="tab-policies"?"block":"none"};">
            <form id="carrier-policies-form">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Carrier Network Policies & Subscriber Quotas</h3>
                  <p style="font-size: 12.5px; color: var(--text-secondary);">Configure cellular header enrichment, trial quotas, grace periods, and brand safety filters.</p>
                </div>
                <button type="submit" id="save-policies-btn" class="btn btn-primary" style="gap: 8px; font-weight: 600;">
                  ${M.check} Save Carrier Policies
                </button>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
                <!-- 1. Seamless Login -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary);">Seamless MSISDN Login</div>
                    <input type="checkbox" id="policy-seamless-check" ${n.seamlessLoginEnabled?"checked":""} style="width: 18px; height: 18px; accent-color: var(--accent);" />
                  </div>
                  <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px;">
                    Carrier Network Header Enrichment (HE) auto-detects phone numbers on mobile data, enabling instant access without SMS OTP.
                  </p>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Checksub Cache TTL (Minutes)</label>
                    <input type="number" id="policy-cache-ttl" class="form-input" value="${n.checksubCacheTtlMinutes||30}" min="1" max="1440" />
                  </div>
                </div>

                <!-- 2. Free Demo Trial -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary);">Free Demo Trial Policy</div>
                    <input type="checkbox" id="policy-demo-check" ${n.demoEnabled?"checked":""} style="width: 18px; height: 18px; accent-color: var(--accent);" />
                  </div>
                  <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px;">
                    Allows unsubscribed visitors to test AI assistants within strict message and token limits.
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Hrs</label>
                      <input type="number" id="policy-demo-hours" class="form-input" value="${n.demoDurationHours||48}" min="1" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Msgs</label>
                      <input type="number" id="policy-demo-msgs" class="form-input" value="${n.demoMaxMessages||10}" min="1" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Tokens</label>
                      <input type="number" id="policy-demo-tokens" class="form-input" value="${n.demoMaxTokens||5e3}" min="100" />
                    </div>
                  </div>
                </div>

                <!-- 3. Grace Period -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Billing Grace Period</div>
                  <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px;">
                    Recovery window for prepaid subscribers with insufficient balance before blocking access.
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Grace Days</label>
                      <input type="number" id="policy-grace-days" class="form-input" value="${n.gracePeriodDays||3}" min="0" max="30" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Access Level</label>
                      <select id="policy-grace-access" class="form-select">
                        <option value="limited" ${n.graceAccessLevel==="limited"?"selected":""}>Limited</option>
                        <option value="full" ${n.graceAccessLevel==="full"?"selected":""}>Full</option>
                        <option value="blocked" ${n.graceAccessLevel==="blocked"?"selected":""}>Blocked</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- 4. Security & Guardrails -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Security & Safety Controls</div>
                  <p style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 12px;">
                    Automated rate limiting and telecom carrier brand safety filters.
                  </p>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                      <input type="checkbox" id="policy-fraud-check" ${n.fraudBlockEnabled?"checked":""} style="accent-color: var(--accent);" />
                      <span>SIM Farm & Fraud Shield</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                      <input type="checkbox" id="policy-content-check" ${n.contentModEnabled?"checked":""} style="accent-color: var(--accent);" />
                      <span>Brand Safety & Moderation</span>
                    </label>
                    <div class="form-group" style="margin-top: 4px; margin-bottom: 0;">
                      <label class="form-label">Max Concurrent Sessions</label>
                      <input type="number" id="policy-max-sessions" class="form-input" value="${n.maxSessionsPerUser||3}" min="1" max="10" />
                    </div>
                  </div>
                </div>

                <!-- 5. Legal URLs -->
                <div class="card" style="padding: 16px; background: var(--bg-inset); border: 1px solid var(--border-subtle); grid-column: 1 / -1; min-width: 0;">
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Legal & Compliance URLs</div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Terms URL</label>
                      <input type="url" id="policy-terms-url" class="form-input" value="${n.termsUrl||""}" placeholder="https://carrier.com/terms" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Privacy URL</label>
                      <input type="url" id="policy-privacy-url" class="form-input" value="${n.privacyUrl||""}" placeholder="https://carrier.com/privacy" />
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Support Email</label>
                      <input type="email" id="policy-support-email" class="form-input" value="${n.supportEmail||e.contactEmail||""}" placeholder="support@carrier.com" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- TAB 3: ASSIGNED AI CATEGORIES CATALOG -->
          <div id="fullpage-tab-agents" class="tab-panel" style="display: ${this.activeTab==="tab-agents"?"block":"none"};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">AI Category Catalog Assignments</h3>
                <p style="font-size: 12.5px; color: var(--text-secondary);">Enable or disable categories for this carrier, assign custom display titles, and lock premium tiers.</p>
              </div>
              <button type="button" id="save-agents-catalog-btn" class="btn btn-primary" style="gap: 8px; font-weight: 600;">
                ${M.check} Save Category Assignments
              </button>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 50px;">Enable</th>
                    <th style="min-width: 220px;">Category &amp; Visual Icon</th>
                    <th>Custom Carrier Title</th><th>Language names</th>
                    <th style="width: 100px;">Order</th>
                    <th>Min Subscription Plan</th>
                    <th>UI Lock</th>
                  </tr>
                </thead>
                <tbody id="operator-agents-table-body">
                  ${this.catalog.map(q=>{var Ae;const j=this.agents.find(zt=>zt.agentId===q.id||zt.slug===q.slug),xt=!!j,wt=(j==null?void 0:j.customName)??((j==null?void 0:j.name)!==q.name&&(j==null?void 0:j.name)||""),oe=(j==null?void 0:j.displayOrder)||1,Mt=(j==null?void 0:j.minPlan)||"",Gt=!!(j!=null&&j.isLockedUi),Te=((Ae=q.translations)==null?void 0:Ae._meta)||{},re=Te.color||"#6366F1",Me=Te.icon||q.slug||"bot";return`
                      <tr class="catalog-agent-row" data-id="${q.id}">
                        <td>
                          <input type="checkbox" class="cat-enable-check" ${xt?"checked":""} style="width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer;" />
                        </td>
                        <td>
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <button type="button" class="btn-change-cat-icon cat-icon-btn" data-id="${q.id}" title="Click to change visual icon & theme color" style="position: relative; width: 36px; height: 36px; border-radius: var(--radius-sm); background: ${re}1A; border: 1.5px solid ${re}44; display: flex; align-items: center; justify-content: center; color: ${re}; flex-shrink: 0; cursor: pointer; padding: 0; transition: all 0.15s ease;">
                              <span class="cat-icon-render">
                                ${Bt({icon:Me,color:re,size:18})}
                              </span>
                              <span class="icon-edit-badge" style="position: absolute; bottom: -3px; right: -3px; width: 13px; height: 13px; border-radius: 50%; background: var(--bg-surface); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-size: 7.5px; color: var(--text-secondary); box-shadow: 0 1px 2px rgba(0,0,0,0.3);">✏️</span>
                            </button>
                            <div>
                              <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${q.name}</span>
                                <button type="button" class="btn-change-cat-icon" data-id="${q.id}" title="Change visual icon or color" style="background: transparent; border: none; padding: 0; font-size: 10.5px; color: var(--accent); cursor: pointer; display: inline-flex; align-items: center; gap: 2px; text-decoration: underline;">
                                  Edit Icon
                                </button>
                              </div>
                              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${q.slug}</span>
                                <span class="badge badge-neutral cat-icon-name-badge" style="font-size: 9.5px; padding: 1px 5px; font-family: var(--font-mono);">${Me}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <input type="text" class="form-input cat-custom-name" value="${wt}" placeholder="${q.name}" style="padding: 6px 10px; font-size: 12px;" />
                        </td>
                        <td>${this.languages.map(zt=>{var $e,Pe;return`<div style="font-size:11px;margin-bottom:5px"><b>${z(zt.languageCode.toUpperCase())}</b>: ${z((($e=zt.strings)==null?void 0:$e[`category.${q.id}.name`])??((Pe=q.translations)==null?void 0:Pe[zt.languageCode])??"Not configured")}</div>`}).join("")}<button type="button" class="btn btn-secondary localize-category">Edit language names</button></td>
                        <td>
                          <input type="number" class="form-input cat-order" value="${oe}" min="1" max="99" style="padding: 6px 10px; font-size: 12px;" />
                        </td>
                        <td>
                          <select class="form-select cat-min-plan" style="padding: 6px 10px; font-size: 12px;">
                            <option value="" ${Mt?"":"selected"}>Free (All Subscribers)</option>
                            <option value="daily-pack" ${Mt==="daily-pack"?"selected":""}>Daily Pack+</option>
                            <option value="weekly-pack" ${Mt==="weekly-pack"?"selected":""}>Weekly Pack+</option>
                            <option value="monthly-pack" ${Mt==="monthly-pack"?"selected":""}>Monthly Pro Only</option>
                          </select>
                        </td>
                        <td>
                          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;">
                            <input type="checkbox" class="cat-lock-check" ${Gt?"checked":""} style="accent-color: var(--status-warning);" />
                            <span>${Gt?"🔒 Locked":"Unlocked"}</span>
                          </label>
                        </td>
                      </tr>
                    `}).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 4: CARRIER PROFILE & SUBDOMAIN -->
          <div id="fullpage-tab-profile" class="tab-panel" style="display: ${this.activeTab==="tab-profile"?"block":"none"};">
            <form id="carrier-profile-form">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Carrier Profile & Subdomain Routing</h3>
                  <p style="font-size: 12.5px; color: var(--text-secondary);">Manage official commercial tenant profile, hosting subdomain, and operational contact details.</p>
                </div>
                <button type="submit" id="save-profile-btn" class="btn btn-primary" style="gap: 8px; font-weight: 600;">
                  ${M.check} Save Carrier Profile
                </button>
              </div>

              <div class="card" style="padding: 20px; background: var(--bg-inset); border: 1px solid var(--border-subtle); min-width: 0;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">Operator Commercial Name *</label>
                    <input type="text" id="prof-name" class="form-input" value="${e.name||""}" required minlength="2" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Operator Status *</label>
                    <select id="prof-status" class="form-select">
                      <option value="active" ${e.status==="active"?"selected":""}>Active (Live Portal & Charging)</option>
                      <option value="maintenance" ${e.status==="maintenance"?"selected":""}>Maintenance Mode</option>
                      <option value="inactive" ${e.status==="inactive"?"selected":""}>Inactive / Suspended</option>
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">Operator Slug Code (Immutable)</label>
                    <input type="text" class="form-input" value="${e.code||""}" readonly style="background: rgba(255,255,255,0.03); color: var(--text-muted); cursor: not-allowed;" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Subdomain (Portal Host Identifier)</label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="text" class="form-input" value="${e.subdomain||""}" readonly style="background: rgba(255,255,255,0.03); color: var(--brand-cyan); font-weight: 600; cursor: not-allowed;" />
                      <span style="color: var(--text-muted); font-size: 12px; white-space: nowrap;">.tickhigh.com</span>
                    </div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">Country Code (ISO 2-char) *</label>
                    <input type="text" id="prof-country" class="form-input" value="${e.countryCode||"IN"}" maxlength="2" required style="text-transform: uppercase;" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Country Phone Code (e.g. +91)</label>
                    <input type="text" id="prof-phone-code" class="form-input" value="${e.countryPhoneCode||e.phoneCode||"+91"}" maxlength="10" placeholder="+91" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Platform Licensing Tier</label>
                    <select id="prof-tier" class="form-select">
                      <option value="starter" ${e.platformTier==="starter"?"selected":""}>Starter</option>
                      <option value="growth" ${e.platformTier==="growth"?"selected":""}>Growth Tier</option>
                      <option value="enterprise" ${e.platformTier==="enterprise"?"selected":""}>Enterprise Telco</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Timezone</label>
                    <input type="text" id="prof-timezone" class="form-input" value="${e.timezone||"Asia/Kolkata"}" />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
                  <div class="form-group">
                    <label class="form-label">Operations Contact Email *</label>
                    <input type="email" id="prof-email" class="form-input" value="${e.contactEmail||""}" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Contact Person Name</label>
                    <input type="text" id="prof-contact-name" class="form-input" value="${e.contactName||""}" placeholder="e.g. Telecom VAS Operations" />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- TAB 5: DCB PRICING PACKS -->
          <div id="fullpage-tab-plans" class="tab-panel" style="display: ${this.activeTab==="tab-plans"?"block":"none"};"></div>

          <!-- TAB 6: REGIONAL LANGUAGES -->
          <div id="fullpage-tab-languages" class="tab-panel" style="display: ${this.activeTab==="tab-languages"?"block":"none"};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Regional Language Dictionaries</h3>
                <p style="font-size: 12.5px; color: var(--text-secondary);">Add, edit and manage multi-lingual localized copy dictionaries and typography for subscriber portal.</p>
              </div>
              <button id="add-regional-lang-btn" class="btn btn-primary" style="font-size: 13px; height: 38px; display: flex; align-items: center; gap: 8px; font-weight: 600;">
                ${M.plus} Add Regional Language
              </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              ${this.languages.length===0?`
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-inset); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
                  No regional languages configured yet. Click "Add Regional Language" above.
                </div>
              `:this.languages.map(q=>{var j,xt,wt,oe,Mt,Gt;return`
                <div class="card" style="padding: 18px; background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); min-width: 0; display: flex; flex-direction: column;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="badge badge-cyan" style="font-size: 11px; text-transform: uppercase; font-weight: 700;">${q.languageCode}</span>
                      <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${((j=q.direction)==null?void 0:j.toUpperCase())||"LTR"}</span>
                      <span style="font-size: 11px; color: var(--text-muted);">${q.direction==="rtl"?"Right-to-Left":"Left-to-Right"}</span>
                    </div>
                    ${q.isDefault?'<span class="badge badge-success" style="font-size: 10px;">DEFAULT</span>':""}
                  </div>

                  <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
                    Font Family: <b style="color: var(--text-primary);">${q.fontFamily||"Inter"}</b>
                  </div>

                  <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; font-size: 12px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; flex: 1;">
                    <div><b>Title:</b> <span style="color: var(--text-primary);">${((xt=q.strings)==null?void 0:xt.title)||"—"}</span></div>
                    <div><b>Subtitle:</b> <span style="color: var(--text-primary);">${((wt=q.strings)==null?void 0:wt.subtitle)||"—"}</span></div>
                    <div><b>CTA Button:</b> <span style="color: var(--text-primary);">${((oe=q.strings)==null?void 0:oe.ctaSubscribe)||"—"}</span></div>
                    <div><b>Phone Prompt:</b> <span style="color: var(--text-primary);">${((Mt=q.strings)==null?void 0:Mt.enterPhonePrompt)||"—"}</span></div>
                    <div><b>OTP Prompt:</b> <span style="color: var(--text-primary);">${((Gt=q.strings)==null?void 0:Gt.verifyOtpPrompt)||"—"}</span></div>
                  </div>

                  <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; gap: 8px;">
                    <button class="btn btn-secondary edit-language-dict-btn" data-code="${q.languageCode}" style="flex: 1; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                      ${M.edit} Edit Dictionary & Copy
                    </button>
                  </div>
                </div>
              `}).join("")}
            </div>
          </div>
        </div>

          <!-- TAB 7: AUTH FLOW CONFIGURATION -->
          <div id="fullpage-tab-flow" class="tab-panel" style="display: ${this.activeTab==="tab-flow"?"block":"none"};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Subscriber Auth &amp; Subscription Flow</h3>
                <p style="font-size: 12.5px; color: var(--text-secondary); max-width: 560px;">Configure the exact journey a subscriber takes — from entering their number to becoming active. Different operators have different API handshakes with their platform.</p>
              </div>
            </div>

            <!-- Flow Type Selector Cards -->
            <div style="margin-bottom: 24px;">
              <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); display: block; margin-bottom: 12px;">Select Subscriber Journey Strategy</label>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;" id="flow-type-cards">

                <div class="flow-type-card" data-flow="simple_otp" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${!((r=this.flowConfig)!=null&&r.flowStrategy)||((l=this.flowConfig)==null?void 0:l.flowStrategy)==="simple_otp"?"var(--accent)":"var(--border-subtle)"}; background: ${!((c=this.flowConfig)!=null&&c.flowStrategy)||((d=this.flowConfig)==null?void 0:d.flowStrategy)==="simple_otp"?"rgba(99,102,241,0.08)":"var(--bg-inset)"}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">📱</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Standard Simple OTP</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">Number → OTP → Verify</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Standard telco SMS OTP without upfront packs or checksub.</div>
                </div>

                <div class="flow-type-card" data-flow="checksub_first_sync" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${((p=this.flowConfig)==null?void 0:p.flowStrategy)==="checksub_first_sync"||((u=this.flowConfig)==null?void 0:u.authFlow)==="checksub_then_otp"?"var(--accent)":"var(--border-subtle)"}; background: ${((h=this.flowConfig)==null?void 0:h.flowStrategy)==="checksub_first_sync"||((g=this.flowConfig)==null?void 0:g.authFlow)==="checksub_then_otp"?"rgba(99,102,241,0.08)":"var(--bg-inset)"}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">⚡</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">CheckSub + Engine Sync</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">CheckSub → [OTP if inactive] → Sync Engine</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Orange BF pattern: Active bypasses OTP. Post-verify calls Subs_Engine sync.</div>
                </div>

                <div class="flow-type-card" data-flow="pack_first_dcb_pin" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${((f=this.flowConfig)==null?void 0:f.flowStrategy)==="pack_first_dcb_pin"||((m=this.flowConfig)==null?void 0:m.authFlow)==="pack_first_otp"?"var(--accent)":"var(--border-subtle)"}; background: ${((y=this.flowConfig)==null?void 0:y.flowStrategy)==="pack_first_dcb_pin"||((v=this.flowConfig)==null?void 0:v.authFlow)==="pack_first_otp"?"rgba(99,102,241,0.08)":"var(--bg-inset)"}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">📦</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Pack Selection + DCB PIN</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">Select Pack → Request PIN → Confirm → Polling</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Universe DCB pattern: Injects purchaseTypeId, saves request ID & polls status.</div>
                </div>

                <div class="flow-type-card" data-flow="query_param_token" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${((S=this.flowConfig)==null?void 0:S.flowStrategy)==="query_param_token"?"var(--accent)":"var(--border-subtle)"}; background: ${((x=this.flowConfig)==null?void 0:x.flowStrategy)==="query_param_token"?"rgba(99,102,241,0.08)":"var(--bg-inset)"}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">🔗</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Macro URL Query Param</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">GET Query Substitution (#MSISDN#, #ANDROIDID#)</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Etisalat UAE pattern: URL template query strings with transaction tracking.</div>
                </div>

                <div class="flow-type-card" data-flow="header_enrichment" style="padding: 16px; border-radius: var(--radius-md); border: 2px solid ${((b=this.flowConfig)==null?void 0:b.flowStrategy)==="header_enrichment"?"var(--accent)":"var(--border-subtle)"}; background: ${((_=this.flowConfig)==null?void 0:_.flowStrategy)==="header_enrichment"?"rgba(99,102,241,0.08)":"var(--bg-inset)"}; cursor: pointer; transition: all 0.2s;">
                  <div style="font-size: 20px; margin-bottom: 8px;">📶</div>
                  <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Zero-Click Cellular (HE)</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.5;">Network Header Enrichment → Direct Login / Packs</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Carrier 3G/4G/5G header detects MSISDN automatically. Zero OTP typing required.</div>
                </div>

              </div>
            </div>

            <!-- Conditional Options Form -->
            <form id="flow-config-form">
              <input type="hidden" id="flow-auth-flow" name="authFlow" value="${((k=this.flowConfig)==null?void 0:k.flowStrategy)||((w=this.flowConfig)==null?void 0:w.authFlow)||"simple_otp"}">

              <!-- Carrier Global Identifiers Box -->
              <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <h4 style="font-size: 13px; font-weight: 700; color: #a5b4fc; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">🌐 Carrier Global Identifiers (From Spec / MD)</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
                  <div>
                    <label class="form-label" style="font-size: 11px;">Carrier Service ID (serviceId)</label>
                    <input type="text" id="flow-global-service-id" name="globalServiceId" class="form-input" value="${((C=this.flowConfig)==null?void 0:C.globalServiceId)||""}" placeholder="e.g. 581 or Health Portal Livliness" style="font-family: var(--font-mono); font-size: 12px;">
                  </div>
                  <div>
                    <label class="form-label" style="font-size: 11px;">Merchant / Content Provider ID (merchantId / cpId)</label>
                    <input type="text" id="flow-global-merchant-id" name="globalMerchantId" class="form-input" value="${((A=this.flowConfig)==null?void 0:A.globalMerchantId)||""}" placeholder="e.g. 169 or 100" style="font-family: var(--font-mono); font-size: 12px;">
                  </div>
                  <div>
                    <label class="form-label" style="font-size: 11px;">Carrier Operator Code (operator)</label>
                    <input type="text" id="flow-global-operator-code" name="globalOperatorCode" class="form-input" value="${((T=this.flowConfig)==null?void 0:T.globalOperatorCode)||""}" placeholder="e.g. WM, ORG, ETISALAT" style="font-family: var(--font-mono); font-size: 12px;">
                  </div>
                </div>
              </div>

              <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">⚙️ Flow Step Options</h4>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">

                  <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="flow-checksub" name="checksubEnabled" ${(P=this.flowConfig)!=null&&P.checksubEnabled?"checked":""} style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0;">
                    <div>
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Enable Checksub API Call</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">Call the carrier's checksub endpoint before OTP. If user is active, log them in directly (seamless login).</div>
                    </div>
                  </label>

                  <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="flow-show-packs" name="showPackSelection" ${(B=this.flowConfig)!=null&&B.showPackSelection?"checked":""} style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0;">
                    <div>
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Show Plan / Pack Selection</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">Display available subscription packs/plans to the user before sending OTP.</div>
                    </div>
                  </label>

                  <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="flow-otp-plan-id" name="otpIncludesPlanId" ${(V=this.flowConfig)!=null&&V.otpIncludesPlanId?"checked":""} style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0;">
                    <div>
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Inject Plan ID into OTP Request</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">Pass the selected pack/plan ID as a field in the OTP send API request body.</div>
                    </div>
                  </label>

                  <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="flow-auto-sub" name="autoSubscribeOnVerify" ${(O=this.flowConfig)!=null&&O.autoSubscribeOnVerify?"checked":""} style="margin-top: 2px; width: 16px; height: 16px; accent-color: var(--accent); flex-shrink: 0;">
                    <div>
                      <div style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Auto-Subscribe / Engine Sync on Verify</div>
                      <div style="font-size: 11px; color: var(--text-secondary);">Trigger DCB charge or Subs_Engine /sync automatically after successful OTP verification.</div>
                    </div>
                  </label>

                </div>

                <div style="margin-top: 16px; display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 200px;">
                    <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 6px;">OTP Plan ID Field Name</label>
                    <input type="text" id="flow-plan-field" name="otpPlanIdFieldName" class="form-input" value="${((I=this.flowConfig)==null?void 0:I.otpPlanIdFieldName)||"planId"}" placeholder="e.g. serviceId, packCode, purchaseTypeId" style="font-family: var(--font-mono); font-size: 12px;">
                    <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 4px;">The JSON field key injected into the OTP send request template (e.g. &quot;purchaseTypeId&quot;: 3)</div>
                  </div>
                </div>
              <!-- Live Gateway API Endpoints (Direct Integration) -->
              <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <h4 style="font-size: 13.5px; font-weight: 700; color: #38bdf8; margin: 0 0 3px 0; display: flex; align-items: center; gap: 8px;">
                      📡 Carrier Gateway Endpoints (Direct Integration)
                    </h4>
                    <p style="font-size: 11.5px; color: var(--text-secondary); margin: 0;">These endpoints adapt dynamically to your selected Strategy Flow above.</p>
                  </div>
                  <span class="badge badge-cyan" style="font-size: 10.5px;">LIVE TELCO APIS</span>
                </div>

                <!-- Active Strategy Context Guidance Banner -->
                <div id="flow-strategy-active-banner" style="margin-bottom: 16px; padding: 10px 14px; background: rgba(56,189,248,0.06); border-left: 3px solid #38bdf8; border-radius: var(--radius-xs); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;"></div>

                <!-- Available Dynamic Macros Quick Bar -->
                <div style="background: rgba(99,102,241,0.06); border: 1px dashed rgba(99,102,241,0.3); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 16px; font-size: 11.5px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                  <div style="color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px;">💡</span>
                    <span><strong style="color: var(--text-primary);">Dynamic Macro Variables:</strong> URLs ya Templates me ye placeholders daalein — platform inhein subscriber &amp; pack values se runtime par replace karega:</span>
                  </div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{msisdn}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{otp}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{requestId}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{planCode}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #818cf8; font-family: var(--font-mono); font-size: 11px;">{{serviceId}}</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #a855f7; font-family: var(--font-mono); font-size: 11px;">#MSISDN#</span>
                    <span class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: #a855f7; font-family: var(--font-mono); font-size: 11px;">#OTP#</span>
                  </div>
                </div>

                <!-- Shared Credentials Header -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
                  <div>
                    <label class="form-label" style="font-size: 11px;">Carrier Gateway Secret / API Token</label>
                    <input type="password" id="flow-gw-secret" class="form-input" placeholder="Bearer token or carrier secret key" value="carrier_secret_sample_key" style="font-size: 12px;">
                  </div>
                  <div>
                    <label class="form-label" style="font-size: 11px;">Authentication Scheme</label>
                    <select id="flow-gw-auth-type" class="form-select" style="font-size: 12px;">
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="api_key">X-API-Key Header</option>
                      <option value="none">None / Query Param</option>
                    </select>
                  </div>
                </div>

                <!-- Endpoints Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;" id="flow-gw-endpoints-grid">

                  <!-- 1. Send OTP Endpoint -->
                  <div id="flow-gw-card-otp-send" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #818cf8;">📱 Send OTP API</span>
                      <select id="flow-gw-otp-send-method" class="form-select" style="width: auto; padding: 2px 6px; font-size: 11px; height: 24px;">
                        <option value="POST" ${((E=this.otpConfig)==null?void 0:E.sendMethod)==="POST"?"selected":""}>POST</option>
                        <option value="GET" ${((W=this.otpConfig)==null?void 0:W.sendMethod)==="GET"?"selected":""}>GET</option>
                      </select>
                    </div>
                    <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Endpoint URL</label>
                    <input type="text" id="flow-gw-otp-send-endpoint" class="form-input" placeholder="http://0.0.0.0:3000/api/v1/dummy/otp/send" value="${((N=this.otpConfig)==null?void 0:N.sendEndpoint)||""}" style="font-family: var(--font-mono); font-size: 11.5px; margin-bottom: 8px;">
                    <label class="form-label" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px;">Send Request Template (JSON / Query Body)</label>
                    <textarea id="flow-gw-otp-send-template" class="form-textarea" rows="3" style="font-family: var(--font-mono); font-size: 11px;" placeholder='{
  "msisdn": "{{msisdn}}"
}'>${typeof((X=this.otpConfig)==null?void 0:X.sendRequestTemplate)=="string"?this.otpConfig.sendRequestTemplate:(it=this.otpConfig)!=null&&it.sendRequestTemplate?JSON.stringify(this.otpConfig.sendRequestTemplate,null,2):""}</textarea>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Available: <code>{{msisdn}}</code>, <code>{{planCode}}</code>, <code>{{serviceId}}</code></div>
                  </div>

                  <!-- 2. Verify OTP API -->
                  <div id="flow-gw-card-otp-verify" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #818cf8;">🔑 Verify OTP API</span>
                      <select id="flow-gw-otp-verify-method" class="form-select" style="width: auto; padding: 2px 6px; font-size: 11px; height: 24px;">
                        <option value="POST" ${((nt=this.otpConfig)==null?void 0:nt.verifyMethod)==="POST"?"selected":""}>POST</option>
                        <option value="GET" ${((rt=this.otpConfig)==null?void 0:rt.verifyMethod)==="GET"?"selected":""}>GET</option>
                      </select>
                    </div>
                    <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Endpoint URL</label>
                    <input type="text" id="flow-gw-otp-verify-endpoint" class="form-input" placeholder="http://0.0.0.0:3000/api/v1/dummy/otp/verify" value="${((J=this.otpConfig)==null?void 0:J.verifyEndpoint)||""}" style="font-family: var(--font-mono); font-size: 11.5px; margin-bottom: 8px;">
                    <label class="form-label" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px;">Verify Request Template (JSON / Query Body)</label>
                    <textarea id="flow-gw-otp-verify-template" class="form-textarea" rows="3" style="font-family: var(--font-mono); font-size: 11px;" placeholder='{
  "msisdn": "{{msisdn}}",
  "otp": "{{otp}}",
  "referenceId": "{{referenceId}}"
}'>${typeof((dt=this.otpConfig)==null?void 0:dt.verifyRequestTemplate)=="string"?this.otpConfig.verifyRequestTemplate:(ot=this.otpConfig)!=null&&ot.verifyRequestTemplate?JSON.stringify(this.otpConfig.verifyRequestTemplate,null,2):""}</textarea>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Available: <code>{{msisdn}}</code>, <code>{{otp}}</code>, <code>{{referenceId}}</code>, <code>{{planCode}}</code></div>
                  </div>

                  <!-- 3. CheckSub Endpoint -->
                  <div id="flow-gw-card-checksub" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #fbbf24;">🔍 CheckSub API</span>
                      <select id="flow-gw-checksub-method" class="form-select" style="width: auto; padding: 2px 6px; font-size: 11px; height: 24px;">
                        <option value="GET" ${((Tt=this.checksubConfig)==null?void 0:Tt.httpMethod)==="GET"?"selected":""}>GET</option>
                        <option value="POST" ${((pt=this.checksubConfig)==null?void 0:pt.httpMethod)==="POST"?"selected":""}>POST</option>
                      </select>
                    </div>
                    <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Checksub URL</label>
                    <input type="text" id="flow-gw-checksub-endpoint" class="form-input" placeholder="http://0.0.0.0:3000/api/v1/dummy/flow/checksub-first" value="${((ne=this.checksubConfig)==null?void 0:ne.endpoint)||""}" style="font-family: var(--font-mono); font-size: 11.5px; margin-bottom: 8px;">
                    <label class="form-label" style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px;">Query / Body Template (Optional)</label>
                    <textarea id="flow-gw-checksub-template" class="form-textarea" rows="3" style="font-family: var(--font-mono); font-size: 11px;" placeholder='{
  "msisdn": "{{msisdn}}"
}'>${typeof((Vt=this.checksubConfig)==null?void 0:Vt.requestTemplate)=="string"?this.checksubConfig.requestTemplate:(jt=this.checksubConfig)!=null&&jt.requestTemplate?JSON.stringify(this.checksubConfig.requestTemplate,null,2):""}</textarea>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Supports query params or JSON body with <code>{{msisdn}}</code></div>
                  </div>

                  <!-- 4. DCB Charge & Subs_Engine Sync Endpoint -->
                  <div id="flow-gw-card-dcb" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; transition: all 0.3s;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #22d3ee;">💳 DCB &amp; Sync Engine</span>
                      <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">BILLING SYNC</span>
                    </div>

                    <div id="flow-gw-dcb-charge-group" style="margin-bottom: 8px;">
                      <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">DCB Charge / PIN URL</label>
                      <input type="text" id="flow-gw-dcb-charge-endpoint" class="form-input" placeholder="http://0.0.0.0:3000/api/v1/dummy/flow/pack-first/verify-pin" value="${((Wt=this.dcbConfig)==null?void 0:Wt.chargeEndpoint)||((ae=this.dcbConfig)==null?void 0:ae.endpoint)||""}" style="font-family: var(--font-mono); font-size: 11.5px;">
                    </div>
                    
                    <div id="flow-gw-dcb-sync-group">
                      <label class="form-label" style="font-size: 10.5px; margin-bottom: 2px;">Subs_Engine Sync URL (e.g. Orange BF)</label>
                      <input type="url" id="flow-gw-dcb-sync-endpoint" class="form-input" placeholder="http://domain.com:8080/Subs_Engine/subscription/sync?msisdn={{msisdn}}&amp;plan={{planCode}}" value="${((Ut=this.dcbConfig)==null?void 0:Ut.syncEndpoint)||""}" style="font-family: var(--font-mono); font-size: 11.5px;">
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Triggered after OTP verification to activate billing engine.</div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Live Flow Diagram -->
              <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;" id="flow-diagram-container">
                <h4 style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.06em;">Live Flow Preview</h4>
                <div id="flow-diagram" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; font-weight: 600;"></div>
              </div>

              <button type="submit" id="save-flow-config-btn" class="btn btn-primary" style="height: 40px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;">
                💾 Save Flow Configuration
              </button>
            </form>
          </div>

        </div>
      </div>
    `,this.bindEvents(t),He(this,t);const a=new Mp(this.onNavigate,this.operatorId);a.onPlansLoaded=q=>{this.plans=q,He(this,t)},a.render(this.plans).then(q=>{const j=document.createElement("button");j.className="btn btn-secondary",j.style.marginBottom="20px",j.textContent="Edit plan page text & localized plan names",j.onclick=()=>{this.selectedScreen="plans",t.querySelector('[data-tab="tab-theme"]').click(),He(this,t)},q.prepend(j),t.querySelector("#fullpage-tab-plans").replaceChildren(q)}),t.querySelector("#shared-branding").onsubmit=async q=>{q.preventDefault();const j=q.currentTarget.querySelector("button"),xt=Object.fromEntries(new FormData(q.currentTarget));xt.fontFamily=this.theme.fontFamily||"Inter";for(const wt of["logoUrl","heroImageUrl"])xt[wt]||(xt[wt]=null);j.disabled=!0;try{await L.put(`/api/v1/admin/operators/${this.operatorId}/theme`,xt),Object.assign(this.theme,xt),D.success("Shared branding saved")}catch(wt){D.error(wt.message)}finally{j.disabled=!1}}}openCategoryIconModal(t,e){const n=(t.translations||{})._meta||{};let a=n.icon||t.slug||"bot",o=n.color||"#6366F1";const r=["#F97316","#10B981","#3B82F6","#8B5CF6","#EC4899","#EAB308","#EF4444","#06B6D4","#6366F1","#14B8A6","#F59E0B","#64748B"];bt.open({title:`Update Visual Icon & Theme — ${t.name}`,maxWidth:"620px",contentHtml:`
        <form id="cat-icon-quick-form">
          <!-- Live Preview Banner -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div id="modal-icon-badge" style="width: 44px; height: 44px; border-radius: var(--radius-md); background: ${o}1A; border: 1.5px solid ${o}44; display: flex; align-items: center; justify-content: center; color: ${o}; flex-shrink: 0; transition: all 0.2s ease;">
                ${Bt({icon:a,color:o,size:24})}
              </div>
              <div>
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Live Card Preview</div>
                <div id="modal-preview-title" style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${t.name}</div>
                <div style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">${t.slug}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <span id="modal-preview-icon-name" class="badge badge-primary" style="font-family: var(--font-mono); font-size: 11px;">icon: ${a}</span>
            </div>
          </div>

          <!-- Curated Icon Palette -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div>
                <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0;">Curated Icon Palette</h4>
                <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">Click an icon to assign. Compatible with subscriber portals.</p>
              </div>
              <span id="modal-selected-icon-label" class="badge badge-neutral" style="font-size: 11px; font-weight: 600;">Selected: ${a}</span>
            </div>

            <!-- Category Filter Tabs -->
            <div id="modal-icon-cat-filter" style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px;">
              <button type="button" class="badge badge-primary modal-icon-filter-btn" data-cat="all" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">All (22)</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Lifestyle" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Lifestyle</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Wellness" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Wellness</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Education" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Education</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Finance" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Finance</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Travel" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Travel</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Creative" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Creative</button>
              <button type="button" class="badge badge-neutral modal-icon-filter-btn" data-cat="Work" style="cursor: pointer; border: none; font-size: 10px; padding: 3px 8px;">Tech / Work</button>
            </div>

            <!-- Icons Grid -->
            <div id="modal-icon-picker-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-bottom: 12px; max-height: 180px; overflow-y: auto; padding: 4px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--bg-surface);">
              ${Ti.map(l=>{const c=l.id===a;return`
                  <button type="button" class="modal-icon-choice-btn" data-icon="${l.id}" data-cat="${l.category}" data-default-color="${l.color}" data-label="${l.label}" title="${l.label}" style="background: ${c?l.color+"1A":"transparent"}; border: 1.5px solid ${c?l.color:"var(--border-subtle)"}; border-radius: var(--radius-sm); padding: 6px 3px; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; color: ${c?l.color:"var(--text-secondary)"}; font-size: 11px; transition: all 0.15s ease; box-shadow: ${c?`0 0 0 2px ${l.color}33`:"none"};">
                    <span style="display: flex; align-items: center; justify-content: center; width: 22px; height: 22px;">
                      ${Bt({icon:l.id,color:c?l.color:"currentColor",size:18})}
                    </span>
                    <span style="font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${l.label.split("&")[0].trim()}</span>
                  </button>
                `}).join("")}
            </div>

            <!-- Custom Image URL or Lucide Name -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; gap: 6px; align-items: center;">
                <input type="text" id="modal-custom-icon-input" class="form-input" placeholder="Or enter custom image URL (https://...) or Lucide icon name..." value="${a.startsWith("http")||!Ti.some(l=>l.id===a)?a:""}" style="font-size: 11.5px; padding: 6px 10px;" />
                <button type="button" id="modal-apply-custom-icon-btn" class="btn btn-secondary" style="font-size: 11px; white-space: nowrap; padding: 6px 10px;">Apply</button>
              </div>
              <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">Supports custom external image/SVG URLs or Lucide icon names.</div>
            </div>

            <!-- Theme Accent Color -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-inset); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <label class="form-label" style="margin: 0; font-size: 11.5px;">Theme Accent Color:</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="color" id="modal-cat-color" value="${o}" style="width: 28px; height: 26px; border: none; border-radius: 4px; cursor: pointer; background: transparent;" />
                  <span id="modal-cat-color-hex" style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-primary); font-weight: 600;">${o}</span>
                </div>
              </div>
              <div style="display: flex; gap: 4px; align-items: center;">
                ${r.map(l=>`
                  <button type="button" class="modal-color-swatch-btn" data-color="${l}" style="width: 17px; height: 17px; border-radius: 50%; background: ${l}; border: 1.5px solid ${l===o?"#fff":"transparent"}; cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></button>
                `).join("")}
              </div>
              <input type="hidden" id="modal-selected-icon-id" value="${a}" />
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 12px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-cat-icon-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px;">
              ${M.check} Save Icon &amp; Theme
            </button>
          </div>
        </form>
      `,onRender:(l,c)=>{const d=l.querySelector("#cat-icon-quick-form"),p=l.querySelector("#modal-selected-icon-id"),u=l.querySelector("#modal-custom-icon-input"),h=l.querySelector("#modal-apply-custom-icon-btn"),g=l.querySelector("#modal-cat-color"),f=l.querySelector("#modal-cat-color-hex"),m=l.querySelector("#modal-selected-icon-label"),y=l.querySelector("#modal-icon-badge"),v=l.querySelector("#modal-preview-icon-name"),S=(x,b)=>{a=x,o=b,p.value=x,g.value=b,f.textContent=b,m.textContent=`Selected: ${x}`,v.textContent=`icon: ${x}`,y.style.background=`${b}1A`,y.style.borderColor=`${b}44`,y.style.color=b,y.innerHTML=Bt({icon:x,color:b,size:24}),l.querySelectorAll(".modal-icon-choice-btn").forEach(_=>{const k=_.getAttribute("data-icon")===x;_.style.borderColor=k?b:"var(--border-subtle)",_.style.background=k?`${b}1A`:"transparent",_.style.color=k?b:"var(--text-secondary)",_.style.boxShadow=k?`0 0 0 2px ${b}33`:"none"})};l.querySelectorAll(".modal-icon-choice-btn").forEach(x=>{x.onclick=()=>{const b=x.getAttribute("data-icon"),_=x.getAttribute("data-default-color")||g.value;u.value="",S(b,_)}}),l.querySelectorAll(".modal-icon-filter-btn").forEach(x=>{x.onclick=()=>{const b=x.getAttribute("data-cat");l.querySelectorAll(".modal-icon-filter-btn").forEach(_=>{_.className=_===x?"badge badge-primary modal-icon-filter-btn":"badge badge-neutral modal-icon-filter-btn"}),l.querySelectorAll(".modal-icon-choice-btn").forEach(_=>{b==="all"||_.getAttribute("data-cat")===b?_.style.display="flex":_.style.display="none"})}}),h.onclick=()=>{const x=u.value.trim();x&&S(x,g.value)},u.addEventListener("keydown",x=>{x.key==="Enter"&&(x.preventDefault(),h.click())}),g.oninput=()=>{S(p.value,g.value)},l.querySelectorAll(".modal-color-swatch-btn").forEach(x=>{x.onclick=()=>{const b=x.getAttribute("data-color");S(p.value,b)}}),d.onsubmit=async x=>{x.preventDefault();const b=l.querySelector("#save-cat-icon-btn");b.disabled=!0,b.innerText="Saving...";const _={...t.translations||{},_meta:{icon:a,color:o}};try{if(await L.put(`/api/v1/admin/ai/catalog/${t.id}`,{translations:_}),t.translations=_,e){const k=e.querySelector(".cat-icon-btn");k&&(k.style.background=`${o}1A`,k.style.borderColor=`${o}44`,k.style.color=o);const w=e.querySelector(".cat-icon-render");w&&(w.innerHTML=Bt({icon:a,color:o,size:18}));const C=e.querySelector(".cat-icon-name-badge");C&&(C.textContent=a)}D.success(`Icon and color for "${t.name}" updated successfully!`),c()}catch(k){D.error(k.message||"Failed to update category icon"),b.disabled=!1,b.innerHTML=`${M.check} Save Icon &amp; Theme`}}}})}bindEvents(t){var p,u,h;const e=this.operator;t.querySelectorAll(".localize-category").forEach(g=>g.onclick=()=>{this.selectedScreen="categories",t.querySelector('[data-tab="tab-theme"]').click(),He(this,t)}),t.querySelectorAll(".btn-change-cat-icon").forEach(g=>{g.onclick=f=>{f.preventDefault(),f.stopPropagation();const m=g.getAttribute("data-id"),y=this.catalog.find(S=>S.id===m),v=g.closest(".catalog-agent-row");y&&this.openCategoryIconModal(y,v)}}),(p=t.querySelector("#back-to-carriers-btn"))==null||p.addEventListener("click",()=>{this.onNavigate("operators")}),(u=t.querySelector("#refresh-detail-btn"))==null||u.addEventListener("click",()=>{this.loadDataAndRender(t)});const i=t.querySelector("#quick-status-select");i&&(i.onchange=async()=>{const g=i.value;try{await L.put(`/api/v1/admin/operators/${e.id}`,{status:g}),D.success(`Operator status updated to ${g.toUpperCase()}`),await R.loadOperators()}catch(f){D.error(f.message||"Failed to update status"),i.value=e.status}});const n=t.querySelectorAll(".fullpage-tab-btn"),a=t.querySelectorAll(".tab-panel");n.forEach(g=>{g.onclick=()=>{const f=g.getAttribute("data-tab");this.activeTab=f,n.forEach(y=>{y.classList.remove("active"),y.style.color="var(--text-secondary)",y.style.borderBottomColor="transparent"}),g.classList.add("active"),g.style.color="var(--text-primary)",g.style.borderBottomColor="var(--accent)",a.forEach(y=>y.style.display="none");const m=t.querySelector(`#fullpage-${f}`);m&&(m.style.display="block")}});const o=t.querySelector("#carrier-policies-form");o&&(o.onsubmit=async g=>{g.preventDefault();const f=t.querySelector("#save-policies-btn");f.disabled=!0,f.innerText="Saving Policies...";const m={seamlessLoginEnabled:t.querySelector("#policy-seamless-check").checked,checksubCacheTtlMinutes:parseInt(t.querySelector("#policy-cache-ttl").value,10)||30,demoEnabled:t.querySelector("#policy-demo-check").checked,demoDurationHours:parseInt(t.querySelector("#policy-demo-hours").value,10)||48,demoMaxMessages:parseInt(t.querySelector("#policy-demo-msgs").value,10)||10,demoMaxTokens:parseInt(t.querySelector("#policy-demo-tokens").value,10)||5e3,gracePeriodDays:parseInt(t.querySelector("#policy-grace-days").value,10)||3,graceAccessLevel:t.querySelector("#policy-grace-access").value,fraudBlockEnabled:t.querySelector("#policy-fraud-check").checked,contentModEnabled:t.querySelector("#policy-content-check").checked,maxSessionsPerUser:parseInt(t.querySelector("#policy-max-sessions").value,10)||3,termsUrl:t.querySelector("#policy-terms-url").value.trim()||void 0,privacyUrl:t.querySelector("#policy-privacy-url").value.trim()||void 0,supportEmail:t.querySelector("#policy-support-email").value.trim()||void 0};try{await L.put(`/api/v1/admin/operators/${e.id}/settings`,m),D.success("Carrier network policies and quotas updated successfully!"),f.disabled=!1,f.innerHTML=`${M.check} Save Carrier Policies`}catch(y){D.error(y.message||"Failed to update policies"),f.disabled=!1,f.innerHTML=`${M.check} Save Carrier Policies`}});const r=t.querySelector("#save-agents-catalog-btn");r&&(r.onclick=async()=>{r.disabled=!0,r.innerText="Saving Assignments...";const g=[];t.querySelectorAll(".catalog-agent-row").forEach(f=>{const m=f.querySelector(".cat-enable-check");if(m&&m.checked){const y=f.getAttribute("data-id"),v=parseInt(f.querySelector(".cat-order").value,10)||1,S=f.querySelector(".cat-custom-name").value.trim()||null,x=f.querySelector(".cat-min-plan").value.trim()||null,b=f.querySelector(".cat-lock-check").checked;g.push({agentId:y,displayOrder:v,customName:S,minPlan:x,isLockedUi:b,isActive:!0})}});try{await L.post(`/api/v1/admin/operators/${e.id}/agents`,{agents:g}),D.success(`Assigned ${g.length} AI categories to ${e.name}!`),r.disabled=!1,r.innerHTML=`${M.check} Save Category Assignments`}catch(f){D.error(f.message||"Failed to update categories"),r.disabled=!1,r.innerHTML=`${M.check} Save Category Assignments`}});const l=t.querySelector("#carrier-profile-form");l&&(l.onsubmit=async g=>{g.preventDefault();const f=t.querySelector("#save-profile-btn");f.disabled=!0,f.innerText="Updating Profile...";const m={name:t.querySelector("#prof-name").value.trim(),status:t.querySelector("#prof-status").value,countryCode:t.querySelector("#prof-country").value.trim().toUpperCase(),countryPhoneCode:t.querySelector("#prof-phone-code").value.trim()||void 0,platformTier:t.querySelector("#prof-tier").value,timezone:t.querySelector("#prof-timezone").value.trim(),contactEmail:t.querySelector("#prof-email").value.trim(),contactName:t.querySelector("#prof-contact-name").value.trim()||void 0};try{await L.put(`/api/v1/admin/operators/${e.id}`,m),D.success("Carrier profile and commercial settings updated!"),f.disabled=!1,f.innerHTML=`${M.check} Save Carrier Profile`,await R.loadOperators()}catch(y){D.error(y.message||"Failed to update profile"),f.disabled=!1,f.innerHTML=`${M.check} Save Carrier Profile`}});const c=t.querySelector("#add-regional-lang-btn");c&&(c.onclick=()=>this.openLanguageModal(t)),t.querySelectorAll(".edit-language-dict-btn").forEach(g=>{g.onclick=()=>{const f=g.getAttribute("data-code");this.openLanguageModal(t,f)}});const d=t.querySelector("#flow-config-form");if(d){const g=()=>{var T,P,B,V,O,I;const y=t.querySelector("#flow-diagram");if(!y)return;const v=((T=t.querySelector("#flow-auth-flow"))==null?void 0:T.value)||"simple_otp",S=(P=t.querySelector("#flow-checksub"))==null?void 0:P.checked,x=(B=t.querySelector("#flow-show-packs"))==null?void 0:B.checked,b=(V=t.querySelector("#flow-otp-plan-id"))==null?void 0:V.checked,_=(O=t.querySelector("#flow-auto-sub"))==null?void 0:O.checked,k=((I=t.querySelector("#flow-plan-field"))==null?void 0:I.value)||"planId",w=(E,W="var(--accent)")=>`<div style="padding: 6px 12px; border-radius: 20px; background: ${W}22; border: 1.5px solid ${W}; color: var(--text-primary); font-size: 11.5px; font-weight: 600;">${E}</div>`,C='<span style="color: var(--text-muted); font-size: 16px; font-weight: 400;">→</span>';let A=[];if(v==="pack_first_dcb_pin")A=[w("📱 MSISDN & 📦 Pack Selection","#10b981"),C,w(`🔐 Request PIN (+ ${k})`,"#6366f1"),C,w("🔑 Confirm PIN","#6366f1"),C,w("⏳ Async Status Polling","#f59e0b"),C,w("🎉 Subscription Active","#22c55e")];else if(v==="checksub_first_sync")A=[w("📱 Enter Number","#6366f1"),C,w("🔍 CheckSub Query","#f59e0b"),C,w("⚡ Active? Seamless Bypass","#10b981"),C,w("📨 [If Inactive] Auth OTP","#6366f1"),C,w("✅ Validate OTP","#6366f1"),C,w("🔄 Subs_Engine Sync","#22d3ee"),C,w("🎉 Logged In","#22c55e")];else if(v==="query_param_token")A=[w("🌐 Macro Query URL","#3b82f6"),C,w("🔄 Sub #MSISDN# / #ANDID#","#a855f7"),C,w("📨 Send OTP Query","#6366f1"),C,w("✅ Verify with Token/OTP","#6366f1"),C,w("🎉 Access Granted","#22c55e")];else if(v==="header_enrichment")A=[w("📶 Cellular 4G/5G Request","#3b82f6"),C,w("🔍 Carrier Header Enrichment","#a855f7"),C,w("⚡ Auto-Extract MSISDN","#10b981"),C,w("📦 Direct Packs / Auto-Sub","#22d3ee"),C,w("🎉 Logged In (Zero OTP)","#22c55e")];else{A=[w("📱 Enter Number","#6366f1")],S&&A.push(C,w("🔍 Checksub API","#f59e0b")),x&&A.push(C,w("📦 Select Pack","#10b981"));const E=b?`📨 OTP (+ ${k})`:"📨 Send OTP";A.push(C,w(E,"#6366f1")),A.push(C,w("✅ Verify OTP","#6366f1")),_&&A.push(C,w("💳 DCB Auto-Subscribe","#22d3ee")),A.push(C,w("🎉 Logged In","#22c55e"))}y.innerHTML=A.join(" ")},f=y=>{const v=t.querySelector("#flow-gw-card-otp-send"),S=t.querySelector("#flow-gw-card-otp-verify"),x=t.querySelector("#flow-gw-card-checksub"),b=t.querySelector("#flow-gw-card-dcb"),_=t.querySelector("#flow-gw-dcb-charge-group"),k=t.querySelector("#flow-gw-dcb-sync-group"),w=t.querySelector("#flow-strategy-active-banner");v&&(y==="simple_otp"?(v.style.display="block",S.style.display="block",x.style.display="none",b.style.display="none",w&&(w.innerHTML=`
              <span class="badge badge-primary">ACTIVE: Standard Simple OTP</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;">Standard SMS OTP flow. Only <b>Send OTP</b> and <b>Verify OTP</b> endpoints are needed below.</span>
            `)):y==="checksub_first_sync"?(v.style.display="block",S.style.display="block",x.style.display="block",b.style.display="block",_&&(_.style.display="none"),k&&(k.style.display="block"),w&&(w.innerHTML=`
              <span class="badge badge-warning">ACTIVE: CheckSub + Engine Sync (Orange BF)</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;"><b>CheckSub</b> runs first (active users bypass OTP). Inactive users receive <b>Auth OTP</b>, followed by <b>Subs_Engine Sync</b> call.</span>
            `)):y==="pack_first_dcb_pin"?(v.style.display="block",S.style.display="block",x.style.display="none",b.style.display="block",_&&(_.style.display="block"),k&&(k.style.display="none"),w&&(w.innerHTML=`
              <span class="badge badge-success">ACTIVE: Pack Selection + DCB PIN (Universe DCB)</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;">Pack selected first. <b>Send OTP</b> acts as PIN Request with <code>purchaseTypeId</code>, followed by <b>Verify PIN</b> and <b>DCB Polling</b>.</span>
            `)):y==="query_param_token"?(v.style.display="block",S.style.display="block",x.style.display="none",b.style.display="none",w&&(w.innerHTML=`
              <span class="badge badge-cyan">ACTIVE: Macro URL Query Param (Etisalat)</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;">Macro URL substitutions for <code>#MSISDN#</code> and <code>#OTP#</code>.</span>
            `)):y==="header_enrichment"&&(v.style.display="none",S.style.display="none",x.style.display="block",b.style.display="block",_&&(_.style.display="block"),k&&(k.style.display="none"),w&&(w.innerHTML=`
              <span class="badge" style="background: rgba(147,51,234,0.15); color: #c084fc; border: 1px solid rgba(147,51,234,0.3); font-weight: 700;">ACTIVE: Zero-Click Cellular (HE)</span>
              <span style="color: var(--text-secondary); font-size: 11.5px;"><b>Zero OTP!</b> Phone number is auto-extracted from cellular headers or redirect URL. Configure <b>CheckSub</b> &amp; <b>DCB Direct Charge</b> only.</span>
            `)))};g();const m=((h=t.querySelector("#flow-auth-flow"))==null?void 0:h.value)||"simple_otp";f(m),t.querySelectorAll(".flow-type-card").forEach(y=>{y.addEventListener("click",()=>{const v=y.getAttribute("data-flow");t.querySelector("#flow-auth-flow").value=v,t.querySelectorAll(".flow-type-card").forEach(S=>{const x=S.getAttribute("data-flow")===v;S.style.borderColor=x?"var(--accent)":"var(--border-subtle)",S.style.background=x?"rgba(99,102,241,0.08)":"var(--bg-inset)"}),v==="simple_otp"?(t.querySelector("#flow-checksub").checked=!1,t.querySelector("#flow-show-packs").checked=!1,t.querySelector("#flow-otp-plan-id").checked=!1,t.querySelector("#flow-auto-sub").checked=!1,t.querySelector("#flow-plan-field").value="planId"):v==="checksub_first_sync"?(t.querySelector("#flow-checksub").checked=!0,t.querySelector("#flow-show-packs").checked=!0,t.querySelector("#flow-otp-plan-id").checked=!0,t.querySelector("#flow-auto-sub").checked=!0,t.querySelector("#flow-plan-field").value="serviceId"):v==="pack_first_dcb_pin"?(t.querySelector("#flow-checksub").checked=!1,t.querySelector("#flow-show-packs").checked=!0,t.querySelector("#flow-otp-plan-id").checked=!0,t.querySelector("#flow-auto-sub").checked=!0,t.querySelector("#flow-plan-field").value="purchaseTypeId"):v==="query_param_token"?(t.querySelector("#flow-checksub").checked=!1,t.querySelector("#flow-show-packs").checked=!1,t.querySelector("#flow-otp-plan-id").checked=!0,t.querySelector("#flow-auto-sub").checked=!1,t.querySelector("#flow-plan-field").value="cmpid"):v==="header_enrichment"&&(t.querySelector("#flow-checksub").checked=!0,t.querySelector("#flow-show-packs").checked=!0,t.querySelector("#flow-otp-plan-id").checked=!1,t.querySelector("#flow-auto-sub").checked=!0,t.querySelector("#flow-plan-field").value="planId"),g(),f(v)})}),d.querySelectorAll('input[type="checkbox"], input[type="text"]').forEach(y=>{y.addEventListener("change",g),y.addEventListener("input",g)}),d.onsubmit=async y=>{var _,k,w,C,A,T,P,B,V,O,I,E,W,N,X,it;y.preventDefault();const v=t.querySelector("#save-flow-config-btn");v.disabled=!0,v.innerHTML="⏳ Saving...";const S=t.querySelector("#flow-auth-flow").value;let x="simple_otp";S==="checksub_first_sync"||S==="checksub_then_otp"?x="checksub_then_otp":(S==="pack_first_dcb_pin"||S==="pack_first_otp")&&(x="pack_first_otp");const b={authFlow:x,flowStrategy:S,checksubEnabled:t.querySelector("#flow-checksub").checked,showPackSelection:t.querySelector("#flow-show-packs").checked,otpIncludesPlanId:t.querySelector("#flow-otp-plan-id").checked,otpPlanIdFieldName:t.querySelector("#flow-plan-field").value.trim()||"planId",autoSubscribeOnVerify:t.querySelector("#flow-auto-sub").checked,globalServiceId:((_=t.querySelector("#flow-global-service-id"))==null?void 0:_.value.trim())||null,globalMerchantId:((k=t.querySelector("#flow-global-merchant-id"))==null?void 0:k.value.trim())||null,globalOperatorCode:((w=t.querySelector("#flow-global-operator-code"))==null?void 0:w.value.trim())||null};try{const nt=await L.put(`/api/v1/admin/operators/${this.operatorId}/flow-config`,b);nt.success&&(this.flowConfig=nt.data);const rt=((C=t.querySelector("#flow-gw-secret"))==null?void 0:C.value.trim())||"carrier_secret",J=((A=t.querySelector("#flow-gw-auth-type"))==null?void 0:A.value)||"bearer",dt=(T=t.querySelector("#flow-gw-otp-send-endpoint"))==null?void 0:T.value.trim(),ot=(P=t.querySelector("#flow-gw-otp-verify-endpoint"))==null?void 0:P.value.trim(),Tt=(B=t.querySelector("#flow-gw-otp-send-template"))==null?void 0:B.value.trim(),pt=(V=t.querySelector("#flow-gw-otp-verify-template"))==null?void 0:V.value.trim(),ne=((O=t.querySelector("#flow-gw-otp-send-method"))==null?void 0:O.value)||"POST",Vt=((I=t.querySelector("#flow-gw-otp-verify-method"))==null?void 0:I.value)||"POST",jt=(E=t.querySelector("#flow-gw-checksub-endpoint"))==null?void 0:E.value.trim(),Wt=((W=t.querySelector("#flow-gw-checksub-method"))==null?void 0:W.value)||"GET",ae=(N=t.querySelector("#flow-gw-checksub-template"))==null?void 0:N.value.trim(),Ut=(X=t.querySelector("#flow-gw-dcb-charge-endpoint"))==null?void 0:X.value.trim(),q=(it=t.querySelector("#flow-gw-dcb-sync-endpoint"))==null?void 0:it.value.trim(),j=[];(dt||ot)&&j.push(L.post(`/api/v1/admin/providers/${this.operatorId}/otp/config`,{flowType:"operator_api",sendEndpoint:dt||ot,sendMethod:ne,verifyEndpoint:ot||null,verifyMethod:Vt,authType:J,credentials:{secret:rt},sendRequestTemplate:Tt||null,verifyRequestTemplate:pt||null})),jt&&j.push(L.post(`/api/v1/admin/providers/${this.operatorId}/checksub/config`,{flowType:"operator_api",endpoint:jt,httpMethod:Wt,authType:J,credentials:{secret:rt},requestTemplate:ae||null})),(Ut||q)&&j.push(L.post(`/api/v1/admin/providers/${this.operatorId}/dcb/config`,{flowType:"direct_charge",chargeEndpoint:Ut||q,syncEndpoint:q||null,authType:J,credentials:{secret:rt}})),j.length>0&&await Promise.all(j),D.success("✅ Auth Flow & Gateway Endpoints saved successfully!")}catch(nt){D.error(nt.message||"Failed to save configuration")}finally{v.disabled=!1,v.innerHTML="💾 Save Flow Configuration"}}}}openLanguageModal(t,e=null){const i=this.languages.find(n=>n.languageCode===e);bt.open({title:i?"Language settings":"Create a content language",maxWidth:"520px",contentHtml:`<form id="language-create-form"><p>Create the language first, then enter its screen content in the editor.</p>
        <label class="form-label studio-field">Language code<input name="languageCode" class="form-input" placeholder="en, hi, ar" pattern="[a-z]{2}" maxlength="2" required value="${z(e||"")}" ${i?"readonly":""}></label>
        <label class="form-label studio-field">Direction<select name="direction" class="form-select"><option value="ltr">Left to right</option><option value="rtl" ${(i==null?void 0:i.direction)==="rtl"?"selected":""}>Right to left</option></select></label>
        <label class="form-label studio-field">Font family<input name="fontFamily" class="form-input" value="${z((i==null?void 0:i.fontFamily)||"Inter")}" required></label>
        <div class="modal-footer"><button class="btn btn-primary">${i?"Save settings":"Create language"}</button></div></form>`,onRender:(n,a)=>{n.querySelector("form").onsubmit=async o=>{o.preventDefault();const r=o.currentTarget,l=Object.fromEntries(new FormData(r));if(!i&&this.languages.some(d=>d.languageCode===l.languageCode)){D.error("Language already exists. Select it in the editor.");return}const c=r.querySelector("button");c.disabled=!0;try{await L.post(`/api/v1/admin/operators/${this.operatorId}/languages`,{...l,strings:this.languageDrafts[e]||(i==null?void 0:i.strings)||{},isDefault:(i==null?void 0:i.isDefault)||!1}),this.selectedLanguage=l.languageCode,this.activeTab="tab-theme",a(),await this.loadDataAndRender(t),D.success("Language ready. Enter its screen content below.")}catch(d){D.error(d.message),c.disabled=!1}}}})}}class Ap{constructor(t){this.onNavigate=t,this.categories=[],this.activeLang="en"}slugify(t){return(t||"").toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,"")}async render(){const t=document.createElement("div");t.className="view-container",t.innerHTML=`
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">AI Category Catalog</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Manage global AI categories, visual icons, accent colors, and multi-lingual display names for subscriber portals</p>
        </div>
        <button id="create-category-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px;">
          ${M.plus} Create AI Category
        </button>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4" style="flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; gap: 10px; flex: 1; min-width: 260px; max-width: 360px;">
            <input type="text" id="category-search-input" class="form-input" placeholder="Search categories by name or slug..." />
          </div>
          <button id="category-refresh-btn" class="btn btn-secondary">
            ${M.refresh} Refresh Catalog
          </button>
        </div>

        <!-- Multi-Language Display Preview Selector -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding: 10px 14px; background: var(--bg-inset); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Subscriber Portal Language Preview:</span>
            <div id="category-lang-pills" style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="badge ${this.activeLang==="en"?"badge-primary":"badge-neutral"} lang-pill-btn" data-lang="en" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇬🇧 English (en)</button>
              <button class="badge ${this.activeLang==="hi"?"badge-primary":"badge-neutral"} lang-pill-btn" data-lang="hi" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇮🇳 हिन्दी (hi)</button>
              <button class="badge ${this.activeLang==="ar"?"badge-primary":"badge-neutral"} lang-pill-btn" data-lang="ar" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇸🇦 العربية (ar)</button>
              <button class="badge ${this.activeLang==="fr"?"badge-primary":"badge-neutral"} lang-pill-btn" data-lang="fr" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇫🇷 Français (fr)</button>
              <button class="badge ${this.activeLang==="es"?"badge-primary":"badge-neutral"} lang-pill-btn" data-lang="es" style="cursor: pointer; border: none; font-size: 11px; padding: 4px 9px;">🇪🇸 Español (es)</button>
            </div>
          </div>
          <span style="font-size: 11.5px; color: var(--text-muted);">Simulates category names & icons shown on subscriber screens</span>
        </div>

        <div id="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
            Loading category catalog...
          </div>
        </div>
      </div>
    `;const e=t.querySelector("#create-category-btn"),i=t.querySelector("#category-refresh-btn"),n=t.querySelector("#category-search-input");return e.onclick=()=>this.openCategoryModal(t),i.onclick=()=>this.loadCategories(t),n.oninput=()=>this.filterCategories(t,n.value),t.querySelectorAll(".lang-pill-btn").forEach(a=>{a.onclick=()=>{this.activeLang=a.getAttribute("data-lang"),t.querySelectorAll(".lang-pill-btn").forEach(o=>{const r=o.getAttribute("data-lang")===this.activeLang;o.className=`badge ${r?"badge-primary":"badge-neutral"} lang-pill-btn`}),this.renderGrid(t,this.categories)}}),setTimeout(()=>this.loadCategories(t),0),t}async loadCategories(t){try{const e=await L.get("/api/v1/admin/ai/catalog");e.success&&Array.isArray(e.data)&&(this.categories=e.data,this.renderGrid(t,this.categories))}catch(e){D.error(e.message||"Failed to fetch category catalog")}}filterCategories(t,e){const i=e.toLowerCase().trim();if(!i){this.renderGrid(t,this.categories);return}const n=this.categories.filter(a=>{var o,r;return((o=a.name)==null?void 0:o.toLowerCase().includes(i))||((r=a.slug)==null?void 0:r.toLowerCase().includes(i))});this.renderGrid(t,n)}renderGrid(t,e){const i=t.querySelector("#categories-grid");if(i){if(!e||e.length===0){i.innerHTML=`
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
          No AI categories found in the catalog. Click "Create AI Category" to add one.
        </div>
      `;return}i.innerHTML=e.map(n=>{const a=n.createdAt?new Date(n.createdAt).toLocaleDateString():"N/A",o=n.translations||{};let r=n.name,l=n.slug;if(this.activeLang!=="en"){const g=o[this.activeLang];g?(r=g,l=`EN: ${n.name} • ${n.slug}`):l=`${n.slug} • (No ${this.activeLang.toUpperCase()} localized name)`}const c=Object.keys(o).filter(g=>g!=="_meta"&&!!o[g]),d=o._meta||{},p=d.color||"#6366F1",u=d.icon||n.slug||"bot",h=Bt({icon:u,color:p,size:22});return`
        <div class="card" style="padding: 18px; display: flex; flex-direction: column; min-height: 220px; transition: transform 0.15s ease, border-color 0.15s ease;">
          <!-- Card Header & Identity -->
          <div class="flex-between mb-3" style="align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: ${p}18; border: 1.5px solid ${p}44; display: flex; align-items: center; justify-content: center; color: ${p}; flex-shrink: 0;">
                ${h}
              </div>
              <div>
                <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">${r}</h3>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="badge badge-cyan" style="font-family: var(--font-mono); font-size: 11px;">${l}</span>
                  <span style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono);">icon: ${d.icon||"auto"}</span>
                </div>
              </div>
            </div>
            <span class="badge badge-neutral" style="font-size: 10px;">${a}</span>
          </div>

          <!-- Multi-language Badges -->
          <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px;">
            <span class="badge badge-primary" style="font-size: 10px; padding: 2px 7px;">🇬🇧 EN: ${n.name}</span>
            ${o.hi?`<span class="badge badge-success" style="font-size: 10px; padding: 2px 7px;">🇮🇳 HI: ${o.hi}</span>`:""}
            ${o.ar?`<span class="badge badge-purple" style="font-size: 10px; padding: 2px 7px;">🇸🇦 AR: ${o.ar}</span>`:""}
            ${o.fr?`<span class="badge badge-warning" style="font-size: 10px; padding: 2px 7px;">🇫🇷 FR: ${o.fr}</span>`:""}
            ${o.es?`<span class="badge badge-cyan" style="font-size: 10px; padding: 2px 7px;">🇪🇸 ES: ${o.es}</span>`:""}
            ${o.bn?`<span class="badge badge-neutral" style="font-size: 10px; padding: 2px 7px;">🇧🇩 BN: ${o.bn}</span>`:""}
            ${o.ur?`<span class="badge badge-neutral" style="font-size: 10px; padding: 2px 7px;">🇵🇰 UR: ${o.ur}</span>`:""}
            ${c.length===0?'<span style="font-size: 10px; color: var(--text-muted); font-style: italic;">No translations yet</span>':""}
          </div>

          <!-- Metadata Box -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 14px; font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-muted);">Languages Configured</span>
            <span style="color: var(--text-primary); font-weight: 600;">${c.length+1} language${c.length>0?"s":""}</span>
          </div>

          <!-- Card Actions -->
          <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-secondary edit-category-btn" data-id="${n.id}" style="flex: 1; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; gap: 5px;">
              ${M.edit} Edit & Localize
            </button>
            <button class="btn btn-danger btn-icon delete-category-btn" data-id="${n.id}" title="Remove Category" style="width: 32px; height: 32px; flex-shrink: 0;">
              ${M.trash}
            </button>
          </div>
        </div>
      `}).join(""),i.querySelectorAll(".edit-category-btn").forEach(n=>{n.onclick=()=>this.openCategoryModal(t,n.getAttribute("data-id"))}),i.querySelectorAll(".delete-category-btn").forEach(n=>{n.onclick=()=>this.deleteCategory(t,n.getAttribute("data-id"))})}}openCategoryModal(t,e=null){const i=e?this.categories.find(c=>c.id===e):null,n=(i==null?void 0:i.translations)||{},a=n._meta||{};let o=a.icon||"utensils",r=a.color||"#F97316";const l=["#F97316","#10B981","#3B82F6","#8B5CF6","#EC4899","#EAB308","#EF4444","#06B6D4","#6366F1","#14B8A6","#F59E0B","#64748B"];bt.open({title:i?`Edit AI Category & Icon — ${i.name}`:"Create AI Category",maxWidth:"640px",contentHtml:`
        <form id="category-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Category Name (English / Default) *</label>
              <input type="text" id="cat-name" class="form-input" placeholder="e.g. Technology & Coding" required value="${(i==null?void 0:i.name)||""}" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">Primary display name for this AI category.</div>
            </div>

            <div class="form-group">
              <label class="form-label">Category Slug *</label>
              <input type="text" id="cat-slug" class="form-input" placeholder="e.g. technology" required value="${(i==null?void 0:i.slug)||""}" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">Lowercase identifier sent to external AI gateway.</div>
            </div>
          </div>

          <!-- Live Preview Banner -->
          <div style="background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div id="live-icon-badge" style="width: 44px; height: 44px; border-radius: var(--radius-md); background: ${r}1A; border: 1.5px solid ${r}44; display: flex; align-items: center; justify-content: center; color: ${r}; flex-shrink: 0; transition: all 0.2s ease;">
                ${Bt({icon:o,color:r,size:24})}
              </div>
              <div>
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Live Card Preview</div>
                <div id="live-preview-title" style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${(i==null?void 0:i.name)||"Category Name"}</div>
                <div id="live-preview-slug" style="font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);">${(i==null?void 0:i.slug)||"category-slug"}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <span id="live-preview-icon-name" class="badge badge-primary" style="font-family: var(--font-mono); font-size: 11px;">icon: ${o}</span>
            </div>
          </div>

          <!-- Visual Icon Palette Picker -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div>
                <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">Curated Icon Palette</h4>
                <p style="font-size: 11px; color: var(--text-secondary); margin: 0;">Click an icon to assign. Compatible with Lucide SVG & Subscriber Portal.</p>
              </div>
              <span id="selected-icon-label" class="badge badge-neutral" style="font-size: 11px; font-weight: 600;">Selected: ${o}</span>
            </div>

            <!-- Category Filter Pills -->
            <div id="icon-cat-filter" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
              <button type="button" class="badge badge-primary icon-filter-btn" data-cat="all" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">All (22)</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Lifestyle" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Lifestyle</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Wellness" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Wellness</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Education" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Education</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Finance" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Finance</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Travel" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Travel</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Creative" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Creative</button>
              <button type="button" class="badge badge-neutral icon-filter-btn" data-cat="Work" style="cursor: pointer; border: none; font-size: 10.5px; padding: 3px 8px;">Tech / Work</button>
            </div>

            <!-- Grid of Icons -->
            <div id="icon-picker-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 12px; max-height: 190px; overflow-y: auto; padding: 4px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--bg-surface);">
              ${Ti.map(c=>{const d=c.id===o;return`
                  <button type="button" class="icon-choice-btn" data-icon="${c.id}" data-cat="${c.category}" data-default-color="${c.color}" data-label="${c.label}" title="${c.label} (${c.category})" style="background: ${d?c.color+"1A":"transparent"}; border: 1.5px solid ${d?c.color:"var(--border-subtle)"}; border-radius: var(--radius-sm); padding: 8px 4px; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; color: ${d?c.color:"var(--text-secondary)"}; font-size: 11px; transition: all 0.15s ease; box-shadow: ${d?`0 0 0 2px ${c.color}33`:"none"};">
                    <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
                      ${Bt({icon:c.id,color:d?c.color:"currentColor",size:20})}
                    </span>
                    <span style="font-size: 9.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${c.label.split("&")[0].trim()}</span>
                  </button>
                `}).join("")}
            </div>

            <!-- Custom Icon / Image URL fallback -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" id="custom-icon-input" class="form-input" placeholder="Or enter custom image URL (https://...) or Lucide icon name..." value="${o.startsWith("http")||!Ti.some(c=>c.id===o)?o:""}" style="font-size: 12px; padding: 6px 10px;" />
                <button type="button" id="apply-custom-icon-btn" class="btn btn-secondary" style="font-size: 11.5px; white-space: nowrap; padding: 6px 12px;">Apply Custom</button>
              </div>
              <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">Supports external PNG/SVG URLs or any standard Lucide icon name.</div>
            </div>

            <!-- Theme Color Selector -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-inset); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <label class="form-label" style="margin: 0; font-size: 11.5px;">Theme Accent Color:</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="color" id="cat-color" value="${r}" style="width: 28px; height: 26px; border: none; border-radius: 4px; cursor: pointer; background: transparent;" />
                  <span id="cat-color-hex" style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-primary); font-weight: 600;">${r}</span>
                </div>
              </div>
              <div style="display: flex; gap: 5px; align-items: center;">
                ${l.map(c=>`
                  <button type="button" class="color-swatch-btn" data-color="${c}" style="width: 18px; height: 18px; border-radius: 50%; background: ${c}; border: 1.5px solid ${c===r?"#fff":"transparent"}; cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></button>
                `).join("")}
              </div>
              <input type="hidden" id="selected-icon-id" value="${o}" />
            </div>
          </div>

          <!-- Multi-Language Translations Section -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary);">Multi-Language Display Names (User Portal)</h4>
              <span style="font-size: 11px; color: var(--text-muted);">Auto-adapts on user language switch</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇮🇳 Hindi (hi)
                </label>
                <input type="text" id="trans-hi" class="form-input" placeholder="e.g. तकनीक और कोडिंग" value="${n.hi||""}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇸🇦 Arabic (ar)
                </label>
                <input type="text" id="trans-ar" dir="rtl" class="form-input" placeholder="e.g. التكنولوجيا والبرمجة" value="${n.ar||""}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇫🇷 French (fr)
                </label>
                <input type="text" id="trans-fr" class="form-input" placeholder="e.g. Technologie et Codage" value="${n.fr||""}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇪🇸 Spanish (es)
                </label>
                <input type="text" id="trans-es" class="form-input" placeholder="e.g. Tecnología y Programación" value="${n.es||""}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇧🇩 Bengali (bn)
                </label>
                <input type="text" id="trans-bn" class="form-input" placeholder="e.g. প্রযুক্তি ও কোডিং" value="${n.bn||""}" />
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 11.5px; display: flex; align-items: center; gap: 5px;">
                  🇵🇰 Urdu (ur)
                </label>
                <input type="text" id="trans-ur" dir="rtl" class="form-input" placeholder="e.g. ٹیکنالوجی اور کوڈنگ" value="${n.ur||""}" />
              </div>
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-cat-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 6px;">
              ${M.check} ${i?"Save Category & Translations":"Create Category"}
            </button>
          </div>
        </form>
      `,onRender:(c,d)=>{const p=c.querySelector("#category-form"),u=c.querySelector("#cat-name"),h=c.querySelector("#cat-slug"),g=c.querySelector("#selected-icon-id"),f=c.querySelector("#custom-icon-input"),m=c.querySelector("#apply-custom-icon-btn"),y=c.querySelector("#cat-color"),v=c.querySelector("#cat-color-hex"),S=c.querySelector("#selected-icon-label"),x=c.querySelector("#live-icon-badge"),b=c.querySelector("#live-preview-title"),_=c.querySelector("#live-preview-slug"),k=c.querySelector("#live-preview-icon-name"),w=(O,I)=>{g.value=O,y.value=I,v.textContent=I,S.textContent=`Selected: ${O}`,k.textContent=`icon: ${O}`,x.style.background=`${I}1A`,x.style.borderColor=`${I}44`,x.style.color=I,x.innerHTML=Bt({icon:O,color:I,size:24}),c.querySelectorAll(".icon-choice-btn").forEach(E=>{const W=E.getAttribute("data-icon")===O;E.style.borderColor=W?I:"var(--border-subtle)",E.style.background=W?`${I}1A`:"transparent",E.style.color=W?I:"var(--text-secondary)",E.style.boxShadow=W?`0 0 0 2px ${I}33`:"none"})};c.querySelectorAll(".icon-choice-btn").forEach(O=>{O.onclick=()=>{const I=O.getAttribute("data-icon"),E=O.getAttribute("data-default-color")||y.value;f.value="",w(I,E)}}),c.querySelectorAll(".icon-filter-btn").forEach(O=>{O.onclick=()=>{const I=O.getAttribute("data-cat");c.querySelectorAll(".icon-filter-btn").forEach(E=>{E.className=E===O?"badge badge-primary icon-filter-btn":"badge badge-neutral icon-filter-btn"}),c.querySelectorAll(".icon-choice-btn").forEach(E=>{I==="all"||E.getAttribute("data-cat")===I?E.style.display="flex":E.style.display="none"})}}),m.onclick=()=>{const O=f.value.trim();O&&w(O,y.value)},f.addEventListener("keydown",O=>{O.key==="Enter"&&(O.preventDefault(),m.click())}),y.oninput=()=>{w(g.value,y.value)},c.querySelectorAll(".color-swatch-btn").forEach(O=>{O.onclick=()=>{const I=O.getAttribute("data-color");w(g.value,I)}}),u.addEventListener("input",()=>{if(b.textContent=u.value||"Category Name",!i){const O=this.slugify(u.value);h.value=O,_.textContent=O||"category-slug"}}),h.addEventListener("input",()=>{_.textContent=h.value||"category-slug"});const C=c.querySelector("#trans-hi"),A=c.querySelector("#trans-ar"),T=c.querySelector("#trans-fr"),P=c.querySelector("#trans-es"),B=c.querySelector("#trans-bn"),V=c.querySelector("#trans-ur");p.onsubmit=async O=>{O.preventDefault();const I=c.querySelector("#save-cat-btn");I.disabled=!0,I.innerText="Saving...";const E=u.value.trim(),W=h.value.trim().toLowerCase(),N={_meta:{icon:g.value||"bot",color:y.value||"#6366F1"}};C.value.trim()&&(N.hi=C.value.trim()),A.value.trim()&&(N.ar=A.value.trim()),T.value.trim()&&(N.fr=T.value.trim()),P.value.trim()&&(N.es=P.value.trim()),B.value.trim()&&(N.bn=B.value.trim()),V.value.trim()&&(N.ur=V.value.trim());const X={name:E,slug:W,translations:N};try{e?(await L.put(`/api/v1/admin/ai/catalog/${e}`,X),D.success("Category and icon updated successfully")):(await L.post("/api/v1/admin/ai/catalog",X),D.success("New AI category created with icon & translations")),d(),this.loadCategories(t)}catch(it){D.error(it.message||"Failed to save category"),I.disabled=!1,I.innerHTML=`${M.check} ${e?"Save Changes":"Create Category"}`}}}})}async deleteCategory(t,e){if(confirm("Are you sure you want to remove this category from the platform catalog?"))try{await L.delete(`/api/v1/admin/ai/catalog/${e}`),D.success("Category deleted successfully"),this.loadCategories(t)}catch(i){D.error(i.message||"Failed to delete category")}}}class $p{constructor(t){this.onNavigate=t,this.catalog=null}async render(){var i;const t=document.createElement("div");t.className="view-container",t.innerHTML=`
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Telecom Gateways & Flow Adapters</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">Dynamic provider configurations for OTP dispatch, Direct Carrier Billing (DCB), and CheckSub status</p>
        </div>
        <button id="test-connectivity-btn" class="btn btn-secondary">
          ${M.zap} Test Gateway Connectivity
        </button>
      </div>

      <!-- Section 1: Active Gateway Configuration (Bento Cards) -->
      <div class="card mb-6" style="padding: var(--space-5);">
        <div class="card-header mb-3">
          <div>
            <h3 class="card-title">Active Carrier Gateway Endpoints</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              Configure network credentials, endpoints, and authentication types for the selected carrier
            </p>
          </div>
          <span class="badge badge-primary" id="active-op-tag">
            ${((i=R.getActiveOperator())==null?void 0:i.name)||"Airtel India"}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 10px;">
          <!-- Card 1: OTP -->
          <div class="card" style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 18px; min-height: 220px; display: flex; flex-direction: column;">
            <div class="flex-between mb-2">
              <span class="badge badge-primary">AUTHENTICATION</span>
              <span style="color: var(--text-muted); font-size: 11px; font-family: var(--font-mono);">FLOW 01</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">OTP & Network Auth</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Operator SMS API endpoint, fallback chains, or zero-click Header Enrichment (HE) cellular auth.
            </p>
            <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary config-gateway-btn" data-type="otp" style="width: 100%; height: 34px;">
                Configure OTP Gateway &rarr;
              </button>
            </div>
          </div>

          <!-- Card 2: DCB -->
          <div class="card" style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 18px; min-height: 220px; display: flex; flex-direction: column;">
            <div class="flex-between mb-2">
              <span class="badge badge-cyan">CARRIER BILLING</span>
              <span style="color: var(--text-muted); font-size: 11px; font-family: var(--font-mono);">FLOW 02</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">Direct Carrier Billing (DCB)</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Direct server-to-server airtime charges, PIN consent flows, and telco webhook endpoints.
            </p>
            <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary config-gateway-btn" data-type="dcb" style="width: 100%; height: 34px;">
                Configure DCB Billing &rarr;
              </button>
            </div>
          </div>

          <!-- Card 3: CheckSub -->
          <div class="card" style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 18px; min-height: 220px; display: flex; flex-direction: column;">
            <div class="flex-between mb-2">
              <span class="badge badge-warning">SYNC STATUS</span>
              <span style="color: var(--text-muted); font-size: 11px; font-family: var(--font-mono);">FLOW 03</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">CheckSub Verification API</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Synchronous subscription status verification and automated grace period state transitions.
            </p>
            <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary config-gateway-btn" data-type="checksub" style="width: 100%; height: 34px;">
                Configure CheckSub &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Flow Types & Adapter Catalog -->
      <div class="card" style="padding: var(--space-5);">
        <div class="card-header mb-4">
          <div>
            <h3 class="card-title">Supported Flow Types & Strategy Catalog</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              Adapter specifications and parameter contracts defined in the platform engine
            </p>
          </div>
          <span class="badge badge-neutral">DATABASE SCHEMA CATALOG</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;" id="flow-types-grid">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 36px;">
            Loading flow types catalog...
          </div>
        </div>
      </div>
    `;const e=t.querySelector("#test-connectivity-btn");return e.onclick=()=>this.openConnectivityTestModal(),t.querySelectorAll(".config-gateway-btn").forEach(n=>{n.onclick=()=>this.openConfigModal(n.getAttribute("data-type"))}),setTimeout(()=>this.loadCatalog(t),0),t}async loadCatalog(t){try{const e=await L.get("/api/v1/admin/providers/flow-types");e.success&&e.data&&(this.catalog=e.data,this.renderCatalog(t,this.catalog))}catch(e){D.error(e.message||"Failed to load flow types catalog")}}renderCatalog(t,e){const i=t.querySelector("#flow-types-grid");if(!i)return;let n=[];e.otp&&e.otp.forEach(a=>n.push({...a,group:"OTP AUTH",badgeClass:"badge-primary"})),e.dcb&&e.dcb.forEach(a=>n.push({...a,group:"DCB BILLING",badgeClass:"badge-cyan"})),e.checksub&&e.checksub.forEach(a=>n.push({...a,group:"CHECKSUB",badgeClass:"badge-warning"})),i.innerHTML=n.map(a=>`
      <div class="card" style="background: var(--bg-inset); border: 1px solid var(--border-subtle); padding: 18px; min-height: 200px; display: flex; flex-direction: column;">
        <div class="flex-between mb-2">
          <span class="badge ${a.badgeClass}">${a.group}</span>
          <code style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${a.flowType}</code>
        </div>

        <h4 style="font-size: 14.5px; font-weight: 600; margin-bottom: 6px; line-height: 1.35;">${a.displayName}</h4>
        
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px; flex: 1;">
          ${a.description||"Standard telecom adapter strategy protocol."}
        </p>

        <div style="margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
          <div style="font-size: 10.5px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 6px;">
            Required Parameters
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${(a.requiredFields||[]).map(o=>`
              <span style="font-size: 10.5px; font-family: var(--font-mono); background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); padding: 2px 6px; border-radius: var(--radius-xs); color: #cbd5e1;">
                ${o}
              </span>
            `).join("")}
          </div>
        </div>
      </div>
    `).join("")}openConnectivityTestModal(){bt.open({title:"Gateway Connectivity Drill & Latency Ping",maxWidth:"560px",contentHtml:`
        <form id="connectivity-form">
          <div class="form-group">
            <label class="form-label">Provider Service Type</label>
            <select id="ping-type" class="form-select">
              <option value="otp">OTP SMS Gateway</option>
              <option value="dcb">Direct Carrier Billing (DCB)</option>
              <option value="checksub">CheckSub Verification API</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Target Endpoint URL *</label>
            <input type="url" id="ping-endpoint" class="form-input" value="https://api.mockoperator.com/v1/ping" required />
          </div>

          <div class="form-group">
            <label class="form-label">Mock Authorization Headers (JSON)</label>
            <textarea id="ping-headers" class="form-textarea" rows="3" style="font-family: var(--font-mono); font-size: 11px;">{
  "Authorization": "Bearer test_telco_token_123",
  "Content-Type": "application/json"
}</textarea>
          </div>

          <div id="ping-result-box" style="display: none; padding: 12px 14px; border-radius: var(--radius-sm); font-size: 12px; font-family: var(--font-mono); margin-bottom: 14px;"></div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="exec-ping-btn" class="btn btn-primary">Dispatch Connectivity Ping</button>
          </div>
        </form>
      `,onRender:(t,e)=>{const i=t.querySelector("#connectivity-form"),n=t.querySelector("#ping-result-box");i.onsubmit=async a=>{var r,l;a.preventDefault();const o=t.querySelector("#exec-ping-btn");o.disabled=!0,o.innerText="Pinging Gateway...";try{const c=t.querySelector("#ping-type").value,d=t.querySelector("#ping-endpoint").value,p=await L.post("/api/v1/admin/providers/test-connectivity",{providerType:c,config:{endpoint:d}});n.style.display="block",n.style.background="var(--status-success-bg)",n.style.border="1px solid rgba(16, 185, 129, 0.3)",n.style.color="#34d399",n.innerHTML=`
              <strong>✓ Gateway Connectivity Verified</strong><br/>
              Status: ${((r=p.data)==null?void 0:r.status)||"CONNECTED"}<br/>
              Round-trip Latency: ${((l=p.data)==null?void 0:l.latencyMs)||42}ms<br/>
              Response Code: 200 OK
            `,D.success("Ping drill completed successfully!")}catch(c){n.style.display="block",n.style.background="var(--status-danger-bg)",n.style.border="1px solid rgba(244, 63, 94, 0.3)",n.style.color="#fb7185",n.innerHTML=`<strong>✗ Connection Failed:</strong><br/>${c.message}`,D.error("Ping drill returned an error")}finally{o.disabled=!1,o.innerText="Dispatch Connectivity Ping"}}}})}async openConfigModal(t){const e=R.getActiveOperator()||R.operators[0];if(!e){D.error("Please onboard or select an operator first");return}let i=null;try{const d=await L.get(`/api/v1/admin/providers/${e.id}/${t}/config`);d&&d.success&&d.data&&(i=d.data)}catch{}const n=(i==null?void 0:i.sendEndpoint)||(i==null?void 0:i.chargeEndpoint)||(i==null?void 0:i.endpoint)||`https://api.${e.subdomain||"airtel"}.com/v1/${t}`,a=(i==null?void 0:i.sendMethod)||(i==null?void 0:i.httpMethod)||(i==null?void 0:i.method)||"POST",o=(i==null?void 0:i.flowType)||(t==="dcb"?"direct_charge":"operator_api"),r=(i==null?void 0:i.authType)||"bearer",l=typeof(i==null?void 0:i.sendRequestTemplate)=="string"?i.sendRequestTemplate:typeof(i==null?void 0:i.requestTemplate)=="string"?i.requestTemplate:i!=null&&i.sendRequestTemplate||i!=null&&i.requestTemplate?JSON.stringify(i.sendRequestTemplate||i.requestTemplate,null,2):"",c=(i==null?void 0:i.syncEndpoint)||"";bt.open({title:`Configure ${t.toUpperCase()} Gateway — ${e.name}`,maxWidth:"640px",contentHtml:`
        <form id="save-config-form">
          <div class="form-group">
            <label class="form-label">Adapter Flow Type</label>
            <select id="config-flow" class="form-select">
              <option value="operator_api" ${o==="operator_api"?"selected":""}>Operator-Managed REST API</option>
              <option value="header_enrichment" ${o==="header_enrichment"?"selected":""}>Header Enrichment (Zero-Click Cellular)</option>
              <option value="direct_charge" ${o==="direct_charge"?"selected":""}>Direct Server Charge (DCB)</option>
              <option value="custom" ${o==="custom"?"selected":""}>Pluggable Flow Strategy</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Gateway Endpoint URL *</label>
            <input type="url" id="config-endpoint" class="form-input" value="${n}" required />
          </div>

          ${t==="dcb"?`
          <div class="form-group">
            <label class="form-label">Subscription Engine Sync Endpoint (Optional)</label>
            <input type="url" id="config-sync-endpoint" class="form-input" value="${c}" placeholder="e.g. http://domain.com:8080/Subs_Engine/subscription/sync" style="font-family: var(--font-mono); font-size: 12px;" />
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">For Orange BF / external subscription engine activation sync after verification.</div>
          </div>
          `:""}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">HTTP Method</label>
              <select id="config-method" class="form-select">
                <option value="POST" ${a==="POST"?"selected":""}>POST</option>
                <option value="GET" ${a==="GET"?"selected":""}>GET</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Authentication Scheme</label>
              <select id="config-auth-type" class="form-select">
                <option value="bearer" ${r.toLowerCase()==="bearer"?"selected":""}>Bearer Token</option>
                <option value="basic" ${r.toLowerCase()==="basic"?"selected":""}>Basic Auth</option>
                <option value="api_key" ${r.toLowerCase()==="api_key"?"selected":""}>X-API-Key Header</option>
                <option value="none" ${r.toLowerCase()==="none"?"selected":""}>None / URL Params</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Encrypted Credentials / Gateway Secret</label>
            <input type="password" id="config-secret" class="form-input" placeholder="telco_prod_secret_key_••••••••" value="carrier_secret_sample_key" required />
          </div>

          <div class="form-group">
            <label class="form-label">Request Template / Payload Pattern (Optional)</label>
            <textarea id="config-template" class="form-textarea" rows="4" style="font-family: var(--font-mono); font-size: 11.5px;" placeholder='{
  "msisdn": "{{msisdn}}",
  "purchaseTypeId": {{planCode}},
  "serviceId": "{{serviceId}}"
}'>${l}</textarea>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Supports dynamic macros: <code>{{msisdn}}</code>, <code>{{planCode}}</code>, <code>{{serviceId}}</code>, <code>{{otp}}</code> or <code>#MSISDN#</code>.
            </div>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="save-config-btn" class="btn btn-primary">Encrypt &amp; Save Config</button>
          </div>
        </form>
      `,onRender:(d,p)=>{const u=d.querySelector("#save-config-form");u.onsubmit=async h=>{h.preventDefault();const g=d.querySelector("#save-config-btn");g.disabled=!0;try{const f={flowType:d.querySelector("#config-flow").value,endpoint:d.querySelector("#config-endpoint").value,method:d.querySelector("#config-method").value,authType:d.querySelector("#config-auth-type").value,credentials:{secret:d.querySelector("#config-secret").value},requestTemplate:d.querySelector("#config-template").value.trim()||null},m=d.querySelector("#config-sync-endpoint");m&&(f.syncEndpoint=m.value.trim()||null),await L.post(`/api/v1/admin/providers/${e.id}/${t}/config`,f),D.success(`${t.toUpperCase()} gateway configuration stored securely!`),p()}catch(f){D.error(f.message||"Failed to save gateway config"),g.disabled=!1}}}})}}const At=s=>String(s??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);class Pp{constructor(t){this.onNavigate=t,this.subscribers=[],this.loadVersion=0}async render(){const t=document.createElement("div");t.className="view-container",t.innerHTML=`
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Subscribers & Accounts Explorer</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">
            Inspect subscriber profiles, billing FSM states (Active, Demo, Grace), and usage counters
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <select id="subs-operator-select" class="form-select" style="width: 220px;">
            ${R.operators.map(o=>`
              <option value="${o.id}" ${o.id===R.activeOperatorId?"selected":""}>
                ${o.name} (${o.countryCode})
              </option>
            `).join("")}
          </select>
          <button id="subs-refresh-btn" class="btn btn-secondary">
            ${M.refresh} Refresh
          </button>
        </div>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4">
          <div style="display: flex; gap: 10px; flex: 1; max-width: 440px;">
            <input type="text" id="subs-search-input" class="form-input" placeholder="Search by MSISDN (+91...) or User ID..." />
            <select id="subs-status-filter" class="form-select" style="width: 140px;">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="demo">Demo Trial</option>
              <option value="grace">Grace Period</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted);" id="subs-count-label">
            Showing 0 subscribers
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Subscriber MSISDN</th>
                <th>Status</th>
                <th>Plan Assigned</th>
                <th>Token Usage Quota</th>
                <th>Enrolled Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="subscribers-table-body">
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">
                  Loading subscriber accounts...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;const e=t.querySelector("#subs-operator-select"),i=t.querySelector("#subs-refresh-btn"),n=t.querySelector("#subs-search-input"),a=t.querySelector("#subs-status-filter");return e.onchange=()=>{R.setActiveOperator(e.value),this.loadSubscribers(t)},i.onclick=()=>this.loadSubscribers(t),n.oninput=()=>this.filterList(t),a.onchange=()=>this.filterList(t),setTimeout(()=>this.loadSubscribers(t),0),t}async loadSubscribers(t){var n;const e=R.activeOperatorId||((n=R.operators[0])==null?void 0:n.id);if(!e){t.querySelector("#subscribers-table-body").innerHTML=`
        <tr><td colspan="6" style="text-align: center; padding: 24px;">No operators available.</td></tr>
      `;return}const i=++this.loadVersion;this.container=t,this.subscribers=[],t.querySelector("#subs-count-label").innerText="Loading subscribers…",t.querySelector("#subscribers-table-body").innerHTML='<tr><td colspan="6">Loading subscribers…</td></tr>';try{const a=[];for(let o=0;;o+=100){const r=await L.get(`/api/v1/admin/operators/${e}/subscribers`,{limit:100,offset:o});if(i!==this.loadVersion)return;if(!(r!=null&&r.success)||!Array.isArray(r.data))throw new Error("Invalid subscriber response");if(a.push(...r.data),r.data.length<100)break}this.subscribers=a,this.filterList(t)}catch(a){if(i!==this.loadVersion)return;t.querySelector("#subs-count-label").innerText="Unable to load subscribers",t.querySelector("#subscribers-table-body").innerHTML=`<tr><td colspan="6">${At(a.message)} — use Refresh to retry.</td></tr>`,D.error(a.message||"Failed to fetch subscribers")}}filterList(t){var a,o;const e=((a=t.querySelector("#subs-search-input"))==null?void 0:a.value.toLowerCase().trim())||"",i=((o=t.querySelector("#subs-status-filter"))==null?void 0:o.value)||"";let n=this.subscribers;e&&(n=n.filter(r=>(r.msisdn||"").toLowerCase().includes(e)||(r.id||"").toLowerCase().includes(e))),i&&(n=n.filter(r=>{var l;return((l=r.status)==null?void 0:l.toLowerCase())===i.toLowerCase()})),t.querySelector("#subs-count-label").innerText=`Showing ${n.length} subscribers`,this.renderTable(t,n)}renderTable(t,e){const i=t.querySelector("#subscribers-table-body");if(i){if(e.length===0){i.innerHTML='<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">No matching subscriber records found.</td></tr>';return}i.innerHTML=e.map(n=>`
      <tr>
        <td>
          <div style="font-weight: 600; font-family: var(--font-mono); color: #fff;">${At(n.msisdn||"MSISDN unavailable")}</div>
          <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${At(n.id)}</div>
        </td>
        <td>
          <span class="badge ${n.status==="active"?"badge-success":n.status==="demo"?"badge-warning":n.status==="grace"?"badge-cyan":"badge-danger"}">
            ${At((n.status||"NEW").toUpperCase())}
          </span>
        </td>
        <td>
          <span style="font-size: 12.5px;">${At(n.planName||"No plan assigned")}</span>
        </td>
        <td>
          <div style="font-size: 11.5px; margin-bottom: 3px; font-family: var(--font-mono);">
            ${(n.tokensUsed||0).toLocaleString()} / ${n.maxTokens==null?"Unlimited":n.maxTokens.toLocaleString()}
          </div>
          <div style="height: 4px; width: 100px; background: rgba(255,255,255,0.06); border-radius: var(--radius-full); overflow: hidden;">
            <div style="height: 100%; width: ${n.maxTokens>0?Math.min(100,Math.round(n.tokensUsed/n.maxTokens*100)):0}%; background: var(--accent);"></div>
          </div>
        </td>
        <td>
          <span style="font-size: 12px; color: var(--text-muted);">
            ${n.createdAt?new Date(n.createdAt).toLocaleDateString():"—"}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary view-sub-btn" data-id="${At(n.id)}" title="Inspect Subscriber Record">
            ${M.search} Details & Tokens
          </button>
        </td>
      </tr>
    `).join(""),i.querySelectorAll(".view-sub-btn").forEach(n=>{n.onclick=()=>this.openSubscriberDetailModal(n.getAttribute("data-id"))})}}openSubscriberDetailModal(t){var n;const e=this.subscribers.find(a=>a.id===t);if(!e)return;const i={MSISDN:e.msisdn??"Unavailable — stored number could not be decoded","User ID":e.id,Name:e.displayName,Country:e.countryCode,Language:e.preferredLanguage,"Account status":e.accountStatus,"Subscription state":((n=e.subscription)==null?void 0:n.state)??"No subscription",Plan:e.planName??"No plan assigned","Login count":e.loginCount,"First login":e.firstLoginAt,"Last login":e.lastLoginAt,Created:e.createdAt,Updated:e.updatedAt,"Tokens used":e.tokensUsed,"Messages used":e.messagesUsed,"Effective token limit":e.maxTokens??"Unlimited","Usage period":e.periodType,"Period start":e.periodStart};bt.open({title:`Subscriber — ${At(e.msisdn||e.id)}`,maxWidth:"820px",contentHtml:`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;overflow-wrap:anywhere;">
          ${Object.entries(i).map(([a,o])=>`<div><div style="color:var(--text-muted);font-size:11px;">${At(a)}</div><strong>${At(o??"—")}</strong></div>`).join("")}
        </div>
        <form id="token-form" class="card" style="padding:16px;margin-bottom:20px;">
          <h4>Manage token quota</h4>
          <p style="color:var(--text-secondary);margin:8px 0;">Set this subscriber's token limit per usage period. Blank restores the plan/demo default; 0 blocks token usage. Existing usage is retained.</p>
          <label for="token-limit">Token limit override</label>
          <input id="token-limit" class="form-input" type="number" min="0" max="2147483647" step="1" value="${e.tokenLimit??""}" placeholder="Use plan/demo default" />
          <label for="token-reason">Reason for change</label>
          <input id="token-reason" class="form-input" minlength="3" maxlength="500" required placeholder="e.g. Customer support credit" />
          <p id="token-error" role="alert" style="color:var(--danger);"></p>
          <button type="submit" class="btn btn-primary" style="margin-top:12px;">Save token limit</button>
        </form>
        <h4>Complete subscriber record</h4>
        <p style="color:var(--text-secondary);">Profile, subscription, plan, demo counters and all recorded usage periods.</p>
        <pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;max-height:400px;overflow:auto;padding:12px;background:var(--bg-inset);">${At(JSON.stringify(e,null,2))}</pre>
      `,onRender:(a,o)=>{a.querySelector("#token-form").onsubmit=async r=>{r.preventDefault();const l=a.querySelector('button[type="submit"]'),c=a.querySelector("#token-limit").value.trim(),d=c===""?null:Number(c),p=a.querySelector("#token-reason").value.trim(),u=a.querySelector("#token-error");if(d!==null&&(!Number.isInteger(d)||d<0||d>2147483647)||p.length<3){u.textContent="Enter a whole token limit of 0 or more, and a reason (at least 3 characters).";return}l.disabled=!0,u.textContent="";try{await L.put(`/api/v1/admin/operators/${e.operatorId}/subscribers/${e.id}/tokens`,{tokenLimit:d,reason:p}),D.success("Subscriber token limit saved"),o(),await this.loadSubscribers(this.container)}catch(h){u.textContent=h.message||"Could not save token limit",l.disabled=!1}}}})}}class Op{constructor(t){this.onNavigate=t,this.logs=[]}async render(){const t=document.createElement("div");t.className="view-container",t.innerHTML=`
      <div class="flex-between mb-6">
        <div>
          <h1 style="font-size: 22px; margin-bottom: 4px;">Notification Broadcast & Audit Trail</h1>
          <p style="color: var(--text-secondary); font-size: 13px;">
            Dispatch transactional & promotional SMS alerts across subscriber bases and inspect delivery receipts
          </p>
        </div>
        <button id="dispatch-notif-btn" class="btn btn-primary">
          ${M.plus} Dispatch SMS Broadcast
        </button>
      </div>

      <div class="card mb-6" style="padding: var(--space-4);">
        <div class="flex-between mb-4">
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Filter Carrier:</span>
            <select id="notif-op-select" class="form-select" style="width: 200px;">
              <option value="">All Carriers</option>
              ${R.operators.map(a=>`
                <option value="${a.id}" ${a.id===R.activeOperatorId?"selected":""}>
                  ${a.name}
                </option>
              `).join("")}
            </select>
          </div>
          <button id="notif-refresh-btn" class="btn btn-secondary">
            ${M.refresh} Refresh Logs
          </button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Recipient MSISDN</th>
                <th>Channel</th>
                <th>Event / Trigger Type</th>
                <th>Delivery Status</th>
                <th style="text-align: right;">Dispatched Timestamp</th>
              </tr>
            </thead>
            <tbody id="notif-logs-tbody">
              <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">
                  Loading delivery logs...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;const e=t.querySelector("#dispatch-notif-btn"),i=t.querySelector("#notif-refresh-btn"),n=t.querySelector("#notif-op-select");return e.onclick=()=>this.openDispatchModal(t),i.onclick=()=>this.loadLogs(t),n.onchange=()=>{R.setActiveOperator(n.value)},setTimeout(()=>this.loadLogs(t),0),t}async loadLogs(t){var n;const e=((n=t.querySelector("#notif-op-select"))==null?void 0:n.value)||R.activeOperatorId,i=e?{operatorId:e}:{};try{const a=await L.get("/api/v1/admin/notifications/logs",i).catch(()=>null);a!=null&&a.success&&Array.isArray(a.data)?this.logs=a.data:this.logs=[{id:"log-1",msisdn:"+919876543210",channel:"sms",eventType:"welcome_subscriber",status:"DELIVERED",createdAt:new Date(Date.now()-1e3*60*12).toISOString()},{id:"log-2",msisdn:"+919811223344",channel:"sms",eventType:"demo_expiring",status:"DELIVERED",createdAt:new Date(Date.now()-1e3*60*45).toISOString()},{id:"log-3",msisdn:"+919822334455",channel:"sms",eventType:"billing_renewal_success",status:"DELIVERED",createdAt:new Date(Date.now()-1e3*60*180).toISOString()},{id:"log-4",msisdn:"+919833445566",channel:"sms",eventType:"grace_period_warning",status:"SENT",createdAt:new Date(Date.now()-1e3*60*320).toISOString()}],this.renderTable(t,this.logs)}catch(a){D.error(a.message||"Failed to fetch notification logs")}}renderTable(t,e){const i=t.querySelector("#notif-logs-tbody");if(i){if(e.length===0){i.innerHTML='<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">No notification logs recorded yet.</td></tr>';return}i.innerHTML=e.map(n=>`
      <tr>
        <td>
          <span style="font-family: var(--font-mono); font-weight: 600; color: #fff;">${n.msisdn||n.recipient||"+919876543210"}</span>
        </td>
        <td>
          <span class="badge badge-cyan">${(n.channel||"SMS").toUpperCase()}</span>
        </td>
        <td>
          <code style="font-family: var(--font-mono);">${n.eventType||n.type||"transactional_alert"}</code>
        </td>
        <td>
          <span class="badge ${n.status==="DELIVERED"?"badge-success":n.status==="SENT"?"badge-primary":"badge-danger"}">
            ${n.status||"DELIVERED"}
          </span>
        </td>
        <td style="text-align: right;">
          <span style="font-size: 12px; color: var(--text-muted);">
            ${new Date(n.createdAt||Date.now()).toLocaleTimeString()} (${new Date(n.createdAt||Date.now()).toLocaleDateString()})
          </span>
        </td>
      </tr>
    `).join("")}}openDispatchModal(t){const e=R.getActiveOperator()||R.operators[0];bt.open({title:"Dispatch Targeted Subscriber Notification",maxWidth:"560px",contentHtml:`
        <form id="dispatch-form">
          <div class="form-group">
            <label class="form-label">Target Carrier</label>
            <select id="disp-op" class="form-select">
              ${R.operators.map(i=>`
                <option value="${i.id}" ${i.id===(e==null?void 0:e.id)?"selected":""}>
                  ${i.name} (${i.countryCode})
                </option>
              `).join("")}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Recipient MSISDN (E.164 Format) *</label>
            <input type="text" id="disp-msisdn" class="form-input" placeholder="+919876543210" required />
          </div>

          <div class="form-group">
            <label class="form-label">Notification Event Template *</label>
            <select id="disp-template" class="form-select">
              <option value="welcome_subscriber">Welcome to AI Studio</option>
              <option value="demo_expiring">Demo Trial 24h Remaining</option>
              <option value="billing_renewal_success">Daily Pack Renewed (DCB)</option>
              <option value="grace_warning">Insufficient Balance - Grace Period</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Custom Message Body Override (Optional)</label>
            <textarea id="disp-body" class="form-textarea" rows="3" placeholder="Welcome to Airtel AI Studio! Your daily AI pass is now active. Enjoy unlimited access to AI Doctor, Chef, and Tutor."></textarea>
          </div>

          <div class="modal-footer" style="margin: 20px -20px -20px; padding: 14px 20px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
            <button type="submit" id="send-disp-btn" class="btn btn-primary">Dispatch Alert</button>
          </div>
        </form>
      `,onRender:(i,n)=>{const a=i.querySelector("#dispatch-form");a.onsubmit=async o=>{o.preventDefault();const r=i.querySelector("#send-disp-btn");r.disabled=!0,r.innerText="Dispatching via Gateway...";try{await L.post("/api/v1/admin/notifications/dispatch",{operatorId:i.querySelector("#disp-op").value,msisdn:i.querySelector("#disp-msisdn").value.trim(),eventType:i.querySelector("#disp-template").value,message:i.querySelector("#disp-body").value.trim()||void 0}),D.success("Notification successfully dispatched via operator gateway"),n(),this.loadLogs(t)}catch(l){D.error(l.message||"Dispatch failed"),r.disabled=!1,r.innerText="Dispatch Alert"}}}})}}class Ip{constructor(t){this.onNavigate=t}render(){const t=document.createElement("div");t.className="view-container",t.style.display="flex",t.style.flexDirection="column",t.style.height="calc(100vh - 80px)";const e=[{method:"GET",path:"/health",tag:"System",desc:"System & Database Health Check"},{method:"POST",path:"/api/v1/admin/auth/login",tag:"Auth",desc:"Platform Super Admin Login"},{method:"GET",path:"/api/v1/admin/auth/me",tag:"Auth",desc:"Active Session & Profile Info"},{method:"GET",path:"/api/v1/admin/operators",tag:"Operators",desc:"List all onboarded operators"},{method:"POST",path:"/api/v1/admin/operators",tag:"Operators",desc:"Onboard a new telecom carrier tenant"},{method:"GET",path:"/api/v1/admin/operators/{id}",tag:"Operators",desc:"Get carrier profile & config"},{method:"PUT",path:"/api/v1/admin/operators/{id}",tag:"Operators",desc:"Update carrier metadata & tiers"},{method:"PUT",path:"/api/v1/admin/operators/{id}/status",tag:"Operators",desc:"Toggle active / maintenance / inactive"},{method:"PUT",path:"/api/v1/admin/operators/{id}/settings",tag:"Operators",desc:"Update demo quotas & fraud rules"},{method:"PUT",path:"/api/v1/admin/operators/{id}/theme",tag:"Operators",desc:"Update branding & design tokens"},{method:"POST",path:"/api/v1/admin/operators/{id}/languages",tag:"Operators",desc:"Upsert localized language strings"},{method:"GET",path:"/api/v1/admin/operators/{id}/agents",tag:"Operators",desc:"List AI categories assigned to carrier"},{method:"POST",path:"/api/v1/admin/operators/{id}/agents",tag:"Operators",desc:"Assign/reorder AI categories for carrier"},{method:"DELETE",path:"/api/v1/admin/operators/{id}/agents/{agentId}",tag:"Operators",desc:"Unassign AI category from carrier"},{method:"GET",path:"/api/v1/admin/operators/{id}/analytics",tag:"Analytics",desc:"Carrier financial & subscriber metrics"},{method:"GET",path:"/api/v1/admin/operators/{id}/subscribers",tag:"Subscribers",desc:"Carrier subscriber base explorer"},{method:"GET",path:"/api/v1/admin/plans",tag:"Plans",desc:"List commercial subscription packs"},{method:"POST",path:"/api/v1/admin/plans",tag:"Plans",desc:"Create new pricing pass & token quota"},{method:"PUT",path:"/api/v1/admin/plans/{id}",tag:"Plans",desc:"Update existing pack pricing & limits"},{method:"DELETE",path:"/api/v1/admin/plans/{id}",tag:"Plans",desc:"Deactivate / delete pricing pack"},{method:"GET",path:"/api/v1/admin/providers/flow-types",tag:"Providers",desc:"List supported telecom flow adapters"},{method:"POST",path:"/api/v1/admin/providers/test-connectivity",tag:"Providers",desc:"Live ping drill & gateway validation"},{method:"POST",path:"/api/v1/admin/providers/{operatorId}/{type}/config",tag:"Providers",desc:"Store encrypted gateway config"},{method:"GET",path:"/api/v1/admin/ai/catalog",tag:"AI Categories",desc:"List global AI category catalog"},{method:"POST",path:"/api/v1/admin/ai/catalog",tag:"AI Categories",desc:"Create AI category in catalog"},{method:"PUT",path:"/api/v1/admin/ai/catalog/{id}",tag:"AI Categories",desc:"Rename AI category in catalog"},{method:"DELETE",path:"/api/v1/admin/ai/catalog/{id}",tag:"AI Categories",desc:"Delete AI category from catalog"},{method:"POST",path:"/api/v1/admin/notifications/dispatch",tag:"Broadcast",desc:"Dispatch SMS / Push notification alert"},{method:"GET",path:"/api/v1/admin/notifications/logs",tag:"Broadcast",desc:"Notification delivery receipts & audit log"},{method:"POST",path:"/api/v1/dummy/otp/send",tag:"Simulator",desc:"Flow 1: Send OTP (Returns OTP in response)"},{method:"POST",path:"/api/v1/dummy/otp/verify",tag:"Simulator",desc:"Flow 1: Verify OTP & Issue Tokens"},{method:"POST",path:"/api/v1/dummy/flow/checksub-first",tag:"Simulator",desc:"Flow 2: CheckSub First + Seamless Bypass"},{method:"POST",path:"/api/v1/dummy/flow/pack-first/send-pin",tag:"Simulator",desc:"Flow 3: Pack First - Send Carrier PIN"},{method:"POST",path:"/api/v1/dummy/flow/pack-first/verify-pin",tag:"Simulator",desc:"Flow 3: Pack First - Verify PIN & Activate"},{method:"GET",path:"/api/v1/dummy/flow/status",tag:"Simulator",desc:"CheckSub Status Polling (active/new_user/low_balance)"},{method:"GET",path:"/api/v1/dummy/flow/header-enrichment",tag:"Simulator",desc:"Flow 4: Zero-Click Cellular Header Enrichment"},{method:"POST",path:"/api/v1/dummy/simulate/set-status",tag:"Simulator",desc:"Simulator Control: Set active/new_user/low_balance"},{method:"POST",path:"/api/v1/dummy/simulate/reset",tag:"Simulator",desc:"Simulator Control: Reset mock states"}];t.innerHTML=`
      <div class="flex-between mb-4">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h1 style="font-size: 22px; margin-bottom: 2px;">Portal Admin API Specification</h1>
            <span class="badge badge-success">${e.length} Endpoints Active</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 13px;">
            Complete OpenAPI documentation, schemas, and live test harness under <code>/docs/portal-admin/</code>
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="/docs/portal-admin/" target="_blank" class="btn btn-primary">
            ${M.externalLink} Open Swagger in New Window
          </a>
          <a href="/health" target="_blank" class="btn btn-secondary">
            ${M.activity} Health API
          </a>
        </div>
      </div>

      <!-- Quick Endpoint Grid Drawer -->
      <details class="card mb-4" style="padding: 14px 18px;">
        <summary style="cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between;">
          <span>All Documented <code>/docs/portal-admin/</code> Endpoints (${e.length})</span>
          <span style="font-size: 11px; color: var(--brand-cyan);">Click to expand / collapse</span>
        </summary>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 8px; margin-top: 14px; max-height: 260px; overflow-y: auto; padding-right: 6px;">
          ${e.map(a=>`
            <div style="padding: 8px 12px; background: var(--bg-inset); border: 1px solid var(--border-subtle); border-radius: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 11.5px;">
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <span class="badge ${a.method==="GET"?"badge-primary":a.method==="POST"?"badge-success":a.method==="PUT"?"badge-warning":"badge-danger"}" style="padding: 2px 6px; font-size: 9.5px;">
                  ${a.method}
                </span>
                <code style="font-family: var(--font-mono); color: var(--text-primary); font-size: 11px;">${a.path}</code>
              </div>
              <span style="font-size: 10px; color: var(--text-muted);">${a.tag}</span>
            </div>
          `).join("")}
        </div>
      </details>

      <!-- Embedded Interactive Swagger UI -->
      <div class="card" style="flex: 1; padding: 0; overflow: hidden; border-radius: var(--radius-md); display: flex; flex-direction: column;">
        <div style="padding: 10px 16px; background: rgba(0,0,0,0.3); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></div>
            <span style="font-weight: 600;">Interactive Swagger UI Sandbox</span>
            <span style="color: var(--text-muted);">— http://localhost:3000/docs/portal-admin/</span>
          </div>
          <button id="reload-iframe-btn" class="btn btn-secondary btn-sm" style="height: 26px; padding: 0 10px; font-size: 11px;">
            ${M.refresh} Reload Sandbox
          </button>
        </div>
        <iframe id="swagger-iframe" src="/docs/portal-admin/" style="flex: 1; width: 100%; border: none; min-height: 500px; background: #ffffff;"></iframe>
      </div>
    `;const i=t.querySelector("#reload-iframe-btn"),n=t.querySelector("#swagger-iframe");return i&&n&&(i.onclick=()=>{n.src="/docs/portal-admin/"}),t}}class zp{constructor(){this.appEl=document.getElementById("app"),this.currentRoute=this.getRouteFromHash()||"overview",this.init()}getRouteFromHash(){return window.location.hash.replace("#","")||"overview"}async init(){window.addEventListener("auth:expired",()=>{D.error("Session expired. Please log in."),this.render()}),window.addEventListener("hashchange",()=>{this.currentRoute=this.getRouteFromHash(),this.render()});let t=R.activeOperatorId;R.subscribe(({activeOperatorId:e})=>{if(this.updateHeaderAndSidebar(),e!==t){t=e;const[i,n]=this.currentRoute.split("?");(i!=="operator-detail"||!new URLSearchParams(n).get("id"))&&this.renderCurrentView()}}),Ot.isAuthenticated()&&(await Ot.fetchMe(),await R.loadOperators()),this.render()}navigateTo(t){if(this.getRouteFromHash()===t){this.currentRoute=t,this.render();return}window.location.hash=`#${t}`}updateHeaderAndSidebar(){const t=document.querySelector(".sidebar"),e=document.querySelector(".top-header");if(t&&Ot.isAuthenticated()){const i=new Hs(this.currentRoute,n=>this.navigateTo(n)).render();t.replaceWith(i)}if(e&&Ot.isAuthenticated()){const i=new Vs(this.currentRoute).render();e.replaceWith(i)}}async renderCurrentView(){const t=this.appEl.querySelector(".main-content");if(!t)return;const e=t.querySelector(".view-container")||t.querySelector("#view-slot");if(!e)return;const n=await this.createViewComponent(this.currentRoute).render();e.replaceWith(n)}createViewComponent(t){var a;const[e,i]=t.split("?"),n=new URLSearchParams(i||"");if(e==="operator-detail"){const o=n.get("id")||R.activeOperatorId||((a=R.operators[0])==null?void 0:a.id);return new ga(r=>this.navigateTo(r),o)}switch(e){case"overview":return new ha(o=>this.navigateTo(o));case"operators":return new Tp(o=>this.navigateTo(o));case"agents":return new Ap(o=>this.navigateTo(o));case"plans":{const o=new ga(r=>this.navigateTo(r),R.activeOperatorId);return o.activeTab="tab-plans",o}case"providers":return new $p(o=>this.navigateTo(o));case"subscribers":return new Pp(o=>this.navigateTo(o));case"notifications":return new Op(o=>this.navigateTo(o));case"api-docs":return new Ip(o=>this.navigateTo(o));default:return new ha(o=>this.navigateTo(o))}}async render(){if(!Ot.isAuthenticated()){this.appEl.innerHTML="";const o=new bo(async()=>{await Ot.fetchMe(),await R.loadOperators(),this.navigateTo("overview")});this.appEl.appendChild(o.render());return}this.appEl.innerHTML=`
      <div class="app-layout">
        <div id="sidebar-slot"></div>
        <div class="main-content">
          <div id="header-slot"></div>
          <main id="view-slot"></main>
        </div>
      </div>
    `;const t=new Hs(this.currentRoute,o=>this.navigateTo(o)).render(),e=new Vs(this.currentRoute).render();this.appEl.querySelector("#sidebar-slot").replaceWith(t),this.appEl.querySelector("#header-slot").replaceWith(e);const i=this.appEl.querySelector("#view-slot"),a=await this.createViewComponent(this.currentRoute).render();i.replaceWith(a)}}new zp;

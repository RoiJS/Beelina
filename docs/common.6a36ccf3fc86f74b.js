"use strict";(self.webpackChunkBeelina_APP=self.webpackChunkBeelina_APP||[]).push([[592],{9241:(C,E,t)=>{t.d(E,{T:()=>r});var e=t(3432);class r extends e.J{constructor(){super(),this.id=0,this.name=""}}},4526:(C,E,t)=>{t.d(E,{k:()=>l});var e=t(3432),r=t(9241);class o extends e.J{constructor(){super()}}class l extends e.J{constructor(){super(),this.paymentMethod=new o,this.barangay=new r.T}}},2217:(C,E,t)=>{t.d(E,{v:()=>S});var e=t(8539),r=t(8180),o=t(7398),l=t(5510),a=t(9241),s=t(5879),u=t(4221);const m=e.Ps`
  mutation ($barangayInput: BarangayInput!) {
    updateBarangay(input: { barangayInput: $barangayInput }) {
      barangay {
        id
        name
      }
    }
  }
`,d=e.Ps`
  query ($cursor: String, $filterKeyword: String) {
    barangays(after: $cursor, where: { name: { contains: $filterKeyword } }) {
      edges {
        cursor
        node {
          name
        }
      }
      nodes {
        id
        name
        stores {
          id
        }
        isDeletable
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`,i=e.Ps`
  query {
    allBarangays {
      id
      name
    }
  }
`,y=e.Ps`
  mutation ($barangayId: Int!) {
    deleteBarangay(input: { barangayId: $barangayId }) {
      barangay {
        id
        name
      }
      errors {
        __typename
        ... on BarangayNotExistsError {
          message
        }
        ... on BaseError {
          message
        }
      }
    }
  }
`;let S=(()=>{class f{constructor(n,h){this.apollo=n,this.store=h}getBarangays(){let n=null,h="";return this.store.select(l.g2).pipe((0,r.q)(1)).subscribe(c=>n=c),this.store.select(l.yW).pipe((0,r.q)(1)).subscribe(c=>h=c),this.apollo.watchQuery({query:d,variables:{cursor:n,filterKeyword:h}}).valueChanges.pipe((0,o.U)(c=>{const g=c.data.barangays,_=c.errors,M=g.nodes;if(M)return{endCursor:g.pageInfo.endCursor,hasNextPage:g.pageInfo.hasNextPage,barangays:M};if(_&&_.length>0)throw new Error(_[0].message);return null}))}getAllBarangays(){return this.apollo.watchQuery({query:i}).valueChanges.pipe((0,o.U)(n=>n.data.allBarangays.map(c=>{const g=new a.T;return g.id=c.id,g.name=c.name,g})))}updateBarangay(n){return this.apollo.mutate({mutation:m,variables:{barangayInput:{id:n.id,name:n.name}}}).pipe((0,o.U)(c=>{const g=c.data.updateBarangay,_=g.barangay,p=g.errors;if(_)return _;if(p&&p.length>0)throw new Error(p[0].message);return null}))}deleteBarangay(n){return this.apollo.mutate({mutation:y,variables:{barangayId:n}}).pipe((0,o.U)(h=>{const c=h.data.deleteBarangay,g=c.barangay,_=c.errors;if(g)return g;if(_&&_.length>0)throw new Error(_[0].message);return null}))}static#e=this.\u0275fac=function(h){return new(h||f)(s.\u0275\u0275inject(e._M),s.\u0275\u0275inject(u.Store))};static#t=this.\u0275prov=s.\u0275\u0275defineInjectable({token:f,factory:f.\u0275fac,providedIn:"root"})}return f})()},3659:(C,E,t)=>{t.d(E,{L:()=>O});var e=t(7398),r=t(8180),o=t(8539),l=t(2928),a=t(4526),s=t(5879),u=t(4221);const m=o.Ps`
  mutation ($storeInput: StoreInput!) {
    updateStore(input: { storeInput: $storeInput }) {
      store {
        id
        name
      }
    }
  }
`,d=o.Ps`
  query ($cursor: String, $filterKeyword: String) {
    stores(after: $cursor, where: { name: { contains: $filterKeyword } }) {
      edges {
        cursor
        node {
          name
        }
      }
      nodes {
        id
        name
        address
        outletType
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`,i=o.Ps`
  query ($barangayName: String!, $cursor: String, $filterKeyword: String) {
    storesByBarangay(
      after: $cursor
      barangayName: $barangayName
      where: { name: { contains: $filterKeyword } }
    ) {
      edges {
        cursor
        node {
          name
        }
      }
      nodes {
        id
        name
        address
        outletType
        transactions {
          id
        }
        isDeletable
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`,y=o.Ps`
  query {
    allStores {
      id
      name
      address
      outletType
      paymentMethod {
        id
        name
      }
      barangay {
        id
        name
      }
    }
  }
`,S=o.Ps`
  query ($storeId: Int!) {
    store(storeId: $storeId) {
      typename: __typename
      ... on StoreInformationResult {
        id
        name
        address
        outletType
        paymentMethod {
          name
        }
        barangay {
          name
        }
      }
      ... on StoreNotExistsError {
        message
      }
    }
  }
`,f=o.Ps`
  mutation ($storeId: Int!) {
    deleteStore(input: { storeId: $storeId }) {
      store {
        name
      }
    }
  }
`;let O=(()=>{class n{constructor(c,g){this.apollo=c,this.store=g}updateStoreInformation(c){return this.apollo.mutate({mutation:m,variables:{storeInput:{id:c.id,name:c.name,address:c.address,outletType:c.outletType,paymentMethodInput:{id:c.paymentMethod.id,name:c.paymentMethod.name},barangayInput:{id:c.barangay.id,name:c.barangay.name}}}}).pipe((0,e.U)(_=>{const p=_.data.updateStore,P=p.store,M=p.errors;if(P)return P;if(M&&M.length>0)throw new Error(M[0].message);return null}))}getCustomerStores(){let c=null,g="";return this.store.select(l.g2).pipe((0,r.q)(1)).subscribe(_=>c=_),this.store.select(l.yW).pipe((0,r.q)(1)).subscribe(_=>g=_),this.apollo.watchQuery({query:d,variables:{cursor:c,filterKeyword:g}}).valueChanges.pipe((0,e.U)(_=>{const p=_.data.stores,P=_.errors,B=p.nodes;if(B)return{endCursor:p.pageInfo.endCursor,hasNextPage:p.pageInfo.hasNextPage,customerStores:B};if(P&&P.length>0)throw new Error(P[0].message);return null}))}getCustomerStoresPerBarangay(c){let g=null,_="";return this.store.select(l.g2).pipe((0,r.q)(1)).subscribe(p=>g=p),this.store.select(l.yW).pipe((0,r.q)(1)).subscribe(p=>_=p),this.apollo.watchQuery({query:i,variables:{cursor:g,filterKeyword:_,barangayName:c}}).valueChanges.pipe((0,e.U)(p=>{const P=p.data.storesByBarangay,M=p.errors,v=P.nodes;if(v)return{endCursor:P.pageInfo.endCursor,hasNextPage:P.pageInfo.hasNextPage,customerStores:v};if(M&&M.length>0)throw new Error(M[0].message);return null}))}getAllCustomerStores(){return this.apollo.watchQuery({query:y}).valueChanges.pipe((0,e.U)(c=>c.data.allStores.map(_=>{const p=new a.k;return p.id=_.id,p.name=_.name,p.address=_.address,p.paymentMethod=_.paymentMethod,p.barangay=_.barangay,p})))}getCustomerStore(c){return this.apollo.watchQuery({query:S,variables:{storeId:c}}).valueChanges.pipe((0,e.U)(g=>{const _=g.data.store;if("StoreInformationResult"===_.typename)return g.data.store;if("StoreNotExistsError"===_.typename)throw new Error(g.data.store.message);return null}))}deleteCustomer(c){return this.apollo.mutate({mutation:f,variables:{storeId:c}}).pipe((0,e.U)(g=>{const _=g.data.deleteStore,p=_.store,P=_.errors;if(p)return p;if(P&&P.length>0)throw new Error(P[0].message);return null}))}static#e=this.\u0275fac=function(g){return new(g||n)(s.\u0275\u0275inject(o._M),s.\u0275\u0275inject(u.Store))};static#t=this.\u0275prov=s.\u0275\u0275defineInjectable({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})()},7514:(C,E,t)=>{t.d(E,{e:()=>u});var e=t(8180),r=t(7398),o=t(6306),l=t(2096),a=t(5879),s=t(1438);let u=(()=>{class m{constructor(i){this.productService=i,this.productId=0}validate(i){return this.productService.checkProductCodeExists(this.productId,i.value).pipe((0,e.q)(1),(0,r.U)(y=>y?{productAlreadyExists:!0}:null),(0,o.K)(()=>(0,l.of)(null)))}static#e=this.\u0275fac=function(y){return new(y||m)(a.\u0275\u0275inject(s.M))};static#t=this.\u0275prov=a.\u0275\u0275defineInjectable({token:m,factory:m.\u0275fac,providedIn:"root"})}return m})()},6347:(C,E,t)=>{t.d(E,{Uw:()=>a,V6:()=>r,Z1:()=>o,b:()=>u,hu:()=>m,jj:()=>l,uZ:()=>s});var e=t(4221);const r=(0,e.createAction)("[Barangay] Get Barangays Methods"),o=(0,e.createAction)("[Barangay] Get All Barangays"),l=(0,e.createAction)("[Barangay] Get Barangay Methods Success",(0,e.props)()),a=(0,e.createAction)("[Barangay] Get Barangays Methods Error",(0,e.props)()),s=(0,e.createAction)("[Barangay] Reset Barangay State"),u=(0,e.createAction)("[Barangay] Reset Barangay List"),m=(0,e.createAction)("[Barangay] Search Barangays",(0,e.props)())},2812:(C,E,t)=>{t.d(E,{C:()=>i});var e=t(5154),r=t(4664),o=t(932),l=t(7398),a=t(6306),s=t(2096),u=t(6347),m=t(5879),d=t(2217);let i=(()=>{class y{constructor(f,O){this.actions$=f,this.barangayService=O,this.barangays$=(0,e.GW)(()=>this.actions$.pipe((0,e.l4)(u.V6),(0,r.w)(()=>this.barangayService.getBarangays().pipe((0,o.g)(1e3),(0,l.U)(n=>u.jj({barangays:n.barangays,endCursor:n.endCursor,hasNextPage:n.hasNextPage})),(0,a.K)(n=>(0,s.of)(u.Uw({error:n.message}))))))),this.getAllBarangays$=(0,e.GW)(()=>this.actions$.pipe((0,e.l4)(u.Z1),(0,r.w)(()=>this.barangayService.getAllBarangays().pipe((0,l.U)(n=>u.jj({barangays:n,endCursor:null,hasNextPage:!1})),(0,a.K)(n=>(0,s.of)(u.Uw({error:n.message})))))))}static#e=this.\u0275fac=function(O){return new(O||y)(m.\u0275\u0275inject(e.eX),m.\u0275\u0275inject(d.v))};static#t=this.\u0275prov=m.\u0275\u0275defineInjectable({token:y,factory:y.\u0275fac})}return y})()},2805:(C,E,t)=>{t.d(E,{l:()=>l});var e=t(4221),r=t(6347);const o={isLoading:!1,isUpdateLoading:!1,barangays:new Array,endCursor:null,filterKeyword:"",hasNextPage:!1,error:null},l=(0,e.createReducer)(o,(0,e.on)(r.V6,(a,s)=>({...a,isLoading:!0})),(0,e.on)(r.jj,(a,s)=>({...a,isLoading:!1,endCursor:s.endCursor,barangays:a.barangays.concat(s.barangays)})),(0,e.on)(r.Uw,(a,s)=>({...a,error:s.error})),(0,e.on)(r.uZ,(a,s)=>({...o})),(0,e.on)(r.hu,(a,s)=>({...a,filterKeyword:s.keyword})),(0,e.on)(r.b,(a,s)=>({...a,barangays:o.barangays,endCursor:o.endCursor})))},5510:(C,E,t)=>{t.d(E,{VO:()=>s,d2:()=>o,g2:()=>l,yW:()=>m});var e=t(4221);const r=d=>d.barangays,o=(0,e.createSelector)(r,d=>d.barangays),l=(0,e.createSelector)(r,d=>d.endCursor),s=((0,e.createSelector)(r,d=>d.hasNextPage),(0,e.createSelector)(r,d=>d.isLoading)),m=((0,e.createSelector)(r,d=>d.error),(0,e.createSelector)(r,d=>d.filterKeyword))},1675:(C,E,t)=>{t.d(E,{IT:()=>d,Jo:()=>u,et:()=>s,n3:()=>r,q0:()=>o,rh:()=>l,sg:()=>a,sv:()=>m});var e=t(4221);const r=(0,e.createAction)("[Customer] Get Customers"),o=(0,e.createAction)("[Customer] Get Customers Per Barangay",(0,e.props)()),l=(0,e.createAction)("[Customer] Get All Customers"),a=(0,e.createAction)("[Customer] Get Customers Success",(0,e.props)()),s=(0,e.createAction)("[Customer] Search Customer",(0,e.props)()),u=(0,e.createAction)("[Customer] Get Customers Failed",(0,e.props)()),m=(0,e.createAction)("[Customer] Set Update Customer Loading State",(0,e.props)()),d=(0,e.createAction)("[Customer] Reset Customer State")},1710:(C,E,t)=>{t.d(E,{Y:()=>i});var e=t(5154),r=t(4664),o=t(932),l=t(7398),a=t(6306),s=t(2096),u=t(1675),m=t(5879),d=t(3659);let i=(()=>{class y{constructor(f,O){this.actions$=f,this.customerStoreService=O,this.getCustomers$=(0,e.GW)(()=>this.actions$.pipe((0,e.l4)(u.n3),(0,r.w)(()=>this.customerStoreService.getCustomerStores().pipe((0,o.g)(1e3),(0,l.U)(n=>u.sg({customers:n.customerStores,endCursor:n.endCursor,hasNextPage:n.hasNextPage})),(0,a.K)(n=>(0,s.of)(u.Jo({error:n.message}))))))),this.getCustomersPerBarangay$=(0,e.GW)(()=>this.actions$.pipe((0,e.l4)(u.q0),(0,r.w)(n=>this.customerStoreService.getCustomerStoresPerBarangay(n.barangayName).pipe((0,o.g)(1e3),(0,l.U)(h=>u.sg({customers:h.customerStores,endCursor:h.endCursor,hasNextPage:h.hasNextPage})),(0,a.K)(h=>(0,s.of)(u.Jo({error:h.message}))))))),this.getAllCustomers$=(0,e.GW)(()=>this.actions$.pipe((0,e.l4)(u.rh),(0,r.w)(()=>this.customerStoreService.getAllCustomerStores().pipe((0,l.U)(n=>u.sg({customers:n,endCursor:null,hasNextPage:!1})),(0,a.K)(n=>(0,s.of)(u.Jo({error:n.message})))))))}static#e=this.\u0275fac=function(O){return new(O||y)(m.\u0275\u0275inject(e.eX),m.\u0275\u0275inject(d.L))};static#t=this.\u0275prov=m.\u0275\u0275defineInjectable({token:y,factory:y.\u0275fac})}return y})()},179:(C,E,t)=>{t.d(E,{l:()=>l});var e=t(4221),r=t(1675);const o={isLoading:!1,isUpdateLoading:!1,customers:new Array,hasNextPage:!1,endCursor:null,filterKeyword:"",error:null},l=(0,e.createReducer)(o,(0,e.on)(r.n3,(a,s)=>({...a,isLoading:!0})),(0,e.on)(r.sg,(a,s)=>({...a,isLoading:!1,endCursor:s.endCursor,customers:a.customers.concat(s.customers)})),(0,e.on)(r.Jo,(a,s)=>({...a,error:s.error})),(0,e.on)(r.sv,(a,s)=>({...a,isUpdateLoading:s.state})),(0,e.on)(r.et,(a,s)=>({...a,filterKeyword:s.keyword})),(0,e.on)(r.IT,(a,s)=>({...o})))},2928:(C,E,t)=>{t.d(E,{Cz:()=>m,KF:()=>o,VO:()=>s,g2:()=>l,yW:()=>d});var e=t(4221);const r=i=>i.customerStores,o=(0,e.createSelector)(r,i=>i.customers),l=(0,e.createSelector)(r,i=>i.endCursor),s=((0,e.createSelector)(r,i=>i.hasNextPage),(0,e.createSelector)(r,i=>i.isLoading)),m=((0,e.createSelector)(r,i=>i.error),(0,e.createSelector)(r,i=>i.isUpdateLoading)),d=(0,e.createSelector)(r,i=>i.filterKeyword)},3018:(C,E,t)=>{t.d(E,{w:()=>l});var e=t(5879),r=t(2296),o=t(617);let l=(()=>{class a{constructor(){this.tapButton=new e.EventEmitter}ngOnInit(){}onTapButton(){this.tapButton.emit(0)}static#e=this.\u0275fac=function(m){return new(m||a)};static#t=this.\u0275cmp=e.\u0275\u0275defineComponent({type:a,selectors:[["app-floating-button"]],inputs:{icon:"icon"},outputs:{tapButton:"tapButton"},decls:4,vars:1,consts:[[1,"floating-button"],["mat-fab","",3,"click"]],template:function(m,d){1&m&&(e.\u0275\u0275elementStart(0,"div",0)(1,"button",1),e.\u0275\u0275listener("click",function(){return d.onTapButton()}),e.\u0275\u0275elementStart(2,"mat-icon"),e.\u0275\u0275text(3),e.\u0275\u0275elementEnd()()()),2&m&&(e.\u0275\u0275advance(3),e.\u0275\u0275textInterpolate(d.icon))},dependencies:[r.cs,o.Hw],styles:[".floating-button[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{position:absolute;right:30px;bottom:90px;background:linear-gradient(300deg,#d69213 40%,#d89c2a 100%);border-radius:50%;color:#fff}"]})}return a})()},5180:(C,E,t)=>{t.d(E,{r:()=>s});var e=t(5879),r=t(6223),o=t(9515),l=t(2296),a=t(617);let s=(()=>{class u{constructor(d,i){this.formBuilder=d,this.translateService=i,this.placeHolderTextIdentifier="",this.onSearch=new e.EventEmitter,this._searchForm=this.formBuilder.group({filterKeyword:[""]})}ngOnInit(){}onSubmit(){const d=this._searchForm.get("filterKeyword").value;this.onSearch.emit(d)}get searchForm(){return this._searchForm}get placeHolder(){return this.translateService.instant(this.placeHolderTextIdentifier)}static#e=this.\u0275fac=function(i){return new(i||u)(e.\u0275\u0275directiveInject(r.qu),e.\u0275\u0275directiveInject(o.sK))};static#t=this.\u0275cmp=e.\u0275\u0275defineComponent({type:u,selectors:[["app-search-field"]],inputs:{placeHolderTextIdentifier:"placeHolderTextIdentifier"},outputs:{onSearch:"onSearch"},decls:6,vars:2,consts:[[3,"formGroup","ngSubmit"],[1,"search-field-container"],["type","text","formControlName","filterKeyword",1,"txt-search-field",3,"placeholder"],["type","submit","mat-fab","","color","primary"]],template:function(i,y){1&i&&(e.\u0275\u0275elementStart(0,"form",0),e.\u0275\u0275listener("ngSubmit",function(){return y.onSubmit()}),e.\u0275\u0275elementStart(1,"div",1),e.\u0275\u0275element(2,"input",2),e.\u0275\u0275elementStart(3,"button",3)(4,"mat-icon"),e.\u0275\u0275text(5,"search"),e.\u0275\u0275elementEnd()()()()),2&i&&(e.\u0275\u0275property("formGroup",y.searchForm),e.\u0275\u0275advance(2),e.\u0275\u0275property("placeholder",y.placeHolder))},dependencies:[l.cs,a.Hw,r._Y,r.Fj,r.JJ,r.JL,r.sg,r.u],styles:[".search-field-container[_ngcontent-%COMP%]{display:flex;justify-content:space-between;margin-bottom:15px}.search-field-container[_ngcontent-%COMP%]   .txt-search-field[_ngcontent-%COMP%]{width:83%;box-sizing:border-box;padding:12px;font-size:15px;border-radius:22px}"]})}return u})()}}]);
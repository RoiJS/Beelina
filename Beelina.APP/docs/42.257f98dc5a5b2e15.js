"use strict";(self.webpackChunkBeelina_APP=self.webpackChunkBeelina_APP||[]).push([[42],{4132:(C,_,e)=>{e.d(_,{Z:()=>r});var r=function(a){return a.DRAFT="DRAFT",a.CONFIRMED="CONFIRMED",a}(r||{})},3726:(C,_,e)=>{e.d(_,{C:()=>l});var r=e(6676);class l{static format(u,m="YYYY-MM-DD"){return u?r(u).format(m):""}static relativeTimeFormat(u){return r(u).startOf("hour").fromNow()}static isValidDate(u){return 1!==new Date(u).getFullYear()}}},2876:(C,_,e)=>{e.d(_,{e:()=>r});class r{static formatCurrency(l){return`\u20b1 ${l.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}`}}},776:(C,_,e)=>{e.d(_,{U:()=>u});var r=e(4221),a=e(135),l=e(2974),p=e(803);class u extends p.y{constructor(i,t){super(i),this.store=i,this.transactionStatus=t,this.store.dispatch(l.dF({transactionStatus:this.transactionStatus})),this._subscription.add(this.store.pipe((0,r.select)(a.Nz)).subscribe(O=>{this._dataStream.next(O)}))}fetchData(){this.store.dispatch(l.dF({transactionStatus:this.transactionStatus}))}}},6842:(C,_,e)=>{e.d(_,{x:()=>p});var r=e(2876),a=e(3432);class l extends a.J{constructor(){super()}}class p extends a.J{get priceFormatted(){return r.e.formatCurrency(this.price)}constructor(){super(),this.productUnit=new l}}},6729:(C,_,e)=>{e.d(_,{P:()=>p});var r=function(u){return u.Paid="PAID",u.Unpaid="UNPAID",u}(r||{}),a=e(2876),l=e(3432);class p extends l.J{get isPaid(){return this.status===r.Paid}get priceFormatted(){return a.e.formatCurrency(this.price)}}},9685:(C,_,e)=>{e.d(_,{Y:()=>B});var r=e(7394),a=e(9886),l=e(2974),p=e(135),u=e(8005),m=e(6676),i=e.n(m),t=e(5879),O=e(6223),M=e(2296),P=e(617),c=e(4170),y=e(8525),R=e(3680),v=e(8034),A=e(9515);let L=(()=>{class S{constructor(T,h,g){this._bottomSheetRef=T,this.data=h,this.formBuilder=g,this._filterForm=this.formBuilder.group({dateFrom:[h.fromDate],dateTo:[h.toDate],sortOrder:[h.sortOrder]})}ngOnInit(){}onReset(){this._bottomSheetRef.dismiss({dateFrom:null,dateTo:null,sortOrder:a.q.ASCENDING})}onCancel(){this._bottomSheetRef.dismiss()}onConfirm(){const T=this._filterForm.get("dateFrom").value,h=this._filterForm.get("dateTo").value,g=this._filterForm.get("sortOrder").value,I=T?i()(T).format("YYYY-MM-DD"):null,f=h?i()(h).format("YYYY-MM-DD"):null;this._bottomSheetRef.dismiss({dateFrom:I,dateTo:f,sortOrder:g??a.q.ASCENDING})}get filterForm(){return this._filterForm}static#t=this.\u0275fac=function(h){return new(h||S)(t.\u0275\u0275directiveInject(u.oL),t.\u0275\u0275directiveInject(u.OG),t.\u0275\u0275directiveInject(O.qu))};static#e=this.\u0275cmp=t.\u0275\u0275defineComponent({type:S,selectors:[["app-filter-and-sort"]],decls:39,vars:26,consts:[[1,"filter-and-sort-container"],[1,"filter-and-sort-container__header"],[3,"click"],[1,"filter-and-sort-container__body",3,"formGroup"],["appearance","fill"],[3,"rangePicker"],["matStartDate","","formControlName","dateFrom","placeholder","Start Date"],["matEndDate","","formControlName","dateTo","placeholder","End Date"],["matSuffix","",3,"for"],["picker",""],["formControlName","sortOrder"],[3,"value"],[1,"filter-and-sort-container__footer"],[1,"button-container"],["mat-raised-button","","color","primary",3,"click"],["mat-raised-button","","color","default",3,"click"]],template:function(h,g){if(1&h&&(t.\u0275\u0275elementStart(0,"div",0)(1,"div",1)(2,"span"),t.\u0275\u0275text(3),t.\u0275\u0275pipe(4,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(5,"mat-icon",2),t.\u0275\u0275listener("click",function(){return g.onCancel()}),t.\u0275\u0275text(6,"cancel"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(7,"div",3)(8,"mat-form-field",4)(9,"mat-label"),t.\u0275\u0275text(10),t.\u0275\u0275pipe(11,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(12,"mat-date-range-input",5),t.\u0275\u0275element(13,"input",6)(14,"input",7),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(15,"mat-hint"),t.\u0275\u0275text(16,"MM/DD/YYYY \u2013 MM/DD/YYYY"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(17,"mat-datepicker-toggle",8)(18,"mat-date-range-picker",null,9),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(20,"mat-form-field",4)(21,"mat-label"),t.\u0275\u0275text(22),t.\u0275\u0275pipe(23,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(24,"mat-select",10)(25,"mat-option",11),t.\u0275\u0275text(26),t.\u0275\u0275pipe(27,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(28,"mat-option",11),t.\u0275\u0275text(29),t.\u0275\u0275pipe(30,"translate"),t.\u0275\u0275elementEnd()()()(),t.\u0275\u0275elementStart(31,"div",12)(32,"div",13)(33,"button",14),t.\u0275\u0275listener("click",function(){return g.onConfirm()}),t.\u0275\u0275text(34),t.\u0275\u0275pipe(35,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(36,"button",15),t.\u0275\u0275listener("click",function(){return g.onReset()}),t.\u0275\u0275text(37),t.\u0275\u0275pipe(38,"translate"),t.\u0275\u0275elementEnd()()()()),2&h){const I=t.\u0275\u0275reference(19);t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(4,12,"TRANSACTION_FILTER_AND_SORT_DIALOG.TITLE")),t.\u0275\u0275advance(4),t.\u0275\u0275property("formGroup",g.filterForm),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(11,14,"TRANSACTION_FILTER_AND_SORT_DIALOG.FORM_CONTROL_SECTION.DATE_RANGE_CONTROL.LABEL"),":"),t.\u0275\u0275advance(2),t.\u0275\u0275property("rangePicker",I),t.\u0275\u0275advance(5),t.\u0275\u0275property("for",I),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(23,16,"TRANSACTION_FILTER_AND_SORT_DIALOG.FORM_CONTROL_SECTION.DATE_ORDER_CONTROL.LABEL"),":"),t.\u0275\u0275advance(3),t.\u0275\u0275property("value","ASC"),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(27,18,"TRANSACTION_FILTER_AND_SORT_DIALOG.FORM_CONTROL_SECTION.DATE_ORDER_CONTROL.ASCENDING_OPTION")," "),t.\u0275\u0275advance(2),t.\u0275\u0275property("value","DESC"),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(30,20,"TRANSACTION_FILTER_AND_SORT_DIALOG.FORM_CONTROL_SECTION.DATE_ORDER_CONTROL.DESCENDING_OPTION")," "),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(35,22,"GENERAL_TEXTS.CONFIRM")," "),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(38,24,"GENERAL_TEXTS.RESET")," ")}},dependencies:[M.lW,P.Hw,c.KE,c.hX,c.bx,c.R9,y.gD,R.ey,v.nW,v.wx,v.zY,v.By,v._g,O.Fj,O.JJ,O.JL,O.sg,O.u,A.X$],styles:[".filter-and-sort-container[_ngcontent-%COMP%]{height:40vh;display:flex;flex-direction:column}.filter-and-sort-container__header[_ngcontent-%COMP%]{font-size:16px;padding:15px;background-color:#d89c2a;color:#fff;display:flex;justify-content:space-between}.filter-and-sort-container__body[_ngcontent-%COMP%]{flex:1;padding:15px;display:flex;flex-direction:column;justify-content:space-evenly}.filter-and-sort-container__body[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%]{width:100%}.filter-and-sort-container__footer[_ngcontent-%COMP%]{display:flex;padding:15px}.filter-and-sort-container__footer[_ngcontent-%COMP%]   .button-container[_ngcontent-%COMP%]{display:flex;gap:12px;width:100%}.filter-and-sort-container__footer[_ngcontent-%COMP%]   .button-container[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:50%}"]})}return S})();var x=e(3064),U=e(4221);let B=(()=>{class S{constructor(T,h){this.storageService=T,this.store=h,this.subscription=new r.w0}setProps(T,h,g){this.dateFromProp=T,this.dateToProp=h,this.sortOrderProp=g,this.subscription=new r.w0;const I=this.storageService.getString(this.sortOrderProp)||a.q.ASCENDING,f=this.storageService.getString(this.dateFromProp),N=this.storageService.getString(this.dateToProp);return this.subscription.add(this.store.select(p.yg).subscribe(s=>{this._fromDate=s})),this.subscription.add(this.store.select(p.I4).subscribe(s=>{this._toDate=s})),this.subscription.add(this.store.select(p.F).subscribe(s=>{this._sortOrder=s})),this.subscription.add(this.store.dispatch(l.jy({sortOrder:I,dateStart:"null"===f?null:f,dateEnd:"null"===N?null:N}))),this}setBottomSheet(T){return this._bottomSheet=T,this}setDataSource(T){return this._dataSource=T,this}openFilter(){this._dialogRef=this._bottomSheet.open(L,{data:{fromDate:this._fromDate,toDate:this._toDate,sortOrder:this._sortOrder}}),this._dialogRef.afterDismissed().subscribe(T=>{this.store.dispatch(l.jy({dateStart:T.dateFrom,dateEnd:T.dateTo,sortOrder:T.sortOrder})),this.storageService.storeString(this.dateFromProp,T.dateFrom),this.storageService.storeString(this.dateToProp,T.dateTo),this.storageService.storeString(this.sortOrderProp,T.sortOrder),this.store.dispatch(l.jC()),this._dataSource.fetchData()})}destroy(){this.subscription.unsubscribe(),this._dialogRef=null}get dataSource(){return this._dataSource}get isFilterActive(){return null!==this._fromDate||null!==this._toDate||this._sortOrder!==a.q.ASCENDING}static#t=this.\u0275fac=function(h){return new(h||S)(t.\u0275\u0275inject(x.V),t.\u0275\u0275inject(U.Store))};static#e=this.\u0275prov=t.\u0275\u0275defineInjectable({token:S,factory:S.\u0275fac,providedIn:"root"})}return S})()},8761:(C,_,e)=>{e.d(_,{On:()=>h,YW:()=>S,pX:()=>I});var r=e(8539),a=e(7398),l=e(8180),p=e(932),u=e(3432),m=e(6842),i=e(6729),t=e(3726),O=e(2876),M=e(9886),P=e(135),c=e(5879),y=e(4221);const R=r.Ps`
  mutation ($transactionInput: TransactionInput!) {
    registerTransaction(input: { transactionInput: $transactionInput }) {
      transaction {
        id
      }
    }
  }
`,v=r.Ps`
  query (
    $cursor: String
    $sortOrder: SortEnumType
    $transactionStatus: TransactionStatusEnum!
    $fromDate: String
    $toDate: String
  ) {
    transactionDates(
      after: $cursor
      order: [{ transactionDate: $sortOrder }]
      transactionStatus: $transactionStatus
      fromDate: $fromDate
      toDate: $toDate
    ) {
      edges {
        cursor
        node {
          transactionDate
          allTransactionsPaid
        }
      }
      nodes {
        transactionDate
        allTransactionsPaid
        numberOfUnPaidTransactions
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`,A=r.Ps`
  query ($transactionDate: String!, $status: TransactionStatusEnum!) {
    transactionsByDate(transactionDate: $transactionDate, status: $status) {
      id
      storeId
      transactionDate
      hasUnpaidProductTransaction
      store {
        name
      }
    }
  }
`,L=r.Ps`
  query ($transactionId: Int!) {
    transaction(transactionId: $transactionId) {
      id
      storeId
      invoiceNo
      discount
      transactionDate
      hasUnpaidProductTransaction
      total
      balance
      dateCreatedFormatted
      store {
        id
        name
        address
        paymentMethod {
          name
        }
        barangay {
          name
        }
      }
      productTransactions {
        id
        transactionId
        productId
        quantity
        price
        status
        currentQuantity
        product {
          id
          code
          name
          price
        }
      }
    }
  }
`,x=r.Ps`
  mutation ($transactionId: Int!) {
    markTransactionAsPaid(input: { transactionId: $transactionId }) {
      transaction {
        id
      }
    }
  }
`,U=r.Ps`
  query {
    topProducts {
      id
      code
      name
      count
    }
  }
`,B=r.Ps`
  query ($fromDate: String!, $toDate: String!) {
    transactionSales(fromDate: $fromDate, toDate: $toDate) {
      sales
    }
  }
`;class S extends u.J{get transactionDateFormatted(){return t.C.format(this.transactionDate,"MMM DD, YYYY")}get grossTotalFormatted(){return O.e.formatCurrency(this.total)}get netTotalFormatted(){return O.e.formatCurrency(this.total-this.discount/100*this.total)}get balanceFormatted(){return O.e.formatCurrency(this.balance)}constructor(){super(),this.productTransactions=new Array}}class Y{get transactionDateFormatted(){return t.C.format(this.transactionDate,"MMM DD, YYYY")}}class h{constructor(){this.id=0}}class g{}let I=(()=>{class f{constructor(s,E){this.apollo=s,this.store=E}registerTransaction(s){const E={id:s.id,invoiceNo:s.invoiceNo,discount:s.discount,storeId:s.storeId,status:s.status,transactionDate:s.transactionDate,productTransactionInputs:s.productTransactions.map(n=>({id:n.id,productId:n.productId,quantity:n.quantity,price:n.price,currentQuantity:s.id>0?0:n.currentQuantity}))};return this.apollo.mutate({mutation:R,variables:{transactionInput:E}}).pipe((0,a.U)(n=>{const o=n.data.registerTransaction,D=o.transaction,d=o.errors;if(D)return D;if(d&&d.length>0)throw new Error(d[0].message);return null}))}getTransactionsByDate(s,E){return this.apollo.watchQuery({query:A,variables:{transactionDate:s,status:E}}).valueChanges.pipe((0,a.U)(n=>n.data.transactionsByDate.map(o=>{const D=new S;return D.id=o.id,D.storeId=o.storeId,D.store=o.store,D.hasUnpaidProductTransaction=o.hasUnpaidProductTransaction,D})))}getTransaction(s){return this.apollo.watchQuery({query:L,variables:{transactionId:s}}).valueChanges.pipe((0,a.U)(E=>{const n=E.data.transaction,o=new S;return o.id=n.id,o.invoiceNo=n.invoiceNo,o.discount=n.discount,o.transactionDate=n.transactionDate,o.storeId=n.storeId,o.store=n.store,o.balance=n.balance,o.total=n.total,o.dateCreatedFormatted=n.dateCreatedFormatted,o.hasUnpaidProductTransaction=n.hasUnpaidProductTransaction,o.productTransactions=n.productTransactions.map(D=>{const d=new i.P;return d.id=D.id,d.quantity=D.quantity,d.currentQuantity=D.currentQuantity,d.price=D.price,d.status=D.status,d.productName=D.product.name,d.productId=D.product.id,d.product=new m.x,d.product.id=D.product.id,d.product.code=D.product.code,d.product.name=D.product.name,d.product.price=D.product.price,d}),o}))}getTransactioDates(s){let E=null,n=M.q.ASCENDING,o=null,D=null;return this.store.select(P.g2).pipe((0,l.q)(1)).subscribe(d=>E=d),this.store.select(P.F).pipe((0,l.q)(1)).subscribe(d=>n=d),this.store.select(P.yg).pipe((0,l.q)(1)).subscribe(d=>o=d),this.store.select(P.I4).pipe((0,l.q)(1)).subscribe(d=>D=d),this.apollo.watchQuery({query:v,variables:{cursor:E,sortOrder:n,transactionStatus:s,fromDate:o,toDate:D}}).valueChanges.pipe((0,a.U)(d=>{const K=d.data.transactionDates,b=d.errors,G=K.pageInfo.endCursor,$=K.pageInfo.hasNextPage,j=K.nodes.map(W=>{const F=new Y;return F.transactionDate=W.transactionDate,F.numberOfUnPaidTransactions=W.numberOfUnPaidTransactions,F.allTransactionsPaid=W.allTransactionsPaid,F});if(j)return{endCursor:G,hasNextPage:$,transactionDates:j};if(b&&b.length>0)throw new Error(b[0].message);return null}))}getTopProducts(){return this.apollo.watchQuery({query:U}).valueChanges.pipe((0,a.U)(s=>s.data.topProducts.map(n=>{const o=new g;return o.id=n.id,o.code=n.code,o.name=n.name,o.count=n.count,o})))}getTransactionSales(s="",E=""){return this.apollo.watchQuery({query:B,variables:{fromDate:s,toDate:E}}).valueChanges.pipe((0,p.g)(1e3),(0,a.U)(n=>n.data.transactionSales))}markTransactionAsPaid(s){return this.apollo.mutate({mutation:x,variables:{transactionId:s}}).pipe((0,a.U)(E=>{const n=E.data.markTransactionAsPaid,o=n.transaction,D=n.errors;if(o)return o;if(D&&D.length>0)throw new Error(D[0].message);return null}))}static#t=this.\u0275fac=function(E){return new(E||f)(c.\u0275\u0275inject(r._M),c.\u0275\u0275inject(y.Store))};static#e=this.\u0275prov=c.\u0275\u0275defineInjectable({token:f,factory:f.\u0275fac,providedIn:"root"})}return f})()},2974:(C,_,e)=>{e.d(_,{ar:()=>u,dF:()=>a,dl:()=>i,jC:()=>t,jy:()=>p,o8:()=>m,oj:()=>l});var r=e(4221);const a=(0,r.createAction)("[Transaction Dates] Get Transaction Dates",(0,r.props)()),l=(0,r.createAction)("[Transaction Dates] Get Transaction Dates Success",(0,r.props)()),p=(0,r.createAction)("[Transaction Dates] Sort and Filter Transaction Dates",(0,r.props)()),u=(0,r.createAction)("[Transaction Dates] Get Transaction Dates Failed",(0,r.props)()),m=(0,r.createAction)("[Transaction Dates] Set Transaction Dates Loading State",(0,r.props)()),i=(0,r.createAction)("[Transaction Dates] Reset Transaction Dates State"),t=(0,r.createAction)("[Transaction Dates] Reset Transaction Dates List State")},6616:(C,_,e)=>{e.d(_,{m:()=>M});var r=e(5154),a=e(4664),l=e(932),p=e(7398),u=e(6306),m=e(2096),i=e(2974),t=e(5879),O=e(8761);let M=(()=>{class P{constructor(y,R){this.actions$=y,this.transactionService=R,this.getTransactionDates$=(0,r.GW)(()=>this.actions$.pipe((0,r.l4)(i.dF),(0,a.w)(v=>this.transactionService.getTransactioDates(v.transactionStatus).pipe((0,l.g)(1e3),(0,p.U)(A=>i.oj({transactionDates:A.transactionDates,endCursor:A.endCursor,hasNextPage:A.hasNextPage})),(0,u.K)(A=>(0,m.of)(i.ar({error:A.message})))))))}static#t=this.\u0275fac=function(R){return new(R||P)(t.\u0275\u0275inject(r.eX),t.\u0275\u0275inject(O.pX))};static#e=this.\u0275prov=t.\u0275\u0275defineInjectable({token:P,factory:P.\u0275fac})}return P})()},4608:(C,_,e)=>{e.d(_,{l:()=>u});var r=e(4221),a=e(2974),l=e(9886);const p={isLoading:!1,isUpdateLoading:!1,transactionDates:new Array,hasNextPage:!1,endCursor:null,filterKeyword:"",fromDate:null,toDate:null,sortOrder:l.q.ASCENDING,error:null},u=(0,r.createReducer)(p,(0,r.on)(a.dF,(m,i)=>({...m,isLoading:!0})),(0,r.on)(a.oj,(m,i)=>({...m,isLoading:!1,endCursor:i.endCursor,transactionDates:m.transactionDates.concat(i.transactionDates)})),(0,r.on)(a.ar,(m,i)=>({...m,error:i.error})),(0,r.on)(a.o8,(m,i)=>({...m,isLoading:i.state})),(0,r.on)(a.jy,(m,i)=>({...m,sortOrder:i.sortOrder,fromDate:i.dateStart,toDate:i.dateEnd})),(0,r.on)(a.jC,(m,i)=>({...m,transactionDates:p.transactionDates,endCursor:p.endCursor})),(0,r.on)(a.dl,(m,i)=>({...p})))},135:(C,_,e)=>{e.d(_,{F:()=>O,I4:()=>P,Nz:()=>l,VO:()=>m,g2:()=>p,yg:()=>M});var r=e(4221);const a=c=>c.transactionDates,l=(0,r.createSelector)(a,c=>c.transactionDates),p=(0,r.createSelector)(a,c=>c.endCursor),m=((0,r.createSelector)(a,c=>c.hasNextPage),(0,r.createSelector)(a,c=>c.isLoading)),O=((0,r.createSelector)(a,c=>c.error),(0,r.createSelector)(a,c=>c.filterKeyword),(0,r.createSelector)(a,c=>c.sortOrder)),M=(0,r.createSelector)(a,c=>c.fromDate),P=(0,r.createSelector)(a,c=>c.toDate)}}]);
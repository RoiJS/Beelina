"use strict";(self.webpackChunkBeelina_APP=self.webpackChunkBeelina_APP||[]).push([[572],{3726:(P,_,n)=>{n.d(_,{C:()=>m});var l=n(6676);class m{static format(f,E="YYYY-MM-DD"){return f?l(f).format(E):""}static relativeTimeFormat(f){return l(f).startOf("hour").fromNow()}static isValidDate(f){return 1!==new Date(f).getFullYear()}}},2876:(P,_,n)=>{n.d(_,{e:()=>l});class l{static formatCurrency(m){return`\u20b1 ${m.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}`}}},6842:(P,_,n)=>{n.d(_,{x:()=>T});var l=n(2876),d=n(3432);class m extends d.J{constructor(){super()}}class T extends d.J{get priceFormatted(){return l.e.formatCurrency(this.price)}constructor(){super(),this.productUnit=new m}}},6729:(P,_,n)=>{n.d(_,{P:()=>T});var l=function(f){return f.Paid="PAID",f.Unpaid="UNPAID",f}(l||{}),d=n(2876),m=n(3432);class T extends m.J{get isPaid(){return this.status===l.Paid}get priceFormatted(){return d.e.formatCurrency(this.price)}}},8761:(P,_,n)=>{n.d(_,{On:()=>$,YW:()=>x,pX:()=>K});var l=n(8539),d=n(7398),m=n(8180),T=n(932),f=n(3432),E=n(6842),I=n(6729),O=n(3726),y=n(2876),A=n(9886),C=n(135),u=n(5879),L=n(4221);const B=l.Ps`
  mutation ($transactionInput: TransactionInput!) {
    registerTransaction(input: { transactionInput: $transactionInput }) {
      transaction {
        id
      }
    }
  }
`,t=l.Ps`
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
`,R=l.Ps`
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
`,w=l.Ps`
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
`,U=l.Ps`
  mutation ($transactionId: Int!) {
    markTransactionAsPaid(input: { transactionId: $transactionId }) {
      transaction {
        id
      }
    }
  }
`,W=l.Ps`
  query {
    topProducts {
      id
      code
      name
      count
    }
  }
`,M=l.Ps`
  query ($fromDate: String!, $toDate: String!) {
    transactionSales(fromDate: $fromDate, toDate: $toDate) {
      sales
    }
  }
`;class x extends f.J{get transactionDateFormatted(){return O.C.format(this.transactionDate,"MMM DD, YYYY")}get grossTotalFormatted(){return y.e.formatCurrency(this.total)}get netTotalFormatted(){return y.e.formatCurrency(this.total-this.discount/100*this.total)}get balanceFormatted(){return y.e.formatCurrency(this.balance)}constructor(){super(),this.productTransactions=new Array}}class b{get transactionDateFormatted(){return O.C.format(this.transactionDate,"MMM DD, YYYY")}}class ${constructor(){this.id=0}}class Y{}let K=(()=>{class D{constructor(p,g){this.apollo=p,this.store=g}registerTransaction(p){const g={id:p.id,invoiceNo:p.invoiceNo,discount:p.discount,storeId:p.storeId,status:p.status,transactionDate:p.transactionDate,productTransactionInputs:p.productTransactions.map(o=>({id:o.id,productId:o.productId,quantity:o.quantity,price:o.price,currentQuantity:p.id>0?0:o.currentQuantity}))};return this.apollo.mutate({mutation:B,variables:{transactionInput:g}}).pipe((0,d.U)(o=>{const i=o.data.registerTransaction,e=i.transaction,r=i.errors;if(e)return e;if(r&&r.length>0)throw new Error(r[0].message);return null}))}getTransactionsByDate(p,g){return this.apollo.watchQuery({query:R,variables:{transactionDate:p,status:g}}).valueChanges.pipe((0,d.U)(o=>o.data.transactionsByDate.map(i=>{const e=new x;return e.id=i.id,e.storeId=i.storeId,e.store=i.store,e.hasUnpaidProductTransaction=i.hasUnpaidProductTransaction,e})))}getTransaction(p){return this.apollo.watchQuery({query:w,variables:{transactionId:p}}).valueChanges.pipe((0,d.U)(g=>{const o=g.data.transaction,i=new x;return i.id=o.id,i.invoiceNo=o.invoiceNo,i.discount=o.discount,i.transactionDate=o.transactionDate,i.storeId=o.storeId,i.store=o.store,i.balance=o.balance,i.total=o.total,i.dateCreatedFormatted=o.dateCreatedFormatted,i.hasUnpaidProductTransaction=o.hasUnpaidProductTransaction,i.productTransactions=o.productTransactions.map(e=>{const r=new I.P;return r.id=e.id,r.quantity=e.quantity,r.currentQuantity=e.currentQuantity,r.price=e.price,r.status=e.status,r.productName=e.product.name,r.productId=e.product.id,r.product=new E.x,r.product.id=e.product.id,r.product.code=e.product.code,r.product.name=e.product.name,r.product.price=e.product.price,r}),i}))}getTransactioDates(p){let g=null,o=A.q.ASCENDING,i=null,e=null;return this.store.select(C.g2).pipe((0,m.q)(1)).subscribe(r=>g=r),this.store.select(C.F).pipe((0,m.q)(1)).subscribe(r=>o=r),this.store.select(C.yg).pipe((0,m.q)(1)).subscribe(r=>i=r),this.store.select(C.I4).pipe((0,m.q)(1)).subscribe(r=>e=r),this.apollo.watchQuery({query:t,variables:{cursor:g,sortOrder:o,transactionStatus:p,fromDate:i,toDate:e}}).valueChanges.pipe((0,d.U)(r=>{const a=r.data.transactionDates,c=r.errors,s=a.pageInfo.endCursor,h=a.pageInfo.hasNextPage,S=a.nodes.map(F=>{const N=new b;return N.transactionDate=F.transactionDate,N.numberOfUnPaidTransactions=F.numberOfUnPaidTransactions,N.allTransactionsPaid=F.allTransactionsPaid,N});if(S)return{endCursor:s,hasNextPage:h,transactionDates:S};if(c&&c.length>0)throw new Error(c[0].message);return null}))}getTopProducts(){return this.apollo.watchQuery({query:W}).valueChanges.pipe((0,d.U)(p=>p.data.topProducts.map(o=>{const i=new Y;return i.id=o.id,i.code=o.code,i.name=o.name,i.count=o.count,i})))}getTransactionSales(p="",g=""){return this.apollo.watchQuery({query:M,variables:{fromDate:p,toDate:g}}).valueChanges.pipe((0,T.g)(1e3),(0,d.U)(o=>o.data.transactionSales))}markTransactionAsPaid(p){return this.apollo.mutate({mutation:U,variables:{transactionId:p}}).pipe((0,d.U)(g=>{const o=g.data.markTransactionAsPaid,i=o.transaction,e=o.errors;if(i)return i;if(e&&e.length>0)throw new Error(e[0].message);return null}))}static#t=this.\u0275fac=function(g){return new(g||D)(u.\u0275\u0275inject(l._M),u.\u0275\u0275inject(L.Store))};static#e=this.\u0275prov=u.\u0275\u0275defineInjectable({token:D,factory:D.\u0275fac,providedIn:"root"})}return D})()},4239:(P,_,n)=>{n.r(_),n.d(_,{SalesModule:()=>i});var l=n(6814),d=n(6223),m=n(8034),T=n(8525),f=n(9515),E=n(3680),I=n(2032),O=n(6924),y=n(4190),A=n(6676),C=n.n(A),u=n(3726),L=n(2876),B=n(8897),t=n(5879),R=n(8761),w=n(6610),U=n(7570),W=n(3427),M=n(4170);function x(e,r){if(1&e){const a=t.\u0275\u0275getCurrentView();t.\u0275\u0275elementStart(0,"div")(1,"mat-form-field",12)(2,"mat-label"),t.\u0275\u0275text(3),t.\u0275\u0275pipe(4,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(5,"input",13),t.\u0275\u0275listener("dateChange",function(s){t.\u0275\u0275restoreView(a);const h=t.\u0275\u0275nextContext();return t.\u0275\u0275resetView(h.dateChange(s))}),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(6,"mat-datepicker-toggle",14)(7,"mat-datepicker",null,15),t.\u0275\u0275elementEnd()()}if(2&e){const a=t.\u0275\u0275reference(8);t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(4,3,"SALES_PAGE.FILTER_OPTIONS_PANEL.PICK_DATE"),":"),t.\u0275\u0275advance(2),t.\u0275\u0275property("matDatepicker",a),t.\u0275\u0275advance(1),t.\u0275\u0275property("for",a)}}function b(e,r){if(1&e&&(t.\u0275\u0275elementStart(0,"mat-option",19),t.\u0275\u0275text(1),t.\u0275\u0275elementEnd()),2&e){const a=r.$implicit;t.\u0275\u0275property("value",r.index),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate(a)}}function k(e,r){if(1&e){const a=t.\u0275\u0275getCurrentView();t.\u0275\u0275elementStart(0,"div")(1,"mat-form-field",16)(2,"mat-label"),t.\u0275\u0275text(3),t.\u0275\u0275pipe(4,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(5,"mat-select",17),t.\u0275\u0275listener("selectionChange",function(s){t.\u0275\u0275restoreView(a);const h=t.\u0275\u0275nextContext();return t.\u0275\u0275resetView(h.weekChange(s))}),t.\u0275\u0275template(6,b,2,2,"mat-option",18),t.\u0275\u0275elementEnd()()()}if(2&e){const a=t.\u0275\u0275nextContext();t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(4,2,"SALES_PAGE.FILTER_OPTIONS_PANEL.PICK_WEEK"),":"),t.\u0275\u0275advance(3),t.\u0275\u0275property("ngForOf",a.weekOptions)}}function $(e,r){if(1&e&&(t.\u0275\u0275elementStart(0,"mat-option",19),t.\u0275\u0275text(1),t.\u0275\u0275elementEnd()),2&e){const a=r.$implicit;t.\u0275\u0275property("value",r.index),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate(a)}}function Y(e,r){if(1&e){const a=t.\u0275\u0275getCurrentView();t.\u0275\u0275elementStart(0,"div")(1,"mat-form-field",16)(2,"mat-label"),t.\u0275\u0275text(3),t.\u0275\u0275pipe(4,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(5,"mat-select",20),t.\u0275\u0275listener("selectionChange",function(s){t.\u0275\u0275restoreView(a);const h=t.\u0275\u0275nextContext();return t.\u0275\u0275resetView(h.monthChange(s))}),t.\u0275\u0275template(6,$,2,2,"mat-option",18),t.\u0275\u0275elementEnd()()()}if(2&e){const a=t.\u0275\u0275nextContext();t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(4,2,"SALES_PAGE.FILTER_OPTIONS_PANEL.PICK_MONTH"),":"),t.\u0275\u0275advance(3),t.\u0275\u0275property("ngForOf",a.monthlyOptions)}}function K(e,r){if(1&e&&(t.\u0275\u0275elementStart(0,"span",21),t.\u0275\u0275text(1),t.\u0275\u0275elementEnd()),2&e){const a=t.\u0275\u0275nextContext();t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate(a.sales)}}const D=function(e){return{"sales-date-filter-container__filter-options--active":e}};var v=function(e){return e[e.Daily=1]="Daily",e[e.Weekly=2]="Weekly",e[e.Monthly=3]="Monthly",e}(v||{});const g=[{path:"",component:(()=>{class e extends B.H{constructor(a,c){super(),this.formBuilder=a,this.transactionService=c,this._sales=0,this._currentFilterOption=v.Daily,this._monthOptions=["January","February","March","April","May","June","July","August","September","October","November","December"];const s=(new Date).getFullYear(),h=this.weeksInYear(s);this._weekOptions=Array.from({length:h},(N,G)=>`Week ${G+1}`);const S=this.getWeekNumber(new Date)[1]-1,F=(new Date).getMonth();this._filterForm=this.formBuilder.group({day:[new Date],week:[S],month:[F]})}ngOnInit(){this.getTransactionSales(this._currentFilterOption)}getTransactionSales(a){const c=this.getDateRange(a);this._isLoading=!0,this.transactionService.getTransactionSales(c.fromDate,c.toDate).subscribe(s=>{this._isLoading=!1,this._sales=s.sales})}setFilterOption(a){this._currentFilterOption=a,this.getTransactionSales(a)}dateChange(a){this.getTransactionSales(v.Daily)}weekChange(a){this.getTransactionSales(v.Weekly)}monthChange(a){this.getTransactionSales(v.Monthly)}getDateRange(a){let c,s=null;switch(a){case v.Daily:c=this._filterForm.get("day").value,s=this._filterForm.get("day").value;break;case v.Weekly:const h=this.getDateOfWeek(this._filterForm.get("week").value+1,(new Date).getFullYear());c=h,s=C()(h).add(6,"d");break;case v.Monthly:const S=this._filterForm.get("month").value;c=new Date((new Date).getFullYear(),S,1),s=new Date((new Date).getFullYear(),S+1,0)}return{fromDate:u.C.format(c),toDate:u.C.format(s)}}getWeekNumber(a){(a=new Date(+a)).setHours(0,0,0,0),a.setDate(a.getDate()+4-(a.getDay()||7));let c=new Date(a.getFullYear(),0,1),s=Math.ceil(((a.valueOf()-c.valueOf())/864e5+1)/7);return[a.getFullYear(),s]}weeksInYear(a){var h,s=31;do{const S=new Date(a,11,s--);h=this.getWeekNumber(S)[1]}while(1==h);return h}getDateOfWeek(a,c){return new Date(c,0,1+7*(a-1))}get currentFilterOption(){return this._currentFilterOption}get weekOptions(){return this._weekOptions}get monthlyOptions(){return this._monthOptions}get sales(){return L.e.formatCurrency(this._sales)}get filterForm(){return this._filterForm}get maxDate(){return new Date}static#t=this.\u0275fac=function(c){return new(c||e)(t.\u0275\u0275directiveInject(d.qu),t.\u0275\u0275directiveInject(R.pX))};static#e=this.\u0275cmp=t.\u0275\u0275defineComponent({type:e,selectors:[["app-sales"]],features:[t.\u0275\u0275InheritDefinitionFeature],decls:32,vars:38,consts:[[3,"title","showBackButton"],[3,"busy"],[1,"page-container","slide-in-left-animation"],[1,"page-container__page-divider","scale-in-center-animation"],[1,"page-information-description"],[3,"templateType"],[1,"sales-date-filter-container"],[1,"sales-date-filter-container__filter-options",3,"ngClass","click"],[1,"sales-date-filter-options",3,"formGroup"],[4,"ngIf"],[1,"panel","sales-information-panel"],["class","scale-in-center-animation",4,"ngIf"],["appearance","fill",1,"transaction-date"],["matInput","","formControlName","day",3,"matDatepicker","dateChange"],["matIconSuffix","",3,"for"],["picker",""],["appearance","fill"],["formControlName","week",3,"selectionChange"],[3,"value",4,"ngFor","ngForOf"],[3,"value"],["formControlName","month",3,"selectionChange"],[1,"scale-in-center-animation"]],template:function(c,s){1&c&&(t.\u0275\u0275element(0,"app-tool-bar",0),t.\u0275\u0275pipe(1,"translate"),t.\u0275\u0275elementStart(2,"app-loader-layout",1)(3,"div",2)(4,"div",3)(5,"label"),t.\u0275\u0275text(6),t.\u0275\u0275pipe(7,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(8,"br"),t.\u0275\u0275elementStart(9,"span",4),t.\u0275\u0275text(10),t.\u0275\u0275pipe(11,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275element(12,"app-empty-entities-placeholder",5),t.\u0275\u0275elementStart(13,"div",6)(14,"div",7),t.\u0275\u0275listener("click",function(){return s.setFilterOption(1)}),t.\u0275\u0275text(15),t.\u0275\u0275pipe(16,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(17,"div",7),t.\u0275\u0275listener("click",function(){return s.setFilterOption(2)}),t.\u0275\u0275text(18),t.\u0275\u0275pipe(19,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(20,"div",7),t.\u0275\u0275listener("click",function(){return s.setFilterOption(3)}),t.\u0275\u0275text(21),t.\u0275\u0275pipe(22,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(23,"div",8),t.\u0275\u0275template(24,x,9,5,"div",9),t.\u0275\u0275template(25,k,7,4,"div",9),t.\u0275\u0275template(26,Y,7,4,"div",9),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(27,"div",10)(28,"label"),t.\u0275\u0275text(29),t.\u0275\u0275pipe(30,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275template(31,K,2,1,"span",11),t.\u0275\u0275elementEnd()()()),2&c&&(t.\u0275\u0275property("title",t.\u0275\u0275pipeBind1(1,18,"GENERAL_TEXTS.BEELINA"))("showBackButton",!1),t.\u0275\u0275advance(2),t.\u0275\u0275property("busy",s.isLoading),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(7,20,"SALES_PAGE.TITLE")),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(11,22,"SALES_PAGE.DESCRIPTION")),t.\u0275\u0275advance(2),t.\u0275\u0275property("templateType",s.emptyEntityTemplateEnum.REPORTS),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngClass",t.\u0275\u0275pureFunction1(32,D,1===s.currentFilterOption)),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(16,24,"GENERAL_TEXTS.DAILY")," "),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngClass",t.\u0275\u0275pureFunction1(34,D,2===s.currentFilterOption)),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(19,26,"GENERAL_TEXTS.WEEKLY")," "),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngClass",t.\u0275\u0275pureFunction1(36,D,3===s.currentFilterOption)),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(22,28,"GENERAL_TEXTS.MONTHLY")," "),t.\u0275\u0275advance(2),t.\u0275\u0275property("formGroup",s.filterForm),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",1===s.currentFilterOption),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",2===s.currentFilterOption),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",3===s.currentFilterOption),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(30,30,"SALES_PAGE.SALES_PANEL.LABEL"),":"),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngIf",!s.isLoading))},dependencies:[l.mk,l.sg,l.O5,w.l,U.x,W.o,m.Mq,m.hl,m.nW,I.Nt,M.KE,M.hX,M.R9,T.gD,E.ey,d.Fj,d.JJ,d.JL,d.sg,d.u,f.X$],styles:[".sales-date-filter-container[_ngcontent-%COMP%]{display:flex;justify-content:space-between;gap:10px;margin-bottom:15px}.sales-date-filter-container__filter-options[_ngcontent-%COMP%]{background-color:#b3c3c3;color:#fff;flex:1;text-align:center;padding:10px;border-radius:15px}.sales-date-filter-container__filter-options--active[_ngcontent-%COMP%]{background-color:#d89c2a}.sales-date-filter-options[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%]{width:100%}.sales-information-panel[_ngcontent-%COMP%]{padding:25px;display:flex;justify-content:space-between}.sales-information-panel[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-size:15px}.sales-information-panel[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{font-size:30px;color:#d89c2a}"]})}return e})(),title:"SALES_PAGE.TITLE"}];let o=(()=>{class e{static#t=this.\u0275fac=function(c){return new(c||e)};static#e=this.\u0275mod=t.\u0275\u0275defineNgModule({type:e});static#n=this.\u0275inj=t.\u0275\u0275defineInjector({imports:[y.Bz.forChild(g),y.Bz]})}return e})(),i=(()=>{class e{static#t=this.\u0275fac=function(c){return new(c||e)};static#e=this.\u0275mod=t.\u0275\u0275defineNgModule({type:e});static#n=this.\u0275inj=t.\u0275\u0275defineInjector({imports:[l.ez,O._,m.FA,E.XK,I.c,T.LD,d.UX,o,f.aw.forChild()]})}return e})()},135:(P,_,n)=>{n.d(_,{F:()=>y,I4:()=>C,Nz:()=>m,VO:()=>E,g2:()=>T,yg:()=>A});var l=n(4221);const d=u=>u.transactionDates,m=(0,l.createSelector)(d,u=>u.transactionDates),T=(0,l.createSelector)(d,u=>u.endCursor),E=((0,l.createSelector)(d,u=>u.hasNextPage),(0,l.createSelector)(d,u=>u.isLoading)),y=((0,l.createSelector)(d,u=>u.error),(0,l.createSelector)(d,u=>u.filterKeyword),(0,l.createSelector)(d,u=>u.sortOrder)),A=(0,l.createSelector)(d,u=>u.fromDate),C=(0,l.createSelector)(d,u=>u.toDate)}}]);
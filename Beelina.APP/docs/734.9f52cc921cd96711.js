"use strict";(self.webpackChunkBeelina_APP=self.webpackChunkBeelina_APP||[]).push([[734],{2734:(Q,E,e)=>{e.r(E),e.d(E,{AddProductDetailsModule:()=>b});var C=e(8525),p=e(4630),c=e(9515),i=e(6223),s=e(6814),O=e(617),v=e(2032),A=e(4190),m=e(4221),D=e(7921),S=e(7398),h=e(854),l=e(8002),I=e(62),f=e(2267),L=e(9014),R=e(6842),t=e(5879),P=e(5253),N=e(1438),U=e(2939),F=e(7514),g=e(6610),y=e(3427),B=e(2296),u=e(4170),x=e(3680);function G(o,T){1&o&&(t.\u0275\u0275elementStart(0,"mat-error"),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275elementEnd()),2&o&&(t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(2,1,"ADD_PRODUCT_DETAILS_PAGE.FORM_CONTROL_SECTION.CODE_CONTROL.ALREADY_EXIST_ERROR_MESSAGE")," "))}function M(o,T){if(1&o&&(t.\u0275\u0275elementStart(0,"mat-option",18),t.\u0275\u0275text(1),t.\u0275\u0275elementEnd()),2&o){const n=T.$implicit;t.\u0275\u0275property("value",n.name),t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",n.name," ")}}let _=(()=>{class o{constructor(n,r,a,d,V,X,J,W){this.store=n,this.dialogService=r,this.productService=a,this.formBuilder=d,this.router=V,this.snackBarService=X,this.translateService=J,this.uniqueProductCodeValidator=W,this._productUnitOptions=[],this._productForm=this.formBuilder.group({code:["",[i.kI.required],[this.uniqueProductCodeValidator.validate.bind(this.uniqueProductCodeValidator)]],name:["",i.kI.required],description:[""],stockQuantity:[null,[i.kI.required,i.kI.min(1)]],pricePerUnit:[null,i.kI.required],productUnit:["",i.kI.required]},{updateOn:"blur"}),this.$isLoading=this.store.pipe((0,m.select)(I.Cz))}ngOnInit(){this.store.dispatch(h.h0()),this._productUnitOptionsSubscription=this.store.pipe((0,m.select)(f.WN)).subscribe(n=>{this._productUnitOptions=n}),this._productUnitFilterOptions=this._productForm.get("productUnit").valueChanges.pipe((0,D.O)(""),(0,S.U)(n=>this._filter(n||"")))}ngOnDestroy(){this._productUnitOptionsSubscription.unsubscribe(),this.store.dispatch(l.tf())}saveProduct(){const n=new R.x;n.name=this._productForm.get("name").value,n.code=this._productForm.get("code").value,n.description=this._productForm.get("description").value,n.stockQuantity=this._productForm.get("stockQuantity").value,n.pricePerUnit=this._productForm.get("pricePerUnit").value,n.productUnit.name=this._productForm.get("productUnit").value,this._productForm.markAllAsTouched(),this._productForm.valid&&this.dialogService.openConfirmation(this.translateService.instant("ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.TITLE"),this.translateService.instant("ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.CONFIRM")).subscribe(r=>{r===L.E.YES&&(this.store.dispatch(l.Jk({state:!0})),this.productService.updateProductInformation(n).subscribe({next:()=>{this.snackBarService.open(this.translateService.instant("ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.SUCCESS_MESSAGE"),this.translateService.instant("GENERAL_TEXTS.CLOSE")),this.store.dispatch(l.Jk({state:!1})),this.router.navigate(["/product-catalogue"])},error:()=>{this.snackBarService.open(this.translateService.instant("ADD_PRODUCT_DETAILS_PAGE.SAVE_NEW_PRODUCT_DIALOG.ERROR_MESSAGE"),this.translateService.instant("GENERAL_TEXTS.CLOSE")),this.store.dispatch(l.Jk({state:!1}))}}))})}_filter(n){const r=n?.toLowerCase();return this._productUnitOptions.filter(a=>a.name?.toLowerCase().includes(r))}get productForm(){return this._productForm}get productUnitFilterOptions(){return this._productUnitFilterOptions}static#t=this.\u0275fac=function(r){return new(r||o)(t.\u0275\u0275directiveInject(m.Store),t.\u0275\u0275directiveInject(P.x),t.\u0275\u0275directiveInject(N.M),t.\u0275\u0275directiveInject(i.qu),t.\u0275\u0275directiveInject(A.F0),t.\u0275\u0275directiveInject(U.ux),t.\u0275\u0275directiveInject(c.sK),t.\u0275\u0275directiveInject(F.e))};static#e=this.\u0275cmp=t.\u0275\u0275defineComponent({type:o,selectors:[["app-add-product-details"]],decls:50,vars:33,consts:[[3,"title"],["mat-icon-button","",1,"toolbar-option",3,"click"],[3,"busy"],[1,"page-container"],[1,"panel"],[1,"panel__details-group-panel",3,"formGroup"],[1,"panel__header-section"],[1,"panel__body-section"],["appearance","fill"],["matInput","","type","text","formControlName","code"],[4,"ngIf"],["matInput","","type","text","formControlName","name"],["matInput","","type","text","formControlName","description"],["matInput","","type","number","formControlName","stockQuantity"],["matInput","","type","number","formControlName","pricePerUnit"],["type","text","aria-label","Number","matInput","","formControlName","productUnit",3,"matAutocomplete"],["auto","matAutocomplete"],[3,"value",4,"ngFor","ngForOf"],[3,"value"]],template:function(r,a){if(1&r&&(t.\u0275\u0275elementStart(0,"app-tool-bar",0),t.\u0275\u0275pipe(1,"translate"),t.\u0275\u0275elementStart(2,"button",1),t.\u0275\u0275listener("click",function(){return a.saveProduct()}),t.\u0275\u0275elementStart(3,"mat-icon"),t.\u0275\u0275text(4,"save"),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275elementStart(5,"app-loader-layout",2),t.\u0275\u0275pipe(6,"async"),t.\u0275\u0275elementStart(7,"div",3)(8,"div",4)(9,"div",5)(10,"div",6)(11,"label"),t.\u0275\u0275text(12),t.\u0275\u0275pipe(13,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(14,"div",7)(15,"mat-form-field",8)(16,"mat-label"),t.\u0275\u0275text(17),t.\u0275\u0275pipe(18,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(19,"input",9),t.\u0275\u0275template(20,G,3,3,"mat-error",10),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(21,"mat-form-field",8)(22,"mat-label"),t.\u0275\u0275text(23),t.\u0275\u0275pipe(24,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(25,"input",11),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(26,"mat-form-field",8)(27,"mat-label"),t.\u0275\u0275text(28),t.\u0275\u0275pipe(29,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(30,"input",12),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(31,"mat-form-field",8)(32,"mat-label"),t.\u0275\u0275text(33),t.\u0275\u0275pipe(34,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(35,"input",13),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(36,"mat-form-field",8)(37,"mat-label"),t.\u0275\u0275text(38),t.\u0275\u0275pipe(39,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(40,"input",14),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(41,"mat-form-field",8)(42,"mat-label"),t.\u0275\u0275text(43),t.\u0275\u0275pipe(44,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(45,"input",15),t.\u0275\u0275elementStart(46,"mat-autocomplete",null,16),t.\u0275\u0275template(48,M,2,2,"mat-option",17),t.\u0275\u0275pipe(49,"async"),t.\u0275\u0275elementEnd()()()()()()()),2&r){const d=t.\u0275\u0275reference(47);t.\u0275\u0275property("title",t.\u0275\u0275pipeBind1(1,13,"GENERAL_TEXTS.BEELINA")),t.\u0275\u0275advance(5),t.\u0275\u0275property("busy",t.\u0275\u0275pipeBind1(6,15,a.$isLoading)),t.\u0275\u0275advance(4),t.\u0275\u0275property("formGroup",a.productForm),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(13,17,"ADD_PRODUCT_DETAILS_PAGE.FORM_CONTROL_SECTION.HEADER_TITLE")),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(18,19,"ADD_PRODUCT_DETAILS_PAGE.FORM_CONTROL_SECTION.CODE_CONTROL.LABEL"),":"),t.\u0275\u0275advance(3),t.\u0275\u0275property("ngIf",a.productForm.get("code").hasError("productAlreadyExists")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(24,21,"ADD_PRODUCT_DETAILS_PAGE.FORM_CONTROL_SECTION.NAME_CONTROL.LABEL"),":"),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(29,23,"ADD_PRODUCT_DETAILS_PAGE.FORM_CONTROL_SECTION.DESCRIPTION_CONTROL.LABEL"),":"),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(34,25,"ADD_PRODUCT_DETAILS_PAGE.FORM_CONTROL_SECTION.STOCK_QUANTITY_CONTROL.LABEL"),":"),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(39,27,"ADD_PRODUCT_DETAILS_PAGE.FORM_CONTROL_SECTION.PRICE_PER_UNIT_CONTROL.LABEL"),":"),t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1("",t.\u0275\u0275pipeBind1(44,29,"ADD_PRODUCT_DETAILS_PAGE.FORM_CONTROL_SECTION.UNIT_CONTROL.LABEL"),":"),t.\u0275\u0275advance(2),t.\u0275\u0275property("matAutocomplete",d),t.\u0275\u0275advance(3),t.\u0275\u0275property("ngForOf",t.\u0275\u0275pipeBind1(49,31,a.productUnitFilterOptions))}},dependencies:[s.sg,s.O5,g.l,y.o,B.RK,O.Hw,u.KE,u.hX,u.TO,x.ey,v.Nt,p.XC,p.ZL,i.Fj,i.wV,i.JJ,i.JL,i.sg,i.u,s.Ov,c.X$]})}return o})();var j=e(6924);let b=(()=>{class o{static#t=this.\u0275fac=function(r){return new(r||o)};static#e=this.\u0275mod=t.\u0275\u0275defineNgModule({type:o});static#n=this.\u0275inj=t.\u0275\u0275defineInjector({imports:[s.ez,j._,C.LD,O.Ps,v.c,p.Bb,i.UX,A.Bz.forChild([{path:"",component:_,title:"ADD_PRODUCT_DETAILS_PAGE.TITLE"}]),c.aw.forChild()]})}return o})()}}]);
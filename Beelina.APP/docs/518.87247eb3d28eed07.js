"use strict";(self.webpackChunkBeelina_APP=self.webpackChunkBeelina_APP||[]).push([[518],{5661:(g,v,e)=>{e.d(v,{F:()=>f});var n=e(8539),u=e(7398),y=e(3432);class I extends y.J{constructor(){super(),this.reportControlsRelations=new Array}}var d=e(5879),R=e(9515);const t=n.Ps`
  query ($filterKeyword: String) {
    reports(where: { nameTextIdentifier: { contains: $filterKeyword } }) {
      id
      nameTextIdentifier
      descriptionTextIdentifier
      moduleId
    }
  }
`,i=n.Ps`
  query ($reportId: Int!) {
    reportInformation(reportId: $reportId) {
      typename: __typename
      ... on ReportInformationResult {
        nameTextIdentifier
        descriptionTextIdentifier
        reportControlsRelations {
          id
          reportControlId
          defaultValue
          reportControl {
            id
            name
            labelIdentifier
            reportParameter {
              id
              name
            }
          }
        }
      }
      ... on ReportNotExistsError {
        message
      }
    }
  }
`,T=n.Ps`
  query ($reportId: Int!, $controlValues: [ControlValuesInput!]!) {
    generateReport(reportId: $reportId, controlValues: $controlValues) {
      id
    }
  }
`;let f=(()=>{class a{constructor(m,l){this.apollo=m,this.translateService=l}getAllReports(){return this.apollo.watchQuery({query:t,variables:{filterKeyword:""}}).valueChanges.pipe((0,u.U)(m=>m.data.reports.map(s=>{const c=new I;return c.id=s.id,c.nameTextIdentifier=s.nameTextIdentifier,c.name=this.translateService.instant(`REPORTS_PAGE.REPORTS_INFORMATION.${s.nameTextIdentifier}`),c.description=this.translateService.instant(`REPORTS_PAGE.REPORTS_INFORMATION.${s.descriptionTextIdentifier}`),c.descriptionTextIdentifier=s.descriptionTextIdentifier,c.reportClass=s.reportClass,c.custom=s.custom,c})))}getReportInformation(m){return this.apollo.watchQuery({query:i,variables:{reportId:m}}).valueChanges.pipe((0,u.U)(l=>{const s=l.data.reportInformation;if("ReportInformationResult"===s.typename)return l.data.reportInformation;if("ReportNotExistsError"===s.typename)throw new Error(l.data.reportInformation.message);return null}))}generateReport(m,l){return this.apollo.watchQuery({query:T,variables:{reportId:m,controlValues:l}}).valueChanges.pipe((0,u.U)(s=>!0))}static#t=this.\u0275fac=function(l){return new(l||a)(d.\u0275\u0275inject(n._M),d.\u0275\u0275inject(R.sK))};static#e=this.\u0275prov=d.\u0275\u0275defineInjectable({token:a,factory:a.\u0275fac,providedIn:"root"})}return a})()},9518:(g,v,e)=>{e.r(v),e.d(v,{ReportsModule:()=>C});var n=e(617),u=e(9515),y=e(6223),I=e(6814),d=e(4190),R=e(8897),t=e(5879),i=e(5661),T=e(6610),f=e(7673),a=e(3427);function E(o,x){if(1&o){const r=t.\u0275\u0275getCurrentView();t.\u0275\u0275elementStart(0,"div")(1,"div",8),t.\u0275\u0275listener("click",function(){const P=t.\u0275\u0275restoreView(r).$implicit,O=t.\u0275\u0275nextContext();return t.\u0275\u0275resetView(O.goToReportInformation(P.id))}),t.\u0275\u0275elementStart(2,"div",9)(3,"div",10)(4,"mat-icon"),t.\u0275\u0275text(5,"bar_chart"),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275elementStart(6,"div",11)(7,"label",12),t.\u0275\u0275text(8),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(9,"label"),t.\u0275\u0275text(10),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(11,"div",13)(12,"mat-icon",14),t.\u0275\u0275text(13,"keyboard_arrow_right"),t.\u0275\u0275elementEnd()()()()}if(2&o){const r=x.$implicit;t.\u0275\u0275advance(8),t.\u0275\u0275textInterpolate(r.name),t.\u0275\u0275advance(2),t.\u0275\u0275textInterpolate(r.description)}}const l=[{path:"",component:(()=>{class o extends R.H{constructor(r,p){super(),this.reportService=r,this.router=p}ngOnInit(){this._isLoading=!0,setTimeout(()=>{this.reportService.getAllReports().subscribe(r=>{this._reports=r,this._isLoading=!1})},1200)}goToReportInformation(r){this.router.navigate(["/reports",r])}get reports(){return this._reports}static#t=this.\u0275fac=function(p){return new(p||o)(t.\u0275\u0275directiveInject(i.F),t.\u0275\u0275directiveInject(d.F0))};static#e=this.\u0275cmp=t.\u0275\u0275defineComponent({type:o,selectors:[["app-reports"]],features:[t.\u0275\u0275InheritDefinitionFeature],decls:15,vars:14,consts:[[3,"title","showBackButton"],[3,"busy"],[1,"page-container","slide-in-left-animation"],[1,"page-container__page-divider","scale-in-center-animation"],[1,"page-information-description"],[3,"templateType","count"],[1,"list-container"],[4,"ngFor","ngForOf"],["matRipple","",1,"list-container__item-section",3,"click"],[1,"list-container__icon-section","list-container__icon-section--right-space"],[1,"list-container__icon-section--icon-container"],[1,"list-container__details-section"],[1,"main-label",2,"margin-bottom","8px"],[1,"list-container__options-section"],[1,"option"]],template:function(p,h){1&p&&(t.\u0275\u0275element(0,"app-tool-bar",0),t.\u0275\u0275pipe(1,"translate"),t.\u0275\u0275elementStart(2,"app-loader-layout",1)(3,"div",2)(4,"div",3)(5,"label"),t.\u0275\u0275text(6),t.\u0275\u0275pipe(7,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275element(8,"br"),t.\u0275\u0275elementStart(9,"span",4),t.\u0275\u0275text(10),t.\u0275\u0275pipe(11,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(12,"app-list-container",5)(13,"div",6),t.\u0275\u0275template(14,E,14,2,"div",7),t.\u0275\u0275elementEnd()()()()),2&p&&(t.\u0275\u0275property("title",t.\u0275\u0275pipeBind1(1,8,"GENERAL_TEXTS.BEELINA"))("showBackButton",!1),t.\u0275\u0275advance(2),t.\u0275\u0275property("busy",h.isLoading),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(7,10,"REPORTS_PAGE.TITLE")),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(11,12,"REPORTS_PAGE.DESCRIPTION")),t.\u0275\u0275advance(2),t.\u0275\u0275property("templateType",h.emptyEntityTemplateEnum.REPORTS)("count",null==h.reports?null:h.reports.length),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngForOf",h.reports))},dependencies:[I.sg,T.l,f.X,a.o,n.Hw,u.X$]})}return o})(),title:"REPORTS_PAGE.TITLE"},{path:":id",loadChildren:()=>Promise.all([e.e(278),e.e(847)]).then(e.bind(e,6847)).then(o=>o.ReportDetailsModule)}];let s=(()=>{class o{static#t=this.\u0275fac=function(p){return new(p||o)};static#e=this.\u0275mod=t.\u0275\u0275defineNgModule({type:o});static#n=this.\u0275inj=t.\u0275\u0275defineInjector({imports:[d.Bz.forChild(l),d.Bz]})}return o})();var c=e(6924);let C=(()=>{class o{static#t=this.\u0275fac=function(p){return new(p||o)};static#e=this.\u0275mod=t.\u0275\u0275defineNgModule({type:o});static#n=this.\u0275inj=t.\u0275\u0275defineInjector({imports:[I.ez,c._,n.Ps,s,y.UX,u.aw.forChild()]})}return o})()},7673:(g,v,e)=>{e.d(v,{X:()=>t});var n=e(5879),u=e(6814),y=e(7570);function I(i,T){if(1&i&&(n.\u0275\u0275elementStart(0,"div",3),n.\u0275\u0275element(1,"app-empty-entities-placeholder",4),n.\u0275\u0275elementEnd()),2&i){const f=n.\u0275\u0275nextContext();n.\u0275\u0275advance(1),n.\u0275\u0275property("templateType",f.templateType)}}function d(i,T){1&i&&n.\u0275\u0275projection(0,0,["*ngIf","count > 0"])}const R=["*"];let t=(()=>{class i{constructor(){this.count=0}ngOnInit(){}static#t=this.\u0275fac=function(a){return new(a||i)};static#e=this.\u0275cmp=n.\u0275\u0275defineComponent({type:i,selectors:[["app-list-container"]],inputs:{count:"count",templateType:"templateType"},ngContentSelectors:R,decls:3,vars:2,consts:[[1,"list-container-component"],["class","list-container-component__empty-list-container",4,"ngIf"],[4,"ngIf"],[1,"list-container-component__empty-list-container"],[3,"templateType"]],template:function(a,E){1&a&&(n.\u0275\u0275projectionDef(),n.\u0275\u0275elementStart(0,"div",0),n.\u0275\u0275template(1,I,2,1,"div",1),n.\u0275\u0275template(2,d,1,0,"ng-content",2),n.\u0275\u0275elementEnd()),2&a&&(n.\u0275\u0275advance(1),n.\u0275\u0275property("ngIf",0===E.count),n.\u0275\u0275advance(1),n.\u0275\u0275property("ngIf",E.count>0))},dependencies:[u.O5,y.x],styles:[".list-container-component__empty-list-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;justify-content:space-around;height:70%}"]})}return i})()}}]);
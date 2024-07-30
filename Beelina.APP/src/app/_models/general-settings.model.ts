import { Entity } from "./entity.model";

export class GeneralSettings extends Entity {
  public companyName: string;
  public address: string;
  public ownerName: string;
  public telephone: string;
  public faxTelephone: string;
  public tin: string;
  public invoiceFooterText: string;
  public invoiceFooterText1: string;

  constructor() {
    super();
  }
}

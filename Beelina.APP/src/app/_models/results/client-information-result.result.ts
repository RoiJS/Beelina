import { IClientInformationQueryPayload } from 'src/app/_interfaces/payloads/iclient-information-query.payload';

export class ClientInformationResult implements IClientInformationQueryPayload {
  public typename: string;
  public name: string;
  public dBName: string;
  public dBHashName: string;
}

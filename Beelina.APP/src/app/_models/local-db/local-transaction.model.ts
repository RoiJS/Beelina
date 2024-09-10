import { ILocalEntity } from 'src/app/_interfaces/ilocal-entity.interface';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

export class LocalTransaction implements ILocalEntity {

  public customerUserId: number; // Reference to LocalCustomerUser.id
  public id: number;
  public invoiceNo: string;
  public discount: number;
  public storeId: number;
  public status: TransactionStatusEnum;
  public modeOfPayment: number;
  public paid: boolean;
  public transactionDate: string;
  public dueDate: string;
  public createdById: number;

}

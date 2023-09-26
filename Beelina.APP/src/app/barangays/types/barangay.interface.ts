import { IBaseStateConnection } from 'src/app/_interfaces/states/ibase-connection.state';
import { IBaseState } from 'src/app/_interfaces/states/ibase.state';
import { Barangay } from 'src/app/_models/barangay';

export interface IBarangayState extends IBaseState, IBaseStateConnection {
  barangays: Array<Barangay>;
}

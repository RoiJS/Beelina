// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // FOR TESTING USING EMULATOR
  beelinaAPIEndPoint: 'https://localhost:9153/graphql/',
  bluetoothPrinterServiceUUID: '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  bluetoothPrinterCharacteristicUUID: '49535343-8841-43f4-a8d4-ecbe34729bb3',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

export interface IMapExtractedProductPayload {
  id: number;
  code: string;
  name: string;
  supplierId: number;
  supplierCode: string;
  description: string;
  isTransferable: boolean;
  price: number;
  unit: string;
  quantity: number;
  numberOfUnits: number;
  originalName: string;
  originalPrice: number;
  originalUnit: string;
  originalNumberOfUnits: number;
  originalSupplierId: number;
  originalSupplierCode: string;
}


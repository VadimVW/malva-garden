export type NpApiResponse<T> = {
  success: boolean;
  data: T;
  errors: string[];
  warnings: string[];
  info?: { totalCount?: number };
};

export type NpSettlementAddress = {
  Present: string;
  Warehouses: string;
  MainDescription: string;
  Area: string;
  Region: string;
  SettlementTypeCode: string;
  Ref: string;
  DeliveryCity: string;
};

export type NpSearchSettlementsRow = {
  TotalCount: number;
  Addresses: NpSettlementAddress[];
};

export type NpWarehouse = {
  Ref: string;
  Description: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
  TypeOfWarehouse: string;
  ShortAddress?: string;
};

export type SettlementOption = {
  ref: string;
  deliveryCityRef: string;
  label: string;
  mainDescription: string;
};

export type WarehouseOption = {
  ref: string;
  description: string;
  number: string;
  shortAddress: string;
};

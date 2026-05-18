/** Nova Poshta warehouse type Ref (Address/getWarehouseTypes). */
export const NP_WAREHOUSE_TYPE_BRANCH = "841339c7-591a-42e2-8233-7a0a00f0ed6f";
/** Вантажне відділення (напр. «Відділення №1» у Лозовій). */
export const NP_WAREHOUSE_TYPE_CARGO = "9a68df70-0267-42a8-bb5c-37f427e36ee4";
/** Поштове відділення з обмеженням ваги (пункти до 10 кг). */
export const NP_WAREHOUSE_TYPE_PARCEL_SHOP = "6f8c7162-4b72-4b0a-88e5-906948c6a92f";
/** Поштомат ПриватБанку (застарілий у довіднику). */
export const NP_WAREHOUSE_TYPE_POSTOMAT_PRIVAT = "95dc212d-479c-4ffb-a8ab-8c1b9073d0bc";
/** Поштомат «Нова Пошта» (основний тип у містах). */
export const NP_WAREHOUSE_TYPE_POSTOMAT = "f9316480-5f2d-425d-bc2c-ac7cd29decf0";

/** Типи для режиму «Відділення» на checkout. */
export const NP_BRANCH_WAREHOUSE_TYPES = [
  NP_WAREHOUSE_TYPE_BRANCH,
  NP_WAREHOUSE_TYPE_CARGO,
  NP_WAREHOUSE_TYPE_PARCEL_SHOP,
] as const;

/** Типи для режиму «Поштомат». */
export const NP_POSTOMAT_WAREHOUSE_TYPES = [
  NP_WAREHOUSE_TYPE_POSTOMAT,
  NP_WAREHOUSE_TYPE_POSTOMAT_PRIVAT,
] as const;

/** Oblast / regional centers shown when city search is empty. */
export const NP_REGIONAL_CENTER_NAMES = [
  "Київ",
  "Харків",
  "Одеса",
  "Дніпро",
  "Львів",
  "Запоріжжя",
  "Кривий Ріг",
  "Миколаїв",
  "Вінниця",
  "Чернігів",
  "Полтава",
  "Черкаси",
  "Житомир",
  "Суми",
  "Рівне",
  "Тернопіль",
  "Луцьк",
  "Ужгород",
  "Івано-Франківськ",
  "Хмельницький",
  "Чернівці",
  "Кропивницький",
] as const;

export const NP_WAREHOUSES_PAGE_SIZE = 50;

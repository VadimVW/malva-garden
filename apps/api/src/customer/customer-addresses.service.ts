import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerAddressDto } from "./dto/create-customer-address.dto";
import { UpdateCustomerAddressDto } from "./dto/update-customer-address.dto";
import { normalizePhoneUa } from "./phone.util";

@Injectable()
export class CustomerAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapAddress(a: {
    id: string;
    label: string | null;
    recipientName: string | null;
    phone: string | null;
    deliveryMethod: string | null;
    deliveryCity: string;
    deliveryAddress: string;
    novaPoshtaCityRef: string | null;
    novaPoshtaWarehouseRef: string | null;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: a.id,
      label: a.label,
      recipientName: a.recipientName,
      phone: a.phone,
      deliveryMethod: a.deliveryMethod,
      deliveryCity: a.deliveryCity,
      deliveryAddress: a.deliveryAddress,
      novaPoshtaCityRef: a.novaPoshtaCityRef,
      novaPoshtaWarehouseRef: a.novaPoshtaWarehouseRef,
      isDefault: a.isDefault,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  async list(customerId: string) {
    const items = await this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });
    return { items: items.map((a) => this.mapAddress(a)) };
  }

  async create(customerId: string, dto: CreateCustomerAddressDto) {
    const isDefault = dto.isDefault ?? false;
    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }
      const count = await tx.customerAddress.count({ where: { customerId } });
      const created = await tx.customerAddress.create({
        data: {
          customerId,
          label: dto.label?.trim() || null,
          recipientName: dto.recipientName?.trim() || null,
          phone: normalizePhoneUa(dto.phone),
          deliveryMethod: dto.deliveryMethod ?? "nova_poshta",
          deliveryCity: dto.deliveryCity.trim(),
          deliveryAddress: dto.deliveryAddress.trim(),
          novaPoshtaCityRef: dto.novaPoshtaCityRef ?? null,
          novaPoshtaWarehouseRef: dto.novaPoshtaWarehouseRef ?? null,
          isDefault: isDefault || count === 0,
        },
      });
      return this.mapAddress(created);
    });
  }

  async update(
    customerId: string,
    addressId: string,
    dto: UpdateCustomerAddressDto,
  ) {
    const existing = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!existing) throw new NotFoundException("Адресу не знайдено");

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault === true) {
        await tx.customerAddress.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }
      const updated = await tx.customerAddress.update({
        where: { id: addressId },
        data: {
          label: dto.label?.trim(),
          recipientName: dto.recipientName?.trim(),
          phone:
            dto.phone !== undefined ? normalizePhoneUa(dto.phone) : undefined,
          deliveryMethod: dto.deliveryMethod,
          deliveryCity: dto.deliveryCity?.trim(),
          deliveryAddress: dto.deliveryAddress?.trim(),
          novaPoshtaCityRef: dto.novaPoshtaCityRef,
          novaPoshtaWarehouseRef: dto.novaPoshtaWarehouseRef,
          isDefault: dto.isDefault,
        },
      });
      return this.mapAddress(updated);
    });
  }

  async remove(customerId: string, addressId: string) {
    const existing = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!existing) throw new NotFoundException("Адресу не знайдено");
    await this.prisma.customerAddress.delete({ where: { id: addressId } });
    return { ok: true };
  }
}

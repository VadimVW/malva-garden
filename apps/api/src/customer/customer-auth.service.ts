import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import type { CustomerJwtPayload } from "./customer.types";
import { CustomerLoginDto } from "./dto/customer-login.dto";
import { CustomerRegisterDto } from "./dto/customer-register.dto";
import { UpdateCustomerProfileDto } from "./dto/update-customer-profile.dto";
import { normalizePhoneUa } from "./phone.util";

const VERIFY_TTL_HOURS = 48;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  private async signToken(customer: { id: string; email: string }) {
    const payload: CustomerJwtPayload = {
      sub: customer.id,
      email: customer.email,
      role: "customer",
    };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }

  private verificationUrl(token: string) {
    const origin = (this.config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000")
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");
    return `${origin}/account/verify-email?token=${encodeURIComponent(token)}`;
  }

  private async issueEmailVerification(customerId: string) {
    const token = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
    const expires = new Date();
    expires.setHours(expires.getHours() + VERIFY_TTL_HOURS);
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        emailVerifyToken: token,
        emailVerifyExpiresAt: expires,
      },
    });
    return token;
  }

  private shouldExposeDevVerificationLink(): boolean {
    return this.config.get<string>("EMAIL_VERIFICATION_DEV") === "true";
  }

  private async deliverVerificationEmail(email: string, verifyToken: string) {
    const verificationUrl = this.verificationUrl(verifyToken);
    const mailResult = await this.mail.sendCustomerVerificationEmail(
      email,
      verificationUrl,
    );
    const exposeDevLink =
      this.shouldExposeDevVerificationLink() && !mailResult.sent;

    return {
      verificationUrl: exposeDevLink ? verificationUrl : undefined,
      emailSent: mailResult.sent,
    };
  }

  async register(dto: CustomerRegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.customer.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Користувач з таким email вже існує");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const phone = normalizePhoneUa(dto.phone);

    const customer = await this.prisma.customer.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName?.trim() || null,
        phone,
        privacyAcceptedAt: new Date(),
      },
    });

    const verifyToken = await this.issueEmailVerification(customer.id);
    const { verificationUrl, emailSent } = await this.deliverVerificationEmail(
      email,
      verifyToken,
    );

    const { access_token } = await this.signToken(customer);

    return {
      access_token,
      customer: this.serializeCustomer(customer),
      ...(verificationUrl ? { verificationUrl } : {}),
      message: emailSent
        ? "На email надіслано посилання для підтвердження. Після підтвердження з’являться попередні замовлення за цим email і телефоном."
        : "Акаунт створено. Підтвердіть email (лист у поштовій скриньці) або скористайтеся посиланням нижче, якщо воно показане.",
    };
  }

  async login(dto: CustomerLoginDto) {
    const email = dto.email.trim().toLowerCase();
    const customer = await this.prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      throw new UnauthorizedException("Невірний email або пароль");
    }
    const ok = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Невірний email або пароль");
    }
    return {
      ...(await this.signToken(customer)),
      customer: this.serializeCustomer(customer),
    };
  }

  async verifyEmail(token: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiresAt: { gt: new Date() },
      },
    });
    if (!customer) {
      throw new BadRequestException("Посилання недійсне або прострочене");
    }

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerifyToken: null,
        emailVerifyExpiresAt: null,
      },
    });

    return {
      verified: true,
      customer: this.serializeCustomer(updated),
    };
  }

  async resendVerification(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new UnauthorizedException();
    if (customer.emailVerifiedAt) {
      return { message: "Email вже підтверджено" };
    }

    const verifyToken = await this.issueEmailVerification(customer.id);
    const { verificationUrl, emailSent } = await this.deliverVerificationEmail(
      customer.email,
      verifyToken,
    );

    return {
      message: emailSent
        ? "Лист із посиланням для підтвердження надіслано на ваш email"
        : "Посилання для підтвердження оновлено",
      ...(verificationUrl ? { verificationUrl } : {}),
    };
  }

  async getMe(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new UnauthorizedException();
    return this.serializeCustomer(customer);
  }

  async updateProfile(customerId: string, dto: UpdateCustomerProfileDto) {
    const customer = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        fullName: dto.fullName?.trim(),
        phone: dto.phone !== undefined ? normalizePhoneUa(dto.phone) : undefined,
      },
    });
    return this.serializeCustomer(customer);
  }

  private serializeCustomer(customer: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    emailVerifiedAt: Date | null;
    privacyAcceptedAt: Date;
    createdAt: Date;
  }) {
    return {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
      emailVerified: Boolean(customer.emailVerifiedAt),
      emailVerifiedAt: customer.emailVerifiedAt,
      privacyAcceptedAt: customer.privacyAcceptedAt,
      createdAt: customer.createdAt,
    };
  }
}

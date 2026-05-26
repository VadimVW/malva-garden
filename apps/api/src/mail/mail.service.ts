import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";

export type SendMailResult =
  | { sent: true }
  | { sent: false; reason: "disabled" | "failed"; error?: string };

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    if (!this.isEnabled()) {
      this.logger.log("SMTP disabled (SMTP_ENABLED != true)");
      return;
    }
    const ok = await this.verifyConnection();
    if (ok) {
      this.logger.log("SMTP connection verified");
    } else {
      this.logger.warn(
        "SMTP enabled but connection verify failed — check SMTP_HOST/USER/PASS",
      );
    }
  }

  isEnabled(): boolean {
    return this.config.get<string>("SMTP_ENABLED") === "true";
  }

  private getTransporter(): Transporter | null {
    if (!this.isEnabled()) return null;
    if (this.transporter) return this.transporter;

    const host = this.config.get<string>("SMTP_HOST");
    const port = Number(this.config.get<string>("SMTP_PORT") ?? "587");
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");
    const secure = this.config.get<string>("SMTP_SECURE") === "true";

    if (!host?.trim()) {
      this.logger.warn("SMTP_ENABLED=true but SMTP_HOST is empty");
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: host.trim(),
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transporter;
  }

  private fromAddress(): string {
    const from = this.config.get<string>("MAIL_FROM");
    if (from?.trim()) return from.trim();
    const site = this.config.get<string>("MAIL_FROM_NAME") ?? "Malva Garden";
    const email =
      this.config.get<string>("MAIL_FROM_EMAIL") ?? "noreply@malvagarden.local";
    return `"${site}" <${email}>`;
  }

  async sendCustomerVerificationEmail(
    to: string,
    verificationUrl: string,
  ): Promise<SendMailResult> {
    const transport = this.getTransporter();
    if (!transport) {
      return { sent: false, reason: "disabled" };
    }

    const subject = "Підтвердження email — Malva Garden";
    const text = [
      "Вітаємо в Malva Garden!",
      "",
      "Підтвердіть email, щоб бачити попередні замовлення в особистому кабінеті:",
      verificationUrl,
      "",
      "Посилання дійсне 48 годин.",
      "",
      "Якщо ви не реєструвалися на сайті — проігноруйте цей лист.",
    ].join("\n");

    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#222;max-width:480px">
        <h1 style="font-size:20px;color:#5C97A8">Malva Garden</h1>
        <p>Вітаємо! Підтвердіть email, щоб у кабінеті з’явилися ваші замовлення.</p>
        <p style="margin:24px 0">
          <a href="${verificationUrl}" style="display:inline-block;background:#2f6f4e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Підтвердити email
          </a>
        </p>
        <p style="font-size:13px;color:#666">Або скопіюйте посилання:<br><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p style="font-size:12px;color:#999">Посилання дійсне 48 годин.</p>
      </div>
    `.trim();

    try {
      await transport.sendMail({
        from: this.fromAddress(),
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Verification email sent to ${to}`);
      return { sent: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`SMTP send failed for ${to}: ${message}`);
      return { sent: false, reason: "failed", error: message };
    }
  }

  /** Перевірка з’єднання (опційно для health/debug). */
  async verifyConnection(): Promise<boolean> {
    const transport = this.getTransporter();
    if (!transport) return false;
    try {
      await transport.verify();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`SMTP connection verify failed: ${message}`);
      return false;
    }
  }
}

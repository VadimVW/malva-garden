import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Не кидає 401, якщо токен відсутній або невалідний. */
@Injectable()
export class OptionalJwtCustomerAuthGuard extends AuthGuard("jwt-customer") {
  handleRequest<TUser>(err: Error | null, user: TUser): TUser | null {
    if (err || !user) return null;
    return user;
  }
}

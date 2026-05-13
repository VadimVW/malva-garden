import { IsString, MaxLength } from "class-validator";

export class ManagerCommentDto {
  @IsString()
  @MaxLength(4000)
  managerComment!: string;
}

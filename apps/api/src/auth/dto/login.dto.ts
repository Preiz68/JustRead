import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
export class LoginDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

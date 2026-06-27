import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsString()
  email!: string;

  @IsString()
  @Length(3, 30)
  username!: string;

  @IsString()
  @Length(8, 128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}

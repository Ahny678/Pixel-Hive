import { IsArray, IsEmail } from 'class-validator';

export class MergeImagesDto {
  @IsArray()
  images: string[]; // URLs or base64

  @IsEmail()
  email: string;
}

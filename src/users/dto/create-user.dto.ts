import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'test@example.com',
  })
  email: string;

  @ApiProperty({
    example: 'TesT123!',
  })
  password: string;
}

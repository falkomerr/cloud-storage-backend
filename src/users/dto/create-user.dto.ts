import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'test@example.com',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    example: 'TesT123!',
  })
  password: string;
}

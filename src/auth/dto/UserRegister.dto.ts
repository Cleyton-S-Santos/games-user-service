import { ApiProperty } from "@nestjs/swagger";

export class UserRegisterDTO {
    @ApiProperty({
        name: "username"
    })
    username: string;
    @ApiProperty({
        name: "password"
    })
    password: string;
    @ApiProperty({
        name: "email"
    })
    email: string;
}
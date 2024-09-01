import { ApiProperty } from "@nestjs/swagger";

export class UserLoginDTO {
    @ApiProperty({
        name: "password"
    })
    password: string;
    @ApiProperty({
        name: "email"
    })
    email: string;
}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('TB_USERS')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'user_name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'user_email', type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({ name: 'user_password_hash', type: 'varchar', length: 100, nullable: false })
  passwordHash: string;

  @Column({ name: 'user_verified_account', type: 'boolean', default: false })
  verifiedAccount: boolean;
}

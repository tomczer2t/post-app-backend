import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AbtractEntity } from '../../../common/entities';
import { PostEntity } from '../../posts/entities';
import { UserRole, UserStatus } from '../../../types';

@Entity()
export class UserEntity extends AbtractEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true, default: null })
  newEmail: string;

  @Column({ unique: true, length: 25 })
  username: string;

  @Column()
  password: string;

  @Column({ default: null, nullable: true })
  avatarURL: string;

  @Column({
    unique: true,
    default: null,
    nullable: true,
  })
  refreshToken: string;

  @Column({ default: UserStatus.PENDING, width: 1 })
  status: UserStatus;

  @Column({ default: UserRole.USER })
  role: UserRole;

  @Column({ unique: true, nullable: true })
  verificationCode: string;

  @OneToMany((type) => PostEntity, (entity) => entity.user)
  posts: PostEntity[];

  @ManyToMany((type) => UserEntity)
  @JoinTable()
  favouriteAuthors: UserEntity[];
}

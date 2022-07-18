import { AbtractEntity } from '../../../common/entities';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/entities';

@Entity()
export class PostEntity extends AbtractEntity {
  @Column({ unique: true, length: 150 })
  title: string;

  @Column({ default: null, nullable: true })
  photoURL: string;

  @Column({ length: 250 })
  headline: string;

  @Column({ type: 'longtext' })
  content: string;

  @ManyToOne((type) => UserEntity, (entity) => entity.posts)
  user: UserEntity;
}

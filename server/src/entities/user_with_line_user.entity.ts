import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'user_with_line_user',
  expression: `
    SELECT u.id AS id, u.name AS name,u.username, u."is_confirmed",u."is_blocked", u."is_admin", u."updated_at", u."created_at",
    lu.id AS "lineId",lu."name" AS "lineName"
    FROM "users" AS u LEFT JOIN line_users AS lu ON lu."user_id" = u.id
    `,
  dependsOn: ['user', 'line_user'],
})
export class UserWithLineUser {
  @ViewColumn()
  id: number;

  @ViewColumn()
  name: string | null = null;

  @ViewColumn()
  username: string;

  @ViewColumn({ name: 'is_confirmed' })
  isConfirmed: boolean;

  @ViewColumn({ name: 'is_blocked' })
  isBlocked: boolean;

  @ViewColumn({ name: 'is_admin' })
  isAdmin: boolean;

  @ViewColumn({ name: 'created_at' })
  readonly createdAt!: Date;

  @ViewColumn({ name: 'updated_at' })
  readonly updatedAt!: Date;

  @ViewColumn()
  lineId: string | null;

  @ViewColumn()
  lineName!: string | null;
}

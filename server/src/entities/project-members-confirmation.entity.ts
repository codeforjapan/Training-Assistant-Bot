import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'project_members_confirmation',
  expression: `
    SELECT project_members.project_id,
    project_members.profile ->> 'group'::text AS "group",
    count(*) AS total,
    count(
        CASE
            WHEN (project_members.profile ->> 'confirmed'::text) = 'true'::text THEN 1
            ELSE NULL::integer
        END) AS confirmed
    FROM project_members
    WHERE (project_members.profile ->> 'group'::text) IS NOT NULL
    GROUP BY project_members.project_id, (project_members.profile ->> 'group'::text);
    `,
  dependsOn: ['project_members'],
})
export class ProjectMembersConfirmation {
  @ViewColumn({ name: 'project_id' })
  projectId: number;

  @ViewColumn()
  group: string;

  @ViewColumn({
    transformer: { to: (val) => val, from: (val: any) => Number(val) || 0 },
  })
  total: number;

  @ViewColumn({
    transformer: { to: (val) => val, from: (val: any) => Number(val) || 0 },
  })
  confirmed: number;
}

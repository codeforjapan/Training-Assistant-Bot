import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'project_members_gender',
  expression: `
    SELECT project_members.project_id,
    count(
        CASE
            WHEN (project_members.profile ->> 'gender'::text) = 'woman'::text THEN 1
            ELSE NULL::integer
        END) AS woman,
    count(
        CASE
            WHEN (project_members.profile ->> 'gender'::text) = 'man'::text THEN 1
            ELSE NULL::integer
        END) AS man
    FROM project_members
    GROUP BY project_members.project_id;
    `,
  dependsOn: ['project_members'],
})
export class ProjectMembersGender {
  @ViewColumn({ name: 'project_id' })
  projectId: number;

  @ViewColumn({
    transformer: { to: (val) => val, from: (val: any) => Number(val) || 0 },
  })
  woman: number;

  @ViewColumn({
    transformer: { to: (val) => val, from: (val: any) => Number(val) || 0 },
  })
  man: number;
}

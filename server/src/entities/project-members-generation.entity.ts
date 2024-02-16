import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'project_members_generation',
  expression: `
    SELECT project_members.project_id,
    count(
        CASE
            WHEN (project_members.profile ->> 'generation'::text) = 'u30'::text THEN 1
            ELSE NULL::integer
        END) AS u30,
    count(
        CASE
            WHEN (project_members.profile ->> 'generation'::text) = 'u50'::text THEN 1
            ELSE NULL::integer
        END) AS u50,
    count(
        CASE
            WHEN (project_members.profile ->> 'generation'::text) = 'u70'::text THEN 1
            ELSE NULL::integer
        END) AS u70,
    count(
        CASE
            WHEN (project_members.profile ->> 'generation'::text) = 'o70'::text THEN 1
            ELSE NULL::integer
        END) AS o70
    FROM project_members
    GROUP BY project_members.project_id;
    `,
  dependsOn: ['project_members'],
})
export class ProjectMembersGeneration {
  @ViewColumn({ name: 'project_id' })
  projectId: number;

  @ViewColumn({
    transformer: { to: (val) => val, from: (val: any) => Number(val) || 0 },
  })
  u30: number;

  @ViewColumn({
    transformer: { to: (val) => val, from: (val: any) => Number(val) || 0 },
  })
  u50: number;

  @ViewColumn({
    transformer: { to: (val) => val, from: (val: any) => Number(val) || 0 },
  })
  u70: number;

  @ViewColumn({
    transformer: { to: (val) => val, from: (val: any) => Number(val) || 0 },
  })
  o70: number;
}

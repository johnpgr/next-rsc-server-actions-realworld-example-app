select
    "article"."title",
    "article"."description",
    "article"."body",
    "article"."slug",
    "article"."id",
    "article"."updated_at",
    "user"."name",
    "user"."bio",
    "user"."image",
    GROUP_CONCAT("tag"."name"),
    COALESCE(f.favoritesCount, 0),
    CASE
        WHEN "favorite"."article_id" IS NOT NULL THEN 1
        ELSE 0
    END
from
    "article"
    inner join "user" on "article"."author_id" = "user"."id"
    left join "tag" on "article"."id" = "tag"."article_id"
    left join (
        select
            "article_id",
            COUNT(*) as favoritesCount
        from
            "favorite"
    ) "f" on "article"."id" = "f"."article_id"
    left join "favorite" on "article"."id" = "favorite"."article_id"
    and "favorite"."user_id" = '01H1C4M7R092TTVHFTA5MFADY5'
where
    null is null
    or "user"."name" = null
    and null is null
    or exists
SELECT
    1
FROM
    "favorite"
    JOIN "user" ON "favorite"."user_id" = "user"."id"
WHERE
    "article"."id" = "favorite"."article_id"
    AND "user"."name" = null
    and null is null
    or "tag"."name" = null
    and 'global' = 'global'
    or 'global' = 'user'
    and exists
SELECT
    1
FROM
    "follow"
WHERE
    "follow"."follower_id" = '01H1C4M7R092TTVHFTA5MFADY5'
    AND "follow"."following_id" = "article"."author_id"
group by
    "article"."title",
    "article"."description",
    "article"."body",
    "article"."slug",
    "article"."updated_at",
    "user"."name",
    "user"."bio",
    "user"."image"
order by
    "article"."id" desc
limit
    20;
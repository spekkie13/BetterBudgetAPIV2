-- 1) Splits-aware lines (include txn_id for easy joins)
create or replace view v_effective_lines as
select
    t.id as txn_id,
    t.team_id,
    coalesce(s.category_id, t.category_id) as category_id,
    t.posted_at,
    coalesce(s.amount_cents, t.amount_cents) as amount_cents,
    t.is_transfer
from txn t
         left join txn_split s on s.txn_id = t.id
where t.deleted_at is null;

-- 2) Per-budget, per-month progress
create or replace view v_budget_progress as
with month_bounds as (
  select
    b.team_id,
    b.category_id,
    b.period_month::date as month_start,
    (b.period_month::date + interval '1 month') as month_end,
    b.amount_cents as budget_cents,
    b.rollover
  from budget b
)
select
    mb.team_id,
    mb.category_id,
    mb.month_start as period_month,
    mb.budget_cents,
    coalesce(
            -sum(case
                     when el.amount_cents < 0 and el.is_transfer = false then el.amount_cents
                     else 0
                end), 0
    ) as spent_cents,
    greatest(
            mb.budget_cents - coalesce(
                    -sum(case
                             when el.amount_cents < 0 and el.is_transfer = false then el.amount_cents
                             else 0
                        end), 0
                              ),
            0
    ) as remaining_cents,
    case
        when mb.budget_cents = 0 then 0
        else round(
                100.0 * coalesce(
                        -sum(case
                                 when el.amount_cents < 0 and el.is_transfer = false then el.amount_cents
                                 else 0
                            end), 0
                        ) / mb.budget_cents, 2)
        end as pct_spent
from month_bounds mb
         left join v_effective_lines el
                   on el.team_id = mb.team_id
                       and el.category_id = mb.category_id
                       and el.posted_at >= mb.month_start
                       and el.posted_at <  mb.month_end
group by mb.team_id, mb.category_id, mb.month_start, mb.budget_cents, mb.rollover;

-- Helpful indexes (safe if they already exist)
create index if not exists ix_txn_posted on txn(team_id, posted_at);
create index if not exists ix_txn_cat on txn(team_id, category_id);
create index if not exists ix_budget_team_month on budget(team_id, period_month);

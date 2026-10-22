-- The $49/month managed plan. care_plan is true while the plan is active; plan_subscription is its Stripe subscription
-- (on the InstateMe account), which the operator checks daily (tools/OPERATOR.md "Managed plan").
alter table public.projects add column if not exists plan_subscription text;

import {pgEnum} from "drizzle-orm/pg-core";

export const categoryType = pgEnum('category_type', ['expense','income','transfer']);
export const currencyCode = pgEnum('currency_code', ['USD','EUR','GBP','JPY','CAD','AUD','NZD']);
export const periodStart = pgEnum('period_start', ['calendar_month', 'anchored_month'])
export const periodStatusEnum = pgEnum('period_status', ['open', 'closing', 'closed']);
export const closingStatusEnum = pgEnum('closing_status', ['started', 'succeeded', 'failed']);

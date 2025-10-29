import { TeamScopedServiceBase } from "@/adapters/services/factory/teamScopedServiceBase";
import { RecurringRulesInsert, RecurringRulesPatch, RecurringRulesRow } from "@/db/types/recurringRulesTypes";
import { makeRecurringRulesRepo } from "@/adapters/repo/recurringRulesRepo";

export class RecurringRulesService extends TeamScopedServiceBase<RecurringRulesRow, number, number, RecurringRulesInsert, RecurringRulesPatch> {
    constructor() {
        super(makeRecurringRulesRepo())
    }
}

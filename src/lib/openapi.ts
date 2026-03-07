// Shared helpers
function wrap(dataSchema: object) {
    return {
        type: 'object',
        properties: {
            data: dataSchema,
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'OK' },
            success: { type: 'boolean', example: true },
            error: { type: 'string' },
        },
    };
}

function ok(dataSchema: object, description = 'Success') {
    return { description, content: { 'application/json': { schema: wrap(dataSchema) } } };
}

function err(description: string) {
    return {
        description,
        content: {
            'application/json': {
                schema: wrap({ type: 'null', nullable: true }),
            },
        },
    };
}

function strParam(name: string, loc: 'path' | 'query', description: string, required = true) {
    return { name, in: loc, required, description, schema: { type: 'string' } };
}

function intParam(name: string, loc: 'path' | 'query', description: string, required = true) {
    return { name, in: loc, required, description, schema: { type: 'integer' } };
}

function body(ref: string) {
    return { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } } };
}

function ref(name: string) {
    return { $ref: `#/components/schemas/${name}` };
}

const bearer = [{ BearerAuth: [] }];

const errs = {
    400: err('Bad Request'),
    401: err('Unauthorized – missing or invalid Bearer token'),
    403: err('Forbidden'),
    404: err('Not Found'),
};

// ── Schemas ───────────────────────────────────────────────────────────────────

const schemas: Record<string, object> = {
    User: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            token: { type: 'string', example: 'supabase-uid-abc' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            username: { type: 'string', example: 'alice' },
            name: { type: 'string', example: 'Alice Smith' },
            createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'token', 'email', 'username', 'name', 'createdAt'],
    },

    UserWithTeam: {
        type: 'object',
        properties: {
            user: ref('User'),
            team: ref('Team'),
        },
        required: ['user', 'team'],
    },

    UserInput: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            name: { type: 'string', example: 'Alice Smith' },
            supabaseUid: { type: 'string', example: 'supabase-uid-abc' },
            username: { type: 'string', example: 'alice' },
            createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'name', 'supabaseUid', 'username', 'createdAt'],
    },

    Team: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'My Household' },
            createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'createdAt'],
    },

    TeamInput: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'My Household' },
            createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['name'],
    },

    Account: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            teamId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Main Checking' },
            type: { type: 'string', example: 'bank' },
            currency: { type: 'string', enum: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD'], example: 'EUR' },
            isArchived: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'teamId', 'name', 'type', 'currency', 'isArchived'],
    },

    AccountInput: {
        type: 'object',
        properties: {
            name: { type: 'string', example: 'Main Checking' },
            type: { type: 'string', example: 'bank' },
            currency: { type: 'string', enum: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD'], example: 'EUR' },
            isArchived: { type: 'boolean', example: false },
        },
        required: ['name', 'type', 'currency'],
    },

    Budget: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            teamId: { type: 'integer', example: 1 },
            categoryId: { type: 'integer', example: 3 },
            periodMonth: { type: 'string', example: '2026-03-01', description: 'Stored as YYYY-MM-01' },
            amountCents: { type: 'integer', example: 50000 },
            rollover: { type: 'boolean', example: false },
        },
        required: ['id', 'teamId', 'categoryId', 'periodMonth', 'amountCents', 'rollover'],
    },

    BudgetInput: {
        type: 'object',
        properties: {
            categoryId: { type: 'integer', example: 3 },
            periodMonth: { type: 'string', example: '2026-03', description: 'YYYY-MM or YYYY-MM-DD' },
            amountCents: { type: 'integer', example: 50000 },
            rollover: { type: 'boolean', example: false },
        },
        required: ['categoryId', 'periodMonth', 'amountCents'],
    },

    BudgetUpdateInput: {
        type: 'object',
        properties: {
            amountCents: { type: 'integer', example: 60000 },
            rollover: { type: 'boolean', example: true },
        },
        required: ['amountCents'],
    },

    Transaction: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            teamId: { type: 'integer', example: 1 },
            accountId: { type: 'integer', example: 2 },
            amountCents: { type: 'integer', example: -4999, description: 'Negative = expense, positive = income' },
            currency: { type: 'string', enum: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD'], example: 'EUR' },
            postedAt: { type: 'string', format: 'date-time' },
            payee: { type: 'string', nullable: true, example: 'Supermarket' },
            memo: { type: 'string', nullable: true, example: 'Weekly groceries' },
            categoryId: { type: 'integer', nullable: true, example: 3 },
            isTransfer: { type: 'boolean', example: false },
            transferGroupId: { type: 'integer', nullable: true },
            createdBy: { type: 'integer', nullable: true, example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
        },
        required: ['id', 'teamId', 'accountId', 'amountCents', 'currency', 'postedAt', 'isTransfer', 'createdAt', 'updatedAt'],
    },

    TransactionInput: {
        type: 'object',
        properties: {
            accountId: { type: 'integer', example: 2 },
            amountCents: { type: 'integer', example: -4999 },
            currency: { type: 'string', enum: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD'], example: 'EUR' },
            postedAt: { type: 'string', format: 'date-time' },
            memo: { type: 'string', nullable: true, example: 'Weekly groceries' },
            categoryId: { type: 'integer', nullable: true, example: 3 },
            createdBy: { type: 'integer', nullable: true, example: 1 },
            transactionType: { type: 'string', enum: ['income', 'expense', 'transfer'], example: 'expense' },
            fromAccountId: { type: 'integer', nullable: true, description: 'Required when transactionType is transfer' },
            toAccountId: { type: 'integer', nullable: true, description: 'Required when transactionType is transfer' },
        },
        required: ['accountId', 'amountCents', 'currency', 'postedAt', 'transactionType'],
    },

    Category: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            teamId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Groceries' },
            type: { type: 'string', enum: ['income', 'expense', 'transfer'], example: 'expense' },
            color: { type: 'string', example: '#FF5733' },
            icon: { type: 'string', example: 'cart' },
            parentId: { type: 'integer', nullable: true, example: null },
        },
        required: ['id', 'teamId', 'name', 'type'],
    },

    CategoryInput: {
        type: 'object',
        properties: {
            name: { type: 'string', example: 'Groceries' },
            type: { type: 'string', enum: ['income', 'expense', 'transfer'], example: 'expense' },
            color: { type: 'string', example: '#FF5733' },
            icon: { type: 'string', example: 'cart' },
            parentId: { type: 'integer', nullable: true, example: null },
        },
        required: ['name', 'type'],
    },
};

// ── Paths ─────────────────────────────────────────────────────────────────────

const paths: Record<string, object> = {
    '/api/users': {
        get: {
            tags: ['Users'],
            summary: 'Get current authenticated user with team',
            security: bearer,
            responses: {
                200: ok(ref('UserWithTeam')),
                401: errs[401],
            },
        },
        post: {
            tags: ['Users'],
            summary: 'Create a new user',
            requestBody: body('UserInput'),
            responses: {
                200: ok(ref('User')),
                400: errs[400],
            },
        },
    },

    '/api/users/{id}': {
        get: {
            tags: ['Users'],
            summary: 'Get authenticated user (id ignored, derived from token)',
            security: bearer,
            parameters: [strParam('id', 'path', 'User ID (placeholder)')],
            responses: {
                200: ok(ref('User')),
                401: errs[401],
            },
        },
        put: {
            tags: ['Users'],
            summary: 'Update authenticated user',
            security: bearer,
            parameters: [strParam('id', 'path', 'User ID (placeholder)')],
            requestBody: body('UserInput'),
            responses: {
                200: ok(ref('User')),
                400: errs[400],
                401: errs[401],
            },
        },
        delete: {
            tags: ['Users'],
            summary: 'Delete authenticated user',
            security: bearer,
            parameters: [strParam('id', 'path', 'User ID (placeholder)')],
            responses: {
                200: ok({ type: 'object' }, 'User deleted'),
                401: errs[401],
            },
        },
    },

    '/api/teams': {
        get: {
            tags: ['Teams'],
            summary: 'List all teams, or get a specific team by teamId query param',
            parameters: [intParam('teamId', 'query', 'Filter by team ID', false)],
            responses: {
                200: ok({ oneOf: [ref('Team'), { type: 'array', items: ref('Team') }] }),
                400: errs[400],
            },
        },
        post: {
            tags: ['Teams'],
            summary: 'Create a new team',
            requestBody: body('TeamInput'),
            responses: {
                200: ok(ref('Team')),
                400: errs[400],
            },
        },
    },

    '/api/teams/{teamId}': {
        get: {
            tags: ['Teams'],
            summary: 'Get a team by ID',
            parameters: [intParam('teamId', 'path', 'Team ID')],
            responses: {
                200: ok(ref('Team')),
                400: errs[400],
                404: errs[404],
            },
        },
        put: {
            tags: ['Teams'],
            summary: 'Update a team',
            parameters: [intParam('teamId', 'path', 'Team ID')],
            requestBody: body('TeamInput'),
            responses: {
                200: ok(ref('Team')),
                400: errs[400],
                404: errs[404],
            },
        },
        delete: {
            tags: ['Teams'],
            summary: 'Delete a team',
            parameters: [intParam('teamId', 'path', 'Team ID')],
            responses: {
                204: { description: 'Successfully deleted' },
                400: errs[400],
                404: errs[404],
            },
        },
    },

    '/api/accounts': {
        get: {
            tags: ['Accounts'],
            summary: 'List accounts for the authenticated team',
            security: bearer,
            parameters: [
                {
                    name: 'includeArchived',
                    in: 'query',
                    required: false,
                    description: 'Include archived accounts',
                    schema: { type: 'boolean' },
                },
            ],
            responses: {
                200: ok({ type: 'array', items: ref('Account') }),
                401: errs[401],
            },
        },
        post: {
            tags: ['Accounts'],
            summary: 'Create an account',
            security: bearer,
            requestBody: body('AccountInput'),
            responses: {
                200: ok(ref('Account')),
                400: errs[400],
                401: errs[401],
            },
        },
    },

    '/api/accounts/{id}': {
        get: {
            tags: ['Accounts'],
            summary: 'Get an account by ID',
            security: bearer,
            parameters: [intParam('id', 'path', 'Account ID')],
            responses: {
                200: ok(ref('Account')),
                401: errs[401],
                404: errs[404],
            },
        },
        put: {
            tags: ['Accounts'],
            summary: 'Update an account',
            security: bearer,
            parameters: [intParam('id', 'path', 'Account ID')],
            requestBody: body('AccountInput'),
            responses: {
                200: ok(ref('Account')),
                400: errs[400],
                401: errs[401],
                404: errs[404],
            },
        },
        delete: {
            tags: ['Accounts'],
            summary: 'Delete an account',
            security: bearer,
            parameters: [intParam('id', 'path', 'Account ID')],
            responses: {
                200: ok({ type: 'object' }, 'Deleted account'),
                401: errs[401],
                404: errs[404],
            },
        },
    },

    '/api/budgets': {
        get: {
            tags: ['Budgets'],
            summary: 'List budgets, optionally filtered by month and/or category',
            security: bearer,
            parameters: [
                {
                    name: 'periodMonth',
                    in: 'query',
                    required: false,
                    description: 'Filter by month (YYYY-MM or YYYY-MM-DD)',
                    schema: { type: 'string', example: '2026-03' },
                },
                intParam('categoryId', 'query', 'Filter by category ID', false),
            ],
            responses: {
                200: ok({ oneOf: [ref('Budget'), { type: 'array', items: ref('Budget') }] }),
                400: errs[400],
                401: errs[401],
            },
        },
        post: {
            tags: ['Budgets'],
            summary: 'Create a budget',
            security: bearer,
            requestBody: body('BudgetInput'),
            responses: {
                200: ok(ref('Budget')),
                400: errs[400],
                401: errs[401],
            },
        },
        put: {
            tags: ['Budgets'],
            summary: 'Update a budget (id passed as ?id= query param)',
            security: bearer,
            parameters: [intParam('id', 'query', 'Budget ID to update')],
            requestBody: body('BudgetUpdateInput'),
            responses: {
                200: ok(ref('Budget')),
                400: errs[400],
                401: errs[401],
                404: errs[404],
            },
        },
    },

    '/api/budgets/{id}': {
        get: {
            tags: ['Budgets'],
            summary: 'Get a budget by ID',
            security: bearer,
            parameters: [intParam('id', 'path', 'Budget ID')],
            responses: {
                200: ok(ref('Budget')),
                401: errs[401],
                404: errs[404],
            },
        },
        delete: {
            tags: ['Budgets'],
            summary: 'Delete a budget',
            security: bearer,
            parameters: [intParam('id', 'path', 'Budget ID')],
            responses: {
                200: ok({ type: 'object' }, 'Budget deleted'),
                401: errs[401],
                404: errs[404],
            },
        },
    },

    '/api/transactions': {
        get: {
            tags: ['Transactions'],
            summary: 'List transactions for the team, optionally filtered by type',
            security: bearer,
            parameters: [
                {
                    name: 'type',
                    in: 'query',
                    required: false,
                    description: 'Filter by transaction type',
                    schema: { type: 'string', enum: ['income', 'expense', 'transfer'] },
                },
            ],
            responses: {
                200: ok({ type: 'array', items: ref('Transaction') }),
                400: errs[400],
                401: errs[401],
            },
        },
        post: {
            tags: ['Transactions'],
            summary: 'Create a transaction',
            security: bearer,
            requestBody: body('TransactionInput'),
            responses: {
                200: ok(ref('Transaction')),
                400: errs[400],
                401: errs[401],
            },
        },
    },

    '/api/transactions/{id}': {
        get: {
            tags: ['Transactions'],
            summary: 'Get a transaction by ID',
            security: bearer,
            parameters: [
                intParam('id', 'path', 'Transaction ID'),
                {
                    name: 'type',
                    in: 'query',
                    required: false,
                    description: 'If provided, filters by type instead of fetching by ID',
                    schema: { type: 'string', enum: ['income', 'expense', 'transfer'] },
                },
            ],
            responses: {
                200: ok({ oneOf: [ref('Transaction'), { type: 'array', items: ref('Transaction') }] }),
                400: errs[400],
                401: errs[401],
                404: errs[404],
            },
        },
        put: {
            tags: ['Transactions'],
            summary: 'Update a transaction',
            security: bearer,
            parameters: [intParam('id', 'path', 'Transaction ID')],
            requestBody: body('TransactionInput'),
            responses: {
                200: ok(ref('Transaction')),
                400: errs[400],
                401: errs[401],
                404: errs[404],
            },
        },
        delete: {
            tags: ['Transactions'],
            summary: 'Delete a transaction',
            security: bearer,
            parameters: [intParam('id', 'path', 'Transaction ID')],
            responses: {
                204: { description: 'Transaction deleted' },
                401: errs[401],
                404: errs[404],
            },
        },
    },

    '/api/categories': {
        get: {
            tags: ['Categories'],
            summary: 'Get a category (id and type as query params)',
            security: bearer,
            parameters: [
                intParam('id', 'query', 'Category ID', false),
                strParam('type', 'query', 'Filter by type (income | expense | transfer)', false),
            ],
            responses: {
                200: ok(ref('Category')),
                400: errs[400],
                401: errs[401],
                404: errs[404],
            },
        },
        post: {
            tags: ['Categories'],
            summary: 'Create a category',
            security: bearer,
            requestBody: body('CategoryInput'),
            responses: {
                200: ok(ref('Category')),
                400: errs[400],
                401: errs[401],
            },
        },
        put: {
            tags: ['Categories'],
            summary: 'Update a category (id as ?id= query param)',
            security: bearer,
            parameters: [intParam('id', 'query', 'Category ID')],
            requestBody: body('CategoryInput'),
            responses: {
                200: ok(ref('Category')),
                400: errs[400],
                401: errs[401],
                404: errs[404],
            },
        },
        delete: {
            tags: ['Categories'],
            summary: 'Delete a category (id as ?id= query param)',
            security: bearer,
            parameters: [intParam('id', 'query', 'Category ID')],
            responses: {
                204: { description: 'Successfully deleted' },
                400: errs[400],
                401: errs[401],
                404: errs[404],
            },
        },
    },
};

// ── Spec export ───────────────────────────────────────────────────────────────

export const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'BetterBudget API',
        version: '2.0.0',
        description: 'REST API for BetterBudget – manages users, teams, accounts, budgets, transactions, and categories.',
    },
    servers: [{ url: process.env.APP_ORIGIN ?? 'http://localhost:3000', description: 'API server' }],
    tags: [
        { name: 'Users' },
        { name: 'Teams' },
        { name: 'Accounts' },
        { name: 'Budgets' },
        { name: 'Transactions' },
        { name: 'Categories' },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Supabase UID passed as a Bearer token',
            },
        },
        schemas,
    },
    paths,
};
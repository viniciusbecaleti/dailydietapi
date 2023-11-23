import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      createdAt: string
      updatedAt: string
    }
    meals: {
      id: string
      name: string
      description: string
      dietMeal: boolean
      createdAt: string
      updatedAt: string
      userId: string
    }
  }
}

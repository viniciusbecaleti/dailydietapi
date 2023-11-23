import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const { userId } = req.cookies

      const meals = await knex('meals')
        .where({
          userId,
        })
        .orderBy('createdAt', 'desc')

      res.send({
        meals,
      })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { userId } = req.cookies
      const { id } = getMealParamsSchema.parse(req.params)

      const meal = await knex('meals')
        .where({
          id,
          userId,
        })
        .first()

      res.send({
        meal,
      })
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const { userId } = req.cookies

      const meals = await knex('meals')
        .where({
          userId,
        })
        .orderBy('createdAt', 'asc')

      let dietSequence = 0

      for (const meal of meals) {
        if (meal.dietMeal) {
          dietSequence++
        } else {
          dietSequence = 0
        }
      }

      const summary = {
        meals: meals.length,
        dietMeals: meals.filter((meal) => meal.dietMeal).length,
        noDietMeals: meals.filter((meal) => !!meal.dietMeal === false).length,
        dietSequence,
      }

      return res.send({
        summary,
      })
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dietMeal: z.boolean(),
      })

      const { name, description, dietMeal } = createMealBodySchema.parse(
        req.body,
      )
      const { userId } = req.cookies

      const newMeal = {
        id: randomUUID(),
        name,
        description,
        dietMeal,
        userId,
      }

      await knex('meals').insert(newMeal)

      return res.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const editMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dietMeal: z.boolean(),
      })

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { userId } = req.cookies
      const { id } = getMealParamsSchema.parse(req.params)
      const { name, description, dietMeal } = editMealBodySchema.parse(req.body)

      const editedMeal = {
        name,
        description,
        dietMeal,
        updatedAt: knex.fn.now(),
      }

      await knex('meals')
        .where({
          id,
          userId,
        })
        .update(editedMeal)

      return res.status(204).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { userId } = req.cookies
      const { id } = getMealParamsSchema.parse(req.params)

      await knex('meals')
        .where({
          id,
          userId,
        })
        .delete()

      return res.status(204).send()
    },
  )
}

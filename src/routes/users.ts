import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(req.body)

    const newUser = {
      id: randomUUID(),
      name,
      email,
      password,
    }

    await knex('users').insert(newUser)

    res.cookie('userId', newUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res.status(201).send()
  })

  app.post('/login', async (req, res) => {
    const loginUserBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = loginUserBodySchema.parse(req.body)

    const user = await knex('users')
      .where({
        email,
        password,
      })
      .first()

    if (user === undefined) {
      return res.status(404).send({
        error: 'User not found',
      })
    }

    res.cookie('userId', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res.send({
      user,
    })
  })
}

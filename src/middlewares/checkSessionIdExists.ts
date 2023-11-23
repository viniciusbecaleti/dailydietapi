import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkSessionIdExists(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { userId } = req.cookies

  if (!userId) {
    return res.status(401).send({
      error: 'Unauthorized',
    })
  }

  const user = await knex('users')
    .where({
      id: userId,
    })
    .first()

  if (!user) {
    res.clearCookie('userId')

    return res.status(401).send({
      error: 'Unauthorized',
    })
  }
}

import { article, tag } from '~/modules/articles/articles.models'
import { user, password } from '~/modules/auth/auth.models'
import { comment } from '~/modules/comments/comments.models'
import { favorite } from '~/modules/favorites/favorites.models'
import { follow } from '~/modules/follows/follows.models'

export const schema = {
    article,
    tag,
    user,
    password,
    comment,
    favorite,
    follow,
}

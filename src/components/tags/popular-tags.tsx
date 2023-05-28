import { tagsService } from "~/modules/tags/tags.service"
import { PopularTagsList } from "./popular-tags-list"

export const PopularTags = async () => {
    const tags = await tagsService.getPopularTags()

    return <PopularTagsList tags={tags} />
}

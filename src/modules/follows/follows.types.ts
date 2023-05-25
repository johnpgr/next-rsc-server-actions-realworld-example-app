import { InferModel } from "drizzle-orm"
import { follow } from "~/db/schema"

export type Follow = InferModel<typeof follow>
export type NewFollow = InferModel<typeof follow, "insert">

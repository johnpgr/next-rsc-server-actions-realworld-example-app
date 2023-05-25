import { InferModel } from "drizzle-orm";
import { favorite } from "~/db/schema";

export type Favorite = InferModel<typeof favorite>

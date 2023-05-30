"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
import { Button } from "../ui/button"
import clsx from "clsx"

export const ArticlePaginationLink = ({
    i,
    currentPage,
    pageCount,
}: {
    i: number
    currentPage: number
    pageCount: number
}) => {
    const path = usePathname()
    return (
        <Button
            variant={"link"}
            size={"sm"}
            className={clsx("rounded-none bg-transparent text-primary", {
                "bg-primary text-white": currentPage === i + 1,
                // first element
                "rounded-bl rounded-tl": i === 0,
                // last element
                "rounded-br rounded-tr": i === pageCount - 1,
            })}
            asChild
        >
            <Link href={`${path}?page=${i + 1}`}>{i + 1}</Link>
        </Button>
    )
}

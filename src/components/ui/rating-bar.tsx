"use client"

import clsx from "clsx"
import { StarIcon } from "lucide-react"
import { useState } from "react"

export function RatingBar({ name, value, readonly }: { name?: string, value?: number, readonly?: boolean }) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const [activeIndex, setActiveIndex] = useState<number | null>(value ?? null)

	return <div className="flex flex-row col-span-3">
		{
			Array.from({ length: 5 }).map((_, i) => {
				return <button
					type="button"
					onClick={() => !readonly && setActiveIndex(i)}
					key={i}
				>
					<StarIcon
						className={clsx(
							"ml-3",
							activeIndex && i <= activeIndex && "fill-yellow-300 text-yellow-300",
							hoveredIndex && i <= hoveredIndex && "text-yellow-300",
						)}
						onMouseEnter={() => !readonly && (activeIndex ?? 0) > i && setHoveredIndex(i)}
						onMouseLeave={() => !readonly && setHoveredIndex(i)}
					/>
				</button>
			})
		}
		<input name={name} className="hidden" value={activeIndex?.toString()} />
	</div>
}

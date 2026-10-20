import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./ui/input";
import { Label } from "./ui/label";

export function InputContainer({
	name, display, placeholder, className, ...rest
}: { name: string, display: string } & InputProps) {
	return <div className="grid grid-cols-4 items-center gap-4">
		<Label htmlFor={name} className="text-right">
			{display}
		</Label>
		<Input id={name} name={name} placeholder={placeholder} {...rest} className={cn("col-span-3", className)} />
	</div>
}

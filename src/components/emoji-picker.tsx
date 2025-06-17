import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from"@emoji-mart/data";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "./providers/theme-provider";

interface EmojiPickerProps {
	onChange: (value: string) => void;
}

export const EmojiPicker = ({
	onChange,
}: EmojiPickerProps) => {
	const { theme } = useTheme();

	return (
		<Popover>
			<PopoverTrigger>
				<Smile className="cursor-pointer text-accent hover:text-accent/90 transition"/>
			</PopoverTrigger>
			<PopoverContent
				side="right"
				sideOffset={40}
				className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
			>
				<Picker
					locale={"ru"}
					theme={theme}
					data={data}
					onEmojiSelect={(emoji: any) => {onChange(emoji.native)}}
				/>
			</PopoverContent>
		</Popover>
	)
}
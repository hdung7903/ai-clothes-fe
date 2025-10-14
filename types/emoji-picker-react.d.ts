declare module 'emoji-picker-react' {
  import { FC } from 'react';

  interface EmojiObject {
    emoji: string;
    names: string[];
    originalUnified: string;
    unified: string;
    activeSkinTone: string;
  }

  interface EmojiPickerProps {
    onEmojiClick: (emojiObject: EmojiObject) => void;
    width?: number;
    height?: number;
    previewConfig?: {
      defaultCaption: string;
      defaultEmoji: string;
    };
    searchDisabled?: boolean;
    skinTonesDisabled?: boolean;
    emojiStyle?: 'native' | 'apple' | 'google' | 'facebook' | 'twitter';
    theme?: 'light' | 'dark' | 'auto';
    categories?: string[];
    customEmojis?: any[];
    searchPlaceHolder?: string;
    defaultSkinTone?: string;
    allowExpandReactions?: boolean;
    reactionsDefaultOpen?: boolean;
    suggestedEmojisMode?: 'recent' | 'frequent';
    lazyLoadEmojis?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }

  const EmojiPicker: FC<EmojiPickerProps>;
  export default EmojiPicker;
}



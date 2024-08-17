import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { SendHorizonal, Smile } from 'lucide-react';

interface InputFormProps {
    handleSubmit: (message: string) => void;
    value?: string;
    placeholder?: string;
    autoFocus?: boolean;
    onBlur?: () => void;
}

const InputForm: React.FC<InputFormProps> = ({ handleSubmit, value = '', placeholder, autoFocus = false, onBlur = () => {} }) => {
    const [inputValue, setInputValue] = useState(value);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const emojiRef = useRef<HTMLSpanElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const MAX_ROW = 3;

    // useEffect(() => {
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, []);

    // const handleClickOutside = (event: MouseEvent) => {
    //     if (
    //         (emojiRef.current && emojiRef.current.contains(event.target as Node)) ||
    //         (emojiPickerRef.current && emojiPickerRef.current.contains(event.target as Node)) ||
    //         (buttonRef.current && buttonRef.current.contains(event.target as Node))
    //     ) {
    //         return;
    //     }
    //     setShowEmojiPicker(false);
    //     setShowButton(false);
    //     onBlur();
    // };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const el = e.target;
        if (isScrollable(el) && MAX_ROW > el.rows) {
            el.rows = el.rows + 1;
        }
        if (!el.value) {
            el.rows = 1;
        }
        setInputValue(el.value);
    };

    const handleEmojiClick = (emojiObject: EmojiClickData) => {
        setInputValue(prevContent => prevContent + emojiObject.emoji);
    };

    const isScrollable = (el: HTMLTextAreaElement): boolean => {
        return el.scrollHeight > el.clientHeight;
    };

    const onSubmit = () => {
        if (inputValue.trim()) {
            handleSubmit(inputValue);
            setInputValue('');
            if (inputRef.current) {
                inputRef.current.rows = 1;
            }
        }
    };

    return (
        <div className='flex flex-col w-full items-center rounded-xl bg-muted p-1 relative'>
            <textarea
                value={inputValue}
                onChange={handleChange}
                onFocus={() => setShowButton(true)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue !== "" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(inputValue);
                        setInputValue("");
                        if (inputRef.current) {
                            inputRef.current.rows = 1;
                        }
                    }
                }}
                placeholder={placeholder ? placeholder : 'Nhập...'}
                rows={1}
                className="p-2 mx-2 bg-muted resize-none overflow-auto w-full focus:outline-none"
                autoFocus={autoFocus}
                ref={inputRef}
            />
            {showButton &&
                <div className='flex justify-between w-full'>
                    <span onClick={() => setShowEmojiPicker(!showEmojiPicker)} role='button' ref={emojiRef}>
                        <Smile />
                    </span>
                    <button
                        onClick={() => {
                            handleSubmit(inputValue);
                            setInputValue('');
                        }}
                        className={`rounded border-none cursor-pointer ${inputValue !== "" ? "text-primary" : ""}`}
                        disabled={inputValue === ""}
                    >
                        <div ref={buttonRef}>
                            <SendHorizonal />
                        </div>
                    </button>
                </div>}
            <div className="absolute z-10 -top-[600%]">
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} >
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputForm;

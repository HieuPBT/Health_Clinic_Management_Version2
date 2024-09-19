import React, { useContext, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import moment from 'moment';
import { UserContext, UserContextType } from "@/contexts/UserContext"
import { getChatId, getMessages, sendMessage, UserData } from '@/lib/firebase';
import { X } from 'lucide-react';
import InputForm from '@/components/InputForm';

moment.locale("vi");

interface Message {
    email: string;
    message: string;
}

interface ChatboxProps {
    isOpen: boolean;
    toggleChatbox: () => void;
    chattingUser: UserData;
}

const Chatbox: React.FC<ChatboxProps> = ({ isOpen, toggleChatbox, chattingUser }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const chatId = getChatId(chattingUser.email);
    const { user } = useContext(UserContext) as UserContextType;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        const unsubscribe = getMessages(setMessages, chattingUser.email);
        return () => unsubscribe();
    }, [chattingUser.email]);

    const send = (message: string) => {
        if (user && user.email) {
            sendMessage(chatId, message, user.email, chattingUser.email);
        }
    };

    const getMessageClassName = (messages: Message[], index: number, currentEmail: string): string => {
        const message = messages[index];
        const prevMessage = messages[index - 1];
        const nextMessage = messages[index + 1];

        const isCurrentUser = message.email === currentEmail;
        const isSameAsPrevious = prevMessage && prevMessage.email === message.email;
        const isSameAsNext = nextMessage && nextMessage.email === message.email;

        if (isCurrentUser) {
            if (!isSameAsPrevious && !isSameAsNext) {
                return 'rounded-2xl';
            } else if (!isSameAsPrevious && isSameAsNext) {
                return 'rounded-t-2xl rounded-bl-2xl rounded-br-sm';
            } else if (isSameAsPrevious && isSameAsNext) {
                return 'rounded-l-2xl rounded-r-sm';
            } else {
                return 'rounded-b-2xl rounded-tl-2xl rounded-tr-sm';
            }
        } else {
            if (!isSameAsPrevious && !isSameAsNext) {
                return 'rounded-2xl';
            } else if (!isSameAsPrevious && isSameAsNext) {
                return 'rounded-t-2xl rounded-br-2xl rounded-bl-sm';
            } else if (isSameAsPrevious && isSameAsNext) {
                return 'rounded-r-2xl rounded-l-sm';
            } else {
                return 'rounded-b-2xl rounded-tr-2xl rounded-tl-sm';
            }
        }
    };

    return (
        <Card className={`w-[300px] ${isOpen ? 'h-[460px]' : 'h-[50px]'} transition-all duration-300 ease-in-out flex flex-col rounded-xl`}>
            <CardHeader className="p-2 cursor-pointer shrink-0" onClick={toggleChatbox}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Avatar>
                                <AvatarImage src={chattingUser.avatar} alt={chattingUser.fullName} />
                                <AvatarFallback>{chattingUser.fullName}</AvatarFallback>
                            </Avatar>
                            {moment(chattingUser.lastActive).fromNow() === "vài giây trước" && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{chattingUser.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                                {
                                    moment(chattingUser.lastActive).fromNow() === "vài giây trước" || moment(chattingUser.lastActive).fromNow() === "vài giây tới"
                                        ? "Đang hoạt động"
                                        : "Truy cập " + moment(chattingUser.lastActive).fromNow()}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <X />
                    </Button>
                </div>
            </CardHeader>
            {isOpen && (
                <>
                    <CardContent className="p-2 flex-grow overflow-y-auto scrollbar-thumb-rounded-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
                        {messages.map((message, index) => {
                            const messageClass = getMessageClassName(messages, index, user?.email || "");
                            const isOwnMessage = user && message.email === user.email;

                            return (
                                <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
                                    {!isOwnMessage && (
                                        <Avatar className="w-8 h-8 mr-2 self-end">
                                            <AvatarImage src={chattingUser.avatar} alt={chattingUser.fullName} />
                                            <AvatarFallback>{chattingUser.fullName.split(" ").slice(-1)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`px-3 py-1 max-w-40 ${messageClass} ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {message.message}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </CardContent>
                    <CardFooter className="p-1 shrink-0">
                        <InputForm
                            handleSubmit={send}
                            placeholder="Nhập tin nhắn..."
                        />
                    </CardFooter>
                </>
            )}
        </Card>
    );
};

export default Chatbox;

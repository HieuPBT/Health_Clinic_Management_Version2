"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from '@/contexts/UserContext';
import { chatListener, getAssistantList, getChattingUserData, getMyChattingUser, getUserInfoByEmail, listenNewNotifications, listenToAllChats, readMessage, startChat } from '@/lib/firebase';
import moment from 'moment';
import Chatbox from '@/components/Chatbox';
import { MessageCircle, Search } from 'lucide-react';
import { auth, encodeEmail, setOffline, updateUserData } from "@/lib/firebase"

moment.locale('vi');

const UPDATE_INTERVAL_MS = 10000;
import { UserData } from '@/lib/firebase';

interface Notification {
    email: string;
}

const ChatboxList: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [openChatboxes, setOpenChatboxes] = useState<string[]>([]);
    const [showChatboxes, setShowChatboxes] = useState<boolean>(false);
    const [isInputExpanded, setIsInputExpanded] = useState<boolean>(false);
    const { user } = useUser();
    const inputRef = useRef<HTMLInputElement>(null);
    const lastUpdateRef = useRef(Date.now());

    useEffect(() => {

      const updateUserStatus = async () => {
        const now = Date.now();
        const user = auth.currentUser;
        if (user && now - lastUpdateRef.current > UPDATE_INTERVAL_MS) {
          lastUpdateRef.current = now;
          updateUserData(encodeEmail(user.email || ""), {
            status: "online",
            lastActive: new Date(),
          });
        }
      };

    //   const handleBeforeUnload = (e: any) => {
    //     e.preventDefault();
    //     setOffline();
    //     e.returnValue = true;
    //   };

      const intervalId = setInterval(updateUserStatus, UPDATE_INTERVAL_MS);
      document.addEventListener('visibilitychange', updateUserStatus);

      return () => {
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', updateUserStatus);
      };
    }, []);

    useEffect(() => {
        const initializeListeners = async () => {
            const unsubscribeUserListener = getChattingUserData(setUsers, user?.email || "");
            const unsubscribeNotiListen = listenNewNotifications(user?.email || "", (notification: Notification) => {
                openChatBox(notification.email);
            });

            return () => {
                unsubscribeNotiListen();
                unsubscribeUserListener()
            };
        };

        initializeListeners();
    }, [user?.email]);

    const toggleChatboxList = () => {
        setOpenChatboxes([]);
        setShowChatboxes(!showChatboxes);
    }

    const toggleChatbox = async (id: string) => {
        if (user?.email) {
            await startChat(user.email, id);
            readMessage(user.email, id);
            if (users.find(a => a.email === id))
                setOpenChatboxes((prevOpenChatboxes) => {
                    if (prevOpenChatboxes.includes(id)) {
                        return prevOpenChatboxes.filter(chatboxId => chatboxId !== id);
                    } else {
                        return [...prevOpenChatboxes, id];
                    }
                });
        }
    };

    const openChatBox = async (id: string) => {
        try {
            const userInfo = await getUserInfoByEmail(id);
            if (userInfo && user?.email) {
                await startChat(user.email, id);
                readMessage(user.email, id);
                setUsers((prevUsers) => {
                    if (!prevUsers.find(u => u.email === id)) {
                        return [...prevUsers, userInfo];
                    }
                    return prevUsers;
                });

                setOpenChatboxes((prevOpenChatboxes) => {
                    if (!prevOpenChatboxes.includes(id)) {
                        return [...prevOpenChatboxes, id];
                    }
                    return prevOpenChatboxes;
                });
            } else {
                console.warn(`No user found with email ${id}`);
            }
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        }
    };

    const handleInputClick = () => {
        setIsInputExpanded(true);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className={`fixed bottom-5 right-5 flex flex-row items-end ${showChatboxes ? 'open' : ''}`}>
            <div className="flex flex-row-reverse gap-2 mr-2">
                {openChatboxes.map((id) => {
                    const u = users.find(a => a.email === id);
                    return u ? (
                        <Chatbox
                            key={id}
                            isOpen={true}
                            toggleChatbox={() => toggleChatbox(id)}
                            chattingUser={u}
                        />
                    ) : null;
                })}
            </div>
            <div className="flex flex-col items-end mt-2 max-h-[97vh]">
                {users.map((u, index) => {
                    if (u.email !== user?.email) {
                        return (
                            <TooltipProvider key={index}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`rounded-full w-12 h-12 mb-2 relative ${showChatboxes ? 'open' : ''}`}
                                            onClick={() => toggleChatbox(u.email)}
                                        >
                                            <Avatar className="w-full h-full">
                                                <AvatarImage src={u.avatar} alt={u.fullName} />
                                                <AvatarFallback>{u.fullName}</AvatarFallback>
                                            </Avatar>
                                            {moment(u.lastActive).fromNow() === "vài giây trước" && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{u.fullName + " - " + u.email}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    }
                    return null;
                })}
                <Button
                    variant="outline"
                    size={isInputExpanded ? "default" : "icon"}
                    className={`rounded-full mb-2 ${isInputExpanded ? 'w-64 h-12 pl-1' : 'w-12 h-12'}`}
                    onClick={handleInputClick}
                >
                    {isInputExpanded ? (
                        <div className='flex items-center w-full'>
                            <Input
                                type='email'
                                placeholder='Nhập email người nhận'
                                className="flex-grow mr-2 h-10 rounded-full"

                                onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter') {
                                        openChatBox(e.currentTarget.value);
                                        setIsInputExpanded(false);
                                    }
                                }}
                                ref={inputRef}
                            />
                            <Search className="h-5 w-5" />
                        </div>
                    ) : (
                        <Search className="h-5 w-5" />
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleChatboxList}
                >
                    <MessageCircle className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default ChatboxList;

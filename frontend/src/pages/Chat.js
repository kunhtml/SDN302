import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import socketService from "../services/socket";
import {
  PaperPlaneRight,
  User as UserIcon,
  Package,
  DotsThreeVertical,
  Trash,
  ArrowLeft,
  Paperclip,
} from "phosphor-react";

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Connect socket
    const token = localStorage.getItem("token");
    if (token) {
      socketService.connect(token);
    }

    fetchConversations();

    // Check if creating new conversation
    const sellerId = searchParams.get("seller");
    const productId = searchParams.get("product");
    if (sellerId) {
      createOrGetConversation(sellerId, productId);
    }

    // Socket listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStopTyping(handleUserStopTyping);

    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      socketService.joinConversation(selectedConversation._id);
      fetchMessages(selectedConversation._id);
      markAsRead(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/chat/conversations");
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const createOrGetConversation = async (participantId, productId = null) => {
    try {
      const response = await api.post("/chat/conversations", {
        participantId,
        productId,
      });
      if (response.data.success) {
        setSelectedConversation(response.data.data);
        if (!conversations.find((c) => c._id === response.data.data._id)) {
          setConversations([response.data.data, ...conversations]);
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error(
        error.response?.data?.message || "Failed to start conversation"
      );
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(
        `/chat/conversations/${conversationId}/messages`
      );
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await api.post(
        `/chat/conversations/${selectedConversation._id}/messages`,
        {
          content: newMessage,
          messageType: "text",
        }
      );

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage("");

        // Update conversation in list
        const updatedConversations = conversations.map((conv) =>
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: newMessage, lastMessageAt: new Date() }
            : conv
        );
        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`);
      // Update unread count in conversations list
      const updatedConversations = conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      );
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteConversation = async (conversationId) => {
    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;

    try {
      await api.delete(`/chat/conversations/${conversationId}`);
      setConversations(conversations.filter((c) => c._id !== conversationId));
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleNewMessage = (message) => {
    if (
      selectedConversation &&
      message.conversation === selectedConversation._id
    ) {
      setMessages((prev) => [...prev, message]);
      markAsRead(selectedConversation._id);
    }
    // Update conversations list
    fetchConversations();
  };

  const handleUserTyping = ({ conversationId }) => {
    if (selectedConversation && conversationId === selectedConversation._id) {
      setTyping(true);
    }
  };

  const handleUserStopTyping = ({ conversationId }) => {
    if (selectedConversation && conversationId === selectedConversation._id) {
      setTyping(false);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation) return;

    const otherParticipant = selectedConversation.participants.find(
      (p) => p._id !== user._id
    );

    socketService.typing({
      conversationId: selectedConversation._id,
      receiverId: otherParticipant._id,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping({
        conversationId: selectedConversation._id,
        receiverId: otherParticipant._id,
      });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find((p) => p._id !== user._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div
              className={`col-span-12 md:col-span-4 border-r border-gray-200 ${
                selectedConversation ? "hidden md:block" : ""
              }`}
            >
              <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
                <h2 className="text-xl font-bold">Messages</h2>
              </div>
              <div className="overflow-y-auto h-full">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="mb-4">No conversations yet</p>
                    <p className="text-sm">
                      Start a conversation by contacting a seller from a product
                      page
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?._id === conversation._id
                            ? "bg-blue-50 border-l-4 border-l-blue-600"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {otherUser.avatarURL ? (
                              <img
                                src={otherUser.avatarURL}
                                alt={otherUser.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon size={24} weight="duotone" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {otherUser.username}
                              </h3>
                              {conversation.lastMessageAt && (
                                <span className="text-xs text-gray-500">
                                  {formatDate(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            {conversation.relatedProduct && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                <Package size={12} />
                                <span className="truncate">
                                  {conversation.relatedProduct.title}
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div
              className={`col-span-12 md:col-span-8 flex flex-col ${
                !selectedConversation ? "hidden md:flex" : ""
              }`}
            >
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="md:hidden text-gray-600 hover:text-gray-800"
                        >
                          <ArrowLeft size={24} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                          {getOtherParticipant(selectedConversation)
                            .avatarURL ? (
                            <img
                              src={
                                getOtherParticipant(selectedConversation)
                                  .avatarURL
                              }
                              alt={
                                getOtherParticipant(selectedConversation)
                                  .username
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon size={20} weight="duotone" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getOtherParticipant(selectedConversation).username}
                          </h3>
                          {selectedConversation.relatedProduct && (
                            <p className="text-xs text-gray-600">
                              About: {selectedConversation.relatedProduct.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          deleteConversation(selectedConversation._id)
                        }
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.sender._id === user._id;
                      const showDate =
                        index === 0 ||
                        formatDate(message.createdAt) !==
                          formatDate(messages[index - 1].createdAt);

                      return (
                        <div key={message._id}>
                          {showDate && (
                            <div className="text-center text-xs text-gray-500 mb-4">
                              {formatDate(message.createdAt)}
                            </div>
                          )}
                          <div
                            className={`flex ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                                isOwn ? "bg-blue-600 text-white" : "bg-gray-200"
                              } rounded-lg px-4 py-2`}
                            >
                              <p className="break-words">{message.content}</p>
                              <span
                                className={`text-xs ${
                                  isOwn ? "text-blue-100" : "text-gray-500"
                                } block mt-1`}
                              >
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {typing && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span
                              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></span>
                            <span
                              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form
                    onSubmit={sendMessage}
                    className="p-4 border-t border-gray-200 bg-white"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <PaperPlaneRight size={20} weight="fill" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-xl font-semibold mb-2">
                      Select a conversation
                    </p>
                    <p className="text-sm">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

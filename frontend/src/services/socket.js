import io from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.socket.emit("authenticate", token);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("authenticated", (data) => {
      if (data.success) {
        console.log("Socket authenticated");
      } else {
        console.error("Socket authentication failed");
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit("join-conversation", conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit("leave-conversation", conversationId);
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit("send-message", data);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("new-message", callback);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on("notification", callback);
    }
  }

  typing(data) {
    if (this.socket) {
      this.socket.emit("typing", data);
    }
  }

  stopTyping(data) {
    if (this.socket) {
      this.socket.emit("stop-typing", data);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user-typing", callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on("user-stop-typing", callback);
    }
  }

  markAsRead(data) {
    if (this.socket) {
      this.socket.emit("mark-read", data);
    }
  }
}

export default new SocketService();

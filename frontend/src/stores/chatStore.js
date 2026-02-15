import { create } from 'zustand';

export const useChatStore = create((set) => ({
  openChats: [], // Array of {connection, isMinimized, showList}
  
  openChat: (connection) => set((state) => {
    // Check if already open
    const existing = state.openChats.find(c => c.connection.id === connection.id);
    if (existing) {
      // Unminimize and show chat (not list)
      return {
        openChats: state.openChats.map(c =>
          c.connection.id === connection.id ? { ...c, isMinimized: false, showList: false } : c
        )
      };
    }
    // Add new chat
    return { openChats: [...state.openChats, { connection, isMinimized: false, showList: false }] };
  }),
  
  closeChat: (connectionId) => set((state) => ({
    openChats: state.openChats.filter(c => c.connection.id !== connectionId)
  })),
  
  minimizeChat: (connectionId) => set((state) => ({
    openChats: state.openChats.map(c =>
      c.connection.id === connectionId ? { ...c, isMinimized: !c.isMinimized } : c
    )
  })),
  
  showChatList: (connectionId) => set((state) => ({
    openChats: state.openChats.map(c =>
      c.connection.id === connectionId ? { ...c, showList: true } : c
    )
  })),
  
  showChatWindow: (connectionId) => set((state) => ({
    openChats: state.openChats.map(c =>
      c.connection.id === connectionId ? { ...c, showList: false } : c
    )
  })),

  /** When in list view, switch this popup to show the selected connection. */
  selectConnectionInChat: (currentConnectionId, newConnection) => set((state) => ({
    openChats: state.openChats.map(c =>
      c.connection.id === currentConnectionId ? { ...c, connection: newConnection, showList: false } : c
    )
  })),

  // Clear all chats (call on logout)
  clearAllChats: () => set({ openChats: [] }),
}));

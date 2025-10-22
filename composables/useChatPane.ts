export const useChatPane = () => {
  const isChatPaneOpen = useState('isChatPaneOpen', () => false);
  const { $emitter } = useNuxtApp();

  const openChatPane = () => {
    isChatPaneOpen.value = true;
  };

  const closeChatPane = () => {
    isChatPaneOpen.value = false;
  };

  const sendMessageToChat = (message: string) => {
    $emitter.emit('send-message-to-chat', message);
  };

  return {
    isChatPaneOpen,
    openChatPane,
    closeChatPane,
    sendMessageToChat,
  };
};
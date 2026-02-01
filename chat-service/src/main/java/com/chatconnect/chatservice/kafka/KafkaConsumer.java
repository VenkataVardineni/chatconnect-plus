package com.chatconnect.chatservice.kafka;

import com.chatconnect.chatservice.model.Message;
import com.chatconnect.chatservice.model.MessageDTO;
import com.chatconnect.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaConsumer {
    
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @KafkaListener(topics = "chat-messages", groupId = "chat-service-group")
    public void consume(MessageDTO messageDTO) {
        log.info("Received message from Kafka: {}", messageDTO);
        
        // Persist to database
        Message message = new Message();
        message.setRoom(messageDTO.getRoom());
        message.setNickname(messageDTO.getNickname());
        message.setContent(messageDTO.getContent());
        message.setTimestamp(messageDTO.getTimestamp());
        chatService.saveMessage(message);
        
        // Broadcast to WebSocket clients
        messagingTemplate.convertAndSend("/topic/room/" + messageDTO.getRoom(), messageDTO);
    }
}


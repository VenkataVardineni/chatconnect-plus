package com.chatconnect.chatservice.kafka;

import com.chatconnect.chatservice.model.MessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KafkaProducer {
    
    private final KafkaTemplate<String, MessageDTO> kafkaTemplate;
    private static final String TOPIC = "chat-messages";
    
    public void sendMessage(MessageDTO message) {
        kafkaTemplate.send(TOPIC, message.getRoom(), message);
    }
}


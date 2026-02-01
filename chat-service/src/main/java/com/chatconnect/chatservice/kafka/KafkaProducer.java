package com.chatconnect.chatservice.kafka;

import com.chatconnect.chatservice.model.MessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaProducer {
    
    private final KafkaTemplate<String, MessageDTO> kafkaTemplate;
    private static final String TOPIC = "chat-messages";
    
    public void sendMessage(MessageDTO message) {
        try {
            log.info("Publishing message to Kafka topic '{}': {}", TOPIC, message);
            kafkaTemplate.send(TOPIC, message.getRoom(), message);
            log.info("Message published successfully");
        } catch (Exception e) {
            log.error("Error publishing message to Kafka", e);
        }
    }
}

